import { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../components/ThemeProvider';
import { Btn, Card, Field, SectionHead } from '../components/primitives';
import { EditorCanvas, type DrawTool } from '../components/EditorCanvas';
import { useStore } from '../store/projects';
import { FONT, RADIUS, SP } from '../theme';

const TOOLS: { id: DrawTool; icon: string; label: string }[] = [
  { id: 'select',  icon: '↖', label: 'تحديد' },
  { id: 'wall',    icon: '│', label: 'جدار' },
  { id: 'column',  icon: '■', label: 'عمود' },
  { id: 'door',    icon: '🚪', label: 'باب' },
  { id: 'window',  icon: '🪟', label: 'شباك' },
  { id: 'eraser',  icon: '⌫', label: 'مسح' },
];

export function Editor() {
  const { theme, fontsLoaded } = useTheme();
  const projects = useStore(s => s.projects);
  const activeProject = useStore(s => s.activeProject);
  const setActive = useStore(s => s.setActiveProject);
  const ensureGeometry = useStore(s => s.ensureGeometry);
  const addFloor = useStore(s => s.addFloor);
  const removeFloor = useStore(s => s.removeFloor);
  const addWall = useStore(s => s.addWall);
  const addColumn = useStore(s => s.addColumn);
  const addOpening = useStore(s => s.addOpening);
  const deleteElement = useStore(s => s.deleteElement);
  const router = useRouter();

  const { width } = useWindowDimensions();
  const wide = width >= 900;

  const [tool, setTool] = useState<DrawTool>('wall');
  const [floorIdx, setFloorIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);

  const project = activeProject ? projects.find(p => p.id === activeProject.id) : null;

  useEffect(() => {
    if (project && (!project.geometry || !project.geometry.length)) {
      ensureGeometry(project.id);
    }
  }, [project?.id, project?.geometry, ensureGeometry]);

  if (!project) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.bg.base, padding: SP[5] }}>
        <Card pad="lg" style={{ alignItems: 'center', paddingVertical: SP[12] }}>
          <Text style={{ fontSize: 32, color: theme.text.muted, marginBottom: SP[3] }}>📐</Text>
          <Text style={{
            fontSize: 16, color: theme.text.primary, fontWeight: '700', marginBottom: SP[2],
            fontFamily: fontsLoaded ? FONT.arabic : undefined,
          }}>اختر مشروعاً للبدء</Text>
          <Text style={{
            fontSize: 13, color: theme.text.secondary, textAlign: 'center',
            maxWidth: 400, marginBottom: SP[5], lineHeight: 21,
            fontFamily: fontsLoaded ? FONT.arabic : undefined,
          }}>
            ادخل من لوحة التحكم أو "مشاريعي" واختر المشروع الذي تريد رسم مخططه.
          </Text>
          <View style={{ flexDirection: 'row-reverse', gap: SP[2] }}>
            <Btn onPress={() => router.push('/projects')}>كل المشاريع</Btn>
            <Btn variant="secondary" onPress={() => router.push('/calculator')}>إنشاء مشروع جديد</Btn>
          </View>
        </Card>
      </View>
    );
  }

  const currentFloor = project.geometry?.[floorIdx];

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg.base }}>
      <ScrollView contentContainerStyle={{ padding: wide ? SP[6] : SP[4], paddingBottom: 120 }}>
        <View style={{
          flexDirection: wide ? 'row-reverse' : 'column',
          alignItems: wide ? 'flex-end' : 'stretch',
          justifyContent: 'space-between', gap: SP[3], marginBottom: SP[5],
        }}>
          <View>
            <Text style={{
              fontSize: 11, color: theme.gold.base, letterSpacing: 1.5,
              textTransform: 'uppercase', marginBottom: 6,
              fontFamily: fontsLoaded ? FONT.mono : undefined,
            }}>المحرّر</Text>
            <Text style={{
              fontSize: 24, fontWeight: '700', color: theme.text.primary, textAlign: 'right',
              fontFamily: fontsLoaded ? FONT.arabic : undefined,
            }}>{project.name}</Text>
          </View>
          <View style={{ flexDirection: 'row-reverse', gap: SP[2], flexWrap: 'wrap' }}>
            <Btn variant="ghost" size="sm" onPress={() => router.push('/calculator')}>← الحاسبة</Btn>
            <Btn size="sm" onPress={() => setActive(project)}>محفوظ ✓</Btn>
          </View>
        </View>

        {/* Floor tabs */}
        <View style={{ flexDirection: 'row-reverse', gap: 6, marginBottom: SP[3], flexWrap: 'wrap' }}>
          {(project.geometry ?? []).map((f, i) => {
            const active = i === floorIdx;
            return (
              <Pressable key={i} onPress={() => { setFloorIdx(i); setSelected(null); }}
                style={{
                  paddingHorizontal: SP[3], paddingVertical: SP[2],
                  borderRadius: RADIUS.md,
                  backgroundColor: active ? theme.gold.soft : theme.bg.card,
                  borderWidth: 1, borderColor: active ? theme.gold.base : theme.border.soft,
                }}>
                <Text style={{
                  fontSize: 12, fontWeight: active ? '600' : '500',
                  color: active ? theme.gold.base : theme.text.secondary,
                  fontFamily: fontsLoaded ? FONT.arabic : undefined,
                }}>{f.name}</Text>
              </Pressable>
            );
          })}
          <Pressable onPress={() => addFloor(project.id, floorIdx)}
            style={{
              paddingHorizontal: SP[3], paddingVertical: SP[2],
              borderRadius: RADIUS.md,
              borderWidth: 1, borderColor: theme.border.gold, borderStyle: 'dashed',
              backgroundColor: 'transparent',
            }}>
            <Text style={{ fontSize: 14, color: theme.gold.base }}>+</Text>
          </Pressable>
          {(project.geometry?.length ?? 0) > 1 && (
            <Pressable onPress={() => {
              removeFloor(project.id, floorIdx);
              setFloorIdx(Math.max(0, floorIdx - 1));
            }}
              style={{
                paddingHorizontal: SP[3], paddingVertical: SP[2],
                borderRadius: RADIUS.md, borderWidth: 1, borderColor: theme.danger, borderStyle: 'dashed',
              }}>
              <Text style={{ fontSize: 12, color: theme.danger }}>حذف الدور</Text>
            </Pressable>
          )}
        </View>

        {/* Tool palette */}
        <View style={{
          flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 6, marginBottom: SP[3],
        }}>
          {TOOLS.map(t => {
            const active = tool === t.id;
            return (
              <Pressable key={t.id} onPress={() => setTool(t.id)}
                style={{
                  flex: 1, minWidth: 80,
                  paddingVertical: SP[3],
                  borderRadius: RADIUS.md,
                  backgroundColor: active ? theme.gold.base : theme.bg.card,
                  borderWidth: 1, borderColor: active ? theme.gold.bright : theme.border.soft,
                  alignItems: 'center', gap: 4,
                }}>
                <Text style={{ fontSize: 18, color: active ? theme.text.inverse : theme.gold.base, fontWeight: '700' }}>{t.icon}</Text>
                <Text style={{
                  fontSize: 11,
                  color: active ? theme.text.inverse : theme.text.secondary,
                  fontFamily: fontsLoaded ? FONT.arabic : undefined,
                }}>{t.label}</Text>
              </Pressable>
            );
          })}
        </View>

        <View style={{ height: wide ? 480 : 380, marginBottom: SP[3] }}>
          {currentFloor && (
            <EditorCanvas
              floor={currentFloor}
              tool={tool}
              selectedId={selected}
              onAddWall={(w) => addWall(project.id, floorIdx, w)}
              onAddColumn={(c) => addColumn(project.id, floorIdx, c)}
              onAddOpening={(kind, o) => addOpening(project.id, floorIdx, kind, o)}
              onDeleteAt={(id) => deleteElement(project.id, floorIdx, id)}
              onSelect={setSelected}
            />
          )}
        </View>

        <Card>
          <Text style={{
            fontSize: 11, color: theme.gold.base, letterSpacing: 1.2,
            textTransform: 'uppercase', marginBottom: SP[2],
            fontFamily: fontsLoaded ? FONT.mono : undefined,
          }}>دليل سريع</Text>
          <Text style={{
            fontSize: 13, color: theme.text.secondary, lineHeight: 22, textAlign: 'right',
            fontFamily: fontsLoaded ? FONT.arabic : undefined,
          }}>
            • اختر أداة <Text style={{ color: theme.gold.base }}>جدار</Text>، انقر نقطتين متتاليتين لرسم جدار، يستمر تسلسل الجدران تلقائياً.{'\n'}
            • أداة <Text style={{ color: theme.gold.base }}>عمود</Text> ترسم عموداً عند نقطة النقر بحجم 30×30 سم.{'\n'}
            • أداة <Text style={{ color: theme.gold.base }}>باب/شباك</Text> تتطلّب النقر فوق جدار قائم.{'\n'}
            • <Text style={{ color: theme.gold.base }}>الإحداثيات</Text> تُحاذى تلقائياً على شبكة 0.25 م.{'\n'}
            • أزرار <Text style={{ color: theme.gold.base }}>+ حذف الدور</Text> فوق الكانفاس لإدارة طبقات المشروع.
          </Text>
        </Card>
      </ScrollView>
    </View>
  );
}
