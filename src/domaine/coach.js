// Coach vocal : déroulé des rounds et choix des combos. Logique sans DOM.

import { COMBOS } from '../donnees/combos.js';

const CLE = 'ascend.coach.v1';

export const PREPARATION = 10; // Le temps de poser le téléphone et de se mettre en garde.
export const FIN_DE_PHASE = 10; // Annonce « Dix secondes », et plus de combo ensuite.

// Le brief fixe 3 min de round, 1 min de repos et 2 à 3 rounds. Niveau et rythme sont
// choisis à la main jusqu'à la mission 5, qui les liera aux tests.
const DEPART = { rounds: 3, roundSecondes: 180, reposSecondes: 60, niveau: 1, rythme: 8 };

export function lireReglages() {
  try {
    return { ...DEPART, ...JSON.parse(localStorage.getItem(CLE)) };
  } catch {
    return DEPART;
  }
}

export function ecrireReglages(reglages) {
  try {
    localStorage.setItem(CLE, JSON.stringify(reglages));
  } catch {
    // Sans stockage, les réglages servent quand même pour cette séance.
  }
}

export const dureeTotale = ({ rounds, roundSecondes, reposSecondes }) =>
  PREPARATION + rounds * roundSecondes + (rounds - 1) * reposSecondes;

// Calculé depuis le temps écoulé : un minuteur ralenti par le téléphone ne décale rien.
export function etatSeance({ rounds, roundSecondes, reposSecondes }, ecoule) {
  if (ecoule < PREPARATION) return { phase: 'preparation', round: 1, restant: PREPARATION - ecoule, duree: PREPARATION };
  const bloc = roundSecondes + reposSecondes;
  const round = Math.floor((ecoule - PREPARATION) / bloc) + 1;
  const dansBloc = (ecoule - PREPARATION) % bloc;
  if (round > rounds || (round === rounds && dansBloc >= roundSecondes)) return { phase: 'fini', round: rounds, restant: 0, duree: 0 };
  if (dansBloc < roundSecondes) return { phase: 'round', round, restant: roundSecondes - dansBloc, duree: roundSecondes };
  return { phase: 'repos', round, restant: bloc - dansBloc, duree: reposSecondes };
}

// Un niveau comprend aussi les combos des niveaux en dessous.
export const combosJusquA = (niveau) => COMBOS.filter((c) => c.niveau <= niveau);

export function tirerCombo(combos, precedent, hasard = Math.random) {
  const possibles = combos.filter((c) => c !== precedent);
  return possibles[Math.floor(hasard() * possibles.length)];
}

// On laisse à Corentin le temps de placer chaque coup avant l'annonce suivante.
export const prochaineAnnonce = (ecoule, combo, rythme) => ecoule + rythme + combo.coups.length;

export const texteCombo = (combo) => combo.coups.join(', ');
