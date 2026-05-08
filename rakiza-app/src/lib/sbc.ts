// SBC 304 / ACI 318 simplified estimator — preliminary takeoff only.
import type { ConcreteGrade, ProjectParams, ProjectResults, SeismicZone, SteelGrade, BuildingUse } from '../types';

export const CONCRETE: Record<ConcreteGrade, { fc: number; price: number }> = {
  C25: { fc: 25, price: 280 },
  C30: { fc: 30, price: 310 },
  C35: { fc: 35, price: 345 },
  C40: { fc: 40, price: 385 },
  C45: { fc: 45, price: 430 },
};

export const STEEL: Record<SteelGrade, { fy: number; price: number }> = {
  B400: { fy: 400, price: 2900 },
  B420: { fy: 420, price: 3050 },
  B500: { fy: 500, price: 3250 },
  B600: { fy: 600, price: 3450 },
};

export const LIVE_LOAD: Record<BuildingUse, number> = {
  residential: 2.0,
  office:      2.5,
  commercial:  4.0,
  parking:     2.5,
  storage:     5.0,
};

export const SEISMIC_FACTOR: Record<SeismicZone, number> = {
  low:      1.00,
  moderate: 1.12,
  high:     1.25,
};

const REBAR = { slab: 85, column: 180, beam: 130, foundation: 90 };

export function calculate(p: ProjectParams): ProjectResults {
  const conc = CONCRETE[p.concreteGrade] ?? CONCRETE.C30;
  const stl  = STEEL[p.steelGrade] ?? STEEL.B420;
  const live = LIVE_LOAD[p.buildingUse] ?? 2.0;
  const seis = SEISMIC_FACTOR[p.seismicZone] ?? 1.0;

  const floorArea = p.length * p.width;
  const totalArea = floorArea * p.floors;
  const perim = 2 * (p.length + p.width);
  const totalH = p.floors * p.storyHeight;

  const colsX = Math.max(2, Math.ceil(p.length / p.columnSpacing) + 1);
  const colsY = Math.max(2, Math.ceil(p.width  / p.columnSpacing) + 1);
  const colCount = colsX * colsY;

  const slabSelf = (p.slabType === 'solid' ? 0.18 : 0.22) * 25;
  const dead = slabSelf + 1.5;
  const factored = 1.2 * dead + 1.6 * live;

  const slabThk = Math.min(0.25, Math.max(0.15, p.columnSpacing / 30));
  const slabVol = floorArea * slabThk * p.floors;

  const tribArea = p.columnSpacing * p.columnSpacing;
  const axialKn = factored * tribArea * p.floors * seis;
  const colArea = (axialKn * 1000) / (0.45 * conc.fc * 1e6);
  const colSide = Math.max(0.25, Math.sqrt(colArea) * 1.15);
  const colVol = colSide * colSide * totalH * colCount;

  const beamW = 0.30, beamH = 0.55;
  const beamLenPerFloor = perim + (colsX - 1) * p.width + (colsY - 1) * p.length;
  const beamVol = beamLenPerFloor * beamW * beamH * p.floors;

  const ftgSide = Math.max(1.5, colSide * 4.5);
  const ftgThk = 0.5;
  const ftgVol = ftgSide * ftgSide * ftgThk * colCount;

  const totalConcrete = slabVol + colVol + beamVol + ftgVol;
  const slabSteel = slabVol * REBAR.slab;
  const colSteel  = colVol  * REBAR.column;
  const beamSteel = beamVol * REBAR.beam;
  const ftgSteel  = ftgVol  * REBAR.foundation;
  const totalSteelTon = (slabSteel + colSteel + beamSteel + ftgSteel) / 1000;

  const concreteCost = totalConcrete * conc.price;
  const steelCost = totalSteelTon * stl.price;
  const formworkCost = (slabVol * 12 + colVol * 35 + beamVol * 28 + ftgVol * 8) * 45;
  const laborCost = totalArea * 350;
  const finishCost = totalArea * 850;
  const subtotal = concreteCost + steelCost + formworkCost + laborCost + finishCost;
  const overhead = subtotal * 0.18;
  const total = subtotal + overhead;

  return {
    floorArea, totalArea, perim, totalH, colCount,
    slab: { vol: slabVol, thk: slabThk, steel: slabSteel },
    columns: { count: colCount, side: colSide, vol: colVol, steel: colSteel },
    beams: { count: 0, length: beamLenPerFloor * p.floors, vol: beamVol, steel: beamSteel },
    foundation: { count: colCount, side: ftgSide, vol: ftgVol, steel: ftgSteel },
    totalConcrete,
    totalSteel: totalSteelTon,
    cost: {
      concrete: concreteCost, steel: steelCost, formwork: formworkCost,
      labor: laborCost, finish: finishCost, overhead, total,
      perSqm: total / totalArea,
    },
    loads: { dead, live, factored, seismic: seis },
    code: 'SBC 304 (2018) · ACI 318',
    timestamp: new Date().toISOString(),
  };
}

export function safeCalculate(p: ProjectParams): ProjectResults | null {
  try { return calculate(p); } catch { return null; }
}
