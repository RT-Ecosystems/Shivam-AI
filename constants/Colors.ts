export const Colors = {
  // Backgrounds
  bg: '#0a0a0f',
  bgCard: '#111118',
  bgSidebar: '#0d0d14',
  bgInput: '#1a1a24',
  bgMessage: '#16161f',
  bgUserMessage: '#1e3a5f',
  bgSurface: '#1a1a26',

  // Accents
  accent: '#6c8ef5',
  accentSoft: '#3d5af1',
  accentGlow: 'rgba(108, 142, 245, 0.15)',
  accentBorder: 'rgba(108, 142, 245, 0.3)',

  // Model colors
  modelDeepseek: '#a78bfa',
  modelLlama: '#34d399',
  modelDeepseekBg: 'rgba(167, 139, 250, 0.12)',
  modelLlamaBg: 'rgba(52, 211, 153, 0.12)',

  // Text
  textPrimary: '#e8e8f0',
  textSecondary: '#8888aa',
  textMuted: '#555570',
  textAccent: '#8ba4f8',

  // Borders
  border: '#1e1e2e',
  borderLight: '#2a2a3e',

  // Status
  error: '#f87171',
  success: '#34d399',

  // Overlays
  overlay: 'rgba(0,0,0,0.6)',
};

export const MODELS = {
  deepseek: {
    id: 'deepseek-r1-distill-llama-70b',
    name: 'DeepSeek R1',
    subtitle: 'Reasoning Model',
    color: Colors.modelDeepseek,
    bgColor: Colors.modelDeepseekBg,
    icon: '🧠',
  },
  llama: {
    id: 'llama-3.3-70b-versatile',
    name: 'LLaMA 3.3',
    subtitle: 'Unlimited Speed',
    color: Colors.modelLlama,
    bgColor: Colors.modelLlamaBg,
    icon: '⚡',
  },
};
