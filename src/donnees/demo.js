// Données DÉMO : chiffres fictifs pour montrer l'interface.
// À remplacer par les vrais résultats de Corentin (missions 2 et 5).
// Tout ce qui vient de ce fichier s'affiche avec un tampon DÉMO.

export const DEMO = {
  niveaux: {
    global: { niveau: 6, xp: 1840, xpMax: 2400 },
    muayThai: { niveau: 5, xp: 620, xpMax: 1000 },
    course: { niveau: 7, xp: 480, xpMax: 1000 },
  },
  cycle: { numero: 1, semaine: 2 },
  serie: 4, // Jours d'affilée avec une séance : calculé depuis le journal à la mission 2
  // Jours écoulés depuis le dernier test : la date du prochain en découle.
  joursDepuisDernierTest: 7,
  actuel: { vitesse: 64, corde: 142, pompes: 48, gainage: 95, cinqKm: 1220, dixKm: 2610 },
  anciens: {
    15: { vitesse: 61, corde: 136, pompes: 46, gainage: 98, cinqKm: 1235 },
    30: { vitesse: 58, corde: 128, pompes: 43, gainage: 84, cinqKm: 1250 },
    90: { vitesse: 51, corde: 110, pompes: 38, gainage: 70, cinqKm: 1290 },
  },
  meilleurs: { vitesse: 66, corde: 150, pompes: 50, gainage: 102 },
};
