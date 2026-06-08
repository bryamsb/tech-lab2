'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Box } from '@react-three/drei';
import { Suspense, useState, useEffect, useCallback } from 'react';
import { Users, TrendingUp, TrendingDown, Minus, AlertTriangle } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import * as THREE from 'three';

interface ViewerProps {
  camId?: string;
  refreshMs?: number;
}

interface CounterData {
  camId: string;
  timestamp: string;
  currentCount: number;
  maxCapacity: number;
  trend: 'up' | 'down' | 'stable';
  occupancyPercent: number;
  alert?: string;
  mock?: boolean;
  reason?: string;
}

// API Response from backend
interface PeopleCounterApiResponse {
  id: number;
  cam_id: string;
  ts: string;
  aforo: number;
}

interface LocalPeopleCounterResponse {
  counter: {
    camId: string;
    timestamp: string;
    currentCount: number;
    maxCapacity: number;
    trend: 'up' | 'down' | 'stable';
    occupancyPercent: number;
    alert?: string;
  };
}

// Transformar datos de la API al formato esperado
const transformPeopleCounterData = (apiResponse: PeopleCounterApiResponse): CounterData => {
  const maxCapacity = 50; // Default capacity
  const occupancyPercent = Math.round((apiResponse.aforo / maxCapacity) * 100);

  const counterData: CounterData = {
    camId: apiResponse.cam_id,
    timestamp: apiResponse.ts,
    currentCount: apiResponse.aforo,
    maxCapacity,
    trend: occupancyPercent > 60 ? 'up' : occupancyPercent < 30 ? 'down' : 'stable',
    occupancyPercent,
    alert: occupancyPercent >= 90 ? '¡Alerta! Aforo cerca del límite' : undefined,
    mock: false,
  };

  return counterData;
};

// Componente para representar una persona en 3D
function PersonFigure({ position, color }: { position: [number, number, number]; color: string }) {
  return (
    <group position={position}>
      {/* Cabeza */}
      <Sphere args={[0.3, 16, 16]} position={[0, 1.7, 0]}>
        <meshStandardMaterial color={color} />
      </Sphere>

      {/* Cuerpo */}
      <Box args={[0.5, 0.8, 0.3]} position={[0, 1.1, 0]}>
        <meshStandardMaterial color={color} />
      </Box>

      {/* Piernas */}
      <Box args={[0.2, 0.6, 0.2]} position={[-0.15, 0.4, 0]}>
        <meshStandardMaterial color={color} />
      </Box>
      <Box args={[0.2, 0.6, 0.2]} position={[0.15, 0.4, 0]}>
        <meshStandardMaterial color={color} />
      </Box>
    </group>
  );
}

// Escena 3D con figuras de personas
function PeopleScene3D({ data, theme }: { data: CounterData; theme: string }) {
  const peopleCount = data.currentCount;
  const maxCapacity = data.maxCapacity;

  // Generar posiciones para las personas en una cuadrícula
  const peoplePositions: Array<[number, number, number]> = [];
  const cols = Math.ceil(Math.sqrt(maxCapacity));
  const rows = Math.ceil(maxCapacity / cols);

  for (let i = 0; i < maxCapacity; i++) {
    const row = Math.floor(i / cols);
    const col = i % cols;
    const x = (col - (cols - 1) / 2) * 1.5;
    const z = ((rows - 1) / 2 - row) * 1.5;
    peoplePositions.push([x, 0, z]);
  }

  // Formato del timestamp
  const formatTimestamp = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('es-PE', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  // Color basado en estado de ocupación
  const getPersonColor = (index: number) => {
    if (index < peopleCount) {
      // Persona presente
      if (data.occupancyPercent >= 90) return '#ff4444';
      if (data.occupancyPercent >= 70) return '#ff9944';
      if (data.occupancyPercent >= 50) return '#ffdd44';
      return '#44ff44';
    }
    // Espacio vacío
    return theme === 'dark' ? '#333333' : '#cccccc';
  };

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={0.8} />
      <pointLight position={[-10, 10, -5]} intensity={0.3} />

      {/* Piso */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
        <planeGeometry args={[cols * 1.8, rows * 1.8]} />
        <meshStandardMaterial
          color={theme === 'dark' ? '#1a1a1a' : '#f0f0f0'}
          opacity={0.9}
          transparent
        />
      </mesh>

      {/* Límites del área */}
      <lineSegments>
        <edgesGeometry args={[new THREE.PlaneGeometry(cols * 1.8, rows * 1.8)]} />
        <lineBasicMaterial color={theme === 'dark' ? '#666666' : '#999999'} />
      </lineSegments>

      {/* Figuras de personas */}
      {peoplePositions.map((pos, idx) => (
        <PersonFigure
          key={idx}
          position={pos}
          color={getPersonColor(idx)}
        />
      ))}

      {/* Texto de contador */}
      <Text
        position={[0, 3, 0]}
        fontSize={0.8}
        color={theme === 'dark' ? '#00d9ff' : '#0066cc'}
        anchorX="center"
        anchorY="middle"
      >
        {`${peopleCount} / ${maxCapacity}`}
      </Text>

      {/* Timestamp en 3D */}
      <Text
        position={[0, -2.5, 0]}
        fontSize={0.5}
        color={theme === 'dark' ? '#888888' : '#666666'}
        anchorX="center"
        anchorY="middle"
      >
        {formatTimestamp(data.timestamp)}
      </Text>

      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        maxPolarAngle={Math.PI / 2}
        minDistance={5}
        maxDistance={30}
      />
    </>
  );
}

function CounterDisplay({ data }: { data: CounterData }) {
  const getOccupancyColor = (percent: number) => {
    if (percent >= 90) return 'text-red-500';
    if (percent >= 70) return 'text-orange-500';
    if (percent >= 50) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getTrendIcon = (trend: CounterData['trend']) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-5 h-5 text-red-400" />;
      case 'down':
        return <TrendingDown className="w-5 h-5 text-green-400" />;
      default:
        return <Minus className="w-5 h-5 text-blue-400" />;
    }
  };

  const occupancyColor = getOccupancyColor(data.occupancyPercent);

  return (
    <div className="w-full h-full flex flex-col gap-4 p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-6 h-6 text-theme-accent" />
          <h3 className="text-lg font-semibold text-theme-text">
            {data.camId.replace('cuenta_personas:', 'Área ')}
          </h3>
        </div>
        {getTrendIcon(data.trend)}
      </div>

      {/* Contador Principal */}
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <div className="text-center">
          <div className={`text-6xl sm:text-7xl font-bold ${occupancyColor} transition-colors`}>
            {data.currentCount}
          </div>
          <div className="text-sm text-theme-secondary mt-2">
            Personas en el área
          </div>
        </div>

        {/* Barra de Capacidad */}
        <div className="w-full max-w-md">
          <div className="flex justify-between text-xs text-theme-secondary mb-2">
            <span>Capacidad</span>
            <span>{data.occupancyPercent}%</span>
          </div>
          <div className="w-full h-4 bg-theme-border/30 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${data.occupancyPercent >= 90
                ? 'bg-red-500'
                : data.occupancyPercent >= 70
                  ? 'bg-orange-500'
                  : data.occupancyPercent >= 50
                    ? 'bg-yellow-500'
                    : 'bg-green-500'
                }`}
              style={{ width: `${Math.min(data.occupancyPercent, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-theme-secondary mt-1">
            <span>0</span>
            <span>{data.maxCapacity} máx</span>
          </div>
        </div>

        {/* Alerta si hay sobrecupo */}
        {data.alert && (
          <div className="w-full max-w-md bg-red-500/10 border border-red-500/30 rounded-lg p-3 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-400">{data.alert}</p>
          </div>
        )}
      </div>

      {/* Footer con timestamp */}
      <div className="text-center text-xs text-theme-secondary">
        Última actualización: {new Date(data.timestamp).toLocaleString('es-PE', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        })}
      </div>
    </div>
  );
}

function PeopleCounterScene({ camId = 'cuenta_personas:A1', refreshMs = 10000 }: ViewerProps) {
  const { theme } = useTheme();
  const [counterData, setCounterData] = useState<CounterData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const proxyUrl = `/api/sensors-proxy/people-counter?cam_id=${encodeURIComponent(camId)}`;
      const proxyRes = await fetch(proxyUrl, { cache: 'no-store' });

      if (proxyRes.ok) {
        const proxyData: PeopleCounterApiResponse = await proxyRes.json();
        const nextData = transformPeopleCounterData(proxyData);
        setCounterData(nextData);
        setError(null);
        return;
      }

      const localUrl = `/api/people-counter?counterCamId=${encodeURIComponent(camId)}`;
      const localRes = await fetch(localUrl, { cache: 'no-store' });

      if (!localRes.ok) {
        throw new Error(`HTTP Error: ${localRes.status} ${localRes.statusText}`);
      }

      const localData: LocalPeopleCounterResponse = await localRes.json();
      setCounterData(localData.counter);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [camId]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, refreshMs);
    return () => clearInterval(interval);
  }, [fetchData, refreshMs]);

  if (loading && !counterData) {
    return (
      <div className="w-full h-full flex items-center justify-center text-theme-secondary min-h-[500px]">
        Cargando datos del contador...
      </div>
    );
  }

  if (!counterData) {
    return (
      <div className="w-full h-full flex items-center justify-center text-theme-secondary min-h-[500px]">
        {error || 'Sin datos disponibles'}
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      {error && (
        <div className="bg-red-500/90 text-white px-4 py-2 rounded-lg shadow text-sm mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full min-h-[600px]">
        {/* Visualización 3D */}
        <div className="bg-theme-card rounded-lg border border-theme-border overflow-hidden" style={{ minHeight: '600px' }}>
          <Suspense fallback={<div className="w-full h-full flex items-center justify-center text-theme-secondary">Cargando 3D...</div>}>
            <Canvas camera={{ position: [0, 8, 12], fov: 50 }}>
              <PeopleScene3D data={counterData} theme={theme} />
            </Canvas>
          </Suspense>
        </div>

        {/* Panel de información */}
        <div className="flex flex-col gap-4 p-4 bg-theme-card/50 rounded-lg">
          <CounterDisplay data={counterData} />
        </div>
      </div>
    </div>
  );
}

export default function PeopleCounterViewer({ camId, refreshMs }: ViewerProps) {
  return (
    <div className="w-full h-auto min-h-[600px] rounded-lg overflow-hidden">
      <Suspense
        fallback={
          <div className="w-full h-full min-h-[600px] flex items-center justify-center bg-theme-card rounded-lg border border-theme-border">
            <div className="text-theme-text text-center">
              <div>Cargando visualización 3D...</div>
              <div className="text-xs text-theme-secondary mt-2">Por favor espera</div>
            </div>
          </div>
        }
      >
        <PeopleCounterScene camId={camId} refreshMs={refreshMs} />
      </Suspense>
    </div>
  );
}
