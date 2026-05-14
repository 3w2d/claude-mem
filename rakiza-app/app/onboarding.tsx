import { useRef, useState } from 'react';
import {
  View, Text, TextInput, Pressable, ScrollView, StyleSheet,
  useWindowDimensions, Platform, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../src/components/ThemeProvider';
import { useAuth, SPECIALTIES, type Specialty } from '../src/store/auth';
import { FONT, RADIUS, SP } from '../src/theme';

interface Slide {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  title: string;
  body: string;
}

const SLIDES: Slide[] = [
  {
    icon: 'construct',
    title: 'صيانة أسهل وأسرع',
    body: 'جدولة المهام، تتبّع البلاغات، ومعرفة ما يحتاج إصلاحاً قبل أن يصبح مشكلة.',
  },
  {
    icon: 'shield-checkmark',
    title: 'مطابقة الأكواد الهندسية',
    body: 'فحص فوري وفق SBC 304 و ACI 318 — تأكّد أنّ كل قرار يحترم اشتراطات الكود السعودي.',
  },
  {
    icon: 'log-in',
    title: 'سجّل دخولك للبدء',
    body: 'أدخل رقم الهوية واختر تخصصك لنخصّص لك الواجهة وأولوياتك.',
  },
];

export default function Onboarding() {
  const { theme, fontsLoaded } = useTheme();
  const { width } = useWindowDimensions();
  const router = useRouter();
  const signIn = useAuth(s => s.signIn);
  const scrollRef = useRef<ScrollView>(null);

  const [page, setPage] = useState(0);
  const [nationalId, setNationalId] = useState('');
  const [specialty, setSpecialty] = useState<Specialty | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const goTo = (i: number) => {
    setPage(i);
    scrollRef.current?.scrollTo({ x: i * width, animated: true });
  };

  const onScrollEnd = (e: any) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / width);
    if (idx !== page) setPage(idx);
  };

  const validate = (): string | null => {
    const id = nationalId.trim();
    if (!/^\d{10}$/.test(id)) return 'أدخل رقم هوية مكوّن من 10 أرقام.';
    if (!specialty) return 'اختر تخصصك.';
    return null;
  };

  const submit = async () => {
    const err = validate();
    if (err) {
      Platform.OS === 'web' ? window.alert(err) : Alert.alert('تنبيه', err);
      return;
    }
    setSubmitting(true);
    await signIn(nationalId.trim(), specialty!);
    router.replace('/');
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg.base }}>
      <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1 }}>
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={onScrollEnd}
          // Reverse the slide order for RTL so first slide appears on the right
          contentContainerStyle={{ flexDirection: 'row' }}
        >
          {SLIDES.map((s, i) => (
            <View key={i} style={[styles.slide, { width }]}>
              <View style={[
                styles.iconWrap,
                { backgroundColor: theme.gold.soft, borderColor: theme.border.gold },
              ]}>
                <Ionicons name={s.icon} size={56} color={theme.gold.base} />
              </View>
              <Text style={[
                styles.title,
                { color: theme.text.primary, fontFamily: fontsLoaded ? FONT.arabic : undefined },
              ]}>{s.title}</Text>
              <Text style={[
                styles.body,
                { color: theme.text.secondary, fontFamily: fontsLoaded ? FONT.arabic : undefined },
              ]}>{s.body}</Text>

              {/* Sign-in form on the last slide */}
              {i === SLIDES.length - 1 && (
                <View style={{ width: '100%', marginTop: SP[6], gap: SP[3] }}>
                  <View>
                    <Text style={[
                      styles.label,
                      { color: theme.text.secondary, fontFamily: fontsLoaded ? FONT.arabic : undefined },
                    ]}>رقم الهوية الوطنية</Text>
                    <TextInput
                      value={nationalId}
                      onChangeText={setNationalId}
                      keyboardType="number-pad"
                      maxLength={10}
                      placeholder="١٠٢٣٤٥٦٧٨٩"
                      placeholderTextColor={theme.text.muted}
                      style={[
                        styles.input,
                        {
                          backgroundColor: theme.bg.input,
                          borderColor: theme.border.soft,
                          color: theme.text.primary,
                          fontFamily: fontsLoaded ? FONT.mono : undefined,
                        },
                      ]}
                    />
                  </View>

                  <Text style={[
                    styles.label,
                    { color: theme.text.secondary, marginTop: SP[1], fontFamily: fontsLoaded ? FONT.arabic : undefined },
                  ]}>التخصص</Text>
                  <View style={{ flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 8 }}>
                    {SPECIALTIES.map(opt => {
                      const active = specialty === opt.id;
                      return (
                        <Pressable
                          key={opt.id}
                          onPress={() => setSpecialty(opt.id)}
                          style={[
                            styles.chip,
                            {
                              backgroundColor: active ? theme.gold.soft : theme.bg.card,
                              borderColor: active ? theme.gold.base : theme.border.soft,
                            },
                          ]}
                        >
                          <Text style={{ fontSize: 16 }}>{opt.emoji}</Text>
                          <Text style={{
                            fontSize: 13,
                            fontWeight: active ? '700' : '500',
                            color: active ? theme.gold.base : theme.text.primary,
                            fontFamily: fontsLoaded ? FONT.arabic : undefined,
                          }}>{opt.label}</Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              )}
            </View>
          ))}
        </ScrollView>

        {/* Footer: dots + primary action */}
        <View style={styles.footer}>
          <View style={styles.dots}>
            {SLIDES.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  {
                    backgroundColor: i === page ? theme.gold.base : theme.border.strong,
                    width: i === page ? 22 : 8,
                  },
                ]}
              />
            ))}
          </View>

          {page < SLIDES.length - 1 ? (
            <View style={{ flexDirection: 'row-reverse', gap: SP[2] }}>
              <Pressable
                onPress={() => goTo(SLIDES.length - 1)}
                style={({ pressed }) => [
                  styles.btnGhost,
                  { borderColor: theme.border.soft, opacity: pressed ? 0.6 : 1 },
                ]}
              >
                <Text style={{
                  fontSize: 13, color: theme.text.secondary,
                  fontFamily: fontsLoaded ? FONT.arabic : undefined,
                }}>تخطّي</Text>
              </Pressable>
              <Pressable
                onPress={() => goTo(page + 1)}
                style={({ pressed }) => [
                  styles.btnPrimary,
                  { backgroundColor: theme.gold.base, opacity: pressed ? 0.85 : 1 },
                ]}
              >
                <Text style={{
                  fontSize: 14, fontWeight: '700', color: theme.text.inverse,
                  fontFamily: fontsLoaded ? FONT.arabic : undefined,
                }}>التالي</Text>
                <Ionicons name="chevron-back" size={18} color={theme.text.inverse} />
              </Pressable>
            </View>
          ) : (
            <Pressable
              onPress={submit}
              disabled={submitting}
              style={({ pressed }) => [
                styles.btnPrimary,
                {
                  backgroundColor: theme.gold.base,
                  opacity: pressed || submitting ? 0.85 : 1,
                  paddingHorizontal: SP[6],
                },
              ]}
            >
              <Text style={{
                fontSize: 14, fontWeight: '700', color: theme.text.inverse,
                fontFamily: fontsLoaded ? FONT.arabic : undefined,
              }}>دخول</Text>
              <Ionicons name="checkmark" size={18} color={theme.text.inverse} />
            </Pressable>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  slide: {
    paddingHorizontal: SP[6], paddingTop: SP[10],
    alignItems: 'center',
  },
  iconWrap: {
    width: 120, height: 120, borderRadius: 60,
    borderWidth: 1, alignItems: 'center', justifyContent: 'center',
    marginBottom: SP[6],
  },
  title: { fontSize: 26, fontWeight: '800', letterSpacing: -0.5, textAlign: 'center', marginBottom: SP[3] },
  body: { fontSize: 14, lineHeight: 22, textAlign: 'center', maxWidth: 360 },
  label: { fontSize: 12, fontWeight: '600', marginBottom: 6, textAlign: 'right' },
  input: {
    paddingVertical: 12, paddingHorizontal: 14,
    borderWidth: 1, borderRadius: RADIUS.md,
    fontSize: 18, letterSpacing: 2, textAlign: 'center',
  },
  chip: {
    flexDirection: 'row-reverse', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 9,
    borderWidth: 1, borderRadius: RADIUS.pill,
  },
  footer: {
    paddingHorizontal: SP[6], paddingVertical: SP[4],
    flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between',
  },
  dots: { flexDirection: 'row-reverse', gap: 6, alignItems: 'center' },
  dot: { height: 8, borderRadius: 4 },
  btnPrimary: {
    flexDirection: 'row-reverse', alignItems: 'center', gap: 6,
    paddingHorizontal: SP[4], paddingVertical: 11,
    borderRadius: RADIUS.md,
  },
  btnGhost: {
    paddingHorizontal: SP[4], paddingVertical: 11,
    borderRadius: RADIUS.md, borderWidth: 1,
  },
});
