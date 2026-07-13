import * as THREE from 'three';
import { registerBox } from './collisions.js';

const machines = [];
const productColors = [0xd92f2f, 0x3b83d5, 0xf2c230, 0x48a55a];

function makeBrandTexture() {
  const c = document.createElement('canvas'); c.width = 512; c.height = 128;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#f5f5ef'; ctx.fillRect(0, 0, c.width, c.height);
  ctx.fillStyle = '#be1e2d'; ctx.font = 'bold 54px Segoe UI, sans-serif';
  ctx.textAlign = 'center'; ctx.fillText('REFRESH', 256, 79);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

export function buildVendingMachine(scene, x, z, rotY) {
  const group = new THREE.Group(); group.position.set(x, 0, z); group.rotation.y = rotY;
  const W = 1.15, H = 2.05, D = .78;
  const red = new THREE.MeshStandardMaterial({ color: 0xb7192b, roughness: .38, metalness: .28 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x151719, roughness: .5, metalness: .35 });
  const silver = new THREE.MeshStandardMaterial({ color: 0xaeb4b8, roughness: .3, metalness: .75 });
  const glassMat = new THREE.MeshPhysicalMaterial({ color: 0x8ec5d8, transparent: true, opacity: .22, roughness: .08, transmission: .15 });

  const body = new THREE.Mesh(new THREE.BoxGeometry(W, H, D), red);
  body.position.y = H / 2; body.castShadow = true; group.add(body);

  const header = new THREE.Mesh(new THREE.PlaneGeometry(W - .1, .25), new THREE.MeshStandardMaterial({ map: makeBrandTexture(), emissive: 0xffffff, emissiveIntensity: .25 }));
  header.position.set(0, 1.87, D / 2 + .012); group.add(header);

  const recess = new THREE.Mesh(new THREE.BoxGeometry(.76, 1.18, .035), dark);
  recess.position.set(-.1, 1.18, D / 2 + .012); group.add(recess);

  const shelfMat = new THREE.MeshStandardMaterial({ color: 0xd8dde0, metalness: .65, roughness: .3 });
  for (let row = 0; row < 3; row++) {
    const sy = .79 + row * .36;
    const shelf = new THREE.Mesh(new THREE.BoxGeometry(.69, .025, .18), shelfMat);
    shelf.position.set(-.1, sy - .1, D / 2 + .045); group.add(shelf);
    for (let col = 0; col < 4; col++) {
      const canMat = new THREE.MeshStandardMaterial({ color: productColors[(row + col) % productColors.length], metalness: .55, roughness: .3 });
      const can = new THREE.Mesh(new THREE.CylinderGeometry(.052, .052, .17, 16), canMat);
      can.position.set(-.36 + col * .18, sy, D / 2 + .075); group.add(can);
    }
  }
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(.72, 1.12), glassMat);
  glass.position.set(-.1, 1.18, D / 2 + .115); group.add(glass);

  const screenMat = new THREE.MeshStandardMaterial({ color: 0x61d7eb, emissive: 0x1f8fa0, emissiveIntensity: .65 });
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(.21, .13), screenMat);
  screen.position.set(.39, 1.48, D / 2 + .026); group.add(screen);
  for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) {
    const key = new THREE.Mesh(new THREE.CylinderGeometry(.018, .018, .014, 10), silver);
    key.rotation.x = Math.PI / 2; key.position.set(.34 + c * .05, 1.34 - r * .055, D / 2 + .035); group.add(key);
  }
  const coin = new THREE.Mesh(new THREE.BoxGeometry(.035, .1, .02), dark);
  coin.position.set(.39, 1.04, D / 2 + .03); group.add(coin);

  const chute = new THREE.Mesh(new THREE.BoxGeometry(.66, .22, .09), dark);
  chute.position.set(-.08, .29, D / 2 + .045); group.add(chute);
  const flap = new THREE.Mesh(new THREE.BoxGeometry(.53, .13, .035), silver);
  flap.position.set(-.08, .31, D / 2 + .1); group.add(flap);

  const dispensedCan = new THREE.Mesh(new THREE.CylinderGeometry(.055, .055, .18, 16), new THREE.MeshStandardMaterial({ color: 0x3b83d5, metalness: .6, roughness: .25 }));
  dispensedCan.rotation.z = Math.PI / 2; dispensedCan.position.set(-.08, .33, D / 2 + .14); dispensedCan.visible = false; group.add(dispensedCan);

  const light = new THREE.PointLight(0xe8fbff, 0, 2.3); light.position.set(-.1, 1.55, .3); group.add(light);
  group.userData.targetLight = light;
  group.userData.vendingAnimation = { time: 0, active: false, flap, can: dispensedCan, screenMat };
  group.userData.interaction = { type: 'vending', prompt: 'Buy a drink', title: 'P19 vending area', description: 'A refreshment point for students studying or waiting between classes at P19, UTM.' };
  group.traverse(child => { child.userData.interactionRoot = group; });
  scene.add(group); machines.push(group);

  group.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(body); registerBox(box.min.x, box.max.x, box.min.z, box.max.z);
}

export function startVendingAnimation(group) {
  const a = group?.userData.vendingAnimation; if (!a || a.active) return;
  a.active = true; a.time = 0; a.can.visible = false;
}

export function updateVendingMachines(dt) {
  for (const group of machines) {
    const a = group.userData.vendingAnimation; if (!a.active) continue;
    a.time += dt;
    a.screenMat.emissiveIntensity = 1 + Math.sin(a.time * 18) * .45;
    if (a.time > .65) {
      a.can.visible = true;
      const p = Math.min(1, (a.time - .65) / .55);
      a.can.position.y = .72 - .39 * (p * p);
      a.can.rotation.x += dt * 9;
      a.flap.rotation.x = -Math.sin(Math.min(1, p) * Math.PI) * .55;
    }
    if (a.time > 2.2) { a.active = false; a.flap.rotation.x = 0; a.screenMat.emissiveIntensity = .65; }
  }
}

export function playDropSound(light) {
  const sound = new Audio('/sounds/vending-machine-sound.mp3');
  sound.play().catch(() => {});
  sound.onended = () => { if (light) light.intensity = 0; };
  setTimeout(() => { if (light) light.intensity = 0; }, 2600);
}
