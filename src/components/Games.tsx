import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import { Lock, Unlock, Globe, Sparkles, UtensilsCrossed, Flame, Waves, X, RadioReceiver } from 'lucide-react';
import { listenToLatestUnlock } from '../firebaseHelper';
import { NfcScannerModal } from './NfcScannerModal';

import { ScratchCard } from './ScratchCard';
import { MinigameRunner } from './MinigameRunner';
import { MinigameSlasher } from './MinigameSlasher';
import { MinigameSushiStacker } from './MinigameSushiStacker';
import { MinigameMaze } from './MinigameMaze';
import { MinigameCherryBlossom } from './MinigameCherryBlossom';

const gifts = [
  { id: 1, title: 'Regalo 1', icon: Globe, description: 'Supera la primera prueba para desbloquear un paseo virtual a través de nuestra historia.' },
  { id: 2, title: 'Regalo 2', icon: Waves, description: 'Relajación máxima y desconexión total. Te lo mereces.' },
  { id: 3, title: 'Regalo 3', icon: Flame, description: 'La intimidad y la calma es la base del alma.' },
  { id: 4, title: 'Regalo 4', icon: UtensilsCrossed, description: '¡Apila sin parar!.' },
  { id: 5, title: 'Regalo 5', icon: Sparkles, description: 'Recuerda que siempre debemos cuidarnos adecuadamente.' },
];

interface GamesProps {
  onUnlockWeb?: () => void;
  key?: string;
}

export function Games({ onUnlockWeb }: GamesProps) {
  const [unlockedLevels, setUnlockedLevels] = useState<number[]>(() => {
    return JSON.parse(localStorage.getItem('unlocked_levels_v4') || '[]');
  });
  const [revealedGift, setRevealedGift] = useState<number | null>(null);
  const [modalPhase, setModalPhase] = useState<'none' | 'minigame' | 'scratch' | 'nfc'>('none');
  const [incomingLevelId, setIncomingLevelId] = useState<number | null>(null);

  useEffect(() => {
    // 1. Trigger web unlock if levels are open
    if (unlockedLevels.length > 0 && onUnlockWeb) {
      onUnlockWeb();
    }

    // 2. Listen to Firebase for MFC unlock
    const unsubscribe = listenToLatestUnlock((data) => {
      if (data && data.levelId && typeof data.levelId === 'number') {
        const id = data.levelId;
        // Check if it's a valid ID by reading the most recent state using functional update
        // We use setUnlockedLevels just to access the latest state without putting it in dependency array
        setUnlockedLevels(currentLevels => {
          if (id >= 1 && id <= 5 && !currentLevels.includes(id)) {
            setIncomingLevelId(id);
            setModalPhase('nfc');
          }
          return currentLevels;
        });
      }
    });

    return () => unsubscribe();
  }, [onUnlockWeb]);

  const handleNfcComplete = (id: number) => {
    // Permanently unlock it
    const newUnlocked = [...new Set([...unlockedLevels, id])];
    setUnlockedLevels(newUnlocked);
    localStorage.setItem('unlocked_levels_v4', JSON.stringify(newUnlocked));
    
    setIncomingLevelId(null);
    setRevealedGift(id);
    setModalPhase('minigame');
    
    if (onUnlockWeb) onUnlockWeb();
  };

  const abrirNivel = (id: number) => {
    setRevealedGift(id);
    setModalPhase('minigame');
  };

  const handleMinigameWin = () => {
    setModalPhase('scratch');
  };

  const handleScratchComplete = () => {
    setModalPhase('none');
    setRevealedGift(null);
  };

  const activeGift = gifts.find(g => g.id === revealedGift);

  return (
    <motion.section
      id="juegos"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-5xl mx-auto px-4 py-8"
    >
      <div className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-script font-bold text-rose-600 mb-4">¡Difruta de los regalos!</h2>
        
        <div className="flex items-center justify-center gap-3 text-cyan-600 bg-cyan-50 border border-cyan-200 py-3 px-6 rounded-full max-w-sm mx-auto shadow-sm mt-6">
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <RadioReceiver className="w-5 h-5" />
          </motion.div>
          <span className="font-mono text-sm tracking-wide">Esperando conexión con objeto físico...</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 justify-center">
        {gifts.map((gift) => {
          const isUnlocked = unlockedLevels.includes(gift.id);
          return (
            <motion.div
              key={gift.id}
              whileHover={isUnlocked ? { y: -5 } : {}}
              onClick={() => isUnlocked && abrirNivel(gift.id)}
              className={`relative overflow-hidden rounded-3xl p-8 transition-all duration-300 md:min-h-[240px] flex flex-col items-center justify-center text-center
                ${isUnlocked 
                  ? 'bg-white shadow-xl shadow-rose-100 hover:shadow-2xl hover:shadow-rose-200 border-2 border-rose-100 cursor-pointer group' 
                  : 'bg-stone-50/50 shadow-sm border border-stone-200 pointer-events-none opacity-60'
                }`}
            >
              {!isUnlocked && (
                <div className="absolute top-4 right-4 text-stone-400">
                  <Lock className="w-6 h-6" />
                </div>
              )}
              {isUnlocked && (
                <div className="absolute top-4 right-4 text-rose-300 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Unlock className="w-6 h-6" />
                </div>
              )}

              <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-colors ${
                isUnlocked ? 'bg-rose-100 text-rose-500 group-hover:bg-rose-500 group-hover:text-white' : 'bg-stone-200 text-stone-400'
              }`}>
                <gift.icon className="w-8 h-8" />
              </div>
              
              <h3 className={`text-xl font-serif font-bold mb-2 ${isUnlocked ? 'text-gray-800' : 'text-stone-400'}`}>
                Nivel {gift.id}
              </h3>
              <p className={`font-medium ${isUnlocked ? 'text-rose-600' : 'text-stone-400'}`}>
                {isUnlocked ? gift.title : 'Bloqueado'}
              </p>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-20 flex flex-col sm:flex-row items-center justify-center gap-6">
        <button
          onClick={() => {
            localStorage.removeItem('unlocked_levels_v4');
            window.location.reload();
          }}
          className="text-stone-400 hover:text-rose-400 text-sm font-serif transition-colors"
        >
          Resetear Progreso de Juegos
        </button>
        <button
          onClick={() => {
            localStorage.setItem('unlocked_levels_v4', JSON.stringify([1,2,3,4,5]));
            window.location.reload();
          }}
          className="text-stone-400 hover:text-rose-400 text-sm font-serif transition-colors"
        >
          Forzar Desbloqueo (Tablet)
        </button>
      </div>

      <AnimatePresence>
        {modalPhase === 'nfc' && incomingLevelId && (
          <NfcScannerModal 
            levelId={incomingLevelId} 
            onComplete={handleNfcComplete} 
          />
        )}

        {revealedGift && activeGift && modalPhase === 'scratch' && (
          <ScratchCard
            tipoRegalo={activeGift.title}
            imagenRegalo={`/photos/year1-1.jpg`} 
            onClose={() => {
              setRevealedGift(null);
              setModalPhase('none');
            }}
            onComplete={handleScratchComplete}
          />
        )}
        
        {revealedGift && activeGift && modalPhase === 'minigame' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-white/60 backdrop-blur-md"
            onClick={() => {
              setRevealedGift(null);
              setModalPhase('none');
            }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl overflow-hidden shadow-2xl max-w-md w-full relative border border-rose-100 text-center"
              onClick={e => e.stopPropagation()}
            >
              <button 
                onClick={() => {
                  setRevealedGift(null);
                  setModalPhase('none');
                }}
                className="absolute top-4 right-4 bg-gray-50 hover:bg-gray-100 text-gray-800 rounded-full p-2 z-20 transition-colors shadow-sm"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="bg-rose-500 py-10 px-6 relative overflow-hidden">
                <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
                <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/20 rounded-full blur-2xl"></div>
                <activeGift.icon className="w-20 h-20 text-white mx-auto relative z-10" />
              </div>

              <div className="p-8">
                <span className="inline-block px-3 py-1 bg-rose-100 text-rose-600 text-xs font-bold tracking-widest uppercase rounded-full mb-4">
                  Desbloqueado
                </span>
                <h3 className="text-3xl font-serif font-bold text-gray-800 mb-4">{activeGift.title} Minijuego</h3>
                <div className="mb-6 w-full">
                  {activeGift.id === 1 ? (
                    <MinigameRunner onWin={handleMinigameWin} />
                  ) : activeGift.id === 2 ? (
                    <MinigameCherryBlossom onWin={handleMinigameWin} />
                  ) : activeGift.id === 3 ? (
                    <MinigameMaze onWin={handleMinigameWin} />
                  ) : activeGift.id === 4 ? (
                    <MinigameSushiStacker onWin={handleMinigameWin} />
                  ) : activeGift.id === 5 ? (
                    <MinigameSlasher onWin={handleMinigameWin} />
                  ) : (
                    <p className="text-gray-600 text-lg leading-relaxed text-center">
                      Próximamente...
                    </p>
                  )}
                </div>
                <button
                  onClick={() => {
                    setRevealedGift(null);
                    setModalPhase('none');
                  }}
                  className="w-full py-4 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-xl font-bold text-lg hover:from-rose-600 hover:to-pink-600 transition-all shadow-md transform hover:-translate-y-0.5"
                >
                  Cerrar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
 