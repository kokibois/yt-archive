'use client';

import { useState, useEffect } from 'react';

interface VideoItem {
  videoId: string;
  title: string;
  thumbnail: string;
  url: string;
  position: number;
  publishedAt: string;
}

interface Archive {
  id: string;
  date: string;
  playlistId: string;
  playlistTitle: string;
  totalCount: number;
  videos: VideoItem[];
  createdAt: string;
}

export default function Home() {
  const [archives, setArchives] = useState<Archive[]>([]);
  const [selectedArchive, setSelectedArchive] = useState<Archive | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [triggerLoading, setTriggerLoading] = useState(false);

  useEffect(() => {
    fetchArchives();
  }, []);

  const fetchArchives = async () => {
    try {
      const response = await fetch('/api/archives');
      if (!response.ok) throw new Error('Failed to fetch archives');
      const data = await response.json();
      setArchives(data);
      if (data.length > 0) {
        setSelectedArchive(data[0]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const triggerArchive = async () => {
    setTriggerLoading(true);
    try {
      const response = await fetch('/api/cron');
      const data = await response.json();
      if (data.success) {
        alert(`アーカイブ完了: ${data.videoCount}件の動画を保存しました`);
        fetchArchives();
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      alert('エラー: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setTriggerLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen p-4 md:p-8 bg-gray-900 text-white">
      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-red-500 mb-2">
          🎵 YouTube Music Archive
        </h1>
        <p className="text-gray-400">
          トップ音楽プレイリストの月次アーカイブ
        </p>
        <button
          onClick={triggerArchive}
          disabled={triggerLoading}
          className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 
                   rounded-lg transition-colors flex items-center gap-2"
        >
          {triggerLoading ? (
            <>
              <span className="animate-spin">⏳</span>
              アーカイブ中...
            </>
          ) : (
            <>📥 今すぐアーカイブ</>
          )}
        </button>
      </header>

      {error && (
        <div className="bg-red-900/50 border border-red-500 rounded-lg p-4 mb-8">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {archives.length > 0 && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-400 mb-2">
            アーカイブを選択
          </label>
          <select
            value={selectedArchive?.id || ''}
            onChange={(e) => {
              const archive = archives.find((a) => a.id === e.target.value);
              setSelectedArchive(archive || null);
            }}
            className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 
                     text-white focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            {archives.map((archive) => (
              <option key={archive.id} value={archive.id}>
                {archive.id} ({archive.totalCount}件)
              </option>
            ))}
          </select>
        </div>
      )}

      {selectedArchive && (
        <div className="bg-gray-800/50 rounded-lg p-4 mb-6">
          <h2 className="text-xl font-semibold mb-2">{selectedArchive.playlistTitle}</h2>
          <div className="text-sm text-gray-400 space-y-1">
            <p>📅 アーカイブ日: {selectedArchive.date}</p>
            <p>🎬 動画数: {selectedArchive.totalCount}件</p>
          </div>
        </div>
      )}

      {selectedArchive && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {selectedArchive.videos.map((video) => (
            <a
              key={video.videoId}
              href={video.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-gray-800/50 rounded-lg overflow-hidden hover:bg-gray-700/50 
                       transition-all hover:scale-105"
            >
              <div className="relative aspect-video">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute top-2 left-2 bg-black/70 px-2 py-1 rounded text-xs">
                  #{video.position}
                </div>
              </div>
              <div className="p-3">
                <h3 className="font-medium text-sm line-clamp-2 group-hover:text-red-400">
                  {video.title}
                </h3>
              </div>
            </a>
          ))}
        </div>
      )}

      {archives.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">
            アーカイブがありません。「今すぐアーカイブ」ボタンをクリックしてください。
          </p>
        </div>
      )}
    </main>
  );
}
