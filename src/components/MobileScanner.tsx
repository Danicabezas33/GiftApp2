import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { setLatestUnlock, getGlobalUnlockedLevels } from '../firebaseHelper';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';

export function MobileScanner({ id }: { id: number }) {
  const [status, setStatus] = useState<'sending' | 'success' | 'error' | 'invalid'>('sending');
  const [errorMsg, setErrorMsg] = useState<string>('');

  useEffect(() => {
    const sendPulse = async () => {
      try {
        const firebaseLevels = await getGlobalUnlockedLevels();
        const unlockedLevels = firebaseLevels;
        
        // Validation check
        if (id < 1 || id > 5) {
          setErrorMsg('Objeto no reconocido.');
          setStatus('invalid');
          return;
        }

        if (unlockedLevels.includes(id)) {
          // Already unlocked, maybe just allow it through or say already unlocked?
          // Let's just allow it for now, it's valid.
        } else {
          // It's a new unlock. Check if it's the right next one (1, or consecutive)
          const isExpectedOrder = id === 1 || unlockedLevels.includes(id - 1);
          if (!isExpectedOrder) {
            setErrorMsg(`¡Objeto incorrecto!`);
            setStatus('invalid');
            return;
          }
        }

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
    <div className="fixed inset-0 bg-[#FAF8F5] flex flex-col items-center justify-center text-[#5F4B66] p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center text-center max-w-sm w-full bg-white p-8 rounded-[2rem] shadow-xl shadow-pink-100/50 border border-pink-50"
      >
        {status === 'sending' && (
          <>
            <Loader2 className="w-16 h-16 text-[#FF8BA7] animate-spin mb-6" />
            <h2 className="text-2xl font-bold mb-2 font-serif text-[#D1495B]">Enviando señal...</h2>
            <p className="text-[#9D84A3]">Estableciendo vínculo con la tablet</p>
          </>
        )}
        
        {status === 'success' && (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [1.2, 1] }}
              transition={{ type: "spring", bounce: 0.6 }}
            >
              <CheckCircle2 className="w-20 h-20 text-[#FF8BA7] mb-6 drop-shadow-md" />
            </motion.div>
            <h2 className="text-3xl font-bold mb-4 font-serif text-[#D1495B]">
              ✨ ¡Señal enviada!
            </h2>
            <p className="text-[#9D84A3] text-lg mb-8">
              Mira la tablet para continuar
            </p>
            <div className="w-full h-1 bg-pink-50 rounded-full overflow-hidden">
               <motion.div 
                 initial={{ width: 0 }}
                 animate={{ width: "100%" }}
                 transition={{ duration: 2, ease: "linear" }}
                 className="h-full bg-[#FF8BA7]"
               />
            </div>
          </>
        )}

        {status === 'invalid' && (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [1.2, 1] }}
              transition={{ type: "spring", bounce: 0.6 }}
            >
              <XCircle className="w-20 h-20 text-rose-500 mb-6 drop-shadow-md" />
            </motion.div>
            <h2 className="text-3xl font-bold mb-4 font-serif text-rose-500">
              ¡Objeto incorrecto!
            </h2>
            <p className="text-[#9D84A3] text-lg mb-2">
              Este no es el regalo que toca ahora mismo.
            </p>
            <p className="text-[#5F4B66]/60 text-sm">Escanea el objeto correcto para continuar.</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-6">
              <span className="text-2xl font-bold font-serif">!</span>
            </div>
            <h2 className="text-2xl font-bold mb-2 font-serif text-rose-600">Error de conexión</h2>
            <p className="text-[#9D84A3] mb-2">Por favor, inténtalo de nuevo.</p>
            {errorMsg && <p className="text-xs text-rose-600 bg-rose-50 p-2 rounded max-w-full break-words">{errorMsg}</p>}
          </>
        )}
      </motion.div>
    </div>
  );
}

export default MobileScanner;
