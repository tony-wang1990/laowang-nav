import { useState } from 'react';
import { X, FolderPlus } from 'lucide-react';
import { useConfigStore } from '../../store/useConfigStore';

interface AddSectionModalProps {
    onClose: () => void;
}

export default function AddSectionModal({ onClose }: AddSectionModalProps) {
    const { config, updateConfig } = useConfigStore();
    const [sectionName, setSectionName] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!config || !sectionName.trim()) return;

        const newSection = {
            name: sectionName,
            icon: '📁',
            items: [],
            displayData: {
                sortBy: 'default' as const,
                collapsed: false,
                hideForGuests: false,
            },
        };

        updateConfig({ ...config, sections: [...config.sections, newSection] });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="glass rounded-2xl p-6 w-full max-w-md">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <FolderPlus className="w-6 h-6" />
                        添加分类
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">分类名称 *</label>
                        <input
                            type="text"
                            value={sectionName}
                            onChange={(e) => setSectionName(e.target.value)}
                            placeholder="例如：开发工具"
                            className="w-full px-4 py-2 bg-black/40 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary/50"
                            required
                            autoFocus
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
