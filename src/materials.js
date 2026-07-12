/* =========================================================
   MATERIALS — shared, reusable materials/textures with no colour baked in
   for the parameterised component library, plus fixed-look materials for
   the still-fixed decorative helpers. No scene.add() calls happen here —
   this file only builds THREE.Material/Texture objects.
   Depends on: three, config.js, textures.js
========================================================= */
import * as THREE from 'three';
import { COLORS } from './config.js';
import {
  makeNoiseBumpTexture, makeCorrugatedBumpTexture, makeGrainBumpTexture,
  makeShadowBlobTexture, makeGlowBlobTexture,
} from './textures.js';

// -- pillar --
export const pillarBumpTex = makeNoiseBumpTexture(256, 700, 2, 90, 170);
pillarBumpTex.repeat.set(2, 3);
export const pillarRoughTex = makeNoiseBumpTexture(256, 400, 3, 150, 255);
pillarRoughTex.repeat.set(2, 3);
export const pillarBaseMat = new THREE.MeshStandardMaterial({ color: COLORS.maroonDark, roughness: 0.7 });
export const capitalMat = new THREE.MeshStandardMaterial({ color: COLORS.maroonDark, roughness: 0.55, metalness: 0.12 });

// -- roof / trim / hardware (shared across the main truss roof, gable roofs,
//    doors, vending machines, tables, chairs, lamps, downpipes...) --
export const roofBumpTex = makeCorrugatedBumpTexture(256, 20);
roofBumpTex.repeat.set(16, 1);
export const roofMat = new THREE.MeshStandardMaterial({ color: COLORS.roofDark, roughness: 0.7, metalness: 0.2, side: THREE.DoubleSide, bumpMap: roofBumpTex, bumpScale: 0.03 });
export const ribMat = new THREE.LineBasicMaterial({ color: COLORS.roofRib, transparent: true, opacity: 0.85 });
export const rafterMat = new THREE.MeshStandardMaterial({ color: COLORS.trim, roughness: 0.55, metalness: 0.3 });
export const metalTrimMat = new THREE.MeshStandardMaterial({ color: 0x5b5850, roughness: 0.45, metalness: 0.55 });
export const hardwareMat = new THREE.MeshStandardMaterial({ color: 0xd8c99a, metalness: 0.7, roughness: 0.3 });

// -- walls / doors / windows --
export const wallBumpTex = makeNoiseBumpTexture(256, 500, 2.5, 100, 170);
wallBumpTex.repeat.set(3, 2);
export const woodGrainTex = makeGrainBumpTexture(256, 60, true);
export const frameMat = new THREE.MeshStandardMaterial({ color: COLORS.white, roughness: 0.5 });
export const glassMat = new THREE.MeshStandardMaterial({ color: 0x9fc6d6, roughness: 0.15, metalness: 0.2, transparent: true, opacity: 0.55, side: THREE.DoubleSide });

// -- decorative helpers (bench, extinguisher box, wall lamp) --
export const benchMat = new THREE.MeshStandardMaterial({ color: COLORS.bench, roughness: 0.75 });
export const redBoxMat = new THREE.MeshStandardMaterial({ color: 0xb3231c, roughness: 0.5 });
export const lampGlassMat = new THREE.MeshStandardMaterial({ color: 0xfff2c8, emissive: 0xffe6a0, emissiveIntensity: 0.65, roughness: 0.4 });

// -- vending machine body bump --
export const vendingBumpTex = makeNoiseBumpTexture(256, 300, 1.5, 140, 200);
vendingBumpTex.repeat.set(2, 3);

// -- ceiling downlights --
export const downlightMat = new THREE.MeshStandardMaterial({ color: 0xfff6e2, emissive: 0xfff2d0, emissiveIntensity: 1.1, roughness: 0.5 });
export const downlightGeo = new THREE.CircleGeometry(0.09, 12);

// -- AO contact-shadow decal + warm additive glow (used by environment.js's
//    addContactShadow/glow pool, and by the lantern glow sprites) --
export const shadowBlobTex = makeShadowBlobTexture();
export const shadowBlobMat = new THREE.MeshBasicMaterial({ map: shadowBlobTex, transparent: true, depthWrite: false, toneMapped: false });
export const glowBlobTex = makeGlowBlobTexture();
export const glowMat = new THREE.SpriteMaterial({ map: glowBlobTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false });
export const glowPoolMat = new THREE.MeshBasicMaterial({ map: glowBlobTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false });
