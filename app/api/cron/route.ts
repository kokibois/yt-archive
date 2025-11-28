import { NextRequest, NextResponse } from 'next/server';
import { fetchPlaylistItems, getPlaylistInfo, PLAYLIST_ID } from '@/lib/youtube';
import { saveArchive, Archive } from '@/lib/storage';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  try {
    console.log('Starting archive process...');

    const playlistInfo = await getPlaylistInfo();
    console.log('Playlist info:', playlistInfo);

    const videos = await fetchPlaylistItems(100);
    console.log(`Fetched ${videos.length} videos`);

    const now = new Date();
    const archiveId = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    
    const archive: Archive = {
      id: archiveId,
      date: now.toISOString().split('T')[0],
      playlistId: PLAYLIST_ID,
      playlistTitle: playlistInfo.title,
      totalCount: videos.length,
      videos,
      createdAt: now.toISOString(),
    };

    const blobUrl = await saveArchive(archive);
    console.log('Archive saved:', blobUrl);

    return NextResponse.json({
      success: true,
      archiveId,
      videoCount: videos.length,
      blobUrl,
    });

  } catch (error) {
    console.error('Archive error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
