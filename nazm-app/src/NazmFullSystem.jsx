import React, { useState } from 'react';
import {
  Brain, Globe, Shield, Mail, FileSpreadsheet,
  Layout, Zap, Lock, Bell, Settings,
  BarChart3, Smartphone, Monitor, Laptop,
  LogIn, Fingerprint, ChevronRight, CheckCircle2,
  User, Sun, Moon,
} from 'lucide-react';
import { APP, FIELD_STATS, AI_MESSAGE, SECTIONS } from './config.js';

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

export default function NazmFullSystem() {
  const [isRtl, setIsRtl] = useState(true);
  const [theme, setTheme] = useState('dark');
  const [view, setView] = useState('landing');
  const [section, setSection] = useState('home');
  const [isLoading, setIsLoading] = useState(false);

  const T = THEMES[theme];
  const isDark = theme === 'dark';

  const toggleLang  = () => setIsRtl((v) => !v);
  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  const navigateTo = (newView) => {
    setIsLoading(true);
    setTimeout(() => {
      setView(newView);
      if (newView === 'dashboard') setSection('home');
      setIsLoading(false);
    }, 600);
  };

  return (
    <div className={`min-h-screen overflow-x-hidden transition-colors duration-300 ${T.page} ${isRtl ? 'font-arabic' : 'font-sans'}`} dir={isRtl ? 'rtl' : 'ltr'}>

      {isLoading && (
        <div className={`fixed inset-0 z-[100] flex items-center justify-center ${T.overlay}`}>
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8B5CF6]" />
        </div>
      )}

      <nav className={`p-5 border-b flex justify-between items-center backdrop-blur-xl sticky top-0 z-50 ${T.navBg}`}>
        <button
          type="button"
          onClick={() => { setView('landing'); setSection('home'); }}
          className="flex items-center gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8B5CF6] rounded-xl"
          aria-label={isRtl ? 'العودة إلى الصفحة الرئيسية' : 'Go to landing'}
        >
          <div className="bg-gradient-to-tr from-[#8B5CF6] to-[#A5F3FC] p-2 rounded-xl shadow-lg shadow-purple-500/20">
            <Brain className="text-black" size={24} />
          </div>
          <div className="flex flex-col text-start">
            <span className={`text-xl font-black tracking-tight ${T.textMain}`}>{APP.brandAr} | {APP.brandEn}</span>
            <span className="text-[8px] text-purple-400 uppercase tracking-widest leading-none">{APP.tagline}</span>
          </div>
        </button>

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
          {view !== 'dashboard' && (
            <button
              type="button"
              onClick={() => navigateTo('auth')}
              className="bg-[#8B5CF6] text-white px-5 py-2 rounded-full text-xs font-bold hover:brightness-110 transition shadow-lg shadow-purple-500/20"
            >
              {isRtl ? 'دخول' : 'Sign In'}
            </button>
          )}
        </div>
      </nav>

      {view === 'landing'   && <LandingPage isRtl={isRtl} T={T} onStart={() => navigateTo('auth')} />}
      {view === 'auth'      && <AuthPage    isRtl={isRtl} T={T} onSuccess={() => navigateTo('dashboard')} />}
      {view === 'dashboard' && (
        <Dashboard
          isRtl={isRtl}
          T={T}
          section={section}
          setSection={setSection}
        />
      )}
    </div>
  );
}

// --- 1. Landing ---
function LandingPage({ isRtl, T, onStart }) {
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
            onClick={onStart}
            className="bg-[#8B5CF6] text-white px-12 py-5 rounded-2xl font-black text-xl hover:scale-105 transition duration-300 shadow-lg shadow-purple-500/30"
          >
            {isRtl ? 'ابدأ كـ مؤسس الآن' : 'Start as Founder'}
          </button>
          <button
            type="button"
            className={`px-12 py-5 rounded-2xl font-bold text-xl transition ${T.chip}`}
          >
            {isRtl ? 'مشاهدة العرض' : 'Watch Demo'}
          </button>
        </div>

        <div className={`mt-20 flex justify-center items-center gap-8 ${T.textFaint}`}>
          <div className="flex flex-col items-center gap-2"><Laptop size={32}/>     <span className="text-[10px]">Web</span></div>
          <div className="flex flex-col items-center gap-2"><Smartphone size={32}/> <span className="text-[10px]">Mobile</span></div>
          <div className="flex flex-col items-center gap-2"><Monitor size={32}/>    <span className="text-[10px]">Desktop</span></div>
        </div>
      </div>
    </div>
  );
}

// --- 2. Auth ---
function AuthPage({ isRtl, T, onSuccess }) {
  return (
    <div className={`max-w-md mx-auto mt-20 mb-24 p-8 rounded-[40px] shadow-2xl border ${T.surface}`}>
      <div className="text-center mb-10">
        <Fingerprint size={48} className="mx-auto text-[#8B5CF6] mb-4" />
        <h2 className={`text-3xl font-black mb-2 ${T.textMain}`}>{isRtl ? 'دخول آمن' : 'Secure Login'}</h2>
        <p className={`text-sm ${T.textMuted}`}>{isRtl ? 'اختر الطريقة المفضلة للربط' : 'Choose your preferred sync method'}</p>
      </div>

      <div className="space-y-4">
        <AuthButton T={T} icon={<Mail size={20} className="text-blue-500"/>} label={isRtl ? 'متابعة عبر Microsoft' : 'Continue with Microsoft'} onClick={onSuccess} />
        <AuthButton T={T} icon={<span className="text-red-500 font-bold italic">G</span>} label={isRtl ? 'متابعة عبر Google' : 'Continue with Google'} onClick={onSuccess} />
        <AuthButton T={T} icon={<LogIn size={20} />} label={isRtl ? 'متابعة عبر Apple' : 'Continue with Apple'} onClick={onSuccess} />
      </div>

      <p className={`text-[10px] text-center mt-8 leading-relaxed ${T.textFaint}`}>
        {isRtl
          ? 'بالمتابعة، أنت توافق على ربط بيانات الأوفيس والملفات بنظام نَظْم للتحليل الذكي.'
          : 'By continuing, you agree to sync your Office data and files with NAZM AI analysis.'}
      </p>
    </div>
  );
}

function AuthButton({ icon, label, onClick, T }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center gap-4 p-4 rounded-2xl transition group ${T.chip}`}
    >
      <div className="bg-black/10 p-2 rounded-lg group-hover:scale-110 transition">{icon}</div>
      <span className="font-bold text-sm">{label}</span>
      <ChevronRight size={16} className="ms-auto opacity-40" />
    </button>
  );
}

// --- 3. Dashboard ---
function Dashboard({ isRtl, T, section, setSection }) {
  const sidebarIcons = {
    home: <Layout size={18}/>,
    mail: <Mail size={18}/>,
    sheets: <FileSpreadsheet size={18}/>,
    analytics: <BarChart3 size={18}/>,
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 pb-28 lg:pb-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
      <aside className="lg:col-span-3 space-y-6">
        <div className={`p-6 rounded-[32px] border ${T.surface}`}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
              <User size={20} className="text-[#8B5CF6]" />
            </div>
            <div>
              <p className={`text-[10px] uppercase ${T.textFaint}`}>{isRtl ? 'المؤسس' : 'Founder'}</p>
              <p className={`font-bold text-sm ${T.textMain}`}>{APP.userName}</p>
            </div>
          </div>

          <nav className="space-y-2">
            {SECTIONS.map((s) => (
              <NavItem
                key={s.key}
                icon={sidebarIcons[s.key]}
                label={isRtl ? s.labelAr : s.labelEn}
                active={section === s.key}
                onClick={() => setSection(s.key)}
                T={T}
              />
            ))}
          </nav>
        </div>

        {APP.userRole === 'founder' && (
          <div className={`bg-gradient-to-br p-6 rounded-[32px] border ${T.surfaceFrom}`}>
            <h3 className={`text-xs font-bold mb-4 flex items-center gap-2 ${T.textMain}`}>
              <Lock size={12} className="text-[#8B5CF6]"/> {isRtl ? 'إحصائيات الميدان' : 'Field Stats'}
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
        )}
      </aside>

      <main className="lg:col-span-9 space-y-6">
        {section === 'home'      && <HomeSection      isRtl={isRtl} T={T} />}
        {section === 'mail'      && <MailSection      isRtl={isRtl} T={T} />}
        {section === 'sheets'    && <SheetsSection    isRtl={isRtl} T={T} />}
        {section === 'analytics' && <AnalyticsSection isRtl={isRtl} T={T} />}
      </main>

      {/* Mobile bottom nav — real <button>s wired to setSection */}
      <nav
        className={`lg:hidden fixed bottom-0 inset-x-0 backdrop-blur-xl p-3 flex justify-around items-center z-50 ${T.bottomBar}`}
        aria-label={isRtl ? 'التنقل السفلي' : 'Bottom navigation'}
      >
        <BottomTab icon={<Layout size={22} />}          label={isRtl ? 'الرئيسية' : 'Home'}     active={section === 'home'}      onClick={() => setSection('home')} />
        <BottomTab icon={<Mail size={22} />}            label={isRtl ? 'البريد' : 'Mail'}      active={section === 'mail'}      onClick={() => setSection('mail')} />
        <BottomTab icon={<FileSpreadsheet size={22} />} label={isRtl ? 'جداول' : 'Sheets'}    active={section === 'sheets'}    onClick={() => setSection('sheets')} />
        <BottomTab icon={<BarChart3 size={22} />}       label={isRtl ? 'تقارير' : 'Reports'}  active={section === 'analytics'} onClick={() => setSection('analytics')} />
      </nav>
    </div>
  );
}

// --- Dashboard sections ---
function HomeSection({ isRtl, T }) {
  return (
    <>
      <div className={`p-8 rounded-[40px] relative overflow-hidden border ${T.surface}`}>
        <div className="absolute top-0 left-0 w-2 h-full bg-[#8B5CF6]" />
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Brain className="text-[#8B5CF6] animate-pulse" />
            <h2 className={`text-2xl font-black ${T.textMain}`}>{isRtl ? 'نظم يفكر معك الآن' : 'Nazm AI Thinking'}</h2>
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
        <div className={`h-64 rounded-[32px] p-6 flex flex-col items-center justify-center text-center border ${T.surfaceAlt}`}>
          <BarChart3 size={40} className="text-[#8B5CF6] mb-4 opacity-60" />
          <h4 className={`font-bold text-sm mb-1 ${T.textMain}`}>{isRtl ? 'تقرير الأداء الأسبوعي' : 'Weekly Performance'}</h4>
          <p className={`text-[10px] italic ${T.textFaint}`}>Power BI Embedded View</p>
        </div>
        <div className={`h-64 rounded-[32px] p-6 flex flex-col items-center justify-center text-center border ${T.surfaceAlt}`}>
          <FileSpreadsheet size={40} className="text-[#8B5CF6] mb-4 opacity-60" />
          <h4 className={`font-bold text-sm mb-1 ${T.textMain}`}>{isRtl ? 'سجل المطالبات المالية' : 'Financial Claims Log'}</h4>
          <p className={`text-[10px] italic ${T.textFaint}`}>Excel Live Sync</p>
        </div>
      </div>
    </>
  );
}

function MailSection({ isRtl, T }) {
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

function SheetsSection({ isRtl, T }) {
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

function AnalyticsSection({ isRtl, T }) {
  return (
    <SectionShell
      T={T}
      icon={<BarChart3 className="text-[#8B5CF6]" size={28} />}
      title={isRtl ? 'تقارير الأداء' : 'Analytics'}
      desc={isRtl
        ? 'لوحات Power BI مدمجة تعرض اتجاهات المكاتب والمطالبات لحظة بلحظة.'
        : 'Embedded Power BI dashboards showing office and claim trends in real time.'}
    />
  );
}

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

// --- Small helpers ---
function NavItem({ icon, label, active = false, onClick, T }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={`w-full flex items-center gap-3 p-3 rounded-xl transition text-start focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8B5CF6]
        ${active ? 'bg-[#8B5CF6] text-white shadow-lg shadow-purple-500/20' : `${T.textMuted} hover:bg-black/5 dark:hover:bg-white/5`}`}
    >
      {icon}
      <span className="text-xs font-bold">{label}</span>
    </button>
  );
}

function BottomTab({ icon, label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8B5CF6] ${active ? 'text-[#8B5CF6]' : 'text-slate-400'}`}
    >
      {icon}
      <span className="text-[9px] font-bold">{label}</span>
    </button>
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
