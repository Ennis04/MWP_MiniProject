/* =========================================================
   DECORATIONS — smaller set-dressing helpers that weren't part of the
   parameterised component library request. These still use the original
   angle/radius placement style rather than plain (x, y, z).
   Depends on: three, scene.js, config.js, helpers.js, textures.js,
   materials.js, environment.js (for addContactShadow),
   components.js (for pillarBaseMat... actually materials.js)
========================================================= */
import * as THREE from 'three';
import { scene } from './scene.js';
import { CFG } from './config.js';
import { polar, faceCenter, sideAngle } from './helpers.js';
import { makeSignTexture, makeArrowSignTexture } from './textures.js';
import { benchMat, redBoxMat, lampGlassMat, metalTrimMat, pillarBaseMat, wallBumpTex, downlightMat, downlightGeo } from './materials.js';
import { addContactShadow } from './environment.js';

export function addSign(angleMid, label, y, bg = '#c8481f') {
  const mat = new THREE.MeshStandardMaterial({ map: makeSignTexture(label, bg), roughness: 0.5, side: THREE.DoubleSide });
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(0.55, 0.55), mat);
  sign.position.copy(polar(angleMid, CFG.R1 - 0.08, y));
  faceCenter(sign, y);
  scene.add(sign);
}

export function addArrowSign(angleMid, label, y) {
  const mat = new THREE.MeshStandardMaterial({ map: makeArrowSignTexture(label), roughness: 0.5, side: THREE.DoubleSide });
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(0.85, 0.53), mat);
  sign.position.copy(polar(angleMid, CFG.R1 - 0.08, y));
  faceCenter(sign, y);
  scene.add(sign);
}

export function addBench(angleMid, radiusOffset = 1.7) {
  const group = new THREE.Group();
  const seat = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.06, 0.4), benchMat);
  seat.position.y = 0.42;
  seat.castShadow = true;
  group.add(seat);
  const back = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.35, 0.05), benchMat);
  back.position.set(0, 0.62, -0.17);
  group.add(back);
  for (const side of [-0.6, 0.6]) {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.42, 0.36), pillarBaseMat);
    leg.position.set(side, 0.21, 0);
    group.add(leg);
  }
  group.position.copy(polar(angleMid, CFG.R1 - radiusOffset, 0));
  faceCenter(group, 0);
  scene.add(group);
  addContactShadow(group.position, 1.0, 0.75);
}

export function addExtinguisherBox(angleMid, y = 1.1) {
  const box = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.5, 0.14), redBoxMat);
  box.position.copy(polar(angleMid, CFG.R1 + 0.02, y));
  faceCenter(box, y);
  box.castShadow = true;
  scene.add(box);
}

export function addWallLamp(angleMid, y = CFG.pillarHeight - 0.55) {
  const group = new THREE.Group();
  const arm = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.055, 0.16), metalTrimMat);
  arm.position.z = 0.08;
  group.add(arm);
  const housing = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.1, 0.15, 8), metalTrimMat);
  housing.rotation.x = Math.PI / 2;
  housing.position.z = 0.19;
  housing.castShadow = true;
  group.add(housing);
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 8), lampGlassMat);
  bulb.position.z = 0.28;
  group.add(bulb);
  group.position.copy(polar(angleMid, CFG.R1 - 0.02, y));
  faceCenter(group, y);
  scene.add(group);
}

export function addPottedPlant(angleMid, radiusOffset = 1.4) {
  const group = new THREE.Group();
  const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.16, 0.3, 10), pillarBaseMat);
  pot.position.y = 0.15;
  pot.castShadow = true;
  group.add(pot);
  const leafMat = new THREE.MeshStandardMaterial({ color: 0x4c7a3d, roughness: 0.85, bumpMap: wallBumpTex, bumpScale: 0.03 });
  for (let i = 0; i < 7; i++) {
    const blade = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.5 + Math.random() * 0.32, 5), leafMat);
    blade.position.set((Math.random() - 0.5) * 0.18, 0.46, (Math.random() - 0.5) * 0.18);
    blade.rotation.z = (Math.random() - 0.5) * 0.5;
    blade.rotation.x = (Math.random() - 0.5) * 0.5;
    blade.castShadow = true;
    group.add(blade);
  }
  group.position.copy(polar(angleMid, CFG.R1 - radiusOffset, 0));
  scene.add(group);
  addContactShadow(group.position, 0.42, 0.7);
}

export function addDownpipe(angle) {
  const topY = CFG.pillarHeight + 0.02;
  const pipeR = CFG.R1 + CFG.eaveOverhang + 0.08;
  const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, topY, 8), metalTrimMat);
  pipe.position.copy(polar(angle, pipeR, topY / 2));
  pipe.castShadow = true;
  scene.add(pipe);
  const splash = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.12, 0.05, 8), pillarBaseMat);
  splash.position.copy(polar(angle, pipeR, 0.025));
  scene.add(splash);
  addContactShadow(splash.position, 0.35, 0.6);
}

export function addBinPair(angleMid, radiusOffset) {
  const group = new THREE.Group();
  [0xb3231c, 0x1f4a8a].forEach((col, i) => {
    const mat = new THREE.MeshStandardMaterial({ color: col, roughness: 0.5, metalness: 0.15 });
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.16, 0.55, 12), mat);
    body.position.set((i - 0.5) * 0.42, 0.275, 0);
    body.castShadow = true;
    group.add(body);
    const lid = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.04, 12), mat);
    lid.position.set((i - 0.5) * 0.42, 0.555, 0);
    group.add(lid);
  });
  group.position.copy(polar(angleMid, CFG.R1 - radiusOffset, 0));
  scene.add(group);
  addContactShadow(group.position, 0.55, 0.65);
}

// Recessed ceiling downlights — the round white spotlights visible across
// the dark ceiling in every reference photo.
export function addDownlight(angle, radius, y) {
  const disc = new THREE.Mesh(downlightGeo, downlightMat);
  disc.rotation.x = Math.PI / 2;
  disc.position.copy(polar(angle, radius, y));
  scene.add(disc);
}
for (let i = 0; i < 8; i++) addDownlight(sideAngle(i), CFG.R1 - 1.3, CFG.pillarHeight + 0.3);
for (let i = 0; i < 4; i++) addDownlight(sideAngle(i * 2), CFG.R1 - 4, CFG.pillarHeight + 1.6);
