'use strict';

// A single upholstered sectional shell, rather than two complete sofas meeting.
window.buildLoungeSectional = function(B,scene,kit,parent,w,d){
  const {M,soft,cylinder,rod}=kit,blue=M.loungeBlue,t=1,x0=-w/2,x1=w/2,z0=-d/2,z1=d/2;
  const cross=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
  function roundedOutline(outline,inset,radius){
    const result=[];
    for(let i=0;i<outline.length;i++){
      const previous=outline[(i+outline.length-1)%outline.length],v=outline[i],next=outline[(i+1)%outline.length];
      const before=new B.Vector2(v[0]-previous[0],v[1]-previous[1]).normalize();
      const after=new B.Vector2(next[0]-v[0],next[1]-v[1]).normalize();
      const corner=[v[0]+(-before.y-after.y)*inset,v[1]+(before.x+after.x)*inset];
      const a=[corner[0]-before.x*radius,corner[1]-before.y*radius];
      const b=[corner[0]+after.x*radius,corner[1]+after.y*radius];
      const center=[a[0]+after.x*radius,a[1]+after.y*radius];
      const start=Math.atan2(a[1]-center[1],a[0]-center[0]);
      let sweep=Math.atan2(b[1]-center[1],b[0]-center[0])-start;
      while(sweep>Math.PI)sweep-=Math.PI*2;while(sweep<-Math.PI)sweep+=Math.PI*2;
      for(let j=0;j<=4;j++){const angle=start+sweep*j/4;result.push([center[0]+Math.cos(angle)*radius,center[1]+Math.sin(angle)*radius]);}
    }
    return result;
  }
  function triangulate(points){
    const remaining=points.map((_,i)=>i),triangles=[];
    while(remaining.length>3){
      let clipped=false;
      for(let i=0;i<remaining.length;i++){
        const a=remaining[(i+remaining.length-1)%remaining.length],b=remaining[i],c=remaining[(i+1)%remaining.length];
        if(cross(points[a],points[b],points[c])<=1e-10)continue;
        const occupied=remaining.some(k=>k!==a&&k!==b&&k!==c&&cross(points[a],points[b],points[k])>=-1e-10&&cross(points[b],points[c],points[k])>=-1e-10&&cross(points[c],points[a],points[k])>=-1e-10);
        if(occupied)continue;
        triangles.push(a,b,c);remaining.splice(i,1);clipped=true;break;
      }
      if(!clipped)throw Error('Invalid continuous sectional outline');
    }
    return triangles.concat(remaining);
  }
  function paddedL(name,outline,height,y,component,bevel=.025){
    const positions=[],indices=[],normals=[],uvs=[];
    const rings=[[-height/2,bevel],[-height/2+bevel,0],[height/2-bevel,0],[height/2,bevel]];
    let cap;
    for(const [level,inset] of rings){
      const points=roundedOutline(outline,inset,.04);cap=points;
      for(const [x,z] of points){positions.push(x,level,z);uvs.push((x+w/2)/w,(z+d/2)/d);}
    }
    const n=cap.length;
    for(let ring=0;ring<3;ring++)for(let i=0;i<n;i++){
      const a=ring*n+i,b=ring*n+(i+1)%n,c=a+n,e=b+n;indices.push(a,b,c,b,e,c);
    }
    const caps=triangulate(cap);
    for(let i=0;i<caps.length;i+=3){indices.push(caps[i+2],caps[i+1],caps[i],3*n+caps[i],3*n+caps[i+1],3*n+caps[i+2]);}
    B.VertexData.ComputeNormals(positions,indices,normals);
    const data=new B.VertexData();Object.assign(data,{positions,indices,normals,uvs});
    const mesh=new B.Mesh(name,scene);data.applyToMesh(mesh);mesh.position.y=y;mesh.parent=parent;mesh.material=blue;mesh.receiveShadows=true;
    mesh.metadata={sectionalComponent:component};return mesh;
  }
  const outline=[[x0,z0],[x1,z0],[x1,z0+t],[x0+t,z0+t],[x0+t,z1],[x0,z1]];
  paddedL('Continuous blue L-shaped sofa base',outline,.25,.25,'base');
  paddedL('Continuous blue L-shaped seat',[[x0+.19,z0+.19],[x1-.19,z0+.19],[x1-.19,z0+t-.03],[x0+t-.03,z0+t-.03],[x0+t-.03,z1-.19],[x0+.19,z1-.19]],.14,.39,'seat');
  paddedL('Continuous blue wraparound sofa back',[[x0,z0],[x1,z0],[x1,z0+.17],[x0+.17,z0+.17],[x0+.17,z1],[x0,z1]],.65,.58,'back',.02);
  soft('Sectional right end arm',.17,.48,t,x1-.085,.47,z0+t/2,blue,parent,.06);
  soft('Sectional return end arm',t,.48,.17,x0+t/2,.47,z1-.085,blue,parent,.06);
  for(let i=0;i<3;i++)soft('Sectional blue back cushion',(w-.38)/3-.018,.40,.16,x0+.19+(i+.5)*(w-.38)/3,.67,z0+.22,blue,parent,.055);
  soft('Sectional return back cushion',.16,.40,d-.52,x0+.24,.67,.04,blue,parent,.055);
  for(const [x,z] of [[x0+.10,z0+.10],[x1-.10,z0+.10],[x1-.10,z0+t-.10],[x0+t-.10,z0+t-.10],[x0+t-.10,z1-.10],[x0+.10,z1-.10]])cylinder('Sectional recessed foot',.021,.18,x,.09,z,M.walnut,parent,.016);
  const pillow=soft('Sectional ivory accent pillow',.34,.34,.12,x1-.44,.65,z0+.34,M.cream,parent,.045);pillow.rotation.z=-.14;
  const returnPillow=soft('Sectional return accent pillow',.12,.34,.34,x0+.36,.65,z1-.42,M.cream,parent,.045);returnPillow.rotation.x=.12;
  for(const x of [x0+t+.04,x0+t+.88])rod('Sectional seat stitching',[x,.463,z0+.30],[x,.463,z0+t-.10],.0015,M.blue,parent);
};

// All plan coordinates come from the R05 scene specification. Metres, Y up.
window.buildApartment = function (B, scene, register) {
  const plan = window.APARTMENT, walls = [], ceilings = [], furniture = [], labels = [], mirrors=[];
  const mat = (name, hex, roughness = .65, metallic = 0) => {
    const m = new B.PBRMaterial(name, scene);
    m.albedoColor = B.Color3.FromHexString(hex).toLinearSpace(); m.roughness = roughness;
    m.metallic = metallic; m.maxSimultaneousLights = 4; return m;
  };
  const M = {
    wall: mat('Apartment · warm plaster', '#e5ddce', .91),
    white: mat('Apartment · warm matte cabinetry', '#e7e2d7', .72),
    oak: scene.getMaterialByName('Medium warm oak') || mat('Apartment · natural oak', '#a4794f'),
    walnut: mat('Apartment · walnut', '#694b36', .55),
    stone: mat('Apartment · ivory stone', '#ddd1bb', .36),
    floor: mat('Apartment · limestone tile', '#b7aea0', .7),
    receptionFloor: mat('Apartment · reception warm ivory marble', '#f1ece2', .34),
    grout: mat('Apartment · recessed grout', '#8d8577', .9),
    metal: mat('Apartment · brushed brass', '#b5a077', .3, .8),
    black: mat('Apartment · charcoal metal', '#282a29', .4, .55),
    grey: mat('Apartment · woven grey', '#8c8a84', .97),
    cream: mat('Apartment · ivory linen', '#d7cdbc', .98),
    taupe: mat('Apartment · warm taupe', '#a59a8c', .96),
    blue: mat('Apartment · muted blue linen', '#677c89', .96),
    loungeBlue: mat('Apartment · lounge blue upholstery', '#315b7c', .96),
    terracotta: mat('Apartment · clay linen', '#b5826a', .96),
    sheet: mat('Apartment · cotton bedding', '#e7e3da', .97),
    rug: mat('Apartment · wool rug', '#c2b9aa', 1),
    ceramic: mat('Apartment · sanitary porcelain', '#f0eee7', .25),
    silver: mat('Apartment · satin chrome', '#b9bfc0', .24, .85),
    glass: mat('Apartment · clear architectural glass', '#c4d4d6', .12, .05),
    screen: mat('Apartment · television glass', '#10181d', .2, .25),
    leaf: mat('Apartment · leaves', '#4c6344', .86),
    soil: mat('Apartment · potting soil', '#40352a', 1),
    led: mat('Apartment · warm lamp diffuser', '#fff2d5', .6)
  };
  M.glass.alpha = .14; M.glass.transparencyMode = B.PBRMaterial.PBRMATERIAL_ALPHABLEND;
  M.glass.backFaceCulling = false; M.led.emissiveColor = new B.Color3(.65,.47,.25);
  const texture = (path, scale = 1) => {const t=new B.Texture(path,scene);t.uScale=t.vScale=scale;t.anisotropicFilteringLevel=8;return t;};
  M.stone.albedoTexture = texture('assets/Ivory_stone.png', 2);
  M.floor.albedoTexture = texture('assets/Ivory_stone.png', 3);
  M.receptionFloor.albedoTexture=texture('assets/Ivory_stone.png',1);
  M.receptionFloor.bumpTexture=texture('assets/Floor_normal.png',1);M.receptionFloor.bumpTexture.level=.035;
  M.floor.bumpTexture = texture('assets/Floor_normal.png', 2); M.floor.bumpTexture.level = .13;
  // Subtle woven texture, generated locally; no image or CDN requests.
  const weave = new B.DynamicTexture('Linen weave', {width:256,height:256}, scene, false);
  const ctx=weave.getContext(), pixels=ctx.createImageData(256,256); let seed=871;
  for(let y=0;y<256;y++)for(let x=0;x<256;x++) {seed=(seed*1664525+1013904223)>>>0;const n=215+(seed%23)+(x%3===0?9:0)+(y%3===0?7:0),i=(y*256+x)*4;pixels.data.set([n,n,n,255],i);}
  ctx.putImageData(pixels,0,0);weave.update();weave.uScale=weave.vScale=5;
  for(const name of ['grey','cream','taupe','sheet','blue','loungeBlue','terracotta','rug']) M[name].albedoTexture=weave;

  function box(name,w,h,d,x,y,z,material=M.oak,parent=null) {
    const m=B.MeshBuilder.CreateBox(name,{width:w,height:h,depth:d},scene);
    m.position.set(x,y,z);m.material=material;m.parent=parent;m.receiveShadows=true;return m;
  }
  // Rounded upholstered pieces with real curved edges and smooth normals.
  const roundCache=new Map();
  function soft(name,w,h,d,x,y,z,material=M.cream,parent=null,r=.055) {
    r=Math.min(r,w*.28,h*.28,d*.28);const key=[w,h,d,r].join('/');let vd=roundCache.get(key);
    if(!vd){const p=[],n=[],uv=[],ix=[],half=[w/2,h/2,d/2],inner=half.map(v=>v-r);
      const steps=v=>[-v,-v+r*.293,-v+r,0,v-r,v-r*.293,v];
      for(let axis=0;axis<3;axis++)for(const sign of [-1,1]){
        const u=(axis+1)%3,v=(axis+2)%3,us=steps(half[u]),vs=steps(half[v]),start=p.length/3;
        for(let j=0;j<7;j++)for(let i=0;i<7;i++){
          const q=[0,0,0];q[axis]=sign*half[axis];q[u]=us[i];q[v]=vs[j];
          const c=q.map((a,k)=>Math.max(-inner[k],Math.min(inner[k],a)));
          const normal=new B.Vector3(q[0]-c[0],q[1]-c[1],q[2]-c[2]).normalize();
          p.push(c[0]+normal.x*r,c[1]+normal.y*r,c[2]+normal.z*r);n.push(normal.x,normal.y,normal.z);uv.push(i/6,j/6);
        }
        for(let j=0;j<6;j++)for(let i=0;i<6;i++){const a=start+j*7+i,b=a+1,c=a+7,e=c+1;
          if(sign>0)ix.push(a,b,c,b,e,c);else ix.push(a,c,b,b,c,e);}
      }
      for(let i=0;i<ix.length;i+=3){const swap=ix[i+1];ix[i+1]=ix[i+2];ix[i+2]=swap;}
      vd=new B.VertexData();vd.positions=p;vd.normals=n;vd.uvs=uv;vd.indices=ix;roundCache.set(key,vd);
    }
    // Mesh merging can append indices in place. Each piece needs its own buffers,
    // even when its rounded shape comes from the same cached template.
    const m=new B.Mesh(name,scene);vd.clone().applyToMesh(m);m.position.set(x,y,z);m.material=material;m.parent=parent;m.receiveShadows=true;return m;
  }
  function cylinder(name,r,h,x,y,z,material=M.metal,parent=null,rTop=r) {
    const m=B.MeshBuilder.CreateCylinder(name,{diameter:r*2,diameterTop:rTop*2,height:h,tessellation:24},scene);
    m.position.set(x,y,z);m.material=material;m.parent=parent;m.receiveShadows=true;return m;
  }
  function sphere(name,w,h,d,x,y,z,material=M.cream,parent=null){const m=B.MeshBuilder.CreateSphere(name,{diameter:1,segments:12},scene);m.scaling.set(w,h,d);m.position.set(x,y,z);m.material=material;m.parent=parent;m.receiveShadows=true;return m;}
  function rod(name,a,b,r=.009,material=M.silver,parent=null){const path=[new B.Vector3(...a),new B.Vector3(...b)];const m=B.MeshBuilder.CreateTube(name,{path,radius:r,tessellation:8,cap:B.Mesh.CAP_ALL},scene);m.material=material;m.parent=parent;return m;}
  function node(name,x=0,y=0,z=0,angle=0,parent=null){const n=new B.TransformNode(name,scene);n.position.set(x,y,z);n.rotation.y=angle;n.parent=parent;return n;}
  function mirror(name,w,h,x,y,z,parent,room){
    box(name+' mounting frame',w+.035,h+.035,.025,x,y,z,M.metal,parent);
    const surface=B.MeshBuilder.CreatePlane(name,{width:w,height:h},scene);
    surface.position.set(x,y,z+.014);surface.parent=parent;surface.metadata={mirrorSurface:true,room};
    const material=new B.StandardMaterial(name+' silvered glass',scene);
    material.diffuseColor=B.Color3.Black();material.specularColor=new B.Color3(.18,.18,.18);material.backFaceCulling=false;
    const reflection=new B.MirrorTexture(name+' reflection',512,scene,true);reflection.level=.95;reflection.refreshRate=0;reflection.renderList=[];
    reflection.clearColor=new B.Color4(.50,.53,.54,1);material.reflectionTexture=reflection;surface.material=material;
    mirrors.push({surface,texture:reflection,room});return surface;
  }
  const fromRect=(name,r,low,high,material)=>box(name,(r[2]-r[0])/1000,(high-low)/1000,(r[3]-r[1])/1000,(r[0]+r[2])/2000,(high+low)/2000,-(r[1]+r[3])/2000,material);
  function wallPiece(m,r){walls.push({mesh:m,center:new B.Vector3((r[0]+r[2])/2000,1.2,-(r[1]+r[3])/2000)});return m;}
  for(const s of plan.walls)wallPiece(fromRect('R05 joined wall',s.bounds,s.low,s.high,M.wall),s.bounds);
  for(const r of plan.columns)wallPiece(fromRect('R05 structural column',r,0,2750,M.wall),r);

  // Full floor plate includes the door thresholds and open hall passages.
  fromRect('Apartment foundation',[-140,-140,12860,11700],-140,-30,M.grout);
  const bedroomIds=['MASTER','RECESS','STUDY','CHILD','DRESS'];
  function layFloor(name,r,wood,tile,material,origin){
    fromRect(name+' subfloor',r,-29,-3,M.grout);
    const tileX=wood?.18:tile,tileY=wood?1.2:tile,ox=origin[0]/1000,oy=origin[1]/1000;
    const firstRow=Math.floor((r[1]/1000-oy)/tileY);
    for(let row=firstRow,yy=oy+firstRow*tileY;yy<r[3]/1000-.001;row++,yy=oy+row*tileY){
      const shift=wood&&row%2?.09:0,start=ox-shift+Math.floor((r[0]/1000-ox+shift)/tileX)*tileX;
      for(let xx=start;xx<r[2]/1000-.001;xx+=tileX){
        const left=Math.max(xx,r[0]/1000),right=Math.min(xx+tileX,r[2]/1000),top=Math.max(yy,r[1]/1000),bottom=Math.min(yy+tileY,r[3]/1000);
        if(right-left<=.002||bottom-top<=.002)continue;
        const m=box(name+' floor',right-left-.002,.016,bottom-top-.002,(left+right)/2,-.004,-(top+bottom)/2,wood?M.oak:material);
        m.isPickable=false;m.metadata={floorSurface:true,floorZone:name};
      }
    }
  }
  for(const [id,room] of Object.entries(plan.rooms)){
    const r=room.bounds,w=(r[2]-r[0])/1000,d=(r[3]-r[1])/1000,cx=(r[0]+r[2])/2000,cz=-(r[1]+r[3])/2000;
    if(id==='SHAFT'){fromRect('Open light well floor',r,-110,-90,M.grout);continue;}
    const floorMaterial=id==='REC'?M.receptionFloor:M.floor;
    const wood=bedroomIds.includes(id), tile=id==='KIT'?.6:(['BATH','UTIL','WC'].includes(id)?.6:.8);
    for(const area of plan.floorAreas?.[id]||[r])layFloor(room.name,area,wood,tile,floorMaterial,r);
    if(!['BAL','BAY'].includes(id)){
      const c=box(room.name+' ceiling',w,.06,d,cx,2.78,cz,M.white);c.isPickable=false;ceilings.push(c);
      // Recessed warm fixtures, kept free of bloom.
      const spots=Math.max(1,Math.round(d/2.2));
      for(let j=0;j<spots;j++){const z=-(r[1]/1000+(j+.5)*d/spots);const trim=cylinder(room.name+' downlight',.062,.013,cx,2.736,z,M.white);const light=cylinder(room.name+' diffuser',.043,.015,cx,2.727,z,M.led);ceilings.push(trim,light);}
    }
    labels.push({id,name:room.name,bounds:r});
  }
  if(plan.masterEntryFloor)layFloor('Main bedroom entrance',plan.masterEntryFloor,true,.18,M.oak,plan.rooms.MASTER.bounds);
  for(const r of [...plan.passages,...plan.doors.map(d=>d.cut),...plan.windows.filter(w=>w.slider).map(w=>w.bounds)]){
    const e=plan.masterEntryFloor;
    if(e&&r[0]>=e[0]&&r[1]>=e[1]&&r[2]<=e[2]&&r[3]<=e[3])continue;
    fromRect('Flush threshold',r,-6,1,M.stone);
  }
  // Low balcony guardrails: these spaces remain visibly open to daylight.
  for(const r of [[0,11560,3840,11700],[12720,10080,12860,11560]]){
    wallPiece(fromRect('Balcony parapet',r,0,1050,M.wall),r);
  }
  // Exterior wall sections at balconies are parapets, not full-height enclosure.
  for(const w of walls){const p=w.center;if(w.mesh.name!=='R05 structural column'&&((p.z<-11.55&&p.x<3.87)||(p.x>12.71&&p.z<-10.06))){
    w.mesh.computeWorldMatrix(true);const b=w.mesh.getBoundingInfo().boundingBox;
    if(b.minimumWorld.y>=1.05){w.mesh.setEnabled(false);w.forcedHidden=true;}
    else if(b.maximumWorld.y>1.05){const low=b.minimumWorld.y;w.mesh.scaling.y=(1.05-low)/(b.maximumWorld.y-low);w.mesh.position.y=(low+1.05)/2;}
    w.balcony=true;
  }}

  // Room doors use real hinge pivots, jambs, recessed panels and handles.
  for(const d of plan.doors){
    const pivot=node(d.label,d.x/1000,0,-d.y/1000,d.angle*Math.PI/180);
    const width=d.w/1000;
    box(d.label+' oak leaf',width-.012,2.105,.035,width/2,1.067,0,M.oak,pivot);
    box(d.label+' inset panel',width-.15,1.8,.006,width/2,1.1,-.021,M.walnut,pivot);
    for(const z of [-.038,.038]){cylinder(d.label+' handle rose',.023,.014,width-.115,1.01,z,M.metal,pivot).rotation.x=Math.PI/2;rod(d.label+' lever',[width-.115,1.01,z],[width-.22,1.01,z],.009,M.metal,pivot);}
    // Jambs use closed doorway coordinates, independent of the animated leaf.
    const jamb=node(d.id+' fixed frame',d.x/1000,0,-d.y/1000,d.angle*Math.PI/180);
    for(const x of [0,width])box('Door frame',.025,2.16,.14,x,1.08,0,M.oak,jamb);
    box('Door frame head',width+.04,.035,.14,width/2,2.16,0,M.oak,jamb);
    const amount=(d.open-d.angle)*Math.PI/180;
    register(pivot,{id:d.id,label:d.label,kind:'hinge',axis:[0,1,0],amount,category:'room',room:d.room});
  }
  // Paired sliding sashes for balconies; framed casements for other openings.
  for(const win of plan.windows){
    const r=win.bounds,wide=r[2]-r[0]>r[3]-r[1],length=Math.max(r[2]-r[0],r[3]-r[1])/1000;
    const parent=node(win.id+' fixed frame',(r[0]+r[2])/2000,0,-(r[1]+r[3])/2000,wide?0:Math.PI/2);
    const sill=win.slider?.015:1.1,head=2.3,h=head-sill;
    for(const x of [-length/2,length/2])box('Window perimeter',.035,h,.10,x,(head+sill)/2,0,M.black,parent);
    for(const y of [sill,head])box('Window track',length,.035,.10,0,y,0,M.black,parent);
    for(let i=0;i<2;i++){
      const sash=node(win.id+' sash '+i,(i===0?-1:1)*length/4,0,i===0?-.024:.024,0,parent);
      box('Clear window glass',length/2-.036,h-.055,.008,0,(head+sill)/2,0,M.glass,sash);
      for(const x of [-length/4,length/4])box('Window stile',.024,h,.028,x,(head+sill)/2,0,M.black,sash);
      for(const y of [sill+.024,head-.024])box('Window rail',length/2,.024,.028,0,y,0,M.black,sash);
      if(i===0&&win.slider){rod('Slider pull',[length/4-.06,1.04,-.055],[length/4-.06,1.22,-.055],.008,M.silver,sash);register(sash,{id:win.id,label:win.id==='S01'?'Reception balcony slider':'Main bedroom balcony slider',kind:'slide',axis:[1,0,0],amount:length/2-.065,category:'room',room:win.id==='S01'?'REC':'MASTER'});}
    }
    if(!win.slider)box('Stone window sill',length+.03,.025,.20,0,sill-.013,0,M.stone,parent);
  }

  const roots=new Map();
  function localRoot(f,angle=0){const p=node(f.id+' · '+f.desc,(f.x+f.w/2)/1000,0,-(f.y+f.d/2)/1000,angle);p.metadata={furnitureId:f.id,room:f.room};roots.set(f.id,p);furniture.push(p);return p;}
  function feet(w,d,p,y=.10){for(const x of [-w/2+.07,w/2-.07])for(const z of [-d/2+.07,d/2-.07])cylinder('Tapered furniture leg',.021,y*2,x,y,z,M.walnut,p,.016);}
  function cushion(w,d,p,x,z,material=M.cream){const c=soft('Loose scatter cushion',w,d,.12,x,.63,z,material,p,.05);c.rotation.z=.14;c.rotation.x=.12;return c;}
  function sofa(p,w,d,material=M.grey){
    feet(w,d,p,.09);soft('Upholstered sofa base',w,.25,d,0,.25,0,material,p);
    soft('Upholstered sofa back',w,.65,.17,0,.58,-d/2+.085,material,p,.065);
    for(const x of [-w/2+.085,w/2-.085])soft('Sofa arm',.17,.48,d,x,.47,0,material,p,.06);
    const count=Math.max(1,Math.round(w/.8)),cw=(w-.38)/count;
    for(let i=0;i<count;i++){
      soft('Individual seat cushion',cw-.012,.14,d-.24,-w/2+.19+cw*(i+.5),.39,.07,material,p,.05);
      soft('Individual back cushion',cw-.022,.40,.16,-w/2+.19+cw*(i+.5),.67,-d/2+.22,material,p,.06);
    }
    cushion(.34,.34,p,-w/2+.40,-d/2+.30,M.cream);
  }
  function cabinet(f,p,w,d,h= .83,base=0,frontAngle=0){
    const q=node(f.id+' cabinet carcass',0,base,0,frontAngle,p);
    box('Cabinet back',w,h,.018,0,h/2,-d/2+.009,M.white,q);
    for(const x of [-w/2+.009,w/2-.009])box('Cabinet side',.018,h,d,x,h/2,0,M.oak,q);
    for(const y of [.035,h/2,h-.025])box('Cabinet shelf',w-.036,.025,d-.028,0,y,0,M.oak,q);
    box('Cabinet top',w+.008,.025,d+.012,0,h+.012,0,M.stone,q);
    const leaves=Math.max(1,Math.ceil(w/.6)),lw=w/leaves;
    for(let i=0;i<leaves;i++){
      const left=-w/2+i*lw,hinge=node(f.id+' door '+(i+1),left+.003,0,d/2-.01,0,q);
      box('Cabinet door panel',lw-.006,h-.06,.022,(lw-.006)/2,h/2+.01,0,M.oak,hinge);
      rod('Satin cabinet pull',[lw-.065,h-.15,.025],[lw-.065,h-.32,.025],.006,M.metal,hinge);
      register(hinge,{id:f.id+'_'+i,label:f.desc+(leaves>1?' · '+(i+1):''),kind:'hinge',axis:[0,1,0],amount:-Math.PI*.46,category:f.overhead?'upper':'cabinet',room:f.room});
    }
    return q;
  }
  function wardrobe(f,p,w,d,angle){
    const q=node(f.id+' wardrobe case',0,0,0,angle,p),h=f.height?f.height/1000:2.22;
    box('Wardrobe back',w,h,.018,0,h/2,-d/2+.009,M.oak,q);
    for(const x of [-w/2+.009,w/2-.009])box('Wardrobe side',.018,h,d,x,h/2,0,M.oak,q);
    for(const y of [.08,.52,1.78,h-.018])box('Wardrobe shelf',w-.036,.024,d,0,y,0,M.oak,q);
    rod('Wardrobe hanging rail',[-w/2+.04,1.66,0],[w/2-.04,1.66,0],.012,M.silver,q);
    const count=Math.max(2,Math.ceil(w/.75)),lw=w/count;
    for(let i=0;i<count;i++){
      const door=node(f.id+' sliding panel '+i,-w/2+lw*(i+.5),0,d/2+(i%2)*.026,0,q);
      box('Warm white wardrobe front',lw-.008,h-.035,.022,0,h/2+.01,0,M.white,door);
      rod('Vertical bronze wardrobe pull',[lw/2-.05,.96,.024],[lw/2-.05,1.40,.024],.006,M.metal,door);
      register(door,{id:f.id+'_'+i,label:f.desc+' · sliding panel '+(i+1),kind:'slide',axis:[1,0,0],amount:(i===count-1?-1:1)*(lw-.04),category:'cabinet',room:f.room,conflicts:Array.from({length:count},(_,j)=>f.id+'_'+j).filter(id=>id!==f.id+'_'+i)});
    }
  }
  function tap(p,x,y,z){rod('Chrome basin spout',[x,y,z],[x,y+.20,z],.014,M.silver,p);rod('Chrome basin outlet',[x,y+.20,z],[x,y+.20,z+.15],.014,M.silver,p);}
  function basin(f,p){const west=f.id==='B08';const w=(west?f.d:f.w)/1000,d=(west?f.w:f.d)/1000;
    const q=node('Vanity orientation',0,0,0,west?Math.PI/2:Math.PI,p);
    cabinet(f,q,w,d,.72,0,0);
    box('Vanity stone rim',w,.030,d,0,.755,0,M.stone,q);
    const bw=f.basinWidth?f.basinWidth/1000:w*.71,bd=f.basinDepth?f.basinDepth/1000:d*.68;
    box('Porcelain bowl base',bw,.018,bd,0,.775,0,M.ceramic,q);
    for(const x of [-bw/2,bw/2])soft('Porcelain basin edge',.032,.074,bd,x,.813,0,M.ceramic,q,.012);
    for(const z of [-bd/2,bd/2])soft('Porcelain basin edge',bw,.074,.032,0,.813,z,M.ceramic,q,.012);
    cylinder('Basin waste',.023,.004,0,.786,0,M.silver,q);tap(q,0,.78,-d/2+.06);
    const room=plan.rooms[f.room].bounds,wallGap=(west?f.x-room[0]:f.y-room[1])/1000;
    mirror(f.id+' wall-mounted mirror',f.mirrorWidth?f.mirrorWidth/1000:w*.86,.74,0,1.50,-d/2-wallGap+.008,q,f.room);
  }
  function toilet(f,p){const west=f.id==='B07',south=f.id==='B04';const q=node('WC orientation',0,0,0,west?Math.PI/2:south?0:Math.PI,p);
    box('Concealed cistern',.36,.77,.15,0,.385,-.265,M.ceramic,q);
    sphere('WC pedestal',.27,.34,.40,0,.17,.03,M.ceramic,q);
    sphere('Toilet bowl',.37,.19,.53,0,.315,.075,M.ceramic,q);
    const torus=B.MeshBuilder.CreateTorus('Toilet seat ring',{diameter:.325,thickness:.035,tessellation:32},scene);torus.scaling.z=1.38;torus.position.set(0,.4125,.075);torus.material=M.ceramic;torus.parent=q;
    sphere('Toilet bowl recess',.25,.012,.37,0,.402,.07,M.grout,q);
    box('Dual flush button',.11,.045,.012,0,.69,-.183,M.silver,q);
  }
  function shower(f,p){const w=f.w/1000,d=f.d/1000,wallGap=(f.y-plan.rooms[f.room].bounds[1])/1000,back=-d/2-wallGap;
    box('Shower stone tray',w,.07,d,0,.035,0,M.stone,p);
    box('Shower linear drain',w*.72,.006,.026,0,.074,-d/2+.10,M.silver,p);
    const doorWidth=Math.min(.70,w-.25),fixedWidth=w-doorWidth;
    box('Fixed shower glass',fixedWidth-.018,2.0,.008,doorWidth/2,1.08,d/2-.02,M.glass,p);
    const door=node(f.id+' shower door',-w/2,0,d/2-.02,0,p);
    box('Hinged shower glass',doorWidth-.012,1.99,.008,doorWidth/2,1.08,0,M.glass,door);
    for(const z of [-.022,.022])rod('Shower door pull',[doorWidth-.055,.95,z],[doorWidth-.055,1.16,z],.007,M.silver,door);
    register(door,{id:f.id+'_screen',label:(f.room==='UTIL'?'Bathroom 2':'Bathroom 1')+' shower door',kind:'hinge',axis:[0,1,0],amount:-Math.PI/2,category:'room',room:f.room});
    rod('Shower glass top rail',[-w/2,2.08,d/2],[w/2,2.08,d/2],.009,M.silver,p);
    rod('Shower rail',[w/2-.14,1,back+.03],[w/2-.14,2.11,back+.03],.012,M.silver,p);
    rod('Rain shower arm',[w/2-.14,2.11,back+.03],[w/2-.14,2.11,back+.33],.012,M.silver,p);
    for(const y of [1.05,1.95])rod('Shower wall bracket',[w/2-.14,y,back+.004],[w/2-.14,y,back+.03],.018,M.silver,p);
    cylinder('Rain shower head',.105,.018,w/2-.14,2.09,back+.33,M.silver,p);
    box('Shower mixer',.16,.07,.04,w/2-.14,1.05,back+.025,M.silver,p);
  }
  function bookcase(f,p){const w=f.d/1000,d=f.w/1000,h=f.height?f.height/1000:f.id==='R13'?.81:1.6,base=f.base!==undefined?f.base/1000:f.overhead?1.34:0;
    const q=node('Bookcase orientation',0,base,0,f.frontSide==='west'?-Math.PI/2:Math.PI/2,p);
    box('Bookcase back',w,h,.016,0,h/2,-d/2,M.walnut,q);
    for(const x of [-w/2,w/2])box('Bookcase side',.018,h,d,x,h/2,0,M.walnut,q);
    for(let row=0;row<4;row++){
      const y=.02+row*(h-.04)/3;box('Bookcase shelf',w,.022,d,0,y,0,M.walnut,q);
      if(row===3)continue;
      for(let i=0;i<Math.floor(w/.075);i++){const bw=.035+(i%4)*.009,bh=(h/3)*(.65+(i%3)*.06);const color=[M.cream,M.walnut,M.taupe,M.blue][i%4];box('Book spine',bw,bh,d*.65,-w/2+.05+i*.075,y+bh/2+.018,.02,color,q);}
    }
  }
  for(const f of plan.furniture){
    if(f.room==='KIT')continue;
    const p=localRoot(f),w=f.w/1000,d=f.d/1000;
    if(f.kind==='sofa'){p.rotation.y=Math.PI/2;sofa(p,d,w,f.id==='R08'?M.grey:M.taupe);}
    else if(f.kind==='armchair'){p.rotation.y=-Math.PI/2;sofa(p,w,d,M.taupe);}
    else if(f.kind==='l_sofa'){
      window.buildLoungeSectional(B,scene,{M,soft,cylinder,rod},p,w,d);
    }
    else if(f.kind==='chair'){
      p.rotation.y=f.frontSide==='west'?-Math.PI/2:f.frontSide==='east'?Math.PI/2:f.x<1000?Math.PI/2:f.x>2000?-Math.PI/2:f.y<2000?Math.PI:0;
      feet(w-.08,d-.06,p,.19);soft('Dining chair seat',w,.10,d,0,.405,0,M.cream,p,.04);
      soft('Dining chair padded back',w,.50,.09,0,.69,-d/2+.045,M.cream,p,.04);
    }
    else if(f.kind==='table'){
      const h=f.id==='R01'?.7275:.4075;
      soft('Table top',w,.045,d,0,h,0,f.id==='R01'?M.walnut:M.oak,p,.025);
      if(f.id==='R01'){for(const z of [-d*.30,d*.30])box('Dining sculpted pedestal',w*.47,h-.04,.14,0,h/2,z,M.walnut,p);}
      else {box('Coffee table drawer base',w*.92,.36,d*.93,0,.205,0,M.walnut,p);for(const x of [-w*.37,w*.37])for(const z of [-d*.37,d*.37])cylinder('Coffee table recessed foot',.025,.025,x,.0125,z,M.walnut,p);const drawer=node(f.id+' drawer',0,0,d*.47,0,p);box('Coffee drawer front',w*.84,.22,.02,0,.23,0,M.white,drawer);register(drawer,{id:f.id+'_drawer',label:f.desc+' drawer',kind:'slide',axis:[0,0,1],amount:.28,category:'drawer',room:f.room});}
    }
    else if(f.kind==='bed'){
      const headRight=f.headSide?f.headSide==='right':f.id!=='M01';p.rotation.y=f.orientation==='vertical'?0:headRight?-Math.PI/2:Math.PI/2;
      const bw=f.orientation==='vertical'?w:d,bl=f.orientation==='vertical'?d:w;feet(bw,bl,p,.08);soft('Oak upholstered bed frame',bw,.28,bl,0,.27,0,M.walnut,p,.025);
      soft('Padded headboard',bw,.99,.075,0,.56,-bl/2+.04,M.taupe,p,.035);
      soft('Mattress',bw-(f.orientation==='vertical'?.04:.07),.23,bl-.08,0,.51,0,M.sheet,p,.06);
      soft('Linen duvet',bw-.045,.085,bl*.75,0,.66,bl*.1,M.sheet,p,.04);
      const pillowCount=f.id==='M01'?2:1;
      for(let i=0;i<pillowCount;i++)soft('Sleeping pillow',Math.min(.60,bw/pillowCount-.09),.13,.40,(i-(pillowCount-1)/2)*bw/pillowCount,.72,-bl/2+.32,M.sheet,p,.06);
      soft('Folded bed throw',bw-.025,.03,.65,0,.72,bl/2-.43,f.id==='C01'?M.blue:f.id==='C07'?M.terracotta:M.taupe,p,.012);
    }
    else if(f.kind==='wardrobe'){
      const side=w<d;const angle=side?(f.frontSide==='east'||f.id==='M05a'?Math.PI/2:-Math.PI/2):Math.PI;
      wardrobe(f,p,side?d:w,side?w:d,angle);
    }
    else if(f.kind==='tv'){
      const side=w<d;p.rotation.y=side?-Math.PI/2:Math.PI;
      const tw=side?d:w;soft('Thin television bezel',tw,.72,.04,0,1.42,0,M.black,p,.012);
      box('Dark television screen',tw-.03,.685,.004,0,1.42,.024,M.screen,p);
    }
    else if(f.kind==='tv_unit'){
      const side=w<d;cabinet(f,p,side?d:w,side?w:d,.43,.18,side?-Math.PI/2:Math.PI);
    }
    else if(f.kind==='bookcase')bookcase(f,p);
    else if(f.kind==='wall_mirror'){
      p.rotation.y=-Math.PI/2;
      const wallGap=(plan.rooms[f.room].bounds[2]-f.x-f.w/2)/1000;
      const surface=mirror(f.id+' entry mirror',d,f.height/1000,0,(f.base+f.height/2)/1000,-wallGap+.008,p,f.room);
      surface.metadata.wallSide='east';
    }
    else if(f.kind==='dresser'){
      const west=f.frontSide==='east',q=node('Dresser orientation',0,0,0,west?Math.PI/2:-Math.PI/2,p);cabinet(f,q,d,w,.78);
      const wallGap=(west?f.x-plan.rooms[f.room].bounds[0]:plan.rooms[f.room].bounds[2]-f.x-f.w)/1000;
      mirror('Dressing wall mirror',.90,.90,0,1.39,-w/2-wallGap+.008,q,f.room);
    }
    else if(f.kind==='wc')toilet(f,p);
    else if(f.kind==='basin')basin(f,p);
    else if(f.kind==='shower'){p.rotation.y=Math.PI;shower(f,p);}
    else if(f.kind==='washer'){
      p.rotation.y=Math.PI/2;box('Laundry washer body',d,.85,w,0,.425,0,M.white,p);
      const ring=B.MeshBuilder.CreateTorus('Washer chrome door ring',{diameter:.38,thickness:.045,tessellation:32},scene);ring.rotation.x=Math.PI/2;ring.position.set(0,.40,w/2+.012);ring.material=M.silver;ring.parent=p;
      const hinge=node('Washer door hinge',-.18,.4,w/2+.03,0,p);
      const glass=cylinder('Washer door glass',.166,.018,.18,0,0,M.screen,hinge);glass.rotation.x=Math.PI/2;
      cylinder('Washer programme dial',.028,.02,-.16,.74,w/2+.018,M.silver,p).rotation.x=Math.PI/2;
      box('Washer display',.16,.065,.015,.12,.74,w/2+.018,M.black,p);
      register(hinge,{id:'washer',label:'Bathroom 2 washing machine',kind:'hinge',axis:[0,1,0],amount:-1.65,category:'appliance',room:f.room});
    }
    else if(f.kind==='desk'){
      const q=node('Study desk orientation',0,0,0,f.frontSide==='east'?Math.PI/2:-Math.PI/2,p),width=d,depth=w;
      box('Study desk oak worktop',width,.035,depth,0,.7325,0,M.oak,q);
      for(const x of [-width/2+.015,width/2-.015])box('Study desk end panel',.025,.71,depth-.03,x,.355,0,M.white,q);
      const drawer=node(f.id+' desk drawer',width/2-.19,0,depth/2-.015,0,q);
      for(const x of [width/2-.352,width/2-.028])box('Study drawer case side',.016,.56,depth-.04,x,.36,0,M.white,q);
      box('Study drawer case back',.34,.56,.016,width/2-.19,.36,-depth/2+.018,M.white,q);
      for(const y of [.08,.48,.66])box('Study drawer case shelf',.34,.016,depth-.04,width/2-.19,y,0,M.white,q);
      box('Study drawer tray',.31,.014,depth-.06,0,.495,-(depth-.06)/2+.003,M.oak,drawer);
      for(const x of [-.15,.15])box('Study drawer tray side',.012,.10,depth-.06,x,.55,-(depth-.06)/2+.003,M.oak,drawer);
      box('Study drawer face',.33,.15,.018,0,.565,0,M.oak,drawer);
      rod('Study drawer handle',[-.08,.565,.02],[.08,.565,.02],.004,M.metal,drawer);
      register(drawer,{id:f.id+'_drawer',label:f.desc+' drawer',kind:'slide',axis:[0,0,1],amount:.28,category:'drawer',room:f.room});
    }
    else if(f.kind==='shoe_cabinet'){
      const q=node('Shoe cabinet orientation',.005,0,0,-Math.PI/2,p),width=d,depth=w-.010,base=.10,h=1.17;
      box('Shoe storage backing',width,h,.016,0,base+h/2,-depth/2+.008,M.white,q);
      for(const x of [-width/2,0,width/2])box('Shoe cabinet side',.016,h,depth,x,base+h/2,0,M.white,q);
      box('Shoe cabinet oak top',width+.008,.022,depth,0,base+h+.011,0,M.oak,q);
      for(let col=0;col<2;col++)for(let row=0;row<3;row++){
        const cw=width/2-.012,ch=h/3-.014,x=(col-.5)*width/2,y=base+row*h/3;
        const pivot=node('Shoe tilt bin '+col+' '+row,x,y,depth/2-.008,0,q);
        box('Matte shoe bin front',cw,ch,.018,0,ch/2,0,M.white,pivot);
        box('Tilt bin tray',cw-.025,.014,depth-.035,0,.025,-depth/2+.013,M.oak,pivot);
        rod('Recessed shoe bin pull',[-.09,ch-.04,.014],[.09,ch-.04,.014],.004,M.metal,pivot);
        register(pivot,{id:f.id+'_'+col+'_'+row,label:'Shoe cabinet bin '+(col*3+row+1),kind:'hinge',axis:[1,0,0],amount:.58,category:'cabinet',room:f.room});
      }
    }
    else if(f.kind==='cabinet'){
      const side=w<d,base=f.id==='B10'?1.5:f.overhead?2.03:0,height=f.id==='B10'?.7:f.overhead?.35:f.id.startsWith('M02')||['C14','C15'].includes(f.id)?.48:.83;
      cabinet(f,p,side?d:w,side?w:d,height,base,side?(f.id==='B10'||f.frontSide==='east'?Math.PI/2:-Math.PI/2):Math.PI);
    }
  }
  // Rugs deliberately remain outside clear circulation and door swings.
  for(const [r,color] of [ [[145,1590,2870,4420],M.rug],[[100,7350,3180,10020],M.rug],[[4200,9290,7150,11430],M.rug],[[10290,3010,12540,5290],M.rug],[[8020,7920,11300,11480],M.rug] ]){
    const rug=fromRect('Bound woven rug',r,7,13,color);rug.isPickable=false;
  }
  // A small number of decorative objects keep the real furniture footprints clear.
  for(const [x,z,y] of [[1.86,-.25,.855],[1.95,-8.45,.43],[5.85,-9.83,.43]]){
    cylinder('Stoneware decorative vase',.075,.19,x,y+.095,z,M.cream,null,.055);
    rod('Dried ornamental stem',[x,y+.15,z],[x+.04,y+.39,z+.02],.003,M.walnut);
    sphere('Dried seed head',.07,.10,.03,x+.04,y+.37,z+.02,M.taupe);
  }
  for(const [x,z,y] of [[1.92,-8.88,.443],[6.13,-9.83,.443]]){
    box('Coffee table art book',.22,.026,.30,x,y,z,M.cream);
    const top=box('Art book cover',.22,.004,.30,x,y+.015,z,M.walnut);top.rotation.y=.09;
  }
  const buffetMirror=node('R03 wall mirror mount',1.25,0,0,Math.PI);
  mirror('Mirror above R03',1.60,.90,0,1.55,.008,buffetMirror,'REC');
  // Dining pendant is a restrained pair of brass rings above the measured table.
  for(const z of [-2.35,-3.35]){
    rod('Pendant suspension',[1.6,2.75,z],[1.6,2.16,z],.003,M.black);
    const ring=B.MeshBuilder.CreateTorus('Dining pendant brass ring',{diameter:.52,thickness:.018,tessellation:48},scene);ring.position.set(1.6,2.14,z);ring.material=M.metal;ceilings.push(ring);
  }
  const details=window.addApartmentDetails(B,scene,{M,node,box,soft,cylinder,sphere,rod,furniture,roots,plan});
  // Batch tiles by finish while keeping their modelled joints.
  for(const material of [M.oak,M.floor,M.receptionFloor]){
    const tiles=scene.meshes.filter(m=>m.name.endsWith(' floor')&&m.material===material);
    if(tiles.length){const merged=B.Mesh.MergeMeshes(tiles,true,true,undefined,false,false);merged.name='Apartment batched floor · '+material.name;merged.material=material;merged.receiveShadows=true;merged.isPickable=false;merged.metadata={floorSurface:true};}
  }
  // Wall skirtings share each lower wall's visibility for a clean cutaway.
  for(const wall of [...walls]){
    const b=wall.mesh.getBoundingInfo().boundingBox;
    if(wall.mesh.position.y-b.extendSize.y<=.001){const s=box('Oak skirting',b.extendSize.x*2+.006,.065,b.extendSize.z*2+.006,wall.mesh.position.x,.0325,wall.mesh.position.z,M.oak);wall.skirting=s;}
  }
  return {walls,ceilings,furniture,roots,materials:M,labels,box,soft,details,mirrors};
};
