// Lecture d'un fichier d'activité .fit (format Garmin FIT, utilisé par Coros) dans le navigateur.
// On ne garde que le résumé de la séance : début, durée, distance et fréquence cardiaque.
// Référence du format : https://developer.garmin.com/fit/protocol/

const DEBUT_EPOQUE_FIT = Date.UTC(1989, 11, 31); // Les dates FIT comptent en secondes depuis cette date.

const MESSAGE_SESSION = 18;
const CHAMPS_SESSION = { 2: 'debut', 5: 'sport', 7: 'tempsTotal', 8: 'tempsChrono', 9: 'distance', 16: 'fcMoyenne', 17: 'fcMax' };
const SPORT_COURSE = 1;

const INVALIDE = { 1: 0xff, 2: 0xffff, 4: 0xffffffff };

function lireEntier(vue, position, taille, petitBout) {
  if (taille === 1) return vue.getUint8(position);
  if (taille === 2) return vue.getUint16(position, petitBout);
  if (taille === 4) return vue.getUint32(position, petitBout);
  return undefined; // Tableaux et chaînes : inutiles ici.
}

// Renvoie les messages « session » du fichier, champs utiles seulement.
function lireSessions(tampon) {
  const vue = new DataView(tampon);
  if (vue.byteLength < 12) throw new Error('Ce fichier n\'est pas un fichier .fit.');
  const tailleEntete = vue.getUint8(0);
  const signature = String.fromCharCode(...new Uint8Array(tampon, 8, 4));
  if (signature !== '.FIT' || tailleEntete < 12) throw new Error('Ce fichier n\'est pas un fichier .fit.');

  const fin = Math.min(vue.byteLength, tailleEntete + vue.getUint32(4, true));
  const definitions = {};
  const sessions = [];
  let position = tailleEntete;

  while (position < fin) {
    const entete = vue.getUint8(position++);
    const compresse = (entete & 0x80) !== 0;
    const local = compresse ? (entete >> 5) & 0x03 : entete & 0x0f;

    if (!compresse && entete & 0x40) {
      const petitBout = vue.getUint8(position + 1) === 0;
      const numero = vue.getUint16(position + 2, petitBout);
      const nombre = vue.getUint8(position + 4);
      position += 5;
      const champs = [];
      for (let i = 0; i < nombre; i++, position += 3) {
        champs.push({ numero: vue.getUint8(position), taille: vue.getUint8(position + 1) });
      }
      let tailleDeveloppeur = 0;
      if (entete & 0x20) {
        const nombreDev = vue.getUint8(position++);
        for (let i = 0; i < nombreDev; i++, position += 3) tailleDeveloppeur += vue.getUint8(position + 1);
      }
      definitions[local] = { numero, petitBout, champs, tailleDeveloppeur };
      continue;
    }

    const definition = definitions[local];
    if (!definition) throw new Error('Fichier .fit illisible.');
    const message = definition.numero === MESSAGE_SESSION ? {} : null;
    for (const { numero, taille } of definition.champs) {
      const nom = message && CHAMPS_SESSION[numero];
      if (nom) {
        const valeur = lireEntier(vue, position, taille, definition.petitBout);
        if (valeur !== undefined && valeur !== INVALIDE[taille]) message[nom] = valeur;
      }
      position += taille;
    }
    position += definition.tailleDeveloppeur;
    if (message) sessions.push(message);
  }
  return sessions;
}

// Résumé d'une activité. Plusieurs sessions (multisport) sont additionnées.
export function lireFit(tampon) {
  const sessions = lireSessions(tampon).filter((s) => s.debut !== undefined);
  if (!sessions.length) throw new Error('Aucune séance trouvée dans ce fichier.');

  const duree = (s) => (s.tempsChrono ?? s.tempsTotal ?? 0) / 1000;
  const dureeSecondes = Math.round(sessions.reduce((t, s) => t + duree(s), 0));
  const distanceMetres = sessions.reduce((t, s) => t + (s.distance ?? 0) / 100, 0);
  const avecFc = sessions.filter((s) => s.fcMoyenne !== undefined && duree(s) > 0);
  const tempsFc = avecFc.reduce((t, s) => t + duree(s), 0);
  const maxima = sessions.map((s) => s.fcMax).filter((v) => v !== undefined);

  return {
    debut: new Date(DEBUT_EPOQUE_FIT + sessions[0].debut * 1000),
    course: sessions.every((s) => s.sport === SPORT_COURSE),
    dureeSecondes,
    distanceKm: Math.round(distanceMetres / 10) / 100,
    fcMoyenne: tempsFc ? Math.round(avecFc.reduce((t, s) => t + s.fcMoyenne * duree(s), 0) / tempsFc) : undefined,
    fcMax: maxima.length ? Math.max(...maxima) : undefined,
  };
}
