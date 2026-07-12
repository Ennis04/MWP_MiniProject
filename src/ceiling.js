import * as THREE from 'three';

let globalBulbMat = null;

export function setCeilingLights(isNight) {
  if (globalBulbMat) {
    globalBulbMat.emissiveIntensity = isNight ? 1 : 0;
    globalBulbMat.emissive.setHex(isNight ? 0xfffaaa : 0x000000);
  }
}

export function buildCeiling(scene, floorSize = 30) {
  const innerSize = 10;
  const ceilingHeight = 6.0;
  
  // 1. Create the brown ceiling with a hole in the middle
  const shape = new THREE.Shape();
  // Outer boundary
  shape.moveTo(-floorSize / 2, -floorSize / 2);
  shape.lineTo(floorSize / 2, -floorSize / 2);
  shape.lineTo(floorSize / 2, floorSize / 2);
  shape.lineTo(-floorSize / 2, floorSize / 2);
  shape.lineTo(-floorSize / 2, -floorSize / 2);

  // Inner hole (open air for the red bricks)
  const hole = new THREE.Path();
  hole.moveTo(-innerSize / 2, -innerSize / 2);
  hole.lineTo(-innerSize / 2, innerSize / 2);
  hole.lineTo(innerSize / 2, innerSize / 2);
  hole.lineTo(innerSize / 2, -innerSize / 2);
  hole.lineTo(-innerSize / 2, -innerSize / 2);
  shape.holes.push(hole);

  const extrudeSettings = { depth: 0.5, bevelEnabled: false };
  const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  
  // Darker warm brown ceiling material
  const mat = new THREE.MeshStandardMaterial({ 
    color: 0x5c3a21, // Darker brown
    emissive: 0x24150b, // Darker faint glow
    roughness: 0.9, 
    side: THREE.DoubleSide 
  });
  
  const ceiling = new THREE.Mesh(geo, mat);
  // Rotate by -PI/2 so the shape faces up and extrudes upwards (+Y)
  ceiling.rotation.x = -Math.PI / 2; 
  ceiling.position.y = ceilingHeight;
  ceiling.receiveShadow = true;
  scene.add(ceiling);

  // 2. Add recessed downlights with metallic rims
  const bulbGeo = new THREE.CircleGeometry(0.18, 16);
  globalBulbMat = new THREE.MeshStandardMaterial({ 
    color: 0xffffff, 
    emissive: 0x000000, // Turned off
    emissiveIntensity: 0 
  });
  const bulbMat = globalBulbMat;
  
  const rimGeo = new THREE.RingGeometry(0.18, 0.28, 16);
  const rimMat = new THREE.MeshStandardMaterial({ 
    color: 0xcccccc, 
    metalness: 0.8, 
    roughness: 0.2, 
    side: THREE.DoubleSide 
  });

  function addDownlight(x, z) {
    const group = new THREE.Group();
    // Drop slightly below the ceiling so it doesn't Z-fight
    group.position.set(x, ceilingHeight - 0.002, z);
    group.rotation.x = Math.PI / 2; // Face down

    const bulb = new THREE.Mesh(bulbGeo, bulbMat);
    group.add(bulb);

    const rim = new THREE.Mesh(rimGeo, rimMat);
    // Push rim down slightly so it layers perfectly
    rim.position.z = -0.001; 
    group.add(rim);

    scene.add(group);
  }

  // 3. Arrange the lights along the ceiling corridors
  // Left and Right corridors (X = -10 and X = 10)
  const zPositions = [-12, -8, -4, 0, 4, 8, 12];
  for (const z of zPositions) {
    addDownlight(-10, z);
    addDownlight(10, z);
  }

  // Front and Back corridors (Z = 10 and Z = -10)
  const xPositions = [-6, -2, 2, 6];
  for (const x of xPositions) {
    addDownlight(x, 10);
    addDownlight(x, -10);
  }
}
