// Whitfield & Partners — Demo Data Generator
// Seeds all 10 canonical tables with intentional patterns for AI agent discovery

import { v4 as uuidv4 } from 'uuid';

const uid = () => uuidv4().slice(0, 8);

// ─── Helpers ───
function randomBetween(min, max) { return Math.round((Math.random() * (max - min) + min) * 100) / 100; }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function dateStr(y, m, d) { return `${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`; }
function randomDate(startMonth, endMonth, year = 2024) {
  const m = Math.floor(Math.random() * (endMonth - startMonth + 1)) + startMonth;
  const d = Math.floor(Math.random() * 28) + 1;
  return dateStr(year, m, d);
}

const PRACTICE_AREAS = ['Corporate/M&A', 'Litigation & Disputes', 'Employment', 'Real Estate', 'Regulatory & Compliance'];
const INDUSTRIES = ['Financial Services', 'Technology', 'Manufacturing', 'Healthcare', 'Energy', 'Retail', 'Professional Services', 'Government'];
const FEE_TYPES = ['Hourly', 'Fixed Fee', 'Capped Fee', 'Blended', 'Contingent'];
const MATTER_STATUSES = ['Open', 'Closed'];
const ROLES = ['Partner', 'Senior Associate', 'Associate', 'Paralegal', 'Trainee'];

// ─── CLIENTS (80) ───
const clientsData = [
  // Large clients (10) - estimated spend > £5M
  { id: 'CLI001', name: 'Meridian Industries', industry: 'Manufacturing', size: 'Enterprise', revenue: 3200000000, partner: 'James Whitfield', status: 'Active' },
  { id: 'CLI002', name: 'Nexus Technologies', industry: 'Technology', size: 'Large', revenue: 890000000, partner: 'Catherine Blake', status: 'Active' },
  { id: 'CLI003', name: 'Barrington Capital', industry: 'Financial Services', size: 'Enterprise', revenue: 5400000000, partner: 'James Whitfield', status: 'Active' },
  { id: 'CLI004', name: 'Sovereign Health Group', industry: 'Healthcare', size: 'Large', revenue: 1800000000, partner: 'David Okonkwo', status: 'Active' },
  { id: 'CLI005', name: 'Atlas Energy PLC', industry: 'Energy', size: 'Enterprise', revenue: 4100000000, partner: 'Rachel Torres', status: 'Active' },
  { id: 'CLI006', name: 'Wellington Retail Holdings', industry: 'Retail', size: 'Large', revenue: 2600000000, partner: 'Catherine Blake', status: 'Active' },
  { id: 'CLI007', name: 'Fortis Financial Group', industry: 'Financial Services', size: 'Enterprise', revenue: 7200000000, partner: 'James Whitfield', status: 'Active' },
  { id: 'CLI008', name: 'Pinnacle Properties', industry: 'Real Estate', size: 'Large', revenue: 1200000000, partner: 'Michael Chen', status: 'Active' },
  { id: 'CLI009', name: 'Vanguard Pharmaceuticals', industry: 'Healthcare', size: 'Enterprise', revenue: 6800000000, partner: 'David Okonkwo', status: 'Active' },
  { id: 'CLI010', name: 'Crestview Manufacturing', industry: 'Manufacturing', size: 'Large', revenue: 980000000, partner: 'Rachel Torres', status: 'Active' },
  // Mid-size clients (25)
  { id: 'CLI011', name: 'TechBridge Solutions', industry: 'Technology', size: 'Mid-Market', revenue: 340000000, partner: 'Catherine Blake', status: 'Active' },
  { id: 'CLI012', name: 'Northern Trust Advisors', industry: 'Financial Services', size: 'Mid-Market', revenue: 560000000, partner: 'James Whitfield', status: 'Active' },
  { id: 'CLI013', name: 'GreenField Developments', industry: 'Real Estate', size: 'Mid-Market', revenue: 280000000, partner: 'Michael Chen', status: 'Active' },
  { id: 'CLI014', name: 'Horizon Logistics', industry: 'Manufacturing', size: 'Mid-Market', revenue: 420000000, partner: 'Rachel Torres', status: 'Active' },
  { id: 'CLI015', name: 'MedCore Diagnostics', industry: 'Healthcare', size: 'Mid-Market', revenue: 190000000, partner: 'David Okonkwo', status: 'Active' },
  { id: 'CLI016', name: 'ClearView Analytics', industry: 'Technology', size: 'Mid-Market', revenue: 150000000, partner: 'Catherine Blake', status: 'Active' },
  // Hidden gems - modest revenue but high total legal spend potential
  { id: 'CLI017', name: 'Quantum Digital', industry: 'Technology', size: 'Mid-Market', revenue: 520000000, partner: 'Catherine Blake', status: 'Active' },
  { id: 'CLI018', name: 'Sterling Biotech', industry: 'Healthcare', size: 'Mid-Market', revenue: 380000000, partner: 'David Okonkwo', status: 'Active' },
  { id: 'CLI019', name: 'Pacific Energy Corp', industry: 'Energy', size: 'Mid-Market', revenue: 290000000, partner: 'Rachel Torres', status: 'Active' },
  { id: 'CLI020', name: 'Redwood Capital', industry: 'Financial Services', size: 'Mid-Market', revenue: 440000000, partner: 'James Whitfield', status: 'Active' },
  { id: 'CLI021', name: 'Apex Construction', industry: 'Real Estate', size: 'Mid-Market', revenue: 310000000, partner: 'Michael Chen', status: 'Active' },
  { id: 'CLI022', name: 'FreshMart Group', industry: 'Retail', size: 'Mid-Market', revenue: 680000000, partner: 'Catherine Blake', status: 'Active' },
  { id: 'CLI023', name: 'Emerald Mining', industry: 'Energy', size: 'Mid-Market', revenue: 250000000, partner: 'Rachel Torres', status: 'Active' },
  { id: 'CLI024', name: 'Beacon Insurance', industry: 'Financial Services', size: 'Mid-Market', revenue: 820000000, partner: 'James Whitfield', status: 'Active' },
  { id: 'CLI025', name: 'Unity Healthcare', industry: 'Healthcare', size: 'Mid-Market', revenue: 470000000, partner: 'David Okonkwo', status: 'Active' },
  { id: 'CLI026', name: 'Ironworks Manufacturing', industry: 'Manufacturing', size: 'Mid-Market', revenue: 360000000, partner: 'Rachel Torres', status: 'Active' },
  { id: 'CLI027', name: 'DataStream Corp', industry: 'Technology', size: 'Mid-Market', revenue: 280000000, partner: 'Catherine Blake', status: 'Active' },
  { id: 'CLI028', name: 'Prime Retail PLC', industry: 'Retail', size: 'Mid-Market', revenue: 540000000, partner: 'Catherine Blake', status: 'Active' },
  { id: 'CLI029', name: 'Civic Infrastructure', industry: 'Government', size: 'Mid-Market', revenue: 0, partner: 'Michael Chen', status: 'Active' },
  { id: 'CLI030', name: 'Trident Consulting', industry: 'Professional Services', size: 'Mid-Market', revenue: 180000000, partner: 'James Whitfield', status: 'Active' },
  { id: 'CLI031', name: 'Evergreen Properties', industry: 'Real Estate', size: 'Mid-Market', revenue: 230000000, partner: 'Michael Chen', status: 'Active' },
  { id: 'CLI032', name: 'Nova Aerospace', industry: 'Manufacturing', size: 'Mid-Market', revenue: 490000000, partner: 'Rachel Torres', status: 'Active' },
  { id: 'CLI033', name: 'SafeGuard Compliance', industry: 'Financial Services', size: 'Mid-Market', revenue: 320000000, partner: 'James Whitfield', status: 'Active' },
  { id: 'CLI034', name: 'HealthFirst Network', industry: 'Healthcare', size: 'Mid-Market', revenue: 410000000, partner: 'David Okonkwo', status: 'Active' },
  { id: 'CLI035', name: 'Oasis Energy', industry: 'Energy', size: 'Mid-Market', revenue: 370000000, partner: 'Rachel Torres', status: 'Active' },
  // Smaller clients (45) - abbreviated for space
  ...Array.from({ length: 45 }, (_, i) => ({
    id: `CLI${String(36 + i).padStart(3, '0')}`,
    name: `${pick(['Alpine','Brook','Cedar','Drake','Echo','Falcon','Grove','Harbor','Iris','Jade','Kent','Luna','Metro','Nash','Opal','Penn','Quinn','Ridge','Stone','Thorn','Urban','Vale','West','York','Zenith'])} ${pick(['Partners','Holdings','Group','Ltd','Corp','PLC','Ventures','Associates','Capital','Industries'])}`,
    industry: pick(INDUSTRIES),
    size: 'Small',
    revenue: randomBetween(20000000, 200000000),
    partner: pick(['James Whitfield', 'Catherine Blake', 'David Okonkwo', 'Rachel Torres', 'Michael Chen', 'Sarah Mitchell', 'Robert Hayes', 'Emma Foster']),
    status: pick(['Active', 'Active', 'Active', 'Inactive']),
  })),
];

// ─── TIMEKEEPERS (120) ───
const partnerNames = {
  'Corporate/M&A': ['James Whitfield', 'Catherine Blake', 'Robert Hayes', 'Emma Foster'],
  'Litigation & Disputes': ['David Okonkwo', 'Sarah Mitchell', 'Thomas Grant', 'Priya Sharma'],
  'Employment': ['Rachel Torres', 'Andrew McNeil', 'Lucy Crawford', 'Hassan Ali'],
  'Real Estate': ['Michael Chen', 'Fiona Douglas', 'Patrick Walsh', 'Yuki Tanaka'],
  'Regulatory & Compliance': ['Olivia Martin', 'Daniel Burke', 'Sophia Lee', 'Marcus Young'],
};

function generateTimekeepers() {
  const tks = [];
  const firstNames = ['Alexander','Benjamin','Charlotte','Diana','Edward','Francesca','George','Hannah','Isaac','Julia','Kevin','Laura','Matthew','Natasha','Oliver','Patricia','Quentin','Rebecca','Samuel','Tanya','Ursula','Victor','William','Xena','Yasmine','Zara'];
  const lastNames = ['Adams','Brown','Clark','Davis','Evans','Fisher','Green','Hughes','Irving','Jones','King','Lewis','Moore','Nelson','Owen','Parker','Reid','Scott','Taylor','Upton','Vincent','Ward','Xavier','York','Zhang'];

  // Partners
  for (const [pa, names] of Object.entries(partnerNames)) {
    names.forEach((name, idx) => {
      tks.push({
        id: `TK${String(tks.length + 1).padStart(3, '0')}`,
        name, role: 'Partner', practice_area: pa,
        standard_rate: randomBetween(550, 750), cost_rate: randomBetween(180, 250),
        seniority_years: randomBetween(15, 30),
      });
    });
  }

  // Other roles
  const roleDist = [
    { role: 'Senior Associate', count: 25, rateMin: 350, rateMax: 500, costMin: 120, costMax: 170, senMin: 6, senMax: 12 },
    { role: 'Associate', count: 35, rateMin: 200, rateMax: 350, costMin: 80, costMax: 120, senMin: 2, senMax: 6 },
    { role: 'Paralegal', count: 20, rateMin: 150, rateMax: 200, costMin: 60, costMax: 85, senMin: 1, senMax: 10 },
    { role: 'Trainee', count: 20, rateMin: 100, rateMax: 160, costMin: 40, costMax: 65, senMin: 0, senMax: 2 },
  ];

  for (const rd of roleDist) {
    for (let i = 0; i < rd.count; i++) {
      tks.push({
        id: `TK${String(tks.length + 1).padStart(3, '0')}`,
        name: `${pick(firstNames)} ${pick(lastNames)}`,
        role: rd.role, practice_area: pick(PRACTICE_AREAS),
        standard_rate: randomBetween(rd.rateMin, rd.rateMax),
        cost_rate: randomBetween(rd.costMin, rd.costMax),
        seniority_years: Math.floor(randomBetween(rd.senMin, rd.senMax)),
      });
    }
  }
  return tks;
}

// ─── MATTERS (400) ───
function generateMatters(clients) {
  const matters = [];
  const matterTypes = {
    'Corporate/M&A': ['Acquisition', 'Merger', 'Joint Venture', 'Share Purchase', 'Due Diligence', 'Corporate Restructuring', 'IPO Advisory'],
    'Litigation & Disputes': ['Contract Dispute', 'Commercial Litigation', 'Arbitration', 'Regulatory Investigation', 'Class Action Defence', 'IP Litigation'],
    'Employment': ['Employment Tribunal', 'Restructuring & Redundancy', 'Executive Compensation', 'Discrimination Claim', 'TUPE Transfer', 'Workplace Investigation'],
    'Real Estate': ['Property Acquisition', 'Development Project', 'Lease Negotiation', 'Planning Permission', 'Property Finance', 'Portfolio Management'],
    'Regulatory & Compliance': ['FCA Compliance', 'Data Protection', 'Anti-Bribery Review', 'Environmental Compliance', 'Licensing', 'Sanctions Advisory'],
  };

  let mIdx = 1;
  // Distribute matters: large clients get 8-15, mid get 3-8, small get 1-4
  for (const c of clients) {
    let count;
    if (c.size === 'Enterprise' || c.size === 'Large') count = Math.floor(randomBetween(8, 15));
    else if (c.size === 'Mid-Market') count = Math.floor(randomBetween(3, 8));
    else count = Math.floor(randomBetween(1, 4));

    for (let i = 0; i < count && mIdx <= 400; i++) {
      const pa = pick(PRACTICE_AREAS);
      const mt = pick(matterTypes[pa]);
      const isOpen = Math.random() < 0.6;
      const openDate = randomDate(1, 6, 2024);

      // Intentional pattern: Corporate fixed-fee scope creep for large clients
      let fee = pick(FEE_TYPES);
      if (pa === 'Corporate/M&A' && c.id === 'CLI001' && i < 3) fee = 'Fixed Fee';

      const budget = pa === 'Litigation & Disputes' ? randomBetween(80000, 500000) :
                     pa === 'Corporate/M&A' ? randomBetween(50000, 400000) :
                     pa === 'Real Estate' ? randomBetween(40000, 300000) :
                     randomBetween(20000, 200000);

      // Close date must be strictly after open date — pick from the month AFTER
      // open, clamped to our Sep-2024 ceiling. Prevents illogical ordering
      // where matters close before they begin.
      let closeDate = null;
      if (!isOpen) {
        const openMonth = parseInt(openDate.split('-')[1], 10);
        const closeStart = Math.min(openMonth + 1, 9);
        closeDate = randomDate(closeStart, 9, 2024);
      }

      matters.push({
        id: `MAT${String(mIdx).padStart(3, '0')}`,
        client_id: c.id, matter_name: `${c.name} — ${mt}`,
        matter_type: mt, practice_area: pa, fee_arrangement: fee,
        status: isOpen ? 'Open' : 'Closed',
        open_date: openDate,
        close_date: closeDate,
        budget_amount: budget,
        budget_hours: Math.round(budget / 350),
        responsible_partner: pick(partnerNames[pa]),
      });
      mIdx++;
    }
  }
  return matters;
}

// ─── TIME ENTRIES ───
function generateTimeEntries(matters, timekeepers) {
  const entries = [];
  let eIdx = 1;

  for (const m of matters) {
    const tkPool = timekeepers.filter(t => t.practice_area === m.practice_area);
    if (tkPool.length === 0) continue;
    const entryCount = Math.floor(randomBetween(5, 25));

    for (let i = 0; i < entryCount; i++) {
      const tk = pick(tkPool);
      const hw = randomBetween(0.5, 8);
      let hb = hw;

      // Pattern: Corporate/M&A has more unbilled hours (scope creep on fixed fee)
      if (m.practice_area === 'Corporate/M&A' && m.fee_arrangement === 'Fixed Fee') {
        hb = hw * randomBetween(0.4, 0.7); // bill much less than worked
      } else {
        hb = hw * randomBetween(0.85, 1.0);
      }
      hb = Math.round(hb * 100) / 100;

      const rate = tk.standard_rate;
      const amount = Math.round(hb * rate * 100) / 100;

      entries.push({
        id: `TE${String(eIdx++).padStart(5, '0')}`,
        matter_id: m.id, timekeeper_id: tk.id,
        date: randomDate(1, 9, 2024),
        hours_worked: hw, hours_billed: hb,
        narrative: pick([
          'Review and analysis of documentation',
          'Client conference call',
          'Drafting and revision of key documents',
          'Research on applicable regulations',
          'Preparation of board materials',
          'Due diligence review',
          'Witness statement preparation',
          'Contract negotiation and mark-up',
          'Court filing preparation',
          'Internal strategy meeting',
          'Correspondence with counterparty',
          'Preparation of closing documents',
        ]),
        rate_applied: rate, amount,
      });
    }
  }
  return entries;
}

// ─── BILLING INVOICES ───
// IMPORTANT: invoices are anchored to the matter's ACTUAL recorded worked value
// so that realisation math (Collected ÷ Worked) produces sensible 0-100%
// figures. Previously gross_amount was a random £5-120K per invoice,
// unrelated to time entries, which made realisation percentages meaningless.
function generateInvoices(matters, clients, timeEntries) {
  // Build a per-matter total of hours_billed × rate so we know how much
  // this matter could legitimately be invoiced for.
  const workedByMatter = {};
  for (const te of timeEntries) {
    workedByMatter[te.matter_id] = (workedByMatter[te.matter_id] || 0) + te.amount;
  }

  const invoices = [];
  let iIdx = 1;
  for (const m of matters) {
    const matterWorked = workedByMatter[m.id] || 0;
    if (matterWorked <= 0) continue; // no time recorded → no invoice

    const invCount = m.status === 'Closed' ? Math.floor(randomBetween(2, 5)) : Math.floor(randomBetween(1, 3));

    // Split the matter's worked value across invCount invoices with small noise.
    // Average gross per invoice ≈ matterWorked / invCount × (0.92..1.05).
    // The small over-invoicing variance models real-firm behaviour where
    // some work is billed at a premium (disbursements, mark-ups).
    for (let i = 0; i < invCount; i++) {
      const gross = (matterWorked / invCount) * randomBetween(0.92, 1.05);
      let writeOff = 0;
      let writeDown = 0;

      // Pattern: Sarah Mitchell (Litigation) has 3× firm-average write-offs
      if (m.responsible_partner === 'Sarah Mitchell' && m.practice_area === 'Litigation & Disputes') {
        writeOff = gross * randomBetween(0.12, 0.25);
        writeDown = gross * randomBetween(0.05, 0.12);
      } else if (m.fee_arrangement === 'Fixed Fee' && m.practice_area === 'Corporate/M&A') {
        // Corporate fixed fee also shows elevated write-offs — scope creep
        writeOff = gross * randomBetween(0.08, 0.18);
        writeDown = gross * randomBetween(0.03, 0.08);
      } else {
        // Background rate — most invoices take small or zero adjustments
        writeOff = Math.random() < 0.2 ? gross * randomBetween(0.01, 0.06) : 0;
        writeDown = Math.random() < 0.15 ? gross * randomBetween(0.01, 0.04) : 0;
      }

      const netBilled = gross - writeOff - writeDown;
      // Closed matters collect 88-100% of net billed; open matters 40-95%
      const collected = m.status === 'Closed'
        ? netBilled * randomBetween(0.88, 1.0)
        : netBilled * randomBetween(0.4, 0.95);

      invoices.push({
        id: `INV${String(iIdx++).padStart(4, '0')}`,
        matter_id: m.id, client_id: m.client_id,
        invoice_date: randomDate(2, 9, 2024),
        gross_amount: Math.round(gross), write_off: Math.round(writeOff),
        write_down: Math.round(writeDown), net_billed: Math.round(netBilled),
        amount_collected: Math.round(collected),
        collection_date: collected > 0 ? randomDate(3, 9, 2024) : null,
      });
    }
  }
  return invoices;
}

// ─── BUDGET TRACKING ───
function generateBudgetTracking(matters) {
  const tracking = [];
  let tIdx = 1;
  // Quarter → (startMonth, endMonth) range so we can test whether a matter
  // was active during a given quarter.
  const periods = [
    { name: '2024-Q1', start: 1, end: 3 },
    { name: '2024-Q2', start: 4, end: 6 },
    { name: '2024-Q3', start: 7, end: 9 },
  ];

  for (const m of matters.filter(m => m.budget_amount)) {
    const openMonth = parseInt(m.open_date.split('-')[1], 10);
    const closeMonth = m.close_date ? parseInt(m.close_date.split('-')[1], 10) : 12;
    let cumBudgetPct = 0;

    for (const { name: period, start, end } of periods) {
      // Skip quarters where the matter wasn't active at all — prevents
      // phantom overruns on matters that opened later in the year.
      if (end < openMonth || start > closeMonth) continue;

      const budgetedHrs = (m.budget_hours || 100) / 3;
      let actualHrs = budgetedHrs * randomBetween(0.7, 1.2);
      let budgetedAmt = (m.budget_amount || 50000) / 3;
      let actualAmt = budgetedAmt * randomBetween(0.7, 1.2);

      // Pattern: Real Estate matters trending 25% over budget
      if (m.practice_area === 'Real Estate' && m.matter_type === 'Development Project') {
        actualHrs = budgetedHrs * randomBetween(1.1, 1.4);
        actualAmt = budgetedAmt * randomBetween(1.1, 1.4);
      }

      cumBudgetPct += (actualAmt / m.budget_amount) * 100;
      const estCompletion = period === '2024-Q1' ? randomBetween(20, 35) :
                            period === '2024-Q2' ? randomBetween(40, 60) :
                            randomBetween(65, 85);

      tracking.push({
        id: `BT${String(tIdx++).padStart(4, '0')}`,
        matter_id: m.id, period,
        budgeted_hours: Math.round(budgetedHrs * 10) / 10,
        actual_hours: Math.round(actualHrs * 10) / 10,
        budgeted_amount: Math.round(budgetedAmt),
        actual_amount: Math.round(actualAmt),
        cumulative_budget_consumed_pct: Math.round(cumBudgetPct * 10) / 10,
        estimated_completion_pct: Math.round(estCompletion),
      });
    }
  }
  return tracking;
}

// ─── WALLET ESTIMATES ───
function generateWalletEstimates(clients) {
  const estimates = [];
  let eIdx = 1;
  const legalSpendPct = {
    'Manufacturing': 0.004, 'Technology': 0.005, 'Financial Services': 0.006,
    'Healthcare': 0.005, 'Energy': 0.004, 'Retail': 0.003,
    'Real Estate': 0.005, 'Professional Services': 0.004, 'Government': 0.003,
  };

  for (const c of clients.filter(c => c.revenue > 0)) {
    const pct = legalSpendPct[c.industry] || 0.004;
    const totalSpend = c.revenue * pct;
    // Our revenue varies by client size
    let ourRev;
    if (c.size === 'Enterprise') ourRev = totalSpend * randomBetween(0.05, 0.15);
    else if (c.size === 'Large') ourRev = totalSpend * randomBetween(0.1, 0.25);
    else if (c.size === 'Mid-Market') ourRev = totalSpend * randomBetween(0.1, 0.35);
    else ourRev = totalSpend * randomBetween(0.15, 0.5);

    // Pattern: Meridian Industries — massive wallet gap (£1.2M of £14M)
    if (c.id === 'CLI001') { ourRev = 1200000; }
    // Pattern: Nexus Technologies — declining revenue
    if (c.id === 'CLI002') { ourRev = 280000; }
    // Hidden gems
    if (c.id === 'CLI017') { ourRev = 180000; }
    if (c.id === 'CLI018') { ourRev = 150000; }

    const sow = totalSpend > 0 ? Math.round((ourRev / totalSpend) * 10000) / 100 : 0;

    estimates.push({
      id: `WE${String(eIdx++).padStart(3, '0')}`,
      client_id: c.id, period: '2024',
      estimated_total_legal_spend: Math.round(totalSpend),
      estimation_method: pick(['Industry Benchmark', 'Public Filing', 'Peer Comparison', 'Direct Intelligence']),
      confidence: c.size === 'Enterprise' || c.size === 'Large' ? 'High' : pick(['Medium', 'Low']),
      our_revenue: Math.round(ourRev),
      share_of_wallet_pct: sow,
      data_source_notes: `Based on ${c.industry} sector analysis and company revenue of £${(c.revenue / 1000000).toFixed(0)}M`,
    });
  }
  return estimates;
}

// ─── PRACTICE COVERAGE ───
function generatePracticeCoverage(clients, matters) {
  const coverage = [];
  let cIdx = 1;
  const competitors = ['Clifford Chance', 'Linklaters', 'Allen & Overy', 'Herbert Smith', 'Ashurst', 'DLA Piper', 'Eversheds', 'Hogan Lovells'];

  for (const c of clients.slice(0, 35)) { // Top 35 clients
    const servedAreas = [...new Set(matters.filter(m => m.client_id === c.id).map(m => m.practice_area))];
    for (const pa of PRACTICE_AREAS) {
      const served = servedAreas.includes(pa);
      const estSpend = served ? randomBetween(50000, 500000) : randomBetween(100000, 2000000);

      coverage.push({
        id: `PC${String(cIdx++).padStart(3, '0')}`,
        client_id: c.id, practice_area: pa,
        served_by_us: served ? 1 : 0,
        estimated_client_spend: Math.round(estSpend),
        known_competitor: served ? null : pick(competitors),
        source: pick(['Directory research', 'Market intelligence', 'Client conversation', 'Annual report']),
      });
    }
  }
  return coverage;
}

// ─── MARKET SIGNALS ───
function generateMarketSignals(clients) {
  const signals = [];
  let sIdx = 1;
  const competitors = ['Clifford Chance', 'Linklaters', 'Allen & Overy', 'Herbert Smith', 'Ashurst', 'DLA Piper'];

  // Pattern: Nexus Technologies — competitor threat signals
  signals.push({
    id: `MS${String(sIdx++).padStart(3, '0')}`, client_id: 'CLI002',
    signal_date: '2024-07-15', signal_type: 'Directory Ranking',
    source: 'Chambers UK 2024', content: 'Ashurst ranked Band 1 for Technology sector — direct overlap with our Nexus Technologies work',
    competitor: 'Ashurst', severity: 'High',
  });
  signals.push({
    id: `MS${String(sIdx++).padStart(3, '0')}`, client_id: 'CLI002',
    signal_date: '2024-08-02', signal_type: 'Lateral Hire',
    source: 'Legal Week', content: 'DLA Piper hires partner who previously led technology practice at firm handling Nexus Technologies regulatory work',
    competitor: 'DLA Piper', severity: 'High',
  });

  // General market signals
  const signalTemplates = [
    { type: 'Directory Ranking', content: '{comp} ranked for {industry} sector in Legal 500', severity: 'Medium' },
    { type: 'Panel Appointment', content: '{comp} appointed to {client} legal panel for {pa}', severity: 'High' },
    { type: 'Lateral Hire', content: '{comp} hires senior {pa} partner from competitor', severity: 'Medium' },
    { type: 'News Mention', content: '{comp} wins major {industry} mandate', severity: 'Low' },
    { type: 'Award', content: '{comp} wins Law Firm of the Year for {pa}', severity: 'Low' },
    { type: 'Client Announcement', content: '{client} announces major restructuring — potential new legal needs', severity: 'Medium' },
  ];

  for (let i = 0; i < 30; i++) {
    const tmpl = pick(signalTemplates);
    const client = pick(clients.slice(0, 20));
    const comp = pick(competitors);
    signals.push({
      id: `MS${String(sIdx++).padStart(3, '0')}`,
      client_id: client.id,
      signal_date: randomDate(1, 9, 2024),
      signal_type: tmpl.type,
      source: pick(['Chambers 2024', 'Legal 500', 'Legal Week', 'The Lawyer', 'Law.com', 'Company announcement']),
      content: tmpl.content.replace('{comp}', comp).replace('{client}', client.name).replace('{industry}', client.industry).replace('{pa}', pick(PRACTICE_AREAS)),
      competitor: comp, severity: tmpl.severity,
    });
  }
  return signals;
}

// ─── FEE ARRANGEMENTS ───
function generateFeeArrangements(matters) {
  return matters.map((m, i) => ({
    id: `FA${String(i + 1).padStart(3, '0')}`,
    matter_id: m.id,
    arrangement_type: m.fee_arrangement,
    fixed_amount: m.fee_arrangement === 'Fixed Fee' ? m.budget_amount * randomBetween(0.8, 1.0) : null,
    cap_amount: m.fee_arrangement === 'Capped Fee' ? m.budget_amount * randomBetween(0.9, 1.1) : null,
    discount_pct: m.fee_arrangement === 'Blended' ? randomBetween(5, 20) : null,
    billing_cycle: pick(['Monthly', 'Quarterly', 'On Completion', 'Milestone']),
    notes: null,
  }));
}

// ─── SEED INTO DB ───
export function seedDummyData(db) {
  // Check if data exists
  const existing = db.prepare("SELECT COUNT(*) as c FROM clients WHERE is_sample_data = 1").get();
  if (existing && existing.c > 0) return;

  console.log('Seeding Whitfield & Partners demo data...');

  const timekeepers = generateTimekeepers();
  const matters = generateMatters(clientsData);
  const timeEntries = generateTimeEntries(matters, timekeepers);
  const invoices = generateInvoices(matters, clientsData, timeEntries);
  const budgetTracking = generateBudgetTracking(matters);
  const walletEstimates = generateWalletEstimates(clientsData);
  const practiceCoverage = generatePracticeCoverage(clientsData, matters);
  const marketSignals = generateMarketSignals(clientsData);
  const feeArrangements = generateFeeArrangements(matters);

  // Insert clients
  for (const c of clientsData) {
    db.prepare(`INSERT INTO clients (client_id, name, industry, size_band, country, annual_revenue, relationship_partner, status, is_sample_data) VALUES (?,?,?,?,?,?,?,?,1)`)
      .run(c.id, c.name, c.industry, c.size, 'UK', c.revenue, c.partner, c.status);
  }

  // Insert timekeepers
  for (const t of timekeepers) {
    db.prepare(`INSERT INTO timekeepers (timekeeper_id, name, role, practice_area, standard_rate, cost_rate, seniority_years, status, is_sample_data) VALUES (?,?,?,?,?,?,?,?,1)`)
      .run(t.id, t.name, t.role, t.practice_area, t.standard_rate, t.cost_rate, t.seniority_years, 'Active');
  }

  // Insert matters
  for (const m of matters) {
    db.prepare(`INSERT INTO matters (matter_id, client_id, matter_name, matter_type, practice_area, fee_arrangement, status, open_date, close_date, budget_amount, budget_hours, responsible_partner, is_sample_data) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,1)`)
      .run(m.id, m.client_id, m.matter_name, m.matter_type, m.practice_area, m.fee_arrangement, m.status, m.open_date, m.close_date, m.budget_amount, m.budget_hours, m.responsible_partner);
  }

  // Insert fee arrangements
  for (const f of feeArrangements) {
    db.prepare(`INSERT INTO fee_arrangements (arrangement_id, matter_id, arrangement_type, fixed_amount, cap_amount, discount_pct, billing_cycle, notes, is_sample_data) VALUES (?,?,?,?,?,?,?,?,1)`)
      .run(f.id, f.matter_id, f.arrangement_type, f.fixed_amount, f.cap_amount, f.discount_pct, f.billing_cycle, f.notes);
  }

  // Insert time entries
  for (const e of timeEntries) {
    db.prepare(`INSERT INTO time_entries (entry_id, matter_id, timekeeper_id, date, hours_worked, hours_billed, narrative, rate_applied, amount, is_sample_data) VALUES (?,?,?,?,?,?,?,?,?,1)`)
      .run(e.id, e.matter_id, e.timekeeper_id, e.date, e.hours_worked, e.hours_billed, e.narrative, e.rate_applied, e.amount);
  }

  // Insert invoices
  for (const inv of invoices) {
    db.prepare(`INSERT INTO billing_invoices (invoice_id, matter_id, client_id, invoice_date, gross_amount, write_off, write_down, net_billed, amount_collected, collection_date, is_sample_data) VALUES (?,?,?,?,?,?,?,?,?,?,1)`)
      .run(inv.id, inv.matter_id, inv.client_id, inv.invoice_date, inv.gross_amount, inv.write_off, inv.write_down, inv.net_billed, inv.amount_collected, inv.collection_date);
  }

  // Insert budget tracking
  for (const bt of budgetTracking) {
    db.prepare(`INSERT INTO budget_tracking (tracking_id, matter_id, period, budgeted_hours, actual_hours, budgeted_amount, actual_amount, cumulative_budget_consumed_pct, estimated_completion_pct, is_sample_data) VALUES (?,?,?,?,?,?,?,?,?,1)`)
      .run(bt.id, bt.matter_id, bt.period, bt.budgeted_hours, bt.actual_hours, bt.budgeted_amount, bt.actual_amount, bt.cumulative_budget_consumed_pct, bt.estimated_completion_pct);
  }

  // Insert wallet estimates
  for (const we of walletEstimates) {
    db.prepare(`INSERT INTO client_wallet_estimates (estimate_id, client_id, period, estimated_total_legal_spend, estimation_method, confidence, our_revenue, share_of_wallet_pct, data_source_notes, is_sample_data) VALUES (?,?,?,?,?,?,?,?,?,1)`)
      .run(we.id, we.client_id, we.period, we.estimated_total_legal_spend, we.estimation_method, we.confidence, we.our_revenue, we.share_of_wallet_pct, we.data_source_notes);
  }

  // Insert practice coverage
  for (const pc of practiceCoverage) {
    db.prepare(`INSERT INTO practice_coverage (coverage_id, client_id, practice_area, served_by_us, estimated_client_spend, known_competitor, source, is_sample_data) VALUES (?,?,?,?,?,?,?,1)`)
      .run(pc.id, pc.client_id, pc.practice_area, pc.served_by_us, pc.estimated_client_spend, pc.known_competitor, pc.source);
  }

  // Insert market signals
  for (const ms of marketSignals) {
    db.prepare(`INSERT INTO market_signals (signal_id, client_id, signal_date, signal_type, source, content, competitor, severity, is_sample_data) VALUES (?,?,?,?,?,?,?,?,1)`)
      .run(ms.id, ms.client_id, ms.signal_date, ms.signal_type, ms.source, ms.content, ms.competitor, ms.severity);
  }

  console.log(`Seeded: ${clientsData.length} clients, ${timekeepers.length} timekeepers, ${matters.length} matters, ${timeEntries.length} time entries, ${invoices.length} invoices, ${budgetTracking.length} budget records, ${walletEstimates.length} wallet estimates, ${practiceCoverage.length} coverage records, ${marketSignals.length} signals`);
}
