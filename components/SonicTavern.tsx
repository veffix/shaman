import React from 'react';
import { ArrowLeft, Play, Pause, SkipForward, SkipBack, Volume2, Mic2 } from 'lucide-react';
import { ViewState, Track } from '../types';

interface SonicTavernProps {
  changeView: (view: ViewState) => void;
  isPlaying: boolean;
  currentTrack: Track;
  onTogglePlay: () => void;
  onNext: () => void;
  onPrev: () => void;
  isSpotifyLinked: boolean;
}

const SonicTavern: React.FC<SonicTavernProps> = ({ 
    changeView, 
    isPlaying, 
    currentTrack, 
    onTogglePlay, 
    onNext, 
    onPrev,
    isSpotifyLinked 
}) => {
  
  return (
    <div className="w-full max-w-4xl mx-auto p-4 animate-in zoom-in-95 duration-500">
      <button 
        onClick={() => changeView('HOME')}
        className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft size={20} /> Retour au QG
      </button>

      <div className="bg-slate-900 border-2 border-cyan-500/50 rounded-xl p-8 shadow-[0_0_40px_rgba(34,211,238,0.1)] relative overflow-hidden">
        
        {/* Background Animation (Vaporwave Grid) */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none"></div>

        {/* Visualizer Area */}
        <div className="h-64 mb-8 flex items-end justify-center gap-1 bg-slate-950 rounded-lg p-4 border border-slate-800 overflow-hidden relative shadow-inner">
            <div className="absolute inset-0 bg-gradient-to-t from-cyan-900/20 to-transparent"></div>
            
            {/* Artist Hologram Placeholder */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-20 pointer-events-none">
                 <Mic2 size={120} className="text-fuchsia-500 animate-pulse" />
            </div>

            {isPlaying && isSpotifyLinked ? (
                Array.from({ length: 40 }).map((_, i) => (
                    <div 
                        key={i} 
                        className="bar w-2 md:w-3 bg-gradient-to-t from-cyan-600 via-fuchsia-500 to-yellow-300 rounded-t-sm opacity-80"
                        style={{ 
                            animationDelay: `${Math.random() * -1}s`,
                            height: `${Math.random() * 80 + 10}%`,
                            boxShadow: '0 0 10px rgba(0,255,255,0.5)'
                        }}
                    ></div>
                ))
            ) : (
                <div className="flex flex-col items-center justify-center h-full w-full text-slate-600 font-mono text-sm">
                    <div className="w-full h-0.5 bg-slate-800 mb-2"></div>
                    <p>{!isSpotifyLinked ? "SIGNAL LOST // LINK ACCOUNT REQUIRED" : "PAUSED"}</p>
                </div>
            )}
             
             {/* Overlay Text */}
             <div className="absolute top-4 right-4 font-mono text-xs text-green-500 animate-pulse border border-green-900 px-2 bg-black/50">
                {isPlaying ? 'LIVE SIGNAL: OK' : 'SIGNAL: STANDBY'}
             </div>
        </div>

        {/* Track Info */}
        <div className="text-center mb-12 space-y-4">
            <h2 className="text-4xl md:text-5xl font-pixel text-white tracking-widest uppercase neon-text-cyan drop-shadow-lg">
                {isSpotifyLinked ? currentTrack.title : "NO SIGNAL"}
            </h2>
            <p className="text-fuchsia-400 text-xl font-retro tracking-wider">
                {isSpotifyLinked ? currentTrack.artist : "---"}
            </p>
            <div className="flex justify-center gap-4 text-xs font-mono text-slate-500 mt-4">
                <span className="bg-slate-800 px-2 py-1 rounded border border-slate-700">{currentTrack.bpm} BPM</span>
                <span className="bg-slate-800 px-2 py-1 rounded border border-slate-700">STEREO // HIGH-FI</span>
                <span className="bg-slate-800 px-2 py-1 rounded border border-slate-700">{currentTrack.duration}</span>
            </div>
        </div>

        {/* Big Controls */}
        <div className="flex items-center justify-center gap-12 mb-8">
            <button onClick={onPrev} className="text-slate-500 hover:text-cyan-400 transition-colors hover:scale-110">
                <SkipBack size={48} />
            </button>
            <button 
                onClick={onTogglePlay}
                className={`w-24 h-24 rounded-full flex items-center justify-center text-white hover:scale-105 transition-all shadow-[0_0_30px_rgba(34,211,238,0.4)]
                    ${isPlaying ? 'bg-fuchsia-600 hover:bg-fuchsia-500' : 'bg-cyan-600 hover:bg-cyan-500'}`}
            >
                {isPlaying ? <Pause size={48} fill="white" /> : <Play size={48} fill="white" className="ml-2" />}
            </button>
            <button onClick={onNext} className="text-slate-500 hover:text-cyan-400 transition-colors hover:scale-110">
                <SkipForward size={48} />
            </button>
        </div>

        {/* Volume Mockup */}
        <div className="flex items-center justify-center gap-4 text-slate-500 max-w-xs mx-auto">
            <Volume2 size={24} />
            <input 
                type="range" 
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-fuchsia-500"
            />
        </div>
        
        <p className="mt-8 text-center text-xs text-slate-600 font-mono border-t border-slate-800 pt-4">
            * VISUALIZER MODE ACTIVE. <br/> Use Navigation Bar for persistence playback.
        </p>

      </div>
    </div>
  );
};

export default SonicTavern;