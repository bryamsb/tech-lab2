import { NextResponse } from 'next/server';
import { Pool, type PoolClient } from 'pg';
import dns from 'node:dns/promises';

const {
  SMARTPARKING_DB_HOST,
  SMARTPARKING_DB_PORT = '5432',
  SMARTPARKING_DB_NAME,
  SMARTPARKING_DB_USER,
  SMARTPARKING_DB_PASSWORD,
  SMARTPARKING_DB_SSL,
  SMARTPARKING_MOCK,
} = process.env;

const missingEnv = [
  SMARTPARKING_DB_HOST,
  SMARTPARKING_DB_NAME,
  SMARTPARKING_DB_USER,
  SMARTPARKING_DB_PASSWORD,
].some((v) => !v);

if (missingEnv) {
  console.warn('Smart Parking DB env vars are missing. API will return 500.');
}

const pool = missingEnv
  ? null
  : new Pool({
      host: SMARTPARKING_DB_HOST,
      port: Number(SMARTPARKING_DB_PORT),
      user: SMARTPARKING_DB_USER,
      password: SMARTPARKING_DB_PASSWORD,
      database: SMARTPARKING_DB_NAME,
      ssl: SMARTPARKING_DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
    });

if (!missingEnv) {
  console.log('[SmartParking] Pool config:', {
    host: SMARTPARKING_DB_HOST,
    port: SMARTPARKING_DB_PORT,
    database: SMARTPARKING_DB_NAME,
    user: SMARTPARKING_DB_USER,
    ssl: SMARTPARKING_DB_SSL,
    env: process.env.NODE_ENV,
  });
}

const parsePgArray = (value: unknown): string[] => {
  if (Array.isArray(value)) return value.map((v) => String(v));
  if (value === null || value === undefined) return [];
  const raw = String(value).trim();
  const trimmed = raw.startsWith('{') && raw.endsWith('}') ? raw.slice(1, -1) : raw;
  if (!trimmed) return [];
  return trimmed
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
};

const parseSpotStates = (value: unknown, length: number): boolean[] => {
  if (value === null || value === undefined) return Array(length).fill(false);
  const raw = String(value).replace(/[{}\s]/g, '');
  const tokens = raw.includes(',') ? raw.split(',') : raw.split('');
  const states = tokens.map((t) => t === '1' || t.toLowerCase() === 't' || t.toLowerCase() === 'true');
  if (states.length < length) {
    return [...states, ...Array(length - states.length).fill(false)];
  }
  return states.slice(0, length);
};

type SpotRow = {
  cam_id: string;
  ts: string;
  spots_state: unknown;
  spot_ids: unknown;
  layout?: unknown;
};

type Area = {
  cameraId: string;
  timestamp: string;
  spots: Array<{ id: string; occupied: boolean; index: number }>;
  layout: [number, number];
  spotIds: string[];
  peopleCount: number | null;
};

const buildAreaData = (spotRow: SpotRow, peopleCount: number | null): Area => {
  const spotIds = parsePgArray(spotRow.spot_ids);
  const layout: [number, number] = [1, 4]; // Force 1x4 layout

  const states = parseSpotStates(spotRow.spots_state, spotIds.length || 4);
  const spots = (spotIds.length ? spotIds : states.map((_, idx) => `S${idx + 1}`)).map((id, idx) => ({
    id,
    occupied: !!states[idx],
    index: idx,
  }));

  return {
    cameraId: spotRow.cam_id,
    timestamp: spotRow.ts,
    spots,
    layout,
    spotIds,
    peopleCount,
  };
};

const ensureBothCameras = (areas: Area[], peopleCount: number | null): Area[] => {
  const desiredOrder = ['smart_parking:A1', 'smart_parking:A2'];
  const existing = new Set(areas.map((a) => a.cameraId));

  desiredOrder.forEach((camId) => {
    if (!existing.has(camId)) {
      const now = new Date().toISOString();
      const spotIds = ['S1', 'S2', 'S3', 'S4'];
      areas.push({
        cameraId: camId,
        timestamp: now,
        spots: spotIds.map((id, idx) => ({ id, occupied: false, index: idx })),
        layout: [1, 4],
        spotIds,
        peopleCount,
      });
    }
  });

  // return in A1, A2 order
  return areas.sort((a, b) => desiredOrder.indexOf(a.cameraId) - desiredOrder.indexOf(b.cameraId));
};

const respondMock = (camId: string, counterCamId: string, reason: string) => {
  const now = new Date();
  const layout: [number, number] = [1, 4];

  const buildMockArea = (cameraId: string, occupiedPattern: number[]): Area => {
    const spotIds = ['S1', 'S2', 'S3', 'S4'];
    const spots = spotIds.map((id, idx) => ({
      id,
      occupied: occupiedPattern[idx] === 1,
      index: idx,
    }));

    return {
      cameraId,
      timestamp: now.toISOString(),
      spots,
      layout,
      spotIds,
      peopleCount: 17,
    };
  };

  const areas = [
    buildMockArea('smart_parking:A1', [0, 1, 0, 1]),
    buildMockArea('smart_parking:A2', [0, 0, 1, 0]),
  ];

  console.log(`[SmartParking][MOCK] Respondiendo datos simulados (${reason})`);
  return NextResponse.json(
    {
      areas,
      peopleCount: 17,
      counter: { camId: counterCamId, timestamp: now.toISOString() },
      mock: true,
      reason,
    },
    { headers: { 'Cache-Control': 'no-store' } }
  );
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const camId = searchParams.get('camId') ?? 'smart_parking:A1';
  const counterCamId = searchParams.get('counterCamId') ?? 'cuenta_personas:A1';

  // Modo mock para pruebas locales sin DB
  if (SMARTPARKING_MOCK === 'true') {
    return respondMock(camId, counterCamId, 'env-mock-enabled');
  }

  // Verificar horario de disponibilidad de DB (8:00 AM - 10:00 PM)
  const now = new Date();
  const hour = now.getHours();
  const isOutOfBusinessHours = hour < 8 || hour >= 22; // Antes de 8 AM o desde las 10 PM

  if (isOutOfBusinessHours) {
    console.warn(`[SmartParking] DB fuera de horario (${hour}:00). Usando mock data.`);
    return respondMock(camId, counterCamId, `fallback-mock-out-of-hours-${hour}`);
  }

  if (!pool) {
    return NextResponse.json({ error: 'Smart Parking DB env vars missing' }, { status: 500 });
  }

  let client: PoolClient | null = null;
  try {
    console.log('[SmartParking] Intentando conectar a DB...');
    console.log('[SmartParking] Detalles de conexión:', {
      host: SMARTPARKING_DB_HOST,
      port: SMARTPARKING_DB_PORT,
      database: SMARTPARKING_DB_NAME,
      user: SMARTPARKING_DB_USER,
    });
    client = await pool.connect();
    console.log('[SmartParking] ✅ Conexión a DB exitosa');
  } catch (connErr: unknown) {
    console.error('[SmartParking] ❌ DB connection error:', connErr);
    console.error('[SmartParking] Error completo:', JSON.stringify(connErr, null, 2));
    console.error('[SmartParking] Tipo de error:', connErr instanceof Error ? connErr.constructor.name : typeof connErr);
    if (connErr instanceof Error) {
      console.error('[SmartParking] Stack:', connErr.stack);
    }

    const code =
      typeof connErr === 'object' && connErr && 'code' in connErr && connErr.code
        ? String((connErr as { code: unknown }).code)
        : 'CONNECTION_ERROR';

    const hostname =
      typeof connErr === 'object' && connErr && 'hostname' in connErr && connErr.hostname
        ? String((connErr as { hostname: unknown }).hostname)
        : SMARTPARKING_DB_HOST;

    // Usar mock si la DB no está disponible (probablemente por mantenimiento/apagado)
    if (code === 'ENOTFOUND' || code === 'ECONNREFUSED' || code === '28P01') {
      console.warn(
        `[SmartParking] DB no disponible (${code}). Usando mock data como fallback.`
      );
      return respondMock(camId, counterCamId, `fallback-mock-${code}`);
    }

    let dnsInfo: { ok: boolean; addresses?: string[]; error?: string } = { ok: false };
    try {
      const res4 = await dns.lookup(String(hostname), { all: true, family: 4 });
      const res6 = await dns.lookup(String(hostname), { all: true, family: 6 });
      const addresses = [...(res4 || []).map((a) => a.address), ...(res6 || []).map((a) => a.address)];
      dnsInfo = { ok: addresses.length > 0, addresses };
    } catch (dnsErr: unknown) {
      const dnsCode =
        typeof dnsErr === 'object' && dnsErr && 'code' in dnsErr && dnsErr.code
          ? String((dnsErr as { code: unknown }).code)
          : undefined;
      const dnsMessage =
        typeof dnsErr === 'object' && dnsErr && 'message' in dnsErr && dnsErr.message
          ? String((dnsErr as { message: unknown }).message)
          : undefined;
      dnsInfo = { ok: false, error: dnsCode || dnsMessage || 'DNS_LOOKUP_FAILED' };
    }

    return NextResponse.json(
      {
        error: 'DB connection error',
        code,
        hostname,
        port: SMARTPARKING_DB_PORT,
        dns: dnsInfo,
        hint: 'Si el host es interno, conecta a la VPN o usa la IP en SMARTPARKING_DB_HOST, o agrega una entrada en /etc/hosts.'
      },
      { status: 502 }
    );
  }

  try {
    const { rows: spotRows } = await client.query(
      'SELECT * FROM sp_registros WHERE cam_id IN ($1, $2) ORDER BY ts DESC',
      ['smart_parking:A1', 'smart_parking:A2']
    );

    if (spotRows.length === 0) {
      return NextResponse.json({ error: 'No data for cameras' }, { status: 404 });
    }

    // Group by camera and keep latest
    const byCamera = new Map();
    spotRows.forEach((row) => {
      if (!byCamera.has(row.cam_id)) byCamera.set(row.cam_id, row);
    });

    const { rows: peopleRows } = await client.query(
      'SELECT * FROM cupe_registros WHERE cam_id = $1 ORDER BY ts DESC LIMIT 1',
      [counterCamId]
    );

    const peopleCount = peopleRows[0] ? Number(peopleRows[0].aforo) : null;

    const areas = ensureBothCameras(Array.from(byCamera.values()).map((row) => buildAreaData(row, peopleCount)), peopleCount);

    return NextResponse.json(
      {
        areas,
        peopleCount,
      },
      {
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    );
  } catch (err) {
    console.error('Error fetching smart parking data', err);
    return NextResponse.json({ error: 'Error fetching smart parking data' }, { status: 500 });
  } finally {
    client?.release();
  }
}
