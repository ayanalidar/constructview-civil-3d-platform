// ==============================================
// ConstructView — Revit-Style Floor Plan Engine v2
// Architect-grade: ortho snap, endpoint/midpoint magnets,
// staircases, columns, dimensions, undo, room detection
// ==============================================

import * as THREE from 'three';

const SNAP_THRESHOLD = 0.6;
const ORTHO_ANGLES = [0, Math.PI / 4, Math.PI / 2, Math.PI * 3 / 4, Math.PI, -Math.PI * 3 / 4, -Math.PI / 2, -Math.PI / 4];
const COLORS = {
  wallPreview: 0x00ff88,
  wall: 0xe8e0d8,
  door: 0x3a2a1a,
  window: 0x87ceeb,
  column: 0xc0b8b0,
  stair: 0x8b8682,
  dimension: 0xff6b35,
  selected: 0x0ea5e9,
  snapPoint: 0xffdd44,
  roomLabel: 0x10b981,
  cursor: 0x00ff88,
};

class FloorPlanEngine {
  constructor(scene, camera, renderer, controls) {
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;
    this.controls = controls;
    this.domElement = renderer.domElement;

    this.active = false;
    this.tool = 'wall';
    this.currentFloor = 0;
    this.floorHeight = 3.2;
    this.wallThickness = 0.2;
    this.wallHeight = 3.0;
    this.gridSnap = 0.5;
    this.angleSnap = false; // ortho lock
    this.showSnapPoints = true;
    this.showUpperFloors = true;

    // Data
    this.floors = [];
    this.undoStack = [];
    this.previewObjects = [];
    this.measureLabels = [];
    this.drawingPoints = [];
    this.selectedObject = null;
    this.snapMarkers = [];

    // Visual groups
    this.wallGroup = new THREE.Group();
    this.wallGroup.name = 'floorPlanWalls';
    this.scene.add(this.wallGroup);

    this.annotationGroup = new THREE.Group();
    this.annotationGroup.name = 'floorPlanAnnotations';
    this.scene.add(this.annotationGroup);

    // Raycasting
    this.drawPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.lastRawPoint = null;

    // Cursor ring
    this.cursorGeo = new THREE.RingGeometry(0.15, 0.25, 32);
    this.cursorGeo.rotateX(-Math.PI / 2);
    this.cursorPoint = new THREE.Mesh(this.cursorGeo,
      new THREE.MeshBasicMaterial({ color: COLORS.cursor, side: THREE.DoubleSide, depthTest: false, depthWrite: false }));
    this.cursorPoint.position.y = 0.04;
    this.cursorPoint.visible = false;
    this.scene.add(this.cursorPoint);

    // Grid
    this.grid = new THREE.GridHelper(40, 80, 0x446688, 0x1e293b);
    this.grid.position.y = 0.03;
    this.grid.visible = false;
    this.scene.add(this.grid);

    this.initFloor(0);
    this.setupInteraction();
  }

  initFloor(level) {
    while (this.floors.length <= level) {
      this.floors.push({ walls: [], doors: [], windows: [], columns: [], stairs: [], dimensions: [] });
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
      this.clearPreview();
      this.drawingPoints = [];
    }
    this._fire('toggle', { active: on });
  }

  enterFloorPlanView() {
    const y = this.currentFloor * this.floorHeight + this.floorHeight * 0.05;
    this.camera.position.set(0, 30, 0.1);
    this.controls.target.set(0, y, 0);
    this.controls.enableRotate = false;
    this.controls.update();
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
    const prev = this.tool;
    this.tool = tool;
    this.clearPreview();
    this.drawingPoints = [];
    this.selectedObject = null;
    this._highlightSelected();
    this._fire('toolChanged', { tool, previous: prev });
  }

  setFloor(level) {
    this.currentFloor = level;
    this.initFloor(level);
    this.updateFloorVisibility();
    if (this.active) this.enterFloorPlanView();
    this._fire('floorChanged', { floor: level });
  }

  // ============ SNAP SYSTEM ============
  _gatherSnapPoints() {
    const points = [];
    const floor = this.floors[this.currentFloor];
    if (!floor) return points;
    const baseY = this.currentFloor * this.floorHeight;

    // Wall endpoints & midpoints
    for (const w of floor.walls) {
      const ud = w.userData;
      if (!ud || ud.type !== 'wall') continue;
      const p1 = new THREE.Vector3(ud.p1.x, baseY, ud.p1.z);
      const p2 = new THREE.Vector3(ud.p2.x, baseY, ud.p2.z);
      points.push({ point: p1, type: 'endpoint' });
      points.push({ point: p2, type: 'endpoint' });
      points.push({ point: new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5), type: 'midpoint' });

      // Perpendicular projection from midpoint (for offset walls)
      const dir = new THREE.Vector3(p2.x - p1.x, 0, p2.z - p1.z).normalize();
      const perp = new THREE.Vector3(-dir.z, 0, dir.x);
      const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
      points.push({ point: new THREE.Vector3(mid.x + perp.x, baseY, mid.z + perp.z), type: 'perpendicular' });
      points.push({ point: new THREE.Vector3(mid.x - perp.x, baseY, mid.z - perp.z), type: 'perpendicular' });
    }

    // Columns
    for (const col of floor.columns) {
      points.push({ point: new THREE.Vector3(col.position.x, baseY, col.position.z), type: 'column' });
    }

    return points;
  }

  _findNearestSnap(rawPoint) {
    const snaps = this._gatherSnapPoints();
    let best = null, bestDist = SNAP_THRESHOLD;
    for (const s of snaps) {
      const d = rawPoint.distanceTo(s.point);
      if (d < bestDist) { bestDist = d; best = s; }
    }
    return best;
  }

  _showSnapMarker(pos, type) {
    this._clearSnapMarkers();
    if (!this.showSnapPoints) return;
    const color = type === 'midpoint' ? 0xffdd44 : type === 'endpoint' ? 0x0ea5e9 : 0xff6b35;
    const geo = type === 'midpoint'
      ? new THREE.RingGeometry(0.12, 0.2, 4)
      : new THREE.CircleGeometry(0.18, 6);
    geo.rotateX(-Math.PI / 2);
    const mat = new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide, depthTest: false, depthWrite: false });
    const marker = new THREE.Mesh(geo, mat);
    marker.position.copy(pos);
    marker.position.y += 0.05;
    this.scene.add(marker);
    this.snapMarkers.push(marker);
  }

  _clearSnapMarkers() {
    this.snapMarkers.forEach(m => { this.scene.remove(m); m.geometry?.dispose(); m.material?.dispose(); });
    this.snapMarkers = [];
  }

  _orthoSnap(angle) {
    if (!this.angleSnap && this.drawingPoints.length < 1) return angle;
    let best = null, bestDiff = Infinity;
    for (const a of ORTHO_ANGLES) {
      let diff = Math.abs(angle - a);
      diff = Math.min(diff, Math.abs(angle - a - Math.PI * 2));
      diff = Math.min(diff, Math.abs(angle - a + Math.PI * 2));
      if (diff < bestDiff) { bestDiff = diff; best = a; }
    }
    // Snap if within ~11° (0.2 rad)
    return bestDiff < 0.2 ? best : angle;
  }

  // ============ INTERACTION ============
  setupInteraction() {
    this.domElement.addEventListener('click', (e) => this._onClick(e));
    this.domElement.addEventListener('mousemove', (e) => this._onMove(e));
    document.addEventListener('keydown', (e) => this._onKey(e));
    document.addEventListener('keyup', (e) => {
      if (e.key === 'Shift') { this.angleSnap = false; this._fire('orthoChanged', { active: false }); }
    });
  }

  _onClick(event) {
    if (!this.active) return;
    const pt = this._getSnappedPoint(event);
    if (!pt) return;

    this._pushUndo();

    switch (this.tool) {
      case 'wall': this._addWallPoint(pt); break;
      case 'door': this._placeDoor(pt); break;
      case 'window': this._placeWindow(pt); break;
      case 'staircase': this._addStairPoint(pt); break;
      case 'column': this._placeColumn(pt); break;
      case 'dimension': this._addDimPoint(pt); break;
      case 'select': this._selectAt(pt); break;
      case 'delete': this._deleteAt(pt); break;
    }
  }

  _onMove(event) {
    if (!this.active) return;
    const raw = this._getPoint(event, false);
    if (!raw) return;
    this.lastRawPoint = raw;

    // Snap
    const snap = this.showSnapPoints ? this._findNearestSnap(raw) : null;
    const pt = snap ? snap.point : this._gridSnapPoint(raw);
    this.cursorPoint.position.copy(pt);
    this.cursorPoint.position.y = (this.currentFloor * this.floorHeight) + 0.05;
    this.cursorPoint.visible = true;

    if (snap) this._showSnapMarker(snap.point, snap.type);
    else this._clearSnapMarkers();

    // Preview
    if (this.tool === 'wall' && this.drawingPoints.length === 1) this._updateWallPreview(pt);
    if ((this.tool === 'wall' || this.tool === 'staircase') && this.drawingPoints.length >= 1) this._updateMeasurement(pt, false);
    if (this.tool === 'dimension' && this.drawingPoints.length >= 1 && this.drawingPoints.length < 3) this._updateMeasurement(pt, true);
  }

  _onKey(event) {
    if (!this.active) return;
    const key = event.key;

    if (key === 'Escape') {
      this.clearPreview();
      this.drawingPoints = [];
      this.selectedObject = null;
      this._highlightSelected();
      this._fire('selectionCleared', {});
      return;
    }

    if (key === 'Delete' && this.selectedObject) {
      this._pushUndo();
      this._deleteSelected();
      return;
    }

    if (event.ctrlKey && key === 'z') {
      event.preventDefault();
      this._undo();
      return;
    }

    if (key === 'Shift') {
      this.angleSnap = true;
      this._fire('orthoChanged', { active: true });
      // Recompute preview with ortho
      if (this.tool === 'wall' && this.drawingPoints.length === 1 && this.lastRawPoint) {
        const from = this.drawingPoints[0];
        const raw = this.lastRawPoint;
        let angle = Math.atan2(raw.x - from.x, raw.z - from.z);
        const snapped = this._orthoSnap(angle);
        if (snapped !== angle) {
          const dist = from.distanceTo(raw);
          const pt = new THREE.Vector3(
            from.x + Math.sin(snapped) * dist,
            from.y,
            from.z + Math.cos(snapped) * dist
          );
          this._updateWallPreview(this._gridSnapPoint(pt));
        }
      }
      return;
    }

    // Number keys for quick tool switch
    const tools = ['wall', 'door', 'window', 'staircase', 'column', 'dimension', 'select', 'delete'];
    const idx = parseInt(key) - 1;
    if (idx >= 0 && idx < tools.length) {
      this.setTool(tools[idx]);
      // Update UI chips
      document.querySelectorAll('#fpToolChips .chip').forEach((c, i) => {
        c.classList.toggle('active', i === idx);
      });
    }
  }

  // ============ POINT MATH ============
  _getPoint(event, applySnap = true) {
    const rect = this.domElement.getBoundingClientRect();
    this.mouse.set(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1
    );
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const target = new THREE.Vector3();
    const hit = this.raycaster.ray.intersectPlane(this.drawPlane, target);
    if (!hit) return null;
    target.y = this.currentFloor * this.floorHeight;
    return applySnap ? this._gridSnapPoint(target) : target;
  }

  _getSnappedPoint(event) {
    const raw = this._getPoint(event, false);
    if (!raw) return null;
    const snap = this.showSnapPoints ? this._findNearestSnap(raw) : null;
    return snap ? snap.point.clone() : this._gridSnapPoint(raw);
  }

  _gridSnapPoint(pt) {
    if (this.gridSnap) {
      pt.x = Math.round(pt.x / this.gridSnap) * this.gridSnap;
      pt.z = Math.round(pt.z / this.gridSnap) * this.gridSnap;
    }
    return pt.clone();
  }

  // ============ WALL TOOL ============
  _addWallPoint(pt) {
    this.drawingPoints.push(pt.clone());
    if (this.drawingPoints.length >= 2) {
      let p1 = this.drawingPoints[0], p2 = this.drawingPoints[1];

      // Apply ortho snap if active
      if (this.angleSnap) {
        let angle = Math.atan2(p2.x - p1.x, p2.z - p1.z);
        angle = this._orthoSnap(angle);
        const dist = p1.distanceTo(p2);
        p2 = new THREE.Vector3(
          p1.x + Math.sin(angle) * dist,
          p1.y,
          p1.z + Math.cos(angle) * dist
        );
        p2 = this._gridSnapPoint(p2);
      }

      this._createWall(p1, p2);
      this.clearPreview();
      this.drawingPoints = [];
    }
  }

  _updateWallPreview(currentPt) {
    this._clearPreviewObjects();
    const last = this.drawingPoints[0];
    this._drawPreviewWall(last, currentPt, COLORS.wallPreview);
  }

  _drawPreviewWall(p1, p2, color) {
    const len = p1.distanceTo(p2);
    if (len < 0.1) return;
    const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
    const angle = Math.atan2(p2.x - p1.x, p2.z - p1.z);
    const geo = new THREE.BoxGeometry(this.wallThickness, this.wallHeight, len);
    const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.35, depthTest: true });
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
    const mat = new THREE.MeshStandardMaterial({ color: COLORS.wall, roughness: 0.4, metalness: 0.05 });
    const wall = new THREE.Mesh(geo, mat);
    wall.position.set(mid.x, mid.y + this.wallHeight / 2, mid.z);
    wall.rotation.y = angle;
    wall.castShadow = true;
    wall.receiveShadow = true;
    wall.userData = { type: 'wall', floor: this.currentFloor, p1: p1.clone(), p2: p2.clone(), length: len, angle, mid: mid.clone() };
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
    const doorMat = new THREE.MeshStandardMaterial({ color: COLORS.door, roughness: 0.5, metalness: 0.2 });
    const door = new THREE.Mesh(doorGeo, doorMat);
    door.position.copy(pt);
    door.position.y = ud.p1.y + doorH / 2;
    door.rotation.y = ud.angle + Math.PI / 2;
    door.userData = { type: 'door', floor: this.currentFloor, parentWall: wall.uuid, position: pt.clone() };
    this.wallGroup.add(door);
    this.floors[this.currentFloor].doors.push(door);
    this._fire('doorPlaced', {});
  }

  // ============ WINDOW TOOL ============
  _placeWindow(pt) {
    const wall = this._findWallAt(pt, this.currentFloor);
    if (!wall) return;
    const ud = wall.userData;
    const winW = 1.2, winH = 1.4;
    const winGeo = new THREE.BoxGeometry(winW, winH, this.wallThickness + 0.05);
    const winMat = new THREE.MeshStandardMaterial({ color: COLORS.window, roughness: 0.1, metalness: 0.3, transparent: true, opacity: 0.5 });
    const win = new THREE.Mesh(winGeo, winMat);
    win.position.copy(pt);
    win.position.y = ud.p1.y + this.wallHeight * 0.55;
    win.rotation.y = ud.angle + Math.PI / 2;
    win.userData = { type: 'window', floor: this.currentFloor, parentWall: wall.uuid, position: pt.clone() };
    this.wallGroup.add(win);
    this.floors[this.currentFloor].windows.push(win);
    this._fire('windowPlaced', {});
  }

  // ============ STAIRCASE TOOL ============
  _addStairPoint(pt) {
    this.drawingPoints.push(pt.clone());
    if (this.drawingPoints.length >= 2) {
      this._createStaircase(this.drawingPoints[0], this.drawingPoints[1]);
      this.clearPreview();
      this.drawingPoints = [];
    }
  }

  _createStaircase(p1, p2) {
    const baseY = this.currentFloor * this.floorHeight;
    const vec = new THREE.Vector3().subVectors(p2, p1);
    const totalRun = vec.length();
    const angle = Math.atan2(vec.x, vec.z);
    const stairWidth = 1.0;
    const nSteps = Math.max(4, Math.round(totalRun / 0.28)); // ~28cm per step
    const stepDepth = totalRun / nSteps;
    const riserHeight = this.floorHeight / nSteps;
    const stepThick = 0.05;
    const stepColor = COLORS.stair;

    const group = new THREE.Group();
    group.name = 'staircase';

    for (let i = 0; i < nSteps; i++) {
      const geo = new THREE.BoxGeometry(stairWidth, stepThick, stepDepth);
      const mat = new THREE.MeshStandardMaterial({ color: stepColor, roughness: 0.5, metalness: 0.1 });
      const step = new THREE.Mesh(geo, mat);
      const prog = (i + 0.5) / nSteps;
      step.position.set(
        p1.x + vec.x * prog,
        baseY + riserHeight * (i + 0.5),
        p1.z + vec.z * prog
      );
      step.rotation.y = angle;
      step.receiveShadow = true;
      group.add(step);
    }

    // Railings
    const railGeo = new THREE.BoxGeometry(0.05, 0.9, totalRun + 0.3);
    const railMat = new THREE.MeshStandardMaterial({ color: COLORS.stair, roughness: 0.6, metalness: 0.3 });
    const r1 = new THREE.Mesh(railGeo, railMat);
    r1.position.set(p1.x + vec.x * 0.5, baseY + 0.45, p1.z + vec.z * 0.5);
    r1.position.x += Math.cos(angle) * stairWidth / 2;
    r1.position.z -= Math.sin(angle) * stairWidth / 2;
    r1.rotation.y = angle;
    group.add(r1);

    const r2 = new THREE.Mesh(railGeo.clone(), railMat);
    r2.position.set(p1.x + vec.x * 0.5, baseY + 0.45, p1.z + vec.z * 0.5);
    r2.position.x -= Math.cos(angle) * stairWidth / 2;
    r2.position.z += Math.sin(angle) * stairWidth / 2;
    r2.rotation.y = angle;
    group.add(r2);

    // Newel posts
    for (const endPos of [p1, p2]) {
      const postGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.0, 8);
      const postMat = new THREE.MeshStandardMaterial({ color: COLORS.stair, roughness: 0.6, metalness: 0.3 });
      const post = new THREE.Mesh(postGeo, postMat);
      post.position.copy(endPos);
      post.position.y = baseY + 0.5;
      group.add(post);
    }

    group.userData = { type: 'staircase', floor: this.currentFloor, p1: p1.clone(), p2: p2.clone(), steps: nSteps };
    this.wallGroup.add(group);
    this.floors[this.currentFloor].stairs.push(group);
    this._fire('staircaseCreated', { floor: this.currentFloor, steps: nSteps });
  }

  // ============ COLUMN TOOL ============
  _placeColumn(pt) {
    const baseY = this.currentFloor * this.floorHeight;
    const size = 0.3;
    const colGeo = new THREE.BoxGeometry(size, this.wallHeight, size);
    const colMat = new THREE.MeshStandardMaterial({ color: COLORS.column, roughness: 0.3, metalness: 0.4 });
    const column = new THREE.Mesh(colGeo, colMat);
    column.position.set(pt.x, baseY + this.wallHeight / 2, pt.z);
    column.castShadow = true;
    column.receiveShadow = true;
    column.userData = { type: 'column', floor: this.currentFloor, position: pt.clone(), size };
    this.wallGroup.add(column);
    this.floors[this.currentFloor].columns.push(column);
    this._fire('columnPlaced', {});
  }

  // ============ DIMENSION TOOL ============
  _addDimPoint(pt) {
    this.drawingPoints.push(pt.clone());
    if (this.drawingPoints.length >= 3) {
      this._createDimension(this.drawingPoints[0], this.drawingPoints[1], this.drawingPoints[2]);
      this.clearPreview();
      this.drawingPoints = [];
    }
  }

  _createDimension(p1, p2, textPos) {
    const dist = p1.distanceTo(p2);
    const baseY = this.currentFloor * this.floorHeight;
    const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);

    // Line
    const lineGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(p1.x, baseY + 0.08, p1.z),
      new THREE.Vector3(p2.x, baseY + 0.08, p2.z),
    ]);
    const line = new THREE.Line(lineGeo, new THREE.LineBasicMaterial({ color: COLORS.dimension, linewidth: 1 }));
    line.userData = { type: 'dimension', floor: this.currentFloor };
    this.annotationGroup.add(line);
    this.floors[this.currentFloor].dimensions.push(line);

    // Tick marks
    for (const p of [p1, p2]) {
      const tickGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(p.x, baseY + 0.03, p.z),
        new THREE.Vector3(p.x, baseY + 0.13, p.z),
      ]);
      const tick = new THREE.Line(tickGeo, new THREE.LineBasicMaterial({ color: COLORS.dimension }));
      this.annotationGroup.add(tick);
      this.floors[this.currentFloor].dimensions.push(tick);
    }

    // Label
    const label = this._makeLabel(dist.toFixed(2) + 'm', new THREE.Vector3(mid.x, baseY + this.wallHeight * 0.02, mid.z), '#' + COLORS.dimension.toString(16).padStart(6, '0'), 0xffffee);
    label.userData = { type: 'dimensionLabel', floor: this.currentFloor };
    this.annotationGroup.add(label);
    this.floors[this.currentFloor].dimensions.push(label);
    this._fire('dimensionCreated', { distance: dist.toFixed(2) });
  }

  _updateMeasurement(currentPt, isDimension) {
    this.measureLabels.forEach(l => {
      this.scene.remove(l);
      l.material?.map?.dispose();
      l.material?.dispose();
      if (l.userData?.labelSprite) {
        this.scene.remove(l.userData.labelSprite);
        l.userData.labelSprite.material?.map?.dispose();
        l.userData.labelSprite.material?.dispose();
      }
    });
    this.measureLabels = [];

    if (this.drawingPoints.length === 0) return;

    const last = this.drawingPoints[this.drawingPoints.length - 1];
    const dist = last.distanceTo(currentPt);
    const mid = new THREE.Vector3().addVectors(last, currentPt).multiplyScalar(0.5);
    mid.y += this.wallHeight * 0.3;

    const colorStr = isDimension ? '#ff6b35' : '#00ff88';
    const text = isDimension ? dist.toFixed(2) + 'm' : dist.toFixed(2) + 'm';
    const label = this._makeLabel(text, mid, colorStr, 0x000000);
    this.scene.add(label);
    this.measureLabels.push(label);

    // Dashed preview line
    const lineGeo = new THREE.BufferGeometry().setFromPoints([last.clone(), currentPt.clone()]);
    const line = new THREE.Line(lineGeo,
      new THREE.LineDashedMaterial({ color: isDimension ? 0xff6b35 : 0x00ff88, dashSize: 0.3, gapSize: 0.2 }));
    line.computeLineDistances();
    this.scene.add(line);
    this.measureLabels.push(line);
  }

  // ============ SELECT / DELETE ============
  _selectAt(pt) {
    this.selectedObject = null;
    const hits = this._raycastFloorObjects(pt);
    if (hits.length > 0) {
      this.selectedObject = hits[0].object;
      this._highlightSelected();
      this._fire('objectSelected', { type: this.selectedObject.userData?.type || 'unknown', steps: this.selectedObject.userData?.steps || 0 });
    } else {
      this._fire('selectionCleared', {});
    }
    this._highlightSelected();
  }

  _deleteAt(pt) {
    const hits = this._raycastFloorObjects(pt);
    if (hits.length > 0) this._removeObject(hits[0].object);
  }

  _deleteSelected() {
    if (this.selectedObject) { this._removeObject(this.selectedObject); this.selectedObject = null; }
  }

  _removeObject(obj) {
    const ud = obj.userData;
    if (!ud) return;
    const f = this.floors[ud.floor];
    if (!f) return;

    // Remove from appropriate array
    const map = { wall: 'walls', door: 'doors', window: 'windows', column: 'columns' };
    const arrName = map[ud.type];
    if (arrName && f[arrName]) {
      const idx = f[arrName].indexOf(obj);
      if (idx >= 0) f[arrName].splice(idx, 1);
    }

    // Staircase: remove entire group
    if (ud.type === 'staircase') {
      const idx = f.stairs.indexOf(obj);
      if (idx >= 0) f.stairs.splice(idx, 1);
      if (obj.traverse) {
        obj.traverse(c => { if (c.geometry && c !== obj) c.geometry.dispose(); if (c.material && c !== obj) { const ms = Array.isArray(c.material) ? c.material : [c.material]; ms.forEach(m => m.dispose()); } });
      }
    }

    // Dimensions
    if (ud.type === 'dimension' || ud.type === 'dimensionLabel') {
      const idx = f.dimensions.indexOf(obj);
      if (idx >= 0) f.dimensions.splice(idx, 1);
    }

    const parent = obj.type === 'Group' || ud.type === 'staircase' ? this.wallGroup : (ud.type?.startsWith('dimension') ? this.annotationGroup : this.wallGroup);
    parent.remove(obj);
    if (obj.geometry) obj.geometry.dispose();
    if (obj.material) {
      const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
      mats.forEach(m => { if (m.map) m.map.dispose(); m.dispose(); });
    }
    this._fire('objectDeleted', { type: ud.type });
  }

  _raycastFloorObjects(pt) {
    const f = this.floors[this.currentFloor];
    const targets = [...f.walls, ...f.doors, ...f.windows, ...f.columns];
    this.raycaster.set(new THREE.Raycaster(
      new THREE.Vector3(pt.x, pt.y + 10, pt.z),
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
    this.wallGroup.traverse(c => {
      if (c.userData?._highlighted && c.material?.emissive) {
        c.material.emissive.setHex(0x000000);
        c.material.emissiveIntensity = 0;
        c.userData._highlighted = false;
      }
    });
    if (this.selectedObject?.material?.emissive) {
      this.selectedObject.material.emissive.setHex(COLORS.selected);
      this.selectedObject.material.emissiveIntensity = 0.4;
      this.selectedObject.userData._highlighted = true;
    }
  }

  // ============ UNDO ============
  _pushUndo() {
    const state = JSON.parse(JSON.stringify(this.floors.map(f => ({
      w: f.walls.length,
      d: f.doors.length,
      win: f.windows.length,
      col: f.columns.length,
      st: f.stairs.length,
      dim: f.dimensions.length,
    }))));
    this.undoStack.push({
      floors: state,
      lastObj: this.wallGroup.children.length > 0
        ? this.wallGroup.children[this.wallGroup.children.length - 1]
        : null,
    });
    if (this.undoStack.length > 50) this.undoStack.shift();
  }

  _undo() {
    if (this.undoStack.length === 0) return;
    const state = this.undoStack.pop();
    // Simple undo: remove last object from each array that grew
    for (let i = 0; i < this.floors.length && i < state.floors.length; i++) {
      const f = this.floors[i];
      const s = state.floors[i];
      while (f.walls.length > s.w) this._removeObjFromArray(f.walls);
      while (f.doors.length > s.d) this._removeObjFromArray(f.doors);
      while (f.windows.length > s.win) this._removeObjFromArray(f.windows);
      while (f.columns.length > s.col) this._removeObjFromArray(f.columns);
      while (f.stairs.length > s.st) this._removeObjFromArray(f.stairs);
    }
    this._fire('undo', { stackSize: this.undoStack.length });
  }

  _removeObjFromArray(arr) {
    if (arr.length === 0) return;
    const obj = arr.pop();
    const parent = obj.type === 'Group' ? this.wallGroup : this.wallGroup;
    parent.remove(obj);
    if (obj.traverse) {
      obj.traverse(c => {
        if (c.geometry && c !== obj) c.geometry.dispose();
        if (c.material && c !== obj) { const ms = Array.isArray(c.material) ? c.material : [c.material]; ms.forEach(m => m.dispose()); }
      });
    }
  }

  // ============ ROOM DETECTION ============
  detectRooms() {
    this.annotationGroup.children.forEach(c => {
      if (c.userData?.isRoomLabel) {
        this.annotationGroup.remove(c);
        if (c.material?.map) c.material.map.dispose();
        c.material?.dispose();
      }
    });

    const floor = this.floors[this.currentFloor];
    if (floor.walls.length < 3) return [];

    const baseY = this.currentFloor * this.floorHeight;
    const rooms = [];
    const walls = floor.walls;

    // Find closed loops (simplified: treat each pair of nearby wall endpoints as a connection)
    const edges = walls.map(w => ({
      p1: new THREE.Vector2(w.userData.p1.x, w.userData.p1.z),
      p2: new THREE.Vector2(w.userData.p2.x, w.userData.p2.z),
    }));

    // Find connected components
    const used = new Set();
    for (let i = 0; i < edges.length; i++) {
      if (used.has(i)) continue;
      const loop = this._traceLoop(edges, i, used);
      if (loop && loop.length >= 4) {
        const area = this._polygonArea(loop);
        if (area > 0.5 && area < 200) {
          const centroid = this._polygonCentroid(loop);
          rooms.push({ loop, area, centroid });
          this._placeRoomLabel(centroid, area, baseY);
        }
      }
    }
    this._fire('roomsDetected', { count: rooms.length });
    return rooms;
  }

  _traceLoop(edges, startIdx, used) {
    const pts = [];
    let current = edges[startIdx].p1.clone();
    const start = current.clone();
    pts.push(current.clone());
    let lastEdge = startIdx;

    for (let iter = 0; iter < 100; iter++) {
      used.add(lastEdge);
      const endPt = edges[lastEdge].p1.distanceTo(current) < edges[lastEdge].p2.distanceTo(current)
        ? edges[lastEdge].p2 : edges[lastEdge].p1;
      current = endPt.clone();
      pts.push(current.clone());

      if (current.distanceTo(start) < 0.3) { pts.push(start.clone()); used.add(lastEdge); return pts; }

      // Find next edge
      let found = false;
      for (let i = 0; i < edges.length; i++) {
        if (used.has(i) || i === lastEdge) continue;
        if (edges[i].p1.distanceTo(current) < 0.5 || edges[i].p2.distanceTo(current) < 0.5) {
          lastEdge = i;
          found = true;
          break;
        }
      }
      if (!found) break;
    }
    return pts.length >= 4 ? pts : null;
  }

  _polygonArea(loop) {
    let area = 0;
    for (let i = 0; i < loop.length; i++) {
      const j = (i + 1) % loop.length;
      area += loop[i].x * loop[j].y - loop[j].x * loop[i].y;
    }
    return Math.abs(area) / 2;
  }

  _polygonCentroid(loop) {
    let cx = 0, cz = 0;
    loop.forEach(p => { cx += p.x; cz += p.y; });
    return { x: cx / loop.length, y: cz / loop.length };
  }

  _placeRoomLabel(centroid, area, baseY) {
    const label = this._makeLabel(area.toFixed(1) + 'm²', new THREE.Vector3(centroid.x, baseY + 0.06, centroid.y), '#10b981', 0x10b981);
    label.userData = { isRoomLabel: true, floor: this.currentFloor };
    this.annotationGroup.add(label);
  }

  // ============ FLOOR VISIBILITY ============
  updateFloorVisibility() {
    this.wallGroup.traverse(c => {
      if (c.userData?.floor !== undefined) {
        if (c.userData.floor === this.currentFloor) {
          c.visible = true;
          if (c.material?.transparent !== undefined) { c.material.transparent = false; c.material.opacity = 1; }
        } else if (!this.showUpperFloors && c.userData.floor > this.currentFloor) {
          c.visible = false;
        } else {
          c.visible = true;
          if (c.material?.transparent !== undefined && c.userData.type !== 'window') {
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
        if (c.material?.transparent !== undefined && c.userData.type !== 'window') {
          c.material.transparent = false; c.material.opacity = 1;
        }
      }
    });
  }

  // ============ SLABS ============
  generateSlabs() {
    this.floors.forEach(f => { if (f.slab) { this.scene.remove(f.slab); f.slab = null; } });
    for (let i = 0; i < this.floors.length; i++) {
      const f = this.floors[i];
      if (f.walls.length === 0) continue;
      let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
      f.walls.forEach(w => {
        const ud = w.userData;
        [ud.p1, ud.p2].forEach(p => { minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x); minZ = Math.min(minZ, p.z); maxZ = Math.max(maxZ, p.z); });
      });
      const pad = 0.3;
      const w = maxX - minX + pad * 2, d = maxZ - minZ + pad * 2;
      const cx = (minX + maxX) / 2, cz = (minZ + maxZ) / 2;
      const y = i * this.floorHeight;
      const slabGeo = new THREE.BoxGeometry(w + 0.4, 0.2, d + 0.4);
      const slab = new THREE.Mesh(slabGeo, new THREE.MeshStandardMaterial({ color: 0xd0c8c0, roughness: 0.5, metalness: 0.1 }));
      slab.position.set(cx, y + 0.1, cz);
      slab.receiveShadow = true;
      slab.userData = { type: 'slab', floor: i };
      this.scene.add(slab);
      f.slab = slab;
    }
    this._fire('slabsGenerated', {});
  }

  // ============ LABEL ============
  _makeLabel(text, pos, bgColor, textColor) {
    const canvas = document.createElement('canvas');
    canvas.width = 256; canvas.height = 48;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = typeof bgColor === 'number' ? 'rgba(0,0,0,0.72)' : bgColor;
    if (typeof bgColor === 'number') {
      ctx.fillStyle = 'rgba(0,0,0,0.72)';
    }
    ctx.beginPath();
    const w = ctx.measureText(text).width + 40;
    const cw = Math.max(180, w);
    const ox = (256 - cw) / 2;
    ctx.moveTo(ox, 8); ctx.lineTo(ox + cw, 8);
    ctx.quadraticCurveTo(ox + cw + 8, 8, ox + cw + 8, 16);
    ctx.lineTo(ox + cw + 8, 32);
    ctx.quadraticCurveTo(ox + cw + 8, 40, ox + cw, 40);
    ctx.lineTo(ox, 40);
    ctx.quadraticCurveTo(ox - 8, 40, ox - 8, 32);
    ctx.lineTo(ox - 8, 16);
    ctx.quadraticCurveTo(ox - 8, 8, ox, 8);
    ctx.fill();
    ctx.fillStyle = typeof textColor === 'number' ? '#ffffff' : '#ffeeee';
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

  // ============ CLEANUP ============
  _clearPreviewObjects() {
    this.previewObjects.forEach(o => { this.scene.remove(o); o.geometry?.dispose(); o.material?.dispose(); });
    this.previewObjects = [];
  }

  clearPreview() {
    this._clearPreviewObjects();
    this.measureLabels.forEach(l => {
      this.scene.remove(l);
      if (l.material?.map) l.material.map.dispose();
      l.material?.dispose();
      if (l.geometry?.dispose) l.geometry.dispose();
    });
    this.measureLabels = [];
    this._clearSnapMarkers();
    if (this.cursorPoint) this.cursorPoint.visible = false;
  }

  clearAll() {
    [this.wallGroup, this.annotationGroup].forEach(group => {
      group.traverse(c => {
        if (c.geometry && c !== group) c.geometry.dispose();
        if (c.material) { const ms = Array.isArray(c.material) ? c.material : [c.material]; ms.forEach(m => { if (m.map) m.map.dispose(); m.dispose(); }); }
      });
      while (group.children.length > 0) group.remove(group.children[0]);
    });
    this.floors = [];
    this.undoStack = [];
    this.initFloor(0);
    this.scene.children.forEach(c => {
      if (c.userData?.type === 'slab') { this.scene.remove(c); c.geometry?.dispose(); c.material?.dispose(); }
    });
    this._fire('cleared', {});
  }

  _fire(name, detail) {
    window.dispatchEvent(new CustomEvent('floorplan_' + name, { detail }));
  }

  getStats() {
    let walls = 0, doors = 0, wins = 0, cols = 0, stairs = 0, dims = 0;
    this.floors.forEach(f => {
      walls += f.walls.length;
      doors += f.doors.length;
      wins += f.windows.length;
      cols += f.columns.length;
      stairs += f.stairs.length;
      dims += f.dimensions.length;
    });
    return { floors: this.floors.length, walls, doors, windows: wins, columns: cols, stairs, dimensions: dims };
  }

  dispose() {
    this.clearAll();
    this.scene.remove(this.grid);
    this.scene.remove(this.cursorPoint);
    this.scene.remove(this.wallGroup);
    this.scene.remove(this.annotationGroup);
  }
}

export { FloorPlanEngine };
