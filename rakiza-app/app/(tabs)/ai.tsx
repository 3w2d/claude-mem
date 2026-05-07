import { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Pressable, Platform, KeyboardAvoidingView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStore } from '../../src/store/projects';
import { Card } from '../../src/components/Card';
import { theme } from '../../src/theme';
import { callAnthropic, snapshot, type ChatMessage } from '../../src/lib/ai';

const SUGGESTIONS = [
  'صمّم لي فيلا 12×10 لعائلة 5',
  'ابحث عن أسعار البلك السعودي اليوم',
  'اقترح تحسينات للمخطط الحالي',
  'كم تكلفة هذا المشروع تقريباً؟',
];

export default function AIScreen() {
  const projects = useStore(s => s.projects);
  const apiKey = useStore(s => s.settings.apiKey ?? '');
  const model = useStore(s => s.settings.aiModel);
  const setApiKey = useStore(s => s.setApiKey);
  const setModel = useStore(s => s.setModel);
  const pricing = useStore(s => s.settings.pricing);
  const activeProject = projects.find(p => !p.archived);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const send = async (text?: string) => {
    const t = (text ?? input).trim();
    if (!t || busy) return;
    setInput('');
    const userMsg: ChatMessage = { role: 'user', content: t };
    setMessages(m => [...m, userMsg]);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);

    if (!apiKey) {
      setMessages(m => [...m, { role: 'assistant', content: 'يجب إدخال مفتاح Anthropic API أعلى الشاشة لتفعيل المحادثة الذكية.' }]);
      return;
    }
    setBusy(true);
    try {
      const ctx = activeProject ? snapshot(activeProject, pricing) : null;
      const sys = ctx ? `الحالة الحالية للمشروع: ${JSON.stringify(ctx)}` : 'لا يوجد مشروع نشط بعد.';
      const data = await callAnthropic({
        apiKey, model,
        messages: [
          ...messages,
          userMsg,
          { role: 'user', content: '[سياق] ' + sys },
        ],
      });
      const text = (data.content || []).filter((b: any) => b.type === 'text').map((b: any) => b.text).join('\n').trim();
      setMessages(m => [...m, { role: 'assistant', content: text || '...' }]);
    } catch (e: any) {
      setMessages(m => [...m, { role: 'assistant', content: 'خطأ: ' + (e.message || e) }]);
    } finally {
      setBusy(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
    }
  };

  return (
    <View style={styles.root}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.header}>
            <Text style={styles.h1}>مهندس AI</Text>
            <Text style={styles.sub}>زميل يحاورك ويبحث وينفّذ التعديل على مشروعك</Text>
          </View>

          <Card style={styles.keyCard}>
            <Text style={styles.label}>مفتاح Anthropic API</Text>
            <TextInput
              value={apiKey}
              onChangeText={setApiKey}
              placeholder="sk-ant-..."
              placeholderTextColor={theme.text.muted}
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry
              style={styles.input}
            />
            <View style={styles.modelRow}>
              {['claude-haiku-4-5', 'claude-sonnet-4-6', 'claude-opus-4-7'].map(m => (
                <Pressable key={m} onPress={() => setModel(m)}
                  style={[styles.modelChip, model === m && styles.modelChipActive]}>
                  <Text style={[styles.modelChipText, model === m && styles.modelChipTextActive]}>
                    {m.replace('claude-', '').replace(/-\d/, '')}
                  </Text>
                </Pressable>
              ))}
            </View>
          </Card>

          <ScrollView
            ref={scrollRef}
            style={{ flex: 1 }}
            contentContainerStyle={styles.chat}
            keyboardShouldPersistTaps="handled"
          >
            {messages.length === 0 && (
              <View style={styles.welcome}>
                <Text style={styles.welcomeEmoji}>🏗️</Text>
                <Text style={styles.welcomeTitle}>أهلاً!</Text>
                <Text style={styles.welcomeBody}>
                  اطلب أي تعديل أو استشارة. أبحث على الإنترنت، أقترح بدائل، وأطبّق التغيير على مشروعك.
                </Text>
                <View style={styles.chips}>
                  {SUGGESTIONS.map(s => (
                    <Pressable key={s} onPress={() => send(s)} style={styles.chip}>
                      <Text style={styles.chipText}>{s}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}
            {messages.map((m, i) => (
              <View key={i} style={[styles.msg, m.role === 'user' ? styles.userMsg : styles.botMsg]}>
                <Text style={[styles.msgText, m.role === 'user' ? styles.userText : null]}>
                  {typeof m.content === 'string' ? m.content : JSON.stringify(m.content)}
                </Text>
              </View>
            ))}
            {busy && (
              <View style={[styles.msg, styles.botMsg]}>
                <Text style={[styles.msgText, { color: theme.text.muted }]}>يفكّر…</Text>
              </View>
            )}
          </ScrollView>

          <View style={styles.inputRow}>
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="اطلب تعديلاً أو استشارة..."
              placeholderTextColor={theme.text.muted}
              style={styles.chatInput}
              multiline
              onSubmitEditing={() => send()}
              blurOnSubmit
            />
            <Pressable
              style={[styles.send, (!input.trim() || busy) && styles.sendDisabled]}
              disabled={!input.trim() || busy}
              onPress={() => send()}>
              <Text style={styles.sendText}>↑</Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.bg.base },
  header: { padding: 20, paddingBottom: 12 },
  h1: { color: theme.text.primary, fontSize: 24, fontWeight: '800' },
  sub: { color: theme.text.secondary, fontSize: 13, marginTop: 4 },
  keyCard: { marginHorizontal: 20, marginBottom: 8 },
  label: { color: theme.text.secondary, fontSize: 12, marginBottom: 6 },
  input: { backgroundColor: theme.bg.base, borderWidth: 1, borderColor: theme.border.light, borderRadius: 8, padding: 10, color: theme.accent.blue, fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }), fontSize: 13, textAlign: 'left' },
  modelRow: { flexDirection: 'row', gap: 6, marginTop: 10 },
  modelChip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, borderWidth: 1, borderColor: theme.border.light, backgroundColor: theme.bg.base },
  modelChipActive: { backgroundColor: theme.accent.blue, borderColor: theme.accent.blue },
  modelChipText: { color: theme.text.secondary, fontSize: 11, fontWeight: '600' },
  modelChipTextActive: { color: '#fff' },
  chat: { padding: 20, paddingBottom: 100 },
  msg: { marginBottom: 10, padding: 12, borderRadius: 14, maxWidth: '88%' },
  userMsg: { backgroundColor: theme.accent.blue, alignSelf: 'flex-end', borderBottomRightRadius: 4 },
  botMsg: { backgroundColor: theme.bg.surface, borderWidth: 1, borderColor: theme.border.light, alignSelf: 'flex-start', borderBottomLeftRadius: 4 },
  msgText: { color: theme.text.primary, fontSize: 14, lineHeight: 22 },
  userText: { color: '#fff' },
  inputRow: { flexDirection: 'row', padding: 12, paddingBottom: Platform.OS === 'ios' ? 110 : 110, gap: 8, alignItems: 'flex-end', backgroundColor: theme.bg.surface, borderTopWidth: 1, borderTopColor: theme.border.light },
  chatInput: { flex: 1, minHeight: 44, maxHeight: 110, backgroundColor: theme.bg.base, borderWidth: 1, borderColor: theme.border.light, borderRadius: 22, paddingHorizontal: 16, paddingVertical: 10, color: theme.text.primary, fontSize: 15 },
  send: { width: 44, height: 44, borderRadius: 22, backgroundColor: theme.accent.blue, alignItems: 'center', justifyContent: 'center' },
  sendDisabled: { opacity: 0.4 },
  sendText: { color: '#fff', fontSize: 22, fontWeight: '800', lineHeight: 22 },
  welcome: { alignItems: 'center', padding: 20 },
  welcomeEmoji: { fontSize: 48, marginBottom: 8 },
  welcomeTitle: { color: theme.text.primary, fontSize: 22, fontWeight: '800' },
  welcomeBody: { color: theme.text.secondary, fontSize: 13, lineHeight: 22, textAlign: 'center', marginTop: 8 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 16, justifyContent: 'center' },
  chip: { backgroundColor: theme.accent.blueSoft, borderWidth: 1, borderColor: theme.border.blue, borderRadius: 14, paddingHorizontal: 12, paddingVertical: 6 },
  chipText: { color: theme.accent.blue, fontSize: 12 },
});
