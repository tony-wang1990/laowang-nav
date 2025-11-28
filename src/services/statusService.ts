import axios from 'axios';
import type { StatusCheckOptions, StatusResult } from '../types/config';

class StatusService {
    private static instance: StatusService;
    private statusCache: Map<string, StatusResult> = new Map();
    private monitoringIntervals: Map<string, NodeJS.Timeout> = new Map();

    private constructor() { }

    static getInstance(): StatusService {
        if (!StatusService.instance) {
            StatusService.instance = new StatusService();
        }
        return StatusService.instance;
    }

    /**
     * 检查单个URL的状态
     */
    async checkStatus(options: StatusCheckOptions): Promise<StatusResult> {
        const {
            url,
            method = 'HEAD',
            timeout = 5000,
            headers = {},
            acceptCodes = [200, 201, 202, 203, 204, 205, 206, 301, 302, 303, 304, 307, 308],
        } = options;

        const startTime = Date.now();

        try {
            const response = await axios({
                url,
                method,
                timeout,
                headers: {
                    'User-Agent': 'Dashy-Status-Check/1.0',
                    ...headers,
                },
                validateStatus: () => true, // Don't throw on any status
            });

            const responseTime = Date.now() - startTime;
            const statusCode = response.status;
            const isOnline = acceptCodes.includes(statusCode);

            const result: StatusResult = {
                status: isOnline ? 'online' : statusCode >= 500 ? 'offline' : 'degraded',
                statusCode,
                responseTime,
                lastCheck: new Date(),
            };

            // Cache the result
            this.statusCache.set(url, result);
            return result;
        } catch (error) {
            const responseTime = Date.now() - startTime;
            const result: StatusResult = {
                status: 'offline',
                responseTime,
                lastCheck: new Date(),
                error: error instanceof Error ? error.message : 'Unknown error',
            };

            this.statusCache.set(url, result);
            return result;
        }
    }

    /**
     * 从缓存获取状态
     */
    getCachedStatus(url: string): StatusResult | undefined {
        return this.statusCache.get(url);
    }

    /**
     * 开始监控URL
     */
    startMonitoring(itemId: string, url: string, interval: number, callback?: (result: StatusResult) => void) {
        // Stop existing monitoring if any
        this.stopMonitoring(itemId);

        // Initial check
        this.checkStatus({ url }).then((result) => {
            callback?.(result);
        });

        // Set up interval
        const intervalId = setInterval(() => {
            this.checkStatus({ url }).then((result) => {
                callback?.(result);
            });
        }, interval * 1000);

        this.monitoringIntervals.set(itemId, intervalId);
    }

    /**
     * 停止监控URL
     */
    stopMonitoring(itemId: string) {
        const intervalId = this.monitoringIntervals.get(itemId);
        if (intervalId) {
            clearInterval(intervalId);
            this.monitoringIntervals.delete(itemId);
        }
    }

    /**
     * 批量检查多个URL
     */
    async checkMultiple(urls: string[]): Promise<Map<string, StatusResult>> {
        const results = new Map<string, StatusResult>();

        // Check in parallel with concurrency limit
        const concurrency = 5;
        for (let i = 0; i < urls.length; i += concurrency) {
            const batch = urls.slice(i, i + concurrency);
            const batchResults = await Promise.all(
                batch.map((url) => this.checkStatus({ url }))
            );
            batch.forEach((url, index) => {
                results.set(url, batchResults[index]);
            });
        }

        return results;
    }

    /**
     * 清除所有监控
     */
    stopAllMonitoring() {
        this.monitoringIntervals.forEach((intervalId) => clearInterval(intervalId));
        this.monitoringIntervals.clear();
    }

    /**
     * 清除缓存
     */
    clearCache() {
        this.statusCache.clear();
    }
}

export default StatusService.getInstance();
