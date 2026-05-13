import { View } from 'react-native';
import { useTheme } from '../src/components/ThemeProvider';
import { RouteHeader } from '../src/components/RouteHeader';
import { AI } from '../src/screens/AI';

export default function AIRoute() {
  const { theme } = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: theme.bg.base }}>
      <RouteHeader title="مساعد AI" />
      <AI />
    </View>
  );
}
