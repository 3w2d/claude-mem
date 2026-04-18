import React, { useEffect, useMemo, useRef, useState } from 'react';
import { C, F } from './lib/theme.js';
import { TODAY_DAY } from './lib/date.js';
import { STORAGE_KEYS, store } from './lib/storage.js';
import { DEFAULT_FILES, DEFAULT_EVENTS, DEFAULT_TASKS } from './lib/defaults.js';
import { hasAzure, initMsal, getActiveAccount, login, logout } from './lib/msal.js';
import { getUpcomingEvents, getRecentFiles } from './lib/graph.js';
import { onConfigChange } from './lib/runtimeConfig.js';

import Background from './components/Background.jsx';
import Loading from './components/Loading.jsx';
import Nav from './components/Nav.jsx';

import Splash from './pages/Splash.jsx';
import Landing from './pages/Landing.jsx';
import Dashboard from './pages/Dashboard.jsx';
import FilesPage from './pages/FilesPage.jsx';
import SchedulePage from './pages/SchedulePage.jsx';
import TasksPage from './pages/TasksPage.jsx';
import AIAssistant from './pages/AIAssistant.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import { initAuth, onAuthChange, getCurrentUser } from './lib/auth.js';
import { useT, t } from './lib/i18n.js';

const FONTS_HREF =
  'https://fonts.googleapis.com/css2?family=Rubik:wght@400;500;600;700&family=Markazi+Text:wght@400;500;600;700&family=Geist+Mono:wght@400;500;600&display=swap';

function ensureFontsLoaded() {
  if (typeof document === 'undefined') return;
  if (document.getElementById('irtah-fonts')) return;
  const pre1 = document.createElement('link');
  pre1.rel = 'preconnect';
  pre1.href = 'https://fonts.googleapis.com';
  document.head.appendChild(pre1);
  const pre2 = document.createElement('link');
  pre2.rel = 'preconnect';
  pre2.href = 'https://fonts.gstatic.com';
  pre2.crossOrigin = '';
  document.head.appendChild(pre2);
  const link = document.createElement('link');
  link.id = 'irtah-fonts';
  link.rel = 'stylesheet';
  link.href = FONTS_HREF;
  document.head.appendChild(link);
}

export default function App() {
  const { lang } = useT();
  const [page, setPage] = useState('splash');
  const [files, setFiles] = useState(DEFAULT_FILES);
  const [events, setEvents] = useState(DEFAULT_EVENTS);
  const [tasks, setTasks] = useState(DEFAULT_TASKS);
  const [aiHistory, setAiHistory] = useState(() => [{ role: 'ai', text: t('ai.greeting') }]);
  const [selectedDay, setSelectedDay] = useState(TODAY_DAY);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [msAccount, setMsAccount] = useState(null);
  const [azureReady, setAzureReady] = useState(hasAzure());
  const [user, setUser] = useState(getCurrentUser());
  const scrollRef = useRef(null);

  const isDark = false;
  const isStandalonePage = page === 'splash' || page === 'landing';

  useEffect(() => {
    ensureFontsLoaded();
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, 0);
  }, [page]);

  useEffect(() => {
    const offCfg = onConfigChange(() => {
      setAzureReady(hasAzure());
      initAuth();
    });
    const offAuth = onAuthChange((u) => setUser(u));
    initAuth();
    return () => { offCfg(); offAuth(); };
  }, []);

  useEffect(() => {
    if (!azureReady) return;
    let cancelled = false;
    (async () => {
      try {
        await initMsal();
        if (!cancelled) setMsAccount(getActiveAccount());
      } catch (err) {
        console.warn('MSAL init failed:', err);
      }
    })();
    return () => { cancelled = true; };
  }, [azureReady]);

  useEffect(() => {
    (async () => {
      const [sf, se, st, sai] = await Promise.all([
        store.get(STORAGE_KEYS.FILES),
        store.get(STORAGE_KEYS.EVENTS),
        store.get(STORAGE_KEYS.TASKS),
        store.get(STORAGE_KEYS.AI_HISTORY),
      ]);
      if (sf) setFiles(sf);
      if (se) setEvents(se);
      if (st) setTasks(st);
      if (sai) setAiHistory(sai);
      setLoaded(true);
      setLoading(false);
    })();
  }, []);

  useEffect(() => { if (loaded) store.set(STORAGE_KEYS.FILES, files); }, [files, loaded]);
  useEffect(() => { if (loaded) store.set(STORAGE_KEYS.EVENTS, events); }, [events, loaded]);
  useEffect(() => { if (loaded) store.set(STORAGE_KEYS.TASKS, tasks); }, [tasks, loaded]);
  useEffect(() => { if (loaded) store.set(STORAGE_KEYS.AI_HISTORY, aiHistory); }, [aiHistory, loaded]);

  const handleMsLogin = async () => {
    try {
      const acc = await login();
      setMsAccount(acc);
      if (acc) await handleMsSync();
    } catch (err) {
      console.error('Login failed:', err);
      alert(t('profile.msLoginFail'));
    }
  };

  const handleMsLogout = async () => {
    try {
      await logout();
    } finally {
      setMsAccount(null);
    }
  };

  const handleMsSync = async () => {
    try {
      const [graphEvents, graphFiles] = await Promise.all([
        getUpcomingEvents(7),
        getRecentFiles(25),
      ]);
      if (graphEvents.length > 0) {
        setEvents((prev) => {
          const manual = prev.filter((e) => !String(e.id).startsWith('graph-'));
          return [...manual, ...graphEvents];
        });
      }
      if (graphFiles.length > 0) {
        setFiles((prev) => {
          const manual = prev.filter((f) => !String(f.id).startsWith('graph-'));
          return [...graphFiles, ...manual];
        });
      }
    } catch (err) {
      console.error('Graph sync failed:', err);
      alert(t('profile.msSyncFail'));
    }
  };

  const pendingCount = useMemo(() => tasks.filter((x) => !x.done).length, [tasks]);

  const dashboardProps = {
    files,
    events,
    tasks,
    setPage,
    selectedDay,
    msAccount,
    msConfigured: azureReady,
    onMsLogin: handleMsLogin,
    onMsLogout: handleMsLogout,
    onMsSync: handleMsSync,
    user,
  };

  const render = () => {
    if (loading) return <Loading />;
    switch (page) {
      case 'splash':
        return <Splash onEnter={() => setPage('home')} onLanding={() => setPage('landing')} />;
      case 'landing':
        return <Landing onEnter={() => setPage('home')} onBack={() => setPage('splash')} />;
      case 'home':
        return <Dashboard {...dashboardProps} />;
      case 'files':
        return <FilesPage files={files} setFiles={setFiles} />;
      case 'schedule':
        return (
          <SchedulePage
            events={events}
            setEvents={setEvents}
            selectedDay={selectedDay}
            setSelectedDay={setSelectedDay}
          />
        );
      case 'tasks':
        return <TasksPage tasks={tasks} setTasks={setTasks} />;
      case 'ai':
        return (
          <AIAssistant
            files={files}
            events={events}
            tasks={tasks}
            selectedDay={selectedDay}
            aiHistory={aiHistory}
            setAiHistory={setAiHistory}
          />
        );
      case 'settings':
        return <SettingsPage setPage={setPage} />;
      case 'profile':
        return (
          <ProfilePage
            user={user}
            setPage={setPage}
            files={files}
            events={events}
            tasks={tasks}
            msAccount={msAccount}
            onMsLogout={handleMsLogout}
          />
        );
      default:
        return <Dashboard {...dashboardProps} />;
    }
  };

  const isLanding = page === 'landing';

  return (
    <div
      style={{
        minHeight: '100vh',
        position: 'relative',
        maxWidth: isLanding ? '100%' : 430,
        margin: '0 auto',
      }}
    >
      <Background dark={isDark} />
      <div
        ref={scrollRef}
        style={{
          position: 'relative',
          zIndex: 1,
          padding: isStandalonePage ? 0 : '16px 20px',
          minHeight: '100vh',
        }}
      >
        {render()}
      </div>
      {!isStandalonePage && !loading && (
        <Nav active={page} setPage={setPage} pendingCount={pendingCount} isDark={isDark} />
      )}
      <style>{`
        *{margin:0;padding:0;box-sizing:border-box}
        html,body,#root{min-height:100%;background:${C.sand50};color:${C.ink900};-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;text-rendering:optimizeLegibility}
        body{font-family:${F.ui};}
        ::-webkit-scrollbar{width:0;height:0}
        input,textarea{caret-color:${C.terra500}}
        input::placeholder,textarea::placeholder{color:${C.sand400}}
        select option{background:${C.paper};color:${C.ink900}}
        :focus-visible{outline:2px solid ${C.terra300};outline-offset:2px;border-radius:6px}
        button{font-family:inherit}
        @media (prefers-reduced-motion: reduce){
          *,*::before,*::after{animation-duration:0.01ms !important;animation-iteration-count:1 !important;transition-duration:0.01ms !important}
        }
      `}</style>
    </div>
  );
}
