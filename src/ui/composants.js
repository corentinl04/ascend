export const tamponDemo = () => '<span class="tampon tampon-demo">DÉMO</span>';
export const tamponReel = () => '<span class="tampon tampon-reel">RÉEL</span>';

// Icônes illustrées générées avec Gemini (voir assets/images/icones/).
export const icone = (nom, taille = 24) =>
  `<img class="icone" src="assets/images/icones/${nom}.png" width="${taille}" height="${taille}" alt="" draggable="false">`;

export function barre(valeur, max, couleur = 'or') {
  const pourcent = Math.round((valeur / max) * 100);
  return `<div class="barre barre-${couleur}" role="progressbar" aria-valuenow="${valeur}" aria-valuemin="0" aria-valuemax="${max}">
    <span style="--valeur:${pourcent}%"></span>
  </div>`;
}

export function titreSection(texte) {
  return `<header class="section-tete"><h2>${texte}</h2>${tamponDemo()}</header>`;
}

// Jauge circulaire ouverte en bas. `part` va de 0 à 1.
export function jauge(part, texte) {
  const longueur = 75; // Arc de 270° sur un cercle de périmètre 100
  return `<div class="jauge" aria-hidden="true">
    <svg viewBox="0 0 40 40">
      <defs><linearGradient id="degrade-jauge" x1="0" x2="1"><stop offset="0" stop-color="#d9482f"/><stop offset="1" stop-color="#f2b84b"/></linearGradient></defs>
      <circle class="jauge-fond" cx="20" cy="20" r="15.9" pathLength="100" stroke-dasharray="${longueur} 100"/>
      <circle class="jauge-valeur" cx="20" cy="20" r="15.9" pathLength="100" stroke="url(#degrade-jauge)" stroke-dasharray="${(longueur * part).toFixed(1)} 100"/>
    </svg>
    <span>${texte}</span>
  </div>`;
}

// Fait défiler un nombre jusqu'à sa valeur.
export function animerCompteurs(racine) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  racine.querySelectorAll('[data-compteur]').forEach((el) => {
    const cible = Number(el.dataset.compteur);
    const total = 24;
    let pas = 0;
    const minuteur = setInterval(() => {
      pas++;
      el.textContent = Math.round((cible * pas) / total).toLocaleString('fr-FR');
      if (pas === total) clearInterval(minuteur);
    }, 30);
  });
}
