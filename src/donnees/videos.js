// Lit la bibliothèque vidéo dans videos.json : une ligne par vidéo, pour en ajouter ou en retirer une.
// Chaque vidéo a été vérifiée auprès de YouTube (en ligne, titre et chaîne exacts, lecture intégrable).
// Les niveaux sont indicatifs : ils viennent de la recherche fournie par Corentin, pas d'un coach.
const reponse = await fetch(new URL('./videos.json', import.meta.url));
export const BIBLIOTHEQUE = await reponse.json();
