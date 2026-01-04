import React, { useState, useEffect } from 'react';
import { ArrowLeft, PlusCircle, Trophy, Coins, X, FileText, Clock, BarChart, Save, Scroll, Ban, RefreshCw, Globe, Search, Sparkles, ChevronLeft, ChevronRight, Terminal, Minimize2, Maximize2 } from 'lucide-react';
import { ViewState, Recipe, Difficulty, Ingredient } from '../types';

interface InventoryProps {
  changeView: (view: ViewState) => void;
  xp: number;
  gold: number;
  recipes: Recipe[];
  onAddRecipe: (recipe: Recipe) => void;
  onSelectRecipe: (recipe: Recipe) => void;
  addXp: (amount: number) => void;
  addGold: (amount: number) => void;
  onFetchMore?: () => void;
  onSearch?: (query: string) => void;
  isLoading?: boolean;
}

const Inventory: React.FC<InventoryProps> = ({ 
    changeView, xp, gold, recipes, onAddRecipe, onSelectRecipe, addXp, addGold, onFetchMore, onSearch, isLoading 
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Pagination State
  const ITEMS_PER_PAGE = 20;
  const [currentPage, setCurrentPage] = useState(1);
  
  // Custom Recipe State
  const [newRecipeTitle, setNewRecipeTitle] = useState('');
  const [newRecipeDesc, setNewRecipeDesc] = useState('');
  const [newRecipeIngredients, setNewRecipeIngredients] = useState(''); 
  const [newRecipeInstructions, setNewRecipeInstructions] = useState(''); 
  const [newRecipeTime, setNewRecipeTime] = useState('');
  const [newRecipeDiff, setNewRecipeDiff] = useState<Difficulty>(Difficulty.LEVEL_1);

  // Filter recipes locally
  const filteredRecipes = recipes.filter(r => 
    r.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.ingredients.some(i => i.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Calculate Pagination
  const totalPages = Math.max(1, Math.ceil(filteredRecipes.length / ITEMS_PER_PAGE));
  
  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, recipes.length]);

  const currentRecipes = filteredRecipes.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (newPage: number) => {
      if (newPage >= 1 && newPage <= totalPages) {
          setCurrentPage(newPage);
          const grid = document.getElementById('inventory-grid');
          if (grid) grid.scrollIntoView({ behavior: 'smooth' });
      }
  };

  const handleSearchAPI = () => {
      if (onSearch && searchTerm.trim()) {
          onSearch(searchTerm);
      }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
          handleSearchAPI();
      }
  };

  const handleSaveRecipe = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Parse ingredients from text area
    const parsedIngredients: Ingredient[] = newRecipeIngredients.split('\n').filter(line => line.trim() !== '').map(line => {
        const parts = line.trim().split(' ');
        const quantity = parts.length > 1 ? parts[0] : '1';
        const name = parts.length > 1 ? parts.slice(1).join(' ') : parts[0];
        
        return { name, quantity }; 
    });

    // Parse instructions
    const parsedInstructions = newRecipeInstructions.split('\n').filter(line => line.trim() !== '');

    const newRecipe: Recipe = {
        id: `custom-${Date.now()}`,
        title: newRecipeTitle,
        description: newRecipeDesc || 'Une recette secrète de famille.',
        ingredients: parsedIngredients.length > 0 ? parsedIngredients : [{name: 'Magie', quantity: '1'}],
        instructions: parsedInstructions.length > 0 ? parsedInstructions : ['Cuisiner avec le coeur.'],
        prepTime: newRecipeTime || '30 min',
        difficulty: newRecipeDiff,
        statBonus: '+1 Creativity'
    };

    onAddRecipe(newRecipe);
    setShowAddModal(false);
    addXp(150);
    addGold(20);
    
    // Reset form
    setNewRecipeTitle('');
    setNewRecipeDesc('');
    setNewRecipeIngredients('');
    setNewRecipeInstructions('');
    setNewRecipeTime('');
  };

  const getXpForDifficulty = (diff: Difficulty) => {
      switch(diff) {
          case Difficulty.CANTRIP: return 50;
          case Difficulty.LEVEL_1: return 100;
          case Difficulty.LEVEL_3: return 200;
          case Difficulty.LEVEL_9: return 500;
          default: return 50;
      }
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 animate-in fade-in duration-500">
      
      {/* --- TOP BAR (Retro OS Style) --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b-4 border-fuchsia-500 pb-4">
        <button 
            onClick={() => changeView('HOME')}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 border-2 border-slate-600 text-slate-400 hover:text-cyan-400 hover:border-cyan-400 hover:shadow-[4px_4px_0px_#22d3ee] transition-all active:translate-y-1 active:shadow-none font-mono text-sm"
        >
            <ArrowLeft size={16} /> SYSTEM.EXIT()
        </button>

        <div className="flex gap-4">
             {/* XP Display - Glitchy Box */}
            <div className="flex items-center gap-2 bg-black px-4 py-2 border-2 border-green-500 shadow-[4px_4px_0px_#22c55e]">
                <Trophy className="text-green-400 animate-pulse" size={20} />
                <span className="font-pixel text-xl text-green-100">{xp} XP</span>
            </div>
             {/* Gold Display */}
             <div className="flex items-center gap-2 bg-black px-4 py-2 border-2 border-yellow-500 shadow-[4px_4px_0px_#eab308]">
                <Coins className="text-yellow-400" size={20} />
                <span className="font-pixel text-xl text-yellow-100">{gold}g</span>
            </div>
        </div>
      </div>

      {/* --- HEADER SECTION --- */}
      <div id="inventory-grid" className="flex flex-col xl:flex-row justify-between items-end mb-8 gap-6 bg-slate-900/50 p-6 border-2 border-slate-700 backdrop-blur-sm relative overflow-hidden">
        {/* Decorative background grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(232,121,249,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.1)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>

        <div className="relative z-10">
            <h2 className="font-pixel text-5xl md:text-6xl text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 via-purple-400 to-cyan-400 drop-shadow-[3px_3px_0px_rgba(255,255,255,0.2)]">
                GRIMOIRE_V2.0
            </h2>
            <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs mt-2 uppercase tracking-widest">
                <Terminal size={12} />
                <span>DATABASE_STATUS: ONLINE // {recipes.length} ENTRIES FOUND</span>
            </div>
        </div>
        
        {/* Search & Actions */}
        <div className="flex flex-col md:flex-row gap-4 w-full xl:w-auto relative z-10">
             <div className="relative flex-grow md:w-80 group">
                <div className="absolute inset-0 bg-fuchsia-500 blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
                <Search className="absolute left-3 top-3.5 text-fuchsia-500" size={18} />
                <input 
                    type="text" 
                    placeholder="SEARCH_DATABASE..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="w-full bg-black border-2 border-fuchsia-500 py-3 pl-10 pr-4 text-fuchsia-100 placeholder-fuchsia-900 focus:outline-none focus:shadow-[0_0_15px_#d946ef] transition-all font-mono text-sm rounded-none"
                />
             </div>

             <div className="flex gap-3">
                 {onSearch && (
                    <button 
                        onClick={handleSearchAPI}
                        disabled={isLoading || !searchTerm.trim()}
                        className="flex items-center gap-2 bg-cyan-900 hover:bg-cyan-800 text-cyan-300 border-2 border-cyan-400 px-6 py-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap shadow-[4px_4px_0px_#06b6d4] active:translate-y-1 active:shadow-none hover:brightness-110"
                    >
                        <Globe size={18} className={isLoading ? 'animate-spin' : ''} />
                        <span className="font-pixel text-lg">WEB_SEARCH</span>
                    </button>
                 )}

                 {onFetchMore && (
                    <button 
                        onClick={onFetchMore}
                        disabled={isLoading}
                        className="flex items-center justify-center bg-purple-900 hover:bg-purple-800 text-purple-200 border-2 border-purple-400 px-4 py-2 transition-all disabled:opacity-50 shadow-[4px_4px_0px_#c084fc] active:translate-y-1 active:shadow-none"
                        title="Random Data Injection"
                    >
                        <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
                    </button>
                 )}
            </div>
        </div>
      </div>

      {/* --- GRID LAYOUT --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        
        {/* 'ADD NEW' CARD (Retro File System style) */}
        <button 
            onClick={() => setShowAddModal(true)}
            className="h-full min-h-[300px] border-4 border-dashed border-slate-700 bg-slate-900/50 flex flex-col items-center justify-center text-slate-500 hover:text-green-400 hover:border-green-500 hover:bg-slate-900 transition-all group relative overflow-hidden"
        >
            <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(74,222,128,0.05)_25%,rgba(74,222,128,0.05)_50%,transparent_50%,transparent_75%,rgba(74,222,128,0.05)_75%,rgba(74,222,128,0.05)_100%)] bg-[size:20px_20px] opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <PlusCircle size={64} className="mb-4 group-hover:rotate-90 transition-transform duration-500" />
            <span className="font-pixel text-2xl uppercase">NEW_FILE.EXE</span>
            <span className="font-mono text-xs mt-2 text-green-600 group-hover:text-green-400">// CREATE CUSTOM RECIPE</span>
        </button>

        {/* RECIPE CARDS */}
        {currentRecipes.length > 0 ? (
            currentRecipes.map((recipe) => (
                <div 
                    key={recipe.id} 
                    onClick={() => onSelectRecipe(recipe)}
                    className="group relative bg-black border-2 border-slate-700 hover:border-fuchsia-500 hover:shadow-[8px_8px_0px_#d946ef] transition-all duration-200 cursor-pointer flex flex-col h-full hover:-translate-y-1"
                >
                    {/* Header Bar within Card */}
                    <div className="h-6 bg-slate-800 border-b-2 border-slate-700 flex items-center justify-between px-2 group-hover:bg-fuchsia-900 group-hover:border-fuchsia-500 transition-colors">
                        <span className="text-[10px] font-mono text-slate-400 group-hover:text-fuchsia-200 uppercase truncate max-w-[150px]">ID: {recipe.id}</span>
                        <div className="flex gap-1">
                            <div className="w-2 h-2 bg-slate-600 rounded-full group-hover:bg-red-500"></div>
                            <div className="w-2 h-2 bg-slate-600 rounded-full group-hover:bg-yellow-500"></div>
                            <div className="w-2 h-2 bg-slate-600 rounded-full group-hover:bg-green-500"></div>
                        </div>
                    </div>

                    <div className="h-40 overflow-hidden relative bg-slate-900 shrink-0">
                        {/* Image with Vibrant Colors */}
                        <img 
                            src={recipe.imageUrl || `https://picsum.photos/seed/${recipe.id}/300/200`}
                            alt={recipe.title} 
                            className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105"
                            loading="lazy"
                        />
                        {/* Scanlines overlay - reduced opacity for better color visibility */}
                        <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.5)_50%)] bg-[size:100%_4px] pointer-events-none opacity-20"></div>
                        
                        <div className="absolute bottom-0 right-0 bg-black border-t-2 border-l-2 border-cyan-500 px-2 py-1">
                            <span className="font-pixel text-cyan-400 text-lg">+{getXpForDifficulty(recipe.difficulty)}XP</span>
                        </div>
                    </div>
                    
                    <div className="p-4 flex flex-col flex-grow relative">
                        {/* Glitch text effect container */}
                        <div className="mb-3 min-h-[3.5rem] relative">
                             <h3 className="text-xl font-bold font-pixel text-white leading-tight line-clamp-2 group-hover:text-fuchsia-400 group-hover:animate-pulse">
                                {recipe.title}
                            </h3>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-4">
                            <span className="px-1 py-0.5 bg-slate-900 border border-slate-600 text-[10px] font-mono text-slate-300 uppercase">
                                TYPE: FOOD
                            </span>
                            <span className="px-1 py-0.5 bg-slate-900 border border-slate-600 text-[10px] font-mono text-slate-300 uppercase">
                                {recipe.prepTime}
                            </span>
                        </div>
                        
                        <div className="mt-auto border-t-2 border-slate-800 pt-3 flex justify-between items-center group-hover:border-fuchsia-900">
                            <span className="text-xs font-mono text-slate-500 group-hover:text-fuchsia-300 flex items-center gap-1">
                                <Clock size={12} /> SYNC_TIME
                            </span>
                            <button className="bg-slate-800 text-slate-400 px-2 py-1 text-xs font-mono group-hover:bg-fuchsia-600 group-hover:text-white transition-colors uppercase">
                                LOAD >>
                            </button>
                        </div>
                    </div>
                </div>
            ))
        ) : (
            <div className="col-span-full py-16 text-center border-4 border-dashed border-slate-800 bg-black/50">
                <Sparkles className="mx-auto text-slate-700 mb-6 animate-pulse" size={64} />
                <h3 className="text-3xl font-pixel text-slate-500 mb-2">ERROR_404: RECIPE_NOT_FOUND</h3>
                <p className="text-slate-600 font-mono text-sm max-w-md mx-auto">
                    // TRY A DIFFERENT SEARCH QUERY OR CHECK CONNECTION.
                </p>
            </div>
        )}

        {/* --- PAGINATION (Retro Bar Style) --- */}
        {filteredRecipes.length > ITEMS_PER_PAGE && (
            <div className="col-span-full flex flex-col md:flex-row justify-center items-center gap-6 mt-8 py-8 border-t-4 border-slate-800 bg-black/20">
                <button 
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="flex items-center gap-2 px-6 py-3 bg-slate-900 border-2 border-slate-600 text-white disabled:opacity-30 disabled:border-slate-800 hover:bg-cyan-900 hover:border-cyan-400 hover:text-cyan-400 transition-all font-pixel text-lg shadow-[4px_4px_0px_rgba(255,255,255,0.1)] active:shadow-none active:translate-y-1"
                >
                    <ChevronLeft size={20} /> PREV_PAGE
                </button>
                
                <div className="flex flex-col items-center w-full max-w-md">
                    <span className="font-pixel text-2xl text-white mb-2 tracking-widest">
                        PAGE_{currentPage} <span className="text-slate-600">// {totalPages}</span>
                    </span>
                    <div className="w-full h-6 bg-slate-900 border-2 border-slate-600 p-1">
                        <div 
                            className="h-full bg-gradient-to-r from-fuchsia-600 via-purple-500 to-cyan-500 transition-all duration-300 relative overflow-hidden" 
                            style={{ width: `${(currentPage / totalPages) * 100}%` }}
                        >
                            {/* Striped loading bar effect */}
                            <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.2)_75%,transparent_75%,transparent)] bg-[size:20px_20px]"></div>
                        </div>
                    </div>
                </div>

                <button 
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-2 px-6 py-3 bg-slate-900 border-2 border-slate-600 text-white disabled:opacity-30 disabled:border-slate-800 hover:bg-cyan-900 hover:border-cyan-400 hover:text-cyan-400 transition-all font-pixel text-lg shadow-[4px_4px_0px_rgba(255,255,255,0.1)] active:shadow-none active:translate-y-1"
                >
                    NEXT_PAGE <ChevronRight size={20} />
                </button>
            </div>
        )}
      </div>

      {/* --- ADD RECIPE MODAL (Windows 95/98 Style) --- */}
      {showAddModal && (
        <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-slate-200 w-full max-w-2xl border-t-2 border-l-2 border-white border-b-4 border-r-4 border-slate-800 shadow-[20px_20px_0px_rgba(0,0,0,0.5)]">
                
                {/* Window Title Bar */}
                <div className="bg-gradient-to-r from-blue-900 to-blue-700 px-2 py-1 flex justify-between items-center cursor-move">
                    <div className="flex items-center gap-2 text-white font-bold font-sans text-sm tracking-wider">
                        <FileText size={16} />
                        <span>WIZARD_CREATOR.EXE</span>
                    </div>
                    <div className="flex gap-1">
                        <button className="w-5 h-5 bg-slate-300 border-t border-l border-white border-b border-r border-slate-600 flex items-center justify-center active:border-t-slate-600 active:border-l-slate-600 active:border-b-white active:border-r-white">
                            <Minimize2 size={12} className="text-black" />
                        </button>
                        <button className="w-5 h-5 bg-slate-300 border-t border-l border-white border-b border-r border-slate-600 flex items-center justify-center active:border-t-slate-600 active:border-l-slate-600 active:border-b-white active:border-r-white">
                            <Maximize2 size={12} className="text-black" />
                        </button>
                        <button 
                            onClick={() => setShowAddModal(false)} 
                            className="w-5 h-5 bg-slate-300 border-t border-l border-white border-b border-r border-slate-600 flex items-center justify-center active:border-t-slate-600 active:border-l-slate-600 active:border-b-white active:border-r-white hover:bg-red-500 group"
                        >
                            <X size={14} className="text-black group-hover:text-white" />
                        </button>
                    </div>
                </div>

                {/* Window Body */}
                <div className="p-6 text-black font-sans bg-slate-200">
                    <form id="recipeForm" onSubmit={handleSaveRecipe} className="space-y-6">
                        <div className="space-y-1">
                            <label className="block text-sm font-bold uppercase">Recipe_Name:</label>
                            <input 
                                required
                                type="text" 
                                value={newRecipeTitle}
                                onChange={e => setNewRecipeTitle(e.target.value)}
                                className="w-full bg-white border-2 border-slate-600 border-b-white border-r-white shadow-[inset_2px_2px_0px_rgba(0,0,0,0.5)] p-2 focus:outline-none focus:bg-yellow-50 font-mono"
                                placeholder="Enter name..."
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="block text-sm font-bold uppercase">Lore_Description:</label>
                            <textarea 
                                value={newRecipeDesc}
                                onChange={e => setNewRecipeDesc(e.target.value)}
                                className="w-full bg-white border-2 border-slate-600 border-b-white border-r-white shadow-[inset_2px_2px_0px_rgba(0,0,0,0.5)] p-2 focus:outline-none focus:bg-yellow-50 h-16 font-mono"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="block text-sm font-bold uppercase">Cast_Time:</label>
                                <input 
                                    type="text" 
                                    value={newRecipeTime}
                                    onChange={e => setNewRecipeTime(e.target.value)}
                                    className="w-full bg-white border-2 border-slate-600 border-b-white border-r-white shadow-[inset_2px_2px_0px_rgba(0,0,0,0.5)] p-2 focus:outline-none focus:bg-yellow-50 font-mono"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="block text-sm font-bold uppercase">Difficulty_Level:</label>
                                <select 
                                    value={newRecipeDiff}
                                    onChange={e => setNewRecipeDiff(e.target.value as Difficulty)}
                                    className="w-full bg-white border-2 border-slate-600 border-b-white border-r-white shadow-[inset_2px_2px_0px_rgba(0,0,0,0.5)] p-2 focus:outline-none focus:bg-yellow-50 font-mono"
                                >
                                    <option value={Difficulty.CANTRIP}>{Difficulty.CANTRIP}</option>
                                    <option value={Difficulty.LEVEL_1}>{Difficulty.LEVEL_1}</option>
                                    <option value={Difficulty.LEVEL_3}>{Difficulty.LEVEL_3}</option>
                                    <option value={Difficulty.LEVEL_9}>{Difficulty.LEVEL_9}</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="block text-sm font-bold uppercase">Ingredients_List:</label>
                                <textarea 
                                    required
                                    value={newRecipeIngredients}
                                    onChange={e => setNewRecipeIngredients(e.target.value)}
                                    className="w-full bg-white border-2 border-slate-600 border-b-white border-r-white shadow-[inset_2px_2px_0px_rgba(0,0,0,0.5)] p-2 focus:outline-none focus:bg-yellow-50 h-32 font-mono text-sm"
                                    placeholder="Format: 1 item per line"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="block text-sm font-bold uppercase">Execution_Steps:</label>
                                <textarea 
                                    required
                                    value={newRecipeInstructions}
                                    onChange={e => setNewRecipeInstructions(e.target.value)}
                                    className="w-full bg-white border-2 border-slate-600 border-b-white border-r-white shadow-[inset_2px_2px_0px_rgba(0,0,0,0.5)] p-2 focus:outline-none focus:bg-yellow-50 h-32 font-mono text-sm"
                                    placeholder="Format: 1 step per line"
                                />
                            </div>
                        </div>
                    </form>
                </div>

                {/* Footer / Status Bar */}
                <div className="p-4 bg-slate-300 border-t border-slate-400 flex justify-between items-center">
                    <span className="text-xs text-slate-500 font-mono">MEMORY: 640K OK</span>
                    <button 
                        type="submit"
                        form="recipeForm"
                        className="bg-slate-300 text-black font-bold py-1 px-6 border-t border-l border-white border-b-2 border-r-2 border-slate-800 active:border-t-slate-800 active:border-l-slate-800 active:border-b-white active:border-r-white active:bg-slate-400 focus:outline-dotted"
                    >
                        SAVE_DATA
                    </button>
                </div>

            </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;