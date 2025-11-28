import { useState, useEffect } from 'react';
import { Clock as ClockIcon } from 'lucide-react';
import type { WidgetProps } from '../../types/widget';

interface ClockOptions {
    timeZone?: string;
    format?: '12h' | '24h';
    hideDate?: boolean;
    hideSeconds?: boolean;
}

export default function Clock({ options = {} }: WidgetProps) {
    const {
        timeZone = 'Asia/Shanghai',
        format = '24h',
        hideDate = false,
        hideSeconds = false,
    } = options as ClockOptions;

    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = () => {
        const hour12 = format === '12h';
        const timeOptions: Intl.DateTimeFormatOptions = {
            timeZone,
            hour: '2-digit',
            minute: '2-digit',
            ...(hideSeconds ? {} : { second: '2-digit' }),
            hour12,
        };

        return time.toLocaleTimeString('zh-CN', timeOptions);
    };

    const formatDate = () => {
        const dateOptions: Intl.DateTimeFormatOptions = {
            timeZone,
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long',
        };

        return time.toLocaleDateString('zh-CN', dateOptions);
    };

    return (
        <div className="glass rounded-2xl p-6 hover:bg-white/10 transition-all">
            <div className="flex items-center gap-3 mb-4">
                <ClockIcon className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-white">时钟</h3>
            </div>

            <div className="text-center">
                <div className="text-4xl font-mono font-bold text-accent mb-2">
                    {formatTime()}
                </div>
                {!hideDate && (
                    <div className="text-sm text-gray-400">
                        {formatDate()}
                    </div>
                )}
            </div>
        </div>
    );
}
