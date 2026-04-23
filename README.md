# LegalPulse — AI-Powered Revenue Intelligence for Law Firms

## Quick Start

### 1. Install Dependencies

```bash
# CMD or PowerShell — same commands
cd legalpulse
cd backend && npm install && cd ../frontend && npm install && cd ..
```

### 2. Run in Development Mode

Open **two terminal windows:**

**Terminal 1 — Backend:**
```bash
cd legalpulse/backend
node server.js
```

**Terminal 2 — Frontend:**
```bash
cd legalpulse/frontend
npm run dev
```

Then open **http://localhost:5173** in your browser.

> **AI Chat note:** API keys are entered in the browser session, not via env var. All dashboards, data management, and analytics work with no keys at all.

### Environment Variables (all optional)

| Var | Purpose | Default |
|---|---|---|
| `PORT` | Backend listen port | `8000` |
| `NODE_ENV` | Controls static-file serving (set to `production` on Render) | `development` |
| `ANTHROPIC_MODEL` | Override Claude model used by the chat endpoint | `claude-sonnet-4-5` |
| `OPENAI_MODEL` | Override OpenAI model used by the chat endpoint | `gpt-4o` |

Changing `ANTHROPIC_MODEL` / `OPENAI_MODEL` lets you swap model versions without a code change when providers retire models.

### 3. What You'll See

The app comes pre-loaded with **Whitfield & Partners** — a fictional UK mid-market firm with:
- 80 clients across 8 industries
- 120 timekeepers (20 partners + 25 seniors + 35 associates + 20 paralegals + 20 trainees) across 5 practice areas
- ~400 matters, ~5,000–6,000 time entries, ~1,000–1,200 invoices (randomised within bounds)
- Wallet estimates, practice coverage, and market signals

**Intentional patterns seeded for AI discovery:**
- Corporate/M&A fixed-fee work for the top client (Meridian Industries) shows low billing realisation — scope creep pattern
- Sarah Mitchell (Litigation & Disputes) has 3× firm-average write-offs — a partner-concentration pattern
- Meridian Industries: £1.2M firm revenue vs £14M estimated total spend (~9% share of wallet, ~£12.8M gap)
- Nexus Technologies: declining revenue + competitor threat signals
- Real Estate development matters trending 10–40% over budget

---

## Deployment to Render.com

1. Push to GitHub:
```bash
cd legalpulse
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR-USER/legalpulse.git
git branch -M main
git push -u origin main
```

2. On [render.com](https://render.com):
   - New → Web Service → Connect your repo
   - **Build Command:** `cd frontend && npm install && npm run build && cd ../backend && npm install`
   - **Start Command:** `cd backend && node server.js`
   - Add environment variable: `ANTHROPIC_API_KEY` = your key
   - Plan: Free tier works

---

## Project Structure

```
legalpulse/
├── package.json              # Root scripts
├── render.yaml               # Render.com auto-config
├── .gitignore
├── backend/
│   ├── package.json          # express, sql.js, @anthropic-ai/sdk, etc.
│   ├── server.js             # Express server + static file serving
│   ├── database.js           # sql.js async wrapper
│   ├── schema.js             # All 10 canonical tables
│   ├── dummy-data.js         # Whitfield & Partners data generator
│   └── routes/
│       ├── analytics.js      # Dashboard computations
│       ├── chat.js           # Claude AI chat endpoint
│       └── data.js           # CRUD for all tables
└── frontend/
    ├── package.json          # react, recharts, lucide-react, etc.
    ├── vite.config.js        # Dev proxy /api → localhost:8000
    ├── index.html
    └── src/
        ├── App.jsx           # Router
        ├── api.js            # Axios instance
        ├── index.css         # Full design system
        ├── components/
        │   ├── InfoTooltip.jsx
        │   ├── Layout.jsx
        │   └── Sidebar.jsx
        └── pages/
            ├── Landing.jsx          # Hero + features + how-it-works
            ├── Dashboard.jsx        # Firm-wide overview with charts
            ├── Profitability.jsx    # Write-offs, fee arrangements
            ├── ClientIntelligence.jsx # Wallet, cross-sell, health
            ├── FinancialDeepDive.jsx  # Revenue waterfall, margins
            ├── Chat.jsx             # AI conversational interface
            └── DataManagement.jsx   # Browse/edit all 10 tables
```

## Tech Stack (JKH-Compatible)

- **Runtime:** Node.js (no Python)
- **Backend:** Express + sql.js (pure JS SQLite via WASM)
- **Frontend:** React 18 + Vite + Recharts + Lucide Icons
- **AI:** Claude API via @anthropic-ai/sdk
- **All packages are pure JavaScript** — no native bindings, no node-gyp
