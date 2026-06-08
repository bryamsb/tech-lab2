'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Box } from '@react-three/drei';
import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

interface ParkingSpot {
  spot_id: string;
  isOccupied: boolean;
  position: [number, number, number];
}

interface ParkingArea {
  cameraId: string;
  timestamp: string;
  spots: Array<{ id: string; occupied: boolean; index: number }>;
  layout: [number, number];
  spotIds: string[];
  peopleCount?: number | null;
}

interface ParkingData {
  areas: ParkingArea[];
  peopleCount?: number | null;
}

// API Response from backend
interface SmartParkingApiResponse {
  id: number;
  cam_id: string;
  ts: string;
  spots_state: string; // e.g., "1001" where 1=occupied, 0=free
  spot_ids: string[];
  layout: [number, number];
}

// Transformar datos de la API al formato esperado
const transformSmartParkingData = (apiResponse: SmartParkingApiResponse): ParkingData => {
  // Convertir spots_state string a array de booleanos
  const spotStates = apiResponse.spots_state.split('').map(char => char === '1');

  const spots = apiResponse.spot_ids.map((id, index) => ({
    id,
    occupied: spotStates[index] || false,
    index,
  }));

  const area: ParkingArea = {
    cameraId: apiResponse.cam_id,
    timestamp: apiResponse.ts,
    spots,
    layout: apiResponse.layout,
    spotIds: apiResponse.spot_ids,
    peopleCount: null,
  };

  const parkingData: ParkingData = {
    areas: [area],
    peopleCount: null,
  };

  return parkingData;
};

type ViewerProps = {
  camId?: string;
  counterCamId?: string;
  refreshMs?: number;
};

const colorFromId = (id: string) => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
    hash |= 0;
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 60%, 45%)`;
};

const buildPositions = (
  spots: Array<{ id: string; occupied: boolean; index: number }>,
  layout: [number, number]
): ParkingSpot[] => {
  const [rowsInput, colsInput] = layout;
  const cols = colsInput && colsInput > 0 ? colsInput : Math.max(1, Math.ceil(Math.sqrt(spots.length)));
  const rows = rowsInput && rowsInput > 0 ? rowsInput : Math.max(1, Math.ceil(spots.length / cols));

  return spots.map((spot, idx) => {
    const row = Math.floor(idx / cols);
    const col = idx % cols;
    const x = (col - (cols - 1) / 2) * 4;
    const z = ((rows - 1) / 2 - row) * 6;

    return {
      spot_id: spot.id,
      isOccupied: spot.occupied,
      position: [x, 0.1, z],
    };
  });
};

function ParkingSpotMesh({ spot, theme }: { spot: ParkingSpot; theme: string }) {
  return (
    <group position={spot.position}>
      <Box args={[3.5, 0.1, 5]} position={[0, 0, 0]}>
        <meshStandardMaterial color={spot.isOccupied ? '#ff4444' : '#44ff44'} transparent opacity={0.9} />
      </Box>

      <Box args={[3.6, 0.15, 0.1]} position={[0, 0.1, 2.5]}>
        <meshStandardMaterial color="#ffffff" />
      </Box>
      <Box args={[3.6, 0.15, 0.1]} position={[0, 0.1, -2.5]}>
        <meshStandardMaterial color="#ffffff" />
      </Box>
      <Box args={[0.1, 0.15, 5]} position={[1.8, 0.1, 0]}>
        <meshStandardMaterial color="#ffffff" />
      </Box>
      <Box args={[0.1, 0.15, 5]} position={[-1.8, 0.1, 0]}>
        <meshStandardMaterial color="#ffffff" />
      </Box>

      <Text
        position={[0, 0.3, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={1.0}
        color={theme === 'dark' ? '#ffffff' : '#000000'}
        anchorX="center"
        anchorY="middle"
      >
        {spot.spot_id}
      </Text>

      {spot.isOccupied && (
        <Box args={[2.8, 0.6, 4.2]} position={[0, 0.4, 0]}>
          <meshStandardMaterial color={colorFromId(spot.spot_id)} />
        </Box>
      )}
    </group>
  );
}

function Ground({ theme }: { theme: string }) {
  return (
    <Box args={[60, 0.1, 20]} position={[0, -0.5, 0]}>
      <meshStandardMaterial color={theme === 'dark' ? '#2a2a3a' : '#4a4a5a'} />
    </Box>
  );
}

function ParkingAreaViewer({ area, theme, lastUpdate }: { area: ParkingArea; theme: string; lastUpdate: Date | null }) {
  const spotsWithPositions = buildPositions(area.spots, area.layout);
  const stats = useMemo(() => {
    const occupied = spotsWithPositions.filter((s) => s.isOccupied).length;
    const total = spotsWithPositions.length;
    const available = total - occupied;
    const percent = total > 0 ? Math.round((occupied / total) * 100) : 0;
    return { occupied, total, available, percent };
  }, [spotsWithPositions]);

  const getCameraPosition = (): [number, number, number] => {
    const [rows, cols] = area.layout;
    const totalSpots = rows * cols;
    if (totalSpots <= 4) return [6, 12, 8];
    if (totalSpots <= 12) return [12, 20, 12];
    return [20, 30, 20];
  };

  return (
    <div className="w-full h-full flex flex-col rounded-lg border border-theme-border bg-theme-card/20 overflow-hidden">
      <div className="p-3 bg-theme-card/50 border-b border-theme-border">
        <h3 className="font-bold text-theme-text text-lg mb-2">{area.cameraId}</h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex justify-between">
            <span className="text-theme-secondary">Total:</span>
            <span className="font-bold text-theme-text">{stats.total}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-theme-secondary">Disponibles:</span>
            <span className="font-bold text-green-500">{stats.available}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-theme-secondary">Ocupados:</span>
            <span className="font-bold text-red-500">{stats.occupied}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-theme-secondary">Ocupación:</span>
            <span className="font-bold text-theme-text">{stats.percent}%</span>
          </div>
          {area.peopleCount !== undefined && area.peopleCount !== null && (
            <div className="flex justify-between col-span-2">
              <span className="text-theme-secondary">Aforo:</span>
              <span className="font-bold text-theme-text">{area.peopleCount}</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 relative">
        <Canvas camera={{ position: getCameraPosition(), fov: 50 }} style={{ width: '100%', height: '100%', background: 'transparent' }}>
          <Suspense fallback={null}>
            <ambientLight intensity={0.8} />
            <directionalLight position={[0, 15, 0]} intensity={1.2} castShadow />
            <pointLight position={[-10, 10, 5]} intensity={0.4} color="#ffffff" />
            <pointLight position={[10, 10, 5]} intensity={0.4} color="#ffffff" />

            <Ground theme={theme} />

            {spotsWithPositions.map((spot) => (
              <ParkingSpotMesh key={spot.spot_id} spot={spot} theme={theme} />
            ))}

            <OrbitControls
              enablePan
              enableZoom
              enableRotate
              minDistance={5}
              maxDistance={30}
              maxPolarAngle={Math.PI / 2.5}
              enableDamping
              dampingFactor={0.08}
              target={[0, 0, 0]}
            />
          </Suspense>
        </Canvas>

        <div className="absolute top-2 right-2 bg-theme-card/90 backdrop-blur-sm rounded p-2 text-xs text-theme-secondary flex flex-col gap-1">
          <div className="text-xs font-semibold text-theme-accent">
            {lastUpdate
              ? lastUpdate.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
              : 'Actualizando...'}
          </div>
          <div className="text-xs text-theme-secondary border-t border-theme-border/50 pt-1">
            Datos: {new Date(area.timestamp).toLocaleString('es-PE', {
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
              hour12: false
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function ParkingScene({ camId = 'smart_parking:A1', refreshMs = 10000 }: ViewerProps) {
  const { theme } = useTheme();
  const [parkingData, setParkingData] = useState<ParkingData | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      console.log('[SmartParkingViewer] 🅿️ Iniciando fetch de Smart Parking...');
      const url = `/api/sensors-proxy/smart-parking?cam_id=${encodeURIComponent(camId)}`;

      const res = await fetch(url, { cache: 'no-store' });

      if (!res.ok) {
        throw new Error(`HTTP Error: ${res.status} ${res.statusText}`);
      }

      const apiResponse: SmartParkingApiResponse = await res.json();

      // Transformar datos de la API al formato esperado
      const parkingDataTransformed = transformSmartParkingData(apiResponse);

      setParkingData(parkingDataTransformed);
      setLastUpdate(new Date());
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

  if (loading && !parkingData) {
    return <div className="w-full h-full flex items-center justify-center text-theme-secondary">Cargando datos en tiempo real...</div>;
  }

  if (!parkingData || !parkingData.areas || parkingData.areas.length === 0) {
    return <div className="w-full h-full flex items-center justify-center text-theme-secondary">{error || 'Sin datos disponibles'}</div>;
  }

  return (
    <div className="w-full h-full">
      {error && (
        <div className="bg-red-500/90 text-white px-4 py-2 rounded-lg shadow text-sm mb-4">
          {error}
        </div>
      )}

      {parkingData.areas.map((area) => (
        <ParkingAreaViewer key={area.cameraId} area={area} theme={theme} lastUpdate={lastUpdate} />
      ))}
    </div>
  );
}

export default function SmartParkingViewer({ camId, counterCamId, refreshMs }: ViewerProps) {
  return (
    <div className="w-full h-full">
      <Suspense
        fallback={
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-theme-text">Cargando simulación 3D...</div>
          </div>
        }
      >
        <ParkingScene camId={camId} counterCamId={counterCamId} refreshMs={refreshMs} />
      </Suspense>
    </div>
  );
}
