import { seanceDuJour, dateCourte } from '../domaine/programme.js';
import {
  DISCIPLINES, TYPES, ajouterSeance, allure, dateIso, formaterDuree, lireSeances,
  nomType, supprimerSeance, trierSeances, verifier,
} from '../domaine/journal.js';
import { choix, icone } from '../ui/composants.js';

const ICONES = { muayThai: 'gant', course: 'chaussure' };

const echapper = (texte) =>
  texte.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// Le programme du jour présélectionne le formulaire, on peut toujours en changer.
function selectionDepart(date) {
  const prevue = seanceDuJour(date);
  const discipline = prevue.discipline === 'repos' ? 'course' : prevue.discipline;
  return { discipline, type: TYPES[discipline].find((t) => prevue.titre.toLowerCase().includes(t.nom.toLowerCase()))?.id ?? TYPES[discipline][0].id };
}

const choixTypes = (discipline, selection) =>
  TYPES[discipline].map((t) => choix('type', t.id, t.nom, t.id === selection)).join('');

function formulaire(aujourdhui, depart) {
  const disciplines = Object.entries(DISCIPLINES).map(([id, nom]) => choix('discipline', id, nom, id === depart.discipline, ICONES[id])).join('');
  const notes = Array.from({ length: 10 }, (_, i) => choix('difficulte', i + 1, i + 1, false)).join('');
  return `<form class="carte formulaire" novalidate>
    <header class="section-tete"><h2>Noter une séance</h2></header>
    <div class="choix-ligne deux" role="radiogroup" aria-label="Discipline">${disciplines}</div>
    <div class="choix-ligne trois" role="radiogroup" aria-label="Type de séance" data-types>${choixTypes(depart.discipline, depart.type)}</div>
    <div class="champs">
      <label class="champ champ-date">Date<input type="date" name="date" value="${aujourdhui}" max="${aujourdhui}"></label>
      <label class="champ" data-distance>Distance (km)<input type="text" name="distance" inputmode="decimal" autocomplete="off" placeholder="0,0"></label>
      <label class="champ">Minutes<input type="number" name="minutes" inputmode="numeric" min="0" autocomplete="off" placeholder="0"></label>
      <label class="champ">Secondes<input type="number" name="secondes" inputmode="numeric" min="0" max="59" autocomplete="off" placeholder="0"></label>
    </div>
    <fieldset class="difficulte">
      <legend>Difficulté ressentie sur 10</legend>
      <div class="choix-ligne dix">${notes}</div>
    </fieldset>
    <label class="champ">Note (facultatif)<input type="text" name="note" maxlength="140" autocomplete="off"></label>
    <p class="erreurs" role="alert" hidden></p>
    <button class="bouton" type="submit">Enregistrer</button>
  </form>`;
}

function ligne(seance) {
  const mesures = [formaterDuree(seance.dureeSecondes)];
  if (seance.distanceKm) mesures.unshift(`${seance.distanceKm.toLocaleString('fr-FR')} km`);
  if (seance.distanceKm) mesures.push(allure(seance.dureeSecondes, seance.distanceKm));
  return `<li class="seance">
    ${icone(ICONES[seance.discipline], 32)}
    <div class="seance-texte">
      <p class="seance-titre">${DISCIPLINES[seance.discipline]} : ${nomType(seance)}</p>
      <p class="discret seance-date">${dateCourte(new Date(`${seance.date}T12:00:00`))}</p>
      <p class="seance-mesures">${mesures.join(' · ')}</p>
      ${seance.note ? `<p class="discret">${echapper(seance.note)}</p>` : ''}
      <button class="supprimer" type="button" data-supprimer="${seance.id}">Supprimer</button>
    </div>
    <p class="seance-note" aria-label="Difficulté ${seance.difficulte} sur 10">${seance.difficulte}<span>/10</span></p>
  </li>`;
}

function historique() {
  const seances = trierSeances(lireSeances());
  const contenu = seances.length
    ? `<ul class="seances">${seances.map(ligne).join('')}</ul>`
    : '<p class="discret">Aucune séance notée pour l\'instant.</p>';
  return `<header class="section-tete"><h2>Historique</h2></header>${contenu}`;
}

function lireFormulaire(form) {
  const champs = new FormData(form);
  const discipline = champs.get('discipline');
  const distanceKm = Number(String(champs.get('distance')).replace(',', '.'));
  const seance = {
    date: champs.get('date'),
    discipline,
    type: champs.get('type'),
    dureeSecondes: Number(champs.get('minutes')) * 60 + Number(champs.get('secondes')),
    difficulte: Number(champs.get('difficulte')),
    note: String(champs.get('note')).trim(),
  };
  return discipline === 'course' ? { ...seance, distanceKm } : seance;
}

function brancher(conteneur, aujourdhui) {
  const form = conteneur.querySelector('form');
  const zoneErreurs = form.querySelector('.erreurs');
  const zoneHistorique = conteneur.querySelector('.historique');
  const champDistance = form.querySelector('[data-distance]');

  const adapter = (discipline) => {
    form.querySelector('[data-types]').innerHTML = choixTypes(discipline, TYPES[discipline][0].id);
    champDistance.hidden = discipline !== 'course';
  };
  champDistance.hidden = new FormData(form).get('discipline') !== 'course';

  form.addEventListener('change', (e) => {
    if (e.target.name === 'discipline') adapter(e.target.value);
  });

  const afficherErreurs = (erreurs) => {
    zoneErreurs.textContent = erreurs.join(' ');
    zoneErreurs.hidden = !erreurs.length;
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const seance = lireFormulaire(form);
    const erreurs = verifier(seance, aujourdhui);
    afficherErreurs(erreurs);
    if (erreurs.length) return;
    try {
      ajouterSeance(seance);
    } catch {
      afficherErreurs(['Séance non enregistrée : le stockage du navigateur est indisponible.']);
      return;
    }
    const { discipline, type } = seance;
    form.reset();
    form.querySelector(`[name=discipline][value=${discipline}]`).checked = true;
    adapter(discipline);
    form.querySelector(`[name=type][value=${type}]`).checked = true;
    zoneHistorique.innerHTML = historique();
    zoneHistorique.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  // Deux appuis pour supprimer : on ne perd pas une séance sur un geste malheureux.
  zoneHistorique.addEventListener('click', (e) => {
    const bouton = e.target.closest('[data-supprimer]');
    if (!bouton) return;
    if (bouton.dataset.confirmer) {
      supprimerSeance(bouton.dataset.supprimer);
      zoneHistorique.innerHTML = historique();
      return;
    }
    bouton.dataset.confirmer = 'oui';
    bouton.textContent = 'Confirmer la suppression';
  });
}

export function journal(conteneur) {
  const maintenant = new Date();
  const aujourdhui = dateIso(maintenant);
  conteneur.innerHTML = `<h1 class="ecran-titre">Journal</h1>
    ${formulaire(aujourdhui, selectionDepart(maintenant))}
    <section class="carte historique">${historique()}</section>`;
  brancher(conteneur, aujourdhui);
}
