import { Difficulty, Project, Recipe, Track } from './types';

export const CRITICAL_FAIL_RECIPE: Recipe = {
  id: 'crit-fail',
  title: 'Invocation de la Pizza',
  description: "Le sort a échoué. Vos réserves de mana sont épuisées. Faites appel à un mercenaire (Uber Eats).",
  ingredients: [{ name: 'Smartphone', quantity: '1' }, { name: 'Carte de crédit', quantity: '1' }],
  instructions: ['Ouvrir l\'application de livraison.', 'Commander une 4 fromages.', 'Attendre le PNJ livreur.'],
  prepTime: '30-45 min',
  difficulty: Difficulty.CANTRIP,
  statBonus: '+5 PV, -2 DEX',
  isCriticalFail: true
};

export const CRITICAL_SUCCESS_RECIPE: Recipe = {
  id: 'crit-success',
  title: 'Le Festin des Héros (Lasagnes Maison)',
  description: "Un plat légendaire capable de restaurer tous les points de vie du groupe. Nécessite une grande concentration.",
  ingredients: [
    { name: 'Pâtes à lasagne', quantity: '500g' },
    { name: 'Viande hachée', quantity: '600g' },
    { name: 'Sauce tomate magique', quantity: '800g' },
    { name: 'Béchamel', quantity: '1L' },
    { name: 'Mozzarella', quantity: 'Beaucoup' }
  ],
  instructions: [
    'Préchauffer le four (Le Creuset Infernal) à 200°C.',
    'Faire revenir la viande avec les oignons.',
    'Assembler les couches tel un architecte nain.',
    'Cuire 40 minutes jusqu\'à ce que le fromage bouillonne comme de la lave.'
  ],
  prepTime: '1h 30min',
  difficulty: Difficulty.LEVEL_9,
  statBonus: '+20 PV, +5 CHA',
  isCriticalSuccess: true
};

export const STANDARD_RECIPES: Recipe[] = [];

export const PLAYLIST: Track[] = [
  { id: '1', title: 'Neon Dungeon', artist: 'CyberBard', duration: '4:20', bpm: 128 },
  { id: '2', title: 'Critical Bass', artist: 'D20 Drop', duration: '3:45', bpm: 140 },
  { id: '3', title: 'Mana Potion', artist: 'Alchemist', duration: '5:12', bpm: 124 },
  { id: '4', title: 'Boss Fight Techno', artist: 'Glitch Wizard', duration: '6:00', bpm: 150 },
];

export const PROJECTS: Project[] = [
  { id: '1', title: 'Campagne "La Tour Sombre"', category: 'D&D', xpValue: 500, image: 'https://picsum.photos/300/200?random=1', date: 'Hier' },
  { id: '2', title: 'Risotto aux Champignons Magiques', category: 'Food', xpValue: 200, image: 'https://picsum.photos/300/200?random=2', date: 'Il y a 2 jours' },
  { id: '3', title: 'Peinture Figurine Paladin', category: 'Craft', xpValue: 350, image: 'https://picsum.photos/300/200?random=3', date: 'Semaine dernière' },
];