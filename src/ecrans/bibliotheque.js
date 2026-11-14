import { BIBLIOTHEQUE } from '../donnees/videos.js';
import { FICHES } from '../donnees/fiches.js';
import { choix } from '../ui/composants.js';

const { categories, niveaux, videos, verifieLe } = BIBLIOTHEQUE;
const NOM_NIVEAU = Object.fromEntries(niveaux.map((n) => [n.id, n.nom]));
const FILTRES = { tout: () => true, seul: (v) => v.solo, partenaire: (v) => !v.solo };
// Une technique de vidéo mène à au plus une fiche.
const FICHE_DE = Object.fromEntries(FICHES.fiches.flatMap((f) => f.techniques.map((t) => [t, f])));

const echapper = (texte) =>
  texte.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const listeHtml = (balise, lignes) => `<${balise}>${lignes.map((l) => `<li>${echapper(l)}</li>`).join('')}</${balise}>`;

function ficheTechnique(f) {
  const sources = f.sources.map((id) => FICHES.sources[id])
    .map((s) => `<a href="${s.url}" target="_blank" rel="noopener">${echapper(s.nom)}</a>`).join(', ');
  return `<div class="fiche" data-fiche hidden>
      <p class="fiche-nom">${echapper(f.nom)}</p>
      <p class="fiche-titre">Étapes clés</p>
      ${listeHtml('ol', f.etapes)}
      <p class="fiche-titre">Erreurs fréquentes</p>
      ${listeHtml('ul', f.erreurs)}
      <button class="bouton bouton-second" type="button" data-conseil>Conseil du coach</button>
      <p class="fiche-conseil" hidden>${echapper(f.conseil)}</p>
      <p class="discret fiche-sources">Sources : ${sources}</p>
    </div>`;
}

function fiche(v) {
  const infos = [v.chaine, v.langue === 'FR' ? 'Français' : 'Anglais', NOM_NIVEAU[v.niveau], v.solo ? 'Seul' : 'Avec partenaire'];
  const technique = FICHE_DE[v.technique];
  return `<li class="video">
    <p class="video-technique">${echapper(v.technique)}</p>
    <p class="video-titre">${echapper(v.titre)}</p>
    <p class="discret video-infos">${infos.map(echapper).join(' · ')}</p>
    <div class="video-cadre" data-cadre="${v.id}" hidden></div>
    <div class="video-actions">
      <button class="bouton bouton-second" type="button" data-voir="${v.id}">Voir la vidéo</button>
      <a class="video-lien" href="https://www.youtube.com/watch?v=${v.id}" target="_blank" rel="noopener">Ouvrir sur YouTube</a>
    </div>
    ${technique ? `<button class="bouton bouton-second fiche-bouton" type="button" data-ouvrir-fiche>Fiche technique</button>${ficheTechnique(technique)}` : ''}
  </li>`;
}

function liste(filtre) {
  return categories.map((c) => {
    const choisies = videos.filter((v) => v.categorie === c.id && FILTRES[filtre](v));
    if (!choisies.length) return '';
    return `<details class="carte biblio-categorie">
      <summary><span>${c.nom}</span><span class="discret">${choisies.length}</span></summary>
      ${c.texte ? `<p class="discret biblio-texte">${c.texte}</p>` : ''}
      <ul class="videos">${choisies.map(fiche).join('')}</ul>
    </details>`;
  }).join('');
}

// Une seule vidéo à la fois : ouvrir une vidéo ferme la précédente.
function fermerVideos(racine) {
  racine.querySelectorAll('[data-cadre]:not([hidden])').forEach((cadre) => {
    cadre.innerHTML = '';
    cadre.hidden = true;
    racine.querySelector(`[data-voir="${cadre.dataset.cadre}"]`).textContent = 'Voir la vidéo';
  });
}

export function bibliotheque(conteneur) {
  const date = new Date(`${verifieLe}T12:00:00`).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  conteneur.innerHTML = `<h1 class="ecran-titre">Bibliothèque</h1>
    <section class="carte">
      <p class="discret biblio-intro">${videos.length} vidéos de coachs et de combattants. Toutes vérifiées le ${date} : en ligne, titre et chaîne exacts. La vidéo ne se charge que si tu appuies dessus. Niveaux indicatifs.</p>
      <div class="choix-ligne trois" role="radiogroup" aria-label="Filtrer">
        ${choix('filtre', 'tout', 'Toutes', true)}${choix('filtre', 'seul', 'Seul', false)}${choix('filtre', 'partenaire', 'Partenaire', false)}
      </div>
    </section>
    <div data-liste>${liste('tout')}</div>`;

  const zone = conteneur.querySelector('[data-liste]');
  conteneur.querySelector('[role=radiogroup]').addEventListener('change', (e) => {
    zone.innerHTML = liste(e.target.value);
  });

  zone.addEventListener('click', (e) => {
    const ouvrirFiche = e.target.closest('[data-ouvrir-fiche]');
    if (ouvrirFiche) {
      const panneau = ouvrirFiche.nextElementSibling;
      panneau.hidden = !panneau.hidden;
      ouvrirFiche.textContent = panneau.hidden ? 'Fiche technique' : 'Fermer la fiche';
      return;
    }
    const conseil = e.target.closest('[data-conseil]');
    if (conseil) {
      const texte = conseil.nextElementSibling;
      texte.hidden = !texte.hidden;
      return;
    }
    const bouton = e.target.closest('[data-voir]');
    if (!bouton) return;
    const cadre = zone.querySelector(`[data-cadre="${bouton.dataset.voir}"]`);
    const ouverte = !cadre.hidden;
    fermerVideos(zone);
    if (ouverte) return;
    cadre.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${bouton.dataset.voir}?autoplay=1&rel=0&playsinline=1"
      title="Vidéo" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>`;
    cadre.hidden = false;
    bouton.textContent = 'Fermer la vidéo';
  });

  // Une vidéo dans une catégorie qu'on replie s'arrête.
  zone.addEventListener('toggle', (e) => {
    if (!e.target.open) fermerVideos(e.target);
  }, true);
}
