import { useState } from 'react';
import { X, Settings as SettingsIcon, Palette, Download, Upload, Code, Cloud, Lock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useConfigStore } from '../../store/useConfigStore';
import { useThemeStore, backgrounds } from '../../store/useThemeStore';
import { useAppStore, hashPassword } from '../../store/useAppStore';
import ConfigEditorModal from './ConfigEditorModal';
import CloudBackupModal from './CloudBackupModal';

interface SettingsModalProps {
    onClose: () => void;
}

export default function SettingsModal({ onClose }: SettingsModalProps) {
    const { t } = useTranslation();
    const { config, exportToFile, importFromFile, resetConfig, updateConfig } = useConfigStore();
    const { background, setBackground } = useThemeStore();
    const { logout } = useAppStore();
    const [showConfigEditor, setShowConfigEditor] = useState(false);
    const [showCloudBackup, setShowCloudBackup] = useState(false);

    const [newUsername, setNewUsername] = useState('');
    const [newPassword, setNewPassword] = useState('');

    const handleUpdateAuth = async () => {
        if (!config) return;

        const username = newUsername || config.appConfig.auth?.users?.[0]?.user || 'admin';
        const password = newPassword;

        if (!password) {
            alert('请输入新密码');
            return;
        }

        try {
            const hash = await hashPassword(password);
            const newConfig = { ...config };

            if (!newConfig.appConfig.auth) {
                newConfig.appConfig.auth = { users: [] };
            }

            newConfig.appConfig.auth.users = [{
                user: username,
                hash: hash,
                type: 'admin'
            }];

            updateConfig(newConfig);
            alert('账户已更新，请重新登录');
            logout();
            onClose();
        } catch (error) {
            console.error('Failed to update auth:', error);
            alert('更新失败');
        }
    };

    const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            importFromFile(file);
            e.target.value = ''; // Reset input
        }
    };

    return (
        <>
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                <div className="glass rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6 sticky top-0 bg-[#0f172a]/90 backdrop-blur-md z-10 py-2 -mx-2 px-2 border-b border-white/5">
                        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                            <SettingsIcon className="w-6 h-6" />
                            {t('common.settings')}
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/10 rounded-lg transition"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* General Section */}
                    <div className="mb-8">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <SettingsIcon className="w-5 h-5 text-gray-400" />
                            通用设置
                        </h3>
                        <div className="glass p-4 rounded-lg">
                            <label className="block text-sm font-medium text-gray-400 mb-1">天气位置 (城市名拼音或英文)</label>
                            <input
                                type="text"
                                value={useAppStore.getState().weatherLocation}
                                onChange={(e) => useAppStore.getState().setWeatherLocation(e.target.value)}
                                placeholder="例如: Beijing, Shanghai"
                                className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary/50"
                            />
                            <p className="text-xs text-gray-500 mt-1">留空则自动定位</p>
                        </div>
                    </div>

                    {/* Background Section */}
                    <div className="mb-8">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Palette className="w-5 h-5 text-secondary" />
                            动态背景
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { id: '', name: '默认 (纯色)' },
                                ...backgrounds
                            ].map((bg) => (
                                <button
                                    key={bg.id}
                                    onClick={() => {
                                        setBackground(bg.id);
                                        if (config) {
                                            updateConfig({
                                                ...config,
                                                appConfig: {
                                                    ...config.appConfig,
                                                    background: bg.id
                                                }
                                            });
                                        }
                                    }}
                                    className={`p-3 rounded-lg transition-all border-2 ${background === bg.id
                                        ? 'bg-secondary/20 border-secondary text-secondary'
                                        : 'glass border-white/10 hover:border-white/30'
                                        }`}
                                >
                                    <div className="font-medium capitalize">{bg.name}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Config Management */}
                    <div className="mb-8">
                        <h3 className="text-lg font-semibold text-white mb-4">配置管理</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => exportToFile()}
                                className="flex items-center justify-center gap-2 px-4 py-3 glass rounded-lg hover:bg-white/10 transition"
                            >
                                <Download className="w-5 h-5" />
                                导出配置
                            </button>

                            <label className="flex items-center justify-center gap-2 px-4 py-3 glass rounded-lg hover:bg-white/10 transition cursor-pointer">
                                <Upload className="w-5 h-5" />
                                导入配置
                                <input
                                    type="file"
                                    accept=".yml,.yaml,.json"
                                    onChange={handleImport}
                                    className="hidden"
                                />
                            </label>

                            <button
                                onClick={() => setShowConfigEditor(true)}
                                className="flex items-center justify-center gap-2 px-4 py-3 bg-primary/20 text-primary border border-primary/50 rounded-lg hover:bg-primary/30 transition"
                            >
                                <Code className="w-5 h-5" />
                                编辑配置
                            </button>

                            <button
                                onClick={() => setShowCloudBackup(true)}
                                className="flex items-center justify-center gap-2 px-4 py-3 bg-secondary/20 text-secondary border border-secondary/50 rounded-lg hover:bg-secondary/30 transition"
                            >
                                <Cloud className="w-5 h-5" />
                                云备份
                            </button>

                            <button
                                onClick={() => {
                                    if (confirm('确定要重置所有配置吗？此操作不可恢复！')) {
                                        resetConfig();
                                    }
                                }}
                                className="col-span-2 flex items-center justify-center gap-2 px-4 py-3 glass rounded-lg hover:bg-red-500/20 text-red-400 transition"
                            >
                                重置配置
                            </button>
                        </div>
                    </div>

                    {/* Security Section */}
                    <div className="mb-8">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Lock className="w-5 h-5 text-red-400" />
                            账户安全
                        </h3>
                        <div className="glass p-4 rounded-lg space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">新用户名</label>
                                    <input
                                        type="text"
                                        value={newUsername}
                                        onChange={(e) => setNewUsername(e.target.value)}
                                        placeholder={config?.appConfig?.auth?.users?.[0]?.user || 'admin'}
                                        className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary/50"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">新密码</label>
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="输入新密码"
                                        className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary/50"
                                    />
                                </div>
                            </div>
                            <button
                                onClick={handleUpdateAuth}
                                disabled={!newUsername && !newPassword}
                                className="w-full py-2 bg-red-500/20 text-red-400 border border-red-500/50 rounded-lg hover:bg-red-500/30 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                更新账户信息
                            </button>
                            <p className="text-xs text-gray-500 text-center">
                                注意：更新后需要使用新账号重新登录。凭据仅保存在本地浏览器中。
                            </p>
                        </div>
                    </div>

                    {/* Language Section */}
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-4">语言</h3>
                        <p className="text-gray-400 text-sm">语言设置可在配置中修改 (appConfig.language)</p>
                    </div>
                </div>
            </div>

            {/* Config Editor Modal */}
            {showConfigEditor && (
                <ConfigEditorModal onClose={() => setShowConfigEditor(false)} />
            )}

            {/* Cloud Backup Modal */}
            {showCloudBackup && (
                <CloudBackupModal onClose={() => setShowCloudBackup(false)} />
            )}
        </>
    );
}
