import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import { Loader2, X, PlayCircle } from 'lucide-react';

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
      <div className="text-center mb-10">
        <h2 className="text-5xl font-script text-rose-600 mb-4 drop-shadow-sm">Galería de Recuerdos</h2>
        <p className="text-rose-500/80 font-serif">Nuestros momentos en la nube</p>
      </div>

      {/* Selector de Años / Pestañas Minimalista */}
      <div className="flex justify-center border-b-2 border-rose-100/50 mb-10 w-full overflow-x-auto gap-4 md:gap-12 px-4 scrollbar-hide">
        {YEARS.map((year, index) => (
          <button
            key={year}
            onClick={() => setCurrentYear(year)}
            className={`pb-4 px-2 whitespace-nowrap text-lg font-medium transition-colors relative ${
              currentYear === year 
                ? 'text-rose-600' 
                : 'text-gray-400 hover:text-rose-400'
            }`}
          >
            Año {index + 1}
            {currentYear === year && (
              <motion.div layoutId="activeTabGallery" className="absolute bottom-[-2px] left-0 right-0 h-[3px] bg-rose-500 rounded-t-full" />
            )}
          </button>
        ))}
      </div>

      {/* Contenedor de la Galería */}
      <div className="min-h-[400px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-20 text-rose-400">
             <Loader2 className="w-10 h-10 animate-spin mb-4" />
             <p className="animate-pulse font-medium">Buscando recuerdos en GitHub...</p>
          </div>
        ) : error ? (
           <div className="py-12 px-6 text-center bg-rose-50/80 text-rose-600 rounded-2xl border border-rose-200">
             <p className="font-bold mb-2">Ops, algo salió mal</p>
             <p className="text-sm opacity-90">{error}</p>
             <p className="text-sm mt-4 opacity-75">Sube las fotos o videos a la carpeta public/gallery/{currentYear} de tu repositorio en GitHub para que aparezcan aquí automáticamente.</p>
           </div>
        ) : images.length === 0 ? (
          <div className="py-16 text-center text-gray-500 bg-white/60 backdrop-blur-sm rounded-2xl shadow-sm border border-rose-100">
            No se encontraron imágenes o videos válidos en esta carpeta.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {images.map(media => {
              const video = isVideo(media.name);
              return (
                <div 
                  key={media.name} 
                  onClick={() => setSelectedMedia(media)}
                  className="group relative rounded-2xl overflow-hidden shadow-sm border border-rose-100 aspect-[4/3] bg-rose-50 cursor-pointer"
                >
                  {video ? (
                    <>
                      <video 
                        src={media.download_url} 
                        className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-105 opacity-80"
                        muted playsInline
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/10 transition-colors">
                        <PlayCircle className="w-12 h-12 text-white/90 drop-shadow-md" />
                      </div>
                    </>
                  ) : (
                    <img 
                      src={media.download_url} 
                      alt={media.name} 
                      className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-110"
                      onError={(e: any) => {
                        e.target.src = 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=800&q=80';
                      }}
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <span className="text-white text-xs font-medium truncate drop-shadow-md">
                      {video ? 'Video' : 'Foto'}
                    </span>
                  </div>
                </div>
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
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
            onClick={() => setSelectedMedia(null)}
          >
            <button 
              className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
              onClick={(e) => { e.stopPropagation(); setSelectedMedia(null); }}
            >
              <X className="w-8 h-8" />
            </button>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative max-w-5xl max-h-[90vh] w-full flex items-center justify-center pointer-events-none"
            >
              {isVideo(selectedMedia.name) ? (
                <video 
                  src={selectedMedia.download_url} 
                  controls 
                  autoPlay
                  className="max-w-full max-h-[85vh] rounded-xl shadow-2xl pointer-events-auto"
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <img 
                  src={selectedMedia.download_url} 
                  alt={selectedMedia.name}
                  className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl pointer-events-auto"
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
