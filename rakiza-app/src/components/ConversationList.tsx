import { View, Text, Pressable, ScrollView } from 'react-native';
import { useTheme } from './ThemeProvider';
import { FONT, RADIUS, SP } from '../theme';
import { useChat } from '../store/chat';
import { Btn } from './primitives';

export function ConversationList({ onClose }: { onClose?: () => void }) {
  const { theme, fontsLoaded } = useTheme();
  const conversations = useChat(s => s.conversations);
  const activeId = useChat(s => s.activeId);
  const setActive = useChat(s => s.setActive);
  const newConvo = useChat(s => s.newConversation);
  const del = useChat(s => s.deleteConversation);

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg.panel }}>
      <View style={{
        padding: SP[3],
        borderBottomWidth: 1, borderBottomColor: theme.border.soft,
      }}>
        <Btn onPress={() => { newConvo(); onClose?.(); }}>+  محادثة جديدة</Btn>
      </View>

      <ScrollView contentContainerStyle={{ padding: SP[2], gap: 4 }}>
        {conversations.length === 0 ? (
          <Text style={{
            textAlign: 'center', color: theme.text.muted,
            paddingVertical: SP[8],
            fontFamily: fontsLoaded ? FONT.arabic : undefined,
          }}>لا توجد محادثات بعد</Text>
        ) : null}

        {conversations.map(c => {
          const active = c.id === activeId;
          return (
            <Pressable
              key={c.id}
              onPress={() => { setActive(c.id); onClose?.(); }}
              style={({ pressed }) => ({
                paddingHorizontal: SP[3], paddingVertical: SP[3],
                borderRadius: RADIUS.md,
                backgroundColor: active ? theme.gold.soft : (pressed ? theme.bg.elevated : 'transparent'),
                borderWidth: 1,
                borderColor: active ? theme.border.gold : 'transparent',
                gap: 4,
              })}
            >
              <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 6 }}>
                <Text style={{
                  flex: 1, fontSize: 13, fontWeight: '600',
                  color: active ? theme.gold.base : theme.text.primary,
                  textAlign: 'right',
                  fontFamily: fontsLoaded ? FONT.arabic : undefined,
                }} numberOfLines={1}>{c.title}</Text>
                <Pressable
                  hitSlop={6}
                  onPress={(e) => { e.stopPropagation?.(); del(c.id); }}
                >
                  <Text style={{ fontSize: 14, color: theme.text.muted }}>×</Text>
                </Pressable>
              </View>
              <Text style={{
                fontSize: 11, color: theme.text.muted, textAlign: 'right',
                fontFamily: fontsLoaded ? FONT.mono : undefined,
              }}>
                {c.messages.length} رسالة · {c.totalIn + c.totalOut} tok
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
