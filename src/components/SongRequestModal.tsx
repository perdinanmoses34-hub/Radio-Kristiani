import React, { useState } from 'react';
import { X, Music, Send, CheckCircle2, AlertCircle, MessageCircle, Sparkles } from 'lucide-react';
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

  const whatsappNumber = localStorage.getItem('radio_whatsapp') || '081234567890';
  const cleanPhone = whatsappNumber.replace(/[^0-9]/g, '').replace(/^0/, '62');

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
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
        text: response.message || 'Request lagu berhasil dikirim ke antrean siaran!',
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

  const handleSendToWhatsApp = () => {
    if (!artist.trim() || !title.trim()) {
      setStatusMessage({ type: 'error', text: 'Nama artis dan judul lagu wajib diisi untuk kirim via WhatsApp.' });
      return;
    }

    // Submit locally first so it shows up in chat & history
    submitSongRequest({
      requesterName: requesterName.trim() || 'Pendengar Setia',
      artist: artist.trim(),
      title: title.trim(),
      message: message.trim(),
    }).catch(() => {});

    const name = requesterName.trim() || 'Pendengar';
    const waText = encodeURIComponent(
      `Syalom Radio Eklesia,\n\nSaya ${name} ingin request lagu pujian:\n🎵 Artis: ${artist.trim()}\n🎶 Judul: ${title.trim()}` +
      (message.trim() ? `\n\n💬 Pesan / Salam: "${message.trim()}"` : '') +
      `\n\nTerima kasih, Tuhan memberkati!`
    );

    const waUrl = `https://wa.me/${cleanPhone}?text=${waText}`;
    window.open(waUrl, '_blank');

    setStatusMessage({
      type: 'success',
      text: 'Request lagu diteruskan ke WhatsApp Operator!',
    });

    setTimeout(() => {
      onClose();
      setStatusMessage(null);
    }, 2000);
  };

  const handlePickSuggestion = (sugArtist: string, sugTitle: string) => {
    setArtist(sugArtist);
    setTitle(sugTitle);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-xl p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Tutup modal"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 shadow-2xs">
            <Music className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Request Lagu ke Studio Radio
            </h2>
            <p className="text-xs text-slate-500">
              Lagu akan diteruskan ke antrean siaran &amp; operator RadioBOSS
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Nama Pendengar / Asal Kota
            </label>
            <input
              type="text"
              value={requesterName}
              onChange={(e) => setRequesterName(e.target.value)}
              placeholder="Contoh: Ibu Maria (Jakarta)"
              className="w-full rounded-2xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-amber-500 focus:outline-none transition-all shadow-2xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Penyanyi / Artis <span className="text-amber-500">*</span>
              </label>
              <input
                type="text"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                placeholder="Contoh: NDC Worship"
                required
                className="w-full rounded-2xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-amber-500 focus:outline-none transition-all shadow-2xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Judul Lagu <span className="text-amber-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Waktu Tuhan"
                required
                className="w-full rounded-2xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-amber-500 focus:outline-none transition-all shadow-2xs"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Salam &amp; Ucapan / Doa Sahabat (Opsional)
            </label>
            <textarea
              rows={2}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Contoh: Titip salam dan doa buat keluarga serta persekutuan doa..."
              className="w-full rounded-2xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-amber-500 focus:outline-none transition-all resize-none shadow-2xs"
            />
          </div>

          {/* Popular suggestions */}
          <div>
            <span className="text-[11px] font-semibold text-slate-500 block mb-1.5">
              Pilihan Cepat Populer:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {popularSuggestions.map((sug, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handlePickSuggestion(sug.artist, sug.title)}
                  className="rounded-xl bg-slate-100 hover:bg-amber-50 hover:text-amber-700 border border-slate-200 px-2.5 py-1 text-[11px] font-medium text-slate-700 transition-colors cursor-pointer"
                >
                  {sug.artist} - {sug.title}
                </button>
              ))}
            </div>
          </div>

          {statusMessage && (
            <div
              className={`rounded-2xl border p-3 text-xs flex items-center gap-2 ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              ) : (
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
              )}
              <span className="font-medium">{statusMessage.text}</span>
            </div>
          )}

          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2.5">
            {/* WhatsApp Button - Emerald Accent */}
            <button
              type="button"
              onClick={handleSendToWhatsApp}
              className="flex items-center justify-center gap-1.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 px-4 py-2.5 text-xs font-bold text-white transition-all cursor-pointer shadow-md shadow-emerald-600/25 active:scale-95"
              title="Kirimkan langsung ke WhatsApp Operator"
            >
              <MessageCircle className="h-4 w-4" />
              <span>Kirim via WhatsApp ke Operator</span>
            </button>

            {/* Submit Button - Amber Accent */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 px-5 py-2.5 text-xs font-bold text-white transition-all cursor-pointer shadow-md shadow-amber-500/25 disabled:opacity-50 active:scale-95"
            >
              <Send className="h-3.5 w-3.5 fill-current" />
              <span>{isSubmitting ? 'Mengirim...' : 'Kirim ke Antrean'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
