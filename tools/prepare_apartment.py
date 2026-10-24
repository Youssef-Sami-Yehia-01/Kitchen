"""Build the static scene specification from the approved R05 plan (millimetres)."""
import json
from pathlib import Path
from shapely.geometry import box, Point
from shapely.ops import unary_union

ROOT = Path(__file__).resolve().parents[1]
data = json.loads((ROOT / 'assets/apartment-r05.json').read_text(encoding='utf-8'))
rects = [(-120,-120,12840,0),(-120,0,0,11680),(12720,0,12840,11680),(0,11560,12720,11680),
 (3860,0,3980,11560),(3980,1570,10200,1690),(5380,0,5500,1570),(7580,0,7700,1570),
 (10200,0,10320,1690),(6480,1690,6600,5810),(8600,1690,8720,7090),
 (3980,5690,6480,5810),(6600,5690,8600,5810),(3980,7090,12720,7210),
 (7480,7210,7600,11560),(11400,7210,11520,11560),(0,10350,3860,10470),data['masterBalcony']['divider']]
doors = [
 dict(id='D01',label='Main entrance',x=3860,y=0,w=900,angle=180,open=90,room='REC',cut=[2960,-120,3860,0]),
 dict(id='D02',label='Guest WC door',x=3980,y=270,w=800,angle=90,open=0,room='WC',cut=[3860,270,3980,1070]),
 dict(id='D04',label='Bathroom 2 door',x=8600,y=5690,w=850,angle=180,open=270,room='UTIL',cut=[7750,5690,8600,5810]),
 dict(id='D05',label='Main bedroom door',x=8720,y=7090,w=900,angle=270,open=360,room='MASTER',cut=[8600,6190,8720,7090]),
 dict(id='D06',label='Family / study door',x=7480,y=7210,w=850,angle=180,open=90,room='STUDY',cut=[6630,7090,7480,7210]),
 dict(id='D07',label='Children’s bedroom door',x=7600,y=7210,w=850,angle=0,open=90,room='CHILD',cut=[7600,7090,8450,7210]),
 dict(id='D08',label='Bathroom 1 door',x=10200,y=1570,w=750,angle=180,open=270,room='BATH',cut=[9450,1570,10200,1690])]
windows = [dict(id=i,bounds=r,slider=s) for i,r,s in [
 ('S02',data['masterBalcony']['doorBounds'],True),('W03',[5450,1570,6300,1690],False),
 ('W04',[5380,550,5500,1250],False),('W05',[7580,550,7700,1250],False),
 ('W06',[4800,11560,6300,11680],False),('W07',[8200,11560,9700,11680],False),
 ('S01',[1050,10350,2810,10470],True)]]
passages = [[3860,5810,3980,7090],[4730,5690,5730,5810],data['masterBalcony']['bedroomPassage']]
base = unary_union([box(*r) for r in rects + data['partition']])
columns = unary_union([box(*r) for r in data['columns']])

def rectangles(geom):
    """Partition an orthogonal solid into non-overlapping rectangles."""
    polys = list(geom.geoms) if hasattr(geom,'geoms') else [geom]
    coords = [p for poly in polys for ring in [poly.exterior,*poly.interiors] for p in ring.coords]
    xs, ys = sorted({p[0] for p in coords}), sorted({p[1] for p in coords})
    active, result = {}, []
    for y0,y1 in zip(ys,ys[1:]):
        runs, start = [], None
        for j,(x0,x1) in enumerate(zip(xs,xs[1:])):
            filled=geom.contains(Point((x0+x1)/2,(y0+y1)/2))
            if filled and start is None:start=x0
            if start is not None and (not filled or j==len(xs)-2):
                runs.append((start,x1 if filled else x0));start=None
        next_active={}
        for key in runs:
            r=active.pop(key, [key[0],y0,key[1],y1]);r[3]=y1;next_active[key]=r
        result.extend(active.values());active=next_active
    result.extend(active.values())
    return result

walls=[]
for low,high in [(0,1100),(1100,2150),(2150,2300),(2300,2750)]:
    cuts = list(passages)
    if low<2150:cuts += [d['cut'] for d in doors]
    cuts += [w['bounds'] for w in windows if (w['slider'] and low<2300) or (not w['slider'] and low>=1100 and high<=2300)]
    geom=base.difference(unary_union([box(*r) for r in cuts])).difference(columns)
    for r in rectangles(geom):walls.append(dict(bounds=r,low=low,high=high))
# Master bedroom opens into the recess; glazed balcony access is at the CAD divider.
floor_cuts = passages + [d['cut'] for d in doors] + [w['bounds'] for w in windows if w['slider']]
ground=base.difference(unary_union([box(*r) for r in floor_cuts]))
data.update(walls=walls,doors=doors,windows=windows,passages=passages,
 obstacles=rectangles(ground.union(columns)),
 source='Apartment_2D_Review_R05.dxf',revision='R05',height=2750,
 assumptions=['Ceiling 2.75 m confirmed by owner.','Window sill 1.10 m; window head 2.30 m; door head 2.15 m assumed.',
 'Unrecorded furniture heights and decorative finishes are visual proposals.',
 'Master bedroom opens through a 1200 mm passage into the recess; 900 mm glazed balcony entrance sits at the former CAD divider, as confirmed by owner.'])
(ROOT/'assets/apartment-scene.json').write_text(json.dumps(data,indent=2),encoding='utf-8')
(ROOT/'apartment-data.js').write_text('window.APARTMENT = '+json.dumps(data,separators=(',',':'))+';\n',encoding='utf-8')
print(f"R05: {len(data['rooms'])} spaces, {len(data['furniture'])} furniture items, {len(walls)} wall sections, {len(doors)} doors, {len(windows)} windows/sliders")
