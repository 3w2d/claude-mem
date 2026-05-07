export type DayKey = string; // YYYY-MM-DD

export type ProjectCategory = 'residential' | 'commercial' | 'industrial' | 'public';

export interface Wall { id: string; x1: number; y1: number; x2: number; y2: number; }
export interface Column { id: string; x: number; y: number; size: number; }
export interface Opening { id: string; wallId: string; t: number; width: number; }

export interface Floor {
  id: string;
  name: string;
  height: number;       // m
  walls: Wall[];
  columns: Column[];
  doors: Opening[];
  windows: Opening[];
}

export interface Project {
  id: string;
  name: string;
  category: ProjectCategory;
  color: string;
  emoji: string;
  createdAt: number;
  updatedAt: number;
  floors: Floor[];
  archived: boolean;
  // Streak / habit-style tracking
  reminders: { hour: number; minute: number }[];
  smartReminders: boolean;
  stackedAfterId?: string | null;
}

export interface WorkLog {
  projectId: string;
  day: DayKey;
  at: number;
  minutes?: number;       // optional time spent
  note?: string;
}

export interface QuietWindow { startMinutes: number; endMinutes: number; }

export interface Pricing {
  concrete: number;     // SAR / m³
  steel: number;        // SAR / ton
  wall: number;         // SAR / m²
  door: number;         // SAR / unit
  window: number;       // SAR / unit
  finish: number;       // SAR / m²
  updatedAt: number;
}

export interface AppSettings {
  quietWindows: QuietWindow[];
  weekStart: 0 | 6;
  hasOnboarded: boolean;
  apiKey?: string;
  aiModel: string;
  pricing: Pricing;
}

export interface AppState {
  projects: Project[];
  logs: WorkLog[];
  settings: AppSettings;
  schemaVersion: number;
}

export const SCHEMA_VERSION = 1;

export const DEFAULT_PRICING: Pricing = {
  concrete: 280,
  steel: 3200,
  wall: 85,
  door: 800,
  window: 600,
  finish: 350,
  updatedAt: 0,
};

export const DEFAULT_SETTINGS: AppSettings = {
  quietWindows: [{ startMinutes: 22 * 60, endMinutes: 7 * 60 }],
  weekStart: 6,
  hasOnboarded: false,
  apiKey: undefined,
  aiModel: 'claude-haiku-4-5',
  pricing: DEFAULT_PRICING,
};

export const CATEGORIES: Record<ProjectCategory, { label: string; emoji: string }> = {
  residential: { label: 'سكني', emoji: '🏠' },
  commercial:  { label: 'تجاري', emoji: '🏢' },
  industrial:  { label: 'صناعي', emoji: '🏭' },
  public:      { label: 'خدمي/عام', emoji: '🕌' },
};
