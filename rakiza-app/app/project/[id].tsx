import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View, Pressable, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStore } from '../../src/store/projects';
import { theme } from '../../src/theme';
import { Card } from '../../src/components/Card';
import { CompleteToggle } from '../../src/components/CompleteToggle';
import { StreakRing } from '../../src/components/StreakRing';
import { DrawingCanvas, type DrawTool } from '../../src/components/DrawingCanvas';
import { computeBoq, fmtSAR } from '../../src/lib/boq';
import { isLoggedToday, streakFor } from '../../src/lib/streak';

const TOOLS: { key: DrawTool; icon: string; label: string }[] = [
  { key: 'select', icon: '↖', label: 'تحديد' },
  { key: 'wall', icon: '│', label: 'جدار' },
  { key: 'column', icon: '■', label: 'عمود' },
  { key: 'door', icon: '🚪', label: 'باب' },
  { key: 'window', icon: '🪟', label: 'شباك' },
  { key: 'eraser', icon: '⌫', label: 'مسح' },
];

export default function ProjectDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const project = useStore(s => s.projects.find(p => p.id === id));
  const logs = useStore(s => s.logs);
  const pricing = useStore(s => s.settings.pricing);
  const addWall = useStore(s => s.addWall);
  const addColumn = useStore(s => s.addColumn);
  const addOpening = useStore(s => s.addOpening);
  const removeElement = useStore(s => s.removeElement);
  const addFloor = useStore(s => s.addFloor);
  const deleteFloor = useStore(s => s.deleteFloor);
  const log = useStore(s => s.logWork);
  const unlog = useStore(s => s.unlogToday);
  const archive = useStore(s => s.archiveProject);

  const [floorIdx, setFloorIdx] = useState(0);
  const [tool, setTool] = useState<DrawTool>('wall');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (!project) return (
    <View style={styles.root}><Text style={{ padding: 30, color: theme.text.muted, textAlign: 'center' }}>المشروع غير موجود</Text></View>
  );

  const floor = project.floors[floorIdx] ?? project.floors[0];
  const stats = streakFor(project, logs);
  const done = isLoggedToday(logs, project.id);
  const boq = computeBoq(project, pricing);

  return (
    <View style={styles.root}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 140 }}>
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.back}>
              <Text style={styles.backText}>← العودة</Text>
            </Pressable>
            <Pressable onPress={() => {
              if (Platform.OS === 'web') { if (confirm('أرشفة المشروع؟')) { archive(project.id); router.back(); } }
              else Alert.alert('أرشفة', 'أرشفة المشروع؟', [
                { text: 'إلغاء', style: 'cancel' },
                { text: 'أرشفة', onPress: () => { archive(project.id); router.back(); } },
              ]);
            }}>
              <Text style={[styles.backText, { color: theme.text.muted }]}>أرشفة</Text>
            </Pressable>
          </View>

          <View style={styles.titleRow}>
            <Text style={[styles.emoji, { backgroundColor: project.color + '15', borderColor: project.color + '40' }]}>{project.emoji}</Text>
            <View style={{ flex: 1, marginInlineStart: 12 }}>
              <Text style={styles.title}>{project.name}</Text>
              <Text style={styles.sub}>{project.floors.length} {project.floors.length === 1 ? 'دور' : 'أدوار'} · 🔥 {stats.current} يوم</Text>
            </View>
            <CompleteToggle done={done} color={project.color} onToggle={() => done ? unlog(project.id) : log(project.id)} />
          </View>

          <Card style={styles.boqCard}>
            <View style={styles.boqRow}>
              <BoqStat label="خرسانة" value={`${boq.totalConcrete.toFixed(1)} م³`} />
              <BoqStat label="حديد" value={`${boq.steel.toFixed(2)} طن`} />
              <BoqStat label="أعمدة" value={`${boq.colCount}`} />
            </View>
            <View style={styles.boqRow}>
              <BoqStat label="جدران (صافي)" value={`${boq.wallNet.toFixed(0)} م²`} />
              <BoqStat label="أبواب" value={`${boq.doorCount}`} />
              <BoqStat label="شبابيك" value={`${boq.windowCount}`} />
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>إجمالي تكلفة العظم + التشطيب</Text>
              <Text style={[styles.totalValue, { color: project.color }]}>{fmtSAR(boq.cost)} <Text style={{ fontSize: 12 }}>SAR</Text></Text>
            </View>
            <View style={styles.streakRow}>
              <StreakRing stats={stats} rate={stats.rate7} size={56} projectColor={project.color} />
              <View style={{ flex: 1, marginInlineStart: 12 }}>
                <Text style={styles.streakText}>{Math.round(stats.rate30 * 100)}٪ خلال آخر ٣٠ يوم</Text>
                <View style={styles.bar}>
                  <View style={[styles.barFill, { width: `${stats.rate30 * 100}%`, backgroundColor: project.color }]} />
                </View>
                <Text style={styles.streakSub}>أطول ستريك: {stats.longest} يوم · إجمالي الجلسات: {stats.totalSessions}</Text>
              </View>
            </View>
          </Card>

          <View style={styles.floorTabs}>
            {project.floors.map((f, i) => (
              <Pressable key={f.id} onPress={() => setFloorIdx(i)}
                style={[styles.floorTab, i === floorIdx && { backgroundColor: project.color, borderColor: project.color }]}>
                <Text style={[styles.floorTabText, i === floorIdx && { color: '#fff' }]}>{f.name}</Text>
              </Pressable>
            ))}
            <Pressable style={styles.floorAdd} onPress={() => addFloor(project.id)}>
              <Text style={{ color: theme.accent.blue, fontSize: 20, fontWeight: '700' }}>+</Text>
            </Pressable>
          </View>

          <View style={{ height: 360, marginBottom: 12 }}>
            <DrawingCanvas
              floor={floor}
              tool={tool}
              selectedId={selectedId}
              onSelect={setSelectedId}
              onAddWall={(w) => addWall(project.id, floorIdx, w)}
              onAddColumn={(c) => addColumn(project.id, floorIdx, c)}
              onAddOpening={(kind, o) => addOpening(project.id, floorIdx, kind, { wallId: o.wallId!, t: o.t!, width: o.width })}
              onDeleteAt={(x, y) => {
                const hit = nearestId(floor, x, y);
                if (hit) removeElement(project.id, floorIdx, hit);
              }}
            />
          </View>

          <View style={styles.toolbar}>
            {TOOLS.map(t => (
              <Pressable key={t.key} onPress={() => setTool(t.key)}
                style={[styles.toolBtn, tool === t.key && { backgroundColor: project.color, borderColor: project.color }]}>
                <Text style={[styles.toolIcon, tool === t.key && { color: '#fff' }]}>{t.icon}</Text>
                <Text style={[styles.toolLabel, tool === t.key && { color: '#fff' }]}>{t.label}</Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function BoqStat({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flex: 1 }}>
      <Text style={styles.bLabel}>{label}</Text>
      <Text style={styles.bValue}>{value}</Text>
    </View>
  );
}

function nearestId(floor: { walls: any[]; columns: any[] }, x: number, y: number): string | null {
  for (const c of floor.columns) {
    if (Math.abs(c.x - x) < c.size && Math.abs(c.y - y) < c.size) return c.id;
  }
  for (const w of floor.walls) {
    const dx = w.x2 - w.x1, dy = w.y2 - w.y1;
    const l = dx*dx + dy*dy; if (l === 0) continue;
    const t = ((x - w.x1) * dx + (y - w.y1) * dy) / l;
    if (t < 0 || t > 1) continue;
    const px = w.x1 + dx * t, py = w.y1 + dy * t;
    if (Math.hypot(px - x, py - y) < 0.4) return w.id;
  }
  return null;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.bg.base },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  back: { paddingVertical: 6, paddingHorizontal: 8 },
  backText: { color: theme.accent.blue, fontSize: 15 },
  titleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  emoji: { fontSize: 28, width: 56, height: 56, borderRadius: 14, textAlign: 'center', textAlignVertical: 'center', borderWidth: 1, lineHeight: 56 },
  title: { color: theme.text.primary, fontSize: 20, fontWeight: '800' },
  sub: { color: theme.text.muted, fontSize: 12, marginTop: 4 },
  boqCard: { marginBottom: 14 },
  boqRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  bLabel: { color: theme.text.muted, fontSize: 11 },
  bValue: { color: theme.text.primary, fontSize: 15, fontWeight: '700', marginTop: 2 },
  totalRow: { borderTopWidth: 1, borderTopColor: theme.border.light, paddingTop: 12, marginTop: 4, alignItems: 'center' },
  totalLabel: { color: theme.text.muted, fontSize: 12 },
  totalValue: { fontSize: 26, fontWeight: '900', marginTop: 4 },
  streakRow: { flexDirection: 'row', alignItems: 'center', marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: theme.border.light },
  streakText: { color: theme.text.primary, fontSize: 13, fontWeight: '600' },
  bar: { height: 6, marginTop: 6, backgroundColor: theme.border.light, borderRadius: 3, overflow: 'hidden' },
  barFill: { height: '100%' },
  streakSub: { color: theme.text.muted, fontSize: 11, marginTop: 6 },
  floorTabs: { flexDirection: 'row', gap: 6, marginBottom: 12 },
  floorTab: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: theme.border.light, backgroundColor: theme.bg.surface },
  floorTabText: { color: theme.text.secondary, fontSize: 12, fontWeight: '600' },
  floorAdd: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderStyle: 'dashed', borderColor: theme.border.blue },
  toolbar: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  toolBtn: { flex: 1, minWidth: 80, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: theme.border.light, backgroundColor: theme.bg.surface, alignItems: 'center' },
  toolIcon: { color: theme.accent.blue, fontSize: 18, fontWeight: '700' },
  toolLabel: { color: theme.text.secondary, fontSize: 11, marginTop: 2 },
});
