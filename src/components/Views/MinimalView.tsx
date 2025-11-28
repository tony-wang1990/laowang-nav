import { Search } from 'lucide-react';
import { useState } from 'react';
import { useConfigStore } from '../../store/useConfigStore';
import { useAppStore } from '../../store/useAppStore';
import type { Item } from '../../types/config';

export default function MinimalView() {
    const config = useConfigStore((state) => state.config);
    const { searchQuery, setSearchQuery } = useAppStore();
    const [localSearch, setLocalSearch] = useState('');

    if (!config) {
        return null;
    }

    // Flatten all items
    const allItems: Item[] = config.sections
        .flatMap((section) => section.items || [])
        .filter((item) =>
            !localSearch ||
            item.title.toLowerCase().includes(localSearch.toLowerCase()) ||
            item.url.toLowerCase().includes(localSearch.toLowerCase()) ||
            item.tags?.some((tag) => tag.toLowerCase().includes(localSearch.toLowerCase()))
        );

    const handleItemClick = (item: Item) => {
        const url = item.url.startsWith('http') ? item.url : `https://${item.url}`;
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (localSearch.trim()) {
            // If search looks like URL, open it
            if (localSearch.includes('.') || localSearch.startsWith('http')) {
                const url = localSearch.startsWith('http') ? localSearch : `https://${localSearch}`;
                window.open(url, '_blank');
            } else {
                // Otherwise search with default engine
                window.open(`https://www.baidu.com/s?wd=${encodeURIComponent(localSearch)}`, '_blank');
            }
            setLocalSearch('');
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#0a0a0f] via-[#1a1a2e] to-[#16213e] p-8">
            {/* Logo/Title */}
            <div className="text-center mb-12">
                <h1 className="text-6xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent mb-4">
                    {config.pageInfo.title}
                </h1>
                {config.pageInfo.description && (
                    <p className="text-gray-400 text-lg">{config.pageInfo.description}</p>
                )}
            </div>

            {/* Search Bar */}
            <div className="w-full max-w-3xl mb-12">
                <form onSubmit={handleSearch} className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative flex items-center bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 group-hover:border-white/20">
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                value={localSearch}
                                onChange={(e) => setLocalSearch(e.target.value)}
                                placeholder="搜索应用或输入网址..."
                                className="w-full h-16 px-6 bg-transparent text-xl text-white placeholder-gray-500 focus:outline-none"
                                autoFocus
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                <Search className="w-6 h-6 text-gray-500 group-focus-within:text-primary transition-colors" />
                            </div>
                        </div>
                    </div>
                </form>
            </div>

            {/* Quick Links */}
            <div className="w-full max-w-4xl">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {allItems.slice(0, 15).map((item) => (
                        <button
                            key={item.title}
                            onClick={() => handleItemClick(item)}
                            className="group flex flex-col items-center gap-3 p-4 glass rounded-xl hover:bg-white/10 transition-all hover:scale-105"
                        >
                            <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 group-hover:from-primary/30 group-hover:to-secondary/30 transition-all">
                                {item.icon.startsWith('http') ? (
                                    <img src={item.icon} alt={item.title} className="w-8 h-8 rounded-lg" />
                                ) : (
                                    <span className="text-2xl">{item.icon}</span>
                                )}
                            </div>
                            <span className="text-sm text-gray-300 group-hover:text-white transition-colors text-center line-clamp-2">
                                {item.title}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Footer */}
            <div className="mt-auto pt-12 text-center text-sm text-gray-500">
                <p>按 / 快速搜索 • 按 Esc 清空</p>
            </div>
        </div>
    );
}
