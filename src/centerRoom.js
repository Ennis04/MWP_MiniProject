import * as THREE from 'three';
import { registerBox } from './collisions.js';

export function buildCenterRoom(scene, x, z, rotY) {
  const group = new THREE.Group();
  group.position.set(x, 0, z);
  group.rotation.y = rotY;

  // Dimensions
  const depth = 2.0; 
  const backWidth = 6.0;
  const frontWidth = 2.0;
  const height = 3.2;
  const roofHeight = 0.2; // A flat roof or very slight pitch to cover the top
  const wallThickness = 0.2;

  // --- MATERIALS ---
  const wallMat = new THREE.MeshStandardMaterial({ color: 0x729a96, roughness: 0.9 });
  const woodMat = new THREE.MeshStandardMaterial({ color: 0x75452f, roughness: 0.8 });
  const glassMat = new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.9, roughness: 0.1, transparent: true, opacity: 0.4 });
  const frameMat = new THREE.MeshStandardMaterial({ color: 0xdddddd, roughness: 0.8 }); // White window frames
  const signMat = new THREE.MeshStandardMaterial({ color: 0xffcc00, roughness: 0.5 }); // Yellow posters

  // Array to hold meshes that should block the player
  const solidMeshes = [];

  // --- FRONT WALL ---
  // The front wall spans Z from -1.0 to 1.0, at X = 2.0 (depth).
  // Has a large window in the center.
  const frontWallGroup = new THREE.Group();
  frontWallGroup.position.set(depth - wallThickness/2, 0, 0);
  
  // Front wall panels (left, right, bottom, top around window)
  const winW = 1.6;
  const winH = 1.2;
  const winY = 1.0; // Window starts at Y = 1.0
  const sideW = (frontWidth - winW) / 2; // 0.2

  const fwLeft = new THREE.Mesh(new THREE.BoxGeometry(wallThickness, height, sideW), wallMat);
  fwLeft.position.set(0, height / 2, winW / 2 + sideW / 2);
  fwLeft.receiveShadow = true;
  fwLeft.castShadow = true;
  frontWallGroup.add(fwLeft);

  const fwRight = new THREE.Mesh(new THREE.BoxGeometry(wallThickness, height, sideW), wallMat);
  fwRight.position.set(0, height / 2, -(winW / 2 + sideW / 2));
  fwRight.receiveShadow = true;
  fwRight.castShadow = true;
  frontWallGroup.add(fwRight);

  const fwBottom = new THREE.Mesh(new THREE.BoxGeometry(wallThickness, winY, winW), wallMat);
  fwBottom.position.set(0, winY / 2, 0);
  fwBottom.receiveShadow = true;
  fwBottom.castShadow = true;
  frontWallGroup.add(fwBottom);

  solidMeshes.push(fwLeft, fwRight, fwBottom);

  const fwTopH = height - (winY + winH); // 3.2 - 2.2 = 1.0
  const fwTop = new THREE.Mesh(new THREE.BoxGeometry(wallThickness, fwTopH, winW), wallMat);
  fwTop.position.set(0, height - fwTopH / 2, 0);
  fwTop.receiveShadow = true;
  fwTop.castShadow = true;
  frontWallGroup.add(fwTop);

  // Front Window (Glass & Mullions)
  const windowGlass = new THREE.Mesh(new THREE.BoxGeometry(0.05, winH, winW), glassMat);
  windowGlass.position.set(0, winY + winH / 2, 0);
  frontWallGroup.add(windowGlass);

  // Mullions (white frames)
  const mullionThick = 0.08;
  const mTop = new THREE.Mesh(new THREE.BoxGeometry(0.1, mullionThick, winW), frameMat);
  mTop.position.set(0, winY + winH - mullionThick/2, 0);
  frontWallGroup.add(mTop);
  
  const mBot = new THREE.Mesh(new THREE.BoxGeometry(0.1, mullionThick, winW), frameMat);
  mBot.position.set(0, winY + mullionThick/2, 0);
  frontWallGroup.add(mBot);

  const mMid = new THREE.Mesh(new THREE.BoxGeometry(0.1, mullionThick, winW), frameMat);
  mMid.position.set(0, winY + winH / 2, 0);
  frontWallGroup.add(mMid);

  const mLeft = new THREE.Mesh(new THREE.BoxGeometry(0.1, winH, mullionThick), frameMat);
  mLeft.position.set(0, winY + winH/2, winW/2 - mullionThick/2);
  frontWallGroup.add(mLeft);

  const mRight = new THREE.Mesh(new THREE.BoxGeometry(0.1, winH, mullionThick), frameMat);
  mRight.position.set(0, winY + winH/2, -(winW/2 - mullionThick/2));
  frontWallGroup.add(mRight);

  const mCenter = new THREE.Mesh(new THREE.BoxGeometry(0.1, winH, mullionThick), frameMat);
  mCenter.position.set(0, winY + winH/2, 0);
  frontWallGroup.add(mCenter);

  // --- LIGHT & SWITCH ---
  // A light inside the room
  const roomLight = new THREE.PointLight(0xfffaaa, 0, 10);
  roomLight.position.set(-1.0, 3.0, 0); // Position relative to frontWallGroup (which is at X=1.9), so X=0.9 globally in group
  roomLight.castShadow = true;
  frontWallGroup.add(roomLight);

  // A switch on the inside wall next to the window
  const switchBox = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.2, 0.15), frameMat);
  switchBox.position.set(-wallThickness/2 - 0.025, 1.5, winW / 2 + 0.15); // On the inner surface, to the left of window
  switchBox.userData.isSwitch = true;
  switchBox.userData.targetLight = roomLight;
  frontWallGroup.add(switchBox);

  group.add(frontWallGroup);

  // --- ANGLED SIDE WALLS ---
  // Left side goes from (X=0, Z=3.0) to (X=2.0, Z=1.0)
  // Distance = sqrt(2^2 + 2^2) = 2.828
  // Angle = 45 degrees
  const angleLen = 2.828;
  const doorW = 0.9;
  const doorH = 2.0;

  function buildAngledWall(isLeft) {
    const awGroup = new THREE.Group();
    // Position center of the angled wall
    // Left: X = 1.0, Z = 2.0
    // Right: X = 1.0, Z = -2.0
    awGroup.position.set(depth / 2, 0, isLeft ? (backWidth/2 + frontWidth/2)/2 : -(backWidth/2 + frontWidth/2)/2);
    // Rotate to face inwards
    // Left wall: local +X points toward -X, +Z (angle = -45 deg)
    awGroup.rotation.y = isLeft ? -Math.PI / 4 : Math.PI / 4;

    // We build it along its local Z axis (spanning from -angleLen/2 to angleLen/2)
    // Wall panels
    const awSideW = (angleLen - doorW) / 2;
    const awLeft = new THREE.Mesh(new THREE.BoxGeometry(wallThickness, height, awSideW), wallMat);
    awLeft.position.set(0, height / 2, doorW / 2 + awSideW / 2);
    awLeft.receiveShadow = true;
    awLeft.castShadow = true;
    awGroup.add(awLeft);

    const awRight = new THREE.Mesh(new THREE.BoxGeometry(wallThickness, height, awSideW), wallMat);
    awRight.position.set(0, height / 2, -(doorW / 2 + awSideW / 2));
    awRight.receiveShadow = true;
    awRight.castShadow = true;
    awGroup.add(awRight);

    solidMeshes.push(awLeft, awRight);

    const awTop = new THREE.Mesh(new THREE.BoxGeometry(wallThickness, height - doorH, doorW), wallMat);
    awTop.position.set(0, doorH + (height - doorH) / 2, 0);
    awTop.receiveShadow = true;
    awTop.castShadow = true;
    awGroup.add(awTop);

    // Door with Pivot for opening
    const doorPivot = new THREE.Group();
    // Hinge on the right side (Z = -doorW/2)
    doorPivot.position.set(wallThickness/2 + 0.05, 0, -doorW / 2);
    awGroup.add(doorPivot);

    const doorGeo = new THREE.BoxGeometry(0.1, doorH, doorW - 0.02);
    // Shift geometry so the hinge is at the local origin
    doorGeo.translate(0, doorH / 2, doorW / 2);

    const door = new THREE.Mesh(doorGeo, woodMat);
    door.userData.interaction = { type: 'lockedDoor', prompt: 'Check door', title: 'Restricted room', description: 'This room is locked during the virtual tour.' };
    door.userData.interactionRoot = door;
    
    doorPivot.add(door);
    solidMeshes.push(door);

    // Yellow Poster
    const poster = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.4), signMat);
    // Place poster on the right side of the door for both
    // Right side in local Z is negative Z
    poster.position.set(wallThickness/2 + 0.01, doorH - 0.5, -doorW/2 - 0.3);
    poster.rotation.y = Math.PI / 2; // Face outward (+X)
    awGroup.add(poster);

    return awGroup;
  }

  group.add(buildAngledWall(true));
  group.add(buildAngledWall(false));

  // --- ROOF ---
  // Create a flat roof shape to cover the top
  const roofShape = new THREE.Shape();
  roofShape.moveTo(0, -backWidth/2);
  roofShape.lineTo(depth, -frontWidth/2);
  roofShape.lineTo(depth, frontWidth/2);
  roofShape.lineTo(0, backWidth/2);
  roofShape.lineTo(0, -backWidth/2);

  const rGeo = new THREE.ExtrudeGeometry(roofShape, { depth: roofHeight, bevelEnabled: false });
  const roof = new THREE.Mesh(rGeo, wallMat);
  // Extrude along Z becomes Y after rotation
  roof.rotation.x = Math.PI / 2;
  roof.position.set(0, height + roofHeight, 0);
  roof.castShadow = true;
  roof.receiveShadow = true;
  group.add(roof);

  scene.add(group);

  // --- COLLISION REGISTRATION ---
  group.updateMatrixWorld(true);
  
  // Register each solid wall piece individually so the room is hollow inside
  for (const mesh of solidMeshes) {
    const box = new THREE.Box3().setFromObject(mesh);
    registerBox(box.min.x, box.max.x, box.min.z, box.max.z);
  }
}
