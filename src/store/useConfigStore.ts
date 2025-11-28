import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DashyConfig } from '../types/config';
import configService from '../services/configService';

interface ConfigState {
    config: DashyConfig | null;
    loading: boolean;
    error: string | null;

    // Actions
    loadConfig: () => Promise<void>;
    updateConfig: (config: DashyConfig) => void;
    resetConfig: () => void;
    importFromFile: (file: File) => Promise<boolean>;
    exportToFile: (filename?: string) => void;
}

export const useConfigStore = create<ConfigState>()(
    persist(
        (set, get) => ({
            config: null,
            loading: false,
            error: null,

            loadConfig: async () => {
                set({ loading: true, error: null });
                try {
                    // 首先尝试从LocalStorage加载
                    const result = configService.loadFromLocalStorage();

                    if (result.success && result.config) {
                        set({ config: result.config, loading: false });
                    } else {
                        // 如果失败，尝试从public/conf.yml加载
                        const urlResult = await configService.loadFromURL('/conf.yml');

                        if (urlResult.success && urlResult.config) {
                            set({ config: urlResult.config, loading: false });
                            // 保存到LocalStorage
                            configService.saveToLocalStorage(urlResult.config);
                        } else {
                            // 最后使用默认配置
                            const defaultConfig = configService.loadDefaultConfig();
                            set({ config: defaultConfig, loading: false });
                        }
                    }
                } catch (error) {
                    const message = error instanceof Error ? error.message : '加载配置失败';
                    set({ error: message, loading: false });
                    // 使用默认配置作为后备
                    const defaultConfig = configService.loadDefaultConfig();
                    set({ config: defaultConfig });
                }
            },

            updateConfig: (config: DashyConfig) => {
                set({ config });
                // 保存到LocalStorage
                try {
                    configService.saveToLocalStorage(config);
                } catch (error) {
                    console.error('保存配置失败:', error);
                }
            },

            resetConfig: () => {
                const defaultConfig = configService.loadDefaultConfig();
                set({ config: defaultConfig, error: null });
                configService.saveToLocalStorage(defaultConfig);
            },

            importFromFile: async (file: File): Promise<boolean> => {
                set({ loading: true, error: null });
                try {
                    const result = await configService.importConfig(file);

                    if (result.success && result.config) {
                        set({ config: result.config, loading: false });
                        configService.saveToLocalStorage(result.config);
                        return true;
                    } else {
                        set({ error: result.errors?.join(', ') || '导入失败', loading: false });
                        return false;
                    }
                } catch (error) {
                    const message = error instanceof Error ? error.message : '导入失败';
                    set({ error: message, loading: false });
                    return false;
                }
            },

            exportToFile: (filename = 'conf.yml') => {
                const { config } = get();
                if (config) {
                    configService.exportConfig(config, filename);
                }
            },
        }),
        {
            name: 'dashy-config-storage',
            partialize: (state) => ({ config: state.config }),
        }
    )
);
