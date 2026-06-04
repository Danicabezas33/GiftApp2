import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Lock } from 'lucide-react';

const GITHUB_BASE = 'https://raw.githubusercontent.com/Danicabezas33/GiftApp2/main/public';

const getImageUrl = (path: string) => {
  if (path.startsWith('http')) return path;
  return `${GITHUB_BASE}${path.startsWith('/') ? path : `/${path}`}`;
};


const storyBooks = [
  {
    year: 1,
    label: "Libro 1: El Despertar",
    pages: [
      {
        title: "El Despertar de la Magia",
        text: "Todo comenzó en la fortaleza del mejor amigo de nuestro héroe, cuya hermana resultó ser la futura princesa de este cuento. Al cruzar sus miradas, una chispa invisible iluminó la estancia, pero como en las grandes leyendas, el tiempo debía seguir su curso. Se siguieron a través de los pergaminos mágicos de las redes sociales, y el silencio reinó durante meses hasta el día del cumpleaños del joven. Un mensaje cruzó el reino: \"¡Feliz cumpleñaños guapo!\". Aquel fue el conjuro que lo inició todo.",
        imageUrl: "/storybook/year1/1.png"
      },
      {
        title: "Primeros Pasos",
        text: "Días después, el joven caballero la invitó a pasear por el Bulevar. Tras horas de risas y confidencias, se refugiaron en una taberna del centro, donde el destino decidió poner a prueba su sentido del humor: un viento huracanado azotaba las calles, un peculiar juglar a su lado imitaba sonidos de animales sin cesar, y una tormenta repentina los empapó. Terminaron banqueteando en el castillo de los Arcos Dorados (McDonald's) antes de que él la escoltara sana y salva a su torre.",
        imageUrl: "/storybook/year1/2.png"
      },
      {
        title: "Primeros Pasos",
        text: "La segunda cita tuvo lugar en las nobles tierras de Baeza. Durante la cena, él, con audacia, le confesó que una de las salsas sabía a culo de mono, desatando las carcajadas de la princesa. Esa misma noche bajo las estrellas, nació una frase legendaria: \"¿Qué más besos quieres?\".",
        imageUrl: "/storybook/year1/3.png"
      },
      {
        title: "Primeros Pasos",
        text: "En su tercer encuentro, tras una tarde de ensueño, llegó el momento esperado. Con un tímido \"Te puedo dar otra cosa\", sus labios se unieron en su primer beso. Los meses siguientes fueron de paseos por los bancos del reino, luchando contra la oscura maldición del \"toque de queda\", que los obligaba a separarse cruelmente a las once de la noche.",
        imageUrl: "/storybook/year1/4.png"
      },
      {
        title: "Aventuras",
        text: "Pronto llegó su primera expedición juntos a Granada, un lugar que se convertiría en un refugio recurrente. Y así, el 20 de junio de 2021, en lo alto de un majestuoso castillo, él le pidió oficialmente que fuera su compañera de vida. Aquel verano quedó grabado en un pergamino visual (un vídeo) donde él la sostenía en el aire con sus piernas, tumbados sobre el césped, riendo a carcajadas.",
        imageUrl: "/storybook/year1/5.png"
      },
      {
        title: "La Gran Prueba",
        text: "Viajaron a las costas de La Carihuela, que desde entonces fue nombrada su playa favorita, y a Torre del Mar con la familia real de ella. En agosto, una sombra amenazó con arruinar su verano: la temida plaga (el Covid). La tristeza los invadió, pero el oráculo (la prueba) dio negativo, y pudieron cabalgar juntos hacia la playa. ",
         imageUrl: "/storybook/year1/6.png"
      },
      {
        title: "Aventuras",
        text: "Sin embargo, llegó la primera gran prueba. En septiembre, la princesa partió de Erasmus a las lejanas y frías tierras de Polonia. Fueron meses de oscuridad y añoranza, rotos únicamente por un mágico y apasionado reencuentro en Berlín. El caballero viajó un par de veces más a sus gélidas tierras, hasta que, en Navidad, ella regresó temporalmente para celebrar su primera Nochebuena juntos, llenando sus corazones de luz. Finalmente, en febrero de 2022, la princesa volvió para quedarse, celebrando su regreso en las estancias encantadas del Hotel Loob.",
        imageUrl: "/storybook/year1/7.png"
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
         imageUrl: "/storybook/year2/1.png"
      },
      {
        title: "Batallas",
        text: "Pero no todo en los cuentos es luz. Atravesaron un oscuro bosque de dificultades; la princesa luchaba contra el dragón de la ansiedad, y el caballero enfrentaba tormentas en su gremio de trabajo. Sin embargo, su amor fue su escudo. En Navidad, para protegerse del frío, adquirieron dos armaduras a juego: un poncho de ositos que siempre los abrigaría.",
         imageUrl: "/storybook/year2/2.png"
      },
      {
        title: "Nuestra Armadura",
        text: "Pasaron la Navidad en el piso de la tía de la princesa en Sevilla; aunque los tiempos eran difíciles, aquel castillo les dio fuerzas y lograron sonreír. Tras la tormenta llegó la calma, meses de risas y tonterías que culminaron en marzo de 2023 con un viaje al reino de Madrid, donde capturaron su amor en mágicos retratos frente al Palacio de Cristal. En junio de 2023, asistieron a su primer gran baile nupcial (una boda) juntos. Para coronar sus dos años de historia, él le entregó un artefacto único: un juego de UNO totalmente personalizado.",
         imageUrl: "/storybook/year2/3.png"
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
         imageUrl: "/storybook/year3/1.png"
      },
      {
        title: "Aventura Madrileña",
        text: "En agosto, volvieron a Torre del Mar. Él la guió al mágico Mariposario de Benalmádena, donde las criaturas aladas danzaban a su alrededor mientras de fondo sonaban las melodías del nuevo álbum del bardo Mora. Regresaron a Cazorla, enfrentándose a vientos huracanados y cabras montesas durante una hermosa ruta por el pueblo. En noviembre, la picardía se hizo presente cuando ella descubrió el tesoro oculto de su cumpleaños: el calendario de adviento de Sephora. Diciembre los llevó a Madrid para presenciar la magia de Aladdin en el gran teatro.",
         imageUrl: "/storybook/year3/2.png"
      },
      {
        title: "El Patio de Recreo",
        text: "Enero de 2024 marcó un hito en la leyenda: su mudanza a Madrid. El viaje en el tren de hierro fue una epopeya, pues el joven caballero ardía con una fiebre de 39.5. Aunque la vida en la gran ciudad fue una montaña escarpada para él, estuvo llena de momentos luminosos, como los serenos paseos por el Retiro, los brindis en su bar de la esquina, las expediciones semanales a los mercados Dia, el gran banquete en el restaurante griego, sus primeras cabalgadas juntos en corceles eléctricos (Lime) y bicicletas, la maravillosa exposición de Disney, los dulces festines comprando Manolitos, y las exploraciones en el Jardín Botánico y el majestuoso Acuario.",
         imageUrl: "/storybook/year3/3.png"
      },
      {
        title: "Vibra y Misterio",
        text: "Ese año, se vistieron de gala para el segundo baile nupcial (la boda de la prima de ella). En junio, cantaron a pleno pulmón en el concierto de Eladio Carrión. Para celebrar sus tres años, el caballero le entregó un nuevo misterio: un Cluedo personalizado.",
         imageUrl: "/storybook/year3/4.png"
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
         imageUrl: "/storybook/year4/1.png"
      },
      {
        title: "Superando la Distancia",
        text: "En julio de 2024, descubrieron los exóticos manjares del Sushishom, se purificaron en las aguas termales de un spa en Granada y bebieron mojitos en una pintoresca taberna. Tras pasar por Torre del Mar, viajaron a Cádiz con la familia de él, forjando recuerdos imborrables.",
         imageUrl: "/storybook/year4/2.png"
      },
      {
        title: "Paraíso Encontrado",
        text: "Pero en septiembre, la prueba de la distancia regresó. La princesa se mudó sola a Madrid. Fue una época dura, pero los espejos mágicos (videollamadas) y las constantes visitas mutuas mantuvieron la llama viva. En diciembre de 2024, encontraron su refugio soñado: una cabañita en El Gastor, Cádiz. Aislados del mundo, con vistas a imponentes montañas, descubrieron la que coronaron como la mejor taberna del mundo: La Posada.",
         imageUrl: "/storybook/year4/3.png"
      },
      {
        title: "Nuevo Destino",
        text: "En febrero, probaron el legendario Shifu ramen de Granada. En abril, exploraron el mágico Río Cuadros, que se coronó como su paraje natural favorito, y cocinaron galletas fritas por primera vez con la madre del caballero. Finalmente, el 15 de junio de 2024, emprendieron su segunda gran mudanza hacia el paraíso costero de Marbella, el reino donde más felices han sido.",
         imageUrl: "/storybook/year4/4.png"
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
         imageUrl: "/storybook/year5/1.png"
      },
      {
        title: "Arte y Comida",
        text: "Sus días estaban llenos de magia: cenas románticas, paseos por Puerto Banús, la belleza de Estepona, noches de cine con su propio proyector mágico, y tranquilos paseos por el Lago de Tortugas. Pero su mayor orgullo era SU JARDÍN DE PLANTAS, rebosante de alegres girasoles y flores preciosas.",
         imageUrl: "/storybook/year5/2.png"
      },
      {
        title: "Viajes de Ensueño",
        text: "Vivieron aventuras cómicas, como el divertido momento de la compra de las tablets, y encontraron el mejor spa de todo el reino. Llenaron el álbum de Stitch, se maravillaron con la exposición de Van Gogh y devoraron sus banquetes favoritos: las hamburguesas BIG BOSS. En octubre de 2025 vibraron en el concierto de Saiko, y en noviembre conquistaron la majestuosa Alhambra. Para su cumpleaños, él la sorprendió con una legendaria tarta de galletas. Ese mismo mes, volaron a la mágica ciudad de Praga junto a los padres de la princesa.",
         imageUrl: "/storybook/year5/3.png"
      },
      {
        title: "Amor Puro",
        text: "En marzo de 2026, el caballero le entregó un regalo de Reyes Magos inigualable: un viaje a Budapest. Fue, sin duda, una de las expediciones más hermosas de sus vidas, cayendo profundamente enamorados de la ciudad. Y para coronar esta época dorada, el 3 de junio de 2026, saltaron y bailaron en el grandioso concierto de Bad Bunny.",
         imageUrl: "/storybook/year5/4.png"
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
    initial: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.95
    }),
    animate: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        x: { type: 'spring', stiffness: 250, damping: 30 },
        opacity: { duration: 0.3 },
        scale: { duration: 0.3 }
      }
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -1000 : 1000,
      opacity: 0,
      scale: 0.95,
      transition: {
        x: { type: 'spring', stiffness: 250, damping: 30 },
        opacity: { duration: 0.3 },
        scale: { duration: 0.3 }
      }
    })
  };

  const DecorativeFrame = () => (
    <div className="absolute inset-4 md:inset-8 border border-[#F49CBB]/40 pointer-events-none z-0">
      <div className="absolute -top-[3px] -left-[3px] w-[6px] h-[6px] border border-[#880D1E]/40 rounded-full" />
      <div className="absolute -top-[3px] -right-[3px] w-[6px] h-[6px] border border-[#880D1E]/40 rounded-full" />
      <div className="absolute -bottom-[3px] -left-[3px] w-[6px] h-[6px] border border-[#880D1E]/40 rounded-full" />
      <div className="absolute -bottom-[3px] -right-[3px] w-[6px] h-[6px] border border-[#880D1E]/40 rounded-full" />
    </div>
  );

  const PageContent = ({ index, pageData }: { index: number, pageData: typeof storyBooks[0]['pages'][0] }) => {
    const isEven = index % 2 === 0;
    
    const TextContent = () => (
      <div className={`flex-1 p-8 md:p-12 lg:p-20 flex flex-col justify-center h-[50%] md:h-full relative z-10 ${isEven ? 'md:pl-16' : 'md:pr-16'}`}>
        <DecorativeFrame />
        
        <span className="text-[#F49CBB] font-bold tracking-[0.2em] uppercase text-xs md:text-sm mb-4 block text-center md:text-left relative z-10 w-fit mx-auto md:mx-0">
          Capítulo {index + 1}
          <div className="h-px bg-[#F49CBB]/30 w-full mt-1" />
        </span>
        
        <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-[#880D1E] mb-6 md:mb-10 leading-tight text-center md:text-left relative z-10 drop-shadow-sm">
          {pageData.title}
        </h2>
        
        <div className="text-slate-800 text-base md:text-lg lg:text-xl leading-[1.8] text-justify relative z-10 font-medium">
          <span className="float-left text-6xl md:text-7xl lg:text-8xl text-[#DD2D4A] font-serif leading-[0.8] pr-4 pt-2 mix-blend-multiply drop-shadow-sm">
            {pageData.text.charAt(0)}
          </span>
          {pageData.text.substring(1)}
        </div>
      </div>
    );

    const ImageContent = () => (
      <div className={`flex-1 relative h-[50%] md:h-full w-full flex items-center justify-center p-8 md:p-16 z-10 ${isEven ? 'md:pr-16' : 'md:pl-16'}`}>
        <DecorativeFrame />
        
        <div className="relative max-w-full max-h-full group flex flex-col items-center">
          <img 
            src={getImageUrl(pageData.imageUrl)} 
            alt={pageData.title}
            onError={(e) => {
              console.error("No se pudo cargar la imagen:", e.currentTarget.src);
            }}
            className="max-h-[35vh] md:max-h-[55vh] object-contain rounded-sm border-[8px] md:border-[12px] border-[#FFFDF9] bg-white shadow-[8px_8px_20px_rgba(136,13,30,0.15),-2px_-2px_10px_rgba(255,255,255,0.8)] filter contrast-[1.05] brightness-[1.02] transition-transform duration-500 group-hover:scale-[1.02] rotate-1 group-hover:rotate-0"
          />
          <div className="absolute -bottom-4 md:-bottom-6 left-1/2 -translate-x-1/2 bg-[#FFFDF9] border-y border-[#F49CBB] text-[#880D1E] font-serif px-6 py-2 text-[10px] md:text-xs tracking-widest uppercase shadow-md whitespace-nowrap rounded-sm transition-transform duration-500 group-hover:-translate-y-1 z-20">
            Fig. {index + 1} — {pageData.title}
          </div>
        </div>
      </div>
    );

    return (
      <div className="flex flex-col md:flex-row h-full w-full">
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
    <div className="w-full h-full flex-1 flex flex-col items-center p-4 md:p-6 lg:p-8 pt-4 relative max-w-[1400px] mx-auto">
      
      {/* Tabs */}
      <div className="w-full relative px-4 flex flex-wrap justify-center gap-2 md:gap-4 mb-6 z-30">
         {storyBooks.map((book, idx) => {
            const isLocked = book.year > currentLevel;
            const isActive = idx === currentBook;
            return (
              <button
                key={idx}
                onClick={() => handleTabClick(idx)}
                className={`relative px-4 py-2 md:px-6 md:py-3 rounded-t-xl rounded-b-sm border-b-4 font-serif text-sm md:text-base font-bold transition-all duration-300 flex items-center gap-2 ${isActive ? 'bg-[#880D1E] text-white border-[#5a0612] shadow-[0_10px_20px_rgba(136,13,30,0.3)] -translate-y-1' : 'bg-white text-[#880D1E] border-[#e2d8cd] hover:bg-[#F49CBB] hover:text-white hover:border-[#DD2D4A] shadow-md'}`}
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
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-24 z-[100] bg-[#880D1E] text-white font-serif px-6 py-3 rounded-full flex items-center gap-2 shadow-[0_10px_30px_rgba(136,13,30,0.4)] whitespace-nowrap border-2 border-[#F49CBB]"
          >
            <Lock size={18} />
            <span>Desbloquea el siguiente nivel para abrir este libro.</span>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Canvas - The Physical Book */}
      <div className="relative w-full flex flex-col h-[75vh] md:aspect-[18/11] md:h-auto min-h-[600px] rounded-3xl shadow-[0_30px_60px_rgba(0,0,0,0.4)] overflow-visible z-20">
        
        {/* Book Cover (Leather Backing) */}
        <div className="absolute inset-0 bg-[#880D1E] rounded-[2rem] shadow-[inset_0_0_40px_rgba(0,0,0,0.6)] border-[4px] md:border-[12px] border-[#5a0612] z-0 overflow-hidden">
           <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/leather.png')] opacity-40 mix-blend-multiply" />
           <div className="hidden md:block absolute top-0 bottom-0 left-1/2 w-20 -ml-10 bg-gradient-to-r from-[#4a050e] via-[#750A19] to-[#4a050e] shadow-[inset_0_0_20px_rgba(0,0,0,0.9)]" />
        </div>

        {/* Paper Pages Area */}
        <div className="absolute inset-2 md:inset-5 lg:inset-8 bg-[#FAF8F5] rounded-xl md:rounded-lg shadow-[inset_0_0_30px_rgba(136,13,30,0.05),0_0_20px_rgba(0,0,0,0.8)] z-10 overflow-hidden flex">
          
          {/* Inner Paper Texture */}
          <div className="absolute inset-0 opacity-[0.6] pointer-events-none" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/cream-paper.png')" }} />

          {/* Paper Stack Edges (Right and Left to give thickness) */}
          <div className="hidden md:block absolute top-[2px] bottom-[2px] right-0 w-4 bg-gradient-to-r from-transparent via-[#f0eadd] to-[#d6caba] rounded-r-lg border-l border-black/5" />
          <div className="hidden md:block absolute top-[4px] bottom-[4px] right-[2px] w-2 bg-gradient-to-r from-transparent via-[#f0eadd] to-[#d6caba] rounded-r-md border-l border-black/5" />
          
          <div className="hidden md:block absolute top-[2px] bottom-[2px] left-0 w-4 bg-gradient-to-l from-transparent via-[#f0eadd] to-[#d6caba] rounded-l-lg border-r border-black/5" />
          <div className="hidden md:block absolute top-[4px] bottom-[4px] left-[2px] w-2 bg-gradient-to-l from-transparent via-[#f0eadd] to-[#d6caba] rounded-l-md border-r border-black/5" />

          {/* Book Central Fold Line */}
          <div className="hidden md:block absolute top-0 bottom-0 left-1/2 w-16 -ml-8 bg-gradient-to-r from-transparent via-[rgba(60,20,20,0.1)] to-transparent pointer-events-none z-30 mix-blend-multiply shadow-[inset_1px_0_2px_rgba(255,255,255,0.5)]" />
          <div className="hidden md:block absolute top-0 bottom-0 left-1/2 w-[2px] -ml-[1px] bg-[rgba(0,0,0,0.12)] pointer-events-none z-30" />

          {/* Navigation Arrows (styled as Ornate Bookmarks/Buttons) */}
          <div className="absolute inset-y-0 left-0 z-50 flex items-center pointer-events-none">
            <button 
              onClick={handlePrev}
              disabled={currentPage === 0}
              className={`m-2 md:m-4 p-3 md:p-5 rounded-full bg-[#FAF8F5] border-[3px] border-[#F49CBB] shadow-[0_5px_15px_rgba(136,13,30,0.2)] pointer-events-auto transition-all duration-300 transform group ${currentPage === 0 ? 'opacity-0 scale-90 cursor-default' : 'opacity-100 hover:scale-110 hover:bg-[#880D1E] text-[#880D1E] hover:text-white hover:border-[#880D1E]'}`}
            >
              <ChevronLeft size={32} strokeWidth={2.5} className="group-hover:-translate-x-1 transition-transform" />
            </button>
          </div>
          
          <div className="absolute inset-y-0 right-0 z-50 flex items-center pointer-events-none">
            <button 
                onClick={handleNext}
                disabled={currentPage === pagesLength - 1}
                className={`m-2 md:m-4 p-3 md:p-5 rounded-full bg-[#FAF8F5] border-[3px] border-[#F49CBB] shadow-[0_5px_15px_rgba(136,13,30,0.2)] pointer-events-auto transition-all duration-300 transform group ${currentPage === pagesLength - 1 ? 'opacity-0 scale-90 cursor-default' : 'opacity-100 hover:scale-110 hover:bg-[#880D1E] text-[#880D1E] hover:text-white hover:border-[#880D1E]'}`}
              >
                <ChevronRight size={32} strokeWidth={2.5} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Page Content */}
          <div className="relative w-full flex-1 overflow-hidden z-20">
            <AnimatePresence initial={false} custom={direction}>
              <motion.div
                key={`${currentBook}-${currentPage}`}
                custom={direction}
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="absolute inset-0 w-full h-full pb-8 md:pb-0"
              >
                <PageContent index={currentPage} pageData={storyBooks[currentBook].pages[currentPage]} />
              </motion.div>
            </AnimatePresence>
          </div>
          
          {/* Page indicator bottom inside the book */}
          <div className="absolute bottom-4 md:bottom-6 left-0 right-0 z-50 flex justify-center gap-3 pointer-events-none">
            {storyBooks[currentBook].pages.map((_, idx) => (
              <div 
                  key={idx}
                  className={`h-2 rounded-full transition-all duration-500 shadow-sm ${idx === currentPage ? 'w-12 bg-[#880D1E]' : 'w-2 bg-[#F49CBB]/60'}`}
              />
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
