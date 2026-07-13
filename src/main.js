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
import './environment.js';
import { updateControls, sitAt, standUp, isPlayerSeated } from './controls.js';
import { buildP19Building } from './P19Building.js';
import { playDropSound, startVendingAnimation, updateVendingMachines } from './vendingMachine.js';
import { setDayNightMode } from './environment.js';
import { setCeilingLights } from './ceiling.js';

/* ---------------- UI toggle ---------------- */
document.getElementById('toggle-hud').addEventListener('click', () => {
  const hud = document.getElementById('hud');
  const btn = document.getElementById('toggle-hud');
  const hidden = hud.classList.toggle('hidden');
  btn.textContent = hidden ? 'Show info' : 'Hide info';
});
document.getElementById('enter-tour').addEventListener('click', () => document.getElementById('welcome-screen').classList.add('hidden'));

/* ---------------- NEARBY OBJECT INTERACTION ---------------- */
const raycaster = new THREE.Raycaster();
const promptEl = document.getElementById('interaction-prompt');
const infoPanel = document.getElementById('info-panel');
const infoTitle = document.getElementById('info-title');
const infoDescription = document.getElementById('info-description');
let currentInteraction = null;
let vendingBusy = false;

function showInfo(title, description) {
  infoTitle.textContent = title;
  infoDescription.textContent = description;
  infoPanel.classList.remove('hidden');
}
document.getElementById('close-info').addEventListener('click', () => infoPanel.classList.add('hidden'));

function findInteractionObject(object) {
  let node = object;
  while (node) {
    if (node.userData.interactionRoot) return node.userData.interactionRoot;
    if (node.userData.interaction) return node;
    node = node.parent;
  }
  return null;
}

function scanForInteraction() {
  raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
  const hit = raycaster.intersectObjects(scene.children, true)
    .map(result => ({ ...result, root: findInteractionObject(result.object) }))
    .find(result => result.root && result.distance <= 4.2);
  currentInteraction = hit?.root || null;
  if (currentInteraction) {
    promptEl.textContent = `[E] ${currentInteraction.userData.interaction.prompt}`;
    promptEl.classList.remove('hidden');
  } else promptEl.classList.add('hidden');
}

function interact(root) {
  const data = root?.userData.interaction;
  if (!data) return;
  if (data.type === 'lockedDoor' || data.type === 'info') showInfo(data.title, data.description);
  if (data.type === 'vending' && !vendingBusy) {
    vendingBusy = true;
    root.userData.targetLight.intensity = 2;
    playDropSound(root.userData.targetLight);
    startVendingAnimation(root);
    setTimeout(() => { vendingBusy = false; }, 1800);
  }
  if (data.type === 'chair') {
    if (isPlayerSeated()) { standUp(); return; }
    const seatPosition = new THREE.Vector3();
    root.getWorldPosition(seatPosition);
    const facing = new THREE.Vector3(0, 0, -1).applyQuaternion(root.getWorldQuaternion(new THREE.Quaternion()));
    sitAt(seatPosition, Math.atan2(-facing.x, -facing.z));
  }
}

/* ---------------- KEYBOARD INTERACTION ---------------- */
let isNight = false;
window.addEventListener('keydown', (e) => {
  if (e.key.toLowerCase() === 'e' && !e.repeat) interact(currentInteraction);
  if (e.key.toLowerCase() === 'l') {
    isNight = !isNight;
    setDayNightMode(isNight);
    setCeilingLights(isNight);
  }
});

/* ---------------- RESIZE ---------------- */
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

/* ---------------- BUILD SCENE ---------------- */
buildP19Building(scene);

/* ---------------- ANIMATE ---------------- */
const timer = new THREE.Timer();
function animate() {
  requestAnimationFrame(animate);
  timer.update();
  const dt = Math.min(timer.getDelta(), 0.05);
  updateControls(dt);
  updateVendingMachines(dt);
  scanForInteraction();

  // Smoothly animate any interactable doors
  scene.traverse(c => {
    if (c.userData.isInteractableDoor && c.userData.pivot) {
      c.userData.pivot.rotation.y += (c.userData.targetRotation - c.userData.pivot.rotation.y) * 0.1;
    }
  });

  renderer.render(scene, camera);
}

animate();
const loadingEl = document.getElementById('loading-screen');
loadingEl.style.opacity = '0';
setTimeout(() => loadingEl.remove(), 650);
