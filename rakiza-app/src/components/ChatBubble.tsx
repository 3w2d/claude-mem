import { View, Text, Image, StyleSheet } from 'react-native';
import { useTheme } from './ThemeProvider';
import { FONT, RADIUS, SP } from '../theme';
import type { ChatMessage } from '../lib/chat';

export function ChatBubble({ m, streaming }: { m: ChatMessage; streaming?: boolean }) {
  const { theme, fontsLoaded } = useTheme();
  const user = m.role === 'user';

  return (
    <View style={{
      alignSelf: user ? 'flex-start' : 'flex-end',
      maxWidth: '88%',
      marginBottom: SP[3],
    }}>
      <View style={{
        flexDirection: 'row-reverse', alignItems: 'center', gap: 6, marginBottom: 4,
      }}>
        <Text style={{
          fontSize: 10, color: theme.text.muted, letterSpacing: 0.6,
          textTransform: 'uppercase',
          fontFamily: fontsLoaded ? FONT.mono : undefined,
        }}>{user ? 'أنت' : 'AI'}</Text>
        {!!m.tokensOut && (
          <Text style={{
            fontSize: 10, color: theme.text.muted,
            fontFamily: fontsLoaded ? FONT.mono : undefined,
          }}>{m.tokensIn ?? 0} → {m.tokensOut} tok</Text>
        )}
      </View>

      {/* Image parts above text */}
      {m.parts?.filter(p => p.kind === 'image').map((p: any, i) => (
        <Image
          key={i}
          source={{ uri: `data:${p.mime};base64,${p.base64}` }}
          style={{
            width: 220, height: 165,
            borderRadius: RADIUS.md,
            marginBottom: 6,
            borderWidth: 1, borderColor: theme.border.soft,
          }}
        />
      ))}

      <View style={{
        paddingHorizontal: SP[4], paddingVertical: SP[3],
        borderRadius: RADIUS.lg,
        borderBottomLeftRadius: user ? RADIUS.lg : RADIUS.xs,
        borderBottomRightRadius: user ? RADIUS.xs : RADIUS.lg,
        backgroundColor: user ? theme.gold.soft : theme.bg.card,
        borderWidth: 1,
        borderColor: user ? theme.border.gold : theme.border.soft,
      }}>
        {m.error ? (
          <Text style={{
            color: theme.danger, fontSize: 13.5, lineHeight: 22,
            fontFamily: fontsLoaded ? FONT.arabic : undefined,
          }}>⚠ {m.error}</Text>
        ) : (
          <Text style={{
            color: user ? theme.text.primary : theme.text.primary,
            fontSize: 14, lineHeight: 24,
            fontFamily: fontsLoaded ? FONT.arabic : undefined,
            textAlign: 'right',
          } as any} selectable>
            {m.content}
            {streaming ? <Text style={{ color: theme.gold.base }}> ▌</Text> : null}
          </Text>
        )}
      </View>
    </View>
  );
}
