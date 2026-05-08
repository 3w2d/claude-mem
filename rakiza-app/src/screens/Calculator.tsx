import { useMemo, useState } from 'react';
import { ScrollView, View, Text, useWindowDimensions, Alert, Platform } from 'react-native';
import { useTheme } from '../components/ThemeProvider';
import { Card, Btn, Field, Input, Select, Slider, SectionHead } from '../components/primitives';
import { Building3D } from '../components/Building3D';
import { useStore } from '../store/projects';
import { safeCalculate } from '../lib/sbc';
import { fmt, fmtCompact } from '../lib/format';
import { FONT, SP, RADIUS } from '../theme';
import {
  DEFAULT_PARAMS, USE_LABELS, SEISMIC_LABELS,
  type ProjectParams, type ConcreteGrade, type SteelGrade, type SeismicZone, type BuildingUse,
} from '../types';

export function Calculator() {
  const { theme, fontsLoaded } = useTheme();
  const active = useStore(s => s.activeProject);
  const saveProject = useStore(s => s.saveProject);
  const setActiveProject = useStore(s => s.setActiveProject);
  const { width } = useWindowDimensions();
  const wide = width >= 1000;

  const [params, setParams] = useState<ProjectParams>(active?.params ?? DEFAULT_PARAMS);
  const [name, setName] = useState(active?.name ?? '');

  const results = useMemo(() => safeCalculate(params), [params]);
  const update = <K extends keyof ProjectParams>(k: K, v: ProjectParams[K]) =>
    setParams(p => ({ ...p, [k]: v }));

  const reset = () => setParams(DEFAULT_PARAMS);
  const save = () => {
    if (!name.trim()) {
      const msg = 'يرجى إدخال اسم للمشروع';
      Platform.OS === 'web' ? window.alert(msg) : Alert.alert('تنبيه', msg);
      return;
    }
    const saved = saveProject({
      id: active?.id,
      name: name.trim(),
      status: 'complete',
      date: new Date().toISOString(),
      params,
      results: results ?? undefined,
    });
    setActiveProject(saved);
  };

  return (
    <ScrollView
      contentContainerStyle={{ padding: wide ? SP[8] : SP[5], paddingBottom: 120 }}
      style={{ flex: 1, backgroundColor: theme.bg.base }}
    >
      <View style={{
        flexDirection: wide ? 'row-reverse' : 'column', gap: SP[4],
        alignItems: wide ? 'flex-start' : 'stretch',
        marginBottom: SP[6],
      }}>
        <View style={{ flex: 1 }}>
          <Text style={{
            fontSize: 11, color: theme.gold.base, letterSpacing: 1.5,
            textTransform: 'uppercase', marginBottom: 6,
            fontFamily: fontsLoaded ? FONT.mono : undefined,
          }}>الحاسبة الإنشائية · SBC 304</Text>
          <Text style={{
            fontSize: 28, fontWeight: '700', letterSpacing: -0.5,
            color: theme.text.primary, textAlign: 'right',
            fontFamily: fontsLoaded ? FONT.arabic : undefined,
          }}>تقدير الكميات والتكاليف</Text>
        </View>
        <View style={{ flexDirection: 'row-reverse', gap: SP[2], flexWrap: 'wrap' }}>
          <Btn variant="ghost" size="sm" onPress={reset}>↻  إعادة تعيين</Btn>
          <Btn size="sm" onPress={save}>💾  حفظ المشروع</Btn>
        </View>
      </View>

      <View style={{ flexDirection: wide ? 'row-reverse' : 'column', gap: SP[5] }}>
        {/* Inputs panel */}
        <Card pad="lg" style={{ width: wide ? 380 : '100%' as any }}>
          <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 8, marginBottom: SP[5] }}>
            <View style={{ width: 4, height: 16, backgroundColor: theme.gold.base, borderRadius: 2 }} />
            <Text style={{
              fontSize: 14, fontWeight: '700', color: theme.text.primary,
              fontFamily: fontsLoaded ? FONT.arabic : undefined,
            }}>المدخلات</Text>
          </View>

          <Field label="اسم المشروع" required>
            <Input value={name} onChangeText={setName} placeholder="مثال: فيلا — حي النرجس" />
          </Field>

          <Divider />

          <Eyebrow text="الأبعاد" />
          <View style={{ flexDirection: 'row-reverse', gap: SP[3] }}>
            <View style={{ flex: 1 }}>
              <Field label="الطول" hint="m">
                <Input
                  value={String(params.length)}
                  onChangeText={v => update('length', clamp(+v, 5, 100, 20))}
                  keyboardType="numeric"
                />
              </Field>
            </View>
            <View style={{ flex: 1 }}>
              <Field label="العرض" hint="m">
                <Input
                  value={String(params.width)}
                  onChangeText={v => update('width', clamp(+v, 5, 100, 15))}
                  keyboardType="numeric"
                />
              </Field>
            </View>
          </View>

          <View style={{ height: SP[3] }} />

          <Field label="عدد الأدوار" hint={`${params.floors} طوابق`}>
            <Slider value={params.floors} onChange={v => update('floors', v)} min={1} max={20} />
          </Field>

          <View style={{ height: SP[3] }} />

          <Field label="ارتفاع الدور" hint="m">
            <Slider value={params.storyHeight} onChange={v => update('storyHeight', v)}
              min={2.5} max={5} step={0.1} suffix="m" />
          </Field>

          <View style={{ height: SP[3] }} />

          <Field label="تباعد الأعمدة" hint="m">
            <Slider value={params.columnSpacing} onChange={v => update('columnSpacing', v)}
              min={3} max={10} step={0.5} suffix="m" />
          </Field>

          <Divider />
          <Eyebrow text="المواصفات" />

          <Field label="نوع الاستخدام">
            <Select<BuildingUse>
              value={params.buildingUse}
              onChange={v => update('buildingUse', v)}
              options={Object.entries(USE_LABELS).map(([value, label]) => ({ value: value as BuildingUse, label }))}
            />
          </Field>

          <View style={{ height: SP[3] }} />

          <View style={{ flexDirection: 'row-reverse', gap: SP[3] }}>
            <View style={{ flex: 1 }}>
              <Field label="درجة الخرسانة">
                <Select<ConcreteGrade>
                  value={params.concreteGrade}
                  onChange={v => update('concreteGrade', v)}
                  options={(['C25','C30','C35','C40','C45'] as ConcreteGrade[]).map(g => ({ value: g, label: g }))}
                />
              </Field>
            </View>
            <View style={{ flex: 1 }}>
              <Field label="درجة الحديد">
                <Select<SteelGrade>
                  value={params.steelGrade}
                  onChange={v => update('steelGrade', v)}
                  options={(['B400','B420','B500','B600'] as SteelGrade[]).map(g => ({ value: g, label: g }))}
                />
              </Field>
            </View>
          </View>

          <View style={{ height: SP[3] }} />

          <Field label="منطقة زلزالية">
            <Select<SeismicZone>
              value={params.seismicZone}
              onChange={v => update('seismicZone', v)}
              options={Object.entries(SEISMIC_LABELS).map(([value, label]) => ({ value: value as SeismicZone, label }))}
            />
          </Field>
        </Card>

        {/* Results */}
        <View style={{ flex: 1, gap: SP[4] }}>
          <Card pad="none" style={{ overflow: 'hidden' }}>
            <View style={{
              paddingHorizontal: SP[4], paddingVertical: 12,
              borderBottomWidth: 1, borderBottomColor: theme.border.soft,
              flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <Text style={{
                fontSize: 11, color: theme.gold.base, letterSpacing: 1.2,
                textTransform: 'uppercase',
                fontFamily: fontsLoaded ? FONT.mono : undefined,
              }}>عرض ثلاثي الأبعاد</Text>
              <Text style={{
                fontSize: 10, color: theme.text.muted,
                fontFamily: fontsLoaded ? FONT.mono : undefined,
              }}>{results?.colCount ?? 0} عمود · {fmt(results?.totalH ?? 0, 1)}m</Text>
            </View>
            <Building3D params={params} height={300} />
          </Card>

          {results && (
            <View style={{ flexDirection: 'row-reverse', flexWrap: 'wrap', gap: SP[3] }}>
              {[
                { l: 'المساحة', v: fmt(results.totalArea), u: 'م²' },
                { l: 'الخرسانة', v: fmt(results.totalConcrete, 1), u: 'م³' },
                { l: 'الحديد', v: fmt(results.totalSteel, 2), u: 'طن' },
                { l: 'التكلفة', v: fmtCompact(results.cost.total), u: 'ر.س' },
              ].map((k, i) => (
                <Card key={i} style={{ flex: 1, minWidth: 130 }}>
                  <Text style={{
                    fontSize: 11, color: theme.text.muted, letterSpacing: 0.6,
                    textTransform: 'uppercase', fontWeight: '600', marginBottom: 6,
                    fontFamily: fontsLoaded ? FONT.arabic : undefined,
                  }}>{k.l}</Text>
                  <View style={{ flexDirection: 'row-reverse', alignItems: 'baseline', gap: 4 }}>
                    <Text style={{
                      fontSize: 22, fontWeight: '700', color: theme.gold.base,
                      fontFamily: fontsLoaded ? FONT.mono : undefined,
                    }}>{k.v}</Text>
                    <Text style={{
                      fontSize: 11, color: theme.text.muted,
                      fontFamily: fontsLoaded ? FONT.mono : undefined,
                    }}>{k.u}</Text>
                  </View>
                </Card>
              ))}
            </View>
          )}

          {results && (
            <Card pad="lg">
              <SectionHead eyebrow="التفصيل" title="جدول الكميات" />
              <View style={{ flexDirection: wide ? 'row-reverse' : 'column', gap: SP[6] }}>
                <BoqTable
                  title="الخرسانة (م³)"
                  rows={[
                    ['البلاطات', results.slab.vol],
                    ['الأعمدة', results.columns.vol],
                    ['الكمرات', results.beams.vol],
                    ['الأساسات', results.foundation.vol],
                  ]}
                  total={results.totalConcrete}
                  decimals={1}
                />
                <BoqTable
                  title="الحديد (طن)"
                  rows={[
                    ['البلاطات', results.slab.steel / 1000],
                    ['الأعمدة', results.columns.steel / 1000],
                    ['الكمرات', results.beams.steel / 1000],
                    ['الأساسات', results.foundation.steel / 1000],
                  ]}
                  total={results.totalSteel}
                  decimals={2}
                />
              </View>

              <View style={{
                marginTop: SP[6], padding: SP[4],
                backgroundColor: theme.bg.panel,
                borderRadius: RADIUS.md, borderWidth: 1, borderColor: theme.border.soft,
              }}>
                <Text style={{
                  fontSize: 11, color: theme.gold.base, letterSpacing: 1.2,
                  textTransform: 'uppercase', marginBottom: SP[3],
                  fontFamily: fontsLoaded ? FONT.mono : undefined,
                }}>التكاليف التقديرية (ر.س)</Text>
                <View style={{ flexDirection: 'row-reverse', flexWrap: 'wrap' }}>
                  {[
                    ['الخرسانة', results.cost.concrete],
                    ['الحديد',  results.cost.steel],
                    ['القوالب', results.cost.formwork],
                    ['العمالة', results.cost.labor],
                    ['التشطيبات', results.cost.finish],
                    ['المصاريف العامة (18%)', results.cost.overhead],
                  ].map(([l, v]: any, i) => (
                    <View key={i} style={{
                      width: '33.33%', flexDirection: 'row-reverse', justifyContent: 'space-between',
                      paddingVertical: 6, paddingHorizontal: 4,
                      borderBottomWidth: 1, borderBottomColor: theme.border.soft, borderStyle: 'dashed',
                    }}>
                      <Text style={{
                        fontSize: 12, color: theme.text.secondary,
                        fontFamily: fontsLoaded ? FONT.arabic : undefined,
                      }}>{l}</Text>
                      <Text style={{
                        fontSize: 12, color: theme.text.primary, fontWeight: '600',
                        fontFamily: fontsLoaded ? FONT.mono : undefined,
                      }}>{fmt(Math.round(v))}</Text>
                    </View>
                  ))}
                </View>
                <View style={{
                  marginTop: SP[4], paddingTop: SP[4],
                  borderTopWidth: 2, borderTopColor: theme.border.gold,
                  flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'baseline',
                }}>
                  <Text style={{
                    fontSize: 13, fontWeight: '700', color: theme.gold.base,
                    fontFamily: fontsLoaded ? FONT.arabic : undefined,
                  }}>الإجمالي</Text>
                  <View style={{ flexDirection: 'row-reverse', alignItems: 'baseline', gap: 8 }}>
                    <Text style={{
                      fontSize: 13, color: theme.text.muted,
                      fontFamily: fontsLoaded ? FONT.mono : undefined,
                    }}>{fmt(Math.round(results.cost.perSqm))} ر.س/م²</Text>
                    <Text style={{
                      fontSize: 22, fontWeight: '700', color: theme.gold.base,
                      fontFamily: fontsLoaded ? FONT.mono : undefined,
                    }}>{fmt(Math.round(results.cost.total))}</Text>
                    <Text style={{
                      fontSize: 12, color: theme.text.muted,
                      fontFamily: fontsLoaded ? FONT.arabic : undefined,
                    }}>ر.س</Text>
                  </View>
                </View>
              </View>
            </Card>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

function clamp(v: number, lo: number, hi: number, fb: number): number {
  if (!Number.isFinite(v)) return fb;
  return Math.max(lo, Math.min(hi, v));
}

function Divider() {
  const { theme } = useTheme();
  return <View style={{ height: 1, backgroundColor: theme.border.soft, marginVertical: SP[5] }} />;
}

function Eyebrow({ text }: { text: string }) {
  const { theme, fontsLoaded } = useTheme();
  return (
    <Text style={{
      fontSize: 10, color: theme.text.muted, letterSpacing: 1.4,
      textTransform: 'uppercase', marginBottom: SP[3], textAlign: 'right',
      fontFamily: fontsLoaded ? FONT.mono : undefined,
    }}>{text}</Text>
  );
}

function BoqTable({
  title, rows, total, decimals,
}: { title: string; rows: [string, number][]; total: number; decimals: number }) {
  const { theme, fontsLoaded } = useTheme();
  return (
    <View style={{ flex: 1 }}>
      <Text style={{
        fontSize: 11, color: theme.gold.base, letterSpacing: 1.2,
        textTransform: 'uppercase', marginBottom: SP[3], textAlign: 'right',
        fontFamily: fontsLoaded ? FONT.mono : undefined,
      }}>{title}</Text>
      <View>
        {rows.map(([l, v], i) => (
          <View key={i} style={{
            flexDirection: 'row-reverse', justifyContent: 'space-between', paddingVertical: 10,
            borderBottomWidth: 1, borderBottomColor: theme.border.soft, borderStyle: 'dashed',
          }}>
            <Text style={{
              color: theme.text.secondary, fontSize: 13,
              fontFamily: fontsLoaded ? FONT.arabic : undefined,
            }}>{l}</Text>
            <Text style={{
              fontSize: 13, color: theme.text.primary, fontWeight: '600',
              fontFamily: fontsLoaded ? FONT.mono : undefined,
            }}>{fmt(v, decimals)}</Text>
          </View>
        ))}
        <View style={{
          flexDirection: 'row-reverse', justifyContent: 'space-between', paddingVertical: 12,
        }}>
          <Text style={{
            fontWeight: '700', color: theme.gold.base, fontSize: 13,
            fontFamily: fontsLoaded ? FONT.arabic : undefined,
          }}>المجموع</Text>
          <Text style={{
            fontWeight: '700', color: theme.gold.base, fontSize: 16,
            fontFamily: fontsLoaded ? FONT.mono : undefined,
          }}>{fmt(total, decimals)}</Text>
        </View>
      </View>
    </View>
  );
}
