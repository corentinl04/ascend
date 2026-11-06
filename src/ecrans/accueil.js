import { PROFIL } from '../donnees/profil.js';
import { DEMO } from '../donnees/demo.js';
import { SEMAINES_PAR_CYCLE, INTERVALLE_TESTS, dateCourte, prochainTest, seanceDuJour, semaine } from '../domaine/programme.js';
import { comparer, formaterMesure } from '../domaine/rival.js';
import { animerCompteurs, barre, icone, jauge, tamponDemo, tamponReel, titreSection } from '../ui/composants.js';

const fr = (n) => n.toLocaleString('fr-FR');

const TESTS = [
  ['eclair', 'Vitesse'], ['coeur', 'Endurance'], ['corde', 'Corde'],
  ['haltere', 'Condition'], ['medaille', 'Technique'], ['chaussure', 'Course'],
];

const RACCOURCIS = [
  ['livre', 'Journal', '#/journal'],
  ['gant', 'Combos', '#/combos'],
  ['cible', 'Tests', '#/tests'],
];

const RIVAUX = [
  { id: '15', onglet: '15 j', nom: 'Toi il y a 15 jours', fantome: DEMO.anciens[15] },
  { id: '30', onglet: '30 j', nom: 'Toi il y a 30 jours', fantome: DEMO.anciens[30] },
  { id: '90', onglet: '90 j', nom: 'Toi il y a 90 jours', fantome: DEMO.anciens[90] },
  {
    id: 'meilleur',
    onglet: 'Records',
    nom: 'Ton meilleur toi',
    fantome: { ...DEMO.meilleurs, cinqKm: PROFIL.records.cinqKm.secondes, dixKm: PROFIL.records.dixKm.secondes },
    reels: { cinqKm: PROFIL.records.cinqKm, dixKm: PROFIL.records.dixKm },
  },
];

const ACTIONS = {
  muayThai: `<a class="bouton" href="#/coach">Lancer la séance</a>`,
  course: `<a class="bouton" href="#/journal">Noter ma sortie</a>`,
};

const ICONE_DISCIPLINE = { muayThai: 'gant', course: 'chaussure', repos: 'lune' };

const salutation = (date) => (date.getHours() < 5 || date.getHours() >= 18 ? 'Bonsoir,' : 'Bonjour,');

function heros(date) {
  const { niveau, xp, xpMax } = DEMO.niveaux.global;
  const { restants } = prochainTest(date, DEMO.joursDepuisDernierTest);
  const raccourcis = RACCOURCIS.map(([i, nom, lien]) => `<a class="raccourci" href="${lien}">${icone(i, 30)}<span>${nom}</span></a>`).join('');
  return `<section class="heros">
    <div class="heros-pastilles">
      <p class="pastille pastille-feu">${icone('feu', 20)}Série ${DEMO.serie} j</p>
      <p class="pastille">${icone('cible', 18)}Test J-${restants}</p>
      ${tamponDemo()}
    </div>
    <div class="heros-texte">
      <p class="salut">${salutation(date)}</p>
      <h1>${PROFIL.prenom}</h1>
      <p class="niveau-libelle">Niveau</p>
      <p class="niveau-chiffre">${niveau}</p>
      <p class="rang">Classe ${PROFIL.muayThai.classe}</p>
      <p class="xp-ligne"><span data-compteur="${xp}">${fr(xp)}</span> / ${fr(xpMax)} XP</p>
      ${barre(xp, xpMax)}
      <p class="xp-note">Niveau ${niveau + 1} : au prochain test</p>
    </div>
    <img class="heros-combattant" src="assets/images/combattant.png" alt="Ton combattant en garde">
    <nav class="raccourcis" aria-label="Raccourcis">${raccourcis}</nav>
  </section>`;
}

function colonne(iconeNom, nom, niveau, sousTexte, valeur, max, couleur) {
  return `<div class="colonne">
    <p class="colonne-nom">${icone(iconeNom, 22)}${nom}</p>
    <p class="colonne-chiffre">${niveau}</p>
    <p class="colonne-sous">${sousTexte}</p>
    ${barre(valeur, max, couleur)}
  </div>`;
}

function force(date) {
  const { muayThai, course } = DEMO.niveaux;
  const { restants, ecoules, date: jour } = prochainTest(date, DEMO.joursDepuisDernierTest);
  const epreuves = TESTS.map(([i, nom]) => `<li>${icone(i, 26)}<span>${nom}</span></li>`).join('');
  return `<section class="carte">
    ${titreSection('Ta progression')}
    <div class="colonnes">
      ${colonne('gant', 'Muay Thai', `Niv. ${muayThai.niveau}`, `${fr(muayThai.xp)} XP`, muayThai.xp, muayThai.xpMax, 'rouge')}
      ${colonne('chaussure', 'Course', `Niv. ${course.niveau}`, `${fr(course.xp)} XP`, course.xp, course.xpMax, 'vert')}
      ${colonne('lune', 'Cycle', `S${DEMO.cycle.semaine}`, `sur ${SEMAINES_PAR_CYCLE} semaines`, DEMO.cycle.semaine, SEMAINES_PAR_CYCLE, 'bleu')}
    </div>
    <div class="encart test">
      ${icone('bouclier', 40)}
      <div class="test-texte">
        <p><span class="or">Prochain test :</span> J-${restants}</p>
        <p class="discret">${dateCourte(jour)}. Le niveau ne monte que si tes tests progressent.</p>
      </div>
      ${jauge(ecoules / INTERVALLE_TESTS, `J-${restants}`)}
    </div>
    <ul class="epreuves" aria-label="Épreuves du test">${epreuves}</ul>
  </section>`;
}

function quete(date) {
  const seance = seanceDuJour(date);
  const jours = semaine(date)
    .map((j) => `<li class="jour${j.aujourdhui ? ' jour-actif' : ''}" ${j.aujourdhui ? 'aria-current="date"' : ''}>
      <span>${j.lettre}</span>${icone(ICONE_DISCIPLINE[j.discipline], 22)}<span class="sr">${j.titre}</span>
    </li>`)
    .join('');
  const etapes = seance.etapes.map((e) => `<li>${e}</li>`).join('');
  return `<section class="carte quete">
    ${titreSection('Séance du jour')}
    <div class="quete-tete">
      ${icone('parchemin', 58)}
      <div>
        <p class="quete-titre">${seance.titre}</p>
        <p class="discret">${seance.detail}</p>
      </div>
    </div>
    ${etapes ? `<ol class="etapes">${etapes}</ol>` : ''}
    ${ACTIONS[seance.discipline] ?? ''}
    <ul class="semaine" aria-label="Programme de la semaine">${jours}</ul>
  </section>`;
}

function ligneRival(l, rival) {
  const reel = rival.reels?.[l.mesure.cle];
  const valeur = `${reel?.approx ? '~' : ''}${formaterMesure(l.mesure, l.rival)}`;
  const classeIssue = l.issue > 0 ? 'gagne' : l.issue < 0 ? 'perdu' : 'egal';
  return `<tr class="${classeIssue}">
    <td class="valeur-toi">${formaterMesure(l.mesure, l.toi)}</td>
    <th scope="row">${icone(l.mesure.icone, 22)}<span>${l.mesure.nom}</span></th>
    <td class="valeur-rival">${valeur}${reel ? tamponReel() : ''}</td>
  </tr>`;
}

function duel(rival) {
  const { lignes, gagnes, perdus } = comparer(DEMO.actuel, rival.fantome);
  const verdict = gagnes > perdus ? 'Tu mènes' : gagnes < perdus ? 'Il te reste à le battre' : 'Égalité';
  return `<div class="duel-tete">
      <figure><img src="assets/images/combattant.png" alt=""><figcaption>Toi</figcaption></figure>
      <div class="score-bloc">
        <p class="score"><span class="or">${gagnes}</span><span class="tiret">-</span><span class="spectre">${perdus}</span></p>
        <p class="verdict">${verdict}</p>
      </div>
      <figure><img src="assets/images/fantome.png" alt=""><figcaption>${rival.nom}</figcaption></figure>
    </div>
    <table class="duel-table">
      <caption class="sr">Comparaison avec ${rival.nom}</caption>
      <tbody>${lignes.map((l) => ligneRival(l, rival)).join('')}</tbody>
    </table>`;
}

function rival() {
  const onglets = RIVAUX.map((r, i) => `<button role="tab" id="onglet-${r.id}" data-rival="${r.id}" aria-selected="${i === 0}" aria-controls="duel">${r.onglet}</button>`).join('');
  return `<section class="carte rival">
    ${titreSection('Ton rival')}
    <div class="onglets" role="tablist" aria-label="Choisir un rival">${onglets}</div>
    <div id="duel" role="tabpanel" aria-labelledby="onglet-15">${duel(RIVAUX[0])}</div>
  </section>`;
}

function brancherRival(racine) {
  const liste = racine.querySelector('.onglets');
  const zone = racine.querySelector('#duel');
  liste.addEventListener('click', (evenement) => {
    const bouton = evenement.target.closest('[data-rival]');
    if (!bouton) return;
    liste.querySelectorAll('[role=tab]').forEach((b) => b.setAttribute('aria-selected', String(b === bouton)));
    zone.setAttribute('aria-labelledby', bouton.id);
    zone.innerHTML = duel(RIVAUX.find((r) => r.id === bouton.dataset.rival));
  });
}

export function accueil(conteneur) {
  const maintenant = new Date();
  conteneur.innerHTML = `${heros(maintenant)}${force(maintenant)}${quete(maintenant)}${rival()}`;
  brancherRival(conteneur);
  animerCompteurs(conteneur);
}
