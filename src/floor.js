import * as THREE from 'three';

function makeTileTexture() {
  const size = 512;
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  
  // Base white ceramic color
  ctx.fillStyle = '#f8f9fa';
  ctx.fillRect(0, 0, size, size);
  
  // Add slight variations to tiles
  ctx.fillStyle = '#f1f3f5';
  ctx.fillRect(0, 0, size, size/2);
  
  // Grout lines
  ctx.strokeStyle = '#ced4da';
  ctx.lineWidth = 4;
  
  // Draw horizontal lines
  ctx.beginPath();
  ctx.moveTo(0, size/2);
  ctx.lineTo(size, size/2);
  ctx.moveTo(0, size);
  ctx.lineTo(size, size);
  ctx.stroke();
  
  // Draw vertical lines (staggered for rectangle tiles, e.g. subway tile)
  ctx.beginPath();
  ctx.moveTo(size/2, 0);
  ctx.lineTo(size/2, size/2);
  
  ctx.moveTo(0, size/2);
  ctx.lineTo(0, size);
  ctx.moveTo(size, size/2);
  ctx.lineTo(size, size);
  ctx.stroke();
  
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function makeTileBumpTexture() {
  const size = 512;
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  
  // White tiles
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, size, size);
  
  // Dark grout lines for bump
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 6;
  ctx.filter = 'blur(1px)';
  
  ctx.beginPath();
  ctx.moveTo(0, size/2);
  ctx.lineTo(size, size/2);
  ctx.moveTo(0, size);
  ctx.lineTo(size, size);
  
  ctx.moveTo(size/2, 0);
  ctx.lineTo(size/2, size/2);
  
  ctx.moveTo(0, size/2);
  ctx.lineTo(0, size);
  ctx.moveTo(size, size/2);
  ctx.lineTo(size, size);
  ctx.stroke();
  
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

export function buildCeramicFloor(scene, size = 20) {
  const tex = makeTileTexture();
  const bumpTex = makeTileBumpTexture();
  
  // Repeat the texture across the floor.
  // By multiplying by a larger factor, the tiles become smaller on the floor.
  tex.repeat.set(size * 1.5, size * 1.5);
  bumpTex.repeat.set(size * 1.5, size * 1.5);
  
  const geo = new THREE.PlaneGeometry(size, size);
  const mat = new THREE.MeshStandardMaterial({
    map: tex,
    bumpMap: bumpTex,
    bumpScale: 0.02,
    roughness: 0.2, // Ceramic is shiny
    metalness: 0.05
  });
  
  const mesh = new THREE.Mesh(geo, mat);
  mesh.rotation.x = -Math.PI / 2;
  // Position slightly above 0 so it sits on top of the grass (which is at -0.03)
  mesh.position.y = 0.01;
  mesh.receiveShadow = true;
  
  scene.add(mesh);
  return mesh;
}
