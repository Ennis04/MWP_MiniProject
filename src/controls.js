/* =========================================================
   CONTROLS — first-person: drag/touch to look (yaw/pitch in place, no
   orbiting around a target point), WASD to walk. Movement only ever
   changes X/Z; eye height is locked and never changes.
   Depends on: three, scene.js, config.js, components.js (pillars array)
========================================================= */
import * as THREE from 'three';
import { camera, renderer, EYE_HEIGHT } from './scene.js';
import { CFG } from './config.js';
import { resolveCustomCollisions } from './collisions.js';

const PITCH_LIMIT = Math.PI / 2 - 0.05;

// face the courtyard centre on load, matching the original starting view
const lookStart = new THREE.Vector3(0, 1.5, 0).sub(camera.position);
let yaw = Math.atan2(-lookStart.x, -lookStart.z);
let pitch = 0;
camera.rotation.set(pitch, yaw, 0);

let dragging = false;
let lastPX = 0, lastPY = 0;
const LOOK_SPEED = 0.0035;

renderer.domElement.addEventListener('pointerdown', e => {
  dragging = true;
  lastPX = e.clientX;
  lastPY = e.clientY;
});
window.addEventListener('pointermove', e => {
  if (!dragging) return;
  const dx = e.clientX - lastPX;
  const dy = e.clientY - lastPY;
  lastPX = e.clientX;
  lastPY = e.clientY;
  yaw -= dx * LOOK_SPEED;
  pitch = Math.max(-PITCH_LIMIT, Math.min(PITCH_LIMIT, pitch - dy * LOOK_SPEED));
});
window.addEventListener('pointerup', () => { dragging = false; });
window.addEventListener('pointercancel', () => { dragging = false; });

// scroll to zoom via field-of-view — a first-person view has no orbit
// distance to dolly, so zoom narrows/widens the FOV like a camera lens instead
const FOV_MIN = 35, FOV_MAX = 75;
window.addEventListener('wheel', e => {
  camera.fov = Math.max(FOV_MIN, Math.min(FOV_MAX, camera.fov + e.deltaY * 0.03));
  camera.updateProjectionMatrix();
}, { passive: true });

const keys = { w: false, a: false, s: false, d: false };
window.addEventListener('keydown', e => { const k = e.key.toLowerCase(); if (k in keys) keys[k] = true; });
window.addEventListener('keyup', e => { const k = e.key.toLowerCase(); if (k in keys) keys[k] = false; });

const moveSpeed = 4.2;
// Kept just inside the pillar/wall ring so the tour stays inside the
// building on every side — walled sides stop at the wall face, open sides
// stop right at the threshold instead of letting people wander onto the lawn.
const boundaryR = CFG.R1 - 0.2;


function updateMovement(dt) {
  let moveX = 0, moveZ = 0;
  if (keys.w) moveZ += 1;
  if (keys.s) moveZ -= 1;
  if (keys.a) moveX -= 1;
  if (keys.d) moveX += 1;
  if (!moveX && !moveZ) return;

  // Built from yaw alone — never pitch — so looking up or down never
  // changes walking speed or direction, and this never touches Y at all.
  const sinYaw = Math.sin(yaw), cosYaw = Math.cos(yaw);
  const delta = new THREE.Vector3(
    -sinYaw * moveZ + cosYaw * moveX,
    0,
    -cosYaw * moveZ - sinYaw * moveX
  );
  if (delta.lengthSq() === 0) return;
  delta.normalize().multiplyScalar(moveSpeed * dt);

  const nextPos = camera.position.clone().add(delta);
  resolveCustomCollisions(nextPos, 0.4); // Player radius 0.4
  camera.position.x = nextPos.x;
  camera.position.z = nextPos.z;
  camera.position.y = EYE_HEIGHT; // hard-locked — navigation never moves Y
}

// Called once per frame from main.js's animate loop.
export function updateControls(dt) {
  updateMovement(dt);
  camera.rotation.set(pitch, yaw, 0);
}
