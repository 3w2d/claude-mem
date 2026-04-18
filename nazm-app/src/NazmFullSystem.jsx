import React, { useState } from 'react';
import {
  Brain, Globe, Shield, Mail, FileSpreadsheet,
  Layout, Zap, Lock, Bell, Settings,
  BarChart3, Smartphone, Monitor, Laptop,
  LogIn, Fingerprint, ChevronRight, CheckCircle2,
  User,
} from 'lucide-react';

// --- المكون الرئيسي للنظام المتكامل ---
export default function NazmFullSystem() {
  const [isRtl, setIsRtl] = useState(true);
  const [view, setView] = useState('landing'); // landing, auth, dashboard
  const [userRole, setUserRole] = useState('founder'); // افتراضي للمؤسس
  const [isLoading, setIsLoading] = useState(false);

  const toggleLang = () => setIsRtl(!isRtl);

  const navigateTo = (newView) => {
    setIsLoading(true);
    setTimeout(() => {
      setView(newView);
      setIsLoading(false);
    }, 800);
  };

  return (
    <div className={`min-h-screen bg-[#070A12] text-white overflow-x-hidden ${isRtl ? 'font-arabic' : 'font-sans'}`} dir={isRtl ? 'rtl' : 'ltr'}>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-[#070A12] z-[100] flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8B5CF6]"></div>
        </div>
      )}

      {/* Navigation Bar */}
      <nav className="p-5 border-b border-purple-900/20 flex justify-between items-center backdrop-blur-xl sticky top-0 z-50 bg-[#070A12]/80">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView('landing')}>
          <div className="bg-gradient-to-tr from-[#8B5CF6] to-[#A5F3FC] p-2 rounded-xl shadow-lg shadow-purple-500/20">
            <Brain className="text-black" size={24} />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black tracking-tight">نَظْم | NAZM</span>
            <span className="text-[8px] text-purple-400 uppercase tracking-widest leading-none">Intelligence Hub</span>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <button onClick={toggleLang} className="text-[10px] md:text-xs border border-gray-800 px-3 py-1.5 rounded-full hover:bg-white/5 transition flex items-center gap-1">
            <Globe size={14} /> {isRtl ? 'English' : 'العربية'}
          </button>
          {view !== 'dashboard' && (
            <button onClick={() => navigateTo('auth')} className="bg-[#8B5CF6] px-5 py-2 rounded-full text-xs font-bold hover:brightness-110 transition shadow-lg shadow-purple-500/20">
              {isRtl ? 'دخول' : 'Sign In'}
            </button>
          )}
        </div>
      </nav>

      {/* View Logic */}
      {view === 'landing' && <LandingPage isRtl={isRtl} onStart={() => navigateTo('auth')} />}
      {view === 'auth' && <AuthPage isRtl={isRtl} onSuccess={() => navigateTo('dashboard')} />}
      {view === 'dashboard' && <Dashboard isRtl={isRtl} userRole={userRole} />}

    </div>
  );
}

// --- 1. الصفحة التسويقية (Landing Page) ---
function LandingPage({ isRtl, onStart }) {
  return (
    <div className="relative pt-20 pb-32 px-6">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-96 bg-[#8B5CF6]/10 blur-[120px] rounded-full -z-10"></div>

      <div className="max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-1.5 rounded-full mb-8 animate-bounce">
          <Zap size={14} className="text-[#A5F3FC]" />
          <span className="text-[10px] uppercase font-bold tracking-widest">
            {isRtl ? 'الجيل القادم من الإنتاجية' : 'Next-Gen Productivity'}
          </span>
        </div>

        <h1 className="text-5xl md:text-8xl font-black mb-8 leading-[1.1] bg-gradient-to-b from-white via-white to-purple-500 bg-clip-text text-transparent">
          {isRtl ? 'ذكاء يرتب حياتك' : 'Intelligence That Organizes Your Life'}
        </h1>

        <p className="text-lg md:text-2xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed">
          {isRtl
            ? 'نظام نَظْم يتعلم من عاداتك، يدير ملفاتك، ويربط بريدك بجدول أعمالك وتقاريرك الميدانية بهدوء واحترافية مطلقة.'
            : 'NAZM learns your habits, manages your files, and syncs your mail with your schedule and field reports with total professionalism.'}
        </p>

        <div className="flex flex-col md:flex-row justify-center gap-4">
          <button onClick={onStart} className="bg-white text-black px-12 py-5 rounded-2xl font-black text-xl hover:scale-105 transition duration-300">
            {isRtl ? 'ابدأ كـ مؤسس الآن' : 'Start as Founder'}
          </button>
          <button className="bg-white/5 border border-white/10 px-12 py-5 rounded-2xl font-bold text-xl hover:bg-white/10 transition">
            {isRtl ? 'مشاهدة العرض' : 'Watch Demo'}
          </button>
        </div>

        {/* Device Support Icons */}
        <div className="mt-20 flex justify-center items-center gap-8 text-gray-600">
           <div className="flex flex-col items-center gap-2"><Laptop size={32}/> <span className="text-[10px]">Web</span></div>
           <div className="flex flex-col items-center gap-2"><Smartphone size={32}/> <span className="text-[10px]">Mobile</span></div>
           <div className="flex flex-col items-center gap-2"><Monitor size={32}/> <span className="text-[10px]">Desktop</span></div>
        </div>
      </div>
    </div>
  );
}

// --- 2. صفحة تسجيل الدخول الموحدة (Auth Page) ---
function AuthPage({ isRtl, onSuccess }) {
  return (
    <div className="max-w-md mx-auto mt-20 p-8 bg-[#150E2B] border border-purple-900/30 rounded-[40px] shadow-2xl">
      <div className="text-center mb-10">
        <Fingerprint size={48} className="mx-auto text-[#A5F3FC] mb-4" />
        <h2 className="text-3xl font-black mb-2">{isRtl ? 'دخول آمن' : 'Secure Login'}</h2>
        <p className="text-gray-400 text-sm">{isRtl ? 'اختر الطريقة المفضلة للربط' : 'Choose your preferred sync method'}</p>
      </div>

      <div className="space-y-4">
        <AuthButton icon={<Mail size={20} className="text-blue-500"/>} label={isRtl ? 'متابعة عبر Microsoft' : 'Continue with Microsoft'} onClick={onSuccess} />
        <AuthButton icon={<div className="text-red-500 font-bold italic">G</div>} label={isRtl ? 'متابعة عبر Google' : 'Continue with Google'} onClick={onSuccess} />
        <AuthButton icon={<LogIn size={20} className="text-white"/>} label={isRtl ? 'متابعة عبر Apple' : 'Continue with Apple'} onClick={onSuccess} />
      </div>

      <p className="text-[10px] text-center text-gray-500 mt-8 leading-relaxed">
        {isRtl
          ? 'بالمتابعة، أنت توافق على ربط بيانات الأوفيس والملفات بنظام نَظْم للتحليل الذكي.'
          : 'By continuing, you agree to sync your Office data and files with NAZM AI analysis.'}
      </p>
    </div>
  );
}

function AuthButton({ icon, label, onClick }) {
  return (
    <button onClick={onClick} className="w-full flex items-center gap-4 bg-white/5 border border-white/10 p-4 rounded-2xl hover:bg-white/10 transition group">
      <div className="bg-black/20 p-2 rounded-lg group-hover:scale-110 transition">{icon}</div>
      <span className="font-bold text-sm">{label}</span>
      <ChevronRight size={16} className="mr-auto opacity-30" />
    </button>
  );
}

// --- 3. لوحة التحكم المتكاملة (Dashboard) ---
function Dashboard({ isRtl, userRole }) {
  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6">

      {/* Sidebar Section */}
      <aside className="lg:col-span-3 space-y-6">
        <div className="bg-[#150E2B] border border-gray-800 p-6 rounded-[32px]">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
               <User size={20} className="text-purple-400" />
            </div>
            <div>
              <p className="text-[10px] text-gray-500 uppercase">{isRtl ? 'المؤسس' : 'Founder'}</p>
              <p className="font-bold text-sm">User_142</p>
            </div>
          </div>

          <nav className="space-y-2">
            <NavItem icon={<Layout size={18}/>} label={isRtl ? 'الرئيسية' : 'Dashboard'} active />
            <NavItem icon={<Mail size={18}/>} label={isRtl ? 'البريد والمهام' : 'Mail & Tasks'} />
            <NavItem icon={<FileSpreadsheet size={18}/>} label={isRtl ? 'جداول البيانات' : 'Spreadsheets'} />
            <NavItem icon={<BarChart3 size={18}/>} label={isRtl ? 'تقارير الأداء' : 'Analytics'} />
          </nav>
        </div>

        {/* Founder Stats */}
        {userRole === 'founder' && (
          <div className="bg-gradient-to-br from-[#1E1B4B] to-[#070A12] border border-purple-500/20 p-6 rounded-[32px]">
            <h3 className="text-white text-xs font-bold mb-4 flex items-center gap-2">
              <Lock size={12} className="text-purple-400"/> {isRtl ? 'إحصائيات الميدان' : 'Field Stats'}
            </h3>
            <div className="space-y-4">
              <StatItem label={isRtl ? 'المطالبات المالية' : 'Claims'} value="142" color="text-[#A5F3FC]" />
              <StatItem label={isRtl ? 'المكاتب الميدانية' : 'Offices'} value="32" color="text-purple-400" />
              <StatItem label={isRtl ? 'إجمالي الموظفين' : 'Staff'} value="63" color="text-white" />
            </div>
          </div>
        )}
      </aside>

      {/* Main Analysis Content */}
      <main className="lg:col-span-9 space-y-6">

        {/* AI Thinking Section */}
        <div className="bg-[#150E2B] border border-nazm-purple/20 p-8 rounded-[40px] relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-2 h-full bg-[#8B5CF6]"></div>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Brain className="text-[#A5F3FC] animate-pulse" />
              <h2 className="text-2xl font-black">{isRtl ? 'نظم يفكر معك الآن' : 'Nazm AI Thinking'}</h2>
            </div>
            <div className="flex items-center gap-2 bg-green-500/10 text-green-400 px-3 py-1 rounded-full text-[10px]">
              <CheckCircle2 size={12} /> Office 365 Connected
            </div>
          </div>
          <p className="text-gray-300 text-lg md:text-xl leading-relaxed">
            {isRtl
              ? 'بناءً على 15 إيميلاً وردت في الـ 24 ساعة الماضية، قمت بتحديث ملف Excel للمطالبات المالية. هناك تداخل في مواعيد 3 مكاتب في منطقة مكة، هل تريد مني إعادة جدولة المواعيد؟'
              : 'Based on 15 emails in the last 24 hours, I updated the financial claims Excel file. There are scheduling conflicts for 3 offices in Makkah, should I reschedule?'}
          </p>
          <div className="mt-6 flex gap-3">
            <button className="bg-[#8B5CF6] px-6 py-2 rounded-xl text-xs font-bold">{isRtl ? 'نعم، نفذ' : 'Yes, Proceed'}</button>
            <button className="bg-white/5 px-6 py-2 rounded-xl text-xs font-bold">{isRtl ? 'عرض التفاصيل' : 'View Details'}</button>
          </div>
        </div>

        {/* Power BI & Reports Placeholder */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#0D081D] border border-gray-800 h-64 rounded-[32px] p-6 flex flex-col items-center justify-center text-center">
            <BarChart3 size={40} className="text-purple-500 mb-4 opacity-50" />
            <h4 className="font-bold text-sm mb-1">{isRtl ? 'تقرير الأداء الأسبوعي' : 'Weekly Performance'}</h4>
            <p className="text-[10px] text-gray-500 italic">Power BI Embedded View</p>
          </div>
          <div className="bg-[#0D081D] border border-gray-800 h-64 rounded-[32px] p-6 flex flex-col items-center justify-center text-center">
            <FileSpreadsheet size={40} className="text-[#A5F3FC] mb-4 opacity-50" />
            <h4 className="font-bold text-sm mb-1">{isRtl ? 'سجل المطالبات المالية' : 'Financial Claims Log'}</h4>
            <p className="text-[10px] text-gray-500 italic">Excel Live Sync</p>
          </div>
        </div>

      </main>

      {/* Mobile Footer Menu */}
      <nav className="lg:hidden fixed bottom-0 left-0 w-full bg-[#150E2B]/95 backdrop-blur-xl border-t border-purple-900/30 p-4 flex justify-around items-center z-50">
        <Layout className="text-[#8B5CF6]" size={24} />
        <Brain className="text-gray-500" size={24} />
        <Bell className="text-gray-500" size={24} />
        <Settings className="text-gray-500" size={24} />
      </nav>
    </div>
  );
}

// --- المكونات الصغيرة المساعدة ---
function NavItem({ icon, label, active = false }) {
  return (
    <div className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition ${active ? 'bg-[#8B5CF6] text-white shadow-lg' : 'text-gray-400 hover:bg-white/5'}`}>
      {icon}
      <span className="text-xs font-bold">{label}</span>
    </div>
  );
}

function StatItem({ label, value, color }) {
  return (
    <div className="flex justify-between items-end border-b border-white/5 pb-2">
      <span className="text-[10px] text-gray-500 uppercase">{label}</span>
      <span className={`text-xl font-black ${color}`}>{value}</span>
    </div>
  );
}
