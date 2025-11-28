import { useState, useEffect } from 'react';
import { Search, LogIn, LogOut, Edit3, Globe, ChevronDown, Settings, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../../store/useAppStore';
import { useConfigStore } from '../../store/useConfigStore';

interface SearchEngine {
    name: string;
    url: string;
    icon: string;
}

const searchEngines: Record<string, SearchEngine> = {
    baidu: { name: '百度', url: 'https://www.baidu.com/s?wd=', icon: '🔍' },
    google: { name: 'Google', url: 'https://www.google.com/search?q=', icon: '🌐' },
    bing: { name: 'Bing', url: 'https://www.bing.com/search?q=', icon: '🔎' },
    github: { name: 'GitHub', url: 'https://github.com/search?q=', icon: '💻' },
};

interface HeaderProps {
    onLoginClick: () => void;
    onOpenSettings: () => void;
}

export default function Header({ onLoginClick, onOpenSettings }: HeaderProps) {
    const { t, i18n } = useTranslation();
    const { config, updateConfig } = useConfigStore();
    const {
        searchQuery,
        setSearchQuery,
        searchEngine,
        setSearchEngine,
        weather,
        setWeather,
        isAuthenticated,
        logout,
        editMode,
        setEditMode,
        language,
        setLanguage,
    } = useAppStore();

    const [time, setTime] = useState(new Date());
    const [showEngineMenu, setShowEngineMenu] = useState(false);
    const [showLangMenu, setShowLangMenu] = useState(false);
    const [editingTitle, setEditingTitle] = useState(false);
    const [tempTitle, setTempTitle] = useState('');

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (config?.pageInfo?.title) {
            setTempTitle(config.pageInfo.title);
        }
    }, [config?.pageInfo?.title]);

    useEffect(() => {
        fetch('https://wttr.in/?format=j1')
            .then((res) => res.json())
            .then((data) => {
                if (data?.current_condition?.[0]) {
                    const current = data.current_condition[0];
                    setWeather({
                        temp: current.temp_C,
                        condition: current.weatherDesc[0].value,
                        icon: '🌤️',
                        city: data.nearest_area[0].areaName[0].value,
                    });
                }
            })
            .catch(() => setWeather({ temp: '--', icon: '🌤️', city: 'Local', condition: '' }));
    }, [setWeather]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;
        window.open(searchEngines[searchEngine].url + encodeURIComponent(searchQuery), '_blank');
        setSearchQuery('');
    };

    const handleTitleSave = () => {
        if (config && tempTitle.trim()) {
            updateConfig({
                ...config,
                pageInfo: {
                    ...config.pageInfo,
                    title: tempTitle
                }
            });
            setEditingTitle(false);
        }
    };

    const formatDate = (date: Date) => {
        const days = ['日', '一', '二', '三', '四', '五', '六'];
        return `${date.getMonth() + 1}/${date.getDate()} 周${days[date.getDay()]}`;
    };

    const toggleLanguage = (lang: string) => {
        setLanguage(lang);
        i18n.changeLanguage(lang);
        setShowLangMenu(false);
    };

    return (
        <header className="glass z-20 border-b border-white/10">
            <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
                    {/* Editable Title Card */}
                    <div className="flex-1 w-full md:w-auto flex justify-start">
                        {editMode && editingTitle ? (
                            <div className="flex items-center gap-2 glass px-2 py-1 rounded-xl">
                                <input
                                    type="text"
                                    value={tempTitle}
                                    onChange={(e) => setTempTitle(e.target.value)}
                                    onFocus={(e) => e.target.select()}
                                    className="bg-transparent border-none text-2xl font-bold text-white focus:outline-none w-48"
                                    autoFocus
                                    onKeyDown={(e) => e.key === 'Enter' && handleTitleSave()}
                                />
                                <button onClick={handleTitleSave} className="p-1 hover:text-green-400">
                                    <Check className="w-5 h-5" />
                                </button>
                            </div>
                        ) : (
                            <div
                                className={`glass px-6 py-3 rounded-xl flex items-center gap-3 ${editMode ? 'cursor-pointer hover:bg-white/10 border-primary/50 border' : ''}`}
                                onClick={() => editMode && setEditingTitle(true)}
                            >
                                <span className="text-3xl">🧭</span>
                                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                                    {config?.pageInfo?.title || '老王导航'}
                                </h1>
                                {editMode && <Edit3 className="w-4 h-4 text-gray-500" />}
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-4">
                        {weather && (
                            <div className="flex items-center gap-2 px-3 py-1.5 glass rounded-lg text-sm">
                                <span>{weather.icon}</span>
                                <span className="text-accent font-mono">{weather.temp}°C</span>
                                <span className="text-gray-400">{weather.city}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-3 px-3 py-1.5 glass rounded-lg text-sm">
                            <span className="text-secondary">{formatDate(time)}</span>
                            <span className="text-accent font-mono">
                                {time.toLocaleTimeString('zh-CN', { hour12: false })}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <button
                                onClick={() => setShowLangMenu(!showLangMenu)}
                                className="p-2 glass rounded-lg hover:text-primary transition-all"
                            >
                                <Globe className="w-5 h-5" />
                            </button>
                            {showLangMenu && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setShowLangMenu(false)} />
                                    <div className="absolute right-0 top-full mt-2 glass rounded-lg border border-primary/30 overflow-hidden min-w-[120px] z-50">
                                        <button
                                            onClick={() => toggleLanguage('zh-CN')}
                                            className={`w-full flex items-center gap-2 px-4 py-2 hover:bg-white/10 text-sm ${language === 'zh-CN' ? 'bg-primary/10 text-primary' : 'text-gray-300'
                                                }`}
                                        >
                                            <span>🇨🇳</span>
                                            <span>中文</span>
                                        </button>
                                        <button
                                            onClick={() => toggleLanguage('en-US')}
                                            className={`w-full flex items-center gap-2 px-4 py-2 hover:bg-white/10 text-sm ${language === 'en-US' ? 'bg-primary/10 text-primary' : 'text-gray-300'
                                                }`}
                                        >
                                            <span>🇺🇸</span>
                                            <span>English</span>
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>

                        <button
                            onClick={isAuthenticated ? logout : onLoginClick}
                            className="p-2 glass rounded-lg hover:text-primary transition-all"
                        >
                            {isAuthenticated ? (
                                <LogOut className="w-5 h-5 text-red-400" />
                            ) : (
                                <LogIn className="w-5 h-5" />
                            )}
                        </button>

                        {isAuthenticated && (
                            <>
                                <button
                                    onClick={() => setEditMode(!editMode)}
                                    className={`p-2 glass rounded-lg transition-all ${editMode ? 'text-accent' : 'hover:text-primary'
                                        }`}
                                >
                                    <Edit3 className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={onOpenSettings}
                                    className="p-2 glass rounded-lg hover:text-primary transition-all"
                                >
                                    <Settings className="w-5 h-5" />
                                </button>
                            </>
                        )}
                    </div>
                </div>

                <form onSubmit={handleSearch} className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative flex items-center bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl group-hover:border-white/20 transition-all duration-300">
                        <div className="relative border-r border-white/10">
                            <button
                                type="button"
                                onClick={() => setShowEngineMenu(!showEngineMenu)}
                                className="flex items-center gap-2 px-4 py-4 hover:bg-white/5 transition-colors min-w-[100px] justify-center"
                            >
                                <span className="text-xl">{searchEngines[searchEngine].icon}</span>
                                <span className="font-medium text-gray-300 hidden sm:inline">
                                    {searchEngines[searchEngine].name}
                                </span>
                                <ChevronDown className="w-4 h-4 text-gray-500" />
                            </button>

                            {showEngineMenu && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setShowEngineMenu(false)} />
                                    <div className="absolute top-full left-0 mt-2 w-48 glass rounded-xl border border-white/10 overflow-hidden shadow-xl z-50">
                                        {Object.entries(searchEngines).map(([key, engine]) => (
                                            <button
                                                key={key}
                                                type="button"
                                                onClick={() => {
                                                    setSearchEngine(key);
                                                    setShowEngineMenu(false);
                                                }}
                                                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-white/10 transition-colors ${searchEngine === key
                                                    ? 'bg-primary/10 text-primary'
                                                    : 'text-gray-300'
                                                    }`}
                                            >
                                                <span className="text-lg">{engine.icon}</span>
                                                <span>{engine.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="flex-1 relative">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder={t('header.searchPlaceholder')}
                                className="w-full h-14 px-4 bg-transparent text-lg text-white placeholder-gray-500 focus:outline-none"
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                <Search className="w-6 h-6 text-gray-500 group-focus-within:text-primary transition-colors" />
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </header>
    );
}
