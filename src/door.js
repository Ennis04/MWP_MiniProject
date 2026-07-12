import * as THREE from 'three';
import { registerBox } from './collisions.js';

export function buildDoor(scene, x, z, rotY) {
  const group = new THREE.Group();
  // Place the group at the given coordinates and rotation
  group.position.set(x, 0, z);
  group.rotation.y = rotY;
  
  // Dimensions for the structure protruding into the scene (towards local +X)
  const depth = 2.5; 
  const width = 3.6; 
  const height = 3.2; 
  const roofHeight = 1.5; 
  const openingWidth = 2.4;
  const openingHeight = 2.6;

  // --- MATERIALS ---
  const extMat = new THREE.MeshStandardMaterial({ color: 0x4a8c82, roughness: 0.9 }); // Green exterior
  const roofMat = new THREE.MeshStandardMaterial({ color: 0x4a8c82, roughness: 0.7 });
  const woodMat = new THREE.MeshStandardMaterial({ color: 0x4a2e15, roughness: 0.8 });
  const glassMat = new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.9, roughness: 0.1, transparent: true, opacity: 0.4 });
  const metalMat = new THREE.MeshStandardMaterial({ color: 0xaaaaaa, metalness: 0.8, roughness: 0.2 });

  // --- EXTERIOR WALLS (Green) ---
  const sideW = (width - openingWidth) / 2; // 0.6
  const sideWallGeo = new THREE.BoxGeometry(depth, height, sideW);
  
  const leftExt = new THREE.Mesh(sideWallGeo, extMat);
  leftExt.position.set(depth / 2, height / 2, openingWidth / 2 + sideW / 2); // Z = 1.2 + 0.3 = 1.5
  leftExt.castShadow = true;
  leftExt.receiveShadow = true;
  group.add(leftExt);

  const rightExt = new THREE.Mesh(sideWallGeo, extMat);
  rightExt.position.set(depth / 2, height / 2, -(openingWidth / 2 + sideW / 2)); // Z = -1.5
  rightExt.castShadow = true;
  rightExt.receiveShadow = true;
  group.add(rightExt);

  // --- ROOF (Teal Pitched Triangle) ---
  const roofShape = new THREE.Shape();
  roofShape.moveTo(-width / 2 - 0.1, 0);
  roofShape.lineTo(width / 2 + 0.1, 0);
  roofShape.lineTo(0, roofHeight);
  roofShape.lineTo(-width / 2 - 0.1, 0);
  
  // Extrude along local Z, which will become World X after rotation
  const rGeo = new THREE.ExtrudeGeometry(roofShape, { depth: depth + 0.2, bevelEnabled: false });
  const roof = new THREE.Mesh(rGeo, roofMat);
  roof.rotation.y = Math.PI / 2; 
  roof.position.set(-0.1, height, 0); 
  roof.castShadow = true;
  roof.receiveShadow = true;
  group.add(roof);

  // --- DOUBLE WOODEN DOORS ---
  // We place the door at local X = 0.3 so it's fully visible in front of the wall.
  const doorX = 0.3;
  const doorW = openingWidth / 2 - 0.02; 
  const doorH = openingHeight - 0.02;

  const doorLeft = new THREE.Mesh(new THREE.BoxGeometry(0.1, doorH, doorW), woodMat);
  doorLeft.position.set(doorX, doorH / 2, doorW / 2 + 0.01);
  group.add(doorLeft);

  const doorRight = new THREE.Mesh(new THREE.BoxGeometry(0.1, doorH, doorW), woodMat);
  doorRight.position.set(doorX, doorH / 2, -(doorW / 2 + 0.01));
  group.add(doorRight);

  // Small Window Above Door
  const topWindowW = openingWidth - 0.02;
  const topWindowH = 0.4;
  const topWindow = new THREE.Mesh(new THREE.BoxGeometry(0.12, topWindowH, topWindowW), glassMat);
  topWindow.position.set(doorX, doorH + 0.05 + topWindowH / 2, 0);
  group.add(topWindow);

  // Glass Window Panes
  const paneW = 0.3;
  const paneH = 1.2;
  const paneLeft = new THREE.Mesh(new THREE.BoxGeometry(0.12, paneH, paneW), glassMat);
  paneLeft.position.set(doorX, doorH / 2 + 0.2, doorW / 2 + 0.01);
  group.add(paneLeft);

  const paneRight = new THREE.Mesh(new THREE.BoxGeometry(0.12, paneH, paneW), glassMat);
  paneRight.position.set(doorX, doorH / 2 + 0.2, -(doorW / 2 + 0.01));
  group.add(paneRight);

  // Metallic Handles
  const handleLeft = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.4, 8), metalMat);
  handleLeft.position.set(doorX + 0.06, doorH / 2, 0.1);
  group.add(handleLeft);

  const handleRight = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.4, 8), metalMat);
  handleRight.position.set(doorX + 0.06, doorH / 2, -0.1);
  group.add(handleRight);

  scene.add(group);

  // --- DYNAMIC COLLISION REGISTRATION ---
  // Ensure matrices are updated so bounding box calculation is accurate
  group.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(group);
  registerBox(box.min.x, box.max.x, box.min.z, box.max.z);
}
