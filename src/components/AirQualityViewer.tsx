'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Box, Sphere, Text } from '@react-three/drei';
import { Suspense, useEffect, useMemo, useState } from 'react';
import { Wind, Thermometer, Droplets, Activity } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

type AirQualityData = {
    co2: number;
    temperature: number;
    humidity: number;
    pm25: number;
    voc: number;
};

const clamp = (value: number, min: number, max: number) =>
    Math.min(max, Math.max(min, value));

const randomDelta = (magnitude: number) => (Math.random() - 0.5) * magnitude;

function computeAqiScore(data: AirQualityData) {
    const co2Score = clamp((data.co2 - 400) / 1600, 0, 1);
    const pmScore = clamp(data.pm25 / 100, 0, 1);
    const vocScore = clamp(data.voc / 700, 0, 1);
    return Math.round((co2Score * 0.45 + pmScore * 0.35 + vocScore * 0.2) * 100);
}

function getAirState(score: number) {
    if (score <= 25)
        return {
            label: 'Óptima',
            color: '#22c55e',
        };
    if (score <= 50)
        return {
            label: 'Buena',
            color: '#84cc16',
        };
    if (score <= 70)
        return {
            label: 'Moderada',
            color: '#f59e0b',
        };
    return {
        label: 'Crítica',
        color: '#ef4444',
    };
}

function getRecommendations(data: AirQualityData, score: number) {
    const tips: string[] = [];

    if (data.co2 > 1100) {
        tips.push('CO₂ elevado: aumenta ventilación natural o activa extracción de aire.');
    }
    if (data.pm25 > 35) {
        tips.push('PM2.5 alto: revisa filtros y reduce fuentes de polvo en el ambiente.');
    }
    if (data.voc > 350) {
        tips.push('VOC elevado: limita solventes/químicos y mejora renovación de aire.');
    }
    if (data.humidity < 35) {
        tips.push('Humedad baja: considera humidificación para confort respiratorio.');
    }
    if (data.humidity > 65) {
        tips.push('Humedad alta: usa deshumidificación para evitar condensación/moho.');
    }
    if (data.temperature < 20 || data.temperature > 27) {
        tips.push('Temperatura fuera de confort: ajusta climatización del ambiente.');
    }

    if (tips.length === 0) {
        tips.push('Calidad estable: mantén ventilación y monitoreo continuo del módulo.');
    }

    return {
        severity: score > 70 ? 'Crítica' : score > 50 ? 'Moderada' : 'Normal',
        tips,
    };
}

export default function AirQualityViewer({ refreshMs = 3000 }: { refreshMs?: number }) {
    const { theme } = useTheme();

    const [data, setData] = useState<AirQualityData>({
        co2: 690,
        temperature: 23.7,
        humidity: 51,
        pm25: 16,
        voc: 180,
    });

    useEffect(() => {
        const timer = window.setInterval(() => {
            setData((current) => ({
                co2: clamp(Math.round(current.co2 + randomDelta(55)), 420, 1800),
                temperature: clamp(Number((current.temperature + randomDelta(0.7)).toFixed(1)), 18, 32),
                humidity: clamp(Math.round(current.humidity + randomDelta(6)), 25, 80),
                pm25: clamp(Math.round(current.pm25 + randomDelta(6)), 4, 95),
                voc: clamp(Math.round(current.voc + randomDelta(40)), 60, 700),
            }));
        }, refreshMs);

        return () => window.clearInterval(timer);
    }, [refreshMs]);

    const score = useMemo(() => computeAqiScore(data), [data]);
    const state = useMemo(() => getAirState(score), [score]);
    const recommendation = useMemo(
        () => getRecommendations(data, score),
        [data, score]
    );

    return (
        <div className="space-y-4">
            <div className="rounded-lg border border-theme-border bg-theme-card overflow-hidden">
                <div className="px-4 py-3 border-b border-theme-border flex items-center justify-between">
                    <h4 className="font-semibold text-theme-text">Simulación 3D de Calidad de Aire</h4>
                    <span className="text-xs text-theme-secondary">Actualización automática cada {refreshMs / 1000}s</span>
                </div>
                <div className="h-[300px] sm:h-[340px]">
                    <Canvas camera={{ position: [7.5, 5, 8], fov: 50 }}>
                        <Suspense fallback={null}>
                            <AirRoomScene theme={theme} score={score} color={state.color} pm25={data.pm25} />
                        </Suspense>
                    </Canvas>
                </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                <MetricCard icon={<Wind className="w-4 h-4" />} label="CO₂" value={`${data.co2} ppm`} />
                <MetricCard icon={<Thermometer className="w-4 h-4" />} label="Temperatura" value={`${data.temperature} °C`} />
                <MetricCard icon={<Droplets className="w-4 h-4" />} label="Humedad" value={`${data.humidity}%`} />
                <MetricCard icon={<Activity className="w-4 h-4" />} label="PM2.5" value={`${data.pm25} µg/m³`} />
                <div className="rounded-lg border border-theme-border bg-theme-card p-3 col-span-2 lg:col-span-1">
                    <div className="text-xs text-theme-secondary">Estado del aire</div>
                    <div className="mt-1 text-base font-semibold text-theme-text">{state.label}</div>
                    <div className="text-xs text-theme-secondary">Índice: {score}/100</div>
                    <div className="mt-2 h-2 rounded-full bg-theme-background border border-theme-border overflow-hidden">
                        <div className="h-full transition-all" style={{ width: `${score}%`, backgroundColor: state.color }} />
                    </div>
                </div>
            </div>

            <div
                className="rounded-lg border p-3"
                style={{
                    borderColor: state.color,
                    backgroundColor: `${state.color}1A`,
                }}
            >
                <div className="text-sm font-semibold text-theme-text">
                    Alerta automática: {recommendation.severity}
                </div>
                <ul className="mt-2 space-y-1 text-sm text-theme-secondary list-disc list-inside">
                    {recommendation.tips.map((tip) => (
                        <li key={tip}>{tip}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

function AirRoomScene({
    theme,
    score,
    color,
    pm25,
}: {
    theme: 'light' | 'dark';
    score: number;
    color: string;
    pm25: number;
}) {
    const floorColor = theme === 'dark' ? '#111827' : '#e2e8f0';
    const wallColor = theme === 'dark' ? '#1f2937' : '#f8fafc';
    const labelColor = theme === 'dark' ? '#e2e8f0' : '#0f172a';

    const particles = useMemo(() => {
        const amount = Math.min(90, Math.max(12, pm25));
        return Array.from({ length: amount }, (_, index) => ({
            id: index,
            x: -2.7 + Math.random() * 5.4,
            y: 0.25 + Math.random() * 2.7,
            z: -2 + Math.random() * 4,
        }));
    }, [pm25]);

    return (
        <>
            <ambientLight intensity={0.7} />
            <directionalLight position={[5, 8, 4]} intensity={1} />
            <pointLight position={[-5, 5, -3]} intensity={0.3} />

            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
                <planeGeometry args={[10, 8]} />
                <meshStandardMaterial color={floorColor} />
            </mesh>

            <Box args={[10, 3.2, 0.1]} position={[0, 1.5, -4]}>
                <meshStandardMaterial color={wallColor} />
            </Box>

            <group position={[-2.5, 0.4, 0.5]}>
                <Box args={[0.8, 1.4, 0.5]}>
                    <meshStandardMaterial color={theme === 'dark' ? '#334155' : '#94a3b8'} />
                </Box>
                <Sphere args={[0.18, 20, 20]} position={[0, 0.6, 0.32]}>
                    <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} />
                </Sphere>
            </group>

            <group position={[2.5, 0.4, -0.5]}>
                <Box args={[0.8, 1.4, 0.5]}>
                    <meshStandardMaterial color={theme === 'dark' ? '#334155' : '#94a3b8'} />
                </Box>
                <Sphere args={[0.18, 20, 20]} position={[0, 0.6, 0.32]}>
                    <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} />
                </Sphere>
            </group>

            {particles.map((particle) => (
                <Sphere key={particle.id} args={[0.03, 10, 10]} position={[particle.x, particle.y, particle.z]}>
                    <meshStandardMaterial color={score > 70 ? '#f97316' : score > 50 ? '#eab308' : '#a3e635'} transparent opacity={0.6} />
                </Sphere>
            ))}

            <Text position={[0, 3, -1.6]} fontSize={0.28} color={labelColor} anchorX="center" anchorY="middle">
                Módulo de Calidad de Aire Interior
            </Text>
            <Text position={[0, 2.6, -1.6]} fontSize={0.18} color={labelColor} anchorX="center" anchorY="middle">
                Índice de Calidad: {score}/100
            </Text>

            <OrbitControls
                enablePan
                enableZoom
                enableRotate
                minDistance={5}
                maxDistance={16}
                maxPolarAngle={Math.PI / 2.05}
            />
        </>
    );
}

function MetricCard({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
}) {
    return (
        <div className="rounded-lg border border-theme-border bg-theme-card p-3">
            <div className="flex items-center gap-2 text-theme-secondary text-xs">
                {icon} {label}
            </div>
            <div className="mt-1 text-lg font-bold text-theme-text">{value}</div>
        </div>
    );
}
