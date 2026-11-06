// Structure du programme, reprise du brief : 3 Muay Thai + 2 course + 2 repos,
// cycles de 4 semaines, tests tous les 15 jours.
// La place de chaque séance dans la semaine est une proposition de départ.

export const INTERVALLE_TESTS = 15;
export const SEMAINES_PAR_CYCLE = 4;

const ORDRE_CAMP = ['Échauffement', 'Corde', 'Shadow technique', 'Shadow guidé', 'Renfo'];
const SHADOW = '2 à 3 rounds de 3 à 5 min';

const SEANCES = {
  technique: { discipline: 'muayThai', titre: 'Muay Thai technique', court: 'Tech', etapes: ORDRE_CAMP, detail: SHADOW },
  cardio: { discipline: 'muayThai', titre: 'Muay Thai cardio', court: 'Cardio', etapes: ORDRE_CAMP, detail: SHADOW },
  renfo: { discipline: 'muayThai', titre: 'Muay Thai renfo', court: 'Renfo', etapes: ORDRE_CAMP, detail: SHADOW },
  fractionne: { discipline: 'course', titre: 'Course : fractionné', court: 'Frac', etapes: [], detail: 'Contenu calé sur tes tests (mission 5)' },
  sortie: { discipline: 'course', titre: 'Course : sortie longue', court: 'Long', etapes: [], detail: 'Contenu calé sur tes tests (mission 5)' },
  repos: { discipline: 'repos', titre: 'Repos', court: 'Repos', etapes: [], detail: 'Jour de récupération' },
};

// Lundi en premier.
const SEMAINE_TYPE = ['technique', 'fractionne', 'cardio', 'repos', 'renfo', 'sortie', 'repos'];
const LETTRES = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

const indexJour = (date) => (date.getDay() + 6) % 7;

export function semaine(date) {
  const aujourdhui = indexJour(date);
  return SEMAINE_TYPE.map((cle, i) => ({
    ...SEANCES[cle],
    lettre: LETTRES[i],
    aujourdhui: i === aujourdhui,
  }));
}

export const seanceDuJour = (date) => SEANCES[SEMAINE_TYPE[indexJour(date)]];

export function prochainTest(date, joursDepuisDernier) {
  const restants = INTERVALLE_TESTS - joursDepuisDernier;
  const jour = new Date(date);
  jour.setDate(jour.getDate() + restants);
  return { restants, ecoules: joursDepuisDernier, date: jour };
}

export const dateCourte = (date) =>
  date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
