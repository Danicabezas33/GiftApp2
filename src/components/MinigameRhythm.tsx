import React, { useRef, useEffect, useState } from 'react';

interface MinigameRhythmProps {
  onWin: () => void;
}

export function MinigameRhythm({ onWin }: MinigameRhythmProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isWon, setIsWon] = useState(false);
  const [combo, setCombo] = useState(0);

  const startGame = () => {
    setIsPlaying(true);
    setIsGameOver(false);
    setIsWon(false);
    setCombo(0);
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

    let animationId: number;
    let lastTime = performance.now();
    let clock = 0;

    const TARGET_COMBO = 20;

    interface Note {
       id: number;
       x: number;
       y: number;
       targetTime: number;
       active: boolean;
       hitState: 'none' | 'hit' | 'miss';
       animTimer: number; // For hit/miss animations
       feedbackText?: string;
    }

    interface Ripple {
        x: number;
        y: number;
        radius: number;
        maxRadius: number;
        life: number;
        maxLife: number;
    }

    interface Particle {
        x: number;
        y: number;
        vx: number;
        vy: number;
        size: number;
        life: number;
        maxLife: number;
        rot: number;
        vrot: number;
        color: string;
    }

    let notes: Note[] = [];
    let ripples: Ripple[] = [];
    let particles: Particle[] = [];
    
    let noteIdCounter = 0;
    let spawnTimer = 1.0;
    
    // Changing approach rate based on combo
    const getApproachTime = (currentCombo: number) => {
        return Math.max(1.0, 2.0 - (currentCombo * 0.04)); 
    };

    const getSpawnInterval = (currentCombo: number) => {
        return Math.max(0.6, 1.2 - (currentCombo * 0.025));
    };

    let currentCombo = 0; // Local ref for loop

    const spawnNote = () => {
        const padding = 50;
        const x = padding + Math.random() * (canvas.width - padding * 2);
        const y = padding + Math.random() * (canvas.height - padding * 2);
        
        notes.push({
            id: noteIdCounter++,
            x,
            y,
            targetTime: clock + getApproachTime(currentCombo),
            active: true,
            hitState: 'none',
            animTimer: 0
        });
    };

    const spawnRipple = (x: number, y: number) => {
        ripples.push({
            x, y, radius: 10, maxRadius: 80 + Math.random() * 40, life: 0, maxLife: 0.8
        });
    };

    const spawnFloralParticles = (x: number, y: number, isPerfect: boolean) => {
        const colors = isPerfect ? ['#fdf2f8', '#fbcfe8', '#f472b6'] : ['#fefce8', '#fef08a'];
        const count = isPerfect ? 12 : 6;
        for (let i = 0; i < count; i++) {
            particles.push({
                x, y,
                vx: (Math.random() - 0.5) * 150,
                vy: (Math.random() - 0.5) * 150,
                size: 4 + Math.random() * 6,
                life: 0,
                maxLife: 0.6 + Math.random() * 0.4,
                rot: Math.random() * Math.PI * 2,
                vrot: (Math.random() - 0.5) * 5,
                color: colors[Math.floor(Math.random() * colors.length)]
            });
        }
    };

    const handleTap = (tx: number, ty: number) => {
        if (!isPlaying || isWon) return;

        // Find closest active note within range
        let closestNote: Note | null = null;
        let minDist = 60; // hitbox radius

        for(let note of notes) {
            if (!note.active) continue;
            const dx = note.x - tx;
            const dy = note.y - ty;
            const dist = Math.sqrt(dx*dx + dy*dy);
            if (dist < minDist) {
                minDist = dist;
                closestNote = note;
            }
        }

        if (closestNote) {
            const timeDiff = Math.abs(closestNote.targetTime - clock);
            
            if (timeDiff < 0.15) {
                // Perfect
                closestNote.active = false;
                closestNote.hitState = 'hit';
                closestNote.feedbackText = 'Perfect';
                currentCombo++;
                spawnRipple(closestNote.x, closestNote.y);
                spawnRipple(closestNote.x, closestNote.y); // double ripple
                spawnFloralParticles(closestNote.x, closestNote.y, true);
                if (typeof navigator !== 'undefined' && navigator.vibrate) try { navigator.vibrate(20); } catch(e){}
            } else if (timeDiff < 0.35) {
                // Good
                closestNote.active = false;
                closestNote.hitState = 'hit';
                closestNote.feedbackText = 'Good';
                currentCombo++;
                spawnRipple(closestNote.x, closestNote.y);
                spawnFloralParticles(closestNote.x, closestNote.y, false);
                if (typeof navigator !== 'undefined' && navigator.vibrate) try { navigator.vibrate(10); } catch(e){}
            } else {
                // Bad / Miss
                closestNote.active = false;
                closestNote.hitState = 'miss';
                closestNote.feedbackText = 'Miss';
                currentCombo = 0;
            }
            setCombo(currentCombo);

            if (currentCombo >= TARGET_COMBO && !isWon) {
                setIsWon(true);
                setTimeout(() => onWin(), 3000);
            }
        }
    };

    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      let cx, cy;
      if ('touches' in e) {
          cx = e.touches[0].clientX;
          cy = e.touches[0].clientY;
      } else {
          cx = e.clientX;
          cy = e.clientY;
      }
      handleTap(cx - rect.left, cy - rect.top);
    };

    canvas.addEventListener('mousedown', onPointerDown);
    canvas.addEventListener('touchstart', onPointerDown, { passive: false });

    // Background shader points (soft metaballs sort of)
    const bgPoints = [
        { cx: 0, cy: 0, r: 200, phase: 0, speed: 0.5 },
        { cx: 0, cy: 0, r: 250, phase: 2, speed: 0.3 },
        { cx: 0, cy: 0, r: 180, phase: 4, speed: 0.7 }
    ];

    let lilyPads: {x:number, y:number, size:number, rot:number, speed:number}[] = [];
    let kois: {x:number, y:number, size:number, rot:number, speed:number, color:string, wobblePhase:number, targetRot:number}[] = [];
    
    // Initialize bg objects only once
    const initBg = () => {
        lilyPads = [
            { x: canvas.width * 0.2, y: canvas.height * 0.8, size: 30, rot: Math.PI * 0.1, speed: 1.5 },
            { x: canvas.width * 0.8, y: canvas.height * 0.2, size: 40, rot: Math.PI * 0.6, speed: 2 },
            { x: canvas.width * 0.5, y: canvas.height * 0.5, size: 25, rot: Math.PI * 1.2, speed: 1 },
            { x: canvas.width * 0.9, y: canvas.height * 0.9, size: 20, rot: Math.PI * 1.8, speed: 2.5 },
        ];
        kois = [
            { x: canvas.width * 0.3, y: canvas.height * 0.3, size: 25, rot: Math.PI * 0.25, speed: 15, color: '#ea580c', wobblePhase: 0, targetRot: Math.PI * 0.25 },
            { x: canvas.width * 0.7, y: canvas.height * 0.7, size: 20, rot: Math.PI * 1.1, speed: 12, color: '#fef08a', wobblePhase: 2, targetRot: Math.PI * 1.1 },
            { x: Math.random() * canvas.width, y: Math.random() * canvas.height, size: 22, rot: Math.PI * 0.5, speed: 18, color: '#fca5a5', wobblePhase: 1, targetRot: Math.PI * 0.5 }
        ];
    };
    initBg();

    const loop = (currentTime: number) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;
      clock += dt;

      if (!isWon) {
          spawnTimer -= dt;
          if (spawnTimer <= 0) {
              spawnNote();
              spawnTimer = getSpawnInterval(currentCombo);
          }
      }

      // Check for misses based on time
      for (let note of notes) {
          if (note.active && clock > note.targetTime + 0.35) {
              note.active = false;
              note.hitState = 'miss';
              note.feedbackText = 'Miss';
              currentCombo = 0;
              setCombo(currentCombo);
          }
      }

      // Update animations
      for (let note of notes) {
          if (!note.active) {
              note.animTimer += dt;
          }
      }
      for (let i = ripples.length - 1; i >= 0; i--) {
          const r = ripples[i];
          r.life += dt;
          r.radius += (r.maxRadius - r.radius) * dt * 3;
          if (r.life >= r.maxLife) ripples.splice(i, 1);
      }
      for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i];
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.rot += p.vrot * dt;
          p.life += dt;
          if (p.life >= p.maxLife) particles.splice(i, 1);
      }

      // Clean up old notes
      notes = notes.filter(n => n.active || n.animTimer < 1.0);

      // --- DRAW ---
      
      // 1. Zen Spa Background
      const w = canvas.width;
      const h = canvas.height;
      
      // Base color
      ctx.fillStyle = '#0f766e'; // teal-700
      ctx.fillRect(0, 0, w, h);

      // Shifting gradients
      ctx.globalCompositeOperation = 'screen';
      bgPoints.forEach((bp, i) => {
          bp.cx = w/2 + Math.sin(clock * bp.speed + bp.phase) * (w*0.3);
          bp.cy = h/2 + Math.cos(clock * bp.speed * 0.8 + bp.phase) * (h*0.3);
          
          const grad = ctx.createRadialGradient(bp.cx, bp.cy, 0, bp.cx, bp.cy, bp.r);
          if (i === 0) {
              grad.addColorStop(0, 'rgba(45, 212, 191, 0.4)'); // teal-400
              grad.addColorStop(1, 'rgba(45, 212, 191, 0)');
          } else if (i === 1) {
              grad.addColorStop(0, 'rgba(56, 189, 248, 0.3)'); // sky-400
              grad.addColorStop(1, 'rgba(56, 189, 248, 0)');
          } else {
              grad.addColorStop(0, 'rgba(167, 243, 208, 0.2)'); // emerald-200
              grad.addColorStop(1, 'rgba(167, 243, 208, 0)');
          }
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, w, h);
      });
      ctx.globalCompositeOperation = 'source-over';

      // Update and Draw Kois
      kois.forEach(k => {
          k.x += Math.cos(k.rot) * k.speed * dt;
          k.y += Math.sin(k.rot) * k.speed * dt;
          k.wobblePhase += dt * 4;
          
          if (Math.random() < 0.01) {
              k.targetRot = k.rot + (Math.random() - 0.5) * Math.PI;
          }
          k.rot += (k.targetRot - k.rot) * dt * 2;
          
          if (k.x < -60) k.x = w + 60;
          if (k.x > w + 60) k.x = -60;
          if (k.y < -60) k.y = h + 60;
          if (k.y > h + 60) k.y = -60;

          ctx.save();
          ctx.translate(k.x, k.y);
          ctx.rotate(k.rot);
          // Drop shadow
          ctx.shadowColor = 'rgba(0,0,0,0.4)';
          ctx.shadowBlur = 10;
          ctx.shadowOffsetY = 15;
          
          // Body
          ctx.beginPath();
          ctx.ellipse(0, 0, k.size, k.size/2.5, 0, 0, Math.PI * 2);
          ctx.fillStyle = k.color;
          ctx.fill();
          
          ctx.shadowColor = 'transparent';
          
          // Tail
          ctx.beginPath();
          const tailSway = Math.sin(k.wobblePhase) * 10;
          ctx.moveTo(-k.size + 5, 0);
          ctx.lineTo(-k.size - 10, tailSway - 8);
          ctx.lineTo(-k.size - 10, tailSway + 8);
          ctx.fillStyle = k.color;
          ctx.fill();
          
          // Spots
          ctx.beginPath();
          ctx.ellipse(k.size/4, 0, k.size/4, k.size/6, 0, 0, Math.PI * 2);
          ctx.fillStyle = '#fff';
          ctx.fill();
          
          ctx.beginPath();
          ctx.ellipse(-k.size/4, 0, k.size/6, k.size/8, 0, 0, Math.PI * 2);
          ctx.fillStyle = '#e5e7eb';
          ctx.fill();
          
          ctx.restore();
      });

      // Update and Draw Lily pads
      lilyPads.forEach(lp => {
         lp.x += Math.cos(lp.rot) * lp.speed * dt;
         lp.y += Math.sin(lp.rot) * lp.speed * dt;
         if (lp.x < -50) lp.x = w + 50;
         if (lp.x > w + 50) lp.x = -50;
         if (lp.y < -50) lp.y = h + 50;
         if (lp.y > h + 50) lp.y = -50;

         ctx.save();
         ctx.translate(lp.x, lp.y);
         ctx.rotate(lp.rot + clock * 0.1);
         
         ctx.shadowColor = 'rgba(0,0,0,0.3)';
         ctx.shadowBlur = 15;
         ctx.shadowOffsetY = 5;
         
         ctx.beginPath();
         ctx.arc(0, 0, lp.size, 0, Math.PI * 1.8);
         ctx.lineTo(0,0);
         ctx.fillStyle = '#064e3b'; // emerald-900
         ctx.fill();
         
         ctx.shadowColor = 'transparent';
         ctx.shadowOffsetY = 0;
         
         ctx.beginPath();
         ctx.arc(0, 0, lp.size * 0.85, 0, Math.PI * 1.8);
         ctx.lineTo(0,0);
         ctx.fillStyle = '#166534'; // green-800
         ctx.fill();
         ctx.restore();
      });

      // Draw Ripples
      ripples.forEach(r => {
          const alpha = 1 - (r.life / r.maxLife);
          ctx.beginPath();
          ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(204, 253, 246, ${alpha * 0.6})`; // teal-50
          ctx.lineWidth = 2 + (1-alpha)*2;
          ctx.stroke();
      });

      // Draw Notes
      notes.forEach(note => {
          if (note.active) {
              // Time ratios
              const timeLeft = note.targetTime - clock;
              const totalTime = getApproachTime(currentCombo);
              let progress = 1 - (timeLeft / totalTime); // 0 to 1 as it approaches
              if (progress < 0) progress = 0;

              // Draw Stone (Zen rock)
              ctx.save();
              ctx.translate(note.x, note.y);
              // Entrance animation: fade in and slightly float up
              const spawnScale = Math.min(1, progress * 4); // quick scale up at start
              ctx.scale(spawnScale, spawnScale);
              
              // Shadow
              ctx.beginPath();
              ctx.ellipse(0, 15, 25, 10, 0, 0, Math.PI*2);
              ctx.fillStyle = 'rgba(0,0,0,0.3)';
              ctx.fill();

              // Rock body (asymmetrical polygon for zen feel)
              ctx.beginPath();
              ctx.moveTo(0, -20);
              ctx.bezierCurveTo(20, -25, 30, -5, 25, 15);
              ctx.bezierCurveTo(15, 25, -15, 25, -25, 15);
              ctx.bezierCurveTo(-30, -5, -20, -20, 0, -20);
              const rockGrad = ctx.createLinearGradient(-20, -20, 20, 20);
              rockGrad.addColorStop(0, '#64748b'); // slate-500
              rockGrad.addColorStop(1, '#334155'); // slate-700
              ctx.fillStyle = rockGrad;
              ctx.fill();
              
              // Highlight
              ctx.beginPath();
              ctx.ellipse(-10, -10, 8, 4, Math.PI/4, 0, Math.PI*2);
              ctx.fillStyle = 'rgba(255,255,255,0.15)';
              ctx.fill();
              ctx.restore();

              // Draw Approach Ring
              if (timeLeft > 0) {
                  const ringRadius = 25 + (timeLeft / totalTime) * 100;
                  ctx.beginPath();
                  ctx.arc(note.x, note.y, ringRadius, 0, Math.PI*2);
                  ctx.strokeStyle = `rgba(253, 242, 248, ${Math.min(1, progress * 2)})`; // pink-50
                  ctx.lineWidth = 3;
                  ctx.stroke();
              }
          } else {
              // Miss or Hit Animation
              const p = note.animTimer / 1.0; // 0 to 1
              const alpha = 1 - p;
              ctx.save();
              ctx.translate(note.x, note.y);
              
              if (note.hitState === 'miss') {
                  // Sink down
                  ctx.translate(0, p * 30);
                  ctx.scale(1 - p*0.5, 1 - p*0.5);
                  ctx.globalAlpha = alpha;
                  // Draw rock
                  ctx.beginPath();
                  ctx.moveTo(0, -20);
                  ctx.bezierCurveTo(20, -25, 30, -5, 25, 15);
                  ctx.bezierCurveTo(15, 25, -15, 25, -25, 15);
                  ctx.bezierCurveTo(-30, -5, -20, -20, 0, -20);
                  ctx.fillStyle = '#1e293b'; // darken
                  ctx.fill();
                  
                  ctx.fillStyle = '#ef4444'; // red text
              } else {
                  // Hit (float up slightly)
                  ctx.translate(0, -p * 20);
                  ctx.globalAlpha = alpha;
                  ctx.fillStyle = note.feedbackText === 'Perfect' ? '#f472b6' : '#fde047';
              }

              // Draw Feedback Text
              if (note.feedbackText) {
                  ctx.font = 'bold 20px sans-serif';
                  ctx.textAlign = 'center';
                  ctx.textBaseline = 'middle';
                  ctx.shadowColor = 'rgba(0,0,0,0.5)';
                  ctx.shadowBlur = 4;
                  ctx.fillText(note.feedbackText, 0, 0);
                  ctx.shadowBlur = 0;
              }
              ctx.restore();
          }
      });

      // Draw Flower Particles
      particles.forEach(p => {
          const alpha = 1 - (p.life / p.maxLife);
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.globalAlpha = alpha;
          // petal shape
          ctx.beginPath();
          ctx.ellipse(0, 0, p.size, p.size/2, 0, 0, Math.PI*2);
          ctx.fillStyle = p.color;
          ctx.fill();
          ctx.restore();
      });

      // Ambient top glow if won
      if (isWon) {
          ctx.globalCompositeOperation = 'screen';
          ctx.fillStyle = `rgba(253, 242, 248, ${Math.min(1, Math.random() * 0.2 + 0.2)})`;
          ctx.fillRect(0, 0, w, h);
          ctx.globalCompositeOperation = 'source-over';
      }

      animationId = requestAnimationFrame(loop);
    };

    animationId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', updateSize);
      canvas.removeEventListener('mousedown', onPointerDown);
      canvas.removeEventListener('touchstart', onPointerDown);
    };
  }, [isPlaying, isGameOver, isWon, onWin]);

  return (
    <div className="w-full flex justify-center">
      <div className="w-full relative rounded-2xl overflow-hidden border border-teal-200 shadow-inner min-h-[400px] bg-teal-900">
        <canvas 
          ref={canvasRef} 
          className="w-full h-[400px] block touch-none cursor-crosshair" 
        />
        
        {!isPlaying && !isGameOver && !isWon && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-teal-900/60 backdrop-blur-sm z-10 p-6 text-center">
            <h3 className="font-serif text-3xl text-teal-50 mb-2 font-bold drop-shadow-md">Armonía Zen</h3>
            <p className="text-teal-100 mb-6 max-w-sm text-sm drop-shadow-sm">
              Sintoniza con tu paz interior. Toca las piedras mágicas en el momento exacto en que el anillo interior alcance el centro.
              Completa un combo de 20 para lograr la serenidad total.
            </p>
            <button 
              onClick={startGame}
              className="px-8 py-3 bg-white/20 border-2 border-teal-100 text-teal-50 font-bold rounded-full hover:bg-teal-100 hover:text-teal-900 transition-all shadow-[0_0_15px_rgba(204,253,246,0.3)] backdrop-blur-md"
            >
              EMPEZAR
            </button>
          </div>
        )}

        {isWon && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-20">
             <div className="bg-white/20 backdrop-blur-md px-8 py-6 rounded-2xl shadow-[0_0_30px_rgba(253,242,248,0.5)] border border-pink-200 text-center">
                <p className="font-serif text-3xl text-pink-50 font-bold mb-2">Serenidad Alcanzada</p>
                <p className="text-teal-50">Equilibrio perfecto</p>
             </div>
          </div>
        )}

        {isPlaying && (
          <div className="absolute top-4 left-4 right-4 pointer-events-none z-10">
             <div className="flex justify-between items-end mb-1">
                 <span className="text-teal-50 font-bold drop-shadow-md text-lg">Combo: {combo}</span>
                 <span className="text-teal-100 text-xs font-medium uppercase tracking-widest bg-black/20 px-2 py-1 rounded-full">{combo} / 20</span>
             </div>
             <div className="w-full h-3 bg-teal-950/50 rounded-full border border-teal-100/30 overflow-hidden backdrop-blur-sm">
                <div 
                   className="h-full bg-gradient-to-r from-teal-400 to-pink-400 transition-all duration-300 shadow-[0_0_10px_rgba(244,114,182,0.8)]"
                   style={{ width: `${Math.min(100, (combo / 20) * 100)}%` }}
                ></div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
