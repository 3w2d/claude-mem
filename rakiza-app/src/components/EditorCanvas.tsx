import { useState, useMemo } from 'react';
import { View, Text, GestureResponderEvent, LayoutChangeEvent, StyleSheet } from 'react-native';
import Svg, { Defs, Pattern, Path, Rect, Line, Circle, G } from 'react-native-svg';
import { useTheme } from './ThemeProvider';
import { FONT, RADIUS } from '../theme';
import type { FloorGeometry } from '../types';

export type DrawTool = 'select' | 'wall' | 'column' | 'door' | 'window' | 'eraser';

interface Props {
  floor: FloorGeometry;
  tool: DrawTool;
  selectedId: string | null;
  onAddWall: (w: { x1: number; y1: number; x2: number; y2: number }) => void;
  onAddColumn: (c: { x: number; y: number; size: number }) => void;
  onAddOpening: (kind: 'doors' | 'windows', o: { wallId: string; t: number; width: number }) => void;
  onDeleteAt: (id: string) => void;
  onSelect: (id: string | null) => void;
}

const SNAP = 0.25;
const WALL_THICK = 0.20;
const COL_DEFAULT = 0.30;
const DOOR_W = 0.9;
const WIN_W = 1.2;

const snap = (v: number) => Math.round(v / SNAP) * SNAP;

export function EditorCanvas(p: Props) {
  const { theme, fontsLoaded } = useTheme();
  const [size, setSize] = useState({ w: 320, h: 360 });
  const [draft, setDraft] = useState<{ x1: number; y1: number; x2: number; y2: number } | null>(null);

  const bb = useMemo(() => bboxOrDefault(p.floor), [p.floor]);

  const scale = useMemo(() => {
    const wRange = Math.max(8, bb.maxX - bb.minX + 6);
    const hRange = Math.max(8, bb.maxY - bb.minY + 6);
    const sx = (size.w - 24) / wRange;
    const sy = (size.h - 24) / hRange;
    return Math.max(8, Math.min(sx, sy, 60));
  }, [bb, size]);

  const cx = (bb.minX + bb.maxX) / 2;
  const cy = (bb.minY + bb.maxY) / 2;

  const w2s = (x: number, y: number) => ({
    x: size.w / 2 + (x - cx) * scale,
    y: size.h / 2 - (y - cy) * scale,
  });
  const s2w = (sx: number, sy: number) => ({
    x: cx + (sx - size.w / 2) / scale,
    y: cy - (sy - size.h / 2) / scale,
  });

  const onLayout = (e: LayoutChangeEvent) =>
    setSize({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height });

  const tap = (e: GestureResponderEvent) => {
    const { locationX: lx, locationY: ly } = e.nativeEvent;
    const w = s2w(lx, ly);
    const x = snap(w.x), y = snap(w.y);

    if (p.tool === 'wall') {
      if (!draft) setDraft({ x1: x, y1: y, x2: x, y2: y });
      else {
        if (Math.hypot(x - draft.x1, y - draft.y1) > 0.1) {
          p.onAddWall({ x1: draft.x1, y1: draft.y1, x2: x, y2: y });
        }
        setDraft({ x1: x, y1: y, x2: x, y2: y });
      }
    } else if (p.tool === 'column') {
      p.onAddColumn({ x, y, size: COL_DEFAULT });
    } else if (p.tool === 'door' || p.tool === 'window') {
      const hit = pickWall(p.floor, w.x, w.y, 0.5);
      if (hit) {
        p.onAddOpening(p.tool === 'door' ? 'doors' : 'windows', {
          wallId: hit.id, t: hit.t,
          width: p.tool === 'door' ? DOOR_W : WIN_W,
        });
      }
    } else if (p.tool === 'eraser') {
      const hit = pickAny(p.floor, w.x, w.y);
      if (hit) p.onDeleteAt(hit.id);
    } else if (p.tool === 'select') {
      const hit = pickAny(p.floor, w.x, w.y);
      p.onSelect(hit?.id ?? null);
    }
  };

  const move = (e: GestureResponderEvent) => {
    if (p.tool !== 'wall' || !draft) return;
    const w = s2w(e.nativeEvent.locationX, e.nativeEvent.locationY);
    setDraft(d => d ? { ...d, x2: snap(w.x), y2: snap(w.y) } : d);
  };

  return (
    <View
      style={[styles.canvas, { backgroundColor: theme.bg.panel, borderColor: theme.border.soft }]}
      onLayout={onLayout}
      onStartShouldSetResponder={() => true}
      onMoveShouldSetResponder={() => p.tool === 'wall' && !!draft}
      onResponderGrant={tap}
      onResponderMove={move}
    >
      <Svg width={size.w} height={size.h}>
        <Defs>
          <Pattern id="grid-fine" width={scale} height={scale} patternUnits="userSpaceOnUse">
            <Path d={`M ${scale} 0 L 0 0 0 ${scale}`} fill="none" stroke={theme.grid} strokeWidth={0.5} />
          </Pattern>
        </Defs>
        <Rect width={size.w} height={size.h} fill="url(#grid-fine)" />

        {/* origin axes */}
        <Line x1={0} y1={size.h/2 + cy*scale} x2={size.w} y2={size.h/2 + cy*scale} stroke={theme.gold.dim} strokeOpacity={0.4} strokeWidth={0.7} />
        <Line x1={size.w/2 - cx*scale} y1={0} x2={size.w/2 - cx*scale} y2={size.h} stroke={theme.gold.dim} strokeOpacity={0.4} strokeWidth={0.7} />

        {/* walls */}
        {p.floor.walls.map(w => {
          const a = w2s(w.x1, w.y1), b = w2s(w.x2, w.y2);
          const sel = w.id === p.selectedId;
          return (
            <Line key={w.id}
              x1={a.x} y1={a.y} x2={b.x} y2={b.y}
              stroke={sel ? theme.gold.bright : theme.text.primary}
              strokeWidth={WALL_THICK * scale}
              strokeLinecap="butt"
            />
          );
        })}

        {/* doors */}
        {p.floor.doors.map(d => {
          const wall = p.floor.walls.find(x => x.id === d.wallId);
          if (!wall) return null;
          const cx2 = wall.x1 + (wall.x2 - wall.x1) * d.t;
          const cy2 = wall.y1 + (wall.y2 - wall.y1) * d.t;
          const a = w2s(cx2, cy2);
          const r = Math.max(3, (d.width * scale) / 2);
          return <Circle key={d.id} cx={a.x} cy={a.y} r={r} fill={theme.bg.panel} stroke={theme.gold.base} strokeWidth={1.5} />;
        })}

        {/* windows */}
        {p.floor.windows.map(d => {
          const wall = p.floor.walls.find(x => x.id === d.wallId);
          if (!wall) return null;
          const cx2 = wall.x1 + (wall.x2 - wall.x1) * d.t;
          const cy2 = wall.y1 + (wall.y2 - wall.y1) * d.t;
          const a = w2s(cx2, cy2);
          const ang = Math.atan2(wall.y2 - wall.y1, wall.x2 - wall.x1);
          const half = (d.width / 2) * scale;
          const dx = Math.cos(ang) * half, dy = -Math.sin(ang) * half;
          return <Line key={d.id} x1={a.x - dx} y1={a.y - dy} x2={a.x + dx} y2={a.y + dy} stroke={theme.gold.base} strokeWidth={2.5} />;
        })}

        {/* columns */}
        {p.floor.columns.map(c => {
          const a = w2s(c.x, c.y);
          const sz = c.size * scale;
          const sel = c.id === p.selectedId;
          return (
            <Rect key={c.id} x={a.x - sz / 2} y={a.y - sz / 2} width={sz} height={sz}
              fill={sel ? theme.gold.bright : theme.gold.soft}
              stroke={theme.gold.base} strokeWidth={1.2}
            />
          );
        })}

        {/* draft */}
        {draft && (() => {
          const a = w2s(draft.x1, draft.y1), b = w2s(draft.x2, draft.y2);
          return <Line
            x1={a.x} y1={a.y} x2={b.x} y2={b.y}
            stroke={theme.gold.base} strokeOpacity={0.55}
            strokeWidth={WALL_THICK * scale} strokeLinecap="butt"
          />;
        })()}
      </Svg>

      <Text style={{
        position: 'absolute', top: 10, right: 12,
        fontSize: 10, color: theme.gold.dim, letterSpacing: 0.8,
        fontFamily: fontsLoaded ? FONT.mono : undefined,
      }}>SCALE 1m = {scale.toFixed(0)}px</Text>
      <Text style={{
        position: 'absolute', bottom: 10, left: 12,
        fontSize: 10, color: theme.text.muted,
        fontFamily: fontsLoaded ? FONT.mono : undefined,
      }}>walls:{p.floor.walls.length} cols:{p.floor.columns.length} doors:{p.floor.doors.length} wins:{p.floor.windows.length}</Text>
    </View>
  );
}

function bboxOrDefault(f: FloorGeometry) {
  if (!f.walls.length && !f.columns.length) return { minX: -8, maxX: 8, minY: -6, maxY: 6 };
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const w of f.walls) {
    minX = Math.min(minX, w.x1, w.x2); maxX = Math.max(maxX, w.x1, w.x2);
    minY = Math.min(minY, w.y1, w.y2); maxY = Math.max(maxY, w.y1, w.y2);
  }
  for (const c of f.columns) {
    minX = Math.min(minX, c.x); maxX = Math.max(maxX, c.x);
    minY = Math.min(minY, c.y); maxY = Math.max(maxY, c.y);
  }
  return { minX, maxX, minY, maxY };
}

function projectOn(px: number, py: number, x1: number, y1: number, x2: number, y2: number) {
  const dx = x2 - x1, dy = y2 - y1;
  const l = dx * dx + dy * dy;
  if (l === 0) return -1;
  return ((px - x1) * dx + (py - y1) * dy) / l;
}

function pickWall(f: FloorGeometry, x: number, y: number, tol: number) {
  for (const w of f.walls) {
    const t = projectOn(x, y, w.x1, w.y1, w.x2, w.y2);
    if (t < 0 || t > 1) continue;
    const px = w.x1 + (w.x2 - w.x1) * t;
    const py = w.y1 + (w.y2 - w.y1) * t;
    if (Math.hypot(px - x, py - y) < tol) return { id: w.id, t };
  }
  return null;
}

function pickAny(f: FloorGeometry, x: number, y: number): { id: string } | null {
  for (const c of f.columns) {
    if (Math.abs(c.x - x) < c.size && Math.abs(c.y - y) < c.size) return { id: c.id };
  }
  const w = pickWall(f, x, y, WALL_THICK);
  if (w) return { id: w.id };
  for (const d of f.doors) {
    const wall = f.walls.find(x2 => x2.id === d.wallId);
    if (!wall) continue;
    const cxp = wall.x1 + (wall.x2 - wall.x1) * d.t;
    const cyp = wall.y1 + (wall.y2 - wall.y1) * d.t;
    if (Math.hypot(cxp - x, cyp - y) < d.width / 2) return { id: d.id };
  }
  return null;
}

const styles = StyleSheet.create({
  canvas: {
    flex: 1, borderRadius: RADIUS.lg, borderWidth: 1, overflow: 'hidden',
  },
});
