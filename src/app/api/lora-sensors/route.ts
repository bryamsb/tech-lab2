import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Función para generar valores realistas de sensores
function generateSensorData() {
    const now = new Date();
    const sensors = ['LORA_001', 'LORA_002', 'LORA_003'];

    // Generar datos históricos (últimas 24 horas, cada 30 minutos = 48 puntos)
    const historicalData: Array<{
        id_sensor: string;
        temperatura: number;
        humedad: number;
        co2: number;
        timestamp: string;
    }> = [];
    const pointsCount = 48;

    for (let i = pointsCount; i >= 0; i--) {
        const timestamp = new Date(now.getTime() - i * 30 * 60 * 1000);

        sensors.forEach(sensorId => {
            // Valores base para cada sensor con variación
            const baseTemp = sensorId === 'LORA_001' ? 22 : sensorId === 'LORA_002' ? 24 : 23;
            const baseHumidity = sensorId === 'LORA_001' ? 55 : sensorId === 'LORA_002' ? 60 : 58;
            const baseCO2 = sensorId === 'LORA_001' ? 450 : sensorId === 'LORA_002' ? 500 : 480;

            // Variación sinusoidal para simular cambios naturales del día
            const hourProgress = (timestamp.getHours() + timestamp.getMinutes() / 60) / 24;
            const dailyVariation = Math.sin(hourProgress * Math.PI * 2);

            // Agregar ruido aleatorio
            const randomNoise = () => (Math.random() - 0.5) * 2;

            historicalData.push({
                id_sensor: sensorId,
                temperatura: parseFloat((baseTemp + dailyVariation * 3 + randomNoise()).toFixed(2)),
                humedad: parseFloat((baseHumidity + dailyVariation * 10 + randomNoise() * 2).toFixed(2)),
                co2: parseFloat((baseCO2 + dailyVariation * 100 + randomNoise() * 20).toFixed(2)),
                timestamp: timestamp.toISOString(),
            });
        });
    }

    // Datos actuales (los más recientes)
    const currentData = sensors.map(sensorId => {
        const latestForSensor = historicalData
            .filter(d => d.id_sensor === sensorId)
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];

        return latestForSensor;
    });

    return {
        current: currentData,
        historical: historicalData,
        timestamp: now.toISOString(),
    };
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const sensorId = searchParams.get('sensor_id');

        const data = generateSensorData();

        // Filtrar por sensor si se especifica
        if (sensorId) {
            const filteredHistorical = data.historical.filter(d => d.id_sensor === sensorId);
            const filteredCurrent = data.current.filter(d => d.id_sensor === sensorId);

            return NextResponse.json({
                current: filteredCurrent,
                historical: filteredHistorical,
                timestamp: data.timestamp,
                mock: true,
                reason: 'Datos simulados para desarrollo',
            }, { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate' } });
        }

        return NextResponse.json({
            current: data.current,
            historical: data.historical,
            timestamp: data.timestamp,
            mock: true,
            reason: 'Datos simulados para desarrollo',
        }, { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate' } });
    } catch (error) {
        console.error('Error en API de sensores LoRa:', error);
        return NextResponse.json(
            {
                error: 'Error al obtener datos de sensores',
                message: error instanceof Error ? error.message : 'Error desconocido',
            },
            { status: 500, headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate' } }
        );
    }
}
