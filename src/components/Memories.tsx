import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { X, Heart, ChevronLeft, ChevronRight } from 'lucide-react';

const memoriesData = {
  1: [
    { images: ["/photos/year1-1.jpg", "/photos/year1-2.jpg"], text: "El primer atardecer juntos.", detail: "Aún recuerdo los nervios de este día,\n cuando me tomaste la mano por primera vez mientras el sol desaparecía. Fue el comienzo de nuestra historia. Aún recuerdo los nervios de este día, cuando me tomaste la mano por primera vez mientras el sol desaparecía. Fue el comienzo de nuestra historia. Aún recuerdo los nervios de este día, cuando me tomaste la mano por primera vez mientras el sol desaparecía. Fue el comienzo de nuestra historia. Aún recuerdo los nervios de este día, cuando me tomaste la mano por primera vez mientras el sol desaparecía. Fue el comienzo de nuestra historia. Aún recuerdo los nervios de este día, cuando me tomaste la mano por primera vez mientras el sol desaparecía.Aún recuerdo los nervios de este día, cuando me tomaste la mano por primera vez mientras el sol desaparecía. Fue el comienzo de nuestra historia. Aún recuerdo los nervios de este día, cuando me tomaste la mano por primera vez mientras el sol desaparecía. Fue el comienzo de nuestra historia. Aún recuerdo los nervios de este día, cuando me tomaste la mano por primera vez mientras el sol desaparecía. Fue el comienzo de nuestra historia. Aún recuerdo los nervios de este día, cuando me tomaste la mano por primera vez mientras el sol desaparecía. Fue el comienzo de nuestra historia. Aún recuerdo los nervios de este día, cuando me tomaste la mano por primera vez mientras el sol desaparecía.Aún recuerdo los nervios de este día, cuando me tomaste la mano por primera vez mientras el sol desaparecía. Fue el comienzo de nuestra historia. Aún recuerdo los nervios de este día, cuando me tomaste la mano por primera vez mientras el sol desaparecía. Fue el comienzo de nuestra historia. Aún recuerdo los nervios de este día, cuando me tomaste la mano por primera vez mientras el sol desaparecía. Fue el comienzo de nuestra historia. Aún recuerdo los nervios de este día, cuando me tomaste la mano por primera vez mientras el sol desaparecía. Fue el comienzo de nuestra historia. Aún recuerdo los nervios de este día, cuando me tomaste la mano por primera vez mientras el sol desaparecía.Aún recuerdo los nervios de este día, cuando me tomaste la mano por primera vez mientras el sol desaparecía. Fue el comienzo de nuestra historia. Aún recuerdo los nervios de este día, cuando me tomaste la mano por primera vez mientras el sol desaparecía. Fue el comienzo de nuestra historia. Aún recuerdo los nervios de este día, cuando me tomaste la mano por primera vez mientras el sol desaparecía. Fue el comienzo de nuestra historia. Aún recuerdo los nervios de este día, cuando me tomaste la mano por primera vez mientras el sol desaparecía. Fue el comienzo de nuestra historia. Aún recuerdo los nervios de este día, cuando me tomaste la mano por primera vez mientras el sol desaparecía." },
    { images: ["/photos/year1-2.jpg", "/photos/year1-1.jpg"], text: "Nuestra canción.", detail: "Bailando en el salón de casa sin que nos importara nada más." },
    { images: ["/photos/year1-3.jpg", "/photos/year1-1.jpg"], text: "Primeras risas.", detail: "Esa tarde que no parábamos de reír por cualquier tontería. Me di cuenta de lo mucho que me gustabas." },
    { images: ["/photos/year1-4.jpg"], text: "Cita en el cine.", detail: "Nuestra primera película juntos. No recuerdo ni de qué iba porque solo podía mirarte a ti." },
    { images: ["/photos/year1-5.jpg"], text: "Paseo por el parque.", detail: "Una tarde tranquila, simplemente caminando y conociéndonos cada vez más." },
    { images: ["/photos/year1-6.jpg"], text: "Aquel café.", detail: "El primer café que compartimos. Las horas pasaron volando mientras hablábamos de todo y de nada." },
    { images: ["/photos/year1-7.jpg"], text: "Bajo la lluvia.", detail: "Corriendo para no mojarnos, y al final terminamos empapados y riéndonos a carcajadas." },
    { images: ["/photos/year1-8.jpg"], text: "Mirando las estrellas.", detail: "Esa noche tan especial donde el cielo estaba despejado y soñamos juntos." },
    { images: ["/photos/year1-9.jpg"], text: "Nuestra primera foto.", detail: "La primera vez que posamos juntos ante la cámara. Quién diría todo lo que vendría después." },
    { images: ["/photos/year1-10.jpg"], text: "Sorpresa inesperada.", detail: "Ese detalle que tuviste conmigo que me dejó sin palabras y me robó un poquito más el corazón." },
    { images: ["/photos/year1-11.jpg"], text: "Día de campo.", detail: "Merienda al aire libre, buen tiempo y la mejor compañía que podría pedir." },
    { images: ["/photos/year1-12.jpg"], text: "El primer te quiero.", detail: "Ese momento mágico en el que las palabras finalmente salieron y cambiaron todo para siempre." },
    { images: ["/photos/year1-13.jpg"], text: "Aventura improvisada.", detail: "Cuando decidimos hacer algo diferente sin planearlo, y fue simplemente perfecto." },
    { images: ["/photos/year1-14.jpg"], text: "Cocinado juntos.", detail: "Nuestro primer intento de hacer una cena elaborada. Fue un poco desastre, pero muy divertido." },
    { images: ["/photos/year1-15.jpg"], text: "Visita al museo.", detail: "Perdidos entre arte, aunque mi obra favorita siempre serás tú." },
    { images: ["/photos/year1-16.jpg"], text: "Un día cualquiera.", detail: "Porque contigo cualquier día normal se vuelve extraordinario." },
    { images: ["/photos/year1-17.jpg"], text: "Brindando por nosotros.", detail: "Nuestro primer brindis. Que sean muchos más a tu lado." }
  ],
  2: [
    { images: ["/photos/year2-1.jpg"], text: "Nuestro primer viaje a la playa.", detail: "Tanta arena, tantas risas y el mar infinito. Fueron los mejores días desconectados de todo." },
    { images: ["/photos/year2-2.jpg"], text: "Cenando rico.", detail: "Descubriendo nuestro restaurante favorito de la ciudad. Qué bien comimos." }
  ],
  3: [
    { images: ["/photos/year3-1.jpg"], text: "Cuando adoptamos a nuestra plantita.", detail: "Nuestro primer ser vivo a cargo. Sobrevivió el primer mes, ¡todo un logro!" },
    { images: ["/photos/year3-2.jpg"], text: "Navidad juntos.", detail: "Frío fuera, pero el corazón súper calentito estando los dos en casa." }
  ],
  4: [
    { images: ["/photos/year4-1.jpg"], text: "Aquella aventura en la montaña.", detail: "Casi nos perdemos, pero terminamos encontrando unas vistas espectaculares. El mejor equipo." },
    { images: ["/photos/year4-2.jpg"], text: "Haciendo tonterías.", detail: "Nuestras caras de locos de siempre. Eres la única persona con la que puedo ser yo al 100%." }
  ],
  5: [
    { images: ["/photos/year5-1.jpg"], text: "Hoy, más felices que nunca.", detail: "Han pasado 5 años y te sigo mirando con los mismos ojos que el primer día." },
    { images: ["/photos/year5-2.jpg"], text: "Por siempre.", detail: "A por la siguiente aventura, mi amor." }
  ]
};

export function Memories() {
  const [activeTab, setActiveTab] = useState<1|2|3|4|5>(1);
  const [selectedMemory, setSelectedMemory] = useState<any>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

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
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6 md:gap-8"
          >
            {memoriesData[activeTab].map((item, idx) => (
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
              
              <div className="w-full md:w-1/2 h-64 md:h-auto shrink-0 relative group bg-black/5">
                <img 
                  src={selectedMemory.images[currentImageIndex]} 
                  onError={handleImageError}
                  key={currentImageIndex}
                  alt={selectedMemory.text}
                  className="w-full h-full object-cover absolute inset-0 transition-opacity duration-300" 
                />
                
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
