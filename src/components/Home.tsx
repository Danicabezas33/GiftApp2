import { motion } from 'motion/react';
import { Play, Music, CalendarHeart } from 'lucide-react';

interface HomeProps {
  onNavigate?: (section: string) => void;
}

export function Home({ onNavigate }: HomeProps) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative min-h-[80vh] w-full max-w-6xl mx-auto flex flex-col justify-center py-6 px-4 md:px-8 mt-4 md:mt-8"
    >
      <div className="grid grid-cols-1 md:grid-cols-12 auto-rows-auto md:auto-rows-[16rem] gap-4 md:gap-6">
        
        {/* Cell 1: Photo - spans 7 columns */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="md:col-span-7 md:row-span-2 bg-white rounded-3xl md:rounded-[32px] shadow-lg shadow-[#FFC8DD]/50 overflow-hidden relative min-h-[300px] md:min-h-full group"
        >
          <img 
            src="https://raw.githubusercontent.com/Danicabezas33/GiftApp2/main/public/photos/home.jpg" 
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=800&q=80"
            }}
            alt="Nosotros" 
            className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-[2000ms]"
          />
        </motion.div>

        {/* Cell 2: Letter - spans 5 columns */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="md:col-span-5 md:row-span-2 bg-white rounded-3xl md:rounded-[32px] shadow-lg shadow-[#FFC8DD]/50 p-8 md:p-10 flex flex-col justify-center relative overflow-hidden"
        >
          <div className="absolute -top-10 -right-10 text-[#FFC8DD]/20 text-9xl">❤️</div>
          
          <h1 className="font-serif tracking-tight text-4xl lg:text-5xl font-extralight text-[#4A3B52] mb-6 relative z-10">
            Felices 5 años,<br />mi niña preciosa
          </h1>
          
          <div className="space-y-4 relative z-10">
            <p className="font-sans text-base lg:text-lg leading-relaxed font-normal text-slate-700">
              Cada día a tu lado ha sido un regalo, lleno de risas, aprendizajes y un amor que no deja de crecer.
            </p>
            <p className="font-sans text-base lg:text-lg leading-relaxed font-normal text-slate-700">
              No me imagino mi vida sin ti, eres mi compañera, mi mejor amiga y el gran amor de mi vida. He creado esta pequeña página para recordar algunos de nuestros mejores momentos y celebrar todo lo que hemos construido juntos.
            </p>
            <p className="font-sans font-medium text-[#4A3B52] pt-2">
              Te amo con todo mi corazón.
            </p>
          </div>
        </motion.div>

        {/* Cell 3: Counter */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="md:col-span-4 bg-white rounded-3xl md:rounded-[32px] shadow-lg shadow-[#FFC8DD]/50 p-6 md:p-8 flex flex-col items-center justify-center min-h-[200px]"
        >
          <CalendarHeart className="w-8 h-8 text-[#A2D2FF] mb-3 opacity-90" />
          <span className="text-5xl lg:text-6xl font-serif text-[#4A3B52] tracking-tighter mb-1">1826</span>
          <span className="font-sans text-slate-500 tracking-widest text-xs uppercase font-medium mb-1">Días Juntos</span>
          <span className="font-serif text-[#CDB4DB] text-lg">5 Años de Amor</span>
        </motion.div>

        {/* Cell 4: CTA Button */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="md:col-span-4 bg-white rounded-3xl md:rounded-[32px] shadow-lg shadow-[#FFC8DD]/50 min-h-[200px] overflow-hidden"
        >
          <button 
            onClick={() => onNavigate && onNavigate('games')}
            className="w-full h-full flex flex-col items-center justify-center p-6 md:p-8 group relative bg-[#FFAFCC] hover:bg-[#FFC8DD] transition-colors"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.2),transparent)] opacity-0 group-hover:opacity-100 transition-opacity"></div>
            
            <div className="w-16 h-16 bg-white text-[#FFAFCC] rounded-full flex items-center justify-center mb-4 shadow-sm animate-pulse group-hover:scale-110 transition-transform">
              <Play className="w-6 h-6 ml-1" fill="currentColor" />
            </div>
            <span className="font-sans font-semibold text-lg text-[#4A3B52] relative z-10">Empezar Gincana</span>
            <span className="font-sans text-sm text-[#4A3B52]/70 mt-1 relative z-10 transition-colors">Nivel 1</span>
          </button>
        </motion.div>

        {/* Cell 5: Music Widget Concept (Integrada visualmente) */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="md:col-span-4 bg-white rounded-3xl md:rounded-[32px] shadow-lg shadow-[#FFC8DD]/50 p-6 md:p-8 flex flex-col items-center justify-center min-h-[200px]"
        >
          <div className="w-14 h-14 bg-[#BDE0FE]/30 rounded-full flex items-center justify-center mb-4 text-[#A2D2FF]">
            <Music className="w-6 h-6" />
          </div>
          <span className="font-sans font-medium text-[#4A3B52] text-lg">Banda Sonora</span>
          <span className="font-sans text-xs text-slate-500 mt-1 text-center max-w-[200px]">
            Explora y controla nuestra música desde el reproductor flotante
          </span>
        </motion.div>

      </div>
    </motion.div>
  );
}

export default Home;
