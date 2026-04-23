import React, { useState, useEffect } from 'react';
import api from '../api';
import InfoTooltip from '../components/InfoTooltip';
import { fmt } from '../utils/format';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip,
  ResponsiveContainer, Cell
} from 'recharts';
import { Target, AlertTriangle, TrendingUp } from 'lucide-react';

export default function ClientIntelligence() {
  const [walletGaps, setWalletGaps] = useState([]);
  const [crossSell, setCrossSell] = useState([]);
  const [clientHealth, setClientHealth] = useState([]);
  const [signals, setSignals] = useState([]);
  const [tab, setTab] = useState('wallet');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/analytics/wallet-gaps'),
      api.get('/analytics/cross-sell'),
      api.get('/analytics/client-health'),
      api.get('/data/tables/market_signals?limit=20'),
    ]).then(([wg, cs, ch, sg]) => {
      setWalletGaps(wg.data);
      setCrossSell(cs.data);
      setClientHealth(ch.data);
      setSignals(sg.data.rows || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="empty-state"><div className="loading-spinner" style={{margin:'0 auto'}}></div></div>;

  // Empty state — no data at all across the four tabs
  const hasData = (walletGaps?.length || 0) + (crossSell?.length || 0) + (clientHealth?.length || 0) + (signals?.length || 0) > 0;
  if (!hasData) {
    return (
      <div>
        <div className="page-header">
          <div>
            <h2>Client Intelligence</h2>
            <p>Wallet analysis, cross-sell opportunities, client health scoring, and competitive signals.</p>
          </div>
        </div>
        <div className="empty-state" style={{padding:'60px 24px',textAlign:'center'}}>
          <h3 style={{marginBottom:8}}>No client intelligence data yet</h3>
          <p style={{color:'var(--text-muted)',maxWidth:480,margin:'0 auto'}}>
            This page needs clients, wallet estimates, practice coverage and market signals to be populated.
            Load the demo dataset from the Data Management page, or add market intelligence manually.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Client Intelligence</h2>
          <p>Wallet analysis, cross-sell opportunities, client health scoring, and competitive signals.</p>
        </div>
      </div>

      <div className="tabs">
        <button className={`tab ${tab === 'wallet' ? 'active' : ''}`} onClick={() => setTab('wallet')}>Share of Wallet</button>
        <button className={`tab ${tab === 'crosssell' ? 'active' : ''}`} onClick={() => setTab('crosssell')}>Cross-Sell Gaps</button>
        <button className={`tab ${tab === 'health' ? 'active' : ''}`} onClick={() => setTab('health')}>Client Health</button>
        <button className={`tab ${tab === 'signals' ? 'active' : ''}`} onClick={() => setTab('signals')}>Market Signals</button>
      </div>

      {tab === 'wallet' && (
        <div>
          <div className="metric-grid" style={{marginBottom:24}}>
            <div className="metric-card green">
              <div className="metric-label">
                Total Wallet Opportunity
                <InfoTooltip
                  title="Total Wallet Opportunity"
                  sections={[
                    { label: 'What it shows', body: 'The total £ of estimated legal spend by our clients that today goes to OTHER firms. If every client gave us 100% of their legal work, this is roughly how much more revenue would land in the bank.' },
                    { label: 'Formula', body: 'Σ (estimated_total_legal_spend − our_revenue)\nacross all tracked clients', mono: true },
                    { label: 'How to read it', body: 'This is a ceiling, not a target. Realistic capture is a fraction — winning 10-20% of the gap from your top 20 clients is typically a multi-year growth programme.' },
                    { label: 'Caveat', body: 'Quality of this number depends on the quality of wallet estimates. See the Client Wallet Analysis table below — each estimate has a confidence level. Weight strategy toward the High-confidence estimates.' },
                  ]}
                />
              </div>
              <div className="metric-value">{fmt(walletGaps.reduce((s, g) => s + (g.wallet_gap || 0), 0))}</div>
              <div className="metric-sub">across {walletGaps.length} clients</div>
            </div>
            <div className="metric-card blue">
              <div className="metric-label">
                Average Share of Wallet
                <InfoTooltip
                  title="Average Share of Wallet"
                  sections={[
                    { label: 'What it shows', body: 'The mean percentage of each client\'s total legal spend that the firm captures — averaged across all clients with wallet estimates.' },
                    { label: 'Formula', body: 'Average of (our_revenue ÷ estimated_total_legal_spend × 100)\nacross all tracked clients', mono: true },
                    { label: 'Benchmarks', body: 'Panel firms typically achieve 20-40% share. Sole-provider relationships can reach 70%+. Below 10% on a large client usually means the firm is a secondary or spot provider, not a relationship firm.' },
                    { label: 'Where to act', body: 'A low average with some very high per-client outliers suggests the firm has a few deep relationships and many shallow ones. Growth is easier on the deep ones (defend and expand) than the shallow ones (displace an incumbent).' },
                  ]}
                />
              </div>
              <div className="metric-value">
                {(walletGaps.reduce((s,g) => s + (g.share_of_wallet_pct || 0), 0) / Math.max(walletGaps.length, 1)).toFixed(1)}%
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-title" style={{marginBottom:16}}>
              Client Wallet Analysis
              <InfoTooltip
                title="Client Wallet Analysis"
                sections={[
                  { label: 'What it shows', body: 'Per-client breakdown of estimated total legal spend, what the firm captures, the resulting share % and absolute £ gap, plus confidence in the wallet estimate itself.' },
                  { label: 'Key formulas', body: 'Share of Wallet = Our Revenue ÷ Estimated Total Spend × 100\nWallet Gap = Estimated Total Spend − Our Revenue', mono: true },
                  { label: 'Share colour code', body: '< 10% red: likely secondary provider\n10-25% amber: panel position, growable\n≥ 25% green: primary relationship' },
                  { label: 'How to prioritise', body: 'Rank by absolute gap (£) for opportunity size. Rank by share % for competitive risk (low-share clients can churn easily). Combine: a large client with a small share AND moderate confidence is a defend-or-grow decision point.' },
                  { label: 'Confidence', body: 'High = derived from public data or direct client intelligence. Medium = partner estimate triangulated against industry benchmarks. Low = inferred from size + industry alone. Low-confidence estimates should inform hypotheses, not commitments.' },
                ]}
              />
            </div>
            <div className="data-table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Client</th>
                    <th>Industry</th>
                    <th>Estimated Total Spend</th>
                    <th>Our Revenue</th>
                    <th>Share of Wallet</th>
                    <th>Wallet Gap</th>
                    <th>Confidence</th>
                  </tr>
                </thead>
                <tbody>
                  {walletGaps.map((w, i) => (
                    <tr key={i}>
                      <td className="highlight">{w.client_name}</td>
                      <td>{w.industry}</td>
                      <td className="num">{fmt(w.estimated_total_legal_spend)}</td>
                      <td className="num">{fmt(w.our_revenue)}</td>
                      <td className="num">
                        <span style={{color: w.share_of_wallet_pct < 10 ? 'var(--accent-red)' : w.share_of_wallet_pct < 25 ? 'var(--accent-amber)' : 'var(--accent-green)'}}>
                          {w.share_of_wallet_pct?.toFixed(1)}%
                        </span>
                      </td>
                      <td className="num" style={{color:'var(--accent-green)',fontWeight:600}}>{fmt(w.wallet_gap)}</td>
                      <td><span className={`badge ${w.confidence === 'High' ? 'badge-green' : w.confidence === 'Medium' ? 'badge-amber' : 'badge-red'}`}>{w.confidence}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {tab === 'crosssell' && (
        <div>
          <div className="card mb-6">
            <div className="card-title" style={{marginBottom:8}}>
              <Target size={16} style={{color:'var(--accent-purple)'}} />
              Cross-Sell Opportunities
              <InfoTooltip
                title="Cross-Sell Opportunities"
                sections={[
                  { label: 'What it shows', body: 'For each existing client, practice areas where they likely spend on legal work — BUT the firm doesn\'t currently serve them. Each row is a concrete cross-sell prospect with a £ estimate and (where known) the competitor currently winning that work.' },
                  { label: 'Where the data comes from', body: 'The practice_coverage table. For each client, every practice area is flagged as served (served_by_us=1) or not (served_by_us=0). Cross-sell = rows where we are not served but estimated spend is material.' },
                  { label: 'How to read it', body: 'An existing-client cross-sell is the highest-probability revenue the firm can win — the relationship is already there, the credentials are verifiable, the procurement hurdle is lower than new-logo pursuit.' },
                  { label: 'Action', body: 'Filter by relationship partner (offline), pair the cross-sell prospect with the nearest warm partner in that practice area, and introduce. The "Known Competitor" column tells you what you\'re displacing — useful to know in the conversation.' },
                ]}
              />
            </div>
            <p style={{color:'var(--text-muted)',fontSize:'0.82rem',marginBottom:16}}>
              Practice areas we don't serve but clients likely need — ranked by estimated spend.
            </p>
            <div className="data-table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Client</th>
                    <th>Industry</th>
                    <th>Unserved Practice Area</th>
                    <th>Estimated Spend</th>
                    <th>Known Competitor</th>
                    <th>Source</th>
                  </tr>
                </thead>
                <tbody>
                  {crossSell.map((c, i) => (
                    <tr key={i}>
                      <td className="highlight">{c.client_name}</td>
                      <td>{c.industry}</td>
                      <td style={{color:'var(--accent-purple)'}}>{c.practice_area}</td>
                      <td className="num" style={{color:'var(--accent-green)',fontWeight:600}}>{fmt(c.estimated_client_spend)}</td>
                      <td style={{color:'var(--accent-red)'}}>{c.known_competitor || '—'}</td>
                      <td className="text-muted">{c.source}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {tab === 'health' && (
        <div>
          <div className="card">
            <div className="card-title" style={{marginBottom:8}}>
              Client Health Scores
              <InfoTooltip
                title="Client Health Scores"
                sections={[
                  { label: 'What it shows', body: 'A composite 0-100 score per active client, with the raw revenue and wallet context that fed into it, plus a Healthy/Watch/At-Risk band.' },
                  { label: 'Scoring model', body: 'Start at 50. Adjust by:\n• Our Revenue level: ±10-20 points\n• Matter diversity (practice areas): ±10-20 points\n• Relationship breadth (partners engaged): ±5-15 points\n• Recency and payment behaviour (when tracked)\nClamped to [0, 100].' },
                  { label: 'Bands', body: 'Healthy ≥ 70: relationship is deep and diversified\nWatch 50-69: narrowing or slowing, worth a check-in\nAt Risk < 50: likely single-partner, single-practice, or trending down — churn candidate' },
                  { label: 'Why it beats revenue tracking', body: 'Revenue trending down is a LAGGING indicator — by the time it shows, the relationship has been weakening for 6-12 months. Matter diversity thinning and partner count dropping are LEADING indicators. This score weights the leading signals.' },
                  { label: 'Action', body: 'For At-Risk top-revenue clients: partner outreach within the week. For Watch clients with large wallet gaps: this is a growth defence call, not just relationship maintenance.' },
                ]}
              />
            </div>
            <p style={{color:'var(--text-muted)',fontSize:'0.82rem',marginBottom:16}}>
              Healthy (≥70) · Watch (50-69) · At Risk (&lt;50)
            </p>
            <div className="data-table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Client</th>
                    <th>Industry</th>
                    <th>Our Revenue</th>
                    <th>Est. Total Spend</th>
                    <th>Share of Wallet</th>
                    <th>Health Score</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {clientHealth.map((c, i) => (
                    <tr key={i}>
                      <td className="highlight">{c.name}</td>
                      <td>{c.industry}</td>
                      <td className="num">{c.our_revenue ? fmt(c.our_revenue) : '—'}</td>
                      <td className="num">{c.estimated_spend ? fmt(c.estimated_spend) : '—'}</td>
                      <td className="num">{c.share_of_wallet ? `${c.share_of_wallet.toFixed(1)}%` : '—'}</td>
                      <td className="num" style={{fontWeight:600}}>
                        <span style={{
                          color: c.health_score >= 70 ? 'var(--accent-green)' : c.health_score >= 50 ? 'var(--accent-amber)' : 'var(--accent-red)'
                        }}>{c.health_score}</span>
                      </td>
                      <td>
                        <span className={`badge ${c.status === 'Healthy' ? 'badge-green' : c.status === 'Watch' ? 'badge-amber' : 'badge-red'}`}>
                          {c.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {tab === 'signals' && (
        <div>
          <div className="card">
            <div className="card-title" style={{marginBottom:8}}>
              <AlertTriangle size={16} style={{color:'var(--accent-amber)'}} />
              Competitive Market Signals
              <InfoTooltip
                title="Competitive Market Signals"
                sections={[
                  { label: 'What it shows', body: 'Time-stamped external events that indicate competitor movements affecting your clients. Captured either manually by partners or via monitoring feeds, then tagged with signal type, competitor, severity, and source.' },
                  { label: 'Signal types', body: 'Directory Ranking (Legal 500, Chambers) · Panel Appointment (a client added a firm to its panel) · Lateral Partner Hire (a competitor hired a partner with your client\'s industry focus) · News Mention · Award · Client Announcement' },
                  { label: 'Severity guide', body: 'High: directly threatens a current engagement or key account relationship\nMedium: changes competitive positioning in a practice area we operate in\nLow: background market movement worth awareness' },
                  { label: 'How to use it', body: 'A High-severity signal on a client with a large wallet gap and a declining health score is a red alert — the competitor is moving and the relationship is already weakening. That combination warrants an immediate partner-level conversation.' },
                  { label: 'Data source', body: 'Market signals are typically partner-submitted or scraped from public directories. Keep the source column populated — it drives credibility for anyone acting on the signal later.' },
                ]}
              />
            </div>
            <p style={{color:'var(--text-muted)',fontSize:'0.82rem',marginBottom:16}}>
              Monitor competitor movements, rankings, and market shifts affecting your clients.
            </p>
            <div className="data-table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Description</th>
                    <th>Competitor</th>
                    <th>Severity</th>
                    <th>Source</th>
                  </tr>
                </thead>
                <tbody>
                  {signals.map((s, i) => (
                    <tr key={i}>
                      <td style={{whiteSpace:'nowrap'}}>{s.signal_date}</td>
                      <td><span className="badge badge-blue">{s.signal_type}</span></td>
                      <td style={{maxWidth:300,whiteSpace:'normal',lineHeight:1.4}}>{s.content}</td>
                      <td style={{color:'var(--accent-red)'}}>{s.competitor || '—'}</td>
                      <td>
                        <span className={`badge ${s.severity === 'High' ? 'badge-red' : s.severity === 'Medium' ? 'badge-amber' : 'badge-green'}`}>
                          {s.severity}
                        </span>
                      </td>
                      <td className="text-muted">{s.source}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
