import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect, useRef } from 'react';
import { Lock, Unlock, Globe, Sparkles, UtensilsCrossed, Flame, Waves, X, RadioReceiver } from 'lucide-react';
import { listenToLatestUnlock, syncGlobalUnlockedLevels } from '../firebaseHelper';
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
  onNavigateHome?: () => void;
  key?: string;
}

export function Games({ onUnlockWeb, onNavigateHome }: GamesProps) {
  const [unlockedLevels, setUnlockedLevels] = useState<number[]>(() => {
    return JSON.parse(localStorage.getItem('unlocked_levels_v4') || '[]');
  });
  
  const unlockedLevelsRef = useRef<number[]>(unlockedLevels);
  useEffect(() => {
    unlockedLevelsRef.current = unlockedLevels;
  }, [unlockedLevels]);

  const [revealedGift, setRevealedGift] = useState<number | null>(null);
  const [modalPhase, setModalPhase] = useState<'none' | 'minigame' | 'scratch' | 'nfc' | 'web_unlocked'>('none');
  const [incomingLevelId, setIncomingLevelId] = useState<number | null>(null);

  useEffect(() => {
    // 1. Trigger web unlock if levels are open
    if (unlockedLevelsRef.current.length > 0 && onUnlockWeb) {
      onUnlockWeb();
    }

    // 2. Listen to Firebase for MFC unlock
    const unsubscribe = listenToLatestUnlock((data) => {
      if (data && data.levelId && typeof data.levelId === 'number') {
        const id = data.levelId;
        const currentLevels = unlockedLevelsRef.current;
        
        if (id >= 1 && id <= 5 && !currentLevels.includes(id)) {
          // Check order: Must unlock 1 first, then 2, etc.
          const isExpectedOrder = id === 1 || currentLevels.includes(id - 1);
          if (isExpectedOrder) {
            setIncomingLevelId(id);
            setModalPhase('nfc');
          } else {
            console.log(`Scan ignorado: se esperaba nivel previo antes de ${id}.`);
          }
        }
      }
    });

    return () => unsubscribe();
  }, [onUnlockWeb]);

  const handleNfcComplete = (id: number) => {
    // Permanently unlock it
    const newUnlocked = [...new Set([...unlockedLevels, id])];
    setUnlockedLevels(newUnlocked);
    localStorage.setItem('unlocked_levels_v4', JSON.stringify(newUnlocked));
    syncGlobalUnlockedLevels(newUnlocked);
    
    setIncomingLevelId(null);
    setRevealedGift(id);
    setModalPhase('minigame');
  };

  const abrirNivel = (id: number) => {
    setRevealedGift(id);
    setModalPhase('minigame');
  };

  const handleMinigameWin = () => {
    setModalPhase('scratch');
  };

  const handleScratchComplete = () => {
    if (activeGift && activeGift.id === 1) {
       const isWebUnlocked = localStorage.getItem('web_unlocked_v4') === 'true';
       if (!isWebUnlocked) {
           setModalPhase('web_unlocked');
           return;
       }
    }
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
      {unlockedLevels.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[75vh] text-center px-4 w-full max-w-2xl mx-auto">
          <motion.div
             initial={{ scale: 0.5, opacity: 0 }}
             animate={{ scale: 1, opacity: 1 }}
             transition={{ duration: 0.8, ease: "easeOut" }}
             className="relative mb-12"
          >
            <motion.div
               animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
               transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
               className="absolute inset-0 bg-cyan-400 rounded-full blur-[80px] -z-10"
            />
            <div className="w-56 h-56 bg-white/40 backdrop-blur-md rounded-full flex items-center justify-center border-[8px] border-white/60 shadow-[0_0_50px_rgba(255,255,255,0.3)]">
               <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
                  className="absolute inset-2 rounded-full border-2 border-dashed border-cyan-400/30"
               />
               <RadioReceiver className="w-28 h-28 text-cyan-600" strokeWidth={1} />
            </div>
          </motion.div>
          
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-6xl font-script font-bold text-rose-600 mb-6 drop-shadow-sm">
              Tu regalo te espera
            </h2>
            <p className="text-xl md:text-2xl text-stone-600 max-w-lg mx-auto font-serif leading-relaxed mb-10 decoration-rose-200 decoration-wavy underline underline-offset-8">
              Acerca el primer objeto al escáner NFC para comenzar el viaje...
            </p>
            
            <div className="inline-flex items-center gap-4 bg-white/60 backdrop-blur-sm border border-cyan-100 py-3 px-8 rounded-full shadow-lg">
               <div className="flex space-x-1">
                  <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1.5, times: [0, 0.5, 1] }} className="w-2 h-2 bg-cyan-400 rounded-full" />
                  <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.2, times: [0, 0.5, 1] }} className="w-2 h-2 bg-cyan-400 rounded-full" />
                  <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.4, times: [0, 0.5, 1] }} className="w-2 h-2 bg-cyan-400 rounded-full" />
               </div>
               <span className="text-sm font-mono font-bold text-cyan-600 uppercase tracking-widest">Escaneando...</span>
            </div>
          </motion.div>
        </div>
      ) : (
        <>
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
        </>
      )}

      {unlockedLevels.length > 0 && (
        <div className="mt-20 flex flex-col sm:flex-row items-center justify-center gap-6">
          <button
            onClick={async () => {
              localStorage.removeItem('unlocked_levels_v4');
              localStorage.removeItem('web_unlocked_v4');
              await syncGlobalUnlockedLevels([]);
              window.location.reload();
            }}
            className="text-stone-400 hover:text-rose-400 text-sm font-serif transition-colors"
          >
            Resetear Progreso de Juegos
          </button>
          <button
            onClick={async () => {
              const fullLevels = [1,2,3,4,5];
              localStorage.setItem('unlocked_levels_v4', JSON.stringify(fullLevels));
              await syncGlobalUnlockedLevels(fullLevels);
              window.location.reload();
            }}
            className="text-stone-400 hover:text-rose-400 text-sm font-serif transition-colors"
          >
            Forzar Desbloqueo (Tablet)
          </button>
        </div>
      )}

      <AnimatePresence>
        {modalPhase === 'nfc' && incomingLevelId && (
          <NfcScannerModal 
            levelId={incomingLevelId} 
            onComplete={handleNfcComplete} 
          />
        )}

        {modalPhase === 'web_unlocked' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-white text-center"
          >
            <motion.div
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white/10 p-12 rounded-3xl border border-white/20 shadow-2xl backdrop-blur-md max-w-md w-full"
            >
              <Globe className="w-24 h-24 text-cyan-400 mx-auto mb-6" />
              <h2 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 to-emerald-300">
                ¡Página web desbloqueada!
              </h2>
              <p className="text-xl text-stone-300 mb-8 font-serif leading-relaxed">
                Ahora tienes acceso a la experiencia completa. Explora la historia, recuerdos y la música de fondo.
              </p>
              <button
                onClick={() => {
                  setModalPhase('none');
                  if (onUnlockWeb) onUnlockWeb();
                  if (onNavigateHome) onNavigateHome();
                }}
                className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full font-bold text-xl hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(34,211,238,0.4)]"
              >
                Ir al Inicio
              </button>
            </motion.div>
          </motion.div>
        )}

        {revealedGift && activeGift && modalPhase === 'scratch' && (
          <ScratchCard
            tipoRegalo={activeGift.title}
            imagenRegalo={`https://raw.githubusercontent.com/Danicabezas33/GiftApp2/main/public/photos/nfc-${activeGift.id === 5 ? 'final' : activeGift.id + 1}.jpg`} 
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
 