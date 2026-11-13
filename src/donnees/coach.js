// Lit les réglages du coach vocal dans coach.json : pour en changer, modifier ce fichier JSON.
// `depart` reprend le brief (3 min de round, 1 min de repos, 2 à 3 rounds). Les rythmes,
// en secondes entre deux combos, sont une proposition de départ, pas une donnée sourcée.

const reponse = await fetch(new URL('./coach.json', import.meta.url));

export const REGLAGES_COACH = await reponse.json();
