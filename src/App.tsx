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
      import('./firebaseHelper').then(({ syncGlobalUnlockedLevels }) => {
         syncGlobalUnlockedLevels([]);
         window.location.href = window.location.pathname;
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
  }, []);

  if (scannerId !== null && !isNaN(scannerId)) {
    return <MobileScanner id={scannerId} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-rose-100 selection:bg-rose-200">
      {unlockedWeb && <Navbar currentSection={currentSection} setCurrentSection={setCurrentSection} />}
      
      <main className={`pb-24 ${unlockedWeb ? 'pt-16' : 'pt-4 md:pt-8'} flex min-h-screen flex-col items-center justify-center`}>
        <AnimatePresence mode="wait">
          {unlockedWeb && currentSection === 'home' && <Home key="home" />}
          {unlockedWeb && currentSection === 'roadmap' && <Roadmap key="roadmap" />}
          {unlockedWeb && currentSection === 'memories' && <Memories key="memories" />}
          {currentSection === 'games' && <Games key="games" onUnlockWeb={handleUnlockWeb} onNavigateHome={handleNavigateHome} />}
        </AnimatePresence>
      </main>

      {unlockedWeb && <MusicPlayer />}
    </div>
  );
}
