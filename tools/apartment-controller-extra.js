// R05 apartment navigation and reusable room/furniture interactions.
const roomNames={ALL:'Entire apartment',REC:'Reception & dining',KIT:'Kitchen',UTIL:'Bathroom 2 & laundry',MASTER:'Main bedroom',DRESS:'Dressing room',STUDY:'Family & study',CHILD:'Children’s bedroom',BATH:'Bathroom 1',WC:'Guest WC',BAL:'Reception balcony',BAY:'Bedroom balcony',HALL:'Hallway'};
const visits={REC:[3.15,1.50,-2.80],KIT:[5.22,5.20,0],UTIL:[8.12,5.17,-.35],MASTER:[11.23,6.52,Math.PI],DRESS:[11.50,1.14,0],STUDY:[6.80,8.35,Math.PI],CHILD:[8.12,8.40,Math.PI/2],BATH:[9.88,1.18,-1.3],WC:[4.48,.55,1.8],BAL:[1.90,11.02,0],BAY:[12.0,8.36,0],HALL:[7.0,6.48,Math.PI/2]};
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
 // Consolidate static furniture by material. Hinged/sliding components stay separate.
 const buckets=new Map();
 for(const root of apartment.furniture){for(const m of root.getChildMeshes(false)){
   let n=m,interactive=false;while(n&&n!==root){if(byNode.has(n.name)){interactive=true;break;}n=n.parent;}
   if(interactive||!m.material||m.material.alpha<1)continue;
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
  if(m.material!==apartment.materials.glass&&!/floor|foundation|subfloor|threshold|glass|screen|Book spine|Leaf|diffuser/i.test(m.name)) daylightShadows.addShadowCaster(m,false);
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
 for(const light of scene.lights){light.position&&(light.position.z*=-1);light.direction&&(light.direction.z*=-1);}
 lookYaw=-2.8;applyLook();
 updateRoomUI();shadowDirty=true;
 const spawnReport=Object.fromEntries(Object.entries(visits).map(([id,[x,y]])=>[id,valid(x,y)]));
 const report={revision:'R05',furniture:APT.furniture.length,interactions:states.length,spawns:spawnReport,meshes:scene.meshes.length,ssao:!!ao};
 document.body.dataset.apartmentReport=JSON.stringify(report);
 let reportFrame=0;scene.onAfterRenderObservable.add(()=>{if(++reportFrame%120===0)document.body.dataset.apartmentPerformance=JSON.stringify({fps:Math.round(engine.getFps()),activeMeshes:scene.getActiveMeshes().length,mode,position:walker.position.asArray(),pointerLocked:document.pointerLockElement===canvas,openParts:states.filter(s=>s.target).length,invalidParts:states.filter(s=>!s.node.position.asArray().every(Number.isFinite)||!s.node.getWorldMatrix().asArray().every(Number.isFinite)).map(s=>s.spec.id)});});
}
function visitRoom(id){
 if(!ready)return;releaseForPanel();panelOpen=false;sceneOpen=false;updatePanels();selectedRoom=id;document.getElementById('roomSelect').value=id;
 if(id==='ALL'){changeMode('iso');orbit.setTarget(center.clone());orbit.radius=26;}
 else {
  const r=APT.rooms[id].bounds,c=new B.Vector3((r[0]+r[2])/2000,.65,(r[1]+r[3])/2000);
  if(mode==='iso'){orbit.setTarget(c);orbit.radius=Math.max(7.0,Math.max(r[2]-r[0],r[3]-r[1])/1000*2.55);}
  const [x,y,yaw]=visits[id];walker.position.set(x,eye,y);lookYaw=yaw;lookPitch=-.055;applyLook();
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
