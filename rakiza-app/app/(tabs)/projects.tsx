import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../src/components/ThemeProvider';
import { Projects } from '../../src/screens/Projects';

export default function ProjectsTab() {
  const { theme } = useTheme();
  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: theme.bg.base }}>
      <Projects />
    </SafeAreaView>
  );
}
