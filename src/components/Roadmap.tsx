import { motion } from 'motion/react';
import { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Create a custom pink pin icon
const customPinkIcon = L.divIcon({
  className: 'custom-pin',
  html: `<div style="background-color: #ff8ba7; width: 24px; height: 24px; border-radius: 50% 50% 50% 0; border: 2px solid #130f1d; transform: rotate(-45deg); box-shadow: 0 0 10px rgba(255, 139, 167, 0.5);"></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 24],
  popupAnchor: [0, -26],
});

// Create a custom question mark icon for the mystery destination
const questionIcon = L.divIcon({
  className: 'custom-pin-question',
  html: `<div style="background-color: #a7a1ff; width: 32px; height: 32px; border-radius: 50%; border: 2px solid #130f1d; display: flex; items-center; justify-center; box-shadow: 0 0 15px rgba(167, 161, 255, 0.5); font-weight: bold; color: #130f1d; font-size: 20px;">?</div>`,
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
    { name: 'Nuestros inicios', coords: [40.4168, -3.7038], message: 'El comienzo de algo mágico e inesperado.' },
    { name: 'Primera escapada', coords: [40.6317, -4.0125], message: 'Nuestra primera salida juntos, conociéndonos más.' },
  ],
  '2022': [
    { name: 'Madrid', coords: [40.4168, -3.7038], message: 'Donde empezó todo. Primeras citas y sonrisas.' },
    { name: 'Sevilla', coords: [37.3891, -5.9845], message: 'Un fin de semana lleno de sol y alegría.' },
    { name: 'Granada', coords: [37.1773, -3.5986], message: 'El mejor atardecer que vimos juntos.' },
  ],
  '2023': [
    { name: 'Barcelona', coords: [41.3851, 2.1734], message: 'Paseos por la playa y obras espectaculares.' },
    { name: 'París', coords: [48.8566, 2.3522], message: 'La ciudad del amor, que hizo honor a su nombre.' },
    { name: 'Roma', coords: [41.9028, 12.4964], message: 'Pasta, pizza y cientos de monedas en fontanas.' },
  ],
  '2024': [
    { name: 'Londres', coords: [51.5074, -0.1278], message: 'Mucho frío pero con el corazón calentito.' },
    { name: 'Ámsterdam', coords: [52.3676, 4.9041], message: 'Paseando en bici al borde de los canales.' },
    { name: 'Tokio', coords: [35.6895, 139.6917], message: 'Nuestra aventura más increíble y exótica.' },
  ],
  '2025': [
    { name: 'Nueva York', coords: [40.7128, -74.0060], message: 'El viaje soñado de nuestras vidas.' },
    { name: 'Los Ángeles', coords: [34.0522, -118.2437], message: 'Hollywood, estrellas y mucha playa.' },
    { name: 'Hawái', coords: [19.8968, -155.5828], message: 'Relajación total en el paraíso.' },
  ],
  '2026': [
    { name: 'Seúl', coords: [37.5665, 126.9780], message: 'Disfrutando de la tecnología y la tradición.' },
    { name: 'Kioto', coords: [35.0116, 135.7681], message: 'Templos preciosos y paz mental.' },
    { name: 'El Futuro...', coords: [0, 0], message: '¿Cuál será nuestro próximo gran destino? ¡Solo el tiempo lo dirá!' },
  ]
};

const milestones = [
  { year: 'Año 1', title: 'Donde empezó todo', desc: 'Nuestra primera cita, los primeros mensajes y el primer "Te amo". Descubriendo el mundo el uno del otro.' },
  { year: 'Año 2', title: 'Aventuras juntos', desc: 'Nuestros primeros viajes largos. Aprendimos a convivir y a ser un verdadero equipo ante cualquier resto.' },
  { year: 'Año 3', title: 'Creciendo', desc: 'Nuevos trabajos, nuevas metas. Apoyándonos en todo momento para ser nuestras mejores versiones.' },
  { year: 'Año 4', title: 'Hogar', desc: 'Compartiendo más que tiempo, compartiendo una vida. Las pequeñas rutinas que hacen de cada día algo especial.' },
  { year: 'Año 5', title: 'El presente brillante', desc: 'Celebrando nuestro quinto aniversario con el corazón lleno de recuerdos y mirando hacia un futuro juntos.' }
];

export default function Roadmap() {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const [activeYear, setActiveYear] = useState('2021');

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = L.map(mapContainerRef.current, {
      zoomControl: false
    }).setView([40.4168, -3.7038], 5);
    
    L.control.zoom({ position: 'bottomright' }).addTo(map);
    
    // Using a dark themed map for the Zen aesthetic
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
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
      const markerIcon = isLastPointOf2026 ? questionIcon : customPinkIcon;

      const marker = L.marker(ubicacion.coords, { icon: markerIcon });
      
      const popupContent = `
        <div class="text-center font-sans p-1">
          <h3 class="font-bold text-lg text-rose-600 mb-1 leading-tight">${ubicacion.name}</h3>
          <p class="text-gray-700 text-sm m-0 leading-snug">${ubicacion.message}</p>
        </div>
      `;
      
      marker.bindPopup(popupContent, {
        closeButton: true,
        className: 'custom-popup rounded-xl overflow-hidden shadow-lg',
      });
      
      marker.addTo(layerGroup);
    });

    if (coordsArray.length > 1) {
      const polyline = L.polyline(coordsArray, {
        color: '#0ea5e9',
        weight: 4,
        dashArray: '8, 8',
        opacity: 0.8,
        lineCap: 'round',
        lineJoin: 'round'
      });
      polyline.addTo(layerGroup);
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
      className="max-w-4xl mx-auto py-20 px-4 mt-8 flex flex-col gap-24 font-serif"
    >
      <section>
        <h2 className="text-5xl md:text-7xl font-script text-center text-spring-secondary mb-20 drop-shadow-sm">Nuestra Historia</h2>
        
        <div className="relative border-l border-spring-primary/20 ml-2 md:ml-12 space-y-12 md:space-y-16">
          {milestones.map((m, i) => (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.1, duration: 0.8 }}
              key={i} 
              className="mb-10 ml-6 md:ml-16 relative"
            >
              <div className="absolute w-3 h-3 md:w-4 md:h-4 bg-spring-primary rounded-full -left-[30px] md:-left-[73px] top-2 shadow-[0_4px_10px_rgba(255,139,167,0.4)]"></div>
              
              <div className="glass p-1 rounded-[1.5rem] md:rounded-[2rem] overflow-hidden flex flex-col md:flex-row gap-4 items-stretch group hover:border-spring-primary/20 transition-all duration-500">
                <div className="p-6 md:p-10 flex-1 flex flex-col justify-center">
                  <span className="inline-block px-3 py-0.5 md:px-4 md:py-1 bg-spring-primary/10 text-spring-primary text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase rounded-full mb-4 md:mb-6 w-max border border-spring-primary/20">
                    {m.year}
                  </span>
                  <h3 className="text-2xl md:text-3xl font-bold text-spring-text mt-1 mb-3 md:mb-4 group-hover:text-spring-primary transition-colors duration-500">{m.title}</h3>
                  <p className="text-spring-text-muted text-base md:text-lg leading-relaxed">{m.desc}</p>
                </div>
                <div className="w-full md:w-[220px] lg:w-[320px] h-48 md:h-auto shrink-0 relative bg-spring-bg overflow-hidden rounded-xl md:rounded-2xl flex items-center justify-center border border-spring-primary/10">
                  <video
                    src={`https://raw.githubusercontent.com/Danicabezas33/GiftApp2/main/public/videos/year${i + 1}.mp4`}
                    autoPlay loop muted playsInline
                    className="absolute inset-0 w-full h-full object-cover z-10 opacity-80 group-hover:opacity-100 transition-opacity duration-1000"
                    onError={(e) => {
                      (e.target as HTMLVideoElement).style.opacity = '0';
                    }}
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center text-spring-text-muted/30 z-0 text-sm font-medium">
                    <span>Recuerdo en video</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-5xl font-script text-center text-spring-secondary mb-12 drop-shadow-sm">Mapa de Viajes</h2>
        
        <div className="flex flex-col lg:flex-row gap-8 glass p-6 rounded-[2.5rem]">
          {/* Selectores de año */}
          <div className="w-full lg:w-48 flex flex-row lg:flex-col gap-3 overflow-x-auto pb-4 lg:pb-0 scrollbar-hide">
            {Object.keys(routesByYear).map(year => (
              <button
                key={year}
                onClick={() => setActiveYear(year)}
                className={`
                  px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-500 flex-1 lg:flex-none whitespace-nowrap border
                  ${activeYear === year 
                    ? 'bg-spring-primary text-white border-spring-primary shadow-[0_4px_15px_rgba(255,139,167,0.4)]' 
                    : 'bg-spring-bg text-spring-text-muted hover:text-spring-text hover:bg-white border-spring-primary/10'}
                `}
              >
                {year}
              </button>
            ))}
          </div>

          {/* Mapa */}
          <div className="flex-1 h-[350px] md:h-[500px] rounded-[1.5rem] md:rounded-[2rem] overflow-hidden border border-spring-primary/20 relative z-0">
            <div ref={mapContainerRef} className="w-full h-full absolute inset-0 z-0"></div>
          </div>
        </div>
      </section>
    </motion.div>
  );
}

