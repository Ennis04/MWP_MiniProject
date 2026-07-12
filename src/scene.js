/* =========================================================
   SCENE / CAMERA / RENDERER — created once here and imported by every
   other file that needs to add objects or read the camera.
   Depends on: three, config.js, helpers.js
========================================================= */
import * as THREE from 'three';
import { CFG } from './config.js';
import { polar, sideAngle } from './helpers.js';

export const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0xcfe3ee, 26, 92);

export const EYE_HEIGHT = 1.65;
export const camera = new THREE.PerspectiveCamera(62, window.innerWidth / window.innerHeight, 0.1, 300);
camera.rotation.order = 'YXZ'; // yaw around world Y, then pitch around the resulting local X — the standard FPS-camera order
camera.position.set(0, EYE_HEIGHT, -12);

export const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(1); // Capped to 1 to drastically improve framerate on retina screens
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap; // Cheaper than PCFSoftShadowMap
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.appendChild(renderer.domElement);
