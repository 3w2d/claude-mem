import { View } from 'react-native';
import { useTheme } from '../src/components/ThemeProvider';
import { RouteHeader } from '../src/components/RouteHeader';
import { Editor } from '../src/screens/Editor';

export default function EditorRoute() {
  const { theme } = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: theme.bg.base }}>
      <RouteHeader title="المحرّر" />
      <Editor />
    </View>
  );
}
