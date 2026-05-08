import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ChatMessage, ContentPart } from '../lib/chat';
import type { ProviderId } from '../lib/providers';
import { defaultModel, defaultProvider } from '../lib/providers';

export interface Persona {
  id: string;
  name: string;
  emoji: string;
  prompt: string;
  builtin?: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  provider: ProviderId;
  model: string;
  systemPrompt: string;
  personaId?: string;
  messages: ChatMessage[];
  totalIn: number;
  totalOut: number;
}

interface ApiKeys {
  gemini: string;
  openrouter: string;
}

interface State {
  hydrated: boolean;
  apiKeys: ApiKeys;
  defaultProvider: ProviderId;
  defaultModel: string;
  personas: Persona[];
  conversations: Conversation[];
  activeId: string | null;
  hydrate: () => Promise<void>;
  setApiKey: (p: ProviderId, key: string) => void;
  setDefaults: (provider: ProviderId, model: string) => void;
  newConversation: (init?: Partial<Conversation>) => Conversation;
  setActive: (id: string | null) => void;
  renameConversation: (id: string, title: string) => void;
  deleteConversation: (id: string) => void;
  setSystemPrompt: (id: string, prompt: string, personaId?: string) => void;
  setModel: (id: string, provider: ProviderId, model: string) => void;
  pushMessage: (id: string, m: ChatMessage) => void;
  patchMessage: (id: string, mid: string, patch: Partial<ChatMessage>) => void;
  appendDelta: (id: string, mid: string, text: string) => void;
  finishMessage: (id: string, mid: string, usage?: { input: number; output: number }) => void;
  failMessage: (id: string, mid: string, error: string) => void;
  addPersona: (p: Omit<Persona, 'id'>) => Persona;
  updatePersona: (id: string, patch: Partial<Persona>) => void;
  deletePersona: (id: string) => void;
}

const KEY_KEYS = 'rk:chat:keys';
const KEY_DEFAULTS = 'rk:chat:defaults';
const KEY_PERSONAS = 'rk:chat:personas';
const KEY_CONVOS = 'rk:chat:conversations:v1';
const KEY_BACKUP = 'rk:chat:conversations:backup';

const BUILTIN: Persona[] = [
  { id: 'general',  name: 'مساعد عام',          emoji: '💬', prompt: 'أنت مساعد ذكي. أجب بدقة وإيجاز بالعربية الفصحى المبسّطة.', builtin: true },
  { id: 'engineer', name: 'مهندس إنشائي',       emoji: '🏗️', prompt: 'أنت مهندس إنشائي سعودي خبير وفق SBC 304/ACI 318. ساعد بالتقدير الأولي للكميات والتكاليف. حذّر دائماً أن النتائج تستوجب مراجعة مهندس مرخّص.', builtin: true },
  { id: 'tutor',    name: 'مدرّس صبور',         emoji: '📚', prompt: 'أنت مدرّس خصوصي صبور. اشرح المفاهيم خطوة بخطوة بأمثلة بسيطة، وتأكّد من فهم الطالب قبل الانتقال.', builtin: true },
  { id: 'writer',   name: 'محرّر عربي',          emoji: '✒️', prompt: 'أنت محرّر لغة عربية. صحّح، حسّن الأسلوب، واقترح بدائل أكثر بلاغة دون تغيير المعنى.', builtin: true },
  { id: 'coder',    name: 'مهندس برمجيات',       emoji: '💻', prompt: 'أنت مهندس برمجيات سينيور. أجب بكود نظيف وقابل للصيانة مع تعليقات قصيرة عند الحاجة، وعلّم بأمثلة عملية.', builtin: true },
];

function rid(): string { return Math.random().toString(36).slice(2, 11) + Date.now().toString(36).slice(-4); }

let writeTimer: ReturnType<typeof setTimeout> | null = null;
let pending: Conversation[] | null = null;
function queueSave(conversations: Conversation[]) {
  pending = conversations;
  if (writeTimer) return;
  writeTimer = setTimeout(async () => {
    const v = pending!; pending = null; writeTimer = null;
    try {
      const raw = JSON.stringify(v);
      await AsyncStorage.setItem(KEY_CONVOS, raw);
      await AsyncStorage.setItem(KEY_BACKUP, raw);
    } catch {}
  }, 200);
}

export const useChat = create<State>((set, get) => ({
  hydrated: false,
  apiKeys: { gemini: '', openrouter: '' },
  defaultProvider: defaultProvider(),
  defaultModel: defaultModel(defaultProvider()),
  personas: BUILTIN,
  conversations: [],
  activeId: null,

  hydrate: async () => {
    const [rawKeys, rawDefaults, rawPersonas, rawConvos, rawBackup] = await Promise.all([
      AsyncStorage.getItem(KEY_KEYS).catch(() => null),
      AsyncStorage.getItem(KEY_DEFAULTS).catch(() => null),
      AsyncStorage.getItem(KEY_PERSONAS).catch(() => null),
      AsyncStorage.getItem(KEY_CONVOS).catch(() => null),
      AsyncStorage.getItem(KEY_BACKUP).catch(() => null),
    ]);
    let convos: Conversation[] = [];
    try { if (rawConvos) convos = JSON.parse(rawConvos); } catch {}
    if (!convos.length && rawBackup) {
      try { convos = JSON.parse(rawBackup); } catch {}
    }
    let personas: Persona[] = BUILTIN;
    if (rawPersonas) {
      try {
        const stored = JSON.parse(rawPersonas) as Persona[];
        const ids = new Set(stored.map(p => p.id));
        personas = [...BUILTIN.filter(b => !ids.has(b.id)), ...stored];
      } catch {}
    }
    let apiKeys: ApiKeys = { gemini: '', openrouter: '' };
    try { if (rawKeys) apiKeys = { ...apiKeys, ...JSON.parse(rawKeys) }; } catch {}
    let defs = { provider: defaultProvider(), model: defaultModel(defaultProvider()) };
    try { if (rawDefaults) defs = { ...defs, ...JSON.parse(rawDefaults) }; } catch {}

    set({
      hydrated: true,
      apiKeys,
      defaultProvider: defs.provider,
      defaultModel: defs.model,
      personas,
      conversations: convos,
      activeId: convos[0]?.id ?? null,
    });
  },

  setApiKey: (p, key) => set(s => {
    const apiKeys = { ...s.apiKeys, [p]: key };
    AsyncStorage.setItem(KEY_KEYS, JSON.stringify(apiKeys)).catch(() => {});
    return { apiKeys };
  }),

  setDefaults: (provider, model) => set(() => {
    AsyncStorage.setItem(KEY_DEFAULTS, JSON.stringify({ provider, model })).catch(() => {});
    return { defaultProvider: provider, defaultModel: model };
  }),

  newConversation: (init) => {
    const s = get();
    const sys = s.personas.find(p => p.id === 'general')?.prompt ?? '';
    const c: Conversation = {
      id: rid(),
      title: 'محادثة جديدة',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      provider: s.defaultProvider,
      model: s.defaultModel,
      systemPrompt: sys,
      personaId: 'general',
      messages: [],
      totalIn: 0,
      totalOut: 0,
      ...init,
    };
    const conversations = [c, ...s.conversations];
    queueSave(conversations);
    set({ conversations, activeId: c.id });
    return c;
  },

  setActive: (id) => set({ activeId: id }),

  renameConversation: (id, title) => set(s => {
    const conversations = s.conversations.map(c => c.id === id ? { ...c, title, updatedAt: Date.now() } : c);
    queueSave(conversations);
    return { conversations };
  }),

  deleteConversation: (id) => set(s => {
    const conversations = s.conversations.filter(c => c.id !== id);
    queueSave(conversations);
    return {
      conversations,
      activeId: s.activeId === id ? (conversations[0]?.id ?? null) : s.activeId,
    };
  }),

  setSystemPrompt: (id, prompt, personaId) => set(s => {
    const conversations = s.conversations.map(c =>
      c.id === id ? { ...c, systemPrompt: prompt, personaId, updatedAt: Date.now() } : c);
    queueSave(conversations);
    return { conversations };
  }),

  setModel: (id, provider, model) => set(s => {
    const conversations = s.conversations.map(c =>
      c.id === id ? { ...c, provider, model, updatedAt: Date.now() } : c);
    queueSave(conversations);
    return { conversations };
  }),

  pushMessage: (id, m) => set(s => {
    const conversations = s.conversations.map(c => {
      if (c.id !== id) return c;
      const messages = [...c.messages, m];
      // Auto-title from first user message
      let title = c.title;
      if (title === 'محادثة جديدة' && m.role === 'user' && m.content) {
        title = m.content.slice(0, 40).trim() || title;
      }
      return { ...c, messages, title, updatedAt: Date.now() };
    });
    queueSave(conversations);
    return { conversations };
  }),

  patchMessage: (id, mid, patch) => set(s => {
    const conversations = s.conversations.map(c => {
      if (c.id !== id) return c;
      return {
        ...c,
        messages: c.messages.map(m => m.id === mid ? { ...m, ...patch } : m),
        updatedAt: Date.now(),
      };
    });
    queueSave(conversations);
    return { conversations };
  }),

  appendDelta: (id, mid, text) => set(s => {
    const conversations = s.conversations.map(c => {
      if (c.id !== id) return c;
      return {
        ...c,
        messages: c.messages.map(m => m.id === mid ? { ...m, content: m.content + text } : m),
        updatedAt: Date.now(),
      };
    });
    queueSave(conversations);
    return { conversations };
  }),

  finishMessage: (id, mid, usage) => set(s => {
    const conversations = s.conversations.map(c => {
      if (c.id !== id) return c;
      const messages = c.messages.map(m => m.id === mid
        ? { ...m, tokensIn: usage?.input, tokensOut: usage?.output }
        : m);
      const totalIn  = c.totalIn  + (usage?.input  ?? 0);
      const totalOut = c.totalOut + (usage?.output ?? 0);
      return { ...c, messages, totalIn, totalOut, updatedAt: Date.now() };
    });
    queueSave(conversations);
    return { conversations };
  }),

  failMessage: (id, mid, error) => set(s => {
    const conversations = s.conversations.map(c => {
      if (c.id !== id) return c;
      return {
        ...c,
        messages: c.messages.map(m => m.id === mid ? { ...m, error } : m),
        updatedAt: Date.now(),
      };
    });
    queueSave(conversations);
    return { conversations };
  }),

  addPersona: (p) => {
    const persona: Persona = { id: rid(), ...p };
    set(s => {
      const personas = [...s.personas, persona];
      AsyncStorage.setItem(KEY_PERSONAS, JSON.stringify(personas.filter(x => !x.builtin))).catch(() => {});
      return { personas };
    });
    return persona;
  },

  updatePersona: (id, patch) => set(s => {
    const personas = s.personas.map(p => p.id === id ? { ...p, ...patch } : p);
    AsyncStorage.setItem(KEY_PERSONAS, JSON.stringify(personas.filter(p => !p.builtin))).catch(() => {});
    return { personas };
  }),

  deletePersona: (id) => set(s => {
    const target = s.personas.find(p => p.id === id);
    if (!target || target.builtin) return s;
    const personas = s.personas.filter(p => p.id !== id);
    AsyncStorage.setItem(KEY_PERSONAS, JSON.stringify(personas.filter(p => !p.builtin))).catch(() => {});
    return { personas };
  }),
}));

export function newMessage(role: 'user' | 'assistant' | 'system', content = '', parts?: ContentPart[]): ChatMessage {
  return { id: rid(), role, content, parts, at: Date.now() };
}
