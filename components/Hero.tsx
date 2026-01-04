import React, { useState } from 'react';
import { Dice5, Music, ScrollText, Sparkles } from 'lucide-react';
import { ViewState } from '../types';

interface HeroProps {
  currentView: ViewState;
  changeView: (view: ViewState) => void;
}

const Hero: React.FC<HeroProps> = ({ changeView }) => {
  const [avatarHue, setAvatarHue] = useState(0);

  const handleAvatarClick = () => {
    // Easter Egg: Change avatar color
    setAvatarHue((prev) => (prev + 45) % 360);
  };

  const tarotCards = [
    { 
      id: 'cook', 
      label: 'CUISINER', 
      icon: Dice5, 
      view: 'KITCHEN' as ViewState, 
      color: 'text-fuchsia-400', 
      borderColor: 'border-fuchsia-500',
      desc: 'Roll for Dinner' 
    },
    { 
      id: 'play', 
      label: 'INVENTAIRE', 
      icon: ScrollText, 
      view: 'INVENTORY' as ViewState, 
      color: 'text-green-400', 
      borderColor: 'border-green-500',
      desc: 'Quêtes & XP' 
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center space-y-8 py-8 animate-in fade-in duration-700">
      
      {/* Avatar Section */}
      <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
        <div className="absolute -inset-1 bg-gradient-to-r from-fuchsia-600 to-cyan-600 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
        <div className="relative w-32 h-32 bg-slate-800 rounded-full border-4 border-slate-600 overflow-hidden flex items-center justify-center">
             {/* Simple Pixel Art Representation using SVG */}
             <svg 
                viewBox="0 0 100 100" 
                className="w-full h-full"
                style={{ filter: `hue-rotate(${avatarHue}deg)` }}
            >
                <rect x="0" y="0" width="100" height="100" fill="#1e293b" />
                {/* Face */}
                <rect x="30" y="30" width="40" height="40" fill="#fca5a5" />
                {/* Eyes */}
                <rect x="35" y="40" width="10" height="10" fill="#000" />
                <rect x="55" y="40" width="10" height="10" fill="#000" />
                {/* Hat */}
                <path d="M 20 30 L 50 5 L 80 30 Z" fill="#9333ea" />
                {/* Robe */}
                <rect x="20" y="70" width="60" height="30" fill="#9333ea" />
             </svg>
        </div>
        <div className="absolute top-0 right-0 bg-yellow-400 text-black rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Sparkles size={16} />
        </div>
      </div>

      <div className="text-center space-y-2">
        <h2 className="font-pixel text-3xl text-white">Salutations, Voyageur.</h2>
        <p className="text-slate-400 italic">"Prêt à slay cette journée ?"</p>
      </div>

      {/* Tarot Cards Navigation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl px-4">
        {tarotCards.map((card) => (
            <button
                key={card.id}
                onClick={() => changeView(card.view)}
                className={`relative group bg-slate-800/50 hover:bg-slate-800 border-2 ${card.borderColor} rounded-xl p-6 transition-all transform hover:-translate-y-2 hover:shadow-[0_0_15px_rgba(0,0,0,0.5)]`}
            >
                <div className="flex flex-col items-center space-y-4">
                    <card.icon size={48} className={`${card.color} group-hover:animate-bounce`} />
                    <h3 className={`font-pixel text-2xl ${card.color}`}>{card.label}</h3>
                    <p className="text-slate-400 text-sm font-mono">{card.desc}</p>
                </div>
            </button>
        ))}
      </div>
    </div>
  );
};

export default Hero;