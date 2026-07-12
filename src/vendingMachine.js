import * as THREE from 'three';
import { registerBox } from './collisions.js';

export function buildVendingMachine(scene, x, z, rotY) {
  const group = new THREE.Group();
  group.position.set(x, 0, z);
  group.rotation.y = rotY;

  const w = 1.2;
  const h = 2.0;
  const d = 0.8;
  const wallThick = 0.1;

  const caseMat = new THREE.MeshStandardMaterial({ color: 0xcc0000, roughness: 0.7 });
  const internalMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.9 });
  const glassMat = new THREE.MeshStandardMaterial({ color: 0x88ccff, transparent: true, opacity: 0.3, roughness: 0.1 });
  const canMat = new THREE.MeshStandardMaterial({ color: 0xc0c0c0, metalness: 0.9, roughness: 0.3 });

  // Left wall
  const leftW = new THREE.Mesh(new THREE.BoxGeometry(wallThick, h, d), caseMat);
  leftW.position.set(w/2 - wallThick/2, h/2, 0);
  leftW.castShadow = true;
  group.add(leftW);

  // Right wall
  const rightW = new THREE.Mesh(new THREE.BoxGeometry(wallThick, h, d), caseMat);
  rightW.position.set(-w/2 + wallThick/2, h/2, 0);
  rightW.castShadow = true;
  group.add(rightW);

  // Back wall
  const backW = new THREE.Mesh(new THREE.BoxGeometry(w - wallThick*2, h, wallThick), caseMat);
  backW.position.set(0, h/2, -d/2 + wallThick/2);
  backW.castShadow = true;
  group.add(backW);

  // Top
  const topW = new THREE.Mesh(new THREE.BoxGeometry(w - wallThick*2, wallThick, d - wallThick), caseMat);
  topW.position.set(0, h - wallThick/2, wallThick/2);
  topW.castShadow = true;
  group.add(topW);

  // Bottom mechanism box
  const botH = 0.4;
  const botW = new THREE.Mesh(new THREE.BoxGeometry(w - wallThick*2, botH, d - wallThick), caseMat);
  botW.position.set(0, botH/2, wallThick/2);
  botW.castShadow = true;
  group.add(botW);

  // Back panel inside (to make it dark inside)
  const innerBack = new THREE.Mesh(new THREE.PlaneGeometry(w - wallThick*2, h - botH - wallThick), internalMat);
  innerBack.position.set(0, botH + (h - botH - wallThick)/2, -d/2 + wallThick + 0.01);
  group.add(innerBack);

  // Glass front
  const glassGeo = new THREE.BoxGeometry(w - wallThick*2, h - botH - wallThick, 0.02);
  const glass = new THREE.Mesh(glassGeo, glassMat);
  glass.position.set(0, botH + (h - botH - wallThick)/2, d/2 - 0.05); 
  
  // Interaction data
  glass.userData.isVendingMachine = true;
  group.add(glass);

  // Add cans on shelves
  const canGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.12, 16);
  for (let shelf = 0; shelf < 3; shelf++) {
    const shelfY = botH + 0.2 + shelf * 0.4;
    // Shelf plane
    const sh = new THREE.Mesh(new THREE.BoxGeometry(w - wallThick*2, 0.02, d/2), internalMat);
    sh.position.set(0, shelfY - 0.06, 0);
    group.add(sh);

    for (let col = -3; col <= 3; col++) {
      const can = new THREE.Mesh(canGeo, canMat);
      can.position.set(col * 0.14, shelfY, 0.1);
      can.castShadow = true;
      group.add(can);
    }
  }

  // Light inside
  const light = new THREE.PointLight(0xffffff, 0, 2.0); // Start OFF
  light.position.set(0, h - 0.2, d/4);
  glass.userData.targetLight = light;
  group.add(light);

  scene.add(group);

  // Register collision using the bounding box of the whole group
  group.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(group);
  registerBox(box.min.x, box.max.x, box.min.z, box.max.z);
}

// Play sound and auto-turn off light when done
export function playDropSound(light) {
  // Create a new Audio object for each click so multiple machines can play at once
  const dropSound = new Audio('/sounds/vending-machine-sound.mp3');
  dropSound.play();
  
  dropSound.onended = () => {
    if (light) light.intensity = 0;
  };
}
