import type { WidgetDefinition } from '../types/widget';
import Clock from '../components/Widgets/Clock';
import Weather from '../components/Widgets/Weather';
import QuickSearch from '../components/Widgets/QuickSearch';

class WidgetRegistry {
    private static instance: WidgetRegistry;
    private widgets: Map<string, WidgetDefinition> = new Map();

    private constructor() {
        // Register built-in widgets
        this.register({
            type: 'clock',
            name: '时钟',
            description: '显示当前时间和日期',
            component: Clock,
            defaultOptions: {
                timeZone: 'Asia/Shanghai',
                format: '24h',
                hideDate: false,
                hideSeconds: false,
            },
        });

        this.register({
            type: 'weather',
            name: '天气',
            description: '显示当前天气信息',
            component: Weather,
            defaultOptions: {
                location: 'auto',
                units: 'metric',
                hideDetails: false,
            },
        });

        this.register({
            type: 'search',
            name: '快速搜索',
            description: '多引擎快速搜索',
            component: QuickSearch,
            defaultOptions: {},
        });
    }

    static getInstance(): WidgetRegistry {
        if (!WidgetRegistry.instance) {
            WidgetRegistry.instance = new WidgetRegistry();
        }
        return WidgetRegistry.instance;
    }

    register(widget: WidgetDefinition) {
        this.widgets.set(widget.type, widget);
    }

    get(type: string): WidgetDefinition | undefined {
        return this.widgets.get(type);
    }

    getAll(): WidgetDefinition[] {
        return Array.from(this.widgets.values());
    }

    has(type: string): boolean {
        return this.widgets.has(type);
    }
}

export default WidgetRegistry.getInstance();
