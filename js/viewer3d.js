// ==============================================
// ConstructView — Three.js 3D Viewer Engine
// ==============================================

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

class Viewer3D {
  constructor(canvasEl) {
    this.canvas = canvasEl;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.modelGroup = null;
    this.gridHelper = null;
    this.axisHelper = null;
    this.sectionPlane = null;
    this.wireframeMode = false;
    this.xrayMode = false;
    this.measureMode = false;
    this.measureLine = null;
    this.measureMarkers = [];
    this.measurements = [];
    this.isDragging = false;
    this.annotationMarkers = [];
    this.currentTool = 'orbit';
    this.demoModel = null;

    this.init();
    this.animate();
  }

  init() {
    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x111827);
    this.scene.fog = new THREE.Fog(0x111827, 30, 80);

    // Camera
    const rect = this.canvas.getBoundingClientRect();
    this.camera = new THREE.PerspectiveCamera(50, rect.width / rect.height, 0.5, 200);
    this.camera.position.set(18, 12, 22);
    this.camera.lookAt(0, 3, 0);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(rect.width, rect.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
    this.canvas.appendChild(this.renderer.domElement);

    // Controls
    this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
    this.controls.target.set(0, 4, 0);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.minDistance = 4;
    this.controls.maxDistance = 60;
    this.controls.maxPolarAngle = Math.PI * 0.75;
    this.controls.update();
    this.controls.addEventListener('start', () => this.isDragging = true);
    this.controls.addEventListener('end', () => this.isDragging = false);

    // Lighting
    const ambient = new THREE.AmbientLight(0x404060, 1.5);
    this.scene.add(ambient);

    const sun = new THREE.DirectionalLight(0xfff5e6, 4.5);
    sun.position.set(25, 20, 10);
    sun.castShadow = true;
    sun.shadow.mapSize.width = 2048;
    sun.shadow.mapSize.height = 2048;
    sun.shadow.camera.near = 0.5;
    sun.shadow.camera.far = 80;
    sun.shadow.camera.left = -25;
    sun.shadow.camera.right = 25;
    sun.shadow.camera.top = 25;
    sun.shadow.camera.bottom = -25;
    sun.shadow.bias = -0.0001;
    this.scene.add(sun);

    const fill = new THREE.DirectionalLight(0x8899cc, 1.5);
    fill.position.set(-10, 3, -15);
    this.scene.add(fill);

    const rim = new THREE.DirectionalLight(0xffffff, 0.6);
    rim.position.set(0, 0.5, -1);
    this.scene.add(rim);

    // Hemispheric sky
    const hemi = new THREE.HemisphereLight(0x8899cc, 0x445566, 0.8);
    this.scene.add(hemi);

    // Ground
    const groundGeo = new THREE.PlaneGeometry(60, 60);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x1a2235,
      roughness: 0.9,
      metalness: 0.1,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.1;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // Grid
    this.gridHelper = new THREE.GridHelper(40, 40, 0x334466, 0x1e293b);
    this.gridHelper.position.y = 0.01;
    this.scene.add(this.gridHelper);

    // Axes indicator
    this.axisHelper = new THREE.AxesHelper(8);
    this.axisHelper.visible = false;
    this.scene.add(this.axisHelper);

    // Model group
    this.modelGroup = new THREE.Group();
    this.scene.add(this.modelGroup);

    // Build demo building
    this.buildDemoBuilding();

    // Window resize
    window.addEventListener('resize', () => this.onResize());
  }

  buildDemoBuilding() {
    // Clear existing
    while (this.modelGroup.children.length > 0) {
      this.modelGroup.remove(this.modelGroup.children[0]);
    }

    const buildingGroup = new THREE.Group();

    // Materials
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0xe8e0d8,
      roughness: 0.4,
      metalness: 0.05,
    });
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0xd0c8c0,
      roughness: 0.5,
      metalness: 0.1,
    });
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0x87ceeb,
      roughness: 0.1,
      metalness: 0.3,
      transparent: true,
      opacity: 0.5,
    });
    const roofMat = new THREE.MeshStandardMaterial({
      color: 0x5c4033,
      roughness: 0.7,
      metalness: 0.0,
    });
    const steelMat = new THREE.MeshStandardMaterial({
      color: 0x8899aa,
      roughness: 0.3,
      metalness: 0.8,
    });

    // ===== FLOOR 1 (Ground) =====
    const f1WallGeo = new THREE.BoxGeometry(10, 3.2, 8);
    const f1Wall = new THREE.Mesh(f1WallGeo, wallMat);
    f1Wall.position.set(0, 1.6, 0);
    f1Wall.castShadow = true;
    f1Wall.receiveShadow = true;
    buildingGroup.add(f1Wall);

    // Floor slab
    const slabGeo = new THREE.BoxGeometry(10.4, 0.2, 8.4);
    const slab = new THREE.Mesh(slabGeo, floorMat);
    slab.position.set(0, 0.1, 0);
    slab.receiveShadow = true;
    buildingGroup.add(slab);

    // Windows floor 1 — front face
    for (let i = 0; i < 3; i++) {
      const wx = -3 + i * 3;
      const winGeo = new THREE.BoxGeometry(1.2, 1.4, 0.1);
      const win = new THREE.Mesh(winGeo, glassMat);
      win.position.set(wx, 1.6, 4.05);
      buildingGroup.add(win);
    }
    // back
    for (let i = 0; i < 3; i++) {
      const wx = -3 + i * 3;
      const winGeo = new THREE.BoxGeometry(1.2, 1.4, 0.1);
      const win = new THREE.Mesh(winGeo, glassMat);
      win.position.set(wx, 1.6, -4.05);
      buildingGroup.add(win);
    }
    // sides
    for (const sx of [-5.05, 5.05]) {
      for (let z = -2; z <= 2; z += 4) {
        const winGeo = new THREE.BoxGeometry(0.1, 1.2, 1.0);
        const win = new THREE.Mesh(winGeo, glassMat);
        win.position.set(sx, 1.6, z);
        buildingGroup.add(win);
      }
    }

    // ===== FLOOR 2 =====
    const slab2Geo = new THREE.BoxGeometry(10.4, 0.2, 8.4);
    const slab2 = new THREE.Mesh(slab2Geo, floorMat);
    slab2.position.set(0, 3.3, 0);
    buildingGroup.add(slab2);

    const f2WallGeo = new THREE.BoxGeometry(10, 3.2, 8);
    const f2Wall = new THREE.Mesh(f2WallGeo, wallMat);
    f2Wall.position.set(0, 4.9, 0);
    f2Wall.castShadow = true;
    f2Wall.receiveShadow = true;
    buildingGroup.add(f2Wall);

    // F2 windows
    for (let i = 0; i < 3; i++) {
      const wx = -3 + i * 3;
      const winGeo = new THREE.BoxGeometry(1.2, 1.4, 0.1);
      const win = new THREE.Mesh(winGeo, glassMat);
      win.position.set(wx, 4.9, 4.05);
      buildingGroup.add(win);
    }
    for (let i = 0; i < 3; i++) {
      const wx = -3 + i * 3;
      const winGeo = new THREE.BoxGeometry(1.2, 1.4, 0.1);
      const win = new THREE.Mesh(winGeo, glassMat);
      win.position.set(wx, 4.9, -4.05);
      buildingGroup.add(win);
    }

    // ===== FLOOR 3 =====
    const slab3Geo = new THREE.BoxGeometry(10.4, 0.2, 8.4);
    const slab3 = new THREE.Mesh(slab3Geo, floorMat);
    slab3.position.set(0, 6.6, 0);
    buildingGroup.add(slab3);

    const f3WallGeo = new THREE.BoxGeometry(10, 3.0, 8);
    const f3Wall = new THREE.Mesh(f3WallGeo, wallMat);
    f3Wall.position.set(0, 8.1, 0);
    f3Wall.castShadow = true;
    f3Wall.receiveShadow = true;
    buildingGroup.add(f3Wall);

    // F3 windows
    for (let i = 0; i < 3; i++) {
      const wx = -3 + i * 3;
      const winGeo = new THREE.BoxGeometry(1.2, 1.4, 0.1);
      const win = new THREE.Mesh(winGeo, glassMat);
      win.position.set(wx, 8.1, 4.05);
      buildingGroup.add(win);
    }

    // ===== ROOF =====
    const roofGeo = new THREE.ConeGeometry(7, 1.8, 4);
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.y = 9.8;
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    buildingGroup.add(roof);

    // Roof ridge
    const ridgeGeo = new THREE.CylinderGeometry(0.08, 0.08, 7.5, 8);
    const ridge = new THREE.Mesh(ridgeGeo, steelMat);
    ridge.position.y = 10.3;
    ridge.rotation.z = Math.PI / 2;
    buildingGroup.add(ridge);

    // ===== ENTRANCE =====
    const doorFrameGeo = new THREE.BoxGeometry(2.2, 2.8, 0.3);
    const doorFrame = new THREE.Mesh(doorFrameGeo, steelMat);
    doorFrame.position.set(0, 1.4, 4.05);
    buildingGroup.add(doorFrame);
    const doorGeo = new THREE.BoxGeometry(1.8, 2.4, 0.15);
    const door = new THREE.Mesh(doorGeo, new THREE.MeshStandardMaterial({
      color: 0x3a2a1a,
      roughness: 0.5,
      metalness: 0.2,
    }));
    door.position.set(0, 1.2, 4.05);
    buildingGroup.add(door);

    // ===== FOUNDATION =====
    const foundGeo = new THREE.BoxGeometry(10.8, 0.4, 8.8);
    const found = new THREE.Mesh(foundGeo, new THREE.MeshStandardMaterial({
      color: 0x666666,
      roughness: 0.6,
      metalness: 0.1,
    }));
    found.position.set(0, -0.2, 0);
    found.receiveShadow = true;
    buildingGroup.add(found);

    // ===== SURROUNDING =====
    // Small road
    const roadGeo = new THREE.PlaneGeometry(3, 8);
    const roadMat = new THREE.MeshStandardMaterial({
      color: 0x333333,
      roughness: 0.95,
      metalness: 0.0,
    });
    const road = new THREE.Mesh(roadGeo, roadMat);
    road.rotation.x = -Math.PI / 2;
    road.position.set(0, 0.02, 8.5);
    road.receiveShadow = true;
    buildingGroup.add(road);

    // Trees
    for (let i = 0; i < 6; i++) {
      const tx = -8 + Math.random() * 16;
      const tz = -9 + Math.random() * -4;
      if (tz > -5) continue;
      this.addTree(buildingGroup, tx, tz);
    }

    // Measurements on ground for scale
    this.addGroundMarkers(buildingGroup);

    this.modelGroup.add(buildingGroup);
    this.demoModel = buildingGroup;
  }

  addTree(group, x, z) {
    const trunkGeo = new THREE.CylinderGeometry(0.15, 0.2, 2.5, 8);
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x8B4513, roughness: 0.9 });
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.set(x, 1.25, z);
    trunk.castShadow = true;
    group.add(trunk);

    const crownGeo = new THREE.SphereGeometry(1.2, 8, 6);
    const crownMat = new THREE.MeshStandardMaterial({ color: 0x2d5a27, roughness: 0.8 });
    const crown = new THREE.Mesh(crownGeo, crownMat);
    crown.position.set(x, 2.8, z);
    crown.castShadow = true;
    group.add(crown);
  }

  addGroundMarkers(group) {
    const markerMat = new THREE.MeshStandardMaterial({ color: 0x0ea5e9, roughness: 0.2, metalness: 0.5, emissive: 0x0ea5e9, emissiveIntensity: 0.3 });
    const markers = [
      { pos: [5, 0.02, 5], geo: new THREE.SphereGeometry(0.15, 8) },
      { pos: [-5, 0.02, 5], geo: new THREE.SphereGeometry(0.15, 8) },
      { pos: [5, 0.02, -5], geo: new THREE.SphereGeometry(0.15, 8) },
      { pos: [-5, 0.02, -5], geo: new THREE.SphereGeometry(0.15, 8) },
    ];

    markers.forEach(m => {
      const dot = new THREE.Mesh(m.geo, markerMat);
      dot.position.set(...m.pos);
      group.add(dot);
    });

    // North arrow
    const arrowGroup = new THREE.Group();
    const arrowBody = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.08, 1.5, 6),
      new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.3, metalness: 0.5, emissive: 0xef4444, emissiveIntensity: 0.4 })
    );
    arrowBody.position.y = 0.75;
    arrowGroup.add(arrowBody);
    const arrowHead = new THREE.Mesh(
      new THREE.ConeGeometry(0.2, 0.5, 6),
      new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.3, metalness: 0.5, emissive: 0xef4444, emissiveIntensity: 0.4 })
    );
    arrowHead.position.y = 1.6;
    arrowGroup.add(arrowHead);
    arrowGroup.position.set(7, 0.02, 6);
    group.add(arrowGroup);
  }

  // Tool actions
  setTool(tool) {
    this.currentTool = tool;
    this.controls.enabled = (tool === 'orbit' || tool === 'pan');
  }

  toggleWireframe() {
    this.wireframeMode = !this.wireframeMode;
    this.modelGroup.traverse(child => {
      if (child.isMesh && child.material && !child.material.isLineBasicMaterial) {
        if (Array.isArray(child.material)) {
          child.material.forEach(m => { m.wireframe = this.wireframeMode; });
        } else {
          child.material.wireframe = this.wireframeMode;
        }
      }
    });
  }

  toggleXRay() {
    this.xrayMode = !this.xrayMode;
    this.modelGroup.traverse(child => {
      if (child.isMesh && child.material && !child.material.isLineBasicMaterial) {
        if (Array.isArray(child.material)) {
          child.material.forEach(m => {
            m.transparent = this.xrayMode;
            m.opacity = this.xrayMode ? 0.25 : 1;
            m.depthWrite = !this.xrayMode;
          });
        } else {
          child.material.transparent = this.xrayMode;
          child.material.opacity = this.xrayMode ? 0.25 : 1;
          child.material.depthWrite = !this.xrayMode;
        }
      }
    });
    // Keep glass slightly more visible in x-ray
    if (!this.xrayMode) {
      this.modelGroup.traverse(child => {
        if (child.isMesh && child.material && child.material.color && child.material.color.getHex() === 0x87ceeb) {
          child.material.opacity = 0.5;
          child.material.transparent = true;
        }
      });
    }
  }

  resetView() {
    this.camera.position.set(18, 12, 22);
    this.controls.target.set(0, 4, 0);
    this.controls.update();
  }

  setView(view) {
    const target = new THREE.Vector3(0, 5, 0);
    let pos;
    switch (view) {
      case 'top':    pos = new THREE.Vector3(0, 25, 0.1); break;
      case 'front':  pos = new THREE.Vector3(0, 5, 20); break;
      case 'right':  pos = new THREE.Vector3(20, 5, 0); break;
      case '3d':     pos = new THREE.Vector3(18, 12, 22); break;
      default:       pos = new THREE.Vector3(18, 12, 22);
    }
    this.camera.position.copy(pos);
    this.controls.target.copy(target);
    this.controls.update();
  }

  // Place an annotation marker
  addAnnotation() {
    const markerGeo = new THREE.SphereGeometry(0.2, 16, 16);
    const markerMat = new THREE.MeshStandardMaterial({
      color: 0xff4444,
      roughness: 0.2,
      metalness: 0.5,
      emissive: 0xff4444,
      emissiveIntensity: 0.6,
    });
    const marker = new THREE.Mesh(markerGeo, markerMat);

    // Place at where the camera is looking
    const direction = new THREE.Vector3();
    this.camera.getWorldDirection(direction);
    const pos = this.camera.position.clone().add(direction.multiplyScalar(8));
    marker.position.copy(pos);
    this.scene.add(marker);
    this.annotationMarkers.push(marker);

    // Pulse animation
    let scale = 1;
    const pulse = () => {
      if (!this.annotationMarkers.includes(marker)) return;
      scale = 1 + Math.sin(Date.now() * 0.005) * 0.5;
      marker.scale.setScalar(scale);
      requestAnimationFrame(pulse);
    };
    pulse();
  }

  clearAnnotations() {
    this.annotationMarkers.forEach(m => this.scene.remove(m));
    this.annotationMarkers = [];
  }

  onResize() {
    const rect = this.canvas.getBoundingClientRect();
    this.camera.aspect = rect.width / rect.height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(rect.width, rect.height);
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    this.controls.update();

    // Gentle model rotation when idle (subtle)
    // if (!this.isDragging && this.modelGroup && this.currentTool === 'orbit') {
    //   this.modelGroup.rotation.y += 0.0002;
    // }

    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    window.removeEventListener('resize', this.onResize);
    this.renderer.dispose();
    this.scene.traverse(child => {
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach(m => m.dispose());
        } else {
          child.material.dispose();
        }
      }
    });
  }
}
