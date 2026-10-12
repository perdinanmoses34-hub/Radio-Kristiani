import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initial default configuration
let radioConfig = {
  mode: 'simulation' as 'live' | 'simulation',
  host: '127.0.0.1',
  port: 9000,
  password: 'radioboss123',
  streamUrl: 'https://stream.zeno.fm/f3wvbbqmdg8uv', // Default live audio stream
  stationName: 'Eklesia Radio', // Synced with user's RadioBOSS Station Name
  autoSyncSeconds: 3,
};

// Live webhook metadata pushed from RadioBOSS (Reports / HTTP Request / On Track Start)
let liveWebhookTrack: {
  artist: string;
  title: string;
  album?: string;
  year?: string;
  duration: number;
  updatedAt: number;
  castTitle?: string;
} | null = null;

// Real-time webhook log for monitoring incoming pings from RadioBOSS
let webhookLogs: Array<{
  id: string;
  timestamp: string;
  artist: string;
  title: string;
  raw: string;
  method: string;
}> = [];

// Rich simulated catalog for automated RadioBOSS schedule and rotation
const SIMULATED_TRACKS = [
  {
    artist: 'Tulus',
    title: 'Hati-Hati di Jalan',
    album: 'Manusia',
    year: '2022',
    duration: 242,
    genre: 'Pop / Acoustic',
    bpm: 110,
    albumArt: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80',
  },
  {
    artist: 'Coldplay',
    title: 'Viva La Vida',
    album: 'Viva La Vida or Death and All His Friends',
    year: '2008',
    duration: 242,
    genre: 'Alternative Rock',
    bpm: 138,
    albumArt: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=400&q=80',
  },
  {
    artist: 'Mahalini',
    title: 'Sial',
    album: 'Fábulas',
    year: '2023',
    duration: 243,
    genre: 'Pop Ballad',
    bpm: 115,
    albumArt: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=400&q=80',
  },
  {
    artist: 'The Weeknd',
    title: 'Blinding Lights',
    album: 'After Hours',
    year: '2020',
    duration: 200,
    genre: 'Synthwave / Pop',
    bpm: 171,
    albumArt: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=400&q=80',
  },
  {
    artist: 'Sheila on 7',
    title: 'Dan...',
    album: 'Sheila on 7',
    year: '1999',
    duration: 285,
    genre: 'Indonesian Rock',
    bpm: 98,
    albumArt: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?auto=format&fit=crop&w=400&q=80',
  },
  {
    artist: 'Dua Lipa',
    title: 'Levitating',
    album: 'Future Nostalgia',
    year: '2020',
    duration: 203,
    genre: 'Nu-Disco / Pop',
    bpm: 103,
    albumArt: 'https://images.unsplash.com/photo-1445985543469-433ecba62447?auto=format&fit=crop&w=400&q=80',
  },
  {
    artist: 'Nadin Amizah',
    title: 'Bertaut',
    album: 'Selamat Ulang Tahun',
    year: '2020',
    duration: 315,
    genre: 'Folk / Indie',
    bpm: 88,
    albumArt: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=400&q=80',
  },
  {
    artist: 'Bruno Mars & Anderson .Paak (Silk Sonic)',
    title: 'Leave The Door Open',
    album: 'An Evening with Silk Sonic',
    year: '2021',
    duration: 242,
    genre: 'R&B / Soul',
    bpm: 148,
    albumArt: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=400&q=80',
  },
];

// Broadcast Shows Schedule
const BROADCAST_SCHEDULE = [
  {
    id: 'show-1',
    name: 'Morning Spirit & Coffee',
    host: 'DJ Aris & Vina',
    startHour: 6,
    endHour: 10,
    time: '06:00 - 10:00 WIB',
    description: 'Semangat pagi pembuka hari dengan musik upbeat, ramalan cuaca, dan kabar terkini.',
  },
  {
    id: 'show-2',
    name: 'Top 40 Hits Midday',
    host: 'DJ Denny Pratama',
    startHour: 10,
    endHour: 14,
    time: '10:00 - 14:00 WIB',
    description: 'Tangga lagu 40 lagu terpanas dalam dan luar negeri menemani waktu kerja Anda.',
  },
  {
    id: 'show-3',
    name: 'Sore Santai & Request Time',
    host: 'DJ Sarah Melody',
    startHour: 14,
    endHour: 18,
    time: '14:00 - 18:00 WIB',
    description: 'Saatnya request lagu favorit, kirim salam ke teman dan keluarga, serta obrolan santai pulang kantor.',
  },
  {
    id: 'show-4',
    name: 'Suara Senja Akustik',
    host: 'DJ Bayu Anggara',
    startHour: 18,
    endHour: 21,
    time: '18:00 - 21:00 WIB',
    description: 'Alunan nada petikan gitar akustik dan lagu-lagu nostalgia yang menenangkan jiwa.',
  },
  {
    id: 'show-5',
    name: 'Night Drive & Chill Beats',
    host: 'DJ Kenzo',
    startHour: 21,
    endHour: 24,
    time: '21:00 - 00:00 WIB',
    description: 'Irama lo-fi, synthwave, dan deep grooves pengantar tidur dan teman begadang.',
  },
  {
    id: 'show-6',
    name: 'Overnight AutoDJ Rotation',
    host: 'RadioBOSS Auto-Pilot',
    startHour: 0,
    endHour: 6,
    time: '00:00 - 06:00 WIB',
    description: 'Otomatisasi siaran malam tanpa henti langsung dari server RadioBOSS playlist rotation.',
  },
];

// In-memory simulation state
let currentTrackIdx = 0;
let trackStartTimeMs = Date.now() - 45000; // started 45s ago
let currentListeners = 186;
let peakListeners = 340;
let reactionCounts = { heart: 284, fire: 142, clap: 95, music: 189 };

// Song history list
let songHistory: Array<{
  id: string;
  artist: string;
  title: string;
  album?: string;
  playedAt: string;
  duration: number;
  albumArt?: string;
  requestedBy?: string;
}> = [
  {
    id: 'hist-1',
    artist: 'Pamungkas',
    title: 'To the Bone',
    album: 'Flying Solo',
    playedAt: '10 menit yang lalu',
    duration: 344,
    albumArt: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80',
    requestedBy: 'Dimas (Jakarta)',
  },
  {
    id: 'hist-2',
    artist: 'Ed Sheeran',
    title: 'Bad Habits',
    album: '=',
    playedAt: '15 menit yang lalu',
    duration: 231,
    albumArt: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'hist-3',
    artist: 'Dewa 19',
    title: 'Kangen',
    album: '19',
    playedAt: '21 menit yang lalu',
    duration: 320,
    albumArt: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?auto=format&fit=crop&w=400&q=80',
    requestedBy: 'Rina (Bandung)',
  },
  {
    id: 'hist-4',
    artist: 'Adele',
    title: 'Easy On Me',
    album: '30',
    playedAt: '27 menit yang lalu',
    duration: 224,
    albumArt: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=400&q=80',
  },
];

// Song requests in queue
let songRequests: Array<{
  id: string;
  requesterName: string;
  artist: string;
  title: string;
  message?: string;
  timestamp: string;
  status: 'pending' | 'queued' | 'playing' | 'rejected';
}> = [
  {
    id: 'req-1',
    requesterName: 'Budi Santoso',
    artist: 'Sheila on 7',
    title: 'Dan...',
    message: 'Salam buat anak-anak SMA 1 yang lagi ngumpul!',
    timestamp: '14:20 WIB',
    status: 'queued',
  },
  {
    id: 'req-2',
    requesterName: 'Clara Putri',
    artist: 'Coldplay',
    title: 'Viva La Vida',
    message: 'Request buat nemenin ngerjain skripsi',
    timestamp: '14:25 WIB',
    status: 'queued',
  },
];

// Listener chat messages
let chatMessages: Array<{
  id: string;
  sender: string;
  text: string;
  timestamp: string;
  avatarColor: string;
  isSystem?: boolean;
  isRequest?: boolean;
  requestDetails?: { artist: string; title: string };
}> = [
  {
    id: 'msg-1',
    sender: 'RadioBOSS Bot',
    text: 'Siaran tersambung ke RadioBOSS Automation Engine. Audio streaming aktif!',
    timestamp: '14:10',
    avatarColor: 'bg-amber-500',
    isSystem: true,
  },
  {
    id: 'msg-2',
    sender: 'Andi_Kurniawan',
    text: 'Halo studio! Suaranya jernih banget sore ini 👍',
    timestamp: '14:15',
    avatarColor: 'bg-emerald-500',
  },
  {
    id: 'msg-3',
    sender: 'Budi Santoso',
    text: 'Request lagu Sheila on 7 dong min, salam buat yang lagi di jalan',
    timestamp: '14:20',
    avatarColor: 'bg-sky-500',
    isRequest: true,
    requestDetails: { artist: 'Sheila on 7', title: 'Dan...' },
  },
  {
    id: 'msg-4',
    sender: 'Sarah (Host)',
    text: 'Siap Mas Budi! Lagu Sheila on 7 sudah masuk antrean RadioBOSS ya, sebentar lagi diputar! 📻',
    timestamp: '14:22',
    avatarColor: 'bg-rose-500',
    isSystem: true,
  },
  {
    id: 'msg-5',
    sender: 'Maya_Lestari',
    text: 'Lagunya bikin adem bener pas lagi macet ☕',
    timestamp: '14:26',
    avatarColor: 'bg-purple-500',
  },
];

// Helper: Determine Current Active Show
function getCurrentShow() {
  const currentHour = new Date().getHours();
  const show = BROADCAST_SCHEDULE.find((s) => currentHour >= s.startHour && currentHour < s.endHour);
  return show || BROADCAST_SCHEDULE[0];
}

// Background simulation ticker: advances track when duration finishes
setInterval(() => {
  const now = Date.now();
  const currentTrack = SIMULATED_TRACKS[currentTrackIdx];
  const elapsedSeconds = Math.floor((now - trackStartTimeMs) / 1000);

  if (elapsedSeconds >= currentTrack.duration) {
    // Add current track to history
    songHistory.unshift({
      id: `hist-${Date.now()}`,
      artist: currentTrack.artist,
      title: currentTrack.title,
      album: currentTrack.album,
      playedAt: 'Baru saja',
      duration: currentTrack.duration,
      albumArt: currentTrack.albumArt,
    });
    if (songHistory.length > 20) songHistory.pop();

    // Check if there is an approved song request
    const pendingRequest = songRequests.find((r) => r.status === 'queued');
    if (pendingRequest) {
      pendingRequest.status = 'playing';
      // System notification in chat
      chatMessages.push({
        id: `msg-${Date.now()}`,
        sender: 'RadioBOSS AutoDJ',
        text: `Memutar request dari ${pendingRequest.requesterName}: ${pendingRequest.artist} - ${pendingRequest.title} 🎶`,
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        avatarColor: 'bg-amber-500',
        isSystem: true,
      });
      if (chatMessages.length > 50) chatMessages.shift();
    }

    // Move to next track
    currentTrackIdx = (currentTrackIdx + 1) % SIMULATED_TRACKS.length;
    trackStartTimeMs = Date.now();

    // Slight realistic listener variation
    currentListeners = Math.max(80, Math.min(450, currentListeners + Math.floor(Math.random() * 9) - 4));
    if (currentListeners > peakListeners) peakListeners = currentListeners;
  }
}, 1000);

// Simple XML parser for RadioBOSS ?action=playbackinfo
function parseRadioBossXml(xml: string) {
  try {
    const currentTrackMatch = xml.match(/<CurrentTrack([^>]+)\/>|<CurrentTrack([^>]*>)([\s\S]*?)<\/CurrentTrack>/i);
    const playbackMatch = xml.match(/<playback([^>]+)\/>/i);
    const nextTrackMatch = xml.match(/<NextTrack([^>]+)\/>/i);

    const parseAttrs = (attrStr: string) => {
      const attrs: Record<string, string> = {};
      const regex = /(\w+)=["']([^"']*)["']/g;
      let m;
      while ((m = regex.exec(attrStr)) !== null) {
        attrs[m[1]] = m[2];
      }
      return attrs;
    };

    const curAttrs = currentTrackMatch ? parseAttrs(currentTrackMatch[1] || currentTrackMatch[2] || '') : {};
    const playAttrs = playbackMatch ? parseAttrs(playbackMatch[1] || '') : {};
    const nextAttrs = nextTrackMatch ? parseAttrs(nextTrackMatch[1] || '') : {};

    return {
      artist: curAttrs.Artist || curAttrs.artist || 'Unknown Artist',
      title: curAttrs.Title || curAttrs.title || 'Live Stream Audio',
      album: curAttrs.Album || curAttrs.album || '',
      year: curAttrs.Year || curAttrs.year || '',
      duration: parseInt(curAttrs.Duration || playAttrs.len || '180', 10),
      pos: parseInt(playAttrs.pos || '0', 10),
      state: (playAttrs.state as 'playing' | 'paused' | 'stopped') || 'playing',
      castTitle: curAttrs.CastTitle || `${curAttrs.Artist || ''} - ${curAttrs.Title || ''}`.trim(),
      nextArtist: nextAttrs.Artist || 'RadioBOSS Rotation',
      nextTitle: nextAttrs.Title || 'Next Track',
      nextDuration: parseInt(nextAttrs.Duration || '180', 10),
    };
  } catch (err) {
    return null;
  }
}

// Handler for RadioBOSS track updates pushed via Webhook / HTTP Request (Reports -> Notifications or Web Request)
function handleIncomingRadioBossTrack(data: {
  artist?: string;
  title?: string;
  album?: string;
  year?: string;
  duration?: number | string;
  casttitle?: string;
  filename?: string;
  raw?: string;
  method?: string;
}) {
  let artist = data.artist?.trim() || '';
  let title = data.title?.trim() || '';
  const casttitle = data.casttitle?.trim() || '';

  // If RadioBOSS sends "%artist - %title" format inside casttitle or title
  if ((!artist || !title) && (casttitle || title)) {
    const combined = casttitle || title;
    if (combined.includes(' - ')) {
      const parts = combined.split(' - ');
      artist = parts[0]?.trim() || artist || 'RadioBOSS';
      title = parts.slice(1).join(' - ')?.trim() || title || 'Live Track';
    } else if (!artist) {
      artist = 'RadioBOSS Broadcast';
      title = combined;
    }
  }

  if (!artist && !title) {
    artist = 'RadioBOSS Stream';
    title = 'Live Broadcast';
  }

  const durationSec = Math.max(30, parseInt(String(data.duration || '210'), 10) || 210);

  // Check if track changed before prepending to history
  if (!liveWebhookTrack || liveWebhookTrack.title !== title || liveWebhookTrack.artist !== artist) {
    if (liveWebhookTrack) {
      songHistory.unshift({
        id: `hist-${Date.now()}`,
        artist: liveWebhookTrack.artist,
        title: liveWebhookTrack.title,
        album: liveWebhookTrack.album,
        playedAt: 'Baru saja',
        duration: liveWebhookTrack.duration,
        albumArt: '/src/assets/images/station_hero_cover_1791802325450.jpg',
      });
      if (songHistory.length > 25) songHistory.pop();
    }

    // Announce in chat
    chatMessages.push({
      id: `msg-${Date.now()}`,
      sender: 'RadioBOSS Live',
      text: `Sedang mengudara: "${artist} - ${title}" 📻`,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      avatarColor: 'bg-amber-500',
      isSystem: true,
    });
    if (chatMessages.length > 60) chatMessages.shift();
  }

  liveWebhookTrack = {
    artist,
    title,
    album: data.album?.trim() || 'RadioBOSS Live Track',
    year: data.year?.trim() || '2026',
    duration: durationSec,
    updatedAt: Date.now(),
    castTitle: `${artist} - ${title}`,
  };

  // Record in webhook logs
  webhookLogs.unshift({
    id: `log-${Date.now()}`,
    timestamp: new Date().toLocaleTimeString('id-ID'),
    artist,
    title,
    raw: data.raw || `${artist} - ${title}`,
    method: data.method || 'GET',
  });
  if (webhookLogs.length > 20) webhookLogs.pop();

  return liveWebhookTrack;
}

// ----------------- API ENDPOINTS -----------------

// RadioBOSS Webhook (Supports both GET and POST)
// RadioBOSS calls: /api/radioboss/webhook?artist=%artist&title=%title&album=%album&duration=%duration
app.all('/api/radioboss/webhook', (req, res) => {
  const query = req.query as Record<string, string>;
  const body = req.body as Record<string, string>;
  const merged = { ...query, ...body };

  const track = handleIncomingRadioBossTrack({
    artist: merged.artist || merged.a,
    title: merged.title || merged.t,
    album: merged.album,
    year: merged.year,
    duration: merged.duration || merged.len,
    casttitle: merged.casttitle || merged.song || merged.track,
    filename: merged.filename || merged.file,
    raw: JSON.stringify(merged),
    method: req.method,
  });

  res.send(`OK - Track updated to: ${track.artist} - ${track.title}`);
});

// Get Webhook logs
app.get('/api/radioboss/webhook-logs', (_req, res) => {
  res.json({
    logs: webhookLogs,
    current: liveWebhookTrack,
  });
});

// Test trigger for metadata push
app.post('/api/radioboss/simulate-push', (req, res) => {
  const { artist, title, album, duration } = req.body;
  const track = handleIncomingRadioBossTrack({
    artist: artist || 'RadioBOSS Studio',
    title: title || 'Live On-Air Track',
    album: album || 'RadioBOSS Stream',
    duration: duration || 215,
    method: 'SIMULATE',
    raw: `Simulated Push: ${artist} - ${title}`,
  });
  res.json({ success: true, track });
});

// 1. Get Radio Status / Metadata (Current Playing, Next, Listeners, Show)
app.get('/api/radioboss/status', async (_req, res) => {
  const currentShow = getCurrentShow();

  // Prioritize live webhook track if pushed from RadioBOSS
  if (liveWebhookTrack) {
    const elapsedSeconds = Math.floor((Date.now() - liveWebhookTrack.updatedAt) / 1000);
    const pos = Math.min(liveWebhookTrack.duration, elapsedSeconds);

    return res.json({
      online: true,
      mode: 'live',
      source: 'webhook_push',
      stationName: radioConfig.stationName,
      currentTrack: {
        artist: liveWebhookTrack.artist,
        title: liveWebhookTrack.title,
        album: liveWebhookTrack.album || 'RadioBOSS Live',
        year: liveWebhookTrack.year || '2026',
        duration: liveWebhookTrack.duration,
        pos: pos,
        castTitle: liveWebhookTrack.castTitle,
        startTime: new Date(liveWebhookTrack.updatedAt).toLocaleTimeString('id-ID'),
        albumArt: '/src/assets/images/station_hero_cover_1791802325450.jpg',
      },
      nextTrack: {
        artist: 'RadioBOSS Playlist',
        title: 'Antrean Lagu Berikutnya',
        duration: 210,
      },
      playbackState: 'playing',
      listeners: currentListeners,
      peakListeners: peakListeners,
      bitrate: '128 kbps (Stereo)',
      format: 'MP3 / AAC Stream',
      micActive: false,
      serverTime: new Date().toLocaleTimeString('id-ID'),
      currentShow: { ...currentShow, isLiveNow: true },
      streamUrl: radioConfig.streamUrl,
    });
  }

  if (radioConfig.mode === 'live') {
    try {
      const rbUrl = `http://${radioConfig.host}:${radioConfig.port}/?action=playbackinfo&pass=${encodeURIComponent(radioConfig.password || '')}`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);

      const resp = await fetch(rbUrl, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (resp.ok) {
        const text = await resp.text();
        const parsed = parseRadioBossXml(text);
        if (parsed) {
          return res.json({
            online: true,
            mode: 'live',
            stationName: radioConfig.stationName,
            currentTrack: {
              artist: parsed.artist,
              title: parsed.title,
              album: parsed.album,
              year: parsed.year,
              duration: parsed.duration,
              pos: parsed.pos,
              castTitle: parsed.castTitle,
              startTime: new Date().toLocaleTimeString('id-ID'),
              albumArt: '/src/assets/images/station_hero_cover_1791802325450.jpg',
            },
            nextTrack: {
              artist: parsed.nextArtist,
              title: parsed.nextTitle,
              duration: parsed.nextDuration,
            },
            playbackState: parsed.state,
            listeners: currentListeners,
            peakListeners: peakListeners,
            bitrate: '128 kbps (Stereo)',
            format: 'MP3 / AAC Stream',
            micActive: false,
            serverTime: new Date().toLocaleTimeString('id-ID'),
            currentShow: { ...currentShow, isLiveNow: true },
            streamUrl: radioConfig.streamUrl,
          });
        }
      }
    } catch (err: any) {
      // Live RadioBOSS not reached, return status with warning but graceful fallback
      console.warn(`RadioBOSS live connection error to ${radioConfig.host}:${radioConfig.port}: ${err.message}`);
    }
  }

  // Simulation mode or graceful live fallback
  const currentTrack = SIMULATED_TRACKS[currentTrackIdx];
  const nextTrack = SIMULATED_TRACKS[(currentTrackIdx + 1) % SIMULATED_TRACKS.length];
  const pos = Math.min(currentTrack.duration, Math.max(0, Math.floor((Date.now() - trackStartTimeMs) / 1000)));

  return res.json({
    online: true,
    mode: radioConfig.mode,
    stationName: radioConfig.stationName,
    currentTrack: {
      artist: currentTrack.artist,
      title: currentTrack.title,
      album: currentTrack.album,
      year: currentTrack.year,
      duration: currentTrack.duration,
      pos: pos,
      castTitle: `${currentTrack.artist} - ${currentTrack.title}`,
      bpm: currentTrack.bpm,
      genre: currentTrack.genre,
      albumArt: currentTrack.albumArt || '/src/assets/images/station_hero_cover_1791802325450.jpg',
    },
    nextTrack: {
      artist: nextTrack.artist,
      title: nextTrack.title,
      duration: nextTrack.duration,
    },
    playbackState: 'playing',
    listeners: currentListeners,
    peakListeners: peakListeners,
    bitrate: '128 kbps (CBR)',
    format: 'AAC / MP3 Low Latency',
    micActive: false,
    serverTime: new Date().toLocaleTimeString('id-ID'),
    currentShow: { ...currentShow, isLiveNow: true },
    streamUrl: radioConfig.streamUrl,
  });
});

// 2. Broadcast Schedule Endpoint
app.get('/api/radioboss/schedule', (_req, res) => {
  const currentHour = new Date().getHours();
  const scheduleWithLiveStatus = BROADCAST_SCHEDULE.map((show) => ({
    ...show,
    isLiveNow: currentHour >= show.startHour && currentHour < show.endHour,
  }));
  res.json({ schedule: scheduleWithLiveStatus });
});

// 3. Recently Played Song History
app.get('/api/radioboss/history', (_req, res) => {
  res.json({ history: songHistory });
});

// 4. Song Requests Endpoint
app.get('/api/radioboss/requests', (_req, res) => {
  res.json({ requests: songRequests });
});

app.post('/api/radioboss/request', async (req, res) => {
  const { requesterName, artist, title, message } = req.body;

  if (!artist || !title) {
    return res.status(400).json({ error: 'Nama artis dan judul lagu wajib diisi.' });
  }

  const newRequest = {
    id: `req-${Date.now()}`,
    requesterName: requesterName?.trim() || 'Pendengar Setia',
    artist: artist.trim(),
    title: title.trim(),
    message: message?.trim() || '',
    timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
    status: 'queued' as const,
  };

  songRequests.unshift(newRequest);

  // If live mode, dispatch command to RadioBOSS
  if (radioConfig.mode === 'live') {
    try {
      // RadioBOSS API supports adding to queue: ?action=inserttrack&filename=...&pos=-1
      const queryParam = encodeURIComponent(`${newRequest.artist} - ${newRequest.title}`);
      const rbUrl = `http://${radioConfig.host}:${radioConfig.port}/?action=inserttrack&filename=${queryParam}&pos=-1&pass=${encodeURIComponent(radioConfig.password || '')}`;
      fetch(rbUrl).catch((e) => console.log('Forward to RadioBOSS:', e.message));
    } catch (err) {
      // non-blocking
    }
  }

  // Also post into Chat stream so listeners see it live
  const chatItem = {
    id: `msg-${Date.now()}`,
    sender: newRequest.requesterName,
    text: newRequest.message ? `Request: "${newRequest.artist} - ${newRequest.title}" (${newRequest.message})` : `Request lagu: ${newRequest.artist} - ${newRequest.title}`,
    timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    avatarColor: 'bg-emerald-500',
    isRequest: true,
    requestDetails: { artist: newRequest.artist, title: newRequest.title },
  };
  chatMessages.push(chatItem);
  if (chatMessages.length > 60) chatMessages.shift();

  return res.json({
    success: true,
    message: 'Request lagu berhasil dikirim ke antrean RadioBOSS!',
    request: newRequest,
  });
});

// 5. RadioBOSS Settings (Get & Save)
app.get('/api/radioboss/settings', (_req, res) => {
  res.json({
    config: {
      ...radioConfig,
      // Mask password slightly for safety
      passwordMasked: radioConfig.password ? '••••••••' : '',
    },
  });
});

app.post('/api/radioboss/settings', (req, res) => {
  const { mode, host, port, password, streamUrl, stationName, autoSyncSeconds } = req.body;

  if (mode === 'live' || mode === 'simulation') radioConfig.mode = mode;
  if (host) radioConfig.host = host.trim();
  if (port) radioConfig.port = parseInt(port, 10) || 9000;
  if (password !== undefined) radioConfig.password = password;
  if (streamUrl) radioConfig.streamUrl = streamUrl.trim();
  if (stationName) radioConfig.stationName = stationName.trim();
  if (autoSyncSeconds) radioConfig.autoSyncSeconds = Math.max(1, parseInt(autoSyncSeconds, 10));

  res.json({
    success: true,
    message: 'Pengaturan server RadioBOSS berhasil diperbarui.',
    config: radioConfig,
  });
});

// 6. Test Connection to Remote RadioBOSS instance
app.post('/api/radioboss/test-connection', async (req, res) => {
  const host = req.body.host || radioConfig.host;
  const port = req.body.port || radioConfig.port;
  const password = req.body.password !== undefined ? req.body.password : radioConfig.password;

  const startTime = Date.now();
  try {
    const rbUrl = `http://${host}:${port}/?action=playbackinfo&pass=${encodeURIComponent(password)}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const resp = await fetch(rbUrl, { signal: controller.signal });
    clearTimeout(timeoutId);
    const latency = Date.now() - startTime;

    if (!resp.ok) {
      return res.json({
        success: false,
        latency,
        error: `Server RadioBOSS merespons status HTTP ${resp.status} (${resp.statusText})`,
      });
    }

    const text = await resp.text();
    const parsed = parseRadioBossXml(text);

    return res.json({
      success: true,
      latency,
      message: 'Koneksi ke RadioBOSS API berhasil!',
      currentSong: parsed ? `${parsed.artist} - ${parsed.title}` : 'Metadata didapat',
      state: parsed?.state || 'connected',
    });
  } catch (err: any) {
    const latency = Date.now() - startTime;
    return res.json({
      success: false,
      latency,
      error: `Gagal terhubung ke http://${host}:${port}. Pastikan RadioBOSS aktif dan Web Remote Control diizinkan. (${err.message})`,
    });
  }
});

// 7. Listener Chat Endpoints
app.get('/api/chat/messages', (_req, res) => {
  res.json({
    messages: chatMessages,
    reactions: reactionCounts,
  });
});

app.post('/api/chat/messages', (req, res) => {
  const { sender, text, avatarColor } = req.body;
  if (!text || !text.trim()) {
    return res.status(400).json({ error: 'Pesan tidak boleh kosong.' });
  }

  const colors = ['bg-rose-500', 'bg-sky-500', 'bg-emerald-500', 'bg-amber-500', 'bg-purple-500', 'bg-indigo-500'];
  const assignedColor = avatarColor || colors[Math.floor(Math.random() * colors.length)];

  const newMsg = {
    id: `msg-${Date.now()}`,
    sender: sender?.trim() || 'Pendengar',
    text: text.trim(),
    timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    avatarColor: assignedColor,
  };

  chatMessages.push(newMsg);
  if (chatMessages.length > 60) chatMessages.shift();

  res.json({ success: true, message: newMsg });
});

// 8. Reactions
app.post('/api/chat/reaction', (req, res) => {
  const { type } = req.body as { type: 'heart' | 'fire' | 'clap' | 'music' };
  if (type && type in reactionCounts) {
    reactionCounts[type] = (reactionCounts[type] || 0) + 1;
  }
  res.json({ success: true, reactions: reactionCounts });
});

// ----------------- VITE / STATIC SERVING -----------------
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`RadioBOSS Stream Studio running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
