import React from 'react';
import { Settings, Link, Coins } from 'lucide-react';
import { Track } from '../types';

interface HeaderProps {
  xp: number;
  gold: number;
  level: number;
  musicState: {
    isPlaying: boolean;
    currentTrack: Track;
    isSpotifyLinked: boolean;
  };
  musicControls: {
    togglePlay: () => void;
    nextTrack: () => void;
    prevTrack: () => void;
  };
  onOpenSettings: () => void;
  spotifyEmbedUrl?: string | null;
}

const Header: React.FC<HeaderProps> = ({ xp, gold, level, musicState, onOpenSettings, spotifyEmbedUrl }) => {

  return (
    <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-md border-b-2 border-slate-700 p-2 shadow-lg">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        
        {/* Left: Logo & Stats */}
        <div className="flex justify-between w-full md:w-auto items-center">
            <div className="flex flex-col mr-6">
                <h1 className="font-pixel text-2xl text-fuchsia-400 neon-text-pink leading-none cursor-pointer hover:scale-105 transition-transform">
                    DONJON & BASS
                </h1>
                <div className="flex items-center gap-3 text-xs font-mono mt-1">
                    <span className="text-slate-400">LVL {level}</span>
                    <span className="text-green-400">XP: {xp}</span>
                    <span className="text-yellow-400 flex items-center gap-1"><Coins size={10} /> {gold}g</span>
                </div>
            </div>
        </div>

        {/* Center: Cyber Deck Music Player */}
        <div className={`flex-grow max-w-md w-full transition-all duration-300 ${musicState.isSpotifyLinked ? 'h-[80px]' : 'h-12 bg-black/40 border border-slate-600 rounded-lg p-1 flex items-center gap-2 relative overflow-hidden group'}`}>
            
            {musicState.isSpotifyLinked && spotifyEmbedUrl ? (
                // --- Real Spotify Embed ---
                <iframe 
                    style={{ borderRadius: '12px' }} 
                    src={spotifyEmbedUrl} 
                    width="100%" 
                    height="80" 
                    frameBorder="0" 
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
                    loading="lazy"
                    className="shadow-[0_0_15px_rgba(232,121,249,0.3)] opacity-90 hover:opacity-100 transition-opacity"
                ></iframe>
            ) : (
                // --- Mock Player Controls ---
                <>
                    {/* Connection Status / Placeholder */}
                    <div 
                        className="w-10 h-10 rounded flex items-center justify-center shrink-0 transition-colors cursor-pointer bg-slate-800 text-slate-500 border border-slate-600 hover:bg-slate-700"
                        onClick={onOpenSettings}
                        title="Connect Spotify"
                    >
                        <Link size={20} />
                    </div>

                    {/* Placeholder Info */}
                    <div className="flex-grow flex items-center justify-between overflow-hidden">
                        <button onClick={onOpenSettings} className="w-full text-left text-xs font-mono text-slate-400 hover:text-white flex items-center justify-between">
                            <span>// NO SIGNAL_</span>
                            <span className="text-cyan-500 underline decoration-dashed">CONNECT STREAM &gt;</span>
                        </button>
                    </div>
                </>
            )}
        </div>

        {/* Right: Settings */}
        <div className="hidden md:flex items-center gap-6">
            <button 
                onClick={onOpenSettings}
                className="p-2 bg-slate-800 border border-slate-600 rounded-lg hover:bg-slate-700 hover:border-cyan-400 text-slate-400 hover:text-cyan-400 transition-all"
                title="User Settings"
            >
                <Settings size={20} />
            </button>
        </div>

      </div>
    </header>
  );
};

export default Header;