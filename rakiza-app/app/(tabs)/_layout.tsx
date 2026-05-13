import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';
import { useTheme } from '../../src/components/ThemeProvider';
import { FONT } from '../../src/theme';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

export default function TabsLayout() {
  const { theme, fontsLoaded } = useTheme();

  const icon = (name: IconName) =>
    ({ color, size, focused }: { color: string; size: number; focused: boolean }) => (
      <Ionicons name={focused ? name : (name + '-outline') as IconName} size={size} color={color} />
    );

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.gold.base,
        tabBarInactiveTintColor: theme.text.muted,
        tabBarStyle: {
          backgroundColor: theme.bg.panel,
          borderTopColor: theme.border.soft,
          height: Platform.OS === 'ios' ? 84 : 64,
          paddingBottom: Platform.OS === 'ios' ? 24 : 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontFamily: fontsLoaded ? FONT.arabic : undefined,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen name="index"     options={{ title: 'الرئيسية',  tabBarIcon: icon('home') }} />
      <Tabs.Screen name="projects"  options={{ title: 'المشاريع',  tabBarIcon: icon('folder') }} />
      <Tabs.Screen name="tutorials" options={{ title: 'الشروحات',  tabBarIcon: icon('book') }} />
      <Tabs.Screen name="settings"  options={{ title: 'الإعدادات', tabBarIcon: icon('settings') }} />
    </Tabs>
  );
}
