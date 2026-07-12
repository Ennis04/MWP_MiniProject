/* =========================================================
   MAIN — entry point loaded by index.html.
   Import order matters here only in that everything must be imported
   before animate() starts; ES modules resolve the actual dependency graph
   (config -> helpers/textures -> scene/materials -> environment ->
   components -> decorations -> building -> controls) automatically, each
   module running exactly once regardless of how many places import it.
========================================================= */
import * as THREE from 'three';
import { scene, camera, renderer } from './scene.js';
import { fanBlades, motes } from './environment.js';
import './building.js';           // side effect: constructs the whole layout
import { updateControls } from './controls.js';

/* ---------------- UI toggle ---------------- */
document.getElementById('toggle-hud').addEventListener('click', () => {
  const hud = document.getElementById('hud');
  const btn = document.getElementById('toggle-hud');
  const hidden = hud.classList.toggle('hidden');
  btn.textContent = hidden ? 'Show info' : 'Hide info';
});

/* ---------------- RESIZE ---------------- */
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

/* ---------------- ANIMATE ---------------- */
const timer = new THREE.Timer();
function animate() {
  requestAnimationFrame(animate);
  timer.update();
  const dt = Math.min(timer.getDelta(), 0.05);
  updateControls(dt);
  fanBlades.forEach((b, i) => { b.rotation.y += dt * (2.4 + i * 0.35); });
  motes.forEach(m => {
    m.position.y += dt * m.userData.speed;
    if (m.position.y > 6.2) m.position.y = 0.15;
  });
  renderer.render(scene, camera);
}

animate();
const loadingEl = document.getElementById('loading-screen');
loadingEl.style.opacity = '0';
setTimeout(() => loadingEl.remove(), 650);
