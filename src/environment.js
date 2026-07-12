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
scene.add(new THREE.Mesh(
  new THREE.SphereGeometry(180, 32, 16),
  new THREE.MeshBasicMaterial({ map: makeSkyTexture(), side: THREE.BackSide, fog: false })
));

scene.add(new THREE.HemisphereLight(0xcfe8f5, 0x4a4030, 0.95));
scene.add(new THREE.AmbientLight(0xffffff, 0.16));

const sun = new THREE.DirectionalLight(0xfff2dc, 1.25);
sun.position.set(14, 22, 8);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
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

/* ---------------- GROUND / APRON / FLOOR ---------------- */
const ground = new THREE.Mesh(
  new THREE.CircleGeometry(120, 48),
  new THREE.MeshStandardMaterial({ color: 0x8a9a7c, roughness: 1 })
);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -0.03;
ground.receiveShadow = true;
scene.add(ground);

const apron = new THREE.Mesh(
  new THREE.CircleGeometry(CFG.R1 + 6, 48),
  new THREE.MeshStandardMaterial({ color: 0xb7b2a4, roughness: 0.95 })
);
apron.rotation.x = -Math.PI / 2;
apron.position.y = -0.02;
apron.receiveShadow = true;
scene.add(apron);

const terrazzoTex = makeTerrazzoTexture();
const terrazzoBumpTex = makeTerrazzoBumpTexture();
const terrazzoRoughTex = makeNoiseBumpTexture(256, 500, 3, 120, 255);
terrazzoRoughTex.repeat.set(5, 5);
const floor = new THREE.Mesh(
  new THREE.CircleGeometry(CFG.R1 + 0.4, 48),
  new THREE.MeshStandardMaterial({ map: terrazzoTex, bumpMap: terrazzoBumpTex, bumpScale: 0.012, roughnessMap: terrazzoRoughTex, roughness: 0.9, metalness: 0.02 })
);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

const centerDisc = new THREE.Mesh(
  new THREE.CircleGeometry(2.6, 32),
  new THREE.MeshStandardMaterial({ map: makeBrickCenterTexture(), roughness: 0.85 })
);
centerDisc.rotation.x = -Math.PI / 2;
centerDisc.position.y = 0.015;
centerDisc.receiveShadow = true;
scene.add(centerDisc);

/* ---- soft contact-shadow decals: a cheap, reliable stand-in for ambient
   occlusion that grounds every prop without needing a post-processing pass ---- */
export function addContactShadow(pos, radius, opacity = 1) {
  const mesh = new THREE.Mesh(new THREE.CircleGeometry(radius, 20), shadowBlobMat.clone());
  mesh.material.opacity = opacity;
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.set(pos.x, 0.025, pos.z);
  mesh.renderOrder = 1;
  scene.add(mesh);
  return mesh;
}

/* ---- warm additive glow floor pool under the lantern ---- */
const glowPool = new THREE.Mesh(new THREE.CircleGeometry(3.3, 24), glowPoolMat);
glowPool.rotation.x = -Math.PI / 2;
glowPool.position.y = 0.03;
glowPool.renderOrder = 2;
scene.add(glowPool);

/* ---------------- ROOF: frustum + real trusswork + lantern + cap ----------------
   This is the single whole-building octagonal roof — unlike the component
   library's createRoof (a discrete, repeatable gable piece), this structure
   is singular and isn't meant to be placed per-object. ---------------- */
function addRibs(geometry, mesh) {
  const edges = new THREE.EdgesGeometry(geometry, 1);
  mesh.add(new THREE.LineSegments(edges, ribMat));
}

// eave ring at pillar tops — a proper deep fascia board, not a thin sliver
const eaveGeo = new THREE.CylinderGeometry(CFG.R1 + CFG.eaveOverhang, CFG.R1 + CFG.eaveOverhang, 0.32, 8, 1, true);
const eave = new THREE.Mesh(eaveGeo, roofMat);
eave.position.y = CFG.pillarHeight + 0.06;
eave.castShadow = true;
addRibs(eaveGeo, eave);
scene.add(eave);

// gutter channel riding just under the fascia, in its own metal tone
const gutterGeo = new THREE.CylinderGeometry(CFG.R1 + CFG.eaveOverhang - 0.04, CFG.R1 + CFG.eaveOverhang - 0.04, 0.1, 8, 1, true);
const gutter = new THREE.Mesh(gutterGeo, metalTrimMat);
gutter.position.y = CFG.pillarHeight - 0.12;
gutter.castShadow = true;
scene.add(gutter);

// main sloped frustum: wide at pillar tops, narrow at the lantern base
const frustumH = CFG.roofFrustumTopY - CFG.pillarHeight;
const frustumGeo = new THREE.CylinderGeometry(CFG.roofLanternR, CFG.R1 + CFG.eaveOverhang, frustumH, 8, 1, true);
const frustum = new THREE.Mesh(frustumGeo, roofMat);
frustum.position.y = CFG.pillarHeight + frustumH / 2;
frustum.castShadow = true;
addRibs(frustumGeo, frustum);
scene.add(frustum);

// Real 3D trusswork: 8 rafters radiating from the eave to the lantern base,
// plus two purlin belts crossing them. This is what actually sells the
// "dark trussed roof" look from underneath, instead of just painted lines.
// vertexAngle(i) is used deliberately here (not sideAngle) — for a regular
// N-gon prism generated by CylinderGeometry with thetaStart=0, the set of
// facet-corner angles is exactly {0, 2π/N, 4π/N, ...}, the same set
// vertexAngle() produces, so every rafter lands squarely on a roof ridge.
function frustumRibPoint(i, t) {
  const a = vertexAngle(i);
  const r = THREE.MathUtils.lerp(CFG.R1 + CFG.eaveOverhang - RAFTER_INSET, CFG.roofLanternR - RAFTER_INSET, t);
  const y = THREE.MathUtils.lerp(CFG.pillarHeight + 0.05, CFG.roofFrustumTopY, t);
  return polar(a, r, y);
}
for (let i = 0; i < 8; i++) {
  const beam = addBeamBetween(frustumRibPoint(i, 0), frustumRibPoint(i, 1), RAFTER_SIZE, RAFTER_SIZE, rafterMat);
  scene.add(beam);
}
function addPurlinBelt(t) {
  for (let i = 0; i < 8; i++) {
    const beam = addBeamBetween(frustumRibPoint(i, t), frustumRibPoint((i + 1) % 8, t), RAFTER_SIZE * 0.75, RAFTER_SIZE * 0.75, rafterMat);
    scene.add(beam);
  }
}
addPurlinBelt(0.36);
addPurlinBelt(0.72);

// small gusset plates at every rafter/purlin junction — reads as a real
// bolted/welded connection rather than beams that merely cross in space
const gussetGeo = new THREE.BoxGeometry(0.22, 0.22, 0.02);
function addGussetsAt(t) {
  for (let i = 0; i < 8; i++) {
    const p = frustumRibPoint(i, t);
    const gusset = new THREE.Mesh(gussetGeo, rafterMat);
    gusset.position.copy(p);
    faceCenter(gusset, p.y);
    gusset.castShadow = true;
    scene.add(gusset);
  }
}
addGussetsAt(0.36);
addGussetsAt(0.72);

// lantern drum with glowing clerestory slits
const lanternBumpTex = makeCorrugatedBumpTexture(256, 20);
lanternBumpTex.repeat.set(8, 1);
const lanternGeo = new THREE.CylinderGeometry(CFG.roofLanternR, CFG.roofLanternR, CFG.lanternDrumH, 8, 1, true);
const lantern = new THREE.Mesh(lanternGeo, new THREE.MeshStandardMaterial({ color: 0x3a3632, roughness: 0.8, side: THREE.DoubleSide, bumpMap: lanternBumpTex, bumpScale: 0.025 }));
lantern.position.y = CFG.roofFrustumTopY + CFG.lanternDrumH / 2;
addRibs(lanternGeo, lantern);
scene.add(lantern);

const slitMat = new THREE.MeshStandardMaterial({
  color: 0xfff3cf, emissive: 0xfff0c0, emissiveIntensity: 0.9, roughness: 0.4, side: THREE.DoubleSide
});
for (let i = 0; i < 8; i++) {
  const y = CFG.roofFrustumTopY + CFG.lanternDrumH / 2;
  const p = polar(sideAngle(i), CFG.roofLanternR - 0.02, y);
  const slit = new THREE.Mesh(new THREE.PlaneGeometry(0.5, CFG.lanternDrumH * 0.7), slitMat);
  slit.position.copy(p);
  faceCenter(slit, y);
  scene.add(slit);

  // additive glow sprite riding on each slit — a cheap bloom stand-in
  const glow = new THREE.Sprite(glowMat);
  glow.position.copy(p);
  glow.scale.set(0.85, 1.25, 1);
  scene.add(glow);
}

// shallow pyramid cap above the lantern
const capH = CFG.roofCapTopY - (CFG.roofFrustumTopY + CFG.lanternDrumH);
const capGeo = new THREE.CylinderGeometry(0.15, CFG.roofLanternR + 0.15, capH, 8);
const cap = new THREE.Mesh(capGeo, roofMat);
cap.position.y = CFG.roofFrustumTopY + CFG.lanternDrumH + capH / 2;
cap.castShadow = true;
addRibs(capGeo, cap);
scene.add(cap);

/* ---------------- CENTRAL TOWER (background feature beyond side 4) ---------------- */
function buildTower() {
  const group = new THREE.Group();
  const baseH = 5.1;
  const towerBumpTex = makeNoiseBumpTexture(256, 500, 2, 90, 170);
  towerBumpTex.repeat.set(3, 4);
  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(1.5, 1.65, baseH, 8),
    new THREE.MeshStandardMaterial({ color: COLORS.towerTerracotta, roughness: 0.75, bumpMap: towerBumpTex, bumpScale: 0.02 })
  );
  body.position.y = baseH / 2;
  body.castShadow = true;
  group.add(body);

  const band = new THREE.Mesh(
    new THREE.CylinderGeometry(1.52, 1.52, 0.2, 8),
    new THREE.MeshStandardMaterial({ color: 0x7c3a20, roughness: 0.7 })
  );
  band.position.y = baseH * 0.62;
  group.add(band);

  const winGlass = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.9), glassMat);
  winGlass.position.set(0, baseH * 0.55, 1.51);
  group.add(winGlass);
  const winFrame = new THREE.Mesh(new THREE.BoxGeometry(0.82, 1.0, 0.08), frameMat);
  winFrame.position.set(0, baseH * 0.55, 1.47);
  group.add(winFrame);

  const capH2 = 1.7;
  const towerCap = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 1.75, capH2, 8), roofMat);
  towerCap.position.y = baseH + capH2 / 2;
  towerCap.castShadow = true;
  group.add(towerCap);

  group.position.copy(polar(sideAngle(4), CFG.R1 + 5.5, 0));
  faceCenter(group, 0);
  scene.add(group);
  addContactShadow(group.position, 1.9, 0.6);
}
buildTower();

/* ---------------- TREES near open sides ---------------- */
const barkBumpTex = makeGrainBumpTexture(128, 30, true);
const trunkMat = new THREE.MeshStandardMaterial({ color: 0x4b3a26, roughness: 0.9, bumpMap: barkBumpTex, bumpScale: 0.04 });
const leafBumpTex = makeNoiseBumpTexture(128, 300, 2, 90, 170);
function buildTree(angle, radius, scale = 1) {
  const group = new THREE.Group();
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.11, 0.17, 1.7, 8),
    trunkMat
  );
  trunk.position.y = 0.85;
  trunk.castShadow = true;
  group.add(trunk);
  const leafColors = [0x4c7a3d, 0x5a8a47, 0x436b35];
  for (let i = 0; i < 5; i++) {
    const mat = new THREE.MeshStandardMaterial({ color: leafColors[i % leafColors.length], roughness: 0.9, bumpMap: leafBumpTex, bumpScale: 0.5 });
    const r = 0.5 + Math.random() * 0.35;
    const leaf = new THREE.Mesh(new THREE.SphereGeometry(r, 8, 7), mat);
    leaf.position.set((Math.random() - 0.5) * 0.9, 1.85 + Math.random() * 1.05, (Math.random() - 0.5) * 0.9);
    leaf.castShadow = true;
    group.add(leaf);
  }
  const pos = polar(angle, radius, 0);
  group.position.set(pos.x, 0, pos.z);
  group.scale.setScalar(scale);
  scene.add(group);
  addContactShadow(pos, 1.1 * scale, 0.55);
}
buildTree(sideAngle(0) - 0.55, CFG.R1 + 5, 1.1);
buildTree(sideAngle(6) + 0.4, CFG.R1 + 6, 0.95);
buildTree(sideAngle(2) + 0.6, CFG.R1 + 8, 1.2);

/* ---------------- CEILING FANS (subtle animated detail) ---------------- */
function buildFan(angle, radius, y) {
  const group = new THREE.Group();
  const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.45, 8), metalTrimMat);
  rod.position.y = 0.225;
  group.add(rod);
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.13, 12), metalTrimMat);
  group.add(hub);
  const bladeMat = new THREE.MeshStandardMaterial({ color: 0x3d3a34, roughness: 0.55, side: THREE.DoubleSide });
  const bladeGroup = new THREE.Group();
  for (let i = 0; i < 4; i++) {
    const holder = new THREE.Group();
    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.012, 0.12), bladeMat);
    blade.position.x = 0.32;
    holder.add(blade);
    holder.rotation.y = (i / 4) * Math.PI * 2;
    bladeGroup.add(holder);
  }
  group.add(bladeGroup);
  group.position.copy(polar(angle, radius, y));
  scene.add(group);
  return bladeGroup;
}
export const fanBlades = [
  buildFan(sideAngle(2), 3.3, CFG.pillarHeight - 0.4),
  buildFan(sideAngle(6), 3.3, CFG.pillarHeight - 0.4),
];

/* ---------------- DUST MOTES drifting in the lantern light shaft ---------------- */
const moteMat = new THREE.SpriteMaterial({ map: glowBlobTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false, opacity: 0.45 });
export const motes = [];
for (let i = 0; i < 22; i++) {
  const mote = new THREE.Sprite(moteMat);
  const r = Math.random() * 2.4;
  const a = Math.random() * Math.PI * 2;
  mote.position.set(Math.cos(a) * r, Math.random() * 6, Math.sin(a) * r);
  mote.scale.setScalar(0.03 + Math.random() * 0.05);
  mote.userData.speed = 0.12 + Math.random() * 0.22;
  scene.add(mote);
  motes.push(mote);
}
