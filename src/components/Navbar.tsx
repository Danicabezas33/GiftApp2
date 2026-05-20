import { motion } from 'motion/react';
import { Heart, Map, ImageIcon, Gift, Gamepad2, Images } from 'lucide-react';

interface NavbarProps {
  currentSection: string;
  setCurrentSection: (section: string) => void;
}

export function Navbar({ currentSection, setCurrentSection }: NavbarProps) {
  const tabs = [
    { id: 'home', label: 'Inicio', icon: Heart },
    { id: 'roadmap', label: 'Nuestra Historia', icon: Map },
    { id: 'memories', label: 'Memorias', icon: ImageIcon },
    { id: 'gallery', label: 'Galería', icon: Images },
    { id: 'games', label: 'Regalos', icon: Gamepad2 },
  ];

  return (
    <nav className="fixed top-0 left-0 w-full bg-white/80 backdrop-blur-xl z-50 border-b border-[#FFC8DD]/50 shadow-sm shadow-[#FFC8DD]/30">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="text-xl md:text-2xl font-script font-bold text-[#4A3B52] drop-shadow-sm cursor-pointer" onClick={() => setCurrentSection('home')}>
          ¡Felices 5 Años mi niña!
        </div>
        <div className="hidden md:flex space-x-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCurrentSection(tab.id)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-500 flex items-center gap-2 relative group ${
                currentSection === tab.id
                  ? 'text-[#4A3B52]'
                  : 'text-[#CDB4DB] hover:text-[#4A3B52]'
              }`}
            >
              {currentSection === tab.id && (
                <motion.div
                  layoutId="navGlow"
                  className="absolute inset-0 bg-[#FFAFCC]/10 rounded-full blur-sm -z-10"
                />
              )}
              <tab.icon className={`w-4 h-4 transition-transform duration-500 ${currentSection === tab.id ? 'scale-110' : 'group-hover:scale-110'}`} />
              {tab.label}
              {currentSection === tab.id && (
                <motion.div 
                  layoutId="activeTabIndicator"
                  className="absolute bottom-[-16px] left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#FFAFCC] rounded-full shadow-[0_0_8px_rgba(255,139,167,0.8)]"
                />
              )}
            </button>
          ))}
        </div>
        <div className="flex md:hidden space-x-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCurrentSection(tab.id)}
              className={`p-3 rounded-full transition-all duration-300 relative ${
                currentSection === tab.id
                  ? 'text-[#4A3B52] bg-[#FFF0F5]'
                  : 'text-[#CDB4DB] hover:text-[#4A3B52] hover:bg-slate-50'
              }`}
            >
              <tab.icon className={`w-5 h-5 ${currentSection === tab.id ? 'scale-110' : ''}`} />
              {currentSection === tab.id && (
                <motion.div 
                  layoutId="activeTabIndicatorMob"
                  className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#FFAFCC] rounded-full"
                />
              )}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
 