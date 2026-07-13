/* =========================================================
   HELPERS — small geometry utilities used across the scene.
   Depends on: three, config.js
========================================================= */
import * as THREE from 'three';
import { CFG } from './config.js';

export function polar(angle, radius, y = 0) {
  return new THREE.Vector3(Math.cos(angle) * radius, y, Math.sin(angle) * radius);
}

// Orients a mesh so its local +Z (the "decorated front" of doors/signs/
// vending machines etc.) faces the courtyard centre. For non-camera/light
// Object3Ds (Mesh, Group), Three.js's lookAt() swaps its internal arguments
// and already points local +Z at the target — verified directly against the
// real library — so no extra flip is needed (and adding one, as an earlier
// version of this function did, silently turns every asymmetric object
// built on it backwards).
export function faceCenter(mesh, y) {
  mesh.lookAt(0, y, 0);
  return mesh;
}

export const sideAngle = i => (i + 0.5) * Math.PI / 4;   // midpoint angle of side i (between pillar i and i+1)
export const vertexAngle = i => i * Math.PI / 4;          // angle of pillar i

export function sideChord() {
  return 2 * CFG.R1 * Math.sin(Math.PI / 8) - 0.15;
}

// Builds a box "beam" spanning two 3D points — used for the roof's truss
// rafters, purlins, ridge caps and barge boards. Every call site uses a
// square (w === d) cross-section so the beam's roll around its own axis —
// which setFromUnitVectors doesn't let us control directly — never matters
// visually.
export function addBeamBetween(p0, p1, w, d, material) {
  const dir = new THREE.Vector3().subVectors(p1, p0);
  const mid = new THREE.Vector3().addVectors(p0, p1).multiplyScalar(0.5);
  const len = dir.length();
  const beam = new THREE.Mesh(new THREE.BoxGeometry(w, len, d), material);
  beam.position.copy(mid);
  beam.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
  beam.castShadow = true;
  beam.receiveShadow = true;
  return beam;
}
