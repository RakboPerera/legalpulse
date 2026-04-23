// Shared formatters and thresholds. Import everywhere that displays money or
// realisation bands to keep UX consistent across pages.

/**
 * Null-safe, negative-aware currency formatter.
 * £1,500,000 → "£1.5M" · £2,300 → "£2K" · null/undef → "£0" · -500 → "-£500"
 */
export const fmt = (n) => {
  if (n === null || n === undefined || isNaN(n)) return '£0';
  const neg = n < 0;
  const abs = Math.abs(n);
  let body;
  if (abs >= 1_000_000) body = `£${(abs / 1_000_000).toFixed(1)}M`;
  else if (abs >= 1_000) body = `£${(abs / 1_000).toFixed(0)}K`;
  else body = `£${abs.toFixed(0)}`;
  return neg ? `-${body}` : body;
};

/**
 * Single source of truth for realisation thresholds.
 * Used across every page that shows a realisation %.
 *
 * Healthy ≥ 80% · Watch 75-80% · Concerning < 75%
 */
export const REALISATION_THRESHOLDS = { healthy: 80, watch: 75 };

/**
 * Returns a CSS colour token for a realisation percentage.
 * Usage: style={{ color: realisationColor(val) }}
 */
export const realisationColor = (pct) => {
  const v = pct ?? 0;
  if (v < REALISATION_THRESHOLDS.watch) return 'var(--accent-red)';
  if (v < REALISATION_THRESHOLDS.healthy) return 'var(--accent-amber)';
  return 'var(--accent-green)';
};

/**
 * Hex version for recharts Cell fills (recharts doesn't resolve CSS vars).
 */
export const realisationFillHex = (pct) => {
  const v = pct ?? 0;
  if (v < REALISATION_THRESHOLDS.watch) return '#EF4444';
  if (v < REALISATION_THRESHOLDS.healthy) return '#F59E0B';
  return '#10B981';
};

/**
 * Clamp a percentage to [0, 100] for display safety.
 */
export const clampPct = (v) => Math.min(Math.max(v ?? 0, 0), 100);

/**
 * Billing / Collection realisation bands are slightly different from overall.
 * Billing Real. healthy ≥ 90% · watch 85-90% · concerning < 85%
 * Collection Real. healthy ≥ 92% · watch 88-92% · concerning < 88%
 */
export const billingRealisationColor = (pct) => {
  const v = pct ?? 0;
  if (v < 85) return 'var(--accent-red)';
  if (v < 90) return 'var(--accent-amber)';
  return 'var(--accent-green)';
};

export const collectionRealisationColor = (pct) => {
  const v = pct ?? 0;
  if (v < 88) return 'var(--accent-red)';
  if (v < 92) return 'var(--accent-amber)';
  return 'var(--accent-green)';
};
