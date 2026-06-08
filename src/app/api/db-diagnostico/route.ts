import { NextResponse } from 'next/server';

export async function GET() {
  const env = {
    SMARTPARKING_DB_HOST: process.env.SMARTPARKING_DB_HOST ? '✓ configurado' : '✗ no configurado',
    SMARTPARKING_DB_PORT: process.env.SMARTPARKING_DB_PORT || '5432',
    SMARTPARKING_DB_NAME: process.env.SMARTPARKING_DB_NAME ? '✓ configurado' : '✗ no configurado',
    SMARTPARKING_DB_USER: process.env.SMARTPARKING_DB_USER ? '✓ configurado' : '✗ no configurado',
    SMARTPARKING_DB_PASSWORD: process.env.SMARTPARKING_DB_PASSWORD ? '✓ configurado' : '✗ no configurado',
    SMARTPARKING_DB_SSL: process.env.SMARTPARKING_DB_SSL || 'no especificado',
    SMARTPARKING_MOCK: process.env.SMARTPARKING_MOCK || 'no especificado',
    NODE_ENV: process.env.NODE_ENV,
  };

  const now = new Date();
  const hour = now.getHours();
  const isOutOfBusinessHours = hour < 8 || hour >= 22;

  return NextResponse.json({
    status: 'Diagnóstico de Conexión',
    timestamp: now.toISOString(),
    hora_actual: `${hour}:${String(now.getMinutes()).padStart(2, '0')}`,
    horario_db: {
      disponible: !isOutOfBusinessHours,
      rango: '8:00 AM - 10:00 PM',
      razon_mock: isOutOfBusinessHours ? `Fuera de horario (${hour}:00)` : 'Dentro de horario',
    },
    variables_entorno: env,
    missingEnv: [
      process.env.SMARTPARKING_DB_HOST,
      process.env.SMARTPARKING_DB_NAME,
      process.env.SMARTPARKING_DB_USER,
      process.env.SMARTPARKING_DB_PASSWORD,
    ].some((v) => !v),
    notas: [
      'Si SMARTPARKING_MOCK=true, siempre devuelve datos mock',
      `Si hora_actual está fuera de 8:00-22:00, devuelve datos mock`,
      'Si hay error de conexión, devuelve datos mock como fallback',
      'La DB está configurada con variables SMARTPARKING_DB_*',
    ],
  });
}
