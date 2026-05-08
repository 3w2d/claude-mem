# ركيزة · Rakiza App (v0.2 — port of Rukiza standalone)

تطبيق Expo (React Native) يطابق هوية **ركيزة** البصرية التي شاركتها — منصّة تقدير إنشائي ذكية وفق SBC 304/ACI 318. يعمل من نفس الكود على **iOS · Android · Web**.

## التشغيل

```bash
cd rakiza-app
npm install
npx expo start
```

ثم اضغط:
- `i` لـ iOS Simulator
- `a` لـ Android Emulator
- `w` للمتصفح
- أو امسح الـ QR من **Expo Go** على جوالك

## ما الذي تم تنفيذه

### الشاشات (مطابقة المرجع 1:1)
- **Landing**: hero بـ gradient ذهبي، نافذة معاينة 3D بإطار تطبيق macOS، شريط KPI، grid لأربع ميزات، CTA panel
- **Dashboard**: 4 KPI cards، آخر مشروع مع 3D، إجراءات سريعة، جدول آخر 5 مشاريع
- **Calculator**: لوحة مدخلات بعرض 380px (sticky على الويب)، 4 stat cards، جدول كميات، تكاليف تفصيلية
- **Projects**: شبكة بطاقات 3 أعمدة بصور 3D، بحث، حذف
- **Reports**: 3 KPI، توزيع نسبي حسب نوع الاستخدام بأشرطة gradient

### نظام التصميم
- **اللوحة**: ذهبي `#c9973a → #e6b34a`، خلفية داكنة `#0a0a10 → #171922`، أزرق مخططات `#5294e8`، نص `#ebebef`
- **الخطوط**: IBM Plex Sans Arabic (واجهة) + IBM Plex Mono (أرقام تقنية)
- **المسافات**: قاعدة 4px (4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80)
- **Radius**: 4 / 6 / 10 / 14 / 20
- **RTL** كامل + Light/Dark Theme toggle

### النواة الحاسبية
محرك SBC 304 / ACI 318 منقول حرفياً من المرجع:
- أحمال `1.2D + 1.6L` ULS
- `colsX × colsY` على شبكة column spacing
- بلاطات `min(0.25, max(0.15, span/30))`
- أساسات معزولة `colSide × 4.5`
- نسب حديد قياسية: 85/180/130/90 kg/m³
- تكاليف: خرسانة + حديد + قوالب + عمالة + تشطيبات + 18% overhead

### المعاينة ثلاثية الأبعاد
بدلاً من Three.js (يحتاج WebGL وحجم حزمة كبير على RN)، استخدمنا **isometric SVG**:
- إسقاط isometric بزاوية 30°
- 3 أوجه (top + front + right) بـ gradients ذهبية
- شبكة أعمدة عند تقاطعات الـ grid
- خطوط بلاطات أفقية لكل دور
- ground grid blueprint
- يعمل بنفس الجودة على iOS و Android و Web بدون GPU dependency

### المكوّنات القابلة لإعادة الاستخدام
- `RukizaLogo` (5 أعمدة + قوس + gradient)
- `Card` · `Btn` (primary/secondary/ghost/danger × sm/md/lg) · `Badge` · `Stat`
- `Field` + `Input` + `Select` (chip-style بدلاً من dropdown لراحة اللمس) + `Slider`
- `SectionHead` بـ eyebrow ذهبي + خط مزخرف
- `BlueprintGrid` خلفية شفافة
- `Building3D`
- `AppShell` تكيّف تلقائي: sidebar 248px على ≥900px، Bottom Tabs على الجوال

### ثبات البيانات
- `AsyncStorage` primary + backup (debounced 150ms)
- Schema versioning v2
- Seed projects (3 فلل/مكاتب/تجاري) للتجربة الأولى
- زرّ Reset في الـ Sidebar

## البنية

```
rakiza-app/
├── app/
│   ├── _layout.tsx          # Root: SafeArea + Theme + Stack
│   └── index.tsx            # AppShell entrypoint
├── src/
│   ├── theme.ts             # Dark/Light tokens + spacing/radius scale
│   ├── types.ts             # ProjectParams / ProjectResults / labels
│   ├── lib/
│   │   ├── sbc.ts           # SBC 304 calculator engine
│   │   ├── format.ts        # number / currency / compact
│   │   └── storage.ts       # AsyncStorage primary + backup
│   ├── store/
│   │   └── projects.ts      # Zustand: page, theme, projects
│   ├── components/
│   │   ├── ThemeProvider.tsx
│   │   ├── RukizaLogo.tsx
│   │   ├── primitives.tsx   # Card / Btn / Badge / Stat / Field / Input / Select / Slider / SectionHead / BlueprintGrid
│   │   ├── Building3D.tsx   # Isometric SVG viewer
│   │   └── AppShell.tsx     # Sidebar + BottomTabs adaptive layout
│   └── screens/
│       ├── Landing.tsx
│       ├── Dashboard.tsx
│       ├── Calculator.tsx
│       ├── Projects.tsx
│       └── Reports.tsx
└── assets/                  # icons (placeholder)
```

## ⚠ تنبيه هندسي
ركيزة مخصصة للتقدير الأولي. التصميم الإنشائي الفعلي يستوجب إشراف مهندس مدني مرخّص واستخدام برامج معتمدة (ETABS / SAFE / Robot) وفق الكود السعودي.
