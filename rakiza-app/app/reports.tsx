import { View } from 'react-native';
import { useTheme } from '../src/components/ThemeProvider';
import { RouteHeader } from '../src/components/RouteHeader';
import { Reports } from '../src/screens/Reports';

export default function ReportsRoute() {
  const { theme } = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: theme.bg.base }}>
      <RouteHeader title="التقارير" />
      <Reports />
    </View>
  );
}
