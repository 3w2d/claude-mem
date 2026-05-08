import { create } from 'zustand';
import type { Project, ThemeMode } from '../types';
import { loadProjects, saveProjects, loadTheme, saveTheme, loadPage, savePage } from '../lib/storage';
import { calculate } from '../lib/sbc';

export type Page = 'landing' | 'dashboard' | 'calculator' | 'editor' | 'ai' | 'projects' | 'reports';

const SEED: Project[] = [
  { id: 'seed-1', name: 'فيلا سكنية — حي النرجس', status: 'complete',
    date: new Date(Date.now() - 86400000 * 2).toISOString(),
    params: { length:20, width:15, floors:3, storyHeight:3.2, columnSpacing:5,
      buildingUse:'residential', concreteGrade:'C30', steelGrade:'B420',
      slabType:'solid', seismicZone:'low', windSpeed:40 } },
  { id: 'seed-2', name: 'مبنى تجاري — طريق الملك', status: 'complete',
    date: new Date(Date.now() - 86400000 * 7).toISOString(),
    params: { length:35, width:25, floors:5, storyHeight:3.5, columnSpacing:6,
      buildingUse:'commercial', concreteGrade:'C35', steelGrade:'B420',
      slabType:'solid', seismicZone:'moderate', windSpeed:40 } },
  { id: 'seed-3', name: 'مجمع مكاتب — الرياض', status: 'complete',
    date: new Date(Date.now() - 86400000 * 14).toISOString(),
    params: { length:30, width:20, floors:8, storyHeight:3.2, columnSpacing:5,
      buildingUse:'office', concreteGrade:'C40', steelGrade:'B500',
      slabType:'solid', seismicZone:'low', windSpeed:45 } },
];
SEED.forEach(p => { try { p.results = calculate(p.params); } catch {} });

interface State {
  hydrated: boolean;
  page: Page;
  themeMode: ThemeMode;
  projects: Project[];
  activeProject: Project | null;
  hydrate: () => Promise<void>;
  setPage: (p: Page) => void;
  setActiveProject: (p: Project | null) => void;
  setTheme: (t: ThemeMode) => void;
  toggleTheme: () => void;
  saveProject: (p: Omit<Project, 'id'> & { id?: string }) => Project;
  deleteProject: (id: string) => void;
  resetProjects: () => void;
  // Geometry editing
  ensureGeometry: (id: string) => void;
  addFloor: (id: string, after?: number) => void;
  removeFloor: (id: string, index: number) => void;
  renameFloor: (id: string, index: number, name: string) => void;
  addWall: (id: string, fi: number, w: { x1: number; y1: number; x2: number; y2: number }) => void;
  addColumn: (id: string, fi: number, c: { x: number; y: number; size: number }) => void;
  addOpening: (id: string, fi: number, kind: 'doors' | 'windows', o: { wallId: string; t: number; width: number }) => void;
  deleteElement: (id: string, fi: number, elId: string) => void;
}

let _id = 0;
const newId = () => `${Date.now().toString(36)}-${(_id++).toString(36)}`;

export const useStore = create<State>((set, get) => ({
  hydrated: false,
  page: 'landing',
  themeMode: 'dark',
  projects: SEED,
  activeProject: null,

  hydrate: async () => {
    const [projects, themeMode, page] = await Promise.all([loadProjects(), loadTheme(), loadPage()]);
    set({
      projects: projects.length ? projects : SEED,
      themeMode,
      page: (page as Page) ?? 'landing',
      hydrated: true,
    });
  },

  setPage: (p) => { savePage(p); set({ page: p }); },
  setActiveProject: (p) => set({ activeProject: p }),
  setTheme: (t) => { saveTheme(t); set({ themeMode: t }); },
  toggleTheme: () => {
    const next = get().themeMode === 'dark' ? 'light' : 'dark';
    saveTheme(next);
    set({ themeMode: next });
  },

  saveProject: (p) => {
    const projects = [...get().projects];
    if (p.id) {
      const idx = projects.findIndex(x => x.id === p.id);
      if (idx >= 0) {
        const next = { ...(p as Project) };
        projects[idx] = next;
        saveProjects(projects);
        set({ projects });
        return next;
      }
    }
    const created: Project = { ...(p as Project), id: newId() };
    const updated = [created, ...projects];
    saveProjects(updated);
    set({ projects: updated });
    return created;
  },

  deleteProject: (id) => {
    const projects = get().projects.filter(p => p.id !== id);
    saveProjects(projects);
    set({ projects });
  },

  resetProjects: () => {
    saveProjects(SEED);
    set({ projects: SEED });
  },

  ensureGeometry: (id) => set(s => {
    const projects = s.projects.map(p => {
      if (p.id !== id) return p;
      if (p.geometry && p.geometry.length) return p;
      const floors = Array.from({ length: p.params.floors }, (_, i) => ({
        name: i === 0 ? 'الدور الأرضي' : `الدور ${i + 1}`,
        walls: [], columns: [], doors: [], windows: [],
      }));
      const next: Project = { ...p, geometry: floors };
      saveProjects(s.projects.map(x => x.id === id ? next : x));
      return next;
    });
    return { projects };
  }),

  addFloor: (id, after) => set(s => {
    const projects = s.projects.map(p => {
      if (p.id !== id) return p;
      const geo = [...(p.geometry ?? [])];
      const insertAt = after != null ? after + 1 : geo.length;
      geo.splice(insertAt, 0, { name: `الدور ${geo.length + 1}`, walls: [], columns: [], doors: [], windows: [] });
      return { ...p, geometry: geo, params: { ...p.params, floors: geo.length } };
    });
    saveProjects(projects);
    return { projects };
  }),

  removeFloor: (id, index) => set(s => {
    const projects = s.projects.map(p => {
      if (p.id !== id || !p.geometry || p.geometry.length <= 1) return p;
      const geo = p.geometry.filter((_, i) => i !== index);
      return { ...p, geometry: geo, params: { ...p.params, floors: geo.length } };
    });
    saveProjects(projects);
    return { projects };
  }),

  renameFloor: (id, index, name) => set(s => {
    const projects = s.projects.map(p => {
      if (p.id !== id || !p.geometry) return p;
      const geo = p.geometry.map((f, i) => i === index ? { ...f, name } : f);
      return { ...p, geometry: geo };
    });
    saveProjects(projects);
    return { projects };
  }),

  addWall: (id, fi, w) => set(s => {
    const projects = s.projects.map(p => {
      if (p.id !== id || !p.geometry) return p;
      const geo = p.geometry.map((f, i) => i === fi
        ? { ...f, walls: [...f.walls, { id: newId(), ...w }] }
        : f);
      return { ...p, geometry: geo };
    });
    saveProjects(projects);
    return { projects };
  }),

  addColumn: (id, fi, c) => set(s => {
    const projects = s.projects.map(p => {
      if (p.id !== id || !p.geometry) return p;
      const geo = p.geometry.map((f, i) => i === fi
        ? { ...f, columns: [...f.columns, { id: newId(), ...c }] }
        : f);
      return { ...p, geometry: geo };
    });
    saveProjects(projects);
    return { projects };
  }),

  addOpening: (id, fi, kind, o) => set(s => {
    const projects = s.projects.map(p => {
      if (p.id !== id || !p.geometry) return p;
      const geo = p.geometry.map((f, i) => i === fi
        ? { ...f, [kind]: [...f[kind], { id: newId(), ...o }] }
        : f);
      return { ...p, geometry: geo };
    });
    saveProjects(projects);
    return { projects };
  }),

  deleteElement: (id, fi, elId) => set(s => {
    const projects = s.projects.map(p => {
      if (p.id !== id || !p.geometry) return p;
      const geo = p.geometry.map((f, i) => {
        if (i !== fi) return f;
        const walls = f.walls.filter(w => w.id !== elId);
        const remainingIds = new Set(walls.map(w => w.id));
        return {
          ...f,
          walls,
          columns: f.columns.filter(c => c.id !== elId),
          doors: f.doors.filter(d => d.id !== elId && remainingIds.has(d.wallId)),
          windows: f.windows.filter(d => d.id !== elId && remainingIds.has(d.wallId)),
        };
      });
      return { ...p, geometry: geo };
    });
    saveProjects(projects);
    return { projects };
  }),
}));
