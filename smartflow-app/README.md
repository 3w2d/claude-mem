# SmartFlow v3

تطبيق شخصي ذكي لإدارة الملفات والمواعيد والمهام مع مساعد AI مدمج.
Personal AI-powered assistant for managing files, schedule, and tasks — Arabic-first (RTL).

## Features

- 📊 **Dashboard** — dynamic stats, smart suggestions based on real data, urgent task badge
- 📁 **Files** — categorize, search, star, edit, delete with confirmation, AI notes
- 📅 **Schedule** — dynamic weekly view, today indicator, event dots per day, Outlook-style sources
- ✅ **Tasks** — priorities (عاجل / متوسط / عادي), filter by status, inline edit, delete confirm
- 🤖 **AI Assistant** — Arabic keyword matching, responds based on your actual files/events/tasks, saved history

## Tech Stack

- **Vite** + **React 18** (JSX, no TypeScript overhead)
- `localStorage`-backed persistent state (drop-in replaceable with Firebase/Supabase later)
- Pure inline styles (no CSS framework) — ships small, RTL-ready, themeable via `src/lib/theme.js`

## Development

```bash
cd smartflow-app
npm install
npm run dev     # http://localhost:5173
npm run build   # production build → dist/
npm run preview # preview the production build
```

## Project Structure

```
smartflow-app/
├── index.html
├── vite.config.js
├── package.json
└── src/
    ├── main.jsx              # React entry
    ├── App.jsx               # Router + persistence + nav
    ├── lib/
    │   ├── theme.js          # Color tokens, fonts, priorities
    │   ├── date.js           # Arabic weekdays/months, dynamic week
    │   ├── storage.js        # localStorage wrapper
    │   └── defaults.js       # Seed data
    ├── components/
    │   ├── Background.jsx    # Animated gradient blobs
    │   ├── Card.jsx
    │   ├── ConfirmDialog.jsx
    │   ├── Loading.jsx
    │   ├── Icons.jsx         # Inline SVG icon set
    │   └── Nav.jsx           # Bottom tab bar with badges
    └── pages/
        ├── Splash.jsx
        ├── Dashboard.jsx
        ├── FilesPage.jsx
        ├── SchedulePage.jsx
        ├── TasksPage.jsx
        └── AIAssistant.jsx
```

## V3 Fixes vs V2

| # | Issue | Fix |
|---|-------|-----|
| 1 | Date hardcoded to Apr 14 | Dynamic date via `TODAY`, `buildWeek()` |
| 2 | AI always answered about day 14 | Uses `selectedDay` from state |
| 3 | Delete without confirmation | `ConfirmDialog` component |
| 4 | No edit capability | Inline edit on files/events/tasks |
| 5 | AI chat lost on reload | Persisted via `STORAGE_KEYS.AI_HISTORY` |
| 6 | No loading screen | `Loading` component on boot |
| 7 | Static dashboard suggestions | Built from actual data counts |
| 8 | Enter key didn't submit | Wired up `onKeyDown` handlers |
| 9 | Scroll position kept on page change | `scrollRef.current.scrollTo(0,0)` on `page` change |
| 10 | No notification counter | Badge on bell + nav tab |

## Integrations

All three integrations are **opt-in via environment variables**. If a key is
missing, the feature silently falls back to the offline behavior. Copy
`.env.example` → `.env.local` and fill in only what you want.

### 1. Supabase (persistent backend)

Replaces `localStorage` with a cloud-synced key/value table. Same
`store.get` / `store.set` API — the adapter lives in
`src/lib/storage.js`.

1. Create a Supabase project → copy the `Project URL` and `anon` key.
2. Run the SQL in `supabase/schema.sql` once in the SQL editor.
3. Set in `.env.local`:
   ```
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJ...
   ```

The adapter writes to both `localStorage` (instant UI) **and** Supabase
(cross-device), and reads remote-first with a local fallback.

### 2. Microsoft 365 (Outlook + OneDrive via Graph)

Pulls real calendar events and recent files into the app.

1. Go to **Azure Portal → Azure AD → App registrations → New**.
   - Supported account types: *Accounts in any organizational directory
     and personal Microsoft accounts*.
   - Redirect URI (SPA): `http://localhost:5173` for dev, plus your
     production origin.
2. Under **API permissions → Add a permission → Microsoft Graph →
   Delegated**, grant: `User.Read`, `Calendars.Read`, `Files.Read`.
3. Copy the **Application (client) ID** and **Directory (tenant) ID**.
4. Set in `.env.local`:
   ```
   VITE_AZURE_CLIENT_ID=<application-id>
   VITE_AZURE_TENANT_ID=common
   VITE_AZURE_REDIRECT_URI=http://localhost:5173
   ```

Once set, the Dashboard shows a **ربط Microsoft 365** button. After
login, **مزامنة** pulls the next 7 days of events + 25 most-recent
files into the app. Manually-added items are preserved; Graph items use
a `graph-` id prefix.

### 3. OpenAI (GPT-4 Arabic assistant)

Replaces the local keyword matcher in the AI Assistant with a real
GPT-4 conversation. The key stays **server-side** — it's never exposed
to the browser.

1. Get an API key from https://platform.openai.com.
2. Set in `.env.local`:
   ```
   VITE_AI_ENABLED=true
   OPENAI_API_KEY=sk-...
   OPENAI_MODEL=gpt-4o
   ```
3. Restart `npm run dev`. The assistant now proxies through
   `POST /api/chat` (defined in `api/chat.js`, mounted on Vite's dev
   server via `vitePlugins.js`). If the proxy fails for any reason,
   the UI transparently falls back to the local matcher and shows a
   notice.

**Production deploy:** `api/chat.js` is written to be drop-in
compatible with Vercel/Netlify serverless functions. Deploy the static
`dist/` from `npm run build` plus the `api/` folder to a platform that
supports Node serverless handlers, or front it with a small Express
server that calls the same default-exported handler.

## Roadmap

- Replace `device_id` in `supabase/schema.sql` with `auth.uid()` once
  Supabase Auth is wired up; tighten RLS accordingly.
- Wrap for mobile via Capacitor or React Native.
- Two-way sync for Graph (create events from the app back to Outlook).
