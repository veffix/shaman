import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import DiceKitchen from './components/DiceKitchen';
import SonicTavern from './components/SonicTavern';
import Inventory from './components/Inventory';
import { ViewState, Recipe, Difficulty, Ingredient } from './types';
import { PLAYLIST, STANDARD_RECIPES } from './constants';
import { X, Save, Disc } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('HOME');
  const [xp, setXp] = useState(1250); // Starting XP
  const [gold, setGold] = useState(50); // Starting Gold
  const level = Math.floor(xp / 1000) + 1;

  // --- Recipes State (Global) ---
  const [recipes, setRecipes] = useState<Recipe[]>(STANDARD_RECIPES);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isLoadingRecipes, setIsLoadingRecipes] = useState(false);

  // --- API Logic (TheMealDB) ---
  
  // Helper to map API Category to RPG Stats
  const getStatBonusFromCategory = (category: string): string => {
      const stats: {[key: string]: string} = {
          'Beef': '+3 STR', 'Lamb': '+3 STR', 'Pork': '+3 STR',
          'Chicken': '+3 DEX', 'Seafood': '+4 DEX',
          'Vegetarian': '+3 WIS', 'Vegan': '+4 WIS', 'Starter': '+2 WIS',
          'Dessert': '+3 CHA', 'Breakfast': '+2 CON',
          'Pasta': '+2 CON', 'Side': '+1 INT', 'Miscellaneous': '+2 INT'
      };
      return stats[category] || '+2 CON';
  };

  const getDifficultyFromIngredients = (count: number): Difficulty => {
      if (count <= 5) return Difficulty.LEVEL_1;
      if (count <= 10) return Difficulty.LEVEL_3;
      return Difficulty.LEVEL_9;
  };

  // Generic mapper from TheMealDB format to our RPG Recipe format
  const mapMealToRecipe = (meal: any): Recipe => {
      // Extract Ingredients
      const ingredients: Ingredient[] = [];
      for (let i = 1; i <= 20; i++) {
          const name = meal[`strIngredient${i}`];
          const measure = meal[`strMeasure${i}`];
          if (name && name.trim() !== '') {
              ingredients.push({ name: name, quantity: measure || 'QS' });
          }
      }

      // Parse Instructions
      const instructions = meal.strInstructions
        ? meal.strInstructions.split(/\r\n|\n|\r/).filter((line: string) => line.trim().length > 10)
        : ['Suivre votre intuition.'];

      return {
          id: meal.idMeal,
          title: meal.strMeal, // Keep English title for authenticity of the scroll
          description: `Une recette exotique venue de la région ${meal.strArea}. (Scroll in Common Tongue)`,
          ingredients: ingredients,
          instructions: instructions.length > 0 ? instructions : ['Suivre votre intuition.'],
          prepTime: `${Math.floor(Math.random() * 40 + 20)} min`,
          difficulty: getDifficultyFromIngredients(ingredients.length),
          statBonus: getStatBonusFromCategory(meal.strCategory),
          imageUrl: meal.strMealThumb
      };
  };

  // Fetch massive amount of data by letters
  const fetchInitialRecipes = async () => {
    setIsLoadingRecipes(true);
    try {
        // Fetch recipes starting with multiple letters to populate the grimoire efficiently
        // 'a' = American/etc, 'b' = Beef/Breakfast, 'c' = Chicken/Cake, 'p' = Pasta/Pork
        const letters = ['a', 'b', 'c', 'p']; 
        const promises = letters.map(char => 
            fetch(`https://www.themealdb.com/api/json/v1/1/search.php?f=${char}`).then(res => res.json())
        );
        
        const results = await Promise.all(promises);
        
        let allMeals: any[] = [];
        results.forEach(data => {
            if (data.meals) allMeals = [...allMeals, ...data.meals];
        });

        const newRecipes: Recipe[] = allMeals.map(mapMealToRecipe);

        // Deduplicate and update state
        setRecipes(prev => {
            const existingIds = new Set(prev.map(r => r.id));
            const uniqueNewRecipes = newRecipes.filter(r => !existingIds.has(r.id));
            return [...prev, ...uniqueNewRecipes];
        });

    } catch (error) {
        console.error("Failed to fetch initial recipes from the dungeon archives:", error);
    } finally {
        setIsLoadingRecipes(false);
    }
  };

  // Fetch 10 random recipes (for the "Random" button action)
  const fetchRandomApiRecipes = async () => {
      setIsLoadingRecipes(true);
      try {
          const promises = Array.from({ length: 10 }).map(() => 
            fetch('https://www.themealdb.com/api/json/v1/1/random.php').then(res => res.json())
          );
          const results = await Promise.all(promises);
          const newRecipes: Recipe[] = results.map(data => mapMealToRecipe(data.meals[0]));

          setRecipes(prev => {
              const existingIds = new Set(prev.map(r => r.id));
              const uniqueNewRecipes = newRecipes.filter(r => !existingIds.has(r.id));
              return [...prev, ...uniqueNewRecipes];
          });

      } catch (error) {
          console.error("Random spell failed:", error);
      } finally {
          setIsLoadingRecipes(false);
      }
  };

  const handleSearchApiRecipes = async (query: string) => {
    if (!query.trim()) return;
    setIsLoadingRecipes(true);
    try {
        const res = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${query}`);
        const data = await res.json();
        
        if (data.meals) {
            const newRecipes = data.meals.map((meal: any) => mapMealToRecipe(meal));
            setRecipes(prev => {
                const existingIds = new Set(prev.map(r => r.id));
                const uniqueNewRecipes = newRecipes.filter((r: Recipe) => !existingIds.has(r.id));
                return [...prev, ...uniqueNewRecipes];
            });
        }
    } catch (error) {
        console.error("Search spell failed:", error);
    } finally {
        setIsLoadingRecipes(false);
    }
  };

  // Initial Fetch on Mount
  useEffect(() => {
    fetchInitialRecipes();
  }, []);

  // --- Navigation Handler ---
  const handleViewChange = (view: ViewState) => {
    setCurrentView(view);
    // Clear selected recipe if leaving kitchen to avoid it persisting when returning manually
    if (view !== 'KITCHEN') {
        setSelectedRecipe(null);
    }
  };

  const handleSelectRecipe = (recipe: Recipe) => {
      setSelectedRecipe(recipe);
      setCurrentView('KITCHEN');
  };

  // --- Default Playlist Configuration ---
  const DEFAULT_PLAYLIST_URL = 'https://open.spotify.com/playlist/0PLEVb9jlXz2Y9K4JMDa6C?si=5711e905448f4255';
  // Helper to convert standard URL to Embed URL
  const getEmbedUrl = (url: string) => {
    if (url.includes('open.spotify.com') && !url.includes('/embed')) {
        return url.replace('open.spotify.com', 'open.spotify.com/embed');
    }
    return url;
  };

  // --- Global Music State ---
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIdx, setCurrentTrackIdx] = useState(0);
  
  // Initialize with the default playlist linked
  const [isSpotifyLinked, setIsSpotifyLinked] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [spotifyPlaylistUrl, setSpotifyPlaylistUrl] = useState(DEFAULT_PLAYLIST_URL);
  const [spotifyEmbedUrl, setSpotifyEmbedUrl] = useState<string | null>(getEmbedUrl(DEFAULT_PLAYLIST_URL));

  const currentTrack = PLAYLIST[currentTrackIdx];

  const handlePlayToggle = () => {
    if (isSpotifyLinked) {
        setIsPlaying(!isPlaying);
    } else {
        setShowSettings(true);
    }
  };

  const handleNextTrack = () => {
    if (isSpotifyLinked) {
        setCurrentTrackIdx((prev) => (prev + 1) % PLAYLIST.length);
        setIsPlaying(true);
    }
  };

  const handlePrevTrack = () => {
    if (isSpotifyLinked) {
        setCurrentTrackIdx((prev) => (prev - 1 + PLAYLIST.length) % PLAYLIST.length);
        setIsPlaying(true);
    }
  };

  const handleAddXp = (amount: number) => {
    setXp((prev) => prev + amount);
  };

  const handleAddGold = (amount: number) => {
    setGold((prev) => prev + amount);
  };

  const handleAddRecipe = (newRecipe: Recipe) => {
    setRecipes((prev) => [...prev, newRecipe]);
  };

  // --- Settings Logic ---
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (spotifyPlaylistUrl.trim().length > 0) {
        const embedUrl = getEmbedUrl(spotifyPlaylistUrl);
        
        setSpotifyEmbedUrl(embedUrl);
        setIsSpotifyLinked(true);
        setShowSettings(false);
        // Simulate connection XP
        handleAddXp(50);
        handleAddGold(10);
        setIsPlaying(true); // Flag for visualizer
    }
  };

  const renderView = () => {
    switch (currentView) {
      case 'KITCHEN':
        return (
            <DiceKitchen 
                changeView={handleViewChange} 
                addXp={handleAddXp} 
                addGold={handleAddGold} 
                recipes={recipes} 
                selectedRecipe={selectedRecipe}
            />
        );
      case 'TAVERN':
        // Tavern now receives props to sync with global state
        return (
            <SonicTavern 
                changeView={handleViewChange} 
                isPlaying={isPlaying}
                currentTrack={currentTrack}
                onTogglePlay={handlePlayToggle}
                onNext={handleNextTrack}
                onPrev={handlePrevTrack}
                isSpotifyLinked={isSpotifyLinked}
            />
        );
      case 'INVENTORY':
        return (
            <Inventory 
                changeView={handleViewChange} 
                xp={xp} 
                gold={gold} 
                recipes={recipes}
                onAddRecipe={handleAddRecipe}
                onSelectRecipe={handleSelectRecipe}
                addXp={handleAddXp}
                addGold={handleAddGold}
                onFetchMore={fetchRandomApiRecipes}
                onSearch={handleSearchApiRecipes}
                isLoading={isLoadingRecipes}
            />
        );
      case 'HOME':
      default:
        return <Hero currentView={currentView} changeView={handleViewChange} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
      {/* HUD Header with Music Controls */}
      <Header 
        xp={xp} 
        level={level} 
        gold={gold}
        musicState={{ isPlaying, currentTrack, isSpotifyLinked }}
        musicControls={{ togglePlay: handlePlayToggle, nextTrack: handleNextTrack, prevTrack: handlePrevTrack }}
        onOpenSettings={() => setShowSettings(true)}
        spotifyEmbedUrl={spotifyEmbedUrl}
      />

      {/* Main Content Area */}
      <main className="flex-grow flex flex-col relative overflow-hidden">
        
        {/* Decorative Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-fuchsia-900/20 rounded-full blur-[100px]"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-900/20 rounded-full blur-[100px]"></div>
        </div>

        <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-4">
            {renderView()}
        </div>
      </main>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-slate-900 border-2 border-cyan-500 rounded-xl p-6 max-w-md w-full shadow-[0_0_30px_rgba(34,211,238,0.3)]">
                <div className="flex justify-between items-center mb-6 border-b border-slate-700 pb-2">
                    <h2 className="font-pixel text-2xl text-cyan-400 flex items-center gap-2">
                        <Disc className="animate-spin-slow" /> CONFIGURATION DU COMPTE
                    </h2>
                    <button onClick={() => setShowSettings(false)} className="text-slate-400 hover:text-white">
                        <X size={24} />
                    </button>
                </div>
                
                <form onSubmit={handleSaveSettings} className="space-y-4">
                    <div>
                        <label className="block text-xs font-mono text-fuchsia-400 mb-2 uppercase tracking-wider">Lien Playlist Spotify</label>
                        <input 
                            type="text" 
                            placeholder="https://open.spotify.com/playlist/..."
                            value={spotifyPlaylistUrl}
                            onChange={(e) => setSpotifyPlaylistUrl(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-white focus:border-fuchsia-500 focus:outline-none font-mono text-sm"
                            autoFocus
                        />
                        <p className="text-xs text-slate-500 mt-2 italic">Collez l'URL de votre playlist Spotify ici pour l'intégrer au lecteur.</p>
                    </div>

                    <div className="pt-4 flex justify-end">
                        <button 
                            type="submit"
                            className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded flex items-center gap-2 transition-colors"
                        >
                            <Save size={18} /> ENREGISTRER & CONNECTER
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {/* Footer */}
      <footer className="py-6 text-center text-slate-600 text-xs font-mono border-t border-slate-800 bg-slate-900/90">
        <p>Fait avec ❤️ et de la Techno. Niveau {level} atteint.</p>
        <p className="mt-1 opacity-50">v1.0.0 [BETA_BUILD]</p>
      </footer>
    </div>
  );
};

export default App;