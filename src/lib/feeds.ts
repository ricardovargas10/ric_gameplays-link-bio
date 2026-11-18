import { cacheLife } from "next/cache";
import { TWITCH_LOGIN, YOUTUBE_CHANNEL_ID } from "@/config/canais";

export type LatestVideo = { id: string; title: string; url: string; thumb: string };
export type LiveStream = { title: string; game: string | null; url: string; thumb: string; viewers: number };

function decodeXml(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

/**
 * Último vídeo longo do canal no YouTube (sem Shorts e sem lives).
 * Usa a lista pública "UULF", que o YouTube mantém só com os vídeos longos.
 * Atualiza a cada 15 minutos.
 */
export async function getLatestVideo(): Promise<LatestVideo | null> {
  "use cache";
  cacheLife({ stale: 300, revalidate: 900, expire: 86400 });
  try {
    const list = `UULF${YOUTUBE_CHANNEL_ID.slice(2)}`;
    const res = await fetch(`https://www.youtube.com/feeds/videos.xml?playlist_id=${list}`, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return null;
    const xml = await res.text();
    const entry = xml.split("<entry>")[1];
    if (!entry) return null;
    const id = entry.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)?.[1];
    const title = entry.match(/<title>([^<]+)<\/title>/)?.[1];
    if (!id || !/^[\w-]{6,20}$/.test(id) || !title) return null;
    return {
      id,
      title: decodeXml(title),
      url: `https://www.youtube.com/watch?v=${id}`,
      thumb: `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`,
    };
  } catch {
    return null;
  }
}

/** Chave de acesso da Twitch (dura ~60 dias; guardada por 1 dia). */
async function twitchToken(clientId: string, secret: string): Promise<string | null> {
  "use cache";
  cacheLife({ stale: 3600, revalidate: 86400, expire: 86400 * 7 });
  const res = await fetch("https://id.twitch.tv/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ client_id: clientId, client_secret: secret, grant_type: "client_credentials" }),
    signal: AbortSignal.timeout(5000),
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { access_token?: string };
  return data.access_token ?? null;
}

export function twitchConfigured(): boolean {
  return !!(process.env.TWITCH_CLIENT_ID && process.env.TWITCH_CLIENT_SECRET);
}

/**
 * Live da Twitch, se estiver no ar. Precisa de TWITCH_CLIENT_ID e TWITCH_CLIENT_SECRET na Vercel.
 * Confere a cada 1 minuto.
 */
export async function getLiveStream(): Promise<LiveStream | null> {
  "use cache";
  cacheLife({ stale: 30, revalidate: 60, expire: 600 });
  const clientId = process.env.TWITCH_CLIENT_ID;
  const secret = process.env.TWITCH_CLIENT_SECRET;
  if (!clientId || !secret) return null;
  try {
    const token = await twitchToken(clientId, secret);
    if (!token) return null;
    const res = await fetch(`https://api.twitch.tv/helix/streams?user_login=${encodeURIComponent(TWITCH_LOGIN)}`, {
      headers: { "Client-Id": clientId, Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      data?: { type?: string; title?: string; game_name?: string; thumbnail_url?: string; viewer_count?: number; started_at?: string }[];
    };
    const s = data.data?.[0];
    if (!s || s.type !== "live") return null;
    // A imagem da live muda a cada poucos minutos; o "?t=" evita a versão antiga guardada.
    const stamp = Math.floor(Date.now() / 300000);
    return {
      title: s.title?.trim() || "Ao vivo agora",
      game: s.game_name?.trim() || null,
      url: `https://www.twitch.tv/${TWITCH_LOGIN}`,
      thumb: `${(s.thumbnail_url ?? "").replace("{width}", "1280").replace("{height}", "720")}?t=${stamp}`,
      viewers: s.viewer_count ?? 0,
    };
  } catch {
    return null;
  }
}
