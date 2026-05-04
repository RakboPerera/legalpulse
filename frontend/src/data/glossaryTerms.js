export const CATEGORIES = [
  'All',
  'Metrics',
  'Billing & Revenue',
  'People & Roles',
  'Matters & Work',
  'Health & Risk',
  'Fee Structures',
];

export const glossaryTerms = [
  // ── Metrics ──────────────────────────────────────────────────────────────
  {
    id: 'worked-value',
    term: 'Worked Value',
    category: 'Metrics',
    definition:
      'The theoretical maximum revenue a firm could earn: every hour logged by every timekeeper multiplied by their standard rate, before any adjustments. It sits at the top of the revenue funnel and represents full billing capacity.',
    formula: 'SUM(hours_worked × rate_applied)',
    thresholds: null,
    usedIn: ['Firm Overview', 'Financial Deep Dive', 'Profitability'],
  },
  {
    id: 'billing-realisation',
    term: 'Billing Realisation',
    category: 'Metrics',
    definition:
      'The percentage of worked value that is actually billed to the client. A billing realisation below 100% means some worked hours were written down (discounted or removed) before the invoice was raised.',
    formula: 'Net Billed ÷ Worked Value × 100',
    thresholds: [
      { label: 'Healthy', value: '≥ 90%', color: 'green' },
      { label: 'Watch', value: '85 – 90%', color: 'amber' },
      { label: 'Concerning', value: '< 85%', color: 'red' },
    ],
    usedIn: ['Profitability', 'Financial Deep Dive'],
  },
  {
    id: 'collection-realisation',
    term: 'Collection Realisation',
    category: 'Metrics',
    definition:
      'The percentage of billed amounts actually received as cash. A figure below 100% means some invoiced amounts were written off — due to disputes, bad debt, or negotiated reductions after billing.',
    formula: 'Amount Collected ÷ Net Billed × 100',
    thresholds: [
      { label: 'Healthy', value: '≥ 92%', color: 'green' },
      { label: 'Watch', value: '88 – 92%', color: 'amber' },
      { label: 'Concerning', value: '< 88%', color: 'red' },
    ],
    usedIn: ['Profitability', 'Financial Deep Dive'],
  },
  {
    id: 'overall-realisation',
    term: 'Overall Realisation',
    category: 'Metrics',
    definition:
      'The end-to-end efficiency of turning billable time into collected cash, capturing losses at both the billing stage (write-downs) and the collection stage (write-offs). The single most important realisation metric.',
    formula: 'Amount Collected ÷ Worked Value × 100',
    thresholds: [
      { label: 'Healthy', value: '≥ 80%', color: 'green' },
      { label: 'Watch', value: '75 – 80%', color: 'amber' },
      { label: 'Concerning', value: '< 75%', color: 'red' },
    ],
    usedIn: ['Firm Overview', 'Profitability', 'Financial Deep Dive'],
  },
  {
    id: 'realisation-gap',
    term: 'Realisation Gap',
    category: 'Metrics',
    definition:
      'The inverse of Overall Realisation — the percentage of worked value that was never collected. Quantifies total revenue leakage across both write-downs and write-offs.',
    formula: '100% − Overall Realisation',
    thresholds: null,
    usedIn: ['Firm Overview', 'Financial Deep Dive'],
  },
  {
    id: 'share-of-wallet',
    term: 'Share of Wallet',
    category: 'Metrics',
    definition:
      'The proportion of a client\'s total estimated annual legal spend that flows to this firm. A low share-of-wallet indicates significant untapped revenue from an existing relationship.',
    formula: 'Our Revenue ÷ Estimated Total Legal Spend × 100',
    thresholds: null,
    usedIn: ['Client Intelligence', 'Firm Overview'],
  },
  {
    id: 'wallet-gap',
    term: 'Wallet Gap',
    category: 'Metrics',
    definition:
      'The absolute pound value of a client\'s estimated legal spend that goes to other firms. Aggregated across all clients, it shows the total addressable growth opportunity within the existing client base.',
    formula: 'Estimated Total Spend − Our Revenue',
    thresholds: null,
    usedIn: ['Client Intelligence', 'Firm Overview'],
  },
  {
    id: 'client-health-score',
    term: 'Client Health Score',
    category: 'Metrics',
    definition:
      'A composite 0–100 score that rates the overall strength and risk profile of a client relationship. Combines six signals: revenue level, practice diversity, partner breadth, share of wallet, competitor foothold, and open market signals.',
    formula: 'Weighted composite of 6 signals (scale: 0 – 100)',
    thresholds: [
      { label: 'Healthy', value: '≥ 70', color: 'green' },
      { label: 'Watch', value: '50 – 69', color: 'amber' },
      { label: 'At Risk', value: '< 50', color: 'red' },
    ],
    usedIn: ['Client Intelligence', 'Firm Overview'],
  },

  // ── Billing & Revenue ─────────────────────────────────────────────────────
  {
    id: 'write-down',
    term: 'Write-Down',
    category: 'Billing & Revenue',
    definition:
      'A pre-invoice reduction applied to the gross worked value before an invoice is raised. Common reasons include agreed discounts, scope reductions, trainee time not passed to the client, or partner judgment that hours exceeded client expectations.',
    formula: 'Gross Worked Value − Net Billed',
    thresholds: null,
    usedIn: ['Profitability', 'Financial Deep Dive'],
  },
  {
    id: 'write-off',
    term: 'Write-Off',
    category: 'Billing & Revenue',
    definition:
      'An amount removed from a raised invoice that will never be collected. Unlike write-downs (which happen before billing), write-offs occur after an invoice exists — caused by client disputes, uncollectable debt, or negotiated settlements.',
    formula: 'Net Billed − Amount Collected',
    thresholds: null,
    usedIn: ['Profitability', 'Financial Deep Dive'],
  },
  {
    id: 'net-billed',
    term: 'Net Billed',
    category: 'Billing & Revenue',
    definition:
      'The amount that appears on the invoice sent to the client, after all write-downs have been applied to the gross worked value. This is the formal demand for payment.',
    formula: 'Gross Billed − Write-Downs',
    thresholds: null,
    usedIn: ['Profitability', 'Financial Deep Dive'],
  },
  {
    id: 'revenue-waterfall',
    term: 'Revenue Waterfall',
    category: 'Billing & Revenue',
    definition:
      'A sequential view of how theoretical revenue shrinks at each stage of the billing and collection process. Each step reveals a different type of leakage. The full chain is: Worked Value → Write-Downs → Net Billed → Write-Offs → Collected.',
    formula: null,
    thresholds: null,
    usedIn: ['Financial Deep Dive'],
  },
  {
    id: 'billing-cycle',
    term: 'Billing Cycle',
    category: 'Billing & Revenue',
    definition:
      'How frequently invoices are raised on a matter. Common cycles are Monthly, Quarterly, On Completion (a single invoice at the end), and Milestone (invoices tied to specific deliverables or events).',
    formula: null,
    thresholds: null,
    usedIn: ['Data Management'],
  },
  {
    id: 'budget-overrun',
    term: 'Budget Overrun',
    category: 'Billing & Revenue',
    definition:
      'A matter where hours consumed have outpaced the matter\'s completion percentage by a significant margin. An overrun signals that the matter may exceed its fee estimate, risking a write-down or client dispute.',
    formula: 'Flagged when: hours consumed% > matter completion% + 15 points',
    thresholds: null,
    usedIn: ['Firm Overview'],
  },
  {
    id: 'wip',
    term: 'WIP (Work In Progress)',
    category: 'Billing & Revenue',
    definition:
      'Time that has been worked and recorded but not yet invoiced. High WIP balances can indicate slow billing cycles, matter disputes, or write-down risk. WIP converts to an invoice once billing is approved.',
    formula: null,
    thresholds: null,
    usedIn: ['Profitability', 'Financial Deep Dive'],
  },
  {
    id: 'lock-up',
    term: 'Lock-Up',
    category: 'Billing & Revenue',
    definition:
      'The total amount of firm capital tied up in unbilled work (WIP) and unpaid invoices (debtors) combined. High lock-up puts pressure on firm cash flow even when underlying profitability is healthy.',
    formula: 'WIP Days + Debtor Days',
    thresholds: null,
    usedIn: ['Financial Deep Dive'],
  },

  // ── People & Roles ────────────────────────────────────────────────────────
  {
    id: 'timekeeper',
    term: 'Timekeeper',
    category: 'People & Roles',
    definition:
      'Any lawyer or billable staff member who records time against matters. The term is used industry-wide to describe anyone whose hours generate revenue for the firm, regardless of seniority.',
    formula: null,
    thresholds: null,
    usedIn: ['Firm Overview', 'Profitability', 'Data Management'],
  },
  {
    id: 'partner',
    term: 'Partner',
    category: 'People & Roles',
    definition:
      'The most senior lawyer grade. Partners own client relationships, originate work, supervise matters, and carry responsibility for quality and profitability. In LegalPulse, partners appear as both timekeepers and as the responsible party on matters.',
    formula: null,
    thresholds: null,
    usedIn: ['Profitability', 'Client Intelligence', 'Data Management'],
  },
  {
    id: 'associate',
    term: 'Associate',
    category: 'People & Roles',
    definition:
      'A qualified solicitor working under partner supervision. Associates handle the majority of day-to-day legal work on matters and are billed at a rate below partner level. Grades typically include Senior Associate and Associate.',
    formula: null,
    thresholds: null,
    usedIn: ['Profitability', 'Data Management'],
  },
  {
    id: 'paralegal',
    term: 'Paralegal',
    category: 'People & Roles',
    definition:
      'A non-qualified but billable support professional. Paralegals assist with legal research, document review, due diligence, and procedural tasks. Billed at a lower rate than qualified solicitors.',
    formula: null,
    thresholds: null,
    usedIn: ['Data Management'],
  },
  {
    id: 'responsible-partner',
    term: 'Responsible Partner',
    category: 'People & Roles',
    definition:
      'The partner formally assigned to a specific matter. The responsible partner is accountable for delivery, client communication, and profitability on that engagement. Different from the relationship partner, who owns the broader client relationship.',
    formula: null,
    thresholds: null,
    usedIn: ['Profitability', 'Data Management'],
  },
  {
    id: 'relationship-partner',
    term: 'Relationship Partner',
    category: 'People & Roles',
    definition:
      'The partner who owns the overall client relationship — not necessarily the same as the responsible partner on every matter. The relationship partner is the primary point of contact for the client and is responsible for retention and growth of that client account.',
    formula: null,
    thresholds: null,
    usedIn: ['Client Intelligence', 'Data Management'],
  },

  // ── Matters & Work ────────────────────────────────────────────────────────
  {
    id: 'matter',
    term: 'Matter',
    category: 'Matters & Work',
    definition:
      'A single legal engagement, case, or project carried out for a client. Every time entry, invoice, and budget in the system is tied to a matter. Matters have a type, a practice area, a fee arrangement, and a status (Open or Closed).',
    formula: null,
    thresholds: null,
    usedIn: ['Profitability', 'Financial Deep Dive', 'Data Management'],
  },
  {
    id: 'matter-type',
    term: 'Matter Type',
    category: 'Matters & Work',
    definition:
      'The specific nature of the legal work within a matter — for example: M&A, Contract Review, Litigation, Regulatory Advice, Employment Dispute, or Real Estate Transaction. More granular than practice area.',
    formula: null,
    thresholds: null,
    usedIn: ['Profitability', 'Data Management'],
  },
  {
    id: 'practice-area',
    term: 'Practice Area',
    category: 'Matters & Work',
    definition:
      'A broad legal specialisation grouping. LegalPulse tracks five practice areas: Corporate & M&A, Litigation & Disputes, Employment, Real Estate, and Regulatory & Compliance. Used to analyse profitability and cross-sell coverage.',
    formula: null,
    thresholds: null,
    usedIn: ['Profitability', 'Client Intelligence', 'Financial Deep Dive'],
  },
  {
    id: 'time-entry',
    term: 'Time Entry',
    category: 'Matters & Work',
    definition:
      'A single record of work performed by a timekeeper, capturing the date, matter, hours worked, hours billed, rate applied, and a narrative description. Time entries are the atomic unit of the revenue funnel.',
    formula: null,
    thresholds: null,
    usedIn: ['Profitability', 'Data Management'],
  },
  {
    id: 'narrative',
    term: 'Narrative',
    category: 'Matters & Work',
    definition:
      'The free-text description attached to a time entry explaining what work was done. Narratives appear on invoices and must be sufficiently detailed for clients to understand and approve the charges. Poor narratives are a common cause of write-downs.',
    formula: null,
    thresholds: null,
    usedIn: ['Data Management'],
  },
  {
    id: 'matter-status',
    term: 'Matter Status',
    category: 'Matters & Work',
    definition:
      'Indicates whether a matter is currently active. Open matters are ongoing; Closed matters are completed or terminated. Realisation and profitability analysis typically focuses on closed matters for complete data.',
    formula: null,
    thresholds: null,
    usedIn: ['Data Management', 'Profitability'],
  },

  // ── Health & Risk ─────────────────────────────────────────────────────────
  {
    id: 'market-signal',
    term: 'Market Signal',
    category: 'Health & Risk',
    definition:
      'External intelligence about a client that may affect the relationship — such as a major acquisition, leadership change, regulatory investigation, financial difficulty, or a competitor firm being appointed. Market signals feed into the Client Health Score.',
    formula: null,
    thresholds: null,
    usedIn: ['Client Intelligence'],
  },
  {
    id: 'competitor-foothold',
    term: 'Competitor Foothold',
    category: 'Health & Risk',
    definition:
      'An indicator that a rival firm already serves the same client in one or more practice areas. A strong competitor foothold reduces the firm\'s ability to grow share of wallet and increases retention risk.',
    formula: null,
    thresholds: null,
    usedIn: ['Client Intelligence'],
  },
  {
    id: 'cross-sell-opportunity',
    term: 'Cross-Sell Opportunity',
    category: 'Health & Risk',
    definition:
      'A practice area where a client has estimated annual legal spend but is not currently instructing this firm. Cross-sell gaps represent the most capital-efficient growth path — no new client acquisition required.',
    formula: 'Flagged when: served_by_us = false AND estimated_spend > £100K',
    thresholds: null,
    usedIn: ['Client Intelligence'],
  },
  {
    id: 'at-risk-client',
    term: 'At Risk Client',
    category: 'Health & Risk',
    definition:
      'A client whose health score has fallen below 50, indicating a fragile relationship. Common triggers include declining revenue, high competitor presence, unresolved market signals, or concentration on a single partner or practice area.',
    formula: 'Client Health Score < 50',
    thresholds: null,
    usedIn: ['Client Intelligence', 'Firm Overview'],
  },

  // ── Fee Structures ────────────────────────────────────────────────────────
  {
    id: 'hourly',
    term: 'Hourly Rate',
    category: 'Fee Structures',
    definition:
      'The traditional billing model: the client pays for every hour worked at the timekeeper\'s agreed rate. Hourly matters have the highest realisation risk because clients can challenge individual time entries.',
    formula: null,
    thresholds: null,
    usedIn: ['Profitability', 'Data Management'],
  },
  {
    id: 'fixed-fee',
    term: 'Fixed Fee',
    category: 'Fee Structures',
    definition:
      'An agreed flat amount for the entire matter regardless of actual time spent. Fixed fee matters shift scope risk to the firm — if the work takes longer than estimated, the firm absorbs the overrun.',
    formula: null,
    thresholds: null,
    usedIn: ['Profitability', 'Data Management'],
  },
  {
    id: 'capped-fee',
    term: 'Capped Fee',
    category: 'Fee Structures',
    definition:
      'Hourly billing with a ceiling: the client pays actual hours up to a maximum agreed amount. If the cap is reached, further time is absorbed by the firm. Offers clients cost predictability while retaining upside for the firm on short matters.',
    formula: null,
    thresholds: null,
    usedIn: ['Profitability', 'Data Management'],
  },
  {
    id: 'contingent-fee',
    term: 'Contingent Fee',
    category: 'Fee Structures',
    definition:
      'A fee that is conditional on the outcome — typically a percentage of damages recovered in litigation. Also called a "no win, no fee" arrangement. Realisation cannot be calculated until the matter concludes.',
    formula: null,
    thresholds: null,
    usedIn: ['Profitability', 'Data Management'],
  },
  {
    id: 'blended-rate',
    term: 'Blended Rate',
    category: 'Fee Structures',
    definition:
      'A single agreed hourly rate applied to all timekeepers on a matter, regardless of their individual seniority or standard rate. Simplifies billing for the client and provides the firm flexibility in staffing the matter.',
    formula: null,
    thresholds: null,
    usedIn: ['Profitability', 'Data Management'],
  },
];
