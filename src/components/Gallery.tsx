import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

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

        const validExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
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

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full max-w-6xl mx-auto py-20 px-4 mt-8"
    >
      <div className="text-center mb-10">
        <h2 className="text-5xl font-script text-rose-600 mb-4 drop-shadow-sm">Galería de Recuerdos</h2>
        <p className="text-rose-500/80 font-serif">Consumiendo la API de GitHub en tiempo real</p>
      </div>

      {/* Selector de Años / Pestañas */}
      <div className="flex flex-wrap justify-center gap-3 mb-10">
        {YEARS.map((year, index) => (
          <button
            key={year}
            onClick={() => setCurrentYear(year)}
            className={`px-6 py-2.5 rounded-full font-medium transition-all duration-300 ${
              currentYear === year 
                ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg transform scale-105' 
                : 'bg-white/60 backdrop-blur-sm text-gray-600 hover:bg-white shadow-sm border border-rose-100 hover:border-rose-300 hover:text-rose-500'
            }`}
          >
            Año {index + 1}
          </button>
        ))}
      </div>

      {/* Contenedor de la Galería */}
      <div className="min-h-[400px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-20 text-rose-400">
             <Loader2 className="w-10 h-10 animate-spin mb-4" />
             <p className="animate-pulse font-medium">Buscando imágenes en GitHub...</p>
          </div>
        ) : error ? (
           <div className="py-12 px-6 text-center bg-rose-50/80 text-rose-600 rounded-2xl border border-rose-200">
             <p className="font-bold mb-2">Ops, algo salió mal</p>
             <p className="text-sm opacity-90">{error}</p>
             <p className="text-sm mt-4 opacity-75">Comprueba que el repositorio es público y que has configurado los placeholders GITHUB_USER y GITHUB_REPO.</p>
           </div>
        ) : images.length === 0 ? (
          <div className="py-16 text-center text-gray-500 bg-white/60 backdrop-blur-sm rounded-2xl shadow-sm border border-rose-100">
            No se encontraron imágenes válidas en esta carpeta.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {images.map(image => (
              <div key={image.name} className="group relative rounded-2xl overflow-hidden shadow-sm border border-rose-100 aspect-[4/3] bg-rose-50 cursor-pointer">
                <img 
                  src={image.download_url} 
                  alt={image.name} 
                  className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-110"
                  onError={(e: any) => {
                    e.target.src = 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=800&q=80';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                  <span className="text-white text-xs font-medium truncate drop-shadow-md">
                    {image.name}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
