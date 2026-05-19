/**
 * Configuración del Repositorio de GitHub
 * SUSTITUYE ESTOS VALORES POR TUS CARACTERÍSTICAS
 */
const GITHUB_USER = 'TU_USUARIO';
const GITHUB_REPO = 'TU_REPOSITORIO';

// Referencias principales al DOM
const galleryContainer = document.getElementById('gallery-container');
const tabsContainer = document.getElementById('tabs-container');

// Años disponibles tal cual están mapeados en las carpetas de Github
const years = ['ano1', 'ano2', 'ano3', 'ano4', 'ano5'];
let currentYear = 'ano1'; // Año activo por defecto

/**
 * Función de inicialización
 */
function initGallery() {
  renderTabs();
  fetchGalleryImages(currentYear);
}

/**
 * 1. UI: Renderizado del Selector de Pestañas (Tabs)
 */
function renderTabs() {
  tabsContainer.innerHTML = ''; // Limpiamos el contenedor
  
  years.forEach((year, index) => {
    const btn = document.createElement('button');
    btn.textContent = `Año ${index + 1}`;
    // Clases base y estilos activos/inactivos de Tailwind
    btn.className = `px-5 py-2 font-semibold rounded-lg transition-all duration-300 ${
      year === currentYear 
        ? 'bg-blue-600 text-white shadow-md transform scale-105' 
        : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100 hover:text-blue-500 shadow-sm'
    }`;
    
    btn.addEventListener('click', () => {
      // Evitar recargar si hacemos click en la misma pestaña
      if (currentYear !== year) {
        currentYear = year;
        renderTabs(); // Repintar botones para reflejar estado 'activo'
        fetchGalleryImages(year); // Lanzar fetch del año seleccionado
      }
    });
    
    tabsContainer.appendChild(btn);
  });
}

/**
 * 2. Lógica JavaScript: Consumo de la API de GitHub
 * @param {string} year - El año a cargar (ej: 'ano1')
 */
async function fetchGalleryImages(year) {
  // Mostrar Skeleton/Spinner antes de la petición
  showLoadingState();

  try {
    // 2.a Construcción de la URL de la API iterando sobre la ruta solicitada
    const url = `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/contents/public/gallery/${year}`;
    
    const response = await fetch(url);
    
    // Si la carpeta no existe (404), lanzamos error capturable
    if (!response.ok) {
      if (response.status === 404) {
         throw new Error(`La carpeta /public/gallery/${year} no existe en el repositorio.`);
      }
      throw new Error(`Error en la petición: ${response.statusText}`);
    }

    const data = await response.json();

    // 2.b Filtro de seguridad restrictivo (solo archivos e imágenes)
    const validExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
    const imageFiles = data.filter(file => {
      // Asegurarse de que el registro es un archivo y no un directorio
      if (file.type !== 'file') return false;
      
      const fileName = file.name.toLowerCase();
      // Validar coincidencia de extensión e ignorar ocultos tipo .DS_Store
      const hasValidExt = validExtensions.some(ext => fileName.endsWith(ext));
      const notHidden = !fileName.startsWith('.');
      
      return hasValidExt && notHidden;
    });

    // 3. Renderizado de las tarjetas de imagen
    renderImages(imageFiles);

  } catch (error) {
    console.error('API Error:', error);
    showErrorState(error.message);
  }
}

/**
 * 3. Componentes visuales auxiliares: Spinner
 */
function showLoadingState() {
  galleryContainer.innerHTML = `
    <div class="col-span-full flex flex-col items-center justify-center py-20 text-gray-400">
      <svg class="animate-spin h-10 w-10 text-blue-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <p class="animate-pulse font-medium">Buscando imágenes en GitHub...</p>
    </div>
  `;
}

/**
 * 3. Componentes visuales auxiliares: Inyector de Imágenes
 * Utilizamos 'download_url' del JSON repuesta de Github
 */
function renderImages(images) {
  galleryContainer.innerHTML = '';

  if (images.length === 0) {
    galleryContainer.innerHTML = `
      <div class="col-span-full py-16 text-center text-gray-500 bg-white rounded-xl shadow-sm border border-gray-200">
        No se encontraron imágenes válidas en esta carpeta.
      </div>
    `;
    return;
  }

  images.forEach(image => {
    // Tarjeta contenedora de la foto
    const card = document.createElement('div');
    card.className = 'group relative rounded-xl overflow-hidden shadow-sm border border-gray-200 aspect-[4/3] bg-gray-100 cursor-pointer';
    
    // Etiqueta img con download_url directo como SRC
    const imgEl = document.createElement('img');
    imgEl.src = image.download_url; 
    imgEl.alt = image.name;
    imgEl.className = 'w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-110';
    
    // Fallback nativo: Si la imagen falla en descargar
    imgEl.onerror = () => {
      imgEl.src = 'https://via.placeholder.com/400x300?text=Error+Cargando';
    };

    // Overlay (gradiente con el nombre de la imagen al hacer hover, opcional pero elegante)
    const overlay = document.createElement('div');
    overlay.className = 'absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4';
    
    const title = document.createElement('span');
    title.className = 'text-white text-xs font-medium truncate drop-shadow-md';
    title.textContent = image.name;
    
    overlay.appendChild(title);
    card.appendChild(imgEl);
    card.appendChild(overlay);
    
    galleryContainer.appendChild(card);
  });
}

/**
 * 3. Componentes visuales auxiliares: Manejo de Errores UI
 */
function showErrorState(message) {
  galleryContainer.innerHTML = `
    <div class="col-span-full py-12 px-6 text-center bg-red-50 text-red-600 rounded-xl border border-red-200">
      <p class="font-bold mb-2">Ops, algo salió mal</p>
      <p class="text-sm opacity-90">${message}</p>
      <p class="text-sm mt-4 text-gray-600">Comprueba que el repositorio es público y que has configurado los placeholders <strong>GITHUB_USER</strong> y <strong>GITHUB_REPO</strong> correctamente en galeria.js</p>
    </div>
  `;
}

// Iniciar aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', initGallery);
