import { StyleSheet, View, ViewStyle } from 'react-native';
import { theme } from '../theme';

export function Card({ children, style }: { children: React.ReactNode; style?: ViewStyle | ViewStyle[] }) {
  return <View style={[styles.card, style as any]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.bg.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.border.light,
    padding: 16,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
});
