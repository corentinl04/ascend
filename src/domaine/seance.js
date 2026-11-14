// Séance guidée : met les étapes à plat, bloc après bloc. Logique sans DOM.

// Un bloc en séries devient une suite d'efforts et de repos.
function deplier(bloc) {
  if (!bloc.series) return [bloc];
  const sortie = [];
  for (let i = 1; i <= bloc.series; i++) {
    sortie.push({ ...bloc, texte: `${bloc.texte}, ${i} sur ${bloc.series}`, effort: bloc.texte });
    if (i < bloc.series) sortie.push({ texte: 'Repos', detail: `Prochain : ${bloc.texte}`, secondes: bloc.repos });
  }
  return sortie;
}

// Chaque bloc garde le nom et le numéro de son étape. L'étape du coach reste un seul bloc.
export function deroule(etapes) {
  return etapes.flatMap((etape, i) => {
    const commun = { etape: etape.nom, numero: i + 1, total: etapes.length };
    if (etape.coach) return [{ ...commun, coach: true, texte: etape.nom }];
    return etape.blocs.flatMap(deplier).map((bloc, j) => ({ ...commun, ...bloc, premier: j === 0 }));
  });
}

// Durée connue de la séance, sans les blocs à son rythme ni le shadow guidé.
export const dureeConnue = (blocs) => blocs.reduce((total, b) => total + (b.secondes ?? 0), 0);
