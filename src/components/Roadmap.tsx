import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect, useRef } from 'react';
import { Maximize2, X, Play } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Dynamically create a custom pink pin icon with a number
const getCustomPinkIcon = (index: number) => L.divIcon({
  className: 'custom-pin',
  html: `<div style="background-color: #ff8ba7; width: 28px; height: 28px; border-radius: 50% 50% 50% 0; border: 2px solid #130f1d; transform: rotate(-45deg); box-shadow: 0 0 10px rgba(255, 139, 167, 0.5); display: flex; align-items: center; justify-content: center; position: relative;">
          <span style="transform: rotate(45deg); display: block; width: 100%; text-align: center; font-weight: bold; font-family: sans-serif; color: #130f1d; font-size: 13px;">${index}</span>
         </div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 28],
  popupAnchor: [0, -30],
});

// Create a custom question mark icon for the mystery destination
const questionIcon = L.divIcon({
  className: 'custom-pin-question',
  html: `<div style="background-color: #a7a1ff; width: 32px; height: 32px; border-radius: 50%; border: 2px solid #130f1d; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 15px rgba(167, 161, 255, 0.5); font-weight: bold; color: #130f1d; font-size: 16px;">?</div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
});

interface LocationInfo {
  name: string;
  coords: [number, number];
  message: string;
}

const routesByYear: Record<string, LocationInfo[]> = {
  '2021': [
    { name: 'Jaén (Bulevar y Centro)', coords: [37.7692, -3.7902], message: 'Nuestra primera cita, esquivando el viento y la lluvia hacia el McDonald\'s.' },
    { name: 'Baeza', coords: [37.9943, -3.4688], message: 'Nuestra segunda cita, la salsa peculiar y nuestro primer "¿Qué más besos quieres?".' },
    { name: 'Granada', coords: [37.1773, -3.5986], message: 'Nuestro primer viaje juntos al Hotel Saray, el inicio de muchas escapadas.' },
    { name: 'Castillo de Santa Catalina', coords: [37.7674, -3.8011], message: 'El 20 de junio de 2021, donde te pedí salir oficialmente.' },
    { name: 'La Carihuela', coords: [36.6117, -4.5042], message: 'Nuestra playa favorita, conectando muchísimo y creando el mejor recuerdo.' },
    { name: 'Torre del Mar', coords: [36.7450, -4.0955], message: 'Nuestro primer viaje de verano con tu familia.' },
    { name: 'La Carihuela', coords: [36.6137, -4.5030], message: 'Playa con mis padres' },
    { name: 'Berlín', coords: [52.5200, 13.4050], message: 'El reencuentro más mágico tras la separación de tu Erasmus.' },
    { name: 'Poznan', coords: [52.4056, 16.9313], message: 'Otro reencuentro mágico.' },
    { name: 'Hotel Loob', coords: [40.4000, -3.5000], message: 'Celebrando tu vuelta definitiva del Erasmus.' },
    { name: 'Granada', coords: [37.1868, -3.6032], message: 'Nuestro primer viaje juntos, el inicio de muchas escapadas.' },
  ],
  '2022': [
    { name: 'Granada', coords: [37.1773, -3.5986], message: 'Hotel Porcel Sabica.' },
    { name: 'Granada', coords: [37.1748, -3.6010], message: 'Hotel Porcel Sabica.' },
    { name: 'Cazorla', coords: [37.9135, -3.0039], message: 'Nuestra primera vez explorando juntos la sierra.' },
    { name: 'Granada', coords: [37.1701, -3.5993], message: 'Hotel Porcel Sabica.' },
    { name: 'Torremolinos', coords: [36.6213, -4.4995], message: 'Descubriendo que "este agua moja mucho".' },
    { name: 'Calahonda', coords: [36.4883, -4.7176], message: 'Días de verano superando juntos los momentos difíciles.' },
    { name: 'Granada', coords: [37.1785, -3.6039], message: 'Un día de SPA increible en elHotel Senator.' },
    { name: 'Sevilla', coords: [37.3891, -5.9845], message: 'Las Navidades en el piso de tu tía, sacando fuerzas y riendo con nuestro poncho a juego.' },
  ],
  '2023': [
    { name: 'Granada', coords: [37.1773, -3.5986], message: 'Hotel Las Almenas.' },
    { name: 'Madrid', coords: [40.4136, -3.6818], message: 'Nuestras míticas fotos haciendo el tonto en el Palacio de Cristal.' },
    { name: 'Roquetas de Mar', coords: [36.7661, -2.6049], message: 'Apartamento en la costa con objetos dudosos.' },
    { name: 'París', coords: [48.8566, 2.3522], message: 'Nuestro viaje favorito. Cumpliendo tu sueño a la carrera.' },
    { name: 'Mariposario de Benalmádena', coords: [36.5878, -4.5670], message: 'Un momento precioso rodeados de mariposas y escuchando a Mora.' },
    { name: 'Torre del Mar', coords: [36.7450, -4.0955], message: 'Viaje de verano con tu familia.' },
    { name: 'La Rijana', coords: [36.7096, -3.3911], message: 'Playa de La Rijana.' },
    { name: 'Cazorla', coords: [37.9135, -3.0039], message: 'Nuestra segunda vez en la sierra de Cazorla.' },
    { name: 'Madrid (Teatro)', coords: [40.4200, -3.7000], message: 'Disfrutando juntos de la magia de Aladdin.' },
  ],
  '2024': [
    { name: 'Madrid (Nuestra Casa)', coords: [40.4168, -3.7038], message: 'Nuestra primera mudanza. Paseos por el Prado, Disney, Acuario, bicis y Manolitos.' },
    { name: 'Torre del campo ', coords: [37.770834, -3.897788], message: 'Nuestra segunda boda.' },
    { name: 'Fuengirola', coords: [36.5416, -4.6241], message: 'Concierto de Eladio Carrion.' },
    { name: 'Algarrobo', coords: [36.7618, -4.0378], message: 'Viaje de aniversario, risas y cuidándote con mucho mimo.' },
    { name: 'Granada', coords: [37.1773, -3.5986], message: 'Aguas termales y mojitos de verano.' },
    { name: 'Torre del Mar', coords: [36.7450, -4.0955], message: 'Viaje de verano con tu familia.' },
    { name: 'Sanlúcar de Barrameda', coords: [36.779686, -6.366010], message: 'Forjando recuerdos imborrables con mi familia.' },
    { name: 'Madrid', coords: [40.4357, -3.6889], message: 'Tu estancia de estudios de peinados.' },
    { name: 'El Gastor', coords: [36.8532, -5.3218], message: 'Nuestra cabañita en la montaña y el gran descubrimiento de La Posada.' },
  ],
  '2025': [
    { name: 'Granada', coords: [37.1773, -3.5986], message: 'Shifu Ramen.' },
    { name: 'Fuenmayor', coords: [37.7508, -3.5168], message: 'Buscando la nieve.' },
    { name: 'Río Cuadros', coords: [37.8258, -3.4002], message: 'Nuestro rincón favorito de naturaleza hasta el momento.' },
    { name: 'Marbella', coords: [36.5101, -4.8824], message: 'Nuestra segunda mudanza y el lugar donde más felices hemos vivido.' },
    { name: 'Torre del Mar', coords: [36.7450, -4.0955], message: 'Viaje de verano con tu familia.' },
    { name: 'Estepona', coords: [36.4273, -5.1462], message: 'Descubriendo nuevos encantos desde nuestro hogar en la costa.' },
    { name: 'SPA', coords: [36.5416, -4.6241], message: 'SPA con vistas a los campos de golf.' },
    { name: 'Madrid', coords: [40.4168, -3.7038], message: 'Concierto Saiko.' },
    { name: 'La Alhambra', coords: [37.1760, -3.5881], message: 'Una visita espectacular antes de celebrar tu cumpleaños.' },
    { name: 'Praga', coords: [50.0755, 14.4378], message: 'Viajando con tus padres y pasándolo increíble.' },
  ],
  '2026': [
    { name: 'Budapest', coords: [47.4979, 19.0402], message: 'El regalo de Reyes que nos enamoró y uno de los mejores viajes de nuestra vida.' },
    { name: 'Madrid', coords: [40.4168, -3.7038], message: 'Concierto de Bad Bunny.' },
    { name: 'El Futuro...', coords: [0, 0], message: '¿Cuál será nuestro próximo gran destino? ¡Solo el tiempo lo dirá!' },
  ]
};

const milestones = [
  { 
    year: 'Año 1', 
    title: 'Donde empezó todo', 
    desc: 'Nuestra primera cita, los primeros mensajes y el primer "Te amo". Descubriendo el mundo el uno del otro.',
    youtubeUrl: 'https://youtu.be/hM5nLahoC4E'
  },
  { 
    year: 'Año 2', 
    title: 'Aventuras juntos', 
    desc: 'Nuestros primeros viajes largos. Aprendimos a convivir y a ser un verdadero equipo ante cualquier resto.',
    youtubeUrl: 'https://youtu.be/G7e2fP6PH_4'
  },
  { 
    year: 'Año 3', 
    title: 'Creciendo', 
    desc: 'Nuevos trabajos, nuevas metas. Apoyándonos en todo momento para ser nuestras mejores versiones.',
    youtubeUrl: 'https://youtu.be/K_o8NBY7mgg'
  },
  { 
    year: 'Año 4', 
    title: 'Hogar', 
    desc: 'Compartiendo más que tiempo, compartiendo una vida. Las pequeñas rutinas que hacen de cada día algo especial.',
    youtubeUrl: 'https://youtu.be/l0Y5xsfUUNU'
  },
  { 
    year: 'Año 5', 
    title: 'El presente brillante', 
    desc: 'Celebrando nuestro quinto aniversario con el corazón lleno de recuerdos y mirando hacia un futuro juntos.',
    youtubeUrl: 'https://youtu.be/vTnnbdDEw9w'
  }
];

function getYouTubeId(url: string): string {
  if (!url) return '';
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : '';
}

function getYouTubeEmbedUrl(url: string): string {
  const videoId = getYouTubeId(url);
  if (videoId) {
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;
  }
  return url;
}

function getYouTubeThumbnail(url: string): string {
  const videoId = getYouTubeId(url);
  if (videoId) {
    return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  }
  return '';
}

export default function Roadmap() {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const [activeYear, setActiveYear] = useState('2021');
  const [expandedVideo, setExpandedVideo] = useState<number | null>(null);

  // Generates a curved path using Quadratic Bezier between two points
  const getCurvePoints = (start: [number, number], end: [number, number], index: number, numPoints = 25) => {
    const points: [number, number][] = [];
    
    // Midpoint
    const midLat = (start[0] + end[0]) / 2;
    const midLng = (start[1] + end[1]) / 2;
    
    // Direction
    const dLat = end[0] - start[0];
    const dLng = end[1] - start[1];
    
    // Factor logic: alternate offset to prevent overlap on return trips
    const curveFactor = index % 2 === 0 ? 0.25 : -0.25;
    
    // Perpendicular vector for control point
    const ctrlLat = midLat - dLng * curveFactor;
    const ctrlLng = midLng + dLat * curveFactor;
    
    for (let i = 0; i <= numPoints; i++) {
      const t = i / numPoints;
      // Quadratic Bezier interpolation
      const lat = Math.pow(1 - t, 2) * start[0] + 2 * (1 - t) * t * ctrlLat + Math.pow(t, 2) * end[0];
      const lng = Math.pow(1 - t, 2) * start[1] + 2 * (1 - t) * t * ctrlLng + Math.pow(t, 2) * end[1];
      points.push([lat, lng]);
    }
    return points;
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = L.map(mapContainerRef.current, {
      zoomControl: false
    }).setView([40.4168, -3.7038], 5);
    
    L.control.zoom({ position: 'bottomright' }).addTo(map);
    
    // Using a ligth themed map for the Zen aesthetic
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20
    }).addTo(map);

    layerGroupRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    // Optional invalidation if size changes on mount animation
    setTimeout(() => {
       if (mapRef.current) mapRef.current.invalidateSize();
    }, 300);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    cargarAño(activeYear);
  }, [activeYear]);

  const cargarAño = (año: string) => {
    if (!mapRef.current || !layerGroupRef.current) return;

    const map = mapRef.current;
    const layerGroup = layerGroupRef.current;

    layerGroup.clearLayers();

    const ubicaciones = routesByYear[año];
    if (!ubicaciones || ubicaciones.length === 0) return;

    const coordsArray: [number, number][] = [];

    ubicaciones.forEach((ubicacion, index) => {
      // Filtrar [0,0] para evitar errores visuales en el mapa
      if (ubicacion.coords[0] === 0 && ubicacion.coords[1] === 0) return;
      
      coordsArray.push(ubicacion.coords);

      const isLastPointOf2026 = año === '2026' && index === ubicaciones.length - 1;
      const markerIcon = isLastPointOf2026 ? questionIcon : getCustomPinkIcon(index + 1);

      const marker = L.marker(ubicacion.coords, { icon: markerIcon });
      
      const popupContent = `
        <div class="text-center font-sans p-1">
          <h3 class="font-bold text-lg text-rose-600 mb-1 leading-tight">${index + 1}. ${ubicacion.name}</h3>
          <p class="text-gray-700 text-sm m-0 leading-snug">${ubicacion.message}</p>
        </div>
      `;
      
      marker.bindPopup(popupContent, {
        closeButton: true,
        className: 'custom-popup rounded-xl overflow-hidden shadow-lg border border-pink-100',
      });
      
      // Delay marker appearance for animation effect
      setTimeout(() => {
         marker.addTo(layerGroup);
      }, index * 200);
    });

    if (coordsArray.length > 1) {
      // Create beautifully curved paths instead of zigzag
      let curvedPath: [number, number][] = [];
      for (let i = 0; i < coordsArray.length - 1; i++) {
        const segmentCurve = getCurvePoints(coordsArray[i], coordsArray[i + 1], i);
        // exclude first coordinate of next segment to avoid duplicate points
        if (i > 0) segmentCurve.shift();
        curvedPath = [...curvedPath, ...segmentCurve];
      }

      const polylineBg = L.polyline(curvedPath, {
        color: '#ff8ba7',
        weight: 6,
        opacity: 0.2,
        lineCap: 'round',
        lineJoin: 'round'
      });
      
      const polylineLine = L.polyline(curvedPath, {
        color: '#DD2D4A',
        weight: 3,
        dashArray: '10, 15',
        opacity: 0.9,
        lineCap: 'round',
        lineJoin: 'round',
        className: 'animated-route'
      });
      
      polylineBg.addTo(layerGroup);
      polylineLine.addTo(layerGroup);
    }

    if (coordsArray.length > 0) {
      const bounds = L.latLngBounds(coordsArray);
      map.flyToBounds(bounds, { padding: [50, 50], duration: 1.5 });
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-4xl mx-auto py-16 px-4 md:py-20 flex flex-col gap-16 md:gap-24 font-serif overflow-x-hidden"
    >
      <section>
        <h2 className="text-4xl md:text-6xl font-script text-center text-spring-secondary mb-12 md:mb-20 drop-shadow-sm">Nuestra Historia</h2>
        
        <div className="relative border-l-2 border-spring-primary/20 ml-4 md:ml-12">
          {milestones.map((m, i) => (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.1, duration: 0.8 }}
              key={i} 
              className="mb-12 md:mb-16 ml-6 md:ml-12 relative"
            >
              <div className="absolute w-4 h-4 md:w-5 md:h-5 bg-spring-primary rounded-full top-8 md:top-12 -left-[33px] md:-left-[59px] shadow-[0_0_15px_rgba(221,45,74,0.6)] border-2 border-white z-10"></div>
              
              <div className="glass p-1 md:p-1.5 rounded-[1.5rem] md:rounded-[2rem] overflow-hidden flex flex-col md:flex-row gap-0 md:gap-4 items-stretch group hover:border-spring-primary/30 transition-all duration-500 shadow-sm hover:shadow-md">
                <div className="p-6 md:p-10 flex-1 flex flex-col justify-center">
                  <span className="inline-block px-3 py-1 md:px-4 md:py-1.5 bg-spring-primary/10 text-spring-primary text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase rounded-full mb-3 md:mb-6 w-max border border-spring-primary/20">
                    {m.year}
                  </span>
                  <h3 className="text-xl md:text-3xl font-bold text-spring-text mt-1 mb-2 md:mb-4 group-hover:text-spring-primary transition-colors duration-500">{m.title}</h3>
                  <p className="text-spring-text-muted text-sm md:text-lg leading-relaxed">{m.desc}</p>
                </div>
                <div 
                  onClick={() => setExpandedVideo(i)}
                  className="w-full md:w-[240px] lg:w-[320px] h-48 md:h-auto min-h-[192px] shrink-0 relative bg-spring-bg overflow-hidden rounded-xl md:rounded-2xl flex items-center justify-center border border-spring-primary/10 cursor-pointer group/vid shadow-inner"
                >
                  <img
                    src={getYouTubeThumbnail(m.youtubeUrl)}
                    alt={m.title}
                    referrerPolicy="no-referrer"
                    className="absolute inset-0 w-full h-full object-cover z-10 opacity-95 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                  />
                  <div className="absolute inset-0 bg-black/10 group-hover/vid:bg-black/35 transition-colors duration-500 z-[11]" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center text-spring-text-muted/30 z-0 text-sm font-medium">
                    <span>Recuerdo en YouTube</span>
                  </div>
                  <button
                    className="absolute z-20 m-auto w-14 h-14 bg-[#DD2D4A]/90 hover:bg-[#DD2D4A] text-white rounded-full flex items-center justify-center shadow-lg transition-all duration-300 transform group-hover/vid:scale-110"
                    aria-label="Abrir video de YouTube"
                  >
                    <Play className="w-6 h-6 fill-white ml-0.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-4xl md:text-6xl font-script text-center text-spring-secondary mb-10 md:mb-12 drop-shadow-sm">Mapa de Viajes</h2>
        
        <div className="flex flex-col lg:flex-row gap-6 glass p-4 md:p-6 rounded-[2rem] md:rounded-[2.5rem]">
          {/* Selectores de año */}
          <div className="w-full lg:w-48 flex flex-row lg:flex-col gap-2 md:gap-3 overflow-x-auto pb-4 lg:pb-0 scrollbar-hide">
            {Object.keys(routesByYear).map(year => (
              <button
                key={year}
                onClick={() => setActiveYear(year)}
                className={`
                  px-6 py-3 whitespace-nowrap text-lg font-bold transition-all duration-300 rounded-full shadow-sm border
                  ${activeYear === year 
                    ? 'bg-[#DD2D4A] text-white border-[#DD2D4A] shadow-md shadow-[#DD2D4A]/30 transform scale-105' 
                    : 'bg-white text-[#880D1E]/80 border-[#F49CBB]/50 hover:bg-[#F49CBB]/20 hover:text-[#880D1E]'}
                `}
              >
                {year}
              </button>
            ))}
          </div>

          {/* Mapa */}
          <div className="w-full lg:flex-1 h-[300px] sm:h-[400px] md:h-[500px] rounded-[1.25rem] md:rounded-[2rem] overflow-hidden border border-spring-primary/20 relative z-0">
            <div ref={mapContainerRef} className="absolute inset-0 w-full h-full bg-slate-100 z-0 text-spring-text"></div>
          </div>
        </div>
      </section>

      <AnimatePresence>
        {expandedVideo !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 md:p-8"
            onClick={() => setExpandedVideo(null)}
          >
            <button
              onClick={() => setExpandedVideo(null)}
              className="absolute top-4 right-4 md:top-8 md:right-8 z-[110] p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
            >
              <X className="w-8 h-8" />
            </button>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative max-w-5xl w-full aspect-video rounded-2xl md:rounded-3xl overflow-hidden bg-black shadow-2xl border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <iframe
                src={getYouTubeEmbedUrl(milestones[expandedVideo].youtubeUrl)}
                title={milestones[expandedVideo].title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="w-full h-full"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

