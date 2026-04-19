// NAZM · نَظْم — central configuration
// Edit numbers/labels here instead of touching the components.

export const APP = {
  brandAr: 'نَظْم',
  brandEn: 'NAZM',
  tagline: 'Intelligence Hub',
  userName: 'عوض الصمداني',
  userNameEn: 'Awadh Alsamdani',
  userTitle: 'مهندس إدارة المشروع',
  userTitleEn: 'Project Management Engineer',
  userRole: 'founder',
  office365Connected: true,
};

export const FIELD_STATS = [
  { key: 'claims',  labelAr: 'المطالبات المالية', labelEn: 'Claims',  value: 142, accent: 'cyan'   },
  { key: 'offices', labelAr: 'المكاتب الميدانية', labelEn: 'Offices', value: 32,  accent: 'purple' },
  { key: 'staff',   labelAr: 'إجمالي الموظفين',  labelEn: 'Staff',   value: 63,  accent: 'white'  },
];

export const AI_MESSAGE = {
  ar: 'بناءً على 15 إيميلاً وردت في الـ 24 ساعة الماضية، قمت بتحديث ملف Excel للمطالبات المالية. هناك تداخل في مواعيد 3 مكاتب في منطقة مكة، هل تريد مني إعادة جدولة المواعيد؟',
  en: 'Based on 15 emails in the last 24 hours, I updated the financial claims Excel file. There are scheduling conflicts for 3 offices in Makkah, should I reschedule?',
};

export const SECTIONS = [
  { key: 'home',      path: 'home',      labelAr: 'الرئيسية',       labelEn: 'Dashboard'    },
  { key: 'ai',        path: 'ai',        labelAr: 'المساعد الذكي',  labelEn: 'AI Assistant' },
  { key: 'field',     path: 'field',     labelAr: 'الميدان (GPS)', labelEn: 'Field (GPS)'  },
  { key: 'mail',      path: 'mail',      labelAr: 'البريد والمهام', labelEn: 'Mail & Tasks' },
  { key: 'sheets',    path: 'sheets',    labelAr: 'جداول البيانات', labelEn: 'Spreadsheets' },
  { key: 'analytics', path: 'analytics', labelAr: 'تقارير الأداء',  labelEn: 'Analytics'    },
  { key: 'profile',   path: 'profile',   labelAr: 'الملف الشخصي',   labelEn: 'Profile'      },
  { key: 'settings',  path: 'settings',  labelAr: 'الإعدادات',      labelEn: 'Settings'     },
];
