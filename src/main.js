import { accueil } from './ecrans/accueil.js';
import { journal } from './ecrans/journal.js';
import { verrouille } from './ecrans/verrouille.js';
import { icone } from './ui/composants.js';

const ROUTES = [
  { id: '', nom: 'Camp', icone: 'feu', ecran: accueil },
  { id: 'journal', nom: 'Journal', icone: 'livre', ecran: journal },
  { id: 'coach', nom: 'Coach', icone: 'cor', ecran: verrouille({ titre: 'Coach vocal', mission: 3, texte: 'Minuteur de rounds et combos annoncés à voix haute pendant le shadow.' }) },
  { id: 'combos', nom: 'Combos', icone: 'gant', ecran: verrouille({ titre: 'Techniques et combos', mission: 4, texte: 'Fiches avec étapes clés, erreurs fréquentes et vidéo d\'un vrai coach.' }) },
  { id: 'tests', nom: 'Tests', icone: 'cible', ecran: verrouille({ titre: 'Tests', mission: 5, texte: 'Tests tous les 15 jours, niveaux, XP et rival.' }) },
];

const app = document.getElementById('app');
const nav = document.getElementById('nav');

nav.innerHTML = ROUTES.map((r) => `<a href="#/${r.id}" data-route="${r.id}">${icone(r.icone, 28)}<span>${r.nom}</span></a>`).join('');

function afficher() {
  const id = location.hash.replace(/^#\/?/, '');
  const route = ROUTES.find((r) => r.id === id) ?? ROUTES[0];
  route.ecran(app);
  window.scrollTo(0, 0);
  nav.querySelectorAll('a').forEach((a) => {
    if (a.dataset.route === route.id) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });
}

window.addEventListener('hashchange', afficher);
afficher();
