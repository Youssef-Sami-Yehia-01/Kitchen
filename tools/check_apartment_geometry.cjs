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
const scope = { B, scene, M: { cream: new B.StandardMaterial('test fabric', scene) } };
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
engine.dispose();
console.log('PASS: rounded furniture remains isolated across material batches; no cross-object triangles.');
