import { useState, useEffect } from 'react';
import {
    Image as ImageIcon,
    LayoutGrid,
    List,
    Minimize,
    Maximize,
    Move,
    Wrench,
    Edit3,
    Globe,
    LogOut,
    LogIn
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../../store/useAppStore';
import { useThemeStore, backgrounds } from '../../store/useThemeStore';

interface SettingsToolbarProps {
    onOpenSettings: () => void;
    onLoginClick: () => void;
}

export default function SettingsToolbar({ onOpenSettings, onLoginClick }: SettingsToolbarProps) {
    const { t, i18n } = useTranslation();
    const {
        layout,
        setLayout,
        itemSize,
        setItemSize,
        editMode,
        setEditMode,
        weather,
        isAuthenticated,
        logout,
        language,
        setLanguage
    } = useAppStore();
    const { background, setBackground } = useThemeStore();
    const [showBgMenu, setShowBgMenu] = useState(false);
    const [showLangMenu, setShowLangMenu] = useState(false);
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

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
        <div className="z-40 h-full">
            <div className="glass px-4 py-2 rounded-2xl border border-white/20 shadow-2xl flex items-center gap-4 animate-fade-in-up h-full">

                {/* Weather & Time Section */}
                <div className="flex items-center gap-4 mr-2">
                    {weather && (
                        <div className="flex items-center gap-2 text-sm">
                            <span>{weather.icon}</span>
                            <span className="text-accent font-mono">{weather.temp}°C</span>
                        </div>
                    )}
                    <div className="flex items-center gap-2 text-sm">
                        <span className="text-secondary hidden sm:inline">{formatDate(time)}</span>
                        <span className="text-accent font-mono">
                            {time.toLocaleTimeString('zh-CN', { hour12: false })}
                        </span>
                    </div>
                </div>

                <div className="w-px h-6 bg-white/10" />

                {/* Language Section */}
                <div className="relative">
                    <button
                        onClick={() => setShowLangMenu(!showLangMenu)}
                        className="p-1.5 hover:bg-white/10 rounded-lg transition text-gray-300 hover:text-white"
                        title={t('common.language')}
                    >
                        <Globe className="w-4 h-4" />
                    </button>
                    {showLangMenu && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setShowLangMenu(false)} />
                            <div className="absolute top-full right-0 mt-2 glass rounded-lg border border-primary/30 overflow-hidden min-w-[120px] z-50">
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

                {/* Auth Section */}
                <button
                    onClick={isAuthenticated ? logout : onLoginClick}
                    className="p-1.5 hover:bg-white/10 rounded-lg transition text-gray-300 hover:text-white"
                    title={isAuthenticated ? t('common.logout') : t('common.login')}
                >
                    {isAuthenticated ? (
                        <LogOut className="w-4 h-4 text-red-400" />
                    ) : (
                        <LogIn className="w-4 h-4" />
                    )}
                </button>

                <div className="w-px h-6 bg-white/10" />

                {/* Background Section */}
                <div className="relative">
                    <button
                        onClick={() => setShowBgMenu(!showBgMenu)}
                        className="flex items-center gap-2 px-2 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg transition border border-white/10 min-w-[100px] justify-between"
                    >
                        <span className="text-xs truncate max-w-[60px]">
                            {backgrounds.find(b => b.id === background)?.name || background}
                        </span>
                        <ImageIcon className="w-3.5 h-3.5 text-primary" />
                    </button>

                    {showBgMenu && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setShowBgMenu(false)} />
                            <div className="absolute top-full right-0 mt-2 w-48 glass rounded-xl border border-white/10 overflow-hidden shadow-xl z-50 max-h-60 overflow-y-auto">
                                {backgrounds.map((bg) => (
                                    <button
                                        key={bg.id}
                                        onClick={() => {
                                            setBackground(bg.id);
                                            setShowBgMenu(false);
                                        }}
                                        className={`w-full flex items-center gap-3 px-4 py-2 hover:bg-white/10 transition-colors text-sm ${background === bg.id ? 'bg-primary/10 text-primary' : 'text-gray-300'
                                            }`}
                                    >
                                        <span>{bg.name}</span>
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {/* Layout Section */}
                <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1 border border-white/10">
                    <button
                        onClick={() => setLayout('grid')}
                        className={`p-1 rounded-md transition ${layout === 'grid' ? 'bg-primary text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'
                            }`}
                        title={t('common.grid')}
                    >
                        <LayoutGrid className="w-3.5 h-3.5" />
                    </button>
                    <button
                        onClick={() => setLayout('list')}
                        className={`p-1 rounded-md transition ${layout === 'list' ? 'bg-primary text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'
                            }`}
                        title={t('common.list')}
                    >
                        <List className="w-3.5 h-3.5" />
                    </button>
                </div>

                {/* Size Section */}
                <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1 border border-white/10">
                    <button
                        onClick={() => setItemSize('small')}
                        className={`p-1 rounded-md transition ${itemSize === 'small' ? 'bg-primary text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'
                            }`}
                        title={t('common.small')}
                    >
                        <Minimize className="w-3.5 h-3.5" />
                    </button>
                    <button
                        onClick={() => setItemSize('medium')}
                        className={`p-1 rounded-md transition ${itemSize === 'medium' ? 'bg-primary text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'
                            }`}
                        title={t('common.medium')}
                    >
                        <Maximize className="w-3.5 h-3.5" />
                    </button>
                    <button
                        onClick={() => setItemSize('large')}
                        className={`p-1 rounded-md transition ${itemSize === 'large' ? 'bg-primary text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'
                            }`}
                        title={t('common.large')}
                    >
                        <Move className="w-3.5 h-3.5" />
                    </button>
                </div>

                {/* Settings Section */}
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => setEditMode(!editMode)}
                        className={`p-1.5 rounded-lg transition border border-white/10 ${editMode ? 'bg-primary text-white shadow-lg' : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                            }`}
                        title={t('common.edit')}
                    >
                        <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                        onClick={onOpenSettings}
                        className="p-1.5 bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition border border-white/10"
                        title={t('common.settings')}
                    >
                        <Wrench className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
