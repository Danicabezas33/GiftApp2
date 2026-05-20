import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import { Loader2, X, PlayCircle, Images } from 'lucide-react';

/**
 * Configuración del Repositorio de GitHub
 * SUSTITUYE ESTOS VALORES POR TUS CARACTERÍSTICAS
 */
const GITHUB_USER = 'Danicabezas33';
const GITHUB_REPO = 'GiftApp2';

const YEARS = ['ano1', 'ano2', 'ano3', 'ano4', 'ano5'];

interface GithubFile {
  name: string;
  download_url: string;
  type: string;
}

export function Gallery() {
  const [currentYear, setCurrentYear] = useState('ano1');
  const [images, setImages] = useState<GithubFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMedia, setSelectedMedia] = useState<GithubFile | null>(null);

  useEffect(() => {
    async function fetchGalleryImages(year: string) {
      setLoading(true);
      setError(null);
      setImages([]);

      try {
        const url = `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/contents/public/gallery/${year}`;
        const response = await fetch(url);
        
        if (!response.ok) {
          if (response.status === 404) {
             throw new Error(`La carpeta /public/gallery/${year} no existe en el repositorio.`);
          }
          throw new Error(`Error en la petición: ${response.statusText}`);
        }

        const data = await response.json();

        const validExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.mp4', '.webm', '.mov'];
        const imageFiles = data.filter((file: any) => {
          if (file.type !== 'file') return false;
          
          const fileName = file.name.toLowerCase();
          const hasValidExt = validExtensions.some(ext => fileName.endsWith(ext));
          const notHidden = !fileName.startsWith('.');
          
          return hasValidExt && notHidden;
        });

        setImages(imageFiles);
      } catch (err: any) {
        console.error('API Error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchGalleryImages(currentYear);
  }, [currentYear]);

  const isVideo = (filename: string) => /\.(mp4|webm|mov)$/i.test(filename);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full max-w-6xl mx-auto py-20 px-4 mt-8"
    >
      <div className="text-center mb-16">
        <h2 className="text-5xl md:text-7xl font-script text-[#4A3B52] mb-6 drop-shadow-sm">Galería de Recuerdos</h2>
        <p className="text-[#CDB4DB] font-serif text-lg">Nuestros momentos capturados</p>
      </div>

      {/* Selector de Años / Pestañas Minimalista */}
      <div className="flex justify-center mb-16 w-full overflow-x-auto gap-4 md:gap-10 px-4 scrollbar-hide">
        {YEARS.map((year, index) => (
          <button
            key={year}
            onClick={() => setCurrentYear(year)}
            className={`pb-4 px-6 whitespace-nowrap text-lg font-medium transition-all duration-500 relative ${
              currentYear === year 
                ? 'text-[#FFAFCC]' 
                : 'text-[#CDB4DB] hover:text-[#4A3B52]'
            }`}
          >
            Año {index + 1}
            {currentYear === year && (
              <motion.div 
                layoutId="activeTabGallery" 
                className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#FFAFCC] rounded-full shadow-[0_0_8px_rgba(255,139,167,0.8)]" 
              />
            )}
          </button>
        ))}
      </div>

      {/* Contenedor de la Galería */}
      <div className="min-h-[400px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-20 text-[#FFAFCC]">
             <Loader2 className="w-12 h-12 animate-spin mb-6 opacity-60" />
             <p className="animate-pulse font-serif tracking-widest text-sm uppercase opacity-60">Buscando memorias...</p>
          </div>
        ) : error ? (
           <div className="py-12 px-8 text-center bg-white shadow-xl shadow-[#FFC8DD]/50 rounded-[2rem] border border-[#FFC8DD]/30 max-w-xl mx-auto">
             <p className="font-bold text-[#4A3B52] mb-3">Algo salió mal</p>
             <p className="text-sm text-pink-900/60 leading-relaxed">{error}</p>
           </div>
        ) : images.length === 0 ? (
          <div className="py-20 text-center text-[#CDB4DB] bg-white/50 rounded-[2.5rem] border border-[#FFC8DD]/30 shadow-sm">
            <Images className="w-16 h-16 mx-auto mb-6 opacity-30" strokeWidth={1} />
            <p className="font-serif italic text-lg">Aún no hay archivos en esta carpeta...</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {images.map(media => {
              const video = isVideo(media.name);
              return (
                <motion.div 
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  key={media.name} 
                  onClick={() => setSelectedMedia(media)}
                  className="group relative rounded-3xl overflow-hidden shadow-lg shadow-[#FFC8DD]/40 border border-[#FFC8DD]/30 aspect-[4/3] bg-white cursor-pointer"
                >
                  {video ? (
                    <>
                      <video 
                        src={media.download_url} 
                        className="w-full h-full object-cover transform transition-transform duration-1000 group-hover:scale-110 opacity-70 group-hover:opacity-100"
                        muted playsInline
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/20 transition-all duration-500">
                        <PlayCircle className="w-12 h-12 text-white/80 drop-shadow-lg transition-transform duration-500 group-hover:scale-125" />
                      </div>
                    </>
                  ) : (
                    <img 
                      src={media.download_url} 
                      alt={media.name} 
                      className="w-full h-full object-cover transform transition-transform duration-1000 group-hover:scale-110 opacity-80 group-hover:opacity-100"
                      onError={(e: any) => {
                        e.target.src = 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=800&q=80';
                      }}
                    />
                  )}
                  <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0">
                    <span className="text-white text-[10px] font-bold tracking-[0.2em] uppercase">
                      {video ? 'Recuerdo en Video' : 'Fotografía'}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Lightbox / Modal de vista en grande */}
      <AnimatePresence>
        {selectedMedia && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-white/90 p-4 backdrop-blur-md"
            onClick={() => setSelectedMedia(null)}
          >
            <button 
              className="absolute top-8 right-8 p-3 bg-[#FFF0F5] hover:bg-[#FFC8DD] rounded-full text-[#CDB4DB] hover:text-[#4A3B52] transition-all duration-300 shadow-sm"
              onClick={(e) => { e.stopPropagation(); setSelectedMedia(null); }}
            >
              <X className="w-8 h-8" />
            </button>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-6xl max-h-[90vh] w-full flex items-center justify-center p-4"
            >
              <div className="absolute inset-0 bg-[#FFAFCC]/10 blur-[100px] rounded-full pointer-events-none" />
              {isVideo(selectedMedia.name) ? (
                <video 
                  src={selectedMedia.download_url} 
                  controls 
                  autoPlay
                  className="max-w-full max-h-[80vh] rounded-3xl shadow-2xl shadow-[#FFC8DD]/50 border border-[#FFC8DD]/30 pointer-events-auto"
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <img 
                  src={selectedMedia.download_url} 
                  alt={selectedMedia.name}
                  className="max-w-full max-h-[80vh] object-contain rounded-3xl shadow-2xl shadow-[#FFC8DD]/50 border border-[#FFC8DD]/30 pointer-events-auto"
                  onClick={(e) => e.stopPropagation()}
                />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default Gallery;
