import * as THREE from 'three';
import { registerBox } from './collisions.js';

export function buildStudyDesk(scene, x, z, rotY) {
  const group = new THREE.Group();
  group.position.set(x, 0, z);
  group.rotation.y = rotY;

  // Materials
  const woodMat = new THREE.MeshStandardMaterial({ color: 0xaa3322, roughness: 0.6 }); // Reddish wood top
  const metalMat = new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.6, roughness: 0.6 });
  const seatMat = new THREE.MeshStandardMaterial({ color: 0xbb1111, roughness: 0.5 }); // Red seats

  const tableWidth = 3.0;
  const tableDepth = 0.6;
  const tableHeight = 1.0;

  // 1. Table Top
  const top = new THREE.Mesh(new THREE.BoxGeometry(tableWidth, 0.05, tableDepth), woodMat);
  top.position.set(0, tableHeight, 0);
  top.castShadow = true;
  top.receiveShadow = true;
  group.add(top);

  // 2. Legs (Left and Right frames)
  function buildLegFrame(posX) {
    const frame = new THREE.Group();
    
    // Front post
    const frontPost = new THREE.Mesh(new THREE.BoxGeometry(0.06, tableHeight, 0.06), metalMat);
    frontPost.position.set(0, tableHeight / 2, tableDepth / 2 - 0.1);
    frontPost.castShadow = true;
    frame.add(frontPost);

    // Back post
    const backPost = new THREE.Mesh(new THREE.BoxGeometry(0.06, tableHeight, 0.06), metalMat);
    backPost.position.set(0, tableHeight / 2, -tableDepth / 2 + 0.1);
    backPost.castShadow = true;
    frame.add(backPost);

    // Bottom crossbar
    const crossBar = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, tableDepth - 0.1), metalMat);
    crossBar.position.set(0, 0.05, 0);
    crossBar.castShadow = true;
    frame.add(crossBar);

    frame.position.x = posX;
    return frame;
  }

  group.add(buildLegFrame(-tableWidth / 2 + 0.2));
  group.add(buildLegFrame(tableWidth / 2 - 0.2));

  // 4. Chairs (x3)
  const chairXs = [-1.0, 0, 1.0];
  const seatHeight = 0.6;
  const seatDepthOffset = 0.6; // Distance from table center to seat center

  chairXs.forEach(cx => {
    // Seat bottom
    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.05, 0.4), seatMat);
    seat.position.set(cx, seatHeight, seatDepthOffset);
    seat.castShadow = true;
    group.add(seat);

    const chairAnchor = new THREE.Object3D();
    chairAnchor.position.set(cx, 1.12, seatDepthOffset - 0.03);
    chairAnchor.userData.interaction = { type: 'chair', prompt: 'Sit on chair' };
    group.add(chairAnchor);
    seat.userData.interactionRoot = chairAnchor;

    // Backrest
    const backrest = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.3, 0.05), seatMat);
    backrest.position.set(cx, seatHeight + 0.2, seatDepthOffset + 0.2);
    // Slight tilt backwards
    backrest.rotation.x = -0.1;
    backrest.castShadow = true;
    group.add(backrest);
    backrest.userData.interactionRoot = chairAnchor;

    // Support pipes for the chair
    // Vertical leg straight down to the floor
    const legDist = seatHeight - 0.025;
    const legPipe = new THREE.Mesh(new THREE.BoxGeometry(0.08, legDist, 0.08), metalMat);
    legPipe.position.set(cx, legDist / 2, seatDepthOffset);
    legPipe.castShadow = true;
    group.add(legPipe);
    legPipe.userData.interactionRoot = chairAnchor;

    // Post to support the backrest
    const backPipe = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.2, 0.06), metalMat);
    backPipe.position.set(cx, seatHeight + 0.05, seatDepthOffset + 0.15);
    backPipe.castShadow = true;
    group.add(backPipe);
    backPipe.userData.interactionRoot = chairAnchor;
  });

  scene.add(group);
  group.updateMatrixWorld(true);
  group.traverse(child => { if (child.userData.interaction?.type === 'chair') child.userData.interactionRoot = child; });

  // 5. Collision registration
  group.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(group);
  registerBox(box.min.x, box.max.x, box.min.z, box.max.z);
}
