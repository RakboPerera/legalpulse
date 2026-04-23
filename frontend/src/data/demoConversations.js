// Pre-recorded conversations used in the Chat page's demo gallery.
// Every response below was produced by the actual live AI chat endpoint
// against the seeded Whitfield & Partners dataset during end-to-end testing.
// They demonstrate real capabilities — grounded numbers, cited names,
// honest truncation disclosure, and the hallucination guard — without
// requiring the viewer to supply their own API key.
//
// When loaded, each conversation is replayed into the chat as two messages:
// the user's question and the assistant's response. If the viewer has an
// API key connected, they can then ask a follow-up and the AI will see the
// demo as conversation history.

export const DEMO_CONVERSATIONS = [
  {
    id: 'overall-realisation',
    title: 'Where is revenue leaking?',
    category: 'Profitability',
    color: 'amber',
    icon: 'TrendingDown',
    capability: 'Firm-wide + per-practice aggregation, cited £/%',
    question: "What is the firm's overall realisation rate, and which practice area performs worst?",
    response: `**Overall Realisation Rate:** The firm's overall realisation rate is **73.8%** (£4,640,303 collected ÷ £6,285,445.64 worked).

**Worst Performing Practice Area:** **Corporate/M&A** has the lowest realisation at **71.32%** — they worked £1,311,644 but collected only £935,517, leaving £376,127 on the table.

**Evidence from the data:**
- Corporate/M&A: 71.32% realisation
- Employment: 71.95% realisation
- Litigation & Disputes: 74.57% realisation
- Real Estate: 76.81% realisation (best performing)
- Regulatory & Compliance: 75.06% realisation

**Recommendation:** Investigate Corporate/M&A billing practices immediately. The practice is below the 75% threshold that indicates concern. Start with the top write-off culprits — Catherine Blake (£18,937), Emma Foster (£14,426), Robert Hayes (£7,259), and James Whitfield (£4,690) are all Corporate/M&A partners/timekeepers. Review their pricing arrangements, scope management, and client communications to identify whether issues stem from discounting, write-offs, or collection problems.`,
  },
  {
    id: 'fee-arrangement',
    title: 'Fixed-fee vs Hourly — which actually makes money?',
    category: 'Profitability',
    color: 'blue',
    icon: 'Scale',
    capability: 'Fee-arrangement breakdown with write-off rate analysis',
    question: "Compare fixed-fee vs hourly profitability. Which is more profitable and why?",
    response: `## Fixed-Fee vs Hourly Profitability Comparison

**Insight:** Hourly arrangements are marginally more profitable than Fixed Fee, with 73.69% realisation versus 72.87%, but Fixed Fee suffers from significantly higher write-off problems.

**Evidence:**
- **Hourly:** 68 matters, £1,228,583 worked value, £905,359 collected, **73.69% realisation**, £22,438 write-offs (**1.83% write-off rate**)
- **Fixed Fee:** 82 matters, £1,497,434 worked value, £1,091,143 collected, **72.87% realisation**, £59,974 write-offs (**4.01% write-off rate**)

The critical difference isn't the realisation rate (only 0.82 percentage points apart) — it's the write-off rate. Fixed Fee arrangements generate write-offs at **more than double the rate** of Hourly (4.01% vs 1.83%), suggesting systematic scope creep or poor scoping discipline.

**Recommendation:**
1. **Audit Fixed Fee scoping processes** — £59,974 in write-offs indicates matters consistently overrun agreed scope
2. **Implement stricter change-order protocols** for Fixed Fee work to capture scope variations before they become write-offs
3. **Consider risk-adjusting Fixed Fee pricing upward** by 5-10% on complex matters to absorb realistic scope uncertainty
4. **Flag Fixed Fee matters over 80% consumed** for immediate partner review and client communication about variations

The £36,851 difference in write-offs (£59,974 vs £22,438) represents recoverable revenue lost to poor Fixed Fee management.`,
  },
  {
    id: 'cross-sell',
    title: 'Where are the biggest growth opportunities?',
    category: 'Growth',
    color: 'green',
    icon: 'Target',
    capability: 'Cross-sell ranking with named competitors',
    question: "What are the biggest cross-sell opportunities across our client base?",
    response: `## Biggest Cross-Sell Opportunities

**Insight:** We have 49 identified cross-sell opportunities across our client base, with the top prospects representing £1.65M–£1.90M in estimated annual spend currently going to competitors.

**Evidence:**

The largest immediate opportunities are:

1. **Evergreen Properties** (Real Estate industry) — £1,899,773 estimated spend in Corporate/M&A going to DLA Piper
2. **Fortis Financial Group** (Financial Services) — £1,855,061 in Real Estate work going to Herbert Smith
3. **TechBridge Solutions** (Technology) — £1,852,621 in Employment going to Ashurst
4. **Oasis Energy** (Energy) — £1,777,772 in Litigation & Disputes going to Hogan Lovells
5. **Pacific Energy Corp** (Energy) — £1,698,859 in Regulatory & Compliance going to Hogan Lovells
6. **Horizon Logistics** (Manufacturing) — £1,683,203 in Real Estate going to DLA Piper
7. **Prime Retail PLC** (Retail) — £1,679,318 in Litigation & Disputes going to Clifford Chance
8. **Unity Healthcare** (Healthcare) — £1,651,343 in Regulatory & Compliance going to Linklaters

These top 8 alone represent **£13.9M in addressable revenue** currently with competitors.

**Recommendation:** Prioritise Evergreen Properties and Fortis Financial Group immediately — schedule partner-led conversations to understand their satisfaction with DLA Piper and Herbert Smith respectively, emphasising our existing relationship strength. For the complete list of all 49 opportunities with scoring and competitor intelligence, review the **Cross-Sell Opportunities page** in LegalPulse.`,
  },
  {
    id: 'partner-writeoffs',
    title: 'Who has outlier write-offs and why?',
    category: 'Profitability',
    color: 'red',
    icon: 'AlertTriangle',
    capability: 'Timekeeper-level analysis, surfaces seeded anomaly',
    question: "Why does Sarah Mitchell have high write-offs? How does she compare to other partners?",
    response: `## Sarah Mitchell — Write-Off Analysis

**Insight:** Sarah Mitchell leads all partners in write-offs with £44,981 across 37 invoices — more than double the second-highest partner.

**Evidence:**
- **Sarah Mitchell:** £44,981 write-offs (37 invoices) — Litigation & Disputes
- **Catherine Blake:** £18,937 write-offs (20 invoices) — Corporate/M&A
- **Emma Foster:** £14,426 write-offs (20 invoices) — Corporate/M&A
- **Robert Hayes:** £7,259 write-offs (15 invoices) — Corporate/M&A
- **James Whitfield:** £4,690 write-offs (8 invoices) — Corporate/M&A

Sarah's write-offs are **2.4× higher** than Catherine Blake's and **6.2× higher** than the firm average per partner (assuming 20 partners). Her 37 invoices suggest high matter volume, but the write-off concentration is disproportionate.

**Recommendation:**
1. **Immediate review:** Examine Sarah's top 5–10 matters by write-off value to identify patterns (client disputes, fee arrangement issues, scope creep, or billing delays)
2. **Fee arrangement audit:** Check if her Litigation matters are predominantly hourly or fixed-fee — the latter shows higher write-off rates (4.01%) in the firm data
3. **Client conversation:** If write-offs cluster around specific clients, schedule pricing/expectations discussions before further fee erosion

*Note: I can see the top 5 partners here; for the complete partner write-off ranking, use the Partner Performance page.*`,
  },
  {
    id: 'budget-overruns',
    title: 'Which matters are burning budget fastest?',
    category: 'Operations',
    color: 'amber',
    icon: 'Gauge',
    capability: 'Truncation honesty — reports "top 5 of 140 total"',
    question: "Show me all matters currently over budget",
    response: `# Budget Overruns

**Insight:** I can see **5 matters** in the top overrunning matters from the dataset, though there are **140 total overrunning matters** firm-wide.

## Top 5 Budget Overruns (by severity):

1. **HealthFirst Network — Development Project** (Real Estate, Patrick Walsh)
   - 125.7% budget consumed at only 73% completion
   - **Overrun gap: 52.7 percentage points**

2. **HealthFirst Network — Development Project** (Real Estate, Michael Chen)
   - 124.3% budget consumed at 67% completion
   - **Overrun gap: 57.3 percentage points**

3. **FreshMart Group — Employment Tribunal** (Employment, Rachel Torres)
   - 111% budget consumed at 70% completion
   - **Overrun gap: 41 percentage points**

4. **Urban Industries — Licensing** (Regulatory & Compliance, Olivia Martin)
   - 108.7% budget consumed at 65% completion
   - **Overrun gap: 43.7 percentage points**

5. **ClearView Analytics — Development Project** (Real Estate, Yuki Tanaka)
   - 85.3% budget consumed at 44% completion
   - **Overrun gap: 41.3 percentage points** (trending toward overrun)

## Recommendation:
The HealthFirst Network matters require **immediate partner intervention** — both are running 50+ points over budget with significant work remaining. For the complete list of all 140 overrunning matters with full breakdown by client, practice area, and responsible partner, **navigate to the Matter Performance Dashboard** in LegalPulse.`,
  },
  {
    id: 'client-health-deferral',
    title: "When the AI doesn't have the data, it says so",
    category: 'Honesty',
    color: 'purple',
    icon: 'ShieldCheck',
    capability: 'Hallucination guard — defers and redirects rather than inventing',
    question: "Which clients have the lowest client health scores?",
    response: `I don't have access to client health score data in my current context. Client health scores typically combine metrics like payment patterns, matter profitability, relationship strength, and engagement trends — this level of detail isn't included in the snapshot I'm working from.

**To see client health scores ranked by risk level**, you'll need to visit the **Client Portfolio** or **Client Health Dashboard** page in LegalPulse, where scores are calculated and displayed with detailed breakdowns.

**What I can show you from the available data** are some concerning indicators:

**Budget Overrun Signals:**
- **HealthFirst Network** has two Real Estate matters running 124–125% over budget while only 67–73% complete
- **Urban Industries** (Regulatory matter) is 109% over budget at 65% complete
- These suggest potential client satisfaction risks

**Write-Off Patterns:**
- Sarah Mitchell has written off £44,981 across 37 invoices (Litigation clients)
- Catherine Blake: £18,937 across 20 invoices (Corporate clients)
- High write-offs often correlate with billing disputes or relationship strain

**Recommendation:** Check the Client Health Dashboard for the composite scores, then cross-reference the clients flagged there with budget overruns and write-off patterns to identify which relationships need immediate partner intervention.`,
  },
];
