import { useEffect, useMemo } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/components/ThemeProvider';
import { Card } from '../../src/components/primitives';
import { useStore } from '../../src/store/projects';
import { useNCRs } from '../../src/store/ncrs';
import { fmt, fmtCompact } from '../../src/lib/format';
import { FONT, RADIUS, SP } from '../../src/theme';
import { CATEGORIES, categoryFor } from '../../src/types';

export default function ProjectsTab() {
  const { theme, fontsLoaded } = useTheme();
  const router = useRouter();
  const projects = useStore(s => s.projects);
  const hydrate = useNCRs(s => s.hydrate);
  const ncrs = useNCRs(s => s.ncrs);

  useEffect(() => { hydrate(); }, [hydrate]);

  const counts = useMemo(() => {
    const map = new Map<string, { total: number; review: number }>();
    for (const n of ncrs) {
      const c = map.get(n.projectId) ?? { total: 0, review: 0 };
      c.total++;
      if (n.status === 'review') c.review++;
      map.set(n.projectId, c);
    }
    return map;
  }, [ncrs]);

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: theme.bg.base }}>
      <View style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: SP[5], paddingBottom: 120 }}>
          <Text style={[styles.h1, {
            color: theme.text.primary,
            fontFamily: fontsLoaded ? FONT.arabic : undefined,
          }]}>المشاريع</Text>
          <Text style={[styles.sub, {
            color: theme.text.secondary,
            fontFamily: fontsLoaded ? FONT.arabic : undefined,
          }]}>{projects.length} مشروع نشط</Text>

          {projects.length === 0 ? (
            <Card style={{ alignItems: 'center', paddingVertical: SP[16], marginTop: SP[6] }}>
              <Ionicons name="folder-open" size={42} color={theme.text.muted} />
              <Text style={{
                marginTop: SP[3], fontSize: 14, color: theme.text.secondary,
                fontFamily: fontsLoaded ? FONT.arabic : undefined,
              }}>لا توجد مشاريع بعد — أضف أوّل مشروع</Text>
            </Card>
          ) : (
            <View style={{ gap: SP[3], marginTop: SP[5] }}>
              {projects.map(p => {
                const cat = CATEGORIES[categoryFor(p.params.buildingUse)];
                const c = counts.get(p.id) ?? { total: 0, review: 0 };
                return (
                  <Pressable
                    key={p.id}
                    onPress={() => router.push(`/project/${p.id}`)}
                    style={({ pressed }) => [
                      styles.projCard,
                      {
                        backgroundColor: theme.bg.card,
                        borderColor: pressed ? theme.gold.base : theme.border.soft,
                      },
                    ]}
                  >
                    <View style={[styles.projIcon, { backgroundColor: theme.gold.soft, borderColor: theme.border.gold }]}>
                      <Text style={{ fontSize: 20 }}>{cat.emoji}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{
                        fontSize: 15, fontWeight: '700', color: theme.text.primary, textAlign: 'right',
                        fontFamily: fontsLoaded ? FONT.arabic : undefined,
                      }} numberOfLines={1}>{p.name}</Text>
                      <Text style={{
                        fontSize: 11, color: theme.text.muted, marginTop: 2, textAlign: 'right',
                        fontFamily: fontsLoaded ? FONT.mono : undefined,
                      }}>{p.params.length}×{p.params.width}m · {p.params.floors} أدوار · {cat.label}</Text>
                      <View style={styles.metaRow}>
                        {p.results && (
                          <Text style={{
                            fontSize: 11, color: theme.gold.base, fontWeight: '600',
                            fontFamily: fontsLoaded ? FONT.mono : undefined,
                          }}>{fmtCompact(p.results.cost.total)} ر.س</Text>
                        )}
                        <Text style={{
                          fontSize: 11, color: theme.text.muted,
                          fontFamily: fontsLoaded ? FONT.mono : undefined,
                        }}>·</Text>
                        <Text style={{
                          fontSize: 11, color: theme.text.secondary,
                          fontFamily: fontsLoaded ? FONT.arabic : undefined,
                        }}>{c.total} NCR{c.review > 0 ? ` · ${c.review} قيد المراجعة` : ''}</Text>
                      </View>
                    </View>
                    <Ionicons name="chevron-back" size={18} color={theme.text.muted} />
                  </Pressable>
                );
              })}
            </View>
          )}
        </ScrollView>

        <Pressable
          onPress={() => router.push('/calculator')}
          style={({ pressed }) => [
            styles.fab,
            {
              backgroundColor: theme.gold.base,
              opacity: pressed ? 0.85 : 1,
              shadowColor: theme.gold.base,
            },
          ]}
        >
          <Ionicons name="add" size={26} color={theme.text.inverse} />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  h1: { fontSize: 26, fontWeight: '800', letterSpacing: -0.4, textAlign: 'right' },
  sub: { fontSize: 13, marginTop: 4, textAlign: 'right' },
  projCard: {
    flexDirection: 'row-reverse', alignItems: 'center', gap: SP[3],
    padding: SP[4], borderRadius: RADIUS.lg, borderWidth: 1,
  },
  projIcon: {
    width: 44, height: 44, borderRadius: 12, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },
  metaRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 6, marginTop: 4, flexWrap: 'wrap' },
  fab: {
    position: 'absolute', bottom: 96, left: 24,
    width: 58, height: 58, borderRadius: 29,
    alignItems: 'center', justifyContent: 'center',
    shadowOpacity: 0.35, shadowRadius: 14, shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
});
