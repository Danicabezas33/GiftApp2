import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { setLatestUnlock } from '../firebaseHelper';
import { CheckCircle2, Loader2 } from 'lucide-react';

export function MobileScanner({ id }: { id: number }) {
  const [status, setStatus] = useState<'sending' | 'success' | 'error'>('sending');
  const [errorMsg, setErrorMsg] = useState<string>('');

  useEffect(() => {
    const sendPulse = async () => {
      try {
        await setLatestUnlock(id);
        setStatus('success');
      } catch (err: any) {
        console.error("Firebase write error:", err);
        setErrorMsg(err.message || String(err));
        setStatus('error');
      }
    };
    sendPulse();
  }, [id]);

  return (
    <div className="fixed inset-0 bg-stone-900 flex flex-col items-center justify-center text-white p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center text-center max-w-sm w-full bg-stone-800 p-8 rounded-[2rem] shadow-2xl border border-stone-700"
      >
        {status === 'sending' && (
          <>
            <Loader2 className="w-16 h-16 text-cyan-400 animate-spin mb-6" />
            <h2 className="text-2xl font-bold mb-2">Enviando señal...</h2>
            <p className="text-stone-400">Estableciendo vínculo con la tablet</p>
          </>
        )}
        
        {status === 'success' && (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [1.2, 1] }}
              transition={{ type: "spring", bounce: 0.6 }}
            >
              <CheckCircle2 className="w-20 h-20 text-emerald-400 mb-6 drop-shadow-[0_0_15px_rgba(52,211,153,0.5)]" />
            </motion.div>
            <h2 className="text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-emerald-300 to-cyan-300">
              ✨ ¡Señal enviada!
            </h2>
            <p className="text-stone-300 text-lg mb-8">
              Mira la tablet para continuar
            </p>
            <div className="w-full h-1 bg-stone-700 rounded-full overflow-hidden">
               <motion.div 
                 initial={{ width: 0 }}
                 animate={{ width: "100%" }}
                 transition={{ duration: 2, ease: "linear" }}
                 className="h-full bg-emerald-400"
               />
            </div>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mb-6">
              <span className="text-2xl font-bold">!</span>
            </div>
            <h2 className="text-2xl font-bold mb-2">Error de conexión</h2>
            <p className="text-stone-400 mb-2">Por favor, inténtalo de nuevo.</p>
            {errorMsg && <p className="text-xs text-red-400 bg-red-950/50 p-2 rounded max-w-full break-words">{errorMsg}</p>}
          </>
        )}
      </motion.div>
    </div>
  );
}
