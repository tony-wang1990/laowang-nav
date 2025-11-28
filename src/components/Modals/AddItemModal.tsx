import { useState } from 'react';
import { X, Plus, Sparkles } from 'lucide-react';
import { useConfigStore } from '../../store/useConfigStore';
import IconService from '../../services/iconService';
import type { Item } from '../../types/config';

interface AddItemModalProps {
    sectionName: string;
    onClose: () => void;
}

export default function AddItemModal({ sectionName, onClose }: AddItemModalProps) {
    const { config, updateConfig } = useConfigStore();
    const [formData, setFormData] = useState<Partial<Item>>({
        title: '',
        url: '',
        description: '',
        icon: '🔗',
        target: 'newtab',
    });
    const [fetchingIcon, setFetchingIcon] = useState(false);

    const handleFetchIcon = async () => {
        if (!formData.url) return;

        setFetchingIcon(true);
        try {
            const url = formData.url.startsWith('http') ? formData.url : `https://${formData.url}`;
            const iconUrl = await IconService.getFavicon(url);
            if (iconUrl) {
                setFormData({ ...formData, icon: iconUrl });
            }
        } catch (error) {
            console.error('Failed to fetch icon:', error);
        } finally {
            setFetchingIcon(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!config || !formData.title || !formData.url) return;

        const newItem: Item = {
            title: formData.title,
            url: formData.url.startsWith('http') ? formData.url : `https://${formData.url}`,
            description: formData.description,
            icon: formData.icon || '🔗',
            target: formData.target,
        };

        const newSections = config.sections.map((section) =>
            section.name === sectionName
                ? { ...section, items: [...(section.items || []), newItem] }
                : section
        );

        updateConfig({ ...config, sections: newSections });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="glass rounded-2xl p-6 w-full max-w-md">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Plus className="w-6 h-6" />
                        添加应用
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">应用名称 *</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full px-4 py-2 bg-black/40 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary/50"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">URL *</label>
                        <input
                            type="text"
                            value={formData.url}
                            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                            placeholder="example.com"
                            className="w-full px-4 py-2 bg-black/40 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary/50"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">图标</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={formData.icon}
                                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                                placeholder="🚀 or fab fa-github or http://..."
                                className="flex-1 px-4 py-2 bg-black/40 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary/50"
                            />
                            <button
                                type="button"
                                onClick={handleFetchIcon}
                                disabled={!formData.url || fetchingIcon}
                                className="px-3 py-2 bg-secondary/20 text-secondary border border-secondary/50 rounded-lg hover:bg-secondary/30 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 whitespace-nowrap"
                                title="自动获取网站图标"
                            >
                                <Sparkles className={`w-4 h-4 ${fetchingIcon ? 'animate-spin' : ''}`} />
                                <span className="text-sm">{fetchingIcon ? '获取...' : '自动'}</span>
                            </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">支持 Emoji、Font Awesome、图片 URL，或点击"自动"获取网站图标</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">描述</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-4 py-2 bg-black/40 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary/50"
                            rows={2}
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 glass rounded-lg hover:bg-white/10 transition"
                        >
                            取消
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-primary/20 text-primary border border-primary/50 rounded-lg hover:bg-primary/30 transition"
                        >
                            添加
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
