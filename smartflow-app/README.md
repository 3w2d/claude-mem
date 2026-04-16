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

## Next Steps (per the project brief)

### Phase 1 — Foundation
- Swap `localStorage` for Supabase/Firebase (`src/lib/storage.js` is the single integration point)
- Add authentication
- Wrap for mobile via React Native/Capacitor

### Phase 2 — Microsoft 365 Integration
- Register app in Azure AD → get Graph API scopes
- Replace mock Outlook/Excel/Word status cards with live sync
- Connect `AIAssistant` to OpenAI GPT-4 (Arabic) instead of local keyword matching
