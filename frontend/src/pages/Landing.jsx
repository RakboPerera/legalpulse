import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { fmt } from '../utils/format';
import {
  TrendingUp, Target, ShieldAlert, Users,
  MessageSquare, Database, BarChart3, ArrowRight,
  Zap, Eye, Brain, FileSpreadsheet, PieChart, AlertTriangle,
  Sparkles, Bot, Layers, Heart, FileText,
  Cpu, LayoutGrid, Clock, CheckCircle2, MousePointer2, Gauge
} from 'lucide-react';

// Single card in the Complete Capability Map — shows an in-brief/enhancement badge,
// icon, title, description, and a deep-link to where the feature lives.
function CapabilityCard({ scope, icon, color, title, desc, where, to, navigate }) {
  const isBrief = scope === 'brief';
  const badgeColor = isBrief ? 'var(--accent-green)' : 'var(--accent-purple)';
  const badgeBg = isBrief ? 'rgba(16,185,129,0.12)' : 'rgba(139,92,246,0.12)';
  const badgeText = isBrief ? 'In Brief' : 'Enhancement';
  const BadgeIcon = isBrief ? CheckCircle2 : Sparkles;
  return (
    <div className="feature-card" style={{position:'relative',display:'flex',flexDirection:'column'}}>
      <span style={{position:'absolute',top:14,right:14,display:'inline-flex',alignItems:'center',gap:4,padding:'3px 8px',borderRadius:50,background:badgeBg,color:badgeColor,fontSize:'0.62rem',fontWeight:700,letterSpacing:'0.06em',textTransform:'uppercase'}}>
        <BadgeIcon size={10} /> {badgeText}
      </span>
      <div className={`feature-icon ${color}`} style={{marginBottom:14}}>{icon}</div>
      <h3 style={{paddingRight:90}}>{title}</h3>
      <p style={{flex:1}}>{desc}</p>
      <button
        onClick={() => navigate(to)}
        style={{background:'transparent',border:'none',padding:'10px 0 0',color:'var(--accent-blue)',fontSize:'0.78rem',cursor:'pointer',display:'inline-flex',alignItems:'center',gap:6,fontFamily:'inherit',fontWeight:500,textAlign:'left'}}
      >
        Go to {where} <ArrowRight size={12} />
      </button>
    </div>
  );
}

export default function Landing() {
  const navigate = useNavigate();
  const [liveStats, setLiveStats] = useState(null);
  const [statsFallback, setStatsFallback] = useState(false);

  // Pull real numbers from the backend so hero reflects actual seeded data.
  // On failure, fall back to representative demo numbers and tell the user so.
  useEffect(() => {
    let cancelled = false;
    Promise.all([
      api.get('/analytics/overview'),
      api.get('/analytics/wallet-gaps'),
    ]).then(([ov, wg]) => {
      if (cancelled) return;
      const revenueAtRisk = (ov.data.totalWriteOffs || 0) + (ov.data.totalWriteDowns || 0);
      const walletOpportunity = (wg.data || []).reduce((s, g) => s + (g.wallet_gap || 0), 0);
      const realisationGap = Math.max(0, 100 - (ov.data.overallRealisation || 0));
      setLiveStats({
        revenueAtRisk: fmt(revenueAtRisk),
        walletOpportunity: fmt(walletOpportunity),
        realisationGap: `${realisationGap.toFixed(0)}%`,
      });
    }).catch(() => {
      if (!cancelled) setStatsFallback(true);
    });
    return () => { cancelled = true; };
  }, []);

  const heroStats = [
    { label: 'Revenue Leaked to Write-Offs & Write-Downs', value: liveStats?.revenueAtRisk ?? '£2.4M', color: 'var(--accent-red)' },
    { label: 'Untapped Wallet Opportunity', value: liveStats?.walletOpportunity ?? '£47M', color: 'var(--accent-green)' },
    { label: 'Realisation Gap vs. Perfect', value: liveStats?.realisationGap ?? '14%', color: 'var(--accent-amber)' },
  ];

  return (
    <div className="landing">
      {/* Nav */}
      <nav className="landing-nav">
        <a href="/" className="landing-nav-brand">
          <div className="logo-icon" style={{width:30,height:30,fontSize:'0.7rem',borderRadius:6,background:'linear-gradient(135deg,#3B82F6,#8B5CF6)',display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontWeight:700}}>LP</div>
          LegalPulse
          <span style={{fontSize:'0.65rem',color:'var(--text-muted)',fontFamily:'var(--font-body)',fontWeight:400,marginLeft:4}}>by Octave</span>
        </a>
        <div className="landing-nav-links">
          <a href="#how-it-works">Architecture</a>
          <a href="#capabilities">Capabilities</a>
          <a href="#modules">Roles</a>
          <a href="#getting-started">Getting Started</a>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/dashboard')} style={{borderRadius:50}}>
            Launch Demo <ArrowRight size={14} />
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="landing-hero">
        <div className="landing-hero-content">
          <div className="landing-tag">
            <Zap size={14} /> AI-Powered Revenue Intelligence
          </div>
          <h1>
            Stop Leaving Money<br />
            on the <span>Table</span>
          </h1>
          <p>
            LegalPulse unifies your firm's profitability data with external wallet intelligence
            in a single live model — then lets you interrogate it in plain English. Spot revenue
            leaks, untapped client spend, and budget overruns through purpose-built dashboards
            grounded in your own numbers.
          </p>
          <div className="hero-buttons">
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/dashboard')}>
              Explore Demo Data <ArrowRight size={18} />
            </button>
            <button className="btn-ghost btn-lg" onClick={() => document.getElementById('features')?.scrollIntoView({behavior:'smooth'})}>
              See How It Works
            </button>
          </div>
        </div>

        {/* Floating stats — dynamic when backend is reachable, fallback otherwise */}
        <div style={{display:'flex',gap:40,marginTop:60,position:'relative',zIndex:1,flexWrap:'wrap',justifyContent:'center'}}>
          {heroStats.map((s,i) => (
            <div key={i} style={{textAlign:'center'}}>
              <div style={{fontSize:'2.2rem',fontWeight:700,color:s.color,fontFamily:'var(--font-mono)',lineHeight:1}}>{s.value}</div>
              <div style={{fontSize:'0.78rem',color:'var(--text-muted)',marginTop:6,maxWidth:220}}>{s.label}</div>
            </div>
          ))}
        </div>
        {liveStats && (
          <div style={{textAlign:'center',marginTop:14,fontSize:'0.7rem',color:'var(--text-muted)',opacity:0.7}}>
            Live from the loaded dataset
          </div>
        )}
        {statsFallback && (
          <div style={{textAlign:'center',marginTop:14,fontSize:'0.7rem',color:'var(--accent-amber)',opacity:0.85}}>
            Backend unreachable — showing representative demo values
          </div>
        )}
      </section>

      {/* What LegalPulse Reveals */}
      <section className="landing-section" id="features">
        <h2>Two Critical Blind Spots, One Platform</h2>
        <p className="section-sub">
          Revenue leakage from poor time capture, budget overruns, and unprofitable work that
          isn't caught until losses are realised — paired with missing visibility into client
          legal spend, share of wallet, cross-sell gaps, and competitive displacement. LegalPulse
          closes both in a single unified model.
        </p>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon blue"><TrendingUp size={22} /></div>
            <h3>Realisation Rate Analysis</h3>
            <p>Track realisation at every level — timekeeper, matter, client, practice area. Instantly spot where worked value is evaporating before it becomes revenue.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon red"><AlertTriangle size={22} /></div>
            <h3>Budget Overrun Detection</h3>
            <p>Early warning system flags matters where budget burn outpaces progress. Know about overruns weeks before they hit the P&L.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon amber"><Eye size={22} /></div>
            <h3>Write-Off Pattern Recognition</h3>
            <p>AI identifies write-off clusters by partner, matter type, and fee arrangement. Distinguish strategic write-offs from systemic process failures.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon green"><Target size={22} /></div>
            <h3>Client Wallet Intelligence</h3>
            <p>Estimate each client's total legal spend, calculate your share of wallet, and quantify the gap. Know exactly where your growth opportunity sits.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon purple"><PieChart size={22} /></div>
            <h3>Cross-Sell & White Space</h3>
            <p>Map practice areas you serve versus what each client likely needs. AI ranks gaps by estimated spend and recommends introductions.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon cyan"><ShieldAlert size={22} /></div>
            <h3>Competitive Intelligence</h3>
            <p>Monitor directory rankings, lateral hires, and panel appointments. Get alerts when competitors move on your key accounts.</p>
          </div>
        </div>
      </section>

      {/* How LegalPulse Works — architecture view */}
      <section className="landing-section" id="how-it-works" style={{borderTop:'1px solid var(--border)'}}>
        <h2>How LegalPulse Works</h2>
        <p className="section-sub">
          Four layers, one unified pipeline. Every query answered, every chart rendered, and every AI response
          comes from live data travelling up through this stack — not from static reports or cached summaries.
        </p>
        <div style={{maxWidth:900,margin:'0 auto',display:'flex',flexDirection:'column',gap:14}}>
          {[
            {
              n: 1,
              icon: <Database size={26} />,
              color: 'blue',
              title: 'Data Layer',
              stat: '10 canonical tables',
              desc: 'Clients, timekeepers, matters, fee arrangements, time entries, billing invoices, budget tracking, client wallet estimates, practice coverage, market signals.',
              detail: 'FK-enforced integrity. Three ingestion paths (pre-loaded demo, Excel/CSV upload, manual grids) all write to the same schemas. Demo and user-entered rows are tagged so they can be filtered separately.',
            },
            {
              n: 2,
              icon: <Cpu size={26} />,
              color: 'cyan',
              title: 'Analytics Engine',
              stat: '9 live SQL endpoints',
              desc: 'Firm overview · 3-stage realisation by practice · wallet gaps · write-off concentration · budget overruns · fee arrangement performance · client health scores · revenue trend · cross-sell opportunities.',
              detail: 'All queries use pre-aggregation (no cartesian-join bugs), divide-by-zero guards, and return the exact shape the frontend expects. Every analytic is recomputed from the live data on each request — no caching.',
            },
            {
              n: 3,
              icon: <LayoutGrid size={26} />,
              color: 'purple',
              title: 'Intelligence Views',
              stat: '5 dashboards, 28 metrics',
              desc: 'Firm-Wide Overview · Time & Profitability · Client Intelligence · Financial Deep Dive · Data Management. Every KPI, chart, and table has a click-to-open explanation panel with its formula, thresholds, and deep-link to the next diagnostic view.',
              detail: 'Consistent colour thresholds across pages (< 75% red · 75-80% amber · ≥ 80% green). Empty states on every page. Live "showing N of M" indicators when tables truncate.',
            },
            {
              n: 4,
              icon: <Bot size={26} />,
              color: 'green',
              title: 'AI Analyst',
              stat: '8 grounded context streams',
              desc: 'Every chat query triggers a fresh SQL snapshot containing firm overview, realisation by practice, top wallet gaps, budget overruns (top 5 + total count), write-off leaders by partner AND by timekeeper, fee-arrangement performance, cross-sell opportunities, and recent market signals.',
              detail: 'The model answers in Insight + Evidence + Recommendation form, cites specific £ and % figures from the context, honestly says "I don\'t know — see page X" when the question sits outside the provided slice. Bring-your-own Anthropic or OpenAI key; never stored server-side.',
            },
          ].map(layer => (
            <div key={layer.n} style={{display:'flex',gap:20,background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:'var(--radius-md)',padding:'22px 24px',alignItems:'flex-start'}}>
              <div style={{display:'flex',flexDirection:'column',alignItems:'center',minWidth:60}}>
                <div style={{fontSize:'0.62rem',fontWeight:700,color:'var(--text-muted)',letterSpacing:'0.08em'}}>LAYER {layer.n}</div>
                <div className={`feature-icon ${layer.color}`} style={{marginTop:6,width:48,height:48}}>{layer.icon}</div>
              </div>
              <div style={{flex:1}}>
                <div style={{display:'flex',alignItems:'baseline',gap:14,flexWrap:'wrap',marginBottom:6}}>
                  <h3 style={{fontSize:'1.05rem',fontWeight:600,color:'var(--text-primary)',margin:0}}>{layer.title}</h3>
                  <span style={{fontSize:'0.72rem',color:'var(--accent-blue)',fontFamily:'var(--font-mono)',background:'rgba(59,130,246,0.1)',padding:'2px 8px',borderRadius:4}}>{layer.stat}</span>
                </div>
                <p style={{fontSize:'0.88rem',color:'var(--text-secondary)',lineHeight:1.55,margin:'0 0 8px 0'}}>{layer.desc}</p>
                <p style={{fontSize:'0.8rem',color:'var(--text-muted)',lineHeight:1.55,margin:0,fontStyle:'italic'}}>{layer.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Complete Capability Map — unified in-scope + enhancement view */}
      <section className="landing-section" id="capabilities" style={{borderTop:'1px solid var(--border)'}}>
        <h2>Complete Capability Map</h2>
        <p className="section-sub">
          Every feature the tool ships with, marked by origin. Green badges were the eight questions
          on the original brief; purple badges were built on top of them because the answers are only
          useful if people can act on them.
        </p>

        {/* Legend */}
        <div style={{display:'flex',justifyContent:'center',gap:16,marginBottom:32,flexWrap:'wrap'}}>
          <span style={{display:'inline-flex',alignItems:'center',gap:6,padding:'4px 10px',borderRadius:50,background:'rgba(16,185,129,0.12)',color:'var(--accent-green)',fontSize:'0.72rem',fontWeight:700,letterSpacing:'0.06em',textTransform:'uppercase'}}>
            <CheckCircle2 size={12} /> In Original Brief
          </span>
          <span style={{display:'inline-flex',alignItems:'center',gap:6,padding:'4px 10px',borderRadius:50,background:'rgba(139,92,246,0.12)',color:'var(--accent-purple)',fontSize:'0.72rem',fontWeight:700,letterSpacing:'0.06em',textTransform:'uppercase'}}>
            <Sparkles size={12} /> Enhancement
          </span>
        </div>

        {/* Revenue Leakage cluster */}
        <div style={{maxWidth:1100,margin:'0 auto'}}>
          <div style={{fontSize:'0.72rem',fontWeight:700,letterSpacing:'0.08em',color:'var(--accent-red)',textTransform:'uppercase',marginBottom:14}}>
            Revenue Leakage Domain
          </div>
          <div className="features-grid" style={{gridTemplateColumns:'repeat(auto-fit, minmax(300px, 1fr))',marginBottom:40}}>
            {[
              { scope: 'brief', icon: <TrendingUp size={20} />, color: 'blue', title: 'Work-vs-Time-Recorded Gap', desc: '3-stage realisation funnel (Billing × Collection = Overall) per practice area, showing exactly where worked time evaporates.', where: 'Financial Deep Dive', to: '/financial' },
              { scope: 'brief', icon: <AlertTriangle size={20} />, color: 'red', title: 'Budget Overrun Trending', desc: 'Live list of matters where budget consumption outpaces progress by >15pp (warning) or >25pp (critical). Shows top 20 of N total.', where: 'Dashboard', to: '/dashboard' },
              { scope: 'brief', icon: <Gauge size={20} />, color: 'amber', title: 'Cost-to-Serve per Matter Type', desc: 'Fee Arrangement Performance comparison across Hourly / Fixed / Capped / Blended / Contingent. Realisation + write-off rates side by side.', where: 'Profitability → Fee Arrangements', to: '/profitability' },
              { scope: 'brief', icon: <Eye size={20} />, color: 'amber', title: 'Write-Off Concentration', desc: 'Analysis sliced by responsible partner, practice area, and fee arrangement — separates strategic from systemic leakage.', where: 'Profitability → Write-Off Analysis', to: '/profitability' },
              { scope: 'enhancement', icon: <BarChart3 size={20} />, color: 'amber', title: 'Revenue Waterfall', desc: 'Worked → Write-Downs → Net Billed → Write-Offs → Collected as a five-bar waterfall. Shows exactly where each pound evaporates, not just the final gap.', where: 'Financial Deep Dive', to: '/financial' },
              { scope: 'enhancement', icon: <Layers size={20} />, color: 'blue', title: 'Practice-Area P&L', desc: 'Full conversion pipeline per practice area in one row: worked, billed, collected, leakage, and all three realisation rates colour-coded by threshold.', where: 'Financial Deep Dive', to: '/financial' },
            ].map((c, i) => (
              <CapabilityCard key={i} {...c} navigate={navigate} />
            ))}
          </div>

          {/* Client Spend Visibility cluster */}
          <div style={{fontSize:'0.72rem',fontWeight:700,letterSpacing:'0.08em',color:'var(--accent-green)',textTransform:'uppercase',marginBottom:14}}>
            Client Spend Visibility Domain
          </div>
          <div className="features-grid" style={{gridTemplateColumns:'repeat(auto-fit, minmax(300px, 1fr))',marginBottom:40}}>
            {[
              { scope: 'brief', icon: <Target size={20} />, color: 'green', title: 'Estimated Total Legal Spend', desc: 'Per-client wallet estimate with confidence rating (High / Medium / Low) — surfaces which numbers are solid vs. inferred.', where: 'Client Intelligence → Share of Wallet', to: '/clients' },
              { scope: 'brief', icon: <PieChart size={20} />, color: 'green', title: 'Share of Wallet', desc: 'Our revenue ÷ estimated total spend × 100 per client. Colour-coded (< 10% red, 10-25% amber, ≥ 25% green) + absolute £ gap.', where: 'Client Intelligence → Share of Wallet', to: '/clients' },
              { scope: 'brief', icon: <Layers size={20} />, color: 'purple', title: 'Unserved Practice Areas', desc: 'Every practice area we don\'t serve for each client, with estimated £ spend and — where known — the competitor currently winning that work.', where: 'Client Intelligence → Cross-Sell Gaps', to: '/clients' },
              { scope: 'brief', icon: <ShieldAlert size={20} />, color: 'cyan', title: 'Competitive Ground-Gaining Signals', desc: 'Timeline of competitor movements (directory rankings, panel wins, lateral hires, news) tagged by severity and linked to your clients.', where: 'Client Intelligence → Market Signals', to: '/clients' },
              { scope: 'enhancement', icon: <Heart size={20} />, color: 'red', title: 'Client Health Score', desc: 'Composite 0-100 score across six factors: revenue level, matter diversity, partner breadth, share of wallet position, competitor practice foothold, and recent competitive signals. Early warning before a client goes quiet.', where: 'Client Intelligence → Health', to: '/clients' },
              { scope: 'enhancement', icon: <Users size={20} />, color: 'green', title: 'Top-10 Wallet Gap Ranking', desc: 'Horizontal bar chart ordering all tracked clients by absolute £ opportunity — the defender\'s attention list.', where: 'Dashboard', to: '/dashboard' },
            ].map((c, i) => (
              <CapabilityCard key={i} {...c} navigate={navigate} />
            ))}
          </div>

          {/* Cross-cutting enhancements */}
          <div style={{fontSize:'0.72rem',fontWeight:700,letterSpacing:'0.08em',color:'var(--accent-purple)',textTransform:'uppercase',marginBottom:14}}>
            Cross-Cutting Enhancements
          </div>
          <div className="features-grid" style={{gridTemplateColumns:'repeat(auto-fit, minmax(300px, 1fr))'}}>
            {[
              { scope: 'enhancement', icon: <Brain size={20} />, color: 'purple', title: 'Conversational AI Analyst', desc: 'Ask anything in plain English. Every answer is grounded in a fresh SQL snapshot of live firm data, structured as Insight + Evidence + Recommendation.', where: 'AI Chat', to: '/chat' },
              { scope: 'enhancement', icon: <Bot size={20} />, color: 'cyan', title: 'Live Data Grounding + Honesty', desc: 'AI cites specific £/% from current data and honestly says "I don\'t know, see page X" when context is incomplete. No hallucinated partners or invented numbers.', where: 'AI Chat', to: '/chat' },
              { scope: 'enhancement', icon: <Users size={20} />, color: 'blue', title: 'Role-Based Framing', desc: 'Tailored dashboards and chat answers for Managing Partner / Practice Leader / BD Director / Finance Director — each sees the slice that drives their decisions.', where: 'Across all views', to: '/dashboard' },
              { scope: 'enhancement', icon: <Database size={20} />, color: 'blue', title: 'Three-Path Data Ingestion', desc: 'Pre-loaded demo with seeded patterns · Excel/CSV upload with AI column mapping · manual grids with FK-validated dropdowns. Value inside the first hour, no integration project.', where: 'Data Management', to: '/data' },
              { scope: 'enhancement', icon: <CheckCircle2 size={20} />, color: 'green', title: 'Explainability on Every Metric', desc: 'Click the "i" icon next to any KPI, chart, or table — get the formula, thresholds, interpretation rules, and a deep-link to the next diagnostic view.', where: 'Every dashboard', to: '/dashboard' },
              { scope: 'enhancement', icon: <FileText size={20} />, color: 'purple', title: 'Referential Integrity', desc: 'Foreign-key enforcement at the database layer with friendly error messages in the UI. Can\'t accidentally create orphan records or typo a client ID.', where: 'Data Management', to: '/data' },
            ].map((c, i) => (
              <CapabilityCard key={i} {...c} navigate={navigate} />
            ))}
          </div>
        </div>
      </section>

      {/* Modules overview */}
      <section className="landing-section" id="modules" style={{borderTop:'1px solid var(--border)'}}>
        <h2>Built for Every Stakeholder</h2>
        <p className="section-sub">
          Role-based views ensure every user sees what matters most to them.
        </p>
        <div className="features-grid" style={{gridTemplateColumns:'repeat(auto-fit, minmax(240px, 1fr))'}}>
          {[
            { role: 'Managing Partner', icon: <BarChart3 size={20}/>, desc: 'Firm-wide profitability pulse, growth levers, weekly risk summary', color: 'blue' },
            { role: 'Practice Leader', icon: <TrendingUp size={20}/>, desc: 'Team utilisation, matter P&L, cross-sell opportunities', color: 'green' },
            { role: 'BD Director', icon: <Target size={20}/>, desc: 'Client wallet intelligence, competitive positioning, pipeline', color: 'purple' },
            { role: 'Finance Director', icon: <PieChart size={20}/>, desc: 'Write-off reduction, cost-to-serve analysis, fee arrangement ROI', color: 'amber' },
          ].map((r,i) => (
            <div className="feature-card" key={i}>
              <div className={`feature-icon ${r.color}`}>{r.icon}</div>
              <h3>{r.role}</h3>
              <p>{r.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Data ingestion */}
      <section className="landing-section" style={{borderTop:'1px solid var(--border)'}}>
        <h2>Three Ways to Get Data In</h2>
        <p className="section-sub">
          All paths write to identical schemas. The AI doesn't know or care how data arrived.
        </p>
        <div className="features-grid" style={{gridTemplateColumns:'repeat(3, 1fr)'}}>
          <div className="feature-card" style={{textAlign:'center'}}>
            <div className="feature-icon blue" style={{margin:'0 auto 16px'}}><Database size={22} /></div>
            <h3>Pre-Loaded Demo Data</h3>
            <p>See value immediately with Whitfield & Partners — a rich, realistic dataset with intentional patterns for the AI to discover.</p>
          </div>
          <div className="feature-card" style={{textAlign:'center'}}>
            <div className="feature-icon green" style={{margin:'0 auto 16px'}}><FileSpreadsheet size={22} /></div>
            <h3>File Upload</h3>
            <p>Drag-and-drop Excel or CSV exports. AI agents handle column mapping, data transformation, and validation automatically.</p>
          </div>
          <div className="feature-card" style={{textAlign:'center'}}>
            <div className="feature-icon purple" style={{margin:'0 auto 16px'}}><MessageSquare size={22} /></div>
            <h3>Manual Entry</h3>
            <p>Editable data grids with validation, dropdowns, and bulk paste. Perfect for market intelligence and wallet estimates.</p>
          </div>
        </div>
      </section>

      {/* Your First 10 Minutes — concrete operational walkthrough */}
      <section className="landing-section" id="getting-started" style={{borderTop:'1px solid var(--border)',background:'linear-gradient(180deg, rgba(59,130,246,0.04) 0%, transparent 60%)'}}>
        <div style={{textAlign:'center',marginBottom:12}}>
          <div style={{display:'inline-flex',alignItems:'center',gap:6,padding:'6px 14px',borderRadius:50,background:'rgba(59,130,246,0.12)',color:'var(--accent-blue)',fontSize:'0.7rem',fontWeight:700,letterSpacing:'0.08em',textTransform:'uppercase'}}>
            <Clock size={12} /> Your First 10 Minutes
          </div>
        </div>
        <h2>Getting Value, Step by Step</h2>
        <p className="section-sub">
          Concrete workflow from launch to first insight. No training required — every step maps to a
          specific click path, and each unlocks the next.
        </p>
        <div style={{maxWidth:820,margin:'0 auto',display:'flex',flexDirection:'column',gap:0}}>
          {[
            {
              time: '0-1 MIN',
              icon: <MousePointer2 size={20} />,
              color: 'blue',
              title: 'Launch & land on the Firm-Wide Overview',
              body: 'Click Launch Demo. You arrive on the Dashboard with all KPIs populated from pre-seeded Whitfield & Partners data — total revenue, overall realisation %, write-offs, open matters, and the practice-area performance chart.',
              action: { label: 'Open Dashboard', to: '/dashboard' },
            },
            {
              time: '1-3 MIN',
              icon: <Eye size={20} />,
              color: 'green',
              title: 'Click the (i) icon on any metric',
              body: 'Every KPI, chart title, and table header has a small circular info button. Click it — a structured explanation opens with: what the metric shows · the exact formula · how to read it · typical thresholds · what drives it · a deep-link button to the next diagnostic view. Try it on "Overall Realisation" first.',
              action: null,
            },
            {
              time: '3-5 MIN',
              icon: <LayoutGrid size={20} />,
              color: 'purple',
              title: 'Walk the four intelligence views from the left sidebar',
              body: 'Dashboard → Profitability (write-offs by partner, fee-type performance, 3-stage realisation) → Client Intelligence (wallet, cross-sell, health, signals) → Financial Deep Dive (waterfall, monthly trend, practice P&L). Each tab is self-contained; no navigation re-loads.',
              action: { label: 'Open Client Intelligence', to: '/clients' },
            },
            {
              time: '5-7 MIN',
              icon: <MessageSquare size={20} />,
              color: 'cyan',
              title: 'Ask the AI Analyst',
              body: 'Sidebar → AI Chat. Paste an Anthropic (sk-ant-…) or OpenAI (sk-…) key — stored in session only, never persisted server-side. Click a suggested query like "Which partner has the highest write-offs and how do they compare?" The model answers with specific names and £ figures pulled live.',
              action: { label: 'Open AI Chat', to: '/chat' },
            },
            {
              time: '7-10 MIN',
              icon: <Database size={20} />,
              color: 'amber',
              title: 'Edit data and watch metrics recompute',
              body: 'Sidebar → Data Management. Pick any of 10 tables. Click a cell to edit inline. Click Add Row — FK fields (client, matter, timekeeper) show dropdowns of the real records. Required-field and type validation catch errors before submit. Save, then jump back to Dashboard — the numbers have moved.',
              action: { label: 'Open Data Management', to: '/data' },
            },
          ].map((s, i, arr) => (
            <div key={i} style={{display:'flex',gap:22,padding:'22px 0',borderBottom:i === arr.length - 1 ? 'none' : '1px solid var(--border)'}}>
              <div style={{minWidth:80,display:'flex',flexDirection:'column',alignItems:'center',gap:10}}>
                <div className={`feature-icon ${s.color}`} style={{width:42,height:42,margin:0}}>{s.icon}</div>
                <div style={{fontSize:'0.65rem',fontWeight:700,color:'var(--text-muted)',letterSpacing:'0.08em',fontFamily:'var(--font-mono)'}}>{s.time}</div>
              </div>
              <div style={{flex:1}}>
                <h3 style={{fontSize:'1rem',fontWeight:600,color:'var(--text-primary)',margin:'0 0 6px 0'}}>{s.title}</h3>
                <p style={{fontSize:'0.88rem',color:'var(--text-secondary)',lineHeight:1.6,margin:'0 0 10px 0'}}>{s.body}</p>
                {s.action && (
                  <button
                    onClick={() => navigate(s.action.to)}
                    style={{background:'transparent',border:'1px solid var(--border-light)',padding:'6px 12px',borderRadius:'var(--radius-sm)',color:'var(--accent-blue)',fontSize:'0.78rem',cursor:'pointer',display:'inline-flex',alignItems:'center',gap:6,fontFamily:'inherit',fontWeight:500}}
                  >
                    {s.action.label} <ArrowRight size={12} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Pro tips */}
        <div style={{maxWidth:820,margin:'36px auto 0',padding:'20px 24px',background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:'var(--radius-md)'}}>
          <div style={{fontSize:'0.72rem',fontWeight:700,letterSpacing:'0.08em',color:'var(--accent-blue)',textTransform:'uppercase',marginBottom:10}}>Three things that accelerate everything</div>
          <ul style={{margin:0,padding:'0 0 0 18px',color:'var(--text-secondary)',fontSize:'0.85rem',lineHeight:1.7}}>
            <li><strong style={{color:'var(--text-primary)'}}>Tooltips are rich.</strong> Every (i) opens a structured panel with formula, thresholds, and a "Go to …" button. Treat them as the primary teaching surface.</li>
            <li><strong style={{color:'var(--text-primary)'}}>The AI won't hallucinate.</strong> If it can't see the data to answer, it tells you which page has the full view instead of guessing.</li>
            <li><strong style={{color:'var(--text-primary)'}}>Data edits propagate live.</strong> No cache, no batch job — change a row, the Dashboard reflects it on the next load.</li>
          </ul>
        </div>
      </section>

      {/* CTA */}
      <section className="landing-section" style={{textAlign:'center',borderTop:'1px solid var(--border)',paddingBottom:100}}>
        <h2>Ready to See What You're Missing?</h2>
        <p className="section-sub">
          Launch the demo and explore Whitfield & Partners. Ask the AI about profitability,
          wallet gaps, budget overruns — anything. No signup required.
        </p>
        <button className="btn btn-primary btn-lg" onClick={() => navigate('/dashboard')} style={{fontSize:'1.1rem',padding:'18px 44px'}}>
          Launch Demo <ArrowRight size={18} />
        </button>
      </section>

      {/* Footer */}
      <footer style={{borderTop:'1px solid var(--border)',padding:'32px',textAlign:'center',color:'var(--text-muted)',fontSize:'0.8rem'}}>
        <p>LegalPulse — AI-Powered Revenue Intelligence for Law Firms</p>
        <p style={{marginTop:6}}>An <span style={{color:'var(--accent-blue)',fontWeight:600}}>Octave</span> Product · Whitfield & Partners is fictitious demo data</p>
        <p style={{marginTop:4,fontSize:'0.72rem'}}>© {new Date().getFullYear()} Octave. All rights reserved.</p>
      </footer>
    </div>
  );
}
