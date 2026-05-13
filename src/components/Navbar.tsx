import { Heart, Map, Image as ImageIcon, Gift, Gamepad2 } from 'lucide-react';

interface NavbarProps {
  currentSection: string;
  setCurrentSection: (section: string) => void;
}

export function Navbar({ currentSection, setCurrentSection }: NavbarProps) {
  const tabs = [
    { id: 'home', label: 'Inicio', icon: Heart },
    { id: 'roadmap', label: '1 al 5', icon: Map },
    { id: 'memories', label: 'Memorias', icon: ImageIcon },
    { id: 'games', label: 'Juegos', icon: Gamepad2 },
  ];

  return (
    <nav className="fixed top-0 left-0 w-full bg-white/80 backdrop-blur-md shadow-sm z-50 border-b border-rose-100/50">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="text-3xl font-script font-bold text-rose-600 drop-shadow-sm cursor-pointer" onClick={() => setCurrentSection('home')}>
          5 Años ❤️
        </div>
        <div className="hidden md:flex space-x-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCurrentSection(tab.id)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                currentSection === tab.id
                  ? 'bg-rose-100/80 text-rose-700 shadow-sm'
                  : 'text-gray-600 hover:bg-rose-50 hover:text-rose-500'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
        <div className="flex md:hidden space-x-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCurrentSection(tab.id)}
              className={`p-2 rounded-full transition-colors ${
                currentSection === tab.id
                  ? 'bg-rose-100 text-rose-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <tab.icon className="w-5 h-5" />
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
