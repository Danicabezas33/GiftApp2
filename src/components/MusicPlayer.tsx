import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Volume1, SkipBack, SkipForward, Music } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Helper to shuffle an array using Fisher-Yates algorithm
const shuffleArray = (array: string[]) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [showVolume, setShowVolume] = useState(false);
  const [playlist, setPlaylist] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Fetch playlist from github as fallback because Vercel doesn't run the backend
    fetch('https://api.github.com/repos/Danicabezas33/GiftApp2/contents/public/music')
      .then(res => {
        if (!res.ok) throw new Error("GitHub API error");
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          const musicFiles = data
            .filter((f: any) => f.type === 'file' && f.name.endsWith('.mp3'))
            .map((f: any) => f.name); // only keep filenames
          if (musicFiles.length > 0) {
            setPlaylist(shuffleArray(musicFiles));
          }
        }
      })
      .catch(err => {
         console.error("Error fetching music from Github:", err);
         // Fallback to try local API just in case (for local dev)
         fetch('/api/music')
            .then(res => {
               if (!res.ok) throw new Error("Fallback API error");
               return res.json();
            })
            .then(apiData => {
               if (Array.isArray(apiData) && apiData.length > 0) {
                  setPlaylist(shuffleArray(apiData));
               } else {
                  throw new Error("Empty API output");
               }
            })
            .catch(e => {
                console.error("Error fetching music from API too:", e);
                // Final fallback using hardcoded files from your screenshot
                setPlaylist(shuffleArray([
                    "Alejo - TÍRAME.mp3",
                    "Alejo - WIKIWIKI.mp3",
                    "Alvaro Díaz - EN PR NO HACE FRÍO.mp3",
                    "Alvaro Díaz - QUIZÁS SI QUIZÁS NO.mp3",
                    "track.mp3"
                ]));
            });
      });
  }, []);

  useEffect(() => {
    if (playlist.length > 0 && audioRef.current) {
      const audio = audioRef.current;
      const wasPlaying = isPlaying;
      
      // We don't change the src if it's already the same song
      const newSrc = `https://raw.githubusercontent.com/Danicabezas33/GiftApp2/main/public/music/${encodeURIComponent(playlist[currentIndex])}`;
      if (audio.src.includes(encodeURIComponent(playlist[currentIndex]))) return;

      audio.src = newSrc;
      audio.load();
      
      if (wasPlaying) {
        audio.play().catch(e => {
          console.log("Auto-play failed:", e);
          setIsPlaying(false);
        });
      }
    }
  }, [currentIndex, playlist]);

  const handleNext = () => {
    if (playlist.length > 0) {
      setCurrentIndex((prev) => (prev + 1) % playlist.length);
    }
  };

  const handlePrev = () => {
    if (playlist.length > 0) {
      setCurrentIndex((prev) => (prev - 1 + playlist.length) % playlist.length);
    }
  };

  const togglePlay = () => {
    if (playlist.length === 0) {
      alert("Aún no se ha cargado la música. Asegúrate de que las canciones estén en /public/music/.");
      return;
    }

    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(e => {
          console.log("Audio play failed:", e);
        });
    }
  };

  const cleanupTrackName = (name: string) => {
    return name.replace(/\.[^/.]+$/, "").replace(/_/g, " ");
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const VolumeIcon = volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

  return (
    <div 
      className="fixed bottom-4 right-4 md:bottom-8 md:right-8 flex flex-col items-end gap-3 z-[100]"
      onMouseEnter={() => setShowVolume(true)}
      onMouseLeave={() => setShowVolume(false)}
    >
      <audio 
        ref={audioRef}
        onEnded={handleNext}
        onVolumeChange={(e) => setVolume((e.target as HTMLAudioElement).volume)}
        preload="auto"
      />
      <AnimatePresence>
        {(showVolume || isPlaying) && playlist.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-lg border border-[#F49CBB]/30 mb-1 max-w-[180px] md:max-w-[220px] overflow-hidden"
          >
            <div className="flex items-center gap-3 overflow-hidden whitespace-nowrap">
              <Music className="w-4 h-4 text-[#DD2D4A] shrink-0 animate-pulse" />
              <div className="overflow-hidden flex-1 relative flex">
                <p className="text-[10px] md:text-xs font-medium text-[#880D1E]/80 animate-marquee pr-4 tracking-wider uppercase">
                  {cleanupTrackName(playlist[currentIndex])}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-2">
        <AnimatePresence>
          {showVolume && (
            <motion.div 
              initial={{ opacity: 0, x: 20, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 10, scale: 0.9 }}
              className="bg-white/90 backdrop-blur-md rounded-full shadow-lg p-3 px-5 flex items-center gap-3 border border-[#F49CBB]/30"
            >
              <input 
                type="range" 
                min="0" max="1" step="0.01" 
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-20 md:w-28 accent-[#DD2D4A] cursor-pointer opacity-80"
              />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="bg-white/95 backdrop-blur-md rounded-full shadow-[0_4px_15px_rgba(221,45,74,0.15)] p-2 md:p-2.5 flex items-center gap-1 border border-[#F49CBB]/30 transition-all duration-500 hover:border-[#F49CBB]">
          <button 
            onClick={() => {
              if(volume > 0) setVolume(0);
              else setVolume(0.5);
            }}
            className="w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center text-[#880D1E]/70 hover:text-[#DD2D4A] hover:bg-[#F49CBB]/20 transition-all"
          >
            <VolumeIcon className="w-4 h-4 md:w-5 md:h-5" />
          </button>
          
          <div className="w-px h-5 md:h-6 bg-[#F49CBB] mx-1"></div>

          <div className="flex items-center gap-1 px-1">
            <button 
              onClick={handlePrev}
              className="w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center text-[#880D1E]/70 hover:text-[#880D1E] hover:bg-[#F49CBB]/20 transition-all"
            >
              <SkipBack className="w-4 h-4 md:w-5 md:h-5" />
            </button>
 
            <button 
              onClick={togglePlay}
              className="bg-[#DD2D4A] text-white w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all duration-500 shadow-[0_4px_15px_rgba(221,45,74,0.4)] hover:scale-105 active:scale-95 hover:bg-[#ff99b3]"
            >
              {isPlaying ? <Pause className="w-5 h-5 md:w-6 md:h-6" fill="currentColor" /> : <Play className="w-5 h-5 md:w-6 md:h-6 ml-1" fill="currentColor" />}
            </button>
 
            <button 
              onClick={handleNext}
              className="w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center text-[#880D1E]/70 hover:text-[#880D1E] hover:bg-[#F49CBB]/20 transition-all"
            >
              <SkipForward className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MusicPlayer;
