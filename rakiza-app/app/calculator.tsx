import { View } from 'react-native';
import { useTheme } from '../src/components/ThemeProvider';
import { RouteHeader } from '../src/components/RouteHeader';
import { Calculator } from '../src/screens/Calculator';

export default function CalculatorRoute() {
  const { theme } = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: theme.bg.base }}>
      <RouteHeader title="الحاسبة الإنشائية" />
      <Calculator />
    </View>
  );
}
