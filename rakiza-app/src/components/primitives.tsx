// Reusable primitives: Card, Btn, Badge, Stat, Field, Input, Select, Slider,
// SectionHead. All theme-aware and RTL-correct.

import {
  Pressable, View, Text, TextInput, ViewStyle, StyleSheet,
  Platform, TextStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { useTheme } from './ThemeProvider';
import { FONT, RADIUS, SP } from '../theme';

// ── Card ──────────────────────────────────────────────────
export function Card({
  children, style, hover, pad = 'md',
}: {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  hover?: boolean;
  pad?: 'none' | 'sm' | 'md' | 'lg';
}) {
  const { theme } = useTheme();
  const [hoverState, setHoverState] = useState(false);
  const padding = pad === 'none' ? 0 : pad === 'sm' ? SP[4] : pad === 'lg' ? SP[6] : SP[5];
  return (
    <Pressable
      onHoverIn={() => hover && setHoverState(true)}
      onHoverOut={() => hover && setHoverState(false)}
      style={[
        {
          backgroundColor: theme.bg.card,
          borderRadius: RADIUS.lg,
          borderWidth: 1,
          borderColor: hover && hoverState ? theme.border.gold : theme.border.soft,
          padding,
          ...(Platform.OS === 'ios'
            ? { shadowColor: '#000', shadowOpacity: 0.4, shadowOffset: { width: 0, height: 4 }, shadowRadius: 16 }
            : { elevation: 2 }),
        },
        style as any,
      ]}
    >
      {children}
    </Pressable>
  );
}

// ── Btn ───────────────────────────────────────────────────
export type BtnVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type BtnSize = 'sm' | 'md' | 'lg';

export function Btn({
  children, variant = 'primary', size = 'md', icon, onPress, disabled, style,
}: {
  children?: React.ReactNode;
  variant?: BtnVariant;
  size?: BtnSize;
  icon?: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  style?: ViewStyle | ViewStyle[];
}) {
  const { theme, fontsLoaded } = useTheme();
  const sizes: Record<BtnSize, ViewStyle & { fs: number; h: number }> = {
    sm: { paddingHorizontal: 14, paddingVertical: 7, fs: 12.5, h: 32 },
    md: { paddingHorizontal: 18, paddingVertical: 10, fs: 13.5, h: 40 },
    lg: { paddingHorizontal: 24, paddingVertical: 14, fs: 15, h: 50 },
  };
  const s = sizes[size];

  if (variant === 'primary') {
    return (
      <Pressable disabled={disabled} onPress={onPress}
        style={({ pressed }) => [
          {
            borderRadius: RADIUS.md,
            overflow: 'hidden',
            opacity: disabled ? 0.5 : pressed ? 0.92 : 1,
            shadowColor: theme.gold.base,
            shadowOpacity: 0.3, shadowRadius: 12, shadowOffset: { width: 0, height: 4 },
          },
          style as any,
        ]}>
        <LinearGradient
          colors={[theme.gold.bright, theme.gold.base]}
          start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
          style={{
            paddingHorizontal: s.paddingHorizontal!, paddingVertical: s.paddingVertical!,
            height: s.h, alignItems: 'center', justifyContent: 'center',
            flexDirection: 'row-reverse', gap: 8,
          }}
        >
          {icon}
          {children != null && (
            <Text style={{
              color: theme.text.inverse,
              fontSize: s.fs, fontWeight: '600',
              fontFamily: fontsLoaded ? FONT.arabic : undefined,
            }}>{children}</Text>
          )}
        </LinearGradient>
      </Pressable>
    );
  }

  const variants: Record<Exclude<BtnVariant, 'primary'>, { bg: string; fg: string; bd: string }> = {
    secondary: { bg: theme.bg.card, fg: theme.text.primary, bd: theme.border.soft },
    ghost:     { bg: 'transparent',  fg: theme.text.secondary, bd: 'transparent' },
    danger:    { bg: 'transparent',  fg: theme.danger,         bd: theme.danger },
  };
  const v = variants[variant];

  return (
    <Pressable disabled={disabled} onPress={onPress}
      style={({ pressed }) => [
        {
          paddingHorizontal: s.paddingHorizontal, paddingVertical: s.paddingVertical, height: s.h,
          backgroundColor: v.bg, borderColor: v.bd, borderWidth: 1,
          borderRadius: RADIUS.md,
          alignItems: 'center', justifyContent: 'center',
          flexDirection: 'row-reverse', gap: 8,
          opacity: disabled ? 0.5 : pressed ? 0.7 : 1,
        },
        style as any,
      ]}>
      {icon}
      {children != null && (
        <Text style={{
          color: v.fg, fontSize: s.fs, fontWeight: '500',
          fontFamily: fontsLoaded ? FONT.arabic : undefined,
        }}>{children}</Text>
      )}
    </Pressable>
  );
}

// ── Badge ─────────────────────────────────────────────────
export function Badge({
  children, color = 'gold', size = 'sm',
}: {
  children: React.ReactNode;
  color?: 'gold' | 'blue' | 'green' | 'red' | 'neutral';
  size?: 'sm' | 'md';
}) {
  const { theme, fontsLoaded } = useTheme();
  const palette = {
    gold:    { bg: theme.gold.soft,        fg: theme.gold.base,  bd: theme.border.gold },
    blue:    { bg: theme.blueprintSoft,    fg: theme.blueprint,  bd: theme.blueprint + '4D' },
    green:   { bg: theme.success + '1A',   fg: theme.success,    bd: theme.success + '4D' },
    red:     { bg: theme.danger + '1A',    fg: theme.danger,     bd: theme.danger + '4D' },
    neutral: { bg: theme.bg.elevated,      fg: theme.text.secondary, bd: theme.border.soft },
  }[color];
  return (
    <View style={{
      flexDirection: 'row-reverse', alignItems: 'center', gap: 6,
      paddingHorizontal: size === 'sm' ? 9 : 12, paddingVertical: size === 'sm' ? 3 : 5,
      borderRadius: RADIUS.pill,
      backgroundColor: palette.bg, borderColor: palette.bd, borderWidth: 1,
    }}>
      <Text style={{
        color: palette.fg,
        fontSize: size === 'sm' ? 11 : 12, fontWeight: '600',
        fontFamily: fontsLoaded ? FONT.arabic : undefined,
      }}>{children}</Text>
    </View>
  );
}

// ── Stat ──────────────────────────────────────────────────
export function Stat({
  label, value, unit, gold = true,
}: { label: string; value: string | number; unit?: string; gold?: boolean }) {
  const { theme, fontsLoaded } = useTheme();
  return (
    <View style={{ gap: 4 }}>
      <Text style={{
        fontSize: 11, color: theme.text.muted,
        textTransform: 'uppercase', letterSpacing: 1, fontWeight: '600',
        fontFamily: fontsLoaded ? FONT.arabic : undefined,
      }}>{label}</Text>
      <View style={{ flexDirection: 'row-reverse', alignItems: 'baseline', gap: 4 }}>
        <Text style={{
          fontSize: 22, fontWeight: '700',
          color: gold ? theme.gold.base : theme.text.primary,
          fontFamily: fontsLoaded ? FONT.mono : undefined,
        }}>{value}</Text>
        {unit && <Text style={{
          fontSize: 12, color: theme.text.muted,
          fontFamily: fontsLoaded ? FONT.mono : undefined,
        }}>{unit}</Text>}
      </View>
    </View>
  );
}

// ── Field wrapper ─────────────────────────────────────────
export function Field({
  label, hint, error, required, children,
}: {
  label: string; hint?: string; error?: string; required?: boolean;
  children: React.ReactNode;
}) {
  const { theme, fontsLoaded } = useTheme();
  return (
    <View style={{ gap: 6 }}>
      <View style={{ flexDirection: 'row-reverse', justifyContent: 'space-between' }}>
        <Text style={{
          fontSize: 12.5, color: theme.text.secondary, fontWeight: '500',
          fontFamily: fontsLoaded ? FONT.arabic : undefined,
        }}>
          {label}{required && <Text style={{ color: theme.gold.base }}> *</Text>}
        </Text>
        {hint && <Text style={{
          fontSize: 11, color: theme.text.muted,
          fontFamily: fontsLoaded ? FONT.mono : undefined,
        }}>{hint}</Text>}
      </View>
      {children}
      {error && <Text style={{ fontSize: 11.5, color: theme.danger }}>{error}</Text>}
    </View>
  );
}

// ── Input ─────────────────────────────────────────────────
export function Input({
  value, onChangeText, placeholder, keyboardType, suffix,
}: {
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'numeric' | 'decimal-pad' | 'email-address';
  suffix?: string;
}) {
  const { theme, fontsLoaded } = useTheme();
  const [focused, setFocused] = useState(false);
  const isNumeric = keyboardType && keyboardType !== 'default' && keyboardType !== 'email-address';
  return (
    <View style={{ position: 'relative' }}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.text.muted}
        keyboardType={keyboardType}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          paddingVertical: 11,
          paddingHorizontal: 14,
          paddingLeft: suffix ? 56 : 14,
          fontSize: 14,
          backgroundColor: theme.bg.input,
          borderColor: focused ? theme.gold.base : theme.border.soft,
          borderWidth: 1,
          borderRadius: RADIUS.md,
          color: theme.text.primary,
          fontFamily: isNumeric && fontsLoaded ? FONT.mono : (fontsLoaded ? FONT.arabic : undefined),
          textAlign: 'right',
        }}
      />
      {suffix && (
        <Text style={{
          position: 'absolute', left: 14, top: 0, bottom: 0,
          textAlignVertical: 'center', lineHeight: 44,
          fontSize: 12, color: theme.text.muted,
          fontFamily: fontsLoaded ? FONT.mono : undefined,
        }}>{suffix}</Text>
      )}
    </View>
  );
}

// ── Select (segmented or pickable list) ────────────────────
export function Select<T extends string>({
  value, onChange, options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  const { theme, fontsLoaded } = useTheme();
  return (
    <View style={{ flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 6 }}>
      {options.map(o => {
        const active = o.value === value;
        return (
          <Pressable key={o.value} onPress={() => onChange(o.value)}
            style={{
              paddingHorizontal: 12, paddingVertical: 8,
              borderRadius: RADIUS.md,
              borderWidth: 1,
              borderColor: active ? theme.gold.base : theme.border.soft,
              backgroundColor: active ? theme.gold.soft : theme.bg.input,
            }}>
            <Text style={{
              fontSize: 13,
              color: active ? theme.gold.base : theme.text.secondary,
              fontWeight: active ? '600' : '500',
              fontFamily: fontsLoaded ? FONT.arabic : undefined,
            }}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

// ── Slider — track + draggable thumb (no native slider dep) ────────────
export function Slider({
  value, onChange, min, max, step = 1, suffix,
}: {
  value: number;
  onChange: (v: number) => void;
  min: number; max: number; step?: number; suffix?: string;
}) {
  const { theme, fontsLoaded } = useTheme();
  const [trackW, setTrackW] = useState(0);
  const pct = (value - min) / (max - min);

  const handle = (locX: number) => {
    const ratio = Math.max(0, Math.min(1, locX / trackW));
    let v = min + ratio * (max - min);
    v = Math.round(v / step) * step;
    onChange(Math.max(min, Math.min(max, v)));
  };

  return (
    <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 12 }}>
      <View
        style={{
          flex: 1, height: 28, justifyContent: 'center',
        }}
        onLayout={e => setTrackW(e.nativeEvent.layout.width)}
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
        onResponderGrant={e => handle(e.nativeEvent.locationX)}
        onResponderMove={e => handle(e.nativeEvent.locationX)}
      >
        <View style={{ height: 4, backgroundColor: theme.bg.input, borderRadius: 2 }} />
        <View style={{
          position: 'absolute', height: 4,
          left: 0, width: trackW * pct,
          backgroundColor: theme.gold.base, borderRadius: 2,
        }} />
        <View style={{
          position: 'absolute', left: trackW * pct - 9,
          width: 18, height: 18, borderRadius: 9,
          backgroundColor: theme.gold.bright,
          borderWidth: 2, borderColor: theme.bg.base,
        }} />
      </View>
      <Text style={{
        minWidth: 60, textAlign: 'left',
        fontSize: 13, color: theme.gold.base, fontWeight: '600',
        fontFamily: fontsLoaded ? FONT.mono : undefined,
      }}>
        {value % 1 === 0 ? value : value.toFixed(1)}
        {suffix ? <Text style={{ color: theme.text.muted }}> {suffix}</Text> : null}
      </Text>
    </View>
  );
}

// ── SectionHead ───────────────────────────────────────────
export function SectionHead({
  eyebrow, title, action,
}: { eyebrow?: string; title: string; action?: React.ReactNode }) {
  const { theme, fontsLoaded } = useTheme();
  return (
    <View style={{
      flexDirection: 'row-reverse', justifyContent: 'space-between',
      alignItems: 'flex-end', marginBottom: SP[5], gap: SP[4],
    }}>
      <View>
        {eyebrow && (
          <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <View style={{ width: 16, height: 1, backgroundColor: theme.gold.base }} />
            <Text style={{
              fontSize: 11, color: theme.gold.base,
              letterSpacing: 1.4, textTransform: 'uppercase',
              fontFamily: fontsLoaded ? FONT.mono : undefined,
            }}>{eyebrow}</Text>
          </View>
        )}
        <Text style={{
          fontSize: 24, fontWeight: '700', letterSpacing: -0.4,
          color: theme.text.primary, textAlign: 'right',
          fontFamily: fontsLoaded ? FONT.arabic : undefined,
        }}>{title}</Text>
      </View>
      {action}
    </View>
  );
}

// ── BlueprintGrid background ──────────────────────────────
export function BlueprintGrid({ size = 40, opacity = 0.4 }: { size?: number; opacity?: number }) {
  const { theme } = useTheme();
  return (
    <View pointerEvents="none" style={{ ...StyleSheet.absoluteFillObject, opacity }}>
      {/* Vertical lines */}
      <View style={{ position: 'absolute', inset: 0 }}>
        {Array.from({ length: 30 }).map((_, i) => (
          <View key={'v' + i} style={{
            position: 'absolute', top: 0, bottom: 0,
            left: i * size, width: 1, backgroundColor: theme.grid,
          }} />
        ))}
      </View>
      <View style={{ position: 'absolute', inset: 0 }}>
        {Array.from({ length: 60 }).map((_, i) => (
          <View key={'h' + i} style={{
            position: 'absolute', left: 0, right: 0,
            top: i * size, height: 1, backgroundColor: theme.grid,
          }} />
        ))}
      </View>
    </View>
  );
}
