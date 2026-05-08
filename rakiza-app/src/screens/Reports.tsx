import { useMemo } from 'react';
import { ScrollView, View, Text, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../components/ThemeProvider';
import { Card, SectionHead } from '../components/primitives';
import { useStore } from '../store/projects';
import { fmt, fmtCompact } from '../lib/format';
import { FONT, SP, RADIUS } from '../theme';
import { USE_LABELS, type BuildingUse } from '../types';

export function Reports() {
  const { theme, fontsLoaded } = useTheme();
  const projects = useStore(s => s.projects);
  const { width } = useWindowDimensions();
  const wide = width >= 880;

  const data = useMemo(() => {
    if (!projects.length) return null;
    const byUse: Record<string, { count: number; cost: number; area: number }> = {};
    for (const p of projects) {
      if (!p.results) continue;
      const k = p.params.buildingUse;
      if (!byUse[k]) byUse[k] = { count: 0, cost: 0, area: 0 };
      byUse[k].count++;
      byUse[k].cost += p.results.cost.total;
      byUse[k].area += p.results.totalArea;
    }
    const totalCost = projects.reduce((s, p) => s + (p.results?.cost.total ?? 0), 0);
    const validResults = projects.filter(p => !!p.results);
    const avgCostPerSqm = validResults.length
      ? validResults.reduce((s, p) => s + (p.results?.cost.perSqm ?? 0), 0) / validResults.length
      : 0;
    const maxFloors = Math.max(...projects.map(p => p.params.floors));
    return { byUse, totalCost, avgCostPerSqm, maxFloors };
  }, [projects]);

  return (
    <ScrollView
      contentContainerStyle={{ padding: wide ? SP[8] : SP[5], paddingBottom: 120 }}
      style={{ flex: 1, backgroundColor: theme.bg.base }}
    >
      <View style={{ marginBottom: SP[8] }}>
        <Text style={{
          fontSize: 11, color: theme.gold.base, letterSpacing: 1.5,
          textTransform: 'uppercase', marginBottom: 6,
          fontFamily: fontsLoaded ? FONT.mono : undefined,
        }}>التحليلات</Text>
        <Text style={{
          fontSize: 28, fontWeight: '700', letterSpacing: -0.5,
          color: theme.text.primary, textAlign: 'right',
          fontFamily: fontsLoaded ? FONT.arabic : undefined,
        }}>التقارير الشاملة</Text>
      </View>

      {!data ? (
        <Card pad="lg" style={{ alignItems: 'center', paddingVertical: SP[16] }}>
          <Text style={{ fontSize: 32, color: theme.text.muted, marginBottom: SP[3] }}>📊</Text>
          <Text style={{
            color: theme.text.secondary,
            fontFamily: fontsLoaded ? FONT.arabic : undefined,
          }}>لا توجد بيانات للتحليل. أنشئ مشاريع أولاً.</Text>
        </Card>
      ) : (
        <>
          <View style={{ flexDirection: 'row-reverse', flexWrap: 'wrap', gap: SP[4], marginBottom: SP[6] }}>
            {[
              { l: 'متوسط التكلفة/م²', v: fmt(Math.round(data.avgCostPerSqm)), u: 'ر.س' },
              { l: 'أعلى مبنى',         v: String(data.maxFloors),               u: 'أدوار' },
              { l: 'إجمالي التكاليف',   v: fmtCompact(data.totalCost),            u: 'ر.س' },
            ].map((k, i) => (
              <Card key={i} style={{ flex: 1, minWidth: 200 }}>
                <Text style={{
                  fontSize: 11, color: theme.text.muted, letterSpacing: 0.8,
                  textTransform: 'uppercase', marginBottom: 6,
                  fontFamily: fontsLoaded ? FONT.arabic : undefined, textAlign: 'right',
                }}>{k.l}</Text>
                <View style={{ flexDirection: 'row-reverse', alignItems: 'baseline', gap: 6 }}>
                  <Text style={{
                    fontSize: 26, fontWeight: '700', color: theme.gold.base,
                    fontFamily: fontsLoaded ? FONT.mono : undefined,
                  }}>{k.v}</Text>
                  <Text style={{
                    fontSize: 12, color: theme.text.muted,
                    fontFamily: fontsLoaded ? FONT.arabic : undefined,
                  }}>{k.u}</Text>
                </View>
              </Card>
            ))}
          </View>

          <Card pad="lg">
            <SectionHead eyebrow="التوزيع" title="حسب نوع الاستخدام" />
            <View style={{ gap: SP[3] }}>
              {(Object.entries(data.byUse) as [BuildingUse, typeof data.byUse[string]][]).map(([k, v]) => {
                const pct = (v.cost / data.totalCost) * 100;
                return (
                  <View key={k}>
                    <View style={{
                      flexDirection: 'row-reverse', justifyContent: 'space-between',
                      marginBottom: 6,
                    }}>
                      <Text style={{
                        fontSize: 13, fontWeight: '600', color: theme.text.primary,
                        fontFamily: fontsLoaded ? FONT.arabic : undefined,
                      }}>{USE_LABELS[k] ?? k}</Text>
                      <View style={{ flexDirection: 'row-reverse', gap: 12 }}>
                        <Text style={{
                          fontSize: 12, color: theme.text.secondary,
                          fontFamily: fontsLoaded ? FONT.mono : undefined,
                        }}>{v.count} مشروع</Text>
                        <Text style={{ fontSize: 12, color: theme.text.muted }}>·</Text>
                        <Text style={{
                          fontSize: 12, color: theme.text.secondary,
                          fontFamily: fontsLoaded ? FONT.mono : undefined,
                        }}>{fmt(v.area)} م²</Text>
                        <Text style={{ fontSize: 12, color: theme.text.muted }}>·</Text>
                        <Text style={{
                          fontSize: 12, color: theme.gold.base, fontWeight: '600',
                          fontFamily: fontsLoaded ? FONT.mono : undefined,
                        }}>{pct.toFixed(1)}%</Text>
                      </View>
                    </View>
                    <View style={{
                      height: 8, backgroundColor: theme.bg.panel,
                      borderRadius: 4, overflow: 'hidden',
                      borderWidth: 1, borderColor: theme.border.soft,
                    }}>
                      <LinearGradient
                        colors={[theme.gold.bright, theme.gold.dim]}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                        style={{ height: '100%', width: `${pct}%` } as any}
                      />
                    </View>
                  </View>
                );
              })}
            </View>
          </Card>
        </>
      )}
    </ScrollView>
  );
}
