import { useTranslation } from 'react-i18next';
import { Github, Heart } from 'lucide-react';

// Fixed constants - DO NOT MODIFY (persists across forks)
const GITHUB_REPO_URL = 'https://github.com/tony-wang1990/laowang-nav';
const AUTHOR = '老王';
const CURRENT_YEAR = new Date().getFullYear();

export default function Footer() {
    const { t } = useTranslation();

    return (
        <footer className="glass border-t border-white/10 py-6 mt-auto">
            <div className="container mx-auto px-4">
                {/* Main Footer Content */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-400">
                    {/* Left: License Info */}
                    <div className="flex items-center gap-2">
                        <span>Copyright © {CURRENT_YEAR} Nav-Item</span>
                        <span className="hidden md:inline">|</span>
                        <span>Powered by {AUTHOR}</span>
                    </div>

                    {/* Center: Made with Love */}
                    <div className="flex items-center gap-2">
                        <span>Made with</span>
                        <Heart className="w-4 h-4 text-red-500 animate-pulse" />
                        <span>by {AUTHOR}</span>
                    </div>

                    {/* Right: GitHub Link */}
                    <a
                        href={GITHUB_REPO_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 hover:text-primary transition-colors"
                    >
                        <Github className="w-4 h-4" />
                        <span>GitHub</span>
                    </a>
                </div>


            </div>
        </footer>
    );
}
