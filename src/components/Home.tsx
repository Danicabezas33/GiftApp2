import { motion } from 'motion/react';
import { Heart } from 'lucide-react';

export function Home() {
  // Background floating hearts
  const hearts = Array.from({ length: 15 }).map((_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    scale: 0.5 + Math.random() * 1,
    duration: 10 + Math.random() * 20,
    delay: Math.random() * 5
  }));

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative min-h-[80vh] flex flex-col items-center justify-center py-12 px-4 overflow-hidden mt-8"
    >
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {hearts.map(heart => (
          <motion.div
            key={heart.id}
            className="absolute text-petal-pink/10"
            style={{ left: `${heart.x}%`, top: `${heart.y}%` }}
            animate={{ 
              y: [0, -150, 0],
              opacity: [0.05, 0.2, 0.05],
              rotate: [0, 45, -45, 0]
            }}
            transition={{ 
              duration: heart.duration,
              repeat: Infinity,
              ease: "linear",
              delay: heart.delay
            }}
          >
            <Heart size={24 * heart.scale} fill="currentColor" />
          </motion.div>
        ))}
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-petal-pink/5 rounded-full blur-[100px] mix-blend-screen"></div>
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-zen-lavender/5 rounded-full blur-[100px] mix-blend-screen"></div>
      </div>

      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.5, type: "spring" }}
        className="relative z-10 w-64 h-64 md:w-80 md:h-80 rounded-full overflow-hidden mb-12 ring-[12px] ring-white/5 shadow-[0_0_80px_rgba(255,139,167,0.15)] group"
      >
        <img 
          src="https://raw.githubusercontent.com/Danicabezas33/GiftApp2/main/public/photos/home.jpg" 
          onError={(e) => {
            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=800&q=80"
          }}
          alt="Nosotros" 
          className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-[2000ms]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zen-bg/40 to-transparent group-hover:opacity-0 transition-opacity duration-1000" />
      </motion.div>
      
      <motion.h1 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-5xl md:text-8xl font-script text-white mb-8 z-10 text-center drop-shadow-[0_0_15px_rgba(255,139,167,0.3)] font-medium"
      >
        Felices 5 años, mi niña preciosa
      </motion.h1>
      
      <motion.div 
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="relative z-10 max-w-2xl glass p-8 md:p-16 rounded-[2.5rem] shadow-2xl text-center"
      >
        <div className="absolute -top-10 -left-6 text-5xl opacity-30 select-none">✨</div>
        <div className="absolute -bottom-10 -right-6 text-5xl opacity-30 select-none">❤️</div>
        
        <p className="text-pink-100/90 text-lg md:text-2xl leading-relaxed mb-8 font-serif italic border-l-2 border-petal-pink/30 pl-6 md:pl-8 text-left">
          "Parece que fue ayer cuando empezamos esta hermosa aventura, pero ya han pasado 5 increíbles años.
          Cada día a tu lado ha sido un regalo, lleno de risas, aprendizajes y un amor que no deja de crecer."
        </p>
        <p className="text-white/70 text-base md:text-xl leading-relaxed mb-10 text-left pl-6 md:pl-8 border-l-2 border-white/5">
          No me imagino mi vida sin ti, eres mi compañera, mi mejor amiga y el gran amor de mi vida.
          He creado esta pequeña página para recordar algunos de nuestros mejores momentos y celebrar todo lo 
          que hemos construido juntos. ¡Y lo que nos falta!
        </p>
        <p className="font-script text-5xl text-petal-pink mt-10 mb-2 drop-shadow-sm">
          Te amo con todo mi corazón.
        </p>
      </motion.div>
    </motion.div>
  );
}
