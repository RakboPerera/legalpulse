import React, { useState, useEffect } from 'react';
import api from '../api';
import InfoTooltip from '../components/InfoTooltip';
import { fmt, realisationFillHex, clampPct } from '../utils/format';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip,
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { TrendingUp, TrendingDown, AlertTriangle, Users, Briefcase, Target } from 'lucide-react';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

export default function Dashboard() {
  const [overview, setOverview] = useState(null);
  const [realisation, setRealisation] = useState([]);
  const [walletGaps, setWalletGaps] = useState([]);
  const [revenueTrend, setRevenueTrend] = useState([]);
  const [clientHealth, setClientHealth] = useState([]);
  const [budgetOverruns, setBudgetOverruns] = useState([]);
  const [budgetOverrunsTotal, setBudgetOverrunsTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/analytics/overview'),
      api.get('/analytics/realisation-by-practice'),
      api.get('/analytics/wallet-gaps'),
      api.get('/analytics/revenue-trend'),
      api.get('/analytics/client-health'),
      api.get('/analytics/budget-overruns'),
    ]).then(([ov, re, wg, rt, ch, bo]) => {
      setOverview(ov.data);
      setRealisation(re.data);
      setWalletGaps(wg.data);
      setRevenueTrend(rt.data);
      setClientHealth(ch.data);
      // Endpoint now returns { rows, total }. Handle both old-and-new shape for safety.
      const boData = bo.data;
      if (Array.isArray(boData)) {
        setBudgetOverruns(boData);
        setBudgetOverrunsTotal(boData.length);
      } else {
        setBudgetOverruns(boData.rows || []);
        setBudgetOverrunsTotal(boData.total || (boData.rows?.length || 0));
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="empty-state"><div className="loading-spinner" style={{margin:'0 auto'}}></div><h3 style={{marginTop:16}}>Loading firm data...</h3></div>;

  // Empty state — no clients or matters in the dataset
  const hasData = (overview?.activeClients > 0) || (overview?.openMatters > 0);
  if (!hasData) {
    return (
      <div>
        <div className="page-header">
          <div>
            <h2>Firm-Wide Overview</h2>
            <p>No data loaded yet — add records via Data Management, or reload the Whitfield & Partners demo.</p>
          </div>
        </div>
        <div className="empty-state" style={{padding:'60px 24px',textAlign:'center'}}>
          <h3 style={{marginBottom:8}}>No firm data yet</h3>
          <p style={{color:'var(--text-muted)',maxWidth:480,margin:'0 auto'}}>
            Load the Whitfield &amp; Partners demo from the Data Management page to populate every dashboard, or upload your own clients, matters, time entries and invoices.
          </p>
        </div>
      </div>
    );
  }

  const healthDist = { Healthy: 0, Watch: 0, 'At Risk': 0 };
  clientHealth.forEach(c => { if (healthDist[c.status] !== undefined) healthDist[c.status]++; });
  const healthPie = Object.entries(healthDist).map(([name, value]) => ({ name, value }));
  const healthColors = { Healthy: '#10B981', Watch: '#F59E0B', 'At Risk': '#EF4444' };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Firm-Wide Overview</h2>
          <p>Whitfield & Partners — {overview?.activeTimekeepers ?? 120} timekeepers · 5 practice areas · 6 months of data</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="metric-grid">
        <div className="metric-card blue">
          <div className="metric-label">
            Total Revenue Collected
            <InfoTooltip
              title="Total Revenue Collected"
              sections={[
                { label: 'What it shows', body: 'The cash the firm has actually received — not what was billed, not what was worked. This is the top-of-funnel reality number.' },
                { label: 'Formula', body: 'SUM(amount_collected) across all invoices in the period', mono: true },
                { label: 'How to read it', body: 'Compare with Worked Value (see Financial Deep Dive) to see how much revenue leaks between work-done and cash-in-bank. The gap is billing write-downs + write-offs + uncollected receivables.' },
                { label: 'What drives it', body: 'Billing cadence, invoice-to-cash cycle, client payment behaviour, and upstream write-offs. A rising top line is only healthy if realisation holds.' },
              ]}
              nextStep={{ label: 'See the full Worked → Collected waterfall', to: '/financial' }}
            />
          </div>
          <div className="metric-value">{fmt(overview?.totalRevenue)}</div>
          <div className="metric-sub">from {overview?.activeClients} active clients</div>
        </div>
        <div className="metric-card green">
          <div className="metric-label">
            Overall Realisation
            <InfoTooltip
              title="Overall Realisation"
              sections={[
                { label: 'What it shows', body: 'The share of the work the firm actually got paid for. If fee-earners worked £10M of time and £8.5M landed in the bank, realisation is 85%.' },
                { label: 'Formula', body: 'Total Collected ÷ Total Worked Value × 100', mono: true },
                { label: 'How to read it', body: '≥ 90% strong · 85-90% healthy · 80-85% watch · below 80% concerning. Industry benchmark for UK commercial firms sits around 85-88%.' },
                { label: 'What drives it', body: 'This is the composite of two stages. Billing Realisation (did we invoice what we worked?) × Collection Realisation (did we collect what we billed?). Low overall numbers usually trace back to one specific stage — see Financial Deep Dive to find out which.' },
                { label: 'Gotcha', body: 'A dip here of even 2 percentage points typically represents millions in lost revenue for a firm of this size. Small moves matter.' },
              ]}
              nextStep={{ label: 'Decompose into the 3-stage funnel', to: '/financial' }}
            />
          </div>
          <div className="metric-value">{overview?.overallRealisation}%</div>
          <div className="metric-sub">
            {overview?.overallRealisation >= 80
              ? <span className="text-green">↑ On target</span>
              : <span className="text-amber">⚠ Below 80% target</span>}
          </div>
        </div>
        <div className="metric-card amber">
          <div className="metric-label">
            Total Write-Offs
            <InfoTooltip
              title="Total Write-Offs (and Write-Downs)"
              sections={[
                { label: 'What it shows', body: 'Two distinct leaks, shown together. Write-DOWNs happen BEFORE the invoice goes out — a partner decides the recorded time isn\'t all billable. Write-OFFs happen AFTER billing — the client disputes, delays, or the firm simply gives up collecting.' },
                { label: 'Formula', body: 'SUM(write_off) and SUM(write_down) across all invoices', mono: true },
                { label: 'How to read it', body: 'High write-downs usually mean billing discipline issues or fixed-fee scope creep. High write-offs usually mean billing errors, client disputes, or aged receivables. Diagnose which one is the problem before acting.' },
                { label: 'What drives it', body: 'Concentration matters more than total. A single partner or a single fee type producing most of the leakage signals a fixable systemic issue; write-offs spread evenly across the firm are usually strategic relationship calls.' },
              ]}
              nextStep={{ label: 'See concentration by partner / practice / fee type', to: '/profitability' }}
            />
          </div>
          <div className="metric-value">{fmt(overview?.totalWriteOffs)}</div>
          <div className="metric-sub">+ {fmt(overview?.totalWriteDowns)} in write-downs</div>
        </div>
        <div className="metric-card purple">
          <div className="metric-label">
            Open Matters
            <InfoTooltip
              title="Open Matters"
              sections={[
                { label: 'What it shows', body: 'Active engagements — matters with status = Open. Each carries a budget, a fee arrangement, a responsible partner, and (usually) a set of time entries and invoices against it.' },
                { label: 'Formula', body: 'COUNT(matter_id) WHERE status = \'Open\'', mono: true },
                { label: 'How to read it', body: 'Read alongside active timekeepers to gauge load per lawyer. A rising matter count with static headcount typically signals either WIP that will convert to revenue — or an over-stretched team about to generate write-downs.' },
                { label: 'Where it matters', body: 'Open matter count is the denominator for most profitability metrics. If it\'s moving, the per-matter numbers elsewhere will look different even if the underlying work hasn\'t changed.' },
              ]}
            />
          </div>
          <div className="metric-value">{overview?.openMatters}</div>
          <div className="metric-sub">{overview?.activeTimekeepers} active timekeepers</div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="chart-grid">
        {/* Realisation by Practice Area */}
        <div className="chart-card">
          <div className="card-title">
            Realisation Rate by Practice Area
            <InfoTooltip
              title="Realisation Rate by Practice Area"
              sections={[
                { label: 'What it shows', body: 'The percentage of worked time that converted to cash, split by practice area. Each bar represents all matters in that practice area aggregated.' },
                { label: 'Formula', body: 'SUM(amount_collected) ÷ SUM(worked_value) × 100\nper practice area', mono: true },
                { label: 'How to read it', body: '85%+ healthy · 75-85% watch · below 75% flagged red. Wide disparity across practice areas usually signals a pricing or billing-discipline issue in the low performers, not a fundamental profitability difference.' },
                { label: 'What drives it down', body: '(1) Fixed-fee scope creep — Corporate/M&A is a classic offender · (2) junior fee-earner time that doesn\'t bill at full rate · (3) aged receivables on complex matters · (4) last-minute billing write-downs to preserve client relationships.' },
                { label: 'Next step', body: 'Click into Financial Deep Dive to see whether the leak on a weak practice area is at the billing stage or the collection stage — the fix is different.' },
              ]}
              nextStep={{ label: 'Open Financial Deep Dive', to: '/financial' }}
            />
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={realisation.map(r => ({ ...r, overall_realisation: clampPct(r.overall_realisation) }))} margin={{top:5,right:10,left:10,bottom:5}}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E2D4A" />
              <XAxis dataKey="practice_area" tick={{fill:'#8899B4',fontSize:11}} angle={-15} textAnchor="end" height={60} />
              <YAxis tick={{fill:'#8899B4',fontSize:11}} domain={[0,100]} unit="%" />
              <RTooltip contentStyle={{background:'#111B2E',border:'1px solid #1E2D4A',borderRadius:8,color:'#E8ECF4',fontSize:13}} />
              <Bar dataKey="overall_realisation" name="Realisation %" radius={[4,4,0,0]}>
                {realisation.map((entry, i) => (
                  <Cell key={i} fill={realisationFillHex(clampPct(entry.overall_realisation))} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue Trend */}
        <div className="chart-card">
          <div className="card-title">
            Monthly Revenue Trend
            <InfoTooltip
              title="Monthly Revenue Trend"
              sections={[
                { label: 'What it shows', body: 'Three monthly totals side-by-side: invoices sent (Billed), cash received (Collected), and revenue lost to write-offs. Each point aggregates everything dated in that month.' },
                { label: 'Formula', body: 'SUM(net_billed), SUM(amount_collected), SUM(write_off)\nGROUP BY invoice month', mono: true },
                { label: 'How to read it', body: 'The gap between the blue (Billed) and green (Collected) lines is working capital tied up in receivables and collection delay. The red dashed line is the firm\'s floor — revenue the firm earned and gave up on.' },
                { label: 'What to watch for', body: 'Collected trending below Billed is normal (invoice-to-cash lag). Collected falling whilst Billed rises is a collections problem. Write-offs spiking suggests billing disputes or matter-close-outs clearing old invoices.' },
              ]}
            />
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={revenueTrend} margin={{top:5,right:10,left:10,bottom:5}}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E2D4A" />
              <XAxis dataKey="month" tick={{fill:'#8899B4',fontSize:11}} />
              <YAxis tick={{fill:'#8899B4',fontSize:11}} tickFormatter={v => `£${(v/1000).toFixed(0)}K`} />
              <RTooltip contentStyle={{background:'#111B2E',border:'1px solid #1E2D4A',borderRadius:8,color:'#E8ECF4',fontSize:13}} formatter={v => fmt(v)} />
              <Legend wrapperStyle={{fontSize:12,color:'#8899B4'}} />
              <Line type="monotone" dataKey="billed" name="Billed" stroke="#3B82F6" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="collected" name="Collected" stroke="#10B981" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="write_offs" name="Write-offs" stroke="#EF4444" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="chart-grid">
        {/* Top Wallet Gaps */}
        <div className="chart-card">
          <div className="card-title">
            Top 10 Clients by Wallet Gap
            <InfoTooltip
              title="Top 10 Clients by Wallet Gap"
              sections={[
                { label: 'What it shows', body: 'The absolute £ opportunity per client — how much more legal spend the client makes with OTHER firms today. Ranked largest gap first.' },
                { label: 'Formula', body: 'Estimated Total Legal Spend − Our Revenue\nper client', mono: true },
                { label: 'How to read it', body: 'A large bar means there\'s a lot of work going to competitors. Prioritise these for relationship partner attention — defending the revenue you have is easier than winning new logos.' },
                { label: 'Caveat', body: 'The "Estimated Total Legal Spend" figure comes from the wallet_estimates table (partner intelligence, public filings, directories). Each estimate has a confidence level — check it in Client Intelligence before committing strategy to a number.' },
              ]}
              nextStep={{ label: 'See full wallet analysis with confidence levels', to: '/clients' }}
            />
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={walletGaps.slice(0,10)} layout="vertical" margin={{top:5,right:20,left:10,bottom:5}}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E2D4A" />
              <XAxis type="number" tick={{fill:'#8899B4',fontSize:11}} tickFormatter={v => fmt(v)} />
              <YAxis type="category" dataKey="client_name" tick={{fill:'#8899B4',fontSize:11}} width={140} />
              <RTooltip contentStyle={{background:'#111B2E',border:'1px solid #1E2D4A',borderRadius:8,color:'#E8ECF4',fontSize:13}} formatter={v => fmt(v)} />
              <Bar dataKey="wallet_gap" name="Wallet Gap" fill="#10B981" radius={[0,4,4,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Client Health Distribution */}
        <div className="chart-card">
          <div className="card-title">
            Client Health Distribution
            <InfoTooltip
              title="Client Health Distribution"
              sections={[
                { label: 'What it shows', body: 'Every active client bucketed into Healthy, Watch, or At Risk based on a composite 0-100 score. Percentages and counts shown alongside.' },
                { label: 'Scoring model', body: 'Start at 50, then adjust for: (1) our revenue level · (2) matter diversity across practice areas · (3) relationship breadth across partners · (4) engagement recency · (5) payment behaviour. Clamped to [0, 100].', mono: false },
                { label: 'Bands', body: 'Healthy ≥ 70 · Watch 50-69 · At Risk < 50' },
                { label: 'Why it matters', body: 'Revenue decline is a lagging indicator — by the time a client\'s revenue has fallen, the relationship problem is months old. Matter diversity and partner breadth thinning are the leading signals. This score is designed to flag those movements before they hit the P&L.' },
              ]}
              nextStep={{ label: 'See individual client scores and drivers', to: '/clients' }}
            />
          </div>
          <div style={{display:'flex',alignItems:'center',gap:24}}>
            <ResponsiveContainer width="50%" height={200}>
              <PieChart>
                <Pie data={healthPie} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                  {healthPie.map((entry, i) => (
                    <Cell key={i} fill={healthColors[entry.name]} />
                  ))}
                </Pie>
                <RTooltip contentStyle={{background:'#111B2E',border:'1px solid #1E2D4A',borderRadius:8,color:'#E8ECF4',fontSize:13}} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{flex:1}}>
              {healthPie.map((h,i) => (
                <div key={i} style={{display:'flex',alignItems:'center',gap:10,marginBottom:12}}>
                  <div style={{width:12,height:12,borderRadius:3,background:healthColors[h.name]}}></div>
                  <span style={{color:'var(--text-secondary)',fontSize:'0.88rem',flex:1}}>{h.name}</span>
                  <span style={{fontWeight:600,color:'var(--text-primary)',fontFamily:'var(--font-mono)'}}>{h.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Budget Overruns Table */}
      <div className="card" style={{marginTop:4}}>
        <div className="card-header">
          <div className="card-title">
            <AlertTriangle size={16} style={{color:'var(--accent-amber)'}} />
            Active Budget Overruns
            <InfoTooltip
              title="Active Budget Overruns"
              sections={[
                { label: 'What it shows', body: 'Open matters where the budget is being consumed faster than the work is progressing. Each row is a live matter where the trajectory, if unchanged, lands it over budget before completion.' },
                { label: 'Formula', body: 'Variance = budget_consumed_% − work_complete_%\nFlag when Variance > 15pp', mono: true },
                { label: 'Severity bands', body: 'Warning: variance > 15pp · Critical: variance > 25pp. A 25pp gap means the matter is one-quarter more burned than it has deliverables to show for it — hard to recover without scope conversation or write-down.' },
                { label: 'What to do', body: 'Critical matters typically need a same-week call with the responsible partner: either re-scope with the client, agree a fee adjustment, or accept the write-down early before the number grows. Do not wait for matter close to deal with these.' },
              ]}
            />
          </div>
          <span className="badge badge-amber">{budgetOverrunsTotal} flagged firm-wide</span>
        </div>
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Matter</th>
                <th>Practice Area</th>
                <th>Partner</th>
                <th>Budget Consumed</th>
                <th>Work Complete</th>
                <th>Variance</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {budgetOverruns.slice(0,10).map((b, i) => {
                const variance = b.cumulative_budget_consumed_pct - (b.estimated_completion_pct || 0);
                return (
                  <tr key={i}>
                    <td className="highlight" style={{maxWidth:220,overflow:'hidden',textOverflow:'ellipsis'}}>{b.matter_name}</td>
                    <td>{b.practice_area}</td>
                    <td>{b.responsible_partner}</td>
                    <td className="num">{b.cumulative_budget_consumed_pct?.toFixed(1)}%</td>
                    <td className="num">{b.estimated_completion_pct?.toFixed(1)}%</td>
                    <td className="num" style={{color: variance > 25 ? 'var(--accent-red)' : 'var(--accent-amber)'}}>+{variance.toFixed(1)}pp</td>
                    <td>
                      <span className={`badge ${variance > 25 ? 'badge-red' : 'badge-amber'}`}>
                        {variance > 25 ? 'Critical' : 'Warning'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {budgetOverrunsTotal > Math.min(10, budgetOverruns.length) && (
            <div style={{padding:'10px 4px 0',fontSize:'0.75rem',color:'var(--text-muted)',textAlign:'right'}}>
              Showing top {Math.min(10, budgetOverruns.length)} of {budgetOverrunsTotal} overrunning matters
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
