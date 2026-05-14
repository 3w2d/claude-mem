// NCR records tied to a project. AsyncStorage-persisted, debounced.
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type NCRStatus = 'approved' | 'review' | 'rejected';

export interface NCRRecord {
  id: string;
  projectId: string;
  number: string;
  title: string;
  date: string;            // YYYY-MM-DD
  status: NCRStatus;
  description?: string;
  codeReference?: string;
  correctiveAction?: string;
  createdAt: number;
}

interface State {
  hydrated: boolean;
  ncrs: NCRRecord[];
  hydrate: () => Promise<void>;
  byProject: (projectId: string) => NCRRecord[];
  add: (r: Omit<NCRRecord, 'id' | 'createdAt'>) => NCRRecord;
  remove: (id: string) => void;
  setStatus: (id: string, status: NCRStatus) => void;
}

const KEY = 'rk:ncrs:v1';
const rid = () => Math.random().toString(36).slice(2, 11) + Date.now().toString(36).slice(-3);

let timer: ReturnType<typeof setTimeout> | null = null;
let pending: NCRRecord[] | null = null;
function save(list: NCRRecord[]) {
  pending = list;
  if (timer) return;
  timer = setTimeout(async () => {
    const v = pending!; pending = null; timer = null;
    try { await AsyncStorage.setItem(KEY, JSON.stringify(v)); } catch {}
  }, 150);
}

const SEED: NCRRecord[] = [
  { id: 's1', projectId: 'seed-1', number: 'NCR-20260420-1021', title: 'تشقّقات شعرية في جدار الدور الأرضي', date: '2026-04-20', status: 'approved', createdAt: Date.now() - 86400000 * 16 },
  { id: 's2', projectId: 'seed-1', number: 'NCR-20260502-1042', title: 'ضعف في عزل السباكة عند الحمام', date: '2026-05-02', status: 'review',   createdAt: Date.now() - 86400000 * 4  },
  { id: 's3', projectId: 'seed-2', number: 'NCR-20260428-1108', title: 'مخالفة في نسبة تسليح العمود C-12', date: '2026-04-28', status: 'rejected', createdAt: Date.now() - 86400000 * 8  },
  { id: 's4', projectId: 'seed-2', number: 'NCR-20260505-1123', title: 'لوحة كهرباء بدون قاطع GFCI',       date: '2026-05-05', status: 'review',   createdAt: Date.now() - 86400000 * 1  },
  { id: 's5', projectId: 'seed-3', number: 'NCR-20260411-1009', title: 'مخالفة في عزل المبنى الحراري',     date: '2026-04-11', status: 'approved', createdAt: Date.now() - 86400000 * 25 },
];

export const useNCRs = create<State>((set, get) => ({
  hydrated: false,
  ncrs: SEED,

  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as NCRRecord[];
        if (Array.isArray(parsed)) { set({ ncrs: parsed, hydrated: true }); return; }
      }
    } catch {}
    set({ hydrated: true });
  },

  byProject: (projectId) =>
    get().ncrs.filter(n => n.projectId === projectId).sort((a, b) => b.createdAt - a.createdAt),

  add: (r) => {
    const rec: NCRRecord = { id: rid(), createdAt: Date.now(), ...r };
    const ncrs = [rec, ...get().ncrs];
    save(ncrs); set({ ncrs });
    return rec;
  },

  remove: (id) => {
    const ncrs = get().ncrs.filter(n => n.id !== id);
    save(ncrs); set({ ncrs });
  },

  setStatus: (id, status) => {
    const ncrs = get().ncrs.map(n => n.id === id ? { ...n, status } : n);
    save(ncrs); set({ ncrs });
  },
}));

export const NCR_STATUS_LABEL: Record<NCRStatus, string> = {
  approved: 'تم الاعتماد',
  review:   'قيد المراجعة',
  rejected: 'مرفوض',
};
