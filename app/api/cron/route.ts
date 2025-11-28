import { NextRequest, NextResponse } from 'next/server';
import { fetchPlaylistItems, getPlaylistInfo } from '@/lib/youtube';
import { saveArchive } from '@/lib/storage';
import { Archive } from '@/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  // Vercel Cronからのリクエストを検証
  const authHeader = request.headers.get('authorization');
  
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    // 開発環境またはCRON_SECRETが設定されていない場合はスキップ
    if (process.env.NODE_ENV === 'production' && process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  try {
    console.log('Starting archive process...');

    // プレイリスト情報を取得
    const playlistInfo = await getPlaylistInfo();
    console.log('Playlist info:', playlistInfo);

    // 動画リストを取得
    const videos = await fetchPlaylistItems(100);
    console.log(`Fetched ${videos.length} videos`);

    // アーカイブを作成
    const now = new Date();
    const archiveId = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    
    const archive: Archive = {
      id: archiveId,
      date: now.toISOString().split('T')[0],
      playlistId: 'PL4fGSI1pDJn4-UIb6RKHdxam-oAUULIGB',
      playlistTitle: playlistInfo.title,
      totalCount: videos.length,
      videos,
      createdAt: now.toISOString(),
    };

    // 保存
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
