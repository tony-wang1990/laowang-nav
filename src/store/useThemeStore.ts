import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeState {
    theme: string;
    customCss: string;

    // Actions
    setTheme: (theme: string) => void;
    setCustomCss: (css: string) => void;
    applyTheme: (theme: string) => void;
}

const themes = [
    'cyberpunk',
    'dark',
    'matrix',
    'sunset',
    'ocean',
    'forest',
    'rose',
    'gold',
    'purple',
    'dashy-original',
    'material',
    'nord',
];

export const useThemeStore = create<ThemeState>()(
    persist(
        (set) => ({
            theme: 'cyberpunk',
            customCss: '',

            setTheme: (theme: string) => {
                if (themes.includes(theme)) {
                    set({ theme });
                    document.documentElement.setAttribute('data-theme', theme);
                }
            },

            setCustomCss: (css: string) => {
                set({ customCss: css });
                // 应用自定义CSS
                let styleElement = document.getElementById('custom-css');
                if (!styleElement) {
                    styleElement = document.createElement('style');
                    styleElement.id = 'custom-css';
                    document.head.appendChild(styleElement);
                }
                styleElement.textContent = css;
            },

            applyTheme: (theme: string) => {
                if (themes.includes(theme)) {
                    set({ theme });
                    document.documentElement.setAttribute('data-theme', theme);
                }
            },
        }),
        {
            name: 'dashy-theme-storage',
        }
    )
);

// 导出可用主题列表
export { themes };
