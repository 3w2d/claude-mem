import { ScrollView, View, Text, Platform, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../components/ThemeProvider';
import { Btn, Card, Badge, BlueprintGrid, SectionHead } from '../components/primitives';
import { RukizaLogo } from '../components/RukizaLogo';
import { Building3D } from '../components/Building3D';
import { useStore } from '../store/projects';
import { calculate } from '../lib/sbc';
import { fmt, fmtCompact } from '../lib/format';
import { FONT, SP, RADIUS } from '../theme';

const FEATURES = [
  { icon: '⚡', title: 'حسابات فورية', desc: 'نتائج دقيقة وفق SBC 304 في أقل من ٣ ثوانٍ' },
  { icon: '⊞', title: 'تصور ثلاثي الأبعاد', desc: 'معاينة تفاعلية لهيكل المبنى في الزمن الحقيقي' },
  { icon: '◈', title: 'تقدير التكاليف', desc: 'جداول كميات وأسعار سوقية مفصّلة' },
  { icon: '⌥', title: 'مقارنة التصاميم', desc: 'قارن سيناريوهات إنشائية متعددة' },
];

const PREVIEW_PARAMS = {
  length: 24, width: 16, floors: 4, storyHeight: 3.2, columnSpacing: 5,
  buildingUse: 'residential' as const, concreteGrade: 'C30' as const, steelGrade: 'B420' as const,
  slabType: 'solid' as const, seismicZone: 'low' as const, windSpeed: 40,
};

export function Landing() {
  const { theme, fontsLoaded } = useTheme();
  const setPage = useStore(s => s.setPage);
  const { width } = useWindowDimensions();
  const wide = width >= 880;
  const previewResults = calculate(PREVIEW_PARAMS);

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg.base }}>
      <LinearGradient
        colors={[theme.bg.base, theme.bg.elevated, theme.bg.base]}
        start={{ x: 1, y: 0 }} end={{ x: 0, y: 1 }}
        style={{ position: 'absolute', inset: 0 } as any}
      />
      <View style={{
        position: 'absolute', top: -120, right: -100,
        width: 360, height: 360, borderRadius: 999,
        backgroundColor: theme.gold.glow, opacity: 0.6,
      }} />
      <View style={{
        position: 'absolute', bottom: -160, left: -120,
        width: 360, height: 360, borderRadius: 999,
        backgroundColor: theme.blueprintSoft, opacity: 0.5,
      }} />
      <BlueprintGrid size={40} opacity={0.18} />

      <ScrollView contentContainerStyle={{ paddingBottom: SP[20] }}>
        {/* Top nav */}
        <View style={{
          flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center',
          paddingHorizontal: wide ? SP[10] : SP[5], paddingVertical: SP[5],
          borderBottomWidth: 1, borderBottomColor: theme.border.soft,
        }}>
          <RukizaLogo size={36} />
          {wide ? (
            <View style={{ flexDirection: 'row-reverse', gap: SP[3], alignItems: 'center' }}>
              <Badge color="gold">Beta · v1.0</Badge>
              <Btn variant="ghost" size="sm">تسجيل الدخول</Btn>
              <Btn size="sm" onPress={() => setPage('dashboard')}>ابدأ مجاناً</Btn>
            </View>
          ) : (
            <Btn size="sm" onPress={() => setPage('dashboard')}>ادخل</Btn>
          )}
        </View>

        {/* Hero */}
        <View style={{
          paddingHorizontal: wide ? SP[10] : SP[5],
          paddingVertical: wide ? SP[20] : SP[10],
          flexDirection: wide ? 'row-reverse' : 'column',
          gap: wide ? SP[16] : SP[8],
          alignItems: wide ? 'center' : 'stretch',
          maxWidth: 1200, alignSelf: 'center', width: '100%',
        }}>
          {/* Copy */}
          <View style={{ flex: wide ? 1.1 : 1 }}>
            <View style={{
              flexDirection: 'row-reverse', alignItems: 'center', gap: 8,
              paddingHorizontal: 14, paddingVertical: 6, borderRadius: 100,
              backgroundColor: theme.gold.soft, borderColor: theme.border.gold, borderWidth: 1,
              alignSelf: 'flex-start', marginBottom: SP[6],
            }}>
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: theme.gold.base }} />
              <Text style={{
                fontSize: 11, color: theme.gold.base, fontWeight: '600',
                fontFamily: fontsLoaded ? FONT.mono : undefined,
              }}>أول مساعد هندسي وفق SBC 304</Text>
            </View>

            <Text style={{
              fontSize: wide ? 56 : 38, fontWeight: '800', lineHeight: wide ? 60 : 44,
              color: theme.text.primary, letterSpacing: -1.2, marginBottom: SP[3],
              fontFamily: fontsLoaded ? FONT.arabic : undefined, textAlign: 'right',
            }}>المستقبل الرقمي</Text>
            <Text style={{
              fontSize: wide ? 56 : 38, fontWeight: '800', lineHeight: wide ? 60 : 44,
              color: theme.gold.bright, letterSpacing: -1.2, marginBottom: SP[6],
              fontFamily: fontsLoaded ? FONT.arabic : undefined, textAlign: 'right',
            }}>للهندسة الإنشائية</Text>

            <Text style={{
              fontSize: 16, color: theme.text.secondary, lineHeight: 27,
              maxWidth: 520, marginBottom: SP[8], textAlign: 'right',
              fontFamily: fontsLoaded ? FONT.arabic : undefined,
            }}>حوّل أبعاد مبناك إلى تقدير إنشائي كامل — كميات الخرسانة، الحديد، والتكاليف — في ثوانٍ معدودة. مع معاينة ثلاثية الأبعاد تفاعلية وجداول قابلة للتصدير.</Text>

            <View style={{ flexDirection: 'row-reverse', gap: SP[3], flexWrap: 'wrap', marginBottom: SP[10] }}>
              <Btn size="lg" onPress={() => setPage('dashboard')}>احسب مشروعك الآن  ←</Btn>
              <Btn variant="secondary" size="lg">شاهد العرض التوضيحي</Btn>
            </View>

            <View style={{
              flexDirection: 'row-reverse', flexWrap: 'wrap', gap: SP[5],
              paddingTop: SP[5],
              borderTopWidth: 1, borderTopColor: theme.border.soft, borderStyle: 'dashed',
            }}>
              {[
                { v: 'SBC 304', l: 'الكود المعتمد' },
                { v: '< 3s',    l: 'وقت الحساب' },
                { v: '±5%',     l: 'دقة التقدير' },
                { v: '∞',       l: 'مشاريع محفوظة' },
              ].map((s, i) => (
                <View key={i} style={{ minWidth: 100 }}>
                  <Text style={{
                    fontSize: 22, fontWeight: '700', color: theme.gold.base, letterSpacing: -0.4,
                    fontFamily: fontsLoaded ? FONT.mono : undefined,
                  }}>{s.v}</Text>
                  <Text style={{
                    fontSize: 11, color: theme.text.muted, marginTop: 4, letterSpacing: 0.8,
                    textTransform: 'uppercase',
                    fontFamily: fontsLoaded ? FONT.arabic : undefined,
                  }}>{s.l}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* 3D preview window */}
          <View style={{ flex: 1 }}>
            <View style={{
              borderRadius: RADIUS.xl, overflow: 'hidden',
              borderWidth: 1, borderColor: theme.border.gold,
              backgroundColor: theme.bg.elevated,
              ...(Platform.OS === 'ios'
                ? { shadowColor: theme.gold.base, shadowOpacity: 0.3, shadowRadius: 24, shadowOffset: { width: 0, height: 12 } }
                : { elevation: 8 }),
            }}>
              <View style={{
                paddingHorizontal: 14, paddingVertical: 10,
                flexDirection: 'row-reverse', alignItems: 'center', gap: 12,
                backgroundColor: theme.bg.card,
                borderBottomWidth: 1, borderBottomColor: theme.border.soft,
              }}>
                <View style={{ flexDirection: 'row-reverse', gap: 6 }}>
                  {['#ff5f57', '#febc2e', '#28c840'].map(c =>
                    <View key={c} style={{ width: 11, height: 11, borderRadius: 6, backgroundColor: c }} />
                  )}
                </View>
                <Text style={{
                  fontSize: 11, color: theme.text.muted, marginLeft: 'auto' as any,
                  fontFamily: fontsLoaded ? FONT.mono : undefined,
                }}>rukiza.app/preview</Text>
                <Badge color="green" size="sm">● LIVE</Badge>
              </View>
              <Building3D params={PREVIEW_PARAMS} height={300} />
              <View style={{
                flexDirection: 'row-reverse',
                borderTopWidth: 1, borderTopColor: theme.border.soft,
                backgroundColor: theme.bg.card,
              }}>
                {[
                  ['الخرسانة', `${fmt(previewResults.totalConcrete)}`, 'م³'],
                  ['الحديد', `${fmt(previewResults.totalSteel, 1)}`, 'طن'],
                  ['التكلفة', `${fmtCompact(previewResults.cost.total)}`, 'ر.س'],
                ].map(([l, v, u], i) => (
                  <View key={i} style={{
                    flex: 1, padding: SP[4], alignItems: 'center',
                    borderLeftWidth: i < 2 ? 1 : 0, borderLeftColor: theme.border.soft,
                  }}>
                    <Text style={{
                      fontSize: 10.5, color: theme.text.muted, letterSpacing: 0.8,
                      textTransform: 'uppercase', marginBottom: 4,
                      fontFamily: fontsLoaded ? FONT.arabic : undefined,
                    }}>{l}</Text>
                    <View style={{ flexDirection: 'row-reverse', alignItems: 'baseline', gap: 4 }}>
                      <Text style={{
                        fontSize: 18, fontWeight: '700', color: theme.gold.base,
                        fontFamily: fontsLoaded ? FONT.mono : undefined,
                      }}>{v}</Text>
                      <Text style={{
                        fontSize: 11, color: theme.text.muted,
                        fontFamily: fontsLoaded ? FONT.mono : undefined,
                      }}>{u}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
            <Text style={{
              marginTop: 12, fontSize: 11, color: theme.text.muted, textAlign: 'center',
              fontFamily: fontsLoaded ? FONT.mono : undefined,
            }}>↻ معاينة هندسية مباشرة</Text>
          </View>
        </View>

        {/* Features */}
        <View style={{
          paddingHorizontal: wide ? SP[10] : SP[5],
          paddingVertical: SP[16],
          maxWidth: 1200, alignSelf: 'center', width: '100%',
        }}>
          <SectionHead eyebrow="القدرات" title="كل ما يحتاجه المهندس في مكان واحد" />
          <View style={{
            flexDirection: 'row-reverse', flexWrap: 'wrap', gap: SP[4],
          }}>
            {FEATURES.map((f, i) => (
              <Card key={i} hover style={{
                width: wide ? `${100 / 4 - 1}%` : '100%',
                minWidth: 200,
              }}>
                <View style={{
                  width: 44, height: 44, borderRadius: RADIUS.md,
                  backgroundColor: theme.gold.soft,
                  borderColor: theme.border.gold, borderWidth: 1,
                  alignItems: 'center', justifyContent: 'center',
                  marginBottom: SP[4],
                }}>
                  <Text style={{ fontSize: 20, color: theme.gold.base }}>{f.icon}</Text>
                </View>
                <Text style={{
                  fontSize: 15, fontWeight: '700', marginBottom: 6,
                  color: theme.text.primary, textAlign: 'right',
                  fontFamily: fontsLoaded ? FONT.arabic : undefined,
                }}>{f.title}</Text>
                <Text style={{
                  fontSize: 13, color: theme.text.secondary, lineHeight: 21,
                  textAlign: 'right',
                  fontFamily: fontsLoaded ? FONT.arabic : undefined,
                }}>{f.desc}</Text>
              </Card>
            ))}
          </View>
        </View>

        {/* CTA */}
        <View style={{
          paddingHorizontal: SP[10],
          maxWidth: 800, alignSelf: 'center', width: '100%',
        }}>
          <Card pad="lg" style={{
            backgroundColor: theme.bg.card,
            borderColor: theme.border.gold, borderWidth: 1,
            paddingVertical: SP[12], alignItems: 'center', position: 'relative',
            overflow: 'hidden',
          }}>
            <BlueprintGrid size={40} opacity={0.15} />
            <Text style={{
              fontSize: 11, color: theme.gold.base, letterSpacing: 1.5,
              textTransform: 'uppercase', marginBottom: SP[3],
              fontFamily: fontsLoaded ? FONT.mono : undefined,
            }}>ابدأ الآن · مجاناً</Text>
            <Text style={{
              fontSize: 28, fontWeight: '700', letterSpacing: -0.6,
              color: theme.text.primary, textAlign: 'center', marginBottom: SP[3],
              fontFamily: fontsLoaded ? FONT.arabic : undefined,
            }}>أول تقدير في أقل من دقيقة</Text>
            <Text style={{
              fontSize: 14, color: theme.text.secondary, textAlign: 'center',
              maxWidth: 460, marginBottom: SP[6], lineHeight: 24,
              fontFamily: fontsLoaded ? FONT.arabic : undefined,
            }}>لا حاجة لبطاقة ائتمان. مشاريعك محفوظة محلياً على جهازك. تصدير JSON ومخططات تفصيلية.</Text>
            <Btn size="lg" onPress={() => setPage('dashboard')} style={{ minWidth: 240 }}>ادخل إلى ركيزة  ←</Btn>
          </Card>

          <Text style={{
            marginTop: SP[8], fontSize: 12, color: theme.text.muted,
            textAlign: 'center', maxWidth: 600, alignSelf: 'center', lineHeight: 20,
            fontFamily: fontsLoaded ? FONT.arabic : undefined,
          }}>
            ⚠️ <Text style={{ color: theme.warn, fontWeight: '600' }}>تنبيه هندسي:</Text> ركيزة مخصصة للتقدير الأولي. التصميم الإنشائي الفعلي يستوجب إشراف مهندس مدني مرخص واستخدام برامج معتمدة (ETABS / SAFE / Robot).
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
