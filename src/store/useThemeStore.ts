import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeState {
    background: string;
    customCss: string;

    // Actions
    setBackground: (bg: string) => void;
    setCustomCss: (css: string) => void;
}

const backgrounds = [
    { id: 'cloud-breeze', name: '云淡风轻' },
    { id: 'blue-sea', name: '碧海蓝天' },
    { id: 'ink-splash', name: '水墨丹青' },
    { id: 'color-flow', name: '流光溢彩' },
    { id: 'purple-haze', name: '紫气东来' },
    { id: 'green-wild', name: '绿野仙踪' },
    { id: 'spring-warm', name: '春日暖阳' },
    { id: 'fairy-tale', name: '童话世界' },
    { id: 'white-pure', name: '素雅简淡' },
    { id: 'gold-jade', name: '金玉满堂' },
    { id: 'snow-sunset', name: '暮雪千山' },
    { id: 'ice-world', name: '冰雪奇缘' },
    { id: 'star-river', name: '星河滚烫' },
    { id: 'aurora-dream', name: '极光幻境' },
    { id: 'neon-night', name: '霓虹闪烁' },
];

export const useThemeStore = create<ThemeState>()(
    persist(
        (set) => ({
            background: 'cloud-breeze',
            customCss: '',

            setBackground: (bg: string) => {
                const isValid = backgrounds.some(b => b.id === bg);
                if (isValid) {
                    set({ background: bg });
                }
            },

            setCustomCss: (css: string) => {
                set({ customCss: css });
                let styleElement = document.getElementById('custom-css');
                if (!styleElement) {
                    styleElement = document.createElement('style');
                    styleElement.id = 'custom-css';
                    document.head.appendChild(styleElement);
                }
                styleElement.textContent = css;
            },
        }),
        {
            name: 'dashy-theme-storage',
        }
    )
);

export { backgrounds };
