import * as THREE from 'three';
import { registerBox } from './collisions.js';

export function buildBackWall(scene, floorSize = 30) {
  const wallHeight = 6.0;
  const wallThickness = 0.5;
  const zPos = -15; // Back edge of the 30x30 floor

  // White paint material for the main wall
  const wallMat = new THREE.MeshStandardMaterial({ 
    color: 0xfafafa, 
    roughness: 0.9, 
    metalness: 0.05 
  });

  // Trace the outer boundary of the wall, cutting upwards from the bottom edge
  // to form the doorways and windows, avoiding complex holes.
  const shape = new THREE.Shape();
  const cutoutY = 3.2;

  // Start at bottom left
  shape.moveTo(-15, 0);
  
  // Left Cutout 2
  shape.lineTo(-12, 0);
  shape.lineTo(-12, cutoutY);
  shape.lineTo(-10, cutoutY);
  shape.lineTo(-10, 0);

  // Left Cutout 1
  shape.lineTo(-7.5, 0);
  shape.lineTo(-7.5, cutoutY);
  shape.lineTo(-5.5, cutoutY);
  shape.lineTo(-5.5, 0);

  // Center Main Entrance
  shape.lineTo(-3, 0);
  shape.lineTo(-3, cutoutY);
  shape.lineTo(3, cutoutY);
  shape.lineTo(3, 0);

  // Right Cutout 1
  shape.lineTo(5.5, 0);
  shape.lineTo(5.5, cutoutY);
  shape.lineTo(7.5, cutoutY);
  shape.lineTo(7.5, 0);

  // Right Cutout 2
  shape.lineTo(10, 0);
  shape.lineTo(10, cutoutY);
  shape.lineTo(12, cutoutY);
  shape.lineTo(12, 0);

  // Finish bottom right
  shape.lineTo(15, 0);

  // Top edge
  shape.lineTo(15, wallHeight);
  shape.lineTo(-15, wallHeight);
  shape.lineTo(-15, 0); // Close shape

  const extrudeSettings = { depth: wallThickness, bevelEnabled: false };
  const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings);

  const mainWall = new THREE.Mesh(geo, wallMat);
  // ExtrudeGeometry extrudes along +Z. 
  // We want the wall centered on Z = -15, so shift by -thickness/2
  mainWall.position.set(0, 0, zPos - wallThickness / 2);
  mainWall.castShadow = true;
  mainWall.receiveShadow = true;
  scene.add(mainWall);

  // --- RED FRAME AROUND CENTER ENTRANCE ---
  const frameMat = new THREE.MeshStandardMaterial({ 
    color: 0xb22222, // Firebrick red 
    roughness: 0.7, 
    metalness: 0.05 
  });

  const frameThickness = 0.6; // Slightly thicker than the wall
  const frameWidth = 1.0;
  
  // Left Pillar of the frame (X = -3.5 to -2.5)
  const leftPillar = new THREE.Mesh(new THREE.BoxGeometry(frameWidth, cutoutY, frameThickness), frameMat);
  leftPillar.position.set(-3, cutoutY / 2, zPos);
  leftPillar.castShadow = true;
  leftPillar.receiveShadow = true;
  scene.add(leftPillar);

  // Right Pillar of the frame (X = 2.5 to 3.5)
  const rightPillar = new THREE.Mesh(new THREE.BoxGeometry(frameWidth, cutoutY, frameThickness), frameMat);
  rightPillar.position.set(3, cutoutY / 2, zPos);
  rightPillar.castShadow = true;
  rightPillar.receiveShadow = true;
  scene.add(rightPillar);

  // Top Lintel of the frame (spans across the top)
  // Lintel sits exactly below cutoutY (e.g., Y = 2.7 to 3.2)
  const lintelHeight = 0.5;
  const lintel = new THREE.Mesh(new THREE.BoxGeometry(7, lintelHeight, frameThickness), frameMat);
  lintel.position.set(0, cutoutY - lintelHeight / 2, zPos);
  lintel.castShadow = true;
  lintel.receiveShadow = true;
  scene.add(lintel);

  // --- RED WINDOW PANEL ABOVE LINTEL ---
  // The glass sits inside the top cutout area above the lintel.
  lintel.position.set(0, 2.5, zPos);
  
  // Make the top panel the same red color as the rest of the frame
  const windowHeight = 3.2 - 2.75;
  const windowGeo = new THREE.BoxGeometry(5.0, windowHeight, 0.1);
  const redTopPanel = new THREE.Mesh(windowGeo, frameMat);
  redTopPanel.position.set(0, 2.75 + windowHeight / 2, zPos);
  redTopPanel.castShadow = true;
  redTopPanel.receiveShadow = true;
  scene.add(redTopPanel);

  // --- HALF-HEIGHT FENCES FOR THE 4 SIDE CUTOUTS ---
  const fenceMat = new THREE.MeshStandardMaterial({ 
    color: 0x333333, // Dark grey/metal
    roughness: 0.8, 
    metalness: 0.5 
  });
  
  const fenceHeight = 1.6;
  const fenceThickness = 0.1;
  const railHeight = 0.05;

  function addFence(minX, maxX) {
    const width = maxX - minX;
    const centerX = (minX + maxX) / 2;
    
    // Top rail
    const topRail = new THREE.Mesh(new THREE.BoxGeometry(width, railHeight, fenceThickness), fenceMat);
    topRail.position.set(centerX, fenceHeight, zPos);
    topRail.castShadow = true;
    topRail.receiveShadow = true;
    scene.add(topRail);

    // Bottom rail
    const botRail = new THREE.Mesh(new THREE.BoxGeometry(width, railHeight, fenceThickness), fenceMat);
    botRail.position.set(centerX, 0.2, zPos);
    botRail.castShadow = true;
    botRail.receiveShadow = true;
    scene.add(botRail);

    // Vertical posts
    const numPosts = 6;
    for (let i = 0; i < numPosts; i++) {
      const px = minX + (i + 0.5) * (width / numPosts);
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.08, fenceHeight, fenceThickness), fenceMat);
      post.position.set(px, fenceHeight / 2, zPos);
      post.castShadow = true;
      post.receiveShadow = true;
      scene.add(post);
    }
    
    // Block movement through the fenced cutout
    registerBox(minX, maxX, zPos - fenceThickness, zPos + fenceThickness);
  }

  // Add fences to the 4 white cutouts
  addFence(-12, -10);   // Left Cutout 2
  addFence(-7.5, -5.5); // Left Cutout 1
  addFence(5.5, 7.5);   // Right Cutout 1
  addFence(10, 12);     // Right Cutout 2

  // --- REGISTER COLLISIONS FOR SOLID SEGMENTS ---
  // The wall sits between zPos - 0.25 and zPos + 0.25
  const minZ = zPos - wallThickness / 2;
  const maxZ = zPos + wallThickness / 2;

  // Register the 6 solid white wall segments between the cutouts
  registerBox(-15, -12, minZ, maxZ);
  registerBox(-10, -7.5, minZ, maxZ);
  registerBox(-5.5, -3, minZ, maxZ);
  registerBox(3, 5.5, minZ, maxZ);
  registerBox(7.5, 10, minZ, maxZ);
  registerBox(12, 15, minZ, maxZ);

  // Register the thick red frame pillars for collisions
  const frameMinZ = zPos - frameThickness / 2;
  const frameMaxZ = zPos + frameThickness / 2;
  registerBox(-3.5, -2.5, frameMinZ, frameMaxZ); // Left red pillar
  registerBox(2.5, 3.5, frameMinZ, frameMaxZ); // Right red pillar

  // Air wall to prevent leaving through the red entrance
  registerBox(-2.5, 2.5, zPos - 1, zPos + 1);
}
