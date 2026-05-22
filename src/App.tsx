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
    <div className="relative min-h-screen text-[#4A3B52] selection:bg-[#FFAFCC]/30 selection:text-[#4A3B52]">
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 bg-transparent">
        {/* Fondo */}
        <div 
          className="absolute inset-0 opacity-100 bg-cover bg-center transition-all duration-1000"
          style={{ 
            backgroundImage: `url(${bgUrl})`
          }}
        />
        
        {/* Destellos de color / orbes */}
        <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-[radial-gradient(circle,rgba(255,200,221,0.7)_0%,transparent_70%)] mix-blend-multiply" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-[radial-gradient(circle,rgba(205,180,219,0.5)_0%,transparent_70%)] mix-blend-multiply" />
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