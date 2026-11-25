// Saffron Kitchen — Dinner Rush: boot and the one loop.
// The shift timer, orders and grill advance in real time; the renderer paints
// what is there. Screens: title, play, paused and game over.
//
// ?seed=N fixes the order pattern. ?shot=start|play|end (with &seed=N) stages
// that scene instead of running the loop and sets window.__shotReady.

import { BEST_KEY } from './config.js';
import { createSoundEngine } from './audio.js';
import { createWorld, EVENT_GRILL_DONE, EVENT_LEVEL_UP, EVENT_OVER, EVENT_SERVED, EVENT_WRONG } from './world.js';
import { createInput } from './input.js';
import { createRenderer, SCREEN_OVER, SCREEN_PAUSED, SCREEN_PLAY, SCREEN_TITLE } from './render.js';
import { stageShot } from './shots.js';

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
const seedParam = Number.parseInt(params.get('seed') ?? '', 10);
const seed = Number.isInteger(seedParam) ? seedParam : Math.floor(Math.random() * 4294967296);

let seedState = seed >>> 0;
function seededRandom() {
  seedState = (seedState * 1664525 + 1013904223) >>> 0;
  return seedState / 4294967296;
}

const world = createWorld(seededRandom);
const renderer = createRenderer();
const sound = createSoundEngine();
const status = document.getElementById('status');

function readBest() {
  try { return Number.parseInt(window.localStorage.getItem(BEST_KEY) ?? '0', 10) || 0; } catch { return 0; }
}
function saveBest(value) {
  try { window.localStorage.setItem(BEST_KEY, String(value)); } catch { /* storage off: best lasts this visit only */ }
}

function runShot(name) {
  const scene = stageShot(name, world);
  let painted = 0;
  function paint() {
    renderer.draw(world.state, scene.screen, scene.best, sound.isMuted());
    painted += 1;
    if (painted < 2) requestAnimationFrame(paint);
    else window.__shotReady = true;
  }
  requestAnimationFrame(paint);
}

function runGame() {
  let screen = SCREEN_TITLE;
  let best = readBest();
  let last = performance.now();
  let lastTickSecond = -1;

  function announce(message) { if (status) status.textContent = message; }

  function startGame() {
    world.reset();
    screen = SCREEN_PLAY;
    last = performance.now();
    lastTickSecond = -1;
    sound.unlock();
    sound.playClick();
    announce('Playing. Serve every order before patience runs out.');
  }

  function endGame() {
    screen = SCREEN_OVER;
    if (world.state.score > best) { best = world.state.score; saveBest(best); }
    sound.playFanfare();
    announce(`Shift over. Score ${world.state.score}. Best ${best}.`);
  }

  function pauseGame() {
    if (screen !== SCREEN_PLAY) return;
    screen = SCREEN_PAUSED;
    announce('Paused.');
  }

  function resumeGame() {
    if (screen !== SCREEN_PAUSED) return;
    screen = SCREEN_PLAY;
    last = performance.now();
    announce('Playing.');
  }

  createInput({
    onIngredient(id) {
      if (screen !== SCREEN_PLAY) return;
      sound.unlock();
      const result = world.addIngredient(id);
      if (result.ok) sound.playAdd();
      else if (result.reason === 'grill full') sound.playError();
      else sound.playClick();
      if (result.grilled) sound.playGrill();
    },
    onReady(id) {
      if (screen !== SCREEN_PLAY) return;
      const result = world.addReady(id);
      if (result.ok) sound.playAdd(); else sound.playError();
    },
    onServe() {
      if (screen !== SCREEN_PLAY) return;
      const result = world.serve();
      if (result.ok) sound.playServe();
      else sound.playError();
      if (result.events & EVENT_LEVEL_UP) sound.playLevelUp();
    },
    onUndo() { if (screen === SCREEN_PLAY) { world.undoPlate(); sound.playClick(); } },
    onClear() { if (screen === SCREEN_PLAY) { world.clearPlate(); sound.playClick(); } },
    onStart() { sound.unlock(); startGame(); },
    onPause() {
      if (screen === SCREEN_PLAY) pauseGame();
      else if (screen === SCREEN_PAUSED) resumeGame();
    },
    onResume() { resumeGame(); },
    onRestart() { startGame(); },
    onMute() { const muted = sound.toggleMute(); announce(muted ? 'Sound muted.' : 'Sound on.'); },
    onHow() {
      const how = document.getElementById('how-to-play');
      if (how) how.classList.toggle('open');
    },
  });

  function frame(now) {
    requestAnimationFrame(frame);
    const dt = Math.min(0.25, (now - last) / 1000);
    last = now;
    if (screen === SCREEN_PLAY) {
      const events = world.step(dt);
      if (events & EVENT_GRILL_DONE) sound.playGrillDone();
      if (events & EVENT_SERVED) sound.playServe();
      if (events & EVENT_WRONG) sound.playError();
      if (events & EVENT_LEVEL_UP) sound.playLevelUp();
      const second = Math.ceil(world.state.timeLeft);
      if (second <= 5 && second > 0 && second !== lastTickSecond) { lastTickSecond = second; sound.playTick(); }
      if (events & EVENT_OVER) endGame();
    }
    renderer.draw(world.state, screen, best, sound.isMuted());
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden && screen === SCREEN_PLAY) pauseGame();
  });

  announce('Saffron Kitchen. Press Space or click Start Shift to play.');
  requestAnimationFrame(frame);
}

if (shot) runShot(shot);
else runGame();
