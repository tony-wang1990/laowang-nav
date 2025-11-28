import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthUser } from '../types/config';
import { useConfigStore } from './useConfigStore';

interface AppState {
    // View state
    currentView: 'default' | 'minimal' | 'workspace';

    // Search
    searchQuery: string;
    searchEngine: string;

    // Navigation
    activeSection: string | null;
    sidebarOpen: boolean;

    // Edit mode
    editMode: boolean;

    // Authentication
    isAuthenticated: boolean;
    currentUser: AuthUser | null;

    // Weather
    weather: {
        temp: string;
        condition: string;
        icon: string;
        city: string;
    } | null;

    // Language
    language: string;

    // Actions
    setCurrentView: (view: 'default' | 'minimal' | 'workspace') => void;
    setSearchQuery: (query: string) => void;
    setSearchEngine: (engine: string) => void;
    setActiveSection: (sectionId: string | null) => void;
    toggleSidebar: () => void;
    setSidebarOpen: (open: boolean) => void;
    setEditMode: (enabled: boolean) => void;
    login: (username: string, password: string) => Promise<boolean>;
    logout: () => void;
    setWeather: (weather: AppState['weather']) => void;
    setLanguage: (lang: string) => void;
}

// SHA-256 hash helper (简化版，实际应用中应使用crypto库)
export const hashPassword = async (password: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
};

export const useAppStore = create<AppState>()(
    persist(
        (set, get) => ({
            currentView: 'default',
            searchQuery: '',
            searchEngine: 'baidu',
            activeSection: null,
            sidebarOpen: true,
            editMode: false,
            isAuthenticated: false,
            currentUser: null,
            weather: null,
            language: 'zh-CN',

            setCurrentView: (view) => set({ currentView: view }),

            setSearchQuery: (query) => set({ searchQuery: query }),

            setSearchEngine: (engine) => set({ searchEngine: engine }),

            setActiveSection: (sectionId) => set({ activeSection: sectionId }),

            toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

            setSidebarOpen: (open) => set({ sidebarOpen: open }),

            setEditMode: (enabled) => {
                const { isAuthenticated } = get();
                if (isAuthenticated || !enabled) {
                    set({ editMode: enabled });
                }
            },

            login: async (username, password) => {
                const config = useConfigStore.getState().config;
                const inputHash = await hashPassword(password);

                // Default admin hash (admin)
                const defaultAdminHash = '8C6976E5B5410415BDE908BD4DEE15DFB167A9C873FC4BB8A81F6F2AB448A918';

                // Check against config users
                if (config?.appConfig?.auth?.users) {
                    const user = config.appConfig.auth.users.find(u => u.user === username);
                    if (user && user.hash === inputHash) {
                        set({ isAuthenticated: true, currentUser: user });
                        return true;
                    }
                }

                // Fallback for default admin if no users configured or explicit admin check
                // Only if no users are configured in config to prevent backdoor if user changed admin password
                if ((!config?.appConfig?.auth?.users || config.appConfig.auth.users.length === 0) && username === 'admin') {
                    if (inputHash === defaultAdminHash) {
                        const user: AuthUser = {
                            user: 'admin',
                            hash: defaultAdminHash,
                            type: 'admin',
                        };
                        set({ isAuthenticated: true, currentUser: user });
                        return true;
                    }
                }

                return false;
            },

            logout: () => {
                set({
                    isAuthenticated: false,
                    currentUser: null,
                    editMode: false
                });
            },

            setWeather: (weather) => set({ weather }),

            setLanguage: (lang) => set({ language: lang }),
        }),
        {
            name: 'dashy-app-storage',
            partialize: (state) => ({
                currentView: state.currentView,
                searchEngine: state.searchEngine,
                sidebarOpen: state.sidebarOpen,
                isAuthenticated: state.isAuthenticated,
                currentUser: state.currentUser,
                language: state.language,
            }),
        }
    )
);
