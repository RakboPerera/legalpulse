import React, { useState, useMemo } from 'react';
import { BookOpen, Search, ChevronRight, Hash, TrendingUp, DollarSign, Users, Briefcase, ShieldAlert, FileText } from 'lucide-react';
import { glossaryTerms, CATEGORIES } from '../data/glossaryTerms';

const CATEGORY_ICONS = {
  'All': BookOpen,
  'Metrics': TrendingUp,
  'Billing & Revenue': DollarSign,
  'People & Roles': Users,
  'Matters & Work': Briefcase,
  'Health & Risk': ShieldAlert,
  'Fee Structures': FileText,
};

const THRESHOLD_COLORS = {
  green: { bg: 'var(--accent-green-dim)', color: 'var(--accent-green)' },
  amber: { bg: 'var(--accent-amber-dim)', color: 'var(--accent-amber)' },
  red:   { bg: 'var(--accent-red-dim)',   color: 'var(--accent-red)'   },
};

function ThresholdBadge({ label, value, color }) {
  const style = THRESHOLD_COLORS[color];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '2px 10px', borderRadius: 20,
      background: style.bg, color: style.color,
      fontSize: '0.75rem', fontWeight: 600,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: style.color, flexShrink: 0 }} />
      {label}: {value}
    </span>
  );
}

function UsedInChip({ page }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '2px 9px', borderRadius: 20,
      background: 'rgba(59,130,246,0.1)', color: 'var(--accent-blue)',
      fontSize: '0.73rem', fontWeight: 500,
    }}>
      <ChevronRight size={10} />
      {page}
    </span>
  );
}

function TermCard({ term }) {
  return (
    <div className="card" style={{ padding: '20px 24px', transition: 'border-color 0.15s, box-shadow 0.15s' }}
      onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--border-light)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
      onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; }}
    >
      {/* Term name + category label */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 10 }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', color: 'var(--text-primary)', lineHeight: 1.3 }}>
          {term.term}
        </h3>
        <span style={{
          flexShrink: 0, padding: '2px 9px', borderRadius: 20, marginTop: 2,
          background: 'var(--bg-elevated)', color: 'var(--text-muted)',
          fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em',
        }}>
          {term.category}
        </span>
      </div>

      {/* Definition */}
      <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.65, marginBottom: term.formula || term.thresholds || term.usedIn?.length ? 14 : 0 }}>
        {term.definition}
      </p>

      {/* Formula */}
      {term.formula && (
        <div style={{
          marginBottom: 12, padding: '8px 14px',
          background: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)',
          borderLeft: '3px solid var(--accent-blue)',
        }}>
          <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 3 }}>
            Formula
          </span>
          <code style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--accent-blue)' }}>
            {term.formula}
          </code>
        </div>
      )}

      {/* Thresholds */}
      {term.thresholds && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
          {term.thresholds.map(t => (
            <ThresholdBadge key={t.label} {...t} />
          ))}
        </div>
      )}

      {/* Used in */}
      {term.usedIn?.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {term.usedIn.map(page => <UsedInChip key={page} page={page} />)}
        </div>
      )}
    </div>
  );
}

export default function Glossary() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return glossaryTerms.filter(t => {
      const matchesCategory = activeCategory === 'All' || t.category === activeCategory;
      if (!matchesCategory) return false;
      if (!q) return true;
      return (
        t.term.toLowerCase().includes(q) ||
        t.definition.toLowerCase().includes(q) ||
        (t.formula && t.formula.toLowerCase().includes(q))
      );
    });
  }, [search, activeCategory]);

  const countFor = (cat) =>
    cat === 'All'
      ? glossaryTerms.length
      : glossaryTerms.filter(t => t.category === cat).length;

  return (
    <div className="page-content">
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 'var(--radius-sm)',
            background: 'rgba(139,92,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <BookOpen size={20} color="var(--accent-purple)" />
          </div>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', color: 'var(--text-primary)', lineHeight: 1 }}>
              Glossary
            </h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 3 }}>
              {glossaryTerms.length} terms across billing, realisation, client intelligence and more
            </p>
          </div>
        </div>
      </div>

      {/* Search + filter bar */}
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)', padding: '16px 20px', marginBottom: 24,
      }}>
        {/* Search input */}
        <div style={{ position: 'relative', marginBottom: 14 }}>
          <Search size={15} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
          <input
            type="text"
            placeholder="Search terms and definitions…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%', padding: '9px 14px 9px 38px',
              background: 'var(--bg-primary)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)',
              fontSize: '0.9rem', outline: 'none', transition: 'border-color 0.15s',
            }}
            onFocus={e => { e.target.style.borderColor = 'var(--accent-blue)'; }}
            onBlur={e => { e.target.style.borderColor = 'var(--border)'; }}
          />
        </div>

        {/* Category tabs */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {CATEGORIES.map(cat => {
            const Icon = CATEGORY_ICONS[cat];
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '6px 13px', borderRadius: 20,
                  border: `1px solid ${isActive ? 'var(--accent-blue)' : 'var(--border)'}`,
                  background: isActive ? 'rgba(59,130,246,0.12)' : 'transparent',
                  color: isActive ? 'var(--accent-blue)' : 'var(--text-secondary)',
                  fontSize: '0.82rem', fontWeight: isActive ? 600 : 450,
                  cursor: 'pointer', transition: 'all 0.15s',
                }}
              >
                <Icon size={13} />
                {cat}
                <span style={{
                  padding: '0 6px', borderRadius: 10,
                  background: isActive ? 'rgba(59,130,246,0.2)' : 'var(--bg-elevated)',
                  color: isActive ? 'var(--accent-blue)' : 'var(--text-muted)',
                  fontSize: '0.7rem', fontWeight: 600,
                }}>
                  {countFor(cat)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Results count */}
      <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
        <Hash size={13} />
        {filtered.length} {filtered.length === 1 ? 'term' : 'terms'}
        {(search || activeCategory !== 'All') && ' matching current filters'}
      </div>

      {/* Term grid */}
      {filtered.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(460px, 1fr))', gap: 16 }}>
          {filtered.map(term => <TermCard key={term.id} term={term} />)}
        </div>
      ) : (
        <div style={{
          textAlign: 'center', padding: '60px 20px',
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
        }}>
          <BookOpen size={32} style={{ color: 'var(--text-muted)', marginBottom: 12 }} />
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>No terms found for <strong>"{search}"</strong></p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: 6 }}>Try a different search term or clear the filter.</p>
          <button
            onClick={() => { setSearch(''); setActiveCategory('All'); }}
            style={{
              marginTop: 16, padding: '8px 18px', borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border)', background: 'transparent',
              color: 'var(--text-secondary)', fontSize: '0.85rem', cursor: 'pointer',
            }}
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
