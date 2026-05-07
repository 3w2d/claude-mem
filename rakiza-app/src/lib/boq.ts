// Bill-of-Quantities for one project, mirroring the rakiza/editor.html math.
import type { Floor, Project, Pricing } from '../types';

const SLAB_THICK = 0.20;
const BEAM_W = 0.30, BEAM_H = 0.50;
const STEEL_KG_PER_M3 = 115;
const FOOTING_DEPTH = 1.0;
const DOOR_H = 2.1;
const WIN_H = 1.2;

export interface BoqTotals {
  footprint: number;
  slabArea: number;
  slabConcrete: number;
  beamConcrete: number;
  colConcrete: number;
  colCount: number;
  footingConcrete: number;
  totalConcrete: number;
  steel: number;          // tons
  wallNet: number;        // m²
  doorCount: number;
  windowCount: number;
  finishingArea: number;
  cost: number;           // SAR
}

function floorBbox(f: Floor) {
  if (!f.walls.length) return { minX: 0, maxX: 0, minY: 0, maxY: 0 };
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  f.walls.forEach(w => {
    minX = Math.min(minX, w.x1, w.x2); maxX = Math.max(maxX, w.x1, w.x2);
    minY = Math.min(minY, w.y1, w.y2); maxY = Math.max(maxY, w.y1, w.y2);
  });
  return { minX, maxX, minY, maxY };
}

function floorArea(f: Floor) {
  const b = floorBbox(f);
  return Math.max(0, b.maxX - b.minX) * Math.max(0, b.maxY - b.minY);
}

export function computeBoq(p: Project, pricing: Pricing): BoqTotals {
  const totals: BoqTotals = {
    footprint: 0, slabArea: 0, slabConcrete: 0,
    beamConcrete: 0, colConcrete: 0, colCount: 0,
    footingConcrete: 0, totalConcrete: 0, steel: 0,
    wallNet: 0, doorCount: 0, windowCount: 0,
    finishingArea: 0, cost: 0,
  };
  if (!p.floors.length) return totals;

  totals.footprint = floorArea(p.floors[0]);
  totals.footingConcrete = totals.footprint * FOOTING_DEPTH;

  for (const f of p.floors) {
    const a = floorArea(f);
    totals.slabArea += a;
    totals.slabConcrete += a * SLAB_THICK;
    totals.finishingArea += a;

    const wallLen = f.walls.reduce((s, w) => s + Math.hypot(w.x2 - w.x1, w.y2 - w.y1), 0);
    totals.beamConcrete += wallLen * BEAM_W * BEAM_H;

    for (const c of f.columns) {
      totals.colConcrete += c.size * c.size * f.height;
      totals.colCount++;
    }

    for (const w of f.walls) {
      const len = Math.hypot(w.x2 - w.x1, w.y2 - w.y1);
      const wallArea = len * f.height;
      const openings =
        f.doors.filter(d => d.wallId === w.id).reduce((s, d) => s + d.width * DOOR_H, 0) +
        f.windows.filter(d => d.wallId === w.id).reduce((s, d) => s + d.width * WIN_H, 0);
      totals.wallNet += Math.max(0, wallArea - openings);
    }
    totals.doorCount += f.doors.length;
    totals.windowCount += f.windows.length;
  }

  totals.totalConcrete = totals.slabConcrete + totals.beamConcrete + totals.colConcrete + totals.footingConcrete;
  totals.steel = (totals.totalConcrete * STEEL_KG_PER_M3) / 1000;
  totals.cost =
    totals.totalConcrete * pricing.concrete +
    totals.steel * pricing.steel +
    totals.wallNet * pricing.wall +
    totals.doorCount * pricing.door +
    totals.windowCount * pricing.window +
    totals.finishingArea * pricing.finish;

  return totals;
}

export function fmtSAR(n: number) {
  return new Intl.NumberFormat('en-US').format(Math.round(n));
}
