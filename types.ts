
export enum Difficulty {
  CANTRIP = 'Cantrip (Très Facile)',
  LEVEL_1 = 'Niveau 1 (Facile)',
  LEVEL_3 = 'Niveau 3 (Moyen)',
  LEVEL_9 = 'Niveau 9 (Héroïque)'
}

export interface Ingredient {
  name: string;
  quantity: string;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  ingredients: Ingredient[];
  instructions: string[];
  prepTime: string; // "Casting Time"
  difficulty: Difficulty;
  statBonus: string; // e.g., "+2 CHA"
  imageUrl?: string; // New field for API images
  isCriticalSuccess?: boolean;
  isCriticalFail?: boolean;
}

export interface Track {
  id: string;
  title: string;
  artist: string;
  duration: string;
  bpm: number;
}

export interface Project {
  id: string;
  title: string;
  category: 'Food' | 'D&D' | 'Craft';
  xpValue: number;
  image: string;
  date: string;
}

export type ViewState = 'HOME' | 'KITCHEN' | 'TAVERN' | 'INVENTORY';
