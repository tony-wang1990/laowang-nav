import { useState, useEffect } from 'react';
import statusService from '../services/statusService';
import type { StatusResult } from '../types/config';

export function useStatusCheck(url: string | undefined, enabled: boolean = true) {
    const [status, setStatus] = useState<StatusResult | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!url || !enabled) {
            setStatus(null);
            return;
        }

        // Check if cached
        const cached = statusService.getCachedStatus(url);
        if (cached) {
            setStatus(cached);
        }

        // Perform fresh check
        setLoading(true);
        statusService.checkStatus({ url }).then((result) => {
            setStatus(result);
            setLoading(false);
        });
    }, [url, enabled]);

    return { status, loading };
}

export function useStatusMonitoring(
    url: string | undefined,
    interval: number = 60,
    enabled: boolean = true
) {
    const [status, setStatus] = useState<StatusResult | null>(null);

    useEffect(() => {
        if (!url || !enabled) return;

        const itemId = `monitor-${url}`;
        statusService.startMonitoring(itemId, url, interval, setStatus);

        return () => {
            statusService.stopMonitoring(itemId);
        };
    }, [url, interval, enabled]);

    return status;
}
