// Lit les combos du coach vocal dans combos.json : pour en changer, modifier ce fichier JSON.
// Les combos sont traduits des listes publiées par les sources nommées dans le JSON.
// Rockstar Academy donne le niveau de ses combos. Evolve MMA n'en donne pas : ils sont
// classés au nombre de techniques (3 au plus : base, 4 : intermédiaire, 5 : avancé).
// Gauche et droite dans les sources (garde orthodoxe) sont notés avant et arrière.
// Les combos qui finissent en clinch sont écartés : ils demandent un partenaire.

const reponse = await fetch(new URL('./combos.json', import.meta.url));

export const { sources: SOURCES, niveaux: NIVEAUX, combos: COMBOS } = await reponse.json();
