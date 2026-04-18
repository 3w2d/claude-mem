import { useEffect, useState } from 'react';

const KEY = 'smartflow-v3:lang';
const listeners = new Set();
let _current = null;

export function getLang() {
  if (_current) return _current;
  try {
    _current = localStorage.getItem(KEY) || 'ar';
  } catch {
    _current = 'ar';
  }
  return _current;
}

export function setLang(lang) {
  if (lang !== 'ar' && lang !== 'en') return;
  _current = lang;
  try { localStorage.setItem(KEY, lang); } catch {}
  document.documentElement.setAttribute('lang', lang);
  document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
  for (const fn of listeners) fn(lang);
}

export function getDir() {
  return getLang() === 'ar' ? 'rtl' : 'ltr';
}

export function useT() {
  const [lang, setState] = useState(getLang());
  useEffect(() => {
    const fn = (l) => setState(l);
    listeners.add(fn);
    return () => { listeners.delete(fn); };
  }, []);
  const t = (key, vars) => translate(key, lang, vars);
  return { t, lang, dir: lang === 'ar' ? 'rtl' : 'ltr', setLang };
}

export function t(key, vars) {
  return translate(key, getLang(), vars);
}

function translate(key, lang, vars) {
  const s = STRINGS[key]?.[lang] ?? STRINGS[key]?.ar ?? key;
  if (!vars) return s;
  return s.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? '');
}

if (typeof document !== 'undefined') {
  const lang = getLang();
  document.documentElement.setAttribute('lang', lang);
  document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
}

const STRINGS = {
  // splash
  'splash.tagline':   { ar: 'مساعدك الذكي لإدارة ملفاتك ومواعيدك ومهامك — بهدوء وتركيز.', en: 'Your calm, focused assistant for files, schedule, and tasks.' },
  'splash.start':     { ar: 'ابدأ الآن', en: 'Get started' },
  'splash.brandline': { ar: 'هدوء · تركيز · ذكاء', en: 'Calm · Focus · Intelligence' },
  'splash.learnMore': { ar: 'تعرّف على التطبيق', en: 'Learn about the app' },

  // nav
  'nav.home':      { ar: 'الرئيسية', en: 'Home' },
  'nav.files':     { ar: 'الملفات', en: 'Files' },
  'nav.schedule':  { ar: 'الجدول', en: 'Schedule' },
  'nav.tasks':     { ar: 'المهام', en: 'Tasks' },
  'nav.ai':        { ar: 'المساعد', en: 'Assistant' },

  // dashboard
  'dash.hello':            { ar: 'أهلاً بك', en: 'Welcome' },
  'dash.stat.files':       { ar: 'ملفات', en: 'Files' },
  'dash.stat.events':      { ar: 'مواعيد اليوم', en: 'Today\u2019s events' },
  'dash.stat.pending':     { ar: 'مهام متبقية', en: 'Pending' },
  'dash.suggestions':      { ar: 'اقتراحات ذكية', en: 'Smart suggestions' },
  'dash.urgent':           { ar: 'المهام العاجلة', en: 'Urgent tasks' },
  'dash.viewAll':          { ar: 'عرض الكل', en: 'View all' },
  'dash.noPending':        { ar: 'لا توجد مهام متبقية 🎉', en: 'No pending tasks 🎉' },
  'dash.connections':      { ar: 'حالة الاتصال', en: 'Connections' },
  'dash.sync':             { ar: 'مزامنة', en: 'Sync' },
  'dash.exit':             { ar: 'خروج', en: 'Sign out' },
  'dash.linkMs':           { ar: 'ربط Microsoft 365', en: 'Connect Microsoft 365' },
  'dash.configure':        { ar: 'اضبط الآن', en: 'Configure' },
  'dash.connected':        { ar: 'متصل', en: 'Connected' },
  'dash.disconnected':     { ar: 'غير متصل', en: 'Not connected' },
  'dash.notConfigured':    { ar: 'غير مُهيّأ', en: 'Not configured' },
  'dash.suggestHighTasks': { ar: 'عندك {n} مهام عاجلة: {names}', en: 'You have {n} urgent tasks: {names}' },
  'dash.suggestEvents':    { ar: 'عندك {n} موعد اليوم — أقربهم "{title}" الساعة {time}', en: 'You have {n} events today — next is "{title}" at {time}' },
  'dash.suggestNoEvents':  { ar: 'ما عندك مواعيد اليوم — يوم فاضي للتركيز على المهام', en: 'No events today — great day to focus on tasks' },
  'dash.suggestStale':     { ar: '{n} ملفات تحتاج انتباهك', en: '{n} files need your attention' },
  'dash.suggestAllDone':   { ar: 'كل مهامك مكتملة! ما شاء الله 👏', en: 'All tasks done! Awesome 👏' },
  'dash.urgentBadge':      { ar: 'عاجل', en: 'Urgent' },
  'dash.mediumBadge':      { ar: 'متوسط', en: 'Medium' },
  'dash.lowBadge':         { ar: 'عادي', en: 'Normal' },

  // files
  'files.title':     { ar: 'الملفات', en: 'Files' },
  'files.count':     { ar: '{n} ملف', en: '{n} files' },
  'files.search':    { ar: 'ابحث في ملفاتك...', en: 'Search your files...' },
  'files.tab.all':     { ar: 'الكل', en: 'All' },
  'files.tab.docs':    { ar: 'مستندات', en: 'Documents' },
  'files.tab.sheets':  { ar: 'جداول', en: 'Sheets' },
  'files.tab.emails':  { ar: 'رسائل', en: 'Emails' },
  'files.tab.starred': { ar: 'مميزة', en: 'Starred' },
  'files.add':       { ar: 'إضافة ملف', en: 'Add file' },
  'files.namePlaceholder': { ar: 'اسم الملف...', en: 'File name...' },
  'files.none':      { ar: 'ما فيه ملفات مطابقة', en: 'No matching files' },
  'files.now':       { ar: 'الآن', en: 'now' },
  'files.confirmDelete': { ar: 'هل تبي تحذف "{name}"؟', en: 'Delete "{name}"?' },

  // schedule
  'sched.title':      { ar: 'الجدول', en: 'Schedule' },
  'sched.add':        { ar: 'إضافة موعد', en: 'Add event' },
  'sched.title.placeholder': { ar: 'عنوان الموعد...', en: 'Event title...' },
  'sched.dayEvents':  { ar: 'مواعيد يوم {day} {month}', en: 'Events on {month} {day}' },
  'sched.none':       { ar: 'ما فيه مواعيد لهذا اليوم', en: 'No events for this day' },
  'sched.min':        { ar: '{n} دقيقة', en: '{n} min' },
  'sched.duration.15':  { ar: '١٥ دقيقة', en: '15 minutes' },
  'sched.duration.30':  { ar: '٣٠ دقيقة', en: '30 minutes' },
  'sched.duration.60':  { ar: 'ساعة', en: '1 hour' },
  'sched.duration.90':  { ar: 'ساعة ونصف', en: '1.5 hours' },
  'sched.duration.120': { ar: 'ساعتين', en: '2 hours' },
  'sched.source.manual': { ar: 'يدوي', en: 'Manual' },
  'sched.confirmDelete': { ar: 'هل تبي تحذف "{name}"؟', en: 'Delete "{name}"?' },

  // tasks
  'tasks.title':      { ar: 'المهام', en: 'Tasks' },
  'tasks.countLeft':  { ar: '{n} مهمة متبقية', en: '{n} pending' },
  'tasks.tab.all':     { ar: 'الكل', en: 'All' },
  'tasks.tab.pending': { ar: 'متبقية', en: 'Pending' },
  'tasks.tab.done':    { ar: 'مكتملة', en: 'Done' },
  'tasks.add':        { ar: 'إضافة مهمة', en: 'Add task' },
  'tasks.placeholder': { ar: 'وصف المهمة...', en: 'Task description...' },
  'tasks.empty.done':    { ar: 'ما فيه مهام مكتملة', en: 'No completed tasks' },
  'tasks.empty.pending': { ar: 'أضف أول مهمة', en: 'Add your first task' },
  'tasks.empty.all':     { ar: 'لا توجد مهام بعد', en: 'No tasks yet' },
  'tasks.prio.high':   { ar: 'عاجل', en: 'High' },
  'tasks.prio.medium': { ar: 'متوسط', en: 'Medium' },
  'tasks.prio.low':    { ar: 'عادي', en: 'Normal' },
  'tasks.confirmDelete': { ar: 'هل تبي تحذف "{name}"؟', en: 'Delete "{name}"?' },

  // ai assistant
  'ai.title':       { ar: 'المساعد الذكي', en: 'AI Assistant' },
  'ai.greeting':    { ar: 'مرحباً! أنا مساعدك الذكي في SmartFlow. اسألني عن ملفاتك، مواعيدك، أو مهامك.', en: 'Hi! I\u2019m your SmartFlow assistant. Ask me about your files, schedule, or tasks.' },
  'ai.mode.offline': { ar: 'وضع محلي (بدون GPT-4)', en: 'Local mode (no GPT-4)' },
  'ai.mode.fallback': { ar: 'رجعت للوضع المحلي — تعذّر الوصول للـ AI', en: 'Back to local mode — AI unreachable' },
  'ai.mode.online': { ar: 'متصل مع GPT-4', en: 'Connected to GPT-4' },
  'ai.quick.today':   { ar: 'وش مواعيدي اليوم؟', en: 'What\u2019s on my schedule today?' },
  'ai.quick.urgent':  { ar: 'وش المهام العاجلة؟', en: 'What are my urgent tasks?' },
  'ai.quick.email':   { ar: 'ساعدني أكتب إيميل', en: 'Help me write an email' },
  'ai.placeholder':   { ar: 'اكتب رسالتك...', en: 'Type your message...' },

  // common
  'common.add':     { ar: 'إضافة', en: 'Add' },
  'common.cancel':  { ar: 'إلغاء', en: 'Cancel' },
  'common.delete':  { ar: 'حذف', en: 'Delete' },
  'common.save':    { ar: 'حفظ', en: 'Save' },
  'common.back':    { ar: 'رجوع', en: 'Back' },
  'common.loading': { ar: 'جاري التحميل…', en: 'Loading…' },

  // landing page
  'landing.nav.features':  { ar: 'المميزات', en: 'Features' },
  'landing.nav.screens':   { ar: 'الشاشات', en: 'Screens' },
  'landing.nav.contact':   { ar: 'تواصل', en: 'Contact' },
  'landing.cta.open':      { ar: 'افتح التطبيق', en: 'Open app' },
  'landing.cta.start':     { ar: 'ابدأ مجاناً', en: 'Start free' },
  'landing.cta.learn':     { ar: 'تعرّف أكثر', en: 'Learn more' },
  'landing.hero.eyebrow':  { ar: 'ارتَح — مساعدك اليومي', en: 'Irtah — your daily assistant' },
  'landing.hero.title':    { ar: 'كل يومك في مكان واحد — بهدوء، وبلغتك.', en: 'Your whole day in one calm place.' },
  'landing.hero.subtitle': {
    ar: 'ارتَح يجمع ملفاتك ومواعيدك ومهامك مع مساعد ذكي يلخّص يومك ويقترح خطواتك — مع دعم كامل للعربية والإنجليزية، وحفظ محلي لخصوصيتك.',
    en: 'Irtah brings your files, schedule, and tasks together with an AI that summarizes your day — bilingual (Arabic + English) and private by default.',
  },
  'landing.stat.local':    { ar: 'خصوصية محلية', en: 'Local-first privacy' },
  'landing.stat.ai':       { ar: 'مساعد ذكي', en: 'AI assistant' },
  'landing.stat.bilingual':{ ar: 'لغتان', en: 'Bilingual' },
  'landing.features.eyebrow':  { ar: 'كل ما تحتاجه', en: 'Everything you need' },
  'landing.features.title':    { ar: 'بسيط من برّا، ذكي من جوّا.', en: 'Simple on the surface, smart underneath.' },
  'landing.features.subtitle': {
    ar: 'صمّمنا ارتَح ليبقى هادئاً ومركّزاً — بدون إشعارات صاخبة ولا واجهات مزدحمة.',
    en: 'Irtah is built to stay calm and focused — no noise, no clutter, just flow.',
  },
  'landing.feat.files.title':    { ar: 'ملفاتك', en: 'Your files' },
  'landing.feat.files.desc':     { ar: 'كل ملفاتك من Outlook و OneDrive في مكان واحد — مع ملاحظات ذكية.', en: 'All your Outlook + OneDrive files in one place, with smart notes.' },
  'landing.feat.schedule.title': { ar: 'جدولك', en: 'Your schedule' },
  'landing.feat.schedule.desc':  { ar: 'مواعيدك من Microsoft 365 مع تقويم أسبوعي أنيق وسهل.', en: 'Events from Microsoft 365 with a clean weekly calendar.' },
  'landing.feat.tasks.title':    { ar: 'مهامك', en: 'Your tasks' },
  'landing.feat.tasks.desc':     { ar: 'أولويات ملوّنة وتقدّم واضح — بدون تعقيد.', en: 'Color-coded priorities with clear progress, no clutter.' },
  'landing.feat.ai.title':       { ar: 'مساعد ذكي', en: 'AI assistant' },
  'landing.feat.ai.desc':        { ar: 'يلخّص يومك، يقترح الخطوات، ويساعدك تكتب ردود أسرع.', en: 'Summarizes your day, suggests next steps, and drafts replies.' },
  'landing.feat.notify.title':   { ar: 'تنبيهات هادئة', en: 'Quiet notifications' },
  'landing.feat.notify.desc':    { ar: 'تذكيرات بالمهام العاجلة والمواعيد القريبة — بدون إزعاج.', en: 'Gentle reminders for urgent tasks and upcoming events.' },
  'landing.feat.security.title': { ar: 'أمان وخصوصية', en: 'Security & privacy' },
  'landing.feat.security.desc':  { ar: 'بياناتك تُحفظ محلياً. مفاتيح OpenAI و Supabase تبقى في جهازك فقط.', en: 'Data stays on device. OpenAI and Supabase keys never leave your browser.' },
  'landing.screens.eyebrow': { ar: 'واجهات التطبيق', en: 'Product screens' },
  'landing.screens.title':   { ar: 'تصميم يريح العين — ويبقى واضحاً.', en: 'A design that rests the eye, and stays clear.' },
  'landing.screens.dash':    { ar: 'لوحة اليوم', en: 'Today dashboard' },
  'landing.screens.ai':      { ar: 'المساعد الذكي', en: 'AI assistant' },
  'landing.screens.schedule':{ ar: 'جدول اليوم', en: 'Today schedule' },
  'landing.mock.aiTitle':    { ar: 'خلاصة يومك', en: 'Your day in a line' },
  'landing.mock.aiLine':     { ar: 'لديك ٣ مواعيد و ٢ مهام عاجلة — أقربهم "مراجعة العرض" الساعة ١١:٠٠.', en: 'You have 3 events and 2 urgent tasks — next up: "Deck review" at 11:00.' },
  'landing.mock.userLine':   { ar: 'لخّص لي مواعيد اليوم', en: 'Summarize today for me' },
  'landing.mock.task1':      { ar: 'مراجعة عرض الاجتماع', en: 'Review meeting deck' },
  'landing.mock.task2':      { ar: 'إرسال ردّ العميل', en: 'Send client reply' },
  'landing.mock.task3':      { ar: 'تحضير تقرير الأسبوع', en: 'Prepare weekly report' },
  'landing.mock.ev1':        { ar: '١٠:٠٠ مكالمة المنتج', en: '10:00 Product call' },
  'landing.mock.ev2':        { ar: '١٢:٣٠ غداء العميل', en: '12:30 Client lunch' },
  'landing.mock.ev3':        { ar: '١٥:٠٠ مراجعة التصميم', en: '15:00 Design review' },
  'landing.contact.title':   { ar: 'جاهز تبدأ؟', en: 'Ready to start?' },
  'landing.contact.subtitle':{ ar: 'افتح التطبيق مباشرة من المتصفح — بدون تثبيت. متوفّر على الجوال والكمبيوتر.', en: 'Open the app right in your browser — no install. Works on mobile and desktop.' },
  'landing.footer.tagline':  { ar: 'صُمِّم بهدوء، ومبني على المتصفح.', en: 'Designed calmly. Built on the web.' },

  // notifications
  'notify.urgent':   { ar: '{n} مهمة عاجلة تنتظرك', en: '{n} urgent tasks waiting' },
  'notify.upcoming': { ar: 'موعد قريب: {title} الساعة {time}', en: 'Upcoming: {title} at {time}' },

  // settings
  'settings.title':       { ar: 'الإعدادات', en: 'Settings' },
  'settings.subtitle':    { ar: 'ربط الخدمات الخارجية. كل المفاتيح تُحفظ في جهازك فقط.', en: 'Connect external services. All keys stay on your device.' },
  'settings.lang':        { ar: 'اللغة', en: 'Language' },
  'settings.lang.ar':     { ar: 'العربية', en: 'العربية' },
  'settings.lang.en':     { ar: 'English', en: 'English' },
  'settings.saved':       { ar: 'تم الحفظ ✓', en: 'Saved ✓' },
  'settings.save':        { ar: 'حفظ الإعدادات', en: 'Save settings' },
  'settings.ms.title':    { ar: 'Microsoft 365 (Outlook / Excel / Word)', en: 'Microsoft 365 (Outlook / Excel / Word)' },
  'settings.ms.clientId': { ar: 'Application (client) ID', en: 'Application (client) ID' },
  'settings.ms.tenantId': { ar: 'Directory (tenant) ID — اتركه common لو شخصي', en: 'Directory (tenant) ID — leave common for personal' },
  'settings.ms.redirect': { ar: 'Redirect URI (اختياري — افتراضي عنوان الصفحة الحالية)', en: 'Redirect URI (optional — defaults to current page URL)' },
  'settings.sb.title':    { ar: 'Supabase (مزامنة سحابية)', en: 'Supabase (cloud sync)' },
  'settings.sb.url':      { ar: 'Project URL', en: 'Project URL' },
  'settings.sb.key':      { ar: 'anon public key', en: 'anon public key' },
  'settings.oa.title':    { ar: 'OpenAI (المساعد الذكي)', en: 'OpenAI (AI assistant)' },
  'settings.oa.key':      { ar: 'API Key', en: 'API Key' },
  'settings.oa.model':    { ar: 'Model', en: 'Model' },
  'settings.oa.warning':  { ar: 'تنبيه:', en: 'Warning:' },

  // profile
  'profile.title':   { ar: 'الملف الشخصي', en: 'Profile' },
  'profile.guest':   { ar: 'زائر', en: 'Guest' },
  'profile.guestHint': { ar: 'سجّل دخول لحفظ بياناتك ومزامنتها بين أجهزتك', en: 'Sign in to save and sync your data across devices' },
  'profile.signedVia': { ar: 'مُسجَّل عبر {provider}', en: 'Signed in via {provider}' },
  'profile.stats':   { ar: 'إحصائيات', en: 'Stats' },
  'profile.stat.files':    { ar: 'ملفات', en: 'Files' },
  'profile.stat.events':   { ar: 'مواعيد', en: 'Events' },
  'profile.stat.pending':  { ar: 'متبقية', en: 'Pending' },
  'profile.stat.done':     { ar: 'مكتملة', en: 'Done' },
  'profile.signIn':        { ar: 'تسجيل الدخول', en: 'Sign in' },
  'profile.signInGoogle':  { ar: 'تسجيل الدخول بـ Google', en: 'Sign in with Google' },
  'profile.supabaseHint':  { ar: 'تسجيل الدخول يحتاج Supabase مُهيّأ.', en: 'Sign-in requires Supabase to be configured.' },
  'profile.configSb':      { ar: 'اضبط Supabase أولاً', en: 'Configure Supabase first' },
  'profile.signInError':   { ar: 'تعذّر تسجيل الدخول', en: 'Sign-in failed' },
  'profile.msDisconnect':  { ar: 'فصل Microsoft', en: 'Disconnect Microsoft' },
  'profile.settings':      { ar: '⚙️ الإعدادات', en: '⚙️ Settings' },
  'profile.export':        { ar: '📤 تصدير بياناتي (JSON)', en: '📤 Export my data (JSON)' },
  'profile.signOut':       { ar: 'تسجيل الخروج', en: 'Sign out' },
  'profile.msLoginFail':   { ar: 'تعذّر تسجيل الدخول إلى Microsoft 365', en: 'Microsoft 365 sign-in failed' },
  'profile.msSyncFail':    { ar: 'تعذّرت المزامنة مع Microsoft 365', en: 'Microsoft 365 sync failed' },
};

export const WEEKDAYS = {
  ar: ['أحد', 'اثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'],
  en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
};

export const MONTHS = {
  ar: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
};
