import { useState } from 'react';
import { Modal, View, Text, Pressable, ScrollView, TextInput, Linking, Platform } from 'react-native';
import { useTheme } from './ThemeProvider';
import { Btn, Card, Field, Select } from './primitives';
import { useChat, type Conversation } from '../store/chat';
import { PROVIDERS, type ProviderId } from '../lib/providers';
import { FONT, RADIUS, SP } from '../theme';

interface Props {
  visible: boolean;
  onClose: () => void;
  conversation?: Conversation;
}

type Tab = 'model' | 'persona' | 'keys';

export function ProviderSheet({ visible, onClose, conversation }: Props) {
  const { theme, fontsLoaded } = useTheme();
  const apiKeys = useChat(s => s.apiKeys);
  const setApiKey = useChat(s => s.setApiKey);
  const personas = useChat(s => s.personas);
  const setSystemPrompt = useChat(s => s.setSystemPrompt);
  const setModel = useChat(s => s.setModel);
  const setDefaults = useChat(s => s.setDefaults);
  const addPersona = useChat(s => s.addPersona);
  const deletePersona = useChat(s => s.deletePersona);

  const [tab, setTab] = useState<Tab>('model');
  const [newName, setNewName] = useState('');
  const [newPrompt, setNewPrompt] = useState('');
  const [newEmoji, setNewEmoji] = useState('🤖');

  const provider: ProviderId = conversation?.provider ?? useChat.getState().defaultProvider;
  const modelId = conversation?.model ?? useChat.getState().defaultModel;
  const activePersona = conversation?.personaId;

  const onSelectModel = (p: ProviderId, mid: string) => {
    if (conversation) setModel(conversation.id, p, mid);
    else setDefaults(p, mid);
  };
  const onSelectPersona = (id: string) => {
    const persona = personas.find(p => p.id === id);
    if (persona && conversation) setSystemPrompt(conversation.id, persona.prompt, persona.id);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }} onPress={onClose}>
        <Pressable
          onPress={() => {}}
          style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            backgroundColor: theme.bg.base,
            borderTopLeftRadius: 22, borderTopRightRadius: 22,
            borderTopWidth: 1, borderTopColor: theme.border.soft,
            maxHeight: '85%',
          }}
        >
          {/* Handle */}
          <View style={{ alignItems: 'center', paddingVertical: SP[2] }}>
            <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: theme.border.strong }} />
          </View>

          {/* Tabs */}
          <View style={{ flexDirection: 'row-reverse', paddingHorizontal: SP[4], gap: 6 }}>
            {([
              { id: 'model', label: 'الموديل' },
              { id: 'persona', label: 'الشخصية' },
              { id: 'keys', label: 'مفاتيح API' },
            ] as { id: Tab; label: string }[]).map(t => (
              <Pressable key={t.id} onPress={() => setTab(t.id)}
                style={{
                  paddingHorizontal: SP[4], paddingVertical: SP[2],
                  borderRadius: RADIUS.md,
                  backgroundColor: tab === t.id ? theme.gold.soft : 'transparent',
                  borderWidth: 1, borderColor: tab === t.id ? theme.border.gold : theme.border.soft,
                }}>
                <Text style={{
                  fontSize: 13,
                  color: tab === t.id ? theme.gold.base : theme.text.secondary,
                  fontWeight: tab === t.id ? '600' : '500',
                  fontFamily: fontsLoaded ? FONT.arabic : undefined,
                }}>{t.label}</Text>
              </Pressable>
            ))}
          </View>

          <ScrollView contentContainerStyle={{ padding: SP[4], paddingBottom: SP[10] }}>
            {tab === 'model' && (
              <>
                {(Object.keys(PROVIDERS) as ProviderId[]).map(pid => {
                  const p = PROVIDERS[pid];
                  return (
                    <View key={pid} style={{ marginBottom: SP[5] }}>
                      <View style={{
                        flexDirection: 'row-reverse', justifyContent: 'space-between',
                        alignItems: 'flex-end', marginBottom: SP[2],
                      }}>
                        <View>
                          <Text style={{
                            fontSize: 14, fontWeight: '700', color: theme.text.primary,
                            fontFamily: fontsLoaded ? FONT.arabic : undefined, textAlign: 'right',
                          }}>{p.label}</Text>
                          <Text style={{
                            fontSize: 11, color: theme.text.muted, marginTop: 2,
                            fontFamily: fontsLoaded ? FONT.arabic : undefined, textAlign: 'right',
                          }}>{p.hint}</Text>
                        </View>
                        {!apiKeys[pid] && (
                          <Pressable onPress={() => Linking.openURL(p.signupUrl).catch(() => {})}>
                            <Text style={{
                              fontSize: 11, color: theme.gold.base, textDecorationLine: 'underline',
                              fontFamily: fontsLoaded ? FONT.arabic : undefined,
                            }}>احصل على مفتاح ←</Text>
                          </Pressable>
                        )}
                      </View>
                      <View style={{ gap: 6 }}>
                        {p.models.map(m => {
                          const active = provider === pid && modelId === m.id;
                          return (
                            <Pressable key={m.id} onPress={() => onSelectModel(pid, m.id)}
                              style={({ pressed }) => ({
                                padding: SP[3],
                                borderRadius: RADIUS.md,
                                borderWidth: 1,
                                borderColor: active ? theme.gold.base : theme.border.soft,
                                backgroundColor: active ? theme.gold.soft : (pressed ? theme.bg.elevated : theme.bg.card),
                                flexDirection: 'row-reverse', alignItems: 'center', gap: 8,
                              })}>
                              <Text style={{
                                flex: 1, fontSize: 13, fontWeight: active ? '600' : '500',
                                color: active ? theme.gold.base : theme.text.primary,
                                fontFamily: fontsLoaded ? FONT.arabic : undefined,
                                textAlign: 'right',
                              }}>{m.label}</Text>
                              {m.free && (
                                <View style={{
                                  paddingHorizontal: 8, paddingVertical: 2,
                                  borderRadius: RADIUS.pill,
                                  backgroundColor: theme.success + '22',
                                  borderWidth: 1, borderColor: theme.success + '55',
                                }}>
                                  <Text style={{
                                    fontSize: 10, color: theme.success, fontWeight: '600',
                                    fontFamily: fontsLoaded ? FONT.arabic : undefined,
                                  }}>مجاني</Text>
                                </View>
                              )}
                              {m.vision && <Text style={{ fontSize: 11, color: theme.text.muted }}>👁</Text>}
                              {m.toolUse && <Text style={{ fontSize: 11, color: theme.text.muted }}>🔧</Text>}
                              <Text style={{
                                fontSize: 10, color: theme.text.muted,
                                fontFamily: fontsLoaded ? FONT.mono : undefined,
                              }}>{m.contextK}K</Text>
                            </Pressable>
                          );
                        })}
                      </View>
                    </View>
                  );
                })}
              </>
            )}

            {tab === 'persona' && (
              <>
                <Text style={{
                  fontSize: 11, color: theme.gold.base, letterSpacing: 1.2,
                  textTransform: 'uppercase', marginBottom: SP[3],
                  fontFamily: fontsLoaded ? FONT.mono : undefined,
                }}>الشخصيات الجاهزة</Text>
                <View style={{ gap: 6, marginBottom: SP[5] }}>
                  {personas.map(p => {
                    const active = activePersona === p.id;
                    return (
                      <Pressable key={p.id} onPress={() => onSelectPersona(p.id)}
                        style={({ pressed }) => ({
                          padding: SP[3],
                          borderRadius: RADIUS.md,
                          borderWidth: 1,
                          borderColor: active ? theme.gold.base : theme.border.soft,
                          backgroundColor: active ? theme.gold.soft : (pressed ? theme.bg.elevated : theme.bg.card),
                          flexDirection: 'row-reverse', alignItems: 'flex-start', gap: 10,
                        })}>
                        <Text style={{ fontSize: 22 }}>{p.emoji}</Text>
                        <View style={{ flex: 1 }}>
                          <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 6 }}>
                            <Text style={{
                              flex: 1, fontSize: 13, fontWeight: '600',
                              color: active ? theme.gold.base : theme.text.primary,
                              fontFamily: fontsLoaded ? FONT.arabic : undefined,
                              textAlign: 'right',
                            }}>{p.name}</Text>
                            {!p.builtin && (
                              <Pressable hitSlop={6} onPress={(e) => { e.stopPropagation?.(); deletePersona(p.id); }}>
                                <Text style={{ fontSize: 14, color: theme.text.muted }}>×</Text>
                              </Pressable>
                            )}
                          </View>
                          <Text style={{
                            fontSize: 12, color: theme.text.secondary, marginTop: 2, lineHeight: 19,
                            fontFamily: fontsLoaded ? FONT.arabic : undefined,
                            textAlign: 'right',
                          }} numberOfLines={2}>{p.prompt}</Text>
                        </View>
                      </Pressable>
                    );
                  })}
                </View>

                <Text style={{
                  fontSize: 11, color: theme.gold.base, letterSpacing: 1.2,
                  textTransform: 'uppercase', marginBottom: SP[3],
                  fontFamily: fontsLoaded ? FONT.mono : undefined,
                }}>إنشاء شخصية</Text>
                <Card>
                  <View style={{ flexDirection: 'row-reverse', gap: SP[2], marginBottom: SP[3] }}>
                    <TextInput value={newEmoji} onChangeText={setNewEmoji} maxLength={2}
                      style={{
                        width: 50, padding: 10, fontSize: 20, textAlign: 'center',
                        backgroundColor: theme.bg.input,
                        borderColor: theme.border.soft, borderWidth: 1,
                        borderRadius: RADIUS.md, color: theme.text.primary,
                      }} />
                    <TextInput value={newName} onChangeText={setNewName}
                      placeholder="اسم الشخصية" placeholderTextColor={theme.text.muted}
                      style={{
                        flex: 1, padding: 10, fontSize: 14,
                        backgroundColor: theme.bg.input,
                        borderColor: theme.border.soft, borderWidth: 1,
                        borderRadius: RADIUS.md, color: theme.text.primary, textAlign: 'right',
                        fontFamily: fontsLoaded ? FONT.arabic : undefined,
                      }} />
                  </View>
                  <TextInput value={newPrompt} onChangeText={setNewPrompt}
                    multiline numberOfLines={4}
                    placeholder="System prompt: أنت ..."
                    placeholderTextColor={theme.text.muted}
                    style={{
                      padding: 10, fontSize: 13, minHeight: 100,
                      backgroundColor: theme.bg.input,
                      borderColor: theme.border.soft, borderWidth: 1,
                      borderRadius: RADIUS.md, color: theme.text.primary, textAlign: 'right',
                      fontFamily: fontsLoaded ? FONT.arabic : undefined,
                      textAlignVertical: 'top',
                    }} />
                  <View style={{ marginTop: SP[3] }}>
                    <Btn onPress={() => {
                      if (newName.trim() && newPrompt.trim()) {
                        addPersona({ name: newName.trim(), emoji: newEmoji || '🤖', prompt: newPrompt.trim() });
                        setNewName(''); setNewPrompt(''); setNewEmoji('🤖');
                      }
                    }}>+ إضافة شخصية</Btn>
                  </View>
                </Card>
              </>
            )}

            {tab === 'keys' && (
              <>
                <Text style={{
                  fontSize: 12, color: theme.text.secondary, marginBottom: SP[4], lineHeight: 20,
                  fontFamily: fontsLoaded ? FONT.arabic : undefined, textAlign: 'right',
                }}>
                  المفاتيح تُحفظ محلياً على جهازك فقط ولا ترسل لأي خادم خارجي.
                  الطلبات تذهب مباشرة من جهازك إلى المزوّد.
                </Text>

                {(Object.keys(PROVIDERS) as ProviderId[]).map(pid => {
                  const p = PROVIDERS[pid];
                  return (
                    <View key={pid} style={{ marginBottom: SP[4] }}>
                      <Field label={p.label}
                        hint={apiKeys[pid] ? '✓ مُعَدّ' : ''}>
                        <TextInput
                          value={apiKeys[pid]}
                          onChangeText={v => setApiKey(pid, v.trim())}
                          placeholder={p.apiKeyPlaceholder}
                          placeholderTextColor={theme.text.muted}
                          autoCapitalize="none"
                          autoCorrect={false}
                          secureTextEntry
                          style={{
                            padding: 11, fontSize: 13,
                            backgroundColor: theme.bg.input,
                            borderColor: theme.border.soft, borderWidth: 1,
                            borderRadius: RADIUS.md, color: theme.text.primary,
                            fontFamily: fontsLoaded ? FONT.mono : undefined,
                            textAlign: 'left',
                          } as any}
                        />
                      </Field>
                      <Pressable onPress={() => Linking.openURL(p.signupUrl).catch(() => {})}
                        style={{ marginTop: 6 }}>
                        <Text style={{
                          fontSize: 11, color: theme.gold.base,
                          fontFamily: fontsLoaded ? FONT.arabic : undefined,
                        }}>← احصل على مفتاح من {p.label}</Text>
                      </Pressable>
                    </View>
                  );
                })}
              </>
            )}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
