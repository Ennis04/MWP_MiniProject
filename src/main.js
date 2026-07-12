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
import { updateControls } from './controls.js';
import { buildP19Building } from './P19Building.js';
import { playDropSound } from './vendingMachine.js';
import { setDayNightMode } from './environment.js';
import { setCeilingLights } from './ceiling.js';

/* ---------------- UI toggle ---------------- */
document.getElementById('toggle-hud').addEventListener('click', () => {
  const hud = document.getElementById('hud');
  const btn = document.getElementById('toggle-hud');
  const hidden = hud.classList.toggle('hidden');
  btn.textContent = hidden ? 'Show info' : 'Hide info';
});

/* ---------------- DOOR INTERACTION ---------------- */
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener('click', (event) => {
  // Ignore clicks on UI elements
  if (event.target.tagName === 'BUTTON' || event.target.closest('#hud')) return;

  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  
  const intersects = raycaster.intersectObjects(scene.children, true);
  for (let i = 0; i < intersects.length; i++) {
    const obj = intersects[i].object;
    if (obj.userData.isInteractableDoor) {
      obj.userData.isOpen = !obj.userData.isOpen;
      // Swing inwards by 90 degrees
      obj.userData.targetRotation = obj.userData.isOpen ? Math.PI / 2 : 0;
      break; 
    } else if (obj.userData.isSwitch) {
      const light = obj.userData.targetLight;
      light.intensity = light.intensity > 0 ? 0 : 1.5;
      break;
    } else if (obj.userData.isVendingMachine) {
      const light = obj.userData.targetLight;
      light.intensity = 2.0; // Turn light on
      playDropSound(light);  // Pass light so it turns off when sound ends
      break;
    }
  }
});

/* ---------------- KEYBOARD INTERACTION ---------------- */
let isNight = false;
window.addEventListener('keydown', (e) => {
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
