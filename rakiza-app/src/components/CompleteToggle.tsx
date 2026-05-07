import { Pressable, Text, View, Platform, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { theme } from '../theme';

export function CompleteToggle({ done, color, onToggle, size = 52 }: { done: boolean; color: string; onToggle: () => void; size?: number }) {
  return (
    <Pressable
      hitSlop={10}
      onPress={() => {
        if (Platform.OS !== 'web') {
          Haptics.impactAsync(done ? Haptics.ImpactFeedbackStyle.Light : Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
        }
        onToggle();
      }}
      style={({ pressed }) => [
        styles.root,
        {
          width: size, height: size, borderRadius: size / 2,
          backgroundColor: done ? color : theme.bg.surface,
          borderColor: done ? color : theme.border.light,
          opacity: pressed ? 0.7 : 1,
        },
      ]}
    >
      {done ? (
        <Text style={{ fontSize: size * 0.46, color: '#fff', fontWeight: '900' }}>✓</Text>
      ) : (
        <View style={{ width: size * 0.4, height: size * 0.4, borderRadius: size * 0.2, borderColor: theme.text.muted, borderWidth: 2 }} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
});
