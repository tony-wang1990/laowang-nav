import { useState, useRef, useEffect } from 'react';
import {
    Command,
    Edit2
} from 'lucide-react';
// import { useTranslation } from 'react-i18next';
import { useAppStore } from '../../store/useAppStore';
// import { useConfigStore } from '../../store/useConfigStore';
import SettingsToolbar from './SettingsToolbar';

interface HeaderProps {
    onLoginClick: () => void;
    onOpenSettings: () => void;
}

export default function Header({ onLoginClick, onOpenSettings }: HeaderProps) {
    // const { t } = useTranslation();
    const {
        appTitle,
        setAppTitle
    } = useAppStore();
    // const { config } = useConfigStore();

    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const titleInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isEditingTitle && titleInputRef.current) {
            titleInputRef.current.focus();
        }
    }, [isEditingTitle]);

    const handleTitleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsEditingTitle(false);
    };

    return (
        <header className="relative z-30 mb-8">
            <div className="container mx-auto px-4 py-6">
                <div className="flex flex-col md:flex-row items-stretch justify-between gap-6">

                    {/* Logo & Editable Title Section */}
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20 animate-float">
                            <Command className="w-7 h-7 text-white" />
                        </div>

                        <div className="glass px-4 py-2 rounded-xl border border-white/20 flex flex-col justify-center min-w-[200px] h-16 group relative transition-all hover:bg-white/10">
                            {isEditingTitle ? (
                                <form onSubmit={handleTitleSubmit}>
                                    <input
                                        ref={titleInputRef}
                                        type="text"
                                        value={appTitle}
                                        onChange={(e) => setAppTitle(e.target.value)}
                                        onBlur={() => setIsEditingTitle(false)}
                                        className="bg-transparent border-none text-2xl font-bold text-white focus:outline-none w-full"
                                    />
                                </form>
                            ) : (
                                <div
                                    onClick={() => setIsEditingTitle(true)}
                                    className="cursor-pointer flex items-center gap-2"
                                >
                                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70 truncate">
                                        {appTitle}
                                    </h1>
                                    <Edit2 className="w-4 h-4 text-white/30 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                            )}

                        </div>
                    </div>

                    {/* Center: Settings Toolbar (Replacing Search Bar) */}
                    <div className="flex-1 flex justify-center w-full">
                        <SettingsToolbar
                            onLoginClick={onLoginClick}
                            onOpenSettings={onOpenSettings}
                        />
                    </div>

                    {/* Right Side Spacer (to balance layout) */}
                    <div className="hidden md:block w-[280px]" />
                </div>
            </div>
        </header>
    );
}
