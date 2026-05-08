// Free-tier AI providers. Keys are stored locally only; calls go directly
// from the device to the provider — no proxy server.

export type ProviderId = 'gemini' | 'openrouter';

export interface ModelInfo {
  id: string;
  label: string;
  vision: boolean;
  toolUse: boolean;
  contextK: number;
  free: boolean;
  // Approximate per-million-token cost in USD (input / output). 0 for free.
  costInPerM: number;
  costOutPerM: number;
}

export interface ProviderInfo {
  id: ProviderId;
  label: string;
  hint: string;
  signupUrl: string;
  apiKeyPlaceholder: string;
  models: ModelInfo[];
}

export const PROVIDERS: Record<ProviderId, ProviderInfo> = {
  gemini: {
    id: 'gemini',
    label: 'Google Gemini',
    hint: 'الطبقة المجانية: ١٥ طلب/دقيقة على Flash',
    signupUrl: 'https://aistudio.google.com/apikey',
    apiKeyPlaceholder: 'AIza...',
    models: [
      { id: 'gemini-2.0-flash-exp',     label: 'Gemini 2.0 Flash (Experimental)', vision: true,  toolUse: true,  contextK: 1000, free: true, costInPerM: 0, costOutPerM: 0 },
      { id: 'gemini-1.5-flash-latest',  label: 'Gemini 1.5 Flash',                vision: true,  toolUse: true,  contextK: 1000, free: true, costInPerM: 0, costOutPerM: 0 },
      { id: 'gemini-1.5-flash-8b',      label: 'Gemini 1.5 Flash 8B',             vision: true,  toolUse: true,  contextK: 1000, free: true, costInPerM: 0, costOutPerM: 0 },
      { id: 'gemini-1.5-pro-latest',    label: 'Gemini 1.5 Pro',                  vision: true,  toolUse: true,  contextK: 2000, free: false, costInPerM: 1.25, costOutPerM: 5 },
    ],
  },
  openrouter: {
    id: 'openrouter',
    label: 'OpenRouter',
    hint: 'النماذج المجانية مُعرَّفة بـ ":free" في الاسم',
    signupUrl: 'https://openrouter.ai/keys',
    apiKeyPlaceholder: 'sk-or-...',
    models: [
      { id: 'meta-llama/llama-3.3-70b-instruct:free',       label: 'Llama 3.3 70B (مجاني)',     vision: false, toolUse: false, contextK: 131, free: true, costInPerM: 0, costOutPerM: 0 },
      { id: 'meta-llama/llama-3.1-8b-instruct:free',        label: 'Llama 3.1 8B (مجاني)',      vision: false, toolUse: false, contextK: 131, free: true, costInPerM: 0, costOutPerM: 0 },
      { id: 'google/gemini-2.0-flash-exp:free',             label: 'Gemini 2.0 Flash (مجاني)', vision: true,  toolUse: false, contextK: 1000, free: true, costInPerM: 0, costOutPerM: 0 },
      { id: 'qwen/qwen-2.5-coder-32b-instruct:free',        label: 'Qwen 2.5 Coder 32B (مجاني)', vision: false, toolUse: false, contextK: 32, free: true, costInPerM: 0, costOutPerM: 0 },
      { id: 'mistralai/mistral-7b-instruct:free',           label: 'Mistral 7B (مجاني)',         vision: false, toolUse: false, contextK: 32, free: true, costInPerM: 0, costOutPerM: 0 },
      { id: 'nousresearch/hermes-3-llama-3.1-405b:free',    label: 'Hermes 3 405B (مجاني)',     vision: false, toolUse: false, contextK: 131, free: true, costInPerM: 0, costOutPerM: 0 },
      { id: 'deepseek/deepseek-r1:free',                    label: 'DeepSeek R1 (مجاني)',        vision: false, toolUse: false, contextK: 64, free: true, costInPerM: 0, costOutPerM: 0 },
    ],
  },
};

export function findModel(providerId: ProviderId, modelId: string): ModelInfo | null {
  return PROVIDERS[providerId].models.find(m => m.id === modelId) ?? null;
}

export function defaultProvider(): ProviderId { return 'gemini'; }
export function defaultModel(p: ProviderId): string { return PROVIDERS[p].models[0].id; }
