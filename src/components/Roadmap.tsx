"use client"; // Añade esto en la línea 1

import { motion } from 'motion/react';
import { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Protegemos la configuración para que solo se ejecute en el navegador
if (typeof window !== 'undefined') {
  // @ts-ignore
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });
}

// El resto de tu código sigue igual...
// Create a custom pink pin icon
const customPinkIcon = L.divIcon({
  className: 'custom-pin',
  html: `<div style="background-color: #ff8ba7; width: 24px; height: 24px; border-radius: 50% 50% 50% 0; border: 2px solid white; transform: rotate(-45deg); box-shadow: 0 4px 10px rgba(255, 139, 167, 0.4);"></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 24],
  popupAnchor: [0, -26],
});

// Create a custom question mark icon for the mystery destination
const questionIcon = L.divIcon({
  className: 'custom-pin-question',
  html: `<div style="background-color: #D1495B; width: 32px; height: 32px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 15px rgba(209, 73, 91, 0.3); font-weight: bold; color: white; font-size: 20px;">?</div>`,
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

  const cargarYear = (year: string) => {
    if (!mapRef.current || !layerGroupRef.current) return;

    const map = mapRef.current;
    const layerGroup = layerGroupRef.current;

    layerGroup.clearLayers();

    const ubicaciones = routesByYear[year];
    if (!ubicaciones || ubicaciones.length === 0) return;

    const coordsArray: [number, number][] = [];

    ubicaciones.forEach((ubicacion, index) => {
      // Filter out [0,0] for mapping but keep it in data if needed
      if (ubicacion.coords[0] === 0 && ubicacion.coords[1] === 0) return;
      
      coordsArray.push(ubicacion.coords);

      const isLastPointOf2026 = year === '2026' && index === ubicaciones.length - 1;
      const markerIcon = isLastPointOf2026 ? questionIcon : customPinkIcon;

      const marker = L.marker(ubicacion.coords, { icon: markerIcon });
      
      const popupContent = `
        <div class="text-center font-sans p-1">
          <h3 class="font-bold text-lg text-[#D1495B] mb-1 leading-tight">${ubicacion.name}</h3>
          <p class="text-[#5F4B66]/80 text-sm m-0 leading-snug">${ubicacion.message}</p>
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
        color: '#FF8BA7',
        weight: 4,
        dashArray: '8, 8',
        opacity: 0.6,
        lineCap: 'round',
        lineJoin: 'round'
      });
      polyline.addTo(layerGroup);
    }

    if (coordsArray.length > 0) {
      const bounds = L.latLngBounds(coordsArray);
      map.flyToBounds(bounds, { padding: [50, 50], duration: 1.5 });
    }
    
    // Always call invalidateSize to ensure it's still correct after flying
    setTimeout(() => {
      if (mapRef.current) mapRef.current.invalidateSize();
    }, 1500);
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;
    
    // Verificar que estamos en el cliente (evita errores en pre-renderizado de Vercel)
    if (typeof window === 'undefined') return;

    // Ensure we don't double init
    if (mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      zoomControl: false
    }).setView([40.4168, -3.7038], 5);
    
    L.control.zoom({ position: 'bottomright' }).addTo(map);
    
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20
    }).addTo(map);

    layerGroupRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    // Forzar el re-cálculo del tamaño después de un breve delay
    // Esto es crítico si el mapa está dentro de animaciones o pestañas
    const timer = setTimeout(() => {
      if (mapRef.current) {
        mapRef.current.invalidateSize();
        cargarYear(activeYear);
      }
    }, 500);

    return () => {
      clearTimeout(timer);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (mapRef.current) {
      cargarYear(activeYear);
    }
  }, [activeYear]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-4xl mx-auto py-20 px-4 mt-8 flex flex-col gap-24 font-serif"
    >
      <section>
        <h2 className="text-5xl md:text-7xl font-script text-center text-[#D1495B] mb-20 drop-shadow-sm">Nuestra Historia</h2>
        
        <div className="relative border-l border-pink-100 ml-2 md:ml-12 space-y-12 md:space-y-16">
          {milestones.map((m, i) => (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.1, duration: 0.8 }}
              key={i} 
              className="mb-10 ml-6 md:ml-16 relative"
            >
              <div className="absolute w-3 h-3 md:w-4 md:h-4 bg-[#FF8BA7] rounded-full -left-[30px] md:-left-[73px] top-6 shadow-[0_4px_10px_rgba(255,139,167,0.4)]"></div>
              
              <div className="bg-white p-1 rounded-[1.5rem] md:rounded-[2rem] shadow-xl shadow-pink-100/50 overflow-hidden flex flex-col md:flex-row gap-4 items-stretch group border border-pink-50 hover:border-pink-200 transition-all duration-500">
                <div className="p-6 md:p-10 flex-1 flex flex-col justify-center">
                  <span className="inline-block px-3 py-0.5 md:px-4 md:py-1 bg-[#FF8BA7]/10 text-[#FF8BA7] text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase rounded-full mb-4 md:mb-6 w-max border border-[#FF8BA7]/20">
                    {m.year}
                  </span>
                  <h3 className="text-2xl md:text-3xl font-bold text-[#5F4B66] mt-1 mb-3 md:mb-4 group-hover:text-[#FF8BA7] transition-colors duration-500">{m.title}</h3>
                  <p className="text-pink-900/70 text-base md:text-lg leading-relaxed">{m.desc}</p>
                </div>
                <div className="w-full md:w-[220px] lg:w-[320px] h-48 md:h-auto shrink-0 relative bg-pink-50/50 overflow-hidden rounded-xl md:rounded-2xl flex items-center justify-center border border-pink-100/50">
                  <video
                    src={`https://raw.githubusercontent.com/Danicabezas33/GiftApp2/main/public/videos/year${i + 1}.mp4`}
                    autoPlay loop muted playsInline
                    className="absolute inset-0 w-full h-full object-cover z-10 opacity-80 group-hover:opacity-100 transition-opacity duration-1000"
                    onError={(e) => {
                      (e.target as HTMLVideoElement).style.opacity = '0';
                    }}
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center text-[#9D84A3]/50 z-0 text-sm font-medium">
                    <span>Recuerdo en video</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-5xl font-script text-center text-[#D1495B] mb-12 drop-shadow-sm">Mapa de Viajes</h2>
        
        <div className="flex flex-col lg:flex-row gap-8 bg-white shadow-xl shadow-pink-100/50 p-6 rounded-[2.5rem] border border-pink-50">
          <div className="w-full lg:w-48 flex flex-row lg:flex-col gap-3 overflow-x-auto pb-4 lg:pb-0 scrollbar-hide">
            {Object.keys(routesByYear).map(year => (
              <button
                key={year}
                onClick={() => setActiveYear(year)}
                className={`
                  px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-500 flex-1 lg:flex-none whitespace-nowrap border
                  ${activeYear === year 
                    ? 'bg-[#FF8BA7] text-white border-[#FF8BA7] shadow-[0_4px_15px_rgba(255,139,167,0.4)]' 
                    : 'bg-pink-50/50 text-[#9D84A3] hover:text-[#5F4B66] hover:bg-pink-50 border-pink-50'}
                `}
              >
                {year}
              </button>
            ))}
          </div>

          <div className="flex-1 h-[350px] md:h-[500px] rounded-[1.5rem] md:rounded-[2rem] overflow-hidden border border-pink-100 relative shadow-inner bg-pink-50/20">
            <div ref={mapContainerRef} className="absolute inset-0 w-full h-full z-0"></div>
          </div>
        </div>
      </section>
    </motion.div>
  );
}

export default Roadmap;
