import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../src/components/ThemeProvider';
import { RouteHeader } from '../src/components/RouteHeader';
import { Card } from '../src/components/primitives';
import { FONT, SP } from '../src/theme';

const NOTIFS = [
  { icon: 'sparkles',    title: 'تحديث جديد متاح', body: 'أُضيف تبويب الشروحات والتنقّل المحسّن.', at: 'قبل دقائق' },
  { icon: 'information-circle', title: 'الستايل التلقائي', body: 'الواجهة الآن تتبع وضع نظامك تلقائياً.', at: 'اليوم' },
];

export default function Notifications() {
  const { theme, fontsLoaded } = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: theme.bg.base }}>
      <RouteHeader title="الإشعارات" />
      <ScrollView contentContainerStyle={{ padding: SP[5], paddingBottom: SP[10] }}>
        {NOTIFS.map((n, i) => (
          <Card key={i} style={{ marginBottom: SP[3] }}>
            <View style={{ flexDirection: 'row-reverse', gap: SP[3] }}>
              <View style={[styles.icon, { backgroundColor: theme.gold.soft, borderColor: theme.border.gold }]}>
                <Ionicons name={n.icon as any} size={18} color={theme.gold.base} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{
                  fontSize: 14, fontWeight: '700', color: theme.text.primary, textAlign: 'right',
                  fontFamily: fontsLoaded ? FONT.arabic : undefined,
                }}>{n.title}</Text>
                <Text style={{
                  fontSize: 12, color: theme.text.secondary, marginTop: 2, lineHeight: 18, textAlign: 'right',
                  fontFamily: fontsLoaded ? FONT.arabic : undefined,
                }}>{n.body}</Text>
                <Text style={{
                  fontSize: 10, color: theme.text.muted, marginTop: 4, textAlign: 'right',
                  fontFamily: fontsLoaded ? FONT.mono : undefined,
                }}>{n.at}</Text>
              </View>
            </View>
          </Card>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  icon: { width: 36, height: 36, borderRadius: 10, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
});
