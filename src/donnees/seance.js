// Lit le déroulé de la séance guidée dans seance.json : pour changer un exercice ou une durée, modifier ce fichier JSON.
// Durées et ordre : planning du camp YOKKAO (10 min d'échauffement, 10 min de corde, 10 min de technique,
// abdos et retour au calme). Exercices solo et répétitions : Sean Fagan (muay-thai-guy.com).
// Un bloc sans « secondes » se fait à son rythme : on passe à la suite avec le bouton Suivant.
const reponse = await fetch(new URL('./seance.json', import.meta.url));
export const SEANCE = await reponse.json();
