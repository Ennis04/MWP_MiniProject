import * as THREE from 'three';

function makeSignTexture(number, subtitle) {
  const canvas = document.createElement('canvas'); canvas.width = 1024; canvas.height = 300;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#e9a916'; ctx.fillRect(0, 0, 1024, 300);
  ctx.fillStyle = '#1e2929';
  ctx.beginPath(); ctx.moveTo(850, 0); ctx.lineTo(1024, 0); ctx.lineTo(920, 150); ctx.lineTo(1024, 300); ctx.lineTo(850, 300); ctx.lineTo(750, 150); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.font = 'bold 190px Segoe UI, sans-serif'; ctx.fillText(number, 55, 220);
  ctx.font = 'bold 47px Segoe UI, sans-serif'; ctx.fillText('DEWAN KULIAH', 280, 125);
  ctx.font = '31px Segoe UI, sans-serif'; ctx.fillText(subtitle, 282, 178);
  const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace; texture.anisotropy = 4; return texture;
}

function makeGreenWallTexture(number) {
  const canvas = document.createElement('canvas'); canvas.width = 1024; canvas.height = 512;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#f4f2e9';
  ctx.font = 'bold 390px Segoe UI, sans-serif';
  ctx.textBaseline = 'middle';
  ctx.fillText(number, 40, 270);
  ctx.font = 'bold 58px Segoe UI, sans-serif';
  ctx.fillText('DEWAN', 430, 205);
  ctx.fillText('KULIAH', 430, 275);
  ctx.font = '38px Segoe UI, sans-serif';
  ctx.fillText(`Lecture Hall ${number}`, 430, 342);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

function addSign(scene, x, y, z, rotationY, number, width = 4.5) {
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(width, 1.32), new THREE.MeshStandardMaterial({ map: makeSignTexture(number, `Lecture Hall ${number}`), roughness: .78 }));
  sign.position.set(x, y, z); sign.rotation.y = rotationY;
  sign.userData.interaction = { type: 'info', prompt: `View Dewan Kuliah ${number}`, title: `Dewan Kuliah ${number}`, description: `Lecture Hall ${number} at P19, UTM. Access is restricted during this virtual tour.` };
  sign.userData.interactionRoot = sign; scene.add(sign);
}

function addGreenWallSign(scene, x, y, z, rotationY, number, width = 3.35) {
  const material = new THREE.MeshBasicMaterial({
    map: makeGreenWallTexture(number),
    transparent: true,
    alphaTest: 0.05,
    depthWrite: false,
    side: THREE.DoubleSide
  });
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(width, 1.68), material);
  sign.position.set(x, y, z);
  sign.rotation.y = rotationY;
  sign.renderOrder = 2;
  sign.userData.interaction = { type: 'info', prompt: `View Dewan Kuliah ${number}`, title: `Dewan Kuliah ${number}`, description: `Lecture Hall ${number} at P19, UTM. Access is restricted during this virtual tour.` };
  sign.userData.interactionRoot = sign;
  scene.add(sign);
}

export function buildLectureHallSignage(scene) {
  // Surface-mounted wayfinding based on the real yellow-and-charcoal graphics.
  // Halls 5 and 4 are painted onto the broad green side panels beside the
  // information-board walls. These panels sit at 90 degrees to the grey wall.
  addGreenWallSign(scene, -13.75, 1.65, -1.81, Math.PI, '5', 2.25);
  // Rear wall beside the second vending machine, facing visitors entering
  // from the courtyard.
  addSign(scene, 9.6, 1.65, 14.71, Math.PI, '6');
  addGreenWallSign(scene, 13, 1.65, -1.81, Math.PI, '4', 2.25);
}
