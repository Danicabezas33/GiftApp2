import React, { useRef, useEffect, useState } from 'react';

interface MinigameSushiStackerProps {
  onWin: () => void;
}

export function MinigameSushiStacker({ onWin }: MinigameSushiStackerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isWon, setIsWon] = useState(false);
  const [score, setScore] = useState(0);

  const startGame = () => {
    setIsPlaying(true);
    setIsGameOver(false);
    setIsWon(false);
    setScore(0);
  };

  useEffect(() => {
    if (!isPlaying && !isWon && !isGameOver) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const updateSize = () => {
      canvas.width = canvas.parentElement?.clientWidth || 300;
      canvas.height = 350;
    };
    updateSize();

    let animationId: number;
    let lastTime = performance.now();
    let clock = 0;

    const BLOCK_H = 25;
    const INITIAL_W = 120;
    const MAX_PIECES = 12;

    const types = ['plate', 'rice', 'salmon', 'nori', 'tuna', 'rice', 'tamago', 'salmon'];

    let perfectCount = 0;
    let cameraY = 0;
    let stack: { x: number; y: number; w: number; type: string }[] = [];
    stack.push({
      x: canvas.width / 2 - INITIAL_W / 2,
      y: canvas.height - 50,
      w: INITIAL_W,
      type: 'plate',
    });

    let currentBlock = {
      x: 0,
      y: canvas.height - 50 - BLOCK_H,
      w: INITIAL_W,
      type: types[1],
      speed: 160,
      direction: 1
    };

    let fallingBlocks: { x: number; y: number; w: number; type: string; vy: number; rot: number; vrot: number }[] = [];
    let particles: { x: number; y: number; vx: number; vy: number; life: number; color: string }[] = [];
    let petals: { x: number; y: number; vx: number; vy: number; rot: number; rs: number; phase: number }[] = [];

    let shake = 0;
    let instability = 0;
    let zoom = 1;
    let winAnimTimer = 0;
    let inWinCutscene = false;

    // Helper: spawn rice/juice
    const spawnParticles = (cx: number, cy: number, color: string) => {
      for (let i = 0; i < 12; i++) {
        particles.push({
          x: cx + (Math.random() - 0.5) * 10,
          y: cy + (Math.random() - 0.5) * 10,
          vx: (Math.random() - 0.5) * 150,
          vy: -Math.random() * 150 - 50,
          life: 1.0,
          color: Math.random() > 0.5 ? color : '#ffffff'
        });
      }
    };

    const spawnPetal = () => {
      petals.push({
        x: Math.random() * canvas.width,
        y: -cameraY - 20,
        vx: (Math.random() - 0.5) * 30 + 10,
        vy: Math.random() * 40 + 30,
        rot: Math.random() * Math.PI * 2,
        rs: (Math.random() - 0.5) * 2,
        phase: Math.random() * 10
      });
    };

    const dropBlock = () => {
      if (isGameOver || inWinCutscene || !isPlaying) return;

      const topBlock = stack[stack.length - 1];

      let cLeft = currentBlock.x;
      let cRight = currentBlock.x + currentBlock.w;
      const tLeft = topBlock.x;
      const tRight = topBlock.x + topBlock.w;

      // Perfect alignment check
      let isPerfect = false;
      if (Math.abs(cLeft - tLeft) < 7) {
         cLeft = tLeft;
         cRight = tLeft + currentBlock.w;
         isPerfect = true;
         perfectCount++;
      } else if (Math.abs(cRight - tRight) < 7) {
         cRight = tRight;
         cLeft = tRight - currentBlock.w;
         isPerfect = true;
         perfectCount++;
      } else {
         perfectCount = 0;
      }

      const oLeft = Math.max(cLeft, tLeft);
      const oRight = Math.min(cRight, tRight);
      const overlap = oRight - oLeft;

      if (overlap <= 0) {
        // Total miss
        fallingBlocks.push({
          ...currentBlock,
          vy: 0, rot: 0, vrot: currentBlock.direction * 5
        });
        setIsGameOver(true);
        setIsPlaying(false);
        return;
      }

      let bonusW = 0;
      if (perfectCount >= 3) {
          bonusW = 16;
          perfectCount = 0;
          spawnParticles(oLeft + overlap/2, currentBlock.y, '#fde047'); // gold particles reward
      }

      // Hit & Crop
      stack.push({
        x: oLeft - bonusW/2,
        y: currentBlock.y,
        w: overlap + bonusW,
        type: currentBlock.type,
      });

      const piecesPlaced = stack.length - 1;
      setScore(piecesPlaced);
      shake = isPerfect ? 5 : 10;

      // Calculate overhang pieces
      let particleColor = currentBlock.type === 'salmon' ? '#fca5a5' : '#f1f5f9';

      if (cLeft < tLeft) {
        // overhang left
        fallingBlocks.push({
          x: cLeft, y: currentBlock.y, w: tLeft - cLeft, type: currentBlock.type,
          vy: 0, rot: 0, vrot: -2 - Math.random() * 2
        });
        spawnParticles(tLeft, currentBlock.y + BLOCK_H, particleColor);
      }
      if (cRight > tRight) {
        // overhang right
        fallingBlocks.push({
          x: tRight, y: currentBlock.y, w: cRight - tRight, type: currentBlock.type,
          vy: 0, rot: 0, vrot: 2 + Math.random() * 2
        });
        spawnParticles(tRight, currentBlock.y + BLOCK_H, particleColor);
      }

      // Add instability (center of overlap vs center of base)
      const overlapCenter = oLeft + overlap / 2;
      const baseCenter = canvas.width / 2;
      const deviation = overlapCenter - baseCenter;
      instability += deviation * 0.08; // Increase sway

      if (piecesPlaced >= MAX_PIECES) {
        inWinCutscene = true;
        setIsWon(true);
        setTimeout(() => onWin(), 3500); // Trigger win outwardly after anim
        return;
      }

      // Next block
      const nextPiecesPlaced = piecesPlaced + 1;
      let nextBaseSpeed = 160 + nextPiecesPlaced * 30;
      let nextSpeed = nextBaseSpeed * (nextPiecesPlaced >= 8 ? 1.3 : 1);

      currentBlock = {
        x: currentBlock.direction === 1 ? 0 : canvas.width - overlap,
        y: canvas.height - 50 - nextPiecesPlaced * BLOCK_H,
        w: overlap + bonusW, // Use the widened base if perfect combo
        type: types[nextPiecesPlaced % types.length],
        speed: nextSpeed,
        direction: currentBlock.direction * -1
      };
    };

    const handleInput = (e: Event) => {
      e.preventDefault();
      dropBlock();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
       if (e.code === 'Space' && (isPlaying || inWinCutscene)) {
         e.preventDefault();
         dropBlock();
       }
    };

    window.addEventListener('keydown', handleKeyDown);
    canvas.addEventListener('mousedown', handleInput);
    canvas.addEventListener('touchstart', handleInput, { passive: false });

    // DRAW HELPERS
    const drawSushiPiece = (ctx: CanvasRenderingContext2D, piece: {x:number, y:number, w:number, type:string}) => {
       ctx.save();
       if (piece.type === 'plate') {
         ctx.fillStyle = '#1e293b'; // slate-800
         ctx.beginPath();
         ctx.roundRect(piece.x - 10, piece.y, piece.w + 20, 10, 5);
         ctx.fill();
         ctx.fillStyle = '#ef4444'; // rose red stripe
         ctx.fillRect(piece.x - 5, piece.y + 4, piece.w + 10, 2);
       } else if (piece.type === 'rice') {
         const grad = ctx.createLinearGradient(0, piece.y, 0, piece.y + BLOCK_H);
         grad.addColorStop(0, '#ffffff');
         grad.addColorStop(1, '#e2e8f0');
         ctx.fillStyle = grad;
         ctx.beginPath();
         ctx.roundRect(piece.x, piece.y, piece.w, BLOCK_H, 4);
         ctx.fill();
         // Rice specular
         ctx.fillStyle = 'rgba(255,255,255,0.8)';
         ctx.fillRect(piece.x + 2, piece.y + 2, piece.w - 4, 3);
       } else if (piece.type === 'salmon') {
         const grad = ctx.createLinearGradient(piece.x, 0, piece.x + piece.w, 0);
         grad.addColorStop(0, '#fca5a5'); // red-300
         grad.addColorStop(0.5, '#f87171'); // red-400
         grad.addColorStop(1, '#fca5a5');
         ctx.fillStyle = grad;
         ctx.beginPath();
         ctx.roundRect(piece.x, piece.y, piece.w, BLOCK_H, 4);
         ctx.fill();
         // Salmon stripes
         ctx.strokeStyle = '#fecaca'; // red-200
         ctx.lineWidth = 2;
         for (let i = piece.x + 10; i < piece.x + piece.w; i += 12) {
             ctx.beginPath();
             ctx.moveTo(i, piece.y);
             ctx.lineTo(i - 5, piece.y + BLOCK_H);
             ctx.stroke();
         }
       } else if (piece.type === 'nori') {
         ctx.fillStyle = '#064e3b'; // emerald-900 (dark sea green)
         ctx.beginPath();
         ctx.roundRect(piece.x, piece.y, piece.w, BLOCK_H, 2);
         ctx.fill();
       } else if (piece.type === 'tuna') {
         const grad = ctx.createLinearGradient(0, piece.y, 0, piece.y + BLOCK_H);
         grad.addColorStop(0, '#ef4444'); // red-500
         grad.addColorStop(1, '#b91c1c'); // red-700
         ctx.fillStyle = grad;
         ctx.beginPath();
         ctx.roundRect(piece.x, piece.y, piece.w, BLOCK_H, 4);
         ctx.fill();
       } else if (piece.type === 'tamago') {
         const grad = ctx.createLinearGradient(0, piece.y, 0, piece.y + BLOCK_H);
         grad.addColorStop(0, '#fef08a'); // yellow-200
         grad.addColorStop(1, '#eab308'); // yellow-500
         ctx.fillStyle = grad;
         ctx.beginPath();
         ctx.roundRect(piece.x, piece.y, piece.w, BLOCK_H, 4);
         ctx.fill();
         ctx.strokeStyle = '#a16207'; // nori stripe for tamago
         ctx.lineWidth = 6;
         ctx.strokeRect(piece.x + piece.w/2 - 3, piece.y, 6, BLOCK_H);
       }
       ctx.restore();
    };

    const loop = (currentTime: number) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;
      clock += dt;

      // Draw Background
      const bgGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      bgGrad.addColorStop(0, '#1e1b4b'); // indigo-950
      bgGrad.addColorStop(1, '#312e81'); // indigo-900
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw subtle Japanese pattern or just some stars/dust
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      for (let i = 0; i < 20; i++) {
        ctx.beginPath();
        ctx.arc(
          (Math.sin(i * 13) * 0.5 + 0.5) * canvas.width,
          (Math.cos(i * 17) * 0.5 + 0.5) * canvas.height,
          1 + (i % 3),
          0, Math.PI * 2
        );
        ctx.fill();
      }

      // Update camera follow smoothly
      const targetCameraY = Math.max(0, (stack.length - 6) * BLOCK_H);
      cameraY += (targetCameraY - cameraY) * dt * 5;

      if (isPlaying && !inWinCutscene) {
        // Update current block
        let windMultiplier = 1;
        if (score + 1 >= 12) {
            windMultiplier = 1.0 + Math.sin(clock * 6 + currentBlock.x * 0.01) * 0.5; // Wind erratic effect
        }
        currentBlock.x += currentBlock.speed * currentBlock.direction * windMultiplier * dt;
        
        if (currentBlock.x < 0) {
          currentBlock.x = 0;
          currentBlock.direction = 1;
        } else if (currentBlock.x + currentBlock.w > canvas.width) {
          currentBlock.x = canvas.width - currentBlock.w;
          currentBlock.direction = -1;
        }
      }

      if (inWinCutscene) {
          winAnimTimer += dt;
          if (zoom > 0.6) zoom -= dt * 0.4; // Smooth zoom out
          if (winAnimTimer % 0.1 < dt) spawnPetal(); // Continuous petals
      }

      // Update falling blocks
      for (let i = fallingBlocks.length - 1; i >= 0; i--) {
        const b = fallingBlocks[i];
        b.vy += 600 * dt; // gravity
        b.y += b.vy * dt;
        b.rot += b.vrot * dt;
        if (b.y > canvas.height - cameraY + 50) {
          fallingBlocks.splice(i, 1);
        }
      }

      // Update particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.vy += 800 * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.life -= dt;
        if (p.life <= 0) particles.splice(i, 1);
      }

      // Update petals
      for (let i = petals.length - 1; i >= 0; i--) {
          const p = petals[i];
          p.x += (p.vx + Math.sin(clock * 2 + p.phase) * 20) * dt;
          p.y += p.vy * dt;
          p.rot += p.rs * dt;
          if (p.y > canvas.height - cameraY + 10) petals.splice(i, 1);
      }

      // Shake logic
      if (shake > 0) shake -= dt * 30;
      if (shake < 0) shake = 0;

      ctx.save();
      
      // Apply Camera Zoom & Center
      if (zoom !== 1) {
          const cy = canvas.height/2 + 50; 
          ctx.translate(canvas.width/2, cy);
          ctx.scale(zoom, zoom);
          ctx.translate(-canvas.width/2, -cy);
      }

      ctx.translate(0, cameraY);

      // Apply Shake
      if (shake > 0) {
        const dx = (Math.random() - 0.5) * shake;
        const dy = (Math.random() - 0.5) * shake;
        ctx.translate(dx, dy);
      }

      // Draw Stack
      const swayMax = Math.sin(clock * 4) * instability;
      let swayAcc = 0;

      for (let i = 0; i < stack.length; i++) {
        const b = stack[i];
        ctx.save();
        
        // Apply Wobble based on height
        if (i > 0) {
            swayAcc += swayMax * (i / stack.length) * 0.1; 
            ctx.translate(swayAcc, 0); 
        }

        drawSushiPiece(ctx, b);
        ctx.restore();
      }

      // Draw Current Block
      if (isPlaying && !inWinCutscene) {
        drawSushiPiece(ctx, currentBlock);
      }

      // Draw Falling
      for (const b of fallingBlocks) {
        ctx.save();
        ctx.translate(b.x + b.w/2, b.y + BLOCK_H/2);
        ctx.rotate(b.rot);
        ctx.translate(-(b.x + b.w/2), -(b.y + BLOCK_H/2));
        drawSushiPiece(ctx, b);
        ctx.restore();
      }

      // Draw Particles
      for (const p of particles) {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.beginPath();
        if (p.color === '#ffffff') {
           // rice grain
           ctx.ellipse(p.x, p.y, 4, 2, p.vx * 0.01, 0, Math.PI * 2);
        } else {
           // splash
           ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        }
        ctx.fill();
      }
      ctx.globalAlpha = 1.0; // Ensure it resets even if life <= 0

      // Draw Petals 
      if (petals.length > 0) {
          ctx.fillStyle = '#fbcfe8'; // pink-200
          for (const p of petals) {
              ctx.save();
              ctx.translate(p.x, p.y);
              ctx.rotate(p.rot);
              ctx.beginPath();
              // petal shape
              ctx.bezierCurveTo(10, -5, 10, 5, 0, 10);
              ctx.bezierCurveTo(-10, 5, -10, -5, 0, -10);
              ctx.bezierCurveTo(5, -10, 5, -5, 0, 0); 
              ctx.fill();
              ctx.restore();
          }
      }

      ctx.restore();

      animationId = requestAnimationFrame(loop);
    };

    animationId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', updateSize);
      canvas.removeEventListener('mousedown', handleInput);
      canvas.removeEventListener('touchstart', handleInput);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isPlaying, isGameOver, isWon, onWin]);

  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full relative bg-pink-50/50 rounded-2xl overflow-hidden border border-pink-100 shadow-inner min-h-[350px] flex items-center justify-center cursor-pointer">
        <canvas 
          ref={canvasRef} 
          className="w-full h-[350px] block touch-none" 
        />
        
        {!isPlaying && score === 0 && !isGameOver && !isWon && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm z-10 pointer-events-none">
            <h3 className="font-serif text-2xl text-[#D1495B] mb-2 font-bold drop-shadow-sm">Sushi Tower</h3>
            <p className="font-sans text-[#9D84A3] mb-6 px-6 text-center max-w-sm text-sm">
              Toca la pantalla para apilar. Si no centras bien las piezas, la torre podría desestabilizarse. Construye 12 pisos perfectos.
            </p>
            <button 
              onClick={(e) => { e.stopPropagation(); startGame(); }}
              className="px-8 py-3 bg-[#FF8BA7] text-white font-bold rounded-full hover:bg-pink-400 transition-colors shadow-md pointer-events-auto transform hover:scale-105"
            >
              ¡A Cocinar!
            </button>
          </div>
        )}

        {isGameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm z-10 pointer-events-none">
             <div className="text-4xl mb-3 animate-bounce">🍣💥</div>
             <p className="font-serif text-2xl text-[#D1495B] font-bold mb-2">¡Desastre en la cocina!</p>
             <p className="text-[#9D84A3] mb-6 font-medium text-sm">Lograste {score} pisos de sabor.</p>
             <button 
              onClick={(e) => { e.stopPropagation(); startGame(); }}
              className="px-8 py-3 bg-[#FF8BA7] text-white font-bold rounded-full hover:bg-pink-400 transition-colors shadow-md pointer-events-auto transform hover:scale-105"
            >
              Intentar de nuevo
            </button>
          </div>
        )}

        {isWon && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-20">
             <div className="bg-white/90 backdrop-blur-md px-8 py-6 rounded-2xl shadow-xl shadow-pink-200/50 border border-pink-100 text-center animate-bounce mt-32">
                <p className="font-serif text-3xl text-[#D1495B] font-bold mb-2">¡Torre Perfecta!</p>
                <p className="text-[#FF8BA7] font-medium">Cena Sushi superada 🎉</p>
             </div>
          </div>
        )}

        {isPlaying && !isWon && (
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full text-[#D1495B] font-bold text-sm shadow-sm z-10 border border-pink-50 flex items-center gap-2 pointer-events-none">
            <span className="text-lg">🍣</span> {score} / 12
          </div>
        )}
      </div>
    </div>
  );
}
