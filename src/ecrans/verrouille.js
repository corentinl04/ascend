import { icone } from '../ui/composants.js';

// Zone pas encore construite : on dit laquelle et à quelle mission elle arrive.
export const verrouille = ({ titre, mission, texte }) => (conteneur) => {
  conteneur.innerHTML = `<section class="carte verrou">
    ${icone('cadenas', 88)}
    <h1>${titre}</h1>
    <p class="or">Zone verrouillée : mission ${mission}</p>
    <p class="discret">${texte}</p>
    <a class="bouton" href="#/">Retour au camp</a>
  </section>`;
};
