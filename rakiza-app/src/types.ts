// Project shape mirrors the reference: structural calculator inputs + computed totals.

export type ConcreteGrade = 'C25' | 'C30' | 'C35' | 'C40' | 'C45';
export type SteelGrade = 'B400' | 'B420' | 'B500' | 'B600';
export type BuildingUse = 'residential' | 'office' | 'commercial' | 'parking' | 'storage';
export type SeismicZone = 'low' | 'moderate' | 'high';
export type SlabType = 'solid' | 'ribbed';
export type ProjectStatus = 'draft' | 'complete';

export interface ProjectParams {
  length: number;
  width: number;
  floors: number;
  storyHeight: number;
  columnSpacing: number;
  buildingUse: BuildingUse;
  concreteGrade: ConcreteGrade;
  steelGrade: SteelGrade;
  slabType: SlabType;
  seismicZone: SeismicZone;
  windSpeed: number;
}

export interface MemberQty {
  vol: number;
  steel: number; // kg
}

export interface ProjectResults {
  floorArea: number;
  totalArea: number;
  perim: number;
  totalH: number;
  colCount: number;
  slab: { vol: number; thk: number; steel: number };
  columns: { count: number; side: number; vol: number; steel: number };
  beams: { count: number; length: number; vol: number; steel: number };
  foundation: { count: number; side: number; vol: number; steel: number };
  totalConcrete: number;
  totalSteel: number; // tons
  cost: {
    concrete: number;
    steel: number;
    formwork: number;
    labor: number;
    finish: number;
    overhead: number;
    total: number;
    perSqm: number;
  };
  loads: { dead: number; live: number; factored: number; seismic: number };
  code: string;
  timestamp: string;
}

export interface Wall { id: string; x1: number; y1: number; x2: number; y2: number; }
export interface Column { id: string; x: number; y: number; size: number; }
export interface Opening { id: string; wallId: string; t: number; width: number; }

export interface FloorGeometry {
  name: string;
  walls: Wall[];
  columns: Column[];
  doors: Opening[];
  windows: Opening[];
}

export interface Project {
  id: string;
  name: string;
  status: ProjectStatus;
  date: string;
  params: ProjectParams;
  results?: ProjectResults;
  geometry?: FloorGeometry[]; // optional hand-drawn floors override the parametric box
}

export const DEFAULT_PARAMS: ProjectParams = {
  length: 20,
  width: 15,
  floors: 3,
  storyHeight: 3.2,
  columnSpacing: 5,
  buildingUse: 'residential',
  concreteGrade: 'C30',
  steelGrade: 'B420',
  slabType: 'solid',
  seismicZone: 'low',
  windSpeed: 40,
};

export const USE_LABELS: Record<BuildingUse, string> = {
  residential: 'سكني',
  office:      'مكاتب',
  commercial:  'تجاري',
  parking:     'مواقف',
  storage:     'مستودع',
};

export const SEISMIC_LABELS: Record<SeismicZone, string> = {
  low:      'منخفضة',
  moderate: 'متوسطة',
  high:     'عالية',
};

export const SCHEMA_VERSION = 2;

export type ThemeMode = 'dark' | 'light';

export type ProjectCategory = 'residential' | 'commercial' | 'industrial' | 'public';
export const CATEGORIES: Record<ProjectCategory, { label: string; emoji: string }> = {
  residential: { label: 'سكني',         emoji: '🏠' },
  commercial:  { label: 'تجاري',         emoji: '🏢' },
  industrial:  { label: 'صناعي',         emoji: '🏭' },
  public:      { label: 'خدمي/عام',      emoji: '🕌' },
};

// Map building use → display category for backward compatibility.
export function categoryFor(use: BuildingUse): ProjectCategory {
  if (use === 'residential') return 'residential';
  if (use === 'commercial' || use === 'office') return 'commercial';
  if (use === 'storage' || use === 'parking') return 'industrial';
  return 'public';
}
