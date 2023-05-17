import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'

// Base initialisation
// ---------------------------

const gui = new dat.GUI()
const clock = new THREE.Clock()
const scene = new THREE.Scene()

// Window Size and resizing
// ---------------------------
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () => {
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

// Renderer
// ---------------------------
const canvas = document.querySelector('canvas.webgl')
const renderer = new THREE.WebGLRenderer({ antialias: true, canvas })
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.clearColor(0x000000)

// Camera
// ---------------------------
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 1000) // PerspectiveCamera(fov, aspect, near, far)
// const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 1000) // OrthographicCamera(left, right, top, bottom, near, far)
camera.position.set(0, 2.5, 3.5)
scene.add(camera)

guiCamera()

// Controls
// ---------------------------
const controls = new OrbitControls(camera, canvas)
controls.target.set(0, 0, 0)
controls.enableDamping = true

// Lights
// ---------------------------

let ambientLight
let pointLight

addAmbientLight()
guiAmbientLight()

addPointLight()
guiPointLight()

scene.fog = new THREE.Fog(0x000000, 15, 20)

// Meshs
// ---------------------------
const textureLoader = new THREE.TextureLoader()
const matcapTexture = textureLoader.load('https://raw.githubusercontent.com/nidorx/matcaps/master/1024/394641_B1A67E_75BEBE_7D7256.png') // Matcap Library: https://github.com/nidorx/matcaps

// Some Geometries
const geometryBox = new THREE.BoxGeometry(1, 1, 1, 2, 2, 2)
const geometrySphere = new THREE.SphereGeometry(0.5, 32, 32)
const geometryPlane = new THREE.PlaneGeometry(1, 1, 32, 32)
const geometryTorus = new THREE.TorusGeometry(0.3, 0.2, 32, 64)
const geometryTorusKnot = new THREE.TorusKnotGeometry(0.5, 0.2, 64, 64)

// Some Materials
const materialBasic = new THREE.MeshBasicMaterial({ color: 0xEC8422 }) // no shadow
const materialStandard = new THREE.MeshStandardMaterial({ color: 0xEC8422 })
const materialLambert = new THREE.MeshLambertMaterial({ color: 0xEC8422 })
const materialPhong = new THREE.MeshPhongMaterial({ color: 0xEC8422 })
const materialMatcap = new THREE.MeshMatcapMaterial({ matcap: matcapTexture })
const materialNormal = new THREE.MeshNormalMaterial()
const materialPhysical = new THREE.MeshPhysicalMaterial({ color: 0xEC8422 })

guiMaterialStandard()
// guiMaterialPhysical();

// Objects
// ---------------------------
const cube = new THREE.Mesh(geometryBox, materialStandard)
const sphere = new THREE.Mesh(geometrySphere, materialStandard)
const torus = new THREE.Mesh(geometryTorus, materialStandard)
// let torusKnot = new THREE.Mesh(geometryTorusKnot, materialPhysical);

addMesh(cube, { x: 0, y: 1, z: 0 })
addMesh(sphere, { x: 2, y: 1, z: 0 })
addMesh(torus, { x: -2, y: 1, z: 0 })
// addMesh(torusKnot, { x: 0, y: 1, z: -2 });

// Floor
let plane

addPlane()

// Helpers
helperGrid(0, -0.499, 0)
helperPointLight()

// Animate
// ---------------------------
let previousTime = 0

const animate = () => {
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - previousTime
    previousTime = elapsedTime

    // Lights
    // ---------------------------
    animatePointLight(elapsedTime)

    // Objects
    // ---------------------------
    cube.rotation.x += 0.25 * deltaTime
    cube.rotation.y += 0.5 * deltaTime
    torus.rotation.y += 0.5 * deltaTime

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(animate)
}

animate()

// Functions
// ---------------------------

function animatePointLight (elapsedTime) {
    pointLight.position.x = Math.sin(elapsedTime * 0.1) * 3
    pointLight.position.y = (Math.sin(elapsedTime * 0.1)) + 2.5
    pointLight.position.z = Math.cos(elapsedTime * 0.1) * 3
}

function animateMesh (mesh, deltaTime) {
    if (mesh?.rotation?.x) {
        mesh.rotation.x += 0.25 * deltaTime
        mesh.rotation.y += 0.5 * deltaTime
    }
}

function addPlane () {
    plane = new THREE.Mesh(
        new THREE.PlaneGeometry(1000, 1000),
        new THREE.MeshStandardMaterial({ color: 0x222222 })
    )
    plane.position.set(0, -0.5, 0)
    plane.rotation.x = -Math.PI * 0.5
    plane.receiveShadow = true
    plane.material.side = THREE.DoubleSide
    scene.add(plane)
}

function addMesh (mesh, position = { x: 0, y: 1, z: 0 }) {
    // Position
    mesh.position.set(position.x, position.y, position.z)

    // Shadows
    mesh.castShadow = true

    // --> Add to scene
    scene.add(mesh)
}

function addAmbientLight (color = 0xFFFFFF, intensity = 0.5) {
    ambientLight = new THREE.AmbientLight(color, intensity)
    scene.add(ambientLight)
}

function guiAmbientLight (el = ambientLight) {
    const folder = gui.addFolder('Ambient Light')
    folder.add(el, 'intensity').min(0).max(2).step(0.01)
}

function addPointLight (color = 0xFFFFFF, intensity = 1, distance = 20, decay = 0.2) {
    // Parameters
    pointLight = new THREE.PointLight(color, intensity, distance, decay)

    // Position
    pointLight.position.set(0, 4, 0)

    // Shadows
    pointLight.castShadow = true
    pointLight.shadow.mapSize.width = 1024
    pointLight.shadow.mapSize.height = 1024

    // --> Add to scene
    scene.add(pointLight)
}

function guiPointLight (el = pointLight) {
    const folder = gui.addFolder('Point Light')
    folder.add(el.position, 'x').min(-5).max(10).step(0.01)
    folder.add(el.position, 'y').min(-5).max(10).step(0.01)
    folder.add(el.position, 'z').min(-5).max(10).step(0.01)
    folder.add(el, 'intensity').min(0).max(2).step(0.01)
}

function guiCamera () {
    const folder = gui.addFolder('Camera')

    if (camera.type === 'PerspectiveCamera') {
        folder.add(camera, 'fov').min(30).max(160).step(1).onChange(() => {
            camera.updateProjectionMatrix()
        })
    }
}

function guiMaterialStandard () {
    const folder = gui.addFolder('Material')
    folder.add(materialStandard, 'metalness').min(0).max(2).step(0.01)
    folder.add(materialStandard, 'roughness').min(0).max(1).step(0.01)
    folder.addColor(materialStandard, 'color')
}

function guiMaterialPhysical () {
    const folder = gui.addFolder('Material')
    folder.add(materialPhysical, 'metalness').min(0).max(2).step(0.01)
    folder.add(materialPhysical, 'roughness').min(0).max(1).step(0.01)
    folder.add(materialPhysical, 'clearcoat').min(0).max(1).step(0.01)
    folder.add(materialPhysical, 'ior').min(0).max(3).step(0.01)
    folder.add(materialPhysical, 'thickness').min(0).max(2).step(0.01)
    folder.add(materialPhysical, 'transmission').min(0).max(1).step(0.01)
    folder.add(materialPhysical, 'reflectivity').min(0).max(1).step(0.01)
    folder.add(materialPhysical, 'flatshading')
    folder.add(materialPhysical, 'wireframe')
    folder.addColor(materialPhysical, 'color')
}

// Helpers
// ---------------------------

function helperGrid (x = 0, y = 0, z = 0) {
    const gridHelper = new THREE.GridHelper(10, 10)
    gridHelper.position.set(x, y, z)
    scene.add(gridHelper)
}

function helperPointLight (size = 1, color = '#f55') {
    const pointLightHelper = new THREE.PointLightHelper(pointLight, size, color)
    scene.add(pointLightHelper)
}
