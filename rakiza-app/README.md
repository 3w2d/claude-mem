# رَكيزة · Rakiza App

تطبيق React Native (Expo) متكامل للهندسة الإنشائية: رسم + حساب كميات + تسعير + ذكاء اصطناعي + ستريك يومي للتقدّم.

يعمل على **iOS / Android / Web** من نفس الكود.

## التشغيل

```bash
cd rakiza-app
npm install
npx expo start
```

ثم:
- اضغط `i` لـ iOS Simulator (يحتاج macOS + Xcode)
- اضغط `a` لـ Android Emulator (يحتاج Android Studio)
- اضغط `w` للويب
- أو امسح QR من تطبيق **Expo Go** على جوالك

## الميزات

### 🎨 الواجهة (Light Engineering)
- خلفية بيضاء نقية + أزرق هندسي (`#0056f7`)
- بطاقات بحدود ناعمة + ظلال خفيفة
- ألوان لكل تصنيف مشروع: سكني · تجاري · صناعي · خدمي/عام
- يدعم RTL تلقائياً

### 📐 الرسم
- لوحة SVG تفاعلية تعمل باللمس
- 6 أدوات: تحديد · جدار · عمود · باب · شباك · مسح
- شبكة Snap بـ 0.25 م
- متعدّد الأدوار (Floor tabs)
- زر `+` لنسخ الدور الحالي

### 💰 الكميات والتسعير
- **حساب فوري** للخرسانة والحديد والجدران والفتحات
- أساس + بلاطات + كمرات + أعمدة
- صافي مساحة الجدران (يحسم الفتحات)
- أسعار سعودية قابلة للتعديل من تبويب الإعدادات

### 🔥 محرّك الستريك
- تتبّع يومي للجلسات على كل مشروع
- ستريك حالي · أطول ستريك · إجمالي الجلسات
- نسبة الإنجاز أسبوعي / شهري / كل الوقت
- Heatmap على آخر 12 أسبوع لكل مشروع

### 🔔 إشعارات ذكية
- تذكير يومي (اختر الساعة)
- وضع "ذكي" يضبط الوقت تلقائياً حسب متى تكمل المشروع عادةً (median completion hour)
- يحترم أوقات الهدوء التي تحدّدها (DND)
- يُعاد جدولتها تلقائياً عند أي تغيير

### 🤖 شات AI
- يحاور المستخدم، يبحث في الإنترنت، يقترح بدائل
- يستخدم Claude API مباشرة (Haiku 4.5 / Sonnet 4.6 / Opus 4.7)
- مفتاح API يُحفظ محلياً في AsyncStorage
- نظام prompt مهيأ للعمارة السعودية + معايير الغرف القياسية

### 📊 لوحة تحليلات
- ملخّص كل المشاريع (this week / this month)
- لكل مشروع: مخطط أعمدة أسبوعي + heatmap نشاط + كميات + تكلفة
- مؤشّر الستريك بألوان متدرّجة (cold → blazing) من نظرة

### 💾 ثبات البيانات
- AsyncStorage أساسي + نسخة احتياطية ثانية
- Schema versioning مع migration
- Debounced writes (150ms) — UI لا يلمس الـ I/O
- إعادة جدولة الإشعارات بعد كل تغيير

## البنية

```
rakiza-app/
├── app/                  # expo-router (file-based)
│   ├── _layout.tsx       # root: theme, hydrate, RTL
│   ├── (tabs)/
│   │   ├── _layout.tsx   # bottom-floating tab bar
│   │   ├── index.tsx     # 🏠 Home
│   │   ├── ai.tsx        # 🤖 AI chat
│   │   ├── analytics.tsx # 📈 Analytics
│   │   └── settings.tsx  # ⚙️ Pricing + DND
│   ├── new.tsx           # modal: create project
│   └── project/[id].tsx  # detail + drawing canvas
├── src/
│   ├── theme.ts          # Light Engineering palette
│   ├── types.ts          # all TS contracts
│   ├── store/
│   │   └── projects.ts   # Zustand + persist
│   ├── lib/
│   │   ├── date.ts       # day keys YYYY-MM-DD
│   │   ├── storage.ts    # primary + backup AsyncStorage
│   │   ├── streak.ts     # streak engine
│   │   ├── insights.ts   # weekly / heatmap / aggregate
│   │   ├── notifications.ts  # smart scheduling
│   │   ├── boq.ts        # bill of quantities math
│   │   └── ai.ts         # Anthropic API client
│   └── components/
│       ├── Card.tsx
│       ├── ProjectCard.tsx
│       ├── StreakRing.tsx
│       ├── CompleteToggle.tsx
│       ├── Heatmap.tsx
│       └── DrawingCanvas.tsx
└── assets/               # icons, splash (add your own)
```

## المنصّات

- **iOS**: 16.0+
- **Android**: API 24+ (Android 7)
- **Web**: أي متصفح حديث (Chromium / Firefox / Safari)
