import { useRef, useState } from 'react';
import {
  View, Text, ScrollView, TextInput, Pressable, Image, Alert, Platform,
  KeyboardAvoidingView, StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../src/components/ThemeProvider';
import { RouteHeader } from '../src/components/RouteHeader';
import { NCRReport } from '../src/components/NCRReport';
import { FONT, RADIUS, SP } from '../src/theme';

type Msg =
  | { id: string; kind: 'text'; text: string; mine: boolean; at: number }
  | { id: string; kind: 'image'; uri: string; mine: boolean; at: number }
  | { id: string; kind: 'ncr'; at: number };

const rid = () => Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-3);

export default function NCRChat() {
  const { theme, fontsLoaded } = useTheme();
  const scrollRef = useRef<ScrollView>(null);

  const [messages, setMessages] = useState<Msg[]>([
    { id: rid(), kind: 'text', mine: false, at: Date.now(),
      text: 'أهلاً. اكتب وصف العيب أو ارفع صورة، أو اضغط "إنشاء NCR" لتعبئة تقرير حالة عدم مطابقة.' },
  ]);
  const [text, setText] = useState('');

  const push = (m: Msg) => {
    setMessages(prev => [...prev, m]);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 60);
  };
  const remove = (id: string) => setMessages(prev => prev.filter(m => m.id !== id));

  const sendText = () => {
    const t = text.trim();
    if (!t) return;
    setText('');
    push({ id: rid(), kind: 'text', mine: true, text: t, at: Date.now() });
  };

  const pickImage = async (camera: boolean) => {
    const perm = camera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      const msg = camera ? 'يحتاج التطبيق صلاحية الكاميرا.' : 'يحتاج التطبيق صلاحية الصور.';
      Platform.OS === 'web' ? window.alert(msg) : Alert.alert('تنبيه', msg);
      return;
    }
    const r = camera
      ? await ImagePicker.launchCameraAsync({ quality: 0.85 })
      : await ImagePicker.launchImageLibraryAsync({ quality: 0.85, mediaTypes: ImagePicker.MediaTypeOptions.Images });
    if (r.canceled || !r.assets?.[0]) return;
    push({ id: rid(), kind: 'image', mine: true, uri: r.assets[0].uri, at: Date.now() });
  };

  const newNCR = () => push({ id: rid(), kind: 'ncr', at: Date.now() });

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg.base }}>
      <RouteHeader title="محادثة وتقارير NCR" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
      >
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={{ padding: SP[4], paddingBottom: SP[6] }}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
        >
          {messages.map(m => {
            if (m.kind === 'ncr') return <NCRReport key={m.id} onRemove={() => remove(m.id)} />;
            const align = m.mine ? 'flex-start' : 'flex-end';
            return (
              <View key={m.id} style={{ alignSelf: align, maxWidth: '85%', marginBottom: SP[3] }}>
                {m.kind === 'image' ? (
                  <Image source={{ uri: m.uri }} style={[styles.image, { borderColor: theme.border.soft }]} />
                ) : (
                  <View style={[
                    styles.bubble,
                    {
                      backgroundColor: m.mine ? theme.gold.soft : theme.bg.card,
                      borderColor: m.mine ? theme.border.gold : theme.border.soft,
                      borderBottomLeftRadius: m.mine ? RADIUS.lg : RADIUS.xs,
                      borderBottomRightRadius: m.mine ? RADIUS.xs : RADIUS.lg,
                    },
                  ]}>
                    <Text style={{
                      fontSize: 14, lineHeight: 22, color: theme.text.primary,
                      fontFamily: fontsLoaded ? FONT.arabic : undefined,
                      textAlign: 'right',
                    }}>{m.text}</Text>
                  </View>
                )}
              </View>
            );
          })}
        </ScrollView>

        <View style={[styles.actionsRow, {
          backgroundColor: theme.bg.panel,
          borderTopColor: theme.border.soft,
        }]}>
          <Pressable
            onPress={newNCR}
            style={({ pressed }) => [
              styles.ncrBtn,
              { backgroundColor: theme.gold.base, opacity: pressed ? 0.85 : 1 },
            ]}
          >
            <Ionicons name="document-text" size={16} color={theme.text.inverse} />
            <Text style={{
              fontSize: 13, fontWeight: '700', color: theme.text.inverse,
              fontFamily: fontsLoaded ? FONT.arabic : undefined,
            }}>إنشاء تقرير NCR</Text>
          </Pressable>
        </View>

        <View style={[styles.composer, {
          backgroundColor: theme.bg.panel,
          borderTopColor: theme.border.soft,
        }]}>
          <Pressable onPress={() => pickImage(true)} hitSlop={6} style={{ padding: 6 }}>
            <Ionicons name="camera" size={22} color={theme.text.secondary} />
          </Pressable>
          <Pressable onPress={() => pickImage(false)} hitSlop={6} style={{ padding: 6 }}>
            <Ionicons name="image" size={22} color={theme.text.secondary} />
          </Pressable>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="اكتب رسالتك..."
            placeholderTextColor={theme.text.muted}
            multiline
            style={[styles.input, {
              backgroundColor: theme.bg.input,
              borderColor: theme.border.soft,
              color: theme.text.primary,
              fontFamily: fontsLoaded ? FONT.arabic : undefined,
            }]}
          />
          <Pressable
            onPress={sendText}
            disabled={!text.trim()}
            style={({ pressed }) => [
              styles.sendBtn,
              {
                backgroundColor: text.trim() ? theme.gold.base : theme.border.strong,
                opacity: pressed ? 0.85 : 1,
              },
            ]}
          >
            <Ionicons name="send" size={18} color={theme.text.inverse} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  bubble: {
    paddingHorizontal: SP[4], paddingVertical: SP[3],
    borderRadius: RADIUS.lg, borderWidth: 1,
  },
  image: {
    width: 220, height: 165, borderRadius: RADIUS.md, borderWidth: 1,
  },
  actionsRow: {
    paddingHorizontal: SP[4], paddingVertical: SP[2],
    borderTopWidth: 1, flexDirection: 'row-reverse',
  },
  ncrBtn: {
    flexDirection: 'row-reverse', alignItems: 'center', gap: 6,
    paddingHorizontal: SP[3], paddingVertical: 7, borderRadius: RADIUS.pill,
  },
  composer: {
    flexDirection: 'row-reverse', alignItems: 'flex-end', gap: 8,
    paddingHorizontal: SP[3], paddingVertical: SP[2],
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    paddingHorizontal: 12, paddingVertical: 8,
    borderWidth: 1, borderRadius: RADIUS.md,
    fontSize: 14, textAlign: 'right',
    maxHeight: 120,
  },
  sendBtn: {
    width: 38, height: 38, borderRadius: 19,
    alignItems: 'center', justifyContent: 'center',
  },
});
