import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Lock } from 'lucide-react';

const storyBooks = [
  {
    year: 1,
    label: "Libro 1: El Despertar",
    pages: [
      {
        title: "El Despertar de la Magia",
        text: "Érase una vez dos jóvenes de 19 años que cruzaron sus destinos. Todo empezó con un '¡Feliz cumpleaños, guapo!'.",
        imageUrl: "/storybook/year1/1.jpg"
      },
      {
        title: "Primeros Pasos",
        text: "Su primera cita fue bajo la lluvia en un McDonald's y la tercera cita trajo su primer beso.",
        imageUrl: "/storybook/year1/2.jpg"
      },
      {
        title: "Aventuras",
        text: "Viajaron a Granada y sobrevivieron a la maldición del toque de queda.",
        imageUrl: "/storybook/year1/3.jpg"
      },
      {
        title: "La Gran Prueba",
        text: "Pero llegó la Gran Prueba: ella partió a Polonia. Tras meses de distancia, se reencontraron mágicamente en Berlín y pasaron su primera Navidad juntos.",
         imageUrl: "/storybook/year1/4.jpg"
      }
    ]
  },
  {
    year: 2,
    label: "Libro 2: El Escudo",
    pages: [
      {
        title: "El Escudo de los Osos",
        text: "Descubrieron que el agua moja en Torremolinos y exploraron Cazorla.",
         imageUrl: "/storybook/year2/1.jpg"
      },
      {
        title: "Batallas",
        text: "Fue un año de batallas contra la ansiedad y el estrés, pero descubrieron que juntos eran invencibles.",
         imageUrl: "/storybook/year2/2.jpg"
      },
      {
        title: "Nuestra Armadura",
        text: "Se protegieron con dos ponchos de ositos a juego que se convirtieron en su armadura.",
         imageUrl: "/storybook/year2/3.jpg"
      },
      {
        title: "Celebrando el Amor",
        text: "Viajaron a Sevilla, se hicieron fotos en el Palacio de Cristal de Madrid y celebraron su amor con un UNO personalizado.",
         imageUrl: "/storybook/year2/4.jpg"
      }
    ]
  },
  {
    year: 3,
    label: "Libro 3: Sueños",
    pages: [
      {
        title: "La Ciudad de los Sueños",
        text: "Viajaron a París y cumplieron el sueño de ver la Torre Eiffel.",
         imageUrl: "/storybook/year3/1.jpg"
      },
      {
        title: "Aventura Madrileña",
        text: "En enero de 2024, la gran aventura comenzó: se mudaron a Madrid.",
         imageUrl: "/storybook/year3/2.jpg"
      },
      {
        title: "El Patio de Recreo",
        text: "Convirtieron la ciudad en su patio de recreo, desde el Museo del Prado hasta paseos en bicicletas Lime.",
         imageUrl: "/storybook/year3/3.jpg"
      },
      {
        title: "Vibra y Misterio",
        text: "Vieron Aladdin, fueron a la boda de su prima, vibraron con Eladio Carrión y resolvieron misterios con un Cluedo único.",
         imageUrl: "/storybook/year3/4.jpg"
      }
    ]
  },
  {
    year: 4,
    label: "Libro 4: El Refugio",
    pages: [
       {
        title: "Manjares y Relax",
        text: "Descubrieron los manjares de Sushishom y se relajaron en un spa en Granada.",
         imageUrl: "/storybook/year4/1.jpg"
      },
      {
        title: "Superando la Distancia",
        text: "Ella tuvo que volver sola a Madrid, pero el amor superó de nuevo la distancia con infinitas videollamadas.",
         imageUrl: "/storybook/year4/2.jpg"
      },
      {
        title: "Paraíso Encontrado",
        text: "Hallaron su paraíso en una cabaña en El Gastor con vistas a la montaña.",
         imageUrl: "/storybook/year4/3.jpg"
      },
      {
        title: "Nuevo Destino",
        text: "Finalmente, el destino sopló a su favor y se mudaron juntos a Marbella, cerca del mar.",
         imageUrl: "/storybook/year4/4.jpg"
      }
    ]
  },
  {
    year: 5,
    label: "Libro 5: El Jardín",
    pages: [
       {
        title: "El Jardín de las Flores",
        text: "Marbella fue su época dorada. Una casa con piscina, mascotas vecinas, y un jardín lleno de girasoles que cuidaron con mimo.",
         imageUrl: "/storybook/year5/1.jpg"
      },
      {
        title: "Arte y Comida",
        text: "Fueron a la exposición de Van Gogh y comieron en Big Boss.",
         imageUrl: "/storybook/year5/2.jpg"
      },
      {
        title: "Viajes de Ensueño",
        text: "Y viajaron a la majestuosa Praga y la romántica Budapest.",
         imageUrl: "/storybook/year5/3.jpg"
      },
      {
        title: "Amor Puro",
        text: "Superaron todas las pruebas para forjar un amor puro, maduro y real que sigue floreciendo.",
         imageUrl: "/storybook/year5/4.jpg"
      }
    ]
  }
];

export default function Storybook() {
  const [currentBook, setCurrentBook] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [showTooltip, setShowTooltip] = useState(false);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    try {
      const unlockedLevels = JSON.parse(localStorage.getItem('unlocked_levels_v4') || '[]');
      if (unlockedLevels.length > 0) {
        setCurrentLevel(Math.max(...unlockedLevels));
      }
    } catch (e) {
      console.error("Error reading unlocked levels", e);
    }
  }, []);

  const handleTabClick = (bookIndex: number) => {
      const requestedYear = storyBooks[bookIndex].year;
      if (requestedYear > currentLevel) {
          setShowTooltip(true);
          setTimeout(() => setShowTooltip(false), 3000);
          return;
      }
      setDirection(bookIndex > currentBook ? 1 : -1);
      setCurrentBook(bookIndex);
      setCurrentPage(0);
  };

  const handleNext = () => {
    const bookData = storyBooks[currentBook];
    if (currentPage < bookData.pages.length - 1) {
      setDirection(1);
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentPage > 0) {
      setDirection(-1);
      setCurrentPage(prev => prev - 1);
    }
  };

  const pageVariants = {
    initial: (direction: number) => {
      return {
        x: direction > 0 ? 1000 : -1000,
        opacity: 0
      };
    },
    animate: {
      x: 0,
      opacity: 1,
      transition: {
        x: { type: 'spring', stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 }
      }
    },
    exit: (direction: number) => {
      return {
        x: direction > 0 ? -1000 : 1000,
        opacity: 0,
        transition: {
          x: { type: 'spring', stiffness: 300, damping: 30 },
          opacity: { duration: 0.2 }
        }
      };
    }
  };

  const PageContent = ({ index, pageData }: { index: number, pageData: typeof storyBooks[0]['pages'][0] }) => {
    const isEven = index % 2 === 0;
    
    const TextContent = () => (
      <div className="flex-1 p-8 md:p-12 lg:p-16 flex flex-col justify-center h-[50%] md:h-full">
        <span className="text-[#F26A8D] font-bold tracking-widest uppercase text-sm mb-4 block">
          PÁGINA {index + 1}
        </span>
        <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-[#880D1E] mb-6 md:mb-8 leading-tight drop-shadow-sm">
          {pageData.title}
        </h2>
        <div className="text-slate-800 text-base md:text-lg lg:text-xl leading-relaxed text-left">
          <span className="float-left text-5xl md:text-6xl text-[#DD2D4A] font-serif leading-none pr-3 pt-1">
            {pageData.text.charAt(0)}
          </span>
          {pageData.text.substring(1)}
        </div>
      </div>
    );

    const ImageContent = () => (
      <div className={`flex-1 relative h-[50%] md:h-full w-full ${!isEven ? 'p-8 md:p-12 pb-0 md:pb-12' : ''}`}>
        <img 
          src={pageData.imageUrl} 
          alt={pageData.title}
          className={`w-full h-full object-cover ${!isEven ? 'border-4 border-[#CBEEF3] rounded-2xl shadow-lg' : ''}`}
        />
      </div>
    );

    return (
      <div className="flex flex-col md:flex-row h-full w-full bg-[#FAF8F5]">
        {isEven ? (
          <>
            <ImageContent />
            <TextContent />
          </>
        ) : (
          <>
            <TextContent />
            <ImageContent />
          </>
        )}
      </div>
    );
  };

  const pagesLength = storyBooks[currentBook].pages.length;

  return (
    <div className="w-full h-full flex-1 flex flex-col items-center p-4 md:p-8 pt-6 relative max-w-7xl mx-auto">
      
      {/* Tabs */}
      <div className="w-full relative px-4 flex flex-wrap justify-center gap-2 md:gap-4 mb-8">
         {storyBooks.map((book, idx) => {
            const isLocked = book.year > currentLevel;
            const isActive = idx === currentBook;
            return (
              <button
                key={idx}
                onClick={() => handleTabClick(idx)}
                className={`relative px-4 py-2 md:px-6 md:py-3 rounded-2xl font-serif text-sm md:text-lg transition-all duration-300 flex items-center gap-2 ${isActive ? 'bg-[#880D1E] text-white shadow-xl scale-105' : 'bg-white text-[#880D1E] hover:bg-[#F49CBB] hover:text-white border border-[#880D1E]/20'}`}
              >
                {isLocked && <Lock size={16} className={isActive ? 'text-white' : 'text-[#880D1E] opacity-50'} />}
                {book.label}
              </button>
            )
         })}
      </div>

      {/* Floating Tooltip */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed top-24 z-[100] bg-[#880D1E] text-white px-6 py-3 rounded-full flex items-center gap-2 shadow-xl whitespace-nowrap"
          >
            <Lock size={18} />
            <span>Desbloquea el siguiente nivel para leer este capítulo</span>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Canvas */}
      <div className="relative w-full flex flex-col h-[75vh] md:aspect-[16/9] md:h-auto min-h-[500px] bg-[#FAF8F5] rounded-3xl shadow-2xl border-[4px] border-white overflow-hidden">
        
        {/* Navigation Arrows */}
        <div className="absolute inset-y-0 left-0 z-50 flex items-center pointer-events-none">
          <button 
            onClick={handlePrev}
            disabled={currentPage === 0}
            className={`m-2 md:m-4 p-2 md:p-4 rounded-full bg-white/80 shadow-md backdrop-blur-sm pointer-events-auto transition-all ${currentPage === 0 ? 'opacity-0 cursor-default' : 'opacity-100 hover:bg-[#F49CBB] hover:text-white text-[#880D1E]'}`}
          >
            <ChevronLeft size={32} />
          </button>
        </div>
        
        <div className="absolute inset-y-0 right-0 z-50 flex items-center pointer-events-none">
           <button 
              onClick={handleNext}
              disabled={currentPage === pagesLength - 1}
              className={`m-2 md:m-4 p-2 md:p-4 rounded-full bg-white/80 shadow-md backdrop-blur-sm pointer-events-auto transition-all ${currentPage === pagesLength - 1 ? 'opacity-0 cursor-default' : 'opacity-100 hover:bg-[#F26A8D] hover:text-white text-[#880D1E]'}`}
            >
              <ChevronRight size={32} />
           </button>
        </div>

        {/* Page Content */}
        <div className="relative w-full flex-1 overflow-hidden bg-[#FAF8F5]">
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={`${currentBook}-${currentPage}`}
              custom={direction}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="absolute inset-0 w-full h-full pb-10 md:pb-0"
            >
              <PageContent index={currentPage} pageData={storyBooks[currentBook].pages[currentPage]} />
            </motion.div>
          </AnimatePresence>
        </div>
        
        {/* Page indicator bottom */}
        <div className="absolute bottom-4 left-0 right-0 z-50 flex justify-center gap-3 pointer-events-none">
           {storyBooks[currentBook].pages.map((_, idx) => (
             <div 
                key={idx}
                className={`h-2 rounded-full transition-all duration-300 ${idx === currentPage ? 'w-10 bg-[#DD2D4A]' : 'w-2 bg-[#F49CBB]'}`}
             />
           ))}
        </div>
      </div>
    </div>
  );
}

