import React, { useState } from 'react';
import { ArrowLeft, LockKeyhole } from 'lucide-react';
import { loginAdmin } from '../data/contentStore';
import { Logo } from './Logo';

export const AdminLogin: React.FC<{ onSuccess: (password: string) => void; onExit: () => void }> = ({ onSuccess, onExit }) => {
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setStatus('Vérification…');
    try {
      await loginAdmin(password);
      onSuccess(password);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Mot de passe incorrect.');
    } finally {
      setBusy(false);
    }
  };

  return <div className="flex min-h-screen items-center justify-center bg-[#070707] px-4 text-white font-body">
    <form onSubmit={submit} className="w-full max-w-md rounded-2xl border border-white/10 bg-[#111] p-5 shadow-2xl sm:p-7">
      <button type="button" onClick={onExit} className="mb-6 flex min-h-11 items-center gap-2 rounded-xl border border-white/10 px-3 text-xs font-bold text-white/70 hover:bg-white/10"><ArrowLeft className="h-4 w-4" />Voir le site</button>
      <div className="mb-6 flex items-center gap-3">
        <span className="rounded-lg bg-white px-2 py-1"><Logo className="h-10 w-auto" /></span>
        <div><p className="text-[10px] font-black uppercase tracking-[.2em] text-[#FFD800]">Administration</p><h1 className="text-xl font-black">Accès dashboard</h1></div>
      </div>
      <label><span className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-white/45">Mot de passe administrateur</span><input autoFocus type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} className="min-h-12 w-full rounded-xl border border-white/10 bg-black/35 px-3 py-2 text-base text-white outline-none focus:border-[#FFD800]/70" placeholder="1234" /></label>
      <button disabled={busy || !password} className="mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#C81024] px-4 text-sm font-black text-white disabled:opacity-50"><LockKeyhole className="h-4 w-4" />Entrer</button>
      {status && <p role="status" aria-live="polite" className="mt-3 text-sm text-[#FFD800]">{status}</p>}
    </form>
  </div>;
};
