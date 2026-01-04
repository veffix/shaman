import React, { useState, useEffect } from 'react';
import { ArrowLeft, ChefHat, Play, CheckSquare, Square, RefreshCcw, Coins, ArrowRight, ShieldCheck, Dna } from 'lucide-react';
import { ViewState, Recipe, Difficulty } from '../types';
import { CRITICAL_FAIL_RECIPE, CRITICAL_SUCCESS_RECIPE } from '../constants';

interface DiceKitchenProps {
  changeView: (view: ViewState) => void;
  addXp: (amount: number) => void;
  addGold: (amount: number) => void;
  recipes: Recipe[];
  selectedRecipe?: Recipe | null;
}

type FocusStep = 'PREP' | 'COOKING' | 'VICTORY';

interface FloatingPop {
    id: number;
    amount: number;
    type: 'XP' | 'GOLD';
}

const DiceKitchen: React.FC<DiceKitchenProps> = ({ changeView, addXp, addGold, recipes, selectedRecipe }) => {
  // Main State
  const [rolling, setRolling] = useState(false);
  const [rollResult, setRollResult] = useState<number | null>(null);
  const [currentRecipe, setCurrentRecipe] = useState<Recipe | null>(null);
  
  // Initialize with selected recipe if available
  useEffect(() => {
    if (selectedRecipe) {
        setCurrentRecipe(selectedRecipe);
        setRollResult(null); // No roll needed for manual selection
    }
  }, [selectedRecipe]);

  // Focus Mode State
  const [focusMode, setFocusMode] = useState(false);
  const [focusStep, setFocusStep] = useState<FocusStep>('PREP');
  const [currentInstructionIndex, setCurrentInstructionIndex] = useState(0);
  const [checkedIngredients, setCheckedIngredients] = useState<boolean[]>([]);
  const [sessionXp, setSessionXp] = useState(0);
  const [sessionGold, setSessionGold] = useState(0);
  const [pops, setPops] = useState<FloatingPop[]>([]);
  
  // Timer State
  const [timerActive, setTimerActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(1500); // 25 min default

  // --- Main Dice Logic ---
  const rollDice = () => {
    setRolling(true);
    setRollResult(null);
    setCurrentRecipe(null);
    
    setTimeout(() => {
      const result = Math.floor(Math.random() * 20) + 1;
      setRollResult(result);
      setRolling(false);

      if (result === 1) {
        setCurrentRecipe(CRITICAL_FAIL_RECIPE);
        // Small XP for failing
        addXp(10); 
      } else if (result === 20) {
        setCurrentRecipe(CRITICAL_SUCCESS_RECIPE);
        addXp(100);
      } else {
        const index = Math.floor(Math.random() * recipes.length);
        setCurrentRecipe(recipes[index]);
        addXp(50);
      }
    }, 1000); 
  };

  const startFocusMode = () => {
    if (!currentRecipe) return;
    setFocusMode(true);
    setFocusStep('PREP');
    setCurrentInstructionIndex(0);
    setCheckedIngredients(new Array(currentRecipe.ingredients.length).fill(false));
    setSessionXp(0);
    setSessionGold(0);
  };

  const quitFocusMode = () => {
    setFocusMode(false);
    setTimerActive(false);
    setPops([]);
  };

  // --- Timer Logic ---
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [timerActive, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // --- Animation Logic ---
  const triggerPop = (amount: number, type: 'XP' | 'GOLD') => {
    // Add real value
    if (type === 'XP') {
        addXp(amount);
        setSessionXp(prev => prev + amount);
    } else {
        addGold(amount);
        setSessionGold(prev => prev + amount);
    }

    // Trigger Animation
    const id = Date.now() + Math.random();
    setPops(prev => [...prev, { id, amount, type }]);

    // Remove animation after 1s
    setTimeout(() => {
        setPops(prev => prev.filter(p => p.id !== id));
    }, 1000);
  };

  // --- Focus Mode Logic ---

  const toggleIngredient = (index: number) => {
    const newChecked = [...checkedIngredients];
    newChecked[index] = !newChecked[index];
    setCheckedIngredients(newChecked);
    
    if (newChecked[index]) {
        triggerPop(15, 'XP');
    }
  };

  const allIngredientsChecked = checkedIngredients.every(Boolean);

  const calculateGoldReward = (recipe: Recipe): number => {
    if (recipe.isCriticalFail) return 5; // Pity gold
    if (recipe.isCriticalSuccess) return 200; // Jackpot
    
    switch (recipe.difficulty) {
        case Difficulty.CANTRIP: return 30;
        case Difficulty.LEVEL_1: return 50;
        case Difficulty.LEVEL_3: return 100;
        case Difficulty.LEVEL_9: return 150;
        default: return 40;
    }
  };

  const nextInstruction = () => {
    triggerPop(250, 'XP'); // Big XP for finishing a step
    if (currentRecipe && currentInstructionIndex < currentRecipe.instructions.length - 1) {
      setCurrentInstructionIndex(prev => prev + 1);
    } else {
        // FINISHED!
        if (currentRecipe) {
            const goldReward = calculateGoldReward(currentRecipe);
            triggerPop(goldReward, 'GOLD');
            triggerPop(500, 'XP'); // Victory XP
        }
        setFocusStep('VICTORY');
    }
  };

  // --- Render Functions for Focus Mode ---

  const renderPrepPhase = () => (
    <div className="animate-in fade-in zoom-in duration-500 max-w-2xl w-full mx-auto relative">
      <h2 className="text-4xl font-pixel text-cyan-400 mb-2 neon-text-cyan text-center">INITIALISATION</h2>
      <p className="text-center text-fuchsia-300 font-mono mb-8 tracking-widest uppercase text-sm">
        // MISE EN PLACE DU RITUEL
      </p>

      <div className="bg-slate-900/80 border-2 border-fuchsia-500 shadow-[5px_5px_0px_rgba(232,121,249,0.5)] p-6 mb-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-fuchsia-500 animate-pulse"></div>
        
        <ul className="space-y-4">
            {currentRecipe?.ingredients.map((ing, idx) => (
                <li 
                    key={idx} 
                    onClick={() => toggleIngredient(idx)}
                    className={`flex items-center justify-between p-3 border border-slate-700 cursor-pointer transition-all hover:bg-slate-800 ${checkedIngredients[idx] ? 'opacity-50 grayscale' : 'hover:scale-[1.02]'}`}
                >
                    <div className="flex items-center gap-4">
                        {checkedIngredients[idx] ? <CheckSquare className="text-green-400" /> : <Square className="text-fuchsia-400" />}
                        <span className={`font-mono text-xl ${checkedIngredients[idx] ? 'line-through text-slate-500' : 'text-white'}`}>
                            {ing.name}
                        </span>
                    </div>
                    <span className="font-pixel text-yellow-300 text-lg">{ing.quantity}</span>
                </li>
            ))}
        </ul>
      </div>

      <button
        disabled={!allIngredientsChecked}
        onClick={() => setFocusStep('COOKING')}
        className={`w-full py-4 text-2xl font-black font-pixel uppercase tracking-widest border-4 transition-all duration-300
            ${allIngredientsChecked 
                ? 'bg-cyan-600 border-cyan-400 text-white shadow-[0_0_20px_#00ffff] hover:scale-105 animate-pulse' 
                : 'bg-slate-800 border-slate-600 text-slate-500 cursor-not-allowed'}`}
      >
        {allIngredientsChecked ? 'LANCER LA CUISSON >>' : 'RASSEMBLEZ VOS ARTEFACTS'}
      </button>
    </div>
  );

  const renderCookingPhase = () => {
    const progress = ((currentInstructionIndex + 1) / (currentRecipe?.instructions.length || 1)) * 100;
    
    return (
        <div className="animate-in slide-in-from-right duration-500 max-w-4xl w-full mx-auto flex flex-col items-center">
            {/* Progress Bar */}
            <div className="w-full h-6 bg-slate-900 border-2 border-slate-600 mb-8 skew-x-[-15deg] relative">
                <div 
                    className="h-full bg-gradient-to-r from-fuchsia-600 to-cyan-500 transition-all duration-500 relative overflow-hidden"
                    style={{ width: `${progress}%` }}
                >
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')] opacity-30"></div>
                </div>
                <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center text-xs font-mono font-bold text-white z-10 skew-x-[15deg] drop-shadow-md">
                    ÉTAPE {currentInstructionIndex + 1} / {currentRecipe?.instructions.length}
                </div>
            </div>

            {/* Instruction Card */}
            <div className="w-full bg-slate-900/90 border-4 border-cyan-400 p-8 md:p-12 mb-8 shadow-[0_0_30px_rgba(34,211,238,0.2)] relative min-h-[300px] flex flex-col justify-center items-center text-center">
                 {/* Decorative corners */}
                 <div className="absolute top-2 left-2 w-4 h-4 border-t-4 border-l-4 border-fuchsia-500"></div>
                 <div className="absolute top-2 right-2 w-4 h-4 border-t-4 border-r-4 border-fuchsia-500"></div>
                 <div className="absolute bottom-2 left-2 w-4 h-4 border-b-4 border-l-4 border-fuchsia-500"></div>
                 <div className="absolute bottom-2 right-2 w-4 h-4 border-b-4 border-r-4 border-fuchsia-500"></div>
                 
                 <h3 className="text-3xl md:text-5xl font-pixel leading-relaxed text-white drop-shadow-[2px_2px_0px_#000]">
                    {currentRecipe?.instructions[currentInstructionIndex]}
                 </h3>
            </div>

            {/* Actions */}
            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Timer Box */}
                <div className="bg-black/50 border border-slate-600 p-4 flex items-center justify-between rounded-lg">
                    <div className="font-mono text-3xl text-yellow-400 glitch-hover cursor-default">
                        {formatTime(timeLeft)}
                    </div>
                    <button 
                        onClick={() => setTimerActive(!timerActive)}
                        className={`p-3 rounded-full ${timerActive ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'} text-white transition-colors`}
                    >
                        {timerActive ? <span className="font-bold text-xs">PAUSE</span> : <Play size={20} fill="currentColor" />}
                    </button>
                </div>

                {/* Next Step Button */}
                <button 
                    onClick={nextInstruction}
                    className="group relative bg-fuchsia-700 hover:bg-fuchsia-600 text-white font-bold py-4 px-6 overflow-hidden border-b-4 border-fuchsia-900 active:border-b-0 active:translate-y-1 transition-all"
                >
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
                    <div className="flex items-center justify-center gap-3 relative z-10">
                        <span className="font-pixel text-2xl uppercase">
                            {currentInstructionIndex === (currentRecipe?.instructions.length || 0) - 1 ? 'SERVIR LE PLAT' : 'ÉTAPE SUIVANTE'}
                        </span>
                        <ArrowRight className="group-hover:translate-x-2 transition-transform" />
                    </div>
                </button>
            </div>
        </div>
    );
  };

  const renderVictoryPhase = () => (
    <div className="flex flex-col items-center justify-center text-center animate-in zoom-in duration-700">
        <h1 className="font-retro text-4xl md:text-6xl text-yellow-400 mb-6 drop-shadow-[4px_4px_0px_#b91c1c] animate-bounce">
            QUEST COMPLETE!
        </h1>
        
        <div className="bg-slate-800 p-8 rounded-xl border-4 border-green-500 shadow-[0_0_50px_rgba(34,197,94,0.4)] mb-8 transform rotate-1">
            <h2 className="font-pixel text-3xl text-white mb-4">RÉCOMPENSES</h2>
            <div className="flex flex-col gap-2 font-mono text-xl text-green-300">
                <p className="flex justify-between w-full gap-8">XP Total: <span className="text-white">+{sessionXp} XP</span></p>
                <p className="flex justify-between w-full gap-8 text-yellow-300">Gold: <span className="text-white font-bold text-yellow-400">+{sessionGold}g</span></p>
                <div className="w-full h-px bg-slate-600 my-2"></div>
                <p>Status: <span className="text-white">REPU</span></p>
                <p>Bonus: <span className="text-white">{currentRecipe?.statBonus}</span></p>
            </div>
        </div>

        <button 
            onClick={quitFocusMode}
            className="bg-white text-black font-pixel text-2xl py-3 px-8 hover:bg-cyan-300 transition-colors shadow-[4px_4px_0px_#000]"
        >
            RETOURNER AU QG
        </button>
    </div>
  );

  // --- Main Focus Mode Overlay ---
  if (focusMode && currentRecipe) {
    return (
      <div className="fixed inset-0 z-[100] bg-vaporwave overflow-y-auto overflow-x-hidden">
        {/* Animated Background Grid */}
        <div className="vapor-grid absolute inset-0 opacity-30 pointer-events-none animate-[pulse_4s_infinite]"></div>
        
        {/* Dynamic Background Image (Blur) */}
        {currentRecipe.imageUrl && (
            <div 
                className="fixed inset-0 bg-cover bg-center opacity-10 blur-sm pointer-events-none z-0"
                style={{ backgroundImage: `url(${currentRecipe.imageUrl})` }}
            ></div>
        )}

        {/* Floating Pops Container Layer - Always on top */}
        <div className="fixed inset-0 pointer-events-none z-[150] flex items-center justify-center">
            {pops.map((pop) => (
                <div 
                    key={pop.id} 
                    className={`absolute animate-float-xp font-pixel text-6xl drop-shadow-[4px_4px_0px_#000] ${pop.type === 'GOLD' ? 'text-yellow-400' : 'text-green-400'}`}
                >
                    +{pop.amount} {pop.type === 'GOLD' ? 'g' : 'XP'}
                </div>
            ))}
        </div>
        
        <div className="relative z-10 min-h-screen flex flex-col p-4 md:p-8">
            {/* Focus Header */}
            <div className="flex justify-between items-center mb-8 border-b-2 border-white/20 pb-4 bg-black/30 p-4 rounded-lg backdrop-blur-md">
                <button 
                    onClick={quitFocusMode}
                    className="flex items-center gap-2 text-white/70 hover:text-red-400 font-mono transition-colors"
                >
                    <ArrowLeft size={20} /> ABANDON
                </button>
                <h2 className="font-pixel text-2xl text-white hidden md:block">{currentRecipe.title}</h2>
                <div className="flex gap-4 font-mono text-sm">
                    <span className="text-green-400">SESSION XP: {sessionXp}</span>
                    <span className="text-yellow-400">LOOT: {sessionGold}g</span>
                </div>
            </div>

            {/* Dynamic Content */}
            <div className="flex-grow flex items-center justify-center">
                {focusStep === 'PREP' && renderPrepPhase()}
                {focusStep === 'COOKING' && renderCookingPhase()}
                {focusStep === 'VICTORY' && renderVictoryPhase()}
            </div>
        </div>
      </div>
    );
  }

  // --- Normal Dashboard View ---
  return (
    <div className="w-full max-w-4xl mx-auto p-4 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-6">
          <button 
            onClick={() => changeView('HOME')}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} /> Retour au QG
          </button>
      </div>

      {!currentRecipe && (
        <div className="flex flex-col items-center justify-center space-y-12 py-12">
            <h2 className="font-pixel text-4xl text-fuchsia-400 text-center neon-text-pink">QUE MANGER CE SOIR ?</h2>
            
            <div className="relative group">
                <div className="absolute inset-0 bg-fuchsia-600 blur-xl opacity-20 group-hover:opacity-40 transition-opacity rounded-full"></div>
                <button 
                    onClick={rollDice}
                    disabled={rolling}
                    className={`relative z-10 w-48 h-48 rounded-2xl bg-slate-800 border-4 border-fuchsia-500 flex items-center justify-center transition-all ${rolling ? 'animate-spin' : 'hover:scale-105 hover:rotate-3 shadow-[0_0_30px_#e879f9]'}`}
                >
                    {rolling ? (
                        <div className="font-pixel text-6xl text-white">...</div>
                    ) : (
                        <div className="flex flex-col items-center gap-2">
                             <div className="text-6xl font-bold text-white font-pixel">D20</div>
                             <span className="text-fuchsia-300 font-mono text-sm tracking-widest">ROLL</span>
                        </div>
                    )}
                </button>
            </div>
            
            <p className="text-slate-500 italic max-w-md text-center font-mono text-sm">
                &lt; SYSTEM: {recipes.length} recipes loaded. &gt;<br/>
                &lt; WARNING: Critical failures may result in Pizza. &gt;
            </p>
        </div>
      )}

      {currentRecipe && (
        <div className="bg-slate-800 border-2 border-slate-600 rounded-xl p-6 shadow-2xl relative overflow-hidden group">
            {/* Background Texture Effect or Real Image */}
            <div className="absolute inset-0 z-0 opacity-20 pointer-events-none transition-transform group-hover:scale-110 duration-700 bg-center bg-cover" 
                 style={{ 
                     backgroundImage: currentRecipe.imageUrl ? `url(${currentRecipe.imageUrl})` : 'none',
                     filter: 'contrast(110%)' 
                 }}>
                 {!currentRecipe.imageUrl && (
                    <div className="absolute top-0 right-0 p-4 opacity-50">
                         <ChefHat size={200} />
                    </div>
                 )}
            </div>
            {/* Dark Overlay for Readability */}
            <div className="absolute inset-0 z-0 bg-slate-900/80"></div>

            <div className="flex flex-col md:flex-row justify-between items-start mb-6 relative z-10 gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        {rollResult !== null ? (
                            <span className={`font-pixel text-5xl drop-shadow-lg ${currentRecipe.isCriticalFail ? 'text-red-500' : currentRecipe.isCriticalSuccess ? 'text-yellow-400 animate-bounce' : 'text-fuchsia-400'}`}>
                                {rollResult}
                            </span>
                        ) : (
                             // Icon for manual selection
                             <Dna size={48} className="text-fuchsia-400 animate-pulse" />
                        )}
                        <h2 className="text-3xl md:text-4xl font-bold font-pixel uppercase leading-none mt-1 text-white neon-text-cyan">{currentRecipe.title}</h2>
                    </div>
                    <div className="flex gap-2 mt-2">
                         <span className="px-2 py-1 rounded bg-slate-900 text-xs font-mono text-cyan-300 border border-cyan-800 shadow-[0_0_5px_rgba(34,211,238,0.3)]">
                            DIFFICULTY: {currentRecipe.difficulty}
                         </span>
                         <span className="px-2 py-1 rounded bg-slate-900 text-xs font-mono text-fuchsia-300 border border-fuchsia-800 shadow-[0_0_5px_rgba(232,121,249,0.3)]">
                            CAST TIME: {currentRecipe.prepTime}
                         </span>
                         {/* Potential Reward Preview */}
                         <span className="px-2 py-1 rounded bg-slate-900 text-xs font-mono text-yellow-400 border border-yellow-800 shadow-[0_0_5px_rgba(250,204,21,0.3)] flex items-center gap-1">
                            <Coins size={10} /> REWARD: {calculateGoldReward(currentRecipe)}g
                         </span>
                    </div>
                </div>
                
                <button 
                    onClick={startFocusMode}
                    className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 px-6 py-3 rounded-lg font-bold transition shadow-lg border border-indigo-400 hover:scale-105 active:scale-95"
                >
                    <ShieldCheck size={18} />
                    <span className="tracking-wider">START RITUAL</span>
                </button>
            </div>

            <p className="text-slate-300 italic mb-8 border-l-4 border-fuchsia-500 pl-4 py-2 bg-slate-900/50 rounded-r relative z-10">
                "{currentRecipe.description}"
            </p>

            <div className="grid md:grid-cols-2 gap-8 relative z-10">
                <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700 hover:border-fuchsia-500 transition-colors">
                    <h3 className="text-xl font-bold text-fuchsia-300 mb-4 flex items-center gap-2 font-pixel">
                       COMPOSANTS
                    </h3>
                    <ul className="space-y-2">
                        {currentRecipe.ingredients.map((ing, i) => (
                            <li key={i} className="flex justify-between text-sm border-b border-slate-800 pb-1 font-mono text-slate-300">
                                <span>{ing.name}</span>
                                <span className="text-fuchsia-400">{ing.quantity}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700 hover:border-cyan-500 transition-colors">
                    <h3 className="text-xl font-bold text-cyan-300 mb-4 flex items-center gap-2 font-pixel">
                        INCANTATION
                    </h3>
                    <ol className="list-decimal list-inside space-y-3 text-sm font-sans text-slate-300 max-h-[300px] overflow-y-auto custom-scrollbar">
                        {currentRecipe.instructions.map((step, i) => (
                            <li key={i} className="leading-relaxed mb-2">{step}</li>
                        ))}
                    </ol>
                </div>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-700 flex justify-between items-center text-sm font-mono text-slate-400 relative z-10">
                 <span className="flex items-center gap-2"><div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div> Gain: {currentRecipe.statBonus}</span>
                 <button onClick={rollDice} className="hover:text-white flex items-center gap-1 hover:text-cyan-400 transition-colors">
                    <RefreshCcw size={14} /> REROLL (-10g)
                 </button>
            </div>
        </div>
      )}
    </div>
  );
};

export default DiceKitchen;