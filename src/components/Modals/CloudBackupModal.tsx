import { useState } from 'react';
import { Cloud, Upload, Download, Trash2, Key } from 'lucide-react';
import cloudBackupService from '../../services/cloudBackupService';
import { useConfigStore } from '../../store/useConfigStore';

interface CloudBackupModalProps {
    onClose: () => void;
}

export default function CloudBackupModal({ onClose }: CloudBackupModalProps) {
    const { config, updateConfig } = useConfigStore();
    const backupInfo = cloudBackupService.getBackupInfo();

    const [accessToken, setAccessToken] = useState('');
    const [gistId, setGistId] = useState(backupInfo.gistId || '');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState<'success' | 'error'>('success');

    const showMessage = (msg: string, type: 'success' | 'error') => {
        setMessage(msg);
        setMessageType(type);
        setTimeout(() => setMessage(''), 5000);
    };

    const handleBackup = async () => {
        if (!config) return;
        if (!accessToken) {
            showMessage('请输入GitHub Access Token', 'error');
            return;
        }

        setLoading(true);
        const result = await cloudBackupService.backup(config, accessToken);
        setLoading(false);

        if (result.success) {
            setGistId(result.gistId || '');
            showMessage(`备份成功！Gist ID: ${result.gistId}`, 'success');
        } else {
            showMessage(`备份失败: ${result.error}`, 'error');
        }
    };

    const handleRestore = async () => {
        if (!gistId) {
            showMessage('请输入Gist ID', 'error');
            return;
        }

        setLoading(true);
        const result = await cloudBackupService.restore(gistId, accessToken || undefined);
        setLoading(false);

        if (result.success && result.config) {
            updateConfig(result.config);
            showMessage('恢复成功！', 'success');
        } else {
            showMessage(`恢复失败: ${result.error}`, 'error');
        }
    };

    const handleUpdate = async () => {
        if (!config) return;

        setLoading(true);
        const result = await cloudBackupService.update(config);
        setLoading(false);

        if (result.success) {
            showMessage('更新成功！', 'success');
        } else {
            showMessage(`更新失败: ${result.error}`, 'error');
        }
    };

    const handleClear = () => {
        cloudBackupService.clearBackupInfo();
        setGistId('');
        setAccessToken('');
        showMessage('备份信息已清除', 'success');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="glass rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <Cloud className="w-6 h-6 text-primary" />
                        <h2 className="text-2xl font-bold text-white">云备份与同步</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-lg transition"
                    >
                        ✕
                    </button>
                </div>

                {/* Message */}
                {message && (
                    <div
                        className={`mb-4 p-4 rounded-lg ${messageType === 'success'
                                ? 'bg-green-500/20 text-green-300 border border-green-500/50'
                                : 'bg-red-500/20 text-red-300 border border-red-500/50'
                            }`}
                    >
                        {message}
                    </div>
                )}

                {/* GitHub Token */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        <Key className="w-4 h-4 inline mr-2" />
                        GitHub Personal Access Token
                    </label>
                    <input
                        type="password"
                        value={accessToken}
                        onChange={(e) => setAccessToken(e.target.value)}
                        placeholder="ghp_xxxxxxxxxxxx"
                        className="w-full px-4 py-2 bg-black/40 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary/50"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        需要 'gist' 权限。
                        <a
                            href="https://github.com/settings/tokens/new"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline ml-1"
                        >
                            创建Token
                        </a>
                    </p>
                </div>

                {/* Gist ID */}
                {backupInfo.gistId && (
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            当前Gist ID
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={gistId}
                                onChange={(e) => setGistId(e.target.value)}
                                className="flex-1 px-4 py-2 bg-black/40 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary/50"
                                readOnly
                            />
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(gistId);
                                    showMessage('Gist ID已复制', 'success');
                                }}
                                className="px-4 py-2 glass rounded-lg hover:bg-white/10 transition"
                            >
                                复制
                            </button>
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <button
                        onClick={handleBackup}
                        disabled={loading}
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-primary/20 text-primary border border-primary/50 rounded-lg hover:bg-primary/30 transition disabled:opacity-50"
                    >
                        <Upload className="w-5 h-5" />
                        {backupInfo.hasToken ? '更新备份' : '创建备份'}
                    </button>

                    <button
                        onClick={handleRestore}
                        disabled={loading || !gistId}
                        className="flex items-center justify-center gap-2 px-4 py-3 glass rounded-lg hover:bg-white/10 transition disabled:opacity-50"
                    >
                        <Download className="w-5 h-5" />
                        恢复配置
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {backupInfo.hasToken && (
                        <button
                            onClick={handleUpdate}
                            disabled={loading}
                            className="flex items-center justify-center gap-2 px-4 py-3 bg-secondary/20 text-secondary border border-secondary/50 rounded-lg hover:bg-secondary/30 transition disabled:opacity-50"
                        >
                            <Cloud className="w-5 h-5" />
                            更新到云端
                        </button>
                    )}

                    <button
                        onClick={handleClear}
                        className="flex items-center justify-center gap-2 px-4 py-3 glass rounded-lg hover:bg-red-500/20 text-red-400 transition"
                    >
                        <Trash2 className="w-5 h-5" />
                        清除备份信息
                    </button>
                </div>

                {/* Help */}
                <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <h3 className="font-semibold text-blue-300 mb-2">使用说明</h3>
                    <ul className="text-sm text-gray-400 space-y-1">
                        <li>1. 创建GitHub Personal Access Token (需要gist权限)</li>
                        <li>2. 点击"创建备份"将配置上传到Gist</li>
                        <li>3. 保存好Gist ID，可在其他设备恢复</li>
                        <li>4. 配置更改后点击"更新到云端"同步</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
