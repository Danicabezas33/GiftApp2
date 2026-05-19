/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence } from 'motion/react';
import { Navbar } from './components/Navbar';
import { Home } from './components/Home';
import { Roadmap } from './components/Roadmap';
import { Memories } from './components/Memories';
import { Gallery } from './components/Gallery';
import { Games } from './components/Games';
import { MusicPlayer } from './components/MusicPlayer';
import { MobileScanner } from './components/MobileScanner';

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
      return; // Skip normal app loading for mobile
    }

    // Check reset flag
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

    // Check if web is generally unlocked (from localstorage)
    const storedWebUnlocked = localStorage.getItem('web_unlocked_v4') === 'true';
    if (storedWebUnlocked) {
      setUnlockedWeb(true);
      if (!params.has('section')) {
         setCurrentSection('home');
      }
    } else {
      setCurrentSection('games');
    }

    // Sync unlocked levels to firebase on mount just in case
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
    <div className="min-h-screen bg-zen-bg text-white selection:bg-petal-pink selection:text-zen-bg selection:bg-opacity-50">
      {unlockedWeb && <Navbar currentSection={currentSection} setCurrentSection={setCurrentSection} />}
      
      <main className={`pb-24 ${unlockedWeb ? 'pt-16' : 'pt-4 md:pt-8'} flex min-h-screen flex-col items-center justify-center relative overflow-hidden`}>
        {/* Global background glow dots */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
          <div className="absolute top-[10%] left-[10%] w-[40%] h-[40%] bg-petal-pink/10 blur-[120px] rounded-full" />
          <div className="absolute bottom-[10%] right-[10%] w-[40%] h-[40%] bg-zen-lavender/10 blur-[120px] rounded-full" />
        </div>
        <AnimatePresence mode="wait">
          {unlockedWeb && currentSection === 'home' && <Home key="home" />}
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
