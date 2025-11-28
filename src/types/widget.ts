export interface WidgetProps {
    options?: Record<string, any>;
    useGlobal?: boolean;
}

export interface WidgetConfig {
    type: string;
    position?: number;
    useGlobal?: boolean;
    options?: Record<string, any>;
}

export interface WidgetDefinition {
    type: string;
    name: string;
    description: string;
    component: React.ComponentType<WidgetProps>;
    defaultOptions?: Record<string, any>;
}
