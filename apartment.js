
'use strict';
const APT=window.APARTMENT; let apartment=null,selectedRoom='ALL';
const B=BABYLON, canvas=document.getElementById('view');
const touchDevice=matchMedia('(pointer:coarse)').matches||navigator.maxTouchPoints>0||matchMedia('(max-width:620px)').matches;document.body.classList.toggle('touch-device',touchDevice);let touchGesture=null;const activeTouches=new Set(),touchPoints=new Map();let isoPinch=null;
const engine=new B.Engine(canvas,true,{preserveDrawingBuffer:true,stencil:true});
const scene=new B.Scene(engine);scene.useRightHandedSystem=true;scene.clearColor=new B.Color4(.93,.93,.9,1);
const CONFIG={"room":{"width":2.5,"depth":4.0,"height":2.75},"interactions":[{"id":"part_01","node":"Interact_part_01","label":"West cooking storage drawer 1","kind":"slide","axis":[1,0,0],"amount":0.4,"category":"drawer","requires":null,"conflicts":["corner_base"],"room":"KIT"},{"id":"part_02","node":"Interact_part_02","label":"West cooking storage drawer 2","kind":"slide","axis":[1,0,0],"amount":0.4,"category":"drawer","requires":null,"conflicts":["corner_base"],"room":"KIT"},{"id":"part_03","node":"Interact_part_03","label":"West cooking storage drawer 3","kind":"slide","axis":[1,0,0],"amount":0.4,"category":"drawer","requires":null,"conflicts":["corner_base"],"room":"KIT"},{"id":"part_04","node":"Interact_part_04","label":"West utility storage door 1","kind":"hinge","axis":[0,1,0],"amount":-1.5707963267948966,"category":"cabinet","requires":null,"room":"KIT"},{"id":"part_07","node":"Interact_part_07","label":"Entrance drawer cabinet drawer 1","kind":"slide","axis":[1,0,0],"amount":0.4,"category":"drawer","requires":null,"room":"KIT"},{"id":"part_08","node":"Interact_part_08","label":"Entrance drawer cabinet drawer 2","kind":"slide","axis":[1,0,0],"amount":0.4,"category":"drawer","requires":null,"room":"KIT"},{"id":"part_09","node":"Interact_part_09","label":"Entrance drawer cabinet drawer 3","kind":"slide","axis":[1,0,0],"amount":0.4,"category":"drawer","requires":null,"room":"KIT"},{"id":"part_14","node":"Interact_part_14","label":"Column shallow cabinet 1 door","kind":"hinge","axis":[0,1,0],"amount":1.5707963267948966,"category":"cabinet","requires":null,"room":"KIT"},{"id":"part_15","node":"Interact_part_15","label":"Column shallow cabinet 2 door","kind":"hinge","axis":[0,1,0],"amount":1.5707963267948966,"category":"cabinet","requires":null,"room":"KIT"},{"id":"part_16","node":"Interact_part_16","label":"Column shallow cabinet 3 door","kind":"hinge","axis":[0,1,0],"amount":1.5707963267948966,"category":"cabinet","requires":null,"room":"KIT"},{"id":"part_17","node":"Interact_part_17","label":"Column shallow cabinet 4 door","kind":"hinge","axis":[0,1,0],"amount":1.5707963267948966,"category":"cabinet","requires":null,"room":"KIT"},{"id":"part_18","node":"Interact_part_18","label":"Upper cabinet 1-1 door","kind":"hinge","axis":[0,1,0],"amount":-1.5707963267948966,"category":"upper","requires":null,"conflicts":["corner_upper"],"room":"KIT"},{"id":"part_19","node":"Interact_part_19","label":"Upper cabinet 2-1 door","kind":"hinge","axis":[0,1,0],"amount":-1.5707963267948966,"category":"upper","requires":null,"room":"KIT"},{"id":"part_20","node":"Interact_part_20","label":"Upper cabinet 3-1 door","kind":"hinge","axis":[0,1,0],"amount":-1.5707963267948966,"category":"upper","requires":null,"room":"KIT"},{"id":"part_21","node":"Interact_part_21","label":"Upper cabinet 4-1 door","kind":"hinge","axis":[0,1,0],"amount":-1.5707963267948966,"category":"upper","requires":null,"room":"KIT"},{"id":"part_22","node":"Interact_part_22","label":"Upper cabinet 4-2 door","kind":"hinge","axis":[0,1,0],"amount":-1.5707963267948966,"category":"upper","requires":null,"room":"KIT"},{"id":"part_23","node":"Interact_part_23","label":"Dishwasher rack lower","kind":"slide","axis":[1,0,0],"amount":0.38,"category":"rack","requires":"dishwasher_door","room":"KIT"},{"id":"part_24","node":"Interact_part_24","label":"Dishwasher rack upper","kind":"slide","axis":[1,0,0],"amount":0.38,"category":"rack","requires":"dishwasher_door","room":"KIT"},{"id":"part_25","node":"Interact_part_25","label":"Dishwasher door","kind":"hinge","axis":[0,0,-1],"amount":1.5707963267948966,"category":"appliance","requires":null,"room":"KIT"},{"id":"part_26","node":"Interact_part_26","label":"Stove oven door","kind":"hinge","axis":[1,0,0],"amount":-1.5707963267948966,"category":"appliance","requires":null,"room":"KIT"},{"id":"part_27","node":"Interact_part_27","label":"Refrigerator lower compartment","kind":"hinge","axis":[0,1,0],"amount":-1.5707963267948966,"category":"appliance","requires":null,"room":"KIT"},{"id":"part_28","node":"Interact_part_28","label":"Refrigerator main door","kind":"hinge","axis":[0,1,0],"amount":-1.5707963267948966,"category":"appliance","requires":null,"room":"KIT"},{"id":"part_38","node":"Interact_part_38","label":"Concealed extractor cabinet left door","kind":"hinge","axis":[0,1,0],"amount":1.5707963267948966,"category":"upper","requires":null,"wall":"north","room":"KIT"},{"id":"part_39","node":"Interact_part_39","label":"Concealed extractor cabinet right door","kind":"hinge","axis":[0,1,0],"amount":-1.5707963267948966,"category":"upper","requires":null,"wall":"north","room":"KIT"},{"id":"part_40","node":"Interact_part_40","label":"Microwave door","kind":"hinge","axis":[0,1,0],"amount":1.5707963267948966,"category":"appliance","requires":null,"room":"KIT"},{"id":"corner_upper","node":"Interact_corner_upper","label":"Front corner cabinet door","kind":"hinge","axis":[0,1,0],"amount":-1.5707963267948966,"category":"upper","requires":null,"wall":"corner","conflicts":["part_18"],"room":"KIT"},{"id":"corner_base","node":"Interact_corner_base","label":"Stove-side corner cabinet door","kind":"hinge","axis":[0,1,0],"amount":-1.5707963267948966,"category":"cabinet","requires":null,"conflicts":["part_01","part_02","part_03"],"room":"KIT"},{"id":"corner_window","node":"Interact_corner_window","label":"Window-side corner cabinet door","kind":"hinge","axis":[0,1,0],"amount":-1.5707963267948966,"category":"cabinet","requires":null,"room":"KIT"}],"obstacles":[[1.885,2.5,0.6,4.0],[0.0,2.5,0,0.6],[0.0,0.6102028241335038,0,2.5288831835686785],[0.02499999999999991,0.685,2.5438831835686786,3.323883183568679],[0.02499999999999991,0.7249999999999999,3.343883183568679,3.963883183568679]],"sink":{"yMin":2.1092297817715027,"yMax":2.6892297817715027},"dishwasher":{"yMin":2.7984595635430054,"yMax":3.3984595635430055},"appliances":{"fridge":{"width":0.78,"depth":0.66,"heightAssumed":1.85},"dishwasher":{"width":0.6,"depth":0.58,"heightAssumed":0.865},"stove":{"width":0.9,"depth":0.53,"heightAssumed":0.91},"uprightFreezer":{"width":0.62,"depth":0.7,"heightAssumed":1.714},"microwave":{"widthAssumed":0.489,"depthAssumed":0.374,"heightAssumed":0.275,"location":"Left counter beside entrance"}},"mirrored":false,"frontCabinets":{"baseHeight":1.7,"topHeight":2.48,"depth":0.382,"extractorUnderside":1.68,"extractorWidth":0.9,"windowClearance":0.02},"corners":{"upperBase":1.7,"upperTop":2.48,"upperFiller":0.056,"baseFiller":0.06,"style":"Square 90 degree blind returns with straight cabinet doors","protectedArchitectureUnchanged":true}},W=12.72,D=11.56,eye=1.65;
const entrance=new B.Vector3(3.15,eye,1.50), center=new B.Vector3(W/2,.7,D/2);
const orbit=new B.ArcRotateCamera('Isometric',Math.PI*.75,Math.acos(1/Math.sqrt(3)),26,center.clone(),scene);
orbit.mode=B.Camera.ORTHOGRAPHIC_CAMERA;orbit.minZ=.03;orbit.lowerRadiusLimit=4;orbit.upperRadiusLimit=46;orbit.lowerBetaLimit=.12;orbit.upperBetaLimit=1.46;orbit.wheelPrecision=12;orbit.panningSensibility=55;orbit.inertia=.72;
const walker=new B.UniversalCamera('Walk inside',entrance.clone(),scene);walker.minZ=.025;walker.fov=1.10;
walker.setTarget(new B.Vector3(1.9,eye,-5));walker.inputs.removeByType('FreeCameraKeyboardMoveInput');
walker.inputs.removeByType('FreeCameraMouseInput');walker.inputs.removeByType('FreeCameraTouchInput');walker.inertia=0;
let exploring=false,hadPointerLock=false,lookYaw=0,lookPitch=0,lastLook=null;const lookSpeed=.0035;
function applyLook(){const cp=Math.cos(lookPitch);walker.setTarget(walker.position.add(new B.Vector3(Math.sin(lookYaw)*cp,Math.sin(lookPitch),-Math.cos(lookYaw)*cp)))}
const cursorStyle=document.createElement('style');cursorStyle.textContent='body.exploring #view{cursor:none !important}';document.head.appendChild(cursorStyle);
const sky=new B.HemisphericLight('Soft reflected light',new B.Vector3(0,1,0),scene);sky.intensity=.48;sky.diffuse=new B.Color3(1,.97,.93);sky.groundColor=new B.Color3(.70,.62,.51);
const sun=new B.DirectionalLight('Window daylight',new B.Vector3(-.48,-.83,.37),scene);sun.position=new B.Vector3(14,16,-16);sun.intensity=2.6;sun.diffuse=new B.Color3(1,.94,.81);sun.shadowMinZ=.1;sun.shadowMaxZ=45;sun.autoCalcShadowZBounds=true;
const inside=new B.SpotLight('Soft ceiling light',new B.Vector3(5.23,2.69,-3.69),new B.Vector3(0,-1,0),2.3,1,scene);inside.intensity=10;inside.diffuse=new B.Color3(1,.90,.77);inside.range=8;
const fill=new B.PointLight('Entry reflected light',new B.Vector3(5.23,2.3,-5.2),scene);fill.intensity=2;fill.diffuse=new B.Color3(1,.94,.85);fill.range=6;
const taskLights=[];for(const z of [-1.35,-2.65,-3.55]){const l=new B.SpotLight('Warm cabinet light '+z,new B.Vector3(4.26,1.685,z-1.69),new B.Vector3(-.12,-1,0),2.4,1,scene);l.intensity=3;l.diffuse=new B.Color3(1,.80,.57);l.range=2.3;taskLights.push(l)}
const hoodLight=new B.SpotLight('Hood work light',new B.Vector3(5.26,1.665,-1.91),new B.Vector3(0,-1,0),2.05,1,scene);hoodLight.intensity=.20;hoodLight.diffuse=new B.Color3(1,.82,.59);hoodLight.range=2;
const roof=B.MeshBuilder.CreateBox('Viewer ceiling',{width:W+.24,height:.08,depth:D+.24},scene);roof.position=new B.Vector3(W/2,2.79,-D/2);const roofmat=new B.PBRMaterial('Ceiling finish',scene);roofmat.albedoColor=new B.Color3(.79,.76,.70);roofmat.roughness=.85;roofmat.metallic=0;roofmat.maxSimultaneousLights=8;roof.material=roofmat;
const envURL='assets/Kitchen_environment.hdr';scene.environmentTexture=new B.HDRCubeTexture(envURL,scene,128,false,true,false,true);scene.environmentTexture.rotationY=0;scene.environmentIntensity=.85;
const daylightShadows=new B.ShadowGenerator(touchDevice?2048:4096,sun);daylightShadows.usePercentageCloserFiltering=true;daylightShadows.filteringQuality=B.ShadowGenerator.QUALITY_MEDIUM;daylightShadows.bias=.0002;daylightShadows.normalBias=.004;daylightShadows.setDarkness(.18);
const ceilingShadows=new B.ShadowGenerator(1024,inside);ceilingShadows.usePercentageCloserFiltering=true;ceilingShadows.filteringQuality=B.ShadowGenerator.QUALITY_MEDIUM;ceilingShadows.bias=.0002;ceilingShadows.normalBias=.006;ceilingShadows.setDarkness(.15);
const imageSettings=scene.imageProcessingConfiguration;imageSettings.toneMappingEnabled=true;imageSettings.toneMappingType=B.ImageProcessingConfiguration.TONEMAPPING_ACES;imageSettings.exposure=.91;imageSettings.contrast=1.04;
const pipeline=new B.DefaultRenderingPipeline('Photographic finish',true,scene,[walker,orbit]);pipeline.samples=4;pipeline.fxaaEnabled=false;pipeline.bloomEnabled=false;
const ao=B.SSAO2RenderingPipeline.IsSupported ? new B.SSAO2RenderingPipeline('Contact shadows',scene,{ssaoRatio:.75,blurRatio:1},[walker,orbit]) : null;if(ao){ao.radius=.16;ao.totalStrength=.60;ao.samples=16;ao.expensiveBlur=false;ao.maxZ=50;}
daylightShadows.getShadowMap().refreshRate=0;ceilingShadows.getShadowMap().refreshRate=0;let shadowDirty=true,shadowWarmup=0,lastPick=0,sunStrength=2.6;
const ledMaterial=new B.PBRMaterial('Warm concealed LED',scene);ledMaterial.albedoColor=new B.Color3(1,.76,.45);ledMaterial.emissiveColor=new B.Color3(.7,.42,.18);ledMaterial.unlit=true;
const hoodStrip=B.MeshBuilder.CreateBox('Hood warm light strip',{width:.62,height:.006,depth:.12},scene);hoodStrip.position=new B.Vector3(5.26,1.678,-1.91);hoodStrip.material=ledMaterial;
const outside=B.MeshBuilder.CreatePlane('Garden view beyond existing window',{width:.70,height:1.22},scene);outside.position=new B.Vector3(2.17,1.7,.12);const outdoorMat=new B.StandardMaterial('Soft outdoor view',scene);const outdoorTex=new B.Texture('assets/Kitchen_AI_Visualization.png',scene,false,true);outdoorTex.uScale=.018;outdoorTex.uOffset=.378;outdoorTex.vScale=.202;outdoorTex.vOffset=.514;outdoorMat.diffuseTexture=outdoorTex;outdoorMat.emissiveTexture=outdoorTex;outdoorMat.emissiveColor=new B.Color3(.85,.85,.85);outdoorMat.disableLighting=true;outdoorMat.backFaceCulling=false;outside.material=outdoorMat;
const floorNormal=new B.Texture('assets/Floor_normal.png',scene),oakNormal=new B.Texture('assets/Oak_normal.png',scene),ivoryNormal=new B.Texture('assets/Ivory_normal.png',scene),ivoryColor=new B.Texture('assets/Ivory_stone.png',scene);
if(CONFIG.mirrored){for(const object of [sun,inside,fill,...taskLights,hoodLight,hoodStrip,outside]){object.position.x=W-object.position.x;if(object.direction)object.direction.x*=-1}}
for(const texture of [floorNormal,oakNormal,ivoryNormal]){texture.gammaSpace=false;texture.anisotropicFilteringLevel=8}floorNormal.level=.12;oakNormal.level=.08;ivoryNormal.level=.045;
roof.setEnabled(false);outside.setEnabled(false);
let parts=[],mode='iso',ready=false,lastPointer=null,panelOpen=false,sceneOpen=false,lookTarget=null;
const states=[],byNode=new Map(),byId=new Map(),semantic=new Map();let dynamicObstacles=[];
const panel=document.createElement('aside');panel.id='partsPanel';panel.setAttribute('aria-label','Doors and drawers');panel.innerHTML='<div class="panel-head"><h2>Doors & drawers</h2><button id="partsClose" class="panel-close" aria-label="Close doors panel"><svg viewBox="0 0 20 20"><path d="M4 4l12 12M16 4L4 16"/></svg></button></div><p>Select a compartment to open or close it.</p><div id="partList"></div>';document.querySelector('main').appendChild(panel);
const scenePanel=document.getElementById('scenePanel');
const interactHud=document.createElement('div');interactHud.id='interactHud';interactHud.innerHTML='<span class="interaction-label"></span><button>Open</button><small></small>';document.querySelector('main').appendChild(interactHud);
const keys=new Set();const automatic=document.getElementById('auto');
const groups={west:[],east:[],north:[],south:[],uppers:[],corners:[]};
function classify(m){const n=m.name;if(n.startsWith('West wall'))(CONFIG.mirrored?groups.east:groups.west).push(m);if(n.startsWith('East wall'))(CONFIG.mirrored?groups.west:groups.east).push(m);if(/^(North |Window (?!corner)|Quartz window|Front upper )/.test(n))groups.north.push(m);if(/^(Entry |Oak entry|Door leaf)/.test(n))groups.south.push(m);if(/^(Upper |Under cabinet |West quartz backsplash)/.test(n))groups.uppers.push(m);if(n.startsWith('Corner upper '))groups.corners.push(m)}
function setGroup(group,visible){for(const m of group){if(m.isEnabled(false)!==visible){m.setEnabled(visible);shadowDirty=true}}}
function visibility(){
 roof.setEnabled(false);outside.setEnabled(false);
 sky.intensity=mode==='walk'?.48:.66;scene.environmentIntensity=mode==='walk'?.62:.72;
 sun.intensity=sunStrength*(mode==='iso'?.72:1);inside.setEnabled(mode==='walk');fill.setEnabled(mode==='walk');
 for(const light of taskLights)light.setEnabled(mode==='walk');hoodLight.setEnabled(mode==='walk');hoodStrip.setEnabled(mode==='walk');
 const full=mode==='walk'||!automatic.checked;
 if(apartment){
   const view=orbit.position.subtract(orbit.target).normalize();
   for(const wall of apartment.walls){
     const v=wall.center.subtract(orbit.target),near=B.Vector3.Dot(v,view)>.12;
     const on= !wall.forcedHidden&&(full||!near);
     if(wall.mesh.isEnabled()!==on){wall.mesh.setEnabled(on);shadowDirty=true;}
     if(wall.skirting)wall.skirting.setEnabled(!wall.forcedHidden);
   }
   for(const c of apartment.ceilings)c.setEnabled(mode==='walk');
   for(const drape of apartment.details.drapes)drape.node.setEnabled(full||B.Vector3.Dot(drape.center.subtract(orbit.target),view)<=.12);
 }
 for(const m of parts){if(m.name.startsWith('Ceiling recessed'))m.setEnabled(mode==='walk');}
 for(const g of [groups.uppers,groups.corners])setGroup(g,full||orbit.position.x>4.5);
}

function hint(){
 const locked=document.pointerLockElement===canvas;
 document.getElementById('lock').style.display=ready&&mode==='walk'&&!exploring&&!panelOpen&&!sceneOpen?'block':'none';
 document.getElementById('hintTitle').textContent=mode==='walk'?'Walk inside':'Isometric view';
 document.querySelector('#lock p').innerHTML=touchDevice?'Use the arrows to move. Swipe the room to look around.<br>Tap Open to use a door or drawer.<br>Tap Pause to return to the controls.':'Move with <span class="key">W A S D</span> or the arrow keys.<br>Look around with your mouse. Press <span class="key">E</span> to open.<br><span class="key">ESC</span> releases your mouse.';document.getElementById('start').firstChild.textContent=touchDevice?'Tap to explore':'Click to explore';
 document.getElementById('hintText').innerHTML=touchDevice?(mode==='walk'?'Arrows to move · Swipe to look<br>Tap Open to interact · Pause to stop':'Drag to rotate · Pinch to zoom<br>Tap a door or drawer to open'):mode==='walk'?'<span class="key">W A S D</span> Move &nbsp; <span class="key">SHIFT</span> Faster<br><span class="key">E</span> Open / close &nbsp; <span class="key">ESC</span> Pause':'Drag to rotate · Scroll to zoom<br>Right-drag to pan · Click to open';
}
function changeMode(next){
 keys.clear();exploring=false;lastLook=null;document.body.classList.remove('exploring');lastPointer=null;lookTarget=null;if(document.pointerLockElement)document.exitPointerLock();
 walker.detachControl();orbit.detachControl();mode=next;document.body.classList.toggle('walk',mode==='walk');
 if(mode==='walk'){scene.activeCamera=walker;walker.attachControl(canvas,true)}else{scene.activeCamera=orbit;orbit.attachControl(canvas,true)}
 document.getElementById('walk').classList.toggle('active',mode==='walk');document.getElementById('iso').classList.toggle('active',mode==='iso');automatic.disabled=mode==='walk';document.getElementById('reset').title=mode==='walk'?'Return to entrance':'Reset view';showTarget(null);visibility();hint();
}
function reset(){keys.clear();orbit.inertialAlphaOffset=0;orbit.inertialBetaOffset=0;orbit.inertialRadiusOffset=0;orbit.inertialPanningX=0;orbit.inertialPanningY=0;if(mode==='walk'){selectedRoom='REC';document.getElementById('roomSelect').value='REC';updateRoomUI();walker.position.copyFrom(entrance);lookYaw=-2.80;lookPitch=0;applyLook();walker.cameraRotation.set(0,0)}else{selectedRoom='ALL';document.getElementById('roomSelect').value='ALL';updateRoomUI();orbit.setTarget(center.clone());orbit.alpha=Math.PI*.75;orbit.beta=Math.acos(1/Math.sqrt(3));orbit.radius=26}visibility()}
async function captureMouse(){
 if(mode!=='walk'||!ready)return;canvas.focus();exploring=true;lastLook=null;document.body.classList.add('exploring');const direction=walker.getForwardRay().direction;lookYaw=Math.atan2(direction.x,-direction.z);lookPitch=Math.asin(Math.max(-1,Math.min(1,direction.y)));hint();
 try{if(!touchDevice&&canvas.requestPointerLock)await canvas.requestPointerLock()}catch(e){}hint();
}
canvas.addEventListener('pointermove',e=>{if(e.pointerType==='touch'&&touchPoints.has(e.pointerId)){touchPoints.set(e.pointerId,{x:e.clientX,y:e.clientY});if(mode==='iso'&&isoPinch&&touchPoints.size===2){const [a,b]=[...touchPoints.values()];const distance=Math.hypot(a.x-b.x,a.y-b.y);if(distance>10){orbit.radius=Math.max(orbit.lowerRadiusLimit,Math.min(orbit.upperRadiusLimit,isoPinch.radius*isoPinch.distance/distance));orbit.inertialRadiusOffset=0}}}if(lastPointer?.id===e.pointerId&&Math.hypot(e.clientX-lastPointer.x,e.clientY-lastPointer.y)>8)lastPointer.dragged=true;if(mode!=='walk'||!exploring)return;let dx=0,dy=0;if(e.pointerType==='touch'){if(!touchGesture||touchGesture.id!==e.pointerId)return;dx=e.clientX-touchGesture.x;dy=e.clientY-touchGesture.y;touchGesture.x=e.clientX;touchGesture.y=e.clientY;e.preventDefault()}else{if(document.pointerLockElement===canvas){dx=e.movementX;dy=e.movementY}else if(lastLook){dx=e.clientX-lastLook.x;dy=e.clientY-lastLook.y}lastLook={x:e.clientX,y:e.clientY}}lookYaw+=Math.max(-160,Math.min(160,dx))*lookSpeed;lookPitch-=Math.max(-160,Math.min(160,dy))*lookSpeed;lookPitch=Math.max(-Math.PI/2+.025,Math.min(Math.PI/2-.025,lookPitch));applyLook()});
canvas.addEventListener('pointerleave',()=>{lastLook=null});
document.getElementById('walk').onclick=()=>changeMode('walk');document.getElementById('iso').onclick=()=>changeMode('iso');document.getElementById('reset').onclick=reset;automatic.onchange=visibility;
document.getElementById('start').onclick=()=>{panelOpen=false;sceneOpen=false;updatePanels();captureMouse()};document.addEventListener('pointerlockchange',()=>{if(document.pointerLockElement===canvas)hadPointerLock=true;else if(hadPointerLock){hadPointerLock=false;exploring=false;keys.clear();document.body.classList.remove('exploring')}hint()});
function updatePanels(){panel.style.display=panelOpen?'block':'none';scenePanel.style.display=sceneOpen?'block':'none';for(const [id,value] of [['parts',panelOpen],['scene',sceneOpen]]){document.getElementById(id).classList.toggle('active',value);document.getElementById(id).setAttribute('aria-expanded',String(value))}hint()}
function releaseForPanel(){exploring=false;touchGesture=null;lastPointer=null;keys.clear();document.body.classList.remove('exploring');if(document.pointerLockElement)document.exitPointerLock()}
document.getElementById('pauseTouch').onclick=()=>{releaseForPanel();hint()};
document.getElementById('parts').onclick=()=>{panelOpen=!panelOpen;sceneOpen=false;releaseForPanel();updatePanels()};document.getElementById('scene').onclick=()=>{sceneOpen=!sceneOpen;panelOpen=false;releaseForPanel();updatePanels()};document.getElementById('sceneClose').onclick=()=>{sceneOpen=false;updatePanels()};document.getElementById('partsClose').onclick=()=>{panelOpen=false;updatePanels()};document.getElementById('closeAll').onclick=()=>states.forEach(s=>setOpen(s,false));
function updateSun(){const value=Number(document.getElementById('sunLevel').value);sunStrength=document.getElementById('sunEnabled').checked?value*(2.6/70):0;visibility();document.getElementById('sunValue').textContent=value+'%';shadowDirty=true}document.getElementById('sunEnabled').onchange=updateSun;document.getElementById('sunLevel').oninput=updateSun;
canvas.addEventListener('pointerdown',e=>{if(e.pointerType==='touch'){activeTouches.add(e.pointerId);touchPoints.set(e.pointerId,{x:e.clientX,y:e.clientY});if(activeTouches.size>1){lastPointer=null;if(mode==='iso'&&touchPoints.size===2){const [a,b]=[...touchPoints.values()];isoPinch={distance:Math.hypot(a.x-b.x,a.y-b.y),radius:orbit.radius}}return}if(mode==='walk'&&exploring){touchGesture={id:e.pointerId,x:e.clientX,y:e.clientY};canvas.setPointerCapture(e.pointerId)}}lastPointer={id:e.pointerId,x:e.clientX,y:e.clientY,dragged:false}});
canvas.addEventListener('pointerup',e=>{activeTouches.delete(e.pointerId);touchPoints.delete(e.pointerId);if(touchPoints.size<2)isoPinch=null;if(touchGesture?.id===e.pointerId)touchGesture=null;if(e.button!==0)return;const tapped=lastPointer?.id===e.pointerId&&!lastPointer.dragged&&Math.hypot(e.clientX-lastPointer.x,e.clientY-lastPointer.y)<8;if(mode==='iso'&&tapped){const rect=canvas.getBoundingClientRect(),x=(e.clientX-rect.left)*engine.getRenderWidth()/rect.width,y=(e.clientY-rect.top)*engine.getRenderHeight()/rect.height;const pick=scene.pick(x,y,m=>m.isEnabled()&&m.isVisible);const s=pick?.hit?stateFor(pick.pickedMesh):null;if(s){lookTarget=s;setOpen(s,!s.target);showTarget(s)}}else if(mode==='walk'&&tapped){if(exploring){if(lookTarget)setOpen(lookTarget,!lookTarget.target)}else{panelOpen=false;sceneOpen=false;updatePanels();captureMouse()}}lastPointer=null});
function cancelCanvasTouch(e){activeTouches.delete(e.pointerId);touchPoints.delete(e.pointerId);if(touchPoints.size<2)isoPinch=null;if(touchGesture?.id===e.pointerId)touchGesture=null;if(lastPointer?.id===e.pointerId)lastPointer=null}canvas.addEventListener('pointercancel',cancelCanvasTouch);canvas.addEventListener('lostpointercapture',cancelCanvasTouch);
document.getElementById('fullscreen').onclick=async()=>{try{if(!document.fullscreenElement)await document.documentElement.requestFullscreen();else await document.exitFullscreen()}catch(e){}engine.resize()};
canvas.addEventListener('contextmenu',e=>e.preventDefault());
window.addEventListener('keydown',e=>{if(e.code==='Escape'){exploring=false;keys.clear();lastLook=null;document.body.classList.remove('exploring');if(document.pointerLockElement)document.exitPointerLock();panelOpen=false;sceneOpen=false;updatePanels()}if(e.code==='KeyE'&&!e.repeat&&mode==='walk'&&lookTarget){setOpen(lookTarget,!lookTarget.target);e.preventDefault()}if(['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','ShiftLeft','ShiftRight'].includes(e.code)){if(mode==='walk'&&exploring){keys.add(e.code);e.preventDefault()}}});window.addEventListener('keyup',e=>keys.delete(e.code));window.addEventListener('blur',()=>keys.clear());document.addEventListener('visibilitychange',()=>keys.clear());
for(const btn of document.querySelectorAll('[data-key]')){const stop=()=>{keys.delete(btn.dataset.key);btn.classList.remove('pressed')};btn.addEventListener('pointerdown',e=>{if(mode!=='walk'||!ready)return;btn.setPointerCapture(e.pointerId);keys.add(btn.dataset.key);btn.classList.add('pressed');e.preventDefault()});btn.addEventListener('pointerup',stop);btn.addEventListener('pointercancel',stop);btn.addEventListener('lostpointercapture',stop)}
// Physical walking footprint: wall bounds plus the PDF-traced cabinetry and appliances.
const obstacles=APT.obstacles.map(r=>[r[0]/1000,r[2]/1000,r[1]/1000,r[3]/1000]);
for(const f of APT.furniture){if(!f.overhead&&f.kind!=='sink'&&f.kind!=='microwave'&&f.kind!=='shower'){
 if(f.kind==='l_sofa'){obstacles.push([4.03,7.03,10.51,11.51],[4.03,5.03,9.51,10.51]);}
 else obstacles.push([f.x/1000,(f.x+f.w)/1000,f.y/1000,(f.y+f.d)/1000]);
}}
for(const f of APT.furniture.filter(f=>f.kind==='shower')){const door=Math.min(.70,f.w/1000-.25);obstacles.push([f.x/1000,(f.x+f.w)/1000-door,(f.y+f.d)/1000-.024,(f.y+f.d)/1000-.016]);}
for(const win of APT.windows.filter(w=>w.slider)){const r=win.bounds;obstacles.push([(r[0]+r[2])/2000,r[2]/1000,r[1]/1000,r[3]/1000]);}
const bodyRadius=.14;
function valid(x,z){const y=z;if(x<bodyRadius||x>W-bodyRadius||y<bodyRadius||y>D-bodyRadius)return false;
 const shaft=APT.rooms.SHAFT.bounds;if(x>shaft[0]/1000&&x<shaft[2]/1000&&y<shaft[3]/1000)return false;
 for(const [x0,x1,y0,y1]of [...obstacles,...dynamicObstacles]){const nearX=Math.max(x0,Math.min(x,x1)),nearY=Math.max(y0,Math.min(y,y1));if((x-nearX)**2+(y-nearY)**2<bodyRadius**2)return false;}return true;}

function stepWalk(dt){
 if(mode!=='walk'||!ready||!exploring)return;
 let forward=(keys.has('KeyW')||keys.has('ArrowUp')?1:0)-(keys.has('KeyS')||keys.has('ArrowDown')?1:0),side=(keys.has('KeyD')||keys.has('ArrowRight')?1:0)-(keys.has('KeyA')||keys.has('ArrowLeft')?1:0);
 if(!forward&&!side)return;
 const dir=walker.getForwardRay().direction.clone();dir.y=0;dir.normalize();const right=B.Vector3.Cross(dir,B.Axis.Y).normalize();const v=dir.scale(forward).add(right.scale(side)).normalize();const speed=keys.has('ShiftLeft')||keys.has('ShiftRight')?1.65:1.05;const distance=Math.min(dt,.05)*speed;const steps=Math.ceil(distance/.02);
 for(let i=0;i<steps;i++){const x=walker.position.x+v.x*distance/steps;if(valid(x,walker.position.z))walker.position.x=x;const z=walker.position.z+v.z*distance/steps;if(valid(walker.position.x,z))walker.position.z=z}walker.position.y=eye+(APT.furniture.some(f=>f.kind==='shower'&&walker.position.x>f.x/1000&&walker.position.x<(f.x+f.w)/1000&&walker.position.z>f.y/1000&&walker.position.z<(f.y+f.d)/1000)?.07:0);
}
function stateFor(mesh){let n=mesh;while(n){if(byNode.has(n.name))return byNode.get(n.name);if(n.name==='Fridge body - beside column')return states.find(s=>s.spec.label==='Refrigerator main door');if(n.name==='Upright deep freezer body - beside fridge')return semantic.get('freezer_door');if(n.name==='Dishwasher body - beside sink')return semantic.get('dishwasher_door');if(n.name==='Stove cooktop - front window wall')return states.find(s=>s.spec.label==='Stove oven door');n=n.parent}return null}
function setOpen(s,on){if(!s)return;if(on)for(const id of s.spec.conflicts||[]){const neighbor=byId.get(id);if(neighbor)neighbor.target=0}if(on&&s.spec.requires){const host=semantic.get(s.spec.requires);if(host)host.target=1}if(!on){for(const other of states){if(other.spec.requires&&semantic.get(other.spec.requires)===s)other.target=0}}s.target=on?1:0;refreshButtons()}
function refreshButtons(){for(const s of states){s.button.textContent=(s.target?'Close · ':'Open · ')+s.spec.label;s.button.setAttribute('aria-label',(s.target?'Close ':'Open ')+s.spec.label);s.button.classList.toggle('open',!!s.target)}if(lookTarget)showTarget(lookTarget)}
function showTarget(s){if(!s||(mode==='walk'&&!exploring)){interactHud.style.display='none';return}interactHud.style.display='flex';interactHud.querySelector('.interaction-label').textContent=(mode==='walk'?(s.target?'Close ':'Open '):'')+s.spec.label;interactHud.querySelector('button').textContent=s.target?'Close':'Open';interactHud.querySelector('small').textContent=mode==='walk'?'E':''}
interactHud.querySelector('button').onclick=()=>{if(lookTarget)setOpen(lookTarget,!lookTarget.target)};
function initParts(){const list=document.getElementById('partList'),sections={};for(const title of ['Appliances','Base cabinets','Wall cabinets','Drawers & racks']){const section=document.createElement('section');section.className='part-section';const h=document.createElement('h3');h.textContent=title;section.appendChild(h);list.appendChild(section);sections[title]=section}for(const spec of CONFIG.interactions){const node=scene.getTransformNodeByName(spec.node)||scene.getMeshByName(spec.node);if(!node)throw Error('Missing interactive part '+spec.node);const s={spec,node,value:0,target:0,position:node.position.clone(),rotation:node.rotationQuaternion?.clone()||B.Quaternion.FromEulerVector(node.rotation),meshes:node.getChildMeshes(false)};s.button=document.createElement('button');s.button.onclick=()=>{lookTarget=s;setOpen(s,!s.target);showTarget(s)};const title=spec.category==='appliance'?'Appliances':spec.category==='upper'?'Wall cabinets':['drawer','rack'].includes(spec.category)?'Drawers & racks':'Base cabinets';sections[title].appendChild(s.button);states.push(s);byNode.set(spec.node,s);byId.set(spec.id,s);if(spec.label==='Dishwasher door')semantic.set('dishwasher_door',s);if(spec.label==='Upright freezer door')semantic.set('freezer_door',s);if(spec.category==='upper')(spec.wall==='north'?groups.north:spec.wall==='corner'?groups.corners:groups.uppers).push(node)}document.getElementById('partCount').textContent=states.length;refreshButtons()}
function animateParts(dt){dynamicObstacles=[];for(const s of states){const old=s.value;let goal=s.target;if(goal&&(s.spec.conflicts||[]).some(id=>(byId.get(id)?.value||0)>.02))goal=0;if(goal&&s.spec.requires&&semantic.get(s.spec.requires)?.value<.90)goal=0;if(!goal&&states.some(t=>t.spec.requires&&semantic.get(t.spec.requires)===s&&t.value>.02))goal=1;s.value+=(goal-s.value)*(1-Math.exp(-dt*10));if(Math.abs(s.value-goal)<.0005)s.value=goal;if(Math.abs(s.value-old)>.000001){const axis=new B.Vector3(...s.spec.axis);if(s.spec.kind==='hinge')s.node.rotationQuaternion=s.rotation.multiply(B.Quaternion.RotationAxis(axis,s.spec.amount*s.value));else s.node.position.copyFrom(s.position.add(axis.scale(s.spec.amount*s.value)));s.node.computeWorldMatrix(true);shadowDirty=true}if((s.value>.03||s.spec.category==='room')&&s.spec.category!=='upper'){for(const mesh of s.meshes){mesh.computeWorldMatrix(true);const b=mesh.getBoundingInfo().boundingBox;if(b.maximumWorld.y>.07&&b.minimumWorld.y<1.85)dynamicObstacles.push([b.minimumWorld.x,b.maximumWorld.x,b.minimumWorld.z,b.maximumWorld.z])}}}if(mode==='walk'&&ready&&performance.now()-lastPick>100){lastPick=performance.now();const pick=scene.pickWithRay(walker.getForwardRay(2.6),m=>m.isEnabled()&&m.isVisible);lookTarget=pick?.hit&&pick.distance<=2.6?stateFor(pick.pickedMesh):null;showTarget(lookTarget)}}
scene.onBeforeRenderObservable.add(()=>{const dt=Math.min(engine.getDeltaTime()/1000,.06);if(mode==='iso'){const aspect=engine.getRenderWidth()/engine.getRenderHeight(),span=orbit.radius*.39/Math.min(aspect,1);orbit.orthoTop=span;orbit.orthoBottom=-span;orbit.orthoLeft=-span*aspect;orbit.orthoRight=span*aspect}animateParts(dt);stepWalk(dt);updateMapMarker();visibility();updateMirrorReflections();if(shadowDirty){shadowWarmup=Math.max(shadowWarmup,3);shadowDirty=false}if(shadowWarmup>0){daylightShadows.getShadowMap().resetRefreshCounter();ceilingShadows.getShadowMap().resetRefreshCounter();shadowWarmup--}});
const blob='assets/Kitchen.glb';
B.SceneLoader.ImportMeshAsync('','',blob,scene,null,'.glb').then(result=>{
 parts=result.meshes;alignKitchen(result);parts.forEach(classify);scene.materials.forEach(m=>{if(m instanceof B.PBRMaterial){m.maxSimultaneousLights=8;m.environmentIntensity=.85;if(m.albedoTexture)m.albedoTexture.anisotropicFilteringLevel=8}if(m.name==='Window glass'){m.alpha=.08;m.transparencyMode=2;m.metallic=0;m.roughness=.08}if(m.name==='Brushed stainless steel'){m.albedoColor=new B.Color3(.70,.72,.73);m.metallic=.92;m.roughness=.20;m.anisotropy.isEnabled=true;m.anisotropy.intensity=.55;m.anisotropy.direction=new B.Vector2(1,0)}if(m.name==='Medium warm oak'){m.roughness=.50;m.bumpTexture=oakNormal}if(m.name==='User reference floor tile'){m.bumpTexture=floorNormal;m.roughness=.65}if(m.name==='Cream ivory stone'){m.albedoColor=B.Color3.White();m.albedoTexture=ivoryColor;m.bumpTexture=ivoryNormal;m.roughness=.28}if(m.name==='Warm white cabinet finish'){m.roughness=.69}if(m.name==='Satin bronze handles'){m.metallic=.78;m.roughness=.30}});
 for(const mesh of parts){mesh.receiveShadows=true;const n=mesh.name;if(n.startsWith('Under cabinet light')||n.startsWith('Ceiling recessed')||n.startsWith('Front upper extractor task light'))mesh.material=ledMaterial;if(mesh.isEnabled()&&!/^(Window glazing|Floor )/.test(n)&&mesh.getTotalVertices()>0){daylightShadows.addShadowCaster(mesh);ceilingShadows.addShadowCaster(mesh)}}daylightShadows.addShadowCaster(roof);roof.receiveShadows=true;
 initParts();apartment=buildApartment(B,scene,registerApartmentPart);addSinkCabinet();finishApartment();changeMode('iso');
 scene.executeWhenReady(()=>{ready=true;shadowWarmup=40;scene.render();window.kitchenReady=true;window.apartmentReady=true;document.getElementById('roomSelect').disabled=false;window.kitchenParts=parts.length;document.getElementById('status').style.display='none';hint()});
}).catch(e=>{document.getElementById('status').textContent='The apartment could not load. Refresh to retry.';console.error(e)});
engine.runRenderLoop(()=>scene.render());window.addEventListener('resize',()=>engine.resize());
window.kitchenDebug={scene,engine,walker,orbit,groups,valid,changeMode,reset,states,setOpen,config:CONFIG,pipeline,ao,daylightShadows,ceilingShadows,get mode(){return mode},get apartment(){return apartment},visitRoom,obstacles};window.apartmentDebug=window.kitchenDebug;

// R05 apartment navigation and reusable room/furniture interactions.
const roomNames={ALL:'Entire apartment',REC:'Reception & dining',KIT:'Kitchen',UTIL:'Bathroom 2 & laundry',MASTER:'Main bedroom',DRESS:'Dressing room',STUDY:'Family & study',CHILD:'Children’s bedroom',BATH:'Bathroom 1',WC:'Guest WC',BAL:'Reception balcony',BAY:'Bedroom balcony',HALL:'Hallway'};
const visits={REC:[3.15,1.50,-2.80],KIT:[5.22,5.20,0],UTIL:[8.12,5.17,0],MASTER:[11.23,6.52,-.55],DRESS:[11.50,1.14,0],STUDY:[6.80,8.35,Math.PI],CHILD:[9.55,8.25,Math.PI],BATH:[9.88,1.18,-1.3],WC:[4.28,1.28,.66],BAL:[1.90,11.02,0],BAY:[12.0,8.36,0],HALL:[7.0,6.48,Math.PI/2]};
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
 freezer.setEnabled(false);for(const m of freezer.getChildMeshes(false))m.metadata={excludedArchitecture:true,removedFreezer:true};
 const feetMaterial=new B.PBRMaterial('Appliance adjustable feet',scene);feetMaterial.albedoColor=new B.Color3(.025,.025,.025);feetMaterial.roughness=.8;
 for(const [group,x0,x1,z0,z1] of [[fridge,1.885,2.405,-2.614,-3.254]]){
  for(const x of [x0,x1])for(const z of [z0,z1]){const foot=B.MeshBuilder.CreateCylinder('Appliance levelling foot',{diameter:.036,height:.035,tessellation:12},scene);foot.parent=group;foot.position.set(x,.0175,z);foot.material=feetMaterial;}
 }
 const microwave=resizeAssembly('Standard compact microwave proposal',n=>n.startsWith('Microwave')||n==='Interact_part_40',new B.Vector3(.374/.42,.275/.32,.489/.54),new B.Vector3(.30,.915,-3.65));
 function bounds(group){const min=new B.Vector3(Infinity,Infinity,Infinity),max=new B.Vector3(-Infinity,-Infinity,-Infinity);for(const m of group.getChildMeshes(false)){m.computeWorldMatrix(true);const b=m.getBoundingInfo().boundingBox;min.minimizeInPlace(b.minimumWorld);max.maximizeInPlace(b.maximumWorld);}return {min,max};}
 let envelope=bounds(microwave);microwave.scaling.multiplyInPlace(new B.Vector3(.374/(envelope.max.x-envelope.min.x),.275/(envelope.max.y-envelope.min.y),.489/(envelope.max.z-envelope.min.z)));
 envelope=bounds(microwave);microwave.position.x+=root.position.x+.30-(envelope.min.x+envelope.max.x)/2;microwave.position.z+=root.position.z-3.65-(envelope.min.z+envelope.max.z)/2;microwave.position.y+=.905-envelope.min.y;
 // Relocate the complete microwave, including its animated door, into the tower.
 microwave.rotation.y=Math.PI;envelope=bounds(microwave);
 microwave.position.x+=6.027-(envelope.min.x+envelope.max.x)/2;
 microwave.position.z+=-5.3445-(envelope.min.z+envelope.max.z)/2;
 microwave.position.y+=1.22-envelope.min.y;
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
function addKitchenTower(){
 const f=APT.furniture.find(f=>f.id==='K08'),M=apartment.materials,box=apartment.box;
 const root=new B.TransformNode('K08 tall microwave pantry',scene);root.position.set((f.x+f.w/2)/1000,0,-(f.y+f.d/2)/1000);
 root.rotation.y=-Math.PI/2;root.metadata={furnitureId:'K08',room:'KIT'};apartment.furniture.push(root);apartment.roots.set('K08',root);
 const w=f.d/1000,d=f.w/1000,h=2.35;
 box('Tall pantry back',w,h,.018,0,h/2,-d/2+.009,M.white,root);
 for(const x of [-w/2+.009,w/2-.009])box('Tall pantry oak side',.018,h,d,x,h/2,0,M.oak,root);
 for(const y of [.10,.55,1.20,1.58,1.96,2.34])box('Tall pantry shelf',w-.036,.022,d-.025,0,y,0,M.oak,root);
 box('Tall pantry plinth',w,.10,.018,0,.05,d/2-.04,M.walnut,root);
 for(const [id,low,high] of [['lower',.12,1.19],['upper',1.59,2.33]]){
  const pivot=new B.TransformNode('Tall pantry '+id+' door',scene);pivot.parent=root;pivot.position.set(-w/2+.003,low,d/2-.01);
  box('Tall pantry warm white front',w-.006,high-low,.022,(w-.006)/2,(high-low)/2,0,M.white,pivot);
  box('Tall pantry bronze handle',.006,.19,.025,w-.065,(high-low)*.65,.022,M.metal,pivot);
  registerApartmentPart(pivot,{id:'K08_'+id,label:'Tall microwave pantry · '+id,kind:'hinge',axis:[0,1,0],amount:-1.5,category:'cabinet',room:'KIT'});
 }
 // Dark, ventilated surround makes the appliance read as an integrated unit.
 for(const x of [-.28,.28])box('Microwave fitted surround',.024,.34,.026,x,1.39,d/2-.014,M.black,root);
 for(const y of [1.208,1.565])box('Microwave fitted trim',.584,.018,.026,0,y,d/2-.014,M.black,root);
 for(let i=0;i<9;i++)box('Pantry ventilation slot',.022,.006,.003,-.16+i*.04,1.538,d/2+.001,M.black,root);
}
function finishApartment(){
 addKitchenTower();
 for(const footprint of apartment.details.obstacles)obstacles.push(footprint);
 function excludeTogether(a,b){const first=byId.get(a),second=byId.get(b);if(!first||!second)return;first.spec.conflicts=[...new Set([...(first.spec.conflicts||[]),b])];second.spec.conflicts=[...new Set([...(second.spec.conflicts||[]),a])];}
 excludeTogether('D08','B03_0');
 for(const drawer of ['part_01','part_02','part_03'])excludeTogether('part_26',drawer);
 // Consolidate static furniture by material. Hinged/sliding components stay separate.
 const layoutAudit={};
 for(const id of ['R14','K08','F05','C01','C07']){
  const root=apartment.roots.get(id),min=new B.Vector3(Infinity,Infinity,Infinity),max=new B.Vector3(-Infinity,-Infinity,-Infinity);
  for(const m of root.getChildMeshes(false)){m.computeWorldMatrix(true);const b=m.getBoundingInfo().boundingBox;min.minimizeInPlace(b.minimumWorld);max.maximizeInPlace(b.maximumWorld);}
  layoutAudit[id]={minMm:min.asArray().map(v=>Math.round(v*1000)),maxMm:max.asArray().map(v=>Math.round(v*1000))};
  const mattress=root.getChildMeshes(false).find(m=>m.name==='Mattress');
  if(mattress){const b=mattress.getBoundingInfo().boundingBox;layoutAudit[id].mattressMm={width:Math.round((b.maximumWorld.x-b.minimumWorld.x)*1000),length:Math.round((b.maximumWorld.z-b.minimumWorld.z)*1000)};}
 }
 layoutAudit.shoeAisleMm=layoutAudit.R14.minMm[0]-2750;
 document.body.dataset.layoutAudit=JSON.stringify(layoutAudit);
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
  const r=APT.rooms[m.room].bounds,dresser=m.surface.name==='Dressing wall mirror',west=dresser?APT.furniture.find(f=>f.id==='C05').frontSide==='east':m.surface.name.startsWith('B08');
  const distance=dresser?Math.abs(m.position.x-r[west?0:2]/1000):west?Math.abs(m.position.x-r[0]/1000):Math.abs(m.position.z-r[1]/1000);
  const expected=new B.Vector3(dresser?(west?1:-1):west?1:0,0,dresser||west?0:1);
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
 for(const [name,groupName] of [['fridge','Refrigerator height proposal 1850 mm'],['microwave','Standard compact microwave proposal']]){
  const group=scene.getTransformNodeByName(groupName),min=new B.Vector3(Infinity,Infinity,Infinity),max=new B.Vector3(-Infinity,-Infinity,-Infinity);
  for(const mesh of group.getChildMeshes(false)){mesh.computeWorldMatrix(true);const b=mesh.getBoundingInfo().boundingBox;min.minimizeInPlace(b.minimumWorld);max.maximizeInPlace(b.maximumWorld);}
  applianceAudit[name]={widthMm:Math.round((max.z-min.z)*1000),depthMm:Math.round((max.x-min.x)*1000),heightMm:Math.round((max.y-min.y)*1000)};
 }
 applianceAudit.freezer={removed:true,replacedBy:'K08 tall pantry'};
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
