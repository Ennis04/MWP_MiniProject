import * as THREE from 'three';
import { registerBox } from './collisions.js';

export function buildFillerWalls(scene) {
  // Use the same teal/green color as the center room exterior
  const wallMat = new THREE.MeshStandardMaterial({ color: 0x4a8c82, roughness: 0.9 });
  
  // Height matches the center room (3.2) and we'll use a thickness of 0.2
  const height = 3.2;
  const thickness = 0.2;
  
  // The center room's back is at Z=12. The main front wall is at Z=15.
  // We need to bridge this 3-meter gap (Z from 12 to 15).
  // Length is 3.0, center is at Z=13.5.
  const wallLength = 3.0;
  const centerZ = 13.5;

  // The center room back width spans X from -3 to 3.
  
  // Left Filler Wall (at X = -3)
  const leftWall = new THREE.Mesh(new THREE.BoxGeometry(thickness, height, wallLength), wallMat);
  // Place slightly inside to ensure a seamless connection
  leftWall.position.set(-3 + thickness/2, height/2, centerZ);
  leftWall.castShadow = true;
  leftWall.receiveShadow = true;
  scene.add(leftWall);

  // Right Filler Wall (at X = 3)
  const rightWall = new THREE.Mesh(new THREE.BoxGeometry(thickness, height, wallLength), wallMat);
  rightWall.position.set(3 - thickness/2, height/2, centerZ);
  rightWall.castShadow = true;
  rightWall.receiveShadow = true;
  scene.add(rightWall);

  // Register collisions
  registerBox(-3, -3 + thickness, 12, 15);
  registerBox(3 - thickness, 3, 12, 15);

  // Roof over the filler walls
  // Width = 6 + thickness (to overlap the walls), Height = 0.2, Length = 3.0
  const roof = new THREE.Mesh(new THREE.BoxGeometry(6.0 + thickness, 0.2, wallLength), wallMat);
  roof.position.set(0, height + 0.1, centerZ);
  roof.castShadow = true;
  roof.receiveShadow = true;
  scene.add(roof);
}
