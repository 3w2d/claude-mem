import { ScrollView, StyleSheet, Text, TextInput, View, Pressable, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStore } from '../../src/store/projects';
import { Card } from '../../src/components/Card';
import { theme } from '../../src/theme';
import { clearAll } from '../../src/lib/storage';

export default function Settings() {
  const pricing = useStore(s => s.settings.pricing);
  const setPricing = useStore(s => s.setPricing);
  const quietWindows = useStore(s => s.settings.quietWindows);
  const setQuietWindows = useStore(s => s.setQuietWindows);

  const w = quietWindows[0] ?? { startMinutes: 22 * 60, endMinutes: 7 * 60 };

  return (
    <View style={styles.root}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 140 }}>
          <Text style={styles.h1}>الإعدادات</Text>
          <Text style={styles.sub}>أسعار السوق وأوقات الهدوء</Text>

          <Card style={styles.card}>
            <Text style={styles.section}>أسعار السوق (SAR)</Text>
            {([
              ['concrete', 'الخرسانة (م³)'],
              ['steel', 'الحديد (طن)'],
              ['wall', 'الجدار (م²)'],
              ['door', 'الباب (وحدة)'],
              ['window', 'الشباك (وحدة)'],
              ['finish', 'التشطيب (م²)'],
            ] as const).map(([k, label]) => (
              <View key={k} style={styles.row}>
                <Text style={styles.label}>{label}</Text>
                <TextInput
                  defaultValue={String(pricing[k as keyof typeof pricing])}
                  keyboardType="number-pad"
                  onEndEditing={(e) => {
                    const n = Number(e.nativeEvent.text);
                    if (Number.isFinite(n) && n >= 0) setPricing({ [k]: n } as any);
                  }}
                  style={styles.input}
                />
              </View>
            ))}
          </Card>

          <Card style={styles.card}>
            <Text style={styles.section}>أوقات الهدوء (إخفاء الإشعارات)</Text>
            <View style={styles.row}>
              <Text style={styles.label}>من (الساعة)</Text>
              <TextInput
                defaultValue={String(Math.floor(w.startMinutes / 60))}
                keyboardType="number-pad"
                onEndEditing={(e) => {
                  const h = Number(e.nativeEvent.text);
                  if (Number.isFinite(h) && h >= 0 && h < 24)
                    setQuietWindows([{ ...w, startMinutes: h * 60 }]);
                }}
                style={styles.input}
              />
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>إلى (الساعة)</Text>
              <TextInput
                defaultValue={String(Math.floor(w.endMinutes / 60))}
                keyboardType="number-pad"
                onEndEditing={(e) => {
                  const h = Number(e.nativeEvent.text);
                  if (Number.isFinite(h) && h >= 0 && h < 24)
                    setQuietWindows([{ ...w, endMinutes: h * 60 }]);
                }}
                style={styles.input}
              />
            </View>
            <Text style={styles.hint}>الإشعارات الذكية لن تُجدول داخل هذه الفترة.</Text>
          </Card>

          <Card style={styles.card}>
            <Text style={styles.section}>منطقة الخطر</Text>
            <Pressable
              style={styles.danger}
              onPress={() => {
                if (Platform.OS === 'web') {
                  if (confirm('هل أنت متأكد من حذف كل البيانات؟')) clearAll().then(() => location.reload());
                } else {
                  Alert.alert('حذف كل البيانات', 'لا يمكن التراجع.', [
                    { text: 'إلغاء', style: 'cancel' },
                    { text: 'حذف', style: 'destructive', onPress: () => clearAll() },
                  ]);
                }
              }}>
              <Text style={styles.dangerText}>حذف جميع البيانات</Text>
            </Pressable>
          </Card>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.bg.base },
  h1: { color: theme.text.primary, fontSize: 24, fontWeight: '800' },
  sub: { color: theme.text.secondary, fontSize: 13, marginTop: 4, marginBottom: 18 },
  card: { marginBottom: 14 },
  section: { color: theme.text.secondary, fontSize: 12, marginBottom: 12, fontWeight: '600' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  label: { color: theme.text.primary, fontSize: 14 },
  input: { backgroundColor: theme.bg.base, borderWidth: 1, borderColor: theme.border.light, borderRadius: 8, padding: 8, color: theme.accent.blue, fontWeight: '700', minWidth: 100, textAlign: 'left' },
  hint: { color: theme.text.muted, fontSize: 11, marginTop: 6 },
  danger: { backgroundColor: theme.danger + '15', borderWidth: 1, borderColor: theme.danger, padding: 12, borderRadius: 10, alignItems: 'center' },
  dangerText: { color: theme.danger, fontWeight: '700' },
});
