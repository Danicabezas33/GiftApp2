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
        text: "Todo comenzó en la fortaleza del mejor amigo de nuestro héroe, cuya hermana resultó ser la futura princesa de este cuento. Al cruzar sus miradas, una chispa invisible iluminó la estancia, pero como en las grandes leyendas, el tiempo debía seguir su curso. Se siguieron a través de los pergaminos mágicos de las redes sociales, y el silencio reinó durante meses hasta el día del cumpleaños del joven. Un mensaje cruzó el reino: \"¡Feliz cumpleñaños guapo!\". Aquel fue el conjuro que lo inició todo.",
        imageUrl: "/storybook/year1/1.jpg"
      },
      {
        title: "Primeros Pasos",
        text: "Días después, el joven caballero la invitó a pasear por el Bulevar. Tras horas de risas y confidencias, se refugiaron en una taberna del centro, donde el destino decidió poner a prueba su sentido del humor: un viento huracanado azotaba las calles, un peculiar juglar a su lado imitaba sonidos de animales sin cesar, y una tormenta repentina los empapó. Terminaron banqueteando en el castillo de los Arcos Dorados (McDonald's) antes de que él la escoltara sana y salva a su torre.",
        imageUrl: "/storybook/year1/2.jpg"
      },
      {
        title: "Primeros Pasos",
        text: "La segunda cita tuvo lugar en las nobles tierras de Baeza. Durante la cena, él, con audacia, le confesó que una de las salsas sabía a culo de mono, desatando las carcajadas de la princesa. Esa misma noche bajo las estrellas, nació una frase legendaria: \"¿Qué más besos quieres?\".",
        imageUrl: "/storybook/year1/3.jpg"
      },
      {
        title: "Primeros Pasos",
        text: "En su tercer encuentro, tras una tarde de ensueño, llegó el momento esperado. Con un tímido \"Te puedo dar otra cosa\", sus labios se unieron en su primer beso. Los meses siguientes fueron de paseos por los bancos del reino, luchando contra la oscura maldición del \"toque de queda\", que los obligaba a separarse cruelmente a las once de la noche.",
        imageUrl: "/storybook/year1/4.jpg"
      },
      {
        title: "Aventuras",
        text: "Pronto llegó su primera expedición juntos a Granada, un lugar que se convertiría en un refugio recurrente. Y así, el 20 de junio de 2021, en lo alto de un majestuoso castillo, él le pidió oficialmente que fuera su compañera de vida. Aquel verano quedó grabado en un pergamino visual (un vídeo) donde él la sostenía en el aire con sus piernas, tumbados sobre el césped, riendo a carcajadas.",
        imageUrl: "/storybook/year1/5.jpg"
      },
      {
        title: "La Gran Prueba",
        text: "Viajaron a las costas de La Carihuela, que desde entonces fue nombrada su playa favorita, y a Torre del Mar con la familia real de ella. En agosto, una sombra amenazó con arruinar su verano: la temida plaga (el Covid). La tristeza los invadió, pero el oráculo (la prueba) dio negativo, y pudieron cabalgar juntos hacia la playa. ",
         imageUrl: "/storybook/year1/6.jpg"
      },
      {
        title: "Aventuras",
        text: "Sin embargo, llegó la primera gran prueba. En septiembre, la princesa partió de Erasmus a las lejanas y frías tierras de Polonia. Fueron meses de oscuridad y añoranza, rotos únicamente por un mágico y apasionado reencuentro en Berlín. El caballero viajó un par de veces más a sus gélidas tierras, hasta que, en Navidad, ella regresó temporalmente para celebrar su primera Nochebuena juntos, llenando sus corazones de luz. Finalmente, en febrero de 2022, la princesa volvió para quedarse, celebrando su regreso en las estancias encantadas del Hotel Loob.",
        imageUrl: "/storybook/year1/7.jpg"
      }
    ]
  },
  {
    year: 2,
    label: "Libro 2: El Escudo",
    pages: [
      {
        title: "El Escudo de los Osos",
        text: "El segundo año comenzó con una expedición a Torremolinos, donde descubrieron una gran verdad del universo: \"este agua moja mucho\". Exploraron los frondosos bosques de Cazorla, y en verano regresaron a Torre del Mar y descubrieron Calahonda.",
         imageUrl: "/storybook/year2/1.jpg"
      },
      {
        title: "Batallas",
        text: "Pero no todo en los cuentos es luz. Atravesaron un oscuro bosque de dificultades; la princesa luchaba contra el dragón de la ansiedad, y el caballero enfrentaba tormentas en su gremio de trabajo. Sin embargo, su amor fue su escudo. En Navidad, para protegerse del frío, adquirieron dos armaduras a juego: un poncho de ositos que siempre los abrigaría.",
         imageUrl: "/storybook/year2/2.jpg"
      },
      {
        title: "Nuestra Armadura",
        text: "Pasaron la Navidad en el piso de la tía de la princesa en Sevilla; aunque los tiempos eran difíciles, aquel castillo les dio fuerzas y lograron sonreír. Tras la tormenta llegó la calma, meses de risas y tonterías que culminaron en marzo de 2023 con un viaje al reino de Madrid, donde capturaron su amor en mágicos retratos frente al Palacio de Cristal. En junio de 2023, asistieron a su primer gran baile nupcial (una boda) juntos. Para coronar sus dos años de historia, él le entregó un artefacto único: un juego de UNO totalmente personalizado.",
         imageUrl: "/storybook/year2/3.jpg"
      }
    ]
  },
  {
    year: 3,
    label: "Libro 3: Sueños",
    pages: [
      {
        title: "La Ciudad de los Sueños",
        text: "En julio de 2023, emprendieron la travesía favorita de sus vidas: París. Aunque sus aposentos estaban lejos del centro y tuvieron que correr por las calles adoquinadas casi perdiendo la preciada sudadera del primer aniversario, el caballero cumplió el mayor sueño de su princesa.",
         imageUrl: "/storybook/year3/1.jpg"
      },
      {
        title: "Aventura Madrileña",
        text: "En agosto, volvieron a Torre del Mar. Él la guió al mágico Mariposario de Benalmádena, donde las criaturas aladas danzaban a su alrededor mientras de fondo sonaban las melodías del nuevo álbum del bardo Mora. Regresaron a Cazorla, enfrentándose a vientos huracanados y cabras montesas durante una hermosa ruta por el pueblo. En noviembre, la picardía se hizo presente cuando ella descubrió el tesoro oculto de su cumpleaños: el calendario de adviento de Sephora. Diciembre los llevó a Madrid para presenciar la magia de Aladdin en el gran teatro.",
         imageUrl: "/storybook/year3/2.jpg"
      },
      {
        title: "El Patio de Recreo",
        text: "Enero de 2024 marcó un hito en la leyenda: su mudanza a Madrid. El viaje en el tren de hierro fue una epopeya, pues el joven caballero ardía con una fiebre de 39.5. Aunque la vida en la gran ciudad fue una montaña escarpada para él, estuvo llena de momentos luminosos, como los serenos paseos por el Prado, los brindis en su bar de la esquina, las expediciones semanales a los mercados del supermercado Dia, el gran banquete en el restaurante griego, sus primeras cabalgadas juntos en corceles eléctricos (Lime) y bicicletas, la maravillosa exposición de Disney, los dulces festines comprando Manolitos, y las exploraciones en el Jardín Botánico y el majestuoso Acuario.",
         imageUrl: "/storybook/year3/3.jpg"
      },
      {
        title: "Vibra y Misterio",
        text: "Ese año, se vistieron de gala para el segundo baile nupcial (la boda de la prima de ella). En junio, cantaron a pleno pulmón en el concierto de Eladio Carrión. Para celebrar sus tres años, el caballero le entregó un nuevo misterio: un Cluedo personalizado.",
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
        text: "El viaje de aniversario los llevó a Algarrobo. Aunque el reino estaba lleno de risas, una noche la princesa cayó enferma con una dolorosa aflicción (infección de orina). El caballero, como un verdadero guardián, pasó horas acariciándola en la oscuridad hasta que el dolor cedió y ella pudo dormir.",
         imageUrl: "/storybook/year4/1.jpg"
      },
      {
        title: "Superando la Distancia",
        text: "En julio de 2024, descubrieron los exóticos manjares del Sushishom, se purificaron en las aguas termales de un spa en Granada y bebieron mojitos en una pintoresca taberna. Tras pasar por Torre del Mar, viajaron a Cádiz con la familia de él, forjando recuerdos imborrables.",
         imageUrl: "/storybook/year4/2.jpg"
      },
      {
        title: "Paraíso Encontrado",
        text: "Pero en septiembre, la prueba de la distancia regresó. La princesa se mudó sola a Madrid. Fue una época dura, pero los espejos mágicos (videollamadas) y las constantes visitas mutuas mantuvieron la llama viva. En diciembre de 2024, encontraron su refugio soñado: una cabañita en El Gastor, Cádiz. Aislados del mundo, con vistas a imponentes montañas, descubrieron la que coronaron como la mejor taberna del mundo: La Posada.",
         imageUrl: "/storybook/year4/3.jpg"
      },
      {
        title: "Nuevo Destino",
        text: "En febrero, probaron el legendario Shifu ramen de Granada. En abril, exploraron el mágico Río Cuadros, que se coronó como su paraje natural favorito, y cocinaron galletas fritas por primera vez con la madre del caballero. Finalmente, el 15 de junio de 2024, emprendieron su segunda gran mudanza hacia el paraíso costero de Marbella, el reino donde más felices han sido.",
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
        text: "Los meses en Marbella fueron el apogeo de su cuento. Cada día, él la llevaba y la traía de su labor en su carruaje. Sobrevivieron a una cama que les destrozaba la espalda, pero disfrutaron de un jardín privado con piscina y de la leal compañía del perro y el gato de sus vecinos.",
         imageUrl: "/storybook/year5/1.jpg"
      },
      {
        title: "Arte y Comida",
        text: "Sus días estaban llenos de magia: cenas románticas, paseos por Puerto Banús, la belleza de Estepona, noches de cine con su propio proyector mágico, y tranquilos paseos por el Lago de Tortugas. Pero su mayor orgullo era SU JARDÍN DE PLANTAS, rebosante de alegres girasoles y flores preciosas.",
         imageUrl: "/storybook/year5/2.jpg"
      },
      {
        title: "Viajes de Ensueño",
        text: "Vivieron aventuras cómicas, como el divertido momento de la compra de las tablets, y encontraron el mejor spa de todo el reino. Llenaron el álbum de Stitch, se maravillaron con la exposición de Van Gogh y devoraron sus banquetes favoritos: las hamburguesas BIG BOSS. En octubre de 2025 vibraron en el concierto de Saiko, y en noviembre conquistaron la majestuosa Alhambra. Para su cumpleaños, él la sorprendió con una legendaria tarta de galletas. Ese mismo mes, volaron a la mágica ciudad de Praga junto a los padres de la princesa.",
         imageUrl: "/storybook/year5/3.jpg"
      },
      {
        title: "Amor Puro",
        text: "En marzo de 2026, el caballero le entregó un regalo de Reyes Magos inigualable: un viaje a Budapest. Fue, sin duda, una de las expediciones más hermosas de sus vidas, cayendo profundamente enamorados de la ciudad. Y para coronar esta época dorada, el 3 de junio de 2026, saltaron y bailaron en el grandioso concierto de Bad Bunny.",
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

