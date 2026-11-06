// Journal des séances : logique sans DOM. Les séances saisies sont des données réelles.

const CLE = 'ascend.journal.v1';
const CLE_SECOURS = 'ascend.journal.illisible';

export const TYPES = {
  muayThai: [
    { id: 'technique', nom: 'Technique' },
    { id: 'cardio', nom: 'Cardio' },
    { id: 'renfo', nom: 'Renfo' },
  ],
  course: [
    { id: 'fractionne', nom: 'Fractionné' },
    { id: 'sortie', nom: 'Sortie longue' },
    { id: 'libre', nom: 'Sortie libre' },
  ],
};

export const DISCIPLINES = { muayThai: 'Muay Thai', course: 'Course' };

export function dateIso(date) {
  const mois = String(date.getMonth() + 1).padStart(2, '0');
  const jour = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${mois}-${jour}`;
}

export function lireSeances() {
  const brut = localStorage.getItem(CLE);
  if (!brut) return [];
  try {
    const seances = JSON.parse(brut);
    if (Array.isArray(seances)) return seances;
  } catch {
    // Traité juste dessous : on garde le contenu illisible au lieu de l'écraser.
  }
  localStorage.setItem(CLE_SECOURS, brut);
  return [];
}

const ecrire = (seances) => localStorage.setItem(CLE, JSON.stringify(seances));

// Renvoie la liste des erreurs à afficher. Vide si la séance est valide.
export function verifier(seance, aujourdhui) {
  const erreurs = [];
  if (!seance.date || seance.date > aujourdhui) erreurs.push('Choisis une date qui n\'est pas dans le futur.');
  if (!(seance.dureeSecondes > 0)) erreurs.push('Indique la durée.');
  if (seance.discipline === 'course' && !(seance.distanceKm > 0)) erreurs.push('Indique la distance.');
  if (!(seance.difficulte >= 1 && seance.difficulte <= 10)) erreurs.push('Note la difficulté de 1 à 10.');
  return erreurs;
}

export function ajouterSeance(seance) {
  // Pas de crypto.randomUUID : il n'existe pas en http sur un téléphone du réseau local.
  const id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  const enregistree = { ...seance, id, creeLe: new Date().toISOString() };
  ecrire([...lireSeances(), enregistree]);
  return enregistree;
}

export const supprimerSeance = (id) => ecrire(lireSeances().filter((s) => s.id !== id));

// La plus récente d'abord, et à date égale la dernière saisie d'abord.
export const trierSeances = (seances) =>
  [...seances].sort((a, b) => b.date.localeCompare(a.date) || b.creeLe.localeCompare(a.creeLe));

export const nomType = (seance) =>
  TYPES[seance.discipline]?.find((t) => t.id === seance.type)?.nom ?? seance.type;

export function formaterDuree(secondes) {
  const heures = Math.floor(secondes / 3600);
  const minutes = Math.floor((secondes % 3600) / 60);
  const reste = String(Math.round(secondes % 60)).padStart(2, '0');
  if (heures) return `${heures} h ${String(minutes).padStart(2, '0')}`;
  return `${minutes}:${reste}`;
}

export function allure(dureeSecondes, distanceKm) {
  const parKm = Math.round(dureeSecondes / distanceKm);
  return `${Math.floor(parKm / 60)}:${String(parKm % 60).padStart(2, '0')} /km`;
}
