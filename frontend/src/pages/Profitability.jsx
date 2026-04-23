import React, { useState, useEffect } from 'react';
import api from '../api';
import InfoTooltip from '../components/InfoTooltip';
import {
  fmt, realisationColor, realisationFillHex,
  billingRealisationColor, collectionRealisationColor, clampPct,
} from '../utils/format';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip,
  ResponsiveContainer, Cell, Legend, PieChart, Pie
} from 'recharts';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

export default function Profitability() {
  const [writeOffs, setWriteOffs] = useState(null);
  const [feePerf, setFeePerf] = useState([]);
  const [realisation, setRealisation] = useState([]);
  const [tab, setTab] = useState('writeoffs');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/analytics/write-off-analysis'),
      api.get('/analytics/fee-arrangement-performance'),
      api.get('/analytics/realisation-by-practice'),
    ]).then(([wo, fp, re]) => {
      setWriteOffs(wo.data);
      setFeePerf(fp.data);
      setRealisation(re.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="empty-state"><div className="loading-spinner" style={{margin:'0 auto'}}></div></div>;

  // Empty state — user has deleted demo data and loaded none of their own
  const hasData = (realisation && realisation.length > 0) || (feePerf && feePerf.length > 0) || (writeOffs && (writeOffs.byPartner?.length || writeOffs.byPractice?.length));
  if (!hasData) {
    return (
      <div>
        <div className="page-header">
          <div>
            <h2>Time & Profitability Intelligence</h2>
            <p>Analyse realisation, write-offs, budget adherence, and fee arrangement performance across the firm.</p>
          </div>
        </div>
        <div className="empty-state" style={{padding:'60px 24px',textAlign:'center'}}>
          <h3 style={{marginBottom:8}}>No profitability data yet</h3>
          <p style={{color:'var(--text-muted)',maxWidth:480,margin:'0 auto'}}>
            Load the Whitfield & Partners demo from the Data Management page, or upload your own
            time entries and billing invoices, to populate this view.
          </p>
        </div>
      </div>
    );
  }

  // Aggregate fee performance by type
  const feeByType = {};
  feePerf.forEach(f => {
    if (!feeByType[f.fee_arrangement]) feeByType[f.fee_arrangement] = { type: f.fee_arrangement, worked: 0, collected: 0, write_offs: 0, count: 0 };
    feeByType[f.fee_arrangement].worked += f.worked_value;
    feeByType[f.fee_arrangement].collected += f.collected;
    feeByType[f.fee_arrangement].write_offs += f.write_offs;
    feeByType[f.fee_arrangement].count += f.matter_count;
  });
  const feeAgg = Object.values(feeByType).map(f => {
    const raw = f.worked > 0 ? Math.round((f.collected / f.worked) * 10000) / 100 : 0;
    const rawWO = f.worked > 0 ? Math.round((f.write_offs / f.worked) * 10000) / 100 : 0;
    return { ...f, realisation: clampPct(raw), write_off_rate: clampPct(rawWO) };
  });
  const realisationSafe = realisation.map(r => ({
    ...r,
    billing_realisation: clampPct(r.billing_realisation),
    collection_realisation: clampPct(r.collection_realisation),
    overall_realisation: clampPct(r.overall_realisation),
  }));

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Time & Profitability Intelligence</h2>
          <p>Analyse realisation, write-offs, budget adherence, and fee arrangement performance across the firm.</p>
        </div>
      </div>

      <div className="tabs">
        <button className={`tab ${tab === 'writeoffs' ? 'active' : ''}`} onClick={() => setTab('writeoffs')}>Write-Off Analysis</button>
        <button className={`tab ${tab === 'fees' ? 'active' : ''}`} onClick={() => setTab('fees')}>Fee Arrangements</button>
        <button className={`tab ${tab === 'realisation' ? 'active' : ''}`} onClick={() => setTab('realisation')}>Realisation Deep Dive</button>
      </div>

      {tab === 'writeoffs' && writeOffs && (
        <div>
          <div className="chart-grid">
            <div className="chart-card">
              <div className="card-title">
                Write-Offs by Responsible Partner
                <InfoTooltip
                  title="Write-Offs by Responsible Partner"
                  sections={[
                    { label: 'What it shows', body: 'Total £ written off on invoices, attributed to the partner responsible for the originating matter. Top 8 partners by write-off volume.' },
                    { label: 'Formula', body: 'SUM(write_off)\nFROM billing_invoices\nGROUP BY matter.responsible_partner', mono: true },
                    { label: 'How to read it', body: 'Concentration is the signal, not the total. A partner running at 3× the firm average almost always has a fixable systemic issue — pricing, scope discipline, billing cadence, or juniors working unrecorded. Evenly distributed write-offs are usually strategic client calls.' },
                    { label: 'Action frame', body: 'Before a difficult conversation: check the partner\'s practice area and fee-arrangement mix. A fixed-fee Corporate practice partner with high write-offs is a pricing problem. An hourly Employment partner with high write-offs is a billing or collections problem. Different fixes.' },
                  ]}
                />
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={writeOffs.byPartner.slice(0,8)} margin={{top:5,right:10,left:10,bottom:5}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E2D4A" />
                  <XAxis dataKey="label" tick={{fill:'#8899B4',fontSize:10}} angle={-20} textAnchor="end" height={80} />
                  <YAxis tick={{fill:'#8899B4',fontSize:11}} tickFormatter={v => fmt(v)} />
                  <RTooltip contentStyle={{background:'#111B2E',border:'1px solid #1E2D4A',borderRadius:8,color:'#E8ECF4',fontSize:13}} formatter={v => fmt(v)} />
                  <Bar dataKey="total_writeoff" name="Write-off Amount" fill="#EF4444" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="chart-card">
              <div className="card-title">
                Write-Offs by Practice Area
                <InfoTooltip
                  title="Write-Offs by Practice Area"
                  sections={[
                    { label: 'What it shows', body: 'Write-off totals aggregated by practice area, ranked largest first.' },
                    { label: 'Formula', body: 'SUM(write_off)\nFROM billing_invoices\nGROUP BY matter.practice_area', mono: true },
                    { label: 'How to read it', body: 'Elevated write-offs in one practice area versus others usually trace back to (a) the pricing model used in that area (fixed-fee practices leak more), (b) a specific partner driving most of the number, or (c) client-segment patterns (some industries negotiate harder at payment time).' },
                    { label: 'Cross-check', body: 'Compare this with realisation rates by the same practice area (Realisation Deep Dive tab). If a practice has high write-offs AND low realisation, the leak is confirmed structural. If write-offs are high but realisation holds up, it may be one bad client, not a practice problem.' },
                  ]}
                />
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={writeOffs.byPractice} margin={{top:5,right:10,left:10,bottom:5}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E2D4A" />
                  <XAxis dataKey="label" tick={{fill:'#8899B4',fontSize:10}} angle={-15} textAnchor="end" height={70} />
                  <YAxis tick={{fill:'#8899B4',fontSize:11}} tickFormatter={v => fmt(v)} />
                  <RTooltip contentStyle={{background:'#111B2E',border:'1px solid #1E2D4A',borderRadius:8,color:'#E8ECF4',fontSize:13}} formatter={v => fmt(v)} />
                  <Bar dataKey="total_writeoff" name="Write-off Amount" fill="#F59E0B" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="chart-card" style={{marginTop:20}}>
            <div className="card-title">
              Write-Offs by Fee Arrangement Type
              <InfoTooltip
                title="Write-Offs by Fee Arrangement Type"
                sections={[
                  { label: 'What it shows', body: 'Write-off volumes split by fee structure — Hourly, Fixed Fee, Capped Fee, Blended Rate, Contingent, etc.' },
                  { label: 'Formula', body: 'SUM(write_off)\nGROUP BY matter.fee_arrangement', mono: true },
                  { label: 'The fixed-fee trap', body: 'Fixed-fee and capped-fee matters consistently show the highest write-offs. The mechanism: work continues beyond the agreed fee, but the firm cannot bill more — so the worked time either goes unrecorded (hidden) or gets billed and then written off (visible here).' },
                  { label: 'How to use it', body: 'A fee-type with a disproportionate share of write-offs is either mispriced at quote stage or over-run at delivery stage. The fix is typically pricing discipline (scope change triggers) rather than billing discipline.' },
                ]}
              />
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={writeOffs.byFeeType} margin={{top:5,right:10,left:10,bottom:5}}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E2D4A" />
                <XAxis dataKey="label" tick={{fill:'#8899B4',fontSize:11}} />
                <YAxis tick={{fill:'#8899B4',fontSize:11}} tickFormatter={v => fmt(v)} />
                <RTooltip contentStyle={{background:'#111B2E',border:'1px solid #1E2D4A',borderRadius:8,color:'#E8ECF4',fontSize:13}} formatter={v => fmt(v)} />
                <Bar dataKey="total_writeoff" name="Write-off Amount" fill="#8B5CF6" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {tab === 'fees' && (
        <div>
          <div className="card mb-6">
            <div className="card-title" style={{marginBottom:16}}>
              Fee Arrangement Performance Comparison
              <InfoTooltip
                title="Fee Arrangement Performance Comparison"
                sections={[
                  { label: 'What it shows', body: 'Side-by-side economic performance of each fee structure: how many matters, how much work went in, how much cash came out, how much was written off, realisation rate, and write-off rate.' },
                  { label: 'Formulas', body: 'Realisation = Collected ÷ Worked × 100\nWrite-off rate = Write-offs ÷ Worked × 100', mono: true },
                  { label: 'Typical pattern', body: 'Hourly: highest realisation, lowest write-off rate — the firm captures what it works. Fixed Fee: lower realisation, higher write-offs — pricing risk sits with the firm. Blended Rate: often the best real-world compromise.' },
                  { label: 'Decision frame', body: 'If fixed-fee realisation is materially below hourly, the firm is subsidising those clients. Either reprice (raise the fixed number), re-scope (narrow what\'s included), or move them to capped structures where overruns above a ceiling convert back to hourly billing.' },
                ]}
              />
            </div>
            <div className="data-table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Fee Type</th>
                    <th>Matters</th>
                    <th>Worked Value</th>
                    <th>Collected</th>
                    <th>Write-Offs</th>
                    <th>Realisation</th>
                    <th>Write-Off Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {feeAgg.map((f, i) => (
                    <tr key={i}>
                      <td className="highlight">{f.type}</td>
                      <td className="num">{f.count}</td>
                      <td className="num">{fmt(f.worked)}</td>
                      <td className="num">{fmt(f.collected)}</td>
                      <td className="num text-red">{fmt(f.write_offs)}</td>
                      <td className="num">
                        <span style={{color: realisationColor(f.realisation)}}>
                          {f.realisation}%
                        </span>
                      </td>
                      <td className="num text-amber">{f.write_off_rate}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="chart-card">
            <div className="card-title">
              Realisation by Fee Type
              <InfoTooltip
                title="Realisation by Fee Type"
                sections={[
                  { label: 'What it shows', body: 'Overall realisation rate (Collected ÷ Worked × 100) plotted for each fee arrangement. Red bars indicate below-75% performance.' },
                  { label: 'How to read it', body: 'A flat bar chart across fee types means the firm prices different structures consistently. A steep slope means some structures are materially more profitable than others — and the firm should either shift the mix or re-price the laggards.' },
                  { label: 'Benchmark', body: '≥ 85% healthy · 75-85% watch · below 75% flagged red. For fixed-fee work specifically, anything above 80% is strong.' },
                ]}
              />
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={feeAgg} margin={{top:5,right:10,left:10,bottom:5}}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E2D4A" />
                <XAxis dataKey="type" tick={{fill:'#8899B4',fontSize:11}} />
                <YAxis tick={{fill:'#8899B4',fontSize:11}} domain={[0,100]} unit="%" />
                <RTooltip contentStyle={{background:'#111B2E',border:'1px solid #1E2D4A',borderRadius:8,color:'#E8ECF4',fontSize:13}} />
                <Bar dataKey="realisation" name="Realisation %" radius={[4,4,0,0]}>
                  {feeAgg.map((e,i) => (
                    <Cell key={i} fill={realisationFillHex(e.realisation)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {tab === 'realisation' && (
        <div>
          <div className="card">
            <div className="card-title" style={{marginBottom:16}}>
              Detailed Realisation Breakdown by Practice Area
              <InfoTooltip
                title="Three-Stage Realisation Deep Dive"
                sections={[
                  { label: 'What it shows', body: 'Realisation broken into its two component stages per practice area, so you can see exactly where the leak is.' },
                  { label: 'The three stages', body: 'Billing Realisation = Billed ÷ Worked × 100. Tells you how much of the recorded time actually got onto an invoice (the rest was written DOWN before billing).\n\nCollection Realisation = Collected ÷ Billed × 100. Tells you how much of the invoice got paid (the rest was written OFF after billing, or is still outstanding).\n\nOverall = Collected ÷ Worked × 100. The product of the two — the end-to-end cash-conversion number.' },
                  { label: 'How to diagnose', body: 'Low Billing Realisation + high Collection Realisation = pricing / scope / billing-discipline problem. The firm isn\'t invoicing for work it did.\n\nHigh Billing Realisation + low Collection Realisation = client / receivables problem. The firm is billing fine but collecting poorly.\n\nBoth low = structural issue with that practice or partner group — needs leadership attention.' },
                  { label: 'Thresholds', body: 'Billing R.: 90%+ healthy, below 85% investigate\nCollection R.: 92%+ healthy, below 88% investigate\nOverall: 85%+ healthy, below 75% critical' },
                ]}
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
                    <th>Billing Realisation</th>
                    <th>Collection Realisation</th>
                    <th>Overall Realisation</th>
                  </tr>
                </thead>
                <tbody>
                  {realisationSafe.map((r, i) => (
                    <tr key={i}>
                      <td className="highlight">{r.practice_area}</td>
                      <td className="num">{fmt(r.worked_value)}</td>
                      <td className="num">{fmt(r.billed)}</td>
                      <td className="num">{fmt(r.collected)}</td>
                      <td className="num" style={{color: billingRealisationColor(r.billing_realisation)}}>{r.billing_realisation}%</td>
                      <td className="num" style={{color: collectionRealisationColor(r.collection_realisation)}}>{r.collection_realisation}%</td>
                      <td className="num" style={{color: realisationColor(r.overall_realisation), fontWeight:600}}>
                        {r.overall_realisation}%
                      </td>
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
