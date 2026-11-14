import { deroule } from '../domaine/seance.js';
import { formaterDuree } from '../domaine/journal.js';
import { FIN_DE_PHASE } from '../domaine/coach.js';
import { SEANCE } from '../donnees/seance.js';
import { cloche, dire, garderEcranAllume, libererEcran, preparerSon, taire } from '../ui/voix.js';

const BLOCS = deroule(SEANCE.etapes);

const ecranBloc = (bloc) => {
  const source = SEANCE.sources[bloc.source ?? SEANCE.etapes[bloc.numero - 1].source];
  return `<section class="carte coach-seance guidee" data-phase="${bloc.texte === 'Repos' ? 'repos' : 'round'}">
    <p class="discret guidee-etape">Étape ${bloc.numero} sur ${bloc.total} : ${bloc.etape}</p>
    <p class="coach-phase">${bloc.texte}</p>
    ${bloc.secondes ? `<p class="coach-temps" role="timer" data-temps>${formaterDuree(bloc.secondes)}</p>
    <div class="coach-progres" aria-hidden="true"><span data-progres></span></div>` : ''}
    ${bloc.detail ? `<p class="guidee-detail">${bloc.detail}</p>` : ''}
    ${bloc.video ? `<a class="video-lien" href="https://www.youtube.com/watch?v=${bloc.video}" target="_blank" rel="noopener">Voir la vidéo</a>` : ''}
    <p class="discret coach-note" data-veille hidden>Ton téléphone peut se mettre en veille : laisse l'écran allumé.</p>
    <div class="coach-actions">
      ${bloc.secondes ? '<button class="bouton" type="button" data-pause>Pause</button>' : ''}
      <button class="bouton ${bloc.secondes ? 'bouton-second' : ''}" type="button" data-suivant>${bloc.secondes ? 'Passer' : 'Suivant'}</button>
    </div>
    <button class="bouton bouton-second" type="button" data-arret>Arrêter la séance</button>
    <p class="discret coach-note">Source : <a href="${source.url}" target="_blank" rel="noopener">${source.nom}</a></p>
  </section>`;
};

const ecranFin = () => `<section class="carte coach-seance" data-phase="fini">
    <p class="coach-phase">Séance terminée</p>
    <p class="coach-combo">Bravo, les ${BLOCS.at(-1).total} étapes sont faites.</p>
    <a class="bouton" href="#/journal">Noter ma séance</a>
    <button class="bouton bouton-second" type="button" data-retour>Retour au coach</button>
  </section>`;

// Enchaîne toutes les étapes. `lancerShadow` est le shadow guidé du coach. Renvoie la fonction qui arrête tout.
export function lancerSeanceGuidee(conteneur, { lancerShadow, reglages, quitter }) {
  let minuteur = null;
  let arreterShadow = null;

  const nettoyer = () => {
    clearInterval(minuteur);
    arreterShadow?.();
    arreterShadow = null;
    document.removeEventListener('visibilitychange', reprendreEcran);
    document.body.classList.remove('en-seance');
    libererEcran();
  };
  const ecranAllume = async () => {
    const veille = conteneur.querySelector('[data-veille]');
    const ok = await garderEcranAllume();
    if (veille) veille.hidden = ok;
  };
  function reprendreEcran() {
    if (document.visibilityState === 'visible') ecranAllume();
  }

  const finir = () => {
    nettoyer();
    cloche(3);
    dire('Séance terminée');
    conteneur.innerHTML = ecranFin();
    conteneur.querySelector('[data-retour]').addEventListener('click', quitter);
  };

  function demarrer(i) {
    clearInterval(minuteur);
    taire();
    if (i >= BLOCS.length) return finir();
    const bloc = BLOCS[i];
    window.scrollTo(0, 0);

    if (bloc.coach) {
      dire(`Étape ${bloc.numero}, ${bloc.etape}`);
      arreterShadow = lancerShadow(conteneur, reglages, () => { nettoyer(); quitter(); }, () => {
        arreterShadow = null;
        demarrer(i + 1);
      });
      return;
    }

    document.body.classList.add('en-seance');
    conteneur.innerHTML = ecranBloc(bloc);
    const champ = (nom) => conteneur.querySelector(`[data-${nom}]`);
    dire(bloc.premier ? `Étape ${bloc.numero}, ${bloc.etape}. ${bloc.texte}` : bloc.texte);
    ecranAllume();

    champ('suivant').addEventListener('click', () => demarrer(i + 1));
    const arret = champ('arret');
    arret.addEventListener('click', () => {
      if (!arret.dataset.confirmer) {
        arret.dataset.confirmer = 'oui';
        arret.textContent = 'Confirmer l\'arrêt';
        return;
      }
      nettoyer();
      taire();
      quitter();
    });

    if (!bloc.secondes) return;
    let debut = Date.now();
    let enPause = null;
    let alerteFaite = false;
    const tic = () => {
      const restant = bloc.secondes - (Date.now() - debut) / 1000;
      if (restant <= 0) {
        cloche(bloc.texte === 'Repos' ? 1 : 2);
        return demarrer(i + 1);
      }
      if (bloc.secondes >= 60 && restant <= FIN_DE_PHASE && !alerteFaite) {
        alerteFaite = true;
        dire('Dix secondes');
      }
      champ('temps').textContent = formaterDuree(Math.ceil(restant));
      champ('progres').style.setProperty('--part', `${(restant / bloc.secondes) * 100}%`);
    };
    champ('pause').addEventListener('click', (e) => {
      if (enPause) {
        debut += Date.now() - enPause;
        enPause = null;
        e.target.textContent = 'Pause';
        minuteur = setInterval(tic, 200);
        return;
      }
      enPause = Date.now();
      e.target.textContent = 'Reprendre';
      clearInterval(minuteur);
      taire();
    });
    minuteur = setInterval(tic, 200);
    tic();
  }

  document.addEventListener('visibilitychange', reprendreEcran);
  // Dans le geste de l'utilisateur : le téléphone refuse sinon le son et la voix.
  preparerSon();
  demarrer(0);

  return () => {
    nettoyer();
    taire();
  };
}
