import { ScrollView, View, Text, StyleSheet, useColorScheme, TextInput, Pressable, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/components/ThemeProvider';
import { Card } from '../../src/components/primitives';
import { FONT, RADIUS, SP } from '../../src/theme';
import { useChat } from '../../src/store/chat';
import { PROVIDERS, type ProviderId } from '../../src/lib/providers';

export default function Settings() {
  const { theme, fontsLoaded } = useTheme();
  const scheme = useColorScheme();
  const apiKeys = useChat(s => s.apiKeys);
  const setApiKey = useChat(s => s.setApiKey);
  const conversations = useChat(s => s.conversations);

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: theme.bg.base }}>
      <ScrollView contentContainerStyle={{ padding: SP[5], paddingBottom: SP[10] }}>
        <Text style={[styles.h1, { color: theme.text.primary, fontFamily: fontsLoaded ? FONT.arabic : undefined }]}>
          الإعدادات
        </Text>

        <Text style={[styles.section, { color: theme.gold.base, fontFamily: fontsLoaded ? FONT.mono : undefined }]}>
          المظهر
        </Text>
        <Card>
          <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: SP[3] }}>
            <Ionicons name={scheme === 'light' ? 'sunny' : 'moon'} size={22} color={theme.gold.base} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.kvLabel, { color: theme.text.primary, fontFamily: fontsLoaded ? FONT.arabic : undefined }]}>
                {scheme === 'light' ? 'الوضع الفاتح' : 'الوضع الداكن'}
              </Text>
              <Text style={[styles.kvHint, { color: theme.text.muted, fontFamily: fontsLoaded ? FONT.arabic : undefined }]}>
                يتبع إعدادات نظام جهازك تلقائياً
              </Text>
            </View>
          </View>
        </Card>

        <Text style={[styles.section, { color: theme.gold.base, fontFamily: fontsLoaded ? FONT.mono : undefined }]}>
          مفاتيح AI
        </Text>
        {(Object.keys(PROVIDERS) as ProviderId[]).map(pid => {
          const p = PROVIDERS[pid];
          return (
            <Card key={pid} style={{ marginBottom: SP[3] }}>
              <View style={{ flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <Text style={[styles.kvLabel, { color: theme.text.primary, fontFamily: fontsLoaded ? FONT.arabic : undefined }]}>
                  {p.label}
                </Text>
                <Pressable onPress={() => Linking.openURL(p.signupUrl).catch(() => {})}>
                  <Text style={[styles.link, { color: theme.gold.base, fontFamily: fontsLoaded ? FONT.arabic : undefined }]}>
                    احصل على مفتاح ←
                  </Text>
                </Pressable>
              </View>
              <TextInput
                value={apiKeys[pid]}
                onChangeText={v => setApiKey(pid, v.trim())}
                placeholder={p.apiKeyPlaceholder}
                placeholderTextColor={theme.text.muted}
                autoCapitalize="none"
                autoCorrect={false}
                secureTextEntry
                style={{
                  padding: 10, fontSize: 12,
                  backgroundColor: theme.bg.input,
                  borderColor: theme.border.soft, borderWidth: 1,
                  borderRadius: RADIUS.md, color: theme.text.primary,
                  fontFamily: fontsLoaded ? FONT.mono : undefined,
                  textAlign: 'left',
                }}
              />
            </Card>
          );
        })}

        <Text style={[styles.section, { color: theme.gold.base, fontFamily: fontsLoaded ? FONT.mono : undefined }]}>
          عن التطبيق
        </Text>
        <Card>
          <View style={{ gap: 6 }}>
            <KV theme={theme} label="الإصدار" value="0.3.0" />
            <KV theme={theme} label="الكود المعتمد" value="SBC 304 · ACI 318" />
            <KV theme={theme} label="عدد المحادثات" value={String(conversations.length)} />
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

function KV({ label, value, theme }: { label: string; value: string; theme: any }) {
  return (
    <View style={{ flexDirection: 'row-reverse', justifyContent: 'space-between' }}>
      <Text style={{ fontSize: 13, color: theme.text.secondary }}>{label}</Text>
      <Text style={{ fontSize: 13, color: theme.text.primary, fontWeight: '600' }}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  h1: { fontSize: 26, fontWeight: '800', letterSpacing: -0.4, textAlign: 'right' },
  section: { fontSize: 11, letterSpacing: 1.2, marginTop: SP[6], marginBottom: SP[3], textAlign: 'right', textTransform: 'uppercase' },
  kvLabel: { fontSize: 14, fontWeight: '600', textAlign: 'right' },
  kvHint: { fontSize: 12, marginTop: 2, textAlign: 'right' },
  link: { fontSize: 11, textDecorationLine: 'underline' },
});
