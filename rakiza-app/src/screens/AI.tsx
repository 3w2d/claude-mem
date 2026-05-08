import { useState, useEffect, useRef, useMemo } from 'react';
import {
  View, Text, ScrollView, Pressable, useWindowDimensions, Platform,
  KeyboardAvoidingView, Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useTheme } from '../components/ThemeProvider';
import { Btn } from '../components/primitives';
import { ChatBubble } from '../components/ChatBubble';
import { ChatComposer, type PendingImage } from '../components/ChatComposer';
import { ConversationList } from '../components/ConversationList';
import { ProviderSheet } from '../components/ProviderSheet';
import { useChat, newMessage } from '../store/chat';
import { streamChat, type ChatMessage } from '../lib/chat';
import { findModel, PROVIDERS } from '../lib/providers';
import { FONT, SP, RADIUS } from '../theme';

export function AI() {
  const { theme, fontsLoaded } = useTheme();
  const hydrated = useChat(s => s.hydrated);
  const hydrate = useChat(s => s.hydrate);
  const conversations = useChat(s => s.conversations);
  const activeId = useChat(s => s.activeId);
  const apiKeys = useChat(s => s.apiKeys);
  const newConvo = useChat(s => s.newConversation);
  const pushMessage = useChat(s => s.pushMessage);
  const appendDelta = useChat(s => s.appendDelta);
  const finishMessage = useChat(s => s.finishMessage);
  const failMessage = useChat(s => s.failMessage);
  const renameConvo = useChat(s => s.renameConversation);

  const { width } = useWindowDimensions();
  const wide = width >= 900;

  const [sheetOpen, setSheetOpen] = useState(false);
  const [listOpen, setListOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<ScrollView | null>(null);

  useEffect(() => { if (!hydrated) hydrate(); }, [hydrated, hydrate]);

  const conversation = useMemo(
    () => conversations.find(c => c.id === activeId) ?? null,
    [conversations, activeId]
  );
  const model = conversation ? findModel(conversation.provider, conversation.model) : null;

  useEffect(() => {
    if (hydrated && !conversation && conversations.length === 0) {
      newConvo();
    }
  }, [hydrated, conversation, conversations.length, newConvo]);

  // Auto-scroll
  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 30);
  }, [conversation?.messages.length, conversation?.messages[conversation.messages.length - 1]?.content]);

  const onPickImage = async (): Promise<PendingImage | null> => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('الصلاحية مرفوضة', 'يحتاج التطبيق للوصول إلى الصور لإرفاقها.');
      return null;
    }
    const r = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      base64: true,
      quality: 0.85,
    });
    if (r.canceled || !r.assets?.[0]) return null;
    const a = r.assets[0];
    const mime = a.mimeType ?? 'image/jpeg';
    const base64 = a.base64 ?? '';
    if (!base64) return null;
    return { uri: a.uri, mime, base64 };
  };

  const send = async (text: string, images: PendingImage[]) => {
    if (!conversation) return;
    const apiKey = apiKeys[conversation.provider];
    if (!apiKey) {
      Alert.alert(
        'مفتاح API مفقود',
        `يلزم إدخال مفتاح ${PROVIDERS[conversation.provider].label} من الإعدادات.`,
        [{ text: 'فتح الإعدادات', onPress: () => setSheetOpen(true) }, { text: 'إلغاء' }]
      );
      return;
    }

    const parts: any[] = [];
    if (text) parts.push({ kind: 'text', text });
    for (const img of images) parts.push({ kind: 'image', mime: img.mime, base64: img.base64 });
    const userMsg = newMessage('user', text || '(صورة)', parts.length ? parts : undefined);
    pushMessage(conversation.id, userMsg);

    const botMsg = newMessage('assistant', '');
    pushMessage(conversation.id, botMsg);

    setBusy(true);
    abortRef.current = new AbortController();
    const fullHistory: ChatMessage[] = [
      ...conversation.messages.filter(m => !m.error && m.role !== 'system'),
      userMsg,
    ];

    await streamChat({
      provider: conversation.provider,
      apiKey,
      model: conversation.model,
      system: conversation.systemPrompt,
      messages: fullHistory,
      signal: abortRef.current.signal,
    }, {
      onDelta: (t) => appendDelta(conversation.id, botMsg.id, t),
      onDone: ({ usage }) => finishMessage(conversation.id, botMsg.id, usage),
      onError: (msg) => failMessage(conversation.id, botMsg.id, msg),
    });

    setBusy(false);
    abortRef.current = null;

    // Auto-rename if first turn
    const updated = useChat.getState().conversations.find(c => c.id === conversation.id);
    if (updated && updated.title === 'محادثة جديدة' && text) {
      renameConvo(conversation.id, text.slice(0, 40).trim());
    }
  };

  const stop = () => {
    abortRef.current?.abort();
    abortRef.current = null;
    setBusy(false);
  };

  const exportConvo = async (format: 'md' | 'json') => {
    if (!conversation) return;
    let content: string;
    let mime: string;
    let ext: string;
    if (format === 'json') {
      content = JSON.stringify(conversation, null, 2);
      mime = 'application/json'; ext = 'json';
    } else {
      const lines: string[] = [
        `# ${conversation.title}`,
        '',
        `> Provider: ${conversation.provider} · Model: ${conversation.model}`,
        '',
        ...(conversation.systemPrompt ? [`**System:** ${conversation.systemPrompt}`, ''] : []),
      ];
      for (const m of conversation.messages) {
        lines.push(`## ${m.role === 'user' ? 'أنت' : 'AI'}`, '', m.content || (m.error ?? ''), '');
      }
      content = lines.join('\n');
      mime = 'text/markdown'; ext = 'md';
    }
    if (Platform.OS === 'web') {
      const blob = new Blob([content], { type: mime });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `${conversation.title}.${ext}`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 100);
    } else {
      const path = (FileSystem.documentDirectory ?? '') + `${conversation.title.replace(/[^\w-]/g, '_')}.${ext}`;
      await FileSystem.writeAsStringAsync(path, content);
      if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(path, { mimeType: mime });
    }
  };

  if (!hydrated) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.bg.base, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: theme.text.muted, fontFamily: fontsLoaded ? FONT.arabic : undefined }}>جارٍ التحميل…</Text>
      </View>
    );
  }

  const chatPane = (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.bg.base }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={{
        flexDirection: 'row-reverse', alignItems: 'center', gap: SP[2],
        padding: SP[3],
        borderBottomWidth: 1, borderBottomColor: theme.border.soft,
        backgroundColor: theme.bg.panel,
      }}>
        {!wide && (
          <Pressable onPress={() => setListOpen(true)} hitSlop={6}
            style={{ paddingHorizontal: 4, paddingVertical: 4 }}>
            <Text style={{ fontSize: 18, color: theme.text.secondary }}>☰</Text>
          </Pressable>
        )}
        <View style={{ flex: 1 }}>
          <Text style={{
            fontSize: 14, fontWeight: '700', color: theme.text.primary,
            fontFamily: fontsLoaded ? FONT.arabic : undefined, textAlign: 'right',
          }} numberOfLines={1}>{conversation?.title ?? 'محادثة'}</Text>
          <Text style={{
            fontSize: 11, color: theme.text.muted,
            fontFamily: fontsLoaded ? FONT.mono : undefined, textAlign: 'right',
          }} numberOfLines={1}>
            {model?.label ?? conversation?.model} · {conversation ? conversation.totalIn + conversation.totalOut : 0} tok
          </Text>
        </View>
        <Pressable onPress={() => exportConvo('md')} hitSlop={6}
          style={{ paddingHorizontal: 6, paddingVertical: 4 }}>
          <Text style={{ fontSize: 16, color: theme.text.secondary }}>↓</Text>
        </Pressable>
        <Pressable onPress={() => setSheetOpen(true)} hitSlop={6}
          style={{ paddingHorizontal: 6, paddingVertical: 4 }}>
          <Text style={{ fontSize: 16, color: theme.text.secondary }}>⚙</Text>
        </Pressable>
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollRef}
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: SP[4], paddingBottom: SP[6] }}
      >
        {conversation && conversation.messages.length === 0 && (
          <Welcome onSetup={() => setSheetOpen(true)} hasKey={!!apiKeys[conversation.provider]} />
        )}
        {conversation?.messages.map((m, i) => (
          <ChatBubble
            key={m.id}
            m={m}
            streaming={busy && i === conversation.messages.length - 1 && m.role === 'assistant'}
          />
        ))}
      </ScrollView>

      <ChatComposer
        onSend={send}
        busy={busy}
        onStop={stop}
        visionEnabled={!!model?.vision}
        onPickImage={onPickImage}
      />
    </KeyboardAvoidingView>
  );

  if (wide) {
    return (
      <View style={{ flex: 1, flexDirection: 'row-reverse' }}>
        <View style={{ width: 280, borderLeftWidth: 1, borderLeftColor: theme.border.soft }}>
          <ConversationList />
        </View>
        {chatPane}
        <ProviderSheet visible={sheetOpen} onClose={() => setSheetOpen(false)} conversation={conversation ?? undefined} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {chatPane}
      {/* Mobile drawer overlay */}
      {listOpen && (
        <View style={{ position: 'absolute', inset: 0, flexDirection: 'row-reverse' }}>
          <View style={{ width: '78%', maxWidth: 320, backgroundColor: theme.bg.panel }}>
            <View style={{
              padding: SP[3], flexDirection: 'row-reverse', justifyContent: 'space-between',
              borderBottomWidth: 1, borderBottomColor: theme.border.soft,
            }}>
              <Text style={{
                fontSize: 14, fontWeight: '700', color: theme.text.primary,
                fontFamily: fontsLoaded ? FONT.arabic : undefined,
              }}>المحادثات</Text>
              <Pressable onPress={() => setListOpen(false)}>
                <Text style={{ fontSize: 18, color: theme.text.muted }}>×</Text>
              </Pressable>
            </View>
            <ConversationList onClose={() => setListOpen(false)} />
          </View>
          <Pressable
            style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}
            onPress={() => setListOpen(false)}
          />
        </View>
      )}
      <ProviderSheet visible={sheetOpen} onClose={() => setSheetOpen(false)} conversation={conversation ?? undefined} />
    </View>
  );
}

function Welcome({ onSetup, hasKey }: { onSetup: () => void; hasKey: boolean }) {
  const { theme, fontsLoaded } = useTheme();
  const examples = [
    'اشرح فكرة الستريك في تطبيقك بكلام مبسّط',
    'احسب لي تكلفة فيلا 12×10 من 3 أدوار',
    'صحّح هذه الجملة: "الكتاب الذي قراءته كان جيدا"',
    'اكتب لي خوارزمية ترتيب سريع بـ TypeScript',
  ];
  return (
    <View style={{ paddingVertical: SP[8], alignItems: 'center' }}>
      <Text style={{ fontSize: 42, marginBottom: SP[3] }}>💬</Text>
      <Text style={{
        fontSize: 20, fontWeight: '700', color: theme.text.primary, marginBottom: SP[2],
        fontFamily: fontsLoaded ? FONT.arabic : undefined,
      }}>كيف أقدر أساعدك؟</Text>
      <Text style={{
        fontSize: 13, color: theme.text.secondary, textAlign: 'center', maxWidth: 380,
        marginBottom: SP[5], lineHeight: 21,
        fontFamily: fontsLoaded ? FONT.arabic : undefined,
      }}>
        اطلب أي شيء — برمجة، حسابات، تحرير، شرح. الردود تأتيك حرفاً حرفاً والمحادثات محفوظة محلياً.
      </Text>

      {!hasKey && (
        <View style={{ marginBottom: SP[5] }}>
          <Btn onPress={onSetup}>⚙  أضف مفتاح API للبدء</Btn>
        </View>
      )}

      <View style={{ flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 6, justifyContent: 'center', maxWidth: 480 }}>
        {examples.map((e, i) => (
          <View key={i} style={{
            paddingHorizontal: SP[3], paddingVertical: SP[2],
            backgroundColor: theme.gold.soft,
            borderColor: theme.border.gold, borderWidth: 1,
            borderRadius: RADIUS.lg,
          }}>
            <Text style={{
              fontSize: 12, color: theme.gold.base,
              fontFamily: fontsLoaded ? FONT.arabic : undefined,
            }}>{e}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
