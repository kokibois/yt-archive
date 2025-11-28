import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

const PLAYLIST_ID = "PL4fGSI1pDJn4-UIb6RKHdxam-oAUULIGB";

export async function GET() {
  const now = new Date();
  const monthDate = new Date(now.getFullYear(), now.getMonth(), 1); // 月初

  const playlistRes = await fetch(
    `https://www.googleapis.com/youtube/v3/playlistItems?` +
      new URLSearchParams({
        part: "snippet",
        playlistId: PLAYLIST_ID,
        maxResults: "50",
        key: process.env.YT_API_KEY!,
      })
  );

  const data = await playlistRes.json();
  const items = data.items || [];

  for (const item of items) {
    const snip = item.snippet;

    await sql`
      INSERT INTO playlist_archive (
        video_id, title, thumbnail_url, video_url, archived_month
      ) VALUES (
        ${snip.resourceId.videoId},
        ${snip.title},
        ${snip.thumbnails?.high?.url || ""},
        ${`https://youtu.be/${snip.resourceId.videoId}`},
        ${monthDate}
      )
    `;
  }

  return NextResponse.json({ ok: true });
}
