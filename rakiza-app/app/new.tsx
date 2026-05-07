import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useStore } from '../src/store/projects';
import { theme, PROJECT_COLORS } from '../src/theme';
import type { ProjectCategory } from '../src/types';
import { CATEGORIES } from '../src/types';
import { Card } from '../src/components/Card';

const EMOJIS = ['🏠','🏢','🏭','🕌','🏘️','🏛️','🏗️','🏥','🏫','☕'];

export default function NewProject() {
  const router = useRouter();
  const addProject = useStore(s => s.addProject);

  const [name, setName] = useState('مشروع جديد');
  const [category, setCategory] = useState<ProjectCategory>('residential');
  const [color, setColor] = useState(PROJECT_COLORS[0]);
  const [emoji, setEmoji] = useState('🏠');
  const [smart, setSmart] = useState(true);
  const [reminderHour, setReminderHour] = useState('9');

  const onCreate = () => {
    const p = addProject({
      name: name.trim() || 'مشروع جديد',
      category, color, emoji,
      reminders: reminderHour ? [{ hour: Number(reminderHour) || 9, minute: 0 }] : [],
      smartReminders: smart,
      stackedAfterId: null,
    });
    router.replace(`/project/${p.id}`);
  };

  return (
    <View style={styles.root}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.cancel}>
              <Text style={styles.cancelText}>إلغاء</Text>
            </Pressable>
            <Text style={styles.h1}>مشروع جديد</Text>
            <View style={{ width: 64 }} />
          </View>

          <Card style={styles.card}>
            <Text style={styles.label}>اسم المشروع</Text>
            <TextInput value={name} onChangeText={setName} style={styles.input} placeholder="مثلاً: فيلا الياسمين" placeholderTextColor={theme.text.muted} />
          </Card>

          <Card style={styles.card}>
            <Text style={styles.label}>التصنيف</Text>
            <View style={styles.gridRow}>
              {(Object.keys(CATEGORIES) as ProjectCategory[]).map(k => {
                const c = CATEGORIES[k];
                const active = category === k;
                return (
                  <Pressable key={k} onPress={() => setCategory(k)}
                    style={[styles.option, active && styles.optionActive, active && { borderColor: color, backgroundColor: color + '15' }]}>
                    <Text style={[styles.optionEmoji]}>{c.emoji}</Text>
                    <Text style={[styles.optionLabel, active && { color: theme.text.primary, fontWeight: '700' }]}>{c.label}</Text>
                  </Pressable>
                );
              })}
            </View>
          </Card>

          <Card style={styles.card}>
            <Text style={styles.label}>الأيقونة</Text>
            <View style={styles.gridRow}>
              {EMOJIS.map(e => (
                <Pressable key={e} onPress={() => setEmoji(e)}
                  style={[styles.emojiBtn, emoji === e && styles.emojiBtnActive]}>
                  <Text style={{ fontSize: 22 }}>{e}</Text>
                </Pressable>
              ))}
            </View>
          </Card>

          <Card style={styles.card}>
            <Text style={styles.label}>اللون</Text>
            <View style={styles.gridRow}>
              {PROJECT_COLORS.map(c => (
                <Pressable key={c} onPress={() => setColor(c)}
                  style={[styles.colorBtn, { backgroundColor: c }, color === c && styles.colorActive]}/>
              ))}
            </View>
          </Card>

          <Card style={styles.card}>
            <Text style={styles.label}>التذكير اليومي (الساعة)</Text>
            <TextInput
              value={reminderHour} onChangeText={setReminderHour} keyboardType="number-pad"
              style={styles.input} placeholder="9" maxLength={2}
            />
            <Pressable style={styles.toggleRow} onPress={() => setSmart(s => !s)}>
              <Text style={styles.toggleLabel}>إشعارات ذكية (تتعلّم وقتك)</Text>
              <View style={[styles.toggle, smart && styles.toggleOn]}>
                <View style={[styles.toggleDot, smart && styles.toggleDotOn]} />
              </View>
            </Pressable>
          </Card>

          <Pressable style={[styles.create, { backgroundColor: color }]} onPress={onCreate}>
            <Text style={styles.createText}>إنشاء المشروع</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.bg.base },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  cancel: { paddingVertical: 6, paddingHorizontal: 8 },
  cancelText: { color: theme.accent.blue, fontSize: 15 },
  h1: { color: theme.text.primary, fontSize: 18, fontWeight: '700' },
  card: { marginBottom: 12 },
  label: { color: theme.text.muted, fontSize: 12, marginBottom: 8 },
  input: { backgroundColor: theme.bg.base, borderWidth: 1, borderColor: theme.border.light, borderRadius: 8, padding: 12, color: theme.text.primary, fontSize: 15 },
  gridRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  option: { flex: 1, minWidth: 100, backgroundColor: theme.bg.base, borderWidth: 1, borderColor: theme.border.light, borderRadius: 10, padding: 12, alignItems: 'center' },
  optionActive: {},
  optionEmoji: { fontSize: 22, marginBottom: 4 },
  optionLabel: { color: theme.text.secondary, fontSize: 12 },
  emojiBtn: { width: 44, height: 44, borderRadius: 8, borderWidth: 1, borderColor: theme.border.light, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.bg.base },
  emojiBtnActive: { borderColor: theme.accent.blue, backgroundColor: theme.accent.blueSoft },
  colorBtn: { width: 36, height: 36, borderRadius: 18, borderWidth: 2, borderColor: 'transparent' },
  colorActive: { borderColor: theme.text.primary },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 },
  toggleLabel: { color: theme.text.primary, fontSize: 14 },
  toggle: { width: 44, height: 26, borderRadius: 13, backgroundColor: theme.border.light, padding: 2 },
  toggleOn: { backgroundColor: theme.accent.blue },
  toggleDot: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#fff' },
  toggleDotOn: { transform: [{ translateX: -18 }] },
  create: { padding: 16, borderRadius: 14, alignItems: 'center', marginTop: 8 },
  createText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});
