// Combos du coach vocal, traduits des listes publiées par les deux sources ci-dessous.
// Rockstar Academy donne le niveau de ses combos. Evolve MMA n'en donne pas : ils sont
// classés au nombre de techniques (3 au plus : base, 4 : intermédiaire, 5 : avancé).
// Gauche et droite dans les sources (garde orthodoxe) sont notés avant et arrière.
// Les combos qui finissent en clinch sont écartés : ils demandent un partenaire.

export const SOURCES = {
  evolve: { nom: 'Evolve MMA', url: 'https://evolve-mma.com/blog/16-basic-muay-thai-combinations-you-should-master-first/' },
  rockstar: { nom: 'Rockstar Academy', url: 'https://www.rockstaracademy.com/blog/muay-thai-combos' },
};

export const NIVEAUX = [
  { id: 1, nom: 'Base' },
  { id: 2, nom: 'Intermédiaire' },
  { id: 3, nom: 'Avancé' },
];

export const COMBOS = [
  { niveau: 1, source: 'rockstar', coups: ['Jab', 'direct'] },
  { niveau: 1, source: 'rockstar', coups: ['Crochet avant', 'direct'] },
  { niveau: 1, source: 'rockstar', coups: ['Jab', 'direct', 'crochet'] },
  { niveau: 1, source: 'rockstar', coups: ['Teep', 'direct', 'crochet avant'] },
  { niveau: 1, source: 'rockstar', coups: ['Low kick', 'direct', 'crochet'] },
  { niveau: 1, source: 'rockstar', coups: ['Direct', 'crochet', 'coude'] },
  { niveau: 1, source: 'evolve', coups: ['Jab', 'circulaire arrière'] },
  { niveau: 1, source: 'evolve', coups: ['Jab', 'direct', 'switch kick'] },
  { niveau: 1, source: 'evolve', coups: ['Double jab', 'teep'] },
  { niveau: 1, source: 'evolve', coups: ['Jab', 'direct', 'coude avant'] },
  { niveau: 1, source: 'evolve', coups: ['Low kick intérieur', 'direct'] },
  { niveau: 1, source: 'evolve', coups: ['Jab', 'feinte', 'circulaire avant au corps'] },
  { niveau: 1, source: 'evolve', coups: ['Direct', 'jab', 'direct'] },
  { niveau: 1, source: 'evolve', coups: ['Crochet avant', 'low kick'] },
  { niveau: 1, source: 'evolve', coups: ['Teep', 'feinte', 'genou'] },
  { niveau: 1, source: 'evolve', coups: ['Low kick intérieur', 'double circulaire'] },
  { niveau: 1, source: 'evolve', coups: ['Direct au corps', 'genou arrière', 'coude arrière'] },

  { niveau: 2, source: 'rockstar', coups: ['Jab', 'teep', 'genou arrière'] },
  { niveau: 2, source: 'rockstar', coups: ['Crochet avant', 'circulaire arrière', 'direct'] },
  { niveau: 2, source: 'rockstar', coups: ['Jab', 'direct', 'teep'] },
  { niveau: 2, source: 'evolve', coups: ['Jab', 'direct', 'crochet', 'circulaire arrière'] },
  { niveau: 2, source: 'evolve', coups: ['Jab', 'direct', 'uppercut avant', 'low kick'] },
  { niveau: 2, source: 'evolve', coups: ['Jab', 'direct', 'genou avant', 'coude arrière'] },
  { niveau: 2, source: 'evolve', coups: ['Jab', 'direct', 'crochet avant au corps', 'circulaire arrière'] },

  { niveau: 3, source: 'rockstar', coups: ['Jab', 'direct', 'crochet', 'coude'] },
  { niveau: 3, source: 'rockstar', coups: ['Teep avant', 'genou arrière', 'switch kick', 'direct'] },
  { niveau: 3, source: 'rockstar', coups: ['Feinte de pied', 'direct', 'crochet', 'low kick'] },
  { niveau: 3, source: 'evolve', coups: ['Uppercut avant', 'direct', 'crochet avant au corps', 'genou en switch', 'coude'] },
];
