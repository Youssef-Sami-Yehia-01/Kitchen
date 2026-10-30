"""Author R07 CAD from the same millimetre specification as the apartment viewer."""
import json, math
from pathlib import Path
import ezdxf
from ezdxf.enums import TextEntityAlignment
from shapely.geometry import box, Polygon, LineString
from shapely.ops import unary_union

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT.parent/'output/apartment_2d_r07'
OUT.mkdir(parents=True,exist_ok=True)
p=json.loads((ROOT/'assets/apartment-scene.json').read_text(encoding='utf-8'))
H=11560
doc=ezdxf.new('R2018',setup=True);doc.units=4
doc.header['$MEASUREMENT']=1;doc.header['$LWDISPLAY']=True
m=doc.modelspace()
styles={'A-WALL':(7,35),'A-COLU':(8,45),'A-DOOR':(3,20),'A-GLAZ':(4,15),
 'A-FURN-EXIST':(5,18),'A-FURN-PROP':(3,18),'A-FURN-OVER':(8,13),
 'A-SANR':(4,18),'A-CASE':(30,18),'A-ROOM':(7,20),'A-DIMS':(7,13),'A-NOTES':(7,13)}
for name,(color,lw) in styles.items():doc.layers.new(name,dxfattribs={'color':color,'lineweight':lw})
doc.styles.get('Standard').dxf.font='Arial.ttf'
def cad(pt):return (pt[0],H-pt[1])
def polygons(g):
 if g.geom_type=='Polygon':yield g
 elif hasattr(g,'geoms'):
  for c in g.geoms:yield from polygons(c)
def outline(g,layer):
 for poly in polygons(g):
  for ring in [poly.exterior,*poly.interiors]:
   pts=list(ring.coords)
   for a,b in zip(pts,pts[1:]):m.add_line(cad(a),cad(b),dxfattribs={'layer':layer})
def fill(g,layer,color):
 for poly in polygons(g):
  h=m.add_hatch(color=color,dxfattribs={'layer':layer});h.set_solid_fill(color=color)
  h.paths.add_polyline_path([cad(x) for x in list(poly.exterior.coords)[:-1]],is_closed=True,flags=1)
  for ring in poly.interiors:h.paths.add_polyline_path([cad(x) for x in list(ring.coords)[:-1]],is_closed=True,flags=0)
base=unary_union([box(*r) for r in p['wallBands']+p['partition']])
cols=unary_union([box(*r) for r in p['columns']])
cuts=p['passages']+[d['cut'] for d in p['doors']]+[w['bounds'] for w in p['windows']]
wall=base.difference(unary_union([box(*r) for r in cuts])).difference(cols)
outline(wall.union(cols),'A-WALL');fill(wall,'A-WALL',254);fill(cols,'A-COLU',8)
# Internal column edges remain visible at wall joins, with no duplicate lines.
boundary=wall.union(cols).boundary
for poly in polygons(cols):
 rem=poly.boundary.difference(boundary)
 for line in (list(rem.geoms) if hasattr(rem,'geoms') else [rem]):
  if line.geom_type=='LineString':
   for a,b in zip(line.coords,list(line.coords)[1:]):m.add_line(cad(a),cad(b),dxfattribs={'layer':'A-COLU'})

def label(s,x,y,h=83,layer='A-NOTES'):
 return m.add_text(s,dxfattribs={'layer':layer,'height':h}).set_placement(cad((x,y)),align=TextEntityAlignment.MIDDLE_CENTER)
def poly(b,pts,close=True):b.add_lwpolyline([(x,-y) for x,y in pts],close=close,dxfattribs={'layer':'0'})
def line(b,a,c):b.add_line((a[0],-a[1]),(c[0],-c[1]),dxfattribs={'layer':'0'})
def rect(b,x,y,w,d):poly(b,[(x,y),(x+w,y),(x+w,y+d),(x,y+d)])
def circ(b,x,y,r):b.add_circle((x,-y),r,dxfattribs={'layer':'0'})
def insert(name,x,y,layer,mark,size):
 e=m.add_blockref(name,cad((x,y)),dxfattribs={'layer':layer})
 e.add_attrib('MARK',mark,insert=cad((x,y)),dxfattribs={'invisible':1,'height':1})
 e.add_attrib('SIZE_MM',size,insert=cad((x,y)),dxfattribs={'invisible':1,'height':1})
 return e

for d in p['doors']:
 name='APT_'+d['id'];b=doc.blocks.new(name);w=d['w']
 # Local closed leaf points +X; open leaf follows the actual viewer hinge.
 delta=math.radians(d['open']-d['angle']);tip=(w*math.cos(delta),w*math.sin(delta))
 normal=(-math.sin(delta)*35,math.cos(delta)*35)
 poly(b,[(0,0),tip,(tip[0]+normal[0],tip[1]+normal[1]),normal])
 a0,a1=sorted([-float(d['open']-d['angle']),0])
 b.add_arc((0,0),w,a0,a1,dxfattribs={'layer':'0'})
 # Reveal lines through the full 140 mm construction thickness.
 for x in [0,w]:line(b,(x,0),(x,-140 if d['open']>d['angle'] else 140))
 e=insert(name,d['x'],d['y'],'A-DOOR',d['id'],str(w));e.dxf.rotation=-d['angle']
 # Label in the open floor, away from the jamb geometry.
 if d['id']=='D07':label('D07 / 850 - LEFT INWARD',8890,6980,61)
 elif d['id']=='D05':label('D05 / 900',10000,6810,70)
for w in p['windows']:
 r=w['bounds'];x,y,x1,y1=r;bw,bd=x1-x,y1-y
 b=doc.blocks.new('APT_'+w['id']);rect(b,0,0,bw,bd)
 if bw>bd:
  for yy in [bd*.3,bd*.7]:line(b,(0,yy),(bw,yy))
  line(b,(bw/2,0),(bw/2,bd))
 else:
  for xx in [bw*.3,bw*.7]:line(b,(xx,0),(xx,bd))
  line(b,(0,bd/2),(bw,bd/2))
 insert('APT_'+w['id'],x,y,'A-GLAZ',w['id'],f'{bw} x {bd}')

for f in p['furniture']:
 w,d=f['w'],f['d'];kind=f['kind'];b=doc.blocks.new('APT_'+f['id'])
 layer='A-FURN-OVER' if f['overhead'] else 'A-CASE' if kind in ['wardrobe','dresser','counter','tall_cabinet','shoe_cabinet','tv_unit','cabinet'] else 'A-SANR' if kind in ['basin','wc','shower'] else 'A-FURN-EXIST' if f['status']=='E' else 'A-FURN-PROP'
 if kind=='l_sofa':
  poly(b,[(0,0),(1000,0),(1000,d-1000),(w,d-1000),(w,d),(0,d)])
  line(b,(170,170),(170,d-170));line(b,(170,d-170),(w-100,d-170))
 elif kind=='bed':
  rect(b,0,0,w,d)
  if f.get('orientation')=='vertical':
   line(b,(40,d-100),(w-40,d-100));rect(b,160,d-520,w-320,350)
   line(b,(40,600),(w-40,600))
  elif f.get('headSide')=='right':
   line(b,(w-100,30),(w-100,d-30))
   for y in [100,d/2+40]:rect(b,w-500,y,320,d/2-160)
  else:line(b,(100,30),(100,d-30))
 elif kind=='wardrobe':
  rect(b,0,0,w,d);side=w<d;length=d if side else w
  for i in range(1,max(2,math.ceil(length/750))):
   at=length*i/max(2,math.ceil(length/750))
   line(b,(30,at),(w-30,at)) if side else line(b,(at,30),(at,d-30))
  if side:line(b,(w-100 if f.get('frontSide')=='east' else 100,30),(w-100 if f.get('frontSide')=='east' else 100,d-30))
  else:line(b,(30,d-100),(w-30,d-100))
 elif kind=='shower':
  rect(b,0,0,w,d);line(b,(0,0),(w,d));line(b,(w,0),(0,d));circ(b,w-140,100,35)
 elif kind=='wc':
  rect(b,0,0,w,d)
  if w>d:rect(b,0,0,150,d);b.add_ellipse((w*.6,-d/2),major_axis=(w*.34,0),ratio=d*.40/(w*.34))
  else:rect(b,0,0,w,150);b.add_ellipse((w/2,-d*.6),major_axis=(0,d*.34),ratio=w*.40/(d*.34))
 elif kind in ['basin','sink']:
  rect(b,0,0,w,d)
  bw=f.get('basinDepth',w*.68) if kind=='basin' and w<d else w*.7
  bd=f.get('basinWidth',d*.71) if kind=='basin' and w<d else d*.65
  rect(b,(w-bw)/2,(d-bd)/2,bw,bd);circ(b,w/2,d/2,18)
 elif kind=='sofa':
  rect(b,0,0,w,d);rect(b,130,160,w-260,d-320)
  for i in range(1,max(2,round(d/700))):line(b,(130,d*i/max(2,round(d/700))),(w-130,d*i/max(2,round(d/700))))
 elif kind=='chair':rect(b,0,0,w,d);rect(b,50,60,w-100,d-120)
 elif kind in ['washer','dishwasher','stove']:
  rect(b,0,0,w,d)
  if kind=='stove':
   for x in [w*.2,w*.5,w*.8]:
    for y in [d*.28,d*.7]:circ(b,x,y,45)
  elif kind=='washer':circ(b,w/2,d/2,min(w,d)*.32)
  else:line(b,(40,d*.25),(w-40,d*.25))
 else:
  rect(b,0,0,w,d)
  if kind in ['cabinet','tv_unit','counter','desk','dresser','tall_cabinet','shoe_cabinet','bookcase']:
   line(b,(30,min(100,d/3)),(w-30,min(100,d/3)))
 insert('APT_'+f['id'],f['x'],f['y'],layer,f['id'],f['size'])
 # Keep overhead objects legible without covering the work surface's label.
 lx=f['x']+w/2;ly=f['y']+d/2
 if f['overhead']:ly=f['y']+min(150,d/4)
 label(f['id'],lx,ly,64 if min(w,d)<450 else 80)

room_labels={'REC':(1950,6700),'KIT':(5160,4780),'UTIL':(7900,4550),
 'MASTER':(10800,5750),'CHILD':(9610,9060),'STUDY':(5700,8850),
 'BATH':(8900,1200),'WC':(4450,1300),'DRESS':(11500,1130),
 'SHAFT':(6500,1020),'HALL':(5900,6430),'BAL':(1900,11100),'BAY':(12070,10900),'RECESS':(12100,8500)}
for key,(x,y) in room_labels.items():label(p['rooms'][key]['name'],x,y,105 if key not in ['RECESS','BAY'] else 80,'A-ROOM')

def dim(a,b,at,angle=0):
 obj=m.add_linear_dim(base=cad(at),p1=cad(a),p2=cad(b),angle=angle,
  dimstyle='EZDXF',override={'dimtxt':85,'dimasz':60,'dimgap':35,'dimexo':40,'dimexe':50,'dimdec':0,'dimlfac':1},dxfattribs={'layer':'A-DIMS'})
 obj.render()
dim((0,0),(12720,0),(0,-850));dim((0,0),(0,11560),(-850,0),90)
for x0,x1 in [(0,3840),(3980,7460),(7600,11400),(11540,12720)]:dim((x0,11560),(x1,11560),(0,12250))
dim((11400,7210),(11400,11560),(11750,0),90)
dim((8500,7210),(9350,7210),(0,6800))
dim((8720,2980),(8720,4055),(8400,0),90)
dim((8720,4055),(8720,5130),(8400,0),90)
dim((8720,5130),(8720,6030),(8400,0),90)
dim((8720,6030),(8720,6170),(8350,0),90)
label('IBRAHIM & MERNA - APARTMENT REVIEW R07',6360,-1350,155)
label('ALL DIMENSIONS mm / WALLS >= 140 / STRUCTURAL COLUMNS RETAINED',6360,13030,105)
doc.set_modelspace_vport(height=15300,center=(6300,5500))
audit=doc.audit();assert not audit.errors and not audit.fixes
segments=[LineString([tuple(e.dxf.start)[:2],tuple(e.dxf.end)[:2]]) for e in m.query('LINE')]
assert sum(s.length for s in segments)-unary_union(segments).length<.01
source_cols=json.loads((ROOT/'assets/apartment-r05.json').read_text(encoding='utf-8'))['columns']
assert p['columns']==source_cols
doc.saveas(OUT/'Apartment_2D_Review_R07.dxf')
(OUT/'Plan_Data_R07.json').write_text(json.dumps(p,indent=2),encoding='utf-8')
(OUT/'Revision_Audit_R07.json').write_text(json.dumps({'revision':'R07','wall_minimum_mm':140,
 'column_positions_unchanged':True,'master_recorded_wardrobe_dimensions_retained':True,
 'shared_cad_website_furniture_records':len(p['furniture']),'cad_block_references':len(m.query('INSERT')),
 'editable_dimensions':len(m.query('DIMENSION')),'duplicate_model_lines_mm':0,'dxf_audit_errors':len(audit.errors)},indent=2),encoding='utf-8')
print('Created R07 CAD using the shared website furniture, 140 mm wall bands and fixed columns.')
