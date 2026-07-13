import * as THREE from 'three';
import { registerBox } from './collisions.js';

export function buildWalls(scene, floorSize = 30) {
  const wallHeight = 6.0;
  const wallThickness = 0.5;
  
  // Clean white paint material
  const wallMat = new THREE.MeshStandardMaterial({ 
    color: 0xd9dddd,
    roughness: 0.9, 
    metalness: 0.05 
  });
  
  // Front Wall (Z = positive)
  const frontGeo = new THREE.BoxGeometry(floorSize, wallHeight, wallThickness);
  const frontWall = new THREE.Mesh(frontGeo, wallMat);
  frontWall.position.set(0, wallHeight / 2, floorSize / 2);
  frontWall.castShadow = true;
  frontWall.receiveShadow = true;
  scene.add(frontWall);
  
  // Left Wall (X = negative)
  // Length is floorSize + wallThickness so it overlaps perfectly at the corner
  const sideGeo = new THREE.BoxGeometry(wallThickness, wallHeight, floorSize + wallThickness);
  const leftWall = new THREE.Mesh(sideGeo, wallMat);
  // Shift Z by wallThickness/2 so the corner matches up with the front wall
  leftWall.position.set(-floorSize / 2, wallHeight / 2, wallThickness / 2);
  leftWall.castShadow = true;
  leftWall.receiveShadow = true;
  scene.add(leftWall);
  
  // Right Wall (X = positive)
  const rightWall = new THREE.Mesh(sideGeo, wallMat);
  rightWall.position.set(floorSize / 2, wallHeight / 2, wallThickness / 2);
  rightWall.castShadow = true;
  rightWall.receiveShadow = true;
  scene.add(rightWall);
  
  // Register collisions
  registerBox(-floorSize/2, floorSize/2, floorSize/2 - wallThickness/2, floorSize/2 + wallThickness/2); // Front
  registerBox(-floorSize/2 - wallThickness/2, -floorSize/2 + wallThickness/2, -floorSize/2, floorSize/2 + wallThickness); // Left
  registerBox(floorSize/2 - wallThickness/2, floorSize/2 + wallThickness/2, -floorSize/2, floorSize/2 + wallThickness); // Right
  
  // We leave the Back Wall (Z = negative) completely empty/open as requested
}
