import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard, TrendingUp, Users, DollarSign,
  MessageSquare, Database, BarChart3, Target,
  ShieldAlert, FileSpreadsheet, ArrowLeft, BookOpen
} from 'lucide-react';

export default function Sidebar() {
  return (
    <aside className="app-sidebar">
      {/* Brand — click to return to the landing page */}
      <Link to="/" className="sidebar-logo" style={{textDecoration:'none',color:'inherit'}}>
        <div className="logo-icon">LP</div>
        <h1>LegalPulse</h1>
      </Link>
      {/* Explicit "back to landing" affordance — more discoverable than just the brand link */}
      <Link
        to="/"
        style={{
          margin:'0 20px 12px',
          display:'inline-flex',
          alignItems:'center',
          gap:8,
          padding:'8px 12px',
          borderRadius:'var(--radius-sm)',
          border:'1px solid var(--border)',
          background:'transparent',
          color:'var(--text-secondary)',
          fontSize:'0.78rem',
          fontWeight:500,
          textDecoration:'none',
          transition:'all 0.15s',
        }}
        onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--accent-blue)'; e.currentTarget.style.color = 'var(--accent-blue)'; }}
        onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
      >
        <ArrowLeft size={14} /> Back to Landing
      </Link>
      <nav className="sidebar-nav">
        <div className="sidebar-section-label">Intelligence</div>
        <NavLink to="/dashboard" className={({isActive}) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <LayoutDashboard /> Firm Overview
        </NavLink>
        <NavLink to="/profitability" className={({isActive}) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <TrendingUp /> Profitability
        </NavLink>
        <NavLink to="/clients" className={({isActive}) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <Users /> Client Intelligence
        </NavLink>
        <NavLink to="/financial" className={({isActive}) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <DollarSign /> Financial Deep Dive
        </NavLink>

        <div className="sidebar-section-label">Tools</div>
        <NavLink to="/chat" className={({isActive}) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <MessageSquare /> AI Chat
          <span className="sidebar-badge">AI</span>
        </NavLink>
        <NavLink to="/data" className={({isActive}) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <Database /> Data Management
        </NavLink>

        <div className="sidebar-section-label">Reference</div>
        <NavLink to="/glossary" className={({isActive}) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <BookOpen /> Glossary
        </NavLink>
      </nav>
      <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
        <div>Whitfield & Partners · Demo Data</div>
        <div style={{marginTop:4,color:'var(--accent-blue)',fontWeight:500}}>Powered by Octave</div>
      </div>
    </aside>
  );
}
