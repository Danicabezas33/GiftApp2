import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import { X, Heart, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

interface Memory {
  id: string;
  imgCount: number;
  text: string;
  detail: string;
  images: string[];
}

export function Memories() {
  const [activeTab, setActiveTab] = useState<number>(1);
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [memoriesData, setMemoriesData] = useState<Record<string, Memory[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadMemories() {
      try {
        const response = await fetch('/memories.json');
        if (!response.ok) throw new Error('Error al cargar memories.json');
        const data = await response.json();
        
        const processedData: Record<string, Memory[]> = {};
        for (const year in data) {
          processedData[year] = data[year].map((memory: any) => ({
             ...memory,
             images: buildImagePaths(year, memory.id, memory.imgCount)
          }));
        }
        
        setMemoriesData(processedData);
        setLoading(false);
      } catch (err: any) {
        console.error(err);
        setError('Ocurrió un error al cargar las memorias.');
        setLoading(false);
      }
    }
    
    loadMemories();
  }, []);

  const GITHUB_BASE = 'https://raw.githubusercontent.com/Danicabezas33/GiftApp2/main/public';

  function buildImagePaths(year: string, id: string, count: number) {
    const paths = [];
    for (let i = 1; i <= count; i++) {
      paths.push(`${GITHUB_BASE}/photos/year${year}/${id}-${i}.jpg`);
    }
    return paths;
  }

  const fallbackImage = "https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=800&q=80";

  const handleImageError = (e: any) => {
    e.target.src = fallbackImage;
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full max-w-7xl mx-auto py-20 px-4 mt-8"
    >
      <h2 className="text-5xl md:text-7xl font-script text-center text-white mb-6 drop-shadow-[0_0_15px_rgba(255,139,167,0.3)]">Nuestros Recuerdos</h2>
      <p className="text-center text-pink-100/60 font-serif text-lg mb-16">Un viaje a través de nuestras mejores fotos.</p>
      
      <div className="flex flex-wrap justify-center gap-4 mb-16">
        {([1, 2, 3, 4, 5] as const).map(year => (
          <button
            key={year}
            onClick={() => setActiveTab(year)}
            className={`px-8 py-3 rounded-2xl font-bold transition-all duration-500 border ${
              activeTab === year 
                ? 'bg-petal-pink text-zen-bg border-petal-pink shadow-[0_0_20px_rgba(255,139,167,0.3)]' 
                : 'glass text-white/40 border-white/5 hover:text-white/20'
            }`}
          >
            Año {year}
          </button>
        ))}
      </div>

      <div className="min-h-[400px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-20 text-petal-pink">
             <Loader2 className="w-12 h-12 animate-spin mb-6 opacity-60" />
             <p className="animate-pulse font-serif tracking-widest text-sm uppercase opacity-40">Cargando memorias...</p>
          </div>
        ) : error ? (
           <div className="py-12 px-8 text-center glass rounded-[2rem] border-white/5 max-w-xl mx-auto">
             <p className="font-bold text-white mb-3">Algo salió mal</p>
             <p className="text-sm text-white/50 leading-relaxed">{error}</p>
           </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-8"
            >
              {(memoriesData[activeTab] || []).map((item, idx) => (
                <motion.div 
                  key={idx} 
                  whileHover={{ y: -8, scale: 1.02 }}
                  onClick={() => {
                    setSelectedMemory(item);
                    setCurrentImageIndex(0);
                  }}
                  className="glass rounded-[2.5rem] overflow-hidden shadow-2xl border-white/5 hover:border-white/20 transition-all duration-500 cursor-pointer group"
                >
                  <div className="h-80 overflow-hidden relative">
                    <div className="absolute inset-0 bg-zen-bg/20 group-hover:bg-transparent transition-colors z-10" />
                    <img 
                      src={item.images[0]} 
                      onError={handleImageError}
                      alt={`Recuerdo ${activeTab}`} 
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-[2000ms]" 
                    />
                  </div>
                  <div className="p-8 text-center bg-white/[0.02]">
                    <p className="text-white font-serif font-medium text-xl leading-snug">{item.text}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {/* Modal / Bocadillo */}
      <AnimatePresence>
        {selectedMemory && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zen-bg/90 backdrop-blur-2xl"
            onClick={() => setSelectedMemory(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="glass rounded-[3rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)] max-w-5xl w-full flex flex-col md:flex-row relative max-h-[90vh] border-white/10"
              onClick={e => e.stopPropagation()}
            >
              <button 
                onClick={() => setSelectedMemory(null)}
                className="absolute top-6 right-6 text-white/20 hover:text-white transition-colors z-20"
              >
                <X className="w-8 h-8" />
              </button>
              
              <div className="w-full md:w-3/5 h-80 md:h-auto shrink-0 relative group bg-black/20 overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentImageIndex}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.4 }}
                    drag={selectedMemory.images.length > 1 ? "x" : false}
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.2}
                    onDragEnd={(e, { offset }) => {
                      const swipe = offset.x;
                      if (swipe < -40) {
                        setCurrentImageIndex(prev => (prev + 1) % selectedMemory.images.length);
                      } else if (swipe > 40) {
                        setCurrentImageIndex(prev => (prev - 1 + selectedMemory.images.length) % selectedMemory.images.length);
                      }
                    }}
                    className={`w-full h-full absolute inset-0 ${selectedMemory.images.length > 1 ? 'cursor-grab active:cursor-grabbing' : ''}`}
                  >
                    <img 
                      src={selectedMemory.images[currentImageIndex]} 
                      onError={handleImageError}
                      alt={selectedMemory.text}
                      className="w-full h-full object-cover pointer-events-none" 
                    />
                  </motion.div>
                </AnimatePresence>
                
                {selectedMemory.images.length > 1 && (
                  <>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentImageIndex(prev => (prev - 1 + selectedMemory.images.length) % selectedMemory.images.length);
                      }}
                      className="absolute left-6 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full backdrop-blur-xl opacity-0 group-hover:opacity-100 transition-all duration-300"
                    >
                      <ChevronLeft className="w-8 h-8" />
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentImageIndex(prev => (prev + 1) % selectedMemory.images.length);
                      }}
                      className="absolute right-6 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full backdrop-blur-xl opacity-0 group-hover:opacity-100 transition-all duration-300"
                    >
                      <ChevronRight className="w-8 h-8" />
                    </button>
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-10">
                      {selectedMemory.images.map((_: any, idx: number) => (
                        <div 
                          key={idx} 
                          className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${idx === currentImageIndex ? 'bg-petal-pink scale-125 shadow-[0_0_10px_rgba(255,139,167,0.8)]' : 'bg-white/20'}`} 
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
              <div className="w-full md:w-2/5 flex-1 min-h-0 overflow-y-auto bg-white/[0.02]">
                <div className="p-10 md:p-14 flex flex-col min-h-full h-fit">
                  <h3 className="text-4xl font-serif font-bold text-white mb-8 pr-10">{selectedMemory.text}</h3>
                  <div className="relative group">
                    <div className="absolute -left-6 top-0 bottom-0 w-1 bg-petal-pink/30 rounded-full group-hover:bg-petal-pink transition-colors duration-500" />
                    <p className="text-white/60 text-xl leading-relaxed whitespace-pre-line italic font-serif">
                      "{selectedMemory.detail}"
                    </p>
                  </div>
                  <div className="mt-12 flex justify-end mt-auto pt-4 opacity-20">
                    <Heart className="w-10 h-10 text-petal-pink fill-petal-pink/10" />
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
