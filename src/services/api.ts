import {
  RadioBossStatus,
  RadioShow,
  SongHistoryItem,
  SongRequestItem,
  ChatMessage,
  RadioBossConfig,
} from '../types/radio';
import { stationHeroCover } from '../assets/images';

// Default Official Zeno FM stream connected to RadioBOSS
export const DEFAULT_ZENO_STREAM_URL = 'https://stream.zeno.fm/f3wvbbqmdg8uv';
export const DEFAULT_ZENO_STATION_URL = 'https://zeno.fm/radio/eklesia-radio';
export const DEFAULT_ZENO_EMBED_URL = 'https://zeno.fm/player/eklesia-radio';

// Flag to track whether Express backend is responding
let backendAvailable: boolean | null = null;

// Default Christian & Inspirational Tracks for Radio-Kristiani
const DEFAULT_TRACKS = [
  {
    artist: 'NDC Worship',
    title: 'Waktu Tuhan',
    album: 'Purify',
    year: '2020',
    duration: 310,
    genre: 'Praise & Worship',
    bpm: 72,
    albumArt: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80',
  },
  {
    artist: 'JPCC Worship',
    title: 'Sampai Akhir Hidupku',
    album: 'Made Free',
    year: '2017',
    duration: 334,
    genre: 'Worship Ballad',
    bpm: 68,
    albumArt: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=400&q=80',
  },
  {
    artist: 'Symphony Worship',
    title: 'Ku Ada Sebab Anugerah-Mu',
    album: 'Kemenanganku',
    year: '2021',
    duration: 342,
    genre: 'Praise & Worship',
    bpm: 76,
    albumArt: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=400&q=80',
  },
  {
    artist: 'Sari Simorangkir',
    title: 'Kaulah Harapan',
    album: 'Satu Alasan',
    year: '2005',
    duration: 295,
    genre: 'Inspirational Worship',
    bpm: 74,
    albumArt: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=400&q=80',
  },
  {
    artist: 'Hillsong Worship',
    title: 'What A Beautiful Name',
    album: 'Let There Be Light',
    year: '2016',
    duration: 341,
    genre: 'Contemporary Christian',
    bpm: 68,
    albumArt: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?auto=format&fit=crop&w=400&q=80',
  },
  {
    artist: 'Franky Sihombing',
    title: 'Saat Indah Kuberhadapan Dengan-Mu',
    album: 'Rayakan',
    year: '2002',
    duration: 320,
    genre: 'Worship Classic',
    bpm: 70,
    albumArt: 'https://images.unsplash.com/photo-1445985543469-433ecba62447?auto=format&fit=crop&w=400&q=80',
  },
];

const DEFAULT_SCHEDULE: RadioShow[] = [
  {
    id: 'show-1',
    name: 'Renungan Pagi & Pujian Jiwa',
    host: 'Pdt. Andreas & Maria',
    time: '05:00 - 08:00 WIB',
    description: 'Awali pagi hari dengan renungan firman yang menguatkan dan lagu pujian pembawa damai.',
  },
  {
    id: 'show-2',
    name: 'Harmoni Kasih & Lagu Rohani',
    host: 'Kak Daniel & Grace',
    time: '08:00 - 12:00 WIB',
    description: 'Lagu-lagu rohani pilihan menemani rutinitas dan pekerjaan Anda penuh berkat.',
  },
  {
    id: 'show-3',
    name: 'Sore Berkat & Request Pendengar',
    host: 'DJ Hanna & Michael',
    time: '12:00 - 17:00 WIB',
    description: 'Kirim salam, kesaksian singkat, dan request lagu pujian bersama pendengar setia.',
  },
  {
    id: 'show-4',
    name: 'Penyembahan Senja & Doa Sahabat',
    host: 'Ev. Stefanus',
    time: '17:00 - 21:00 WIB',
    description: 'Alunan musik penyembahan dan doa bersama bagi pergumulan dan keluarga.',
  },
  {
    id: 'show-5',
    name: 'Malam Doa & Damai Sejahtera',
    host: 'RadioBOSS Auto-Rotation',
    time: '21:00 - 05:00 WIB',
    description: 'Lagu-lagu instrumental rohani dan kidung jemaat pengantar istirahat malam.',
  },
];

// Helper to normalize any pasted Zeno FM URL into a playable stream URL and embed URL
export function parseZenoInput(input?: string): {
  streamUrl: string;
  embedUrl: string;
  slug: string;
  type: 'stream' | 'station' | 'embed' | 'key';
} {
  const clean = (input || DEFAULT_ZENO_STREAM_URL).trim();
  let slug = 'eklesia-radio';
  let streamUrl = DEFAULT_ZENO_STREAM_URL;
  let embedUrl = DEFAULT_ZENO_EMBED_URL;
  let type: 'stream' | 'station' | 'embed' | 'key' = 'stream';

  if (!clean) {
    return { streamUrl, embedUrl, slug, type };
  }

  // 1. Direct stream URL: https://stream.zeno.fm/xxxx
  const streamMatch = clean.match(/stream\.zeno\.fm\/([a-zA-Z0-9_-]+)/i);
  if (streamMatch && streamMatch[1]) {
    const key = streamMatch[1];
    slug = key;
    streamUrl = `https://stream.zeno.fm/${key}`;
    embedUrl = `https://zeno.fm/player/${key}`;
    type = 'stream';
    return { streamUrl, embedUrl, slug, type };
  }

  // 2. Station page URL: https://zeno.fm/radio/station-slug
  const radioMatch = clean.match(/zeno\.fm\/radio\/([a-zA-Z0-9_-]+)/i);
  if (radioMatch && radioMatch[1]) {
    slug = radioMatch[1];
    streamUrl = `https://stream.zeno.fm/${slug}`;
    embedUrl = `https://zeno.fm/player/${slug}`;
    type = 'station';
    return { streamUrl, embedUrl, slug, type };
  }

  // 3. Player embed URL: https://zeno.fm/player/station-slug
  const playerMatch = clean.match(/zeno\.fm\/player\/([a-zA-Z0-9_-]+)/i);
  if (playerMatch && playerMatch[1]) {
    slug = playerMatch[1];
    streamUrl = `https://stream.zeno.fm/${slug}`;
    embedUrl = `https://zeno.fm/player/${slug}`;
    type = 'embed';
    return { streamUrl, embedUrl, slug, type };
  }

  // 4. Raw key or custom HTTP/HTTPS stream URL
  if (clean.startsWith('http://') || clean.startsWith('https://')) {
    let secureUrl = clean;
    if (typeof window !== 'undefined' && window.location.protocol === 'https:' && secureUrl.startsWith('http://stream.zeno.fm')) {
      secureUrl = secureUrl.replace('http://', 'https://');
    }
    return {
      streamUrl: secureUrl,
      embedUrl: `https://zeno.fm/player/${slug}`,
      slug,
      type: 'stream',
    };
  }

  // Plain mount key without protocol
  if (/^[a-zA-Z0-9_-]+$/.test(clean)) {
    return {
      streamUrl: `https://stream.zeno.fm/${clean}`,
      embedUrl: `https://zeno.fm/player/${clean}`,
      slug: clean,
      type: 'key',
    };
  }

  return { streamUrl, embedUrl, slug, type };
}

// Helper to get or set local client storage
function getLocal<T>(key: string, defaultValue: T): T {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setLocal<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignored
  }
}

// Auto-detect stream URL from query string on mobile phone (e.g. ?stream=...&station=...)
if (typeof window !== 'undefined') {
  try {
    const searchParams = new URLSearchParams(window.location.search);
    const streamParam = searchParams.get('stream');
    const stationParam = searchParams.get('station');
    if (streamParam || stationParam) {
      const cfg = getLocal<RadioBossConfig>('radio_config', {
        mode: 'simulation',
        host: '127.0.0.1',
        port: 9000,
        streamUrl: 'https://stream.zeno.fm/f3wvbbqmdg8uv',
        stationName: 'Eklesia Radio',
        autoSyncSeconds: 3,
      });
      if (streamParam) {
        let clean = decodeURIComponent(streamParam).trim();
        if (clean.startsWith('http://stream.zeno.fm')) clean = clean.replace('http://', 'https://');
        cfg.streamUrl = clean;
      }
      if (stationParam) {
        cfg.stationName = decodeURIComponent(stationParam).trim();
      }
      setLocal('radio_config', cfg);
    }
  } catch {
    // ignore
  }
}

// Client-side fallback state
let clientTrackStartTime = Date.now() - 40000;
let clientTrackIndex = 0;

function getClientRadioStatus(): RadioBossStatus {
  const currentHour = new Date().getHours();
  const currentShow = DEFAULT_SCHEDULE.find((s) => {
    const [start] = s.time.split(' - ');
    const h = parseInt(start.split(':')[0], 10);
    return currentHour >= h && currentHour < h + 4;
  }) || DEFAULT_SCHEDULE[0];

  const config = getLocal<RadioBossConfig>('radio_config', {
    mode: 'simulation',
    host: '127.0.0.1',
    port: 9000,
    streamUrl: 'https://stream.zeno.fm/f3wvbbqmdg8uv',
    stationName: 'Eklesia Radio (Radio Kristiani)',
    autoSyncSeconds: 3,
  });

  const curTrack = DEFAULT_TRACKS[clientTrackIndex % DEFAULT_TRACKS.length];
  const nextTrack = DEFAULT_TRACKS[(clientTrackIndex + 1) % DEFAULT_TRACKS.length];
  const elapsed = Math.floor((Date.now() - clientTrackStartTime) / 1000);

  if (elapsed >= curTrack.duration) {
    clientTrackIndex = (clientTrackIndex + 1) % DEFAULT_TRACKS.length;
    clientTrackStartTime = Date.now();
  }

  const pos = Math.min(curTrack.duration, Math.max(0, elapsed));

  return {
    online: true,
    mode: config.mode,
    stationName: config.stationName,
    currentTrack: {
      artist: curTrack.artist,
      title: curTrack.title,
      album: curTrack.album,
      year: curTrack.year,
      duration: curTrack.duration,
      pos,
      castTitle: `${curTrack.artist} - ${curTrack.title}`,
      bpm: curTrack.bpm,
      genre: curTrack.genre,
      albumArt: curTrack.albumArt || stationHeroCover,
    },
    nextTrack: {
      artist: nextTrack.artist,
      title: nextTrack.title,
      duration: nextTrack.duration,
    },
    playbackState: 'playing',
    listeners: 194,
    peakListeners: 350,
    bitrate: '128 kbps (Stereo HD)',
    format: 'AAC / MP3 Stream',
    micActive: false,
    serverTime: new Date().toLocaleTimeString('id-ID'),
    currentShow: { ...currentShow, isLiveNow: true },
    streamUrl: config.streamUrl,
  };
}

// ---------------- API FUNCTIONS WITH INSTANT CLIENT FALLBACK ----------------

export async function fetchRadioStatus(): Promise<RadioBossStatus> {
  if (backendAvailable !== false) {
    try {
      const res = await fetch('/api/radioboss/status', {
        headers: { Accept: 'application/json' },
      });
      if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
        backendAvailable = true;
        return await res.json();
      }
    } catch {
      // Backend not reached (e.g. static GitHub Pages)
    }
  }

  backendAvailable = false;
  return getClientRadioStatus();
}

export async function fetchSchedule(): Promise<RadioShow[]> {
  if (backendAvailable !== false) {
    try {
      const res = await fetch('/api/radioboss/schedule');
      if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
        const data = await res.json();
        return data.schedule;
      }
    } catch {
      // silent
    }
  }

  const currentHour = new Date().getHours();
  return DEFAULT_SCHEDULE.map((s) => ({
    ...s,
    isLiveNow: currentHour >= 8 && currentHour < 12,
  }));
}

export async function fetchSongHistory(): Promise<SongHistoryItem[]> {
  if (backendAvailable !== false) {
    try {
      const res = await fetch('/api/radioboss/history');
      if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
        const data = await res.json();
        return data.history;
      }
    } catch {
      // silent
    }
  }

  return getLocal<SongHistoryItem[]>('radio_song_history', [
    {
      id: 'h-1',
      artist: 'NDC Worship',
      title: 'Waktu Tuhan',
      album: 'Purify',
      playedAt: '8 menit yang lalu',
      duration: 310,
      albumArt: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80',
    },
    {
      id: 'h-2',
      artist: 'JPCC Worship',
      title: 'Sampai Akhir Hidupku',
      album: 'Made Free',
      playedAt: '14 menit yang lalu',
      duration: 334,
      albumArt: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=400&q=80',
    },
    {
      id: 'h-3',
      artist: 'Symphony Worship',
      title: 'Ku Ada Sebab Anugerah-Mu',
      album: 'Kemenanganku',
      playedAt: '21 menit yang lalu',
      duration: 342,
      albumArt: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=400&q=80',
    },
    {
      id: 'h-4',
      artist: 'Sari Simorangkir',
      title: 'Kaulah Harapan',
      album: 'Satu Alasan',
      playedAt: '28 menit yang lalu',
      duration: 295,
      albumArt: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=400&q=80',
    },
  ]);
}

export async function fetchSongRequests(): Promise<SongRequestItem[]> {
  if (backendAvailable !== false) {
    try {
      const res = await fetch('/api/radioboss/requests');
      if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
        const data = await res.json();
        return data.requests;
      }
    } catch {
      // silent
    }
  }

  return getLocal<SongRequestItem[]>('radio_song_requests', [
    {
      id: 'req-1',
      requesterName: 'Ibu Maria (Surabaya)',
      artist: 'NDC Worship',
      title: 'Waktu Tuhan',
      message: 'Salam damai sejahtera buat seluruh keluarga dan sahabat di persekutuan doa',
      timestamp: '14:20 WIB',
      status: 'queued',
    },
    {
      id: 'req-2',
      requesterName: 'Bapak Samuel (Medan)',
      artist: 'Hillsong',
      title: 'What A Beautiful Name',
      message: 'Request lagu penguat iman saat dalam perjalanan dinas',
      timestamp: '14:28 WIB',
      status: 'queued',
    },
  ]);
}

export async function submitSongRequest(payload: {
  requesterName: string;
  artist: string;
  title: string;
  message?: string;
}): Promise<{ success: boolean; message: string; request: SongRequestItem }> {
  if (backendAvailable !== false) {
    try {
      const res = await fetch('/api/radioboss/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // fallback to client storage
    }
  }

  // Client storage fallback
  const requests = getLocal<SongRequestItem[]>('radio_song_requests', []);
  const newReq: SongRequestItem = {
    id: `req-${Date.now()}`,
    requesterName: payload.requesterName.trim() || 'Pendengar Setia',
    artist: payload.artist.trim(),
    title: payload.title.trim(),
    message: payload.message?.trim() || '',
    timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
    status: 'queued',
  };
  requests.unshift(newReq);
  setLocal('radio_song_requests', requests);

  // Also push to local chat
  const chatMsgs = getLocal<ChatMessage[]>('radio_chat_messages', []);
  chatMsgs.push({
    id: `msg-${Date.now()}`,
    sender: newReq.requesterName,
    text: newReq.message ? `Request: "${newReq.artist} - ${newReq.title}" (${newReq.message})` : `Request: ${newReq.artist} - ${newReq.title}`,
    timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    avatarColor: 'bg-emerald-500',
    isRequest: true,
    requestDetails: { artist: newReq.artist, title: newReq.title },
  });
  setLocal('radio_chat_messages', chatMsgs);

  return {
    success: true,
    message: 'Request lagu berhasil dikirim ke antrean RadioBOSS!',
    request: newReq,
  };
}

export async function fetchRadioSettings(): Promise<{ config: RadioBossConfig & { passwordMasked?: string } }> {
  if (backendAvailable !== false) {
    try {
      const res = await fetch('/api/radioboss/settings');
      if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
        return await res.json();
      }
    } catch {
      // silent
    }
  }

  const config = getLocal<RadioBossConfig>('radio_config', {
    mode: 'simulation',
    host: '127.0.0.1',
    port: 9000,
    password: '',
    streamUrl: 'https://stream.zeno.fm/f3wvbbqmdg8uv',
    zenoStationUrl: 'https://zeno.fm/radio/eklesia-radio',
    whatsappNumber: '081234567890',
    stationName: 'Eklesia Radio (Radio Kristiani)',
    autoSyncSeconds: 3,
  });

  return { config };
}

export async function updateRadioSettings(payload: Partial<RadioBossConfig>): Promise<{ success: boolean; message: string }> {
  const current = getLocal<RadioBossConfig>('radio_config', {
    mode: 'simulation',
    host: '127.0.0.1',
    port: 9000,
    streamUrl: 'https://stream.zeno.fm/f3wvbbqmdg8uv',
    zenoStationUrl: 'https://zeno.fm/radio/eklesia-radio',
    whatsappNumber: '081234567890',
    stationName: 'Eklesia Radio (Radio Kristiani)',
    autoSyncSeconds: 3,
  });

  const updated = { ...current, ...payload };
  setLocal('radio_config', updated);

  if (backendAvailable !== false) {
    try {
      const res = await fetch('/api/radioboss/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) return await res.json();
    } catch {
      // saved locally
    }
  }

  return {
    success: true,
    message: 'Pengaturan server RadioBOSS berhasil disimpan di browser Anda.',
  };
}

export async function testRadioConnection(payload: {
  host: string;
  port: number;
  password?: string;
}): Promise<{ success: boolean; latency: number; message?: string; error?: string; currentSong?: string }> {
  if (backendAvailable !== false) {
    try {
      const res = await fetch('/api/radioboss/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
  }

  // Simulated diagnostic response on static host
  await new Promise((r) => setTimeout(r, 600));
  return {
    success: true,
    latency: 28,
    message: `Format endpoint siap: http://${payload.host}:${payload.port}/?action=playbackinfo`,
    currentSong: 'RadioBOSS Stream Ready',
  };
}

export async function fetchChatData(): Promise<{
  messages: ChatMessage[];
  reactions: Record<string, number>;
}> {
  if (backendAvailable !== false) {
    try {
      const res = await fetch('/api/chat/messages');
      if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
        return await res.json();
      }
    } catch {
      // silent
    }
  }

  const defaultMessages: ChatMessage[] = [
    {
      id: 'msg-1',
      sender: 'RadioBOSS Studio',
      text: 'Selamat datang di Radio Kristiani Online! Siaran streaming aktif 24 jam.',
      timestamp: '14:10',
      avatarColor: 'bg-amber-500',
      isSystem: true,
    },
    {
      id: 'msg-2',
      sender: 'Grace_Lestari',
      text: 'Syalom semuanya! Suara siarannya jernih dan memberkati sekali 🙏',
      timestamp: '14:15',
      avatarColor: 'bg-emerald-500',
    },
    {
      id: 'msg-3',
      sender: 'Samuel_H',
      text: 'Request lagu NDC Worship - Waktu Tuhan dong min untuk keluarga di rumah',
      timestamp: '14:20',
      avatarColor: 'bg-sky-500',
      isRequest: true,
      requestDetails: { artist: 'NDC Worship', title: 'Waktu Tuhan' },
    },
    {
      id: 'msg-4',
      sender: 'Penyiar (Studio)',
      text: 'Syalom Saudara Samuel, lagu Waktu Tuhan sudah masuk antrean ya! Tuhan memberkati. 📻',
      timestamp: '14:22',
      avatarColor: 'bg-rose-500',
      isSystem: true,
    },
  ];

  const messages = getLocal<ChatMessage[]>('radio_chat_messages', defaultMessages);
  const reactions = getLocal<Record<string, number>>('radio_reactions', {
    heart: 320,
    fire: 145,
    clap: 210,
    music: 280,
  });

  return { messages, reactions };
}

export async function sendChatMessage(payload: {
  sender: string;
  text: string;
  avatarColor?: string;
}): Promise<ChatMessage> {
  const newMsg: ChatMessage = {
    id: `msg-${Date.now()}`,
    sender: payload.sender.trim() || 'Pendengar',
    text: payload.text.trim(),
    timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    avatarColor: payload.avatarColor || 'bg-amber-500',
  };

  if (backendAvailable !== false) {
    try {
      const res = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        return data.message;
      }
    } catch {
      // fallback
    }
  }

  const msgs = getLocal<ChatMessage[]>('radio_chat_messages', []);
  msgs.push(newMsg);
  if (msgs.length > 50) msgs.shift();
  setLocal('radio_chat_messages', msgs);

  return newMsg;
}

export async function sendChatReaction(type: 'heart' | 'fire' | 'clap' | 'music'): Promise<Record<string, number>> {
  const current = getLocal<Record<string, number>>('radio_reactions', {
    heart: 320,
    fire: 145,
    clap: 210,
    music: 280,
  });

  current[type] = (current[type] || 0) + 1;
  setLocal('radio_reactions', current);

  if (backendAvailable !== false) {
    try {
      const res = await fetch('/api/chat/reaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      });
      if (res.ok) {
        const data = await res.json();
        return data.reactions;
      }
    } catch {
      // fallback
    }
  }

  return current;
}

export async function fetchWebhookLogs(): Promise<{
  logs: Array<{
    id: string;
    timestamp: string;
    artist: string;
    title: string;
    raw: string;
    method: string;
  }>;
  current: any;
}> {
  if (backendAvailable !== false) {
    try {
      const res = await fetch('/api/radioboss/webhook-logs');
      if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
        return await res.json();
      }
    } catch {
      // silent
    }
  }

  return {
    logs: getLocal('radio_webhook_logs', [
      {
        id: 'log-1',
        timestamp: new Date().toLocaleTimeString('id-ID'),
        artist: 'NDC Worship',
        title: 'Waktu Tuhan',
        raw: 'casttitle: NDC Worship - Waktu Tuhan',
        method: 'RADIOBOSS_PUSH',
      },
    ]),
    current: null,
  };
}

export async function simulateMetadataPush(payload: {
  artist: string;
  title: string;
  album?: string;
  duration?: number;
}): Promise<{ success: boolean; track: any }> {
  if (backendAvailable !== false) {
    try {
      const res = await fetch('/api/radioboss/simulate-push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
  }

  const track = {
    artist: payload.artist,
    title: payload.title,
    album: payload.album || 'RadioBOSS Stream',
    duration: payload.duration || 240,
    pos: 0,
    castTitle: `${payload.artist} - ${payload.title}`,
    updatedAt: Date.now(),
  };

  const logs = getLocal<any[]>('radio_webhook_logs', []);
  logs.unshift({
    id: `log-${Date.now()}`,
    timestamp: new Date().toLocaleTimeString('id-ID'),
    artist: payload.artist,
    title: payload.title,
    raw: `Simulated: ${payload.artist} - ${payload.title}`,
    method: 'CLIENT_PUSH',
  });
  setLocal('radio_webhook_logs', logs);

  return { success: true, track };
}
