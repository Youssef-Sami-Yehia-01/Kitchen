"""Retain the tested kitchen controls while extending their scene to R05."""
from pathlib import Path
import re,json
ROOT=Path(__file__).resolve().parents[1]
s=(ROOT/'viewer.js').read_text(encoding='utf-8')
s=s.replace("'use strict';", "'use strict';\nconst APT=window.APARTMENT; let apartment=null,selectedRoom='ALL';")
s=s.replace("const touchDevice=matchMedia('(pointer:coarse)').matches||navigator.maxTouchPoints>0", "const touchDevice=matchMedia('(pointer:coarse)').matches||navigator.maxTouchPoints>0||matchMedia('(max-width:620px)').matches")
config=json.loads((ROOT/'assets/kitchen-interactions.json').read_text())
config['mirrored']=False
config['appliances']['fridge']['heightAssumed']=1.85
config['appliances']['uprightFreezer']['heightAssumed']=1.714
config['appliances']['microwave'].update(widthAssumed=.489,depthAssumed=.374,heightAssumed=.275)
config['interactions']=[i for i in config['interactions'] if i['id'] not in ['part_05','part_06']]
for i in config['interactions']:i['room']='KIT'
s=re.sub(r'const CONFIG=.*?,W=CONFIG.room.width,D=CONFIG.room.depth,eye=1.65;', 'const CONFIG='+json.dumps(config,separators=(',',':'))+',W=12.72,D=11.56,eye=1.65;',s,count=1)
s=s.replace('const entrance=new B.Vector3(1.25,eye,-3.79), center=new B.Vector3(W/2,1.15,-D/2);','const entrance=new B.Vector3(3.15,eye,-1.50), center=new B.Vector3(W/2,.7,-D/2);')
s=s.replace("Math.acos(1/Math.sqrt(3)),8,center", "Math.acos(1/Math.sqrt(3)),26,center")
s=s.replace(',26,center,scene)',',26,center.clone(),scene)')
s=s.replace('orbit.lowerRadiusLimit=3.5;orbit.upperRadiusLimit=14','orbit.lowerRadiusLimit=4;orbit.upperRadiusLimit=46')
s=s.replace('orbit.wheelPrecision=35;orbit.panningSensibility=100','orbit.wheelPrecision=12;orbit.panningSensibility=55')
s=s.replace('walker.fov=1.15','walker.fov=1.10')
s=s.replace('walker.setTarget(new B.Vector3(1.25,eye,-1))','walker.setTarget(new B.Vector3(1.9,eye,-5))')
s=s.replace("new B.Vector3(-.60,-.65,-.80)","new B.Vector3(-.48,-.83,.37)")
s=s.replace('sun.position=new B.Vector3(3.15,4.2,2);sun.intensity=24','sun.position=new B.Vector3(14,16,-16);sun.intensity=2.6')
s=s.replace('sun.shadowMaxZ=15','sun.shadowMaxZ=45')
s=s.replace('new B.Vector3(1.25,2.69,-2)','new B.Vector3(5.23,2.69,-3.69)')
s=s.replace('inside.intensity=24','inside.intensity=10')
s=s.replace('new B.Vector3(1.25,2.3,-3.7)','new B.Vector3(5.23,2.3,-5.2)')
s=s.replace('new B.Vector3(.28,1.685,z)','new B.Vector3(4.26,1.685,z-1.69)')
s=s.replace('new B.Vector3(1.28,1.665,-.22)','new B.Vector3(5.26,1.665,-1.91)')
s=s.replace('new B.ShadowGenerator(2048,sun)','new B.ShadowGenerator(touchDevice?2048:4096,sun)')
s=s.replace('sunStrength=24','sunStrength=2.6')
s=s.replace('const ao=null;', "const ao=B.SSAO2RenderingPipeline.IsSupported ? new B.SSAO2RenderingPipeline('Contact shadows',scene,{ssaoRatio:.75,blurRatio:1},[walker,orbit]) : null;if(ao){ao.radius=.16;ao.totalStrength=.60;ao.samples=16;ao.expensiveBlur=false;ao.maxZ=50;}")
s=s.replace('imageSettings.exposure=1.08','imageSettings.exposure=.91')
s=s.replace('Math.min(engine.getDeltaTime()/1000,.20)','Math.min(engine.getDeltaTime()/1000,.06)')
# This original room shell is superseded by the exact apartment architecture.
s=s.replace('hoodStrip.position=new B.Vector3(1.28,1.678,-.22)','hoodStrip.position=new B.Vector3(5.26,1.678,-1.91)')
s=s.replace("let parts=[],mode='walk'", "roof.setEnabled(false);outside.setEnabled(false);\nlet parts=[],mode='iso'")
start=s.index('function visibility(){');end=s.index('\nfunction hint()',start)
s=s[:start]+'''function visibility(){
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
''' +s[end:]
s=s.replace('orbit.radius=8','orbit.radius=26')
s=s.replace('function reset(){keys.clear();', 'function reset(){keys.clear();orbit.inertialAlphaOffset=0;orbit.inertialBetaOffset=0;orbit.inertialRadiusOffset=0;orbit.inertialPanningX=0;orbit.inertialPanningY=0;')
s=s.replace("orbit.setTarget(center.clone());orbit.alpha", "selectedRoom='ALL';document.getElementById('roomSelect').value='ALL';updateRoomUI();orbit.setTarget(center.clone());orbit.alpha")
s=s.replace('lookYaw=0;lookPitch=0;applyLook()', 'lookYaw=-2.80;lookPitch=0;applyLook()')
s=s.replace('walker.position.copyFrom(entrance);lookYaw=-2.80;', "selectedRoom='REC';document.getElementById('roomSelect').value='REC';updateRoomUI();walker.position.copyFrom(entrance);lookYaw=-2.80;")
s=s.replace("value*(24/70)","value*(2.6/70)")
start=s.index('const obstacles=CONFIG.obstacles;');end=s.index('\nfunction stepWalk',start)
s=s[:start]+'''const obstacles=APT.obstacles.map(r=>[r[0]/1000,r[2]/1000,r[1]/1000,r[3]/1000]);
for(const f of APT.furniture){if(!f.overhead&&f.kind!=='sink'&&f.kind!=='microwave'&&f.kind!=='shower'){
 if(f.kind==='l_sofa'){obstacles.push([4.03,7.03,10.51,11.51],[4.03,5.03,9.51,10.51]);}
 else obstacles.push([f.x/1000,(f.x+f.w)/1000,f.y/1000,(f.y+f.d)/1000]);
}}
for(const f of APT.furniture.filter(f=>f.kind==='shower')){const door=Math.min(.70,f.w/1000-.25);obstacles.push([f.x/1000,(f.x+f.w)/1000-door,(f.y+f.d)/1000-.024,(f.y+f.d)/1000-.016]);}
for(const win of APT.windows.filter(w=>w.slider)){const r=win.bounds;obstacles.push([(r[0]+r[2])/2000,r[2]/1000,r[1]/1000,r[3]/1000]);}
const bodyRadius=.14;
function valid(x,z){const y=-z;if(x<bodyRadius||x>W-bodyRadius||y<bodyRadius||y>D-bodyRadius)return false;
 const shaft=APT.rooms.SHAFT.bounds;if(x>shaft[0]/1000&&x<shaft[2]/1000&&y<shaft[3]/1000)return false;
 for(const [x0,x1,y0,y1]of [...obstacles,...dynamicObstacles]){const nearX=Math.max(x0,Math.min(x,x1)),nearY=Math.max(y0,Math.min(y,y1));if((x-nearX)**2+(y-nearY)**2<bodyRadius**2)return false;}return true;}
''' +s[end:]
s=s.replace('const right=B.Vector3.Cross(dir,B.Axis.Y).normalize()', 'const right=B.Vector3.Cross(dir,B.Axis.Y).normalize()')
s=s.replace('s.spec.category!==\'upper\'', "s.spec.category!=='upper'")
# Closed room leaves must also block walking; cabinet shells already have footprints.
s=s.replace("if(s.value>.03&&s.spec.category!=='upper')", "if((s.value>.03||s.spec.category==='room')&&s.spec.category!=='upper')")
# Run the wider-apartment UI after movement, and track the floor-map marker.
s=s.replace('stepWalk(dt);visibility();','stepWalk(dt);updateMapMarker();visibility();updateMirrorReflections();')
s=s.replace('const span=orbit.radius*.39,aspect=engine.getRenderWidth()/engine.getRenderHeight();','const aspect=engine.getRenderWidth()/engine.getRenderHeight(),span=orbit.radius*.39/Math.min(aspect,1);')
s=s.replace('scene.executeWhenReady(()=>{ready=true;', 'scene.executeWhenReady(()=>{ready=true;')
s=s.replace("document.getElementById('status').textContent='The model could not load. Please reopen the viewer.'", "document.getElementById('status').textContent='The apartment could not load. Refresh to retry.'")
s=s.replace("parts=result.meshes;parts.forEach(classify);", "parts=result.meshes;alignKitchen(result);parts.forEach(classify);")
s=s.replace("initParts();changeMode('walk');", "initParts();apartment=buildApartment(B,scene,registerApartmentPart);addSinkCabinet();finishApartment();changeMode('iso');")
s=s.replace("if(!/^(Window glazing|Floor )/.test(n)&&mesh.getTotalVertices()>0)","if(mesh.isEnabled()&&!/^(Window glazing|Floor )/.test(n)&&mesh.getTotalVertices()>0)")
s=s.replace("window.kitchenReady=true;window.kitchenParts=parts.length;", "window.kitchenReady=true;window.apartmentReady=true;window.kitchenParts=parts.length;")
s=s.replace("window.apartmentReady=true;", "window.apartmentReady=true;document.getElementById('roomSelect').disabled=false;")
s=s.replace('window.kitchenDebug={scene,walker', 'window.kitchenDebug={scene,engine,walker')
s=s.replace('walker.position.y=eye;', "walker.position.y=eye+(APT.furniture.some(f=>f.kind==='shower'&&walker.position.x>f.x/1000&&walker.position.x<(f.x+f.w)/1000&&walker.position.z>f.y/1000&&walker.position.z<(f.y+f.d)/1000)?.07:0);")
s=s.replace('get mode(){return mode}};', 'get mode(){return mode},get apartment(){return apartment},visitRoom,obstacles};window.apartmentDebug=window.kitchenDebug;')
# CAD plan X remains screen-right when entering from the south. Geometry is
# reflected once at its scene root; cameras use the resulting X/elevation/Z frame.
s=s.replace('new B.Vector3(3.15,eye,-1.50)','new B.Vector3(3.15,eye,1.50)')
s=s.replace('center=new B.Vector3(W/2,.7,-D/2)','center=new B.Vector3(W/2,.7,D/2)')
s=s.replace('-Math.PI*.75','Math.PI*.75')
s=s.replace('Math.cos(lookYaw)*cp','-Math.cos(lookYaw)*cp')
s=s.replace('lookYaw=Math.atan2(direction.x,direction.z)','lookYaw=Math.atan2(direction.x,-direction.z)')
s=s.replace('lookYaw-=Math.max','lookYaw+=Math.max')
s=s.replace('const y=-z;','const y=z;')
s=s.replace('[b.minimumWorld.x,b.maximumWorld.x,-b.maximumWorld.z,-b.minimumWorld.z]','[b.minimumWorld.x,b.maximumWorld.x,b.minimumWorld.z,b.maximumWorld.z]')
# Additional functions are declarations, so are available to the import callback.
s+='\n'+(ROOT/'tools/apartment-controller-extra.js').read_text(encoding='utf-8')
(ROOT/'apartment.js').write_text(s,encoding='utf-8')

html=(ROOT/'kitchen.html').read_text(encoding='utf-8')
html=html.replace('Kitchen Studio','Apartment Studio').replace('<h1>Kitchen</h1>','<h1>Apartment</h1>')
html=html.replace('Kitchen viewer controls','Apartment viewer controls').replace('Interactive kitchen walkthrough','Interactive apartment walkthrough')
html=html.replace('Preparing the kitchen…','Building your apartment…').replace('4.00 × 2.50 M','R05 · FURNISHED APARTMENT')
html=html.replace('<button id="walk" class="active">','<button id="walk">').replace('<button id="iso">','<button id="iso" class="active">')
html=html.replace('Warm daylight through the window, with live shadows.','Warm daylight and ceiling lights, with live shadows.').replace('<div class="section-label">Compartments</div>', '<div class="section-label">Model information</div><p class="scene-note">R05 plan · dimensions in metres.<br>Ceiling 2.75 m confirmed. Window sill 1.10 m, head 2.30 m and door height 2.15 m assumed. Furniture heights and finishes are proposals.</p><a class="file-link" href="assets/apartment-scene.json" download>Download scene dimensions</a><a class="file-link" href="kitchen.html">Original kitchen viewer ↗</a><hr class="panel-rule"><div class="section-label">Compartments</div>')
html=html.replace('<div id="status">','<div class="room-bar"><label for="roomSelect">EXPLORE</label><select id="roomSelect" aria-label="Choose a room"><option value="ALL">Entire apartment</option></select><span id="roomSize">R05</span></div><aside id="mapPanel"><button id="mapToggle" aria-label="Toggle floor map" aria-expanded="true">FLOOR MAP <span>−</span></button><div id="mapBody"><svg id="floorMap" viewBox="-350 -300 13500 12500" role="img" aria-label="Apartment room navigation"></svg><p>Choose a room to explore</p></div></aside><div id="status">')
html=html.replace('<select id="roomSelect"','<select disabled id="roomSelect"')
html=html.replace('<a class="file-link" href="assets/apartment-scene.json"', '<button id="saveImage" class="file-link" style="width:100%;padding:10px">Save current view as image</button><a class="file-link" href="assets/apartment-scene.json"')
html=html.replace('<a class="file-link" href="kitchen.html">', '<a class="file-link" href="DIMENSIONS.md" target="_blank" rel="noopener">Dimensions & review references ↗</a><a class="file-link" href="kitchen.html">')
extra_css='''
select{font:inherit;color:var(--ink);background:#343434;border:1px solid #ffffff30;padding:9px 30px 9px 10px;outline-offset:3px;min-width:180px;max-width:230px}select option{background:#2e2e2e}.room-bar{position:absolute;left:24px;top:112px;display:flex;align-items:center;gap:12px;z-index:7;background:var(--panel);border:1px solid var(--line);padding:9px 12px}.room-bar label{font-size:8px;letter-spacing:1.5px;color:var(--muted)}#roomSize{font-size:9px;color:#ccc8bf;max-width:160px;line-height:1.5}#status{top:174px}#mapPanel{position:absolute;left:24px;top:181px;width:208px;z-index:6;background:rgba(40,40,40,.82);border:1px solid var(--line);padding:0}#mapToggle{width:100%;border:0;padding:12px;text-align:left;font-size:8px;letter-spacing:1.6px;display:flex;justify-content:space-between}#mapBody{padding:0 10px 8px}#mapBody p{font-size:8px;text-align:center;color:#c2beb6;margin:3px 0}#floorMap{width:100%;height:auto;stroke-linecap:butt;stroke-width:40}#floorMap .map-room{fill:#69665f;stroke:#262626;cursor:pointer;transition:fill .2s}#floorMap .map-room:hover,#floorMap .map-room.selected{fill:#b9a586}#floorMap text{font:370px Arial,sans-serif;fill:#fff;stroke:none;text-anchor:middle;pointer-events:none}#floorMap .marker{fill:#fff;stroke:#222;stroke-width:45;pointer-events:none}.file-link{color:#e1d6c3;font-size:10px;display:block;margin:12px 0;text-decoration:none;border-bottom:1px solid #ffffff22;padding-bottom:8px}#partsPanel p{line-height:1.65}.part-section button{line-height:1.5}body.exploring #mapPanel{display:none}
@media(max-width:1000px){.room-bar{left:16px;top:99px}#mapPanel{left:16px;top:166px;width:176px}#status{top:164px}}
@media(max-width:620px){.room-bar{left:12px;right:12px;top:137px;padding:7px 9px;gap:9px}.room-bar label{display:none}.room-bar select{min-width:0;max-width:65%;width:65%;padding:8px;font-size:11px}#roomSize{font-size:8px}#mapPanel{left:12px;top:193px;width:136px}#mapToggle{padding:10px;font-size:7px}#mapBody{padding:0 6px 5px}#mapBody p{font-size:7px}.scene-panel,#partsPanel{top:193px;max-height:calc(100% - 260px)}#status{top:193px}#pauseTouch{top:193px}#hint{max-width:235px}}
@media(max-height:650px){#mapPanel{width:140px}#mapBody{display:none}#hint{padding:8px 10px}}
'''
html=html.replace('</style>',extra_css+'\n</style>')
html=html.replace('<script defer src="viewer.js"></script>', '<script defer src="apartment-data.js"></script><script defer src="apartment-details.js"></script><script defer src="apartment-model.js"></script><script defer src="apartment.js"></script>')
(ROOT/'index.html').write_text(html,encoding='utf-8')
print('Apartment viewer rebuilt; original kitchen preserved in kitchen.html.')
