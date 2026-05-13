import { useState, useMemo } from 'react';
import { View, Text, TextInput, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../src/components/ThemeProvider';
import { RouteHeader } from '../src/components/RouteHeader';
import { Card } from '../src/components/primitives';
import { useStore } from '../src/store/projects';
import { FONT, RADIUS, SP } from '../src/theme';

export default function Search() {
  const { theme, fontsLoaded } = useTheme();
  const router = useRouter();
  const projects = useStore(s => s.projects);
  const setActive = useStore(s => s.setActiveProject);
  const [q, setQ] = useState('');

  const results = useMemo(() => {
    if (!q.trim()) return [];
    const lc = q.toLowerCase();
    return projects.filter(p => p.name.toLowerCase().includes(lc));
  }, [projects, q]);

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg.base }}>
      <RouteHeader title="بحث" />
      <View style={{ padding: SP[4] }}>
        <View style={[styles.search, { backgroundColor: theme.bg.input, borderColor: theme.border.soft }]}>
          <Ionicons name="search" size={18} color={theme.text.muted} />
          <TextInput
            value={q}
            onChangeText={setQ}
            autoFocus
            placeholder="ابحث في المشاريع..."
            placeholderTextColor={theme.text.muted}
            style={{
              flex: 1, paddingVertical: 8, fontSize: 14,
              color: theme.text.primary, textAlign: 'right',
              fontFamily: fontsLoaded ? FONT.arabic : undefined,
            }}
          />
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: SP[4], paddingBottom: SP[10] }}>
        {q.trim() && results.length === 0 && (
          <Text style={{
            textAlign: 'center', color: theme.text.muted, marginTop: SP[8],
            fontFamily: fontsLoaded ? FONT.arabic : undefined,
          }}>لا توجد نتائج</Text>
        )}
        {results.map(p => (
          <Pressable key={p.id} onPress={() => { setActive(p); router.replace('/calculator'); }}>
            <Card style={{ marginBottom: SP[2] }}>
              <Text style={{
                fontSize: 14, fontWeight: '600', color: theme.text.primary, textAlign: 'right',
                fontFamily: fontsLoaded ? FONT.arabic : undefined,
              }}>{p.name}</Text>
              <Text style={{
                fontSize: 11, color: theme.text.muted, marginTop: 2, textAlign: 'right',
                fontFamily: fontsLoaded ? FONT.mono : undefined,
              }}>{p.params.length}×{p.params.width}m · {p.params.floors} أدوار</Text>
            </Card>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  search: { flexDirection: 'row-reverse', alignItems: 'center', gap: 8, paddingHorizontal: SP[3], borderWidth: 1, borderRadius: RADIUS.md },
});
