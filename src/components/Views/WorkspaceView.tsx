import { useState } from 'react';
import { X, Maximize2, Minimize2, RotateCw } from 'lucide-react';
import { useConfigStore } from '../../store/useConfigStore';
import { useAppStore } from '../../store/useAppStore';
import type { Item } from '../../types/config';

interface OpenApp {
    id: string;
    item: Item;
    url: string;
}

export default function WorkspaceView() {
    const config = useConfigStore((state) => state.config);
    const [openApps, setOpenApps] = useState<OpenApp[]>([]);
    const [activeApp, setActiveApp] = useState<string | null>(null);
    const [maximizedApp, setMaximizedApp] = useState<string | null>(null);

    if (!config) {
        return null;
    }

    const allItems: Item[] = config.sections.flatMap((section) => section.items || []);

    const openApp = (item: Item) => {
        const url = item.url.startsWith('http') ? item.url : `https://${item.url}`;
        const id = `app-${Date.now()}`;
        const newApp: OpenApp = { id, item, url };

        setOpenApps((prev) => [...prev, newApp]);
        setActiveApp(id);
    };

    const closeApp = (id: string) => {
        setOpenApps((prev) => prev.filter((app) => app.id !== id));
        if (activeApp === id) {
            setActiveApp(openApps[openApps.length - 2]?.id || null);
        }
        if (maximizedApp === id) {
            setMaximizedApp(null);
        }
    };

    const toggleMaximize = (id: string) => {
        setMaximizedApp((prev) => (prev === id ? null : id));
    };

    const refreshApp = (id: string) => {
        // Force iframe reload by changing src
        const iframe = document.querySelector(`iframe[data-app-id="${id}"]`) as HTMLIFrameElement;
        if (iframe) {
            iframe.src = iframe.src;
        }
    };

    return (
        <div className="flex h-screen bg-gradient-to-br from-[#0a0a0f] via-[#1a1a2e] to-[#16213e]">
            {/* Sidebar - App List */}
            <div className="w-64 glass border-r border-white/10 overflow-y-auto">
                <div className="p-4">
                    <h2 className="text-xl font-bold text-white mb-4">工作区</h2>
                    <div className="space-y-2">
                        {allItems.map((item) => (
                            <button
                                key={item.title}
                                onClick={() => openApp(item)}
                                className="w-full flex items-center gap-3 p-3 glass rounded-lg hover:bg-white/10 transition-all text-left"
                            >
                                <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20">
                                    {item.icon.startsWith('http') ? (
                                        <img src={item.icon} alt={item.title} className="w-6 h-6 rounded" />
                                    ) : (
                                        <span className="text-xl">{item.icon}</span>
                                    )}
                                </div>
                                <span className="text-sm text-gray-300 flex-1 truncate">{item.title}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Area - Open Apps */}
            <div className="flex-1 flex flex-col">
                {/* App Tabs */}
                {openApps.length > 0 && (
                    <div className="flex items-center gap-2 p-2 glass border-b border-white/10 overflow-x-auto">
                        {openApps.map((app) => (
                            <div
                                key={app.id}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all cursor-pointer ${activeApp === app.id
                                        ? 'bg-primary/20 text-primary border border-primary/50'
                                        : 'bg-white/5 text-gray-300 hover:bg-white/10'
                                    }`}
                                onClick={() => setActiveApp(app.id)}
                            >
                                <span className="text-sm truncate max-w-[150px]">{app.item.title}</span>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        closeApp(app.id);
                                    }}
                                    className="p-1 hover:bg-red-500/20 rounded transition"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* App Content */}
                <div className="flex-1 relative">
                    {openApps.length === 0 ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center">
                                <div className="text-8xl mb-6">🚀</div>
                                <h3 className="text-2xl font-bold text-white mb-2">工作区已准备就绪</h3>
                                <p className="text-gray-400">从左侧选择一个应用开始</p>
                            </div>
                        </div>
                    ) : (
                        openApps.map((app) => (
                            <div
                                key={app.id}
                                className={`absolute inset-0 ${activeApp === app.id ? 'z-10' : 'z-0 invisible'
                                    } ${maximizedApp === app.id ? 'p-0' : 'p-4'}`}
                            >
                                <div className="h-full glass rounded-lg overflow-hidden flex flex-col">
                                    {/* App Header */}
                                    <div className="flex items-center justify-between p-3 border-b border-white/10 bg-black/20">
                                        <div className="flex items-center gap-3">
                                            <div className="w-6 h-6 flex items-center justify-center">
                                                {app.item.icon.startsWith('http') ? (
                                                    <img src={app.item.icon} alt={app.item.title} className="w-full h-full rounded" />
                                                ) : (
                                                    <span>{app.item.icon}</span>
                                                )}
                                            </div>
                                            <span className="font-medium text-white">{app.item.title}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => refreshApp(app.id)}
                                                className="p-1.5 hover:bg-white/10 rounded transition"
                                                title="刷新"
                                            >
                                                <RotateCw className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => toggleMaximize(app.id)}
                                                className="p-1.5 hover:bg-white/10 rounded transition"
                                                title={maximizedApp === app.id ? '还原' : '最大化'}
                                            >
                                                {maximizedApp === app.id ? (
                                                    <Minimize2 className="w-4 h-4" />
                                                ) : (
                                                    <Maximize2 className="w-4 h-4" />
                                                )}
                                            </button>
                                            <button
                                                onClick={() => closeApp(app.id)}
                                                className="p-1.5 hover:bg-red-500/20 rounded transition"
                                                title="关闭"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Iframe */}
                                    <iframe
                                        data-app-id={app.id}
                                        src={app.url}
                                        className="flex-1 w-full h-full border-0"
                                        title={app.item.title}
                                        sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                                    />
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
