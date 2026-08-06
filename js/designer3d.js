// ==============================================
// ConstructView — 3D Building Designer Engine
// Parametric building generation with real-time preview
// ==============================================

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

class BuildingDesigner {
  constructor(canvasEl) {
    this.canvas = canvasEl;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.buildingGroup = null;
    this.gridHelper = null;
    this.groundPlane = null;

    // Design parameters
    this.params = {
      floors: 3,
      width: 10,
      depth: 8,
      floorHeight: 3.2,
      roofType: 'gable',      // gable, flat, hip, dome
      roofColor: '#5c4033',
      wallColor: '#e8e0d8',
      glassColor: '#87ceeb',
      windowStyle: 'grid',    // grid, horizontal, full
      windowCount: 3,
      hasBalcony: true,
      hasEntrance: true,
      hasFoundation: true,
      hasMEP: false,
      surrounding: 'none',   // none, garden, urban
    };

    this.init();
    this.animate();
  }

  init() {
    const rect = this.canvas.getBoundingClientRect();

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x111827);
    this.scene.fog = new THREE.Fog(0x111827, 20, 100);

    this.camera = new THREE.PerspectiveCamera(50, rect.width / rect.height, 0.5, 200);
    this.camera.position.set(16, 10, 18);
    this.camera.lookAt(0, 4, 0);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(rect.width, rect.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
    this.canvas.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.target.set(0, 4, 0);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.minDistance = 5;
    this.controls.maxDistance = 60;
    this.controls.update();

    // Lighting
    this.scene.add(new THREE.AmbientLight(0x404060, 1.5));
    const sun = new THREE.DirectionalLight(0xfff5e6, 4.5);
    sun.position.set(25, 20, 10);
    sun.castShadow = true;
    sun.shadow.mapSize.width = 2048;
    sun.shadow.mapSize.height = 2048;
    sun.shadow.camera.near = 0.5;
    sun.shadow.camera.far = 80;
    sun.shadow.camera.left = -30; sun.shadow.camera.right = 30;
    sun.shadow.camera.top = 30; sun.shadow.camera.bottom = -30;
    this.scene.add(sun);
    this.scene.add(new THREE.HemisphereLight(0x8899cc, 0x445566, 0.8));

    // Ground
    const groundGeo = new THREE.PlaneGeometry(80, 80);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x1a2235, roughness: 0.9, metalness: 0.1 });
    this.groundPlane = new THREE.Mesh(groundGeo, groundMat);
    this.groundPlane.rotation.x = -Math.PI / 2;
    this.groundPlane.position.y = -0.1;
    this.groundPlane.receiveShadow = true;
    this.scene.add(this.groundPlane);

    this.gridHelper = new THREE.GridHelper(40, 40, 0x334466, 0x1e293b);
    this.gridHelper.position.y = 0.01;
    this.scene.add(this.gridHelper);

    // Building group
    this.buildingGroup = new THREE.Group();
    this.scene.add(this.buildingGroup);

    this.build();

    window.addEventListener('resize', () => this.onResize());
  }

  // ============ PARAMETRIC BUILDING ============
  build() {
    // Clear
    while (this.buildingGroup.children.length > 0) {
      const c = this.buildingGroup.children[0];
      this.buildingGroup.remove(c);
      this._dispose(c);
    }

    const p = this.params;
    const g = new THREE.Group();
    g.name = 'building';

    const wallMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(p.wallColor),
      roughness: 0.4, metalness: 0.05
    });
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0xd0c8c0, roughness: 0.5, metalness: 0.1
    });
    const glassMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(p.glassColor),
      roughness: 0.1, metalness: 0.3, transparent: true, opacity: 0.45
    });
    const roofMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(p.roofColor),
      roughness: 0.7, metalness: 0.0
    });
    const steelMat = new THREE.MeshStandardMaterial({
      color: 0x8899aa, roughness: 0.3, metalness: 0.8
    });
    const mepMat = new THREE.MeshStandardMaterial({
      color: 0xff6b35, roughness: 0.3, metalness: 0.5,
      emissive: 0x220000, emissiveIntensity: 0.3
    });

    const totalHeight = p.floors * p.floorHeight;
    const hw = p.width / 2, hd = p.depth / 2;

    // Foundation
    if (p.hasFoundation) {
      const f = this._mesh(new THREE.BoxGeometry(p.width + 0.8, 0.4, p.depth + 0.8),
        new THREE.MeshStandardMaterial({ color: 0x666666, roughness: 0.6 }), g);
      f.position.y = -0.2;
      f.receiveShadow = true;
    }

    // Build floors
    for (let f = 0; f < p.floors; f++) {
      const yBase = f * p.floorHeight;

      // Slab
      const slab = this._mesh(new THREE.BoxGeometry(p.width + 0.4, 0.2, p.depth + 0.4), floorMat, g);
      slab.position.y = yBase + 0.1;
      slab.receiveShadow = true;

      // Walls (hollow box using individual walls or a solid box)
      const wallH = p.floorHeight - 0.2;
      const wall = this._mesh(new THREE.BoxGeometry(p.width, wallH, p.depth), wallMat, g);
      wall.position.y = yBase + wallH / 2;
      wall.castShadow = true;
      wall.receiveShadow = true;
      wall.userData = { type: 'wall', floor: f + 1 };

      // Windows
      if (p.windowStyle === 'full') {
        // Full height glass strip
        for (const face of [-1, 1]) {
          const win = this._mesh(new THREE.BoxGeometry(p.width * 0.8, wallH * 0.6, 0.1), glassMat, g);
          win.position.set(0, yBase + wallH / 2, hd * face * 1.01);
        }
      } else {
        const count = p.windowCount;
        for (let i = 0; i < count; i++) {
          const wx = -hw + p.width / (count + 1) * (i + 1);
          // Front & back
          for (const zFace of [-1, 1]) {
            let winW = p.windowStyle === 'horizontal' ? 1.8 : 1.2;
            let winH = p.windowStyle === 'horizontal' ? 1.0 : 1.4;
            const win = this._mesh(new THREE.BoxGeometry(winW, winH, 0.1), glassMat, g);
            win.position.set(wx, yBase + wallH / 2, hd * zFace * 1.01);
          }
        }
        // Side windows (fewer)
        for (let z = -hd + 2; z <= hd - 2; z += 4) {
          for (const xFace of [-1, 1]) {
            const win = this._mesh(new THREE.BoxGeometry(0.1, 1.2, 1.0), glassMat, g);
            win.position.set(hw * xFace * 1.01, yBase + wallH / 2, z);
          }
        }
      }

      // MEP horizontal runs between floors
      if (p.hasMEP && f < p.floors - 1) {
        const pipe = this._mesh(new THREE.CylinderGeometry(0.1, 0.1, p.width * 0.9, 8), mepMat, g);
        pipe.position.y = yBase + p.floorHeight;
        // Vertical risers
        const riser = this._mesh(new THREE.CylinderGeometry(0.08, 0.08, p.floorHeight, 8),
          new THREE.MeshStandardMaterial({ color: 0x4488cc, roughness: 0.3, metalness: 0.5 }), g);
        riser.position.set(-hw + 1.5, yBase + p.floorHeight / 2, -hd + 1.5);
      }
    }

    // Roof
    const roofY = totalHeight;
    const roofOffset = p.roofType === 'flat' ? 0 : 0;

    switch (p.roofType) {
      case 'gable': {
        // Gable roof (triangular prism)
        const roofH = 2.0;
        const ridgeShape = new THREE.Shape();
        ridgeShape.moveTo(-hw - 1, 0);
        ridgeShape.lineTo(hw + 1, 0);
        ridgeShape.lineTo(0, roofH);
        ridgeShape.closePath();
        const extrudeSettings = { steps: 1, depth: p.depth + 2, bevelEnabled: false };
        const roofGeo = new THREE.ExtrudeGeometry(ridgeShape, extrudeSettings);
        roofGeo.translate(0, roofY, -p.depth / 2 - 1);
        roofGeo.rotateX(-Math.PI / 2);
        const roof = new THREE.Mesh(roofGeo, roofMat);
        roof.castShadow = true;
        roof.receiveShadow = true;
        g.add(roof);
        break;
      }
      case 'hip': {
        // Hip roof (pyramid-like)
        const hipH = 2.5;
        const hipGeo = new THREE.ConeGeometry(Math.max(p.width, p.depth) * 0.75, hipH, 4);
        const hip = new THREE.Mesh(hipGeo, roofMat);
        hip.position.y = roofY + hipH / 2;
        hip.rotation.y = Math.PI / 4;
        hip.castShadow = true;
        g.add(hip);
        break;
      }
      case 'dome': {
        const domeGeo = new THREE.SphereGeometry(Math.max(p.width, p.depth) * 0.5, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2);
        const dome = new THREE.Mesh(domeGeo, roofMat);
        dome.position.y = roofY;
        dome.castShadow = true;
        g.add(dome);
        break;
      }
      default: { // flat
        const flatGeo = new THREE.BoxGeometry(p.width + 0.5, 0.3, p.depth + 0.5);
        const flat = new THREE.Mesh(flatGeo, roofMat);
        flat.position.y = roofY;
        flat.castShadow = true;
        g.add(flat);
        // Parapet
        const parapetH = 0.6;
        for (const [x, z, w, d] of [[0, hd, p.width + 0.5, 0.15], [0, -hd, p.width + 0.5, 0.15], [hw, 0, 0.15, p.depth + 0.5], [-hw, 0, 0.15, p.depth + 0.5]]) {
          const pp = this._mesh(new THREE.BoxGeometry(w, parapetH, d), wallMat, g);
          pp.position.set(x, roofY + 0.45, z);
        }
        break;
      }
    }

    // Entrance
    if (p.hasEntrance) {
      const doorFrame = this._mesh(new THREE.BoxGeometry(2.2, 2.8, 0.3), steelMat, g);
      doorFrame.position.set(0, 1.4, hd * 1.01);
      const door = this._mesh(new THREE.BoxGeometry(1.8, 2.4, 0.15),
        new THREE.MeshStandardMaterial({ color: 0x3a2a1a, roughness: 0.5 }), g);
      door.position.set(0, 1.2, hd * 1.01);
    }

    // Balcony on top floor
    if (p.hasBalcony && p.floors >= 2) {
      const balconyY = (p.floors - 1) * p.floorHeight + p.floorHeight / 2;
      const bGeo = new THREE.BoxGeometry(3, 0.2, 2);
      const bSlab = this._mesh(bGeo, floorMat, g);
      bSlab.position.set(hw + 1.5, balconyY - 1.4, 0);
      // Railing
      for (let rx = -1; rx <= 1; rx += 2) {
        const rail = this._mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.2, 8), steelMat, g);
        rail.position.set(hw + 1.5 + rx * 1.3, balconyY - 0.5, 0);
      }
    }

    // Surrounding
    if (p.surrounding === 'garden') {
      for (let i = 0; i < 8; i++) {
        const tx = -hw - 4 + Math.random() * (p.width + 8);
        const tz = -hd - 6 + Math.random() * -5;
        const trunk = this._mesh(new THREE.CylinderGeometry(0.15, 0.2, 2.5, 8),
          new THREE.MeshStandardMaterial({ color: 0x8B4513, roughness: 0.9 }), g);
        trunk.position.set(tx, 1.25, tz);
        const crown = this._mesh(new THREE.SphereGeometry(1.2, 8, 6),
          new THREE.MeshStandardMaterial({ color: 0x2d5a27, roughness: 0.8 }), g);
        crown.position.set(tx, 2.8, tz);
      }
    }

    if (p.surrounding === 'urban') {
      // Road
      const road = this._mesh(new THREE.PlaneGeometry(5, p.depth + 10),
        new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.95 }), g);
      road.rotation.x = -Math.PI / 2;
      road.position.set(0, 0.02, hd + 5);
      // Adjacent low buildings
      for (let sx = -1; sx <= 1; sx += 2) {
        const adj = this._mesh(new THREE.BoxGeometry(4, 2.5 + Math.random() * 3, 6),
          new THREE.MeshStandardMaterial({ color: 0xd0c8c0, roughness: 0.5 }), g);
        adj.position.set(sx * (hw + 5), 1.5, 0);
        adj.castShadow = true;
      }
    }

    this.buildingGroup.add(g);
  }

  _mesh(geo, mat, parent) {
    const m = new THREE.Mesh(geo, mat);
    m.castShadow = true;
    m.receiveShadow = true;
    if (parent) parent.add(m);
    return m;
  }

  _dispose(obj) {
    obj.traverse(c => {
      if (c.geometry) c.geometry.dispose();
      if (c.material) {
        (Array.isArray(c.material) ? c.material : [c.material]).forEach(m => m.dispose());
      }
    });
  }

  // ============ CONTROLS ============
  updateParam(key, value) {
    this.params[key] = value;
    this.build();
  }

  resetDefault() {
    this.params = {
      floors: 3, width: 10, depth: 8, floorHeight: 3.2,
      roofType: 'gable', roofColor: '#5c4033', wallColor: '#e8e0d8',
      glassColor: '#87ceeb', windowStyle: 'grid', windowCount: 3,
      hasBalcony: true, hasEntrance: true, hasFoundation: true,
      hasMEP: false, surrounding: 'none',
    };
    this.build();
    this.resetView();
  }

  resetView() {
    this.camera.position.set(16, 10, 18);
    this.controls.target.set(0, 4, 0);
    this.controls.update();
  }

  setView(view) {
    const t = new THREE.Vector3(0, 4, 0);
    const positions = {
      top: [0, 25, 0.1], front: [0, 4, 25], right: [25, 4, 0],
      '3d': [16, 10, 18], inside: [0, this.params.floors * this.params.floorHeight / 2, 0]
    };
    const pos = positions[view] || [16, 10, 18];
    this.camera.position.set(...pos);
    this.controls.target.copy(t);
    this.controls.update();
  }

  toggleWireframe() {
    this.buildingGroup.traverse(c => {
      if (c.isMesh && c.material) {
        const mats = Array.isArray(c.material) ? c.material : [c.material];
        mats.forEach(m => { m.wireframe = !m.wireframe; });
      }
    });
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
    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    window.removeEventListener('resize', this.onResize);
    this.renderer.dispose();
    this.scene.traverse(c => {
      if (c.geometry) c.geometry.dispose();
      if (c.material) {
        (Array.isArray(c.material) ? c.material : [c.material]).forEach(m => m.dispose());
      }
    });
  }
}

export { BuildingDesigner };
