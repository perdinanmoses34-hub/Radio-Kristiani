export interface AdminUser {
  email: string;
  role: 'admin';
  name: string;
}

export interface AdminAuthResponse {
  success: boolean;
  message: string;
  token?: string;
  admin?: AdminUser;
}

export interface BroadcastScheduleItem {
  id: string;
  name: string;
  host: string;
  startHour: number;
  endHour: number;
  time: string;
  description: string;
  day?: string;
  isLiveNow?: boolean;
}

export interface RadioBossSong {
  id: string;
  artist: string;
  title: string;
  album?: string;
  genre?: string;
  duration: number; // in seconds
  bpm?: number;
  albumArt?: string;
}
