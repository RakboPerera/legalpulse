import React, { useState, useEffect } from 'react';
import api from '../api';
import InfoTooltip from '../components/InfoTooltip';
import {
  fmt, realisationColor,
  billingRealisationColor, collectionRealisationColor, clampPct,
} from '../utils/format';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip,
  ResponsiveContainer, LineChart, Line, Legend, Cell
} from 'recharts';

export default function FinancialDeepDive() {
  const [overview, setOverview] = useState(null);
  const [realisation, setRealisation] = useState([]);
  const [revTrend, setRevTrend] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([
      api.get('/analytics/overview'),
      api.get('/analytics/realisation-by-practice'),
      api.get('/analytics/revenue-trend'),
    ]).then(([ov, re, rt]) => {
      setOverview(ov.data);
      setRealisation(re.data || []);
      setRevTrend(rt.data || []);
      setLoading(false);
    }).catch(e => {
      setError(e.message);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="empty-state"><div className="loading-spinner" style={{margin:'0 auto'}}></div><h3 style={{marginTop:16}}>Loading financial data...</h3></div>;
  if (error) return <div className="empty-state"><h3>Error loading data</h3><p>{error}</p></div>;
  if (!overview) return <div className="empty-state"><h3>No data available</h3></div>;

  // Empty state — no financial activity in the dataset (no worked value or billings)
  const hasFinancialData = (overview.totalWorkedValue || 0) > 0 || (overview.totalBilled || 0) > 0;
  if (!hasFinancialData) {
    return (
      <div>
        <div className="page-header">
          <div>
            <h2>Financial Deep Dive</h2>
            <p>Revenue waterfall, collection performance, cost analysis, and margin deep dive for Finance Directors.</p>
          </div>
        </div>
        <div className="empty-state" style={{padding:'60px 24px',textAlign:'center'}}>
          <h3 style={{marginBottom:8}}>No financial data yet</h3>
          <p style={{color:'var(--text-muted)',maxWidth:480,margin:'0 auto'}}>
            The waterfall and P&amp;L views need time entries and invoices to populate. Load the demo dataset
            or upload your own billing data from the Data Management page.
          </p>
        </div>
      </div>
    );
  }

  const totalWorked = overview.totalWorkedValue || 0;
  const totalBilled = overview.totalBilled || 0;
  const totalCollected = overview.totalRevenue || 0;
  const totalWriteOffs = overview.totalWriteOffs || 0;
  const totalWriteDowns = overview.totalWriteDowns || 0;
  const billingReal = overview.billingRealisation || 0;
  const collectionReal = overview.collectionRate || 0;
  const leakage = totalWorked - totalCollected;
  const realisationSafe = realisation.map(r => ({
    ...r,
    billing_realisation: clampPct(r.billing_realisation),
    collection_realisation: clampPct(r.collection_realisation),
    overall_realisation: clampPct(r.overall_realisation),
  }));

  // Derive Net Billed for the waterfall from Worked − Write-Downs so the bars
  // mathematically reconcile left-to-right. If the raw totalBilled from the
  // API disagrees (different filters / periods), the derived value still tells
  // the correct visual story.
  const derivedNetBilled = Math.max(0, totalWorked - totalWriteDowns);
  const waterfall = [
    { name: 'Worked Value', value: totalWorked, fill: '#3B82F6' },
    { name: 'Write-Downs', value: totalWriteDowns, fill: '#F59E0B' },
    { name: 'Net Billed', value: derivedNetBilled, fill: '#8B5CF6' },
    { name: 'Write-Offs', value: totalWriteOffs, fill: '#EF4444' },
    { name: 'Collected', value: totalCollected, fill: '#10B981' },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Financial Deep Dive</h2>
          <p>Revenue waterfall, collection performance, cost analysis, and margin deep dive for Finance Directors.</p>
        </div>
      </div>

      <div className="metric-grid">
        <div className="metric-card blue">
          <div className="metric-label">
            Worked Value
            <InfoTooltip
              title="Worked Value"
              sections={[
                { label: 'What it shows', body: 'The total £ of time recorded by fee-earners, valued at the applied rate on each time entry. This is the TOP of the revenue funnel — the ceiling before any adjustments.' },
                { label: 'Formula', body: 'SUM(hours_billed × rate_applied)\nacross all time entries', mono: true },
                { label: 'How to read it', body: 'Movement in this number reflects capacity and utilisation, not efficiency. A rising worked value is only good news if billing and collection realisation hold. If this number grows but Collected doesn\'t, the leakage is widening.' },
                { label: 'Caveat', body: 'Unrecorded time is invisible here. If fee-earners are working evenings on fixed-fee matters without logging it, the true worked value is higher than shown — and the firm\'s real realisation rate is lower than shown.' },
              ]}
            />
          </div>
          <div className="metric-value">{fmt(totalWorked)}</div>
        </div>
        <div className="metric-card purple">
          <div className="metric-label">
            Net Billed
            <InfoTooltip
              title="Net Billed"
              sections={[
                { label: 'What it shows', body: 'The £ amount actually invoiced to clients. This is Worked Value minus write-DOWNs (time the firm decided not to bill for) minus any discounts or adjustments applied at invoice stage.' },
                { label: 'Formula', body: 'SUM(net_billed) across all invoices\n(equivalently: gross_amount − write_down)', mono: true },
                { label: 'Stage context', body: 'This is the FIRST checkpoint in the revenue funnel — Worked → [Net Billed] → Collected. The Billing Realisation % below tells you how much survived this stage.' },
                { label: 'Billing Realisation benchmark', body: '≥ 90% healthy · 85-90% watch · below 85% investigate. Sub-85% typically means systematic pre-bill write-downs, fixed-fee over-runs, or billing discipline issues.' },
              ]}
            />
          </div>
          <div className="metric-value">{fmt(totalBilled)}</div>
          <div className="metric-sub">Billing realisation: {billingReal}%</div>
        </div>
        <div className="metric-card green">
          <div className="metric-label">
            Collected
            <InfoTooltip
              title="Collected"
              sections={[
                { label: 'What it shows', body: 'Cash physically received from clients. The bottom of the revenue funnel and the only number that actually matters for firm cash flow.' },
                { label: 'Formula', body: 'SUM(amount_collected) across all invoices', mono: true },
                { label: 'Stage context', body: 'This is the SECOND checkpoint — Net Billed → [Collected]. The Collection Rate % below is the second attrition layer. Overall Realisation = (Collected / Worked) combines both.' },
                { label: 'Collection Rate benchmark', body: '≥ 92% healthy · 88-92% watch · below 88% investigate. Low collection rates usually trace to aged receivables, client disputes, or post-bill write-offs accumulating at matter close.' },
                { label: 'Working capital frame', body: 'Collected lagging Billed by ~1-2 months is normal (invoice-to-cash cycle). Collected lagging by 3+ months is a working capital problem — the firm is bank-rolling client payment terms.' },
              ]}
            />
          </div>
          <div className="metric-value">{fmt(totalCollected)}</div>
          <div className="metric-sub">Collection rate: {collectionReal}%</div>
        </div>
        <div className="metric-card red">
          <div className="metric-label">
            Revenue Leakage
            <InfoTooltip
              title="Revenue Leakage"
              sections={[
                { label: 'What it shows', body: 'The absolute £ that disappeared between work-done and cash-in-bank. This is the end-to-end cost of everything that went wrong in the revenue funnel during the period.' },
                { label: 'Formula', body: 'Leakage = Worked Value − Collected\nComponents: Write-Downs + Write-Offs + Uncollected Receivables', mono: true },
                { label: 'Three components', body: 'Write-DOWNs: time written off before the invoice went out (pre-bill adjustment).\nWrite-OFFs: invoices written off after billing (post-bill adjustment).\nUncollected: amounts billed but still outstanding — not yet written off, but not yet cash.' },
                { label: 'How to read it', body: 'The strap-line below separates the two visible components (write-offs + write-downs). Any residual is uncollected receivables — working-capital-trapped revenue. A finance director wants write-downs and write-offs minimised, and receivables turning fast.' },
                { label: 'Benchmark', body: 'For a £50M+ firm, total leakage typically runs 10-15% of worked value. Above 20% is structurally loss-making. Below 10% is genuinely well-run.' },
              ]}
            />
          </div>
          <div className="metric-value">{fmt(leakage)}</div>
          <div className="metric-sub">{fmt(totalWriteOffs)} write-offs + {fmt(totalWriteDowns)} write-downs</div>
        </div>
      </div>

      <div className="chart-grid">
        <div className="chart-card">
          <div className="card-title">
            Revenue Waterfall: Worked → Collected
            <InfoTooltip
              title="Revenue Waterfall"
              sections={[
                { label: 'What it shows', body: 'The five bars visualise the revenue journey as a funnel. Blue Worked Value is the starting point. Amber Write-Downs is the revenue lost BEFORE invoicing. Purple Net Billed is what made it onto invoices. Red Write-Offs is revenue lost AFTER invoicing. Green Collected is the cash that survived.' },
                { label: 'How to read the bars', body: 'A healthy firm shows Worked ≈ Net Billed ≈ Collected with small Write-Down and Write-Off bars. A leaky firm shows material shrinkage between Worked and Net Billed (billing problem), or between Net Billed and Collected (collection problem), or both.' },
                { label: 'Diagnostic', body: 'Bigger Write-Downs than Write-Offs = the firm is self-censoring at billing stage; possibly good billing discipline, possibly under-billing.\nBigger Write-Offs than Write-Downs = the firm is billing optimistically and writing off when clients push back; pricing or scope discipline needed.' },
                { label: 'Units', body: 'All bars are in £. This is an absolute view. For percentage views, see the realisation metrics on the KPI tiles above.' },
              ]}
            />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={waterfall} margin={{top:10,right:10,left:10,bottom:5}}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E2D4A" />
              <XAxis dataKey="name" tick={{fill:'#8899B4',fontSize:11}} />
              <YAxis tick={{fill:'#8899B4',fontSize:11}} tickFormatter={v => fmt(v)} />
              <RTooltip
                contentStyle={{background:'#111B2E',border:'1px solid #1E2D4A',borderRadius:8,color:'#E8ECF4',fontSize:13}}
                formatter={(v) => fmt(v)}
              />
              <Bar dataKey="value" radius={[4,4,0,0]}>
                {waterfall.map((entry, i) => (
                  <Cell key={`cell-${i}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <div className="card-title">
            Monthly Collection vs Write-Off Trend
            <InfoTooltip
              title="Monthly Collection vs Write-Off Trend"
              sections={[
                { label: 'What it shows', body: 'Two monthly lines. Green solid = cash collected each month. Red dashed = amounts written off each month. Grouped by invoice month.' },
                { label: 'Healthy pattern', body: 'Green Collected line is relatively stable or growing. Red Write-offs line is flat and small — occasional spikes are normal (matter close-outs and year-end clean-ups clear old invoices).' },
                { label: 'Concerning patterns', body: 'Write-offs TRENDING UP quarter-over-quarter: the firm is billing increasingly optimistically, or client payment pushback is rising.\nCollected flat while Billed is rising (not shown here — see Dashboard trend): working capital getting worse.\nRegular end-of-quarter write-off spikes: someone\'s cleaning out aged WIP rather than fixing the front-end problem.' },
                { label: 'Action', body: 'A rising write-off trend typically precedes a bad-debt provision surprise in the next audit. Catching it early lets finance work with billing on the upstream cause.' },
              ]}
            />
          </div>
          {revTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revTrend} margin={{top:10,right:10,left:10,bottom:5}}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E2D4A" />
                <XAxis dataKey="month" tick={{fill:'#8899B4',fontSize:11}} />
                <YAxis tick={{fill:'#8899B4',fontSize:11}} tickFormatter={v => fmt(v)} />
                <RTooltip
                  contentStyle={{background:'#111B2E',border:'1px solid #1E2D4A',borderRadius:8,color:'#E8ECF4',fontSize:13}}
                  formatter={(v) => fmt(v)}
                />
                <Legend wrapperStyle={{fontSize:12}} />
                <Line type="monotone" dataKey="collected" name="Collected" stroke="#10B981" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="write_offs" name="Write-offs" stroke="#EF4444" strokeWidth={2} strokeDasharray="5 5" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state"><p>No trend data available</p></div>
          )}
        </div>
      </div>

      <div className="card" style={{marginTop:4}}>
        <div className="card-title" style={{marginBottom:16}}>
          Practice Area P&L Summary
          <InfoTooltip
            title="Practice Area P&L Summary"
            sections={[
              { label: 'What it shows', body: 'The complete revenue-conversion pipeline per practice area, in one row. Worked → Billed → Collected in £, leakage in £, and the three-stage realisation rates in %.' },
              { label: 'Column meanings', body: 'Worked: £ of time recorded · Billed: £ invoiced · Collected: £ received · Revenue Leakage: Worked minus Collected · Billing Real.: % of worked that got invoiced · Collection Real.: % of invoices that got paid · Overall Real.: end-to-end % (Collected ÷ Worked).' },
              { label: 'How to scan it', body: 'Start with the Overall Real. column on the right. Anything red (< 75%) is structurally underperforming. For each red row, look left to diagnose — if Billing Real. is also low, the problem is at quote/invoice stage. If Collection Real. is low, the problem is at collections.' },
              { label: 'Cross-practice comparison', body: 'A healthy firm has relatively tight spread across practice areas (say ± 5pp on Overall Real.). A wide spread means some practices are genuinely more profitable than others — which should either drive pricing adjustments in the laggards or investment in the leaders.' },
              { label: 'Next step', body: 'For the lowest-performing practice area, go to the Profitability page and filter write-offs to that area — you\'ll likely find the concentration sits with one or two partners.' },
            ]}
            nextStep={{ label: 'Investigate write-off concentration', to: '/profitability' }}
          />
        </div>
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Practice Area</th>
                <th>Worked Value</th>
                <th>Billed</th>
                <th>Collected</th>
                <th>Revenue Leakage</th>
                <th>Billing Real.</th>
                <th>Collection Real.</th>
                <th>Overall Real.</th>
              </tr>
            </thead>
            <tbody>
              {realisationSafe.map((r, i) => (
                <tr key={i}>
                  <td className="highlight">{r.practice_area || '—'}</td>
                  <td className="num">{fmt(r.worked_value)}</td>
                  <td className="num">{fmt(r.billed)}</td>
                  <td className="num">{fmt(r.collected)}</td>
                  <td className="num text-red">{fmt((r.worked_value || 0) - (r.collected || 0))}</td>
                  <td className="num" style={{color: billingRealisationColor(r.billing_realisation)}}>{r.billing_realisation || 0}%</td>
                  <td className="num" style={{color: collectionRealisationColor(r.collection_realisation)}}>{r.collection_realisation || 0}%</td>
                  <td className="num" style={{color: realisationColor(r.overall_realisation), fontWeight:700}}>{r.overall_realisation || 0}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
