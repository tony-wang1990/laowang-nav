class IconService {
    private static instance: IconService;
    private faviconCache: Map<string, string> = new Map();

    private constructor() { }

    static getInstance(): IconService {
        if (!IconService.instance) {
            IconService.instance = new IconService();
        }
        return IconService.instance;
    }

    /**
     * 获取网站的Favicon
     */
    async getFavicon(url: string): Promise<string> {
        try {
            // Check cache
            if (this.faviconCache.has(url)) {
                return this.faviconCache.get(url)!;
            }

            const domain = new URL(url).hostname;

            // Try multiple favicon services
            const services = [
                `https://www.google.com/s2/favicons?domain=${domain}&sz=64`,
                `https://icons.duckduckgo.com/ip3/${domain}.ico`,
                `https://${domain}/favicon.ico`,
            ];

            // Try to load the first available one
            for (const service of services) {
                try {
                    const response = await fetch(service);
                    if (response.ok) {
                        this.faviconCache.set(url, service);
                        return service;
                    }
                } catch {
                    continue;
                }
            }

            // Fallback to Google favicon service
            const fallback = services[0];
            this.faviconCache.set(url, fallback);
            return fallback;
        } catch (error) {
            console.error('Failed to get favicon for', url, error);
            return '';
        }
    }

    /**
     * 解析图标类型并返回合适的渲染方式
     */
    parseIcon(icon: string): { type: 'emoji' | 'url' | 'fontawesome' | 'lucide'; value: string } {
        // Emoji (Unicode)
        if (/[\u{1F300}-\u{1F9FF}]/u.test(icon)) {
            return { type: 'emoji', value: icon };
        }

        // URL (http/https or starts with /)
        if (icon.startsWith('http') || icon.startsWith('/')) {
            return { type: 'url', value: icon };
        }

        // Font Awesome (fab fa-, fas fa-, far fa-)
        if (icon.startsWith('fa')) {
            return { type: 'fontawesome', value: icon };
        }

        // Lucide icon name (default)
        return { type: 'lucide', value: icon };
    }

    /**
     * 清除Favicon缓存
     */
    clearCache() {
        this.faviconCache.clear();
    }
}

export default IconService.getInstance();
