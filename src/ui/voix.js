// Voix, cloche et écran allumé : tout ce qui passe par le téléphone pendant le round.

// Écrit pour que la voix française prononce les mots anglais à peu près juste.
const PRONONCIATION = [[/teep/gi, 'tip'], [/low kick/gi, 'lo kik'], [/switch kick/gi, 'souitch kik'], [/switch/gi, 'souitch']];

export const voixDisponible = () => 'speechSynthesis' in window;

export function dire(texte) {
  if (!voixDisponible()) return;
  const phrase = new SpeechSynthesisUtterance(PRONONCIATION.reduce((t, [mot, son]) => t.replace(mot, son), texte));
  phrase.lang = 'fr-FR';
  phrase.rate = 1.1;
  const voix = speechSynthesis.getVoices().find((v) => v.lang.toLowerCase().startsWith('fr'));
  if (voix) phrase.voice = voix;
  speechSynthesis.speak(phrase);
}

export const taire = () => voixDisponible() && speechSynthesis.cancel();

let audio;

// À appeler sur un appui : le téléphone bloque le son lancé sans geste de l'utilisateur.
export function preparerSon() {
  const Contexte = window.AudioContext ?? window.webkitAudioContext;
  if (!Contexte) return;
  audio ??= new Contexte();
  audio.resume();
}

export function cloche(coups = 1) {
  if (!audio) return;
  for (let i = 0; i < coups; i++) {
    const debut = audio.currentTime + i * 0.35;
    const volume = audio.createGain();
    volume.gain.setValueAtTime(0.5, debut);
    volume.gain.exponentialRampToValueAtTime(0.001, debut + 1.1);
    volume.connect(audio.destination);
    [880, 1320].forEach((frequence) => {
      const son = audio.createOscillator();
      son.frequency.value = frequence;
      son.connect(volume);
      son.start(debut);
      son.stop(debut + 1.1);
    });
  }
}

let verrou = null;

// Renvoie false si le navigateur ne sait pas garder l'écran allumé.
export async function garderEcranAllume() {
  try {
    verrou = await navigator.wakeLock.request('screen');
    return true;
  } catch {
    return false;
  }
}

export function libererEcran() {
  verrou?.release();
  verrou = null;
}
