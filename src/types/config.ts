// 配置类型定义
export interface PageInfo {
    title: string;
    description?: string;
    navLinks?: NavLink[];
    logo?: string | null;
}

export interface NavLink {
    title: string;
    path: string;
}

export interface AppConfig {
    language: string;
    theme: string;
    layout: 'auto' | 'grid' | 'list';
    iconSize: 'small' | 'medium' | 'large';
    defaultOpeningMethod: 'newtab' | 'sametab' | 'modal' | 'workspace';
    statusCheck: boolean;
    statusCheckInterval: number;
    enableAuth: boolean;
    enableMultiSearch: boolean;
    enableCloudBackup: boolean;
    background?: string;
    auth?: AuthConfig;
    cloudBackup?: CloudBackupConfig;
}

export interface AuthConfig {
    users: AuthUser[];
}

export interface AuthUser {
    user: string;
    hash: string;
    type: 'admin' | 'editor' | 'viewer' | 'guest';
}

export interface CloudBackupConfig {
    enabled: boolean;
    gistId?: string;
    accessToken?: string;
}

export interface Section {
    name: string;
    icon: string;
    displayData: DisplayData;
    items?: Item[];
    widgets?: Widget[];
}

export interface DisplayData {
    sortBy?: string;
    rows?: number;
    cols?: number;
    collapsed?: boolean;
}

export interface Item {
    title: string;
    description?: string;
    icon: string;
    url: string;
    target?: 'newtab' | 'sametab' | 'modal' | 'workspace' | 'clipboard';
    statusCheck?: boolean;
    statusCheckUrl?: string;
    statusCheckHeaders?: Record<string, string>;
    tags?: string[];
    hotkey?: number | string;
}

export interface Widget {
    type: string;
    position?: number;
    useGlobal?: boolean;
    options?: Record<string, any>;
}

export interface DashyConfig {
    pageInfo: PageInfo;
    appConfig: AppConfig;
    sections: Section[];
}

// 状态检查相关
export interface StatusCheckOptions {
    url: string;
    method?: 'GET' | 'HEAD' | 'POST';
    timeout?: number;
    headers?: Record<string, string>;
    acceptCodes?: number[];
}

export interface StatusResult {
    status: 'online' | 'offline' | 'degraded' | 'unknown';
    statusCode?: number;
    responseTime?: number;
    lastCheck: Date;
    error?: string;
}

// Store状态类型
export interface AppState {
    config: DashyConfig | null;
    loading: boolean;
    error: string | null;
    currentView: 'default' | 'minimal' | 'workspace';
    searchQuery: string;
    activeSection: string | null;
    editMode: boolean;
    isAuthenticated: boolean;
    currentUser: AuthUser | null;
}

export interface ThemeState {
    theme: string;
    customCss: string;
}

export interface ConfigState {
    yamlConfig: string;
    parsedConfig: DashyConfig | null;
    validationErrors: string[];
}
