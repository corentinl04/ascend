// Lit les fiches techniques dans fiches.json : pour changer une étape, une erreur ou un conseil, modifier ce fichier JSON.
// Contenu traduit et résumé depuis les sources citées dans chaque fiche (Evolve MMA, Sean Fagan, World Muaythai Magazine).
// « techniques » relie une fiche aux vidéos de videos.json qui portent exactement ce nom de technique.
const reponse = await fetch(new URL('./fiches.json', import.meta.url));
export const FICHES = await reponse.json();
