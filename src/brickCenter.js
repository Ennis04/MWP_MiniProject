import * as THREE from 'three';

function makeBrickTexture() {
  const size = 512;
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  
  // Base red brick color
  ctx.fillStyle = '#b23a27'; // Dark terra-cotta red
  ctx.fillRect(0, 0, size, size);
  
  // Add some noise/variation to the bricks
  for (let i = 0; i < 2000; i++) {
    const v = Math.random() > 0.5 ? 255 : 0;
    ctx.fillStyle = `rgba(${v}, ${v}, ${v}, 0.03)`;
    ctx.fillRect(Math.random() * size, Math.random() * size, 3 + Math.random() * 5, 2 + Math.random() * 4);
  }
  
  // Grout lines
  ctx.fillStyle = '#e0e0e0';
  
  const rows = 16;
  const cols = 8;
  const rowH = size / rows;
  const colW = size / cols;
  
  const groutThickness = 4;
  
  for (let r = 0; r < rows; r++) {
    const y = r * rowH;
    // Horizontal grout
    ctx.fillRect(0, y - groutThickness / 2, size, groutThickness);
    
    // Vertical grout (staggered)
    const offsetX = (r % 2 === 0) ? 0 : colW / 2;
    for (let c = 0; c <= cols + 1; c++) {
      const x = c * colW - offsetX;
      ctx.fillRect(x - groutThickness / 2, y, groutThickness, rowH);
    }
  }
  
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function makeBrickBumpTexture() {
  const size = 512;
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  
  // White bricks (high)
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, size, size);
  
  // Black grout lines (low)
  ctx.fillStyle = '#000000';
  
  const rows = 16;
  const cols = 8;
  const rowH = size / rows;
  const colW = size / cols;
  
  const groutThickness = 6;
  ctx.filter = 'blur(1px)';
  
  for (let r = 0; r < rows; r++) {
    const y = r * rowH;
    // Horizontal grout
    ctx.fillRect(0, y - groutThickness / 2, size, groutThickness);
    
    // Vertical grout (staggered)
    const offsetX = (r % 2 === 0) ? 0 : colW / 2;
    for (let c = 0; c <= cols + 1; c++) {
      const x = c * colW - offsetX;
      ctx.fillRect(x - groutThickness / 2, y, groutThickness, rowH);
    }
  }
  
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

export function buildBrickCenter(scene, size = 10) {
  const tex = makeBrickTexture();
  const bumpTex = makeBrickBumpTexture();
  
  // Repeat the texture across the floor.
  // We can repeat it to get a nice scale. Let's do a repeat based on size.
  tex.repeat.set(size / 3, size / 3);
  bumpTex.repeat.set(size / 3, size / 3);
  
  const geo = new THREE.PlaneGeometry(size, size);
  const mat = new THREE.MeshStandardMaterial({
    map: tex,
    bumpMap: bumpTex,
    bumpScale: 0.03,
    roughness: 0.8, // Bricks are rough
    metalness: 0.0
  });
  
  const mesh = new THREE.Mesh(geo, mat);
  mesh.rotation.x = -Math.PI / 2;
  // Position slightly above the ceramic floor (0.01) so it sits on top of it without Z-fighting
  mesh.position.y = 0.015;
  mesh.receiveShadow = true;
  
  scene.add(mesh);
  return mesh;
}
