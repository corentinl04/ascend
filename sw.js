// Service worker : l'appli marche hors ligne.
// Réseau d'abord, pour avoir tout de suite la dernière version publiée. Sans réseau
// (ou s'il met plus de DELAI_RESEAU à répondre), on sert la copie gardée sur le téléphone.
// Ajouter un fichier à l'appli : l'ajouter à FICHIERS et changer VERSION.
// Un fichier oublié ici est quand même gardé dès sa première ouverture en ligne.

const VERSION = 'ascend-2026-11-14';
const DELAI_RESEAU = 3000;

const FICHIERS = [
  './', 'index.html', 'manifest.webmanifest',
  'src/main.js', 'src/styles.css',
  'src/domaine/coach.js', 'src/domaine/fit.js', 'src/domaine/journal.js', 'src/domaine/programme.js',
  'src/domaine/rival.js', 'src/domaine/sauvegarde.js', 'src/domaine/seance.js',
  'src/donnees/coach.js', 'src/donnees/coach.json', 'src/donnees/combos.js', 'src/donnees/combos.json',
  'src/donnees/demo.js', 'src/donnees/fiches.js', 'src/donnees/fiches.json', 'src/donnees/profil.js',
  'src/donnees/seance.js', 'src/donnees/seance.json', 'src/donnees/videos.js', 'src/donnees/videos.json',
  'src/ecrans/accueil.js', 'src/ecrans/bibliotheque.js', 'src/ecrans/coach.js', 'src/ecrans/journal.js',
  'src/ecrans/seanceGuidee.js', 'src/ecrans/verrouille.js',
  'src/ui/composants.js', 'src/ui/voix.js',
  'assets/images/combattant.png', 'assets/images/decor.jpg', 'assets/images/fantome.png',
  'assets/images/appli/apple-touch-icon.png', 'assets/images/appli/icone-192.png',
  'assets/images/appli/icone-512.png', 'assets/images/appli/icone-maskable-512.png',
  ...['bouclier', 'cadenas', 'chaussure', 'cible', 'coeur', 'cor', 'corde', 'eclair', 'fantome',
    'feu', 'gant', 'haltere', 'livre', 'lune', 'medaille', 'parchemin'].map((n) => `assets/images/icones/${n}.png`),
];

self.addEventListener('install', (e) => {
  // Un fichier introuvable ne bloque pas l'installation des autres.
  e.waitUntil(caches.open(VERSION)
    .then((cache) => Promise.all(FICHIERS.map((f) => cache.add(f).catch(() => {}))))
    .then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys()
    .then((cles) => Promise.all(cles.filter((c) => c !== VERSION).map((c) => caches.delete(c))))
    .then(() => self.clients.claim()));
});

async function reseauPuisCopie(requete) {
  const cache = await caches.open(VERSION);
  const reseau = fetch(requete).then((reponse) => {
    if (reponse.ok) cache.put(requete, reponse.clone());
    return reponse;
  });
  reseau.catch(() => {}); // Échec géré plus bas : pas d'alerte si la copie a déjà répondu.
  const copie = () => cache.match(requete, { ignoreSearch: true })
    .then((r) => r ?? (requete.mode === 'navigate' ? cache.match('index.html') : undefined));
  const delai = new Promise((ok) => setTimeout(ok, DELAI_RESEAU)).then(copie);
  try {
    // Le premier qui répond : le réseau, ou la copie si le réseau traîne.
    const premier = await Promise.race([reseau, delai]);
    if (premier) return premier;
    return await reseau;
  } catch {
    return (await copie()) ?? Response.error();
  }
}

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  // Les vidéos YouTube et les autres sites ne passent pas par ici.
  if (e.request.method !== 'GET' || url.origin !== self.location.origin) return;
  e.respondWith(reseauPuisCopie(e.request));
});
