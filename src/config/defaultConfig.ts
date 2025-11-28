import type { DashyConfig } from '../types/config';

// 默认配置对象
export const defaultConfig: DashyConfig = {
    pageInfo: {
        title: '老王导航',
        description: '个人导航站 - 基于Dashy设计',
        navLinks: [
            {
                title: 'GitHub仓库',
                path: 'https://github.com/tony-wang1990/laowang-nav'
            }
        ],
        logo: null
    },

    appConfig: {
        language: 'zh-CN',
        theme: 'cyberpunk',
        layout: 'auto',
        iconSize: 'medium',
        defaultOpeningMethod: 'newtab',
        statusCheck: true,
        statusCheckInterval: 60,
        enableAuth: true,
        enableMultiSearch: true,
        enableCloudBackup: false
    },

    sections: [
        {
            name: '开发工具',
            icon: 'Code',
            displayData: {
                sortBy: 'default',
                rows: 1,
                cols: 1,
                collapsed: false
            },
            items: [
                {
                    title: 'GitHub',
                    description: '代码托管与协作平台',
                    icon: 'fab fa-github',
                    url: 'https://github.com',
                    target: 'newtab',
                    statusCheck: true,
                    tags: ['dev', 'git', 'code'],
                    hotkey: 1
                },
                {
                    title: 'VS Code Online',
                    description: '在线代码编辑器',
                    icon: 'https://code.visualstudio.com/favicon.ico',
                    url: 'https://vscode.dev',
                    target: 'newtab',
                    statusCheck: true,
                    tags: ['dev', 'editor'],
                    hotkey: 2
                }
            ]
        },
        {
            name: '设计资源',
            icon: 'Palette',
            displayData: {
                sortBy: 'default',
                collapsed: false
            },
            items: [
                {
                    title: 'Figma',
                    description: '协作设计工具',
                    icon: '🎨',
                    url: 'https://www.figma.com',
                    target: 'newtab',
                    tags: ['design', 'ui']
                },
                {
                    title: 'Dribbble',
                    description: '设计师社区',
                    icon: 'favicon',
                    url: 'https://dribbble.com',
                    target: 'newtab',
                    tags: ['design', 'inspiration']
                }
            ]
        },
        {
            name: '人工智能',
            icon: 'Brain',
            displayData: {
                collapsed: false
            },
            items: [
                {
                    title: 'ChatGPT',
                    description: 'OpenAI开发的AI助手',
                    icon: '🤖',
                    url: 'https://chat.openai.com',
                    target: 'newtab',
                    tags: ['ai', 'assistant']
                },
                {
                    title: 'Claude',
                    description: 'Anthropic开发的AI助手',
                    icon: '🔮',
                    url: 'https://claude.ai',
                    target: 'newtab',
                    tags: ['ai', 'assistant']
                }
            ]
        }
    ]
};
