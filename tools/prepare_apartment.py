"""Build the static scene specification from the approved R05 plan (millimetres)."""
import json
from pathlib import Path
from shapely.geometry import box, Point
from shapely.ops import unary_union

ROOT = Path(__file__).resolve().parents[1]
data = json.loads((ROOT / 'assets/apartment-r05.json').read_text(encoding='utf-8'))
room_faces = {
 'REC':[0,0,3840,10350], 'BAL':[0,10490,3840,11560],
 'WC':[3980,0,5380,1550], 'SHAFT':[5520,0,7560,1550],
 'BATH':[7700,0,10180,1550], 'DRESS':[10320,0,12720,1690],
 'KIT':[3980,1690,6480,5690], 'UTIL':[6620,1690,8580,5690],
 'MASTER':[8720,1690,12720,7070], 'HALL':[3840,5830,8720,7070],
 'STUDY':[3980,7210,7460,11560], 'CHILD':[7600,7210,11400,11560],
 'RECESS':[11540,7210,12720,9940], 'BAY':[11540,10080,12720,11560]}
for key,bounds in room_faces.items(): data['rooms'][key]['bounds']=bounds
data['masterBalcony'].update(bedroomPassage=[11540,7070,12720,7210],
 divider=[11540,9940,12720,10080],doorBounds=[11640,9940,12540,10080])
# R10 wall faces are explicit so cabinetry can meet a clear room face. Exterior
# walls grow outward. Service partitions use the adjacent shaft/hall where possible.
# The bathroom/master partition stays straight. Removing the entry return gives
# the corrected 4470 mm dresser/wardrobe run a 4580 mm internal wall before D05.
rects = [(-140,-140,12860,0),(-140,0,0,11700),(12720,0,12860,11700),(0,11560,12720,11700),
 (3840,0,3980,11560),(3980,1550,10180,1690),
 (5380,0,5520,1550),(7560,0,7700,1550),(10180,0,10320,1690),
 (6480,1690,6620,5830),(8580,1690,8720,7070),
 (3980,5690,6480,5830),(6620,5690,8580,5830),(3980,7070,12720,7210),
 (7460,7210,7600,11560),(11400,7210,11540,11560),(0,10350,3840,10490),
 [11540,9940,12720,10080]]
partitions = [[0,7070,700,7210],[3140,7070,3840,7210]]
assert all(min(r[2]-r[0],r[3]-r[1])>=140 for r in rects+partitions)
doors = [
 dict(id='D01',label='Main entrance',x=3840,y=0,w=900,angle=180,open=90,room='REC',cut=[2940,-140,3840,0]),
 dict(id='D02',label='Guest WC door',x=3980,y=270,w=800,angle=90,open=0,room='WC',cut=[3840,270,3980,1070]),
 dict(id='D04',label='Bathroom 2 door',x=8580,y=5690,w=850,angle=180,open=270,room='UTIL',cut=[7730,5690,8580,5830]),
 dict(id='D05',label='Main bedroom door',room='MASTER',**data['bedroomDoorRevision']['masterDoor']),
 dict(id='D06',label='Family / study door',x=7460,y=7210,w=850,angle=180,open=90,room='STUDY',cut=[6610,7070,7460,7210]),
 dict(id='D07',label='Children’s bedroom door',room='CHILD',**data['bedroomDoorRevision']['childDoor']),
 dict(id='D08',label='Bathroom 1 door',x=10180,y=1550,w=750,angle=180,open=270,room='BATH',cut=[9430,1550,10180,1690])]
windows = [dict(id=i,bounds=r,slider=s) for i,r,s in [
 ('S02',[11640,9940,12540,10080],True),('W03',[5450,1550,6300,1690],False),
 ('W04',[5380,550,5520,1250],False),('W05',[7560,550,7700,1250],False),
 ('W06',[4800,11560,6300,11700],False),('W07',[8200,11560,9700,11700],False),
 ('S01',[1050,10350,2810,10490],True)]]
passages = [[3840,5830,3980,7070],[4730,5690,5730,5830],[11540,7070,12720,7210]]
base = unary_union([box(*r) for r in rects + partitions])
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
def opening(r):
    return r

for low,high in [(0,1100),(1100,2150),(2150,2300),(2300,2750)]:
    cuts = [opening(r) for r in passages]
    if low<2150:cuts += [opening(d['cut']) for d in doors]
    cuts += [opening(w['bounds']) for w in windows if (w['slider'] and low<2300) or (not w['slider'] and low>=1100 and high<=2300)]
    geom=base.difference(unary_union([box(*r) for r in cuts])).difference(columns)
    for r in rectangles(geom):walls.append(dict(bounds=r,low=low,high=high))
# Master bedroom opens into the recess; glazed balcony access is at the CAD divider.
floor_cuts = [opening(r) for r in passages] + [opening(d['cut']) for d in doors] + [opening(w['bounds']) for w in windows if w['slider']]
ground=base.difference(unary_union([box(*r) for r in floor_cuts]))
# The master door is back in the west partition. Its threshold has a single
# flush oak finish; the old recess is ordinary bedroom flooring again.
entry_floor=data['bedroomDoorRevision']['masterDoor']['cut']
floor_areas={key:rectangles(box(*room['bounds']).difference(box(*entry_floor)))
 if key in ['HALL','MASTER'] else [room['bounds']] for key,room in data['rooms'].items()}
data.update(walls=walls,doors=doors,windows=windows,passages=passages,wallMinimumMm=140,
 wallBands=rects,partition=partitions,
 floorAreas=floor_areas,masterEntryFloor=entry_floor,
 obstacles=rectangles(ground.union(columns)),
 source='Apartment_2D_Review_R10.dxf',revision='R10',height=2750,
 assumptions=['Ceiling 2.75 m confirmed by owner.','Window sill 1.10 m; window head 2.30 m; door head 2.15 m assumed.',
 'Unrecorded furniture heights and decorative finishes are visual proposals.',
 'All walls and partitions are at least 140 mm thick in R10; existing structural columns remain fixed.',
 'Main wardrobe dimensions corrected by owner: one 2220 x 650 x 2150 high mm unit; earlier equal-bay interpretation superseded.',
 'Master bedroom opens through a 1200 mm passage into the recess; 900 mm glazed balcony entrance sits at the former CAD divider, as confirmed by owner.'])
(ROOT/'assets/apartment-scene.json').write_text(json.dumps(data,indent=2),encoding='utf-8')
(ROOT/'apartment-data.js').write_text('window.APARTMENT = '+json.dumps(data,separators=(',',':'))+';\n',encoding='utf-8')
print(f"R10: {len(data['rooms'])} spaces, {len(data['furniture'])} furniture items, {len(walls)} wall sections, {len(doors)} doors, {len(windows)} windows/sliders")
