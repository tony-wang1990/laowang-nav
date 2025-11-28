import { useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';

interface KeyboardShortcut {
    key: string;
    ctrl?: boolean;
    alt?: boolean;
    shift?: boolean;
    action: () => void;
    description: string;
}

const shortcuts: KeyboardShortcut[] = [
    {
        key: '/',
        description: '激活搜索',
        action: () => {
            const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
            searchInput?.focus();
        },
    },
    {
        key: 'Escape',
        description: '清空搜索/关闭模态框',
        action: () => {
            useAppStore.getState().setSearchQuery('');
        },
    },
    {
        key: 't',
        description: '切换主题',
        action: () => {
            // TODO: Implement theme switcher modal
            console.log('Toggle theme');
        },
    },
    {
        key: 'e',
        description: '切换编辑模式',
        action: () => {
            const { editMode, setEditMode, isAuthenticated } = useAppStore.getState();
            if (isAuthenticated) {
                setEditMode(!editMode);
            }
        },
    },
    {
        key: 'k',
        ctrl: true,
        description: '命令面板',
        action: () => {
            // TODO: Implement command palette
            console.log('Open command palette');
        },
    },
];

export function useKeyboardShortcuts() {
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            // Don't trigger shortcuts when typing in inputs
            if (
                event.target instanceof HTMLInputElement ||
                event.target instanceof HTMLTextAreaElement
            ) {
                // Allow Escape to work in inputs
                if (event.key !== 'Escape') {
                    return;
                }
            }

            const shortcut = shortcuts.find((s) => {
                const keyMatch = s.key.toLowerCase() === event.key.toLowerCase();
                const ctrlMatch = s.ctrl ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey;
                const altMatch = s.alt ? event.altKey : !event.altKey;
                const shiftMatch = s.shift ? event.shiftKey : !event.shiftKey;

                return keyMatch && ctrlMatch && altMatch && shiftMatch;
            });

            if (shortcut) {
                event.preventDefault();
                shortcut.action();
            }

            // Number keys 1-9 for quick access
            if (event.key >= '1' && event.key <= '9' && !event.ctrlKey && !event.altKey) {
                // TODO: Implement quick access to first 9 items
                console.log('Quick access:', event.key);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    return shortcuts;
}

export { shortcuts };
