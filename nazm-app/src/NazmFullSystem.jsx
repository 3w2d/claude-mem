import React, { useState, useEffect, useRef } from 'react';
import {
  Routes, Route, Navigate, Link, NavLink, Outlet,
  useNavigate, useLocation,
} from 'react-router-dom';
import {
  Brain, Globe, Mail, FileSpreadsheet,
  Layout, Zap, Lock, Bell, Settings as SettingsIcon,
  BarChart3, Smartphone, Monitor, Laptop,
  LogIn, LogOut, Fingerprint, ChevronRight, CheckCircle2,
  User, Sun, Moon, Shield, AlertTriangle,
  MapPin, Send, FileDown, Wifi, WifiOff, Crosshair,
} from 'lucide-react';
import { APP, FIELD_STATS, AI_MESSAGE, SECTIONS } from './config.js';
import { useAuth } from './auth/AuthProvider.jsx';
import { isAuthConfigured } from './auth/msalConfig.js';
import { useGeolocation } from './lib/useGeolocation.js';
import { ask } from './lib/aiMock.js';
import { generateReport } from './lib/pdfReport.js';

// --- Theme tokens (dark + light) ---
const THEMES = {
  dark: {
    page: 'bg-[#070A12] text-white',
    overlay: 'bg-[#070A12]',
    navBg: 'bg-[#070A12]/80 border-purple-900/20',
    surface: 'bg-[#150E2B] border-gray-800',
    surfaceAlt: 'bg-[#0D081D] border-gray-800',
    surfaceFrom: 'from-[#1E1B4B] to-[#070A12] border-purple-500/20',
    chip: 'bg-white/5 border border-white/10 hover:bg-white/10',
    chipMuted: 'bg-white/5 border border-white/10',
    textMain: 'text-white',
    textMuted: 'text-gray-400',
    textFaint: 'text-gray-500',
    headline: 'bg-gradient-to-b from-white via-white to-purple-500 bg-clip-text text-transparent',
    inputBorder: 'border-gray-800',
    divider: 'border-white/5',
    heroGlow: 'bg-[#8B5CF6]/10',
    bottomBar: 'bg-[#150E2B]/95 border-t border-purple-900/30',
  },
  light: {
    page: 'bg-[#F5F3FF] text-slate-900',
    overlay: 'bg-[#F5F3FF]',
    navBg: 'bg-white/80 border-purple-200',
    surface: 'bg-white border-slate-200',
    surfaceAlt: 'bg-[#FAF9FF] border-slate-200',
    surfaceFrom: 'from-[#EDE9FE] to-white border-purple-300',
    chip: 'bg-white border border-slate-200 hover:bg-slate-50 text-slate-700',
    chipMuted: 'bg-slate-100 border border-slate-200 text-slate-700',
    textMain: 'text-slate-900',
    textMuted: 'text-slate-600',
    textFaint: 'text-slate-500',
    headline: 'bg-gradient-to-b from-slate-900 via-slate-900 to-[#8B5CF6] bg-clip-text text-transparent',
    inputBorder: 'border-slate-200',
    divider: 'border-slate-200',
    heroGlow: 'bg-[#8B5CF6]/20',
    bottomBar: 'bg-white/95 border-t border-purple-200',
  },
};

const STORAGE_KEYS = { theme: 'nazm.theme', lang: 'nazm.lang' };

const SECTION_ICONS = {
  home: Layout,
  ai: Brain,
  field: MapPin,
  mail: Mail,
  sheets: FileSpreadsheet,
  analytics: BarChart3,
  profile: User,
  settings: SettingsIcon,
};

export default function NazmFullSystem() {
  const [isRtl, setIsRtl] = useState(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.lang) : null;
    return saved ? saved === 'ar' : true;
  });
  const [theme, setTheme] = useState(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.theme) : null;
    return saved === 'light' || saved === 'dark' ? saved : 'dark';
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.theme, theme);
  }, [theme]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.lang, isRtl ? 'ar' : 'en');
  }, [isRtl]);

  const T = THEMES[theme];
  const isDark = theme === 'dark';

  const toggleLang = () => setIsRtl((v) => !v);
  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  return (
    <div
      className={`min-h-screen overflow-x-hidden transition-colors duration-300 ${T.page} ${isRtl ? 'font-arabic' : 'font-sans'}`}
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <TopBar T={T} isDark={isDark} isRtl={isRtl} toggleLang={toggleLang} toggleTheme={toggleTheme} />

      <Routes>
        <Route path="/" element={<LandingPage T={T} isRtl={isRtl} />} />
        <Route path="/auth" element={<AuthPage T={T} isRtl={isRtl} />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute T={T} isRtl={isRtl}>
              <DashboardLayout T={T} isRtl={isRtl} theme={theme} setTheme={setTheme} />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="home" replace />} />
          <Route path="home" element={<HomeSection T={T} isRtl={isRtl} />} />
          <Route path="ai" element={<AISection T={T} isRtl={isRtl} />} />
          <Route path="field" element={<FieldSection T={T} isRtl={isRtl} />} />
          <Route path="mail" element={<MailSection T={T} isRtl={isRtl} />} />
          <Route path="sheets" element={<SheetsSection T={T} isRtl={isRtl} />} />
          <Route path="analytics" element={<AnalyticsSection T={T} isRtl={isRtl} />} />
          <Route path="profile" element={<ProfileSection T={T} isRtl={isRtl} />} />
          <Route
            path="settings"
            element={<SettingsSection T={T} isRtl={isRtl} theme={theme} setTheme={setTheme} />}
          />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

// --- Top Bar (always rendered) ---
function TopBar({ T, isDark, isRtl, toggleLang, toggleTheme }) {
  const { isAuthenticated, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const hideSignIn = location.pathname.startsWith('/dashboard') || location.pathname === '/auth';

  return (
    <nav className={`p-5 border-b flex justify-between items-center backdrop-blur-xl sticky top-0 z-50 ${T.navBg}`}>
      <Link
        to="/"
        className="flex items-center gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8B5CF6] rounded-xl"
        aria-label={isRtl ? 'العودة إلى الصفحة الرئيسية' : 'Go to landing'}
      >
        <div className="bg-gradient-to-tr from-[#8B5CF6] to-[#A5F3FC] p-2 rounded-xl shadow-lg shadow-purple-500/20">
          <Brain className="text-black" size={24} />
        </div>
        <div className="flex flex-col text-start">
          <span className={`text-xl font-black tracking-tight ${T.textMain}`}>
            {APP.brandAr} | {APP.brandEn}
          </span>
          <span className="text-[8px] text-purple-400 uppercase tracking-widest leading-none">
            {APP.tagline}
          </span>
        </div>
      </Link>

      <div className="flex items-center gap-2 md:gap-3">
        <button
          type="button"
          onClick={toggleTheme}
          className={`text-[10px] md:text-xs px-3 py-1.5 rounded-full transition flex items-center gap-1 ${T.chip}`}
          aria-label={isDark ? (isRtl ? 'تفعيل الوضع النهاري' : 'Switch to light mode') : (isRtl ? 'تفعيل الوضع الليلي' : 'Switch to dark mode')}
        >
          {isDark ? <Sun size={14} /> : <Moon size={14} />}
          <span>{isDark ? (isRtl ? 'نهاري' : 'Light') : (isRtl ? 'ليلي' : 'Dark')}</span>
        </button>
        <button
          type="button"
          onClick={toggleLang}
          className={`text-[10px] md:text-xs px-3 py-1.5 rounded-full transition flex items-center gap-1 ${T.chip}`}
        >
          <Globe size={14} /> {isRtl ? 'English' : 'العربية'}
        </button>

        {isAuthenticated ? (
          <button
            type="button"
            onClick={async () => { await signOut(); navigate('/'); }}
            className={`text-[10px] md:text-xs px-3 py-1.5 rounded-full transition flex items-center gap-1 ${T.chip}`}
          >
            <LogOut size={14} /> {isRtl ? 'خروج' : 'Sign Out'}
          </button>
        ) : (
          !hideSignIn && (
            <Link
              to="/auth"
              className="bg-[#8B5CF6] text-white px-5 py-2 rounded-full text-xs font-bold hover:brightness-110 transition shadow-lg shadow-purple-500/20"
            >
              {isRtl ? 'دخول' : 'Sign In'}
            </Link>
          )
        )}
      </div>
    </nav>
  );
}

// --- Protected Route Guard ---
function ProtectedRoute({ T, isRtl, children }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace state={{ from: location }} />;
  }
  return children;
}

// --- Landing Page ---
function LandingPage({ T, isRtl }) {
  const navigate = useNavigate();
  return (
    <div className="relative pt-20 pb-32 px-6">
      <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-full h-96 blur-[120px] rounded-full -z-10 ${T.heroGlow}`} />

      <div className="max-w-5xl mx-auto text-center">
        <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8 animate-bounce ${T.chipMuted}`}>
          <Zap size={14} className="text-[#8B5CF6]" />
          <span className="text-[10px] uppercase font-bold tracking-widest">
            {isRtl ? 'الجيل القادم من الإنتاجية' : 'Next-Gen Productivity'}
          </span>
        </div>

        <h1 className={`text-5xl md:text-8xl font-black mb-8 leading-[1.1] ${T.headline}`}>
          {isRtl ? 'ذكاء يرتب حياتك' : 'Intelligence That Organizes Your Life'}
        </h1>

        <p className={`text-lg md:text-2xl mb-12 max-w-3xl mx-auto leading-relaxed ${T.textMuted}`}>
          {isRtl
            ? 'نظام نَظْم يتعلم من عاداتك، يدير ملفاتك، ويربط بريدك بجدول أعمالك وتقاريرك الميدانية بهدوء واحترافية مطلقة.'
            : 'NAZM learns your habits, manages your files, and syncs your mail with your schedule and field reports with total professionalism.'}
        </p>

        <div className="flex flex-col md:flex-row justify-center gap-4">
          <button
            type="button"
            onClick={() => navigate('/auth')}
            className="bg-[#8B5CF6] text-white px-12 py-5 rounded-2xl font-black text-xl hover:scale-105 transition duration-300 shadow-lg shadow-purple-500/30"
          >
            {isRtl ? 'ابدأ كـ مؤسس الآن' : 'Start as Founder'}
          </button>
          <button type="button" className={`px-12 py-5 rounded-2xl font-bold text-xl transition ${T.chip}`}>
            {isRtl ? 'مشاهدة العرض' : 'Watch Demo'}
          </button>
        </div>

        <div className={`mt-20 flex justify-center items-center gap-8 ${T.textFaint}`}>
          <div className="flex flex-col items-center gap-2"><Laptop size={32} />     <span className="text-[10px]">Web</span></div>
          <div className="flex flex-col items-center gap-2"><Smartphone size={32} /> <span className="text-[10px]">Mobile</span></div>
          <div className="flex flex-col items-center gap-2"><Monitor size={32} />    <span className="text-[10px]">Desktop</span></div>
        </div>
      </div>
    </div>
  );
}

// --- Auth Page ---
function AuthPage({ T, isRtl }) {
  const { signIn, busy, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated) navigate(from, { replace: true });
  }, [isAuthenticated, from, navigate]);

  const onMicrosoft = async () => {
    setError('');
    try {
      await signIn();
    } catch (err) {
      setError(err?.errorMessage || err?.message || String(err));
    }
  };

  return (
    <div className={`max-w-md mx-auto mt-20 mb-24 p-8 rounded-[40px] shadow-2xl border ${T.surface}`}>
      <div className="text-center mb-8">
        <Fingerprint size={48} className="mx-auto text-[#8B5CF6] mb-4" />
        <h2 className={`text-3xl font-black mb-2 ${T.textMain}`}>
          {isRtl ? 'دخول آمن' : 'Secure Login'}
        </h2>
        <p className={`text-sm ${T.textMuted}`}>
          {isRtl ? 'الوصول مقيد للموظفين المعتمدين فقط' : 'Access restricted to authorized personnel'}
        </p>
      </div>

      {!isAuthConfigured && (
        <div className="mb-6 p-3 rounded-xl bg-amber-500/10 border border-amber-500/40 text-amber-500 flex gap-2 items-start text-[11px]">
          <AlertTriangle size={14} className="mt-0.5 shrink-0" />
          <span>
            {isRtl
              ? 'Microsoft Entra غير مفعّل بعد (Dev mode). اضبط VITE_AZURE_CLIENT_ID لتفعيل الدخول الحقيقي.'
              : 'Microsoft Entra not configured yet (dev mode). Set VITE_AZURE_CLIENT_ID to enable real sign-in.'}
          </span>
        </div>
      )}

      <div className="space-y-4">
        <AuthButton
          T={T}
          icon={<Mail size={20} className="text-blue-500" />}
          label={isRtl ? 'متابعة عبر Microsoft 365' : 'Continue with Microsoft 365'}
          onClick={onMicrosoft}
          disabled={busy}
        />
        <AuthButton
          T={T}
          icon={<span className="text-red-500 font-bold italic">G</span>}
          label={isRtl ? 'Google (قريباً)' : 'Google (soon)'}
          disabled
        />
        <AuthButton
          T={T}
          icon={<LogIn size={20} />}
          label={isRtl ? 'Apple (قريباً)' : 'Apple (soon)'}
          disabled
        />
      </div>

      {error && (
        <p className="text-[11px] text-center text-red-500 mt-4 leading-relaxed">{error}</p>
      )}

      <p className={`text-[10px] text-center mt-8 leading-relaxed ${T.textFaint}`}>
        {isRtl
          ? 'الدخول يمنحك وصولاً إلى 142 مطالبة، 32 مكتباً، و63 موظفاً. الصلاحية تنتهي تلقائياً بعد انتهاء الجلسة.'
          : 'Sign-in grants access to 142 claims, 32 offices, and 63 staff. Session expires automatically.'}
      </p>
    </div>
  );
}

function AuthButton({ icon, label, onClick, disabled = false, T }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`w-full flex items-center gap-4 p-4 rounded-2xl transition group ${T.chip} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <div className="bg-black/10 p-2 rounded-lg group-hover:scale-110 transition">{icon}</div>
      <span className="font-bold text-sm">{label}</span>
      <ChevronRight size={16} className="ms-auto opacity-40" />
    </button>
  );
}

// --- Dashboard Layout ---
function DashboardLayout({ T, isRtl }) {
  const location = useLocation();
  const activeKey = location.pathname.split('/')[2] || 'home';

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 pb-28 lg:pb-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
      <aside className="lg:col-span-3 space-y-6">
        <SidebarProfile T={T} isRtl={isRtl} />
        <SidebarNav T={T} isRtl={isRtl} activeKey={activeKey} />
        {APP.userRole === 'founder' && <SidebarStats T={T} isRtl={isRtl} />}
      </aside>

      <main className="lg:col-span-9 space-y-6">
        <Outlet />
      </main>

      <MobileBottomNav T={T} isRtl={isRtl} activeKey={activeKey} />
    </div>
  );
}

// --- Sidebar ---
function SidebarProfile({ T, isRtl }) {
  const { profile } = useAuth();
  const name = profile?.name || APP.userName;
  return (
    <div className={`p-6 rounded-[32px] border ${T.surface}`}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
          <User size={20} className="text-[#8B5CF6]" />
        </div>
        <div className="flex-1">
          <p className={`text-[10px] uppercase ${T.textFaint}`}>
            {isRtl ? APP.userTitle : APP.userTitleEn}
          </p>
          <p className={`font-bold text-sm ${T.textMain}`}>{name}</p>
        </div>
      </div>
    </div>
  );
}

function SidebarNav({ T, isRtl, activeKey }) {
  return (
    <div className={`p-4 rounded-[32px] border ${T.surface}`}>
      <nav className="space-y-2">
        {SECTIONS.map((s) => {
          const Icon = SECTION_ICONS[s.key] || Layout;
          return (
            <NavLink
              key={s.key}
              to={`/dashboard/${s.path}`}
              className={({ isActive }) =>
                `w-full flex items-center gap-3 p-3 rounded-xl transition text-start focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8B5CF6] ${
                  isActive
                    ? 'bg-[#8B5CF6] text-white shadow-lg shadow-purple-500/20'
                    : `${T.textMuted} hover:bg-black/5`
                }`
              }
            >
              <Icon size={18} />
              <span className="text-xs font-bold">{isRtl ? s.labelAr : s.labelEn}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}

function SidebarStats({ T, isRtl }) {
  return (
    <div className={`bg-gradient-to-br p-6 rounded-[32px] border ${T.surfaceFrom}`}>
      <h3 className={`text-xs font-bold mb-4 flex items-center gap-2 ${T.textMain}`}>
        <Lock size={12} className="text-[#8B5CF6]" /> {isRtl ? 'إحصائيات الميدان' : 'Field Stats'}
      </h3>
      <div className="space-y-4">
        {FIELD_STATS.map((s) => (
          <StatItem
            key={s.key}
            label={isRtl ? s.labelAr : s.labelEn}
            value={s.value}
            accent={s.accent}
            T={T}
          />
        ))}
      </div>
    </div>
  );
}

function MobileBottomNav({ T, isRtl }) {
  const items = SECTIONS.filter((s) => ['home', 'ai', 'field', 'analytics', 'profile'].includes(s.key));
  return (
    <nav
      className={`lg:hidden fixed bottom-0 inset-x-0 backdrop-blur-xl p-3 flex justify-around items-center z-50 ${T.bottomBar}`}
      aria-label={isRtl ? 'التنقل السفلي' : 'Bottom navigation'}
    >
      {items.map((s) => {
        const Icon = SECTION_ICONS[s.key] || Layout;
        return (
          <NavLink
            key={s.key}
            to={`/dashboard/${s.path}`}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8B5CF6] ${
                isActive ? 'text-[#8B5CF6]' : 'text-slate-400'
              }`
            }
          >
            <Icon size={22} />
            <span className="text-[9px] font-bold">
              {(isRtl ? s.labelAr : s.labelEn).split(' ')[0]}
            </span>
          </NavLink>
        );
      })}
    </nav>
  );
}

// --- Dashboard Sections ---
function HomeSection({ T, isRtl }) {
  return (
    <>
      <div className={`p-8 rounded-[40px] relative overflow-hidden border ${T.surface}`}>
        <div className="absolute top-0 left-0 w-2 h-full bg-[#8B5CF6]" />
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Brain className="text-[#8B5CF6] animate-pulse" />
            <h2 className={`text-2xl font-black ${T.textMain}`}>
              {isRtl ? 'نظم يفكر معك الآن' : 'Nazm AI Thinking'}
            </h2>
          </div>
          {APP.office365Connected && (
            <div className="flex items-center gap-2 bg-green-500/10 text-green-500 px-3 py-1 rounded-full text-[10px]">
              <CheckCircle2 size={12} /> Office 365 Connected
            </div>
          )}
        </div>
        <p className={`text-lg md:text-xl leading-relaxed ${T.textMuted}`}>
          {isRtl ? AI_MESSAGE.ar : AI_MESSAGE.en}
        </p>
        <div className="mt-6 flex gap-3 flex-wrap">
          <button type="button" className="bg-[#8B5CF6] text-white px-6 py-2 rounded-xl text-xs font-bold hover:brightness-110 transition">
            {isRtl ? 'نعم، نفذ' : 'Yes, Proceed'}
          </button>
          <button type="button" className={`px-6 py-2 rounded-xl text-xs font-bold transition ${T.chip}`}>
            {isRtl ? 'عرض التفاصيل' : 'View Details'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <PlaceholderCard
          T={T}
          icon={<BarChart3 size={40} className="text-[#8B5CF6] mb-4 opacity-60" />}
          title={isRtl ? 'تقرير الأداء الأسبوعي' : 'Weekly Performance'}
          subtitle="Power BI Embedded View"
        />
        <PlaceholderCard
          T={T}
          icon={<FileSpreadsheet size={40} className="text-[#8B5CF6] mb-4 opacity-60" />}
          title={isRtl ? 'سجل المطالبات المالية' : 'Financial Claims Log'}
          subtitle="Excel Live Sync"
        />
      </div>
    </>
  );
}

function MailSection({ T, isRtl }) {
  return (
    <SectionShell
      T={T}
      icon={<Mail className="text-[#8B5CF6]" size={28} />}
      title={isRtl ? 'البريد والمهام' : 'Mail & Tasks'}
      desc={isRtl
        ? 'يلتقط نَظْم رسائلك من Outlook ويحوّلها إلى مهام قابلة للتنفيذ مع تواريخ مقترحة.'
        : 'NAZM captures your Outlook messages and turns them into actionable tasks with suggested dates.'}
    />
  );
}

function SheetsSection({ T, isRtl }) {
  return (
    <SectionShell
      T={T}
      icon={<FileSpreadsheet className="text-[#8B5CF6]" size={28} />}
      title={isRtl ? 'جداول البيانات' : 'Spreadsheets'}
      desc={isRtl
        ? 'مزامنة مباشرة مع Excel Live: تعديلاتك تنعكس فوراً على تقارير الميدان.'
        : 'Live Excel sync: your edits reflect immediately across field reports.'}
    />
  );
}

function AnalyticsSection({ T, isRtl }) {
  const reportRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    setError('');
    setBusy(true);
    try {
      await generateReport(reportRef.current, {
        fileName: `nazm-report-${new Date().toISOString().slice(0, 10)}.pdf`,
        brand: `${APP.brandEn} · ${APP.brandAr}`,
      });
    } catch (e) {
      setError(e?.message || String(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={`p-8 rounded-[40px] border ${T.surface}`}>
      <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
        <div className="flex items-center gap-3">
          <BarChart3 className="text-[#8B5CF6]" size={28} />
          <h2 className={`text-2xl font-black ${T.textMain}`}>
            {isRtl ? 'تقارير الأداء' : 'Analytics'}
          </h2>
        </div>
        <button
          type="button"
          onClick={handleGenerate}
          disabled={busy}
          className={`px-5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 bg-[#8B5CF6] text-white hover:brightness-110 ${busy ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <FileDown size={14} />
          {busy
            ? (isRtl ? 'جاري التوليد…' : 'Generating…')
            : (isRtl ? 'تقرير PDF احترافي' : 'Professional PDF Report')}
        </button>
      </div>

      {error && (
        <p className="text-xs text-red-500 mb-4">{error}</p>
      )}

      <div ref={reportRef} className={`p-6 rounded-3xl border ${T.inputBorder}`}>
        <h3 className={`text-lg font-black mb-4 ${T.textMain}`}>
          {isRtl ? 'ملخص الحالة الميدانية' : 'Field Status Summary'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {FIELD_STATS.map((s) => (
            <div key={s.key} className={`p-4 rounded-2xl border ${T.surfaceAlt}`}>
              <p className={`text-[10px] uppercase ${T.textFaint}`}>
                {isRtl ? s.labelAr : s.labelEn}
              </p>
              <p className={`text-3xl font-black ${T.textMain}`}>{s.value}</p>
            </div>
          ))}
        </div>
        <p className={`text-sm mt-6 leading-relaxed ${T.textMuted}`}>
          {isRtl ? AI_MESSAGE.ar : AI_MESSAGE.en}
        </p>
      </div>
    </div>
  );
}

function AISection({ T, isRtl }) {
  const [messages, setMessages] = useState(() => [
    { role: 'assistant', text: isRtl
      ? 'أهلاً عوض. اسألني عن المطالبات، المكاتب، الموظفين، أو تداخل المواعيد.'
      : 'Hi Awadh. Ask me about claims, offices, staff, or scheduling conflicts.' },
  ]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const listRef = useRef(null);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, thinking]);

  const onSend = async (e) => {
    e?.preventDefault();
    const text = input.trim();
    if (!text || thinking) return;
    setInput('');
    setMessages((m) => [...m, { role: 'user', text }]);
    setThinking(true);
    const reply = await ask(text, { isRtl });
    setMessages((m) => [...m, { role: 'assistant', text: reply }]);
    setThinking(false);
  };

  const suggestions = isRtl
    ? ['هل يوجد تداخل في المواعيد؟', 'ملخص المطالبات', 'حالة المكاتب']
    : ['Any scheduling conflicts?', 'Claims summary', 'Office status'];

  return (
    <div className={`p-8 rounded-[40px] border ${T.surface} flex flex-col`} style={{ minHeight: 480 }}>
      <div className="flex items-center gap-3 mb-4">
        <Brain className="text-[#8B5CF6] animate-pulse" size={28} />
        <h2 className={`text-2xl font-black ${T.textMain}`}>
          {isRtl ? 'المساعد الذكي' : 'AI Assistant'}
        </h2>
      </div>

      <div
        ref={listRef}
        className={`flex-1 overflow-y-auto space-y-3 mb-4 pr-1 ${T.textMain}`}
        style={{ maxHeight: 360 }}
      >
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                m.role === 'user'
                  ? 'bg-[#8B5CF6] text-white'
                  : `${T.chipMuted}`
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
        {thinking && (
          <div className="flex justify-start">
            <div className={`px-4 py-3 rounded-2xl text-sm ${T.chipMuted}`}>
              <span className="animate-pulse">{isRtl ? 'يفكر…' : 'Thinking…'}</span>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        {suggestions.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setInput(s)}
            className={`text-[11px] px-3 py-1.5 rounded-full ${T.chip}`}
          >
            {s}
          </button>
        ))}
      </div>

      <form onSubmit={onSend} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={isRtl ? 'اكتب سؤالك…' : 'Type your question…'}
          className={`flex-1 px-4 py-3 rounded-2xl outline-none text-sm border ${T.inputBorder} ${T.surfaceAlt} ${T.textMain}`}
          aria-label={isRtl ? 'سؤال للمساعد الذكي' : 'Question for the AI assistant'}
        />
        <button
          type="submit"
          disabled={thinking || !input.trim()}
          className={`px-4 py-3 rounded-2xl bg-[#8B5CF6] text-white transition ${thinking || !input.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:brightness-110'}`}
          aria-label={isRtl ? 'إرسال' : 'Send'}
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}

function FieldSection({ T, isRtl }) {
  const { position, error, loading, capture } = useGeolocation();
  const [visits, setVisits] = useState([]);
  const online = useOnlineStatus();

  const saveVisit = () => {
    if (!position) return;
    setVisits((v) => [{ ...position, capturedAt: new Date().toISOString() }, ...v]);
  };

  return (
    <div className={`p-8 rounded-[40px] border ${T.surface}`}>
      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <MapPin className="text-[#8B5CF6]" size={28} />
          <h2 className={`text-2xl font-black ${T.textMain}`}>
            {isRtl ? 'العمليات الميدانية' : 'Field Operations'}
          </h2>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] ${
          online ? 'bg-green-500/10 text-green-500' : 'bg-amber-500/10 text-amber-500'
        }`}>
          {online ? <Wifi size={12} /> : <WifiOff size={12} />}
          {online ? (isRtl ? 'متصل' : 'Online') : (isRtl ? 'غير متصل' : 'Offline')}
        </div>
      </div>

      <p className={`text-sm mb-6 leading-relaxed ${T.textMuted}`}>
        {isRtl
          ? 'التقط موقع الزيارة لتوثيق عمليات التفقد في 137,000 كم² من المنطقة. تُحفظ البيانات محلياً وتعمل دون اتصال بالشبكة.'
          : 'Capture visit coordinates to verify field audits across the 137,000 km² region. Data stays local and works offline.'}
      </p>

      <button
        type="button"
        onClick={capture}
        disabled={loading}
        className={`w-full px-6 py-4 rounded-2xl font-black text-base bg-[#8B5CF6] text-white hover:brightness-110 transition flex items-center justify-center gap-3 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <Crosshair size={18} />
        {loading
          ? (isRtl ? 'جاري تحديد الموقع…' : 'Acquiring location…')
          : (isRtl ? 'التقاط إحداثيات الزيارة' : 'Capture visit coordinates')}
      </button>

      {error && (
        <p className="text-xs text-red-500 mt-3">
          {isRtl ? 'خطأ في الموقع: ' : 'Location error: '}{error.message}
        </p>
      )}

      {position && (
        <div className={`mt-6 p-5 rounded-3xl border ${T.inputBorder}`}>
          <h3 className={`font-bold text-sm mb-3 ${T.textMain}`}>
            {isRtl ? 'آخر قراءة GPS' : 'Latest GPS fix'}
          </h3>
          <dl className="grid grid-cols-2 gap-3 text-xs">
            <FieldRow T={T} label={isRtl ? 'خط العرض' : 'Latitude'}  value={position.latitude.toFixed(6)} />
            <FieldRow T={T} label={isRtl ? 'خط الطول' : 'Longitude'} value={position.longitude.toFixed(6)} />
            <FieldRow T={T} label={isRtl ? 'الدقة' : 'Accuracy'}     value={`±${Math.round(position.accuracy)} m`} />
            <FieldRow T={T} label={isRtl ? 'الوقت' : 'Captured'}
                             value={new Date(position.timestamp).toLocaleTimeString()} />
          </dl>
          <button
            type="button"
            onClick={saveVisit}
            className={`mt-4 px-5 py-2 rounded-xl text-xs font-bold transition ${T.chip}`}
          >
            {isRtl ? 'حفظ زيارة' : 'Save visit'}
          </button>
        </div>
      )}

      {visits.length > 0 && (
        <div className="mt-6">
          <h3 className={`font-bold text-sm mb-3 ${T.textMain}`}>
            {isRtl ? 'سجل الزيارات' : 'Visit log'}
          </h3>
          <ul className="space-y-2">
            {visits.map((v, i) => (
              <li
                key={i}
                className={`flex items-center justify-between p-3 rounded-xl border ${T.inputBorder}`}
              >
                <span className={`text-xs font-mono ${T.textMuted}`}>
                  {v.latitude.toFixed(4)}, {v.longitude.toFixed(4)}
                </span>
                <span className={`text-[11px] ${T.textFaint}`}>
                  {new Date(v.capturedAt).toLocaleTimeString()}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function FieldRow({ T, label, value }) {
  return (
    <div>
      <dt className={`text-[10px] uppercase mb-1 ${T.textFaint}`}>{label}</dt>
      <dd className={`font-bold ${T.textMain}`}>{value}</dd>
    </div>
  );
}

function useOnlineStatus() {
  const [online, setOnline] = useState(() =>
    typeof navigator === 'undefined' ? true : navigator.onLine,
  );
  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);
  return online;
}

function ProfileSection({ T, isRtl }) {
  const { profile, isAuthConfigured: configured, signOut } = useAuth();
  const navigate = useNavigate();

  const displayName = profile?.name || APP.userName;
  const displayTitle = isRtl ? APP.userTitle : APP.userTitleEn;
  const email = profile?.email || '—';
  const source = profile?.source === 'entra' ? 'Microsoft Entra' : (isRtl ? 'وضع تطوير محلي' : 'Local dev mode');

  return (
    <div className={`p-8 rounded-[40px] border ${T.surface}`}>
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
          <User size={32} className="text-[#8B5CF6]" />
        </div>
        <div>
          <h2 className={`text-2xl font-black ${T.textMain}`}>{displayName}</h2>
          <p className={`text-sm ${T.textMuted}`}>{displayTitle}</p>
        </div>
      </div>

      <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ProfileRow T={T} label={isRtl ? 'البريد الإلكتروني' : 'Email'}        value={email} />
        <ProfileRow T={T} label={isRtl ? 'مصدر المصادقة' : 'Auth source'}      value={source} />
        <ProfileRow T={T} label={isRtl ? 'الدور' : 'Role'}                     value={isRtl ? 'المؤسس' : 'Founder'} />
        <ProfileRow T={T} label={isRtl ? 'المنطقة' : 'Region'}                 value={isRtl ? 'مكة المكرمة' : 'Makkah'} />
      </dl>

      <div className="mt-8 flex gap-3 flex-wrap">
        <button
          type="button"
          onClick={async () => { await signOut(); navigate('/'); }}
          className="bg-red-500/90 text-white px-6 py-2 rounded-xl text-xs font-bold hover:brightness-110 transition flex items-center gap-2"
        >
          <LogOut size={14} /> {isRtl ? 'تسجيل الخروج' : 'Sign out'}
        </button>
        {!configured && (
          <span className="text-[11px] text-amber-500 self-center">
            {isRtl ? 'لتفعيل Microsoft Entra: اضبط VITE_AZURE_CLIENT_ID' : 'Configure VITE_AZURE_CLIENT_ID to enable Entra'}
          </span>
        )}
      </div>
    </div>
  );
}

function ProfileRow({ T, label, value }) {
  return (
    <div className={`p-3 rounded-xl border ${T.inputBorder}`}>
      <dt className={`text-[10px] uppercase mb-1 ${T.textFaint}`}>{label}</dt>
      <dd className={`text-sm font-bold ${T.textMain}`}>{value}</dd>
    </div>
  );
}

function SettingsSection({ T, isRtl, theme, setTheme }) {
  return (
    <div className={`p-8 rounded-[40px] border ${T.surface}`}>
      <div className="flex items-center gap-3 mb-6">
        <SettingsIcon className="text-[#8B5CF6]" size={28} />
        <h2 className={`text-2xl font-black ${T.textMain}`}>{isRtl ? 'الإعدادات' : 'Settings'}</h2>
      </div>

      <div className="space-y-3">
        <SettingRow
          T={T}
          label={isRtl ? 'المظهر' : 'Appearance'}
          hint={isRtl ? 'تبديل بين الوضع الليلي والنهاري' : 'Toggle dark and light'}
          control={
            <button
              type="button"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className={`text-xs px-3 py-1.5 rounded-full transition ${T.chip}`}
            >
              {theme === 'dark' ? (isRtl ? 'ليلي' : 'Dark') : (isRtl ? 'نهاري' : 'Light')}
            </button>
          }
        />
        <SettingRow
          T={T}
          label={isRtl ? 'الإشعارات' : 'Notifications'}
          hint={isRtl ? 'قريباً' : 'Coming soon'}
          control={<Bell size={16} className={T.textFaint} />}
        />
        <SettingRow
          T={T}
          label={isRtl ? 'الأمان' : 'Security'}
          hint={isAuthConfigured ? 'Microsoft Entra' : (isRtl ? 'وضع تطوير محلي' : 'Dev mode')}
          control={<Shield size={16} className={T.textFaint} />}
        />
      </div>
    </div>
  );
}

function SettingRow({ T, label, hint, control }) {
  return (
    <div className={`flex items-center justify-between p-4 rounded-2xl border ${T.inputBorder}`}>
      <div>
        <p className={`font-bold text-sm ${T.textMain}`}>{label}</p>
        <p className={`text-[11px] ${T.textFaint}`}>{hint}</p>
      </div>
      {control}
    </div>
  );
}

// --- Helpers ---
function SectionShell({ icon, title, desc, T }) {
  return (
    <div className={`p-8 rounded-[40px] border ${T.surface}`}>
      <div className="flex items-center gap-3 mb-4">
        {icon}
        <h2 className={`text-2xl font-black ${T.textMain}`}>{title}</h2>
      </div>
      <p className={`text-base md:text-lg leading-relaxed ${T.textMuted}`}>{desc}</p>
    </div>
  );
}

function PlaceholderCard({ T, icon, title, subtitle }) {
  return (
    <div className={`h-64 rounded-[32px] p-6 flex flex-col items-center justify-center text-center border ${T.surfaceAlt}`}>
      {icon}
      <h4 className={`font-bold text-sm mb-1 ${T.textMain}`}>{title}</h4>
      <p className={`text-[10px] italic ${T.textFaint}`}>{subtitle}</p>
    </div>
  );
}

function StatItem({ label, value, accent, T }) {
  const accentClass =
    accent === 'cyan'   ? 'text-[#A5F3FC]' :
    accent === 'purple' ? 'text-[#8B5CF6]' :
                          T.textMain;
  return (
    <div className={`flex justify-between items-end border-b pb-2 ${T.divider}`}>
      <span className={`text-[10px] uppercase ${T.textFaint}`}>{label}</span>
      <span className={`text-xl font-black ${accentClass}`}>{value}</span>
    </div>
  );
}
