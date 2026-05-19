import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { X } from 'lucide-react';

interface ScratchCardProps {
  tipoRegalo: string;
  imagenRegalo: string;
  onClose: () => void;
  onComplete: () => void;
}

export function ScratchCard({ tipoRegalo, imagenRegalo, onClose, onComplete }: ScratchCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isScratched, setIsScratched] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    // Set canvas resolution based on container
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    // Fill with petal pink color
    ctx.fillStyle = '#ff8ba7'; 
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add text
    ctx.font = 'bold 20px serif';
    ctx.fillStyle = '#130f1d';
    ctx.textAlign = 'center';
    
    // Wrap text pseudo logic
    ctx.fillText('¡Rasca para descubrir', canvas.width / 2, canvas.height / 2 - 10);
    ctx.fillText('el próximo objeto!', canvas.width / 2, canvas.height / 2 + 20);

  }, []);

  const getPointerPos = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    if (typeof canvas.getBoundingClientRect !== 'function') {
      return { x: 0, y: 0 };
    }
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    // Scale to canvas coordinate system
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const checkScratchPercentage = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    let transparentPixels = 0;

    // Check transparency in 4-byte rgba chunks
    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] === 0) {
        transparentPixels++;
      }
    }

    const percentage = (transparentPixels / (pixels.length / 4)) * 100;
    if (percentage > 50 && !isScratched) {
      setIsScratched(true);
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#fb7185', '#f43f5e', '#e11d48'],
        disableForReducedMotion: true
      });
    }
  };

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (isScratched) return;
    setIsDrawing(true);
    scratch(e);
  };

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || isScratched) return;
    scratch(e);
  };

  const handleEnd = () => {
    setIsDrawing(false);
  };

  const scratch = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const { x, y } = getPointerPos(e, canvas);

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 25, 0, Math.PI * 2);
    ctx.fill();

    checkScratchPercentage(ctx, canvas);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-white/80 backdrop-blur-md"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl shadow-pink-200/50 max-w-md w-full relative border border-pink-50 flex flex-col items-center"
      >
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-[#9D84A3] hover:text-[#D1495B] transition-colors z-20"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-3xl font-serif font-bold text-[#D1495B] mb-8 text-center drop-shadow-sm">¡Objeto descubierto!</h2>

        <div className="relative w-64 h-64 md:w-80 md:h-80 mb-10 rounded-[2rem] overflow-hidden shadow-lg shadow-pink-100/50 border border-pink-50 bg-pink-50/30 flex items-center justify-center">
          {/* Base image representing the gift */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none p-4">
             <img src={imagenRegalo} alt={tipoRegalo} className="w-full h-full object-cover rounded-xl" />
          </div>

          {/* Scratchable Canvas layer */}
          <AnimatePresence>
            {!isScratched && (
              <motion.canvas
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8 }}
                ref={canvasRef}
                onMouseDown={handleStart}
                onMouseMove={handleMove}
                onMouseUp={handleEnd}
                onMouseLeave={handleEnd}
                onTouchStart={handleStart}
                onTouchMove={handleMove}
                onTouchEnd={handleEnd}
                className="absolute inset-0 w-full h-full cursor-crosshair touch-none"
              />
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {isScratched && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full font-serif"
            >
              <button
                onClick={onComplete}
                className="w-full py-5 bg-[#FF8BA7] text-white rounded-2xl font-bold text-xl hover:scale-[1.02] active:scale-95 transition-all shadow-[0_4px_15px_rgba(255,139,167,0.5)]"
              >
                Recoger y continuar
              </button>
            </motion.div>
          )}
        </AnimatePresence>

      </motion.div>
    </motion.div>
  );
}
