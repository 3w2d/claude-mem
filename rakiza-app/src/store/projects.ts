import { create } from 'zustand';
import type { AppState, Project, Floor, Wall, Column, Opening, WorkLog, Pricing } from '../types';
import { DEFAULT_SETTINGS, SCHEMA_VERSION, DEFAULT_PRICING } from '../types';
import { todayKey } from '../lib/date';
import { EMPTY_STATE, loadState, persistState } from '../lib/storage';
import { rescheduleAll } from '../lib/notifications';

interface Store extends AppState {
  hydrated: boolean;
  hydrate: () => Promise<void>;
  addProject: (p: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'archived' | 'floors'> & { floors?: Floor[] }) => Project;
  updateProject: (id: string, patch: Partial<Project>) => void;
  archiveProject: (id: string) => void;
  deleteProject: (id: string) => void;
  duplicateProject: (id: string) => Project | null;
  // Floor-level
  addFloor: (projectId: string, copyFromIdx?: number) => void;
  updateFloor: (projectId: string, floorIdx: number, patch: Partial<Floor>) => void;
  deleteFloor: (projectId: string, floorIdx: number) => void;
  // Drawing
  addWall: (projectId: string, floorIdx: number, w: Omit<Wall, 'id'>) => void;
  addColumn: (projectId: string, floorIdx: number, c: Omit<Column, 'id'>) => void;
  addOpening: (projectId: string, floorIdx: number, kind: 'doors' | 'windows', o: Omit<Opening, 'id'>) => void;
  removeElement: (projectId: string, floorIdx: number, id: string) => void;
  // Logging / streak
  logWork: (projectId: string, minutes?: number, note?: string) => void;
  unlogToday: (projectId: string) => void;
  // Settings
  setPricing: (p: Partial<Pricing>) => void;
  setApiKey: (key: string) => void;
  setModel: (model: string) => void;
  setQuietWindows: (w: AppState['settings']['quietWindows']) => void;
  setOnboarded: (v: boolean) => void;
}

export const useStore = create<Store>((set, get) => ({
  ...EMPTY_STATE,
  hydrated: false,

  hydrate: async () => {
    const s = await loadState();
    set({ ...s, hydrated: true } as any);
    rescheduleAll(s.projects, s.logs, s.settings.quietWindows).catch(() => {});
  },

  addProject: (p) => {
    const proj: Project = {
      id: rid(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      archived: false,
      floors: p.floors ?? [makeFloor('الدور الأرضي')],
      ...p,
    };
    set(state => {
      const next = { ...state, projects: [...state.projects, proj] };
      saveAndReschedule(next);
      return next;
    });
    return proj;
  },

  updateProject: (id, patch) => set(state => {
    const projects = state.projects.map(p => p.id === id ? { ...p, ...patch, updatedAt: Date.now() } : p);
    const next = { ...state, projects };
    saveAndReschedule(next);
    return next;
  }),

  archiveProject: (id) => set(state => {
    const projects = state.projects.map(p => p.id === id ? { ...p, archived: true } : p);
    const next = { ...state, projects };
    saveAndReschedule(next);
    return next;
  }),

  deleteProject: (id) => set(state => {
    const projects = state.projects.filter(p => p.id !== id);
    const logs = state.logs.filter(l => l.projectId !== id);
    const next = { ...state, projects, logs };
    saveAndReschedule(next);
    return next;
  }),

  duplicateProject: (id) => {
    const src = get().projects.find(p => p.id === id);
    if (!src) return null;
    const copy: Project = JSON.parse(JSON.stringify(src));
    copy.id = rid();
    copy.name = src.name + ' (نسخة)';
    copy.createdAt = Date.now();
    copy.updatedAt = Date.now();
    copy.floors.forEach(f => {
      f.id = rid();
      const idMap: Record<string, string> = {};
      f.walls = f.walls.map(w => { const nw = { ...w, id: rid() }; idMap[w.id] = nw.id; return nw; });
      f.columns = f.columns.map(c => ({ ...c, id: rid() }));
      f.doors = f.doors.map(d => ({ ...d, id: rid(), wallId: idMap[d.wallId] ?? d.wallId }));
      f.windows = f.windows.map(d => ({ ...d, id: rid(), wallId: idMap[d.wallId] ?? d.wallId }));
    });
    set(state => {
      const next = { ...state, projects: [...state.projects, copy] };
      saveAndReschedule(next);
      return next;
    });
    return copy;
  },

  addFloor: (projectId, copyFromIdx) => set(state => {
    const projects = state.projects.map(p => {
      if (p.id !== projectId) return p;
      const idx = copyFromIdx ?? Math.max(0, p.floors.length - 1);
      const src = p.floors[idx];
      const f = src ? cloneFloor(src, `الدور ${p.floors.length + 1}`) : makeFloor(`الدور ${p.floors.length + 1}`);
      return { ...p, floors: [...p.floors, f], updatedAt: Date.now() };
    });
    const next = { ...state, projects }; saveAndReschedule(next); return next;
  }),

  updateFloor: (projectId, floorIdx, patch) => set(state => {
    const projects = state.projects.map(p => {
      if (p.id !== projectId) return p;
      const floors = p.floors.map((f, i) => i === floorIdx ? { ...f, ...patch } : f);
      return { ...p, floors, updatedAt: Date.now() };
    });
    const next = { ...state, projects }; saveAndReschedule(next); return next;
  }),

  deleteFloor: (projectId, floorIdx) => set(state => {
    const projects = state.projects.map(p => {
      if (p.id !== projectId) return p;
      if (p.floors.length <= 1) return p;
      const floors = p.floors.filter((_, i) => i !== floorIdx);
      return { ...p, floors, updatedAt: Date.now() };
    });
    const next = { ...state, projects }; saveAndReschedule(next); return next;
  }),

  addWall: (pid, fi, w) => mutateFloor(set, pid, fi, f => f.walls.push({ id: rid(), ...w })),
  addColumn: (pid, fi, c) => mutateFloor(set, pid, fi, f => f.columns.push({ id: rid(), ...c })),
  addOpening: (pid, fi, kind, o) => mutateFloor(set, pid, fi, f => f[kind].push({ id: rid(), ...o })),
  removeElement: (pid, fi, id) => mutateFloor(set, pid, fi, f => {
    f.walls = f.walls.filter(x => x.id !== id);
    f.columns = f.columns.filter(x => x.id !== id);
    f.doors = f.doors.filter(x => x.id !== id);
    f.windows = f.windows.filter(x => x.id !== id);
    f.doors = f.doors.filter(d => f.walls.some(w => w.id === d.wallId));
    f.windows = f.windows.filter(d => f.walls.some(w => w.id === d.wallId));
  }),

  logWork: (projectId, minutes, note) => set(state => {
    const today = todayKey();
    const exists = state.logs.find(l => l.projectId === projectId && l.day === today);
    let logs;
    if (exists) {
      logs = state.logs.map(l => l === exists ? { ...l, at: Date.now(), minutes: (l.minutes ?? 0) + (minutes ?? 0), note: note ?? l.note } : l);
    } else {
      logs = [...state.logs, { projectId, day: today, at: Date.now(), minutes, note }];
    }
    const next = { ...state, logs }; saveAndReschedule(next); return next;
  }),

  unlogToday: (projectId) => set(state => {
    const today = todayKey();
    const logs = state.logs.filter(l => !(l.projectId === projectId && l.day === today));
    const next = { ...state, logs }; saveAndReschedule(next); return next;
  }),

  setPricing: (p) => set(state => {
    const settings = { ...state.settings, pricing: { ...state.settings.pricing, ...p, updatedAt: Date.now() } };
    const next = { ...state, settings }; saveAndReschedule(next); return next;
  }),

  setApiKey: (key) => set(state => {
    const settings = { ...state.settings, apiKey: key };
    const next = { ...state, settings }; saveAndReschedule(next); return next;
  }),

  setModel: (model) => set(state => {
    const settings = { ...state.settings, aiModel: model };
    const next = { ...state, settings }; saveAndReschedule(next); return next;
  }),

  setQuietWindows: (w) => set(state => {
    const settings = { ...state.settings, quietWindows: w };
    const next = { ...state, settings }; saveAndReschedule(next); return next;
  }),

  setOnboarded: (v) => set(state => {
    const settings = { ...state.settings, hasOnboarded: v };
    const next = { ...state, settings }; saveAndReschedule(next); return next;
  }),
}));

// helpers
function rid(): string { return Math.random().toString(36).slice(2, 11) + Date.now().toString(36).slice(-4); }

export function makeFloor(name: string): Floor {
  return { id: rid(), name, height: 3.5, walls: [], columns: [], doors: [], windows: [] };
}

function cloneFloor(src: Floor, name: string): Floor {
  const idMap: Record<string, string> = {};
  const walls = src.walls.map(w => { const nw = { ...w, id: rid() }; idMap[w.id] = nw.id; return nw; });
  return {
    id: rid(), name, height: src.height,
    walls, columns: src.columns.map(c => ({ ...c, id: rid() })),
    doors: src.doors.map(d => ({ ...d, id: rid(), wallId: idMap[d.wallId] ?? d.wallId })),
    windows: src.windows.map(d => ({ ...d, id: rid(), wallId: idMap[d.wallId] ?? d.wallId })),
  };
}

function mutateFloor(set: any, projectId: string, floorIdx: number, fn: (f: Floor) => void) {
  set((state: any) => {
    const projects = state.projects.map((p: Project) => {
      if (p.id !== projectId) return p;
      const floors = p.floors.map((f, i) => {
        if (i !== floorIdx) return f;
        const copy: Floor = JSON.parse(JSON.stringify(f));
        fn(copy);
        return copy;
      });
      return { ...p, floors, updatedAt: Date.now() };
    });
    const next = { ...state, projects }; saveAndReschedule(next); return next;
  });
}

function saveAndReschedule(state: any) {
  persistState({ projects: state.projects, logs: state.logs, settings: state.settings, schemaVersion: SCHEMA_VERSION });
  rescheduleAll(state.projects, state.logs, state.settings.quietWindows).catch(() => {});
}
