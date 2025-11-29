import { useState, useEffect } from 'react';
import { useConfigStore } from './store/useConfigStore';
import { useThemeStore } from './store/useThemeStore';
import { useAppStore } from './store/useAppStore';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import DefaultView from './components/Views/DefaultView';
import MinimalView from './components/Views/MinimalView';
import WorkspaceView from './components/Views/WorkspaceView';
import Header from './components/Layout/Header';
import TopNav from './components/Layout/TopNav';
import Footer from './components/Layout/Footer';
import LoginModal from './components/Modals/LoginModal';
import SettingsModal from './components/Modals/SettingsModal';
import './i18n';

function App() {
    const { loadConfig, config } = useConfigStore();
    const { background } = useThemeStore();
    const {
        currentView,
        isAuthenticated,
        showToolbar,
        setShowToolbar
    } = useAppStore();

    const [showLogin, setShowLogin] = useState(false);
    const [showSettings, setShowSettings] = useState(false);

    // Initialize keyboard shortcuts
    useKeyboardShortcuts();

    // Load configuration on mount
    useEffect(() => {
        loadConfig();
    }, [loadConfig]);

    // Render view based on currentView
    const renderView = () => {
        switch (currentView) {
            case 'minimal':
                return <MinimalView />;
            case 'workspace':
                return <WorkspaceView />;
            case 'default':
            default:
                return <DefaultView />;
        }
    };

    return (
        <div className="min-h-screen flex flex-col relative overflow-x-hidden">
            {/* Animated Background (only for default view) */}
            {currentView === 'default' && (
                <div className={`fixed inset-0 z-0 bg-${background} transition-all duration-500`}>
                    {!config?.appConfig?.background && (
                        <>
                            {/* Animated Stars */}
                            <div className="stars-container absolute inset-0">
                                {[...Array(100)].map((_, i) => (
                                    <div
                                        key={i}
                                        className="star absolute rounded-full bg-white"
                                        style={{
                                            width: Math.random() * 3 + 'px',
                                            height: Math.random() * 3 + 'px',
                                            top: Math.random() * 100 + '%',
                                            left: Math.random() * 100 + '%',
                                            opacity: Math.random() * 0.8 + 0.2,
                                            animation: `twinkle ${Math.random() * 5 + 3}s ease-in-out infinite`,
                                            animationDelay: Math.random() * 5 + 's',
                                        }}
                                    />
                                ))}
                            </div>

                            {/* Gradient Orbs */}
                            <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
                            <div
                                className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse"
                                style={{ animationDelay: '2s' }}
                            />
                        </>
                    )}
                </div>
            )}

            {/* Main Content */}
            <div className="relative z-10 flex-1 flex flex-col">
                {currentView === 'default' && <TopNav />}
                {currentView === 'default' && (
                    <Header
                        onLoginClick={() => setShowLogin(true)}
                        onOpenSettings={() => setShowSettings(true)}
                    />
                )}
                <main className="flex-1 container mx-auto px-4 py-8">
                    {renderView()}
                </main>

                {/* Footer */}
                {currentView === 'default' && <Footer />}
            </div>

            {/* Modals */}
            {showLogin && !isAuthenticated && (
                <LoginModal onClose={() => setShowLogin(false)} />
            )}
            {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}

            {/* Twinkle Animation */}
            <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.5); }
        }
      `}</style>
        </div>
    );
}

export default App;
