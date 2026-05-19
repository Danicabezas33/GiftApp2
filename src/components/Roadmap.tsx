import { motion } from 'motion/react';
import { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Create a custom pink pin icon
const customPinkIcon = L.divIcon({
  className: 'custom-pin',
  html: `<div style="background-color: #f43f5e; width: 24px; height: 24px; border-radius: 50% 50% 50% 0; border: 3px solid white; transform: rotate(-45deg); box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);"></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 24],
  popupAnchor: [0, -26],
});

// Create a custom question mark icon for the mystery destination
const questionIcon = L.divIcon({
  className: 'custom-pin-question',
  html: `<div style="background-color: #0ea5e9; width: 32px; height: 32px; border-radius: 50%; border: 3px solid white; display: flex; items-center; justify-center; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); font-weight: bold; color: white; font-size: 20px;">?</div>`,
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

export function Roadmap() {
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

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20
    }).addTo(map);

    layerGroupRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

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

    const bounds = L.latLngBounds(coordsArray);
    map.flyToBounds(bounds, { padding: [50, 50], duration: 1.5 });
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-4xl mx-auto py-20 px-4 mt-8 flex flex-col gap-20"
    >
      <section>
        <h2 className="text-5xl font-script text-center text-rose-600 mb-16 drop-shadow-sm">Nuestra Historia</h2>
        
        <div className="relative border-l-4 border-rose-300/50 ml-4 md:ml-12 md:space-y-16">
          {milestones.map((m, i) => (
            <motion.div 
              initial={{ opacity: 0, x: -30, y: 20 }}
              whileInView={{ opacity: 1, x: 0, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: i * 0.1, duration: 0.6, ease: "easeOut" }}
              key={i} 
              className="mb-14 ml-8 md:ml-16 relative"
            >
              <div className="absolute w-8 h-8 bg-gradient-to-br from-rose-400 to-pink-500 rounded-full -left-[42px] md:-left-[76px] top-1 border-4 border-white shadow-lg flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm p-3 rounded-3xl shadow-lg border border-white/60 hover:shadow-xl transition-shadow group flex flex-col md:flex-row gap-4 items-stretch">
                <div className="p-5 md:p-6 flex-1 flex flex-col justify-center">
                  <span className="inline-block px-4 py-1.5 bg-rose-100 text-rose-600 text-sm font-bold tracking-widest uppercase rounded-full mb-4 shadow-sm w-max">
                    {m.year}
                  </span>
                  <h3 className="text-2xl font-serif font-bold text-gray-800 mt-1 mb-3 group-hover:text-rose-500 transition-colors">{m.title}</h3>
                  <p className="text-gray-600 text-lg leading-relaxed">{m.desc}</p>
                </div>
                <div className="md:w-[220px] lg:w-[280px] min-h-[220px] shrink-0 relative bg-rose-50/50 overflow-hidden rounded-2xl flex items-center justify-center border border-rose-100/50">
                  <video
                    src={`https://raw.githubusercontent.com/Danicabezas33/GiftApp2/main/public/videos/year${i + 1}.mp4`}
                    autoPlay loop muted playsInline
                    className="absolute inset-0 w-full h-full object-cover z-10"
                    onError={(e) => {
                      (e.target as HTMLVideoElement).style.opacity = '0';
                    }}
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center text-rose-400/60 z-0 text-sm font-medium">
                    <span>No hay vídeo</span>
                    <span className="text-[10px] mt-1 hidden group-hover:block transition-all">Sube /videos/year{i + 1}.mp4</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-5xl font-script text-center text-rose-600 mb-8 drop-shadow-sm">Mapa de Viajes</h2>
        
        <div className="flex flex-col lg:flex-row gap-6 bg-white/60 backdrop-blur-md p-4 md:p-6 rounded-3xl shadow-xl border border-white/80">
          {/* Selectores de año */}
          <div className="w-full lg:w-48 flex flex-row lg:flex-col gap-3 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
            {Object.keys(routesByYear).map(year => (
              <button
                key={year}
                onClick={() => setActiveYear(year)}
                className={`
                  px-6 py-4 rounded-2xl font-bold text-lg transition-all shadow-sm flex-1 lg:flex-none whitespace-nowrap
                  ${activeYear === year 
                    ? 'bg-gradient-to-r from-rose-500 to-rose-400 text-white shadow-rose-200 shadow-lg transform lg:-translate-y-1' 
                    : 'bg-white text-gray-600 hover:bg-rose-50 hover:text-rose-500 border border-gray-100'}
                `}
              >
                {year}
              </button>
            ))}
          </div>

          {/* Mapa */}
          <div className="flex-1 min-h-[500px] rounded-2xl overflow-hidden border-4 border-white shadow-inner relative z-0">
            <div ref={mapContainerRef} className="w-full h-full min-h-[400px] absolute inset-0 z-0"></div>
          </div>
        </div>
      </section>
    </motion.div>
  );
}

