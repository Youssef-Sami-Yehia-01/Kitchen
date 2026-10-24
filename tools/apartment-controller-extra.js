// R05 apartment navigation and reusable room/furniture interactions.
const roomNames={ALL:'Entire apartment',REC:'Reception & dining',KIT:'Kitchen',UTIL:'Bathroom 2 & laundry',MASTER:'Main bedroom',DRESS:'Dressing room',STUDY:'Family & study',CHILD:'Children’s bedroom',BATH:'Bathroom 1',WC:'Guest WC',BAL:'Reception balcony',BAY:'Bedroom balcony',HALL:'Hallway'};
const visits={REC:[3.15,1.50,-2.80],KIT:[5.22,5.20,0],UTIL:[8.12,5.17,0],MASTER:[11.23,6.52,-.55],DRESS:[11.50,1.14,0],STUDY:[6.80,8.35,Math.PI],CHILD:[8.12,8.40,2.15],BATH:[9.88,1.18,-1.3],WC:[4.28,1.28,.66],BAL:[1.90,11.02,0],BAY:[12.0,8.36,0],HALL:[7.0,6.48,Math.PI/2]};
const roomSections=new Map();
function registerApartmentPart(node,spec){
 const s={spec,node,value:0,target:0,position:node.position.clone(),rotation:node.rotationQuaternion?.clone()||B.Quaternion.FromEulerVector(node.rotation),meshes:node.getChildMeshes(false)};
 if(!roomSections.has(spec.room)){
  const section=document.createElement('section');section.className='part-section';const title=document.createElement('h3');title.textContent=roomNames[spec.room]||'Interior';section.appendChild(title);document.getElementById('partList').appendChild(section);roomSections.set(spec.room,section);
 }
 s.button=document.createElement('button');s.button.onclick=()=>{lookTarget=s;setOpen(s,!s.target);showTarget(s)};roomSections.get(spec.room).appendChild(s.button);
 states.push(s);byNode.set(spec.node||node.name,s);byId.set(spec.id,s);return s;
}
function alignKitchen(result){
 const root=scene.getTransformNodeByName('Kitchen mirror root');
 if(!root)throw Error('Kitchen alignment root missing');
 root.rotationQuaternion=B.Quaternion.Identity();root.scaling.set(1,1,1);root.position.set(3.98,0,-1.69);
 const structure=/^(?:(?:West|East) wall|North (?:wall|window)|Entry (?:lintel|wall)|Floor |Structural column|Window (?!corner)|Quartz window|Sink cabinet)/i;
 for(const m of result.meshes){if(structure.test(m.name)){m.setEnabled(false);m.metadata={excludedArchitecture:true};}}
 const oldDW=3.098459564,newDW=1.789,oldUtility=1.700898647;
 const nodes=[...result.meshes,...result.transformNodes];
 for(const n of nodes){
  if(n.name==='Dishwasher body - beside sink'||n.name==='Dishwasher toe kick'||['Interact_part_23','Interact_part_24','Interact_part_25'].includes(n.name)) n.position.z+=oldDW-newDW;
  if(n.name==='Interact_part_04'||(n.name.startsWith('West utility storage')&&n.parent===root))n.position.z-=oldDW-oldUtility;
 }
 for(const id of ['Interact_part_05','Interact_part_06'])scene.getTransformNodeByName(id)?.setEnabled(false);
 // Keep the owner's appliance widths/depths; replace unmeasured heights with
 // common Egyptian-market proportions. Rescale complete assemblies together.
 function resizeAssembly(name,predicate,scale,origin=B.Vector3.Zero()){
  const group=new B.TransformNode(name,scene);group.parent=root;group.position.copyFrom(origin);
  for(const n of nodes){if(n.parent===root&&predicate(n.name)){n.parent=group;n.position.subtractInPlace(origin);}}
  group.scaling.copyFrom(scale);
  return group;
 }
 const fridge=resizeAssembly('Refrigerator height proposal 1850 mm',n=>/^(Fridge|Refrigerator)/.test(n)||['Interact_part_27','Interact_part_28'].includes(n),new B.Vector3(1,1.85/2.16,1));
 const freezer=resizeAssembly('Upright freezer height proposal 1714 mm',n=>/^(Freezer|Upright)/.test(n)||/^Interact_part_(29|3[0-5])$/.test(n),new B.Vector3(1,1.714/1.9,1));
 const feetMaterial=new B.PBRMaterial('Appliance adjustable feet',scene);feetMaterial.albedoColor=new B.Color3(.025,.025,.025);feetMaterial.roughness=.8;
 for(const [group,x0,x1,z0,z1] of [[fridge,1.885,2.405,-2.614,-3.254],[freezer,1.845,2.405,-3.414,-3.894]]){
  for(const x of [x0,x1])for(const z of [z0,z1]){const foot=B.MeshBuilder.CreateCylinder('Appliance levelling foot',{diameter:.036,height:.035,tessellation:12},scene);foot.parent=group;foot.position.set(x,.0175,z);foot.material=feetMaterial;}
 }
 const microwave=resizeAssembly('Standard compact microwave proposal',n=>n.startsWith('Microwave')||n==='Interact_part_40',new B.Vector3(.374/.42,.275/.32,.489/.54),new B.Vector3(.30,.915,-3.65));
 function bounds(group){const min=new B.Vector3(Infinity,Infinity,Infinity),max=new B.Vector3(-Infinity,-Infinity,-Infinity);for(const m of group.getChildMeshes(false)){m.computeWorldMatrix(true);const b=m.getBoundingInfo().boundingBox;min.minimizeInPlace(b.minimumWorld);max.maximizeInPlace(b.maximumWorld);}return {min,max};}
 let envelope=bounds(microwave);microwave.scaling.multiplyInPlace(new B.Vector3(.374/(envelope.max.x-envelope.min.x),.275/(envelope.max.y-envelope.min.y),.489/(envelope.max.z-envelope.min.z)));
 envelope=bounds(microwave);microwave.position.x+=root.position.x+.30-(envelope.min.x+envelope.max.x)/2;microwave.position.z+=root.position.z-3.65-(envelope.min.z+envelope.max.z)/2;microwave.position.y+=.905-envelope.min.y;
}
function addSinkCabinet(){
 const p=new B.TransformNode('R05 sink cabinet replacement',scene);p.position.set(4.28,0,-4.139);p.rotation.y=Math.PI/2;
 const w=.69,d=.575,h=.75,box=apartment.box,M=apartment.materials;
 box('Sink base back',w,h,.018,0,.485,-d/2,M.white,p);
 for(const x of [-w/2,w/2])box('Sink base end',.018,h,d,x,.485,0,M.oak,p);
 box('Sink base floor',w,.022,d,0,.13,0,M.oak,p);box('Sink base plinth',w,.10,.035,0,.06,d/2-.05,M.walnut,p);
 for(let i=0;i<2;i++){
  const pivot=new B.TransformNode('R05 sink door '+i,scene);pivot.parent=p;pivot.position.set(-w/2+i*w/2,.12,d/2);
  box('Sink oak door',w/2-.008,.73,.022,w/4,.365,0,M.oak,pivot);
  box('Sink bronze pull',.006,.17,.018,w/2-.05,.58,.022,M.metal,pivot);
  registerApartmentPart(pivot,{id:'r05sink'+i,label:'Sink cabinet · '+(i+1),room:'KIT',kind:'hinge',axis:[0,1,0],amount:-1.5,category:'cabinet'});
 }
 box('Dishwasher north clearance filler',.575,.745,.086,4.2675,.49,-3.133,M.oak);
}
function finishApartment(){
 for(const footprint of apartment.details.obstacles)obstacles.push(footprint);
 function excludeTogether(a,b){const first=byId.get(a),second=byId.get(b);if(!first||!second)return;first.spec.conflicts=[...new Set([...(first.spec.conflicts||[]),b])];second.spec.conflicts=[...new Set([...(second.spec.conflicts||[]),a])];}
 excludeTogether('D08','B03_0');
 for(const drawer of ['part_01','part_02','part_03'])excludeTogether('part_26',drawer);
 // Consolidate static furniture by material. Hinged/sliding components stay separate.
 const buckets=new Map();
 for(const root of apartment.furniture){for(const m of root.getChildMeshes(false)){
   let n=m,interactive=false;while(n&&n!==root){if(byNode.has(n.name)){interactive=true;break;}n=n.parent;}
   if(interactive||!m.material||m.material.alpha<1||m.metadata?.mirrorSurface)continue;
   const key=m.material.uniqueId;if(!buckets.has(key))buckets.set(key,[]);buckets.get(key).push(m);
 }}
 for(const meshes of buckets.values()){if(meshes.length<2)continue;const material=meshes[0].material;const joined=B.Mesh.MergeMeshes(meshes,true,true,undefined,false,false);joined.name='Apartment static furniture · '+material.name;joined.material=material;joined.receiveShadows=true;}
 // Local ceiling fill uses room-limited light lists; daylight provides the shadows.
 for(const id of ['REC','MASTER','STUDY','CHILD','BATH','UTIL','WC','DRESS','HALL']){
   const r=APT.rooms[id].bounds,cx=(r[0]+r[2])/2000,cz=-(r[1]+r[3])/2000;
   const light=new B.PointLight(roomNames[id]+' ceiling fill',new B.Vector3(cx,2.55,cz),scene);
   light.diffuse=new B.Color3(1,.91,.78);light.intensity=id==='REC'?6:3;light.range=id==='REC'?7:4;
 }
 for(const m of scene.meshes){
  if(!m.getTotalVertices()||!m.isEnabled()||m===outside||m===roof)continue;
  m.receiveShadows=true;
  if(!m.metadata?.mirrorSurface&&m.material!==apartment.materials.glass&&!/floor|foundation|subfloor|threshold|glass|screen|Book spine|Leaf|diffuser/i.test(m.name)) daylightShadows.addShadowCaster(m,false);
 }
 const select=document.getElementById('roomSelect');
 for(const [id,label] of Object.entries(roomNames)){if(id==='ALL')continue;const o=document.createElement('option');o.value=id;o.textContent=label;select.appendChild(o);}
 select.onchange=()=>visitRoom(select.value);
 createFloorMap();refreshButtons();document.getElementById('partCount').textContent=states.length;
 document.getElementById('mapToggle').onclick=()=>{const body=document.getElementById('mapBody'),visible=getComputedStyle(body).display==='none';body.style.display=visible?'block':'none';document.getElementById('mapToggle').setAttribute('aria-expanded',String(visible));document.querySelector('#mapToggle span').textContent=visible?'−':'+';};
 document.getElementById('saveImage').onclick=()=>{scene.onAfterRenderObservable.addOnce(()=>canvas.toBlob(blob=>{if(!blob)return;const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download='Ibrahim-Merna-Apartment-R05.png';link.click();setTimeout(()=>URL.revokeObjectURL(url),10000);},'image/png'));};
 // R05 uses sheet Y down. Reflect geometry into Z down so an entrance view
 // preserves plan handedness (kitchen column east/right, side counter west/left).
 const planRoot=new B.TransformNode('R05 apartment coordinate frame',scene);planRoot.scaling.z=-1;
 for(const root of [...scene.rootNodes]){if(root!==planRoot&&!(root instanceof B.Camera)&&!(root instanceof B.Light))root.parent=planRoot;}
 for(const wall of apartment.walls)wall.center.z*=-1;
 for(const drape of apartment.details.drapes)drape.center.z*=-1;
 for(const light of scene.lights){light.position&&(light.position.z*=-1);light.direction&&(light.direction.z*=-1);}
 const reflectionMeshes=scene.meshes.filter(m=>m.getTotalVertices()>0&&!m.metadata?.mirrorSurface&&!m.metadata?.excludedArchitecture);
 for(const mirror of apartment.mirrors){
  mirror.surface.computeWorldMatrix(true);mirror.position=mirror.surface.getAbsolutePosition().clone();
  mirror.normal=B.Vector3.TransformNormal(new B.Vector3(0,0,1),mirror.surface.getWorldMatrix()).normalize();
  mirror.texture.mirrorPlane=B.Plane.FromPositionAndNormal(mirror.position,mirror.normal.scale(-1));
  mirror.texture.renderList=reflectionMeshes;mirror.texture.resetRefreshCounter();
 }
 lookYaw=-2.8;applyLook();
 updateRoomUI();shadowDirty=true;
 const spawnReport=Object.fromEntries(Object.entries(visits).map(([id,[x,y]])=>[id,valid(x,y)]));
 const attachmentAudit=[];
 for(const m of apartment.mirrors){
  const r=APT.rooms[m.room].bounds,dresser=m.surface.name==='Dressing wall mirror',west=m.surface.name.startsWith('B08');
  const distance=dresser?Math.abs(m.position.x-r[2]/1000):west?Math.abs(m.position.x-r[0]/1000):Math.abs(m.position.z-r[1]/1000);
  const expected=new B.Vector3(dresser?-1:west?1:0,0,dresser||west?0:1);
  attachmentAudit.push({item:m.surface.name,wallOffsetMm:Math.round(distance*1000),correct:distance<.03&&B.Vector3.Dot(m.normal,expected)>.99});
 }
 for(const f of APT.furniture.filter(f=>f.kind==='shower')){
  const parent=apartment.roots.get(f.id);parent.computeWorldMatrix(true);const d=f.d/1000,w=f.w/1000,gap=(f.y-APT.rooms[f.room].bounds[1])/1000;
  const mount=B.Vector3.TransformCoordinates(new B.Vector3(w/2-.14,1,-d/2-gap+.03),parent.getWorldMatrix());
  const front=B.Vector3.TransformCoordinates(new B.Vector3(0,1,d/2-.02),parent.getWorldMatrix());
  const offset=Math.abs(mount.z-APT.rooms[f.room].bounds[1]/1000);
  attachmentAudit.push({item:f.id+' shower fittings',wallOffsetMm:Math.round(offset*1000),glassSeparationMm:Math.round((front.z-mount.z)*1000),correct:offset<.031&&front.z-mount.z>.60});
 }
 document.body.dataset.attachmentAudit=JSON.stringify(attachmentAudit);
 const applianceAudit={};
 for(const [name,groupName] of [['fridge','Refrigerator height proposal 1850 mm'],['freezer','Upright freezer height proposal 1714 mm'],['microwave','Standard compact microwave proposal']]){
  const group=scene.getTransformNodeByName(groupName),min=new B.Vector3(Infinity,Infinity,Infinity),max=new B.Vector3(-Infinity,-Infinity,-Infinity);
  for(const mesh of group.getChildMeshes(false)){mesh.computeWorldMatrix(true);const b=mesh.getBoundingInfo().boundingBox;min.minimizeInPlace(b.minimumWorld);max.maximizeInPlace(b.maximumWorld);}
  applianceAudit[name]={widthMm:Math.round((max.z-min.z)*1000),depthMm:Math.round((max.x-min.x)*1000),heightMm:Math.round((max.y-min.y)*1000)};
 }
 document.body.dataset.applianceAudit=JSON.stringify(applianceAudit);
 const report={revision:'R05',furniture:APT.furniture.length,interactions:states.length,spawns:spawnReport,meshes:scene.meshes.length,ssao:!!ao,planters:apartment.details.planterCount,draperies:apartment.details.drapes.length,mirrors:apartment.mirrors.length};
 document.body.dataset.apartmentReport=JSON.stringify(report);
 let reportFrame=0;scene.onAfterRenderObservable.add(()=>{if(++reportFrame%120===0)document.body.dataset.apartmentPerformance=JSON.stringify({fps:Math.round(engine.getFps()),activeMeshes:scene.getActiveMeshes().length,mode,position:walker.position.asArray(),pointerLocked:document.pointerLockElement===canvas,openParts:states.filter(s=>s.target).length,invalidParts:states.filter(s=>!s.node.position.asArray().every(Number.isFinite)||!s.node.getWorldMatrix().asArray().every(Number.isFinite)).map(s=>s.spec.id)});});
}
function visitRoom(id){
 if(!ready)return;releaseForPanel();panelOpen=false;sceneOpen=false;updatePanels();selectedRoom=id;document.getElementById('roomSelect').value=id;
 if(id==='ALL'){changeMode('iso');orbit.setTarget(center.clone());orbit.radius=26;}
 else {
  const r=APT.rooms[id].bounds,c=new B.Vector3((r[0]+r[2])/2000,.65,(r[1]+r[3])/2000);
  if(mode==='iso'){orbit.setTarget(c);orbit.radius=Math.max(7.0,Math.max(r[2]-r[0],r[3]-r[1])/1000*2.55);}
  const [x,y,yaw]=visits[id];walker.position.set(x,eye,y);lookYaw=yaw;lookPitch=['WC','UTIL','BATH'].includes(id)?-.12:-.055;applyLook();
 }
 updateRoomUI();visibility();hint();
}
function updateRoomUI(){
 const r=APT.rooms[selectedRoom];document.getElementById('roomSize').textContent=r?`${((r.bounds[2]-r.bounds[0])/1000).toFixed(2)} × ${((r.bounds[3]-r.bounds[1])/1000).toFixed(2)} m`:'R05 · 2.75 m ceiling';
 document.querySelectorAll('.map-room').forEach(el=>el.classList.toggle('selected',el.dataset.room===selectedRoom));
}
function createFloorMap(){
 const svg=document.getElementById('floorMap'),ns='http://www.w3.org/2000/svg';
 const short={REC:'RECEPTION',KIT:'KITCHEN',UTIL:'BATH 2',MASTER:'MAIN',DRESS:'DRESS',STUDY:'FAMILY',CHILD:'CHILDREN',BATH:'BATH 1',WC:'WC',BAL:'BALCONY',BAY:'BALC.',HALL:'HALL'};
 for(const [id,r] of Object.entries(APT.rooms)){
   const [x,y,x1,y1]=r.bounds,rect=document.createElementNS(ns,'rect');
   Object.entries({x,y,width:x1-x,height:y1-y,class:'map-room',tabindex:0,role:'button','aria-label':'Explore '+(roomNames[id]||r.name)}).forEach(([k,v])=>rect.setAttribute(k,v));
   rect.dataset.room=id;if(id==='SHAFT'){rect.style.fill='#353535';rect.removeAttribute('tabindex');rect.removeAttribute('role');}else{rect.onclick=()=>visitRoom(id);rect.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();visitRoom(id);}};}svg.appendChild(rect);
   if(short[id]){const text=document.createElementNS(ns,'text');text.setAttribute('x',(x+x1)/2);text.setAttribute('y',(y+y1)/2+110);text.textContent=short[id];if(id==='BAY'){text.setAttribute('transform',`rotate(90 ${(x+x1)/2} ${(y+y1)/2})`);}svg.appendChild(text);}
 }
 for(const r of APT.columns){const e=document.createElementNS(ns,'rect');e.setAttribute('x',r[0]);e.setAttribute('y',r[1]);e.setAttribute('width',r[2]-r[0]);e.setAttribute('height',r[3]-r[1]);e.setAttribute('fill','#d0bfa1');svg.appendChild(e);}
 const marker=document.createElementNS(ns,'path');marker.id='mapMarker';marker.setAttribute('class','marker');marker.setAttribute('d','M0 -210 L155 160 L0 90 L-155 160 Z');svg.appendChild(marker);
}
function updateMapMarker(){const m=document.getElementById('mapMarker');if(!m)return;m.style.display=mode==='walk'?'':'none';m.setAttribute('transform',`translate(${walker.position.x*1000} ${walker.position.z*1000}) rotate(${lookYaw*180/Math.PI})`);}
let lastMirrorRefresh=0;
function updateMirrorReflections(){
 if(!apartment||mode!=='walk'||performance.now()-lastMirrorRefresh<150)return;
 const camera=walker.position,forward=walker.getForwardRay().direction;
 const visible=apartment.mirrors.map(m=>({mirror:m,to:m.position.subtract(camera)})).filter(v=>v.to.length()<6&&B.Vector3.Dot(v.to.normalizeToNew(),forward)>.25&&B.Vector3.Dot(v.mirror.normal,camera.subtract(v.mirror.position))>0).sort((a,b)=>a.to.lengthSquared()-b.to.lengthSquared());
 if(visible.length){visible[0].mirror.texture.resetRefreshCounter();lastMirrorRefresh=performance.now();}
}
