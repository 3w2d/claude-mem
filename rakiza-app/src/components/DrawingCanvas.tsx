import { useRef, useState, useMemo } from 'react';
import { View, Text, StyleSheet, GestureResponderEvent, LayoutChangeEvent } from 'react-native';
import Svg, { Defs, Pattern, Path, Rect, Line, Circle, G } from 'react-native-svg';
import type { Floor } from '../types';
import { theme } from '../theme';

export type DrawTool = 'select' | 'wall' | 'column' | 'door' | 'window' | 'eraser';

interface Props {
  floor: Floor;
  tool: DrawTool;
  onAddWall: (w: { x1: number; y1: number; x2: number; y2: number }) => void;
  onAddColumn: (c: { x: number; y: number; size: number }) => void;
  onAddOpening: (kind: 'doors' | 'windows', o: { x: number; y: number; width: number; wallId?: string; t?: number }) => void;
  onDeleteAt: (x: number, y: number) => void;
  onSelect?: (id: string | null) => void;
  selectedId?: string | null;
}

const SNAP = 0.25;
const WALL_THICK = 0.20;
const COL_DEFAULT = 0.30;
const DOOR_W = 0.9;
const WIN_W = 1.2;

function snap(v: number) { return Math.round(v / SNAP) * SNAP; }

export function DrawingCanvas(p: Props) {
  const [size, setSize] = useState({ w: 320, h: 360 });
  const [draft, setDraft] = useState<{ x1: number; y1: number; x2: number; y2: number } | null>(null);
  const scale = useMemo(() => {
    const bb = bbox(p.floor);
    const w = Math.max(8, bb.maxX - bb.minX + 8);
    const h = Math.max(8, bb.maxY - bb.minY + 8);
    const sx = (size.w - 24) / w;
    const sy = (size.h - 24) / h;
    return Math.max(8, Math.min(sx, sy, 60));
  }, [p.floor, size]);

  const bb = bbox(p.floor);
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

  const onLayout = (e: LayoutChangeEvent) => setSize({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height });

  const tap = (e: GestureResponderEvent) => {
    const { locationX: lx, locationY: ly } = e.nativeEvent;
    const w = s2w(lx, ly);
    const x = snap(w.x), y = snap(w.y);

    if (p.tool === 'wall') {
      if (!draft) setDraft({ x1: x, y1: y, x2: x, y2: y });
      else {
        if (Math.hypot(x - draft.x1, y - draft.y1) > 0.1) p.onAddWall({ x1: draft.x1, y1: draft.y1, x2: x, y2: y });
        setDraft({ x1: x, y1: y, x2: x, y2: y });
      }
    } else if (p.tool === 'column') {
      p.onAddColumn({ x, y, size: COL_DEFAULT });
    } else if (p.tool === 'door') {
      const hit = pickWall(p.floor, w.x, w.y, 0.5);
      if (hit) p.onAddOpening('doors', { x, y, width: DOOR_W, wallId: hit.id, t: hit.t });
    } else if (p.tool === 'window') {
      const hit = pickWall(p.floor, w.x, w.y, 0.5);
      if (hit) p.onAddOpening('windows', { x, y, width: WIN_W, wallId: hit.id, t: hit.t });
    } else if (p.tool === 'eraser') {
      p.onDeleteAt(w.x, w.y);
    } else if (p.tool === 'select') {
      const hit = pickAny(p.floor, w.x, w.y);
      p.onSelect?.(hit?.id ?? null);
    }
  };

  const move = (e: GestureResponderEvent) => {
    if (p.tool !== 'wall' || !draft) return;
    const { locationX: lx, locationY: ly } = e.nativeEvent;
    const w = s2w(lx, ly);
    setDraft(d => d ? { ...d, x2: snap(w.x), y2: snap(w.y) } : d);
  };

  const cancelDraft = () => setDraft(null);

  return (
    <View
      style={styles.canvas}
      onLayout={onLayout}
      onStartShouldSetResponder={() => true}
      onMoveShouldSetResponder={() => p.tool === 'wall' && !!draft}
      onResponderGrant={tap}
      onResponderMove={move}
      onResponderTerminate={cancelDraft}
    >
      <Svg width={size.w} height={size.h}>
        <Defs>
          <Pattern id="grid" width={scale} height={scale} patternUnits="userSpaceOnUse">
            <Path d={`M ${scale} 0 L 0 0 0 ${scale}`} fill="none" stroke={theme.bg.grid} strokeWidth={0.5} />
          </Pattern>
        </Defs>
        <Rect width={size.w} height={size.h} fill="url(#grid)" />
        {/* Origin axes */}
        <Line x1={0} y1={size.h/2 + cy*scale} x2={size.w} y2={size.h/2 + cy*scale} stroke={theme.bg.gridStrong} strokeWidth={0.7} />
        <Line x1={size.w/2 - cx*scale} y1={0} x2={size.w/2 - cx*scale} y2={size.h} stroke={theme.bg.gridStrong} strokeWidth={0.7} />
        {/* Walls */}
        {p.floor.walls.map(w => {
          const a = w2s(w.x1, w.y1), b = w2s(w.x2, w.y2);
          const sel = p.selectedId === w.id;
          return (
            <Line key={w.id} x1={a.x} y1={a.y} x2={b.x} y2={b.y}
              stroke={sel ? theme.accent.blue : theme.text.primary}
              strokeWidth={WALL_THICK * scale} strokeLinecap="butt" />
          );
        })}
        {/* Door / window markers (simplified) */}
        {p.floor.doors.map(d => {
          const wall = p.floor.walls.find(w => w.id === d.wallId);
          if (!wall) return null;
          const cx2 = wall.x1 + (wall.x2 - wall.x1) * d.t;
          const cy2 = wall.y1 + (wall.y2 - wall.y1) * d.t;
          const a = w2s(cx2, cy2);
          return <Circle key={d.id} cx={a.x} cy={a.y} r={Math.max(3, d.width * scale / 2)} fill="#fff" stroke={theme.accent.blue} strokeWidth={1.5} />;
        })}
        {p.floor.windows.map(d => {
          const wall = p.floor.walls.find(w => w.id === d.wallId);
          if (!wall) return null;
          const cx2 = wall.x1 + (wall.x2 - wall.x1) * d.t;
          const cy2 = wall.y1 + (wall.y2 - wall.y1) * d.t;
          const a = w2s(cx2, cy2);
          const ang = Math.atan2(wall.y2 - wall.y1, wall.x2 - wall.x1);
          const half = (d.width / 2) * scale;
          const dx = Math.cos(ang) * half, dy = -Math.sin(ang) * half;
          return <Line key={d.id} x1={a.x - dx} y1={a.y - dy} x2={a.x + dx} y2={a.y + dy} stroke={theme.accent.blue} strokeWidth={2.5} />;
        })}
        {/* Columns */}
        {p.floor.columns.map(c => {
          const a = w2s(c.x, c.y);
          const sz = c.size * scale;
          const sel = p.selectedId === c.id;
          return (
            <Rect key={c.id} x={a.x - sz/2} y={a.y - sz/2} width={sz} height={sz}
              fill={sel ? theme.accent.blue : theme.accent.blueSoft}
              stroke={theme.accent.blue} strokeWidth={1.2} />
          );
        })}
        {/* Wall draft */}
        {draft && (() => {
          const a = w2s(draft.x1, draft.y1), b = w2s(draft.x2, draft.y2);
          return <Line x1={a.x} y1={a.y} x2={b.x} y2={b.y}
            stroke={theme.accent.blue} strokeWidth={WALL_THICK * scale}
            strokeOpacity={0.5} strokeLinecap="butt" />;
        })()}
      </Svg>
      <View style={styles.coord}>
        <Text style={styles.coordText}>المقياس: 1 م = {scale.toFixed(0)} px</Text>
      </View>
    </View>
  );
}

function bbox(f: Floor) {
  if (!f.walls.length) return { minX: -5, maxX: 15, minY: -5, maxY: 15 };
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  f.walls.forEach(w => {
    minX = Math.min(minX, w.x1, w.x2); maxX = Math.max(maxX, w.x1, w.x2);
    minY = Math.min(minY, w.y1, w.y2); maxY = Math.max(maxY, w.y1, w.y2);
  });
  return { minX, maxX, minY, maxY };
}

function projectOn(px: number, py: number, x1: number, y1: number, x2: number, y2: number) {
  const dx = x2 - x1, dy = y2 - y1;
  const l = dx*dx + dy*dy;
  if (l === 0) return -1;
  return ((px - x1) * dx + (py - y1) * dy) / l;
}
function pickWall(f: Floor, x: number, y: number, tol: number) {
  for (const w of f.walls) {
    const t = projectOn(x, y, w.x1, w.y1, w.x2, w.y2);
    if (t < 0 || t > 1) continue;
    const px = w.x1 + (w.x2 - w.x1) * t, py = w.y1 + (w.y2 - w.y1) * t;
    if (Math.hypot(px - x, py - y) < tol) return { id: w.id, t };
  }
  return null;
}
function pickAny(f: Floor, x: number, y: number): { id: string } | null {
  for (const c of f.columns) {
    if (Math.abs(c.x - x) < c.size && Math.abs(c.y - y) < c.size) return { id: c.id };
  }
  const w = pickWall(f, x, y, WALL_THICK);
  if (w) return { id: w.id };
  return null;
}

const styles = StyleSheet.create({
  canvas: {
    flex: 1, backgroundColor: theme.bg.surface,
    borderRadius: theme.radius.lg, overflow: 'hidden',
    borderWidth: 1, borderColor: theme.border.light,
  },
  coord: { position: 'absolute', top: 8, right: 12 },
  coordText: { fontSize: 11, color: theme.text.muted, fontFamily: 'monospace' },
});
