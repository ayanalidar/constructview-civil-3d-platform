// ==============================================
// ConstructView — Revit-Style Floor Plan Engine
// Wall-by-wall design, door/window on walls, floor levels
// Interior + exterior in one continuous model
// ==============================================

import * as THREE from 'three';

class FloorPlanEngine {
  constructor(scene, camera, renderer, controls) {
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;
    this.controls = controls;
    this.domElement = renderer.domElement;

    this.active = false;
    this.tool = 'wall'; // wall, door, window, select, delete
    this.currentFloor = 0; // 0 = ground, 1 = 1st, etc.
    this.floorHeight = 3.2;
    this.wallThickness = 0.2;
    this.wallHeight = 3.0;
    this.gridSnap = 0.5;
    this.showRoof = true;
    this.showUpperFloors = true;

    // Data stores
    this.floors = []; // floors[0] = { walls: [], doors: [], windows: [] }
    this.previewObjects = [];
    this.measureLabels = [];
    this.drawingPoints = [];
    this.selectedObject = null;
    this.isDragging = false;

    // Visual groups
    this.wallGroup = new THREE.Group();
    this.wallGroup.name = 'floorPlanWalls';
    this.scene.add(this.wallGroup);

    // Ground plane for raycasting
    this.drawPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    // Cursor
    this.cursorGeo = new THREE.RingGeometry(0.15, 0.25, 32);
    this.cursorGeo.rotateX(-Math.PI / 2);
    this.cursorPoint = new THREE.Mesh(this.cursorGeo,
      new THREE.MeshBasicMaterial({ color: 0x00ff88, side: THREE.DoubleSide, depthTest: false, depthWrite: false }));
    this.cursorPoint.position.y = 0.04;
    this.cursorPoint.visible = false;
    this.scene.add(this.cursorPoint);

    // Enhanced grid
    this.grid = new THREE.GridHelper(40, 80, 0x446688, 0x1e293b);
    this.grid.position.y = 0.03;
    this.grid.visible = false;
    this.scene.add(this.grid);

    this.initFloor(0);
    this.setupInteraction();
  }

  initFloor(level) {
    while (this.floors.length <= level) {
      this.floors.push({ walls: [], doors: [], windows: [], slab: null });
    }
  }

  // ============ TOGGLE ============
  toggle(on) {
    this.active = on;
    this.grid.visible = on;
    this.cursorPoint.visible = on;
    if (on) {
      this.controls.enabled = false;
      this.enterFloorPlanView();
    } else {
      this.controls.enabled = true;
      this.exitFloorPlanView();
    }
    this._fire('toggle', { active: on });
  }

  enterFloorPlanView() {
    const y = this.currentFloor * this.floorHeight + this.floorHeight * 0.05;
    this.camera.position.set(0, 30, 0.1);
    this.controls.target.set(0, y, 0);
    this.controls.enableRotate = false;
    this.controls.update();
    // Semi-transparent upper floors
    this.updateFloorVisibility();
  }

  exitFloorPlanView() {
    this.camera.position.set(16, 10, 18);
    this.controls.target.set(0, 4, 0);
    this.controls.enableRotate = true;
    this.controls.update();
    this.showAllFloors();
  }

  setTool(tool) {
    this.tool = tool;
    this.clearPreview();
    this.drawingPoints = [];
    this.selectedObject = null;
    this._fire('toolChanged', { tool });
  }

  setFloor(level) {
    this.currentFloor = level;
    this.initFloor(level);
    this.updateFloorVisibility();
    if (this.active) this.enterFloorPlanView();
    this._fire('floorChanged', { floor: level });
  }

  // ============ WALL DRAWING ============
  setupInteraction() {
    this.domElement.addEventListener('click', (e) => this._onClick(e));
    this.domElement.addEventListener('mousemove', (e) => this._onMove(e));
    document.addEventListener('keydown', (e) => this._onKey(e));
  }

  _onClick(event) {
    if (!this.active) return;
    const pt = this._getPoint(event);
    if (!pt) return;

    switch (this.tool) {
      case 'wall':
        this._addWallPoint(pt);
        break;
      case 'door':
        this._placeDoor(pt);
        break;
      case 'window':
        this._placeWindow(pt);
        break;
      case 'select':
        this._selectAt(pt);
        break;
      case 'delete':
        this._deleteAt(pt);
        break;
    }
  }

  _onMove(event) {
    if (!this.active) return;
    const pt = this._getPoint(event);
    if (!pt) return;
    this.cursorPoint.position.copy(pt);
    this.cursorPoint.position.y = 0.04;
    this.cursorPoint.visible = true;

    if (this.tool === 'wall' && this.drawingPoints.length === 1) {
      this._updateWallPreview(pt);
    }
    if (this.tool === 'wall' && this.drawingPoints.length > 0) {
      this._updateMeasurement(pt);
    }
  }

  _onKey(event) {
    if (!this.active) return;
    if (event.key === 'Escape') {
      this.clearPreview();
      this.drawingPoints = [];
      this.selectedObject = null;
    }
    if (event.key === 'Delete' && this.selectedObject) {
      this._deleteSelected();
    }
  }

  _getPoint(event) {
    const rect = this.domElement.getBoundingClientRect();
    this.mouse.set(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1
    );
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const target = new THREE.Vector3();
    const hit = this.raycaster.ray.intersectPlane(this.drawPlane, target);
    if (!hit) return null;
    if (this.gridSnap) {
      target.x = Math.round(target.x / this.gridSnap) * this.gridSnap;
      target.z = Math.round(target.z / this.gridSnap) * this.gridSnap;
    }
    target.y = this.currentFloor * this.floorHeight;
    return target;
  }

  // ============ WALL TOOL ============
  _addWallPoint(pt) {
    this.drawingPoints.push(pt.clone());
    if (this.drawingPoints.length >= 2) {
      this._createWall(this.drawingPoints[0], this.drawingPoints[1]);
      this.clearPreview();
      this.drawingPoints = [];
    }
  }

  _updateWallPreview(currentPt) {
    this._clearPreviewObjects();
    const last = this.drawingPoints[0];
    this._drawPreviewWall(last, currentPt);
  }

  _updateMeasurement(currentPt) {
    this.measureLabels.forEach(l => { this.scene.remove(l); l.material?.map?.dispose(); l.material?.dispose(); });
    this.measureLabels = [];
    const last = this.drawingPoints[this.drawingPoints.length - 1];
    const dist = last.distanceTo(currentPt);
    const mid = new THREE.Vector3().addVectors(last, currentPt).multiplyScalar(0.5);
    mid.y += 1.5;
    const label = this._makeLabel(`${dist.toFixed(2)}m`, mid, '#00ff88');
    this.scene.add(label);
    this.measureLabels.push(label);
  }

  _drawPreviewWall(p1, p2) {
    const len = p1.distanceTo(p2);
    if (len < 0.1) return;
    const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
    const angle = Math.atan2(p2.x - p1.x, p2.z - p1.z);
    const geo = new THREE.BoxGeometry(this.wallThickness, this.wallHeight, len);
    const mat = new THREE.MeshBasicMaterial({ color: 0x00ff88, transparent: true, opacity: 0.35, depthTest: true });
    const wall = new THREE.Mesh(geo, mat);
    wall.position.set(mid.x, mid.y + this.wallHeight / 2, mid.z);
    wall.rotation.y = angle;
    this.scene.add(wall);
    this.previewObjects.push(wall);
  }

  _createWall(p1, p2) {
    const len = p1.distanceTo(p2);
    if (len < 0.2) return;
    const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
    const angle = Math.atan2(p2.x - p1.x, p2.z - p1.z);
    const geo = new THREE.BoxGeometry(this.wallThickness, this.wallHeight, len);
    const mat = new THREE.MeshStandardMaterial({
      color: 0xe8e0d8, roughness: 0.4, metalness: 0.05
    });
    const wall = new THREE.Mesh(geo, mat);
    wall.position.set(mid.x, mid.y + this.wallHeight / 2, mid.z);
    wall.rotation.y = angle;
    wall.castShadow = true;
    wall.receiveShadow = true;
    wall.userData = {
      type: 'wall', floor: this.currentFloor,
      p1: p1.clone(), p2: p2.clone(),
      length: len, angle: angle, mid: mid.clone(),
    };
    this.wallGroup.add(wall);
    this.floors[this.currentFloor].walls.push(wall);
    this._fire('wallCreated', { floor: this.currentFloor, length: len.toFixed(2) });
  }

  // ============ DOOR TOOL ============
  _placeDoor(pt) {
    const wall = this._findWallAt(pt, this.currentFloor);
    if (!wall) return;

    const ud = wall.userData;
    const doorW = 1.0, doorH = 2.2;
    const doorGeo = new THREE.BoxGeometry(doorW, doorH, this.wallThickness + 0.05);
    const doorMat = new THREE.MeshStandardMaterial({ color: 0x3a2a1a, roughness: 0.5, metalness: 0.2 });
    const door = new THREE.Mesh(doorGeo, doorMat);
    door.position.copy(pt);
    door.position.y = ud.p1.y + doorH / 2;
    door.rotation.y = ud.angle;
    door.userData = { type: 'door', floor: this.currentFloor, parentWall: wall.uuid };
    this.wallGroup.add(door);
    this.floors[this.currentFloor].doors.push(door);

    // Cut out portion of wall visually (replace with transparent section)
    this._fire('doorPlaced', {});
  }

  // ============ WINDOW TOOL ============
  _placeWindow(pt) {
    const wall = this._findWallAt(pt, this.currentFloor);
    if (!wall) return;

    const ud = wall.userData;
    const winW = 1.2, winH = 1.4;
    const winGeo = new THREE.BoxGeometry(winW, winH, this.wallThickness + 0.05);
    const winMat = new THREE.MeshStandardMaterial({
      color: 0x87ceeb, roughness: 0.1, metalness: 0.3,
      transparent: true, opacity: 0.5
    });
    const win = new THREE.Mesh(winGeo, winMat);
    win.position.copy(pt);
    win.position.y = ud.p1.y + this.wallHeight * 0.55;
    win.rotation.y = ud.angle;
    win.userData = { type: 'window', floor: this.currentFloor, parentWall: wall.uuid };
    this.wallGroup.add(win);
    this.floors[this.currentFloor].windows.push(win);
    this._fire('windowPlaced', {});
  }

  // ============ SELECT / DELETE ============
  _selectAt(pt) {
    this.selectedObject = null;
    const hits = this._raycastFloorObjects(pt);
    if (hits.length > 0) {
      this.selectedObject = hits[0].object;
      this._highlightSelected();
      this._fire('objectSelected', {
        type: this.selectedObject.userData?.type || 'unknown'
      });
    }
  }

  _deleteAt(pt) {
    const hits = this._raycastFloorObjects(pt);
    if (hits.length > 0) {
      const obj = hits[0].object;
      this._removeObject(obj);
      this._fire('objectDeleted', {});
    }
  }

  _deleteSelected() {
    if (this.selectedObject) {
      this._removeObject(this.selectedObject);
      this.selectedObject = null;
    }
  }

  _removeObject(obj) {
    const ud = obj.userData;
    if (!ud) return;
    const f = this.floors[ud.floor];
    if (!f) return;
    const type = ud.type;
    const arr = f[type + 's'];
    if (arr) {
      const idx = arr.indexOf(obj);
      if (idx >= 0) arr.splice(idx, 1);
    }
    this.wallGroup.remove(obj);
    if (obj.geometry) obj.geometry.dispose();
    if (obj.material) obj.material.dispose();
  }

  _raycastFloorObjects(pt) {
    const floor = this.floors[this.currentFloor];
    const targets = [...floor.walls, ...floor.doors, ...floor.windows];
    this.raycaster.set(new THREE.Raycaster(
      new THREE.Vector3(pt.x, 50, pt.z),
      new THREE.Vector3(0, -1, 0)
    ));
    return this.raycaster.intersectObjects(targets, false);
  }

  _findWallAt(pt, floorIdx) {
    const floor = this.floors[floorIdx];
    this.raycaster.set(new THREE.Raycaster(
      new THREE.Vector3(pt.x, pt.y + 10, pt.z),
      new THREE.Vector3(0, -1, 0)
    ));
    const hits = this.raycaster.intersectObjects(floor.walls, false);
    return hits.length > 0 ? hits[0].object : null;
  }

  _highlightSelected() {
    // Reset all highlights
    this.wallGroup.traverse(c => {
      if (c.userData?._highlighted) {
        c.material.emissive?.setHex(0x000000);
        c.material.emissiveIntensity = 0;
        c.userData._highlighted = false;
      }
    });
    if (this.selectedObject) {
      const m = this.selectedObject.material;
      if (m.emissive) {
        m.emissive.setHex(0x0ea5e9);
        m.emissiveIntensity = 0.3;
      }
      this.selectedObject.userData._highlighted = true;
    }
  }

  // ============ FLOOR VISIBILITY ============
  updateFloorVisibility() {
    this.wallGroup.traverse(c => {
      if (c.userData?.floor !== undefined) {
        if (c.userData.floor === this.currentFloor) {
          c.visible = true;
          if (c.material.transparent !== undefined) {
            c.material.transparent = false;
            c.material.opacity = 1;
          }
        } else if (!this.showUpperFloors && c.userData.floor > this.currentFloor) {
          c.visible = false;
        } else {
          c.visible = true;
          if (c.material.transparent !== undefined) {
            c.material.transparent = true;
            c.material.opacity = 0.3;
          }
        }
      }
    });
  }

  showAllFloors() {
    this.wallGroup.traverse(c => {
      if (c.userData?.floor !== undefined) {
        c.visible = true;
        if (c.material.transparent !== undefined && c.userData.type !== 'window') {
          c.material.transparent = false;
          c.material.opacity = 1;
        }
      }
    });
  }

  // ============ SLAB GENERATION ============
  generateSlabs() {
    // Remove old slabs
    this.floors.forEach(f => {
      if (f.slab) { this.scene.remove(f.slab); f.slab = null; }
    });

    for (let i = 0; i < this.floors.length; i++) {
      const f = this.floors[i];
      if (f.walls.length === 0) continue;
      // Calculate bounding box from walls
      let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
      f.walls.forEach(w => {
        const ud = w.userData;
        [ud.p1, ud.p2].forEach(p => {
          minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x);
          minZ = Math.min(minZ, p.z); maxZ = Math.max(maxZ, p.z);
        });
      });
      const pad = 0.3;
      const w = maxX - minX + pad * 2, d = maxZ - minZ + pad * 2;
      const cx = (minX + maxX) / 2, cz = (minZ + maxZ) / 2;
      const y = i * this.floorHeight;

      const slabGeo = new THREE.BoxGeometry(w + 0.4, 0.2, d + 0.4);
      const slabMat = new THREE.MeshStandardMaterial({ color: 0xd0c8c0, roughness: 0.5, metalness: 0.1 });
      const slab = new THREE.Mesh(slabGeo, slabMat);
      slab.position.set(cx, y + 0.1, cz);
      slab.receiveShadow = true;
      slab.userData = { type: 'slab', floor: i };
      this.scene.add(slab);
      f.slab = slab;
    }
    this._fire('slabsGenerated', {});
  }

  // ============ PREVIEW HELPERS ============
  _clearPreviewObjects() {
    this.previewObjects.forEach(o => {
      this.scene.remove(o);
      o.geometry?.dispose();
      o.material?.dispose();
    });
    this.previewObjects = [];
  }

  _makeLabel(text, pos, color) {
    const canvas = document.createElement('canvas');
    canvas.width = 256; canvas.height = 48;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.beginPath();
    ctx.moveTo(28, 8); ctx.lineTo(228, 8);
    ctx.quadraticCurveTo(236, 8, 236, 16);
    ctx.lineTo(236, 32);
    ctx.quadraticCurveTo(236, 40, 228, 40);
    ctx.lineTo(28, 40);
    ctx.quadraticCurveTo(20, 40, 20, 32);
    ctx.lineTo(20, 16);
    ctx.quadraticCurveTo(20, 8, 28, 8);
    ctx.fill();
    ctx.fillStyle = color;
    ctx.font = 'bold 24px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(text, 128, 34);
    const tex = new THREE.CanvasTexture(canvas);
    tex.minFilter = THREE.LinearFilter;
    const mat = new THREE.SpriteMaterial({ map: tex, depthTest: false, depthWrite: false });
    const sprite = new THREE.Sprite(mat);
    sprite.position.copy(pos);
    sprite.scale.set(3, 0.56, 1);
    return sprite;
  }

  clearPreview() {
    this._clearPreviewObjects();
    this.measureLabels.forEach(l => {
      this.scene.remove(l);
      l.material?.map?.dispose();
      l.material?.dispose();
    });
    this.measureLabels = [];
    if (this.cursorPoint) this.cursorPoint.visible = false;
  }

  // ============ CLEANUP ============
  clearAll() {
    this.wallGroup.traverse(c => {
      if (c.geometry && c !== this.wallGroup) c.geometry.dispose();
      if (c.material) {
        const mats = Array.isArray(c.material) ? c.material : [c.material];
        mats.forEach(m => m.dispose());
      }
    });
    while (this.wallGroup.children.length > 0) {
      this.wallGroup.remove(this.wallGroup.children[0]);
    }
    this.floors = [];
    this.initFloor(0);
    // Remove slabs
    this.scene.children.forEach(c => {
      if (c.userData?.type === 'slab') { this.scene.remove(c); c.geometry?.dispose(); c.material?.dispose(); }
    });
    this._fire('cleared', {});
  }

  _fire(name, detail) {
    window.dispatchEvent(new CustomEvent('floorplan_' + name, { detail }));
  }

  getStats() {
    let wallCount = 0, doorCount = 0, windowCount = 0;
    this.floors.forEach(f => {
      wallCount += f.walls.length;
      doorCount += f.doors.length;
      windowCount += f.windows.length;
    });
    return { floors: this.floors.length, walls: wallCount, doors: doorCount, windows: windowCount };
  }

  dispose() {
    this.clearAll();
    this.scene.remove(this.grid);
    this.scene.remove(this.cursorPoint);
    this.scene.remove(this.wallGroup);
  }
}

export { FloorPlanEngine };
