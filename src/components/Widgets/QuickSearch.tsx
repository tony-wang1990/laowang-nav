import { Search as SearchIcon } from 'lucide-react';
import { useState } from 'react';
import type { WidgetProps } from '../../types/widget';

const searchEngines = {
    baidu: { name: '百度', url: 'https://www.baidu.com/s?wd=' },
    google: { name: 'Google', url: 'https://www.google.com/search?q=' },
    bing: { name: 'Bing', url: 'https://www.bing.com/search?q=' },
    github: { name: 'GitHub', url: 'https://github.com/search?q=' },
};

export default function Search({ options = {} }: WidgetProps) {
    const [query, setQuery] = useState('');
    const [engine, setEngine] = useState<keyof typeof searchEngines>('baidu');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            const url = searchEngines[engine].url + encodeURIComponent(query);
            window.open(url, '_blank');
            setQuery('');
        }
    };

    return (
        <div className="glass rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
                <SearchIcon className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-white">快速搜索</h3>
            </div>

            <form onSubmit={handleSearch} className="space-y-3">
                <div className="flex gap-2">
                    {Object.entries(searchEngines).map(([key, engine]) => (
                        <button
                            key={key}
                            type="button"
                            onClick={() => setEngine(key as keyof typeof searchEngines)}
                            className={`px-3 py-1 rounded-lg text-sm transition-all ${engine === key
                                    ? 'bg-primary/20 text-primary border border-primary/50'
                                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                }`}
                        >
                            {engine.name}
                        </button>
                    ))}
                </div>

                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="输入搜索内容..."
                    className="w-full px-4 py-2 bg-black/40 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 transition-colors"
                />
            </form>
        </div>
    );
}
