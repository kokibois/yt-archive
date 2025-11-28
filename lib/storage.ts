import { put, list, del } from '@vercel/blob';

// 型定義
export interface VideoItem {
  videoId: string;
  title: string;
  thumbnail: string;
  url: string;
  position: number;
  publishedAt: string;
}

export interface Archive {
  id: string;
  date: string;
  playlistId: string;
  playlistTitle: string;
  totalCount: number;
  videos: VideoItem[];
  createdAt: string;
}

const BLOB_PREFIX = 'youtube-archives';

export async function saveArchive(archive: Archive): Promise<string> {
  const filename = `${BLOB_PREFIX}/${archive.id}.json`;
  
  const blob = await put(filename, JSON.stringify(archive, null, 2), {
    access: 'public',
    contentType: 'application/json',
  });

  return blob.url;
}

export async function getArchives(): Promise<Archive[]> {
  try {
    const { blobs } = await list({ prefix: BLOB_PREFIX });
    
    const archives: Archive[] = [];
    
    for (const blob of blobs) {
      try {
        const response = await fetch(blob.url);
        const archive: Archive = await response.json();
        archives.push(archive);
      } catch (error) {
        console.error(`Failed to fetch archive: ${blob.url}`, error);
      }
    }

    return archives.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch (error) {
    console.error('Failed to list archives:', error);
    return [];
  }
}

export async function getArchiveById(id: string): Promise<Archive | null> {
  try {
    const { blobs } = await list({ prefix: `${BLOB_PREFIX}/${id}` });
    
    if (blobs.length === 0) return null;
    
    const response = await fetch(blobs[0].url);
    return response.json();
  } catch (error) {
    console.error('Failed to get archive:', error);
    return null;
  }
}

export async function deleteArchive(id: string): Promise<void> {
  const { blobs } = await list({ prefix: `${BLOB_PREFIX}/${id}` });
  
  for (const blob of blobs) {
    await del(blob.url);
  }
}
