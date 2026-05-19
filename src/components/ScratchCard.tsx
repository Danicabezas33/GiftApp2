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

    // Set canvas resolution
    // Use fixed dimensions or match the container
    canvas.width = 300;
    canvas.height = 300;

    // Fill with pink color
    ctx.fillStyle = '#f43f5e'; // rose-500
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add text
    ctx.font = 'bold 20px serif';
    ctx.fillStyle = '#ffffff';
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
        useWorker: false,
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
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-white/60 backdrop-blur-md"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-white rounded-3xl p-6 md:p-10 shadow-2xl max-w-md w-full relative border border-rose-100 flex flex-col items-center"
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 bg-gray-50 hover:bg-gray-100 text-gray-800 rounded-full p-2 z-20 transition-colors shadow-sm"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-3xl font-serif font-bold text-rose-600 mb-6 text-center">¡Nuevo objeto desbloqueado!</h2>

        <div className="relative w-[300px] h-[300px] mb-8 rounded-2xl overflow-hidden shadow-inner border border-rose-100 bg-gray-50 flex items-center justify-center">
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
                className="w-full py-4 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-xl font-bold text-lg hover:from-rose-600 hover:to-pink-600 transition-all shadow-md transform hover:-translate-y-0.5"
              >
                ¡Recoger Regalo y Continuar!
              </button>
            </motion.div>
          )}
        </AnimatePresence>

      </motion.div>
    </motion.div>
  );
}
