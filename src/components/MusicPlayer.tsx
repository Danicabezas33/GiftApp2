import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Volume1, SkipBack, SkipForward, Music } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [showVolume, setShowVolume] = useState(false);
  const [playlist, setPlaylist] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Fetch playlist
    fetch('/api/music')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setPlaylist(data);
        }
      })
      .catch(err => console.error("Error fetching music:", err));
  }, []);

  useEffect(() => {
    if (playlist.length > 0) {
      const wasPlaying = isPlaying;
      if (audioRef.current) {
        audioRef.current.pause();
      }
      
      const newAudio = new Audio(`/music/${playlist[currentIndex]}`);
      newAudio.volume = volume;
      newAudio.onended = () => handleNext();
      audioRef.current = newAudio;

      if (wasPlaying) {
        newAudio.play().catch(e => {
          console.log("Play failed:", e);
          setIsPlaying(false);
        });
      }
    }
  }, [currentIndex, playlist]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

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
      alert("Aún no has agregado la música 🥺. Sube tus canciones a /public/music/.");
      return;
    }

    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      audioRef.current?.play()
        .then(() => setIsPlaying(true))
        .catch(e => {
          console.log("Audio play failed:", e);
        });
    }
  };

  const cleanupTrackName = (name: string) => {
    return name.replace(/\.[^/.]+$/, "").replace(/_/g, " ");
  };

  const VolumeIcon = volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

  return (
    <div 
      className="fixed bottom-6 right-6 flex flex-col items-end gap-2 z-[100]"
      onMouseEnter={() => setShowVolume(true)}
      onMouseLeave={() => setShowVolume(false)}
    >
      <AnimatePresence>
        {(showVolume || isPlaying) && playlist.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="bg-white/80 backdrop-blur-md px-4 py-2 rounded-2xl shadow-lg border border-rose-100 mb-1 max-w-[200px] overflow-hidden"
          >
            <div className="flex items-center gap-2 overflow-hidden whitespace-nowrap">
              <Music className="w-4 h-4 text-rose-500 shrink-0 z-10 bg-white/80" />
              <div className="overflow-hidden flex-1 relative flex">
                <p className="text-xs font-medium text-gray-600 animate-marquee pr-4">
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
              className="bg-white/90 backdrop-blur-md rounded-full shadow-lg p-3 px-4 flex items-center gap-2 border border-rose-100"
            >
              <input 
                type="range" 
                min="0" max="1" step="0.01" 
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-24 accent-rose-500 cursor-pointer"
              />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="bg-white/90 backdrop-blur-md rounded-full shadow-xl p-2 flex items-center gap-1 border border-rose-100 transition-all hover:shadow-rose-200/50 hover:shadow-2xl">
          <button 
            onClick={() => {
              if(volume > 0) setVolume(0);
              else setVolume(0.5);
            }}
            className="w-8 h-8 rounded-full flex items-center justify-center text-rose-500 hover:bg-rose-50 transition-colors"
          >
            <VolumeIcon className="w-4 h-4" />
          </button>
          
          <div className="w-px h-6 bg-rose-200 mx-1"></div>

          <div className="flex items-center gap-1 px-1">
            <button 
              onClick={handlePrev}
              className="w-8 h-8 rounded-full flex items-center justify-center text-rose-400 hover:bg-rose-50 hover:text-rose-600 transition-all"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            <button 
              onClick={togglePlay}
              className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 cursor-pointer text-white w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-md transform hover:scale-105"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
            </button>

            <button 
              onClick={handleNext}
              className="w-8 h-8 rounded-full flex items-center justify-center text-rose-400 hover:bg-rose-50 hover:text-rose-600 transition-all"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
