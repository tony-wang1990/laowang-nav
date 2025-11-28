import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const defaultConfig = {
    site: {
        title: '老王导航',
        logo: '',
        description: '个人导航站',
    },
    adminUsername: 'admin',
    adminPassword: 'admin',
    sections: [
        {
            id: 'dev',
            name: '开发',
            icon: 'Code',
            items: [
                {
                    id: '1',
                    title: 'GitHub',
                    url: 'https://github.com',
                    icon: 'Github',
                    description: '全球最大的代码托管平台',
                },
                {
                    id: '2',
                    title: 'Stack Overflow',
                    url: 'https://stackoverflow.com',
                    icon: 'Layers',
                    description: '开发者问答社区',
                },
            ],
            children: [], // 支持嵌套子分类
        },
        {
            id: 'design',
            name: '设计',
            icon: 'Palette',
            items: [
                {
                    id: '3',
                    title: 'Figma',
                    url: 'https://figma.com',
                    icon: 'Figma',
                    description: '在线协作界面设计工具',
                },
            ],
            children: [],
        },
        {
            id: 'ai',
            name: '人工智能',
            icon: 'Brain',
            items: [
                {
                    id: '5',
                    title: 'ChatGPT',
                    url: 'https://chat.openai.com',
                    icon: 'MessageSquare',
                    description: 'OpenAI 开发的 AI 助手',
                },
            ],
            children: [],
        },
    ],
};

const useStore = create(
    persist(
        (set, get) => ({
            // States
            config: defaultConfig,
            theme: 'cyberpunk',
            language: 'zh-CN',
            editMode: false,
            isAuthenticated: false,
            searchQuery: '',
            activeSection: null,
            searchEngine: 'baidu',
            weather: null,

            // Language Actions
            setLanguage: (lang) => {
                set({ language: lang });
                localStorage.setItem('language', lang);
                // Trigger i18n language change
                if (window.i18n) {
                    window.i18n.changeLanguage(lang);
                }
            },

            // Theme Actions
            setTheme: (theme) => set({ theme }),

            // Edit Mode Actions
            setEditMode: (mode) => {
                const state = get();
                if (mode && !state.isAuthenticated) {
                    return false;
                }
                set({ editMode: mode });
                return true;
            },

            // Auth Actions
            login: (username, password) => {
                const state = get();
                if (username === state.config.adminUsername && password === state.config.adminPassword) {
                    set({ isAuthenticated: true });
                    return true;
                }
                return false;
            },

            logout: () => {
                set({ isAuthenticated: false, editMode: false });
            },

            updateAdminCredentials: (username, password) => {
                set((state) => ({
                    config: {
                        ...state.config,
                        adminUsername: username,
                        adminPassword: password,
                    },
                }));
            },

            // Search Actions
            setSearchQuery: (query) => set({ searchQuery: query }),
            setSearchEngine: (engine) => set({ searchEngine: engine }),
            setActiveSection: (sectionId) => set({ activeSection: sectionId }),

            // Weather Actions
            setWeather: (weather) => set({ weather }),

            // Section Actions (support nested structure)
            addSection: (section, parentId = null) =>
                set((state) => {
                    const addToSections = (sections) => {
                        if (!parentId) {
                            return [...sections, { ...section, children: [] }];
                        }
                        return sections.map((s) => {
                            if (s.id === parentId) {
                                return {
                                    ...s,
                                    children: [...(s.children || []), { ...section, children: [] }],
                                };
                            }
                            if (s.children) {
                                return { ...s, children: addToSections(s.children) };
                            }
                            return s;
                        });
                    };

                    return {
                        config: {
                            ...state.config,
                            sections: addToSections(state.config.sections),
                        },
                    };
                }),

            updateSection: (id, updates) =>
                set((state) => {
                    const updateInSections = (sections) =>
                        sections.map((s) => {
                            if (s.id === id) {
                                return { ...s, ...updates };
                            }
                            if (s.children) {
                                return { ...s, children: updateInSections(s.children) };
                            }
                            return s;
                        });

                    return {
                        config: {
                            ...state.config,
                            sections: updateInSections(state.config.sections),
                        },
                    };
                }),

            deleteSection: (id) =>
                set((state) => {
                    const deleteFromSections = (sections) =>
                        sections
                            .filter((s) => s.id !== id)
                            .map((s) => ({
                                ...s,
                                children: s.children ? deleteFromSections(s.children) : [],
                            }));

                    return {
                        config: {
                            ...state.config,
                            sections: deleteFromSections(state.config.sections),
                        },
                    };
                }),

            // Item Actions
            addItem: (sectionId, item) =>
                set((state) => {
                    const addToSection = (sections) =>
                        sections.map((s) => {
                            if (s.id === sectionId) {
                                return { ...s, items: [...(s.items || []), item] };
                            }
                            if (s.children) {
                                return { ...s, children: addToSection(s.children) };
                            }
                            return s;
                        });

                    return {
                        config: {
                            ...state.config,
                            sections: addToSection(state.config.sections),
                        },
                    };
                }),

            updateItem: (sectionId, itemId, updates) =>
                set((state) => {
                    const updateInSection = (sections) =>
                        sections.map((s) => {
                            if (s.id === sectionId) {
                                return {
                                    ...s,
                                    items: (s.items || []).map((i) =>
                                        i.id === itemId ? { ...i, ...updates } : i
                                    ),
                                };
                            }
                            if (s.children) {
                                return { ...s, children: updateInSection(s.children) };
                            }
                            return s;
                        });

                    return {
                        config: {
                            ...state.config,
                            sections: updateInSection(state.config.sections),
                        },
                    };
                }),

            deleteItem: (sectionId, itemId) =>
                set((state) => {
                    const deleteFromSection = (sections) =>
                        sections.map((s) => {
                            if (s.id === sectionId) {
                                return {
                                    ...s,
                                    items: (s.items || []).filter((i) => i.id !== itemId),
                                };
                            }
                            if (s.children) {
                                return { ...s, children: deleteFromSection(s.children) };
                            }
                            return s;
                        });

                    return {
                        config: {
                            ...state.config,
                            sections: deleteFromSection(state.config.sections),
                        },
                    };
                }),

            // Config Management
            exportConfig: () => {
                const state = get();
                const dataStr = JSON.stringify(state.config, null, 2);
                const dataBlob = new Blob([dataStr], { type: 'application/json' });
                const url = URL.createObjectURL(dataBlob);
                const link = document.createElement('a');
                link.href = url;
                link.download = 'laowang-nav-config.json';
                link.click();
                URL.revokeObjectURL(url);
            },

            importConfig: (config) => set({ config }),
            resetConfig: () => set({ config: defaultConfig }),
        }),
        {
            name: 'laowang-nav-storage',
        }
    )
);

export default useStore;
