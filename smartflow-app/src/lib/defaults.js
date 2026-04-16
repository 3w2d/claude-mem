import { TODAY_DAY, todayLabel } from './date.js';

export const DEFAULT_FILES = [
  { id: 'f1', name: 'تقرير المبيعات Q1', ext: 'xlsx', size: '2.4 MB', date: todayLabel, category: 'sheets', starred: true,  aiNote: 'يحتاج مراجعة الأرقام', notes: '' },
  { id: 'f2', name: 'عرض المشروع الجديد', ext: 'pptx', size: '5.1 MB', date: 'أمس',       category: 'docs',   starred: false, aiNote: null, notes: '' },
  { id: 'f3', name: 'محضر اجتماع الفريق', ext: 'docx', size: '890 KB', date: 'قبل يومين',  category: 'docs',   starred: true,  aiNote: null, notes: '' },
  { id: 'f4', name: 'رسالة متابعة العميل', ext: 'msg',  size: '120 KB', date: 'قبل 3 أيام',  category: 'emails', starred: false, aiNote: 'بانتظار الرد', notes: '' },
  { id: 'f5', name: 'ميزانية 2026',         ext: 'xlsx', size: '1.8 MB', date: 'قبل 4 أيام',  category: 'sheets', starred: false, aiNote: null, notes: '' },
  { id: 'f6', name: 'خطة التسويق',          ext: 'docx', size: '1.2 MB', date: 'قبل 5 أيام',  category: 'docs',   starred: false, aiNote: null, notes: '' },
];

export const DEFAULT_EVENTS = [
  { id: 'e1', title: 'اجتماع الفريق',        time: '09:00', duration: 60,  color: '#6366f1', day: TODAY_DAY,     source: 'Outlook', icon: '👥' },
  { id: 'e2', title: 'مراجعة تقرير المبيعات', time: '11:30', duration: 45,  color: '#0ea5e9', day: TODAY_DAY,     source: 'Outlook', icon: '📊' },
  { id: 'e3', title: 'عرض للعميل',            time: '14:00', duration: 90,  color: '#f59e0b', day: TODAY_DAY,     source: 'يدوي',    icon: '🎯' },
  { id: 'e4', title: 'مكالمة مع المورد',      time: '10:00', duration: 30,  color: '#10b981', day: TODAY_DAY + 1, source: 'Outlook', icon: '📞' },
  { id: 'e5', title: 'مراجعة الميزانية',      time: '13:00', duration: 60,  color: '#6366f1', day: TODAY_DAY + 1, source: 'يدوي',    icon: '💰' },
  { id: 'e6', title: 'تدريب الفريق',          time: '09:30', duration: 120, color: '#a855f7', day: TODAY_DAY + 2, source: 'يدوي',    icon: '🎓' },
];

export const DEFAULT_TASKS = [
  { id: 't1', text: 'إرسال التقرير الشهري',     done: false, priority: 'high',   notes: '' },
  { id: 't2', text: 'تحديث بيانات العملاء',     done: false, priority: 'medium', notes: '' },
  { id: 't3', text: 'مراجعة عقد الشراكة',        done: true,  priority: 'high',   notes: '' },
  { id: 't4', text: 'تجهيز عرض الأسبوع القادم',  done: false, priority: 'low',    notes: '' },
  { id: 't5', text: 'الرد على إيميلات العملاء', done: false, priority: 'medium', notes: '' },
];
