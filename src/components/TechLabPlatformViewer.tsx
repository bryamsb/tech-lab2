'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Box } from '@react-three/drei';
import { Suspense, useMemo, useState, type ReactNode } from 'react';
import {
    LayoutDashboard,
    FolderKanban,
    Users,
    BookOpen,
    ShieldCheck,
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

type Activity = {
    id: string;
    time: string;
    text: string;
};

const nowTime = () =>
    new Date().toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });

export default function TechLabPlatformViewer() {
    const { theme } = useTheme();
    const [projects, setProjects] = useState(12);
    const [researchers, setResearchers] = useState(18);
    const [loans, setLoans] = useState(6);
    const [activeSessions, setActiveSessions] = useState(9);
    const [activities, setActivities] = useState<Activity[]>([
        {
            id: '1',
            time: nowTime(),
            text: 'Se publicó un nuevo proyecto en el catálogo.',
        },
        {
            id: '2',
            time: nowTime(),
            text: 'Un investigador actualizó el estado de su proyecto.',
        },
        {
            id: '3',
            time: nowTime(),
            text: 'Se registró una solicitud de préstamo de equipo.',
        },
    ]);

    const addActivity = (text: string) => {
        setActivities((prev) => [
            { id: crypto.randomUUID(), time: nowTime(), text },
            ...prev,
        ].slice(0, 8));
    };

    const simulateProject = () => {
        setProjects((current) => current + 1);
        setActiveSessions((current) => current + 1);
        addActivity('Nuevo proyecto creado y publicado en la plataforma.');
    };

    const simulateResearcher = () => {
        setResearchers((current) => current + 1);
        addActivity('Se incorporó un nuevo investigador al TechLab.');
    };

    const simulateLoan = () => {
        setLoans((current) => current + 1);
        addActivity('Préstamo aprobado y registrado en inventario.');
    };

    const healthStatus = useMemo(() => {
        if (activeSessions >= 15) return 'Alta demanda';
        if (activeSessions >= 8) return 'Estable';
        return 'Baja carga';
    }, [activeSessions]);

    return (
        <div className="space-y-4">
            <div className="rounded-lg border border-theme-border bg-theme-card overflow-hidden">
                <div className="px-4 py-3 border-b border-theme-border flex items-center justify-between">
                    <h4 className="font-semibold text-theme-text">
                        Simulación 3D de Plataforma Web
                    </h4>
                    <span className="text-xs text-theme-secondary">
                        Arrastra para rotar • Scroll para zoom
                    </span>
                </div>
                <div className="h-[320px] sm:h-[360px]">
                    <Canvas camera={{ position: [8, 8, 11], fov: 50 }}>
                        <Suspense fallback={null}>
                            <PlatformScene3D
                                theme={theme}
                                projects={projects}
                                researchers={researchers}
                                loans={loans}
                                activeSessions={activeSessions}
                            />
                        </Suspense>
                    </Canvas>
                </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                <MetricCard
                    icon={<FolderKanban className="w-4 h-4" />}
                    label="Proyectos"
                    value={projects}
                />
                <MetricCard
                    icon={<Users className="w-4 h-4" />}
                    label="Investigadores"
                    value={researchers}
                />
                <MetricCard
                    icon={<BookOpen className="w-4 h-4" />}
                    label="Préstamos"
                    value={loans}
                />
                <MetricCard
                    icon={<LayoutDashboard className="w-4 h-4" />}
                    label="Sesiones activas"
                    value={activeSessions}
                />
                <div className="rounded-lg border border-theme-border bg-theme-card p-3 col-span-2 lg:col-span-1">
                    <div className="flex items-center gap-2 text-theme-secondary text-xs">
                        <ShieldCheck className="w-4 h-4" /> Estado plataforma
                    </div>
                    <div className="mt-1 text-sm font-semibold text-theme-text">
                        {healthStatus}
                    </div>
                </div>
            </div>

            <div className="rounded-lg border border-theme-border bg-theme-card p-4">
                <h4 className="font-semibold text-theme-text mb-3">
                    Simulación de operaciones
                </h4>
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={simulateProject}
                        className="px-3 py-2 rounded-lg border border-theme-border text-theme-text hover:bg-theme-accent/10 transition-colors"
                    >
                        Crear proyecto
                    </button>
                    <button
                        onClick={simulateResearcher}
                        className="px-3 py-2 rounded-lg border border-theme-border text-theme-text hover:bg-theme-accent/10 transition-colors"
                    >
                        Registrar investigador
                    </button>
                    <button
                        onClick={simulateLoan}
                        className="px-3 py-2 rounded-lg border border-theme-border text-theme-text hover:bg-theme-accent/10 transition-colors"
                    >
                        Aprobar préstamo
                    </button>
                </div>
            </div>

            <div className="rounded-lg border border-theme-border bg-theme-card p-4">
                <h4 className="font-semibold text-theme-text mb-3">Actividad reciente</h4>
                <ul className="space-y-2 max-h-52 overflow-y-auto pr-1">
                    {activities.map((activity) => (
                        <li
                            key={activity.id}
                            className="rounded-md border border-theme-border bg-theme-background/50 px-3 py-2"
                        >
                            <p className="text-sm text-theme-text">{activity.text}</p>
                            <p className="text-xs text-theme-secondary mt-1">{activity.time}</p>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

function PlatformScene3D({
    theme,
    projects,
    researchers,
    loans,
    activeSessions,
}: {
    theme: 'light' | 'dark';
    projects: number;
    researchers: number;
    loans: number;
    activeSessions: number;
}) {
    const floorColor = theme === 'dark' ? '#111827' : '#e2e8f0';
    const labelColor = theme === 'dark' ? '#e2e8f0' : '#0f172a';
    const panelColor = theme === 'dark' ? '#1f2937' : '#ffffff';
    const panelBorder = theme === 'dark' ? '#334155' : '#cbd5e1';
    const panelHeader = theme === 'dark' ? '#0f172a' : '#f1f5f9';

    const windows = useMemo(
        () => [
            {
                title: 'Gestión de Proyectos',
                value: projects,
                color: '#3b82f6',
                position: [-4.8, 2.1, -1.1] as [number, number, number],
                rotation: [0, 0.28, 0] as [number, number, number],
            },
            {
                title: 'Investigadores',
                value: researchers,
                color: '#22c55e',
                position: [0, 2.3, -2.8] as [number, number, number],
                rotation: [0, 0, 0] as [number, number, number],
            },
            {
                title: 'Préstamos e Inventario',
                value: loans,
                color: '#f59e0b',
                position: [4.8, 2.1, -1.1] as [number, number, number],
                rotation: [0, -0.28, 0] as [number, number, number],
            },
        ],
        [projects, researchers, loans]
    );

    return (
        <>
            <ambientLight intensity={0.65} />
            <directionalLight position={[6, 12, 6]} intensity={1} />
            <pointLight position={[-8, 8, -6]} intensity={0.35} />

            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
                <planeGeometry args={[18, 14]} />
                <meshStandardMaterial color={floorColor} />
            </mesh>

            <group position={[0, 2.35, 2.6]}>
                <Box args={[11.2, 5.8, 0.2]}>
                    <meshStandardMaterial color={panelColor} />
                </Box>
                <Box args={[11.4, 6, 0.04]} position={[0, 0, -0.12]}>
                    <meshStandardMaterial color={panelBorder} />
                </Box>

                <Box args={[11, 0.7, 0.22]} position={[0, 2.5, 0.01]}>
                    <meshStandardMaterial color={panelHeader} />
                </Box>
                <Text
                    position={[-4.2, 2.5, 0.13]}
                    fontSize={0.24}
                    color={labelColor}
                    anchorX="left"
                    anchorY="middle"
                >
                    Plataforma TechLab
                </Text>
                <Text
                    position={[4.1, 2.5, 0.13]}
                    fontSize={0.18}
                    color={labelColor}
                    anchorX="right"
                    anchorY="middle"
                >
                    Sesiones: {activeSessions}
                </Text>

                <Box args={[2.8, 1.2, 0.18]} position={[-3.8, 0.9, 0.06]}>
                    <meshStandardMaterial color="#3b82f6" />
                </Box>
                <Box args={[2.8, 1.2, 0.18]} position={[0, 0.9, 0.06]}>
                    <meshStandardMaterial color="#22c55e" />
                </Box>
                <Box args={[2.8, 1.2, 0.18]} position={[3.8, 0.9, 0.06]}>
                    <meshStandardMaterial color="#f59e0b" />
                </Box>

                <Text
                    position={[-3.8, 1.05, 0.2]}
                    fontSize={0.17}
                    color="#ffffff"
                    anchorX="center"
                    anchorY="middle"
                >
                    Proyectos {projects}
                </Text>
                <Text
                    position={[0, 1.05, 0.2]}
                    fontSize={0.17}
                    color="#ffffff"
                    anchorX="center"
                    anchorY="middle"
                >
                    Investigadores {researchers}
                </Text>
                <Text
                    position={[3.8, 1.05, 0.2]}
                    fontSize={0.17}
                    color="#ffffff"
                    anchorX="center"
                    anchorY="middle"
                >
                    Préstamos {loans}
                </Text>

                {[0, 1, 2, 3].map((index) => (
                    <Box
                        key={`row-${index}`}
                        args={[9.8, 0.42, 0.14]}
                        position={[0, -0.4 - index * 0.62, 0.05]}
                    >
                        <meshStandardMaterial
                            color={theme === 'dark' ? '#273449' : '#e2e8f0'}
                        />
                    </Box>
                ))}

                <Text
                    position={[-4.5, -0.4, 0.16]}
                    fontSize={0.14}
                    color={labelColor}
                    anchorX="left"
                    anchorY="middle"
                >
                    Dashboard / Módulos / Actividad reciente
                </Text>
            </group>

            {windows.map((windowPanel) => (
                <group
                    key={windowPanel.title}
                    position={windowPanel.position}
                    rotation={windowPanel.rotation}
                >
                    <Box args={[3.6, 2.2, 0.14]}>
                        <meshStandardMaterial color={panelColor} />
                    </Box>
                    <Box args={[3.7, 2.3, 0.04]} position={[0, 0, -0.08]}>
                        <meshStandardMaterial color={panelBorder} />
                    </Box>
                    <Box args={[3.45, 0.42, 0.16]} position={[0, 0.85, 0.01]}>
                        <meshStandardMaterial color={panelHeader} />
                    </Box>
                    <Text
                        position={[0, 0.85, 0.1]}
                        fontSize={0.14}
                        color={labelColor}
                        anchorX="center"
                        anchorY="middle"
                    >
                        {windowPanel.title}
                    </Text>

                    <Box args={[3.2, 0.5, 0.16]} position={[0, 0.15, 0.01]}>
                        <meshStandardMaterial color={windowPanel.color} />
                    </Box>
                    <Text
                        position={[0, 0.15, 0.11]}
                        fontSize={0.2}
                        color="#ffffff"
                        anchorX="center"
                        anchorY="middle"
                    >
                        {windowPanel.value}
                    </Text>

                    <Box args={[3.1, 0.28, 0.1]} position={[0, -0.4, 0.01]}>
                        <meshStandardMaterial
                            color={theme === 'dark' ? '#334155' : '#dbeafe'}
                        />
                    </Box>
                    <Text
                        position={[0, -0.4, 0.08]}
                        fontSize={0.12}
                        color={labelColor}
                        anchorX="center"
                        anchorY="middle"
                    >
                        Módulo activo
                    </Text>
                </group>
            ))}

            {[[-2.4, 0.2], [0, 0], [2.4, 0.2]].map(([x, z], index) => (
                <Box
                    key={`desk-${index}`}
                    args={[2.1, 0.18, 1.2]}
                    position={[x, 0.35, z]}
                >
                    <meshStandardMaterial
                        color={theme === 'dark' ? '#475569' : '#94a3b8'}
                    />
                </Box>
            ))}

            <Text
                position={[0, 5.35, 2.6]}
                fontSize={0.24}
                color={labelColor}
                anchorX="center"
                anchorY="middle"
            >
                Demo 3D · Plataforma Web TechLab
            </Text>

            <OrbitControls
                enablePan
                enableZoom
                enableRotate
                minDistance={7}
                maxDistance={24}
                maxPolarAngle={Math.PI / 2.1}
            />
        </>
    );
}

function MetricCard({
    icon,
    label,
    value,
}: {
    icon: ReactNode;
    label: string;
    value: number;
}) {
    return (
        <div className="rounded-lg border border-theme-border bg-theme-card p-3">
            <div className="flex items-center gap-2 text-theme-secondary text-xs">
                {icon} {label}
            </div>
            <div className="mt-1 text-2xl font-bold text-theme-text">{value}</div>
        </div>
    );
}
