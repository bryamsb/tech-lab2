'use client';

import { useEffect, useState, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Thermometer, Droplets, Wind, Activity, AlertTriangle, Clock, RefreshCw } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

interface SensorReading {
    id_sensor: string;
    temperatura: number;
    humedad: number;
    co2: number;
    timestamp: string;
}

interface LoRaData {
    current: SensorReading[];
    historical: SensorReading[];
    timestamp: string;
    mock?: boolean;
    reason?: string;
}

// API Response from backend
interface LoRaApiResponse {
    id: number;
    idb: number;
    humedad: string;
    temperatura_c: string;
    dioxido_carbono_ppm: string;
    fecha_registro: string;
}

interface ViewerProps {
    refreshMs?: number;
}

const TEMP_ALERT_THRESHOLDS = { min: 18, max: 28 };
const HUMIDITY_ALERT_THRESHOLDS = { min: 30, max: 70 };
const CO2_ALERT_THRESHOLDS = { min: 400, max: 1000 };

// Transformar datos de la API al formato esperado
const transformLoRaData = (apiResponse: LoRaApiResponse | LoRaApiResponse[]): LoRaData => {
    const rows = Array.isArray(apiResponse) ? apiResponse : [apiResponse];

    const historical = rows
        .map((row) => ({
            id_sensor: `LORA_${row.idb}`,
            temperatura: parseFloat(row.temperatura_c),
            humedad: parseFloat(row.humedad),
            co2: parseFloat(row.dioxido_carbono_ppm),
            timestamp: row.fecha_registro,
        }))
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    const latestBySensor = new Map<string, SensorReading>();
    for (const reading of historical) {
        const currentLatest = latestBySensor.get(reading.id_sensor);
        if (!currentLatest || new Date(reading.timestamp).getTime() > new Date(currentLatest.timestamp).getTime()) {
            latestBySensor.set(reading.id_sensor, reading);
        }
    }

    const current = Array.from(latestBySensor.values());
    const latestTimestamp = current.length
        ? current
            .map((reading) => new Date(reading.timestamp).getTime())
            .sort((a, b) => b - a)[0]
        : Date.now();

    return {
        current,
        historical,
        timestamp: new Date(latestTimestamp).toISOString(),
        mock: false,
    };
};

export default function LoRaSensorViewer({ refreshMs = 10000 }: ViewerProps) {
    const [data, setData] = useState<LoRaData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedSensor, setSelectedSensor] = useState<string | 'all'>('all');
    const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
    const { theme } = useTheme();

    const fetchData = useCallback(async () => {
        try {
            const url = '/api/sensors-proxy/lora?limit=30';

            const response = await fetch(url, {
                cache: 'no-store',
                headers: {
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
            }

            const apiResponse: LoRaApiResponse | LoRaApiResponse[] = await response.json();

            // Transformar datos de la API al formato esperado
            const loraData = transformLoRaData(apiResponse);

            setData(loraData);
            setLastUpdate(new Date());
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error desconocido');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, refreshMs);
        return () => clearInterval(interval);
    }, [fetchData, refreshMs]);

    // Escuchar cambios de visibilidad para refrescar cuando la pestaña vuelve activa
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                fetchData();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [fetchData]);

    const getSensorColor = (sensorId: string) => {
        const colors: Record<string, string> = {
            'LORA_001': '#3b82f6', // blue
            'LORA_002': '#10b981', // green
            'LORA_003': '#f59e0b', // amber
        };
        return colors[sensorId] || '#6b7280';
    };

    const checkAlert = (value: number, thresholds: { min: number; max: number }) => {
        return value < thresholds.min || value > thresholds.max;
    };

    const formatTimestamp = (timestamp: string) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    };

    const formatChartData = () => {
        if (!data) return [];

        const filteredData = selectedSensor === 'all'
            ? data.historical
            : data.historical.filter(d => d.id_sensor === selectedSensor);

        // Agrupar por timestamp
        const groupedByTime: Record<string, { time: string; timestamp: string;[key: string]: number | string }> = {};

        filteredData.forEach(reading => {
            const timeKey = reading.timestamp;
            if (!groupedByTime[timeKey]) {
                groupedByTime[timeKey] = {
                    time: formatTimestamp(reading.timestamp),
                    timestamp: reading.timestamp,
                };
            }

            groupedByTime[timeKey][`${reading.id_sensor}_temp`] = reading.temperatura;
            groupedByTime[timeKey][`${reading.id_sensor}_humidity`] = reading.humedad;
            groupedByTime[timeKey][`${reading.id_sensor}_co2`] = reading.co2;
        });

        return Object.values(groupedByTime).sort((a, b) =>
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="flex flex-col items-center gap-4">
                    <RefreshCw className="animate-spin text-theme-accent" size={48} />
                    <p className="text-theme-secondary">Cargando datos de sensores...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="flex flex-col items-center gap-4 text-red-500">
                    <AlertTriangle size={48} />
                    <p>Error: {error}</p>
                </div>
            </div>
        );
    }

    if (!data || !data.current.length) {
        return (
            <div className="flex items-center justify-center h-96">
                <p className="text-theme-secondary">No hay datos disponibles</p>
            </div>
        );
    }

    const chartData = formatChartData();
    const sensors = Array.from(new Set(data.current.map(d => d.id_sensor)));

    return (
        <div className="space-y-6">
            {/* Header con selector de sensores y última actualización */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-2">
                    <Activity className="text-theme-accent" size={24} />
                    <h3 className="text-lg font-bold text-theme-text">
                        Monitoreo de Sensores LoRa
                    </h3>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-sm text-theme-secondary">
                        <Clock size={16} />
                        <span>Actualizado: {formatTimestamp(lastUpdate.toISOString())}</span>
                    </div>

                    <select
                        value={selectedSensor}
                        onChange={(e) => setSelectedSensor(e.target.value)}
                        className="px-3 py-1.5 rounded-lg bg-theme-card border border-theme-border text-theme-text text-sm"
                    >
                        <option value="all">Todos los sensores</option>
                        {sensors.map(sensor => (
                            <option key={sensor} value={sensor}>{sensor}</option>
                        ))}
                    </select>
                </div>
            </div>

            {data.mock && (
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg px-4 py-2 flex items-center gap-2">
                    <AlertTriangle className="text-yellow-500" size={18} />
                    <span className="text-sm text-yellow-600 dark:text-yellow-400">{data.reason}</span>
                </div>
            )}

            {/* Estado Actual de Sensores */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {data.current.map((reading) => {
                    const tempAlert = checkAlert(reading.temperatura, TEMP_ALERT_THRESHOLDS);
                    const humidityAlert = checkAlert(reading.humedad, HUMIDITY_ALERT_THRESHOLDS);
                    const co2Alert = checkAlert(reading.co2, CO2_ALERT_THRESHOLDS);
                    const hasAlert = tempAlert || humidityAlert || co2Alert;

                    return (
                        <div
                            key={reading.id_sensor}
                            className={`bg-theme-card rounded-xl p-4 border-2 transition-all ${hasAlert
                                ? 'border-red-500 shadow-lg shadow-red-500/20'
                                : 'border-theme-border'
                                }`}
                            style={{
                                borderLeftColor: getSensorColor(reading.id_sensor),
                                borderLeftWidth: '4px'
                            }}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <h4 className="font-bold text-theme-text">{reading.id_sensor}</h4>
                                {hasAlert && (
                                    <AlertTriangle className="text-red-500 animate-pulse" size={20} />
                                )}
                            </div>

                            <div className="space-y-3">
                                {/* Temperatura */}
                                <div className={`flex items-center justify-between p-2 rounded-lg ${tempAlert ? 'bg-red-500/10' : 'bg-theme-background'
                                    }`}>
                                    <div className="flex items-center gap-2">
                                        <Thermometer size={18} className={tempAlert ? 'text-red-500' : 'text-blue-500'} />
                                        <span className="text-sm text-theme-secondary">Temperatura</span>
                                    </div>
                                    <span className={`font-bold ${tempAlert ? 'text-red-500' : 'text-theme-text'}`}>
                                        {reading.temperatura.toFixed(1)}°C
                                    </span>
                                </div>

                                {/* Humedad */}
                                <div className={`flex items-center justify-between p-2 rounded-lg ${humidityAlert ? 'bg-red-500/10' : 'bg-theme-background'
                                    }`}>
                                    <div className="flex items-center gap-2">
                                        <Droplets size={18} className={humidityAlert ? 'text-red-500' : 'text-cyan-500'} />
                                        <span className="text-sm text-theme-secondary">Humedad</span>
                                    </div>
                                    <span className={`font-bold ${humidityAlert ? 'text-red-500' : 'text-theme-text'}`}>
                                        {reading.humedad.toFixed(1)}%
                                    </span>
                                </div>

                                {/* CO2 */}
                                <div className={`flex items-center justify-between p-2 rounded-lg ${co2Alert ? 'bg-red-500/10' : 'bg-theme-background'
                                    }`}>
                                    <div className="flex items-center gap-2">
                                        <Wind size={18} className={co2Alert ? 'text-red-500' : 'text-green-500'} />
                                        <span className="text-sm text-theme-secondary">CO₂</span>
                                    </div>
                                    <span className={`font-bold ${co2Alert ? 'text-red-500' : 'text-theme-text'}`}>
                                        {reading.co2.toFixed(0)} ppm
                                    </span>
                                </div>
                            </div>

                            <div className="mt-3 pt-3 border-t border-theme-border">
                                <p className="text-xs text-theme-secondary">
                                    {formatTimestamp(reading.timestamp)}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Gráficas de Evolución */}
            <div className="space-y-6">
                {/* Gráfica de Temperatura */}
                <div className="bg-theme-card rounded-xl p-6 border border-theme-border">
                    <h4 className="text-lg font-bold text-theme-text mb-4 flex items-center gap-2">
                        <Thermometer className="text-blue-500" size={20} />
                        Evolución de Temperatura (°C)
                    </h4>
                    <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#374151' : '#e5e7eb'} />
                            <XAxis
                                dataKey="time"
                                stroke={theme === 'dark' ? '#9ca3af' : '#6b7280'}
                                tick={{ fill: theme === 'dark' ? '#9ca3af' : '#6b7280', fontSize: 12 }}
                            />
                            <YAxis
                                stroke={theme === 'dark' ? '#9ca3af' : '#6b7280'}
                                tick={{ fill: theme === 'dark' ? '#9ca3af' : '#6b7280', fontSize: 12 }}
                                domain={[15, 30]}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                                    border: `1px solid ${theme === 'dark' ? '#374151' : '#e5e7eb'}`,
                                    borderRadius: '8px',
                                    color: theme === 'dark' ? '#f9fafb' : '#111827'
                                }}
                            />
                            <Legend />
                            {(selectedSensor === 'all' ? sensors : [selectedSensor]).map(sensor => (
                                <Line
                                    key={`${sensor}_temp`}
                                    type="monotone"
                                    dataKey={`${sensor}_temp`}
                                    name={sensor}
                                    stroke={getSensorColor(sensor)}
                                    strokeWidth={2}
                                    dot={false}
                                    activeDot={{ r: 4 }}
                                />
                            ))}
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Gráfica de Humedad */}
                <div className="bg-theme-card rounded-xl p-6 border border-theme-border">
                    <h4 className="text-lg font-bold text-theme-text mb-4 flex items-center gap-2">
                        <Droplets className="text-cyan-500" size={20} />
                        Evolución de Humedad (%)
                    </h4>
                    <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#374151' : '#e5e7eb'} />
                            <XAxis
                                dataKey="time"
                                stroke={theme === 'dark' ? '#9ca3af' : '#6b7280'}
                                tick={{ fill: theme === 'dark' ? '#9ca3af' : '#6b7280', fontSize: 12 }}
                            />
                            <YAxis
                                stroke={theme === 'dark' ? '#9ca3af' : '#6b7280'}
                                tick={{ fill: theme === 'dark' ? '#9ca3af' : '#6b7280', fontSize: 12 }}
                                domain={[20, 80]}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                                    border: `1px solid ${theme === 'dark' ? '#374151' : '#e5e7eb'}`,
                                    borderRadius: '8px',
                                    color: theme === 'dark' ? '#f9fafb' : '#111827'
                                }}
                            />
                            <Legend />
                            {(selectedSensor === 'all' ? sensors : [selectedSensor]).map(sensor => (
                                <Line
                                    key={`${sensor}_humidity`}
                                    type="monotone"
                                    dataKey={`${sensor}_humidity`}
                                    name={sensor}
                                    stroke={getSensorColor(sensor)}
                                    strokeWidth={2}
                                    dot={false}
                                    activeDot={{ r: 4 }}
                                />
                            ))}
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Gráfica de CO2 */}
                <div className="bg-theme-card rounded-xl p-6 border border-theme-border">
                    <h4 className="text-lg font-bold text-theme-text mb-4 flex items-center gap-2">
                        <Wind className="text-green-500" size={20} />
                        Evolución de CO₂ (ppm)
                    </h4>
                    <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#374151' : '#e5e7eb'} />
                            <XAxis
                                dataKey="time"
                                stroke={theme === 'dark' ? '#9ca3af' : '#6b7280'}
                                tick={{ fill: theme === 'dark' ? '#9ca3af' : '#6b7280', fontSize: 12 }}
                            />
                            <YAxis
                                stroke={theme === 'dark' ? '#9ca3af' : '#6b7280'}
                                tick={{ fill: theme === 'dark' ? '#9ca3af' : '#6b7280', fontSize: 12 }}
                                domain={[300, 700]}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                                    border: `1px solid ${theme === 'dark' ? '#374151' : '#e5e7eb'}`,
                                    borderRadius: '8px',
                                    color: theme === 'dark' ? '#f9fafb' : '#111827'
                                }}
                            />
                            <Legend />
                            {(selectedSensor === 'all' ? sensors : [selectedSensor]).map(sensor => (
                                <Line
                                    key={`${sensor}_co2`}
                                    type="monotone"
                                    dataKey={`${sensor}_co2`}
                                    name={sensor}
                                    stroke={getSensorColor(sensor)}
                                    strokeWidth={2}
                                    dot={false}
                                    activeDot={{ r: 4 }}
                                />
                            ))}
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Información de rangos de alerta */}
            <div className="bg-theme-card rounded-xl p-4 border border-theme-border">
                <h4 className="text-sm font-bold text-theme-text mb-3">Rangos Normales</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="flex items-center gap-2">
                        <Thermometer size={14} className="text-blue-500" />
                        <span className="text-theme-secondary">
                            Temperatura: {TEMP_ALERT_THRESHOLDS.min}°C - {TEMP_ALERT_THRESHOLDS.max}°C
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Droplets size={14} className="text-cyan-500" />
                        <span className="text-theme-secondary">
                            Humedad: {HUMIDITY_ALERT_THRESHOLDS.min}% - {HUMIDITY_ALERT_THRESHOLDS.max}%
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Wind size={14} className="text-green-500" />
                        <span className="text-theme-secondary">
                            CO₂: {CO2_ALERT_THRESHOLDS.min} - {CO2_ALERT_THRESHOLDS.max} ppm
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
