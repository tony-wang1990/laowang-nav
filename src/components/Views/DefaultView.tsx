import { useState } from 'react';
import { ExternalLink, Edit, FolderPlus, AppWindow } from 'lucide-react';
import { useConfigStore } from '../../store/useConfigStore';
import { useAppStore } from '../../store/useAppStore';
import AddItemModal from '../Modals/AddItemModal';
import EditItemModal from '../Modals/EditItemModal';
import AddSectionModal from '../Modals/AddSectionModal';
import type { Item } from '../../types/config';
import { useTranslation } from 'react-i18next';

export default function DefaultView() {
    const { t } = useTranslation();
    const config = useConfigStore((state) => state.config);
    const { searchQuery, editMode, activeSection, layout, itemSize } = useAppStore();
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

    // Size configuration
    const sizeClasses = {
        small: {
            container: 'w-[120px] sm:w-[140px]',
            padding: 'p-3',
            icon: 'w-10 h-10',
            iconImg: 'w-8 h-8',
            iconText: 'text-2xl',
            title: 'text-xs',
            gap: 'gap-2'
        },
        medium: {
            container: 'w-[160px] sm:w-[180px]',
            padding: 'p-5',
            icon: 'w-16 h-16',
            iconImg: 'w-12 h-12',
            iconText: 'text-4xl',
            title: 'text-sm',
            gap: 'gap-3'
        },
        large: {
            container: 'w-[200px] sm:w-[240px]',
            padding: 'p-6',
            icon: 'w-20 h-20',
            iconImg: 'w-16 h-16',
            iconText: 'text-5xl',
            title: 'text-base',
            gap: 'gap-4'
        }
    };

    const currentSize = sizeClasses[itemSize] || sizeClasses.medium;

    return (
        <main className="flex-1 w-full">
            <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Top Toolbar for Edit Mode */}
                {editMode && (
                    <div className="flex justify-end gap-3 mb-8">
                        <button
                            onClick={() => setShowAddItem(config.sections[0]?.name || '')}
                            className="flex items-center gap-2 px-4 py-2 bg-primary/20 text-primary border border-primary/50 rounded-lg hover:bg-primary/30 transition"
                        >
                            <AppWindow className="w-4 h-4" />
                            <span className="font-medium">添加应用</span>
                        </button>
                        <button
                            onClick={() => setShowAddSection(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-secondary/20 text-secondary border border-secondary/50 rounded-lg hover:bg-secondary/30 transition"
                        >
                            <FolderPlus className="w-4 h-4" />
                            <span className="font-medium">添加分类</span>
                        </button>
                    </div>
                )}

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
                                <div className="flex items-center justify-center mb-6 relative">
                                    <button onClick={() => toggleSection(section.name)} className="flex items-center gap-4 group">
                                        <div className="w-1.5 h-10 bg-gradient-to-b from-primary to-secondary rounded-full" />
                                        <h2 className="text-3xl font-bold text-white group-hover:text-primary transition-colors">
                                            {t(section.name, section.name)}
                                        </h2>
                                        <span className="px-4 py-1.5 bg-primary/20 text-primary rounded-full text-sm font-medium border border-primary/30">
                                            {section.items?.length || 0} apps
                                        </span>
                                    </button>
                                </div>

                                {/* Items Grid/List */}
                                {isExpanded && section.items && section.items.length > 0 && (
                                    <div className={`flex flex-wrap justify-start gap-4 ${layout === 'list' ? 'flex-col items-stretch max-w-4xl mx-auto' : ''}`}>
                                        {section.items.map((item) => (
                                            <div
                                                key={item.title}
                                                onClick={() => handleItemClick(item)}
                                                className={`group relative bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-md border border-white/10 rounded-2xl hover:from-white/10 hover:to-white/15 hover:border-primary/50 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl hover:shadow-primary/20 
                                                    ${layout === 'grid' ? `${currentSize.container} ${currentSize.padding}` : 'w-full p-4 flex items-center gap-4'}
                                                    ${editMode ? 'cursor-default' : 'cursor-pointer'}
                                                `}
                                            >
                                                <div className={`flex ${layout === 'grid' ? `flex-col items-center text-center ${currentSize.gap}` : 'items-center gap-4 text-left w-full'}`}>
                                                    {/* Icon */}
                                                    <div className={`${layout === 'grid' ? currentSize.icon : 'w-12 h-12'} flex items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 group-hover:from-primary/30 group-hover:to-secondary/30 transition-all shadow-lg shrink-0`}>
                                                        {item.icon.startsWith('http') ? (
                                                            <img src={item.icon} alt={item.title} className={`${layout === 'grid' ? currentSize.iconImg : 'w-8 h-8'} rounded-xl`} />
                                                        ) : item.icon.startsWith('fa') ? (
                                                            <i className={`${item.icon} ${layout === 'grid' ? 'text-3xl' : 'text-xl'} text-white`} />
                                                        ) : (
                                                            <span className={`${layout === 'grid' ? currentSize.iconText : 'text-2xl'}`}>{item.icon}</span>
                                                        )}
                                                    </div>

                                                    {/* Content */}
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className={`font-bold text-white group-hover:text-primary transition-colors leading-tight truncate ${layout === 'grid' ? `${currentSize.title} w-full` : 'text-lg'}`}>
                                                            {item.title}
                                                        </h3>

                                                        {layout === 'list' && item.description && (
                                                            <p className="text-sm text-gray-400 truncate mt-1">
                                                                {item.description}
                                                            </p>
                                                        )}
                                                    </div>

                                                    {/* Grid View Description Tooltip */}
                                                    {layout === 'grid' && item.description && (
                                                        <p className="text-xs text-gray-400 line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-2 left-2 right-2 bg-black/80 p-1 rounded backdrop-blur-sm z-10 pointer-events-none">
                                                            {item.description}
                                                        </p>
                                                    )}
                                                </div>

                                                {/* External Link Icon */}
                                                {!editMode && (
                                                    <div className={`absolute ${layout === 'grid' ? 'top-3 right-3' : 'right-4 top-1/2 -translate-y-1/2'} opacity-0 group-hover:opacity-100 transition-opacity`}>
                                                        <ExternalLink className="w-4 h-4 text-primary" />
                                                    </div>
                                                )}

                                                {/* Edit Mode Actions */}
                                                {editMode && (
                                                    <div className={`absolute ${layout === 'grid' ? 'top-2 right-2' : 'right-4 top-1/2 -translate-y-1/2'} flex gap-1 z-20`}>
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
