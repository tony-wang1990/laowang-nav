import { useState, useEffect } from 'react';
import { Cloud, CloudRain, CloudSnow, Sun } from 'lucide-react';
import type { WidgetProps } from '../../types/widget';
import { useAppStore } from '../../store/useAppStore';

interface WeatherOptions {
    location?: string;
    units?: 'metric' | 'imperial';
    hideDetails?: boolean;
}

export default function Weather({ options = {} }: WidgetProps) {
    const {
        location = 'auto',
        units = 'metric',
        hideDetails = false,
    } = options as WeatherOptions;

    const { weather, setWeather } = useAppStore();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchWeather();
        const interval = setInterval(fetchWeather, 30 * 60 * 1000); // Every 30 minutes
        return () => clearInterval(interval);
    }, [location]);

    const fetchWeather = async () => {
        setLoading(true);
        try {
            const response = await fetch('https://wttr.in/?format=j1');
            const data = await response.json();

            if (data?.current_condition?.[0]) {
                const current = data.current_condition[0];
                setWeather({
                    temp: current.temp_C,
                    condition: current.weatherDesc[0].value,
                    icon: getWeatherIcon(current.weatherCode),
                    city: data.nearest_area[0].areaName[0].value,
                });
            }
        } catch (error) {
            console.error('Failed to fetch weather:', error);
        } finally {
            setLoading(false);
        }
    };

    const getWeatherIcon = (code: string) => {
        const weatherIcons: Record<string, string> = {
            '113': '☀️', '116': '⛅', '119': '☁️', '122': '☁️',
            '143': '🌫️', '176': '🌦️', '296': '🌧️', '302': '🌧️',
            '323': '🌨️', '326': '❄️',
        };
        return weatherIcons[code] || '🌤️';
    };

    if (!weather) {
        return (
            <div className="glass rounded-2xl p-6">
                <div className="flex items-center gap-3">
                    <Cloud className="w-5 h-5 text-primary animate-pulse" />
                    <span className="text-gray-400">加载天气中...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="glass rounded-2xl p-6 hover:bg-white/10 transition-all">
            <div className="flex items-center gap-3 mb-4">
                <Cloud className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-white">天气</h3>
            </div>

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <span className="text-5xl">{weather.icon}</span>
                    <div>
                        <div className="text-3xl font-bold text-accent">
                            {weather.temp}°{units === 'metric' ? 'C' : 'F'}
                        </div>
                        {!hideDetails && (
                            <div className="text-sm text-gray-400">{weather.city}</div>
                        )}
                    </div>
                </div>
            </div>

            {!hideDetails && weather.condition && (
                <div className="mt-4 pt-4 border-t border-white/10">
                    <p className="text-sm text-gray-300">{weather.condition}</p>
                </div>
            )}
        </div>
    );
}
