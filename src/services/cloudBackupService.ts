import configService from './configService';
import type { DashyConfig } from '../types/config';

interface GistFile {
    filename: string;
    content: string;
}

interface GistData {
    description: string;
    public: boolean;
    files: Record<string, GistFile>;
}

class CloudBackupService {
    private static instance: CloudBackupService;
    private readonly encryptionKey = 'dashy-backup-encryption-key'; // Should be user-provided in production

    private constructor() { }

    static getInstance(): CloudBackupService {
        if (!CloudBackupService.instance) {
            CloudBackupService.instance = new CloudBackupService();
        }
        return CloudBackupService.instance;
    }

    /**
     * 简单加密 (Base64) - 生产环境应使用真正的加密
     */
    private encrypt(data: string): string {
        return btoa(encodeURIComponent(data));
    }

    /**
     * 简单解密
     */
    private decrypt(data: string): string {
        return decodeURIComponent(atob(data));
    }

    /**
     * 备份配置到GitHub Gist
     */
    async backup(config: DashyConfig, accessToken: string): Promise<{ success: boolean; gistId?: string; error?: string }> {
        try {
            const yamlContent = configService.toYAML(config);
            const encryptedContent = this.encrypt(yamlContent);

            const gistData: GistData = {
                description: '老王导航 - Dashy配置备份',
                public: false,
                files: {
                    'dashy-config.enc': {
                        filename: 'dashy-config.enc',
                        content: encryptedContent,
                    },
                },
            };

            const response = await fetch('https://api.github.com/gists', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(gistData),
            });

            if (!response.ok) {
                throw new Error(`GitHub API error: ${response.status}`);
            }

            const result = await response.json();

            // Save gist ID to localStorage
            localStorage.setItem('dashy-backup-gist-id', result.id);
            localStorage.setItem('dashy-backup-token', accessToken);

            return { success: true, gistId: result.id };
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Backup failed';
            return { success: false, error: message };
        }
    }

    /**
     * 从GitHub Gist恢复配置
     */
    async restore(gistId: string, accessToken?: string): Promise<{ success: boolean; config?: DashyConfig; error?: string }> {
        try {
            const token = accessToken || localStorage.getItem('dashy-backup-token');

            const headers: HeadersInit = {
                'Content-Type': 'application/json',
            };

            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(`https://api.github.com/gists/${gistId}`, {
                headers,
            });

            if (!response.ok) {
                throw new Error(`GitHub API error: ${response.status}`);
            }

            const gist = await response.json();
            const encryptedContent = gist.files['dashy-config.enc']?.content;

            if (!encryptedContent) {
                throw new Error('Config file not found in gist');
            }

            const yamlContent = this.decrypt(encryptedContent);
            const result = configService.parseYAML(yamlContent);

            if (result.success && result.config) {
                return { success: true, config: result.config };
            } else {
                return { success: false, error: result.errors?.join(', ') };
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Restore failed';
            return { success: false, error: message };
        }
    }

    /**
     * 更新已存在的Gist
     */
    async update(config: DashyConfig): Promise<{ success: boolean; error?: string }> {
        try {
            const gistId = localStorage.getItem('dashy-backup-gist-id');
            const accessToken = localStorage.getItem('dashy-backup-token');

            if (!gistId || !accessToken) {
                throw new Error('No backup found. Please create a new backup first.');
            }

            const yamlContent = configService.toYAML(config);
            const encryptedContent = this.encrypt(yamlContent);

            const gistData = {
                files: {
                    'dashy-config.enc': {
                        content: encryptedContent,
                    },
                },
            };

            const response = await fetch(`https://api.github.com/gists/${gistId}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(gistData),
            });

            if (!response.ok) {
                throw new Error(`GitHub API error: ${response.status}`);
            }

            return { success: true };
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Update failed';
            return { success: false, error: message };
        }
    }

    /**
     * 检查是否已配置备份
     */
    hasBackup(): boolean {
        return Boolean(localStorage.getItem('dashy-backup-gist-id'));
    }

    /**
     * 获取备份信息
     */
    getBackupInfo(): { gistId: string | null; hasToken: boolean } {
        return {
            gistId: localStorage.getItem('dashy-backup-gist-id'),
            hasToken: Boolean(localStorage.getItem('dashy-backup-token')),
        };
    }

    /**
     * 清除备份信息
     */
    clearBackupInfo(): void {
        localStorage.removeItem('dashy-backup-gist-id');
        localStorage.removeItem('dashy-backup-token');
    }
}

export default CloudBackupService.getInstance();
