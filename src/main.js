import './style.css'
import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'

// ======================================================
// Easy Model Setting Section
// Put your final model at: public/models/model.glb
// If model.glb is missing, fallback scene will show.
// ======================================================

const MODEL_CONFIG = {
  path: '/models/model.glb',

  autoCenter: true,
  targetSize: 14,

  position: new THREE.Vector3(0, 0, 0),
  rotation: new THREE.Euler(0, 0, 0),
  scaleMultiplier: 1,

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
// Grass Ground
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
// Load GLB Model
// If model.glb is missing, fallback entrance scene appears.
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

  box = new THREE.Box3().setFromObject(model)

  const center = new THREE.Vector3()
  box.getCenter(center)

  model.position.sub(center)

  box = new THREE.Box3().setFromObject(model)
  model.position.y -= box.min.y

  model.position.add(MODEL_CONFIG.position)
}

// ======================================================
// Fallback P19 Entrance Scene
// Grass + Trees + Square Flooring +
// 3 small rectangles left, 1 big middle rectangle, 3 small rectangles right
// ======================================================

function createFallbackP19Scene() {
  createMainEntrance()

  createTree(-11, -4)
  createTree(11, -4)
  createTree(-12, 5)
  createTree(12, 5)
  createTree(-8, 8)
  createTree(8, 8)
}

function createMainEntrance() {
  const wallMat = new THREE.MeshStandardMaterial({
    color: 0xdedede,
    roughness: 0.55
  })

  const innerMat = new THREE.MeshStandardMaterial({
    color: 0x5f5f5f,
    roughness: 0.85
  })

  const roofMat = new THREE.MeshStandardMaterial({
    color: 0x5d6063,
    roughness: 0.8
  })

  const tileMat1 = new THREE.MeshStandardMaterial({
    color: 0x9a9188,
    roughness: 0.85
  })

  const tileMat2 = new THREE.MeshStandardMaterial({
    color: 0x7f776f,
    roughness: 0.85
  })

  const pavementMat = new THREE.MeshStandardMaterial({
    color: 0xa8a8a8,
    roughness: 0.85
  })

  // ======================================================
  // Square Pattern Flooring
  // ======================================================

  const tileSize = 1
  const floorWidth = 18
  const floorDepth = 8

  for (let x = -floorWidth / 2; x < floorWidth / 2; x += tileSize) {
    for (let z = -floorDepth / 2; z < floorDepth / 2; z += tileSize) {
      const tileIndexX = Math.round((x + floorWidth / 2) / tileSize)
      const tileIndexZ = Math.round((z + floorDepth / 2) / tileSize)

      const tile = new THREE.Mesh(
        new THREE.BoxGeometry(tileSize, 0.05, tileSize),
        (tileIndexX + tileIndexZ) % 2 === 0 ? tileMat1 : tileMat2
      )

      tile.position.set(x + tileSize / 2, 0.04, z + 0.4)
      tile.receiveShadow = true
      scene.add(tile)
    }
  }

  // ======================================================
  // Front Pavement
  // ======================================================

  const frontPavement = new THREE.Mesh(
    new THREE.BoxGeometry(22, 0.04, 4),
    pavementMat
  )

  frontPavement.position.set(0, 0.03, 6.2)
  frontPavement.receiveShadow = true
  scene.add(frontPavement)

  // ======================================================
  // Entrance Wall
  // Layout:
  // [small] [small] [small] [LARGE] [small] [small] [small]
  // ======================================================

  const wallZ = 3
  const wallHeight = 4.2
  const wallDepth = 0.35
  const wallLength = 20

  const bottomBeamHeight = 0.35
  const topBeamHeight = 0.35
  const columnWidth = 0.45

  // Bottom horizontal wall beam
  const bottomBeam = new THREE.Mesh(
    new THREE.BoxGeometry(wallLength, bottomBeamHeight, wallDepth),
    wallMat
  )

  bottomBeam.position.set(0, bottomBeamHeight / 2, wallZ)
  bottomBeam.castShadow = true
  bottomBeam.receiveShadow = true
  scene.add(bottomBeam)

  // Top horizontal wall beam
  const topBeam = new THREE.Mesh(
    new THREE.BoxGeometry(wallLength, topBeamHeight, wallDepth),
    wallMat
  )

  topBeam.position.set(0, wallHeight, wallZ)
  topBeam.castShadow = true
  topBeam.receiveShadow = true
  scene.add(topBeam)

  // Opening size arrangement
  const openings = [
    { type: 'small', width: 1.35 },
    { type: 'small', width: 1.35 },
    { type: 'small', width: 1.35 },
    { type: 'large', width: 4.4 },
    { type: 'small', width: 1.35 },
    { type: 'small', width: 1.35 },
    { type: 'small', width: 1.35 }
  ]

  const totalOpeningWidth = openings.reduce((sum, item) => {
    return sum + item.width
  }, 0)

  const totalColumnCount = openings.length + 1
  const totalColumnWidth = totalColumnCount * columnWidth
  const usedWallWidth = totalOpeningWidth + totalColumnWidth

  const sideExtensionWidth = (wallLength - usedWallWidth) / 2

  let currentX = -usedWallWidth / 2

  // Left side extension
  const leftExtension = new THREE.Mesh(
    new THREE.BoxGeometry(sideExtensionWidth, wallHeight, wallDepth),
    wallMat
  )

  leftExtension.position.set(
    -usedWallWidth / 2 - sideExtensionWidth / 2,
    wallHeight / 2,
    wallZ
  )
  leftExtension.castShadow = true
  leftExtension.receiveShadow = true
  scene.add(leftExtension)

  // Right side extension
  const rightExtension = new THREE.Mesh(
    new THREE.BoxGeometry(sideExtensionWidth, wallHeight, wallDepth),
    wallMat
  )

  rightExtension.position.set(
    usedWallWidth / 2 + sideExtensionWidth / 2,
    wallHeight / 2,
    wallZ
  )
  rightExtension.castShadow = true
  rightExtension.receiveShadow = true
  scene.add(rightExtension)

  // First vertical column
  createWallColumn(
    currentX + columnWidth / 2,
    wallHeight / 2,
    wallZ,
    columnWidth,
    wallHeight,
    wallDepth,
    wallMat
  )

  currentX += columnWidth

  openings.forEach((opening) => {
    const openingCenterX = currentX + opening.width / 2

    const openingPanel = new THREE.Mesh(
      new THREE.BoxGeometry(opening.width, 3.25, 0.08),
      innerMat
    )

    openingPanel.position.set(openingCenterX, 1.95, wallZ - 0.25)
    openingPanel.receiveShadow = true
    scene.add(openingPanel)

    currentX += opening.width

    createWallColumn(
      currentX + columnWidth / 2,
      wallHeight / 2,
      wallZ,
      columnWidth,
      wallHeight,
      wallDepth,
      wallMat
    )

    currentX += columnWidth
  })

  // ======================================================
  // Simple Grey Roof
  // ======================================================

  const roof = new THREE.Mesh(
    new THREE.BoxGeometry(21, 0.35, 6.5),
    roofMat
  )

  roof.position.set(0, 4.45, 0.7)
  roof.rotation.x = -0.15
  roof.castShadow = true
  roof.receiveShadow = true
  scene.add(roof)

  const roofBack = new THREE.Mesh(
    new THREE.BoxGeometry(21, 0.25, 6.5),
    roofMat
  )

  roofBack.position.set(0, 4.25, -1.1)
  roofBack.rotation.x = 0.15
  roofBack.castShadow = true
  roofBack.receiveShadow = true
  scene.add(roofBack)
}

function createWallColumn(x, y, z, width, height, depth, material) {
  const column = new THREE.Mesh(
    new THREE.BoxGeometry(width, height, depth),
    material
  )

  column.position.set(x, y, z)
  column.castShadow = true
  column.receiveShadow = true
  scene.add(column)
}

function createTree(x, z) {
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18, 0.25, 1.5, 16),
    new THREE.MeshStandardMaterial({
      color: 0x7b4b2a,
      roughness: 0.8
    })
  )

  trunk.position.set(x, 0.75, z)
  trunk.castShadow = true
  scene.add(trunk)

  const leaves = new THREE.Mesh(
    new THREE.SphereGeometry(1, 18, 18),
    new THREE.MeshStandardMaterial({
      color: 0x2f8f46,
      roughness: 0.7
    })
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

createHotspot(
  0,
  2.6,
  3.8,
  'Main Entrance',
  'This is the large middle entrance opening of the P19 building.'
)

createHotspot(
  -5.1,
  2.1,
  3.8,
  'Left Entrance Openings',
  'This side contains three smaller rectangular openings.'
)

createHotspot(
  5.1,
  2.1,
  3.8,
  'Right Entrance Openings',
  'This side contains three smaller rectangular openings.'
)

// ======================================================
// Raycaster for Hotspot Click
// ======================================================

const raycaster = new THREE.Raycaster()
const mouse = new THREE.Vector2()

function onMouseClick(event) {
  if (!tourStarted) return

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
// ======================================================

const cameraViews = {
  entrance: {
    position: new THREE.Vector3(0, 3.4, 10),
    lookAt: new THREE.Vector3(0, 2.2, 3.2)
  },

  walkway: {
    position: new THREE.Vector3(4, 2.5, 11),
    lookAt: new THREE.Vector3(4, 1.5, 4)
  },

  signboard: {
    position: new THREE.Vector3(-5.5, 2.8, 9),
    lookAt: new THREE.Vector3(-5, 1.8, 3.5)
  },

  overview: {
    position: new THREE.Vector3(0, 6.5, 16),
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

  // Smooth camera movement to selected view
  if (targetCameraPosition && targetCameraQuaternion) {
    camera.position.lerp(targetCameraPosition, 0.04)
    camera.quaternion.slerp(targetCameraQuaternion, 0.04)

    euler.setFromQuaternion(camera.quaternion)

    if (camera.position.distanceTo(targetCameraPosition) < 0.05) {
      targetCameraPosition = null
      targetCameraQuaternion = null
    }
  }

  // WASD movement
  if (tourStarted) {
    const direction = new THREE.Vector3()
    camera.getWorldDirection(direction)
    direction.y = 0
    direction.normalize()

    const right = new THREE.Vector3()
    right.crossVectors(direction, camera.up).normalize()

    if (moveState.forward) {
      camera.position.addScaledVector(direction, moveSpeed * delta)
    }

    if (moveState.backward) {
      camera.position.addScaledVector(direction, -moveSpeed * delta)
    }

    if (moveState.left) {
      camera.position.addScaledVector(right, -moveSpeed * delta)
    }

    if (moveState.right) {
      camera.position.addScaledVector(right, moveSpeed * delta)
    }

    camera.position.y = Math.max(1.5, camera.position.y)
  }

  // Hotspot floating animation
  const elapsedTime = clock.getElapsedTime()

  hotspots.forEach((hotspot, index) => {
    hotspot.position.y =
      hotspot.userData.originalY + Math.sin(elapsedTime * 2 + index) * 0.12

    hotspot.rotation.y += 0.02
  })

  renderer.render(scene, camera)
}

animate()