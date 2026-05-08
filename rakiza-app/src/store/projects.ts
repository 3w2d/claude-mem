import { create } from 'zustand';
import type { Project, ThemeMode } from '../types';
import { loadProjects, saveProjects, loadTheme, saveTheme, loadPage, savePage } from '../lib/storage';
import { calculate } from '../lib/sbc';

export type Page = 'landing' | 'dashboard' | 'calculator' | 'projects' | 'reports';

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
}));
