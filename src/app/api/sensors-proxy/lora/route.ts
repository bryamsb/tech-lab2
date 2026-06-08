import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const BACKEND_BASE_URL = 'https://oti-test.jorgeparishuana.dev:4300/caliaire/1102';
const DEFAULT_LIMIT = 24;
const MAX_LIMIT = 200;

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const rawLimit = searchParams.get('limit');
        const parsedLimit = rawLimit ? Number(rawLimit) : DEFAULT_LIMIT;
        const limit = Number.isInteger(parsedLimit) && parsedLimit > 0
            ? Math.min(parsedLimit, MAX_LIMIT)
            : DEFAULT_LIMIT;

        const backendUrl = `${BACKEND_BASE_URL}/${limit}`;

        const response = await fetch(backendUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Backend responded with ${response.status}`);
        }

        const data = await response.json();

        return NextResponse.json(data, {
            headers: { 'Cache-Control': 'no-store, no-cache' },
        });
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to fetch LoRa data', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500, headers: { 'Cache-Control': 'no-store' } }
        );
    }
}
