// Sauvegarde : toutes les données de l'appli dans un seul fichier JSON. Logique sans DOM.
// Les valeurs sont copiées telles quelles, sans les relire : un import rend exactement ce qui a été exporté.
// Si le format du fichier change un jour, monter VERSION et convertir les anciennes versions dans lireSauvegarde.

const PREFIXE = 'ascend.';
const FORMAT = 'ascend-sauvegarde';
const VERSION = 1;
const CLE_JOURNAL = 'ascend.journal.v1';
// Copie des données remplacées par le dernier import, gardée sur l'appareil en cas d'erreur.
export const CLE_AVANT_IMPORT = 'ascend.secours.avant-import';

function clesAppli() {
  const cles = [];
  for (let i = 0; i < localStorage.length; i++) {
    const cle = localStorage.key(i);
    if (cle.startsWith(PREFIXE) && cle !== CLE_AVANT_IMPORT) cles.push(cle);
  }
  return cles.sort();
}

export function exporter(maintenant = new Date()) {
  const donnees = Object.fromEntries(clesAppli().map((cle) => [cle, localStorage.getItem(cle)]));
  return { format: FORMAT, version: VERSION, exporteLe: maintenant.toISOString(), donnees };
}

export const nomFichier = (date) => `ascend-sauvegarde-${date}.json`;

const nombreSeances = (donnees) => {
  try {
    const seances = JSON.parse(donnees[CLE_JOURNAL] ?? '[]');
    return Array.isArray(seances) ? seances.length : null;
  } catch {
    return null;
  }
};

// Vérifie un fichier avant tout import. Renvoie { erreur } ou { sauvegarde, seances }.
export function lireSauvegarde(texte) {
  let sauvegarde;
  try {
    sauvegarde = JSON.parse(texte);
  } catch {
    return { erreur: 'Ce fichier n\'est pas une sauvegarde Ascend lisible.' };
  }
  if (sauvegarde?.format !== FORMAT || typeof sauvegarde.donnees !== 'object' || !sauvegarde.donnees) {
    return { erreur: 'Ce fichier n\'est pas une sauvegarde Ascend.' };
  }
  if (sauvegarde.version > VERSION) {
    return { erreur: 'Cette sauvegarde vient d\'une version plus récente de l\'appli : recharge l\'appli puis réessaie.' };
  }
  const entrees = Object.entries(sauvegarde.donnees);
  if (entrees.some(([cle, valeur]) => !cle.startsWith(PREFIXE) || typeof valeur !== 'string')) {
    return { erreur: 'Cette sauvegarde est abîmée : rien n\'a été importé.' };
  }
  const seances = nombreSeances(sauvegarde.donnees);
  if (seances === null) return { erreur: 'Le Journal de cette sauvegarde est illisible : rien n\'a été importé.' };
  return { sauvegarde, seances };
}

// Remplace les données de l'appli par celles de la sauvegarde, après en avoir gardé une copie.
export function importer(sauvegarde) {
  const avant = JSON.stringify(exporter());
  localStorage.setItem(CLE_AVANT_IMPORT, avant);
  const anciennes = clesAppli();
  try {
    anciennes.forEach((cle) => localStorage.removeItem(cle));
    Object.entries(sauvegarde.donnees).forEach(([cle, valeur]) => localStorage.setItem(cle, valeur));
  } catch (erreur) {
    // Stockage plein ou indisponible : on remet les données d'avant.
    clesAppli().forEach((cle) => localStorage.removeItem(cle));
    Object.entries(JSON.parse(avant).donnees).forEach(([cle, valeur]) => localStorage.setItem(cle, valeur));
    throw erreur;
  }
}
