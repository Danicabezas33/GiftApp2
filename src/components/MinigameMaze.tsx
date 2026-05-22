import React, { useRef, useEffect, useState } from 'react';

interface MinigameMazeProps {
  onWin: () => void;
}

// 0: path, 1: wall, 2: Target (Master Candle), 3: Wax Recharge
const LEVELS = [
  // Map 1
  [
    [1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 3, 0, 2, 1],
    [1, 0, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 1, 0, 1],
    [1, 1, 1, 1, 1, 1, 1],
  ],
  // Map 2
  [
    [1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 1, 0, 0, 0, 3, 0, 1],
    [1, 0, 1, 0, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 1, 2, 0, 0, 1],
    [1, 1, 1, 0, 1, 1, 1, 1, 1],
    [1, 3, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1],
  ],
  // Map 3
  [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 1, 0, 0, 0, 3, 1],
    [1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1],
    [1, 0, 1, 3, 0, 0, 0, 1, 0, 0, 1],
    [1, 0, 1, 1, 1, 1, 0, 1, 0, 1, 1],
    [1, 0, 0, 0, 1, 2, 0, 1, 0, 0, 1],
    [1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1],
    [1, 3, 0, 0, 0, 0, 0, 0, 1, 0, 1],
    [1, 0, 1, 1, 1, 1, 1, 0, 1, 3, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  ],
  // Map 4
  [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 1, 3, 0, 0, 0, 1, 0, 0, 0, 1],
    [1, 1, 0, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 0, 0, 0, 3, 1, 0, 0, 0, 1, 0, 1],
    [1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1],
    [1, 0, 1, 2, 1, 0, 0, 0, 0, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1],
    [1, 3, 1, 0, 0, 0, 0, 0, 0, 3, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  ],
  // Map 5
  [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 3, 0, 1, 0, 0, 0, 0, 1, 0, 3, 0, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1],
    [1, 0, 1, 0, 0, 0, 1, 3, 0, 0, 0, 1, 2, 0, 1],
    [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
    [1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1],
    [1, 3, 0, 0, 1, 0, 0, 3, 0, 0, 0, 0, 0, 3, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  ]
];

export function MinigameMaze({ onWin }: MinigameMazeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isWon, setIsWon] = useState(false);
  const [isLost, setIsLost] = useState(false);
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);

  const startGame = () => {
    setIsPlaying(true);
    if (isWon) {
        setCurrentLevelIndex(0);
    }
    setIsWon(false);
    setIsLost(false);
  };

  useEffect(() => {
    if (!isPlaying) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bgImg = new Image();
    bgImg.src = 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?q=80&w=300&auto=format&fit=crop';
    
    let pattern: CanvasPattern | null = null;
    bgImg.onload = () => {
      pattern = ctx.createPattern(bgImg, 'repeat');
    };

    const updateSize = () => {
      canvas.width = canvas.parentElement?.clientWidth || 300;
      canvas.height = 350;
    };
    updateSize();

    let levelMap = LEVELS[currentLevelIndex].map(row => [...row]);
    let ROWS = levelMap.length;
    let COLS = levelMap[0].length;
    let cellW = canvas.width / COLS;
    let cellH = canvas.height / ROWS;

    // Player state
    const player = {
      x: 1.5 * cellW,
      y: 1.5 * cellH,
      vx: 0,
      vy: 0,
      radius: Math.min(cellW, cellH) * 0.35,
      lightRadius: 160,
      maxLight: 190
    };

    let sparks: { x: number; y: number; vx: number; vy: number; life: number; maxLife: number }[] = [];

    let touchStartX = 0;
    let touchStartY = 0;
    let currentTouchX = 0;
    let currentTouchY = 0;
    let isTouching = false;
    let lastVibrate = 0;
    let flashTimer = 0;
    let isTransitioning = false;
    let transitionAmount = 0;

    const handleTouchStart = (e: TouchEvent | MouseEvent) => {
      e.preventDefault();
      isTouching = true;
      if (e instanceof TouchEvent) {
         touchStartX = e.touches[0].clientX;
         touchStartY = e.touches[0].clientY;
      } else {
         touchStartX = e.clientX;
         touchStartY = e.clientY;
      }
      currentTouchX = touchStartX;
      currentTouchY = touchStartY;
    };

    const handleTouchMove = (e: TouchEvent | MouseEvent) => {
      if (!isTouching) return;
      e.preventDefault();
      if (e instanceof TouchEvent) {
         currentTouchX = e.touches[0].clientX;
         currentTouchY = e.touches[0].clientY;
      } else {
         currentTouchX = e.clientX;
         currentTouchY = e.clientY;
      }
    };

    const handleTouchEnd = (e: TouchEvent | MouseEvent) => {
      if (isTouching && e.cancelable) {
        e.preventDefault();
      }
      isTouching = false;
    };

    canvas.addEventListener('mousedown', handleTouchStart);
    window.addEventListener('mousemove', handleTouchMove, { passive: false });
    window.addEventListener('mouseup', handleTouchEnd);
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);

    const spawnSparks = (x: number, y: number) => {
      for (let i = 0; i < 4; i++) {
        sparks.push({
          x, y,
          vx: (Math.random() - 0.5) * 150,
          vy: (Math.random() - 0.5) * 150,
          life: 0,
          maxLife: 0.2 + Math.random() * 0.3
        });
      }
    };

    let lastTime = performance.now();
    let animId: number;

    const draw = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      if (isLost || isWon) return;

      if (isTransitioning) {
          transitionAmount += dt;
          if (transitionAmount > 1.0) {
              // Time to load next level
              setCurrentLevelIndex(prev => prev + 1);
              return; // End loop, component will re-render and re-run useEffect with next level
          }
      } else {
        // Input physics
        if (isTouching) {
           const dx = currentTouchX - touchStartX;
           const dy = currentTouchY - touchStartY;
           player.vx = dx * 3;
           player.vy = dy * 3;
        } else {
           player.vx *= 0.8;
           player.vy *= 0.8;
        }

        // Max speed clamp
        const speed = Math.sqrt(player.vx**2 + player.vy**2);
        if (speed > 150) {
           player.vx = (player.vx / speed) * 150;
           player.vy = (player.vy / speed) * 150;
        }

        player.x += player.vx * dt;
        player.y += player.vy * dt;

        // Light mechanics: decreases by 1.1% of max per second
        player.lightRadius -= player.maxLight * 0.011 * dt;
        if (player.lightRadius <= 15) {
           setIsLost(true);
           return;
        }

        // Collisions with walls
        let collisionOccurred = false;
        let colPoint = { x: 0, y: 0 };

        // Identify tiles near the player to avoid full grid loop
        const startC = Math.max(0, Math.floor((player.x - player.radius) / cellW));
        const endC = Math.min(COLS - 1, Math.floor((player.x + player.radius) / cellW));
        const startR = Math.max(0, Math.floor((player.y - player.radius) / cellH));
        const endR = Math.min(ROWS - 1, Math.floor((player.y + player.radius) / cellH));

        for (let r = startR; r <= endR; r++) {
           for (let c = startC; c <= endC; c++) {
              const val = levelMap[r][c];

              if (val === 1) { // Wall
                 const rectX = c * cellW;
                 const rectY = r * cellH;
                 
                 const testX = Math.max(rectX, Math.min(player.x, rectX + cellW));
                 const testY = Math.max(rectY, Math.min(player.y, rectY + cellH));

                 const distX = player.x - testX;
                 const distY = player.y - testY;
                 const distSquared = distX**2 + distY**2;

                 if (distSquared < player.radius**2) {
                    // Collision
                    collisionOccurred = true;
                    colPoint = { x: testX, y: testY };
                    
                    const dist = Math.sqrt(distSquared);
                    if (dist > 0) {
                       const overlap = player.radius - dist;
                       player.x += (distX / dist) * overlap;
                       player.y += (distY / dist) * overlap;
                    }
                 }
              } else if (val === 2) { // Master Candle
                 const cx = c * cellW + cellW/2;
                 const cy = r * cellH + cellH/2;
                 if (Math.hypot(player.x - cx, player.y - cy) < player.radius + cellW/2) {
                    if (currentLevelIndex === LEVELS.length - 1) {
                        setIsWon(true);
                        setTimeout(() => onWin(), 2500); 
                    } else {
                        isTransitioning = true;
                        transitionAmount = 0;
                    }
                 }
              } else if (val === 3) { // Wax
                 const cx = c * cellW + cellW/2;
                 const cy = r * cellH + cellH/2;
                 if (Math.hypot(player.x - cx, player.y - cy) < player.radius + cellW/3) {
                    levelMap[r][c] = 0; // Consume
                    player.lightRadius = Math.min(player.maxLight, player.lightRadius + player.maxLight * 0.3); // 30% recharge
                 }
              }
           }
        }

        if (collisionOccurred) {
           const now = performance.now();
           if (now - lastVibrate > 200) {
              if (typeof navigator !== 'undefined' && navigator.vibrate) {
                try { if (!navigator.vibrate(15)) flashTimer = 0.1; } catch(e) { flashTimer = 0.1; }
              } else {
                flashTimer = 0.1;
              }
              lastVibrate = now;
           }
           spawnSparks(colPoint.x, colPoint.y);
        }

        // Update sparks
        for (let i = sparks.length - 1; i >= 0; i--) {
           const p = sparks[i];
           p.x += p.vx * dt;
           p.y += p.vy * dt;
           p.life += dt;
           if (p.life > p.maxLife) sparks.splice(i, 1);
        }
      }

      // ====== DRAW ======
      // Floor
      ctx.fillStyle = '#150508';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      
      const flicker = Math.sin(time * 0.01) * 3 + Math.sin(time * 0.025) * 2;
      let actualRadius = Math.max(10, player.lightRadius + flicker);
      
      if (isTransitioning) {
          actualRadius *= (1 - transitionAmount);
      }

      for (let r = 0; r < ROWS; r++) {
         for (let c = 0; c < COLS; c++) {
            if (levelMap[r][c] === 1) {
               ctx.fillStyle = '#3d050d';
               ctx.fillRect(c * cellW, r * cellH, cellW, cellH);
               if (pattern) {
                  ctx.globalAlpha = 0.15;
                  ctx.fillStyle = pattern;
                  ctx.fillRect(c * cellW, r * cellH, cellW, cellH);
                  ctx.globalAlpha = 1.0;
               }
               ctx.strokeStyle = 'rgba(244, 156, 187, 0.4)';
               ctx.lineWidth = 1.5;
               ctx.strokeRect(c * cellW, r * cellH, cellW, cellH);
            } else if (levelMap[r][c] === 2) {
               ctx.fillStyle = '#fff';
               ctx.fillRect(c * cellW + cellW * 0.35, r * cellH + cellH * 0.3, cellW * 0.3, cellH * 0.5);
               ctx.font = `${cellH * 0.8}px sans-serif`;
               ctx.textAlign = 'center';
               ctx.textBaseline = 'middle';
               ctx.fillText('🕯️', c * cellW + cellW/2, r * cellH + cellH/2);
            } else if (levelMap[r][c] === 3) {
               ctx.fillStyle = '#fbbf24'; 
               ctx.beginPath();
               ctx.arc(c * cellW + cellW/2, r * cellH + cellH/2, cellW/4, 0, Math.PI * 2);
               ctx.fill();
               ctx.shadowColor = '#fbbf24';
               ctx.shadowBlur = 10;
               ctx.fill();
               ctx.shadowBlur = 0;
            }
         }
      }

      ctx.fillStyle = '#fb923c';
      for (const p of sparks) {
         ctx.beginPath();
         ctx.arc(p.x, p.y, 2 * (1 - p.life/p.maxLife), 0, Math.PI * 2);
         ctx.fill();
      }

      // Ghost with a lantern
      ctx.save();
      const floatY = Math.sin(time * 0.005) * 5;
      ctx.translate(player.x, player.y + floatY);
      
      // Ghost Body
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.beginPath();
      // Head (top half circle)
      ctx.arc(0, -player.radius * 0.2, player.radius * 0.8, Math.PI, 0);
      // Body (sides)
      ctx.lineTo(player.radius * 0.8, player.radius * 0.8);
      // Wavy bottom
      for (let i = 1; i <= 3; i++) {
         const tx = player.radius * 0.8 - (i * (player.radius * 1.6 / 3));
         const ty = player.radius * 0.8 + (i % 2 === 0 ? 5 : -2);
         ctx.quadraticCurveTo(tx + (player.radius * 0.4), ty + 10, tx, ty);
      }
      ctx.lineTo(-player.radius * 0.8, player.radius * 0.8);
      ctx.closePath();
      ctx.fill();

      // Eyes
      ctx.fillStyle = '#111';
      ctx.beginPath();
      ctx.arc(-player.radius * 0.25, -player.radius * 0.3, 2, 0, Math.PI * 2);
      ctx.arc(player.radius * 0.25, -player.radius * 0.3, 2, 0, Math.PI * 2);
      ctx.fill();

      // Lantern
      ctx.save();
      const lanternX = player.radius * 0.9;
      const lanternY = player.radius * 0.2;
      ctx.translate(lanternX, lanternY);
      ctx.rotate(Math.sin(time * 0.004) * 0.2); // Slower swing
      
      // Handle/String
      ctx.strokeStyle = '#555';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, -10);
      ctx.lineTo(0, 0);
      ctx.stroke();

      // Lantern Frame
      ctx.fillStyle = '#222';
      ctx.fillRect(-7, 0, 14, 18);
      
      // Light inside lantern
      ctx.fillStyle = '#fbbf24';
      ctx.shadowColor = '#fbbf24';
      ctx.shadowBlur = 10;
      ctx.fillRect(-5, 2, 10, 14);
      ctx.restore();

      ctx.restore();

      ctx.restore();

      // Draw lighting darkness
      ctx.globalCompositeOperation = 'source-over';
      const gradient = ctx.createRadialGradient(player.x, player.y, actualRadius * 0.2, player.x, player.y, actualRadius * 1.5);
      gradient.addColorStop(0, 'rgba(0,0,0,0)');
      gradient.addColorStop(0.5, 'rgba(15, 2, 5, 0.7)');
      gradient.addColorStop(1, 'rgba(15, 2, 5, 1)');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      if (isTransitioning) {
          ctx.fillStyle = `rgba(0, 0, 0, ${transitionAmount})`;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else if (isWon) {
         ctx.globalCompositeOperation = 'screen';
         ctx.fillStyle = '#fef08a';
         ctx.fillRect(0, 0, canvas.width, canvas.height);
         ctx.globalCompositeOperation = 'source-over';
      } else if (flashTimer > 0) {
         flashTimer -= dt;
         ctx.globalCompositeOperation = 'screen';
         ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(1, flashTimer / 0.1)})`;
         ctx.fillRect(0, 0, canvas.width, canvas.height);
         ctx.globalCompositeOperation = 'source-over';
      }

      animId = requestAnimationFrame(draw);
    };

    animId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animId);
      canvas.removeEventListener('mousedown', handleTouchStart);
      window.removeEventListener('mousemove', handleTouchMove);
      window.removeEventListener('mouseup', handleTouchEnd);
      canvas.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isPlaying, currentLevelIndex, isWon, isLost, onWin]);

  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full relative bg-black rounded-2xl overflow-hidden border border-gray-800 shadow-inner min-h-[350px] flex items-center justify-center cursor-crosshair">
        <canvas 
          ref={canvasRef} 
          className="w-full h-[350px] block touch-none outline-none" 
        />
        
        {isPlaying && !isWon && !isLost && (
           <div className="absolute top-2 left-2 pointer-events-none z-10 flex gap-1">
              {LEVELS.map((_, i) => (
                  <div key={i} className={`w-2 h-2 rounded-full ${i <= currentLevelIndex ? 'bg-yellow-400 shadow-[0_0_5px_#facc15]' : 'bg-gray-700'}`} />
              ))}
           </div>
        )}

        {!isPlaying && !isWon && !isLost && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm z-10">
            <h3 className="font-serif text-2xl text-yellow-500 mb-2 font-bold drop-shadow-md">La Luz del Recuerdo</h3>
            <p className="text-gray-300 px-6 text-center text-sm mb-6 max-w-sm">
              Arrastra para moverte. Encuentra las gotas de cera para mantener tu luz viva hasta llegar a la vela maestra en los 5 niveles.
            </p>
            <button 
              onClick={startGame}
              className="px-8 py-3 bg-gradient-to-r from-yellow-600 to-yellow-500 text-black font-bold rounded-full hover:scale-105 transition-transform shadow-[0_0_15px_rgba(234,179,8,0.5)]"
            >
              ENCENDER
            </button>
          </div>
        )}

        {isLost && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-10">
             <p className="font-serif text-2xl text-gray-400 mb-4">La luz se apagó...</p>
             <button 
              onClick={startGame}
              className="px-6 py-2 bg-yellow-600 text-black font-bold rounded-full hover:bg-yellow-500 transition-colors"
            >
              Intentar de nuevo
            </button>
          </div>
        )}

        {isWon && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-20">
             <div className="bg-white/80 backdrop-blur-md px-8 py-6 rounded-xl shadow-[0_0_30px_rgba(253,224,71,0.8)] border border-yellow-300 text-center">
                <p className="font-serif text-2xl text-yellow-600 font-bold mb-2">¡Vela Encendida!</p>
                <p className="text-gray-700 font-medium">Has superado los 5 niveles.</p>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}

