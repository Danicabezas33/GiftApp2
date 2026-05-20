import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Droplets, Sun, Snowflake, Heart } from 'lucide-react';

interface MinigameCherryProps {
  onWin: () => void;
}

export function MinigameCherryBlossom({ onWin }: MinigameCherryProps) {
  const [phase, setPhase] = useState<'intro' | 'plant' | 'water' | 'season' | 'bloom' | 'done'>('intro');
  const [waterProgress, setWaterProgress] = useState(0);
  const [seasonProgress, setSeasonProgress] = useState(0);
  const [bloomedBuds, setBloomedBuds] = useState<number[]>([]);
  const isWateringRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const holeRef = useRef<HTMLDivElement>(null);

  const handleSeasonChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    setSeasonProgress(val);
    if (val >= 100) {
      setTimeout(() => setPhase('bloom'), 800);
    }
  };

  const budPositions = [
    { top: 130, left: 295 },
    { top: 60, left: 250 },
    { top: 85, left: 325 },
    { top: 30, left: 220 },
    { top: 35, left: 290 },
    { top: 155, left: 15 },
    { top: 80, left: 25 },
    { top: 55, left: -5 },
    { top: 35, left: 95 },
    { top: 20, left: 40 },
    { top: 15, left: 125 },
    { top: -20, left: 195 }, 
    { top: 100, left: 160 },
    { top: 210, left: 75 },  
    { top: 195, left: 245 }, 
  ];
  const TOTAL_BUDS = budPositions.length;

  useEffect(() => {
    let animationFrameId: number;
    const updateWater = () => {
      if (isWateringRef.current && phase === 'water') {
        setWaterProgress(prev => {
          const next = prev + 0.25; // Adjusted fill speed
          if (next >= 100) {
            setTimeout(() => setPhase('season'), 500); // give it a moment to show 100%
            return 100;
          }
          return next;
        });
      }
      animationFrameId = requestAnimationFrame(updateWater);
    };
    if (phase === 'water') {
      animationFrameId = requestAnimationFrame(updateWater);
    }
    return () => cancelAnimationFrame(animationFrameId);
  }, [phase]);

  const handleBudClick = (index: number) => {
    if (phase !== 'bloom') return;
    if (!bloomedBuds.includes(index)) {
      const newBloomed = [...bloomedBuds, index];
      setBloomedBuds(newBloomed);
      if (newBloomed.length === TOTAL_BUDS) {
        setPhase('done');
        setTimeout(() => {
          onWin();
        }, 6000);
      }
    }
  };

  const handleDragEnd = (event: any, info: any) => {
    if (holeRef.current && typeof holeRef.current.getBoundingClientRect === 'function') {
      const holeRect = holeRef.current.getBoundingClientRect();
      if (holeRect) {
        if (
          info.point.x > holeRect.left - 100 &&
          info.point.x < holeRect.right + 100 &&
          info.point.y > holeRect.top - 100 &&
          info.point.y < holeRect.bottom + 200
        ) {
          setPhase('water');
        }
      }
    }
  };

  return (
    <div 
      ref={containerRef}
      className={`relative w-full h-[70vh] min-h-[400px] max-h-[600px] overflow-hidden rounded-2xl shadow-xl transition-colors duration-1000 select-none ${
        phase === 'season' 
          ? 'bg-gradient-to-b from-sky-400 to-cyan-100'
          : phase === 'bloom' || phase === 'done' 
            ? 'bg-gradient-to-b from-blue-400 to-sky-200'
            : 'bg-gradient-to-b from-indigo-900 via-slate-800 to-stone-800'
      }`}
    >
      {/* Sky Background & Sun */}
      <div className="absolute inset-0 flex justify-center pointer-events-none z-0 overflow-hidden">
         <motion.div 
            initial={false}
            animate={{ 
                opacity: phase === 'intro' || phase === 'plant' || phase === 'water' ? 0.8 : 0
            }}
            className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-800/20 via-transparent to-transparent transition-opacity duration-1000"
         />
         
         {/* The Sun / Moon */}
         <motion.div
           animate={{
             top: phase === 'intro' || phase === 'plant' || phase === 'water' ? '20%' : phase === 'season' ? `${100 - (seasonProgress * 0.8)}%` : '15%',
             left: phase === 'intro' || phase === 'plant' || phase === 'water' ? '80%' : phase === 'season' ? `${seasonProgress}%` : '80%',
             scale: phase === 'bloom' || phase === 'done' ? 1.2 : 1,
             backgroundColor: phase === 'intro' || phase === 'plant' || phase === 'water' ? '#fdf8f6' : '#fef08a',
             boxShadow: phase === 'intro' || phase === 'plant' || phase === 'water' ? '0 0 60px rgba(255,255,255,0.4)' : '0 0 80px rgba(253,224,71,0.9)'
           }}
           transition={{ duration: 1.5, ease: "easeInOut" }}
           className="absolute w-28 h-28 rounded-full blur-2xl flex items-center justify-center pt-2"
           style={{ transform: 'translate(-50%, -50%)' }}
         />
         <motion.div
           animate={{
             top: phase === 'intro' || phase === 'plant' || phase === 'water' ? '20%' : phase === 'season' ? `${100 - (seasonProgress * 0.8)}%` : '15%',
             left: phase === 'intro' || phase === 'plant' || phase === 'water' ? '80%' : phase === 'season' ? `${seasonProgress}%` : '80%',
             scale: phase === 'bloom' || phase === 'done' ? 1.2 : 1,
             backgroundColor: phase === 'intro' || phase === 'plant' || phase === 'water' ? '#ffffff' : '#ffffff'
           }}
           transition={{ duration: 1.5, ease: "easeInOut" }}
           className="absolute w-14 h-14 rounded-full shadow-[0_0_30px_rgba(255,255,255,1)]"
           style={{ transform: 'translate(-50%, -50%)' }}
         >
           {/* Craters for the moon effect */}
           {(phase === 'intro' || phase === 'plant' || phase === 'water') && (
             <>
               <div className="absolute top-3 left-4 w-3 h-3 bg-stone-200/40 rounded-full" />
               <div className="absolute bottom-4 right-3 w-4 h-4 bg-stone-200/30 rounded-full" />
             </>
           )}
         </motion.div>
      </div>

      {/* Ambient Particles */}
      <AnimatePresence>
        {(phase === 'intro' || phase === 'plant' || phase === 'water') && ( // Stars
           <motion.div 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             className="absolute inset-0 pointer-events-none z-0"
           >
              {[...Array(60)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: Math.random() * 0.5 + 0.3 }}
                    animate={{ opacity: [0.3, 0.8, 0.3] }}
                    transition={{ repeat: Infinity, duration: 2 + Math.random() * 3, ease: 'easeInOut' }}
                    className="absolute bg-white rounded-full"
                    style={{ 
                      width: Math.random() > 0.8 ? '2px' : '1px',
                      height: Math.random() > 0.8 ? '2px' : '1px',
                      top: `${Math.random() * 60}%`, 
                      left: `${Math.random() * 100}%` 
                    }}
                  />
              ))}
           </motion.div>
        )}

        {(phase === 'bloom' || phase === 'done') && (
           <motion.div 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             className="absolute inset-0 pointer-events-none z-10 overflow-hidden"
           >
              {[...Array(25)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ y: -50, x: Math.random() * (window.innerWidth || 1000), opacity: 0, scale: Math.random() * 0.5 + 0.5 }}
                    animate={{ 
                      y: (window.innerHeight || 1000) + 50, 
                      x: `calc(${Math.random() * 100}vw + ${(Math.random() - 0.5) * 200}px)`, 
                      opacity: [0, 1, 1, 0],
                      rotate: Math.random() * 360
                    }}
                    transition={{ repeat: Infinity, duration: 4 + Math.random() * 5, ease: 'linear', delay: Math.random() * 5 }}
                    className="absolute w-5 h-5 bg-pink-200/80 rounded-full blur-[1px]"
                    style={{ borderRadius: '50% 0 50% 50%' }}
                  />
              ))}
           </motion.div>
        )}
        {phase === 'season' && seasonProgress < 60 && ( // Snowflakes
           <motion.div 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 - (seasonProgress/60) }}
             exit={{ opacity: 0 }}
             className="absolute inset-0 pointer-events-none z-10 overflow-hidden"
           >
              {[...Array(40)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ y: -50, x: Math.random() * (window.innerWidth || 1000), opacity: 0, scale: Math.random() * 0.5 + 0.5 }}
                    animate={{ 
                      y: (window.innerHeight || 1000) + 50, 
                      x: `calc(${Math.random() * 100}vw + ${(Math.random() - 0.5) * 100}px)`, 
                      opacity: [0, 1, 1, 0]
                    }}
                    transition={{ repeat: Infinity, duration: 3 + Math.random() * 3, ease: 'linear', delay: Math.random() * 3 }}
                    className="absolute w-2 h-2 bg-white/90 rounded-full blur-[1px]"
                  />
              ))}
           </motion.div>
        )}
      </AnimatePresence>

      {/* Storytelling Text */}
      <div className="absolute top-8 left-0 right-0 z-40 flex justify-center pointer-events-none px-4">
        <AnimatePresence mode="wait">
          {phase === 'plant' && (
            <motion.p key="plant" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="text-center font-serif text-stone-100 drop-shadow-md text-lg bg-black/20 px-6 py-2 rounded-full backdrop-blur-sm border border-white/10">
              Cada gran historia comienza con una pequeña semilla. Arrástrala a la tierra.
            </motion.p>
          )}
          {phase === 'water' && (
            <motion.p key="water" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="text-center font-serif text-stone-100 drop-shadow-md text-lg bg-black/20 px-6 py-2 rounded-full backdrop-blur-sm border border-white/10">
              El cuidado y la atención la hacen crecer. Mantén pulsado para regalarle vida.
            </motion.p>
          )}
          {phase === 'season' && (
            <motion.p key="season" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="text-center font-serif text-stone-700 drop-shadow-sm text-lg bg-white/40 px-6 py-2 rounded-full backdrop-blur-sm border border-black/5 mt-2">
              El tiempo pasa, las estaciones cambian, y las raíces se fortalecen.
            </motion.p>
          )}
          {phase === 'bloom' && bloomedBuds.length < TOTAL_BUDS && (
            <motion.p key="bloom" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="text-center font-serif text-rose-700 drop-shadow-sm text-lg bg-white/60 px-6 py-2 rounded-full backdrop-blur-sm border border-rose-200 mt-2">
              Ha llegado el momento. Toca cada capullo para revelar su belleza.
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Ground */}
      <motion.div 
        initial={false}
        animate={{
            background: phase === 'plant' || phase === 'water' || phase === 'intro' ? 'linear-gradient(to bottom, #3f3f46, #27272a)' : 
                            phase === 'season' ? `linear-gradient(to bottom, rgba(74, 222, 128, ${seasonProgress/100}), rgba(34, 197, 94, ${seasonProgress/100}))` : 'linear-gradient(to bottom, #4ade80, #22c55e)'
        }}
        className="absolute bottom-0 w-full h-[32%] z-0 border-t border-white/10 shadow-[0_-15px_40px_rgba(0,0,0,0.2)]" 
      />

      {/* Intro Overlay */}
      <AnimatePresence>
        {phase === 'intro' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center"
          >
            <h3 className="font-serif text-4xl md:text-5xl text-pink-100 mb-6 font-bold drop-shadow-md tracking-wide">El Árbol de la Vida</h3>
            <p className="text-white/90 mb-10 text-xl max-w-md font-light leading-relaxed">
              Toda gran historia tiene un comienzo.<br/> Planta la semilla de nuestro futuro y acompáñala a crecer a través del tiempo.
            </p>
            <button 
              onClick={() => setPhase('plant')}
              className="px-10 py-4 bg-rose-500 text-white rounded-full font-bold shadow-2xl hover:bg-rose-400 active:scale-95 transition-all text-xl ring-4 ring-rose-500/30"
            >
              Comenzar
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Phase 1: Hole in the ground */}
      <div 
        ref={holeRef}
        className={`absolute bottom-[28%] left-1/2 -translate-x-1/2 w-32 h-10 bg-stone-950/80 rounded-[100%] border-b-2 border-r-2 border-stone-800 shadow-inner z-10 transition-opacity duration-700 ${phase === 'plant' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      />

      {/* Tree states */}
      <div className="absolute bottom-[30%] left-1/2 -translate-x-1/2 z-20 flex flex-col items-center justify-end pointer-events-none">
        <AnimatePresence>
          {phase === 'water' && (
             <motion.div 
                key="sprout"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ 
                  scale: 0.4 + (waterProgress / 100) * 0.6, 
                  opacity: waterProgress > 5 ? 1 : 0 
                }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: 'spring', damping: 15 }}
                className="w-3 h-16 bg-gradient-to-t from-green-800 to-green-500 rounded-t-full border border-green-900 shadow-lg pointer-events-auto origin-bottom relative"
             >
                {/* Dynamic leaves that appear/grow with water */}
                <motion.div 
                  animate={{ scale: waterProgress > 30 ? 1 : 0 }}
                  className="absolute top-4 -right-4 w-7 h-5 bg-green-400 rounded-[0_100%_50%_100%] rotate-45 border border-green-700 shadow-sm" 
                />
                <motion.div 
                  animate={{ scale: waterProgress > 60 ? 1 : 0 }}
                  className="absolute top-8 -left-4 w-6 h-4 bg-green-400 rounded-[100%_0_100%_50%] -rotate-45 border border-green-700 shadow-sm" 
                />
             </motion.div>
          )}

          {phase === 'season' && (
             <motion.div 
                key="sapling"
                initial={{ scale: 0.3, opacity: 0 }}
                animate={{ scale: 0.3 + (seasonProgress / 100) * 0.7, opacity: 1 }}
                exit={{ opacity: 0 }}
                className="relative origin-bottom shadow-xl flex flex-col items-center"
             >
                {/* Detailed sapling structure */}
                <svg width="150" height="200" viewBox="0 0 150 200" className="pointer-events-none drop-shadow-md overflow-visible relative z-10">
                   <g stroke="#3f2314" fill="none" strokeWidth="6" strokeLinecap="round">
                     <path d="M75,200 C 75,150, 70,100, 75,50" />
                     <path d="M75,130 C 90,110, 110,90, 120,70" strokeWidth="4" />
                     <path d="M72,160 C 50,140, 30,110, 20,80" strokeWidth="4" />
                   </g>
                </svg>
                {/* Leaf canopy that grows based on seasonProgress */}
                <div 
                  className="absolute top-0 -left-6 w-48 h-48 bg-gradient-to-tr from-green-700 to-emerald-400 rounded-[50%_70%_70%_50%/50%_50%_70%_70%] shadow-2xl transition-all duration-300 z-0 opacity-90" 
                  style={{ transform: `scale(${0.3 + (seasonProgress / 100) * 0.7})` }}
                />
             </motion.div>
          )}

          {(phase === 'bloom' || phase === 'done') && (
             <motion.div 
                key="adult"
                initial={{ scale: 0.6, opacity: 0, rotate: 0 }}
                animate={{ scale: 0.85, opacity: 1, rotate: [-0.5, 0.5, -0.5] }}
                transition={{ 
                  scale: { duration: 1.5, type: 'spring' }, 
                  opacity: { duration: 1 },
                  rotate: { repeat: Infinity, duration: 8, ease: 'easeInOut' } 
                }}
                className="relative w-[340px] h-[400px] pointer-events-auto origin-bottom"
             >
                {/* Visual Canopy Placeholders - Soft glow */}
                <AnimatePresence>
                  {phase === 'done' && (
                    <motion.div 
                       initial={{ opacity: 0, scale: 0.8 }}
                       animate={{ opacity: 1, scale: 1 }}
                       transition={{ duration: 2 }}
                       className="absolute -top-[50px] -left-[100px] w-[500px] h-[400px] bg-pink-400/30 rounded-full blur-3xl pointer-events-none mix-blend-screen"
                    />
                  )}
                </AnimatePresence>
                
                {/* Realistic Tree Branch Structure */}
                <svg width="340" height="400" viewBox="0 0 340 400" className="absolute top-0 left-0 pointer-events-none drop-shadow-2xl overflow-visible z-10 filter drop-shadow-[0_15px_15px_rgba(0,0,0,0.3)]">
                   <g stroke="#2f1a0e" fill="none" strokeLinecap="round">
                      {/* Main Trunk */}
                      <path d="M170,400 C 170,330, 160,280, 170,200" strokeWidth="26" />
                      <path d="M170,200 C 180,140, 190,110, 170,50" strokeWidth="20" />
                      
                      {/* Right branches */}
                      <path d="M168,250 C 200,210, 240,150, 290,130" strokeWidth="16" />
                      <path d="M210,190 C 240,150, 270,100, 260,70" strokeWidth="10" />
                      <path d="M250,155 C 280,130, 310,110, 320,80" strokeWidth="6" />
                      <path d="M175,160 C 200,120, 250,90, 230,40" strokeWidth="12" />
                      <path d="M215,105 C 240,85, 270,65, 280,45" strokeWidth="5" />
                      
                      {/* Left branches */}
                      <path d="M168,280 C 120,240, 60,180, 20,150" strokeWidth="18" />
                      <path d="M90,225 C 60,190, 20,140, 30,85" strokeWidth="10" />
                      <path d="M50,150 C 20,130, 0,105, 0,65" strokeWidth="7" />
                      <path d="M165,190 C 120,140, 70,85, 90,40" strokeWidth="12" />
                      <path d="M120,130 C 85,95, 55,60, 45,30" strokeWidth="8" />
                      <path d="M170,120 C 140,85, 145,50, 120,20" strokeWidth="8" />
                      
                      {/* Center upper */}
                      <path d="M170,85 C 200,50, 180,20, 190,-15" strokeWidth="7" />
                   </g>
                </svg>
                
                {/* Buds */}
                {budPositions.map((pos, idx) => {
                    const isBloomed = bloomedBuds.includes(idx);
                    return (
                        <div 
                          key={idx}
                          className="absolute z-30 cursor-pointer p-5 hit-area hover:scale-110 transition-transform"
                          style={{ top: pos.top, left: pos.left, transform: 'translate(-50%, -50%)' }}
                          onClick={() => handleBudClick(idx)}
                        >
                           <motion.div
                             animate={{
                                 scale: isBloomed ? 1.6 : 1,
                                 backgroundColor: isBloomed ? '#fbcfe8' : '#3f6212', // pink-200 vs lime-800
                                 rotate: isBloomed ? Math.random() * 90 - 45 : 0,
                                 borderRadius: isBloomed ? '0 50% 50% 50%' : '50%',
                             }}
                             transition={{ type: 'spring', bounce: 0.6 }}
                             className={`w-10 h-10 shadow-lg border-2 relative origin-center flex items-center justify-center ${isBloomed ? 'border-pink-300' : 'border-lime-950/50'} z-10`}
                           >
                              {isBloomed && (
                                  <>
                                    <div className="w-5 h-5 bg-rose-400 rounded-full opacity-60 absolute" />
                                    <div className="w-2 h-2 bg-yellow-300 rounded-full z-10" />
                                    
                                    {/* Petal accents */}
                                    <div className="absolute -top-1 w-3 h-3 bg-pink-100 rounded-full opacity-80" />
                                    <div className="absolute -bottom-1 w-3 h-3 bg-pink-100 rounded-full opacity-80" />
                                    <div className="absolute -left-1 w-3 h-3 bg-pink-100 rounded-full opacity-80" />
                                    <div className="absolute -right-1 w-3 h-3 bg-pink-100 rounded-full opacity-80" />
                                  </>
                              )}
                           </motion.div>
                           
                           {/* Glow effect for unbloomed so users know they are clickable */}
                           {!isBloomed && phase === 'bloom' && (
                             <div className="absolute inset-4 rounded-full bg-white/20 animate-ping -z-10" />
                           )}
                        </div>
                    )
                })}
             </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* INTERACTABLES */}

      {/* Phase 1: Draggable Seed */}
      {phase === 'plant' && (
        <motion.div 
          drag
          dragConstraints={containerRef}
          whileDrag={{ scale: 1.2, cursor: 'grabbing' }}
          dragElastic={0.2}
          onDragEnd={handleDragEnd}
          className="absolute top-[25%] left-1/2 -translate-x-1/2 cursor-grab z-30 flex flex-col items-center p-6 hit-area"
        >
          <motion.div 
            animate={{ y: [0, -5, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            className="w-8 h-12 bg-amber-900 rounded-[50%_50%_40%_40%] shadow-[0_10px_20px_rgba(0,0,0,0.5)] border-2 border-stone-800 relative ring-4 ring-white/10" 
          >
            <div className="absolute inset-1 border-t border-white/20 rounded-full" />
          </motion.div>
        </motion.div>
      )}

      {/* Phase 2: Watering Can */}
      {phase === 'water' && (
          <div className="absolute bottom-[20%] right-[10%] flex flex-col items-center z-40">
             <button
               onPointerDown={() => { isWateringRef.current = true; }}
               onPointerUp={() => { isWateringRef.current = false; }}
               onPointerLeave={() => { isWateringRef.current = false; }}
               onContextMenu={(e) => e.preventDefault()} // Prevent context menu
               className="p-6 bg-gradient-to-b from-sky-400 to-blue-500 rounded-full border-4 border-white/80 text-white shadow-[0_10px_30px_rgba(3,105,161,0.5)] active:scale-90 active:from-sky-500 active:to-blue-600 outline-none select-none touch-none transition-transform"
             >
                <Droplets size={44} strokeWidth={2} className={isWateringRef.current ? "animate-pulse" : "animate-bounce"} />
             </button>
             
             <div className="w-32 h-4 bg-stone-900/40 backdrop-blur-sm rounded-full mt-6 overflow-hidden shadow-inner border border-white/10">
                 <div className="h-full bg-gradient-to-r from-blue-400 to-cyan-300 transition-all duration-75 relative" style={{ width: `${waterProgress}%` }}>
                    <div className="absolute inset-0 bg-white/20" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)' }} />
                 </div>
             </div>
          </div>
      )}

      {/* Phase 2: Rain particles animation overlay (when watering) */}
      <AnimatePresence>
        {phase === 'water' && isWateringRef.current && (
           <motion.div 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             className="absolute inset-0 pointer-events-none overflow-hidden z-20"
           >
              {[...Array(60)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ y: -100, x: `${Math.random() * 100}vw` }}
                    animate={{ y: '120vh' }}
                    transition={{ repeat: Infinity, duration: 0.6 + Math.random() * 0.4, ease: 'linear' }}
                    className="absolute w-0.5 h-16 bg-blue-100/60 rounded-full rotate-6 blur-[0.5px]"
                  />
              ))}
           </motion.div>
        )}
      </AnimatePresence>

      {/* Phase 3: Seasons slider */}
      {phase === 'season' && (
          <div className="absolute bottom-[20%] left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-white/90 p-8 rounded-[2rem] shadow-2xl backdrop-blur-xl flex flex-col items-center z-40 border border-white/50">
             <div className="flex justify-between w-full text-stone-600 mb-6 px-4">
                 <div className="flex flex-col items-center text-sky-500 gap-2">
                     <Snowflake size={28} />
                     <span className="text-xs font-bold uppercase tracking-wider">Invierno</span>
                 </div>
                 <div className="flex items-center text-stone-400">
                     <span className="font-medium text-sm tracking-widest hidden md:inline opacity-70">➔ AVANZAR EL TIEMPO ➔</span>
                 </div>
                 <div className="flex flex-col items-center text-rose-500 gap-2">
                     <Sun size={28} />
                     <span className="text-xs font-bold uppercase tracking-wider">Primavera</span>
                 </div>
             </div>
             <div className="w-full relative px-2">
               <input 
                  type="range"
                  min="0"
                  max="100"
                  value={seasonProgress}
                  onChange={handleSeasonChange}
                  className="w-full h-5 bg-stone-200/80 rounded-full appearance-none cursor-grab active:cursor-grabbing shadow-inner z-10 relative"
                  style={{
                    background: `linear-gradient(to right, #fb7185 ${seasonProgress}%, #e5e7eb ${seasonProgress}%)`
                  }}
               />
               <div className="absolute -inset-2 bg-gradient-to-r from-sky-100 to-rose-50 rounded-full -z-10 blur-sm opacity-50" />
             </div>
          </div>
      )}

      {/* Phase 4: Bloom instruction indicator */}
      <AnimatePresence>
        {phase === 'bloom' && bloomedBuds.length < TOTAL_BUDS && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute bottom-[10%] w-full text-center pointer-events-none z-40"
            >
               <span className="bg-white/90 px-8 py-4 rounded-full shadow-[0_10px_30px_rgba(225,29,72,0.2)] text-rose-600 font-bold border border-rose-200/50 inline-flex items-center gap-3 backdrop-blur-md text-lg tracking-wide">
                   <Heart size={20} className="text-rose-400" />
                   {bloomedBuds.length} de {TOTAL_BUDS} florecidos
               </span>
            </motion.div>
        )}
      </AnimatePresence>

      {/* Climax message */}
      <AnimatePresence>
        {phase === 'done' && (
           <motion.div 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={{ duration: 1.5 }}
             className="absolute inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-8 text-center pointer-events-none"
           >
              <div className="max-w-xl flex flex-col items-center">
                  <motion.div 
                    initial={{ scale: 0.5, rotate: -15, y: 50 }} 
                    animate={{ scale: 1, rotate: 10, y: [0, -15, 0] }} 
                    transition={{ 
                      scale: { duration: 1.5, ease: 'backOut' },
                      y: { repeat: Infinity, duration: 3, ease: 'easeInOut' },
                      rotate: { repeat: Infinity, repeatType: 'reverse', duration: 4, ease: 'easeInOut' }
                    }}
                    className="text-8xl mb-10 drop-shadow-[0_0_40px_rgba(251,113,133,0.9)]"
                  >
                    🌸
                  </motion.div>
                  <motion.h2 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.8, duration: 1 }}
                    className="text-4xl md:text-6xl font-script text-pink-100 mb-8 drop-shadow-xl"
                  >
                    Nuestra historia ha florecido
                  </motion.h2>
                  <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 1.5, duration: 1 }}
                    className="bg-white/10 p-8 rounded-3xl border border-white/20 backdrop-blur-sm"
                  >
                    <p className="text-xl text-white/95 font-serif font-medium leading-relaxed drop-shadow-sm mb-4">
                       Tu recompensa real te espera...
                    </p>
                    <p className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-300 via-rose-300 to-pink-300 drop-shadow-sm leading-tight">
                       ¡Vamos a construir nuestro propio Ciruelo en Flor juntos!
                    </p>
                  </motion.div>
              </div>
           </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
