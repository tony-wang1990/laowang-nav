import { Github } from 'lucide-react';
import { useConfigStore } from '../../store/useConfigStore';
import { useAppStore } from '../../store/useAppStore';

const GITHUB_REPO_URL = 'https://github.com/tony-wang1990/laowang-nav';

export default function TopNav() {
    const { config } = useConfigStore();
    const { activeSection, setActiveSection } = useAppStore();

    if (!config) return null;

    return (
        <nav className="glass border-b border-white/10 sticky top-0 z-40">
            <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    {/* Logo & Title */}
                    <button
                        onClick={() => setActiveSection(null)}
                        className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent hover:scale-105 transition-transform whitespace-nowrap"
                    >
                        {config.pageInfo.title}
                    </button>

                    {/* Navigation Links - Scrollable on mobile */}
                    <div className="flex items-center gap-2 overflow-x-auto max-w-full flex-1 justify-center">
                        <button
                            onClick={() => setActiveSection(null)}
                            className={`px-4 py-2 rounded-xl font-medium transition-all whitespace-nowrap ${!activeSection
                                    ? 'bg-primary/20 text-primary border border-primary/50 shadow-lg shadow-primary/20'
                                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                                }`}
                        >
                            全部
                        </button>
                        {config.sections.map((section) => (
                            <button
                                key={section.name}
                                onClick={() => setActiveSection(section.name)}
                                className={`px-4 py-2 rounded-xl font-medium transition-all whitespace-nowrap ${activeSection === section.name
                                        ? 'bg-primary/20 text-primary border border-primary/50 shadow-lg shadow-primary/20'
                                        : 'text-gray-300 hover:text-white hover:bg-white/10'
                                    }`}
                            >
                                {section.name}
                            </button>
                        ))}
                    </div>

                    {/* GitHub Link */}
                    <a
                        href={GITHUB_REPO_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 glass rounded-xl text-gray-300 hover:text-primary hover:scale-105 transition-all whitespace-nowrap"
                    >
                        <Github className="w-5 h-5" />
                        <span className="hidden sm:inline text-sm font-medium">GitHub</span>
                    </a>
                </div>
            </div>
        </nav>
    );
}
