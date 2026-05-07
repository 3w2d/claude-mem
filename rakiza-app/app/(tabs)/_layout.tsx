import { Tabs } from 'expo-router';
import { Text, View, StyleSheet, Platform } from 'react-native';
import { theme } from '../../src/theme';

function TabIcon({ icon, focused }: { icon: string; focused: boolean }) {
  return (
    <View style={[styles.iconWrap, focused && styles.iconActive]}>
      <Text style={{ fontSize: 22 }}>{icon}</Text>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarShowLabel: false,
      tabBarStyle: styles.tabBar,
    }}>
      <Tabs.Screen name="index" options={{ tabBarIcon: ({ focused }) => <TabIcon icon="🏠" focused={focused} /> }} />
      <Tabs.Screen name="ai" options={{ tabBarIcon: ({ focused }) => <TabIcon icon="🤖" focused={focused} /> }} />
      <Tabs.Screen name="analytics" options={{ tabBarIcon: ({ focused }) => <TabIcon icon="📈" focused={focused} /> }} />
      <Tabs.Screen name="settings" options={{ tabBarIcon: ({ focused }) => <TabIcon icon="⚙️" focused={focused} /> }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 28 : 16,
    left: 24, right: 24, height: 64,
    borderRadius: 32,
    borderTopWidth: 0,
    borderWidth: 1,
    borderColor: theme.border.light,
    backgroundColor: theme.bg.surface,
    elevation: 8,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
  },
  iconWrap: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  iconActive: { backgroundColor: theme.accent.blueSoft, borderWidth: 1, borderColor: theme.border.blue },
});
