import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

type LocationPayload = {
    lat?: number;
    lng?: number;
    source?: string;
};

type LocationRow = {
    lat: number;
    lng: number;
    source: string;
    created_at: string;
};

type GlobalWithLocations = typeof globalThis & {
    __techLabMapLocations?: LocationRow[];
};

const runtime = globalThis as GlobalWithLocations;

const getLocationStore = (): LocationRow[] => {
    if (!runtime.__techLabMapLocations) {
        runtime.__techLabMapLocations = [];
    }
    return runtime.__techLabMapLocations;
};

const isValidCoordinate = (lat: number, lng: number) =>
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180;

const formatLocation = (row: LocationRow) => ({
    lat: Number(row.lat),
    lng: Number(row.lng),
    source: String(row.source),
    updatedAt: new Date(row.created_at).toISOString(),
});

export async function POST(request: Request) {
    try {
        const body = (await request.json()) as LocationPayload;
        const lat = Number(body.lat);
        const lng = Number(body.lng);

        if (!isValidCoordinate(lat, lng)) {
            return NextResponse.json(
                { error: 'Invalid coordinates. Expected lat/lng in valid ranges.' },
                { status: 400 }
            );
        }

        const data: LocationRow = {
            lat,
            lng,
            source: body.source ?? 'external-app',
            created_at: new Date().toISOString(),
        };

        const store = getLocationStore();
        store.unshift(data);
        if (store.length > 100) {
            store.length = 100;
        }

        return NextResponse.json(
            { ok: true, location: formatLocation(data as LocationRow) },
            { status: 201, headers: { 'Cache-Control': 'no-store' } }
        );
    } catch (error) {
        console.error('Error saving map location:', error);
        return NextResponse.json(
            {
                error: 'Failed to save location',
                message: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500, headers: { 'Cache-Control': 'no-store' } }
        );
    }
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const rawLimit = Number(searchParams.get('limit') ?? '1');
        const limit = Number.isFinite(rawLimit)
            ? Math.min(Math.max(Math.trunc(rawLimit), 1), 50)
            : 1;

        const data = getLocationStore()
            .slice()
            .sort((a, b) =>
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            )
            .slice(0, limit);

        if (!data || data.length === 0) {
            return NextResponse.json(
                { error: 'No location has been received yet.' },
                { status: 404, headers: { 'Cache-Control': 'no-store' } }
            );
        }

        const locations = (data as LocationRow[]).map(formatLocation);

        return NextResponse.json(
            { location: locations[0], locations },
            { headers: { 'Cache-Control': 'no-store' } }
        );
    } catch (error) {
        console.error('Error reading map location:', error);
        return NextResponse.json(
            {
                error: 'Failed to read location',
                message: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500, headers: { 'Cache-Control': 'no-store' } }
        );
    }
}
