import { useState } from 'react';
import { View, Text, TextInput, Pressable, Image, ScrollView } from 'react-native';
import { useTheme } from './ThemeProvider';
import { FONT, RADIUS, SP } from '../theme';

export interface PendingImage {
  uri: string;
  mime: string;
  base64: string;
}

interface Props {
  onSend: (text: string, images: PendingImage[]) => void;
  busy: boolean;
  onStop: () => void;
  visionEnabled: boolean;
  onPickImage: () => Promise<PendingImage | null>;
}

export function ChatComposer({ onSend, busy, onStop, visionEnabled, onPickImage }: Props) {
  const { theme, fontsLoaded } = useTheme();
  const [text, setText] = useState('');
  const [images, setImages] = useState<PendingImage[]>([]);
  const [focused, setFocused] = useState(false);

  const send = () => {
    const t = text.trim();
    if (!t && !images.length) return;
    onSend(t, images);
    setText(''); setImages([]);
  };

  const pickImg = async () => {
    const img = await onPickImage();
    if (img) setImages(prev => [...prev, img]);
  };

  return (
    <View style={{
      paddingHorizontal: SP[3], paddingTop: SP[2], paddingBottom: SP[3],
      borderTopWidth: 1, borderTopColor: theme.border.soft,
      backgroundColor: theme.bg.panel,
    }}>
      {images.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, paddingBottom: SP[2] }}>
          {images.map((img, i) => (
            <View key={i} style={{ position: 'relative' }}>
              <Image source={{ uri: img.uri }} style={{
                width: 56, height: 56, borderRadius: RADIUS.sm,
                borderWidth: 1, borderColor: theme.border.gold,
              }} />
              <Pressable
                onPress={() => setImages(prev => prev.filter((_, j) => j !== i))}
                style={{
                  position: 'absolute', top: -4, right: -4,
                  width: 18, height: 18, borderRadius: 9,
                  backgroundColor: theme.danger,
                  alignItems: 'center', justifyContent: 'center',
                }}>
                <Text style={{ color: '#fff', fontSize: 12, lineHeight: 14 }}>×</Text>
              </Pressable>
            </View>
          ))}
        </ScrollView>
      )}

      <View style={{
        flexDirection: 'row-reverse', alignItems: 'flex-end', gap: 8,
        backgroundColor: theme.bg.input,
        borderColor: focused ? theme.gold.base : theme.border.soft,
        borderWidth: 1,
        borderRadius: RADIUS.lg,
        paddingHorizontal: SP[3], paddingVertical: 6,
      }}>
        {visionEnabled && (
          <Pressable onPress={pickImg} hitSlop={6}
            style={{ paddingHorizontal: 4, paddingVertical: 8 }}>
            <Text style={{ fontSize: 18, color: theme.text.muted }}>📎</Text>
          </Pressable>
        )}
        <TextInput
          value={text}
          onChangeText={setText}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={busy ? 'جارٍ التوليد…' : 'اكتب رسالتك...'}
          placeholderTextColor={theme.text.muted}
          multiline
          editable={!busy}
          style={{
            flex: 1,
            color: theme.text.primary,
            fontSize: 15, lineHeight: 22,
            paddingVertical: 8, maxHeight: 140,
            textAlign: 'right',
            fontFamily: fontsLoaded ? FONT.arabic : undefined,
          }}
        />
        {busy ? (
          <Pressable onPress={onStop} hitSlop={6}
            style={{
              width: 36, height: 36, borderRadius: 18,
              backgroundColor: theme.danger,
              alignItems: 'center', justifyContent: 'center',
            }}>
            <Text style={{ color: '#fff', fontSize: 14 }}>■</Text>
          </Pressable>
        ) : (
          <Pressable onPress={send} hitSlop={6} disabled={!text.trim() && !images.length}
            style={{
              width: 36, height: 36, borderRadius: 18,
              backgroundColor: text.trim() || images.length ? theme.gold.base : theme.border.soft,
              alignItems: 'center', justifyContent: 'center',
            }}>
            <Text style={{ color: theme.text.inverse, fontSize: 16, fontWeight: '700' }}>↑</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}
