import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// --- Scene Setup ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb); // Sky blue background
scene.fog = new THREE.Fog(0x87ceeb, 20, 100);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 10, 20);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.getElementById('canvas-container').appendChild(renderer.domElement);

// --- Custom WASD + Drag Controls ---
const moveState = { forward: false, backward: false, left: false, right: false };
const moveSpeed = 10; // units per second
const lookSpeed = 0.005;

let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };
const euler = new THREE.Euler(0, 0, 0, 'YXZ');
euler.setFromQuaternion(camera.quaternion);

window.addEventListener('keydown', (e) => {
  switch(e.code) {
    case 'KeyW': case 'ArrowUp': moveState.forward = true; break;
    case 'KeyS': case 'ArrowDown': moveState.backward = true; break;
    case 'KeyA': case 'ArrowLeft': moveState.left = true; break;
    case 'KeyD': case 'ArrowRight': moveState.right = true; break;
  }
});

window.addEventListener('keyup', (e) => {
  switch(e.code) {
    case 'KeyW': case 'ArrowUp': moveState.forward = false; break;
    case 'KeyS': case 'ArrowDown': moveState.backward = false; break;
    case 'KeyA': case 'ArrowLeft': moveState.left = false; break;
    case 'KeyD': case 'ArrowRight': moveState.right = false; break;
  }
});

const canvasContainer = document.getElementById('canvas-container');

canvasContainer.addEventListener('mousedown', (e) => {
  isDragging = true;
  previousMousePosition = { x: e.clientX, y: e.clientY };
});

window.addEventListener('mouseup', () => {
  isDragging = false;
});

window.addEventListener('mousemove', (e) => {
  if (isDragging) {
    const deltaMove = {
      x: e.clientX - previousMousePosition.x,
      y: e.clientY - previousMousePosition.y
    };

    euler.y -= deltaMove.x * lookSpeed;
    euler.x -= deltaMove.y * lookSpeed;

    // Clamp vertical rotation so you can't flip upside down
    euler.x = Math.max(-Math.PI/2 + 0.1, Math.min(Math.PI/2 - 0.1, euler.x));

    camera.quaternion.setFromEuler(euler);

    previousMousePosition = { x: e.clientX, y: e.clientY };
  }
});

// --- Lighting ---
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
dirLight.position.set(20, 40, 20);
dirLight.castShadow = true;
dirLight.shadow.mapSize.width = 2048;
dirLight.shadow.mapSize.height = 2048;
scene.add(dirLight);

// --- Environment Setup ---
// Ground (Keep this if you want a grass floor, otherwise you can remove it)
const groundGeo = new THREE.PlaneGeometry(100, 100);
const groundMat = new THREE.MeshStandardMaterial({ color: 0x4CAF50, roughness: 0.8 }); // Green grass color
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// --- Load Custom 3D Model ---
const loader = new GLTFLoader();

// Replace 'model.glb' with the exact name of your model file.
// Ensure your model file is placed inside the 'public' folder.
loader.load(
  '/model.glb', 
  function (gltf) {
    const model = gltf.scene;
    
    // Optional: Enable shadows for all meshes in the model
    model.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    
    // Optional: Adjust position, scale, or rotation if needed
    // model.position.set(0, 0, 0);
    // model.scale.set(1, 1, 1);
    
    scene.add(model);
    console.log("Model loaded successfully!");
  },
  function (xhr) {
    console.log((xhr.loaded / xhr.total * 100) + '% loaded'); // Show loading progress
  },
  function (error) {
    console.error('An error happened while loading the model:', error);
  }
);


// --- Interactive Hotspots ---
const hotspots = [];

function createHotspot(x, y, z, title, description) {
  const geo = new THREE.SphereGeometry(0.5, 16, 16);
  const mat = new THREE.MeshBasicMaterial({ color: 0xff8a00 });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(x, y, z);
  
  // Store data on the object for raycasting
  mesh.userData = { title, description, isHotspot: true };
  
  scene.add(mesh);
  hotspots.push(mesh);
  return mesh;
}

// Add some example hotspots (You can use the createHotspot function to add new ones on your 3D model)
// createHotspot(-5, 11, -5, "Main Faculty Building", "Description here...");


// --- Interaction Logic (Raycaster) ---
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function onMouseClick(event) {
  // Calculate mouse position in normalized device coordinates (-1 to +1)
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  // Calculate objects intersecting the picking ray
  const intersects = raycaster.intersectObjects(hotspots);

  if (intersects.length > 0) {
    const object = intersects[0].object;
    if (object.userData.isHotspot) {
      showInfoPopup(object.userData.title, object.userData.description);
    }
  }
}
window.addEventListener('click', onMouseClick);


// --- UI Logic ---
const uiLayer = document.getElementById('ui-layer');
const welcomeScreen = document.getElementById('welcome-screen');
const instructionPanel = document.getElementById('instruction-panel');
const navMenu = document.getElementById('nav-menu');
const infoPopup = document.getElementById('info-popup');

const startBtn = document.getElementById('start-btn');
const helpBtn = document.getElementById('help-btn');
const closeInstructionsBtn = document.getElementById('close-instructions-btn');
const closeInfoBtn = document.getElementById('close-info-btn');

startBtn.addEventListener('click', () => {
  welcomeScreen.classList.remove('active');
  welcomeScreen.classList.add('hidden');
  navMenu.classList.remove('hidden');
  navMenu.classList.add('active');
});

helpBtn.addEventListener('click', () => {
  instructionPanel.classList.remove('hidden');
  instructionPanel.classList.add('active');
});

closeInstructionsBtn.addEventListener('click', () => {
  instructionPanel.classList.remove('active');
  instructionPanel.classList.add('hidden');
});

closeInfoBtn.addEventListener('click', () => {
  infoPopup.classList.remove('active');
  infoPopup.classList.add('hidden');
});

function showInfoPopup(title, description) {
  document.getElementById('info-title').innerText = title;
  document.getElementById('info-desc').innerText = description;
  infoPopup.classList.remove('hidden');
  infoPopup.classList.add('active');
}


// --- Window Resize Handling ---
window.addEventListener('resize', onWindowResize, false);
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}


// --- Animation Loop ---
const clock = new THREE.Clock();
let prevTime = performance.now();

function animate() {
  requestAnimationFrame(animate);
  
  const currentTime = performance.now();
  const delta = (currentTime - prevTime) / 1000;
  prevTime = currentTime;
  const time = clock.getElapsedTime();
  
  // Handle WASD movement
  const direction = new THREE.Vector3();
  if (moveState.forward) direction.z -= 1;
  if (moveState.backward) direction.z += 1;
  if (moveState.left) direction.x -= 1;
  if (moveState.right) direction.x += 1;

  direction.normalize(); // Ensure consistent speed in all directions

  // Move camera relative to its current rotation, but strictly horizontal
  if (direction.length() > 0) {
    const moveVector = direction.applyQuaternion(camera.quaternion);
    moveVector.y = 0; // Keep movement horizontal on the XZ plane
    
    // Normalize again since we stripped the Y component
    if (moveVector.lengthSq() > 0) {
      moveVector.normalize().multiplyScalar(moveSpeed * delta);
      camera.position.add(moveVector);
    }
  }

  // Animate hotspots (bobbing up and down)
  hotspots.forEach(hotspot => {
    // Save original Y position in userData if not already saved
    if(hotspot.userData.originalY === undefined) {
      hotspot.userData.originalY = hotspot.position.y;
    }
    hotspot.position.y = hotspot.userData.originalY + Math.sin(time * 3) * 0.2;
  });

  renderer.render(scene, camera);
}

animate();
