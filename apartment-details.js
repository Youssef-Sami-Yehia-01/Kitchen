'use strict';

// Decorative geometry uses the same metre coordinates as the original scene.
// It is batched with static furniture; none of the R05 furniture is relocated.
window.addApartmentDetails = function (B, scene, kit) {
  const {M,node,box,soft,cylinder,sphere,rod,furniture,roots,plan} = kit;
  const drapes=[],obstacles=[],plantRecords=[];
  const material=(name,hex,roughness=.85,metallic=0)=>{
    const m=new B.PBRMaterial('Apartment · '+name,scene);
    m.albedoColor=B.Color3.FromHexString(hex).toLinearSpace();m.roughness=roughness;
    m.metallic=metallic;m.maxSimultaneousLights=4;return m;
  };
  const leafMats=[material('foliage forest','#36553c'),material('foliage olive','#5f794c'),material('foliage sage','#87976b')];
  const clay=material('handmade terracotta','#b68066'),chalk=material('ribbed chalk ceramic','#cfc6b4');
  const seam=material('upholstery piping','#a79c89'),linen=material('curtain linen','#ddd6c7');
  linen.albedoTexture=M.cream.albedoTexture;linen.backFaceCulling=false;linen.twoSidedLighting=true;
  const fabricNormal=new B.DynamicTexture('Fine woven fabric normal',{width:128,height:128},scene,false);
  const fc=fabricNormal.getContext(),fp=fc.createImageData(128,128);
  for(let y=0;y<128;y++)for(let x=0;x<128;x++){
    const dx=.16*Math.cos(x*Math.PI/2),dy=.16*Math.cos(y*Math.PI/2),z=Math.sqrt(1-dx*dx-dy*dy),i=(y*128+x)*4;
    fp.data.set([Math.round((dx+1)*127.5),Math.round((dy+1)*127.5),Math.round((z+1)*127.5),255],i);
  }
  fc.putImageData(fp,0,0);fabricNormal.update();fabricNormal.gammaSpace=false;fabricNormal.uScale=fabricNormal.vScale=8;fabricNormal.level=.15;
  for(const m of [M.cream,M.grey,M.taupe,M.sheet,M.blue,M.loungeBlue,M.terracotta,M.rug,linen])m.bumpTexture=fabricNormal;
  const leafTexture=new B.DynamicTexture('Natural leaf veins',{width:128,height:256},scene,false);
  const lc=leafTexture.getContext();lc.fillStyle='#deded3';lc.fillRect(0,0,128,256);
  lc.strokeStyle='#a9b09b';lc.lineWidth=2;lc.beginPath();lc.moveTo(64,256);lc.lineTo(64,0);lc.stroke();
  lc.lineWidth=.8;for(let i=1;i<12;i++){const y=i*21;for(const side of [-1,1]){lc.beginPath();lc.moveTo(64,y);lc.quadraticCurveTo(64+side*20,y-13,64+side*57,y-35);lc.stroke();}}
  leafTexture.update();
  for(const m of leafMats){m.albedoTexture=leafTexture;m.backFaceCulling=false;m.twoSidedLighting=true;}
  function decorRoot(name,x,y,z){const p=node(name,x,y,z);p.metadata={decoration:true};furniture.push(p);return p;}
  function leaf(parent,start,end,width,index=0){
    const a=new B.Vector3(...start),v=new B.Vector3(...end).subtract(a),length=v.length();
    const side=B.Vector3.Cross(v,B.Axis.Y).normalize();if(side.lengthSquared()<.1)side.set(1,0,0);
    const positions=[],uvs=[],indices=[],normals=[];
    for(let row=0;row<=8;row++){
      const t=row/8,spread=Math.pow(Math.sin(Math.PI*t),.78)*width/2;
      const center=a.add(v.scale(t));center.y+=Math.sin(Math.PI*t)*length*.13;
      for(let col=0;col<3;col++){const q=center.add(side.scale((col-1)*spread));q.y+=col===1?Math.sin(Math.PI*t)*width*.13:0;positions.push(q.x,q.y,q.z);uvs.push(col/2,t);}
      if(row<8)for(let col=0;col<2;col++){const i=row*3+col;indices.push(i,i+3,i+1,i+1,i+3,i+4);}
    }
    B.VertexData.ComputeNormals(positions,indices,normals);
    const vd=new B.VertexData();vd.positions=positions;vd.indices=indices;vd.normals=normals;vd.uvs=uvs;
    const mesh=new B.Mesh('Curved botanical leaf',scene);vd.applyToMesh(mesh);mesh.parent=parent;
    mesh.material=leafMats[index%3];mesh.receiveShadows=true;mesh.isPickable=false;
  }
  function stem(parent,points,r=.003){const m=B.MeshBuilder.CreateTube('Branch',{path:points.map(v=>new B.Vector3(...v)),radius:r,tessellation:6},scene);m.parent=parent;m.material=M.walnut;m.isPickable=false;}
  function pot(parent,r,h,finish=chalk){
    cylinder('Textured ceramic planter',r,h,0,h/2,0,finish,parent,r*1.13);
    const lip=B.MeshBuilder.CreateTorus('Planter rolled rim',{diameter:r*2.23,thickness:r*.10,tessellation:32},scene);lip.position.y=h-.005;lip.material=finish;lip.parent=parent;
    cylinder('Recessed potting soil',r*1.05,.012,0,h-.022,0,M.soil,parent);
    cylinder('Planter saucer',r*1.15,.014,0,.007,0,finish,parent);
    for(let i=0;i<8;i++){const a=i*2.399,rho=r*.78*Math.sqrt((i+1)/8),pebble=B.MeshBuilder.CreateIcoSphere('Soil pebble',{radius:1,subdivisions:1,flat:true},scene);pebble.scaling.set(r*.04,.003,r*.035);pebble.position.set(Math.cos(a)*rho,h-.014,Math.sin(a)*rho);pebble.material=M.grout;pebble.parent=parent;pebble.isPickable=false;}
    for(let i=0;i<20;i++){const a=i*Math.PI/10;rod('Planter ceramic rib',[Math.cos(a)*r*.94,.045,Math.sin(a)*r*.94],[Math.cos(a)*r*1.1,h-.025,Math.sin(a)*r*1.1],r*.018,finish,parent);}
  }
  function plant(name,x,z,h,type='broadleaf',base=0,radius=null){
    const r=radius??Math.min(.17,Math.max(.055,h*.135)),potH=r*1.72;
    const p=decorRoot(name,x,base,z);pot(p,r,potH,type==='tree'?clay:chalk);
    if(base===0){obstacles.push([x-r*1.15,x+r*1.15,-z-r*1.15,-z+r*1.15]);}
    plantRecords.push({name,x,y:-z,height:h,base,radius:r*1.15,type});
    const foliageStart=potH-.025;
    if(type==='tree'){
      stem(p,[[0,foliageStart,0],[.018,h*.58,0],[-.025,h*.91,.012]],.015);
      for(let i=0;i<13;i++){
        const a=i*2.399,level=h*(.46+(i%5)*.085),reach=h*(.12+(i%3)*.025);
        const branch=[Math.cos(a)*reach,level+.12,Math.sin(a)*reach];
        stem(p,[[0,level-.11,0],branch],.005);
        for(let j=0;j<3;j++){const az=a+(j-1)*.61,start=[branch[0]*.7,branch[1]-.04,branch[2]*.7],end=[branch[0]+Math.cos(az)*h*.14,branch[1]+.05-(j%2)*.09,branch[2]+Math.sin(az)*h*.14];leaf(p,start,end,h*.095,i+j);}
      }
    }else if(type==='trailing'){
      for(let vine=0;vine<5;vine++){
        const a=vine*1.35,reach=r*2.3,drop=h*(.6+(vine%3)*.17),points=[];
        for(let j=0;j<=9;j++){const t=j/9;points.push([Math.cos(a)*(r*.25+reach*t),foliageStart+.07*Math.sin(t*Math.PI)-drop*t,Math.sin(a)*(r*.25+reach*t)]);}
        stem(p,points,.0025);
        for(let j=1;j<10;j++){const start=points[j],az=a+(j%2?1:-1)*1.1;leaf(p,start,[start[0]+Math.cos(az)*r*1.25,start[1]+.025,start[2]+Math.sin(az)*r*1.25],r*.90,vine+j);}
      }
      for(let i=0;i<7;i++){const a=i*2.399;leaf(p,[0,foliageStart,0],[Math.cos(a)*r*1.8,foliageStart+.12,Math.sin(a)*r*1.8],r*.85,i);}
    }else{
      const grass=type==='grass',count=grass?32:22;
      for(let i=0;i<count;i++){
        const a=i*2.399,reach=h*(grass?.21:.29)*(1+(i%3)*.12),top=h*(.63+(i%5)*.075);
        const end=[Math.cos(a)*reach,top,Math.sin(a)*reach];
        if(!grass)stem(p,[[0,foliageStart,0],[end[0]*.45,top*.8,end[2]*.45]],Math.max(.0015,h*.003));
        leaf(p,grass?[0,foliageStart,0]:[end[0]*.45,Math.max(foliageStart,top*.78),end[2]*.45],end,h*(grass?.032:.15),i);
      }
    }
    return p;
  }

  // Floor planting stays inside empty corners. Table/shelf planting has no floor footprint.
  plant('Shoe cabinet compact greenery',3.77,-2.58,.32,'grass',1.292,.05);
  plant('Buffet sculptural greenery',.55,-.25,.60,'broadleaf',.855,.085);
  plant('TV console greenery',3.66,-8.15,.38,'broadleaf',.635,.055);
  plant('Family TV console greenery',5.12,-7.46,.32,'grass',.635,.05);
  plant('Balcony olive tree',.47,-10.98,1.70,'tree');
  plant('Balcony broadleaf plant',3.35,-10.98,1.15);
  plant('Bedroom balcony greenery',12.56,-10.68,.70,'grass');
  plant('Bedroom balcony far planter',12.56,-11.27,.70,'grass');
  plant('Buffet greenery',1.48,-.25,.39,'broadleaf',.855,.067);
  plant('Dining centrepiece',1.60,-2.88,.25,'grass',.750,.052);
  plant('Main bedside greenery',12.24,-2.98,.28,'broadleaf',.505,.055);
  plant('Dressing table greenery',8.96,-1.91,.26,'grass',.805,.05);
  plant('Family bookcase trailing pothos',4.19,-7.96,.62,'trailing',2.23,.068);
  plant('Reception bookcase trailing pothos',.41,-8.38,.62,'trailing',2.17,.07);
  plant('Kitchen counter herbs',4.20,-4.68,.26,'grass',.905,.05);
  plant('Children window plant',8.42,-11.56,.27,'grass',1.12,.05);
  plant('Family window plant',5.10,-11.56,.30,'broadleaf',1.12,.052);
  plant('Family centre table greenery',6.15,-9.77,.23,'broadleaf',.430,.045);
  // A low trough leaves the balcony's central walking strip open.
  const trough=decorRoot('Reception balcony herb trough',1.94,0,-11.43);
  box('Trough planter',1.64,.30,.21,0,.15,0,chalk,trough);
  box('Trough soil',1.59,.015,.165,0,.303,0,M.soil,trough);
  obstacles.push([1.12,2.76,11.325,11.535]);
  for(let i=0;i<9;i++){
    const x=-.7+i*.175;
    for(let j=0;j<12;j++){const a=j*2.399;leaf(trough,[x,.31,0],[x+Math.cos(a)*.11,.47+(j%4)*.04,Math.sin(a)*.12],.035,(i+j)%3);}
  }

  // Stacked linen curtains keep the sliding doorway itself usable.
  for(const id of ['S01','S02','W06','W07']){
    const win=plan.windows.find(w=>w.id===id),r=win.bounds,width=(r[2]-r[0])/1000;
    const z=-(r[1]+r[3])/2000+.085;
    const p=node(id+' linen drapery',(r[0]+r[2])/2000,0,z);
    drapes.push({node:p,center:new B.Vector3((r[0]+r[2])/2000,1.2,z)});
    const railEnd=id==='S02'?width/2-.03:width/2+.09;
    rod('Curtain bronze rail',[-railEnd,2.48,0],[railEnd,2.48,0],.008,M.metal,p);
    const bracketEnd=id==='S02'?width/2-.06:width/2+.07;
    for(const x of [-bracketEnd,bracketEnd])rod('Curtain wall bracket',[x,2.48,0],[x,2.48,-.025],.012,M.metal,p);
    const panelWidth=id==='S02'?.10:win.slider?.14:.20,hem=.025,top=2.44;
    for(const side of [-1,1]){
      const center=side*(width/2-(id==='S02'?.085:.015)),positions=[],uv=[],indices=[],normals=[];
      for(let row=0;row<=12;row++)for(let col=0;col<=24;col++){
        const u=col/24,v=row/12,x=center+(u-.5)*panelWidth,fold=Math.sin(u*Math.PI*10)*.023;
        positions.push(x,top-(top-hem)*v,fold+Math.sin(v*Math.PI)*.008);uv.push(u*2,v*6);
        if(row<12&&col<24){const i=row*25+col;indices.push(i,i+25,i+1,i+1,i+25,i+26);}
      }
      B.VertexData.ComputeNormals(positions,indices,normals);const vd=new B.VertexData();vd.positions=positions;vd.indices=indices;vd.normals=normals;vd.uvs=uv;
      const mesh=new B.Mesh('Pleated linen curtain',scene);vd.applyToMesh(mesh);mesh.material=linen;mesh.parent=p;mesh.receiveShadows=true;mesh.isPickable=false;
      for(let i=0;i<6;i++){const ring=B.MeshBuilder.CreateTorus('Curtain suspension ring',{diameter:.027,thickness:.003,tessellation:12},scene);ring.rotation.x=Math.PI/2;ring.position.set(center-panelWidth/2+i*panelWidth/5,2.465,0);ring.material=M.metal;ring.parent=p;}
    }
  }

  // Readable close-up furniture detail: piping, quilt seams, drawer pulls and linens.
  for(const id of ['R05','R08']){
    const f=plan.furniture.find(v=>v.id===id),p=roots.get(id),w=f.kind==='sofa'?f.d/1000:f.w/1000,d=f.kind==='sofa'?f.w/1000:f.d/1000;
    for(const x of [-w/2+.19,w/2-.19])rod('Seat cushion piping',[x,.465,-d/2+.21],[x,.465,d/2-.08],.0025,seam,p);
    rod('Seat front piping',[-w/2+.19,.465,d/2-.075],[w/2-.19,.465,d/2-.075],.0025,seam,p);
    const pillow=soft('Textured accent pillow',.32,.32,.12,w/2-.40,.62,-d/2+.28,id==='R08'?M.blue:M.terracotta,p,.05);pillow.rotation.z=-.12;
  }
  for(const id of ['M01','C01','C07']){
    const f=plan.furniture.find(v=>v.id===id),p=roots.get(id),w=(f.orientation==='vertical'?f.w:f.d)/1000,length=(f.orientation==='vertical'?f.d:f.w)/1000;
    for(let i=0;i<7;i++){const z=length/2-.68+i*.08;rod('Bed throw woven seam',[-w/2+.04,.738,z],[w/2-.04,.738,z],.0018,id==='C07'?M.cream:M.taupe,p);}
    for(const x of [-w/2+.055,w/2-.055])rod('Duvet bound edge',[x,.696,-length*.25],[x,.696,length/2-.04],.0025,M.cream,p);
  }
  for(const f of plan.furniture.filter(v=>v.kind==='wardrobe')){
    const q=scene.getTransformNodeByName(f.id+' wardrobe case'),w=Math.max(f.w,f.d)/1000;
    if(!q)continue;const count=Math.min(9,Math.max(3,Math.floor(w/.22)));
    for(let i=0;i<count;i++){
      const x=-w/2+(i+1)*w/(count+1),y=1.57;
      rod('Wardrobe hanger hook',[x,1.66,0],[x,y,0],.003,M.metal,q);
      rod('Wardrobe hanger shoulder',[x-.085,y-.07,0],[x,y,0],.003,M.walnut,q);
      rod('Wardrobe hanger shoulder',[x,y,0],[x+.085,y-.07,0],.003,M.walnut,q);
      soft('Hanging linen garment',.16,.53,.038,x,1.20,0,[M.cream,M.blue,M.taupe][i%3],q,.016);
      box('Garment sleeve',.06,.22,.04,x-.097,1.35,0,M.cream,q).rotation.z=-.18;
      box('Garment sleeve',.06,.22,.04,x+.097,1.35,0,M.cream,q).rotation.z=.18;
    }
    for(let i=0;i<2;i++)soft('Folded wardrobe linen',Math.min(.35,w*.35),.07,.34,-w*.20,.59+i*.075,.01,i?M.sheet:M.taupe,q,.012);
  }
  // Bedside lamp and grooming/bathroom objects sit wholly on existing furniture.
  const lamp=decorRoot('Main bedside reading lamp',12.24,.505,-5.14);
  cylinder('Lamp brass foot',.075,.015,0,.008,0,M.metal,lamp);
  cylinder('Lamp stem',.008,.28,0,.15,0,M.metal,lamp);
  cylinder('Linen lamp shade',.11,.16,0,.36,0,linen,lamp,.075);
  cylinder('Warm lamp diffuser',.075,.004,0,.278,0,M.led,lamp);
  for(const f of plan.furniture.filter(v=>v.kind==='basin')){
    const p=roots.get(f.id),west=f.id==='B08',q=node('Vanity countertop accessories',0,0,0,west?Math.PI/2:Math.PI,p);
    const w=(west?f.d:f.w)/1000,d=(west?f.w:f.d)/1000;
    cylinder('Ceramic soap dispenser',.025,.10,-w/2+.06,.825,-d/2+.08,M.cream,q);
    rod('Soap dispenser pump',[-w/2+.06,.887,-d/2+.08],[-w/2+.02,.887,-d/2+.08],.004,M.silver,q);
    soft('Folded hand towel',.15,.025,.11,w/2-.09,.7825,d/2-.07,M.sheet,q,.008);
  }
  // Add two handles to each fixed shower screen and a small practical shelf.
  for(const f of plan.furniture.filter(v=>v.kind==='shower')){
    const p=roots.get(f.id),w=f.w/1000,d=f.d/1000,wallGap=(f.y-plan.rooms[f.room].bounds[1])/1000;
    box('Shower shelf',.26,.018,.11,-w*.24,1.27,-d/2-wallGap+.07,M.stone,p);
    for(let i=0;i<2;i++)cylinder('Shower bottle',.021,.135,-w*.24+(i-.5)*.075,1.345,-d/2-wallGap+.065,i?M.cream:clay,p,.018);
  }

  return {drapes,obstacles,plants:plantRecords,planterCount:plantRecords.length+1};
};
