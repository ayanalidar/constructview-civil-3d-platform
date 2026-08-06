// ==============================================
// ConstructView — Advanced 3D Building Designer v2
// Custom shapes, room layout, components, materials, 2D plan
// ==============================================

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const SHAPES = {
  rectangular: { desc: 'Standard rectangle' },
  lshape: { desc: 'L-Shaped wing', offset: [0.6, 0, -0.4] },
  ushape: { desc: 'U-Shape courtyard' },
  tshape: { desc: 'T-Shape plan' },
  courtyard: { desc: 'Central courtyard' },
};

const MATERIAL_PRESETS = {
  modern: { wall: '#f5f0e8', glass: '#a8d8ea', roof: '#3d3d3d', accent: '#c0392b', name: 'Modern White' },
  classic: { wall: '#e8dcc8', glass: '#87ceeb', roof: '#5c4033', accent: '#8b4513', name: 'Classic Warm' },
  industrial: { wall: '#b0b0b0', glass: '#c8dce8', roof: '#4a4a4a', accent: '#ff6b35', name: 'Industrial' },
  coastal: { wall: '#e8f0f8', glass: '#b8ddf0', roof: '#8bb8d0', accent: '#2e86c1', name: 'Coastal Blue' },
  terracotta: { wall: '#d4956a', glass: '#87ceeb', roof: '#8b4513', accent: '#c0392b', name: 'Terracotta' },
  glasshouse: { wall: '#e8e8e8', glass: '#c8e8ff', roof: '#555555', accent: '#2ecc71', name: 'Glass House' },
};

class BuildingDesigner {
  constructor(canvasEl) {
    this.canvas = canvasEl;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.buildingGroup = null;
    this.gridHelper = null;
    this.viewMode = '3d'; // '3d' or 'plan'
    this.wireframeMode = false;
    this.raycaster = new THREE.Raycaster();
    this.placementMode = null; // null | 'wall' | 'door' | 'window' | 'staircase' | 'column'
    this.interiorWalls = [];
    this.placedComponents = [];

    // Raycaster plane for floor plan mode
    this.groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

    this.params = {
      shape: 'rectangular',
      floors: 3,
      width: 10,
      depth: 8,
      floorHeight: 3.2,
      roofType: 'gable',
      roofColor: '#5c4033',
      wallColor: '#e8e0d8',
      glassColor: '#87ceeb',
      accentColor: '#c0392b',
      materialPreset: 'classic',
      windowStyle: 'grid',
      windowCount: 3,
      hasBalcony: true,
      hasEntrance: true,
      hasFoundation: true,
      hasMEP: false,
      hasPorch: false,
      hasGarage: false,
      hasTerrace: false,
      interiorRooms: false,
      surrounding: 'none',
    };

    this.init();
    this.animate();
  }

  init() {
    const rect = this.canvas.getBoundingClientRect();
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x111827);
    this.scene.fog = new THREE.Fog(0x111827, 25, 120);

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
    this.controls.minDistance = 4;
    this.controls.maxDistance = 80;
    this.controls.update();

    // Lighting
    this.scene.add(new THREE.AmbientLight(0x404060, 1.5));
    const sun = new THREE.DirectionalLight(0xfff5e6, 4.5);
    sun.position.set(25, 20, 10);
    sun.castShadow = true;
    sun.shadow.mapSize.width = 2048;
    sun.shadow.mapSize.height = 2048;
    sun.shadow.camera.near = 0.5; sun.shadow.camera.far = 100;
    sun.shadow.camera.left = -35; sun.shadow.camera.right = 35;
    sun.shadow.camera.top = 35; sun.shadow.camera.bottom = -35;
    this.scene.add(sun);
    this.scene.add(new THREE.HemisphereLight(0x8899cc, 0x445566, 0.8));
    this.scene.add(new THREE.DirectionalLight(0x8899cc, 1.2)).position.set(-10, 3, -15);

    // Ground
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(100, 100),
      new THREE.MeshStandardMaterial({ color: 0x1a2235, roughness: 0.9, metalness: 0.1 }));
    ground.rotation.x = -Math.PI / 2; ground.position.y = -0.1; ground.receiveShadow = true;
    this.scene.add(ground);

    this.gridHelper = new THREE.GridHelper(50, 50, 0x334466, 0x1e293b);
    this.gridHelper.position.y = 0.01;
    this.scene.add(this.gridHelper);

    this.buildingGroup = new THREE.Group();
    this.scene.add(this.buildingGroup);

    this.build();
    this.setupInteraction();
    window.addEventListener('resize', () => this.onResize());
  }

  setupInteraction() {
    this.renderer.domElement.addEventListener('click', (e) => this.onClick(e));
  }

  onClick(event) {
    if (!this.placementMode) return;
    const rect = this.renderer.domElement.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1
    );
    this.raycaster.setFromCamera(mouse, this.camera);
    const intersect = new THREE.Vector3();
    const hit = this.raycaster.ray.intersectPlane(
      new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), intersect
    );
    if (hit) {
      this.placeComponent(intersect);
    }
  }

  placeComponent(pos) {
    const g = this.buildingGroup.children[0] || this.buildingGroup;
    switch (this.placementMode) {
      case 'wall':
        this.addInteriorWall(pos);
        break;
      case 'column':
        this.addColumn(pos);
        break;
      case 'staircase':
        this.addStaircase(pos);
        break;
      default:
        break;
    }
  }

  // ============ BUILDING SHAPES ============
  build() {
    while (this.buildingGroup.children.length > 0) {
      this._dispose(this.buildingGroup.children[0]);
      this.buildingGroup.remove(this.buildingGroup.children[0]);
    }
    this.interiorWalls = [];
    this.placedComponents = [];

    const g = new THREE.Group();
    g.name = 'building';
    const p = this.params;

    const wallMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(p.wallColor), roughness: 0.4, metalness: 0.05 });
    const floorMat = new THREE.MeshStandardMaterial({ color: 0xd0c8c0, roughness: 0.5, metalness: 0.1 });
    const glassMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(p.glassColor), roughness: 0.1, metalness: 0.3, transparent: true, opacity: 0.45 });
    const roofMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(p.roofColor), roughness: 0.7 });
    const accentMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(p.accentColor), roughness: 0.3, metalness: 0.4 });
    const steelMat = new THREE.MeshStandardMaterial({ color: 0x8899aa, roughness: 0.3, metalness: 0.8 });
    const mepMat = new THREE.MeshStandardMaterial({ color: 0xff6b35, roughness: 0.3, metalness: 0.5, emissive: 0x220000, emissiveIntensity: 0.3 });

    // Build shape blocks
    const blocks = this._getShapeBlocks(p);
    const totalHeight = p.floors * p.floorHeight;

    // Foundation
    if (p.hasFoundation) {
      blocks.forEach(b => {
        const fnd = this._m(new THREE.BoxGeometry(b.w + 0.8, 0.4, b.d + 0.8),
          new THREE.MeshStandardMaterial({ color: 0x666666, roughness: 0.6 }), g);
        fnd.position.set(b.cx, -0.2, b.cz);
        fnd.receiveShadow = true;
      });
    }

    // Build floors for each block
    blocks.forEach(b => {
      for (let f = 0; f < p.floors; f++) {
        const yBase = f * p.floorHeight;
        // Only build this block for floors it exists on
        if (b.startFloor !== undefined && f < b.startFloor) continue;
        if (b.endFloor !== undefined && f >= b.endFloor) continue;

        const wallH = p.floorHeight - 0.2;
        const w = b.w, d = b.d, cx = b.cx, cz = b.cz;

        // Slab
        const slab = this._m(new THREE.BoxGeometry(w + 0.4, 0.2, d + 0.4), floorMat, g);
        slab.position.set(cx, yBase + 0.1, cz); slab.receiveShadow = true;

        // Walls
        const wall = this._m(new THREE.BoxGeometry(w, wallH, d), wallMat, g);
        wall.position.set(cx, yBase + wallH / 2, cz);
        wall.castShadow = true; wall.receiveShadow = true;
        wall.userData = { type: 'wall', block: b.id, floor: f + 1 };

        // Windows
        this._addWindows(g, w, d, cx, cz, yBase, wallH, glassMat, p);
      }
    });

    // MEP
    if (p.hasMEP) {
      blocks.forEach(b => {
        for (let f = 0; f < p.floors - 1; f++) {
          const y = (f + 1) * p.floorHeight;
          const pipe = this._m(new THREE.CylinderGeometry(0.1, 0.1, b.w * 0.9, 8), mepMat, g);
          pipe.position.set(b.cx, y, b.cz);
        }
      });
    }

    // Roof per block
    blocks.forEach(b => {
      const roofY = totalHeight;
      this._addRoof(g, b, roofY, p, roofMat, wallMat);
    });

    // Porch
    if (p.hasPorch) {
      const mainBlock = blocks[0];
      const porchW = 3, porchD = 2.5;
      const porchSlab = this._m(new THREE.BoxGeometry(porchW, 0.2, porchD), floorMat, g);
      porchSlab.position.set(mainBlock.cx, 0.3, mainBlock.cz + mainBlock.d / 2 + porchD / 2);
      for (let px = -porchW / 2 + 0.2; px <= porchW / 2 - 0.2; px += porchW - 0.4) {
        const col = this._m(new THREE.CylinderGeometry(0.12, 0.12, 2.8, 8), accentMat, g);
        col.position.set(mainBlock.cx + px, 1.4, mainBlock.cz + mainBlock.d / 2 + porchD / 2);
      }
      // Porch roof
      const pRoof = this._m(new THREE.BoxGeometry(porchW + 0.3, 0.2, porchD + 0.3), roofMat, g);
      pRoof.position.set(mainBlock.cx, 3.0, mainBlock.cz + mainBlock.d / 2 + porchD / 2);
    }

    // Garage
    if (p.hasGarage) {
      const mainBlock = blocks[0];
      const gx = mainBlock.cx + mainBlock.w / 2 + 3.5;
      const gw = 4, gd = 6, gh = 2.6;
      const garage = this._m(new THREE.BoxGeometry(gw, gh, gd), wallMat, g);
      garage.position.set(gx, gh / 2, mainBlock.cz);
      garage.castShadow = true;
      // Garage door
      const gDoor = this._m(new THREE.BoxGeometry(gw - 1, gh - 0.6, 0.15),
        new THREE.MeshStandardMaterial({ color: 0x555555, roughness: 0.3, metalness: 0.7 }), g);
      gDoor.position.set(gx, gh / 2, mainBlock.cz + gd / 2 + 0.05);
      // Garage roof
      const gRoof = this._m(new THREE.BoxGeometry(gw + 0.5, 0.25, gd + 0.5), roofMat, g);
      gRoof.position.set(gx, gh + 0.1, mainBlock.cz);
    }

    // Terrace (rooftop garden)
    if (p.hasTerrace && p.floors >= 2) {
      const mainBlock = blocks[0];
      const tY = totalHeight;
      // Planter boxes
      for (let i = 0; i < 4; i++) {
        const tx = mainBlock.cx - mainBlock.w / 2 + 1.5 + Math.random() * (mainBlock.w - 3);
        const tz = mainBlock.cz - mainBlock.d / 2 + 1.5 + Math.random() * (mainBlock.d - 3);
        const planter = this._m(new THREE.BoxGeometry(0.8, 0.5, 0.8),
          new THREE.MeshStandardMaterial({ color: 0x8b6914, roughness: 0.8 }), g);
        planter.position.set(tx, tY + 0.25, tz);
        // Plant
        const plant = this._m(new THREE.SphereGeometry(0.35, 8, 6),
          new THREE.MeshStandardMaterial({ color: 0x2d8a27, roughness: 0.7 }), g);
        plant.position.set(tx, tY + 0.7, tz);
      }
      // Pergola
      for (let px = -1.5; px <= 1.5; px += 1.5) {
        const post = this._m(new THREE.CylinderGeometry(0.06, 0.06, 2.2, 8), accentMat, g);
        post.position.set(mainBlock.cx + px, tY + 1.1, mainBlock.cz - 1.5);
      }
    }

    // Surrounding
    if (p.surrounding === 'garden') {
      for (let i = 0; i < 12; i++) {
        const tx = -12 + Math.random() * 24, tz = -14 + Math.random() * -6;
        if (Math.abs(tx) < 6 && tz > -10) continue;
        const trunk = this._m(new THREE.CylinderGeometry(0.15, 0.2, 2.5, 8),
          new THREE.MeshStandardMaterial({ color: 0x8B4513, roughness: 0.9 }), g);
        trunk.position.set(tx, 1.25, tz);
        const crown = this._m(new THREE.SphereGeometry(1.2, 8, 6),
          new THREE.MeshStandardMaterial({ color: 0x2d5a27, roughness: 0.8 }), g);
        crown.position.set(tx, 2.8, tz);
      }
    }

    this.buildingGroup.add(g);
    this._applyWireframe();
  }

  _getShapeBlocks(p) {
    const blocks = [];
    const hw = p.width / 2, hd = p.depth / 2;
    switch (p.shape) {
      case 'rectangular':
        blocks.push({ id: 'main', w: p.width, d: p.depth, cx: 0, cz: 0 });
        break;
      case 'lshape':
        blocks.push({ id: 'main', w: p.width * 0.6, d: p.depth, cx: -p.width * 0.2, cz: 0 });
        blocks.push({ id: 'wing', w: p.width * 0.4, d: p.depth * 0.5, cx: p.width * 0.3, cz: -p.depth * 0.25 });
        break;
      case 'ushape':
        blocks.push({ id: 'left', w: p.width * 0.3, d: p.depth, cx: -p.width * 0.35, cz: 0 });
        blocks.push({ id: 'right', w: p.width * 0.3, d: p.depth, cx: p.width * 0.35, cz: 0 });
        blocks.push({ id: 'back', w: p.width, d: p.depth * 0.35, cx: 0, cz: -p.depth * 0.325 });
        break;
      case 'tshape':
        blocks.push({ id: 'stem', w: p.width * 0.4, d: p.depth, cx: 0, cz: 0 });
        blocks.push({ id: 'cross', w: p.width, d: p.depth * 0.4, cx: 0, cz: p.depth * 0.3 });
        break;
      case 'courtyard':
        for (const [cx, cz] of [[-hw/2, -hd/2], [hw/2, -hd/2], [-hw/2, hd/2], [hw/2, hd/2]]) {
          blocks.push({ id: 'quad', w: p.width * 0.45, d: p.depth * 0.45, cx, cz });
        }
        break;
    }
    return blocks;
  }

  _addWindows(g, w, d, cx, cz, yBase, wallH, glassMat, p) {
    const hw = w / 2, hd = d / 2;
    if (p.windowStyle === 'full') {
      for (const face of [-1, 1]) {
        const win = this._m(new THREE.BoxGeometry(w * 0.8, wallH * 0.6, 0.1), glassMat, g);
        win.position.set(cx, yBase + wallH / 2, cz + hd * face * 1.01);
      }
    } else {
      const count = p.windowCount;
      for (let i = 0; i < count; i++) {
        const wx = cx - hw + w / (count + 1) * (i + 1);
        for (const zFace of [-1, 1]) {
          const wW = p.windowStyle === 'horizontal' ? 1.8 : 1.2;
          const wH = p.windowStyle === 'horizontal' ? 1.0 : 1.4;
          const win = this._m(new THREE.BoxGeometry(wW, wH, 0.1), glassMat, g);
          win.position.set(wx, yBase + wallH / 2, cz + hd * zFace * 1.01);
        }
      }
      for (let z = cz - hd + 2; z <= cz + hd - 2; z += 4) {
        for (const xFace of [-1, 1]) {
          const win = this._m(new THREE.BoxGeometry(0.1, 1.2, 1.0), glassMat, g);
          win.position.set(cx + hw * xFace * 1.01, yBase + wallH / 2, z);
        }
      }
    }
  }

  _addRoof(g, block, roofY, p, roofMat, wallMat) {
    const hw = block.w / 2, hd = block.d / 2;
    const cx = block.cx, cz = block.cz;
    switch (p.roofType) {
      case 'gable': {
        const roofH = 2.0;
        const shape = new THREE.Shape();
        shape.moveTo(-hw - 1, 0); shape.lineTo(hw + 1, 0); shape.lineTo(0, roofH); shape.closePath();
        const geo = new THREE.ExtrudeGeometry(shape, { steps: 1, depth: block.d + 2, bevelEnabled: false });
        const roof = new THREE.Mesh(geo, roofMat);
        roof.position.set(cx, roofY - roofH + 0.1, cz - block.d / 2 - 1);
        roof.rotation.x = -Math.PI / 2; roof.castShadow = true; roof.receiveShadow = true;
        g.add(roof);
        break;
      }
      case 'hip': {
        const hipH = 2.5;
        const hip = new THREE.Mesh(new THREE.ConeGeometry(Math.max(block.w, block.d) * 0.75, hipH, 4), roofMat);
        hip.position.set(cx, roofY + hipH / 2, cz); hip.rotation.y = Math.PI / 4; hip.castShadow = true;
        g.add(hip);
        break;
      }
      case 'dome': {
        const dome = new THREE.Mesh(new THREE.SphereGeometry(Math.max(block.w, block.d) * 0.5, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), roofMat);
        dome.position.set(cx, roofY, cz); dome.castShadow = true;
        g.add(dome);
        break;
      }
      case 'butterfly': {
        for (const [sx, sz, ang] of [[-1, 0, 0.15], [1, 0, -0.15]]) {
          const panel = new THREE.Mesh(new THREE.PlaneGeometry(block.w + 1, 3), roofMat);
          panel.position.set(cx, roofY + 1, cz); panel.rotation.z = ang; panel.castShadow = true;
          g.add(panel);
        }
        break;
      }
      default: { // flat
        const flat = new THREE.Mesh(new THREE.BoxGeometry(block.w + 0.5, 0.3, block.d + 0.5), roofMat);
        flat.position.set(cx, roofY, cz); flat.castShadow = true;
        g.add(flat);
        for (const [sx, sz, sw, sd] of [[cx, cz + hd, block.w + 0.5, 0.15], [cx, cz - hd, block.w + 0.5, 0.15], [cx + hw, cz, 0.15, block.d + 0.5], [cx - hw, cz, 0.15, block.d + 0.5]]) {
          const pp = this._m(new THREE.BoxGeometry(sw, 0.6, sd), wallMat, g);
          pp.position.set(sx, roofY + 0.45, sz);
        }
        break;
      }
    }
  }

  // ============ INTERIOR & COMPONENTS ============
  addInteriorWall(pos) {
    const wall = this._m(new THREE.BoxGeometry(3, this.params.floorHeight * 0.8, 0.15),
      new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.5 }), this.buildingGroup.children[0]);
    wall.position.set(pos.x, this.params.floorHeight * 0.4, pos.z);
    wall.userData = { type: 'interiorWall' };
    this.interiorWalls.push(wall);
    this._fireEvent('componentPlaced', { type: 'wall', position: pos });
  }

  addColumn(pos) {
    const col = this._m(new THREE.CylinderGeometry(0.2, 0.25, this.params.floorHeight * this.params.floors, 8),
      new THREE.MeshStandardMaterial({ color: new THREE.Color(this.params.accentColor), roughness: 0.3, metalness: 0.4 }),
      this.buildingGroup.children[0]);
    col.position.set(pos.x, this.params.floorHeight * this.params.floors / 2, pos.z);
    col.userData = { type: 'column' };
    this.placedComponents.push(col);
    this._fireEvent('componentPlaced', { type: 'column', position: pos });
  }

  addStaircase(pos) {
    const scGroup = new THREE.Group();
    const steps = 8;
    for (let i = 0; i < steps; i++) {
      const step = this._m(new THREE.BoxGeometry(1.2, 0.18, 0.6),
        new THREE.MeshStandardMaterial({ color: 0xddddd8, roughness: 0.5 }), scGroup);
      step.position.set(0, i * 0.22, i * 0.15);
    }
    scGroup.position.set(pos.x, 0, pos.z);
    scGroup.userData = { type: 'staircase' };
    this.buildingGroup.children[0].add(scGroup);
    this.placedComponents.push(scGroup);
    this._fireEvent('componentPlaced', { type: 'staircase', position: pos });
  }

  clearComponents() {
    [...this.interiorWalls, ...this.placedComponents].forEach(c => {
      c.parent?.remove(c);
      c.traverse(child => { if (child.geometry) child.geometry.dispose(); if (child.material) child.material.dispose(); });
    });
    this.interiorWalls = [];
    this.placedComponents = [];
    this._fireEvent('componentsCleared', {});
  }

  // ============ MATERIAL PRESETS ============
  applyMaterialPreset(presetKey) {
    const preset = MATERIAL_PRESETS[presetKey];
    if (!preset) return;
    this.updateParam('wallColor', preset.wall);
    this.updateParam('glassColor', preset.glass);
    this.updateParam('roofColor', preset.roof);
    this.updateParam('accentColor', preset.accent);
    this.updateParam('materialPreset', presetKey);
    // Update color inputs in DOM
    const sync = (id, val) => { const el = document.getElementById(id); if (el) el.value = val; };
    sync('paramWallColor', preset.wall);
    sync('paramGlassColor', preset.glass);
    sync('paramRoofColor', preset.roof);
    this.build();
    this._fireEvent('presetApplied', { preset: presetKey, name: preset.name });
  }

  // ============ VIEW MODES ============
  setViewMode(mode) {
    this.viewMode = mode;
    if (mode === 'plan') {
      this.camera.position.set(0, 30, 0.1);
      this.controls.target.set(0, 0, 0);
      this.controls.enableRotate = false;
      this.controls.update();
    } else {
      this.camera.position.set(16, 10, 18);
      this.controls.target.set(0, 4, 0);
      this.controls.enableRotate = true;
      this.controls.update();
    }
  }

  // ============ CONTROLS ============
  updateParam(key, val) {
    this.params[key] = val;
    this.build();
  }

  resetDefault() {
    this.params = {
      shape: 'rectangular', floors: 3, width: 10, depth: 8, floorHeight: 3.2,
      roofType: 'gable', roofColor: '#5c4033', wallColor: '#e8e0d8',
      glassColor: '#87ceeb', accentColor: '#c0392b', materialPreset: 'classic',
      windowStyle: 'grid', windowCount: 3, hasBalcony: true, hasEntrance: true,
      hasFoundation: true, hasMEP: false, hasPorch: false, hasGarage: false,
      hasTerrace: false, interiorRooms: false, surrounding: 'none',
    };
    this.clearComponents();
    this.build();
    this.resetView();
  }

  resetView() { this.camera.position.set(16, 10, 18); this.controls.target.set(0, 4, 0); this.controls.enableRotate = true; this.controls.update(); }
  setView(view) {
    const t = new THREE.Vector3(0, 4, 0);
    const pos = { top: [0, 25, 0.1], front: [0, 4, 25], right: [25, 4, 0], '3d': [16, 10, 18] };
    const p = pos[view] || [16, 10, 18];
    this.camera.position.set(...p); this.controls.target.copy(t); this.controls.enableRotate = true; this.controls.update();
  }

  setPlacementMode(mode) {
    this.placementMode = this.placementMode === mode ? null : mode;
    this.controls.enabled = !this.placementMode;
    this._fireEvent('placementModeChanged', { mode: this.placementMode });
  }

  toggleWireframe() {
    this.wireframeMode = !this.wireframeMode;
    this._applyWireframe();
  }

  _applyWireframe() {
    this.buildingGroup.traverse(c => {
      if (c.isMesh && c.material && !c.material.isLineBasicMaterial) {
        (Array.isArray(c.material) ? c.material : [c.material]).forEach(m => { m.wireframe = this.wireframeMode; });
      }
    });
  }

  // ============ HELPERS ============
  _m(geo, mat, parent) { const m = new THREE.Mesh(geo, mat); m.castShadow = true; m.receiveShadow = true; if (parent) parent.add(m); return m; }
  _dispose(obj) { obj.traverse(c => { if (c.geometry) c.geometry.dispose(); if (c.material) (Array.isArray(c.material) ? c.material : [c.material]).forEach(m => m.dispose()); }); }
  _fireEvent(name, detail) { window.dispatchEvent(new CustomEvent(name, { detail })); }
  getStats() { const p = this.params; const h = p.floors * p.floorHeight; let area = p.width * p.depth; if (p.shape === 'lshape') area = p.width * p.depth * 0.8; return { height: h, area, floors: p.floors, volume: Math.round(area * h) }; }
  onResize() { const rect = this.canvas.getBoundingClientRect(); this.camera.aspect = rect.width / rect.height; this.camera.updateProjectionMatrix(); this.renderer.setSize(rect.width, rect.height); }
  animate() { requestAnimationFrame(() => this.animate()); this.controls.update(); this.renderer.render(this.scene, this.camera); }
  dispose() { window.removeEventListener('resize', this.onResize); this.renderer.dispose(); this.scene.traverse(c => { if (c.geometry) c.geometry.dispose(); if (c.material) (Array.isArray(c.material) ? c.material : [c.material]).forEach(m => m.dispose()); }); }
}

export { BuildingDesigner, MATERIAL_PRESETS, SHAPES };
