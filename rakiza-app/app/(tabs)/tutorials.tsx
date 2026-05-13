import { ScrollView, View, Text, Pressable, StyleSheet, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/components/ThemeProvider';
import { Card } from '../../src/components/primitives';
import { FONT, RADIUS, SP } from '../../src/theme';

const TUTORIALS = [
  { icon: 'play-circle', title: 'البداية السريعة', desc: 'ابدأ مشروعك الأول في 3 خطوات وتعرّف على الواجهة.', mins: 3 },
  { icon: 'calculator',  title: 'الحاسبة الإنشائية', desc: 'فهم مدخلات SBC 304 وكيف تُحسب الكميات والتكلفة.', mins: 6 },
  { icon: 'grid',        title: 'استخدام المحرّر',  desc: 'رسم الجدران والأعمدة، إدارة الأدوار، والقياس.', mins: 8 },
  { icon: 'chatbubble-ellipses', title: 'مساعد AI', desc: 'إعداد المزوّد المجاني وطرق صياغة الطلبات.', mins: 5 },
  { icon: 'analytics',   title: 'قراءة التقارير',   desc: 'تفسير التوزيعات والمتوسطات لاتخاذ القرار.', mins: 4 },
  { icon: 'shield-checkmark', title: 'الأمان والكود', desc: 'متى تكفي النتائج التقديرية ومتى تحتاج مهندس مرخّص.', mins: 3 },
];

export default function Tutorials() {
  const { theme, fontsLoaded } = useTheme();
  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: theme.bg.base }}>
      <ScrollView contentContainerStyle={{ padding: SP[5], paddingBottom: SP[10] }}>
        <Text style={[styles.h1, { color: theme.text.primary, fontFamily: fontsLoaded ? FONT.arabic : undefined }]}>
          الشروحات
        </Text>
        <Text style={[styles.sub, { color: theme.text.secondary, fontFamily: fontsLoaded ? FONT.arabic : undefined }]}>
          دروس قصيرة تشرح كل أداة بأمثلة عملية
        </Text>

        <View style={{ gap: SP[3], marginTop: SP[5] }}>
          {TUTORIALS.map((t, i) => (
            <Card key={i}>
              <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: SP[3] }}>
                <View style={[styles.iconWrap, { backgroundColor: theme.gold.soft, borderColor: theme.border.gold }]}>
                  <Ionicons name={t.icon as any} size={20} color={theme.gold.base} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.title, { color: theme.text.primary, fontFamily: fontsLoaded ? FONT.arabic : undefined }]}>
                    {t.title}
                  </Text>
                  <Text style={[styles.desc, { color: theme.text.secondary, fontFamily: fontsLoaded ? FONT.arabic : undefined }]} numberOfLines={2}>
                    {t.desc}
                  </Text>
                </View>
                <View style={[styles.minsBox, { borderColor: theme.border.soft }]}>
                  <Text style={[styles.mins, { color: theme.gold.base, fontFamily: fontsLoaded ? FONT.mono : undefined }]}>
                    {t.mins}m
                  </Text>
                </View>
              </View>
            </Card>
          ))}
        </View>

        <Pressable
          onPress={() => Linking.openURL('https://github.com/3w2d/claude-mem').catch(() => {})}
          style={({ pressed }) => [
            styles.docsLink,
            { borderColor: theme.border.soft, opacity: pressed ? 0.6 : 1 },
          ]}>
          <Ionicons name="document-text-outline" size={16} color={theme.text.secondary} />
          <Text style={[styles.docsText, { color: theme.text.secondary, fontFamily: fontsLoaded ? FONT.arabic : undefined }]}>
            الوثائق الكاملة على GitHub
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  h1: { fontSize: 26, fontWeight: '800', letterSpacing: -0.4, textAlign: 'right' },
  sub: { fontSize: 13, marginTop: 4, textAlign: 'right' },
  iconWrap: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  title: { fontSize: 14, fontWeight: '700', textAlign: 'right' },
  desc: { fontSize: 12, marginTop: 2, lineHeight: 18, textAlign: 'right' },
  minsBox: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: RADIUS.pill, borderWidth: 1 },
  mins: { fontSize: 11, fontWeight: '600' },
  docsLink: {
    marginTop: SP[6], padding: SP[4],
    borderRadius: RADIUS.md, borderWidth: 1, borderStyle: 'dashed',
    flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  docsText: { fontSize: 13 },
});
