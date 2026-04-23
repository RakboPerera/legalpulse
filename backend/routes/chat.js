import { Router } from 'express';

export function createChatRouter(db) {
  const router = Router();

  function buildContext(db) {
    const firmOverview = db.prepare(`
      SELECT
        (SELECT COUNT(*) FROM clients WHERE status='Active') as active_clients,
        (SELECT COUNT(*) FROM matters WHERE status='Open') as open_matters,
        (SELECT COALESCE(SUM(amount_collected),0) FROM billing_invoices) as total_collected,
        (SELECT COALESCE(SUM(net_billed),0) FROM billing_invoices) as total_billed,
        (SELECT COALESCE(SUM(amount),0) FROM time_entries) as total_worked,
        (SELECT COALESCE(SUM(write_off),0) FROM billing_invoices) as total_writeoffs
    `).get();

    // Pre-aggregate per matter first to avoid cartesian-join row inflation.
    const realisationByPractice = db.prepare(`
      SELECT m.practice_area,
        COALESCE(SUM(te_agg.worked),0) as worked,
        COALESCE(SUM(bi_agg.collected),0) as collected,
        COALESCE(SUM(bi_agg.billed),0) as billed
      FROM matters m
      LEFT JOIN (SELECT matter_id, SUM(amount) as worked FROM time_entries GROUP BY matter_id) te_agg ON te_agg.matter_id = m.matter_id
      LEFT JOIN (SELECT matter_id, SUM(amount_collected) as collected, SUM(net_billed) as billed FROM billing_invoices GROUP BY matter_id) bi_agg ON bi_agg.matter_id = m.matter_id
      GROUP BY m.practice_area
    `).all().map(r => ({
      ...r,
      realisation_pct: r.worked > 0 ? Math.round((r.collected / r.worked) * 10000) / 100 : 0,
    }));

    const topWalletGaps = db.prepare(`
      SELECT c.name, cwe.estimated_total_legal_spend, cwe.our_revenue,
        (cwe.estimated_total_legal_spend - cwe.our_revenue) as gap,
        cwe.share_of_wallet_pct
      FROM client_wallet_estimates cwe
      JOIN clients c ON c.client_id = cwe.client_id
      ORDER BY gap DESC LIMIT 5
    `).all();

    const budgetOverruns = db.prepare(`
      SELECT m.matter_name, m.practice_area, bt.cumulative_budget_consumed_pct,
        bt.estimated_completion_pct, m.responsible_partner
      FROM budget_tracking bt
      JOIN matters m ON m.matter_id = bt.matter_id
      WHERE bt.cumulative_budget_consumed_pct > (bt.estimated_completion_pct + 15)
        AND m.status='Open'
      ORDER BY (bt.cumulative_budget_consumed_pct - bt.estimated_completion_pct) DESC
      LIMIT 5
    `).all();

    const writeOffByPartner = db.prepare(`
      SELECT m.responsible_partner, COALESCE(SUM(bi.write_off),0) as total_writeoff
      FROM billing_invoices bi
      JOIN matters m ON m.matter_id = bi.matter_id
      WHERE bi.write_off > 0
      GROUP BY m.responsible_partner
      ORDER BY total_writeoff DESC LIMIT 5
    `).all();

    const recentSignals = db.prepare(`
      SELECT ms.*, c.name as client_name
      FROM market_signals ms
      LEFT JOIN clients c ON c.client_id = ms.client_id
      ORDER BY ms.signal_date DESC LIMIT 5
    `).all();

    // Fee arrangement performance — uses same pre-aggregation pattern as /analytics
    const feePerformance = db.prepare(`
      SELECT m.fee_arrangement,
        COUNT(DISTINCT m.matter_id) as matter_count,
        COALESCE(SUM(te_agg.worked),0) as worked_value,
        COALESCE(SUM(bi_agg.collected),0) as collected,
        COALESCE(SUM(bi_agg.write_offs),0) as write_offs
      FROM matters m
      LEFT JOIN (SELECT matter_id, SUM(amount) as worked FROM time_entries GROUP BY matter_id) te_agg ON te_agg.matter_id = m.matter_id
      LEFT JOIN (SELECT matter_id, SUM(amount_collected) as collected, SUM(write_off) as write_offs FROM billing_invoices GROUP BY matter_id) bi_agg ON bi_agg.matter_id = m.matter_id
      GROUP BY m.fee_arrangement
    `).all().map(r => ({
      ...r,
      realisation_pct: r.worked_value > 0 ? Math.round((r.collected / r.worked_value) * 10000) / 100 : 0,
      write_off_rate_pct: r.worked_value > 0 ? Math.round((r.write_offs / r.worked_value) * 10000) / 100 : 0,
    }));

    // Cross-sell opportunities (practice areas the firm doesn't serve for existing clients)
    const crossSell = db.prepare(`
      SELECT c.name as client_name, c.industry, pc.practice_area,
        pc.estimated_client_spend, pc.known_competitor
      FROM practice_coverage pc
      JOIN clients c ON c.client_id = pc.client_id
      WHERE pc.served_by_us = 0 AND pc.estimated_client_spend > 100000
      ORDER BY pc.estimated_client_spend DESC LIMIT 8
    `).all();

    // Individual timekeeper write-off leaders (not just partners)
    const writeOffByTimekeeper = db.prepare(`
      SELECT m.responsible_partner as name,
        COALESCE(SUM(bi.write_off),0) as total_writeoff,
        COUNT(DISTINCT bi.invoice_id) as invoice_count,
        (SELECT practice_area FROM matters m2 WHERE m2.responsible_partner = m.responsible_partner LIMIT 1) as practice_area
      FROM billing_invoices bi
      JOIN matters m ON m.matter_id = bi.matter_id
      WHERE bi.write_off > 0
      GROUP BY m.responsible_partner
      ORDER BY total_writeoff DESC LIMIT 10
    `).all();

    // Total counts so AI can tell user what's truncated
    const counts = db.prepare(`
      SELECT
        (SELECT COUNT(*) FROM matters WHERE status='Open') as total_open_matters,
        (SELECT COUNT(*) FROM budget_tracking bt JOIN matters m ON m.matter_id = bt.matter_id WHERE bt.cumulative_budget_consumed_pct > (bt.estimated_completion_pct + 15) AND m.status='Open') as total_overrunning_matters,
        (SELECT COUNT(DISTINCT responsible_partner) FROM matters) as total_partners,
        (SELECT COUNT(*) FROM client_wallet_estimates) as total_wallet_estimates,
        (SELECT COUNT(*) FROM practice_coverage WHERE served_by_us = 0) as total_cross_sell_opportunities
    `).get();

    return JSON.stringify({
      _note: 'Lists below are TOP-N for context efficiency. See "_counts" for full totals and tell the user when data beyond the slice exists.',
      _counts: counts,
      firm_overview: firmOverview,
      realisation_by_practice: realisationByPractice,
      top_wallet_gaps: topWalletGaps,
      budget_overruns_top5: budgetOverruns,
      write_off_by_partner_top5: writeOffByPartner,
      write_off_by_timekeeper_top10: writeOffByTimekeeper,
      fee_arrangement_performance: feePerformance,
      cross_sell_opportunities_top8: crossSell,
      recent_market_signals: recentSignals,
    });
  }

  const SYSTEM_PROMPT_TEMPLATE = (contextData) => `You are the LegalPulse AI Assistant — a revenue intelligence advisor for law firms.

You have access to the firm's operational data, provided below as JSON. This is your SOLE source of truth. The dataset covers clients, matters, timekeepers, time entries, billing, budgets, wallet estimates, and market signals.

=== FIRM DATA CONTEXT ===
${contextData}
=== END CONTEXT ===

KEY FORMULAS
- Realisation Rate = (Collected ÷ Worked Value) × 100
- Billing Realisation = (Net Billed ÷ Worked Value) × 100
- Collection Realisation = (Collected ÷ Net Billed) × 100
- Share of Wallet = (Our Revenue ÷ Estimated Total Legal Spend) × 100
- Wallet Gap = Estimated Total Legal Spend − Our Revenue
- Budget overrun = budget consumed % exceeds estimated completion % by >15 points
- Thresholds: realisation below 75% = concerning · 75-80% = watch · 80%+ = healthy

GROUNDING RULES — READ BEFORE ANSWERING
- Use ONLY the numbers and names present in the context above. Do NOT invent clients, partners, matters, or figures.
- The context lists TOP-N results for several tables (typically top 5 by severity). If the user asks about something outside the top-N slice — for example an individual timekeeper not shown, or "all matters over budget" beyond the top 5 — say so honestly: "I can see the top 5 here; for the complete list, use the [relevant page]."
- If a question requires data not in the context (e.g. fee-arrangement performance, cross-sell opportunities, client health scores, individual-timekeeper breakdowns), state that clearly and point the user to the specific LegalPulse page that shows it. Do NOT guess.
- If a specific name the user asks about is not in the context, say so — do not assume.

ANSWER STYLE
- Structure every answer as: Insight (1 sentence) · Evidence (specific numbers from context) · Recommendation (concrete action).
- Be specific with £ amounts and percentages — never say "significant" when you can give a number.
- Connect profitability insights with wallet/growth insights when the data supports it.
- Use British English and £ currency throughout.`;

  // ─── Detect provider from key prefix ───
  function detectProvider(apiKey) {
    if (!apiKey) return null;
    if (apiKey.startsWith('sk-ant-')) return 'anthropic';
    if (apiKey.startsWith('sk-')) return 'openai';
    // Fallback heuristics
    if (apiKey.length > 40 && apiKey.includes('ant')) return 'anthropic';
    return 'openai'; // Default to OpenAI-compatible
  }

  // ─── Anthropic API call ───
  // Model selectable via ANTHROPIC_MODEL env var; default is a stable current
  // Sonnet. Update the env var to swap without a code deploy.
  const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-5';
  async function callAnthropic(apiKey, systemPrompt, messages) {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: ANTHROPIC_MODEL,
        max_tokens: 2000,
        system: systemPrompt,
        messages: messages,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Anthropic API error (${response.status}): ${err}`);
    }

    const data = await response.json();
    return data.content.map(c => c.text || '').join('');
  }

  // ─── OpenAI API call ───
  // Model selectable via OPENAI_MODEL env var.
  const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o';
  async function callOpenAI(apiKey, systemPrompt, messages) {
    const openaiMessages = [
      { role: 'system', content: systemPrompt },
      ...messages,
    ];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        max_tokens: 2000,
        messages: openaiMessages,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`OpenAI API error (${response.status}): ${err}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
  }

  // ─── Main chat endpoint ───
  router.post('/', async (req, res) => {
    const { message, history = [], apiKey, provider: requestedProvider } = req.body;

    if (!apiKey) {
      return res.json({
        response: "Please enter your API key in the field above to start chatting. LegalPulse supports **Anthropic (Claude)** and **OpenAI (GPT)** keys. Your key is sent directly to the provider and is never stored.",
        agent: 'system'
      });
    }

    try {
      const contextData = buildContext(db);
      const systemPrompt = SYSTEM_PROMPT_TEMPLATE(contextData);

      const provider = requestedProvider || detectProvider(apiKey);

      const messages = [
        ...history.map(h => ({ role: h.role, content: h.content })),
        { role: 'user', content: message }
      ];

      let text;
      if (provider === 'anthropic') {
        text = await callAnthropic(apiKey, systemPrompt, messages);
      } else {
        text = await callOpenAI(apiKey, systemPrompt, messages);
      }

      res.json({ response: text, agent: 'orchestrator', provider });
    } catch (e) {
      console.error('Chat error:', e.message);
      res.json({
        response: `**Error connecting to the AI provider.** Please check that:\n\n1. Your API key is correct and has not expired\n2. You have sufficient credits/quota on your account\n3. The key matches your selected provider\n\nTechnical detail: ${e.message}`,
        agent: 'system'
      });
    }
  });

  return router;
}
