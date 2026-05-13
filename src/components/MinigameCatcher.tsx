import React, { useRef, useEffect, useState } from 'react';

interface MinigameCatcherProps {
  onWin: () => void;
}

export function MinigameCatcher({ onWin }: MinigameCatcherProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isWon, setIsWon] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(45);
  const [isCombo, setIsCombo] = useState(false);

  const startGame = () => {
    setIsPlaying(true);
    setIsWon(false);
    setIsGameOver(false);
    setScore(0);
    setTimeLeft(45);
    setIsCombo(false);
  };

  useEffect(() => {
    if (!isPlaying && !isWon && !isGameOver) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const updateSize = () => {
      canvas.width = canvas.parentElement?.clientWidth || 300;
      canvas.height = 400; 
    };
    updateSize();
    window.addEventListener('resize', updateSize);

    let animationId: number;
    let lastTime = performance.now();
    let startTime = performance.now();
    
    // Internal game states
    let currentScore = 0;
    let streak = 0;
    let comboTimer = 0;
    let playing = isPlaying;

    const player = {
      x: canvas.width / 2,
      y: canvas.height - 50,
      width: 80,
    };

    let drops: { x: number; baseY: number; y: number; speed: number; time: number; amp: number }[] = [];
    let dropTimer = 0;
    let ripples: { x: number; y: number; radius: number; life: number }[] = [];
    let petals: { x: number; y: number; currentX: number; speed: number; rot: number; rotSpeed: number; time: number; scale: number; baseY?: number }[] = [];
    let confettis: { x: number; y: number; vx: number; vy: number; color: string; life: number; time: number }[] = [];

    // Initialize decorative petals
    for(let i=0; i<15; i++) {
        petals.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            currentX: 0,
            speed: 30 + Math.random() * 30,
            rot: Math.random() * Math.PI,
            rotSpeed: (Math.random() - 0.5) * 2,
            time: Math.random() * 100,
            scale: 0.5 + Math.random() * 0.8
        });
    }

    const spawnDrop = () => {
      drops.push({
        x: 40 + Math.random() * (canvas.width - 80),
        baseY: -30,
        y: -30,
        speed: 160 + Math.random() * 80, // slightly faster for difficulty
        time: Math.random() * 10,
        amp: 10 + Math.random() * 30
      });
      dropTimer = 0.5 + Math.random() * 0.4;
    };

    const handlePointerMove = (e: PointerEvent | MouseEvent | TouchEvent) => {
      if (!playing) return;
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      let clientX;
      if ('touches' in e) {
        clientX = e.touches[0].clientX;
      } else {
        clientX = (e as MouseEvent).clientX;
      }
      const x = clientX - rect.left;
      player.x = Math.max(player.width / 2, Math.min(canvas.width - player.width / 2, x));
    };

    canvas.addEventListener('touchmove', handlePointerMove, { passive: false });
    canvas.addEventListener('mousemove', handlePointerMove);

    // Drawing helpers
    const drawHanok = () => {
        ctx.save();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)'; 
        const h = canvas.height;
        const w = canvas.width;
        
        ctx.fillRect(w * 0.15, h - 120, w * 0.7, 120);
        
        // Roof
        ctx.beginPath();
        ctx.moveTo(w * 0.05, h - 110);
        ctx.quadraticCurveTo(w * 0.5, h - 80, w * 0.95, h - 110);
        ctx.lineTo(w * 0.9, h - 150);
        ctx.quadraticCurveTo(w * 0.5, h - 180, w * 0.1, h - 150);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    };

    const drawBowl = (x: number, y: number, w: number) => {
        ctx.save();
        ctx.translate(x, y);
        // Shadow/glow if combo
        if (comboTimer > 0) {
            ctx.shadowColor = '#fcd34d'; // amber-300
            ctx.shadowBlur = 20;
        }
        ctx.fillStyle = '#f8fafc'; // ceramic
        ctx.beginPath();
        ctx.moveTo(-w / 2, 0);
        ctx.bezierCurveTo(-w / 2, 35, w / 2, 35, w / 2, 0);
        ctx.fill();
        
        ctx.fillStyle = '#e2e8f0';
        ctx.beginPath();
        ctx.ellipse(0, 0, w / 2, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Front detail (K-style pattern simplified)
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 10, 12, 0, Math.PI);
        ctx.stroke();

        ctx.restore();
    };

    const drawDropItem = (x: number, y: number, size: number) => {
        ctx.save();
        ctx.translate(x, y);
        ctx.shadowColor = '#67e8f9';
        ctx.shadowBlur = 10;
        
        const grad = ctx.createLinearGradient(0, -size, 0, size);
        grad.addColorStop(0, '#bae6fd');
        grad.addColorStop(1, '#38bdf8');
        
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(0, -size);
        ctx.quadraticCurveTo(size, size*0.5, 0, size);
        ctx.quadraticCurveTo(-size, size*0.5, 0, -size);
        ctx.fill();

        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.beginPath();
        ctx.ellipse(-size*0.3, size*0.2, size*0.15, size*0.25, -Math.PI/6, 0, Math.PI*2);
        ctx.fill();
        ctx.restore();
    };

    const loop = (currentTime: number) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;

      const elapsedTotal = (currentTime - startTime) / 1000;
      const remaining = Math.max(0, 45 - elapsedTotal);

      // Gradient background
      const bgGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      if (comboTimer > 0) {
        bgGrad.addColorStop(0, '#fdf4ff'); // fuchsia-50
        bgGrad.addColorStop(1, '#ccfbf1'); // teal-50
      } else {
        bgGrad.addColorStop(0, '#fce7f3'); // pink-100
        bgGrad.addColorStop(1, '#d1fae5'); // emerald-100
      }
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      drawHanok();

      // Petals layer
      ctx.fillStyle = '#fbcfe8'; // pink-200
      for (const p of petals) {
        p.time += dt;
        p.baseY = (p.baseY || p.y) + p.speed * dt;
        if (p.baseY > canvas.height + 20) {
            p.baseY = -20;
            p.x = Math.random() * canvas.width;
        }
        p.y = p.baseY;
        p.currentX = p.x + Math.sin(p.time * 2) * 20;

        ctx.save();
        ctx.translate(p.currentX, p.y);
        ctx.rotate(p.time * p.rotSpeed);
        ctx.scale(p.scale, p.scale);
        ctx.beginPath();
        ctx.moveTo(0, -5);
        ctx.quadraticCurveTo(5, -5, 5, 0);
        ctx.quadraticCurveTo(5, 5, 0, 10);
        ctx.quadraticCurveTo(-5, 5, -5, 0);
        ctx.fill();
        ctx.restore();
      }

      if (playing) {
          if (Math.ceil(remaining) < timeLeft && Math.ceil(remaining) >= 0) {
              setTimeLeft(Math.ceil(remaining));
          }

          if (remaining <= 0) {
              playing = false;
              setIsPlaying(false);
              setIsGameOver(true);
          }

          if (comboTimer > 0) {
              comboTimer -= dt;
              if (comboTimer <= 0) setIsCombo(false);
          }

          // Drops logic
          dropTimer -= dt;
          if (dropTimer <= 0) {
              spawnDrop();
          }

          for (let i = drops.length - 1; i >= 0; i--) {
              const d = drops[i];
              d.time += dt * 3;
              d.baseY += d.speed * dt;
              d.y = d.baseY;
              const currentX = d.x + Math.sin(d.time) * d.amp;

              if (d.y > canvas.height + 20) {
                  drops.splice(i, 1);
                  streak = 0; // Missed = streak lost
                  continue;
              }

              // Collision logic
              const hitY = player.y - 5;
              if (d.y > hitY - 10 && d.y < hitY + 15) {
                  if (currentX > player.x - player.width / 2 && currentX < player.x + player.width / 2) {
                      // Caught
                      drops.splice(i, 1);
                      streak++;
                      if (streak >= 3) {
                          comboTimer = 5;
                          setIsCombo(true);
                          streak = 0; // consumed streak
                      }
                      
                      const points = comboTimer > 0 ? 10 : 5;
                      currentScore += points;
                      
                      // Optimize state updates
                      setScore(currentScore);

                      // Ripple effect
                      ripples.push({ x: currentX, y: hitY, radius: 2, life: 1 });

                      // Vibrate
                      if ('vibrate' in navigator) {
                          try { navigator.vibrate(20); } catch(e){}
                      }

                      if (currentScore >= 100) {
                          playing = false;
                          setIsPlaying(false);
                          setIsWon(true);
                          
                          // Spawn Confetti
                          for(let c=0; c<60; c++) {
                              confettis.push({
                                  x: player.x,
                                  y: player.y,
                                  vx: (Math.random() - 0.5) * 400,
                                  vy: -300 - Math.random() * 400,
                                  color: ['#f472b6', '#38bdf8', '#fbbf24', '#34d399'][Math.floor(Math.random()*4)],
                                  life: 1.5 + Math.random() * 2,
                                  time: Math.random() * 10
                              });
                          }

                          setTimeout(() => {
                              onWin();
                          }, 3000);
                      }
                  }
              }
          }
      }

      // Draw Drops
      for (const d of drops) {
          drawDropItem(d.x + Math.sin(d.time) * d.amp, d.y, 10);
      }

      // Draw Player
      drawBowl(player.x, player.y, player.width);

      // Draw Ripples
      for (let i = ripples.length - 1; i >= 0; i--) {
          const r = ripples[i];
          r.radius += 50 * dt;
          r.life -= dt * 2;
          if (r.life <= 0) {
              ripples.splice(i, 1);
              continue;
          }
          ctx.beginPath();
          ctx.ellipse(r.x, r.y, r.radius, r.radius * 0.3, 0, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(56, 189, 248, ${r.life})`;
          ctx.lineWidth = 2;
          ctx.stroke();
      }

      // Draw Confetti
      for (let i = confettis.length - 1; i >= 0; i--) {
          const c = confettis[i];
          c.time += dt;
          c.x += c.vx * dt;
          c.vy += 600 * dt; // gravity
          c.y += c.vy * dt;
          c.life -= dt;
          
          if (c.life <= 0) {
              confettis.splice(i, 1);
              continue;
          }

          ctx.fillStyle = c.color;
          ctx.save();
          ctx.translate(c.x, c.y);
          ctx.rotate(c.time * 5);
          ctx.fillRect(-4, -4, 8, 8);
          ctx.restore();
      }

      animationId = requestAnimationFrame(loop);
    };

    animationId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', updateSize);
      canvas.removeEventListener('touchmove', handlePointerMove);
      canvas.removeEventListener('mousemove', handlePointerMove);
    };
  }, [isPlaying, isWon, isGameOver, onWin]);

  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full relative rounded-2xl overflow-hidden border border-rose-100 shadow-inner min-h-[400px] flex items-center justify-center cursor-crosshair">
        <canvas 
          ref={canvasRef} 
          className="w-full h-[400px] block touch-none" 
        />
        
        {!isPlaying && !isWon && !isGameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm z-10">
            <p className="font-serif text-lg text-teal-800 mb-4 px-4 text-center">
              Desliza el cuenco de cerámica para jugar.<br/>Atrapa las Gotas de Esencia (100 pts) antes de 45s.
            </p>
            <p className="text-sm text-pink-600 font-bold mb-6">¡Combo Glow x2 al atrapar 3 seguidas!</p>
            <button 
              onClick={startGame}
              className="px-6 py-2 bg-gradient-to-r from-pink-400 to-teal-400 text-white font-bold rounded-full hover:from-pink-500 hover:to-teal-500 transition-all shadow-md cursor-pointer transform hover:scale-105"
            >
              Comenzar
            </button>
          </div>
        )}

        {isGameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm z-10">
             <p className="font-serif text-xl text-rose-600 font-bold mb-2">Se acabó el tiempo</p>
             <p className="text-gray-600 mb-4">Conseguiste {score} puntos.</p>
             <button 
              onClick={startGame}
              className="px-6 py-2 bg-gradient-to-r from-pink-400 to-teal-400 text-white font-bold rounded-full hover:from-pink-500 hover:to-teal-500 transition-colors shadow-md cursor-pointer"
            >
              Intentar de nuevo
            </button>
          </div>
        )}

        {isWon && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-20">
             <div className="bg-white/90 backdrop-blur-md px-8 py-6 rounded-2xl shadow-xl text-center border-2 border-pink-200 animate-bounce">
                <p className="font-serif text-3xl text-pink-500 font-bold mb-2">¡Completado!</p>
                <p className="text-teal-600 font-medium">+100 Puntos</p>
             </div>
          </div>
        )}

        {isPlaying && (
          <>
            <div className={`absolute top-4 left-4 backdrop-blur-sm px-4 py-2 rounded-full font-bold text-sm shadow-sm z-10 transition-colors duration-300 ${isCombo ? 'bg-amber-100/90 text-amber-600 ring-2 ring-amber-300' : 'bg-white/80 text-teal-600'}`}>
              Puntos: {score} / 100
            </div>
            <div className={`absolute top-4 right-4 backdrop-blur-sm px-4 py-2 rounded-full font-bold text-sm shadow-sm z-10 transition-colors duration-300 ${timeLeft <= 10 ? 'bg-rose-100 text-rose-600 animate-pulse' : 'bg-white/80 text-pink-500'}`}>
              {timeLeft}s
            </div>
            {isCombo && (
                <div className="absolute top-16 left-4 bg-gradient-to-r from-amber-400 to-orange-400 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse shadow-md z-10">
                    COMBO x2 ACTIVO
                </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
