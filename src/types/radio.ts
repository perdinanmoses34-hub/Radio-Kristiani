export interface TrackInfo {
  artist: string;
  title: string;
  album?: string;
  year?: string;
  duration: number; // in seconds
  pos: number; // in seconds
  albumArt?: string;
  castTitle?: string;
  startTime?: string;
  bpm?: number;
  genre?: string;
}

export interface NextTrackInfo {
  artist: string;
  title: string;
  duration: number;
}

export interface RadioShow {
  id: string;
  name: string;
  host: string;
  time: string;
  description: string;
  day?: string;
  isLiveNow?: boolean;
}

export interface RadioBossStatus {
  online: boolean;
  mode: 'live' | 'simulation';
  stationName: string;
  currentTrack: TrackInfo;
  nextTrack: NextTrackInfo;
  playbackState: 'playing' | 'paused' | 'stopped';
  listeners: number;
  peakListeners: number;
  bitrate: string;
  format: string;
  micActive: boolean;
  serverTime: string;
  currentShow: RadioShow;
  streamUrl: string;
}

export interface SongHistoryItem {
  id: string;
  artist: string;
  title: string;
  album?: string;
  playedAt: string;
  duration: number;
  albumArt?: string;
  requestedBy?: string;
}

export interface SongRequestItem {
  id: string;
  requesterName: string;
  artist: string;
  title: string;
  message?: string;
  timestamp: string;
  status: 'pending' | 'queued' | 'playing' | 'rejected';
}

export interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  timestamp: string;
  avatarColor: string;
  isSystem?: boolean;
  isRequest?: boolean;
  requestDetails?: {
    artist: string;
    title: string;
  };
}

export interface RadioBossConfig {
  mode: 'live' | 'simulation';
  host: string;
  port: number;
  password?: string;
  streamUrl: string;
  stationName: string;
  autoSyncSeconds: number;
}
