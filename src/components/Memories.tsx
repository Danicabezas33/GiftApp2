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
      <h2 className="text-5xl font-script text-center text-rose-600 mb-4 drop-shadow-sm">Nuestros Recuerdos</h2>
      <p className="text-center text-rose-500/80 font-serif mb-12">Toca las fotos para recordar ese momento juntas.</p>
      
      <div className="flex flex-wrap justify-center gap-3 mb-10">
        {([1, 2, 3, 4, 5] as const).map(year => (
          <button
            key={year}
            onClick={() => setActiveTab(year)}
            className={`px-6 py-2.5 rounded-full font-medium transition-all duration-300 ${
              activeTab === year 
                ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg transform scale-105' 
                : 'bg-white/60 backdrop-blur-sm text-gray-600 hover:bg-white shadow-sm border border-rose-100 hover:border-rose-300 hover:text-rose-500'
            }`}
          >
            Año {year}
          </button>
        ))}
      </div>

      <div className="min-h-[400px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-20 text-stone-400">
             <Loader2 className="w-10 h-10 animate-spin text-rose-300 mb-4" />
             <p className="animate-pulse font-medium text-lg text-rose-400">Cargando la máquina del tiempo...</p>
          </div>
        ) : error ? (
           <div className="p-4 text-center text-rose-500 font-bold">{error}</div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6 md:gap-8"
            >
              {(memoriesData[activeTab] || []).map((item, idx) => (
                <motion.div 
                  key={idx} 
                  whileHover={{ y: -5 }}
                  onClick={() => {
                    setSelectedMemory(item);
                    setCurrentImageIndex(0);
                  }}
                  className="bg-white/80 backdrop-blur-sm rounded-3xl overflow-hidden shadow-md border border-rose-100/50 hover:shadow-xl hover:shadow-rose-200/50 transition-all cursor-pointer group"
                >
                  <div className="h-72 overflow-hidden relative">
                    <div className="absolute inset-0 bg-rose-500/10 group-hover:bg-transparent transition-colors z-10" />
                    <img 
                      src={item.images[0]} 
                      onError={handleImageError}
                      alt={`Recuerdo ${activeTab}`} 
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" 
                    />
                  </div>
                  <div className="p-6 text-center bg-gradient-to-b from-white/50 to-white">
                    <p className="text-gray-800 font-serif font-medium text-lg leading-snug">{item.text}</p>
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
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
            onClick={() => setSelectedMemory(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl overflow-hidden shadow-2xl max-w-4xl w-full flex flex-col md:flex-row relative max-h-[90vh]"
              onClick={e => e.stopPropagation()}
            >
              <button 
                onClick={() => setSelectedMemory(null)}
                className="absolute top-4 right-4 bg-white/90 hover:bg-white text-gray-800 rounded-full p-2 z-20 transition-colors shadow-sm backdrop-blur-sm border border-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="w-full md:w-1/2 h-64 md:h-auto shrink-0 relative group bg-black/5 overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentImageIndex}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.2 }}
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
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/60 hover:bg-white text-gray-800 p-2 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-sm"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentImageIndex(prev => (prev + 1) % selectedMemory.images.length);
                      }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/60 hover:bg-white text-gray-800 p-2 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-sm"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                      {selectedMemory.images.map((_: any, idx: number) => (
                        <div 
                          key={idx} 
                          className={`w-2 h-2 rounded-full transition-colors ${idx === currentImageIndex ? 'bg-white shadow-sm' : 'bg-white/50 shadow-sm'}`} 
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
              <div className="w-full md:w-1/2 flex-1 min-h-0 overflow-y-auto bg-gradient-to-br from-rose-50 to-white">
                <div className="p-8 md:p-10 flex flex-col min-h-full h-fit">
                  <h3 className="text-3xl font-serif font-bold text-rose-600 mb-6 py-1 pr-8">{selectedMemory.text}</h3>
                  <p className="text-gray-700 text-lg leading-relaxed border-l-4 border-rose-300 pl-5 bg-white/60 p-5 rounded-r-2xl relative whitespace-pre-line shadow-sm">
                    {selectedMemory.detail}
                  </p>
                  <div className="mt-8 flex justify-end mt-auto pt-4 relative">
                    <Heart className="w-8 h-8 text-rose-400 fill-rose-100/50" />
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
