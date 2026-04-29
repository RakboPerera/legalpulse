import { Router } from 'express';

export function createAnalyticsRouter(db) {
  const router = Router();

  // ─── Firm-Wide Overview ───
  router.get('/overview', (req, res) => {
    try {
      const totalRevenue = db.prepare(`SELECT COALESCE(SUM(amount_collected),0) as total FROM billing_invoices`).get();
      const totalBilled = db.prepare(`SELECT COALESCE(SUM(net_billed),0) as total FROM billing_invoices`).get();
      const totalWorked = db.prepare(`SELECT COALESCE(SUM(amount),0) as total FROM time_entries`).get();
      const totalWriteOffs = db.prepare(`SELECT COALESCE(SUM(write_off),0) as total FROM billing_invoices`).get();
      const totalWriteDowns = db.prepare(`SELECT COALESCE(SUM(write_down),0) as total FROM billing_invoices`).get();
      const clientCount = db.prepare(`SELECT COUNT(*) as c FROM clients WHERE status='Active'`).get();
      const matterCount = db.prepare(`SELECT COUNT(*) as c FROM matters WHERE status='Open'`).get();
      const timekeeperCount = db.prepare(`SELECT COUNT(*) as c FROM timekeepers WHERE status='Active'`).get();

      const overallRealisation = totalWorked.total > 0
        ? Math.round((totalRevenue.total / totalWorked.total) * 10000) / 100 : 0;
      const billingRealisation = totalWorked.total > 0
        ? Math.round((totalBilled.total / totalWorked.total) * 10000) / 100 : 0;
      const collectionRate = totalBilled.total > 0
        ? Math.round((totalRevenue.total / totalBilled.total) * 10000) / 100 : 0;

      res.json({
        totalRevenue: totalRevenue.total,
        totalBilled: totalBilled.total,
        totalWorkedValue: totalWorked.total,
        totalWriteOffs: totalWriteOffs.total,
        totalWriteDowns: totalWriteDowns.total,
        overallRealisation,
        billingRealisation,
        collectionRate,
        activeClients: clientCount.c,
        openMatters: matterCount.c,
        activeTimekeepers: timekeeperCount.c,
      });
    } catch (e) { res.status(500).json({ error: e.message }); }
  });

  // ─── Realisation by Practice Area ───
  // Aggregate time_entries and billing_invoices per-matter BEFORE joining to avoid
  // cartesian row-multiplication (N time entries × M invoices → inflated SUMs).
  router.get('/realisation-by-practice', (req, res) => {
    try {
      const results = db.prepare(`
        SELECT m.practice_area,
          COALESCE(SUM(te_agg.worked_value), 0) as worked_value,
          COALESCE(SUM(bi_agg.billed), 0) as billed,
          COALESCE(SUM(bi_agg.collected), 0) as collected
        FROM matters m
        LEFT JOIN (
          SELECT matter_id, SUM(amount) as worked_value
          FROM time_entries GROUP BY matter_id
        ) te_agg ON te_agg.matter_id = m.matter_id
        LEFT JOIN (
          SELECT matter_id,
            SUM(net_billed) as billed,
            SUM(amount_collected) as collected
          FROM billing_invoices GROUP BY matter_id
        ) bi_agg ON bi_agg.matter_id = m.matter_id
        GROUP BY m.practice_area
        ORDER BY m.practice_area
      `).all();

      const data = results.map(r => ({
        practice_area: r.practice_area,
        worked_value: r.worked_value,
        billed: r.billed,
        collected: r.collected,
        billing_realisation: r.worked_value > 0 ? Math.round((r.billed / r.worked_value) * 10000) / 100 : 0,
        collection_realisation: r.billed > 0 ? Math.round((r.collected / r.billed) * 10000) / 100 : 0,
        overall_realisation: r.worked_value > 0 ? Math.round((r.collected / r.worked_value) * 10000) / 100 : 0,
      }));
      res.json(data);
    } catch (e) { res.status(500).json({ error: e.message }); }
  });

  // ─── Top Clients by Wallet Gap ───
  router.get('/wallet-gaps', (req, res) => {
    try {
      const results = db.prepare(`
        SELECT cwe.*, c.name as client_name, c.industry
        FROM client_wallet_estimates cwe
        JOIN clients c ON c.client_id = cwe.client_id
        ORDER BY (cwe.estimated_total_legal_spend - cwe.our_revenue) DESC
        LIMIT 15
      `).all();

      const data = results.map(r => ({
        ...r,
        wallet_gap: r.estimated_total_legal_spend - r.our_revenue,
      }));
      res.json(data);
    } catch (e) { res.status(500).json({ error: e.message }); }
  });

  // ─── Write-Off Concentration ───
  router.get('/write-off-analysis', (req, res) => {
    try {
      // By partner
      const byPartner = db.prepare(`
        SELECT m.responsible_partner as label,
          COALESCE(SUM(bi.write_off), 0) as total_writeoff,
          COUNT(DISTINCT bi.invoice_id) as invoice_count,
          COALESCE(SUM(bi.gross_amount), 0) as gross_total
        FROM billing_invoices bi
        JOIN matters m ON m.matter_id = bi.matter_id
        WHERE bi.write_off > 0
        GROUP BY m.responsible_partner
        ORDER BY total_writeoff DESC
        LIMIT 10
      `).all();

      // By practice area
      const byPractice = db.prepare(`
        SELECT m.practice_area as label,
          COALESCE(SUM(bi.write_off), 0) as total_writeoff,
          COUNT(DISTINCT bi.invoice_id) as invoice_count
        FROM billing_invoices bi
        JOIN matters m ON m.matter_id = bi.matter_id
        WHERE bi.write_off > 0
        GROUP BY m.practice_area
        ORDER BY total_writeoff DESC
      `).all();

      // By fee arrangement
      const byFeeType = db.prepare(`
        SELECT m.fee_arrangement as label,
          COALESCE(SUM(bi.write_off), 0) as total_writeoff,
          COUNT(DISTINCT bi.invoice_id) as invoice_count
        FROM billing_invoices bi
        JOIN matters m ON m.matter_id = bi.matter_id
        WHERE bi.write_off > 0
        GROUP BY m.fee_arrangement
        ORDER BY total_writeoff DESC
      `).all();

      res.json({ byPartner, byPractice, byFeeType });
    } catch (e) { res.status(500).json({ error: e.message }); }
  });

  // ─── Budget Overruns ───
  // Returns top-20 rows plus total count so the UI can say "showing 20 of N".
  router.get('/budget-overruns', (req, res) => {
    try {
      const rows = db.prepare(`
        SELECT bt.*, m.matter_name, m.practice_area, m.budget_amount, m.responsible_partner,
          c.name as client_name
        FROM budget_tracking bt
        JOIN matters m ON m.matter_id = bt.matter_id
        JOIN clients c ON c.client_id = m.client_id
        WHERE bt.cumulative_budget_consumed_pct > (bt.estimated_completion_pct + 15)
          AND m.status = 'Open'
        ORDER BY (bt.cumulative_budget_consumed_pct - bt.estimated_completion_pct) DESC
        LIMIT 20
      `).all();
      const totalRow = db.prepare(`
        SELECT COUNT(*) as c
        FROM budget_tracking bt
        JOIN matters m ON m.matter_id = bt.matter_id
        WHERE bt.cumulative_budget_consumed_pct > (bt.estimated_completion_pct + 15)
          AND m.status = 'Open'
      `).get();
      res.json({ rows, total: totalRow?.c || 0 });
    } catch (e) { res.status(500).json({ error: e.message }); }
  });

  // ─── Fee Arrangement Performance ───
  // Same pre-aggregation pattern as /realisation-by-practice to avoid join inflation.
  router.get('/fee-arrangement-performance', (req, res) => {
    try {
      const results = db.prepare(`
        SELECT m.fee_arrangement, m.practice_area,
          COUNT(DISTINCT m.matter_id) as matter_count,
          COALESCE(SUM(te_agg.worked_value),0) as worked_value,
          COALESCE(SUM(bi_agg.billed),0) as billed,
          COALESCE(SUM(bi_agg.collected),0) as collected,
          COALESCE(SUM(bi_agg.write_offs),0) as write_offs
        FROM matters m
        LEFT JOIN (
          SELECT matter_id, SUM(amount) as worked_value
          FROM time_entries GROUP BY matter_id
        ) te_agg ON te_agg.matter_id = m.matter_id
        LEFT JOIN (
          SELECT matter_id,
            SUM(net_billed) as billed,
            SUM(amount_collected) as collected,
            SUM(write_off) as write_offs
          FROM billing_invoices GROUP BY matter_id
        ) bi_agg ON bi_agg.matter_id = m.matter_id
        GROUP BY m.fee_arrangement, m.practice_area
      `).all();

      const data = results.map(r => ({
        ...r,
        realisation: r.worked_value > 0 ? Math.round((r.collected / r.worked_value) * 10000) / 100 : 0,
        write_off_rate: r.worked_value > 0 ? Math.round((r.write_offs / r.worked_value) * 10000) / 100 : 0,
      }));
      res.json(data);
    } catch (e) { res.status(500).json({ error: e.message }); }
  });

  // ─── Client Health Scores ───
  router.get('/client-health', (req, res) => {
    try {
      // Base client data — join only the latest period wallet estimate per client
      // to avoid duplicate rows if multiple period rows exist
      const clients = db.prepare(`
        SELECT c.*, cwe.our_revenue, cwe.estimated_total_legal_spend, cwe.share_of_wallet_pct,
          cwe.confidence as wallet_confidence
        FROM clients c
        LEFT JOIN client_wallet_estimates cwe
          ON cwe.client_id = c.client_id
          AND cwe.period = (
            SELECT MAX(period) FROM client_wallet_estimates WHERE client_id = c.client_id
          )
        WHERE c.status = 'Active'
        ORDER BY cwe.our_revenue DESC NULLS LAST
        LIMIT 30
      `).all();

      // Pre-fetch Factor 2: matter diversity — open matters only
      const diversityMap = Object.fromEntries(
        db.prepare(`
          SELECT client_id, COUNT(DISTINCT practice_area) as cnt
          FROM matters WHERE status = 'Open'
          GROUP BY client_id
        `).all().map(r => [r.client_id, r.cnt])
      );

      // Pre-fetch Factor 3: partner breadth — open or closed within last 24 months
      const partnerMap = Object.fromEntries(
        db.prepare(`
          SELECT client_id, COUNT(DISTINCT responsible_partner) as cnt
          FROM matters
          WHERE status = 'Open' OR close_date > date('now', '-24 months')
          GROUP BY client_id
        `).all().map(r => [r.client_id, r.cnt])
      );

      // Pre-fetch Factor 5: competitor practice foothold per client
      const footholdMap = Object.fromEntries(
        db.prepare(`
          SELECT client_id,
            SUM(CASE WHEN served_by_us = 0 THEN 1 ELSE 0 END) as competitor_areas,
            SUM(CASE WHEN served_by_us = 0 THEN COALESCE(estimated_client_spend, 0) ELSE 0 END) as competitor_spend
          FROM practice_coverage
          GROUP BY client_id
        `).all().map(r => [r.client_id, r])
      );

      // Pre-fetch Factor 6: worst market signal severity per client in last 12 months
      // Encode severity as integer for MAX aggregation: High=3, Medium=2, Low=1
      const signalMap = Object.fromEntries(
        db.prepare(`
          SELECT client_id,
            MAX(CASE severity WHEN 'High' THEN 3 WHEN 'Medium' THEN 2 WHEN 'Low' THEN 1 ELSE 0 END) as worst
          FROM market_signals
          WHERE client_id IS NOT NULL AND signal_date > date('now', '-12 months')
          GROUP BY client_id
        `).all().map(r => [r.client_id, r.worst])
      );

      const scored = clients.map(c => {
        let score = 50;

        // Factor 1: Revenue level — neutral if no wallet data (no penalty for missing data)
        const rev = c.our_revenue;
        if (rev == null) { /* neutral */ }
        else if (rev > 500000) score += 20;
        else if (rev > 200000) score += 10;
        else if (rev <= 50000) score -= 10;

        // Factor 2: Matter diversity (open matters only)
        const practiceCount = diversityMap[c.client_id] || 0;
        if (practiceCount >= 3) score += 20;
        else if (practiceCount === 2) score += 10;
        else score -= 10;

        // Factor 3: Partner breadth (open or closed within 24 months)
        const partnerCount = partnerMap[c.client_id] || 0;
        if (partnerCount >= 3) score += 15;
        else if (partnerCount === 2) score += 10;
        else score -= 5;

        // Factors 4–6: Competitor signals — combined cap of −25 (positives uncapped)
        let competitorDelta = 0;

        // Factor 4: Share of wallet position
        const sow = c.share_of_wallet_pct;
        if (sow != null) {
          let sowAdj;
          if (sow >= 50) sowAdj = 10;
          else if (sow >= 25) sowAdj = 0;
          else if (sow >= 10) sowAdj = -10;
          else sowAdj = -20;
          // Low-confidence estimates carry half the weight
          if (c.wallet_confidence === 'Low') sowAdj = Math.round(sowAdj / 2);
          competitorDelta += sowAdj;
        }

        // Factor 5: Competitor practice foothold (spend ratio vs our revenue)
        const fh = footholdMap[c.client_id];
        if (fh) {
          if (fh.competitor_areas === 0) {
            competitorDelta += 5; // full coverage bonus
          } else if (rev && rev > 0) {
            const ratio = fh.competitor_spend / rev;
            if (ratio > 1.5) competitorDelta -= 20;
            else if (ratio >= 0.5) competitorDelta -= 12;
            else competitorDelta -= 5;
          } else {
            competitorDelta -= 5; // competitors present but no revenue baseline
          }
        }

        // Factor 6: Recent competitive signals (last 12 months)
        const worstSignal = signalMap[c.client_id] || 0;
        if (worstSignal === 3) competitorDelta -= 15;
        else if (worstSignal === 2) competitorDelta -= 8;
        else if (worstSignal === 1) competitorDelta -= 3;

        // Cap combined competitor penalty at −25; positives apply in full
        if (competitorDelta < -25) competitorDelta = -25;
        score += competitorDelta;

        score = Math.max(0, Math.min(100, score));

        return {
          client_id: c.client_id, name: c.name, industry: c.industry,
          our_revenue: c.our_revenue, estimated_spend: c.estimated_total_legal_spend,
          share_of_wallet: c.share_of_wallet_pct, health_score: score,
          status: score >= 70 ? 'Healthy' : score >= 50 ? 'Watch' : 'At Risk',
        };
      });

      res.json(scored);
    } catch (e) { res.status(500).json({ error: e.message }); }
  });

  // ─── Revenue by Month (trend) ───
  router.get('/revenue-trend', (req, res) => {
    try {
      const results = db.prepare(`
        SELECT substr(invoice_date, 1, 7) as month,
          COALESCE(SUM(net_billed),0) as billed,
          COALESCE(SUM(amount_collected),0) as collected,
          COALESCE(SUM(write_off),0) as write_offs
        FROM billing_invoices
        GROUP BY substr(invoice_date, 1, 7)
        ORDER BY month
      `).all();
      res.json(results);
    } catch (e) { res.status(500).json({ error: e.message }); }
  });

  // ─── Cross-sell opportunities ───
  router.get('/cross-sell', (req, res) => {
    try {
      const results = db.prepare(`
        SELECT pc.*, c.name as client_name, c.industry
        FROM practice_coverage pc
        JOIN clients c ON c.client_id = pc.client_id
        WHERE pc.served_by_us = 0 AND pc.estimated_client_spend > 100000
        ORDER BY pc.estimated_client_spend DESC
      `).all();
      res.json(results);
    } catch (e) { res.status(500).json({ error: e.message }); }
  });

  return router;
}
