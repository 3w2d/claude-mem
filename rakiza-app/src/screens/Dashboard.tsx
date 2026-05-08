import { useMemo } from 'react';
import { ScrollView, View, Text, Pressable, useWindowDimensions } from 'react-native';
import { useTheme } from '../components/ThemeProvider';
import { Card, Btn, Badge, SectionHead } from '../components/primitives';
import { Building3D } from '../components/Building3D';
import { useStore, type Page } from '../store/projects';
import { fmt, fmtCompact, fmtCurrency } from '../lib/format';
import { FONT, SP, RADIUS } from '../theme';
import { USE_LABELS } from '../types';

export function Dashboard() {
  const { theme, fontsLoaded } = useTheme();
  const projects = useStore(s => s.projects);
  const setPage = useStore(s => s.setPage);
  const setActiveProject = useStore(s => s.setActiveProject);
  const { width } = useWindowDimensions();
  const wide = width >= 880;

  const totals = useMemo(() => {
    if (!projects.length) return null;
    return projects.reduce((acc, p) => {
      if (!p.results) return acc;
      acc.concrete += p.results.totalConcrete;
      acc.steel    += p.results.totalSteel;
      acc.area     += p.results.totalArea;
      acc.cost     += p.results.cost.total;
      return acc;
    }, { concrete: 0, steel: 0, area: 0, cost: 0 });
  }, [projects]);

  const latest = projects[0];

  const goNew = () => { setActiveProject(null); setPage('calculator'); };
  const open = (p: any) => { setActiveProject(p); setPage('calculator'); };

  const kpis = totals ? [
    { l: 'إجمالي المشاريع', v: fmt(projects.length), u: 'مشروع', icon: '🗂' },
    { l: 'إجمالي المساحة',  v: fmt(totals.area),    u: 'م²',    icon: '◰' },
    { l: 'إجمالي الخرسانة', v: fmt(totals.concrete), u: 'م³',   icon: '◧' },
    { l: 'إجمالي التكلفة',  v: fmtCompact(totals.cost), u: 'ر.س', icon: '◆' },
  ] : [];

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
        }}>أهلاً بك</Text>
        <Text style={{
          fontSize: 30, fontWeight: '700', letterSpacing: -0.5,
          color: theme.text.primary, marginBottom: SP[2],
          fontFamily: fontsLoaded ? FONT.arabic : undefined, textAlign: 'right',
        }}>لوحة التحكم</Text>
        <Text style={{
          fontSize: 14, color: theme.text.secondary,
          fontFamily: fontsLoaded ? FONT.arabic : undefined, textAlign: 'right',
        }}>نظرة شاملة على مشاريعك الإنشائية ومجموع الكميات.</Text>
      </View>

      {totals && (
        <View style={{
          flexDirection: 'row-reverse', flexWrap: 'wrap', gap: SP[4],
          marginBottom: SP[8],
        }}>
          {kpis.map((k, i) => (
            <Card key={i} style={{ flex: 1, minWidth: 160 }}>
              <View style={{
                flexDirection: 'row-reverse', justifyContent: 'space-between',
                alignItems: 'flex-start', marginBottom: SP[3],
              }}>
                <Text style={{
                  fontSize: 11, color: theme.text.muted,
                  textTransform: 'uppercase', letterSpacing: 0.8, fontWeight: '600',
                  fontFamily: fontsLoaded ? FONT.arabic : undefined,
                }}>{k.l}</Text>
                <Text style={{ fontSize: 16, color: theme.gold.dim }}>{k.icon}</Text>
              </View>
              <View style={{ flexDirection: 'row-reverse', alignItems: 'baseline', gap: 6 }}>
                <Text style={{
                  fontSize: 26, fontWeight: '700', color: theme.gold.base, letterSpacing: -0.4,
                  fontFamily: fontsLoaded ? FONT.mono : undefined,
                }}>{k.v}</Text>
                <Text style={{
                  fontSize: 12, color: theme.text.muted,
                  fontFamily: fontsLoaded ? FONT.mono : undefined,
                }}>{k.u}</Text>
              </View>
            </Card>
          ))}
        </View>
      )}

      <View style={{
        flexDirection: wide ? 'row-reverse' : 'column', gap: SP[5],
        marginBottom: SP[8],
      }}>
        <Card pad="lg" style={{ flex: wide ? 2 : 1 }}>
          <SectionHead
            eyebrow="آخر مشروع"
            title={latest?.name || 'لا توجد مشاريع بعد'}
            action={latest && <Btn variant="secondary" size="sm" onPress={() => open(latest)}>فتح المشروع  ←</Btn>}
          />
          {latest?.results ? (
            <View style={{ flexDirection: wide ? 'row-reverse' : 'column', gap: SP[4] }}>
              <View style={{ flex: 1, borderRadius: RADIUS.md, overflow: 'hidden', borderWidth: 1, borderColor: theme.border.soft }}>
                <Building3D params={latest.params} height={240} showOverlay />
              </View>
              <View style={{ flex: 1, gap: SP[3] }}>
                <KvRow label="المساحة الإجمالية" value={fmt(latest.results.totalArea)} unit="م²" />
                <KvRow label="الخرسانة"           value={fmt(latest.results.totalConcrete, 1)} unit="م³" />
                <KvRow label="الحديد"             value={fmt(latest.results.totalSteel, 2)} unit="طن" />
                <KvRow label="التكلفة الإجمالية"  value={fmt(Math.round(latest.results.cost.total))} unit="ر.س" />
              </View>
            </View>
          ) : (
            <View style={{ paddingVertical: SP[12], alignItems: 'center' }}>
              <Text style={{ fontSize: 32, color: theme.text.muted, marginBottom: SP[3] }}>◯</Text>
              <Text style={{
                color: theme.text.muted, marginBottom: SP[4],
                fontFamily: fontsLoaded ? FONT.arabic : undefined,
              }}>ابدأ بإنشاء مشروعك الأول لرؤية البيانات هنا.</Text>
              <Btn onPress={goNew}>إنشاء مشروع جديد</Btn>
            </View>
          )}
        </Card>

        <Card pad="lg" style={{ flex: 1 }}>
          <Text style={{
            fontSize: 16, fontWeight: '700', marginBottom: SP[4],
            color: theme.text.primary, textAlign: 'right',
            fontFamily: fontsLoaded ? FONT.arabic : undefined,
          }}>إجراءات سريعة</Text>
          <View style={{ gap: SP[2] }}>
            <Btn variant="secondary" onPress={goNew}>+   مشروع جديد</Btn>
            <Btn variant="secondary" onPress={() => setPage('projects')}>كل المشاريع   ({projects.length})</Btn>
            <Btn variant="secondary" onPress={() => setPage('reports')}>التقارير   📊</Btn>
          </View>

          <View style={{
            marginTop: SP[6], padding: SP[4],
            backgroundColor: theme.bg.panel,
            borderRadius: RADIUS.md, borderWidth: 1, borderColor: theme.border.soft,
          }}>
            <Text style={{
              fontSize: 10, color: theme.gold.base, letterSpacing: 1.5,
              textTransform: 'uppercase', marginBottom: 6,
              fontFamily: fontsLoaded ? FONT.mono : undefined,
            }}>المرجع الكودي</Text>
            <Text style={{
              fontSize: 12, color: theme.text.secondary, lineHeight: 22,
              fontFamily: fontsLoaded ? FONT.mono : undefined,
            }}>
              SBC 304 · 2018{'\n'}
              ACI 318-19{'\n'}
              SBC 301 (الأحمال)
            </Text>
          </View>
        </Card>
      </View>

      <Card pad="lg">
        <SectionHead
          eyebrow="السجل"
          title={`آخر ${Math.min(projects.length, 5)} مشاريع`}
          action={<Btn variant="ghost" size="sm" onPress={() => setPage('projects')}>عرض الكل  ←</Btn>}
        />
        {projects.length ? (
          <View style={{ gap: SP[2] }}>
            {projects.slice(0, 5).map(p => (
              <Pressable key={p.id} onPress={() => open(p)}
                style={({ pressed, hovered }: any) => ({
                  flexDirection: 'row-reverse', alignItems: 'center',
                  paddingHorizontal: SP[4], paddingVertical: SP[3],
                  borderRadius: RADIUS.md,
                  borderWidth: 1,
                  borderColor: hovered ? theme.border.gold : theme.border.soft,
                  backgroundColor: pressed ? theme.bg.elevated : 'transparent',
                  gap: SP[4],
                })}>
                <View style={{ flex: 1 }}>
                  <Text style={{
                    fontSize: 14, fontWeight: '600', color: theme.text.primary, textAlign: 'right',
                    fontFamily: fontsLoaded ? FONT.arabic : undefined,
                  }}>{p.name}</Text>
                  <Text style={{
                    fontSize: 11, color: theme.text.muted, marginTop: 2, textAlign: 'right',
                    fontFamily: fontsLoaded ? FONT.mono : undefined,
                  }}>{p.params.length}×{p.params.width}×{p.params.floors} · {USE_LABELS[p.params.buildingUse]}</Text>
                </View>
                <Text style={{
                  minWidth: 70, fontSize: 12, color: theme.text.secondary, textAlign: 'left',
                  fontFamily: fontsLoaded ? FONT.mono : undefined,
                }}>{p.results ? `${fmt(p.results.totalArea)} م²` : '—'}</Text>
                <Text style={{
                  minWidth: 90, fontSize: 12, color: theme.gold.base, textAlign: 'left',
                  fontFamily: fontsLoaded ? FONT.mono : undefined,
                }}>{p.results ? fmtCurrency(p.results.cost.total) : '—'}</Text>
                <Badge color={p.status === 'complete' ? 'green' : 'neutral'} size="sm">
                  {p.status === 'complete' ? '✓ مكتمل' : 'مسودّة'}
                </Badge>
                <Text style={{ color: theme.text.muted }}>←</Text>
              </Pressable>
            ))}
          </View>
        ) : (
          <Text style={{
            textAlign: 'center', color: theme.text.muted, paddingVertical: SP[10],
            fontFamily: fontsLoaded ? FONT.arabic : undefined,
          }}>لم يتم إنشاء مشاريع بعد.</Text>
        )}
      </Card>
    </ScrollView>
  );
}

function KvRow({ label, value, unit }: { label: string; value: string; unit?: string }) {
  const { theme, fontsLoaded } = useTheme();
  return (
    <View style={{ gap: 4 }}>
      <Text style={{
        fontSize: 11, color: theme.text.muted, letterSpacing: 1, textTransform: 'uppercase',
        fontFamily: fontsLoaded ? FONT.arabic : undefined, textAlign: 'right',
      }}>{label}</Text>
      <View style={{ flexDirection: 'row-reverse', alignItems: 'baseline', gap: 4 }}>
        <Text style={{
          fontSize: 22, fontWeight: '700', color: theme.gold.base,
          fontFamily: fontsLoaded ? FONT.mono : undefined,
        }}>{value}</Text>
        {unit && <Text style={{
          fontSize: 12, color: theme.text.muted,
          fontFamily: fontsLoaded ? FONT.mono : undefined,
        }}>{unit}</Text>}
      </View>
    </View>
  );
}
