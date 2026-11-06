// Comparaison avec le rival : ton ancien toi (15, 30, 90 jours) et ton meilleur toi.

export const MESURES = [
  { cle: 'vitesse', nom: '1-2 en 30 s', unite: '', icone: 'eclair' },
  { cle: 'corde', nom: 'Corde 1 min', unite: '', icone: 'corde' },
  { cle: 'pompes', nom: 'Pompes 1 min', unite: '', icone: 'haltere' },
  { cle: 'gainage', nom: 'Gainage', unite: ' s', icone: 'bouclier' },
  { cle: 'cinqKm', nom: '5 km', temps: true, icone: 'chaussure' },
  { cle: 'dixKm', nom: '10 km', temps: true, icone: 'chaussure' },
];

export function formaterTemps(secondes) {
  const min = Math.floor(secondes / 60);
  const sec = String(secondes % 60).padStart(2, '0');
  return `${min}:${sec}`;
}

export function formaterMesure(mesure, valeur) {
  return mesure.temps ? formaterTemps(valeur) : `${valeur}${mesure.unite}`;
}

// Sur un temps, plus bas est meilleur. Renvoie 1, -1 ou 0 du point de vue de "toi".
function issue(mesure, toi, rival) {
  if (toi === rival) return 0;
  const devant = mesure.temps ? toi < rival : toi > rival;
  return devant ? 1 : -1;
}

export function comparer(toi, rival) {
  const lignes = MESURES.filter((m) => toi[m.cle] !== undefined && rival[m.cle] !== undefined).map((mesure) => ({
    mesure,
    toi: toi[mesure.cle],
    rival: rival[mesure.cle],
    issue: issue(mesure, toi[mesure.cle], rival[mesure.cle]),
  }));
  return {
    lignes,
    gagnes: lignes.filter((l) => l.issue > 0).length,
    perdus: lignes.filter((l) => l.issue < 0).length,
  };
}
