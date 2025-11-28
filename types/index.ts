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

export interface YouTubePlaylistResponse {
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
