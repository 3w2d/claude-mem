// Stylized isometric building view — pure react-native-svg so it runs on
// iOS, Android, and Web identically without WebGL / expo-three.
//
// We draw a projected box per floor with columns at the grid intersections.
// This is the "engineering preview" mood, not a full 3D scene — exactly the
// architectural-drawing aesthetic the brand calls for.

import { View, Text } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Polygon, Line, Rect, G, Path } from 'react-native-svg';
import { useTheme } from './ThemeProvider';
import { FONT, RADIUS } from '../theme';
import type { ProjectParams } from '../types';

interface Props {
  params: ProjectParams;
  height?: number;
  showOverlay?: boolean;
}

export function Building3D({ params, height = 320, showOverlay = true }: Props) {
  const { theme, fontsLoaded } = useTheme();
  const W = 360;
  const H = height;

  // Isometric projection — angle 30°, both axes
  const ISO = Math.PI / 6;
  const cosI = Math.cos(ISO);
  const sinI = Math.sin(ISO);

  // Scale building footprint to fit viewport.
  const safeLen = Math.max(5, params.length);
  const safeWid = Math.max(5, params.width);
  const totalH  = params.floors * params.storyHeight;
  const maxFootprint = Math.max(safeLen, safeWid);
  const sceneSize = Math.max(maxFootprint * 1.4, totalH * 1.2);
  const scale = (W * 0.42) / sceneSize;

  const cx = W / 2;
  const cy = H * 0.78; // ground line near bottom

  const project = (x: number, y: number, z: number) => ({
    x: cx + (x - z) * cosI * scale,
    y: cy - y * scale + (x + z) * sinI * scale * 0.5,
  });

  const halfL = safeLen / 2;
  const halfW = safeWid / 2;

  // 8 cube corners of the full building
  const cornersGround = [
    project(-halfL, 0, -halfW),
    project( halfL, 0, -halfW),
    project( halfL, 0,  halfW),
    project(-halfL, 0,  halfW),
  ];
  const cornersTop = [
    project(-halfL, totalH, -halfW),
    project( halfL, totalH, -halfW),
    project( halfL, totalH,  halfW),
    project(-halfL, totalH,  halfW),
  ];

  const polyStr = (pts: { x: number; y: number }[]) =>
    pts.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

  // Visible faces in iso view
  const topFace   = polyStr([cornersTop[0], cornersTop[1], cornersTop[2], cornersTop[3]]);
  const rightFace = polyStr([cornersTop[1], cornersTop[2], cornersGround[2], cornersGround[1]]);
  const frontFace = polyStr([cornersTop[3], cornersTop[2], cornersGround[2], cornersGround[3]]);

  // Column grid
  const colsX = Math.max(2, Math.ceil(safeLen / params.columnSpacing) + 1);
  const colsZ = Math.max(2, Math.ceil(safeWid / params.columnSpacing) + 1);

  const colSize = 0.4;
  const cols: React.ReactNode[] = [];
  for (let i = 0; i < colsX; i++) {
    for (let j = 0; j < colsZ; j++) {
      const x = -halfL + (i / (colsX - 1)) * safeLen;
      const z = -halfW + (j / (colsZ - 1)) * safeWid;
      const a = project(x - colSize / 2, 0, z);
      const b = project(x + colSize / 2, 0, z);
      const aTop = project(x - colSize / 2, totalH, z);
      const bTop = project(x + colSize / 2, totalH, z);
      cols.push(
        <Polygon key={`c${i}-${j}`}
          points={polyStr([aTop, bTop, b, a])}
          fill="url(#grad-col)" opacity={0.85}
        />
      );
    }
  }

  // Floor lines (horizontal section markers)
  const floorLines: React.ReactNode[] = [];
  for (let f = 1; f < params.floors; f++) {
    const y = f * params.storyHeight;
    const a = project(-halfL, y, -halfW);
    const b = project( halfL, y, -halfW);
    const c = project( halfL, y,  halfW);
    const d = project(-halfL, y,  halfW);
    floorLines.push(
      <Polygon key={`f${f}`} points={polyStr([a, b, c, d])}
        fill="none" stroke={theme.gold.base} strokeWidth={0.6} strokeOpacity={0.45}
      />
    );
  }

  // Ground grid lines (subtle blueprint feel)
  const ground: React.ReactNode[] = [];
  const gStep = params.columnSpacing;
  for (let x = -halfL; x <= halfL + 0.01; x += gStep) {
    const a = project(x, 0, -halfW * 1.4);
    const b = project(x, 0,  halfW * 1.4);
    ground.push(<Line key={`gx${x}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y}
      stroke={theme.grid} strokeWidth={0.5} />);
  }
  for (let z = -halfW; z <= halfW + 0.01; z += gStep) {
    const a = project(-halfL * 1.4, 0, z);
    const b = project( halfL * 1.4, 0, z);
    ground.push(<Line key={`gz${z}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y}
      stroke={theme.grid} strokeWidth={0.5} />);
  }

  return (
    <View style={{
      width: '100%', height, backgroundColor: theme.bg.panel,
      borderRadius: RADIUS.lg, overflow: 'hidden', position: 'relative',
    }}>
      <Svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
        <Defs>
          <LinearGradient id="grad-bg" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={theme.bg.elevated} />
            <Stop offset="1" stopColor={theme.bg.base} />
          </LinearGradient>
          <LinearGradient id="grad-top" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={theme.gold.bright} stopOpacity={0.4} />
            <Stop offset="1" stopColor={theme.gold.base} stopOpacity={0.18} />
          </LinearGradient>
          <LinearGradient id="grad-right" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor={theme.gold.dim} stopOpacity={0.32} />
            <Stop offset="1" stopColor={theme.gold.base} stopOpacity={0.12} />
          </LinearGradient>
          <LinearGradient id="grad-front" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={theme.gold.base} stopOpacity={0.22} />
            <Stop offset="1" stopColor={theme.gold.dim} stopOpacity={0.10} />
          </LinearGradient>
          <LinearGradient id="grad-col" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={theme.gold.bright} />
            <Stop offset="1" stopColor={theme.gold.dim} />
          </LinearGradient>
        </Defs>

        <Rect x={0} y={0} width={W} height={H} fill="url(#grad-bg)" />
        <G>{ground}</G>

        {/* Volume faces */}
        <Polygon points={frontFace} fill="url(#grad-front)" stroke={theme.gold.base} strokeWidth={0.6} strokeOpacity={0.35} />
        <Polygon points={rightFace} fill="url(#grad-right)" stroke={theme.gold.base} strokeWidth={0.6} strokeOpacity={0.35} />
        <Polygon points={topFace}   fill="url(#grad-top)"   stroke={theme.gold.base} strokeWidth={0.8} strokeOpacity={0.5} />

        {/* Columns */}
        {cols}

        {/* Floor section lines */}
        {floorLines}

        {/* Vertical edges */}
        {[0, 1, 2, 3].map(i => (
          <Line key={`e${i}`}
            x1={cornersGround[i].x} y1={cornersGround[i].y}
            x2={cornersTop[i].x}    y2={cornersTop[i].y}
            stroke={theme.gold.base} strokeWidth={0.8} strokeOpacity={0.45}
          />
        ))}
      </Svg>

      {showOverlay && (
        <>
          <Text style={{
            position: 'absolute', top: 12, right: 12,
            fontSize: 10, color: theme.gold.dim, letterSpacing: 1,
            fontFamily: fontsLoaded ? FONT.mono : undefined,
          }}>⊙ ISOMETRIC · LIVE</Text>

          <View style={{
            position: 'absolute', bottom: 12, left: 12,
            flexDirection: 'row-reverse', gap: 12,
          }}>
            <Text style={{
              fontSize: 10, color: theme.text.muted,
              fontFamily: fontsLoaded ? FONT.mono : undefined,
            }}>{params.length}m × {params.width}m</Text>
            <Text style={{ fontSize: 10, color: theme.text.muted }}>·</Text>
            <Text style={{
              fontSize: 10, color: theme.text.muted,
              fontFamily: fontsLoaded ? FONT.mono : undefined,
            }}>{params.floors} أدوار</Text>
            <Text style={{ fontSize: 10, color: theme.text.muted }}>·</Text>
            <Text style={{
              fontSize: 10, color: theme.text.muted,
              fontFamily: fontsLoaded ? FONT.mono : undefined,
            }}>{(params.floors * params.storyHeight).toFixed(1)}m</Text>
          </View>
        </>
      )}
    </View>
  );
}
