import { NextResponse } from 'next/server';
import { Pool, type PoolClient } from 'pg';

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
  console.warn('People Counter DB env vars are missing (using SmartParking DB). API will return 500.');
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
  console.log('[PeopleCounter] Pool config:', {
    host: SMARTPARKING_DB_HOST,
    port: SMARTPARKING_DB_PORT,
    database: SMARTPARKING_DB_NAME,
    user: SMARTPARKING_DB_USER,
    ssl: SMARTPARKING_DB_SSL,
  });
}

interface CounterData {
  camId: string;
  timestamp: string;
  currentCount: number;
  maxCapacity: number;
  trend: 'up' | 'down' | 'stable';
  occupancyPercent: number;
  alert?: string;
}

const respondMock = (camId: string, reason: string) => {
  const now = new Date();
  const mockCount = 17;
  const maxCapacity = 50;
  const occupancyPercent = Math.round((mockCount / maxCapacity) * 100);

  const counterData: CounterData = {
    camId,
    timestamp: now.toISOString(),
    currentCount: mockCount,
    maxCapacity,
    trend: 'stable',
    occupancyPercent,
    alert: occupancyPercent >= 90 ? '¡Alerta! Aforo cerca del límite' : undefined,
  };

  console.log(`[PeopleCounter][MOCK] Respondiendo datos simulados (${reason})`);
  return NextResponse.json(
    {
      counter: counterData,
      mock: true,
      reason,
    },
    { headers: { 'Cache-Control': 'no-store' } }
  );
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const counterCamId = searchParams.get('counterCamId') ?? 'cuenta_personas:A1';

  // Modo mock para pruebas locales sin DB
  if (SMARTPARKING_MOCK === 'true') {
    return respondMock(counterCamId, 'env-mock-enabled');
  }

  // Verificar horario de disponibilidad de DB (8:00 AM - 10:00 PM)
  const now = new Date();
  const hour = now.getHours();
  const isOutOfBusinessHours = hour < 8 || hour >= 22;

  if (isOutOfBusinessHours) {
    console.warn(`[PeopleCounter] DB fuera de horario (${hour}:00). Usando mock data.`);
    return respondMock(counterCamId, `fallback-mock-out-of-hours-${hour}`);
  }

  if (!pool) {
    return NextResponse.json({ error: 'People Counter DB env vars missing' }, { status: 500 });
  }

  let client: PoolClient | null = null;
  try {
    console.log('[PeopleCounter] Intentando conectar a DB...');
    client = await pool.connect();
    console.log('[PeopleCounter] ✅ Conexión a DB exitosa');
  } catch (connErr: unknown) {
    console.error('[PeopleCounter] ❌ DB connection error:', connErr);
    const code =
      typeof connErr === 'object' && connErr && 'code' in connErr && connErr.code
        ? String((connErr as { code: unknown }).code)
        : 'CONNECTION_ERROR';

    if (code === 'ENOTFOUND' || code === 'ECONNREFUSED' || code === '28P01') {
      console.warn(`[PeopleCounter] DB no disponible (${code}). Usando mock data como fallback.`);
      return respondMock(counterCamId, `fallback-mock-${code}`);
    }

    return NextResponse.json(
      {
        error: 'DB connection error',
        code,
        hint: 'Verifica la configuración de la base de datos o usa modo mock.',
      },
      { status: 502 }
    );
  }

  try {
    // Consultar tabla de conteo de personas (cupe_registros)
    const { rows } = await client.query(
      'SELECT * FROM cupe_registros WHERE cam_id = $1 ORDER BY ts DESC LIMIT 1',
      [counterCamId]
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: 'No data for counter camera' }, { status: 404 });
    }

    const row = rows[0];
    const currentCount = Number(row.aforo) || 0;
    const maxCapacity = Number(row.cap_max) || 50; // Capacidad máxima desde DB o default
    const occupancyPercent = Math.round((currentCount / maxCapacity) * 100);

    // Determinar tendencia (simplificado, podrías comparar con registros anteriores)
    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (currentCount > maxCapacity * 0.7) trend = 'up';
    else if (currentCount < maxCapacity * 0.3) trend = 'down';

    const counterData: CounterData = {
      camId: counterCamId,
      timestamp: row.ts,
      currentCount,
      maxCapacity,
      trend,
      occupancyPercent,
      alert:
        occupancyPercent >= 90
          ? '¡Alerta! Aforo cerca del límite máximo'
          : occupancyPercent >= 100
            ? '¡CRÍTICO! Aforo máximo excedido'
            : undefined,
    };

    return NextResponse.json(
      {
        counter: counterData,
        mock: false,
      },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (queryErr: unknown) {
    console.error('[PeopleCounter] Query error:', queryErr);
    return NextResponse.json(
      {
        error: 'Database query error',
        message: queryErr instanceof Error ? queryErr.message : 'Unknown error',
      },
      { status: 500 }
    );
  } finally {
    if (client) client.release();
  }
}
