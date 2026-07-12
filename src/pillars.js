import * as THREE from 'three';
import { registerCylinder } from './collisions.js';

export function buildRedPillars(scene) {
  const pillarHeight = 6.0;
  const pillarRadius = 0.2;
  
  // Red paint material
  const pillarMat = new THREE.MeshStandardMaterial({ 
    color: 0xb22222, // Firebrick red 
    roughness: 0.7, 
    metalness: 0.05 
  });
  
  const geo = new THREE.CylinderGeometry(pillarRadius, pillarRadius, pillarHeight, 16);
  
  // Helper to place a pillar
  function addPillar(x, z) {
    const mesh = new THREE.Mesh(geo, pillarMat);
    // Center point is half the height
    mesh.position.set(x, pillarHeight / 2, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);
    registerCylinder(x, z, pillarRadius);
  }
  
  // The red brick floor spans X from -5 to +5, and Z from -5 to +5 (size is 10x10).
  // Place pillars just outside the brick area at Z = 5.2 (front) and Z = -5.2 (back).
  const frontZ = 5.2;
  const backZ = -5.2;
  
  // Arrangement: 2 close, large gap, 2 close
  // Let's use X coordinates spread further out to the left and right
  const xPositions = [-5.6, -4.4, 4.4, 5.6];
  
  // Add 4 pillars on the front side
  for (const x of xPositions) {
    addPillar(x, frontZ);
  }
  
  // Add 4 pillars on the back side
  for (const x of xPositions) {
    addPillar(x, backZ);
  }
}
