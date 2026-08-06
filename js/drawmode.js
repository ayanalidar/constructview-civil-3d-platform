// ==============================================
// ConstructView — CAD Draw Mode Engine
// Free-form 2D drawing + 3D extrusion
// Grid snap, measurements, line/rect/circle/poly/arc
// ==============================================

import * as THREE from 'three';

class DrawMode {
  constructor(designerRef) {
    this.designer = designerRef;
    this.scene = designerRef.scene;
    this.camera = designerRef.camera;
    this.canvas = designerRef.renderer.domElement;

    this.active = false;
    this.tool = 'line';       // line, rect, circle, polygon, arc, freehand
    this.points = [];         // Points being drawn
    this.previewLine = null;
    this.previewMesh = null;
    this.measurementLabels = [];
    this.drawnShapes = [];    // Completed shapes
    this.extrudedObjects = []; // 3D extrusions
    this.gridSnap = true;
    this.snapSize = 0.5;
    this.currentLayer = 0;
    this.layers = [{ name: 'Default', color: '#0ea5e9', visible: true, objects: [] }];

    // Plane for drawing (ground plane at y=0)
    this.drawPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    this.raycaster = new THREE.Raycaster();

    // Visual helpers
    this.gridHelper = null;
    this.axisHelper = null;
    this.cursorPoint = null; // Visual cursor on grid

    this.setupGrid();
    this.setupInteraction();
  }

  setupGrid() {
    // Enhanced grid for drawing
    if (this.gridHelper) this.scene.remove(this.gridHelper);
    this.gridHelper = new THREE.GridHelper(40, 80, 0x446688, 0x1e293b);
    this.gridHelper.position.y = 0.02;
    this.gridHelper.visible = false;
    this.scene.add(this.gridHelper);

    // Cursor dot
    this.cursorGeo = new THREE.RingGeometry(0.15, 0.25, 32);
    this.cursorGeo.rotateX(-Math.PI / 2);
    this.cursorPoint = new THREE.Mesh(this.cursorGeo,
      new THREE.MeshBasicMaterial({ color: 0x00ff88, side: THREE.DoubleSide, depthTest: false, depthWrite: false }));
    this.cursorPoint.position.y = 0.03;
    this.cursorPoint.visible = false;
    this.scene.add(this.cursorPoint);
  }

  setupInteraction() {
    this.canvas.addEventListener('click', (e) => this.onClick(e));
    this.canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
    this.canvas.addEventListener('keydown', (e) => this.onKeyDown(e));
  }

  // ============ TOGGLE DRAW MODE ============
  toggle(on) {
    this.active = on;
    this.gridHelper.visible = on;
    this.cursorPoint.visible = on;
    if (!on) this.clearPreview();
    if (on) this.designer.controls.enabled = false;
    else this.designer.controls.enabled = true;
    this._fireEvent('drawModeChanged', { active: on });
  }

  setTool(tool) {
    this.tool = tool;
    this.clearPreview();
    this.points = [];
    this._fireEvent('toolChanged', { tool });
  }

  setSnapSize(size) {
    this.snapSize = size;
  }

  // ============ DRAWING HANDLERS ============
  onClick(event) {
    if (!this.active) return;
    if (event.button !== 0) return; // Left click only

    const pt = this._getGridPoint(event);
    if (!pt) return;
    pt.y = 0.02;

    switch (this.tool) {
      case 'line':
        this._addLinePoint(pt);
        break;
      case 'rect':
        this._addRectPoint(pt);
        break;
      case 'circle':
        this._addCirclePoint(pt);
        break;
      case 'polygon':
        this._addPolygonPoint(pt, event);
        break;
      case 'arc':
        this._addArcPoint(pt);
        break;
    }
  }

  onMouseMove(event) {
    if (!this.active) return;
    const pt = this._getGridPoint(event);
    if (!pt) return;
    pt.y = 0.03;

    // Update cursor
    this.cursorPoint.position.copy(pt);
    this.cursorPoint.visible = true;

    // Preview
    this._updatePreview(pt);
  }

  onKeyDown(event) {
    if (!this.active) return;
    if (event.key === 'Escape') {
      this.clearPreview();
      this.points = [];
      this._fireEvent('drawCancelled', {});
    }
    if (event.key === 'Enter' && this.tool === 'polygon' && this.points.length >= 2) {
      this._finalizePolygon();
    }
    if (event.key === 'z' && event.ctrlKey && this.drawnShapes.length > 0) {
      this.undo();
    }
  }

  // ============ POINT CAPTURE ============
  _getGridPoint(event) {
    const rect = this.canvas.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1
    );
    this.raycaster.setFromCamera(mouse, this.camera);
    const intersect = new THREE.Vector3();
    const hit = this.raycaster.ray.intersectPlane(this.drawPlane, intersect);
    if (!hit) return null;

    if (this.gridSnap) {
      intersect.x = Math.round(intersect.x / this.snapSize) * this.snapSize;
      intersect.z = Math.round(intersect.z / this.snapSize) * this.snapSize;
    }
    return intersect;
  }

  // ============ LINE ============
  _addLinePoint(pt) {
    this.points.push(pt.clone());
    this._showMeasurement(pt);
    if (this.points.length >= 2) {
      this._finalizeLine();
    }
  }

  _finalizeLine() {
    const [p1, p2] = this.points;
    const shape = this._createLineVisual(p1, p2);
    shape.userData = { type: 'line', points: [p1, p2], tool: 'line' };
    this.drawnShapes.push(shape);
    this.scene.add(shape);
    this.clearPreview();
    this.points = [];
    this._fireEvent('shapeDrawn', { type: 'line', length: p1.distanceTo(p2).toFixed(2) });
  }

  // ============ RECTANGLE ============
  _addRectPoint(pt) {
    this.points.push(pt.clone());
    if (this.points.length >= 2) {
      this._finalizeRect();
    }
  }

  _finalizeRect() {
    const [p1, p2] = this.points;
    const cx = (p1.x + p2.x) / 2;
    const cz = (p1.z + p2.z) / 2;
    const w = Math.abs(p2.x - p1.x);
    const d = Math.abs(p2.z - p1.z);

    const geo = new THREE.PlaneGeometry(w, d);
    geo.rotateX(-Math.PI / 2);
    const mat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(this.layers[this.currentLayer].color),
      side: THREE.DoubleSide, transparent: true, opacity: 0.5, depthTest: true,
    });
    const rect = new THREE.Mesh(geo, mat);
    rect.position.set(cx, 0.03, cz);
    rect.userData = { type: 'rect', points: [p1, p2], tool: 'rect', width: w, depth: d };
    this.drawnShapes.push(rect);
    this.scene.add(rect);

    // Wireframe outline
    const outline = this._createRectOutline(p1, p2);
    outline.userData = { parent: rect.uuid };
    rect.userData.outline = outline;
    this.scene.add(outline);

    this.clearPreview();
    this.points = [];
    this._fireEvent('shapeDrawn', { type: 'rect', width: w.toFixed(2), depth: d.toFixed(2), area: (w * d).toFixed(2) });
  }

  // ============ CIRCLE ============
  _addCirclePoint(pt) {
    this.points.push(pt.clone());
    if (this.points.length >= 2) {
      this._finalizeCircle();
    }
  }

  _finalizeCircle() {
    const [center, edge] = this.points;
    const radius = center.distanceTo(edge);
    const geo = new THREE.CircleGeometry(radius, 64);
    geo.rotateX(-Math.PI / 2);
    const mat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(this.layers[this.currentLayer].color),
      side: THREE.DoubleSide, transparent: true, opacity: 0.5, depthTest: true,
    });
    const circle = new THREE.Mesh(geo, mat);
    circle.position.set(center.x, 0.03, center.z);
    circle.userData = { type: 'circle', points: [center, edge], tool: 'circle', radius };
    this.drawnShapes.push(circle);
    this.scene.add(circle);
    this.clearPreview();
    this.points = [];
    this._fireEvent('shapeDrawn', { type: 'circle', radius: radius.toFixed(2), area: (Math.PI * radius * radius).toFixed(2) });
  }

  // ============ POLYGON ============
  _addPolygonPoint(pt, event) {
    // Double-click or Enter to finalize
    if (event.detail >= 2 && this.points.length >= 2) {
      this._finalizePolygon();
      return;
    }
    this.points.push(pt.clone());
    this._showMeasurement(pt);
  }

  _finalizePolygon() {
    if (this.points.length < 3) return;
    const shape = new THREE.Shape();
    shape.moveTo(this.points[0].x - this.points[0].x, this.points[0].z - this.points[0].z);
    const origin = this.points[0].clone();
    this.points.forEach(p => {
      shape.lineTo(p.x - origin.x, p.z - origin.z);
    });
    shape.closePath();

    const geo = new THREE.ShapeGeometry(shape);
    geo.rotateX(-Math.PI / 2);
    const mat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(this.layers[this.currentLayer].color),
      side: THREE.DoubleSide, transparent: true, opacity: 0.5, depthTest: true,
    });
    const poly = new THREE.Mesh(geo, mat);
    poly.position.set(origin.x, 0.03, origin.z);
    poly.userData = { type: 'polygon', points: [...this.points], tool: 'polygon' };
    this.drawnShapes.push(poly);
    this.scene.add(poly);
    this.clearPreview();
    this.points = [];
    this._fireEvent('shapeDrawn', { type: 'polygon', vertices: this.points.length });
  }

  // ============ ARC ============
  _addArcPoint(pt) {
    this.points.push(pt.clone());
    if (this.points.length >= 3) {
      this._finalizeArc();
    }
  }

  _finalizeArc() {
    const [start, mid, end] = this.points;
    const radius = start.distanceTo(mid);
    // Build arc curve
    const curve = new THREE.QuadraticBezierCurve3(start.clone(), mid.clone(), end.clone());
    const arcPoints = curve.getPoints(32);
    const lineGeo = new THREE.BufferGeometry().setFromPoints(arcPoints);
    const lineMat = new THREE.LineBasicMaterial({ color: new THREE.Color(this.layers[this.currentLayer].color) });
    const arcLine = new THREE.Line(lineGeo, lineMat);
    arcLine.position.y = 0.04;
    arcLine.userData = { type: 'arc', points: [start, mid, end], tool: 'arc', radius };
    this.drawnShapes.push(arcLine);
    this.scene.add(arcLine);
    this.clearPreview();
    this.points = [];
    this._fireEvent('shapeDrawn', { type: 'arc', radius: radius.toFixed(2) });
  }

  // ============ PREVIEW RENDERING ============
  _updatePreview(currentPt) {
    this._clearPreviewVisuals();
    if (this.points.length === 0) return;

    const lastPt = this.points[this.points.length - 1];
    const color = 0x00ff88;

    switch (this.tool) {
      case 'line':
        this._drawDashedLine(lastPt, currentPt, color);
        break;
      case 'rect':
        if (this.points.length === 1) {
          this._drawRectPreview(this.points[0], currentPt, color);
        }
        break;
      case 'circle':
        if (this.points.length === 1) {
          this._drawCirclePreview(this.points[0], currentPt, color);
        }
        break;
      case 'polygon':
        this._drawDashedLine(lastPt, currentPt, color);
        break;
      case 'arc':
        if (this.points.length === 2) {
          this._drawArcPreview(this.points[0], this.points[1], currentPt, color);
        }
        break;
    }
  }

  _drawDashedLine(from, to, color) {
    const geo = new THREE.BufferGeometry().setFromPoints([from, to]);
    const mat = new THREE.LineDashedMaterial({ color, dashSize: 0.3, gapSize: 0.2, depthTest: true });
    const line = new THREE.Line(geo, mat);
    line.computeLineDistances();
    this.previewLine = line;
    this.scene.add(line);
  }

  _drawRectPreview(p1, p2, color) {
    const w = Math.abs(p2.x - p1.x);
    const d = Math.abs(p2.z - p1.z);
    if (w < 0.01 || d < 0.01) return;
    const cx = (p1.x + p2.x) / 2;
    const cz = (p1.z + p2.z) / 2;
    const geo = new THREE.PlaneGeometry(w, d);
    geo.rotateX(-Math.PI / 2);
    const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.25, side: THREE.DoubleSide, depthTest: true });
    this.previewMesh = new THREE.Mesh(geo, mat);
    this.previewMesh.position.set(cx, 0.03, cz);
    this.scene.add(this.previewMesh);
  }

  _drawCirclePreview(center, edge, color) {
    const r = center.distanceTo(edge);
    if (r < 0.01) return;
    const geo = new THREE.CircleGeometry(r, 64);
    geo.rotateX(-Math.PI / 2);
    const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.25, side: THREE.DoubleSide, depthTest: true });
    this.previewMesh = new THREE.Mesh(geo, mat);
    this.previewMesh.position.set(center.x, 0.03, center.z);
    this.scene.add(this.previewMesh);
  }

  _drawArcPreview(start, mid, end, color) {
    const curve = new THREE.QuadraticBezierCurve3(start.clone(), mid.clone(), end.clone());
    const pts = curve.getPoints(32);
    const geo = new THREE.BufferGeometry().setFromPoints(pts);
    const mat = new THREE.LineDashedMaterial({ color, dashSize: 0.3, gapSize: 0.2, depthTest: true });
    const line = new THREE.Line(geo, mat);
    line.computeLineDistances();
    this.previewLine = line;
    this.scene.add(line);
  }

  // ============ VISUAL HELPERS ============
  _showMeasurement(pt) {
    // Clear old measurement labels
    this.measurementLabels.forEach(l => { this.scene.remove(l); l.material?.map?.dispose(); l.material?.dispose(); });
    this.measurementLabels = [];

    if (this.points.length >= 1) {
      const last = this.points[this.points.length - 1];
      const dist = last.distanceTo(pt);
      const mid = new THREE.Vector3().addVectors(last, pt).multiplyScalar(0.5);
      mid.y += 1.0;
      const label = this._createLabel(`${dist.toFixed(2)}m`, mid);
      this.scene.add(label);
      this.measurementLabels.push(label);
    }
  }

  _createLabel(text, pos) {
    // Polyfill roundRect for older browsers
    if (!CanvasRenderingContext2D.prototype.roundRect) {
      CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, r) {
        if (typeof r === 'number') r = { tl: r, tr: r, br: r, bl: r };
        this.beginPath();
        this.moveTo(x + r.tl, y);
        this.lineTo(x + w - r.tr, y);
        this.quadraticCurveTo(x + w, y, x + w, y + r.tr);
        this.lineTo(x + w, y + h - r.br);
        this.quadraticCurveTo(x + w, y + h, x + w - r.br, y + h);
        this.lineTo(x + r.bl, y + h);
        this.quadraticCurveTo(x, y + h, x, y + h - r.bl);
        this.lineTo(x, y + r.tl);
        this.quadraticCurveTo(x, y, x + r.tl, y);
        this.closePath();
      };
    }
    const canvas = document.createElement('canvas');
    canvas.width = 256; canvas.height = 48;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.roundRect(20, 4, 216, 40, 8);
    ctx.fill();
    ctx.fillStyle = '#00ff88';
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

  _createLineVisual(p1, p2) {
    const geo = new THREE.BufferGeometry().setFromPoints([p1, p2]);
    const mat = new THREE.LineBasicMaterial({ color: new THREE.Color(this.layers[this.currentLayer].color), depthTest: true });
    const line = new THREE.Line(geo, mat);
    line.position.y = 0.04;
    return line;
  }

  _createRectOutline(p1, p2) {
    const pts = [
      new THREE.Vector3(p1.x, 0.04, p1.z),
      new THREE.Vector3(p2.x, 0.04, p1.z),
      new THREE.Vector3(p2.x, 0.04, p2.z),
      new THREE.Vector3(p1.x, 0.04, p2.z),
      new THREE.Vector3(p1.x, 0.04, p1.z),
    ];
    const geo = new THREE.BufferGeometry().setFromPoints(pts);
    const mat = new THREE.LineBasicMaterial({ color: new THREE.Color(this.layers[this.currentLayer].color) });
    return new THREE.Line(geo, mat);
  }

  // ============ 3D EXTRUSION ============
  extrudeShape(shapeIndex, height = 3) {
    if (shapeIndex < 0 || shapeIndex >= this.drawnShapes.length) return null;
    const shape = this.drawnShapes[shapeIndex];
    const ud = shape.userData;

    let extruded = null;
    const mat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(this.layers[this.currentLayer].color),
      roughness: 0.5, metalness: 0.1
    });

    switch (ud.type) {
      case 'rect': {
        const geo = new THREE.BoxGeometry(ud.width, height, ud.depth);
        extruded = new THREE.Mesh(geo, mat);
        extruded.position.set(shape.position.x, height / 2, shape.position.z);
        break;
      }
      case 'circle': {
        const geo = new THREE.CylinderGeometry(ud.radius, ud.radius, height, 48);
        extruded = new THREE.Mesh(geo, mat);
        extruded.position.set(shape.position.x, height / 2, shape.position.z);
        break;
      }
      case 'polygon': {
        const s = new THREE.Shape();
        const origin = ud.points[0];
        s.moveTo(0, 0);
        ud.points.forEach(p => { s.lineTo(p.x - origin.x, p.z - origin.z); });
        s.closePath();
        const shapeGeo = new THREE.ShapeGeometry(s);
        const extGeo = new THREE.ExtrudeGeometry(s, { depth: height, bevelEnabled: true, bevelThickness: 0.1, bevelSize: 0.1, bevelSegments: 2 });
        extruded = new THREE.Mesh(extGeo, mat);
        extruded.position.set(origin.x, 0, origin.z);
        extruded.rotation.x = -Math.PI / 2;
        break;
      }
      case 'line': {
        // Extrude line to wall
        const [p1, p2] = ud.points;
        const width = 0.2;
        const length = p1.distanceTo(p2);
        const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
        const angle = Math.atan2(p2.x - p1.x, p2.z - p1.z);
        const geo = new THREE.BoxGeometry(width, height, length);
        extruded = new THREE.Mesh(geo, mat);
        extruded.position.set(mid.x, height / 2, mid.z);
        extruded.rotation.y = angle;
        break;
      }
    }

    if (extruded) {
      extruded.castShadow = true;
      extruded.receiveShadow = true;
      extruded.userData = { type: 'extrusion', sourceShape: shapeIndex, height };
      this.scene.add(extruded);
      this.extrudedObjects.push(extruded);
      // Hide the 2D shape
      shape.visible = false;
      if (ud.outline) ud.outline.visible = false;
      this._fireEvent('shapeExtruded', { index: shapeIndex, height });
    }
    return extruded;
  }

  extrudeLast(height = 3) {
    if (this.drawnShapes.length === 0) return null;
    return this.extrudeShape(this.drawnShapes.length - 1, height);
  }

  // ============ UNDO / CLEAR ============
  undo() {
    const shape = this.drawnShapes.pop();
    if (shape) {
      if (shape.userData.outline) { this.scene.remove(shape.userData.outline); }
      this.scene.remove(shape);
      if (shape.geometry) shape.geometry.dispose();
      if (shape.material) shape.material.dispose();
    }
    this._fireEvent('drawUndo', {});
  }

  clearAll() {
    [...this.drawnShapes].forEach(s => {
      if (s.userData.outline) this.scene.remove(s.userData.outline);
      this.scene.remove(s);
      if (s.geometry) s.geometry.dispose();
      if (s.material) s.material.dispose();
    });
    this.drawnShapes = [];
    [...this.extrudedObjects].forEach(o => {
      this.scene.remove(o);
      if (o.geometry) o.geometry.dispose();
      if (o.material) o.material.dispose();
    });
    this.extrudedObjects = [];
    this._fireEvent('drawCleared', {});
  }

  // ============ HELPERS ============
  clearPreview() {
    this._clearPreviewVisuals();
    this.measurementLabels.forEach(l => {
      this.scene.remove(l);
      if (l.material) { l.material.map?.dispose(); l.material.dispose(); }
    });
    this.measurementLabels = [];
  }

  _clearPreviewVisuals() {
    if (this.previewLine) { this.scene.remove(this.previewLine); this.previewLine.geometry.dispose(); this.previewLine.material.dispose(); this.previewLine = null; }
    if (this.previewMesh) { this.scene.remove(this.previewMesh); this.previewMesh.geometry.dispose(); this.previewMesh.material.dispose(); this.previewMesh = null; }
  }

  _fireEvent(name, detail) {
    window.dispatchEvent(new CustomEvent(name, { detail }));
  }

  getShapes() { return this.drawnShapes; }
  getExtrudedObjects() { return this.extrudedObjects; }
  getShapeCount() { return this.drawnShapes.length; }
}

export { DrawMode };
