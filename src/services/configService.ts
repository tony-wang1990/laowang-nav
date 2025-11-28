import yaml from 'js-yaml';
import Ajv from 'ajv';
import type { DashyConfig } from '../types/config';
import { configSchema } from '../config/schema';
import { defaultConfig } from '../config/defaultConfig';

const ajv = new Ajv({ allErrors: true });
const validate = ajv.compile(configSchema);

class ConfigService {
    private static instance: ConfigService;
    private config: DashyConfig | null = null;

    private constructor() { }

    static getInstance(): ConfigService {
        if (!ConfigService.instance) {
            ConfigService.instance = new ConfigService();
        }
        return ConfigService.instance;
    }

    /**
     * 从YAML字符串解析配置
     */
    parseYAML(yamlString: string): { success: boolean; config?: DashyConfig; errors?: string[] } {
        try {
            const parsed = yaml.load(yamlString) as DashyConfig;

            // 验证配置
            const valid = validate(parsed);

            if (!valid && validate.errors) {
                const errors = validate.errors.map(
                    (err) => `${err.instancePath} ${err.message}`
                );
                return { success: false, errors };
            }

            this.config = parsed;
            return { success: true, config: parsed };
        } catch (error) {
            const message = error instanceof Error ? error.message : '未知错误';
            return { success: false, errors: [message] };
        }
    }

    /**
     * 将配置对象转换为YAML字符串
     */
    toYAML(config: DashyConfig): string {
        try {
            return yaml.dump(config, {
                indent: 2,
                lineWidth: 120,
                noRefs: true,
            });
        } catch (error) {
            console.error('YAML序列化失败:', error);
            return '';
        }
    }

    /**
     * 从URL加载YAML配置
     */
    async loadFromURL(url: string): Promise<{ success: boolean; config?: DashyConfig; errors?: string[] }> {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                return { success: false, errors: [`HTTP ${response.status}: ${response.statusText}`] };
            }

            const yamlString = await response.text();
            return this.parseYAML(yamlString);
        } catch (error) {
            const message = error instanceof Error ? error.message : '加载配置失败';
            return { success: false, errors: [message] };
        }
    }

    /**
     * 加载默认配置
     */
    loadDefaultConfig(): DashyConfig {
        this.config = defaultConfig;
        return defaultConfig;
    }

    /**
     * 获取当前配置
     */
    getConfig(): DashyConfig | null {
        return this.config;
    }

    /**
     * 保存配置到LocalStorage
     */
    saveToLocalStorage(config: DashyConfig): void {
        try {
            const yamlString = this.toYAML(config);
            localStorage.setItem('dashy-config', yamlString);
            localStorage.setItem('dashy-config-json', JSON.stringify(config));
            this.config = config;
        } catch (error) {
            console.error('保存配置失败:', error);
            throw error;
        }
    }

    /**
     * 从LocalStorage加载配置
     */
    loadFromLocalStorage(): { success: boolean; config?: DashyConfig; errors?: string[] } {
        try {
            const yamlString = localStorage.getItem('dashy-config');

            if (!yamlString) {
                // 尝试加载旧的JSON格式
                const jsonString = localStorage.getItem('dashy-config-json');
                if (jsonString) {
                    const config = JSON.parse(jsonString) as DashyConfig;
                    this.config = config;
                    return { success: true, config };
                }

                // 使用默认配置
                return { success: true, config: this.loadDefaultConfig() };
            }

            return this.parseYAML(yamlString);
        } catch (error) {
            const message = error instanceof Error ? error.message : '从LocalStorage加载失败';
            return { success: false, errors: [message] };
        }
    }

    /**
     * 导出配置为文件
     */
    exportConfig(config: DashyConfig, filename: string = 'conf.yml'): void {
        const yamlString = this.toYAML(config);
        const blob = new Blob([yamlString], { type: 'text/yaml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    }

    /**
     * 从文件导入配置
     */
    importConfig(file: File): Promise<{ success: boolean; config?: DashyConfig; errors?: string[] }> {
        return new Promise((resolve) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                const yamlString = e.target?.result as string;
                if (!yamlString) {
                    resolve({ success: false, errors: ['文件读取失败'] });
                    return;
                }

                const result = this.parseYAML(yamlString);
                resolve(result);
            };

            reader.onerror = () => {
                resolve({ success: false, errors: ['文件读取错误'] });
            };

            reader.readAsText(file);
        });
    }
}

export default ConfigService.getInstance();
