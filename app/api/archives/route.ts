import { NextResponse } from 'next/server';
import { getArchives } from '@/lib/storage';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const archives = await getArchives();
    return NextResponse.json(archives);
  } catch (error) {
    console.error('Failed to fetch archives:', error);
    return NextResponse.json(
      { error: 'Failed to fetch archives' },
      { status: 500 }
    );
  }
}
