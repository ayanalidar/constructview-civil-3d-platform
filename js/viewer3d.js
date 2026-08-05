// ==============================================
// ConstructView — Three.js 3D Viewer Engine v2
// Features: measurement, clash detection, section planes, IFC BIM support
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
    this.wireframeMode = false;
    this.xrayMode = false;
    this.isDragging = false;
    this.annotationMarkers = [];
    this.currentTool = 'orbit';

    // Measurement
    this.measureMode = false;
    this.measurePoints = [];
    this.measureMarkers = [];
    this.measureLines = [];
    this.measureLabels = [];
    this.raycaster = new THREE.Raycaster();

    // Clash detection
    this.clashSpheres = [];
    this.clashResults = [];

    // Section / clipping
    this.clipPlanes = [];
    this.clipPlaneHelpers = [];
    this.activeSection = false;

    // BIM data
    this.bimData = {};
    this.bimElements = new Map();
    this.selectedBimElement = null;
    this.elementHighlight = null;

    this.init();
    this.animate();
    this.setupInteraction();
  }

  init() {
    const rect = this.canvas.getBoundingClientRect();

    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x111827);
    this.scene.fog = new THREE.Fog(0x111827, 30, 120);

    // Camera
    this.camera = new THREE.PerspectiveCamera(50, rect.width / rect.height, 0.5, 300);
    this.camera.position.set(18, 12, 22);
    this.camera.lookAt(0, 3, 0);

    // Renderer with localClipping support
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(rect.width, rect.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
    this.renderer.localClippingEnabled = true;
    this.canvas.appendChild(this.renderer.domElement);

    // Controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.target.set(0, 4, 0);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.minDistance = 3;
    this.controls.maxDistance = 80;
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
    sun.shadow.camera.left = -25; sun.shadow.camera.right = 25;
    sun.shadow.camera.top = 25; sun.shadow.camera.bottom = -25;
    sun.shadow.bias = -0.0001;
    this.scene.add(sun);
    this.scene.add(new THREE.DirectionalLight(0x8899cc, 1.5).copy(new THREE.Object3D()).position.set(-10, 3, -15) && new THREE.DirectionalLight(0x8899cc, 1.5));
    this.scene.children[this.scene.children.length - 1].position.set(-10, 3, -15);
    this.scene.add(new THREE.HemisphereLight(0x8899cc, 0x445566, 0.8));

    // Ground
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(80, 80),
      new THREE.MeshStandardMaterial({ color: 0x1a2235, roughness: 0.9, metalness: 0.1 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.1;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // Grid
    this.gridHelper = new THREE.GridHelper(40, 40, 0x334466, 0x1e293b);
    this.gridHelper.position.y = 0.01;
    this.scene.add(this.gridHelper);

    // Model group
    this.modelGroup = new THREE.Group();
    this.scene.add(this.modelGroup);

    this.buildDemoBuilding();
    window.addEventListener('resize', () => this.onResize());
  }

  // ============ INTERACTION SETUP ============
  setupInteraction() {
    const dom = this.renderer.domElement;
    dom.addEventListener('click', (e) => this.onClick(e));
    dom.addEventListener('mousemove', (e) => this.onMouseMove(e));
    document.addEventListener('keydown', (e) => this.onKeyDown(e));
  }

  onClick(event) {
    if (this.currentTool !== 'measure' && !this.isDragging) {
      this.pickElement(event);
    }
    if (this.measureMode) {
      this.measureClick(event);
    }
  }

  onMouseMove(event) {
    if (!this.measureMode || this.measurePoints.length === 0) return;
    this.updateMeasurePreview(event);
  }

  onKeyDown(e) {
    if (e.key === 'Escape') {
      this.clearMeasurements();
      this.setTool('orbit');
    }
    if (e.key === 'Delete' && this.selectedBimElement) {
      this.deselectElement();
    }
  }

  // ============ BUILDING ============
  buildDemoBuilding() {
    while (this.modelGroup.children.length > 0) {
      this.modelGroup.remove(this.modelGroup.children[0]);
    }
    this.bimElements.clear();

    const bld = new THREE.Group();
    bld.name = 'building';

    const wallMat = new THREE.MeshStandardMaterial({ color: 0xe8e0d8, roughness: 0.4, metalness: 0.05 });
    const floorMat = new THREE.MeshStandardMaterial({ color: 0xd0c8c0, roughness: 0.5, metalness: 0.1 });
    const glassMat = new THREE.MeshStandardMaterial({ color: 0x87ceeb, roughness: 0.1, metalness: 0.3, transparent: true, opacity: 0.5 });
    const roofMat = new THREE.MeshStandardMaterial({ color: 0x5c4033, roughness: 0.7, metalness: 0.0 });
    const steelMat = new THREE.MeshStandardMaterial({ color: 0x8899aa, roughness: 0.3, metalness: 0.8 });
    const mepMat = new THREE.MeshStandardMaterial({ color: 0xff6b35, roughness: 0.3, metalness: 0.6, emissive: 0x331100, emissiveIntensity: 0.2 });

    // Foundation
    const found = this._mesh(new THREE.BoxGeometry(10.8, 0.4, 8.8),
      new THREE.MeshStandardMaterial({ color: 0x666666, roughness: 0.6, metalness: 0.1 }),
      [0, -0.2, 0], 'Foundation', 'Structure');
    found.castShadow = false; found.receiveShadow = true;
    bld.add(found);

    // Floors
    for (let f = 0; f < 3; f++) {
      const yBase = f * 3.3;
      const h = f === 2 ? 3.0 : 3.2;

      const slab = this._mesh(new THREE.BoxGeometry(10.4, 0.2, 8.4), floorMat,
        [0, yBase + 0.1, 0], `Floor Slab L${f+1}`, 'Structure');
      slab.receiveShadow = true;
      bld.add(slab);

      const wall = this._mesh(new THREE.BoxGeometry(10, h, 8), wallMat,
        [0, yBase + 1.6 + (f===2?-0.1:0), 0], `Wall L${f+1}`, 'Architecture');
      wall.castShadow = true; wall.receiveShadow = true;
      bld.add(wall);

      // Windows front + back
      for (let i = 0; i < 3; i++) {
        const wx = -3 + i * 3;
        bld.add(this._mesh(new THREE.BoxGeometry(1.2, 1.4, 0.1), glassMat,
          [wx, yBase + 1.6, 4.05], `Window L${f+1} F${i+1}`, 'Architecture'));
        bld.add(this._mesh(new THREE.BoxGeometry(1.2, 1.4, 0.1), glassMat,
          [wx, yBase + 1.6, -4.05], `Window L${f+1} B${i+1}`, 'Architecture'));
      }

      // MEP pipes (horizontal runs through ceiling)
      if (f < 2) {
        const pipeY = yBase + 3.0;
        const pipeGeo = new THREE.CylinderGeometry(0.12, 0.12, 9, 8);
        bld.add(this._mesh(pipeGeo, mepMat, [0, pipeY, 0], `MEP Pipe H L${f+1}`, 'MEP'));
        const pipeGeoZ = new THREE.CylinderGeometry(0.12, 0.12, 7, 8);
        const zPipe = new THREE.Mesh(pipeGeoZ, mepMat);
        zPipe.rotation.x = Math.PI / 2;
        zPipe.position.set(0, pipeY, 0);
        zPipe.userData = { bimType: 'MEP', name: `MEP Pipe Z L${f+1}` };
        bld.add(zPipe);
      }

      // Vertical risers (plumbing)
      if (f < 2) {
        const riserGeo = new THREE.CylinderGeometry(0.1, 0.1, 3.0, 8);
        bld.add(this._mesh(riserGeo, new THREE.MeshStandardMaterial({ color: 0x4488cc, roughness: 0.3, metalness: 0.5 }),
          [-3, yBase + 1.8, -2.5], `Plumbing Riser L${f+1}`, 'Plumbing'));
        bld.add(this._mesh(riserGeo, new THREE.MeshStandardMaterial({ color: 0x4488cc, roughness: 0.3, metalness: 0.5 }),
          [3, yBase + 1.8, -2.5], `Plumbing Riser L${f+1}b`, 'Plumbing'));
      }
    }

    // Roof
    const roof = this._mesh(new THREE.ConeGeometry(7, 1.8, 4), roofMat, [0, 9.8, 0], 'Roof', 'Architecture');
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    bld.add(roof);

    // Entrance
    bld.add(this._mesh(new THREE.BoxGeometry(2.2, 2.8, 0.3), steelMat, [0, 1.4, 4.05], 'Door Frame', 'Architecture'));
    bld.add(this._mesh(new THREE.BoxGeometry(1.8, 2.4, 0.15),
      new THREE.MeshStandardMaterial({ color: 0x3a2a1a, roughness: 0.5, metalness: 0.2 }),
      [0, 1.2, 4.05], 'Main Door', 'Architecture'));

    // Road
    bld.add(this._mesh(new THREE.PlaneGeometry(3, 10), new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.95 }),
      [0, 0.02, 9.5], 'Access Road', 'Infrastructure').rotateX(-Math.PI / 2) &&
      bld.children[bld.children.length - 1]);

    // Trees
    for (let i = 0; i < 6; i++) {
      const tx = -10 + Math.random() * 20;
      const tz = -10 + Math.random() * -4;
      if (tz > -5 || Math.abs(tx) < 4) continue;
      const tree = new THREE.Group();
      tree.add(this._meshN(new THREE.CylinderGeometry(0.15, 0.2, 2.5, 8),
        new THREE.MeshStandardMaterial({ color: 0x8B4513, roughness: 0.9 }), [0, 1.25, 0]));
      tree.add(this._meshN(new THREE.SphereGeometry(1.2, 8, 6),
        new THREE.MeshStandardMaterial({ color: 0x2d5a27, roughness: 0.8 }), [0, 2.8, 0]));
      tree.position.set(tx, 0, tz);
      tree.userData = { bimType: 'Landscape', name: `Tree ${i+1}` };
      bld.add(tree);
    }

    // Ground markers
    const mMat = new THREE.MeshStandardMaterial({ color: 0x0ea5e9, roughness: 0.2, metalness: 0.5, emissive: 0x0ea5e9, emissiveIntensity: 0.3 });
    for (const [x, z] of [[5, 5], [-5, 5], [5, -5], [-5, -5]]) {
      bld.add(this._mesh(new THREE.SphereGeometry(0.15, 8), mMat, [x, 0.04, z], 'Survey Marker', 'Survey'));
    }

    this.modelGroup.add(bld);
    this.demoModel = bld;
    this._indexBimElements(bld);
  }

  _mesh(geo, mat, pos, name, bimType) {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(...pos);
    m.userData = { bimType, name };
    m.castShadow = true;
    m.receiveShadow = true;
    this.bimElements.set(m.uuid, { name, type: bimType, bbox: new THREE.Box3().setFromObject(m) });
    return m;
  }

  _meshN(geo, mat, pos) {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(...pos);
    m.castShadow = true;
    return m;
  }

  _indexBimElements(group) {
    group.traverse(child => {
      if (child.isMesh && child.userData?.bimType) {
        child.userData.bbox = new THREE.Box3().setFromObject(child);
      }
    });
  }

  // ============ TOOLS ============
  setTool(tool) {
    this.currentTool = tool;
    this.controls.enabled = (tool === 'orbit' || tool === 'pan');
    if (tool !== 'measure') {
      this.clearMeasurements();
    }
    this.measureMode = (tool === 'measure');
  }

  toggleWireframe() {
    this.wireframeMode = !this.wireframeMode;
    this.modelGroup.traverse(child => {
      if (child.isMesh && child.material && !child.material.isLineBasicMaterial) {
        const mats = Array.isArray(child.material) ? child.material : [child.material];
        mats.forEach(m => { m.wireframe = this.wireframeMode; });
      }
    });
  }

  toggleXRay() {
    this.xrayMode = !this.xrayMode;
    this.modelGroup.traverse(child => {
      if (child.isMesh && child.material) {
        const mats = Array.isArray(child.material) ? child.material : [child.material];
        mats.forEach(m => {
          m.transparent = this.xrayMode;
          m.opacity = this.xrayMode ? 0.22 : (m.color?.getHex() === 0x87ceeb ? 0.5 : 1);
          m.depthWrite = !this.xrayMode;
        });
      }
    });
  }

  resetView() {
    this.camera.position.set(18, 12, 22);
    this.controls.target.set(0, 4, 0);
    this.controls.update();
  }

  setView(view) {
    const t = new THREE.Vector3(0, 4, 0);
    const positions = { top: [0, 25, 0.1], front: [0, 4, 25], right: [25, 4, 0], '3d': [18, 12, 22] };
    const p = positions[view] || [18, 12, 22];
    this.camera.position.set(...p);
    this.controls.target.copy(t);
    this.controls.update();
  }

  // ============ MEASUREMENT ============
  measureClick(event) {
    const intersect = this._raycastScene(event);
    if (!intersect) return;

    const pt = intersect.point.clone();
    this.measurePoints.push(pt);

    // Visual marker
    const dot = new THREE.Mesh(
      new THREE.SphereGeometry(0.15, 12),
      new THREE.MeshBasicMaterial({ color: 0x00ff88 })
    );
    dot.position.copy(pt);
    this.scene.add(dot);
    this.measureMarkers.push(dot);

    if (this.measurePoints.length >= 2) {
      this._finalizeMeasurement();
      this.measurePoints = [];
      this._clearPreview();
    }
  }

  updateMeasurePreview(event) {
    this._clearPreview();
    const intersect = this._raycastScene(event);
    if (!intersect) return;
    const last = this.measurePoints[this.measurePoints.length - 1];
    const previewLine = this._createLine(last, intersect.point, 0x00ff88, true);
    this.measureLines.push(previewLine);
  }

  _finalizeMeasurement() {
    const p1 = this.measurePoints[this.measurePoints.length - 2];
    const p2 = this.measurePoints[this.measurePoints.length - 1];
    const dist = p1.distanceTo(p2).toFixed(2);

    // Solid line
    this.measureLines.push(this._createLine(p1, p2, 0x00ff88, false));

    // Label
    const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
    mid.y += 0.4;
    const sprite = this._createLabel(`${dist}m`, mid, '#00ff88');
    this.scene.add(sprite);
    this.measureLabels.push(sprite);

    this.measurements.push({ from: p1.clone(), to: p2.clone(), distance: parseFloat(dist) });
  }

  _createLine(from, to, color, dashed) {
    const geo = new THREE.BufferGeometry().setFromPoints([from, to]);
    const mat = dashed
      ? new THREE.LineDashedMaterial({ color, dashSize: 0.4, gapSize: 0.2 })
      : new THREE.LineBasicMaterial({ color, linewidth: 2 });
    const line = new THREE.Line(geo, mat);
    if (dashed) line.computeLineDistances();
    this.scene.add(line);
    return line;
  }

  _createLabel(text, position, color) {
    const canvas = document.createElement('canvas');
    canvas.width = 256; canvas.height = 64;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#111827';
    ctx.fillRect(0, 0, 256, 64);
    ctx.fillStyle = color;
    ctx.font = 'bold 28px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(text, 128, 40);
    const tex = new THREE.CanvasTexture(canvas);
    tex.minFilter = THREE.LinearFilter;
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthTest: false, depthWrite: false }));
    sprite.position.copy(position);
    sprite.scale.set(3, 0.75, 1);
    return sprite;
  }

  clearMeasurements() {
    [...this.measureMarkers, ...this.measureLines, ...this.measureLabels].forEach(o => {
      this.scene.remove(o);
      if (o.geometry) o.geometry.dispose();
      if (o.material) o.material.dispose();
    });
    this.measureMarkers = [];
    this.measureLines = [];
    this.measureLabels = [];
    this.measurePoints = [];
    this.measurements = [];
  }

  _clearPreview() {
    if (this.measureLines.length > 0 && this.measurePoints.length === 1) {
      const preview = this.measureLines.pop();
      this.scene.remove(preview);
      preview.geometry.dispose();
      preview.material.dispose();
    }
  }

  _raycastScene(event) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1
    );
    this.raycaster.setFromCamera(mouse, this.camera);
    const targets = [];
    this.modelGroup.traverse(c => { if (c.isMesh) targets.push(c); });
    return this.raycaster.intersectObjects(targets, false)[0] || null;
  }

  // ============ CLASH DETECTION ============
  runClashDetection() {
    this.clearClashDisplay();
    this.clashResults = [];

    const meshes = [];
    this.modelGroup.traverse(c => {
      if (c.isMesh && c.userData?.bimType) meshes.push(c);
    });

    const tolerance = 0.15; // 15cm tolerance
    const pairsChecked = new Set();

    for (let i = 0; i < meshes.length; i++) {
      for (let j = i + 1; j < meshes.length; j++) {
        const a = meshes[i], b = meshes[j];
        const key = `${a.uuid}-${b.uuid}`;
        if (pairsChecked.has(key)) continue;
        pairsChecked.add(key);

        // Skip same-type unless intentional
        if (a.userData.bimType === b.userData.bimType) continue;

        const boxA = new THREE.Box3().setFromObject(a);
        const boxB = new THREE.Box3().setFromObject(b);

        // Expand boxes by tolerance
        boxA.expandByScalar(tolerance);
        boxB.expandByScalar(tolerance);

        if (boxA.intersectsBox(boxB)) {
          const intersection = new THREE.Box3();
          intersection.copy(boxA).intersect(boxB);
          const center = new THREE.Vector3();
          intersection.getCenter(center);

          const volume = this._boxVolume(intersection);
          const severity = volume > 2 ? 'Critical' : volume > 0.5 ? 'Warning' : 'Minor';

          this.clashResults.push({
            elementA: a.userData.name || 'Unknown',
            elementB: b.userData.name || 'Unknown',
            typeA: a.userData.bimType,
            typeB: b.userData.bimType,
            position: center.clone(),
            volume: volume.toFixed(3),
            severity,
          });

          // Visual sphere at clash
          const color = severity === 'Critical' ? 0xff0000 : severity === 'Warning' ? 0xff8800 : 0xffcc00;
          const sphere = new THREE.Mesh(
            new THREE.SphereGeometry(Math.max(0.3, Math.cbrt(volume) * 0.6), 12),
            new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.6, depthTest: true })
          );
          sphere.position.copy(center);
          sphere.userData = { isClash: true, severity };
          this.scene.add(sphere);
          this.clashSpheres.push(sphere);

          // Pulse animation
          this._pulseClash(sphere, severity);
        }
      }
    }

    return this.clashResults;
  }

  _boxVolume(box) {
    const size = new THREE.Vector3();
    box.getSize(size);
    return size.x * size.y * size.z;
  }

  _pulseClash(sphere, severity) {
    const speed = severity === 'Critical' ? 0.004 : 0.002;
    let s = 1;
    const animate = () => {
      if (!this.clashSpheres.includes(sphere)) return;
      s = 1 + Math.sin(Date.now() * speed) * 0.4;
      sphere.scale.setScalar(s);
      sphere.material.opacity = 0.4 + Math.abs(Math.sin(Date.now() * speed)) * 0.4;
      requestAnimationFrame(animate);
    };
    animate();
  }

  clearClashDisplay() {
    this.clashSpheres.forEach(s => {
      this.scene.remove(s);
      s.geometry?.dispose();
      s.material?.dispose();
    });
    this.clashSpheres = [];
    this.clashResults = [];
  }

  getClashReport() {
    return this.clashResults;
  }

  // ============ SECTION / CLIPPING PLANES ============
  toggleSectionCut(axis = 'x', position = 0, enabled = true) {
    this.clearSections();

    if (!enabled) {
      this.activeSection = false;
      this._applyClippingToAll([]);
      return;
    }

    this.activeSection = true;
    const planes = [];

    // Create two opposite planes for a slice effect
    const thickness = 0.8;
    const normal = axis === 'x' ? new THREE.Vector3(1, 0, 0)
      : axis === 'y' ? new THREE.Vector3(0, 1, 0)
      : new THREE.Vector3(0, 0, 1);

    // Plane 1: clip everything on one side
    const p1 = new THREE.Plane(normal.clone(), -(position - thickness));
    planes.push(p1);

    // Plane 2: clip everything on other side
    const p2 = new THREE.Plane(normal.clone().negate(), (position + thickness));
    planes.push(p2);

    // Visual helpers
    const helperSize = 12;
    for (const [offset, color] of [[-thickness, 0x0ea5e9], [thickness, 0x0ea5e9]]) {
      const planeGeo = new THREE.PlaneGeometry(helperSize, helperSize);
      const planeMat = new THREE.MeshBasicMaterial({
        color,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.15,
        depthWrite: false,
      });
      const helper = new THREE.Mesh(planeGeo, planeMat);
      helper.position.set(
        axis === 'x' ? position + offset : 0,
        axis === 'y' ? position + offset : 5,
        axis === 'z' ? position + offset : 0
      );
      if (axis === 'x') helper.rotation.y = Math.PI / 2;
      if (axis === 'z') helper.rotation.x = Math.PI / 2;
      // if axis is y, already correct (horizontal plane)
      this.scene.add(helper);
      this.clipPlaneHelpers.push(helper);
    }

    this._applyClippingToAll(planes);
  }

  _applyClippingToAll(planes) {
    this.modelGroup.traverse(child => {
      if (child.isMesh && child.material) {
        const mats = Array.isArray(child.material) ? child.material : [child.material];
        mats.forEach(m => {
          m.clippingPlanes = planes.length > 0 ? planes : null;
          m.clipShadows = true;
          m.needsUpdate = true;
        });
      }
    });
  }

  clearSections() {
    this.clipPlaneHelpers.forEach(h => {
      this.scene.remove(h);
      h.geometry?.dispose();
      h.material?.dispose();
    });
    this.clipPlaneHelpers = [];
    this.clipPlanes = [];
    this.activeSection = false;
    this._applyClippingToAll([]);
  }

  // ============ BIM ELEMENT PICKING ============
  pickElement(event) {
    const intersect = this._raycastScene(event);
    if (!intersect) {
      this.deselectElement();
      return;
    }
    const obj = intersect.object;
    if (obj.userData?.bimType) {
      this.selectElement(obj);
    } else {
      this.deselectElement();
    }
  }

  selectElement(obj) {
    this.deselectElement();
    this.selectedBimElement = obj;

    // Highlight wireframe
    const edgeGeo = new THREE.EdgesGeometry(obj.geometry);
    this.elementHighlight = new THREE.LineSegments(
      edgeGeo,
      new THREE.LineBasicMaterial({ color: 0x0ea5e9, linewidth: 2, depthTest: true })
    );
    this.elementHighlight.position.copy(obj.position);
    this.elementHighlight.rotation.copy(obj.rotation);
    this.elementHighlight.scale.copy(obj.scale);
    if (obj.parent) obj.parent.add(this.elementHighlight);

    // Fire event for UI
    this._fireBimEvent('elementSelected', {
      name: obj.userData.name,
      type: obj.userData.bimType,
      id: obj.uuid,
    });
  }

  deselectElement() {
    if (this.elementHighlight) {
      this.elementHighlight.parent?.remove(this.elementHighlight);
      this.elementHighlight.geometry?.dispose();
      this.elementHighlight.material?.dispose();
      this.elementHighlight = null;
    }
    this.selectedBimElement = null;
    this._fireBimEvent('elementDeselected', {});
  }

  _fireBimEvent(name, detail) {
    window.dispatchEvent(new CustomEvent(name, { detail }));
  }

  // ============ ANNOTATIONS ============
  addAnnotation() {
    const dir = new THREE.Vector3();
    this.camera.getWorldDirection(dir);
    const pos = this.camera.position.clone().add(dir.multiplyScalar(8));

    const marker = new THREE.Mesh(
      new THREE.SphereGeometry(0.2, 16),
      new THREE.MeshStandardMaterial({ color: 0xff4444, roughness: 0.2, metalness: 0.5, emissive: 0xff4444, emissiveIntensity: 0.6 })
    );
    marker.position.copy(pos);
    this.scene.add(marker);
    this.annotationMarkers.push(marker);

    let s = 1;
    const pulse = () => {
      if (!this.annotationMarkers.includes(marker)) return;
      s = 1 + Math.sin(Date.now() * 0.005) * 0.5;
      marker.scale.setScalar(s);
      requestAnimationFrame(pulse);
    };
    pulse();
  }

  clearAnnotations() {
    this.annotationMarkers.forEach(m => { this.scene.remove(m); m.geometry?.dispose(); m.material?.dispose(); });
    this.annotationMarkers = [];
  }

  // ============ IFC / BIM DATA ============
  async loadIFC(file) {
    // Deferred import of web-ifc
    try {
      const IFC = await import('https://unpkg.com/web-ifc@0.0.51/web-ifc-api.js');
      const ifcApi = new IFC.IfcAPI();
      await ifcApi.Init();

      const buffer = await file.arrayBuffer();
      const data = new Uint8Array(buffer);
      const modelID = ifcApi.OpenModel(data);

      // Parse basic data
      this.bimData = {
        fileName: file.name,
        modelID,
        elements: [],
      };

      // Collect element info
      ifcApi.StreamAllLines(modelID, (line) => {
        if (line.expressID && line.type) {
          this.bimData.elements.push({
            id: line.expressID,
            type: line.type,
            name: line.Name?.value || line.type,
          });
        }
      });

      return this.bimData;
    } catch (err) {
      console.warn('IFC parsing via web-ifc failed, loading geometric data as GLB...', err.message);
      return null;
    }
  }

  // ============ HELPERS ============
  getModelStats() {
    let vertices = 0, meshes = 0;
    const types = {};
    this.modelGroup.traverse(c => {
      if (c.isMesh) {
        meshes++;
        vertices += c.geometry?.attributes?.position?.count || 0;
        const t = c.userData?.bimType || 'Unknown';
        types[t] = (types[t] || 0) + 1;
      }
    });
    return { vertices, meshes, types };
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
    this.clearMeasurements();
    this.clearClashDisplay();
    this.clearSections();
    this.clearAnnotations();
    this.renderer.dispose();
    this.scene.traverse(c => {
      if (c.geometry) c.geometry.dispose();
      if (c.material) {
        (Array.isArray(c.material) ? c.material : [c.material]).forEach(m => m.dispose());
      }
    });
  }
}

export { Viewer3D };
