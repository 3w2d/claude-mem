import React, { useEffect, useRef, useState } from 'react';
import { T } from './lib/theme.js';
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
import Dashboard from './pages/Dashboard.jsx';
import FilesPage from './pages/FilesPage.jsx';
import SchedulePage from './pages/SchedulePage.jsx';
import TasksPage from './pages/TasksPage.jsx';
import AIAssistant from './pages/AIAssistant.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import { initAuth, onAuthChange, getCurrentUser } from './lib/auth.js';
import { useT, t } from './lib/i18n.js';

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

  const pendingCount = tasks.filter((x) => !x.done).length;

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
        return <Splash onEnter={() => setPage('home')} />;
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

  return (
    <div style={{ minHeight: '100vh', position: 'relative', maxWidth: 430, margin: '0 auto' }}>
      <Background />
      <div
        ref={scrollRef}
        style={{
          position: 'relative',
          zIndex: 1,
          padding: page === 'splash' ? 0 : '16px 20px',
          minHeight: '100vh',
        }}
      >
        {render()}
      </div>
      {page !== 'splash' && !loading && (
        <Nav active={page} setPage={setPage} pendingCount={pendingCount} />
      )}
      <style>{`
        *{margin:0;padding:0;box-sizing:border-box}
        html,body,#root{min-height:100%;background:${T.bg};color:${T.text}}
        body{font-family:'Readex Pro','Outfit',sans-serif}
        ::-webkit-scrollbar{width:0;height:0}
        input::placeholder{color:rgba(255,255,255,0.25)}
        select option{background:#1e293b;color:#f1f5f9}
      `}</style>
    </div>
  );
}
