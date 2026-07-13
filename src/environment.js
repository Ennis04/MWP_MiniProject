/* =========================================================
   ENVIRONMENT — lighting, sky, ground/floor, the AO contact-shadow system,
   the single whole-building octagonal roof truss, the background tower,
   trees, ceiling fans, and light-shaft dust motes.
   Depends on: three, scene.js, config.js, helpers.js, textures.js, materials.js
========================================================= */
import * as THREE from 'three';
import { scene } from './scene.js';
import { CFG, RAFTER_SIZE, RAFTER_INSET, COLORS } from './config.js';
import { polar, faceCenter, sideAngle, vertexAngle, addBeamBetween } from './helpers.js';
import { makeSkyTexture, makeTerrazzoTexture, makeTerrazzoBumpTexture, makeBrickCenterTexture, makeNoiseBumpTexture, makeCorrugatedBumpTexture, makeGrainBumpTexture } from './textures.js';
import { shadowBlobMat, glowBlobTex, glowMat, glowPoolMat, roofMat, roofBumpTex, ribMat, rafterMat, metalTrimMat, glassMat, frameMat } from './materials.js';

/* ---------------- LIGHTING & SKY ---------------- */
scene.background = new THREE.Color(0xbfe0ee);
const skyMat = new THREE.MeshBasicMaterial({ map: makeSkyTexture(), side: THREE.BackSide, fog: false });
scene.add(new THREE.Mesh(
  new THREE.SphereGeometry(180, 32, 16),
  skyMat
));

scene.add(new THREE.HemisphereLight(0xcfe8f5, 0x4a4030, 0.95));
scene.add(new THREE.AmbientLight(0xffffff, 0.16));

const sun = new THREE.DirectionalLight(0xfff2dc, 1.25);
sun.position.set(14, 22, 8);
sun.castShadow = true;
sun.shadow.mapSize.set(1024, 1024); // Lowered from 2048 for massive performance boost
sun.shadow.camera.left = -22;
sun.shadow.camera.right = 22;
sun.shadow.camera.top = 22;
sun.shadow.camera.bottom = -22;
sun.shadow.camera.far = 60;
sun.shadow.bias = -0.0015;
sun.shadow.normalBias = 0.02;
scene.add(sun);

const skyFill = new THREE.PointLight(0xfff6e0, 0.5, 22, 2);
skyFill.position.set(0, CFG.roofCapTopY - 0.4, 0);
scene.add(skyFill);

export function setDayNightMode(isNight) {
  if (isNight) {
    scene.background.setHex(0x050515); // Dark blue/black sky
    skyMat.color.setHex(0x222233); // Tint the sky texture dark
    sun.intensity = 0.05; // Moonlight
    sun.color.setHex(0xaaccff);
    skyFill.intensity = 0.05;
  } else {
    scene.background.setHex(0xbfe0ee); // Day sky
    skyMat.color.setHex(0xffffff); // Normal bright sky
    sun.intensity = 1.25; // Bright sun
    sun.color.setHex(0xfff2dc);
    skyFill.intensity = 0.5;
  }
}

/* ---------------- GROUND / APRON / FLOOR ---------------- */
const ground = new THREE.Mesh(
  new THREE.CircleGeometry(120, 48),
  new THREE.MeshStandardMaterial({ color: 0x8a9a7c, roughness: 1 })
);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -0.03;
ground.receiveShadow = true;
scene.add(ground);

/* ---- soft contact-shadow decals: empty function to prevent missing export errors ---- */
export function addContactShadow(pos, radius, opacity = 1) {}
