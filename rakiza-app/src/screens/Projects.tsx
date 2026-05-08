import { useMemo, useState } from 'react';
import { ScrollView, View, Text, Pressable, useWindowDimensions, Alert, Platform } from 'react-native';
import { useTheme } from '../components/ThemeProvider';
import { Card, Btn, Badge, Input } from '../components/primitives';
import { Building3D } from '../components/Building3D';
import { useStore } from '../store/projects';
import { fmt, fmtCompact } from '../lib/format';
import { FONT, SP, RADIUS } from '../theme';
import { USE_LABELS } from '../types';

export function Projects() {
  const { theme, fontsLoaded } = useTheme();
  const projects = useStore(s => s.projects);
  const setPage = useStore(s => s.setPage);
  const setActive = useStore(s => s.setActiveProject);
  const del = useStore(s => s.deleteProject);
  const { width } = useWindowDimensions();
  const wide = width >= 880;

  const [q, setQ] = useState('');
  const filtered = useMemo(
    () => projects.filter(p => p.name.toLowerCase().includes(q.toLowerCase())),
    [projects, q]
  );

  const goNew = () => { setActive(null); setPage('calculator'); };
  const open = (p: any) => { setActive(p); setPage('calculator'); };

  const onDelete = (p: any) => {
    const msg = `هل تريد حذف "${p.name}"؟`;
    if (Platform.OS === 'web') {
      if (window.confirm(msg)) del(p.id);
    } else {
      Alert.alert('تأكيد الحذف', msg, [
        { text: 'إلغاء', style: 'cancel' },
        { text: 'حذف', style: 'destructive', onPress: () => del(p.id) },
      ]);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={{ padding: wide ? SP[8] : SP[5], paddingBottom: 120 }}
      style={{ flex: 1, backgroundColor: theme.bg.base }}
    >
      <View style={{
        flexDirection: 'row-reverse', justifyContent: 'space-between',
        alignItems: 'flex-end', gap: SP[4], marginBottom: SP[5],
      }}>
        <View>
          <Text style={{
            fontSize: 11, color: theme.gold.base, letterSpacing: 1.5,
            textTransform: 'uppercase', marginBottom: 6,
            fontFamily: fontsLoaded ? FONT.mono : undefined,
          }}>الأرشيف</Text>
          <Text style={{
            fontSize: 28, fontWeight: '700', letterSpacing: -0.5,
            color: theme.text.primary, textAlign: 'right',
            fontFamily: fontsLoaded ? FONT.arabic : undefined,
          }}>
            مشاريعي{' '}
            <Text style={{
              fontSize: 18, color: theme.text.muted, fontWeight: '500',
              fontFamily: fontsLoaded ? FONT.mono : undefined,
            }}>({projects.length})</Text>
          </Text>
        </View>
        <Btn onPress={goNew}>+  مشروع جديد</Btn>
      </View>

      <View style={{ marginBottom: SP[5] }}>
        <Input value={q} onChangeText={setQ} placeholder="🔍 ابحث في المشاريع..." />
      </View>

      {filtered.length ? (
        <View style={{ flexDirection: 'row-reverse', flexWrap: 'wrap', gap: SP[4] }}>
          {filtered.map(p => (
            <Pressable
              key={p.id}
              onPress={() => open(p)}
              style={{ width: wide ? `${100 / 3 - 1}%` : '100%' as any, minWidth: 280 }}
            >
              <Card hover pad="none" style={{ overflow: 'hidden' }}>
                <View style={{ position: 'relative', aspectRatio: 16 / 10 }}>
                  <Building3D params={p.params} height={200} showOverlay={false} />
                  <View style={{ position: 'absolute', top: 8, right: 8 }}>
                    <Badge color={p.status === 'complete' ? 'green' : 'neutral'} size="sm">
                      {p.status === 'complete' ? '✓ مكتمل' : 'مسودة'}
                    </Badge>
                  </View>
                </View>
                <View style={{ padding: SP[4] }}>
                  <View style={{
                    flexDirection: 'row-reverse', justifyContent: 'space-between',
                    alignItems: 'flex-start', gap: 8, marginBottom: SP[2],
                  }}>
                    <Text style={{
                      flex: 1, fontSize: 14, fontWeight: '700',
                      color: theme.text.primary, textAlign: 'right',
                      fontFamily: fontsLoaded ? FONT.arabic : undefined,
                    }}>{p.name}</Text>
                    <Pressable
                      onPress={(e) => { e.stopPropagation?.(); onDelete(p); }}
                      hitSlop={8}
                    >
                      <Text style={{ fontSize: 18, color: theme.text.muted }}>×</Text>
                    </Pressable>
                  </View>
                  <Text style={{
                    fontSize: 11, color: theme.text.muted, marginBottom: SP[3], textAlign: 'right',
                    fontFamily: fontsLoaded ? FONT.mono : undefined,
                  }}>
                    {p.params.length}×{p.params.width}m · {p.params.floors} أدوار · {USE_LABELS[p.params.buildingUse]}
                  </Text>
                  {p.results && (
                    <View style={{
                      flexDirection: 'row-reverse', gap: SP[2],
                      paddingTop: SP[3], borderTopWidth: 1,
                      borderTopColor: theme.border.soft, borderStyle: 'dashed',
                    }}>
                      <View style={{ flex: 1 }}>
                        <Text style={{
                          fontSize: 10, color: theme.text.muted,
                          letterSpacing: 0.6, textTransform: 'uppercase',
                          fontFamily: fontsLoaded ? FONT.arabic : undefined, textAlign: 'right',
                        }}>المساحة</Text>
                        <Text style={{
                          fontSize: 14, fontWeight: '600', color: theme.text.primary,
                          fontFamily: fontsLoaded ? FONT.mono : undefined,
                        }}>{fmt(p.results.totalArea)} <Text style={{ fontSize: 10, color: theme.text.muted }}>م²</Text></Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{
                          fontSize: 10, color: theme.text.muted,
                          letterSpacing: 0.6, textTransform: 'uppercase',
                          fontFamily: fontsLoaded ? FONT.arabic : undefined, textAlign: 'right',
                        }}>التكلفة</Text>
                        <Text style={{
                          fontSize: 14, fontWeight: '600', color: theme.gold.base,
                          fontFamily: fontsLoaded ? FONT.mono : undefined,
                        }}>{fmtCompact(p.results.cost.total)}</Text>
                      </View>
                    </View>
                  )}
                </View>
              </Card>
            </Pressable>
          ))}
        </View>
      ) : (
        <Card pad="lg" style={{ alignItems: 'center', paddingVertical: SP[16] }}>
          <Text style={{ fontSize: 48, color: theme.text.muted, marginBottom: SP[4] }}>◯</Text>
          <Text style={{
            fontSize: 18, fontWeight: '600', color: theme.text.primary, marginBottom: SP[2],
            fontFamily: fontsLoaded ? FONT.arabic : undefined,
          }}>{q ? 'لم يتم العثور على نتائج' : 'لا توجد مشاريع بعد'}</Text>
          <Text style={{
            color: theme.text.secondary, marginBottom: SP[5], textAlign: 'center',
            fontFamily: fontsLoaded ? FONT.arabic : undefined,
          }}>{q ? 'جرّب كلمات بحث مختلفة.' : 'أنشئ مشروعك الأول للبدء.'}</Text>
          {!q && <Btn onPress={goNew}>إنشاء مشروع جديد</Btn>}
        </Card>
      )}
    </ScrollView>
  );
}
