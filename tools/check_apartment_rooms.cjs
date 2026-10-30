'use strict';
// Build the production room meshes without a GPU; exercise the new door hinge
// and storage assembly rather than only checking the source dimensions.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const pixels=(w,h)=>({data:new Uint8ClampedArray(w*h*4),width:w,height:h});
global.OffscreenCanvas=class {
 constructor(w,h){this.width=w;this.height=h;}
 getContext(){return new Proxy({canvas:this,createImageData:pixels,getImageData:pixels,measureText:()=>({width:0})},{get:(o,k)=>k in o?o[k]:()=>{}});}
};
const B=require('../vendor/babylon.js');
const engine=new B.NullEngine(),scene=new B.Scene(engine),root=path.join(__dirname,'..');
const plan=JSON.parse(fs.readFileSync(path.join(root,'assets/apartment-scene.json'),'utf8'));
const scope={window:{APARTMENT:plan}};vm.createContext(scope);
for(const file of ['apartment-details.js','apartment-model.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),scope);
const states=new Map(),apt=scope.window.buildApartment(B,scene,(node,spec)=>states.set(spec.id,{node,spec}));
const frame=new B.TransformNode('Plan handedness',scene);frame.scaling.z=-1;
for(const node of [...scene.rootNodes])if(node!==frame)node.parent=frame;
const door=states.get('D07'),spec=plan.doors.find(d=>d.id==='D07');
assert.equal(spec.w,850);assert.ok(door.spec.amount<0);
function tip(){door.node.computeWorldMatrix(true);return B.Vector3.TransformCoordinates(new B.Vector3(.85,0,0),door.node.getWorldMatrix());}
const closed=tip();assert.ok(Math.abs(closed.x-8.5)<1e-5&&Math.abs(closed.z-7.21)<1e-5);
door.node.rotation.y+=door.spec.amount;const opened=tip();
assert.ok(Math.abs(opened.x-9.35)<1e-5&&Math.abs(opened.z-8.06)<1e-5,'D07 must swing inward toward the entering person left/east');
const cabinet=apt.roots.get('C12');assert.ok(cabinet);
assert.equal(cabinet.getChildMeshes().filter(m=>m.name==='Bookcase shelf').length,0);
assert.equal([...states.keys()].filter(k=>k.startsWith('C12_')).length,3);
for(const mesh of scene.meshes){mesh.computeWorldMatrix(true);if(mesh.metadata?.floorSurface)mesh.isPickable=true;}
for(const [x,z] of [[8.65,6.65],[8.83,6.65],[9.13,6.65],[9.55,6.65],[9.73,6.65]]){
 const hits=scene.multiPickWithRay(new B.Ray(new B.Vector3(x,.50,z),new B.Vector3(0,-1,0)),m=>m.metadata?.floorSurface);
 assert.equal(hits.length,1,'One continuous floor surface through master entry at '+x);
 assert.ok(Math.abs(hits[0].pickedPoint.y-.004)<1e-5,'Entry floor must stay flush');
 assert.equal(hits[0].pickedMesh.material,apt.materials.oak);
}
for(const id of ['M04a','M04b','M04c']){
 const f=plan.furniture.find(f=>f.id===id),caseNode=scene.getTransformNodeByName(id+' wardrobe case');
 assert.ok(caseNode);const back=caseNode.getChildMeshes().find(m=>m.name==='Wardrobe back');
 const bounds=back.getBoundingInfo().boundingBox;
 assert.ok(Math.abs(bounds.maximum.y-bounds.minimum.y-f.height/1000)<1e-5);
}
for(const mesh of scene.meshes){
 const positions=mesh.getVerticesData(B.VertexBuffer.PositionKind);
 assert.ok(!positions||positions.every(Number.isFinite),mesh.name+' invalid positions');
 mesh.computeWorldMatrix(true);assert.ok(Array.from(mesh.getWorldMatrix().asArray()).every(Number.isFinite),mesh.name+' invalid transform');
}
console.log(`PASS: ${scene.meshes.length} production meshes, left-inward D07, extended C12, flush master entrance floor and retained master cabinet heights.`);
engine.dispose();
