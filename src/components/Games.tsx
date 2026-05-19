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
      className="max-w-5xl mx-auto px-4 py-8 w-full"
    >
      {unlockedLevels.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[75vh] text-center px-4 w-full max-w-2xl mx-auto">
          <motion.div
             initial={{ scale: 0.5, opacity: 0 }}
             animate={{ scale: 1, opacity: 1 }}
             transition={{ duration: 1, type: "spring" }}
             className="relative mb-12"
          >
            <motion.div
               animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.3, 0.1] }}
               transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
               className="absolute inset-0 bg-petal-pink rounded-full blur-[80px] -z-10"
            />
            <div className="w-64 h-64 glass rounded-full flex items-center justify-center border-white/10 shadow-[0_0_50px_rgba(255,139,167,0.1)]">
               <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
                  className="absolute inset-4 rounded-full border border-dashed border-petal-pink/20"
               />
               <RadioReceiver className="w-24 h-24 text-white/80" strokeWidth={1} />
            </div>
          </motion.div>
          
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
          >
            <h2 className="text-4xl md:text-7xl font-script text-white mb-6 drop-shadow-[0_0_10px_rgba(255,139,167,0.3)]">
              Tu regalo te espera
            </h2>
            <p className="text-lg md:text-2xl text-pink-100/60 max-w-lg mx-auto font-serif leading-relaxed mb-12">
              Acerca el primer objeto al escáner NFC para comenzar el viaje...
            </p>
            
            <div className="inline-flex items-center gap-5 glass py-3 px-8 md:py-4 md:px-10 rounded-full border-white/5">
               <div className="flex space-x-1.5">
                  <motion.div animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.2, 0.8] }} transition={{ repeat: Infinity, duration: 2, times: [0, 0.5, 1] }} className="w-2 h-2 bg-petal-pink rounded-full" />
                  <motion.div animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.2, 0.8] }} transition={{ repeat: Infinity, duration: 2, delay: 0.4, times: [0, 0.5, 1] }} className="w-2 h-2 bg-petal-pink rounded-full" />
                  <motion.div animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.2, 0.8] }} transition={{ repeat: Infinity, duration: 2, delay: 0.8, times: [0, 0.5, 1] }} className="w-2 h-2 bg-petal-pink rounded-full" />
               </div>
               <span className="text-sm font-mono font-bold text-petal-pink uppercase tracking-[0.3em]">Buscando...</span>
            </div>
          </motion.div>
        </div>
      ) : (
        <>
          <div className="text-center mb-10 md:mb-16">
            <h2 className="text-4xl md:text-7xl font-script text-white mb-6 drop-shadow-[0_0_10px_rgba(255,139,167,0.2)]">Disfruta de los regalos</h2>
            
            <div className="flex items-center justify-center gap-4 glass py-3 px-8 rounded-full max-w-sm mx-auto border-white/5 mt-8 border">
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.8, 0.4] }}
                transition={{ repeat: Infinity, duration: 3 }}
              >
                <RadioReceiver className="w-5 h-5 text-petal-pink" />
              </motion.div>
              <span className="font-mono text-xs tracking-[0.2em] uppercase text-white/40">Esperando conexión física...</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-center">
            {gifts.map((gift) => {
              const isCompleted = unlockedLevels.includes(gift.id);
              const nextToUnlock = Math.max(0, ...unlockedLevels) + 1;
              const isActive = gift.id === nextToUnlock && gift.id <= 5;
              const isLocked = gift.id > nextToUnlock;

              return (
                <motion.div
                  key={gift.id}
                  whileHover={(isCompleted || isActive) ? { y: -8, scale: 1.02 } : {}}
                  onClick={() => isCompleted && abrirNivel(gift.id)}
                  className={`relative overflow-hidden rounded-[2.5rem] p-10 transition-all duration-500 md:min-h-[280px] flex flex-col items-center justify-center text-center border group
                    ${isCompleted 
                      ? 'glass hover:border-white/20 cursor-pointer' 
                      : isActive
                        ? 'bg-petal-pink text-zen-bg border-petal-pink shadow-[0_0_40px_rgba(255,139,167,0.4)] animate-pulse cursor-default'
                        : 'bg-white/[0.02] border-white/[0.05] pointer-events-none opacity-30 filter grayscale brightness-75'
                    }`}
                >
                  {isLocked && (
                    <div className="absolute top-6 right-6 text-white/10">
                      <Lock className="w-7 h-7" />
                    </div>
                  )}
                  {isCompleted && (
                    <div className="absolute top-6 right-6 text-petal-pink/40 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Unlock className="w-7 h-7" />
                    </div>
                  )}
                  {isActive && (
                    <div className="absolute top-6 right-6 text-zen-bg/40">
                      <RadioReceiver className="w-7 h-7 animate-spin-slow" />
                    </div>
                  )}

                  <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 transition-all duration-500 ${
                    isCompleted 
                      ? 'bg-white/5 text-petal-pink group-hover:bg-petal-pink group-hover:text-zen-bg shadow-inner group-hover:shadow-[0_0_30px_rgba(255,139,167,0.4)]' 
                      : isActive
                        ? 'bg-zen-bg/20 text-zen-bg'
                        : 'bg-white/[0.02] text-white/10'
                  }`}>
                    <gift.icon className={`w-10 h-10 transition-transform duration-500 ${(isCompleted || isActive) ? 'group-hover:scale-110' : ''}`} />
                  </div>
                  
                  <h3 className={`text-2xl font-serif font-bold mb-2 ${
                    isCompleted ? 'text-white' : isActive ? 'text-zen-bg' : 'text-white/20'
                  }`}>
                    Nivel {gift.id}
                  </h3>
                  <p className={`font-medium tracking-wide ${
                    isCompleted ? 'text-petal-pink' : isActive ? 'text-zen-bg/60' : 'text-white/10'
                  }`}>
                    {isCompleted ? gift.title : isActive ? 'Escanea para desbloquear' : 'Bloqueado'}
                  </p>
                  
                  {isCompleted && (
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="mt-4 px-4 py-1 bg-petal-pink/10 border border-petal-pink/20 rounded-full text-[10px] text-petal-pink font-bold uppercase tracking-widest"
                    >
                      Completado
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </>
      )}

      {unlockedLevels.length > 0 && (
        <div className="mt-20 flex flex-col sm:flex-row items-center justify-center gap-8">
          <button
            onClick={async () => {
              localStorage.removeItem('unlocked_levels_v4');
              localStorage.removeItem('web_unlocked_v4');
              await syncGlobalUnlockedLevels([]);
              window.location.reload();
            }}
            className="text-white/20 hover:text-petal-pink text-xs font-mono tracking-widest uppercase transition-all duration-300"
          >
            Resetear Progreso
          </button>
          <button
            onClick={async () => {
              const fullLevels = [1,2,3,4,5];
              localStorage.setItem('unlocked_levels_v4', JSON.stringify(fullLevels));
              await syncGlobalUnlockedLevels(fullLevels);
              window.location.reload();
            }}
            className="text-white/20 hover:text-petal-pink text-xs font-mono tracking-widest uppercase transition-all duration-300"
          >
            Forzar Desbloqueo
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
            className="fixed inset-0 z-[120] bg-zen-bg/90 backdrop-blur-2xl flex flex-col items-center justify-center p-6 text-white text-center"
          >
            <motion.div
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="glass p-12 md:p-16 rounded-[3rem] shadow-[0_0_100px_rgba(255,139,167,0.1)] max-w-lg w-full relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-petal-pink to-zen-lavender" />
              <Globe className="w-24 h-24 text-petal-pink mx-auto mb-8 drop-shadow-[0_0_15px_rgba(255,139,167,0.5)]" />
              <h2 className="text-4xl md:text-5xl font-script font-bold mb-6 text-white">
                ¡Página web desbloqueada!
              </h2>
              <p className="text-xl text-white/60 mb-10 font-serif leading-relaxed">
                Ahora tienes acceso a la experiencia completa. Explora la historia, recuerdos y la música de fondo.
              </p>
              <button
                onClick={() => {
                  setModalPhase('none');
                  if (onUnlockWeb) onUnlockWeb();
                  if (onNavigateHome) onNavigateHome();
                }}
                className="w-full py-5 bg-petal-pink text-zen-bg rounded-2xl font-bold text-xl hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_30px_rgba(255,139,167,0.4)]"
              >
                Comenzar experiencia
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
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zen-bg/80 backdrop-blur-xl"
            onClick={() => {
              setRevealedGift(null);
              setModalPhase('none');
            }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="glass rounded-[2.5rem] overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] max-w-lg w-full relative border-white/10 text-center flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              <button 
                onClick={() => {
                  setRevealedGift(null);
                  setModalPhase('none');
                }}
                className="absolute top-6 right-6 text-white/20 hover:text-white transition-colors z-20"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="bg-petal-pink/10 py-12 px-6 relative overflow-hidden border-b border-white/5">
                <div className="absolute top-[-20%] left-[-20%] w-[140%] h-[140%] bg-petal-pink/5 blur-[60px] rounded-full -z-10" />
                <activeGift.icon className="w-20 h-20 text-petal-pink mx-auto relative z-10 drop-shadow-[0_0_15px_rgba(255,139,167,0.3)]" />
              </div>

              <div className="p-8 md:p-12 flex flex-col flex-1">
                <span className="inline-block px-4 py-1 bg-petal-pink text-zen-bg text-[10px] font-bold tracking-[0.3em] uppercase rounded-full mb-6 mx-auto">
                  Misión Desbloqueada
                </span>
                <h3 className="text-3xl font-serif font-bold text-white mb-6">Mini-Desafío {activeGift.id}</h3>
                <div className="mb-10 w-full overflow-hidden flex-1 min-h-[300px]">
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
                    <p className="text-white/40 text-lg leading-relaxed text-center font-serif py-20">
                      Próximamente...
                    </p>
                  )}
                </div>
                <button
                  onClick={() => {
                    setRevealedGift(null);
                    setModalPhase('none');
                  }}
                  className="w-full py-5 border border-white/10 hover:bg-white/5 text-white/40 hover:text-white rounded-2xl font-bold text-lg transition-all duration-500"
                >
                  Cancelar desafío
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
 