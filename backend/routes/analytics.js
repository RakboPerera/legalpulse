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
      const clients = db.prepare(`
        SELECT c.*, cwe.our_revenue, cwe.estimated_total_legal_spend, cwe.share_of_wallet_pct
        FROM clients c
        LEFT JOIN client_wallet_estimates cwe ON cwe.client_id = c.client_id
        WHERE c.status = 'Active'
        ORDER BY cwe.our_revenue DESC NULLS LAST
        LIMIT 30
      `).all();

      const scored = clients.map(c => {
        let score = 50;
        // Revenue trend (simplified — based on our_revenue level)
        if (c.our_revenue > 500000) score += 20;
        else if (c.our_revenue > 200000) score += 10;
        else if (c.our_revenue > 50000) score -= 0;
        else score -= 10;

        // Matter diversity
        const practices = db.prepare(`SELECT COUNT(DISTINCT practice_area) as c FROM matters WHERE client_id = ? AND status = 'Open'`).get(c.client_id);
        if (practices && practices.c >= 3) score += 20;
        else if (practices && practices.c === 2) score += 10;
        else score -= 10;

        // Relationship breadth
        const partners = db.prepare(`SELECT COUNT(DISTINCT responsible_partner) as c FROM matters WHERE client_id = ?`).get(c.client_id);
        if (partners && partners.c >= 3) score += 15;
        else if (partners && partners.c === 2) score += 10;
        else score -= 5;

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
        LIMIT 20
      `).all();
      res.json(results);
    } catch (e) { res.status(500).json({ error: e.message }); }
  });

  return router;
}
