'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Box, Sphere } from '@react-three/drei';
import { Suspense, useMemo, useState } from 'react';
import { Blocks, Zap, Wallet, ShieldCheck, RotateCcw } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

type Tx = {
    from: string;
    to: string;
    amount: number;
    timestamp: string;
};

type ChainBlock = {
    index: number;
    timestamp: string;
    prevHash: string;
    hash: string;
    nonce: number;
    txCount: number;
};

const participants = ['Nodo-A', 'Nodo-B', 'Nodo-C', 'Nodo-D'];

function formatNow() {
    return new Date().toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });
}

function shortHash(value: string) {
    let hash = 0;
    for (let index = 0; index < value.length; index++) {
        hash = (hash << 5) - hash + value.charCodeAt(index);
        hash |= 0;
    }
    const positive = Math.abs(hash).toString(16).padStart(8, '0');
    return `0x${positive}${positive}`;
}

function mineHash(seed: string) {
    let nonce = 0;
    let hash = shortHash(`${seed}-${nonce}`);
    while (!hash.startsWith('0x00') && nonce < 20000) {
        nonce += 1;
        hash = shortHash(`${seed}-${nonce}`);
    }
    return { nonce, hash };
}

const genesisHash = shortHash('genesis-block');

const initialChain: ChainBlock[] = [
    {
        index: 0,
        timestamp: formatNow(),
        prevHash: '0x0000000000000000',
        hash: genesisHash,
        nonce: 0,
        txCount: 1,
    },
];

const initialPendingTx: Tx[] = [
    {
        from: 'Nodo-A',
        to: 'Nodo-C',
        amount: 1.5,
        timestamp: formatNow(),
    },
    {
        from: 'Nodo-B',
        to: 'Nodo-D',
        amount: 0.75,
        timestamp: formatNow(),
    },
];

export default function BlockchainViewer() {
    const { theme } = useTheme();

    const [pendingTx, setPendingTx] = useState<Tx[]>(initialPendingTx);

    const [chain, setChain] = useState<ChainBlock[]>(initialChain);

    const addTransaction = () => {
        const from = participants[Math.floor(Math.random() * participants.length)];
        let to = participants[Math.floor(Math.random() * participants.length)];

        while (to === from) {
            to = participants[Math.floor(Math.random() * participants.length)];
        }

        const amount = Number((Math.random() * 2 + 0.1).toFixed(2));

        setPendingTx((previous) => [
            ...previous,
            {
                from,
                to,
                amount,
                timestamp: formatNow(),
            },
        ]);
    };

    const mineBlock = () => {
        if (pendingTx.length === 0) {
            addTransaction();
            return;
        }

        const lastBlock = chain[chain.length - 1];
        const seed = `${lastBlock.hash}-${pendingTx
            .map((tx) => `${tx.from}${tx.to}${tx.amount}`)
            .join('|')}-${Date.now()}`;
        const mined = mineHash(seed);

        setChain((previous) => [
            ...previous,
            {
                index: previous.length,
                timestamp: formatNow(),
                prevHash: lastBlock.hash,
                hash: mined.hash,
                nonce: mined.nonce,
                txCount: pendingTx.length,
            },
        ]);

        setPendingTx([]);
    };

    const stats = useMemo(() => {
        const totalTransactions = chain.reduce((sum, block) => sum + block.txCount, 0);
        return {
            blocks: chain.length,
            pending: pendingTx.length,
            totalTransactions,
            avgTxPerBlock:
                chain.length > 0 ? (totalTransactions / chain.length).toFixed(2) : '0.00',
        };
    }, [chain, pendingTx]);

    const resetSimulation = () => {
        setChain([
            {
                ...initialChain[0],
                timestamp: formatNow(),
            },
        ]);
        setPendingTx(
            initialPendingTx.map((tx) => ({
                ...tx,
                timestamp: formatNow(),
            }))
        );
    };

    return (
        <div className="space-y-4">
            <div className="rounded-lg border border-theme-border bg-theme-card overflow-hidden">
                <div className="px-4 py-3 border-b border-theme-border flex items-center justify-between">
                    <h4 className="font-semibold text-theme-text">Simulación 3D de Blockchain</h4>
                    <span className="text-xs text-theme-secondary">Arrastra para rotar • Scroll para zoom</span>
                </div>
                <div className="h-[300px] sm:h-[340px]">
                    <Canvas camera={{ position: [7, 6, 11], fov: 50 }}>
                        <Suspense fallback={null}>
                            <BlockchainScene3D
                                theme={theme}
                                chain={chain}
                                pendingCount={pendingTx.length}
                            />
                        </Suspense>
                    </Canvas>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-lg border border-theme-border bg-theme-card p-3">
                    <div className="flex items-center gap-2 text-theme-secondary text-sm">
                        <Blocks className="w-4 h-4" /> Bloques
                    </div>
                    <div className="text-2xl font-bold text-theme-text">{stats.blocks}</div>
                </div>
                <div className="rounded-lg border border-theme-border bg-theme-card p-3">
                    <div className="flex items-center gap-2 text-theme-secondary text-sm">
                        <Wallet className="w-4 h-4" /> Pendientes
                    </div>
                    <div className="text-2xl font-bold text-theme-text">{stats.pending}</div>
                </div>
                <div className="rounded-lg border border-theme-border bg-theme-card p-3">
                    <div className="flex items-center gap-2 text-theme-secondary text-sm">
                        <ShieldCheck className="w-4 h-4" /> Tx procesadas
                    </div>
                    <div className="text-2xl font-bold text-theme-text">{stats.totalTransactions}</div>
                    <div className="text-xs text-theme-secondary mt-1">Promedio por bloque: {stats.avgTxPerBlock}</div>
                </div>
            </div>

            <div className="flex flex-wrap gap-2">
                <button
                    onClick={addTransaction}
                    className="px-3 py-2 rounded-lg border border-theme-border text-theme-text hover:bg-theme-accent/10 transition-colors"
                >
                    Generar transacción
                </button>
                <button
                    onClick={mineBlock}
                    className="px-3 py-2 rounded-lg bg-theme-accent/20 border border-theme-accent/40 text-theme-text hover:bg-theme-accent/30 transition-colors inline-flex items-center gap-2"
                >
                    <Zap className="w-4 h-4" /> Minar bloque
                </button>
                <button
                    onClick={resetSimulation}
                    className="px-3 py-2 rounded-lg border border-theme-border text-theme-text hover:bg-theme-accent/10 transition-colors inline-flex items-center gap-2"
                >
                    <RotateCcw className="w-4 h-4" /> Reiniciar demo
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="rounded-lg border border-theme-border bg-theme-card p-3">
                    <h4 className="font-semibold text-theme-text mb-2">Mempool</h4>
                    {pendingTx.length === 0 ? (
                        <p className="text-sm text-theme-secondary">Sin transacciones pendientes.</p>
                    ) : (
                        <ul className="space-y-2 max-h-48 overflow-y-auto pr-1">
                            {pendingTx.map((tx, index) => (
                                <li
                                    key={`${tx.timestamp}-${index}`}
                                    className="text-sm text-theme-text border border-theme-border rounded-md p-2 bg-theme-background/50"
                                >
                                    {tx.from} → {tx.to} · {tx.amount} ETH
                                    <div className="text-xs text-theme-secondary">{tx.timestamp}</div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="rounded-lg border border-theme-border bg-theme-card p-3">
                    <h4 className="font-semibold text-theme-text mb-2">Cadena de bloques</h4>
                    <ul className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {[...chain].reverse().map((block) => (
                            <li
                                key={block.hash}
                                className="text-sm border border-theme-border rounded-md p-2 bg-theme-background/50"
                            >
                                <div className="font-medium text-theme-text">Bloque #{block.index}</div>
                                <div className="text-xs text-theme-secondary">Hash: {block.hash}</div>
                                <div className="text-xs text-theme-secondary">Prev: {block.prevHash}</div>
                                <div className="text-xs text-theme-secondary">
                                    Nonce: {block.nonce} · Tx: {block.txCount} · {block.timestamp}
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}

function BlockchainScene3D({
    theme,
    chain,
    pendingCount,
}: {
    theme: 'light' | 'dark';
    chain: ChainBlock[];
    pendingCount: number;
}) {
    const floor = theme === 'dark' ? '#0f172a' : '#e2e8f0';
    const labelColor = theme === 'dark' ? '#e2e8f0' : '#0f172a';

    const displayedChain = useMemo(() => chain.slice(-6), [chain]);
    const validatorNodes = useMemo(
        () =>
            participants.map((node, index) => {
                const angle = (index / participants.length) * Math.PI * 2;
                return {
                    name: node,
                    x: -7 + Math.cos(angle) * 1.7,
                    z: 2 + Math.sin(angle) * 1.7,
                };
            }),
        []
    );

    return (
        <>
            <ambientLight intensity={0.65} />
            <directionalLight position={[8, 10, 6]} intensity={1} />
            <pointLight position={[-8, 6, -4]} intensity={0.4} />

            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
                <planeGeometry args={[18, 10]} />
                <meshStandardMaterial color={floor} />
            </mesh>

            <Text
                position={[0, 3.8, -2.8]}
                fontSize={0.35}
                color={labelColor}
                anchorX="center"
                anchorY="middle"
            >
                Cadena de Bloques · PoA (Clique)
            </Text>

            <Text
                position={[0, 3.35, -2.8]}
                fontSize={0.16}
                color={labelColor}
                anchorX="center"
                anchorY="middle"
            >
                Último bloque resaltado · Nodos validadores a la izquierda
            </Text>

            {validatorNodes.map((node) => (
                <group key={node.name} position={[node.x, 0, node.z]}>
                    <Sphere args={[0.28, 18, 18]} position={[0, 0.45, 0]}>
                        <meshStandardMaterial color={theme === 'dark' ? '#34d399' : '#059669'} />
                    </Sphere>
                    <Text
                        position={[0, 0.9, 0]}
                        fontSize={0.12}
                        color={labelColor}
                        anchorX="center"
                        anchorY="middle"
                    >
                        {node.name}
                    </Text>
                    <Box args={[1.2, 0.04, 0.04]} position={[1.05, 0.4, -0.6]}>
                        <meshStandardMaterial color={theme === 'dark' ? '#6ee7b7' : '#10b981'} />
                    </Box>
                </group>
            ))}

            {displayedChain.map((block, index) => {
                const x = -6 + index * 2.4;
                const height = Math.max(0.8, 0.8 + block.txCount * 0.25);
                const isLatest = index === displayedChain.length - 1;
                const color = block.index === 0 ? '#6366f1' : isLatest ? '#22c55e' : '#3b82f6';

                return (
                    <group key={block.hash} position={[x, 0, 0]}>
                        <Box args={[1.6, height, 1.2]} position={[0, height / 2, 0]}>
                            <meshStandardMaterial color={color} metalness={0.2} roughness={0.4} />
                        </Box>

                        <Text
                            position={[0, height + 0.35, 0]}
                            fontSize={0.2}
                            color={labelColor}
                            anchorX="center"
                            anchorY="middle"
                        >
                            {isLatest ? `#${block.index} ✓` : `#${block.index}`}
                        </Text>

                        <Text
                            position={[0, 0.18, 0.7]}
                            fontSize={0.12}
                            color="#ffffff"
                            anchorX="center"
                            anchorY="middle"
                        >
                            {`Tx ${block.txCount}`}
                        </Text>

                        <Text
                            position={[0, -0.15, 0.72]}
                            fontSize={0.1}
                            color="#dbeafe"
                            anchorX="center"
                            anchorY="middle"
                        >
                            {block.hash.slice(0, 8)}
                        </Text>

                        {index > 0 && (
                            <Box args={[0.9, 0.08, 0.08]} position={[-1.25, 0.5, 0]}>
                                <meshStandardMaterial color={theme === 'dark' ? '#94a3b8' : '#64748b'} />
                            </Box>
                        )}
                    </group>
                );
            })}

            {Array.from({ length: Math.min(10, pendingCount) }, (_, index) => {
                const radius = 1.2;
                const angle = (index / Math.max(1, pendingCount)) * Math.PI * 2;
                const x = 6 + Math.cos(angle) * radius;
                const z = 2.3 + Math.sin(angle) * radius;
                return (
                    <Sphere key={`pending-${index}`} args={[0.16, 16, 16]} position={[x, 0.35, z]}>
                        <meshStandardMaterial color="#f59e0b" />
                    </Sphere>
                );
            })}

            <Text
                position={[6, 1.15, 2.3]}
                fontSize={0.18}
                color={labelColor}
                anchorX="center"
                anchorY="middle"
            >
                {pendingCount > 0 ? `Mempool (${pendingCount})` : 'Mempool vacío'}
            </Text>

            <OrbitControls
                enablePan
                enableZoom
                enableRotate
                minDistance={6}
                maxDistance={20}
                maxPolarAngle={Math.PI / 2.1}
            />
        </>
    );
}
