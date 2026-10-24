'use strict';

// Reproduce the lounge artefact with the production rounded-geometry helper.
// A material batch must not mutate another piece using the same cached shape.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const B = require('../vendor/babylon.js');
const source = fs.readFileSync(path.join(__dirname, '../apartment-model.js'), 'utf8');
const engine = new B.NullEngine();
const scene = new B.Scene(engine);
const scope = { B, scene, window: {}, M: { cream: new B.StandardMaterial('test fabric', scene) } };
vm.createContext(scope);
vm.runInContext(source.slice(source.indexOf('  const roundCache='),
  source.indexOf('  function cylinder(')) + '\nthis.soft = soft;', scope);

const first = scope.soft('First material cushion', .32, .32, .12, 0, 1, 0);
const lounge = scope.soft('Lounge blue cushion', .32, .32, .12, 3, 1, 0);
const later = scope.soft('Later material cushion', .32, .32, .12, 6, 1, 0);
const expected = Array.from(lounge.getIndices());
B.Mesh.MergeMeshes([first, B.MeshBuilder.CreateBox('Other shape', {}, scene)], true, true);
assert.deepEqual(Array.from(lounge.getIndices()), expected,
  'Merging an earlier material must not change the lounge cushion indices');
assert.deepEqual(Array.from(later.getIndices()), expected);

const book = B.MeshBuilder.CreateBox('Distant book', { size: .2 }, scene);
book.position.set(0, 2, 4);
const cushionVertices = lounge.getTotalVertices();
const cushionIndices = lounge.getTotalIndices();
const merged = B.Mesh.MergeMeshes([lounge, book], true, true);
const indices = merged.getIndices();
assert.equal(indices.length, cushionIndices + 36);
for (let i = 0; i < indices.length; i += 3) {
  const triangle = Array.from(indices.slice(i, i + 3));
  assert.ok(triangle.every(v => v >= 0 && v < merged.getTotalVertices()));
  assert.ok(i < cushionIndices
    ? triangle.every(v => v < cushionVertices)
    : triangle.every(v => v >= cushionVertices),
  'No triangle may stretch between the cushion and a distant book');
}
assert.deepEqual(Array.from(later.getIndices()), expected);
const fresh = scope.soft('Fresh cached cushion', .32, .32, .12, 0, 0, 0);
assert.deepEqual(Array.from(fresh.getIndices()), expected, 'Cache remains reusable after merging');

// Exercise the production sectional, including its concave caps and rounded edges.
vm.runInContext(source.slice(0, source.indexOf('// All plan coordinates')), scope);
vm.runInContext(source.slice(source.indexOf('  function cylinder('),
  source.indexOf('  function mirror(')) + '\nthis.cylinder=cylinder;this.rod=rod;', scope);
for (const key of ['loungeBlue','walnut','blue']) scope.M[key] = new B.StandardMaterial(key, scene);
const sectional = new B.TransformNode('F01 test sectional', scene);
scope.window.buildLoungeSectional(B, scene,
  { M: scope.M, soft: scope.soft, cylinder: scope.cylinder, rod: scope.rod }, sectional, 3, 2);
const pieces = sectional.getChildMeshes(false);
const shells = pieces.filter(m => m.metadata?.sectionalComponent);
assert.deepEqual(shells.map(m => m.metadata.sectionalComponent).sort(), ['back','base','seat']);
assert.equal(pieces.filter(m => /end arm$/.test(m.name)).length, 2, 'Only the two free ends have arms');
for (const shell of shells) {
  assert.equal(shell.material, scope.M.loungeBlue, 'Continuous upholstery is blue');
  const points = shell.getVerticesData(B.VertexBuffer.PositionKind), ix = shell.getIndices();
  assert.ok(points.every(Number.isFinite));
  const edges = new Map(), neighbours = new Map();
  for (let i = 0; i < ix.length; i += 3) for (let j = 0; j < 3; j++) {
    const a = ix[i+j], b = ix[i+(j+1)%3], key = a < b ? a+'/'+b : b+'/'+a;
    edges.set(key, (edges.get(key)||0)+1);
    if (!neighbours.has(a)) neighbours.set(a, new Set());
    neighbours.get(a).add(b);
  }
  assert.ok([...edges.values()].every(n => n === 2), shell.name + ' must be a closed shell');
  const visited = new Set(), pending = [0];
  while (pending.length) { const a = pending.pop(); if (visited.has(a)) continue;
    visited.add(a); pending.push(...neighbours.get(a)); }
  assert.equal(visited.size, points.length/3, shell.name + ' must be one connected piece');
  shell.computeWorldMatrix(true);
}
const base = shells.find(m => m.metadata.sectionalComponent === 'base');
const bounds = base.getBoundingInfo().boundingBox;
assert.ok(Math.abs(bounds.maximumWorld.x-bounds.minimumWorld.x-3) < 1e-5);
assert.ok(Math.abs(bounds.maximumWorld.z-bounds.minimumWorld.z-2) < 1e-5);
for (const [x,z,expectedHit] of [[0,-.5,true],[-1,.5,true],[0,.6,false]]) {
  const hit = scene.pickWithRay(new B.Ray(new B.Vector3(x,2,z),new B.Vector3(0,-1,0)),m=>m===base);
  assert.equal(hit.hit, expectedHit, 'Sectional footprint must have a true L-shaped recess');
}
engine.dispose();
console.log('PASS: rounded furniture remains isolated across material batches; no cross-object triangles.');
console.log('PASS: blue sectional has connected base, seat and back shells, two end arms and a true 3 x 2 m L footprint.');
