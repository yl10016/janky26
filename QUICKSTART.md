# RiskyFRISKY — Quickstart Guide

## Prerequisites

You need **Node.js v18+** installed. Check with:

```bash
node --version
```

If you don't have it, install from: https://nodejs.org (grab the LTS version)

## Setup

1. **Clone the repo and install dependencies:**

```bash
git clone <repo-url>
cd janky26
npm install
```

2. **Create your environment file:**

```bash
cp .env.example .env
```

3. **Add your API keys to `.env`:**

```
POLYGON_API_KEY=your_polygon_key_here
OPENROUTER_API_KEY=your_openrouter_key_here
OPENROUTER_MODEL=openai/gpt-4o-mini
```

- **Polygon** (market data): Sign up free at https://polygon.io — the free tier works fine
- **OpenRouter** (AI explanations): Sign up at https://openrouter.ai — we have free credits

## Run

```bash
npm run dev
```

This starts two things simultaneously:
- **Frontend** (Vite + React): http://localhost:3000
- **Backend** (Express API): http://localhost:3001

Open http://localhost:3000 in your browser.

## App Flow

1. **Home** → click "Start Assessment"
2. **Assessment** → answer 10 lottery-style questions (picks up your risk preferences)
3. **Results** → see your inferred risk aversion coefficient (γ) and utility curve
4. **Portfolio** → get an optimized portfolio from real market data + AI explanation

## Project Structure

```
src/                  React frontend
  pages/              Home, Assessment, Results, Portfolio
  components/         Reusable UI (charts, cards, layout)
  utils/              Client-side math (CRRA utility, gamma inference)
server/               Express API backend
  routes/             API endpoints (market data, optimization, AI)
  utils/              Server-side helpers (Polygon client, portfolio math, OpenRouter)
```

## Troubleshooting

- **`npm install` fails** → Make sure you're on Node 18+. Run `node --version`.
- **Portfolio page errors** → Check that `POLYGON_API_KEY` is set in `.env`. The first load is slow due to API rate limits.
- **No AI explanation** → Check that `OPENROUTER_API_KEY` is set in `.env`.
- **Port conflict** → Frontend defaults to 3000, backend to 3001. Kill anything on those ports or change them in `vite.config.js` / `server/index.js`.
