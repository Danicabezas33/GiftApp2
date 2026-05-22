import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence } from 'motion/react';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Roadmap from './components/Roadmap';
import Memories from './components/Memories';
import Gallery from './components/Gallery';
import Games from './components/Games';
import MusicPlayer from './components/MusicPlayer';
import MobileScanner from './components/MobileScanner';
import bgUrl from '../public/home/bg.jpg';

export default function App() {
  const [currentSection, setCurrentSection] = useState('games');
  const [unlockedWeb, setUnlockedWeb] = useState(false);
  const [scannerId, setScannerId] = useState<number | null>(null);

  const handleUnlockWeb = useCallback(() => {
    setUnlockedWeb(true);
    localStorage.setItem('web_unlocked_v4', 'true');
  }, []);

  const handleNavigateHome = useCallback(() => {
    setCurrentSection('home');
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    
    const scannerUnlock = params.get('scanner_unlock');
    if (scannerUnlock) {
      setScannerId(parseInt(scannerUnlock, 10));
      return; 
    }

    if (params.has('reset')) {
      localStorage.removeItem('unlocked_levels_v4');
      localStorage.removeItem('web_unlocked_v4');
      import('./firebaseHelper').then(({ syncGlobalUnlockedLevels, clearLatestUnlock }) => {
         Promise.all([
           syncGlobalUnlockedLevels([]),
           clearLatestUnlock()
         ]).then(() => {
           window.location.search = '';
         }).catch(err => {
           console.error("Reset error", err);
           window.location.search = '';
         });
      });
      return;
    }

    const storedWebUnlocked = localStorage.getItem('web_unlocked_v4') === 'true';
    if (storedWebUnlocked) {
      setUnlockedWeb(true);
      if (!params.has('section')) {
         setCurrentSection('home');
      }
    } else {
      setCurrentSection('games');
    }

    const storedLevels = localStorage.getItem('unlocked_levels_v4');
    if (storedLevels) {
      import('./firebaseHelper').then(({ syncGlobalUnlockedLevels }) => {
         try {
           syncGlobalUnlockedLevels(JSON.parse(storedLevels));
         } catch (e) {
           console.error(e);
         }
      });
    }
  }, []);

  if (scannerId !== null && !isNaN(scannerId)) {
    return <MobileScanner id={scannerId} />;
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#CBEEF3]/20 to-[#F49CBB]/20 text-slate-700 selection:bg-[#F49CBB]/30 selection:text-[#880D1E]">
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {/* Fondo con desenfoque suave y transparencia */}
        <div 
          className="absolute inset-0 opacity-60 bg-cover bg-center transition-all duration-1000 scale-105"
          style={{ 
            backgroundImage: `url(${bgUrl})`
          }}
        />
        
        {/* Tinte muy suave para asegurar la paleta de colores */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#CBEEF3]/10 to-[#F49CBB]/10 mix-blend-color" />
        
        {/* Gradiente protector radial para suavizar bordes sin crear lineas en el centro */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,rgba(244,156,187,0.1)_100%)] opacity-50" />
        
        {/* Destellos de color / orbes sutiles */}
        <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-[radial-gradient(circle,rgba(244,156,187,0.4)_0%,transparent_70%)] mix-blend-multiply" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-[radial-gradient(circle,rgba(203,238,243,0.4)_0%,transparent_70%)] mix-blend-multiply" />
      </div>

      {unlockedWeb && <Navbar currentSection={currentSection} setCurrentSection={setCurrentSection} />}
      
      <main className={`pb-24 ${unlockedWeb ? 'pt-16' : 'pt-4 md:pt-8'} flex flex-col items-center justify-center relative z-10 overflow-hidden`}>
        <AnimatePresence mode="wait">
          {unlockedWeb && currentSection === 'home' && <Home key="home" onNavigate={setCurrentSection} />}
          {unlockedWeb && currentSection === 'roadmap' && <Roadmap key="roadmap" />}
          {unlockedWeb && currentSection === 'memories' && <Memories key="memories" />}
          {unlockedWeb && currentSection === 'gallery' && <Gallery key="gallery" />}
          {currentSection === 'games' && <Games key="games" onUnlockWeb={handleUnlockWeb} onNavigateHome={handleNavigateHome} />}
        </AnimatePresence>
      </main>

      {unlockedWeb && <MusicPlayer />}
    </div>
  );
}