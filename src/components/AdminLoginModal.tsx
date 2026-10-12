import React, { useState } from 'react';
import {
  Lock,
  Mail,
  KeyRound,
  X,
  AlertCircle,
  Loader2,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import { loginAdmin } from '../services/api';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (admin: { email: string; name: string }) => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [username, setUsername] = useState('tn.timbu@gmail.com');
  const [password, setPassword] = useState('Eklesia_030918*');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await loginAdmin(username, password);
      if (res.success && res.admin) {
        setSuccessMsg('Login berhasil! Mengalihkan ke Panel Admin...');
        setTimeout(() => {
          setIsLoading(false);
          onLoginSuccess(res.admin!);
          onClose();
        }, 600);
      } else {
        setIsLoading(false);
        setErrorMsg(res.message || 'Login admin gagal. Periksa email atau password Anda.');
      }
    } catch (err: any) {
      setIsLoading(false);
      setErrorMsg(err.message || 'Terjadi kesalahan sistem login.');
    }
  };

  const handleFillDefault = () => {
    setUsername('tn.timbu@gmail.com');
    setPassword('Eklesia_030918*');
    setErrorMsg(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-md rounded-3xl bg-neutral-900 border border-neutral-800 shadow-2xl p-6 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle decorative glowing corner */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          aria-label="Tutup modal"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3.5 mb-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-neutral-950 font-bold shadow-lg shadow-amber-500/20 shrink-0">
            <Lock className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Masuk Khusus Admin
            </h2>
            <p className="text-xs text-neutral-400">
              Kelola jadwal siaran, rotasi lagu, dan tampilan aplikasi
            </p>
          </div>
        </div>

        {/* Default credentials quick-fill helper */}
        <div className="mb-5 rounded-2xl border border-amber-500/25 bg-amber-500/10 p-3 text-xs text-amber-200 flex items-start justify-between gap-3">
          <div className="space-y-0.5">
            <div className="font-semibold text-amber-300 flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4" />
              <span>Akun Admin Resmi:</span>
            </div>
            <div className="text-[11px] text-neutral-300">
              Email: <span className="font-mono text-white">tn.timbu@gmail.com</span>
            </div>
            <div className="text-[11px] text-neutral-300">
              Password: <span className="font-mono text-white">Eklesia_030918*</span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleFillDefault}
            className="text-[11px] font-bold text-amber-400 hover:text-amber-300 underline underline-offset-2 shrink-0 py-1"
          >
            Gunakan Akun
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
              Email / Username Admin
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                <Mail className="h-4 w-4" />
              </div>
              <input
                type="email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="tn.timbu@gmail.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-700/80 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-mono"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-neutral-300">
                Kata Sandi (Password)
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[11px] text-neutral-400 hover:text-neutral-200"
              >
                {showPassword ? 'Sembunyikan' : 'Tampilkan'}
              </button>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                <KeyRound className="h-4 w-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-700/80 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-mono"
              />
            </div>
          </div>

          {errorMsg && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-bold text-sm shadow-lg shadow-amber-500/20 active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Memverifikasi...</span>
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4" />
                  <span>Masuk ke Panel Admin</span>
                </>
              )}
            </button>
          </div>
        </form>

        <p className="mt-4 text-center text-[11px] text-neutral-500">
          Akses khusus pengelola radio untuk mengatur siaran dan lagu.
        </p>
      </div>
    </div>
  );
};
