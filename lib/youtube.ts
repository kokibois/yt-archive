import { VideoItem } from './storage';

const PLAYLIST_ID = 'PL4fGSI1pDJn4-UIb6RKHdxam-oAUULIGB';

interface YouTubePlaylistResponse {
  items: {
    snippet: {
      title: string;
      position: number;
      publishedAt: string;
      resourceId: {
        videoId: string;
      };
      thumbnails: {
        high?: { url: string };
        medium?: { url: string };
        default?: { url: string };
      };
    };
  }[];
  nextPageToken?: string;
  pageInfo: {
    totalResults: number;
  };
}

export async function fetchPlaylistItems(maxResults: number = 100): Promise<VideoItem[]> {
  const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
  
  if (!YOUTUBE_API_KEY) {
    throw new Error('YOUTUBE_API_KEY is not set');
  }

  const videos: VideoItem[] = [];
  let nextPageToken: string | undefined;

  do {
    const url = new URL('https://www.googleapis.com/youtube/v3/playlistItems');
    url.searchParams.append('part', 'snippet');
    url.searchParams.append('playlistId', PLAYLIST_ID);
    url.searchParams.append('maxResults', '50');
    url.searchParams.append('key', YOUTUBE_API_KEY);
    
    if (nextPageToken) {
      url.searchParams.append('pageToken', nextPageToken);
    }

    const response = await fetch(url.toString(), {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`YouTube API Error: ${response.status} - ${error}`);
    }

    const data: YouTubePlaylistResponse = await response.json();

    for (const item of data.items) {
      const videoId = item.snippet.resourceId.videoId;
      const thumbnail = 
        item.snippet.thumbnails.high?.url ||
        item.snippet.thumbnails.medium?.url ||
        item.snippet.thumbnails.default?.url ||
        '';

      videos.push({
        videoId,
        title: item.snippet.title,
        thumbnail,
        url: `https://www.youtube.com/watch?v=${videoId}`,
        position: item.snippet.position + 1,
        publishedAt: item.snippet.publishedAt,
      });
    }

    nextPageToken = data.nextPageToken;

    if (videos.length >= maxResults) break;
  } while (nextPageToken);

  return videos.slice(0, maxResults);
}

export async function getPlaylistInfo(): Promise<{ title: string; itemCount: number }> {
  const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
  
  if (!YOUTUBE_API_KEY) {
    throw new Error('YOUTUBE_API_KEY is not set');
  }

  const url = new URL('https://www.googleapis.com/youtube/v3/playlists');
  url.searchParams.append('part', 'snippet,contentDetails');
  url.searchParams.append('id', PLAYLIST_ID);
  url.searchParams.append('key', YOUTUBE_API_KEY);

  const response = await fetch(url.toString());
  
  if (!response.ok) {
    throw new Error(`Failed to fetch playlist info: ${response.status}`);
  }

  const data = await response.json();
  
  return {
    title: data.items[0]?.snippet?.title || 'Unknown Playlist',
    itemCount: data.items[0]?.contentDetails?.itemCount || 0,
  };
}

export { PLAYLIST_ID };
