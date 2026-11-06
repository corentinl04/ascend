import {
  FIN_DE_PHASE, combosJusquA, dureeTotale, ecrireReglages, etatSeance, lireReglages,
  prochaineAnnonce, texteCombo, tirerCombo,
} from '../domaine/coach.js';
import { formaterDuree } from '../domaine/journal.js';
import { NIVEAUX, SOURCES } from '../donnees/combos.js';
import { choix } from '../ui/composants.js';
import { cloche, dire, garderEcranAllume, libererEcran, preparerSon, taire, voixDisponible } from '../ui/voix.js';

const ROUNDS = [2, 3, 4, 5];
const DUREES = [[120, '2 min'], [180, '3 min'], [240, '4 min'], [300, '5 min']];
const REPOS = [[30, '30 s'], [60, '1 min'], [90, '1 min 30'], [120, '2 min']];
const RYTHMES = [[12, 'Calme'], [8, 'Soutenu'], [5, 'Intense']];

const DELAI_PREMIER_COMBO = 3;

const groupe = (titre, classe, options) =>
  `<fieldset class="difficulte"><legend>${titre}</legend><div class="choix-ligne ${classe}">${options}</div></fieldset>`;

const options = (nom, liste, selection) =>
  liste.map(([valeur, libelle]) => choix(nom, valeur, libelle, valeur === selection)).join('');

const texteTotal = (reglages) => `Durée totale : ${Math.ceil(dureeTotale(reglages) / 60)} min`;
const texteNiveau = (niveau) => `${combosJusquA(niveau).length} combos dans ce niveau`;

function ecranReglages(r) {
  const liens = Object.values(SOURCES).map((s) => `<a href="${s.url}" target="_blank" rel="noopener">${s.nom}</a>`).join(' et ');
  return `<h1 class="ecran-titre">Coach</h1>
    <form class="carte formulaire" novalidate>
      <header class="section-tete"><h2>Shadow guidé</h2></header>
      ${groupe('Nombre de rounds', 'quatre', options('rounds', ROUNDS.map((n) => [n, n]), r.rounds))}
      ${groupe('Durée d\'un round', 'quatre', options('roundSecondes', DUREES, r.roundSecondes))}
      ${groupe('Repos entre les rounds', 'quatre', options('reposSecondes', REPOS, r.reposSecondes))}
      ${groupe('Niveau des combos', 'trois', options('niveau', NIVEAUX.map((n) => [n.id, n.nom]), r.niveau))}
      <p class="discret coach-note" data-niveau>${texteNiveau(r.niveau)}</p>
      ${groupe('Rythme', 'trois', options('rythme', RYTHMES, r.rythme))}
      <p class="discret coach-note" data-total>${texteTotal(r)}</p>
      <p class="erreurs" ${voixDisponible() ? 'hidden' : ''}>Ce navigateur ne sait pas parler : tu auras le minuteur et les combos à l'écran, sans la voix.</p>
      <button class="bouton" type="submit">Démarrer</button>
      <button class="bouton bouton-second" type="button" data-essai>Tester la voix</button>
      <p class="discret coach-note">Combos tirés de ${liens}.</p>
    </form>`;
}

function lireFormulaire(form) {
  const champs = new FormData(form);
  const nombre = (nom) => Number(champs.get(nom));
  return {
    rounds: nombre('rounds'),
    roundSecondes: nombre('roundSecondes'),
    reposSecondes: nombre('reposSecondes'),
    niveau: nombre('niveau'),
    rythme: nombre('rythme'),
  };
}

function brancherReglages(conteneur, demarrer) {
  const form = conteneur.querySelector('form');
  form.addEventListener('change', () => {
    const reglages = lireFormulaire(form);
    form.querySelector('[data-total]').textContent = texteTotal(reglages);
    form.querySelector('[data-niveau]').textContent = texteNiveau(reglages.niveau);
  });
  form.querySelector('[data-essai]').addEventListener('click', () => {
    preparerSon();
    cloche();
    dire('Jab, direct, low kick');
  });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const reglages = lireFormulaire(form);
    ecrireReglages(reglages);
    demarrer(reglages);
  });
}

const ecranSeance = () => `<section class="carte coach-seance" data-phase="preparation">
    <p class="coach-phase" data-titre></p>
    <p class="coach-temps" role="timer" data-temps></p>
    <div class="coach-progres" aria-hidden="true"><span data-progres></span></div>
    <p class="coach-combo" aria-live="polite" data-combo></p>
    <p class="discret coach-note" data-veille hidden>Ton téléphone peut se mettre en veille : laisse l'écran allumé.</p>
    <div class="coach-actions">
      <button class="bouton" type="button" data-pause>Pause</button>
      <button class="bouton bouton-second" type="button" data-arret>Arrêter</button>
    </div>
  </section>`;

const ecranFin = (reglages) => `<section class="carte coach-seance" data-phase="fini">
    <p class="coach-phase">Séance terminée</p>
    <p class="coach-combo">${reglages.rounds} rounds de ${reglages.roundSecondes / 60} min</p>
    <a class="bouton" href="#/journal">Noter ma séance</a>
    <button class="bouton bouton-second" type="button" data-retour>Retour aux réglages</button>
  </section>`;

const titrePhase = ({ phase, round }, rounds) =>
  ({ preparation: 'Mets-toi en garde', round: `Round ${round} sur ${rounds}`, repos: 'Repos' }[phase]);

// Lance la séance et renvoie la fonction qui l'arrête.
function lancer(conteneur, reglages, retour) {
  conteneur.innerHTML = ecranSeance();
  document.body.classList.add('en-seance');
  const zone = conteneur.querySelector('.coach-seance');
  const champ = (nom) => zone.querySelector(`[data-${nom}]`);
  const combos = combosJusquA(reglages.niveau);

  let debut = Date.now();
  let enPause = null;
  let phaseVue = 'preparation-1';
  let annonce = Infinity;
  let dernier = null;
  let alerteFaite = false;

  const ecranAllume = async () => {
    champ('veille').hidden = await garderEcranAllume();
  };
  const reprendreEcran = () => {
    if (document.visibilityState === 'visible' && !enPause) ecranAllume();
  };

  const nettoyer = () => {
    clearInterval(minuteur);
    document.removeEventListener('visibilitychange', reprendreEcran);
    document.body.classList.remove('en-seance');
    libererEcran();
  };

  const terminer = () => {
    nettoyer();
    cloche(3);
    dire('Séance terminée');
    conteneur.innerHTML = ecranFin(reglages);
    conteneur.querySelector('[data-retour]').addEventListener('click', retour);
  };

  const entrerDans = (etat, ecoule) => {
    alerteFaite = false;
    if (etat.phase === 'round') {
      cloche();
      dire(`Round ${etat.round}`);
      champ('combo').textContent = '';
      annonce = ecoule + DELAI_PREMIER_COMBO;
    } else {
      cloche(2);
      dire('Repos');
      champ('combo').textContent = 'Respire, relâche les épaules';
    }
  };

  const tic = () => {
    const ecoule = (Date.now() - debut) / 1000;
    const etat = etatSeance(reglages, ecoule);
    if (etat.phase === 'fini') return terminer();

    const cle = `${etat.phase}-${etat.round}`;
    if (cle !== phaseVue) {
      phaseVue = cle;
      entrerDans(etat, ecoule);
    }

    if (etat.phase !== 'preparation' && etat.restant <= FIN_DE_PHASE && !alerteFaite) {
      alerteFaite = true;
      dire('Dix secondes');
      if (etat.phase === 'round') champ('combo').textContent = 'Dix secondes';
    }

    if (etat.phase === 'round' && etat.restant > FIN_DE_PHASE && ecoule >= annonce) {
      dernier = tirerCombo(combos, dernier);
      annonce = prochaineAnnonce(ecoule, dernier, reglages.rythme);
      dire(texteCombo(dernier));
      champ('combo').textContent = texteCombo(dernier);
    }

    zone.dataset.phase = etat.phase;
    champ('titre').textContent = titrePhase(etat, reglages.rounds);
    champ('temps').textContent = formaterDuree(Math.ceil(etat.restant));
    champ('progres').style.setProperty('--part', `${(etat.restant / etat.duree) * 100}%`);
  };

  champ('pause').addEventListener('click', (e) => {
    if (enPause) {
      debut += Date.now() - enPause;
      enPause = null;
      e.target.textContent = 'Pause';
      minuteur = setInterval(tic, 200);
      ecranAllume();
      return;
    }
    enPause = Date.now();
    e.target.textContent = 'Reprendre';
    clearInterval(minuteur);
    taire();
    libererEcran();
  });

  // Deux appuis pour arrêter : on ne coupe pas un round sur un geste malheureux.
  const arret = champ('arret');
  arret.addEventListener('click', () => {
    if (arret.dataset.confirmer) {
      nettoyer();
      taire();
      retour();
      return;
    }
    arret.dataset.confirmer = 'oui';
    arret.textContent = 'Confirmer l\'arrêt';
  });

  document.addEventListener('visibilitychange', reprendreEcran);

  // Dans le geste de l'utilisateur : le téléphone refuse sinon le son et la voix.
  preparerSon();
  dire('Mets-toi en garde');
  ecranAllume();
  let minuteur = setInterval(tic, 200);
  tic();

  return () => {
    nettoyer();
    taire();
  };
}

export function coach(conteneur) {
  let arreter = () => {};
  window.addEventListener('hashchange', () => arreter(), { once: true });

  const ouvrirReglages = () => {
    arreter = () => {};
    conteneur.innerHTML = ecranReglages(lireReglages());
    brancherReglages(conteneur, (reglages) => {
      arreter = lancer(conteneur, reglages, ouvrirReglages);
    });
    window.scrollTo(0, 0);
  };
  ouvrirReglages();
}
