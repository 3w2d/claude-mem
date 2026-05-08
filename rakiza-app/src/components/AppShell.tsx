import { useEffect } from 'react';
import { View, Text, Pressable, useWindowDimensions, ScrollView, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from './ThemeProvider';
import { useStore, type Page } from '../store/projects';
import { Landing } from '../screens/Landing';
import { Dashboard } from '../screens/Dashboard';
import { Calculator } from '../screens/Calculator';
import { Projects } from '../screens/Projects';
import { Reports } from '../screens/Reports';
import { RukizaLogo } from './RukizaLogo';
import { FONT, RADIUS, SP } from '../theme';

const NAV: { id: Page; label: string; icon: string }[] = [
  { id: 'dashboard',  label: 'لوحة التحكم',         icon: '⊞' },
  { id: 'calculator', label: 'الحاسبة الإنشائية',    icon: '⚡' },
  { id: 'projects',   label: 'مشاريعي',             icon: '🗂' },
  { id: 'reports',    label: 'التقارير',            icon: '📊' },
];

export function AppShell() {
  const { theme, fontsLoaded, toggle } = useTheme();
  const page = useStore(s => s.page);
  const setPage = useStore(s => s.setPage);
  const projects = useStore(s => s.projects);
  const hydrated = useStore(s => s.hydrated);
  const hydrate = useStore(s => s.hydrate);
  const { width } = useWindowDimensions();
  const wide = width >= 900;

  useEffect(() => { hydrate(); }, [hydrate]);

  if (!hydrated) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.bg.base, alignItems: 'center', justifyContent: 'center' }}>
        <RukizaLogo size={56} />
      </View>
    );
  }

  if (page === 'landing') {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg.base }} edges={['top']}>
        <Landing />
      </SafeAreaView>
    );
  }

  const Body = (() => {
    switch (page) {
      case 'dashboard': return <Dashboard />;
      case 'calculator': return <Calculator />;
      case 'projects': return <Projects />;
      case 'reports': return <Reports />;
      default: return <Dashboard />;
    }
  })();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg.base }} edges={['top', 'right', 'left']}>
      <View style={{ flex: 1, flexDirection: wide ? 'row-reverse' : 'column' }}>
        {wide ? (
          <Sidebar
            page={page} setPage={setPage}
            onLanding={() => setPage('landing')}
            toggleTheme={toggle}
            projectCount={projects.length}
          />
        ) : null}

        <View style={{ flex: 1 }}>{Body}</View>

        {!wide && (
          <BottomTabs
            page={page} setPage={setPage}
            onLanding={() => setPage('landing')}
            toggleTheme={toggle}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

function Sidebar({
  page, setPage, onLanding, toggleTheme, projectCount,
}: {
  page: Page;
  setPage: (p: Page) => void;
  onLanding: () => void;
  toggleTheme: () => void;
  projectCount: number;
}) {
  const { theme, fontsLoaded } = useTheme();
  return (
    <ScrollView
      style={{ width: 248, backgroundColor: theme.bg.panel, borderLeftWidth: 1, borderLeftColor: theme.border.soft }}
      contentContainerStyle={{ padding: SP[4], minHeight: '100%' as any }}
    >
      <LinearGradient
        colors={[theme.gold.soft, 'transparent']}
        start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 0.6 }}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 200 } as any}
        pointerEvents="none"
      />
      <View style={{
        paddingBottom: SP[4], marginBottom: SP[3],
        borderBottomWidth: 1, borderBottomColor: theme.border.soft,
      }}>
        <RukizaLogo size={32} />
      </View>

      <View style={{ flex: 1, gap: 2 }}>
        {NAV.map(item => {
          const active = item.id === page;
          return (
            <Pressable
              key={item.id}
              onPress={() => setPage(item.id)}
              style={({ pressed }) => ({
                flexDirection: 'row-reverse', alignItems: 'center', gap: 12,
                paddingHorizontal: 12, paddingVertical: 10,
                borderRadius: RADIUS.md,
                backgroundColor: active ? theme.gold.soft : (pressed ? theme.bg.elevated : 'transparent'),
                borderWidth: 1,
                borderColor: active ? theme.border.gold : 'transparent',
              })}
            >
              <Text style={{
                fontSize: 16, opacity: active ? 1 : 0.7, width: 20, textAlign: 'center',
                color: active ? theme.gold.base : theme.text.secondary,
              }}>{item.icon}</Text>
              <Text style={{
                flex: 1, fontSize: 13.5,
                color: active ? theme.gold.base : theme.text.secondary,
                fontWeight: active ? '600' : '500',
                textAlign: 'right',
                fontFamily: fontsLoaded ? FONT.arabic : undefined,
              }}>{item.label}</Text>
              {item.id === 'projects' && projectCount > 0 && (
                <Text style={{
                  fontSize: 10.5, fontWeight: '700',
                  paddingHorizontal: 7, paddingVertical: 2, borderRadius: 100,
                  color: active ? theme.text.inverse : theme.text.muted,
                  backgroundColor: active ? theme.gold.base : theme.border.soft,
                  fontFamily: fontsLoaded ? FONT.mono : undefined,
                }}>{projectCount}</Text>
              )}
            </Pressable>
          );
        })}
      </View>

      <View style={{
        marginTop: SP[4], paddingTop: SP[4],
        borderTopWidth: 1, borderTopColor: theme.border.soft, gap: SP[2],
      }}>
        <View style={{
          padding: 12,
          backgroundColor: theme.gold.soft,
          borderRadius: RADIUS.md, borderWidth: 1, borderColor: theme.border.gold,
        }}>
          <Text style={{
            fontSize: 10, color: theme.gold.base, fontWeight: '700', letterSpacing: 0.8,
            textTransform: 'uppercase', marginBottom: 4,
            fontFamily: fontsLoaded ? FONT.mono : undefined,
          }}>⚠ تنبيه</Text>
          <Text style={{
            fontSize: 11, color: theme.text.secondary, lineHeight: 18,
            fontFamily: fontsLoaded ? FONT.arabic : undefined, textAlign: 'right',
          }}>للتقدير الأولي فقط. يستوجب مراجعة مهندس مرخّص.</Text>
        </View>

        <View style={{ flexDirection: 'row-reverse', gap: 6 }}>
          <Pressable
            onPress={toggleTheme}
            style={({ pressed }) => ({
              flex: 1, paddingVertical: 8, alignItems: 'center',
              borderRadius: RADIUS.md, backgroundColor: theme.bg.elevated,
              borderWidth: 1, borderColor: theme.border.soft,
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <Text style={{ fontSize: 14, color: theme.text.secondary }}>
              {theme.mode === 'dark' ? '☀' : '☾'}
            </Text>
          </Pressable>
          <Pressable
            onPress={onLanding}
            style={({ pressed }) => ({
              flex: 2, paddingVertical: 8, alignItems: 'center',
              borderRadius: RADIUS.md, backgroundColor: theme.bg.elevated,
              borderWidth: 1, borderColor: theme.border.soft,
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <Text style={{
              fontSize: 11.5, color: theme.text.secondary,
              fontFamily: fontsLoaded ? FONT.arabic : undefined,
            }}>→ الرئيسية</Text>
          </Pressable>
        </View>

        <Text style={{
          fontSize: 9.5, color: theme.text.muted, textAlign: 'center', letterSpacing: 0.5,
          fontFamily: fontsLoaded ? FONT.mono : undefined,
        }}>ركيزة v1.0 · SBC 304</Text>
      </View>
    </ScrollView>
  );
}

function BottomTabs({
  page, setPage, onLanding, toggleTheme,
}: {
  page: Page;
  setPage: (p: Page) => void;
  onLanding: () => void;
  toggleTheme: () => void;
}) {
  const { theme, fontsLoaded } = useTheme();
  return (
    <View style={{
      flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-around',
      backgroundColor: theme.bg.panel,
      borderTopWidth: 1, borderTopColor: theme.border.soft,
      paddingVertical: SP[2], paddingHorizontal: SP[2],
      paddingBottom: Platform.OS === 'ios' ? SP[6] : SP[2],
    }}>
      {NAV.map(item => {
        const active = item.id === page;
        return (
          <Pressable
            key={item.id}
            onPress={() => setPage(item.id)}
            hitSlop={6}
            style={{ flex: 1, alignItems: 'center', paddingVertical: 6 }}
          >
            <Text style={{
              fontSize: 18, color: active ? theme.gold.base : theme.text.muted, marginBottom: 2,
            }}>{item.icon}</Text>
            <Text style={{
              fontSize: 10, color: active ? theme.gold.base : theme.text.muted,
              fontWeight: active ? '700' : '500',
              fontFamily: fontsLoaded ? FONT.arabic : undefined,
            }} numberOfLines={1}>{item.label}</Text>
          </Pressable>
        );
      })}
      <Pressable onPress={toggleTheme} style={{ paddingHorizontal: 8, paddingVertical: 6 }}>
        <Text style={{ fontSize: 16, color: theme.text.muted }}>
          {theme.mode === 'dark' ? '☀' : '☾'}
        </Text>
      </Pressable>
      <Pressable onPress={onLanding} style={{ paddingHorizontal: 8, paddingVertical: 6 }}>
        <Text style={{ fontSize: 14, color: theme.text.muted }}>↱</Text>
      </Pressable>
    </View>
  );
}
