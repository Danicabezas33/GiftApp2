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
      <h2 className="text-5xl md:text-7xl font-script text-center text-[#D1495B] mb-6 drop-shadow-sm">Nuestros Recuerdos</h2>
      <p className="text-center text-[#9D84A3] font-serif text-lg mb-16">Un viaje a través de nuestras mejores fotos.</p>
      
      <div className="flex flex-wrap justify-center gap-4 mb-16">
        {([1, 2, 3, 4, 5] as const).map(year => (
          <button
            key={year}
            onClick={() => setActiveTab(year)}
            className={`px-8 py-3 rounded-2xl font-bold transition-all duration-500 border border-pink-50 ${
              activeTab === year 
                ? 'bg-[#FF8BA7] text-white shadow-[0_4px_15px_rgba(255,139,167,0.4)]' 
                : 'bg-white shadow-sm text-[#9D84A3] hover:text-[#5F4B66]'
            }`}
          >
            Año {year}
          </button>
        ))}
      </div>

      <div className="min-h-[400px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-20 text-[#FF8BA7]">
             <Loader2 className="w-12 h-12 animate-spin mb-6 opacity-60" />
             <p className="animate-pulse font-serif tracking-widest text-sm uppercase opacity-40">Cargando memorias...</p>
          </div>
        ) : error ? (
           <div className="py-12 px-8 text-center bg-white rounded-[2rem] border border-pink-50 shadow-xl shadow-pink-100/50 max-w-xl mx-auto">
             <p className="font-bold text-[#D1495B] mb-3">Algo salió mal</p>
             <p className="text-sm text-pink-900/60 leading-relaxed">{error}</p>
           </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8"
            >
              {(memoriesData[activeTab] || []).map((item, idx) => (
                <motion.div 
                  key={idx} 
                  whileHover={{ y: -8, scale: 1.02 }}
                  onClick={() => {
                    setSelectedMemory(item);
                    setCurrentImageIndex(0);
                  }}
                  className="bg-white rounded-[2.5rem] overflow-hidden shadow-lg shadow-pink-100/40 border border-pink-50 hover:border-pink-200 transition-all duration-500 cursor-pointer group"
                >
                  <div className="h-80 overflow-hidden relative">
                    <div className="absolute inset-0 bg-pink-100/10 group-hover:bg-transparent transition-colors z-10" />
                    <img 
                      src={item.images[0]} 
                      onError={handleImageError}
                      alt={`Recuerdo ${activeTab}`} 
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-[2000ms]" 
                    />
                  </div>
                  <div className="p-8 text-center bg-[#FAF8F5]/50">
                    <p className="text-[#5F4B66] font-serif font-medium text-xl leading-snug">{item.text}</p>
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
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-white/80 backdrop-blur-md"
            onClick={() => setSelectedMemory(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-[3rem] overflow-hidden shadow-2xl shadow-pink-200/50 max-w-5xl w-full flex flex-col md:flex-row relative max-h-[90vh] border border-pink-50"
              onClick={e => e.stopPropagation()}
            >
              <button 
                onClick={() => setSelectedMemory(null)}
                className="absolute top-6 right-6 text-[#9D84A3] hover:text-[#D1495B] transition-colors z-20"
              >
                <X className="w-8 h-8" />
              </button>
              
              <div className="w-full md:w-3/5 h-[300px] md:h-auto shrink-0 relative group bg-pink-50 overflow-hidden">
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
                      className="absolute left-6 top-1/2 -translate-y-1/2 bg-white/40 hover:bg-white/80 text-[#5F4B66] p-3 rounded-full backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-300"
                    >
                      <ChevronLeft className="w-8 h-8" />
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentImageIndex(prev => (prev + 1) % selectedMemory.images.length);
                      }}
                      className="absolute right-6 top-1/2 -translate-y-1/2 bg-white/40 hover:bg-white/80 text-[#5F4B66] p-3 rounded-full backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-300"
                    >
                      <ChevronRight className="w-8 h-8" />
                    </button>
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-10">
                      {selectedMemory.images.map((_: any, idx: number) => (
                        <div 
                          key={idx} 
                          className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${idx === currentImageIndex ? 'bg-[#FF8BA7] scale-125 shadow-[0_2px_5px_rgba(255,139,167,0.5)]' : 'bg-white/60 shadow-sm'}`} 
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
              <div className="w-full md:w-2/5 flex-1 min-h-0 overflow-y-auto bg-white">
                <div className="p-6 md:p-14 flex flex-col min-h-full h-fit">
                  <h3 className="text-2xl md:text-4xl font-serif font-bold text-[#D1495B] mb-6 md:mb-8 pr-10">{selectedMemory.text}</h3>
                  <div className="relative group">
                    <div className="absolute -left-4 md:-left-6 top-0 bottom-0 w-0.5 md:w-1 bg-pink-100 rounded-full group-hover:bg-[#FF8BA7] transition-colors duration-500" />
                    <p className="text-[#5F4B66]/80 text-lg md:text-xl leading-relaxed whitespace-pre-line italic font-serif">
                      "{selectedMemory.detail}"
                    </p>
                  </div>
                  <div className="mt-8 md:mt-12 flex justify-end mt-auto pt-4 opacity-40">
                    <Heart className="w-8 h-8 md:w-10 md:h-10 text-pink-200 fill-pink-100" />
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
