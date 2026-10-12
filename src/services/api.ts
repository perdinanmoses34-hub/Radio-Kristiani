import { RadioBossStatus, RadioShow, SongHistoryItem, SongRequestItem, ChatMessage, RadioBossConfig } from '../types/radio';

export async function fetchRadioStatus(): Promise<RadioBossStatus> {
  const res = await fetch('/api/radioboss/status');
  if (!res.ok) throw new Error('Failed to fetch radio status');
  return res.json();
}

export async function fetchSchedule(): Promise<RadioShow[]> {
  const res = await fetch('/api/radioboss/schedule');
  if (!res.ok) throw new Error('Failed to fetch broadcast schedule');
  const data = await res.json();
  return data.schedule;
}

export async function fetchSongHistory(): Promise<SongHistoryItem[]> {
  const res = await fetch('/api/radioboss/history');
  if (!res.ok) throw new Error('Failed to fetch song history');
  const data = await res.json();
  return data.history;
}

export async function fetchSongRequests(): Promise<SongRequestItem[]> {
  const res = await fetch('/api/radioboss/requests');
  if (!res.ok) throw new Error('Failed to fetch song requests');
  const data = await res.json();
  return data.requests;
}

export async function submitSongRequest(payload: {
  requesterName: string;
  artist: string;
  title: string;
  message?: string;
}): Promise<{ success: boolean; message: string; request: SongRequestItem }> {
  const res = await fetch('/api/radioboss/request', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Gagal mengirim request lagu');
  }
  return res.json();
}

export async function fetchRadioSettings(): Promise<{ config: RadioBossConfig & { passwordMasked?: string } }> {
  const res = await fetch('/api/radioboss/settings');
  if (!res.ok) throw new Error('Failed to fetch settings');
  return res.json();
}

export async function updateRadioSettings(payload: Partial<RadioBossConfig>): Promise<{ success: boolean; message: string }> {
  const res = await fetch('/api/radioboss/settings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to update settings');
  return res.json();
}

export async function testRadioConnection(payload: {
  host: string;
  port: number;
  password?: string;
}): Promise<{ success: boolean; latency: number; message?: string; error?: string; currentSong?: string }> {
  const res = await fetch('/api/radioboss/test-connection', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function fetchChatData(): Promise<{
  messages: ChatMessage[];
  reactions: Record<string, number>;
}> {
  const res = await fetch('/api/chat/messages');
  if (!res.ok) throw new Error('Failed to fetch chat messages');
  return res.json();
}

export async function sendChatMessage(payload: {
  sender: string;
  text: string;
  avatarColor?: string;
}): Promise<ChatMessage> {
  const res = await fetch('/api/chat/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Gagal mengirim pesan chat');
  const data = await res.json();
  return data.message;
}

export async function sendChatReaction(type: 'heart' | 'fire' | 'clap' | 'music'): Promise<Record<string, number>> {
  const res = await fetch('/api/chat/reaction', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type }),
  });
  if (!res.ok) throw new Error('Failed to send reaction');
  const data = await res.json();
  return data.reactions;
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
  const res = await fetch('/api/radioboss/webhook-logs');
  if (!res.ok) throw new Error('Failed to fetch webhook logs');
  return res.json();
}

export async function simulateMetadataPush(payload: {
  artist: string;
  title: string;
  album?: string;
  duration?: number;
}): Promise<{ success: boolean; track: any }> {
  const res = await fetch('/api/radioboss/simulate-push', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to simulate push');
  return res.json();
}

