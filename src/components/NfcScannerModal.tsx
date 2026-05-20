import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { clearLatestUnlock } from '../firebaseHelper';
import { Globe, Waves, Flame, UtensilsCrossed, Sparkles } from 'lucide-react';

const gifts = [
  { id: 1, title: 'Regalo 1', icon: Globe },
  { id: 2, title: 'Regalo 2', icon: Waves },
  { id: 3, title: 'Regalo 3', icon: Flame },
  { id: 4, title: 'Regalo 4', icon: UtensilsCrossed },
  { id: 5, title: 'Regalo 5', icon: Sparkles },
];

export function NfcScannerModal({ levelId, onComplete }: { levelId: number, onComplete: (id: number) => void }) {
  const [phase, setPhase] = useState<'analyzing' | 'confirmed' | 'reveal'>('analyzing');

  useEffect(() => {
    // Sequence: 3s analyzing -> confirmed -> 1s hold -> reveal + confetti
    const t1 = setTimeout(() => {
      setPhase('confirmed');
      const t2 = setTimeout(() => {
        setPhase('reveal');
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#06b6d4', '#f43f5e', '#a855f7'],
          disableForReducedMotion: true
        });
      }, 1000);
      return () => clearTimeout(t2);
    }, 3000);

    return () => clearTimeout(t1);
  }, []);

  const handlePlay = async () => {
    await clearLatestUnlock();
    onComplete(levelId);
  };

  const activeGift = gifts.find(g => g.id === levelId) || gifts[0];
  const Icon = activeGift.icon;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-white/95 flex flex-col items-center justify-center p-6 text-[#5F4B66] overflow-hidden"
    >
      <div className="relative w-64 h-64 md:w-80 md:h-80 flex flex-col items-center justify-center mb-10">
        
        {/* Silhouette / Real icon */}
        <AnimatePresence mode="wait">
          {phase !== 'reveal' ? (
            <motion.div
              key="silhouette"
              exit={{ opacity: 0, scale: 1.2, filter: 'blur(20px)' }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <Icon className="w-40 h-40 md:w-48 md:h-48 text-[#9D84A3]/50 drop-shadow-xl" strokeWidth={1} />
            </motion.div>
          ) : (
            <motion.div
              key="reveal"
              initial={{ opacity: 0, scale: 0.5, filter: 'brightness(2)' }}
              animate={{ opacity: 1, scale: 1, filter: 'brightness(1)' }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="absolute inset-0 flex flex-col items-center justify-center"
            >
              <div className="bg-gradient-to-br from-[#FF8BA7] to-pink-300 p-8 rounded-full shadow-[0_0_100px_rgba(255,139,167,0.6)]">
                <Icon className="w-24 h-24 text-white" strokeWidth={2} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Laser scanner animation (only during analyzing) */}
        <AnimatePresence>
          {phase === 'analyzing' && (
            <motion.div
              initial={{ top: '0%' }}
              animate={{ top: '100%' }}
              transition={{ repeat: Infinity, repeatType: 'reverse', duration: 1.5, ease: 'linear' }}
              className="absolute left-[-20%] right-[-20%] h-1 bg-[#FF8BA7] z-10 shadow-[0_0_30px_rgba(255,139,167,0.8)] overflow-visible"
            >
              <div className="absolute inset-0 bg-[#FF8BA7] blur-md h-3 -mt-1 opacity-50" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Terminal Log */}
      <div className="text-center font-mono h-24 flex flex-col items-center justify-center">
        {phase === 'analyzing' && (
          <motion.p 
            animate={{ opacity: [1, 0.5, 1] }} 
            transition={{ repeat: Infinity, duration: 1 }}
            className="text-[#FF8BA7] text-xl tracking-widest font-bold"
          >
            [ ANALIZANDO FRECUENCIA NFC... ]
          </motion.p>
        )}
        {phase === 'confirmed' && (
          <motion.p 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-[#D1495B] text-2xl font-bold tracking-widest drop-shadow-[0_2px_5px_rgba(209,73,91,0.3)]"
          >
            [ ¡VÍNCULO CONFIRMADO! ]
          </motion.p>
        )}
        {phase === 'reveal' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="flex flex-col items-center gap-6 z-20 relative"
          >
            <h2 className="text-4xl font-bold text-[#D1495B]">
              ¡Nivel {activeGift.id} Desbloqueado!
            </h2>
            <button
              onClick={handlePlay}
              className="px-8 py-4 bg-[#FF8BA7] text-white rounded-full font-bold text-xl hover:scale-105 active:scale-95 transition-transform shadow-[0_4px_15px_rgba(255,139,167,0.5)]"
            >
              Continuar
            </button>
          </motion.div>
        )}
      </div>

    </motion.div>
  );
}
