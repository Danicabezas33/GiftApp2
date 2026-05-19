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
            className="absolute text-rose-300/30"
            style={{ left: `${heart.x}%`, top: `${heart.y}%` }}
            animate={{ 
              y: [0, -150, 0],
              opacity: [0.2, 0.6, 0.2],
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
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-pink-300/30 rounded-full blur-3xl mix-blend-multiply"></div>
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-rose-300/30 rounded-full blur-3xl mix-blend-multiply"></div>
      </div>

      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="relative z-10 w-56 h-56 md:w-72 md:h-72 rounded-full overflow-hidden mb-10 ring-8 ring-white/60 shadow-2xl"
      >
        <img 
          src="https://raw.githubusercontent.com/Danicabezas33/GiftApp2/main/public/photos/home.jpg" 
          onError={(e) => {
            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=800&q=80"
          }}
          alt="Nosotros" 
          className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-700"
        />
      </motion.div>
      
      <motion.h1 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-5xl md:text-7xl font-script text-rose-600 mb-8 z-10 text-center drop-shadow-sm font-medium"
      >
        Felices 5 años, mi niña preciosa
      </motion.h1>
      
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="relative z-10 max-w-2xl bg-white/70 backdrop-blur-md p-8 md:p-12 rounded-[2rem] shadow-xl border border-white/50 text-center"
      >
        <div className="absolute -top-5 -left-5 text-4xl transform -rotate-12">✨</div>
        <div className="absolute -bottom-5 -right-5 text-4xl transform rotate-12">❤️</div>
        
        <p className="text-gray-700 text-lg md:text-xl leading-relaxed mb-6 font-serif italic border-l-4 border-rose-300 pl-6 text-left">
          "Parece que fue ayer cuando empezamos esta hermosa aventura, pero ya han pasado 5 increíbles años.
          Cada día a tu lado ha sido un regalo, lleno de risas, aprendizajes y un amor que no deja de crecer."
        </p>
        <p className="text-gray-700 md:text-lg leading-relaxed mb-8 text-left pl-6">
          No me imagino mi vida sin ti, eres mi compañera, mi mejor amiga y el gran amor de mi vida.
          He creado esta pequeña página para recordar algunos de nuestros mejores momentos y celebrar todo lo 
          que hemos construido juntos. ¡Y lo que nos falta!
        </p>
        <p className="font-script text-4xl text-rose-500 mt-8 mb-2">
          Te amo con todo mi corazón.
        </p>
      </motion.div>
    </motion.div>
  );
}
