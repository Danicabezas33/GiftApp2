import React, { useRef, useEffect, useState } from 'react';

interface MinigameSlasherProps {
  onWin: () => void;
}

interface Building { x: number; w: number; h: number; type: 'building'; color: string; }
interface Sign { x: number; y: number; w: number; h: number; type: 'sign'; text: string; color: string; }
interface Lantern { x: number; y: number; h: number; type: 'lantern'; color: string; }
type LayerElement = Building | Sign | Lantern;

interface ParallaxLayer {
    depth: number;
    lightThreshold: number;
    elements: LayerElement[];
    opacity: number;
}

export function MinigameSlasher({ onWin }: MinigameSlasherProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isWon, setIsWon] = useState(false);
  const [glowPower, setGlowPower] = useState(0);

  const startGame = () => {
    setIsPlaying(true);
    setIsGameOver(false);
    setIsWon(false);
    setGlowPower(0);
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

    const playNeonSound = () => {
      try {
          const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
          if (!AudioContext) return;
          const audioCtx = new AudioContext();
          const osc = audioCtx.createOscillator();
          const filter = audioCtx.createBiquadFilter();
          const gain = audioCtx.createGain();
          
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(60, audioCtx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(150, audioCtx.currentTime + 0.1);
          osc.frequency.exponentialRampToValueAtTime(80, audioCtx.currentTime + 0.6);
          
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(500, audioCtx.currentTime);
          filter.frequency.linearRampToValueAtTime(3000, audioCtx.currentTime + 0.2);

          gain.gain.setValueAtTime(0, audioCtx.currentTime);
          gain.gain.linearRampToValueAtTime(0.15, audioCtx.currentTime + 0.05);
          gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.8);
          
          osc.connect(filter);
          filter.connect(gain);
          gain.connect(audioCtx.destination);
          
          osc.start();
          osc.stop(audioCtx.currentTime + 0.8);
      } catch(e) {}
    };

    // Parallax & Layers Setup
    const generateLayers = (): ParallaxLayer[] => {
      const L: ParallaxLayer[] = [];
      const colors = ['#0ff', '#f0f', '#0f8', '#ff0', '#f00', '#00f'];
      const W = canvas.width;
      const H = canvas.height;
      
      // Layer 0: Far Sky (Threshold 100)
      L.push({ depth: 0.1, lightThreshold: 100, elements: [], opacity: 0 }); 

      // Layer 1: Far Buildings (Threshold 80)
      const farBldgs: LayerElement[] = [];
      for(let x = -W; x < W*2; x += 30 + Math.random()*20) {
          farBldgs.push({
              type: 'building', x, w: 20 + Math.random()*30, h: H * 0.5 + Math.random()*H*0.4, color: '#088'
          });
      }
      L.push({ depth: 0.3, lightThreshold: 80, elements: farBldgs, opacity: 0 });

      // Layer 2: Mid Buildings (Threshold 60)
      const midBldgs: LayerElement[] = [];
      for(let x = -W; x < W*2; x += 40 + Math.random()*30) {
          midBldgs.push({
              type: 'building', x, w: 30 + Math.random()*40, h: H * 0.3 + Math.random()*H*0.4, color: '#a0a'
          });
      }
      L.push({ depth: 0.5, lightThreshold: 60, elements: midBldgs, opacity: 0 });

      // Layer 3: Signs (Threshold 40)
      const signs: LayerElement[] = [];
      for(let x = -W; x < W*2; x += 60 + Math.random()*60) {
          signs.push({
              type: 'sign', x, y: H * 0.2 + Math.random() * H * 0.5, w: 20 + Math.random()*30, h: 40 + Math.random()*60, text: ['네온', '게임', '서울', '밤', '사이버'][Math.floor(Math.random()*5)], color: colors[Math.floor(Math.random()*colors.length)]
          });
      }
      L.push({ depth: 0.7, lightThreshold: 40, elements: signs, opacity: 0 });

      // Layer 4: Lanterns (Threshold 20)
      const lanterns: LayerElement[] = [];
      for(let x = -W; x < W*2; x += 100 + Math.random()*50) {
          lanterns.push({
              type: 'lantern', x, y: H - 80, h: 80, color: '#ff0'
          });
      }
      L.push({ depth: 0.9, lightThreshold: 20, elements: lanterns, opacity: 0 });

      return L;
    };

    const parallaxLayers = generateLayers();
    let currentParallaxX = 0;
    let lastTriggeredTier = 0;

    // Game state
    let crystals: { x: number; y: number; vx: number; vy: number; radius: number; points: {x:number, y:number}[]; active: boolean; rot: number; vrot: number; isTrap: boolean }[] = [];
    let particles: { x: number; y: number; vx: number; vy: number; life: number; maxLife: number; color: string }[] = [];
    let trails: { x: number; y: number; birth: number }[] = [];

    let spawnTimer = 0;
    const gravity = 800; // px/s^2

    // Bullet time state
    let bulletTimeTimer = 0;
    let timeScale = 1;

    let power = 0;
    const MAX_POWER = 120; // Need 120 points, each hit is 5 points (so 24 normal cuts)

    let touchPos = { x: canvas.width/2, y: canvas.height/2 };
    let isSwiping = false;
    let flashTimer = 0;
    let isEndingSequence = false;

    // Helper geometry
    const generatePolygon = (radius: number, sides: number) => {
      const pts = [];
      for (let i = 0; i < sides; i++) {
        const angle = (i / sides) * Math.PI * 2;
        const r = radius * (0.8 + Math.random() * 0.4);
        pts.push({ x: Math.cos(angle) * r, y: Math.sin(angle) * r });
      }
      return pts;
    };

    const spawnCrystal = () => {
      const side = Math.random() > 0.5 ? 1 : -1;
      const x = side === 1 ? -30 : canvas.width + 30;
      const y = canvas.height - 50 - Math.random() * 100;
      
      const vx = side === 1 ? 150 + Math.random() * 100 : -150 - Math.random() * 100;
      const vy = -450 - Math.random() * 200;

      const isTrap = Math.random() < 0.25; // 25% chance to be a trap

      crystals.push({
        x, y, vx, vy,
        radius: 25 + Math.random() * 15,
        points: generatePolygon(20, 5 + Math.floor(Math.random() * 3)),
        active: true,
        rot: 0,
        vrot: (Math.random() - 0.5) * 5,
        isTrap
      });
    };

    const spawnCluster = () => {
        const count = Math.floor(Math.random() * 3) + 1; // 1 to 3
        for(let i=0; i<count; i++) {
            setTimeout(spawnCrystal, i * 150);
        }
        spawnTimer = 1.0 + Math.random() * 1.0;
    };


    const spawnExplosion = (x: number, y: number, isTrap: boolean = false) => {
      const colors = isTrap ? ['#f00', '#faa', '#fff'] : ['#0ff', '#f0f', '#fff'];
      for (let i = 0; i < 25; i++) {
        particles.push({
          x, y,
          vx: (Math.random() - 0.5) * 400,
          vy: (Math.random() - 0.5) * 400,
          life: 0,
          maxLife: 0.4 + Math.random() * 0.4,
          color: colors[Math.floor(Math.random() * colors.length)]
        });
      }
    };

    // Math for line segment intersection
    const ccw = (A: {x:number, y:number}, B: {x:number, y:number}, C: {x:number, y:number}) => {
      return (C.y - A.y) * (B.x - A.x) > (B.y - A.y) * (C.x - A.x);
    };

    const intersect = (A: {x:number, y:number}, B: {x:number, y:number}, C: {x:number, y:number}, D: {x:number, y:number}) => {
      return ccw(A, C, D) !== ccw(B, C, D) && ccw(A, B, C) !== ccw(A, B, D);
    };

    // Input handlers
    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      isSwiping = true;
      if (typeof canvas.getBoundingClientRect !== 'function') return;
      const rect = canvas.getBoundingClientRect();
      let clientX, clientY;
      if ('touches' in e) {
          clientX = e.touches[0].clientX;
          clientY = e.touches[0].clientY;
      } else {
          clientX = e.clientX;
          clientY = e.clientY;
      }
      touchPos = { x: clientX - rect.left, y: clientY - rect.top };
      trails.push({ x: touchPos.x, y: touchPos.y, birth: performance.now() });
    };

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
        if (!isSwiping) return;
        e.preventDefault(); // stop scrolling
        if (typeof canvas.getBoundingClientRect !== 'function') return;
        const rect = canvas.getBoundingClientRect();
        let clientX, clientY;
        if ('touches' in e) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }
        
        const newPos = { x: clientX - rect.left, y: clientY - rect.top };
        trails.push({ x: newPos.x, y: newPos.y, birth: performance.now() });

        // Keep trail short
        if (trails.length > 10) trails.shift();

        // Check cuts
        if (trails.length >= 2) {
           const A = trails[trails.length - 2];
           const B = trails[trails.length - 1];
           
           let cutCount = 0;

           for (let i = crystals.length - 1; i >= 0; i--) {
             const c = crystals[i];
             if (!c.active) continue;

             // Fast circle rejection
             const dx = c.x - newPos.x;
             const dy = c.y - newPos.y;
             if (dx*dx + dy*dy > 15000) continue; // Roughly 120px

             // Check line intersect with polygon edges
             let hit = false;
             for (let j = 0; j < c.points.length; j++) {
               const p1 = c.points[j];
               const p2 = c.points[(j + 1) % c.points.length];
               
               // Transform points
               const tp1 = {
                 x: c.x + Math.cos(c.rot) * p1.x - Math.sin(c.rot) * p1.y,
                 y: c.y + Math.sin(c.rot) * p1.x + Math.cos(c.rot) * p1.y
               };
               const tp2 = {
                 x: c.x + Math.cos(c.rot) * p2.x - Math.sin(c.rot) * p2.y,
                 y: c.y + Math.sin(c.rot) * p2.x + Math.cos(c.rot) * p2.y
               };

               if (intersect(A, B, tp1, tp2)) {
                 hit = true;
                 break;
               }
             }

             if (hit) {
                c.active = false;
                cutCount++;
                spawnExplosion(c.x, c.y, c.isTrap);
                
                if (c.isTrap) {
                    power = Math.max(0, power - 10); // Penalty for hitting trap
                } else {
                    power += 5; // Fast progression
                }
                
                const newGlow = Math.min(100, Math.floor((power / MAX_POWER) * 100));
                setGlowPower(newGlow);
             }
           }

           if (cutCount > 0) {
              if (typeof navigator !== 'undefined' && navigator.vibrate) {
                try { if (!navigator.vibrate(15)) flashTimer = 0.1; } catch(e) { flashTimer = 0.1; }
              } else {
                flashTimer = 0.1;
              }
              
              if (cutCount >= 3) { // Pro Effect: 3 crystals at once
                 bulletTimeTimer = 2.0; // 2 seconds of bullet time
              }

              if (power >= MAX_POWER && !isEndingSequence) {
                 isEndingSequence = true;
                 setTimeout(() => {
                    setIsWon(true);
                    setTimeout(() => onWin(), 2000);
                 }, 5000); // give time to enjoy the 100% lit city and flag
              }
           }
        }

        touchPos = newPos;
    };

    const handlePointerUp = () => {
       isSwiping = false;
       trails = [];
    };

    canvas.addEventListener('mousedown', handlePointerDown);
    canvas.addEventListener('mousemove', handlePointerMove, { passive: false });
    window.addEventListener('mouseup', handlePointerUp);
    canvas.addEventListener('touchstart', handlePointerDown, { passive: false });
    canvas.addEventListener('touchmove', handlePointerMove, { passive: false });
    window.addEventListener('touchend', handlePointerUp);

    const loop = (currentTime: number) => {
      const realDt = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;

      // Bullet time logic
      if (bulletTimeTimer > 0) {
         bulletTimeTimer -= realDt;
         timeScale = 0.2; // Slow-mo
      } else {
         timeScale = 1;
      }

      const dt = realDt * timeScale;

      // Update Progressive Lighting Check
      // Tiers: 20, 40, 60, 80, 100
      let currentGlow = Math.min(100, Math.floor((power / MAX_POWER) * 100));
      for(let tier of [20, 40, 60, 80, 100]) {
          if (currentGlow >= tier && lastTriggeredTier < tier) {
              lastTriggeredTier = tier;
              playNeonSound();
          }
      }

      // Update Parallax Layers Ops
      parallaxLayers.forEach(layer => {
         const targetOp = currentGlow >= layer.lightThreshold ? 1 : 0;
         layer.opacity += (targetOp - layer.opacity) * dt * 2; // fade in softly
      });

      // Parallax Movement
      const targetParallaxX = ((touchPos.x - canvas.width/2) / (canvas.width/2)) * 60; // offset
      currentParallaxX += (targetParallaxX - currentParallaxX) * dt * 5;

      if (!isWon && !isGameOver) {
          spawnTimer -= dt;
          if (spawnTimer <= 0) spawnCluster();
      }

      // Update trails fading
      const now = performance.now();
      trails = trails.filter(t => now - t.birth < 200);

      // Update crystals
      for (let i = crystals.length - 1; i >= 0; i--) {
         const c = crystals[i];
         c.vy += gravity * dt;
         c.x += c.vx * dt;
         c.y += c.vy * dt;
         c.rot += c.vrot * dt;

         if (c.y > canvas.height + 100) {
             crystals.splice(i, 1);
         }
      }

      // Update Particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.life += dt;
        if (p.life >= p.maxLife) particles.splice(i, 1);
      }

      // DRAWING
      ctx.save();
      
      if (bulletTimeTimer > 0) {
        // Invert colors effect for bullet time
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.globalCompositeOperation = 'difference';
      } else {
        // Base dark space
        ctx.fillStyle = '#020205'; 
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // Draw Layer 0 (Sky gradient & Neon Moon & Grid)
      if (parallaxLayers[0].opacity > 0) {
          ctx.globalAlpha = parallaxLayers[0].opacity;
          const skyGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
          skyGrad.addColorStop(0, '#0a0a2a');
          skyGrad.addColorStop(1, '#1a0b2e');
          ctx.fillStyle = skyGrad;
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Giant Neon Moon
          ctx.save();
          ctx.translate(canvas.width / 2, canvas.height * 0.4);
          ctx.shadowBlur = 40;
          ctx.shadowColor = '#f0f';
          const moonGrad = ctx.createLinearGradient(0, -80, 0, 80);
          moonGrad.addColorStop(0, '#fdf4ff'); // pink 50
          moonGrad.addColorStop(1, '#d946ef'); // fuchsia 500
          ctx.fillStyle = moonGrad;
          ctx.beginPath();
          ctx.arc(0, 0, 80, 0, Math.PI * 2);
          ctx.fill();

          // Retrowave Grid on the Moon
          ctx.globalCompositeOperation = 'destination-out';
          ctx.fillStyle = '#000';
          for(let i = 0; i < 5; i++) {
             ctx.fillRect(-80, 10 + i * 15, 160, 4);
          }
          ctx.globalCompositeOperation = 'source-over';
          ctx.restore();

          const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
          grad.addColorStop(0, 'rgba(255, 0, 255, 0.1)');
          grad.addColorStop(1, 'rgba(0, 255, 255, 0.4)');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.globalAlpha = 1;
      }

      // Draw Layers 1 to 4
      for(let i=1; i<parallaxLayers.length; i++) {
          const layer = parallaxLayers[i];
          ctx.save();
          ctx.translate(currentParallaxX * layer.depth * -1, 0);

          layer.elements.forEach(el => {
            if (el.type === 'building') {
                ctx.fillStyle = '#050508';
                ctx.fillRect(el.x, canvas.height - el.h, el.w, el.h);
                if (layer.opacity > 0) {
                    ctx.globalAlpha = layer.opacity;
                    ctx.strokeStyle = el.color;
                    ctx.lineWidth = 1;
                    ctx.shadowBlur = 10;
                    ctx.shadowColor = el.color;
                    ctx.strokeRect(el.x, canvas.height - el.h, el.w, el.h);
                    ctx.shadowBlur = 0;
                    ctx.globalAlpha = 1;
                }
            } else if (el.type === 'sign') {
                ctx.fillStyle = '#020202';
                ctx.fillRect(el.x, el.y, el.w, el.h);
                if (layer.opacity > 0) {
                    ctx.globalAlpha = layer.opacity;
                    ctx.strokeStyle = el.color;
                    ctx.lineWidth = 2;
                    ctx.shadowBlur = 15;
                    ctx.shadowColor = el.color;
                    ctx.strokeRect(el.x, el.y, el.w, el.h);
                    
                    ctx.fillStyle = el.color;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.font = '14px bold sans-serif';
                    for(let j=0; j<el.text.length; j++) {
                        ctx.fillText(el.text[j], el.x + el.w/2, el.y + 15 + j*16);
                    }
                    ctx.shadowBlur = 0;
                    ctx.globalAlpha = 1;
                }
            } else if (el.type === 'lantern') {
                ctx.fillStyle = '#020202';
                ctx.fillRect(el.x - 2, el.y, 4, el.h); // pole
                ctx.fillRect(el.x - 8, el.y - 10, 16, 10); // housing
                if (layer.opacity > 0) {
                    ctx.globalAlpha = layer.opacity;
                    ctx.fillStyle = el.color;
                    ctx.shadowBlur = 20;
                    ctx.shadowColor = el.color;
                    ctx.beginPath();
                    ctx.arc(el.x, el.y - 5, 4, 0, Math.PI*2);
                    ctx.fill();
                    ctx.shadowBlur = 0;
                    ctx.globalAlpha = 1;
                }
            }
          });
          
          if (i === 2 && isEndingSequence) {
             const flagX = canvas.width / 2;
             const flagY = canvas.height * 0.4;
             ctx.save();
             // Adjust translation based on current Parallax to keep it on the same building
             // Actually flagX is static, so it floats to the middle building, meaning it waves over whatever is in the middle
             ctx.translate(flagX, flagY);
             
             // pole
             ctx.fillStyle = '#fff';
             ctx.fillRect(0, 0, 3, 100);

             const wave1 = Math.sin(currentTime * 0.005) * 5;
             const wave2 = Math.sin(currentTime * 0.005 + 1) * 5;

             ctx.fillStyle = '#fff'; // White flag
             ctx.beginPath();
             ctx.moveTo(3, 5);
             ctx.quadraticCurveTo(30, 5 + wave1, 60, 5 + wave2);
             ctx.lineTo(60, 45 + wave2);
             ctx.quadraticCurveTo(30, 45 + wave1, 3, 40);
             ctx.fill();

             // Taeguk
             ctx.save();
             ctx.translate(31.5, 25 + (wave1+wave2)/2 - 2.5); // centered vertically and horizontally
             ctx.rotate(0.3); // rotate standard taeguk slightly
             
             ctx.beginPath();
             ctx.arc(0, 0, 10, 0, Math.PI*2);
             ctx.fillStyle = '#0047a0';
             ctx.fill();
             
             ctx.beginPath();
             ctx.arc(0, 0, 10, Math.PI, Math.PI*2);
             ctx.fillStyle = '#cd2e3a';
             ctx.fill();
             
             ctx.beginPath();
             ctx.arc(-5, 0, 5, 0, Math.PI*2);
             ctx.fillStyle = '#cd2e3a';
             ctx.fill();
             
             ctx.beginPath();
             ctx.arc(5, 0, 5, 0, Math.PI*2);
             ctx.fillStyle = '#0047a0';
             ctx.fill();

             ctx.fillStyle = '#000';
             const trigram = (dx: number, dy: number, rot: number) => {
                 ctx.save();
                 ctx.translate(dx, dy);
                 ctx.rotate(rot);
                 ctx.fillRect(-5, -6, 10, 2);
                 ctx.fillRect(-5, -2, 10, 2);
                 ctx.fillRect(-5, 2, 10, 2);
                 ctx.restore();
             };
             trigram(-18, -13, Math.PI/4);
             trigram(18, 13, Math.PI/4);
             trigram(-18, 13, -Math.PI/4);
             trigram(18, -13, -Math.PI/4);
             ctx.restore();
             ctx.restore();
          }

          ctx.restore();
      }

      // Base visual flashes
      if (isWon) {
        ctx.globalCompositeOperation = 'screen';
        ctx.fillStyle = `rgba(0, 255, 255, ${Math.min(1, Math.random() * 0.2 + 0.1)})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.globalCompositeOperation = 'source-over';
      } else if (flashTimer > 0) {
        flashTimer -= realDt;
        ctx.globalCompositeOperation = 'screen';
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(1, flashTimer / 0.1)})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.globalCompositeOperation = 'source-over';
      }


      // Draw active crystals
      for (const c of crystals) {
         if (!c.active) continue;
         ctx.save();
         ctx.translate(c.x, c.y);
         ctx.rotate(c.rot);
         
         ctx.beginPath();
         ctx.moveTo(c.points[0].x, c.points[0].y);
         for (let i = 1; i < c.points.length; i++) {
           ctx.lineTo(c.points[i].x, c.points[i].y);
         }
         ctx.closePath();
         
         if (c.isTrap) {
             ctx.fillStyle = '#200';
             ctx.fill();
             
             ctx.strokeStyle = '#f00';
             ctx.lineWidth = 2;
             ctx.shadowColor = '#f00';
             ctx.shadowBlur = 10;
             ctx.stroke();
         } else {
             ctx.fillStyle = '#111';
             ctx.fill();
             
             ctx.strokeStyle = '#0ff';
             ctx.lineWidth = 2;
             ctx.shadowColor = '#0ff';
             ctx.shadowBlur = 10;
             ctx.stroke();
         }

         ctx.restore();
      }

      // Draw Particles
      ctx.shadowBlur = 15;
      for (const p of particles) {
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        const opacity = 1 - (p.life / p.maxLife);
        ctx.globalAlpha = opacity;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2 + opacity * 4, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;

      // Draw Trail
      if (trails.length > 1) {
         ctx.beginPath();
         ctx.moveTo(trails[0].x, trails[0].y);
         for (let i = 1; i < trails.length; i++) {
            ctx.lineTo(trails[i].x, trails[i].y);
         }
         ctx.lineCap = 'round';
         ctx.lineJoin = 'round';
         ctx.lineWidth = 8;
         ctx.strokeStyle = '#fff';
         ctx.shadowColor = '#f0f';
         ctx.shadowBlur = 20;
         ctx.stroke();

         ctx.lineWidth = 3;
         ctx.strokeStyle = '#0ff';
         ctx.stroke();
         ctx.shadowBlur = 0;
      }

      ctx.restore();

      animationId = requestAnimationFrame(loop);
    };

    animationId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', updateSize);
      canvas.removeEventListener('mousedown', handlePointerDown);
      canvas.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
      canvas.removeEventListener('touchstart', handlePointerDown);
      canvas.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('touchend', handlePointerUp);
    };
  }, [isPlaying, isGameOver, isWon, onWin]);

  return (
    <div className="w-full flex justify-center">
      <div className="w-full relative rounded-2xl overflow-hidden border border-cyan-800 shadow-inner min-h-[400px] bg-black">
        <canvas 
          ref={canvasRef} 
          className="w-full h-[400px] block touch-none cursor-crosshair" 
        />
        
        {!isPlaying && glowPower === 0 && !isGameOver && !isWon && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm z-10">
            <h3 className="font-sans text-2xl text-cyan-400 mb-2 font-bold uppercase tracking-widest drop-shadow-[0_0_10px_rgba(0,255,255,0.8)]">K-Drama City</h3>
            <p className="text-pink-100 mb-6 max-w-xs text-center text-sm px-4 shadow-black drop-shadow-md">
              Desliza tu dedo para destruir los Cristales Oscuros.<br/>Enciende la ciudad.<br/>¡CUIDADO! No cortes los cristales ROJOS.
            </p>
            <button 
              onClick={startGame}
              className="px-8 py-3 bg-transparent border-2 border-cyan-400 text-cyan-400 font-bold rounded-full hover:bg-cyan-400 hover:text-black transition-all shadow-[0_0_15px_rgba(0,255,255,0.4)]"
            >
              INICIAR
            </button>
          </div>
        )}

        {isWon && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-20">
             <div className="bg-black/80 backdrop-blur-md px-8 py-6 rounded-xl shadow-[0_0_30px_rgba(255,0,255,0.5)] border border-pink-500 text-center">
                <p className="font-sans uppercase tracking-widest text-2xl text-cyan-400 font-bold mb-2 animate-pulse">¡Ciudad Encendida!</p>
                <p className="text-pink-300">Glow Power 100%</p>
             </div>
          </div>
        )}

        {isPlaying && (
          <div className="absolute top-4 left-4 right-4 pointer-events-none z-10">
             <div className="w-full h-3 bg-gray-900 rounded-full border border-gray-700 overflow-hidden">
                <div 
                   className="h-full bg-gradient-to-r from-cyan-400 to-pink-500 transition-all duration-300 shadow-[0_0_10px_rgba(0,255,255,0.8)]"
                   style={{ width: `${glowPower}%` }}
                ></div>
             </div>
             <p className="text-xs text-cyan-400 font-bold mt-1 text-right tracking-widest">GLOW {glowPower}%</p>
          </div>
        )}
      </div>
    </div>
  );
}
