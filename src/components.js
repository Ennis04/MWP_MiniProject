/* =========================================================
   COMPONENT LIBRARY — one function per object type. Each takes explicit
   world coordinates (x, y, z), a rotationY in radians (0 = local "front"
   faces world +Z; increasing rotates counter-clockwise viewed from above —
   standard Three.js Y-axis rotation), and a colour. Every function also
   returns the object it created in case you want to move/tweak it further.

   y-convention (differs by type, documented per function below):
   floor-standing objects (wall, pillar, door, vending machine, table,
   chair) take y = BASE/floor height. createWindow takes y = the CENTRE of
   the opening, since it isn't floor-standing. createRoof takes y = the
   height it sits at (e.g. the top of a wall it rests on).

   Depends on: three, scene.js, config.js, textures.js, materials.js,
   environment.js (for addContactShadow)
========================================================= */
import * as THREE from 'three';
import { scene } from './scene.js';
import { CFG, CAPITAL_H } from './config.js';
import { makeWeatheredColorTexture, makeNoiseBumpTexture, makeCorrugatedBumpTexture } from './textures.js';
import {
  pillarBumpTex, pillarRoughTex, pillarBaseMat, capitalMat,
  rafterMat, metalTrimMat, hardwareMat, frameMat, glassMat, woodGrainTex, vendingBumpTex,
} from './materials.js';
import { addContactShadow } from './environment.js';

export const pillars = []; // world positions, used by the collision system in controls.js

// y = base (floor) height; the shaft rises from there. rotationY has no
// visual effect (a cylinder is rotationally symmetric) but is still a
// parameter so every component function shares the same call signature.
export function createPillar(x, y, z, rotationY, color, height = CFG.pillarHeight, radius = CFG.pillarRadius) {
  const group = new THREE.Group();
  const colorTex = makeWeatheredColorTexture(color, 256);
  colorTex.repeat.set(2, 1);
  const mat = new THREE.MeshStandardMaterial({ map: colorTex, roughness: 0.7, roughnessMap: pillarRoughTex, metalness: 0.08, bumpMap: pillarBumpTex, bumpScale: 0.02 });

  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, height, 16), mat);
  shaft.position.y = height / 2;
  shaft.castShadow = true;
  shaft.receiveShadow = true;
  group.add(shaft);

  const plinth = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.1, 1.0), pillarBaseMat);
  plinth.position.y = 0.05;
  plinth.castShadow = true;
  plinth.receiveShadow = true;
  group.add(plinth);

  const base = new THREE.Mesh(new THREE.CylinderGeometry(radius + 0.07, radius + 0.1, 0.16, 16), pillarBaseMat);
  base.position.y = 0.08;
  base.receiveShadow = true;
  group.add(base);

  const capital = new THREE.Mesh(new THREE.CylinderGeometry(radius + 0.15, radius + 0.02, CAPITAL_H, 16), capitalMat);
  capital.position.y = height - CAPITAL_H / 2;
  capital.castShadow = true;
  capital.receiveShadow = true;
  group.add(capital);

  group.position.set(x, y, z);
  group.rotation.y = rotationY;
  scene.add(group);
  addContactShadow(new THREE.Vector3(x, y, z), radius * 1.75);
  pillars.push(new THREE.Vector3(x, y, z));
  return group;
}

// y = base (floor) height; the wall rises upward from there.
export function createWall(x, y, z, rotationY, color, width = 3, height = CFG.wallHeight, thickness = 0.25) {
  const tiles = Math.max(1, Math.round(width / 2.2));
  const colorTex = makeWeatheredColorTexture(color, 256);
  colorTex.repeat.set(tiles, 1);
  const roughTex = makeNoiseBumpTexture(256, 350, 3, 150, 255);
  roughTex.repeat.set(tiles, 1);
  const bumpTex = makeNoiseBumpTexture(256, 500, 2.5, 100, 170);
  bumpTex.repeat.set(tiles, 2);
  const mat = new THREE.MeshStandardMaterial({ map: colorTex, roughness: 0.85, roughnessMap: roughTex, bumpMap: bumpTex, bumpScale: 0.015 });

  const wall = new THREE.Mesh(new THREE.BoxGeometry(width, height, thickness), mat);
  wall.position.set(x, y + height / 2, z);
  wall.rotation.y = rotationY;
  wall.castShadow = true;
  wall.receiveShadow = true;
  scene.add(wall);
  return wall;
}

// y = base (floor) height.
export function createDoor(x, y, z, rotationY, color, width = CFG.doorW, height = CFG.doorH) {
  const mat = new THREE.MeshStandardMaterial({ map: makeWeatheredColorTexture(color, 256), roughness: 0.55, bumpMap: woodGrainTex, bumpScale: 0.01 });
  const group = new THREE.Group();

  const slabT = 0.08;
  const door = new THREE.Mesh(new THREE.BoxGeometry(width, height, slabT), mat);
  door.position.set(0, height / 2, slabT / 2);
  door.castShadow = true;
  group.add(door);

  // raised stiles + rails give genuine recessed-panel relief — embedded
  // slightly into the slab and protruding in front of it — rather than a
  // flat alpha-blended decal.
  const stripD = 0.032;
  const stripZ = slabT - 0.01 + stripD / 2;
  for (const sx of [-width / 2 + 0.055, width / 2 - 0.055]) {
    const stile = new THREE.Mesh(new THREE.BoxGeometry(0.065, height - 0.12, stripD), mat);
    stile.position.set(sx, height / 2, stripZ);
    group.add(stile);
  }
  for (const ry of [0.09, 0.5, 0.91]) {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(width - 0.1, 0.075, stripD), mat);
    rail.position.set(0, height * ry, stripZ);
    group.add(rail);
  }

  const handle = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.3, 0.04), hardwareMat);
  handle.position.set(width * 0.36, height * 0.5, slabT + 0.03);
  group.add(handle);

  const kick = new THREE.Mesh(new THREE.BoxGeometry(width - 0.06, 0.15, 0.015), metalTrimMat);
  kick.position.set(0, 0.1, slabT + 0.01);
  group.add(kick);

  const frame = new THREE.Mesh(new THREE.BoxGeometry(width + 0.14, height + 0.12, 0.14), frameMat);
  frame.position.set(0, height / 2, -0.02);
  group.add(frame);

  const sill = new THREE.Mesh(new THREE.BoxGeometry(width + 0.2, 0.04, 0.24), frameMat);
  sill.position.set(0, 0.02, 0.09);
  group.add(sill);

  group.position.set(x, y, z);
  group.rotation.y = rotationY;
  scene.add(group);
  return group;
}

// y = CENTRE of the window opening (not the base — a window isn't floor-standing).
export function createWindow(x, y, z, rotationY, color, width = 1.3, height = 1.1) {
  const group = new THREE.Group();
  group.add(new THREE.Mesh(new THREE.PlaneGeometry(width, height), glassMat));
  const frameMatC = new THREE.MeshStandardMaterial({ color, roughness: 0.5 });
  const frame = new THREE.Mesh(new THREE.BoxGeometry(width + 0.1, height + 0.1, 0.06), frameMatC);
  frame.position.z = -0.02;
  group.add(frame);
  for (let i = 1; i < 3; i++) {
    const bar = new THREE.Mesh(new THREE.BoxGeometry(0.04, height, 0.04), frameMatC);
    bar.position.set(-width / 2 + (width / 3) * i, 0, 0.02);
    group.add(bar);
  }
  const hbar = new THREE.Mesh(new THREE.BoxGeometry(width, 0.04, 0.04), frameMatC);
  hbar.position.set(0, 0, 0.02);
  group.add(hbar);

  group.position.set(x, y, z);
  group.rotation.y = rotationY;
  scene.add(group);
  return group;
}

// Gable-style roof (the discrete, repeatable "kiosk roof" piece). The main
// octagonal trussed roof over the whole courtyard is a separate, singular
// structure (see environment.js) and isn't meant to be placed per-object.
// y = base — the height at which the roof sits (e.g. the top of a wall).
export function createRoof(x, y, z, rotationY, color, width = 3, height = 1.1, depth = 1.6) {
  const bumpTex = makeCorrugatedBumpTexture(256, 20);
  bumpTex.repeat.set(Math.max(4, Math.round(width * 2)), 1);
  const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.68, bumpMap: bumpTex, bumpScale: 0.025 });

  const shape = new THREE.Shape();
  shape.moveTo(-width / 2, 0);
  shape.lineTo(0, height);
  shape.lineTo(width / 2, 0);
  shape.lineTo(-width / 2, 0);
  const geo = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false });
  geo.translate(0, 0, -depth / 2);
  const roof = new THREE.Mesh(geo, mat);
  roof.castShadow = true;

  const ridge = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.09, depth + 0.16), rafterMat);
  ridge.position.set(0, height, 0);
  ridge.castShadow = true;
  roof.add(ridge);

  const beta = Math.atan2(width / 2, height);
  const slantLen = Math.hypot(width / 2, height);
  for (const side of [-1, 1]) {
    const barge = new THREE.Mesh(new THREE.BoxGeometry(0.06, slantLen + 0.08, depth + 0.16), rafterMat);
    barge.position.set(side * width / 4, height / 2, 0);
    barge.rotation.z = side * beta;
    barge.castShadow = true;
    roof.add(barge);
  }

  roof.position.set(x, y, z);
  roof.rotation.y = rotationY;
  scene.add(roof);
  return roof;
}

// Vending machine — lit header sign, recessed glass with actual visible
// product behind it (not a fake emissive panel), keypad, coin slot and
// dispenser flap. No real light source (emissive only) to keep the scene's
// light count cheap. y = base (floor) height.
export function createVendingMachine(x, y, z, rotationY, color) {
  const productColors = [0xd6362a, 0xe8b930, 0x3f8f4a, 0xe0e0da];
  const W = 0.9, H = 1.9, D = 0.7;
  const group = new THREE.Group();

  const bodyMat = new THREE.MeshStandardMaterial({ color, roughness: 0.4, metalness: 0.5, bumpMap: vendingBumpTex, bumpScale: 0.006 });
  const body = new THREE.Mesh(new THREE.BoxGeometry(W, H, D), bodyMat);
  body.position.y = H / 2;
  body.castShadow = true;
  group.add(body);

  // lit header/brand strip
  const headerMat = new THREE.MeshStandardMaterial({ color: 0xf6f6f2, emissive: 0xffffff, emissiveIntensity: 0.55, roughness: 0.4 });
  const header = new THREE.Mesh(new THREE.BoxGeometry(W - 0.06, 0.2, 0.03), headerMat);
  header.position.set(0, H - 0.18, D / 2 + 0.01);
  group.add(header);

  // recessed glass display case with its own frame
  const glassW = 0.52, glassH = 0.82, glassY = 1.18, glassX = -0.08;
  const frameMatV = new THREE.MeshStandardMaterial({ color: 0xe8e8e2, roughness: 0.35, metalness: 0.3 });
  const frame = new THREE.Mesh(new THREE.BoxGeometry(glassW + 0.08, glassH + 0.08, 0.03), frameMatV);
  frame.position.set(glassX, glassY, D / 2 + 0.005);
  group.add(frame);
  const glassMatV = new THREE.MeshStandardMaterial({ color: 0x0d1c22, roughness: 0.08, metalness: 0.6, transparent: true, opacity: 0.65 });
  const glass = new THREE.Mesh(new THREE.BoxGeometry(glassW, glassH, 0.02), glassMatV);
  glass.position.set(glassX, glassY, D / 2 + 0.03);
  group.add(glass);

  // actual rows of product standing behind the glass, not a fake panel
  const cols = 3, rows = 3;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const mat = new THREE.MeshStandardMaterial({ color: productColors[(r + c) % productColors.length], roughness: 0.4, metalness: 0.2 });
      const item = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.16, 8), mat);
      const px = glassX + (c - 1) * (glassW - 0.1) / (cols - 1);
      const py = glassY + (r - 1) * (glassH - 0.16) / (rows - 1);
      item.position.set(px, py, D / 2 - 0.05);
      group.add(item);
    }
  }

  // selection keypad beside the display
  const keypadMat = new THREE.MeshStandardMaterial({ color: 0x1c1c1a, roughness: 0.5 });
  const keypad = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.42, 0.025), keypadMat);
  keypad.position.set(0.28, 1.1, D / 2 + 0.008);
  group.add(keypad);
  const buttonMat = new THREE.MeshStandardMaterial({ color: 0xd8c840, roughness: 0.4, emissive: 0x443300, emissiveIntensity: 0.2 });
  for (let r = 0; r < 4; r++) {
    const btn = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.012, 8), buttonMat);
    btn.rotation.x = Math.PI / 2;
    btn.position.set(0.28, 1.25 - r * 0.1, D / 2 + 0.023);
    group.add(btn);
  }

  // coin slot below the keypad
  const coinMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.3, metalness: 0.6 });
  const coinSlot = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.1, 0.015), coinMat);
  coinSlot.position.set(0.28, 0.78, D / 2 + 0.015);
  group.add(coinSlot);

  // dispenser flap with a handle
  const flap = new THREE.Mesh(new THREE.BoxGeometry(W - 0.14, 0.16, 0.03), metalTrimMat);
  flap.position.set(0, 0.34, D / 2 + 0.01);
  group.add(flap);
  const flapHandle = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.03, 0.03), hardwareMat);
  flapHandle.position.set(0, 0.34, D / 2 + 0.03);
  group.add(flapHandle);

  const kick = new THREE.Mesh(new THREE.BoxGeometry(W, 0.1, D), metalTrimMat);
  kick.position.y = 0.05;
  group.add(kick);
  group.position.set(x, y, z);
  group.rotation.y = rotationY;
  scene.add(group);
  addContactShadow(new THREE.Vector3(x, y, z), 0.62, 0.75);
  return group;
}

// y = base (floor) height. Table only — place chairs separately with createChair.
export function createTable(x, y, z, rotationY, color) {
  const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.55, bumpMap: woodGrainTex, bumpScale: 0.008 });
  const group = new THREE.Group();
  const top = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.05, 0.7), mat);
  top.position.y = 0.72;
  top.castShadow = true;
  group.add(top);
  for (const sx of [-0.65, 0.65]) {
    for (const sz of [-0.28, 0.28]) {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.72, 0.05), metalTrimMat);
      leg.position.set(sx, 0.36, sz);
      leg.castShadow = true;
      group.add(leg);
    }
  }
  group.position.set(x, y, z);
  group.rotation.y = rotationY;
  scene.add(group);
  addContactShadow(new THREE.Vector3(x, y, z), 1.1, 0.6);
  return group;
}

// y = base (floor) height. rotationY = 0 means the seat faces world +Z
// (i.e. the backrest is behind it, on the -Z side).
export function createChair(x, y, z, rotationY, color) {
  const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.5 });
  const group = new THREE.Group();
  const seat = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.04, 0.38), mat);
  seat.position.y = 0.44;
  seat.castShadow = true;
  group.add(seat);
  const back = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.4, 0.04), mat);
  back.position.set(0, 0.64, -0.17);
  back.castShadow = true;
  group.add(back);
  for (const lx of [-0.16, 0.16]) {
    for (const lz of [-0.16, 0.16]) {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.44, 6), metalTrimMat);
      leg.position.set(lx, 0.22, lz);
      group.add(leg);
    }
  }
  group.position.set(x, y, z);
  group.rotation.y = rotationY;
  scene.add(group);
  return group;
}
