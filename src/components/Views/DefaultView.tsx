import { useState } from 'react';
import { ExternalLink, Edit, Plus } from 'lucide-react';
import { useConfigStore } from '../../store/useConfigStore';
import { useAppStore } from '../../store/useAppStore';
import AddItemModal from '../Modals/AddItemModal';
import EditItemModal from '../Modals/EditItemModal';
import AddSectionModal from '../Modals/AddSectionModal';
import type { Item } from '../../types/config';

export default function DefaultView() {
    const config = useConfigStore((state) => state.config);
    const { searchQuery, editMode, activeSection } = useAppStore();
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
    const [showAddItem, setShowAddItem] = useState<string | null>(null);
    const [editingItem, setEditingItem] = useState<{ section: string; item: Item } | null>(null);
    const [showAddSection, setShowAddSection] = useState(false);

    if (!config) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="text-6xl mb-4">⚙️</div>
                    <p className="text-xl text-gray-400">Loading configuration...</p>
                </div>
            </div>
        );
    }

    const filteredSections = config.sections
        .filter((section) => !activeSection || section.name === activeSection)
        .map((section) => ({
            ...section,
            items: (section.items || []).filter(
                (item) =>
                    !searchQuery ||
                    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    item.tags?.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
            ),
        }))
        .filter((section) => section.items.length > 0 || !searchQuery);

    const toggleSection = (sectionName: string) => {
        setExpandedSections((prev) => {
            const next = new Set(prev);
            if (next.has(sectionName)) {
                next.delete(sectionName);
            } else {
                next.add(sectionName);
            }
            return next;
        });
    };

    const handleItemClick = (item: Item) => {
        if (editMode) return;

        const target = item.target || config.appConfig.defaultOpeningMethod;
        const url = item.url.startsWith('http') ? item.url : `https://${item.url}`;

        switch (target) {
            case 'newtab':
                window.open(url, '_blank', 'noopener,noreferrer');
                break;
            case 'sametab':
                window.location.href = url;
                break;
            case 'clipboard':
                navigator.clipboard.writeText(url);
                break;
            default:
                window.open(url, '_blank', 'noopener,noreferrer');
        }
    };

    return (
        <main className="flex-1 w-full">
            <div className="Max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {searchQuery && (
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-white">搜索结果: "{searchQuery}"</h2>
                    </div>
                )}

                <div className="space-y-12">
                    {filteredSections.map((section) => {
                        const isExpanded = !section.displayData.collapsed || expandedSections.has(section.name);

                        return (
                            <div key={section.name} className="section-group">
                                {/* Section Header */}
                                <div className="flex items-center justify-between mb-6">
                                    <button onClick={() => toggleSection(section.name)} className="flex items-center gap-4 group">
                                        <div className="w-1.5 h-10 bg-gradient-to-b from-primary to-secondary rounded-full" />
                                        <h2 className="text-3xl font-bold text-white group-hover:text-primary transition-colors">
                                            {section.name}
                                        </h2>
                                        <span className="px-4 py-1.5 bg-primary/20 text-primary rounded-full text-sm font-medium border border-primary/30">
                                            {section.items?.length || 0} apps
                                        </span>
                                    </button>

                                    {editMode && (
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => setShowAddItem(section.name)}
                                                className="p-2 bg-primary/20 text-primary border border-primary/50 rounded-lg hover:bg-primary/30 transition flex items-center gap-2"
                                            >
                                                <Plus className="w-4 h-4" />
                                                <span className="text-sm">添加应用</span>
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Items Grid */}
                                {isExpanded && section.items && section.items.length > 0 && (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-4">
                                        {section.items.map((item) => (
                                            <div
                                                key={item.title}
                                                onClick={() => handleItemClick(item)}
                                                className={`group relative bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-5 hover:from-white/10 hover:to-white/15 hover:border-primary/50 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl hover:shadow-primary/20 ${editMode ? 'cursor-default' : 'cursor-pointer'
                                                    }`}
                                            >
                                                <div className="flex flex-col items-center gap-3 text-center">
                                                    {/* Icon */}
                                                    <div className="w-16 h-16 flex items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 group-hover:from-primary/30 group-hover:to-secondary/30 transition-all shadow-lg">
                                                        {item.icon.startsWith('http') ? (
                                                            <img src={item.icon} alt={item.title} className="w-12 h-12 rounded-xl" />
                                                        ) : item.icon.startsWith('fa') ? (
                                                            <i className={`${item.icon} text-3xl text-white`} />
                                                        ) : (
                                                            <span className="text-4xl">{item.icon}</span>
                                                        )}
                                                    </div>

                                                    {/* Title */}
                                                    <h3 className="font-bold text-white group-hover:text-primary transition-colors text-sm leading-tight min-h-[2.5rem] flex items-center">
                                                        {item.title}
                                                    </h3>

                                                    {/* Description */}
                                                    {item.description && (
                                                        <p className="text-xs text-gray-400 line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-2 left-2 right-2">
                                                            {item.description}
                                                        </p>
                                                    )}
                                                </div>

                                                {/* External Link Icon */}
                                                {!editMode && (
                                                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <ExternalLink className="w-4 h-4 text-primary" />
                                                    </div>
                                                )}

                                                {/* Edit Mode Actions */}
                                                {editMode && (
                                                    <div className="absolute top-2 right-2 flex gap-1">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setEditingItem({ section: section.name, item });
                                                            }}
                                                            className="p-1.5 bg-black/50 rounded-lg hover:bg-primary/20 transition"
                                                        >
                                                            <Edit className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Empty State */}
                                {isExpanded && (!section.items || section.items.length === 0) && (
                                    <div className="text-center py-12 glass rounded-2xl">
                                        <div className="text-6xl mb-4">📦</div>
                                        <p className="text-gray-400">暂无应用</p>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Empty State */}
                {filteredSections.length === 0 && (
                    <div className="text-center py-20">
                        <div className="text-8xl mb-6">🔍</div>
                        <h2 className="text-3xl font-bold text-white mb-4">没有找到匹配的应用</h2>
                        <p className="text-gray-400">试试其他搜索词</p>
                    </div>
                )}

                {/* Floating Add Section Button */}
                {editMode && (
                    <button
                        onClick={() => setShowAddSection(true)}
                        className="fixed bottom-8 right-8 p-4 bg-primary/20 text-primary border-2 border-primary/50 rounded-full hover:bg-primary/30 transition-all hover:scale-110 shadow-2xl shadow-primary/20 flex items-center gap-2 z-30"
                    >
                        <Plus className="w-6 h-6" />
                        <span className="font-medium pr-2">添加分类</span>
                    </button>
                )}
            </div>

            {/* Modals */}
            {showAddItem && <AddItemModal sectionName={showAddItem} onClose={() => setShowAddItem(null)} />}
            {editingItem && (
                <EditItemModal
                    sectionName={editingItem.section}
                    item={editingItem.item}
                    onClose={() => setEditingItem(null)}
                />
            )}
            {showAddSection && <AddSectionModal onClose={() => setShowAddSection(false)} />}
        </main>
    );
}
