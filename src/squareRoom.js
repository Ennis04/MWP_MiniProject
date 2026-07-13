import * as THREE from 'three';
import { registerBox } from './collisions.js';

export function buildSquareRoom(scene, x, z, rotY) {
  const group = new THREE.Group();
  group.position.set(x, 0, z);
  group.rotation.y = rotY;

  const size = 4.0;
  const height = 3.2;
  const wallThick = 0.2;

  // Materials
  const wallMat = new THREE.MeshStandardMaterial({ color: 0x729a96, roughness: 0.9 });
  const woodMat = new THREE.MeshStandardMaterial({ color: 0x75452f, roughness: 0.8 });
  const glassMat = new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.9, roughness: 0.1, transparent: true, opacity: 0.4 });
  const frameMat = new THREE.MeshStandardMaterial({ color: 0xdddddd, roughness: 0.8 });

  const solidMeshes = [];

  // --- BACK WALL ---
  const backW = new THREE.Mesh(new THREE.BoxGeometry(size, height, wallThick), wallMat);
  backW.position.set(0, height/2, -size/2 + wallThick/2);
  backW.castShadow = true;
  backW.receiveShadow = true;
  group.add(backW);
  solidMeshes.push(backW);

  // --- SIDE WALLS ---
  const sideDepth = size - wallThick * 2;
  const sideL = new THREE.Mesh(new THREE.BoxGeometry(wallThick, height, sideDepth), wallMat);
  sideL.position.set(-size/2 + wallThick/2, height/2, 0);
  sideL.castShadow = true;
  sideL.receiveShadow = true;
  group.add(sideL);
  solidMeshes.push(sideL);

  const sideR = new THREE.Mesh(new THREE.BoxGeometry(wallThick, height, sideDepth), wallMat);
  sideR.position.set(size/2 - wallThick/2, height/2, 0);
  sideR.castShadow = true;
  sideR.receiveShadow = true;
  group.add(sideR);
  solidMeshes.push(sideR);

  // --- FRONT WALL ---
  const frontZ = size/2 - wallThick/2;

  // Left segment (width 0.5)
  const fwLeft = new THREE.Mesh(new THREE.BoxGeometry(0.5, height, wallThick), wallMat);
  fwLeft.position.set(-1.75, height/2, frontZ);
  fwLeft.castShadow = true;
  fwLeft.receiveShadow = true;
  group.add(fwLeft);
  solidMeshes.push(fwLeft);

  // Right segment (width 0.5)
  const fwRight = new THREE.Mesh(new THREE.BoxGeometry(0.5, height, wallThick), wallMat);
  fwRight.position.set(1.75, height/2, frontZ);
  fwRight.castShadow = true;
  fwRight.receiveShadow = true;
  group.add(fwRight);
  solidMeshes.push(fwRight);

  // Middle segment between window and door (width 0.5)
  const fwMid = new THREE.Mesh(new THREE.BoxGeometry(0.5, height, wallThick), wallMat);
  fwMid.position.set(-0.35, height/2, frontZ);
  fwMid.castShadow = true;
  fwMid.receiveShadow = true;
  group.add(fwMid);
  solidMeshes.push(fwMid);

  // Under window (width 1.6, height 1.0)
  const fwWinBot = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.0, wallThick), wallMat);
  fwWinBot.position.set(0.7, 0.5, frontZ);
  fwWinBot.castShadow = true;
  fwWinBot.receiveShadow = true;
  group.add(fwWinBot);
  solidMeshes.push(fwWinBot);

  // Above window (width 1.6, height 1.0)
  const fwWinTop = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.0, wallThick), wallMat);
  fwWinTop.position.set(0.7, 2.7, frontZ);
  fwWinTop.castShadow = true;
  fwWinTop.receiveShadow = true;
  group.add(fwWinTop);

  // Above door (width 0.9, height 1.2)
  const fwDoorTop = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.2, wallThick), wallMat);
  fwDoorTop.position.set(-1.05, 2.6, frontZ);
  fwDoorTop.castShadow = true;
  fwDoorTop.receiveShadow = true;
  group.add(fwDoorTop);

  // Window Glass
  const glass = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.2, 0.05), glassMat);
  glass.position.set(0.7, 1.6, frontZ);
  group.add(glass);

  // --- INTERACTIVE DOOR ---
  const doorPivot = new THREE.Group();
  doorPivot.position.set(-0.6, 0, frontZ); // Hinge on the right
  group.add(doorPivot);

  const doorGeo = new THREE.BoxGeometry(0.9 - 0.02, 2.0, 0.1);
  doorGeo.translate(-0.44, 1.0, 0); // Translate so hinge is at local origin

  const door = new THREE.Mesh(doorGeo, woodMat);
  door.userData.interaction = { type: 'lockedDoor', prompt: 'Check door', title: 'Dewan kuliah', description: 'This lecture hall is locked during the virtual tour.' };
  door.userData.interactionRoot = door;
  doorPivot.add(door);
  solidMeshes.push(door);

  // --- ROOF ---
  const roof = new THREE.Mesh(new THREE.BoxGeometry(size, 0.2, size), wallMat);
  roof.position.set(0, height + 0.1, 0);
  roof.castShadow = true;
  roof.receiveShadow = true;
  group.add(roof);

  // --- LIGHT & SWITCH ---
  const roomLight = new THREE.PointLight(0xfffaaa, 0, 10);
  roomLight.position.set(0, 3.0, 0); // Center of ceiling
  roomLight.castShadow = true;
  group.add(roomLight);

  const switchBox = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.2, 0.05), frameMat);
  // Place on inner surface of fwMid (X=-0.35, Z = frontZ - wallThick/2)
  switchBox.position.set(-0.35, 1.5, frontZ - 0.125);
  switchBox.userData.isSwitch = true;
  switchBox.userData.targetLight = roomLight;
  group.add(switchBox);

  scene.add(group);

  // --- COLLISIONS ---
  group.updateMatrixWorld(true);
  for (const mesh of solidMeshes) {
    const box = new THREE.Box3().setFromObject(mesh);
    registerBox(box.min.x, box.max.x, box.min.z, box.max.z);
  }
}
