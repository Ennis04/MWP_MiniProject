import * as THREE from 'three';

function makeBoardTexture() {
  const canvas = document.createElement('canvas'); canvas.width = 1024; canvas.height = 512;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#f1e5c8'; ctx.fillRect(0, 0, 1024, 512);
  ctx.fillStyle = '#7a1f2b'; ctx.fillRect(0, 0, 1024, 92);
  ctx.fillStyle = '#fff'; ctx.font = 'bold 52px Segoe UI, sans-serif'; ctx.fillText('UTM STUDENT ACTIVITIES', 54, 63);
  ctx.fillStyle = '#25211d'; ctx.font = 'bold 31px Segoe UI, sans-serif'; ctx.fillText('WHAT IS HAPPENING ON CAMPUS', 54, 155);
  ctx.font = '26px Segoe UI, sans-serif';
  ['Student Club Day - Meet societies and project teams', 'Academic Workshop - Presentation and study skills', 'Volunteer Programme - Join the campus community', 'Sports & Recreation - Weekly student activities'].forEach((line, i) => ctx.fillText(`• ${line}`, 68, 220 + i * 58));
  const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace; texture.anisotropy = 4; return texture;
}

export function buildInformationBoard(scene, x, y, z, rotY) {
  const group = new THREE.Group();
  const frame = new THREE.Mesh(new THREE.BoxGeometry(3.5, 1.85, .12), new THREE.MeshStandardMaterial({ color: 0x3b2415, roughness: .72 }));
  const face = new THREE.Mesh(new THREE.PlaneGeometry(3.22, 1.57), new THREE.MeshStandardMaterial({ map: makeBoardTexture(), roughness: .82 }));
  face.position.z = .071; group.add(frame, face); group.position.set(x, y, z); group.rotation.y = rotY;
  group.userData.interaction = { type: 'info', prompt: 'Read activity board', title: 'University activities at P19', description: 'Discover student club gatherings, academic workshops, volunteering programmes, sports activities and faculty events. Students can use this board to stay informed and take part in university life.' };
  group.traverse(child => { child.userData.interactionRoot = group; }); scene.add(group); return group;
}
