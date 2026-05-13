/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { AnimatePresence } from 'motion/react';
import { Navbar } from './components/Navbar';
import { Home } from './components/Home';
import { Roadmap } from './components/Roadmap';
import { Memories } from './components/Memories';
import { Games } from './components/Games';
import { MusicPlayer } from './components/MusicPlayer';

export default function App() {
  const [currentSection, setCurrentSection] = useState('games');
  const [unlockedWeb, setUnlockedWeb] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    
    // Check reset flag
    if (params.has('reset')) {
      localStorage.removeItem('giftLevel_v3');
      window.location.href = window.location.pathname;
    }

    const storedLevel = parseInt(localStorage.getItem('giftLevel_v3') || '1', 10);
    
    if (storedLevel > 1) {
      setUnlockedWeb(true);
      if (params.has('unlock')) {
        setCurrentSection('games');
      } else {
        setCurrentSection('home');
      }
    } else {
      setCurrentSection('games');
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-rose-100 selection:bg-rose-200">
      {unlockedWeb && <Navbar currentSection={currentSection} setCurrentSection={setCurrentSection} />}
      
      <main className={`pb-24 ${unlockedWeb ? 'pt-16' : 'pt-4 md:pt-8'} flex min-h-screen flex-col items-center justify-center`}>
        <AnimatePresence mode="wait">
          {unlockedWeb && currentSection === 'home' && <Home key="home" />}
          {unlockedWeb && currentSection === 'roadmap' && <Roadmap key="roadmap" />}
          {unlockedWeb && currentSection === 'memories' && <Memories key="memories" />}
          {currentSection === 'games' && <Games key="games" onUnlockWeb={() => setUnlockedWeb(true)} />}
        </AnimatePresence>
      </main>

      {unlockedWeb && <MusicPlayer />}
    </div>
  );
}
