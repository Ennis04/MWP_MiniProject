import './style.css'
import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'

// ======================================================
// Easy Model Setting Section
// Put your final model at: public/models/model.glb
// ======================================================

const MODEL_CONFIG = {
  path: '/models/model.glb',

  // Automatically center and resize the model
  autoCenter: true,
  targetSize: 14,

  // Fine tuning after loading model
  position: new THREE.Vector3(0, 0, 0),
  rotation: new THREE.Euler(0, 0, 0),
  scaleMultiplier: 1,

  // Change this to -1 if the camera shows the back side of the model
  frontDirectionZ: 1
}

// ======================================================
// Scene Setup
// ======================================================

const scene = new THREE.Scene()
scene.background = new THREE.Color(0x87ceeb)
scene.fog = new THREE.Fog(0x87ceeb, 20, 120)

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
)

camera.position.set(0, 5, 18)

const renderer = new THREE.WebGLRenderer({
  antialias: true
})

renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap

const canvasContainer = document.getElementById('canvas-container')
canvasContainer.appendChild(renderer.domElement)

// ======================================================
// Lighting
// ======================================================

const ambientLight = new THREE.AmbientLight(0xffffff, 0.7)
scene.add(ambientLight)

const dirLight = new THREE.DirectionalLight(0xffffff, 1.2)
dirLight.position.set(20, 40, 20)
dirLight.castShadow = true
dirLight.shadow.mapSize.width = 2048
dirLight.shadow.mapSize.height = 2048
scene.add(dirLight)

// ======================================================
// Ground
// ======================================================

const groundGeo = new THREE.PlaneGeometry(120, 120)
const groundMat = new THREE.MeshStandardMaterial({
  color: 0x4caf50,
  roughness: 0.8
})

const ground = new THREE.Mesh(groundGeo, groundMat)
ground.rotation.x = -Math.PI / 2
ground.receiveShadow = true
scene.add(ground)

// ======================================================
// WASD + Mouse Drag Camera Controls
// ======================================================

const moveState = {
  forward: false,
  backward: false,
  left: false,
  right: false
}

const moveSpeed = 10
const lookSpeed = 0.005

let tourStarted = false
let isDragging = false
let previousMousePosition = { x: 0, y: 0 }

const euler = new THREE.Euler(0, 0, 0, 'YXZ')
euler.setFromQuaternion(camera.quaternion)

window.addEventListener('keydown', (event) => {
  switch (event.code) {
    case 'KeyW':
    case 'ArrowUp':
      moveState.forward = true
      break

    case 'KeyS':
    case 'ArrowDown':
      moveState.backward = true
      break

    case 'KeyA':
    case 'ArrowLeft':
      moveState.left = true
      break

    case 'KeyD':
    case 'ArrowRight':
      moveState.right = true
      break
  }
})

window.addEventListener('keyup', (event) => {
  switch (event.code) {
    case 'KeyW':
    case 'ArrowUp':
      moveState.forward = false
      break

    case 'KeyS':
    case 'ArrowDown':
      moveState.backward = false
      break

    case 'KeyA':
    case 'ArrowLeft':
      moveState.left = false
      break

    case 'KeyD':
    case 'ArrowRight':
      moveState.right = false
      break
  }
})

canvasContainer.addEventListener('mousedown', (event) => {
  if (!tourStarted) return

  isDragging = true
  previousMousePosition = {
    x: event.clientX,
    y: event.clientY
  }
})

window.addEventListener('mouseup', () => {
  isDragging = false
})

window.addEventListener('mousemove', (event) => {
  if (!isDragging) return

  const deltaMove = {
    x: event.clientX - previousMousePosition.x,
    y: event.clientY - previousMousePosition.y
  }

  euler.y -= deltaMove.x * lookSpeed
  euler.x -= deltaMove.y * lookSpeed

  // Prevent the camera from flipping upside down
  euler.x = Math.max(
    -Math.PI / 2 + 0.1,
    Math.min(Math.PI / 2 - 0.1, euler.x)
  )

  camera.quaternion.setFromEuler(euler)

  previousMousePosition = {
    x: event.clientX,
    y: event.clientY
  }
})

// ======================================================
// Load P19 GLB Model
// ======================================================

const loadingStatus = document.getElementById('loading-status')
const loader = new GLTFLoader()

loader.load(
  MODEL_CONFIG.path,

  (gltf) => {
    const model = gltf.scene

    model.rotation.copy(MODEL_CONFIG.rotation)

    model.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true
        child.receiveShadow = true
      }
    })

    scene.add(model)

    if (MODEL_CONFIG.autoCenter) {
      fitModelToScene(model)
    } else {
      model.position.copy(MODEL_CONFIG.position)
      model.scale.multiplyScalar(MODEL_CONFIG.scaleMultiplier)
    }

    loadingStatus.textContent = 'P19 model loaded'

    setTimeout(() => {
      loadingStatus.classList.add('hidden-status')
    }, 1200)

    console.log('Model loaded successfully!')
  },

  (xhr) => {
    if (xhr.total > 0) {
      const percent = Math.round((xhr.loaded / xhr.total) * 100)
      loadingStatus.textContent = `Loading 3D model... ${percent}%`
    }
  },

  (error) => {
    console.error('Model loading error:', error)

    loadingStatus.textContent = 'Model not found. Showing placeholder scene.'

    createFallbackP19Scene()

    setTimeout(() => {
      loadingStatus.classList.add('hidden-status')
    }, 2500)
  }
)

function fitModelToScene(model) {
  let box = new THREE.Box3().setFromObject(model)

  const size = new THREE.Vector3()
  box.getSize(size)

  const maxSize = Math.max(size.x, size.y, size.z)

  if (maxSize > 0) {
    const scale =
      (MODEL_CONFIG.targetSize / maxSize) * MODEL_CONFIG.scaleMultiplier

    model.scale.multiplyScalar(scale)
  }

  // Center the model after scaling
  box = new THREE.Box3().setFromObject(model)

  const center = new THREE.Vector3()
  box.getCenter(center)

  model.position.sub(center)

  // Put the model on the ground
  box = new THREE.Box3().setFromObject(model)
  model.position.y -= box.min.y

  // Apply final custom offset
  model.position.add(MODEL_CONFIG.position)
}

// ======================================================
// Fallback Placeholder Scene
// Appears only when model.glb is missing
// ======================================================

function createFallbackP19Scene() {
  const buildingMat = new THREE.MeshStandardMaterial({
    color: 0xd8d2c4,
    roughness: 0.6
  })

  const roofMat = new THREE.MeshStandardMaterial({
    color: 0x8c4a2f,
    roughness: 0.7
  })

  const roadMat = new THREE.MeshStandardMaterial({
    color: 0x444444,
    roughness: 0.8
  })

  const building = new THREE.Mesh(
    new THREE.BoxGeometry(10, 4, 4),
    buildingMat
  )
  building.position.set(0, 2, 0)
  building.castShadow = true
  building.receiveShadow = true
  scene.add(building)

  const roof = new THREE.Mesh(new THREE.BoxGeometry(10.8, 0.5, 4.8), roofMat)
  roof.position.set(0, 4.35, 0)
  roof.castShadow = true
  scene.add(roof)

  const entrance = new THREE.Mesh(
    new THREE.BoxGeometry(1.8, 2.2, 0.2),
    new THREE.MeshStandardMaterial({ color: 0x30475e })
  )
  entrance.position.set(0, 1.1, 2.1)
  entrance.castShadow = true
  scene.add(entrance)

  const sign = new THREE.Mesh(
    new THREE.BoxGeometry(2.6, 1.2, 0.2),
    new THREE.MeshStandardMaterial({ color: 0xffffff })
  )
  sign.position.set(-5.5, 1.5, 3.2)
  sign.castShadow = true
  scene.add(sign)

  const road = new THREE.Mesh(new THREE.BoxGeometry(18, 0.06, 3), roadMat)
  road.position.set(0, 0.04, 7)
  road.receiveShadow = true
  scene.add(road)

  createTree(-7, -3)
  createTree(7, -3)
  createTree(-8, 5)
  createTree(8, 5)
}

function createTree(x, z) {
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18, 0.25, 1.5),
    new THREE.MeshStandardMaterial({ color: 0x7b4b2a })
  )
  trunk.position.set(x, 0.75, z)
  trunk.castShadow = true
  scene.add(trunk)

  const leaves = new THREE.Mesh(
    new THREE.SphereGeometry(1, 16, 16),
    new THREE.MeshStandardMaterial({ color: 0x2f8f46 })
  )
  leaves.position.set(x, 2, z)
  leaves.castShadow = true
  scene.add(leaves)
}

// ======================================================
// Interactive Hotspots
// ======================================================

const hotspots = []

function createHotspot(x, y, z, title, description) {
  const geo = new THREE.SphereGeometry(0.45, 24, 24)

  const mat = new THREE.MeshStandardMaterial({
    color: 0xff8a00,
    emissive: 0xff8a00,
    emissiveIntensity: 1.2
  })

  const mesh = new THREE.Mesh(geo, mat)

  mesh.position.set(x, y, z)

  mesh.userData = {
    title,
    description,
    isHotspot: true,
    originalY: y
  }

  scene.add(mesh)
  hotspots.push(mesh)

  return mesh
}

// Current placeholder hotspot positions.
// Later adjust these to match the real model.
createHotspot(
  0,
  3,
  3.5,
  'Main Entrance',
  'This is the main entrance area of UTM P19. It is used as the starting point for visitors in this 3D campus tour.'
)

createHotspot(
  -5.5,
  2.2,
  3.5,
  'P19 Signboard',
  'This signboard helps users identify the selected P19 location. It can be matched with the real signboard from the group reference photos.'
)

createHotspot(
  4,
  1.5,
  6,
  'Student Walkway',
  'This walkway represents the path used by students and visitors when moving around the P19 area.'
)

// ======================================================
// Raycaster for Hotspot Click
// ======================================================

const raycaster = new THREE.Raycaster()
const mouse = new THREE.Vector2()

function onMouseClick(event) {
  if (!tourStarted) return

  // Prevent UI clicks from triggering hotspot raycasting
  if (
    event.target.closest('.panel') ||
    event.target.closest('button') ||
    event.target.closest('#top-bar')
  ) {
    return
  }

  mouse.x = (event.clientX / window.innerWidth) * 2 - 1
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1

  raycaster.setFromCamera(mouse, camera)

  const intersects = raycaster.intersectObjects(hotspots)

  if (intersects.length > 0) {
    const object = intersects[0].object

    if (object.userData.isHotspot) {
      showInfoPopup(object.userData.title, object.userData.description)
    }
  }
}

window.addEventListener('click', onMouseClick)

// ======================================================
// Smooth Camera Navigation
// Camera faces selected hotspot correctly
// ======================================================

const cameraViews = {
  entrance: {
    position: new THREE.Vector3(0, 3.2, 9 * MODEL_CONFIG.frontDirectionZ),
    lookAt: new THREE.Vector3(0, 2.2, 3.5)
  },

  walkway: {
    position: new THREE.Vector3(4, 2.4, 11 * MODEL_CONFIG.frontDirectionZ),
    lookAt: new THREE.Vector3(4, 1.4, 6)
  },

  signboard: {
    position: new THREE.Vector3(-5.5, 2.6, 8 * MODEL_CONFIG.frontDirectionZ),
    lookAt: new THREE.Vector3(-5.5, 1.8, 3.5)
  },

  overview: {
    position: new THREE.Vector3(0, 6.5, 16 * MODEL_CONFIG.frontDirectionZ),
    lookAt: new THREE.Vector3(0, 2, 2)
  }
}

let targetCameraPosition = null
let targetCameraQuaternion = null

function flyToView(viewName) {
  const view = cameraViews[viewName]

  if (!view) return

  targetCameraPosition = view.position.clone()

  const tempCamera = new THREE.Object3D()
  tempCamera.position.copy(view.position)
  tempCamera.lookAt(view.lookAt)

  targetCameraQuaternion = tempCamera.quaternion.clone()
}

document.querySelectorAll('.view-btn').forEach((button) => {
  button.addEventListener('click', () => {
    flyToView(button.dataset.view)
  })
})

// ======================================================
// UI Logic
// ======================================================

const welcomeScreen = document.getElementById('welcome-screen')
const instructionPanel = document.getElementById('instruction-panel')
const navMenu = document.getElementById('nav-menu')
const infoPopup = document.getElementById('info-popup')
const topBar = document.getElementById('top-bar')

const startBtn = document.getElementById('start-btn')
const helpBtn = document.getElementById('help-btn')
const closeInstructionsBtn = document.getElementById('close-instructions-btn')
const closeInfoBtn = document.getElementById('close-info-btn')
const lightBtn = document.getElementById('light-btn')

startBtn.addEventListener('click', () => {
  tourStarted = true

  welcomeScreen.classList.remove('active')
  welcomeScreen.classList.add('hidden')

  navMenu.classList.remove('hidden')
  navMenu.classList.add('active')

  topBar.classList.remove('hidden')
  topBar.classList.add('active')

  flyToView('overview')
})

helpBtn.addEventListener('click', () => {
  instructionPanel.classList.remove('hidden')
  instructionPanel.classList.add('active')
})

closeInstructionsBtn.addEventListener('click', () => {
  instructionPanel.classList.remove('active')
  instructionPanel.classList.add('hidden')
})

closeInfoBtn.addEventListener('click', () => {
  infoPopup.classList.remove('active')
  infoPopup.classList.add('hidden')
})

function showInfoPopup(title, description) {
  document.getElementById('info-title').innerText = title
  document.getElementById('info-desc').innerText = description

  infoPopup.classList.remove('hidden')
  infoPopup.classList.add('active')
}

// ======================================================
// Day / Night Toggle
// ======================================================

let isNight = false

lightBtn.addEventListener('click', () => {
  isNight = !isNight

  if (isNight) {
    scene.background = new THREE.Color(0x07111f)
    scene.fog = new THREE.Fog(0x07111f, 20, 100)

    ambientLight.intensity = 0.3
    dirLight.intensity = 0.45

    lightBtn.textContent = 'Day Mode'
  } else {
    scene.background = new THREE.Color(0x87ceeb)
    scene.fog = new THREE.Fog(0x87ceeb, 20, 120)

    ambientLight.intensity = 0.7
    dirLight.intensity = 1.2

    lightBtn.textContent = 'Night Mode'
  }
})

// ======================================================
// Window Resize
// ======================================================

window.addEventListener('resize', onWindowResize)

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()

  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
}

// ======================================================
// Animation Loop
// ======================================================

const clock = new THREE.Clock()
let prevTime = performance.now()

function animate() {
  requestAnimationFrame(animate)

  const currentTime = performance.now()
  const delta = (currentTime - prevTime) / 1000
  prevTime = currentTime

  const time = clock.getElapsedTime()

  // WASD movement
  if (tourStarted) {
    const direction = new THREE.Vector3()

    if (moveState.forward) direction.z -= 1
    if (moveState.backward) direction.z += 1
    if (moveState.left) direction.x -= 1
    if (moveState.right) direction.x += 1

    direction.normalize()

    if (direction.length() > 0) {
      const moveVector = direction.applyQuaternion(camera.quaternion)
      moveVector.y = 0

      if (moveVector.lengthSq() > 0) {
        moveVector.normalize().multiplyScalar(moveSpeed * delta)
        camera.position.add(moveVector)
      }
    }
  }

  // Smooth camera navigation
  if (targetCameraPosition && targetCameraQuaternion) {
    camera.position.lerp(targetCameraPosition, 0.07)
    camera.quaternion.slerp(targetCameraQuaternion, 0.07)

    euler.setFromQuaternion(camera.quaternion)

    if (camera.position.distanceTo(targetCameraPosition) < 0.08) {
      targetCameraPosition = null
      targetCameraQuaternion = null
    }
  }

  // Hotspot animation
  hotspots.forEach((hotspot, index) => {
    hotspot.position.y =
      hotspot.userData.originalY + Math.sin(time * 3 + index) * 0.18

    const scale = 1 + Math.sin(time * 4 + index) * 0.1
    hotspot.scale.set(scale, scale, scale)
  })

  renderer.render(scene, camera)
}

animate()