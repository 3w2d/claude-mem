import React, { useState, useEffect, useRef } from 'react';
import {
  Home, CalendarDays, FolderOpen, Sparkles, Settings,
  Plus, Search, Bell, CheckCircle2, Circle, Clock,
  FileText, Image as ImageIcon, Video, File, Send, Mic,
  TrendingUp, Target, ChevronLeft, ChevronRight, MoreVertical,
  Star, Brain, BarChart3, Moon, Globe, LogOut,
  Filter, Tag, Paperclip, Flame,
  BookOpen, Music, Archive, Upload,
  Wifi, Battery, Signal, Layers, Zap,
} from 'lucide-react';
import { useAuth } from './auth/AuthProvider.jsx';
import { useTasks } from './data/useData.js';
import { ask } from './lib/aiMock.js';
import { APP } from './config.js';

const NAV = [
  { id: 'dashboard', label: 'لوحة نَظْم',    icon: Home },
  { id: 'tasks',     label: 'المهام والزمن', icon: CalendarDays },
  { id: 'library',   label: 'المكتبة',       icon: FolderOpen },
  { id: 'assistant', label: 'المساعد الذكي', icon: Sparkles },
  { id: 'settings',  label: 'الإعدادات',    icon: Settings },
];

const FILES = [
  { id: 1, name: 'عرض الهوية البصرية',     type: 'doc',   size: '4.2 MB', date: 'اليوم',        tag: 'تصميم' },
  { id: 2, name: 'ميزانية الربع الثاني',    type: 'sheet', size: '1.8 MB', date: 'أمس',         tag: 'مالي'  },
  { id: 3, name: 'فيديو تعريفي — نَظْم',    type: 'video', size: '58 MB',  date: 'قبل يومين',   tag: 'تسويق' },
  { id: 4, name: 'Logo-NAZM-Final.png',    type: 'image', size: '320 KB', date: 'قبل ٣ أيام',  tag: 'تصميم' },
  { id: 5, name: 'محاضر الاجتماعات',       type: 'doc',   size: '960 KB', date: 'هذا الأسبوع', tag: 'أرشيف' },
  { id: 6, name: 'بودكاست الإنتاجية',      type: 'audio', size: '22 MB',  date: 'هذا الأسبوع', tag: 'تعلم'  },
];

function toViewTask(raw) {
  const time = raw.due
    ? new Intl.DateTimeFormat('ar-SA-u-nu-arab', { month: 'short', day: 'numeric' }).format(new Date(raw.due))
    : 'غير محدد';
  return {
    id: raw.id,
    title: raw.titleAr || raw.titleEn || raw.title || '',
    time,
    tag: raw.source || 'عام',
    priority: raw.priority || 'medium',
    done: !!raw.done,
  };
}

export default function NazmFullSystem() {
  const { isAuthenticated, signIn, signOut, profile, busy } = useAuth();
  const [showSplash, setShowSplash] = useState(true);
  const [fadeSplash, setFadeSplash] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setFadeSplash(true), 2300);
    const t2 = setTimeout(() => setShowSplash(false), 3100);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  if (showSplash) {
    return (
      <PageChrome>
        <SplashOverlay fading={fadeSplash} />
      </PageChrome>
    );
  }
  if (!isAuthenticated) {
    return (
      <PageChrome>
        <LoginGate signIn={signIn} busy={busy} />
      </PageChrome>
    );
  }
  return (
    <PageChrome>
      <NazmApp profile={profile} signOut={signOut} />
    </PageChrome>
  );
}

function NazmApp({ profile, signOut }) {
  const [activeView, setActiveView] = useState('dashboard');
  const { tasks: rawTasks, add, toggle, remove } = useTasks();
  const tasks = rawTasks.map(toViewTask);

  const [messages, setMessages] = useState([
    { from: 'ai', text: 'مرحباً بك 👋 أنا نَظْم — مساعدك الذكي. أخبرني كيف أساعدك اليوم.' },
  ]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);

  const addTask = (title) => {
    if (!title.trim()) return;
    add({ titleAr: title, priority: 'medium' });
  };

  const sendMessage = async () => {
    if (!input.trim() || thinking) return;
    const userText = input;
    setInput('');
    setMessages((m) => [...m, { from: 'me', text: userText }]);
    setThinking(true);
    try {
      const reply = await ask(userText, { isRtl: true });
      setMessages((m) => [...m, { from: 'ai', text: reply }]);
    } finally {
      setThinking(false);
    }
  };

  const userName = profile?.name || APP.userName;
  const userInitial = userName ? userName.trim().charAt(0) : 'ن';

  return (
    <>
      <div className="hidden md:flex min-h-screen text-white">
        <aside className="order-2 w-[260px] lg:w-[280px] shrink-0 p-5 flex flex-col gap-6">
          <Logo />
          <nav className="flex flex-col gap-1">
            {NAV.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveView(id)}
                className={`group flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all ${
                  activeView === id
                    ? 'glass-strong text-white shadow-lg shadow-purple-900/30'
                    : 'text-purple-200/70 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className={`w-5 h-5 ${activeView === id ? 'text-purple-200' : 'text-purple-300/60 group-hover:text-purple-200'}`} />
                <span>{label}</span>
                {activeView === id && <span className="ms-auto w-1.5 h-1.5 rounded-full bg-purple-200 pulse-soft" />}
              </button>
            ))}
          </nav>
          <UserCard name={userName} initial={userInitial} onSignOut={signOut} />
        </aside>
        <main className="order-1 flex-1 min-w-0 p-5 lg:p-8">
          <TopBar activeView={activeView} />
          <div className="mt-6 fade-in" key={activeView}>
            {activeView === 'dashboard' && <DashboardView tasks={tasks} setActiveView={setActiveView} />}
            {activeView === 'tasks'     && <TasksView tasks={tasks} toggleTask={toggle} addTask={addTask} removeTask={remove} />}
            {activeView === 'library'   && <LibraryView files={FILES} />}
            {activeView === 'assistant' && <AssistantView messages={messages} input={input} setInput={setInput} sendMessage={sendMessage} thinking={thinking} />}
            {activeView === 'settings'  && <SettingsView profile={profile} userName={userName} onSignOut={signOut} />}
          </div>
        </main>
      </div>

      <div className="md:hidden min-h-screen text-white flex flex-col">
        <div className="flex items-center justify-between px-5 pt-3 pb-1 text-xs text-purple-100/80">
          <span className="font-medium">9:41</span>
          <div className="flex items-center gap-1.5">
            <Signal className="w-3.5 h-3.5" />
            <Wifi className="w-3.5 h-3.5" />
            <Battery className="w-4 h-4" />
          </div>
        </div>
        <header className="px-5 pt-3 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <NazmLogoSvg size={38} />
            <div>
              <div className="text-base font-bold font-display">نَظْم</div>
              <div className="text-[10px] text-purple-200/60 -mt-0.5">ذكاء يرتّب حياتك</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="w-9 h-9 rounded-full glass flex items-center justify-center">
              <Search className="w-4 h-4" />
            </button>
            <button className="w-9 h-9 rounded-full glass flex items-center justify-center relative">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-pink-400 rounded-full" />
            </button>
          </div>
        </header>
        <div className="flex-1 px-4 pb-28 overflow-y-auto scrollbar-thin fade-in" key={'m-' + activeView}>
          {activeView === 'dashboard' && <DashboardView tasks={tasks} setActiveView={setActiveView} mobile />}
          {activeView === 'tasks'     && <TasksView tasks={tasks} toggleTask={toggle} addTask={addTask} removeTask={remove} mobile />}
          {activeView === 'library'   && <LibraryView files={FILES} mobile />}
          {activeView === 'assistant' && <AssistantView messages={messages} input={input} setInput={setInput} sendMessage={sendMessage} thinking={thinking} mobile />}
          {activeView === 'settings'  && <SettingsView profile={profile} userName={userName} onSignOut={signOut} mobile />}
        </div>
        <nav className="fixed bottom-0 left-0 right-0 px-3 pb-3 pt-2 z-30">
          <div className="glass-strong rounded-3xl flex items-center justify-between px-2 py-2 shadow-2xl shadow-black/40">
            {NAV.map(({ id, label, icon: Icon }) => {
              const active = activeView === id;
              return (
                <button
                  key={id}
                  onClick={() => setActiveView(id)}
                  className="flex-1 flex flex-col items-center gap-0.5 py-1.5 rounded-2xl transition-all"
                >
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${active ? 'brand-grad shadow-lg shadow-purple-900/50' : ''}`}>
                    <Icon className={`w-5 h-5 ${active ? 'text-white' : 'text-purple-200/60'}`} />
                  </div>
                  <span className={`text-[10px] font-medium ${active ? 'text-white' : 'text-purple-200/50'}`}>{label.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </>
  );
}

function PageChrome({ children }) {
  return (
    <div
      dir="rtl"
      className="min-h-screen w-full overflow-hidden relative"
      style={{ fontFamily: "'Tajawal','Noto Sans Arabic',system-ui,sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800&family=Reem+Kufi:wght@400;500;600;700&family=Pacifico&display=swap');
        .font-display { font-family: 'Reem Kufi','Tajawal',system-ui,sans-serif; letter-spacing: -0.01em; }
        .font-brand   { font-family: 'Pacifico', cursive; letter-spacing: 0.01em; }
        .glass        { background: linear-gradient(135deg, rgba(167,139,250,0.14), rgba(167,139,250,0.06)); backdrop-filter: blur(18px); -webkit-backdrop-filter: blur(18px); border: 1px solid rgba(196,181,253,0.18); }
        .glass-strong { background: linear-gradient(135deg, rgba(167,139,250,0.22), rgba(107,33,168,0.18)); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); border: 1px solid rgba(196,181,253,0.22); }
        .brand-grad      { background: linear-gradient(135deg, #c084fc 0%, #a855f7 40%, #7c3aed 100%); }
        .brand-grad-soft { background: linear-gradient(135deg, rgba(167,139,250,0.35), rgba(76,29,149,0.35)); }
        .halo { filter: blur(80px); opacity: 0.5; }
        .scrollbar-thin::-webkit-scrollbar { width: 4px; height: 4px; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background: rgba(167,139,250,0.35); border-radius: 4px; }
        .scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
        .fade-in { animation: fadeUp .5s ease both; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
        .pulse-soft { animation: pulseSoft 2.6s ease-in-out infinite; }
        @keyframes pulseSoft { 0%,100% { opacity:.7; } 50% { opacity:1; } }
        .wave-line { stroke: rgba(196,181,253,0.25); stroke-width: 1; fill: none; }
        input, textarea, button { font-family: inherit; }
        ::selection { background: rgba(167,139,250,0.35); color: #fff; }

        .splash-bg       { background: radial-gradient(ellipse at center, #d8b4fe 0%, #a855f7 40%, #6b21a8 100%); }
        .brand-reveal    { animation: brandReveal 1.4s cubic-bezier(.2,.8,.2,1) both; }
        @keyframes brandReveal { 0% { opacity: 0; transform: scale(0.7); filter: blur(10px); } 60% { opacity: 1; filter: blur(0); } 100% { opacity: 1; transform: scale(1); } }
        .splash-fade-out { animation: fadeOut .7s ease forwards; }
        @keyframes fadeOut { to { opacity: 0; transform: scale(1.05); } }
        .progress-bar    { animation: grow 1.8s ease both; animation-delay: .4s; }
        @keyframes grow { from { width: 0; } to { width: 100%; } }
        .flow-wave       { animation: flow 8s ease-in-out infinite; }
        @keyframes flow { 0%,100% { transform: translateX(0); } 50% { transform: translateX(20px); } }
        .tagline-in      { animation: tagIn 1s ease both; animation-delay: .8s; opacity: 0; }
        @keyframes tagIn { to { opacity: 1; } }
      `}</style>

      <div
        className="fixed inset-0 -z-10"
        style={{ background: 'radial-gradient(ellipse at top right, #3b0d5f 0%, #1a0b2e 45%, #0d0620 100%)' }}
      >
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full halo" style={{ background: '#a855f7' }} />
        <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full halo" style={{ background: '#4c1d95' }} />
        <svg className="absolute inset-0 w-full h-full opacity-40" preserveAspectRatio="none">
          {Array.from({ length: 12 }).map((_, i) => (
            <path
              key={i}
              className="wave-line"
              d={`M0,${80 + i * 40} Q 400,${40 + i * 35} 800,${90 + i * 38} T 1600,${60 + i * 40}`}
            />
          ))}
        </svg>
      </div>

      {children}
    </div>
  );
}

function SplashOverlay({ fading }) {
  return (
    <div className={`fixed inset-0 z-[100] flex flex-col items-center justify-center splash-bg ${fading ? 'splash-fade-out' : ''}`}>
      <svg className="absolute inset-0 w-full h-full opacity-30" preserveAspectRatio="none" viewBox="0 0 400 800">
        <defs>
          <linearGradient id="wGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="#fff" stopOpacity="0"   />
            <stop offset="50%"  stopColor="#fff" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#fff" stopOpacity="0"   />
          </linearGradient>
        </defs>
        <g className="flow-wave">
          {Array.from({ length: 8 }).map((_, i) => (
            <path
              key={i}
              d={`M-50,${200 + i * 50} Q 150,${150 + i * 45} 300,${210 + i * 48} T 600,${180 + i * 50}`}
              stroke="url(#wGrad)"
              strokeWidth="1"
              fill="none"
              opacity={0.6 - i * 0.06}
            />
          ))}
        </g>
      </svg>

      <div className="absolute top-10 right-10 w-60 h-60 rounded-full halo bg-white/40" />
      <div className="absolute bottom-20 left-10 w-72 h-72 rounded-full halo bg-purple-300/60" />

      <div className="relative flex flex-col items-center brand-reveal">
        <NazmLogoSvg size={140} />
        <div className="mt-6 font-display font-bold text-white text-3xl md:text-4xl drop-shadow">نَظْم</div>
        <div className="mt-2 text-white/90 text-sm md:text-base font-medium tracking-wide tagline-in">ذكاء يرتّب حياتك</div>
        <div className="mt-1 text-white/60 text-[11px] md:text-xs tracking-[0.25em] uppercase tagline-in">Intelligence that organizes</div>
        <div className="mt-10 w-56 h-1.5 rounded-full bg-white/20 overflow-hidden">
          <div className="h-full bg-white rounded-full progress-bar" />
        </div>
      </div>
    </div>
  );
}

function LoginGate({ signIn, busy }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 text-white">
      <div className="glass-strong rounded-3xl p-8 md:p-10 w-full max-w-md text-center">
        <div className="flex justify-center mb-6">
          <NazmLogoSvg size={96} />
        </div>
        <h1 className="font-display text-3xl font-bold">نَظْم</h1>
        <p className="text-purple-200/70 text-sm mt-2">ذكاء يرتّب حياتك</p>
        <p className="text-purple-100/80 text-sm mt-6 leading-relaxed">
          سجّل الدخول بحساب Microsoft لبدء العمل. بياناتك تبقى مشفّرة ولا تُشارك.
        </p>
        <button
          onClick={signIn}
          disabled={busy}
          className="mt-8 w-full brand-grad px-6 py-3 rounded-2xl font-semibold shadow-lg shadow-purple-900/40 disabled:opacity-50"
        >
          {busy ? 'جارٍ الدخول…' : 'الدخول إلى نَظْم'}
        </button>
        <p className="mt-4 text-[11px] text-purple-200/50">Microsoft Entra ID · وضع التطوير</p>
      </div>
    </div>
  );
}

function NazmLogoSvg({ size = 48 }) {
  const r = size * 0.22;
  return (
    <div
      className="relative flex items-center justify-center shadow-xl shadow-purple-900/40 overflow-hidden"
      style={{
        width: size,
        height: size,
        borderRadius: r,
        background: 'linear-gradient(135deg, #c084fc 0%, #a855f7 50%, #7c3aed 100%)',
      }}
    >
      <div
        className="absolute inset-0"
        style={{ background: 'radial-gradient(ellipse at 30% 20%, rgba(255,255,255,0.35) 0%, transparent 55%)' }}
      />
      <span
        className="relative font-brand text-white leading-none"
        style={{
          fontSize: size * 0.42,
          fontFamily: "'Pacifico', cursive",
          textShadow: '0 1px 3px rgba(0,0,0,0.15)',
          transform: 'translateY(-2%)',
        }}
      >
        Nazm
      </span>
      <svg
        className="absolute"
        style={{ bottom: size * 0.22, left: size * 0.22, width: size * 0.56, height: size * 0.08 }}
        viewBox="0 0 100 15"
        preserveAspectRatio="none"
      >
        <path d="M 2 8 Q 30 2, 50 7 T 98 6" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.95" />
      </svg>
    </div>
  );
}

function Logo() {
  return (
    <div className="flex items-center gap-3 px-2 pt-1">
      <NazmLogoSvg size={46} />
      <div>
        <div className="font-display font-bold text-lg leading-none">نَظْم</div>
        <div className="text-[11px] text-purple-200/60 mt-1 tracking-wide">INTELLIGENCE THAT ORGANIZES</div>
      </div>
    </div>
  );
}

function UserCard({ name, initial, onSignOut }) {
  return (
    <div className="mt-auto glass rounded-2xl p-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl brand-grad flex items-center justify-center font-bold text-white font-display">
          {initial}
        </div>
        <div className="min-w-0">
          <div className="text-sm font-semibold truncate">{name}</div>
          <div className="text-xs text-purple-200/60 truncate">{APP.userTitle}</div>
        </div>
        <button onClick={onSignOut} className="ms-auto text-purple-200/50 hover:text-white" title="خروج">
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function TopBar({ activeView }) {
  const titles = {
    dashboard: { ar: 'صباح الخير',       sub: 'إليك ملخص يومك' },
    tasks:     { ar: 'المهام والزمن',     sub: 'نظّم مهامك، ورتّب جدولك بذكاء' },
    library:   { ar: 'المكتبة',           sub: 'ملفاتك مرتّبة، ومربوطة بمشاريعك' },
    assistant: { ar: 'المساعد الذكي',     sub: 'نَظْم يفكر معك' },
    settings:  { ar: 'الإعدادات',         sub: 'خصّص تجربتك' },
  };
  const t = titles[activeView] || titles.dashboard;
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <h1 className="font-display text-2xl lg:text-3xl font-bold">{t.ar}</h1>
        <p className="text-sm text-purple-200/60 mt-1">{t.sub}</p>
      </div>
      <div className="flex items-center gap-2">
        <div className="glass rounded-2xl px-4 py-2.5 flex items-center gap-2 w-[280px]">
          <Search className="w-4 h-4 text-purple-200/60" />
          <input placeholder="ابحث في نَظْم..." className="bg-transparent outline-none text-sm flex-1 placeholder-purple-200/40" />
          <kbd className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded border border-white/10">⌘K</kbd>
        </div>
        <button className="w-10 h-10 rounded-2xl glass flex items-center justify-center relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-pink-400 rounded-full" />
        </button>
      </div>
    </div>
  );
}

function DashboardView({ tasks, setActiveView, mobile }) {
  const done = tasks.filter((t) => t.done).length;
  const pct = tasks.length ? Math.round((done / tasks.length) * 100) : 0;
  return (
    <div className="space-y-4 md:space-y-6">
      <div className="glass-strong rounded-3xl p-5 md:p-7 relative overflow-hidden">
        <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full brand-grad opacity-40 blur-3xl" />
        <div className="flex items-start justify-between gap-4 relative">
          <div className="flex-1">
            <div className="text-xs text-purple-200/70 mb-1">
              {new Intl.DateTimeFormat('ar-SA-u-nu-arab', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date())}
            </div>
            <h2 className="font-display text-xl md:text-3xl font-bold leading-tight">يومك منظّم بنسبة {pct}٪</h2>
            <p className="text-sm text-purple-100/70 mt-2 max-w-md">
              أكملت {done} من {tasks.length} مهام. اقتراح نَظْم: ابدأ بالمهام العاجلة أولاً.
            </p>
            <div className="flex gap-2 mt-4">
              <button onClick={() => setActiveView('tasks')} className="brand-grad px-4 py-2 rounded-xl text-sm font-semibold shadow-lg shadow-purple-900/40">ابدأ الآن</button>
              <button onClick={() => setActiveView('assistant')} className="glass px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> اسأل نَظْم
              </button>
            </div>
          </div>
          {!mobile && (
            <div className="relative w-28 h-28">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
                <circle cx="50" cy="50" r="42" fill="none" stroke="url(#g)" strokeWidth="8" strokeLinecap="round" strokeDasharray={`${pct * 2.64} 300`} />
                <defs>
                  <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%"   stopColor="#e9d5ff" />
                    <stop offset="100%" stopColor="#a855f7" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center font-display text-2xl font-bold">{pct}٪</div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <StatCard icon={Target}       label="مهام اليوم"    value={tasks.length} hint="مجموع" />
        <StatCard icon={CheckCircle2} label="مكتملة"       value={done}          hint={`${pct}٪ من اليوم`} />
        <StatCard icon={Clock}        label="وقت مركّز"     value="٤ س ٢٠ د"      hint="أفضل من المعتاد" />
        <StatCard icon={Flame}        label="سلسلة متواصلة" value="١٢ يوم"        hint="استمر 🔥" />
      </div>

      <div className="grid md:grid-cols-3 gap-4 md:gap-6">
        <div className="md:col-span-2 glass rounded-3xl p-5 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold text-lg">جدول اليوم</h3>
            <button onClick={() => setActiveView('tasks')} className="text-xs text-purple-200/70 hover:text-white">عرض الكل ←</button>
          </div>
          <div className="space-y-2">
            {tasks.slice(0, 4).map((t) => <TaskRow key={t.id} task={t} compact />)}
            {tasks.length === 0 && <div className="text-sm text-purple-200/60 py-4 text-center">لا توجد مهام لهذا اليوم.</div>}
          </div>
        </div>
        <div className="glass rounded-3xl p-5 md:p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full brand-grad-soft opacity-30" />
          <div className="relative">
            <div className="w-11 h-11 rounded-2xl brand-grad flex items-center justify-center mb-3"><Brain className="w-5 h-5" /></div>
            <h3 className="font-display font-bold text-lg mb-1">رؤية نَظْم</h3>
            <p className="text-sm text-purple-100/75 leading-relaxed">
              لاحظت أن إنتاجيتك ترتفع ٢٨٪ في الصباح الباكر. أقترح نقل المهام العاجلة إلى ٨ صباحاً.
            </p>
            <div className="mt-4 flex gap-2">
              <button className="text-xs brand-grad px-3 py-1.5 rounded-lg font-medium">تطبيق</button>
              <button className="text-xs glass px-3 py-1.5 rounded-lg font-medium">لاحقاً</button>
            </div>
          </div>
        </div>
      </div>

      <div className="glass rounded-3xl p-5 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-bold text-lg">مشاريعك النشطة</h3>
          <Plus className="w-5 h-5 text-purple-200/60 cursor-pointer hover:text-white" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <ProjectCard name="هوية نَظْم البصرية" progress={85} tag="تصميم" members={3} />
          <ProjectCard name="حملة الربع الثاني"  progress={42} tag="تسويق" members={5} />
          <ProjectCard name="أتمتة التقارير"      progress={60} tag="تقني"  members={2} />
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, hint }) {
  return (
    <div className="glass rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="w-9 h-9 rounded-xl brand-grad-soft flex items-center justify-center"><Icon className="w-4 h-4" /></div>
        <TrendingUp className="w-3.5 h-3.5 text-green-300/80" />
      </div>
      <div className="text-xs text-purple-200/60 mb-0.5">{label}</div>
      <div className="font-display font-bold text-xl">{value}</div>
      <div className="text-[10px] text-purple-200/50 mt-0.5">{hint}</div>
    </div>
  );
}

function ProjectCard({ name, progress, tag, members }) {
  return (
    <div className="glass rounded-2xl p-4 hover:bg-white/5 transition-colors cursor-pointer">
      <div className="flex items-start justify-between mb-3">
        <div className="w-9 h-9 rounded-xl brand-grad flex items-center justify-center"><Layers className="w-4 h-4" /></div>
        <span className="text-[10px] glass px-2 py-0.5 rounded-full">{tag}</span>
      </div>
      <div className="font-semibold text-sm mb-2 truncate">{name}</div>
      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mb-2">
        <div className="h-full brand-grad rounded-full" style={{ width: `${progress}%` }} />
      </div>
      <div className="flex items-center justify-between text-[11px] text-purple-200/60">
        <span>{progress}٪ منجز</span>
        <span>{members} أعضاء</span>
      </div>
    </div>
  );
}

function TasksView({ tasks, toggleTask, addTask, removeTask }) {
  const [filter, setFilter] = useState('all');
  const [newTask, setNewTask] = useState('');
  const filtered = tasks.filter((t) => (filter === 'all' ? true : filter === 'active' ? !t.done : t.done));
  const handleAdd = () => { addTask(newTask); setNewTask(''); };
  return (
    <div className="grid md:grid-cols-3 gap-6">
      <div className="md:col-span-2 space-y-4">
        <div className="glass rounded-2xl p-2 flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl brand-grad flex items-center justify-center shrink-0"><Plus className="w-5 h-5" /></div>
          <input
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            placeholder="أضف مهمة جديدة..."
            className="flex-1 bg-transparent outline-none text-sm placeholder-purple-200/40"
          />
          <button onClick={handleAdd} className="brand-grad px-4 py-2 rounded-xl text-sm font-medium">إضافة</button>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {[
            { id: 'all',    label: `الكل (${tasks.length})` },
            { id: 'active', label: `نشطة (${tasks.filter((t) => !t.done).length})` },
            { id: 'done',   label: `مكتملة (${tasks.filter((t) => t.done).length})` },
          ].map((f) => (
            <button key={f.id} onClick={() => setFilter(f.id)} className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${filter === f.id ? 'brand-grad' : 'glass text-purple-200/70'}`}>
              {f.label}
            </button>
          ))}
          <button className="glass px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 ms-auto"><Filter className="w-3 h-3" /> تصفية</button>
        </div>
        <div className="space-y-2">
          {filtered.map((t) => <TaskRow key={t.id} task={t} onToggle={() => toggleTask(t.id)} onRemove={() => removeTask(t.id)} />)}
          {filtered.length === 0 && <div className="glass rounded-2xl p-8 text-center text-purple-200/60">لا توجد مهام هنا ✨</div>}
        </div>
      </div>
      <div className="space-y-4">
        <MiniCalendar />
        <div className="glass rounded-3xl p-5">
          <h3 className="font-display font-bold mb-3">وسوم شائعة</h3>
          <div className="flex flex-wrap gap-2">
            {['عمل', 'اجتماعات', 'شخصي', 'صحة', 'تعلم', 'تسويق'].map((tag) => (
              <span key={tag} className="glass px-3 py-1 rounded-full text-xs flex items-center gap-1"><Tag className="w-3 h-3" /> {tag}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function TaskRow({ task, onToggle, onRemove, compact }) {
  const priorityColors = { high: 'bg-pink-400', medium: 'bg-amber-300', low: 'bg-emerald-300' };
  return (
    <div className={`glass rounded-2xl ${compact ? 'p-3' : 'p-4'} flex items-center gap-3 group hover:bg-white/5 transition-colors`}>
      <button onClick={onToggle} className="shrink-0">
        {task.done
          ? <CheckCircle2 className="w-5 h-5 text-purple-300" />
          : <Circle className="w-5 h-5 text-purple-200/50 group-hover:text-purple-200" />}
      </button>
      <div className="flex-1 min-w-0">
        <div className={`text-sm font-medium truncate ${task.done ? 'line-through text-purple-200/40' : ''}`}>{task.title}</div>
        <div className="flex items-center gap-3 mt-0.5">
          <span className="text-[11px] text-purple-200/60 flex items-center gap-1"><Clock className="w-3 h-3" /> {task.time}</span>
          <span className="text-[11px] text-purple-200/60 flex items-center gap-1"><Tag className="w-3 h-3" /> {task.tag}</span>
        </div>
      </div>
      <span className={`w-2 h-2 rounded-full ${priorityColors[task.priority] || 'bg-purple-300'}`} />
      {!compact && onRemove && (
        <button onClick={onRemove} className="text-purple-200/40 hover:text-pink-300"><MoreVertical className="w-4 h-4" /></button>
      )}
    </div>
  );
}

function MiniCalendar() {
  const today = new Date();
  const month = today.toLocaleDateString('ar-SA', { month: 'long', year: 'numeric' });
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).getDay();
  return (
    <div className="glass rounded-3xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-bold">{month}</h3>
        <div className="flex gap-1">
          <button className="w-7 h-7 glass rounded-lg flex items-center justify-center"><ChevronRight className="w-4 h-4" /></button>
          <button className="w-7 h-7 glass rounded-lg flex items-center justify-center"><ChevronLeft className="w-4 h-4" /></button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-purple-200/60 mb-2">
        {['أح', 'إث', 'ثل', 'أر', 'خم', 'جم', 'سب'].map((d) => <div key={d}>{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: firstDay }).map((_, i) => <div key={'e' + i} />)}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const isToday = day === today.getDate();
          const hasEvent = [3, 10, 15, 19, 22, 28].includes(day);
          return (
            <button key={day} className={`aspect-square rounded-lg text-xs font-medium flex items-center justify-center relative ${isToday ? 'brand-grad' : 'hover:bg-white/5'}`}>
              {day}
              {hasEvent && !isToday && <span className="absolute bottom-1 w-1 h-1 rounded-full bg-purple-300" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function LibraryView({ files }) {
  const typeIcon = { doc: FileText, sheet: BarChart3, video: Video, image: ImageIcon, audio: Music, other: File };
  const typeColor = {
    doc:   'from-purple-500 to-indigo-600',
    sheet: 'from-emerald-500 to-teal-600',
    video: 'from-pink-500 to-rose-600',
    image: 'from-amber-400 to-orange-500',
    audio: 'from-cyan-400 to-blue-600',
    other: 'from-slate-400 to-slate-600',
  };
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: Upload,     label: 'رفع ملف' },
          { icon: FolderOpen, label: 'مجلد جديد' },
          { icon: Star,       label: 'المفضلة' },
          { icon: Archive,    label: 'الأرشيف' },
        ].map((a, i) => (
          <button key={i} className="glass rounded-2xl p-4 flex items-center gap-3 hover:bg-white/5 transition-colors">
            <div className="w-10 h-10 rounded-xl brand-grad-soft flex items-center justify-center"><a.icon className="w-4 h-4" /></div>
            <span className="text-sm font-medium">{a.label}</span>
          </button>
        ))}
      </div>
      <div className="glass rounded-3xl p-5 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-bold text-lg">الملفات الأخيرة</h3>
          <button className="glass px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5"><Filter className="w-3 h-3" /> فلترة</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {files.map((f) => {
            const Icon = typeIcon[f.type] || File;
            return (
              <div key={f.id} className="glass rounded-2xl p-4 flex items-center gap-3 hover:bg-white/5 transition-colors cursor-pointer group">
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${typeColor[f.type]} flex items-center justify-center shrink-0`}><Icon className="w-5 h-5" /></div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate">{f.name}</div>
                  <div className="text-[11px] text-purple-200/60 mt-0.5 flex items-center gap-2">
                    <span>{f.size}</span>
                    <span>•</span>
                    <span>{f.date}</span>
                    <span className="glass px-1.5 py-0.5 rounded text-[10px]">{f.tag}</span>
                  </div>
                </div>
                <MoreVertical className="w-4 h-4 text-purple-200/40 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            );
          })}
        </div>
      </div>
      <div className="glass-strong rounded-3xl p-5 md:p-6 flex items-start gap-4 relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-32 h-32 rounded-full brand-grad opacity-30 blur-3xl" />
        <div className="w-11 h-11 rounded-2xl brand-grad flex items-center justify-center shrink-0 relative"><Sparkles className="w-5 h-5" /></div>
        <div className="flex-1 relative">
          <h4 className="font-display font-bold mb-1">اقتراح ذكي من نَظْم</h4>
          <p className="text-sm text-purple-100/75">وجدت ٣ ملفات مكررة تستهلك ٨٢ م.ب. أنظّفها نيابةً عنك؟</p>
        </div>
        <button className="brand-grad px-4 py-2 rounded-xl text-sm font-medium shrink-0 relative">نعم، رتّب</button>
      </div>
    </div>
  );
}

function AssistantView({ messages, input, setInput, sendMessage, thinking }) {
  const endRef = useRef(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, thinking]);
  const suggestions = [
    'ما ملخص مهام اليوم؟',
    'ما التعارضات في جدولي؟',
    'ما حالة المطالبات المالية؟',
    'كم مكتباً تحت إشرافي؟',
  ];
  return (
    <div className="grid md:grid-cols-4 gap-6">
      <div className="md:col-span-3 glass rounded-3xl p-5 md:p-6 flex flex-col" style={{ minHeight: '60vh' }}>
        <div className="flex items-center gap-3 pb-4 border-b border-white/10">
          <div className="relative">
            <NazmLogoSvg size={44} />
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#1a0b2e]" />
          </div>
          <div>
            <div className="font-display font-bold">نَظْم</div>
            <div className="text-[11px] text-purple-200/60">متصل • يفكر معك</div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-thin py-4 space-y-3">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.from === 'me' ? 'justify-start' : 'justify-end'}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${m.from === 'me' ? 'glass text-white rounded-br-sm' : 'brand-grad text-white rounded-bl-sm shadow-lg shadow-purple-900/30'}`}>
                {m.text}
              </div>
            </div>
          ))}
          {thinking && (
            <div className="flex justify-end">
              <div className="brand-grad text-white rounded-2xl rounded-bl-sm px-4 py-2.5 text-sm">
                <span className="pulse-soft">يفكر…</span>
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>
        <div className="flex flex-wrap gap-2 pb-3">
          {suggestions.map((s) => (
            <button key={s} onClick={() => setInput(s)} className="glass px-3 py-1.5 rounded-full text-xs text-purple-200/80 hover:text-white hover:bg-white/10">{s}</button>
          ))}
        </div>
        <div className="glass-strong rounded-2xl p-2 flex items-end gap-2">
          <button className="w-9 h-9 rounded-xl flex items-center justify-center text-purple-200/70 hover:text-white"><Paperclip className="w-4 h-4" /></button>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            placeholder="اكتب لنَظْم..."
            rows={1}
            className="flex-1 bg-transparent outline-none text-sm resize-none py-2 placeholder-purple-200/40"
          />
          <button className="w-9 h-9 rounded-xl flex items-center justify-center text-purple-200/70 hover:text-white"><Mic className="w-4 h-4" /></button>
          <button onClick={sendMessage} disabled={thinking} className="w-9 h-9 rounded-xl brand-grad flex items-center justify-center shadow-lg shadow-purple-900/40 disabled:opacity-50">
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="space-y-4">
        <div className="glass rounded-3xl p-5">
          <h3 className="font-display font-bold mb-3">نَظْم يقدر</h3>
          <div className="space-y-3">
            {[
              { icon: CalendarDays, text: 'يرتّب جدولك تلقائياً' },
              { icon: Zap,          text: 'يقترح الأولويات' },
              { icon: FolderOpen,   text: 'يرتّب ملفاتك بذكاء' },
              { icon: Target,       text: 'يذكّرك في الوقت المناسب' },
              { icon: BookOpen,     text: 'يلخّص مستنداتك' },
            ].map((c, i) => (
              <div key={i} className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-xl glass flex items-center justify-center"><c.icon className="w-4 h-4 text-purple-200" /></div>
                <span className="text-purple-100/80">{c.text}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="glass-strong rounded-3xl p-5 relative overflow-hidden">
          <div className="absolute inset-0 brand-grad-soft opacity-50" />
          <div className="relative">
            <Sparkles className="w-6 h-6 mb-2" />
            <h4 className="font-display font-bold">خصوصيتك أولاً</h4>
            <p className="text-xs text-purple-100/75 mt-1 leading-relaxed">
              كل بياناتك مشفّرة، ولا يتم مشاركتها. نَظْم يتعلم منك — ويخدمك وحدك.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingsView({ profile, userName, onSignOut }) {
  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [autoSchedule, setAutoSchedule] = useState(true);
  const initial = userName ? userName.trim().charAt(0) : 'ن';
  const email = profile?.email || 'user@nazm.ai';
  return (
    <div className="grid md:grid-cols-3 gap-6">
      <div className="glass rounded-3xl p-6 md:col-span-1 flex flex-col items-center text-center">
        <div className="w-20 h-20 rounded-3xl brand-grad flex items-center justify-center text-white font-display font-bold text-3xl mb-3 shadow-xl shadow-purple-900/40">
          {initial}
        </div>
        <h3 className="font-display font-bold text-lg">{userName}</h3>
        <p className="text-xs text-purple-200/60 mb-4">{email}</p>
        <div className="glass w-full rounded-xl p-3 text-right">
          <div className="text-[11px] text-purple-200/60">الخطة الحالية</div>
          <div className="font-semibold text-sm">نَظْم الذكي — سنوي</div>
        </div>
        <button onClick={onSignOut} className="w-full mt-3 brand-grad py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2">
          <LogOut className="w-4 h-4" /> تسجيل الخروج
        </button>
      </div>
      <div className="md:col-span-2 space-y-4">
        <div className="glass rounded-3xl p-6">
          <h3 className="font-display font-bold mb-4">التفضيلات</h3>
          <Toggle label="الوضع الليلي"      desc="تجربة أهدأ للعين"                          icon={Moon}     value={darkMode}      onChange={setDarkMode} />
          <Toggle label="الإشعارات الذكية"  desc="نَظْم يختار الوقت المناسب للتنبيه"          icon={Bell}     value={notifications} onChange={setNotifications} />
          <Toggle label="الجدولة التلقائية" desc="اسمح لنَظْم بإعادة ترتيب مهامك"             icon={Sparkles} value={autoSchedule}  onChange={setAutoSchedule} />
        </div>
        <div className="glass rounded-3xl p-6">
          <h3 className="font-display font-bold mb-4">اللغة والمنطقة</h3>
          <div className="grid grid-cols-2 gap-3">
            <button className="brand-grad rounded-xl p-3 text-sm font-semibold flex items-center justify-center gap-2"><Globe className="w-4 h-4" /> العربية</button>
            <button className="glass rounded-xl p-3 text-sm font-semibold flex items-center justify-center gap-2"><Globe className="w-4 h-4" /> English</button>
          </div>
        </div>
        <div className="glass-strong rounded-3xl p-6 relative overflow-hidden">
          <div className="absolute inset-0 brand-grad-soft opacity-40" />
          <div className="relative flex items-center justify-between gap-4">
            <div>
              <div className="font-display font-bold">ذكاء يرتّب حياتك</div>
              <div className="text-xs text-purple-100/70 mt-1">نَظْم — الإصدار ٢.٠.٠</div>
            </div>
            <NazmLogoSvg size={56} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Toggle({ label, desc, icon: Icon, value, onChange }) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-white/5 last:border-0">
      <div className="w-10 h-10 rounded-xl glass flex items-center justify-center shrink-0"><Icon className="w-4 h-4 text-purple-200" /></div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold">{label}</div>
        <div className="text-[11px] text-purple-200/60 truncate">{desc}</div>
      </div>
      <button onClick={() => onChange(!value)} className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${value ? 'brand-grad' : 'bg-white/15'}`}>
        <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${value ? 'right-0.5' : 'right-[22px]'}`} />
      </button>
    </div>
  );
}
