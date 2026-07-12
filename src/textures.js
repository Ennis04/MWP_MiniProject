/* =========================================================
   TEXTURES — procedural canvas texture generators.
   Depends on: three only.
========================================================= */
import * as THREE from 'three';

export function makeTerrazzoTexture() {
  const size = 1024;
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#c9c4b8';
  ctx.fillRect(0, 0, size, size);
  const chips = ['#b6b0a2', '#8f8a7c', '#dbd6c9', '#565247', '#a49e8e', '#efece2'];
  for (let i = 0; i < 260; i++) {
    const w = 18 + Math.random() * 60;
    const h = 8 + Math.random() * 26;
    ctx.save();
    ctx.translate(Math.random() * size, Math.random() * size);
    ctx.rotate((Math.random() * 50 - 25) * Math.PI / 180);
    ctx.globalAlpha = 0.5 + Math.random() * 0.4;
    ctx.fillStyle = chips[(Math.random() * chips.length) | 0];
    ctx.fillRect(-w / 2, -h / 2, w, h);
    ctx.restore();
  }
  // fine sparkle flecks — the tell-tale terrazzo aggregate glints
  ctx.globalAlpha = 1;
  for (let i = 0; i < 900; i++) {
    const v = 200 + Math.random() * 55;
    ctx.fillStyle = `rgba(${v},${v},${v - 10},${(0.25 + Math.random() * 0.35).toFixed(2)})`;
    ctx.beginPath();
    ctx.arc(Math.random() * size, Math.random() * size, 0.6 + Math.random() * 1.4, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.strokeStyle = 'rgba(70,66,58,0.18)';
  ctx.lineWidth = 2;
  const grid = 10;
  for (let i = 0; i <= grid; i++) {
    const p = (i / grid) * size;
    ctx.beginPath(); ctx.moveTo(p, 0); ctx.lineTo(p, size); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, p); ctx.lineTo(size, p); ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(5, 5);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function makeTerrazzoBumpTexture() {
  const size = 512;
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#9a9a9a';
  ctx.fillRect(0, 0, size, size);
  ctx.filter = 'blur(1px)';
  for (let i = 0; i < 200; i++) {
    const v = 110 + Math.random() * 110;
    ctx.fillStyle = `rgb(${v},${v},${v})`;
    const w = 14 + Math.random() * 40, h = 6 + Math.random() * 18;
    ctx.save();
    ctx.translate(Math.random() * size, Math.random() * size);
    ctx.rotate(Math.random() * Math.PI);
    ctx.fillRect(-w / 2, -h / 2, w, h);
    ctx.restore();
  }
  ctx.filter = 'none';
  ctx.strokeStyle = '#333333';
  ctx.lineWidth = 3;
  const grid = 10;
  for (let i = 0; i <= grid; i++) {
    const p = (i / grid) * size;
    ctx.beginPath(); ctx.moveTo(p, 0); ctx.lineTo(p, size); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, p); ctx.lineTo(size, p); ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(5, 5);
  return tex;
}

export function makeBrickCenterTexture() {
  const size = 512;
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#a1502f';
  ctx.fillRect(0, 0, size, size);
  const cx = size / 2, cy = size / 2;
  ctx.strokeStyle = 'rgba(60,28,16,0.5)';
  ctx.lineWidth = 3;
  for (let r = 24; r < size * 0.75; r += 26) {
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
  }
  for (let a = 0; a < 32; a++) {
    const ang = (a / 32) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(ang) * size, cy + Math.sin(ang) * size);
    ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function makeSignTexture(label, bg = '#c8481f') {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const ctx = c.getContext('2d');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 256, 256);
  ctx.strokeStyle = '#f5f2ea';
  ctx.lineWidth = 10;
  ctx.strokeRect(10, 10, 236, 236);
  ctx.fillStyle = '#f5f2ea';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '700 148px system-ui, sans-serif';
  ctx.fillText(label, 128, 140);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function makeArrowSignTexture(label) {
  const c = document.createElement('canvas');
  c.width = 320; c.height = 200;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#c8481f';
  ctx.fillRect(0, 0, 320, 200);
  ctx.fillStyle = '#f5f2ea';
  ctx.beginPath();
  ctx.moveTo(230, 40); ctx.lineTo(292, 100); ctx.lineTo(230, 160);
  ctx.lineTo(230, 128); ctx.lineTo(150, 128); ctx.lineTo(150, 72); ctx.lineTo(230, 72);
  ctx.closePath();
  ctx.fill();
  ctx.font = '700 64px system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, 26, 102);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function makeSkyTexture() {
  const w = 1024, h = 512;
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const ctx = c.getContext('2d');
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, '#4c8bc9');
  g.addColorStop(0.42, '#7fb3dd');
  g.addColorStop(0.58, '#bcdcec');
  g.addColorStop(0.74, '#e7f2ee');
  g.addColorStop(1, '#eef2e5');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  // soft warm sun glow, roughly matching the DirectionalLight's azimuth
  const sunX = w * 0.6, sunY = h * 0.2;
  const sunG = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, 190);
  sunG.addColorStop(0, 'rgba(255,251,232,0.95)');
  sunG.addColorStop(0.25, 'rgba(255,244,210,0.5)');
  sunG.addColorStop(1, 'rgba(255,244,210,0)');
  ctx.fillStyle = sunG;
  ctx.fillRect(0, 0, w, h);

  // scattered soft clouds in the upper band
  ctx.filter = 'blur(7px)';
  for (let i = 0; i < 26; i++) {
    const cx = Math.random() * w;
    const cy = h * (0.08 + Math.random() * 0.4);
    const puffs = 4 + Math.floor(Math.random() * 5);
    const baseR = 16 + Math.random() * 32;
    const alpha = 0.14 + Math.random() * 0.24;
    ctx.fillStyle = `rgba(255,255,255,${alpha.toFixed(2)})`;
    for (let p = 0; p < puffs; p++) {
      const ox = (Math.random() - 0.5) * baseR * 2.3;
      const oy = (Math.random() - 0.5) * baseR * 0.55;
      const r = baseR * (0.5 + Math.random() * 0.6);
      ctx.beginPath();
      ctx.ellipse(cx + ox, cy + oy, r, r * 0.55, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.filter = 'none';

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// Generic blotchy grayscale noise — used as a bumpMap (not normalMap) so it
// stays cheap and reliable; bumpMap only needs luminance, no tangent-space
// encoding, and modern three.js derives the surface perturbation from screen
// space derivatives automatically.
export function makeNoiseBumpTexture(size = 256, speckles = 900, softness = 2, lo = 90, hi = 180) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, size, size);
  ctx.filter = `blur(${softness}px)`;
  for (let i = 0; i < speckles; i++) {
    const v = Math.round(lo + Math.random() * (hi - lo));
    ctx.fillStyle = `rgb(${v},${v},${v})`;
    const r = 1.4 + Math.random() * 3.4;
    ctx.beginPath();
    ctx.arc(Math.random() * size, Math.random() * size, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.filter = 'none';
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

// Standing-seam / corrugation ridges — used on roof surfaces. CylinderGeometry
// maps U all the way around the circumference regardless of radius, so a
// fixed repeat count gives evenly spaced ridges radiating from every apex.
export function makeCorrugatedBumpTexture(size = 256, ridges = 20) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, size, size);
  const step = size / ridges;
  for (let i = 0; i < ridges; i++) {
    const x = i * step;
    const grad = ctx.createLinearGradient(x, 0, x + step, 0);
    grad.addColorStop(0, '#5c5c5c');
    grad.addColorStop(0.5, '#cacaca');
    grad.addColorStop(1, '#5c5c5c');
    ctx.fillStyle = grad;
    ctx.fillRect(x, 0, step + 1, size);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

// Streaky directional grain — wood doors and tree bark.
export function makeGrainBumpTexture(size = 256, lines = 55, vertical = true) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, size, size);
  ctx.filter = 'blur(1px)';
  for (let i = 0; i < lines; i++) {
    const p = Math.random() * size;
    const v = Math.round(95 + Math.random() * 90);
    ctx.strokeStyle = `rgb(${v},${v},${v})`;
    ctx.lineWidth = 0.6 + Math.random() * 1.8;
    ctx.beginPath();
    if (vertical) { ctx.moveTo(p, 0); ctx.lineTo(p + (Math.random() * 12 - 6), size); }
    else { ctx.moveTo(0, p); ctx.lineTo(size, p + (Math.random() * 12 - 6)); }
    ctx.stroke();
  }
  ctx.filter = 'none';
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

// Soft radial-gradient blob — reused as a dark AO contact-shadow decal and
// (recoloured via the material, not the texture) as a warm additive glow.
export function makeShadowBlobTexture() {
  const size = 256;
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, 'rgba(18,14,10,0.5)');
  g.addColorStop(0.55, 'rgba(18,14,10,0.24)');
  g.addColorStop(1, 'rgba(18,14,10,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(c);
}

export function makeGlowBlobTexture() {
  const size = 128;
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, 'rgba(255,247,220,0.95)');
  g.addColorStop(0.35, 'rgba(255,240,190,0.5)');
  g.addColorStop(1, 'rgba(255,240,190,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(c);
}

export function clamp255(v) { return Math.max(0, Math.min(255, Math.round(v))); }
export function hexToRgb(hex) { return { r: (hex >> 16) & 255, g: (hex >> 8) & 255, b: hex & 255 }; }

// A flat material color reads as CG; real tropical walls/columns have uneven
// paint, rain-streaking running down from the roofline, and grime built up
// near the floor. This bakes all three into an actual color map so the base
// hue is preserved but the surface finally looks like it has weather on it.
// Designed to be mapped with repeat.set(n, 1) — the vertical axis is NOT
// meant to tile, since the streak-from-top / grime-at-bottom logic only
// makes sense once per actual wall or column height.
export function makeWeatheredColorTexture(hex, size = 256) {
  const { r, g, b } = hexToRgb(hex);
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  ctx.fillStyle = `rgb(${r},${g},${b})`;
  ctx.fillRect(0, 0, size, size);

  ctx.filter = 'blur(5px)';
  for (let i = 0; i < 40; i++) {
    const shade = (Math.random() - 0.5) * 26;
    ctx.fillStyle = `rgba(${clamp255(r + shade)},${clamp255(g + shade)},${clamp255(b + shade)},0.35)`;
    const rad = 20 + Math.random() * 50;
    ctx.beginPath();
    ctx.arc(Math.random() * size, Math.random() * size, rad, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.filter = 'none';

  ctx.filter = 'blur(2px)';
  for (let i = 0; i < 10; i++) {
    const x = Math.random() * size;
    const w = 4 + Math.random() * 10;
    const len = size * (0.35 + Math.random() * 0.55);
    const grad = ctx.createLinearGradient(0, 0, 0, len);
    grad.addColorStop(0, `rgba(20,18,14,${(0.16 + Math.random() * 0.1).toFixed(2)})`);
    grad.addColorStop(1, 'rgba(20,18,14,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(x - w / 2, 0, w, len);
  }
  ctx.filter = 'none';

  const baseG = ctx.createLinearGradient(0, size * 0.82, 0, size);
  baseG.addColorStop(0, 'rgba(15,13,10,0)');
  baseG.addColorStop(1, 'rgba(15,13,10,0.22)');
  ctx.fillStyle = baseG;
  ctx.fillRect(0, size * 0.82, size, size * 0.18);

  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
