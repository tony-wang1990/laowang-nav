// Re-export all stores for convenient importing
export { useConfigStore } from './useConfigStore';
export { useThemeStore, themes } from './useThemeStore';
export { useAppStore } from './useAppStore';

// Legacy compatibility - export a combined store interface if needed
export { default as useStore } from './useStore';
