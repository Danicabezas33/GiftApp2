import React, { useRef, useEffect, useState } from 'react';

interface MinigameRunnerProps {
  onWin: () => void;
}

export function MinigameRunner({ onWin }: MinigameRunnerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isWon, setIsWon] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);

  const startGame = () => {
    setIsPlaying(true);
    setIsGameOver(false);
    setIsWon(false);
    setTimeLeft(30);
  };

  useEffect(() => {
    if (!isPlaying && !isWon && !isGameOver) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const updateSize = () => {
      canvas.width = canvas.parentElement?.clientWidth || 300;
      canvas.height = 300;
    };
    updateSize();

    let animationId: number;
    let lastTime = performance.now();

    const player = {
      x: 60,
      y: canvas.height - 60,
      vy: 0,
      groundY: canvas.height - 60,
      runTime: 0,
      wasInAir: false
    };

    const gravity = 2000;
    const jumpForce = -650;

    let obstacles: { x: number; y: number; type: 'fox' | 'butterfly' | 'leaf'; speed: number; time: number }[] = [];
    let obstacleTimer = 0;
    let currentRunTimeMs = 0;

    let particles: { x: number; y: number; vx: number; vy: number; life: number; maxLife: number; size: number }[] = [];
    let lastReportedTime = 30;

    // Background parallax offsets
    let bgOffsets = [0, 0, 0];
    const bgSpeeds = [40, 80, 200];

    const spawnObstacle = () => {
      const progress = Math.min(1, currentRunTimeMs / 30);
      const rand = Math.random();
      let type: 'fox' | 'butterfly' | 'leaf' = 'fox';
      
      if (rand > 0.6) {
         type = rand > 0.8 ? 'butterfly' : 'leaf';
      }

      const speed = 180 + Math.random() * 80 + (progress * 350);
      let y = player.groundY;
      if (type === 'leaf') {
         y -= 40 + Math.random() * 40; // in the air
      } else if (type === 'fox') {
         y -= 0; // exactly on ground (draw offset compensates)
      } else if (type === 'butterfly') {
         y -= 25 + Math.random() * 40; // air or ground
      }

      obstacles.push({
        x: canvas.width + 50,
        y: y,
        type,
        speed,
        time: 0
      });
      obstacleTimer = 0.8 + Math.random() * 1.2;
    };

    const spawnDust = (x: number, y: number) => {
      for (let i = 0; i < 5; i++) {
        particles.push({
          x: x + (Math.random() - 0.5) * 10,
          y: y,
          vx: -100 - Math.random() * 50,
          vy: -20 - Math.random() * 30,
          life: 0,
          maxLife: 0.3 + Math.random() * 0.3,
          size: 3 + Math.random() * 4
        });
      }
    };

    const jump = () => {
      if (player.y >= player.groundY) {
        player.vy = jumpForce;
        player.wasInAir = true;
        spawnDust(player.x, player.groundY);
      }
    };

    const handleAction = (e: Event) => {
      e.preventDefault();
      jump();
    };

    canvas.addEventListener('mousedown', handleAction);
    canvas.addEventListener('touchstart', handleAction, { passive: false });

    // Draw dog
    const drawMaltese = (ctx: CanvasRenderingContext2D, x: number, y: number, runTime: number, onGround: boolean, vy: number) => {
      ctx.save();
      ctx.translate(x, y); // base at bottom

      // Jump rotation
      if (!onGround) {
        ctx.rotate(vy * 0.0005);
      } else {
        ctx.translate(0, Math.abs(Math.sin(runTime * 20)) * 2); // bounce
      }

      const phase1 = runTime * 20;
      const phase2 = runTime * 20 + Math.PI;
      
      const leg1Angle = onGround ? Math.sin(phase1) * 0.6 : -0.2;
      const leg2Angle = onGround ? Math.sin(phase2) * 0.6 : 0.5;
      const leg3Angle = onGround ? Math.sin(phase2) * 0.6 : -0.2;
      const leg4Angle = onGround ? Math.sin(phase1) * 0.6 : 0.5;

      const drawLeg = (lx: number, ly: number, angle: number, width: number, length: number, isDark: boolean) => {
        ctx.save();
        ctx.translate(lx, ly);
        ctx.rotate(angle);
        ctx.fillStyle = isDark ? '#e2e8f0' : '#f8fafc';
        ctx.beginPath();
        ctx.roundRect(-width/2, 0, width, length, width/2);
        ctx.fill();
        ctx.restore();
      };

      // Background legs (right side of dog)
      drawLeg(-12, -15, leg1Angle, 6, 14, true); // back leg right
      drawLeg(8, -15, leg3Angle, 5, 14, true); // front leg right

      // Tail
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      const tailAngle = onGround ? Math.sin(runTime * 20) * 0.5 : -Math.PI / 4;
      ctx.ellipse(-25, -20, 10, 5, tailAngle, 0, Math.PI * 2);
      ctx.fill();

      // Body
      ctx.beginPath();
      ctx.ellipse(-2, -18, 22, 14, 0, 0, Math.PI * 2);
      ctx.fill();

      // Head
      ctx.beginPath();
      ctx.ellipse(14, -28, 14, 12, 0, 0, Math.PI * 2);
      ctx.fill();

      // Ears
      // Back ear
      ctx.fillStyle = '#f1f5f9';
      ctx.beginPath();
      ctx.ellipse(8, -25, 5, 12, -Math.PI / 6, 0, Math.PI * 2);
      ctx.fill();
      // Front ear
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(18, -23, 6, 12, 0, 0, Math.PI * 2);
      ctx.fill();

      // Face (eyes & nose)
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.arc(17, -30, 2, 0, Math.PI * 2); // eye
      ctx.fill();
      ctx.beginPath();
      ctx.arc(26, -26, 2.5, 0, Math.PI * 2); // nose
      ctx.fill();

      // Foreground legs (left side of dog)
      drawLeg(-16, -13, leg2Angle, 7, 13, false); // back leg left
      drawLeg(4, -13, leg4Angle, 6, 13, false); // front leg left

      ctx.restore();
    };

    const setIsPlayedAndWon = () => {
      setIsPlaying(false);
      setIsWon(true);
      setTimeout(() => onWin(), 2500);
    };

    const loop = (currentTime: number) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;

      const timeOffset0 = bgOffsets[0];
      const timeOffset1 = bgOffsets[1];
      const timeOffset2 = bgOffsets[2];

      if (isPlaying) {
        currentRunTimeMs += dt;
        const remaining = Math.max(0, 30 - currentRunTimeMs);
        const ceilRemaining = Math.ceil(remaining);
        if (ceilRemaining !== lastReportedTime) {
           setTimeLeft(ceilRemaining);
           lastReportedTime = ceilRemaining;
        }

        if (remaining <= 0) {
          setIsPlayedAndWon();
          return;
        }

        // Update background
        for (let i = 0; i < bgOffsets.length; i++) {
          bgOffsets[i] += bgSpeeds[i] * dt;
        }

        // Update player
        player.vy += gravity * dt;
        player.y += player.vy * dt;
        player.runTime += dt;

        let onGround = false;
        if (player.y >= player.groundY) {
          player.y = player.groundY;
          player.vy = 0;
          onGround = true;

          if (player.wasInAir) {
            player.wasInAir = false;
            spawnDust(player.x, player.groundY);
          }
        }

        obstacleTimer -= dt;
        if (obstacleTimer <= 0) {
          spawnObstacle();
        }

        // Jump particles (dust trails)
        if (onGround && Math.random() < 0.2) {
          particles.push({
            x: player.x - 10,
            y: player.groundY,
            vx: -50,
            vy: 0,
            life: 0,
            maxLife: 0.2 + Math.random() * 0.2,
            size: 2 + Math.random() * 3
          });
        }

        // Iterate particles
        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i];
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.life += dt;
          if (p.life >= p.maxLife) particles.splice(i, 1);
        }

        // Iterate obstacles
        for (let i = obstacles.length - 1; i >= 0; i--) {
          const obs = obstacles[i];
          obs.x -= obs.speed * dt;
          obs.time += dt;

          if (obs.x < -40) {
            obstacles.splice(i, 1);
            continue;
          }

          // Simple circular collision check
          const dx = player.x - obs.x;
          const dy = (player.y - 10) - obs.y; 
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < 22) {
            setIsGameOver(true);
            setIsPlaying(false);
            return;
          }
        }
      }

      // DRAWING
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Sky
      const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      grad.addColorStop(0, '#f0fdf4');
      grad.addColorStop(1, '#dcfce7');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Layer 0: Mountains
      ctx.fillStyle = '#86efac'; // green-300
      ctx.beginPath();
      ctx.moveTo(0, canvas.height);
      for(let x = 0; x <= canvas.width + 10; x += 10) {
        ctx.lineTo(x, canvas.height - 40 - Math.abs(Math.sin((x + timeOffset0) * 0.02)) * 50);
      }
      ctx.lineTo(canvas.width, canvas.height);
      ctx.fill();

      // Layer 1: Near hills/bushes
      ctx.fillStyle = '#4ade80'; // green-400
      ctx.beginPath();
      ctx.moveTo(0, canvas.height);
      for(let x = 0; x <= canvas.width + 10; x += 10) {
        ctx.lineTo(x, canvas.height - 40 - Math.abs(Math.sin((x + timeOffset1) * 0.05)) * 30);
      }
      ctx.lineTo(canvas.width, canvas.height);
      ctx.fill();

      // Ground plane
      ctx.fillStyle = '#22c55e'; // green-500 base field
      ctx.fillRect(0, player.groundY, canvas.width, canvas.height - player.groundY);

      // Grass on the ground moving
      const flowCycle = 60;
      const fOffset = timeOffset2 % flowCycle;
      for(let x = -fOffset; x <= canvas.width + 60; x += flowCycle) {
        ctx.save();
        ctx.translate(x, player.groundY + 12 + Math.sin(x)*4); // Scatter Y slightly
        
        ctx.fillStyle = '#166534'; // green-800 grass
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-4, -8);
        ctx.lineTo(2, 0);
        ctx.lineTo(4, -10);
        ctx.lineTo(6, 0);
        ctx.lineTo(10, -6);
        ctx.lineTo(8, 0);
        ctx.fill();
        ctx.restore();
      }

      // Draw particles
      ctx.fillStyle = '#cbd5e1'; // slate-300 dust
      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (1 - p.life / p.maxLife), 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw player
      drawMaltese(ctx, player.x, Math.min(player.y, player.groundY), player.runTime, player.y >= player.groundY, player.vy);

      // Draw obstacles
      for (const obs of obstacles) {
        ctx.save();
        ctx.translate(obs.x, obs.y);
        
        if (obs.type === 'fox') {
          ctx.translate(0, -10 + Math.abs(Math.sin(obs.time * 25)) * 4); // bounce tighter and slightly higher
          ctx.scale(-1, 1); // Flip horizontally so it faces left (moving towards player)

          const phase1 = obs.time * 25;
          const phase2 = obs.time * 25 + Math.PI;

          const fLegAngle1 = Math.sin(phase1) * 1.0;
          const fLegAngle2 = Math.sin(phase2) * 1.0;

          // Tail
          ctx.save();
          ctx.translate(-16, -10);
          ctx.rotate(Math.sin(obs.time * 20) * 0.4 - 0.2);
          ctx.fillStyle = '#ea580c';
          ctx.beginPath();
          ctx.ellipse(0, 0, 12, 5, -0.2, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.ellipse(-10, 0, 5, 4, -0.2, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();

          // Body
          ctx.fillStyle = '#ea580c'; // orange-600
          ctx.beginPath();
          ctx.ellipse(0, -10, 16, 7, Math.sin(obs.time*25)*0.1, 0, Math.PI * 2);
          ctx.fill();
          // Underside
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.ellipse(0, -6, 12, 3, Math.sin(obs.time*25)*0.1, 0, Math.PI * 2);
          ctx.fill();

          // Head
          ctx.fillStyle = '#ea580c';
          ctx.beginPath();
          // Neck to head
          ctx.ellipse(14, -14, 8, 6, -0.1, 0, Math.PI * 2);
          ctx.fill();

          // Ears
          ctx.beginPath();
          ctx.moveTo(10, -18);
          ctx.lineTo(8, -26);
          ctx.lineTo(14, -20);
          ctx.fill();
          ctx.beginPath();
          ctx.moveTo(14, -18);
          ctx.lineTo(12, -26);
          ctx.lineTo(18, -18);
          ctx.fill();

          // Snout
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.moveTo(14, -12);
          ctx.lineTo(24, -10);
          ctx.lineTo(16, -16);
          ctx.fill();
          
          // Nose tip
          ctx.fillStyle = '#000000';
          ctx.beginPath();
          ctx.arc(24, -10, 2, 0, Math.PI * 2);
          ctx.fill();

          // Eye
          ctx.beginPath();
          ctx.arc(18, -14, 1.5, 0, Math.PI * 2);
          ctx.fill();

          // Legs
          ctx.lineWidth = 4;
          ctx.lineCap = 'round';

          // Background legs
          ctx.strokeStyle = '#9a3412';
          ctx.beginPath();
          ctx.moveTo(-6, -5);
          ctx.lineTo(-6 + Math.sin(fLegAngle2)*10, -5 + Math.cos(fLegAngle2)*10);
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(8, -5);
          ctx.lineTo(8 + Math.sin(fLegAngle1)*10, -5 + Math.cos(fLegAngle1)*10);
          ctx.stroke();

          // Foreground legs
          ctx.strokeStyle = '#c2410c'; // darker orange
          ctx.beginPath();
          ctx.moveTo(-10, -5);
          ctx.lineTo(-10 + Math.sin(fLegAngle1)*10, -5 + Math.cos(fLegAngle1)*10);
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(12, -5);
          ctx.lineTo(12 + Math.sin(fLegAngle2)*10, -5 + Math.cos(fLegAngle2)*10);
          ctx.stroke();

        } else if (obs.type === 'butterfly') {
          ctx.translate(0, Math.sin(obs.time * 10) * 10);
          const flap = Math.abs(Math.sin(obs.time * 20)); // 0 to 1
          
          ctx.fillStyle = '#d946ef'; // Fuchsia
          ctx.beginPath();
          ctx.ellipse(6 * flap, -4, 8 * flap, 10, Math.PI/6, 0, Math.PI*2);
          ctx.ellipse(-6 * flap, -4, 8 * flap, 10, -Math.PI/6, 0, Math.PI*2);
          ctx.fill();
          
          // Body
          ctx.fillStyle = '#1e293b';
          ctx.beginPath();
          ctx.ellipse(0, 0, 2, 8, 0, 0, Math.PI*2);
          ctx.fill();

        } else if (obs.type === 'leaf') {
          ctx.translate(0, Math.sin(obs.time * 5) * 5);
          ctx.rotate(Math.sin(obs.time * 2) * 0.2);
          
          ctx.fillStyle = '#16a34a'; // Green leaf
          ctx.beginPath();
          ctx.moveTo(0, -12);
          ctx.quadraticCurveTo(15, -5, 12, 10);
          ctx.quadraticCurveTo(0, 15, -12, 10);
          ctx.quadraticCurveTo(-15, -5, 0, -12);
          ctx.fill();
          
          // Stem
          ctx.beginPath();
          ctx.moveTo(0, 10);
          ctx.lineTo(0, 16);
          ctx.strokeStyle = '#15803d';
          ctx.lineWidth = 2;
          ctx.stroke();
          
          // AC style bite/hole
          ctx.beginPath();
          ctx.arc(-4, 4, 3, 0, Math.PI * 2);
          ctx.globalCompositeOperation = 'destination-out';
          ctx.fillStyle = '#000000';
          ctx.fill();
          ctx.globalCompositeOperation = 'source-over';
        }
        
        ctx.restore();
      }

      animationId = requestAnimationFrame(loop);
    };

    animationId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', updateSize);
      canvas.removeEventListener('mousedown', handleAction);
      canvas.removeEventListener('touchstart', handleAction);
    };
  }, [isPlaying, isGameOver, isWon, onWin]);

  return (
    <div className="w-full flex justify-center">
      <div className="w-full relative rounded-2xl overflow-hidden border border-[#FF8BA7]/30 shadow-inner min-h-[300px]">
        <canvas 
          ref={canvasRef} 
          className="w-full h-[300px] block cursor-pointer touch-none" 
        />
        
        {!isPlaying && timeLeft === 30 && !isGameOver && !isWon && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/60 backdrop-blur-sm z-10">
            <h3 className="font-serif text-xl text-[#D1495B] mb-2 font-bold">¡Escapa Nala!</h3>
            <p className="text-[#5F4B66]/80 mb-6 max-w-xs text-center">
              ¡Ayuda a Nala a esquivar las hojas, zorros y mariposas durante 30 segundos!
            </p>
            <button 
              onClick={startGame}
              className="px-6 py-2 bg-[#FF8BA7] text-white font-bold rounded-full hover:bg-pink-400 transition-colors shadow-md"
            >
              Comenzar
            </button>
          </div>
        )}

        {isGameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm z-10">
             <p className="font-serif text-xl text-[#D1495B] font-bold mb-2">¡Ups!</p>
             <p className="text-[#5F4B66]/80 mb-4">Aguantaste {30 - timeLeft} segundos</p>
             <button 
              onClick={startGame}
              className="px-6 py-2 bg-[#FF8BA7] text-white font-bold rounded-full hover:bg-pink-400 transition-colors shadow-md"
            >
              Intentar de nuevo
            </button>
          </div>
        )}

        {isWon && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-20">
             <div className="bg-white/90 backdrop-blur-md px-6 py-4 rounded-xl shadow-xl text-center border border-pink-100 animate-bounce">
                <p className="font-serif text-2xl text-[#FF8BA7] font-bold mb-1">¡Completado!</p>
                <p className="text-[#5F4B66]/80">¡Has resistido 30 segundos!</p>
             </div>
          </div>
        )}

        {isPlaying && (
          <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full text-[#D1495B] font-bold text-sm shadow-sm pointer-events-none">
            {timeLeft}s
          </div>
        )}
      </div>
    </div>
  );
}
