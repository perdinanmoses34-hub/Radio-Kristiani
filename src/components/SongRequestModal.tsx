import React, { useState } from 'react';
import { X, Music, Send, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { submitSongRequest } from '../services/api';

interface SongRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  prefillArtist?: string;
  prefillTitle?: string;
}

export const SongRequestModal: React.FC<SongRequestModalProps> = ({
  isOpen,
  onClose,
  prefillArtist = '',
  prefillTitle = '',
}) => {
  const [requesterName, setRequesterName] = useState(() => {
    return localStorage.getItem('radio_user_nick') || '';
  });
  const [artist, setArtist] = useState(prefillArtist);
  const [title, setTitle] = useState(prefillTitle);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  if (!isOpen) return null;

  const popularSuggestions = [
    { artist: 'NDC Worship', title: 'Waktu Tuhan' },
    { artist: 'JPCC Worship', title: 'Sampai Akhir Hidupku' },
    { artist: 'Symphony Worship', title: 'Ku Ada Sebab Anugerah-Mu' },
    { artist: 'Sari Simorangkir', title: 'Kaulah Harapan' },
    { artist: 'Hillsong', title: 'What A Beautiful Name' },
    { artist: 'Franky Sihombing', title: 'Saat Indah' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!artist.trim() || !title.trim()) {
      setStatusMessage({ type: 'error', text: 'Nama artis dan judul lagu wajib diisi.' });
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      const response = await submitSongRequest({
        requesterName: requesterName.trim() || 'Pendengar Setia',
        artist: artist.trim(),
        title: title.trim(),
        message: message.trim(),
      });

      setStatusMessage({
        type: 'success',
        text: response.message || 'Request lagu berhasil dikirim ke antrean RadioBOSS!',
      });

      // Clear fields except name
      setArtist('');
      setTitle('');
      setMessage('');

      // Auto close after 2.5s on success
      setTimeout(() => {
        onClose();
        setStatusMessage(null);
      }, 2500);
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Gagal mengirim request lagu. Coba lagi sebentar lagi.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePickSuggestion = (sugArtist: string, sugTitle: string) => {
    setArtist(sugArtist);
    setTitle(sugTitle);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900 p-6 shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
          aria-label="Tutup modal"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 border-b border-neutral-800 pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
            <Music className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">
              Request Lagu ke Studio Radio
            </h2>
            <p className="text-xs text-neutral-400">
              Lagu akan diteruskan secara otomatis ke antrean pemutaran RadioBOSS
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4 text-xs">
          <div>
            <label className="block font-medium text-neutral-300 mb-1">
              Nama Pendengar / Asal Kota
            </label>
            <input
              type="text"
              value={requesterName}
              onChange={(e) => setRequesterName(e.target.value)}
              placeholder="Contoh: Budi (Jakarta)"
              className="w-full rounded-xl bg-neutral-950 border border-neutral-800 px-3.5 py-2 text-white placeholder-neutral-600 focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-neutral-300 mb-1">
                Penyanyi / Artis <span className="text-amber-400">*</span>
              </label>
              <input
                type="text"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                placeholder="Contoh: Sheila on 7"
                required
                className="w-full rounded-xl bg-neutral-950 border border-neutral-800 px-3.5 py-2 text-white placeholder-neutral-600 focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-medium text-neutral-300 mb-1">
                Judul Lagu <span className="text-amber-400">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Dan..."
                required
                className="w-full rounded-xl bg-neutral-950 border border-neutral-800 px-3.5 py-2 text-white placeholder-neutral-600 focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-neutral-300 mb-1">
              Salam & Ucapan / Pesan Khusus (Opsional)
            </label>
            <textarea
              rows={2}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Contoh: Titip salam buat sahabat di kantor, semoga harinya menyenangkan!"
              className="w-full rounded-xl bg-neutral-950 border border-neutral-800 px-3.5 py-2 text-white placeholder-neutral-600 focus:border-amber-500 focus:outline-none resize-none"
            />
          </div>

          {/* Popular suggestions */}
          <div>
            <span className="text-[11px] font-medium text-neutral-400 block mb-1.5">
              Pilihan Cepat Populer:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {popularSuggestions.map((sug, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handlePickSuggestion(sug.artist, sug.title)}
                  className="rounded-lg bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 px-2.5 py-1 text-[11px] text-neutral-300 hover:text-amber-400 transition-colors cursor-pointer"
                >
                  {sug.artist} - {sug.title}
                </button>
              ))}
            </div>
          </div>

          {statusMessage && (
            <div
              className={`rounded-xl border p-3 text-xs flex items-center gap-2 ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
              ) : (
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-xs font-semibold text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 px-5 py-2.5 text-xs font-bold text-neutral-950 transition-colors cursor-pointer shadow-md shadow-amber-500/20 disabled:opacity-50"
            >
              <Send className="h-3.5 w-3.5 fill-current" />
              <span>{isSubmitting ? 'Mengirim ke Studio...' : 'Kirim Request'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
