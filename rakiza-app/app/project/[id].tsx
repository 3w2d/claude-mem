import { useEffect, useMemo } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/components/ThemeProvider';
import { RouteHeader } from '../../src/components/RouteHeader';
import { Card } from '../../src/components/primitives';
import { useStore } from '../../src/store/projects';
import { useNCRs, NCR_STATUS_LABEL, type NCRStatus, type NCRRecord } from '../../src/store/ncrs';
import { useChat, type Conversation } from '../../src/store/chat';
import { FONT, RADIUS, SP } from '../../src/theme';
import { fmt, fmtCompact } from '../../src/lib/format';
import { CATEGORIES } from '../../src/types';

export default function ProjectDetail() {
  const { theme, fontsLoaded } = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const project = useStore(s => s.projects.find(p => p.id === id));
  const setActive = useStore(s => s.setActiveProject);

  const hydrateNCRs = useNCRs(s => s.hydrate);
  const byProject = useNCRs(s => s.byProject);
  const hydrateChat = useChat(s => s.hydrate);
  const conversations = useChat(s => s.conversations);

  useEffect(() => {
    hydrateNCRs();
    hydrateChat();
  }, [hydrateNCRs, hydrateChat]);

  const ncrs = useMemo(() => (id ? byProject(id) : []), [id, byProject]);
  // No project link on Conversation; surface the 3 most recent overall as "related".
  const recentChats = useMemo(
    () => [...conversations].sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 5),
    [conversations]
  );

  if (!project) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.bg.base }}>
        <RouteHeader title="المشروع" />
        <View style={{ padding: SP[6], alignItems: 'center' }}>
          <Text style={{
            color: theme.text.muted,
            fontFamily: fontsLoaded ? FONT.arabic : undefined,
          }}>المشروع غير موجود.</Text>
        </View>
      </View>
    );
  }

  const cat = CATEGORIES[project.category];

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg.base }}>
      <RouteHeader title={project.name} />
      <ScrollView contentContainerStyle={{ padding: SP[5], paddingBottom: SP[16] }}>
        {/* Project summary */}
        <Card>
          <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: SP[3], marginBottom: SP[3] }}>
            <View style={[styles.emojiBox, { backgroundColor: theme.gold.soft, borderColor: theme.border.gold }]}>
              <Text style={{ fontSize: 22 }}>{project.emoji || cat.emoji}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{
                fontSize: 16, fontWeight: '700', color: theme.text.primary, textAlign: 'right',
                fontFamily: fontsLoaded ? FONT.arabic : undefined,
              }}>{cat.label}</Text>
              <Text style={{
                fontSize: 11, color: theme.text.muted, marginTop: 2, textAlign: 'right',
                fontFamily: fontsLoaded ? FONT.mono : undefined,
              }}>{project.params.length}×{project.params.width}m · {project.params.floors} أدوار · {project.params.buildingUse}</Text>
            </View>
          </View>
          {project.results && (
            <View style={{ flexDirection: 'row-reverse', gap: SP[3] }}>
              <Mini label="المساحة" value={`${fmt(project.results.totalArea)} م²`} />
              <Mini label="الخرسانة" value={`${fmt(project.results.totalConcrete, 1)} م³`} />
              <Mini label="التكلفة" value={`${fmtCompact(project.results.cost.total)} ر.س`} accent />
            </View>
          )}
          <View style={{ flexDirection: 'row-reverse', gap: SP[2], marginTop: SP[4] }}>
            <Pressable
              onPress={() => { setActive(project); router.push('/calculator'); }}
              style={({ pressed }) => [
                styles.btnGhost,
                { borderColor: theme.border.soft, opacity: pressed ? 0.6 : 1 },
              ]}
            >
              <Ionicons name="calculator" size={14} color={theme.text.primary} />
              <Text style={{
                fontSize: 12, color: theme.text.primary, fontWeight: '600',
                fontFamily: fontsLoaded ? FONT.arabic : undefined,
              }}>الحاسبة</Text>
            </Pressable>
            <Pressable
              onPress={() => { setActive(project); router.push('/editor'); }}
              style={({ pressed }) => [
                styles.btnGhost,
                { borderColor: theme.border.soft, opacity: pressed ? 0.6 : 1 },
              ]}
            >
              <Ionicons name="grid" size={14} color={theme.text.primary} />
              <Text style={{
                fontSize: 12, color: theme.text.primary, fontWeight: '600',
                fontFamily: fontsLoaded ? FONT.arabic : undefined,
              }}>المحرّر</Text>
            </Pressable>
          </View>
        </Card>

        {/* NCRs */}
        <SectionTitle text={`تقارير NCR · ${ncrs.length}`} />
        {ncrs.length === 0 ? (
          <Card style={{ alignItems: 'center', padding: SP[5] }}>
            <Text style={{
              color: theme.text.muted, fontSize: 13,
              fontFamily: fontsLoaded ? FONT.arabic : undefined,
            }}>لا توجد تقارير لهذا المشروع.</Text>
          </Card>
        ) : (
          <View style={{ gap: SP[2] }}>
            {ncrs.map(n => <NCRCard key={n.id} ncr={n} />)}
          </View>
        )}
        <Pressable
          onPress={() => router.push('/ncr')}
          style={({ pressed }) => [
            styles.addNCR,
            { borderColor: theme.border.gold, opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <Ionicons name="add-circle" size={18} color={theme.gold.base} />
          <Text style={{
            fontSize: 13, color: theme.gold.base, fontWeight: '600',
            fontFamily: fontsLoaded ? FONT.arabic : undefined,
          }}>إنشاء تقرير NCR جديد</Text>
        </Pressable>

        {/* Chats */}
        <SectionTitle text="المحادثات السابقة" />
        {recentChats.length === 0 ? (
          <Card style={{ alignItems: 'center', padding: SP[5] }}>
            <Text style={{
              color: theme.text.muted, fontSize: 13,
              fontFamily: fontsLoaded ? FONT.arabic : undefined,
            }}>لا توجد محادثات بعد.</Text>
          </Card>
        ) : (
          <View style={{ gap: SP[2] }}>
            {recentChats.map(c => <ChatCard key={c.id} c={c} onPress={() => router.push('/ai')} />)}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function SectionTitle({ text }: { text: string }) {
  const { theme, fontsLoaded } = useTheme();
  return (
    <Text style={{
      fontSize: 11, letterSpacing: 1.2, textTransform: 'uppercase',
      color: theme.gold.base,
      marginTop: SP[6], marginBottom: SP[3], textAlign: 'right',
      fontFamily: fontsLoaded ? FONT.mono : undefined,
    }}>{text}</Text>
  );
}

function Mini({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  const { theme, fontsLoaded } = useTheme();
  return (
    <View style={{ flex: 1 }}>
      <Text style={{
        fontSize: 10, color: theme.text.muted, letterSpacing: 0.8, textTransform: 'uppercase',
        fontFamily: fontsLoaded ? FONT.arabic : undefined,
      }}>{label}</Text>
      <Text style={{
        fontSize: 13, fontWeight: '700', marginTop: 2,
        color: accent ? theme.gold.base : theme.text.primary,
        fontFamily: fontsLoaded ? FONT.mono : undefined,
      }}>{value}</Text>
    </View>
  );
}

function NCRCard({ ncr }: { ncr: NCRRecord }) {
  const { theme, fontsLoaded } = useTheme();
  const palette = statusPalette(ncr.status, theme);
  return (
    <View style={[styles.ncr, { backgroundColor: theme.bg.card, borderColor: theme.border.soft }]}>
      <View style={{ flex: 1 }}>
        <Text style={{
          fontSize: 14, fontWeight: '700', color: theme.text.primary, textAlign: 'right',
          fontFamily: fontsLoaded ? FONT.arabic : undefined,
        }} numberOfLines={1}>{ncr.title}</Text>
        <View style={{ flexDirection: 'row-reverse', gap: 8, alignItems: 'center', marginTop: 4 }}>
          <Text style={{
            fontSize: 11, color: theme.text.muted,
            fontFamily: fontsLoaded ? FONT.mono : undefined,
          }}>{ncr.number}</Text>
          <Text style={{ fontSize: 11, color: theme.text.muted }}>·</Text>
          <Text style={{
            fontSize: 11, color: theme.text.muted,
            fontFamily: fontsLoaded ? FONT.mono : undefined,
          }}>{ncr.date}</Text>
        </View>
      </View>
      <View style={[styles.statusPill, { backgroundColor: palette.bg, borderColor: palette.border }]}>
        <View style={[styles.statusDot, { backgroundColor: palette.dot }]} />
        <Text style={{
          fontSize: 11, fontWeight: '700', color: palette.fg,
          fontFamily: fontsLoaded ? FONT.arabic : undefined,
        }}>{NCR_STATUS_LABEL[ncr.status]}</Text>
      </View>
    </View>
  );
}

function statusPalette(s: NCRStatus, theme: any) {
  if (s === 'approved') return {
    bg: theme.success + '1A', border: theme.success + '4D', fg: theme.success, dot: theme.success,
  };
  if (s === 'review') return {
    bg: theme.warn + '1F', border: theme.warn + '55', fg: theme.warn, dot: theme.warn,
  };
  return {
    bg: theme.danger + '1A', border: theme.danger + '4D', fg: theme.danger, dot: theme.danger,
  };
}

function ChatCard({ c, onPress }: { c: Conversation; onPress: () => void }) {
  const { theme, fontsLoaded } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chatCard,
        {
          backgroundColor: theme.bg.card,
          borderColor: pressed ? theme.gold.base : theme.border.soft,
        },
      ]}
    >
      <Ionicons name="chatbubble-ellipses" size={20} color={theme.gold.base} />
      <View style={{ flex: 1 }}>
        <Text style={{
          fontSize: 13, fontWeight: '700', color: theme.text.primary, textAlign: 'right',
          fontFamily: fontsLoaded ? FONT.arabic : undefined,
        }} numberOfLines={1}>{c.title}</Text>
        <Text style={{
          fontSize: 11, color: theme.text.muted, marginTop: 2, textAlign: 'right',
          fontFamily: fontsLoaded ? FONT.mono : undefined,
        }}>{c.messages.length} رسالة · {c.totalIn + c.totalOut} tok</Text>
      </View>
      <Ionicons name="chevron-back" size={16} color={theme.text.muted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  emojiBox: { width: 44, height: 44, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  btnGhost: {
    flexDirection: 'row-reverse', alignItems: 'center', gap: 6,
    paddingHorizontal: SP[3], paddingVertical: 8,
    borderRadius: RADIUS.md, borderWidth: 1,
  },
  ncr: {
    flexDirection: 'row-reverse', alignItems: 'center', gap: SP[3],
    padding: SP[3], borderRadius: RADIUS.lg, borderWidth: 1,
  },
  statusPill: {
    flexDirection: 'row-reverse', alignItems: 'center', gap: 5,
    paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: RADIUS.pill, borderWidth: 1,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  addNCR: {
    marginTop: SP[3],
    flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: SP[3], borderRadius: RADIUS.md, borderWidth: 1, borderStyle: 'dashed',
  },
  chatCard: {
    flexDirection: 'row-reverse', alignItems: 'center', gap: SP[3],
    padding: SP[3], borderRadius: RADIUS.lg, borderWidth: 1,
  },
});
