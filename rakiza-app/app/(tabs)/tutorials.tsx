import { useMemo, useState } from 'react';
import {
  View, Text, ScrollView, Pressable, Modal, StyleSheet,
  useWindowDimensions, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../src/components/ThemeProvider';
import { FONT, RADIUS, SP } from '../../src/theme';
import { useAuth, specialtyLabel, type Specialty } from '../../src/store/auth';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

interface Tutorial {
  id: string;
  title: string;
  desc: string;
  durationSec: number;
  icon: IconName;
  hue: [string, string]; // gradient pair
  views: number;
}

const COMMON: Tutorial[] = [
  { id: 't-onb',  title: 'البداية السريعة',          desc: 'جولة في الواجهة وأول مشروع',   durationSec: 3 * 60 + 20, icon: 'play-circle',  hue: ['#c9973a', '#9a7028'], views: 1240 },
  { id: 't-nav',  title: 'استخدام التبويبات والتنقّل', desc: 'الانتقال بين الشاشات بسرعة',     durationSec: 2 * 60 + 10, icon: 'compass',      hue: ['#5294e8', '#3a78c4'], views: 980 },
  { id: 't-set',  title: 'إعدادات المظهر والـ AI',    desc: 'الوضع الداكن ومفاتيح المزوّدين', durationSec: 4 * 60 + 5,  icon: 'settings',     hue: ['#7c5cff', '#4c3fb0'], views: 760 },
];

const PER_ROLE: Record<Specialty, Tutorial[]> = {
  project_manager: [
    { id: 'pm-overview', title: 'نظرة عامة على لوحة المشاريع', desc: 'المؤشّرات الأساسية ومتابعة الحالة', durationSec: 5 * 60 + 40, icon: 'briefcase',      hue: ['#c9973a', '#9a7028'], views: 1320 },
    { id: 'pm-ncr',      title: 'طريقة كتابة تقرير NCR',       desc: 'الحقول الرسمية ومخرجات PDF',         durationSec: 7 * 60 + 12, icon: 'document-text',  hue: ['#e6b34a', '#9a7028'], views: 2150 },
    { id: 'pm-crew',     title: 'متابعة الطاقم والإنتاجية',     desc: 'توزيع المهام وتقييم الأداء',         durationSec: 6 * 60 + 35, icon: 'people',         hue: ['#3eb887', '#1f9b6a'], views: 480 },
  ],
  civil_engineer: [
    { id: 'ce-aci',  title: 'كيفية استخراج بنود ACI 318',     desc: 'بحث ذكي عبر مساعد AI',          durationSec: 8 * 60 + 22, icon: 'library',     hue: ['#c9973a', '#9a7028'], views: 1820 },
    { id: 'ce-sbc',  title: 'مراجعة بنود SBC 304 للخرسانة',    desc: 'الأحمال والمعاملات الزلزالية',    durationSec: 6 * 60 + 50, icon: 'shield-checkmark', hue: ['#e6b34a', '#9a7028'], views: 1410 },
    { id: 'ce-plan', title: 'تحليل مخطط إنشائي خطوة بخطوة',     desc: 'الأعمدة، الكمرات، البلاطات',        durationSec: 9 * 60 + 5,  icon: 'grid',         hue: ['#5294e8', '#3a78c4'], views: 905 },
    { id: 'ce-boq',  title: 'حساب الكميات والتكاليف الأولية',   desc: 'تقدير سريع وفق SBC',              durationSec: 5 * 60 + 18, icon: 'calculator',  hue: ['#7c5cff', '#4c3fb0'], views: 1670 },
  ],
  electrical_tech: [
    { id: 'el-sbc400', title: 'مراجعة كود SBC 400 الكهربائي',     desc: 'الأحمال والحماية',                durationSec: 7 * 60 + 30, icon: 'flash',          hue: ['#e6b34a', '#9a7028'], views: 1210 },
    { id: 'el-dist',   title: 'قراءة مخطط التوزيع الكهربائي',     desc: 'لوحات التغذية والدوائر الفرعية', durationSec: 8 * 60 + 12, icon: 'git-network',    hue: ['#5294e8', '#3a78c4'], views: 870 },
    { id: 'el-load',   title: 'حسابات الأحمال والكابلات',         desc: 'القطر، الجهد، السقوط',              durationSec: 6 * 60 + 0,  icon: 'speedometer',    hue: ['#c9973a', '#9a7028'], views: 1090 },
    { id: 'el-safe',   title: 'السلامة الكهربائية في الموقع',     desc: 'العزل، التأريض، GFCI',             durationSec: 4 * 60 + 45, icon: 'shield-checkmark',hue: ['#3eb887', '#1f9b6a'], views: 760 },
  ],
  mechanical_plumbing_tech: [
    { id: 'mp-sbc701', title: 'مراجعة كود SBC 701 للسباكة',       desc: 'تمديدات المياه والصرف',          durationSec: 7 * 60 + 25, icon: 'water',        hue: ['#5294e8', '#3a78c4'], views: 1340 },
    { id: 'mp-sbc501', title: 'مراجعة كود SBC 501 الميكانيكي',    desc: 'HVAC والتهوية',                  durationSec: 8 * 60 + 18, icon: 'thermometer',  hue: ['#c9973a', '#9a7028'], views: 980 },
    { id: 'mp-plan',   title: 'قراءة مخطط التمديدات الميكانيكية', desc: 'مسارات وأقطار الأنابيب',         durationSec: 6 * 60 + 55, icon: 'construct',    hue: ['#e6b34a', '#9a7028'], views: 720 },
    { id: 'mp-test',   title: 'فحوصات الضغط والتسريب',            desc: 'إجراءات القبول والتسليم',         durationSec: 5 * 60 + 30, icon: 'flask',        hue: ['#3eb887', '#1f9b6a'], views: 650 },
  ],
};

function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60), s = sec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export default function Tutorials() {
  const { theme, fontsLoaded } = useTheme();
  const { width } = useWindowDimensions();
  const specialty = useAuth(s => s.specialty);
  const [active, setActive] = useState<Tutorial | null>(null);

  const roleList = specialty ? PER_ROLE[specialty] : [];

  const playerW = Math.min(width - SP[4] * 2, 720);
  const playerH = playerW * (9 / 16);

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: theme.bg.base }}>
      <ScrollView contentContainerStyle={{ padding: SP[5], paddingBottom: SP[10] }}>
        <Text style={[styles.h1, {
          color: theme.text.primary,
          fontFamily: fontsLoaded ? FONT.arabic : undefined,
        }]}>الشروحات</Text>

        {specialty && (
          <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 8, marginTop: 4 }}>
            <View style={[
              styles.roleBadge,
              { backgroundColor: theme.gold.soft, borderColor: theme.border.gold },
            ]}>
              <Text style={{
                fontSize: 11, fontWeight: '700', color: theme.gold.base,
                fontFamily: fontsLoaded ? FONT.arabic : undefined,
              }}>{specialtyLabel(specialty)}</Text>
            </View>
            <Text style={{
              fontSize: 11, color: theme.text.muted,
              fontFamily: fontsLoaded ? FONT.arabic : undefined,
            }}>{roleList.length} فيديو مخصّص لتخصصك</Text>
          </View>
        )}

        {specialty && (
          <>
            <Section title="موصى به لتخصصك" theme={theme} fontsLoaded={fontsLoaded} />
            <View style={{ gap: SP[3] }}>
              {roleList.map(t => <VideoCard key={t.id} t={t} onPlay={() => setActive(t)} />)}
            </View>
          </>
        )}

        <Section title="أساسيات عامة" theme={theme} fontsLoaded={fontsLoaded} />
        <View style={{ gap: SP[3] }}>
          {COMMON.map(t => <VideoCard key={t.id} t={t} onPlay={() => setActive(t)} />)}
        </View>
      </ScrollView>

      <Modal
        visible={!!active}
        transparent
        animationType="fade"
        onRequestClose={() => setActive(null)}
      >
        <Pressable
          onPress={() => setActive(null)}
          style={[styles.backdrop, { backgroundColor: theme.bg.overlay }]}
        >
          <Pressable
            onPress={() => {}}
            style={[styles.modal, {
              backgroundColor: theme.bg.card,
              borderColor: theme.border.gold,
              width: playerW + SP[4] * 2,
            }]}
          >
            <View style={[styles.modalHead, { borderBottomColor: theme.border.soft }]}>
              <Text style={{
                flex: 1,
                fontSize: 15, fontWeight: '700', color: theme.text.primary,
                fontFamily: fontsLoaded ? FONT.arabic : undefined,
              }} numberOfLines={1}>{active?.title}</Text>
              <Pressable onPress={() => setActive(null)} hitSlop={6}>
                <Ionicons name="close" size={20} color={theme.text.muted} />
              </Pressable>
            </View>

            {active && (
              <View style={{ padding: SP[4] }}>
                <View style={{ width: playerW, height: playerH, borderRadius: RADIUS.md, overflow: 'hidden' }}>
                  <LinearGradient
                    colors={active.hue}
                    style={StyleSheet.absoluteFillObject as any}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                  />
                  <View style={[styles.playerCenter]}>
                    <View style={[styles.playBtn, { backgroundColor: 'rgba(0,0,0,0.45)' }]}>
                      <Ionicons name="play" size={36} color="#fff" />
                    </View>
                    <Text style={{
                      marginTop: 10, color: 'rgba(255,255,255,0.92)', fontSize: 12,
                      fontFamily: fontsLoaded ? FONT.mono : undefined,
                    }}>{formatDuration(active.durationSec)} · MOCK PLAYER</Text>
                  </View>
                  <View style={[styles.scrubBar, { backgroundColor: 'rgba(255,255,255,0.25)' }]}>
                    <View style={[styles.scrubFill, { backgroundColor: '#fff' }]} />
                  </View>
                </View>

                <Text style={{
                  marginTop: SP[3], fontSize: 14, color: theme.text.primary, lineHeight: 22, textAlign: 'right',
                  fontFamily: fontsLoaded ? FONT.arabic : undefined,
                }}>{active.desc}</Text>
                <Text style={{
                  marginTop: 4, fontSize: 11, color: theme.text.muted, textAlign: 'right',
                  fontFamily: fontsLoaded ? FONT.mono : undefined,
                }}>{active.views.toLocaleString('en-US')} مشاهدة</Text>
              </View>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

function Section({ title, theme, fontsLoaded }: { title: string; theme: any; fontsLoaded: boolean }) {
  return (
    <Text style={{
      fontSize: 11, letterSpacing: 1.2, textTransform: 'uppercase',
      color: theme.gold.base, marginTop: SP[6], marginBottom: SP[3], textAlign: 'right',
      fontFamily: fontsLoaded ? FONT.mono : undefined,
    }}>{title}</Text>
  );
}

function VideoCard({ t, onPlay }: { t: Tutorial; onPlay: () => void }) {
  const { theme, fontsLoaded } = useTheme();
  return (
    <Pressable
      onPress={onPlay}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: theme.bg.card,
          borderColor: pressed ? theme.gold.base : theme.border.soft,
        },
      ]}
    >
      <View style={styles.thumb}>
        <LinearGradient
          colors={t.hue}
          style={StyleSheet.absoluteFillObject as any}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        />
        <View style={styles.thumbCenter}>
          <Ionicons name={t.icon} size={28} color="rgba(255,255,255,0.85)" />
        </View>
        <View style={[styles.duration, { backgroundColor: 'rgba(0,0,0,0.55)' }]}>
          <Text style={{
            fontSize: 10, color: '#fff', fontWeight: '600',
            fontFamily: fontsLoaded ? FONT.mono : undefined,
          }}>{formatDuration(t.durationSec)}</Text>
        </View>
        <View style={styles.playOverlay}>
          <View style={[styles.playBtnSm, { backgroundColor: 'rgba(0,0,0,0.55)' }]}>
            <Ionicons name="play" size={20} color="#fff" />
          </View>
        </View>
      </View>

      <View style={{ flex: 1, padding: SP[3] }}>
        <Text style={{
          fontSize: 14, fontWeight: '700', color: theme.text.primary, textAlign: 'right',
          fontFamily: fontsLoaded ? FONT.arabic : undefined,
        }} numberOfLines={2}>{t.title}</Text>
        <Text style={{
          fontSize: 12, color: theme.text.secondary, marginTop: 2, lineHeight: 18, textAlign: 'right',
          fontFamily: fontsLoaded ? FONT.arabic : undefined,
        }} numberOfLines={2}>{t.desc}</Text>
        <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 8, marginTop: 6 }}>
          <Text style={{
            fontSize: 10, color: theme.text.muted,
            fontFamily: fontsLoaded ? FONT.mono : undefined,
          }}>{t.views.toLocaleString('en-US')} مشاهدة</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  h1: { fontSize: 26, fontWeight: '800', letterSpacing: -0.4, textAlign: 'right' },
  roleBadge: {
    paddingHorizontal: 10, paddingVertical: 3,
    borderRadius: RADIUS.pill, borderWidth: 1,
  },
  card: {
    flexDirection: 'row-reverse',
    borderRadius: RADIUS.lg, borderWidth: 1, overflow: 'hidden',
  },
  thumb: {
    width: 130, aspectRatio: 16 / 10,
    position: 'relative',
  },
  thumbCenter: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  playOverlay: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  playBtnSm: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  duration: {
    position: 'absolute', bottom: 6, left: 6,
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4,
  },
  backdrop: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SP[4] },
  modal: {
    maxWidth: '100%', borderWidth: 1, borderRadius: RADIUS.lg, overflow: 'hidden',
    ...(Platform.OS === 'ios'
      ? { shadowColor: '#000', shadowOpacity: 0.35, shadowRadius: 20, shadowOffset: { width: 0, height: 10 } }
      : { elevation: 12 }),
  },
  modalHead: {
    flexDirection: 'row-reverse', alignItems: 'center', gap: 8,
    paddingHorizontal: SP[4], paddingVertical: SP[3],
    borderBottomWidth: 1,
  },
  playerCenter: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center', justifyContent: 'center',
  },
  playBtn: {
    width: 64, height: 64, borderRadius: 32,
    alignItems: 'center', justifyContent: 'center',
  },
  scrubBar: {
    position: 'absolute', bottom: 12, left: 12, right: 12,
    height: 3, borderRadius: 2,
  },
  scrubFill: {
    width: '32%', height: '100%', borderRadius: 2,
  },
});
