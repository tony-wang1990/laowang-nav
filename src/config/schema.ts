// JSON Schema for Dashy configuration validation
export const configSchema = {
    type: 'object',
    required: ['pageInfo', 'appConfig', 'sections'],
    properties: {
        pageInfo: {
            type: 'object',
            required: ['title'],
            properties: {
                title: { type: 'string', minLength: 1 },
                description: { type: 'string' },
                navLinks: {
                    type: 'array',
                    items: {
                        type: 'object',
                        required: ['title', 'path'],
                        properties: {
                            title: { type: 'string' },
                            path: { type: 'string' }
                        }
                    }
                },
                logo: { type: ['string', 'null'] }
            }
        },
        appConfig: {
            type: 'object',
            required: ['language', 'theme'],
            properties: {
                language: { type: 'string', enum: ['zh-CN', 'en-US'] },
                theme: { type: 'string' },
                layout: { type: 'string', enum: ['auto', 'grid', 'list'] },
                iconSize: { type: 'string', enum: ['small', 'medium', 'large'] },
                defaultOpeningMethod: {
                    type: 'string',
                    enum: ['newtab', 'sametab', 'modal', 'workspace']
                },
                statusCheck: { type: 'boolean' },
                statusCheckInterval: { type: 'number', minimum: 10 },
                enableAuth: { type: 'boolean' },
                enableMultiSearch: { type: 'boolean' },
                enableCloudBackup: { type: 'boolean' },
                auth: {
                    type: 'object',
                    properties: {
                        users: {
                            type: 'array',
                            items: {
                                type: 'object',
                                required: ['user', 'hash', 'type'],
                                properties: {
                                    user: { type: 'string' },
                                    hash: { type: 'string' },
                                    type: { type: 'string', enum: ['admin', 'editor', 'viewer', 'guest'] }
                                }
                            }
                        }
                    }
                },
                cloudBackup: {
                    type: 'object',
                    properties: {
                        enabled: { type: 'boolean' },
                        gistId: { type: 'string' },
                        accessToken: { type: 'string' }
                    }
                }
            }
        },
        sections: {
            type: 'array',
            items: {
                type: 'object',
                required: ['name', 'displayData'],
                properties: {
                    name: { type: 'string', minLength: 1 },
                    icon: { type: 'string' },
                    displayData: {
                        type: 'object',
                        properties: {
                            sortBy: { type: 'string' },
                            rows: { type: 'number' },
                            cols: { type: 'number' },
                            collapsed: { type: 'boolean' }
                        }
                    },
                    items: {
                        type: 'array',
                        items: {
                            type: 'object',
                            required: ['title', 'icon', 'url'],
                            properties: {
                                title: { type: 'string', minLength: 1 },
                                description: { type: 'string' },
                                icon: { type: 'string' },
                                url: { type: 'string', minLength: 1 },
                                target: {
                                    type: 'string',
                                    enum: ['newtab', 'sametab', 'modal', 'workspace', 'clipboard']
                                },
                                statusCheck: { type: 'boolean' },
                                statusCheckUrl: { type: 'string' },
                                statusCheckHeaders: { type: 'object' },
                                tags: {
                                    type: 'array',
                                    items: { type: 'string' }
                                },
                                hotkey: { type: ['number', 'string'] }
                            }
                        }
                    },
                    widgets: {
                        type: 'array',
                        items: {
                            type: 'object',
                            required: ['type'],
                            properties: {
                                type: { type: 'string' },
                                position: { type: 'number' },
                                useGlobal: { type: 'boolean' },
                                options: { type: 'object' }
                            }
                        }
                    }
                }
            }
        }
    }
};
