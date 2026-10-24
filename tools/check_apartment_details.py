"""Check decorative floor pots against the approved furniture and door sweeps."""
import json
import math
import re
from pathlib import Path
from shapely.geometry import box, Polygon
from shapely.ops import unary_union

root = Path(__file__).resolve().parents[1]
plan = json.loads((root / 'assets/apartment-scene.json').read_text())
items={f['id']:f for f in plan['furniture']}
for key,expected in {'K07':(660,780),'K10':(580,600),'K03':(900,530),'K08':(700,620),'M01':(2000,1600),'R01':(1100,2300),'R03':(2000,500)}.items():
    assert (items[key]['w'],items[key]['d'])==expected, f'{key}: preserve owner measurements.'
assert items['R06']['kind']=='table' and (items['R06']['w'],items['R06']['d'])==(610,1000)
assert plan['height']==2750
source = (root / 'apartment-details.js').read_text()
floor_plants = re.findall(r"plant\('([^']+)',([-\d.]+),([-\d.]+),([-\d.]+)(?:,'(?:tree|grass|broadleaf)')?\);", source)
assert len(floor_plants) == 4, 'Update this clearance check when floor planting changes.'
solids = [box(f['x']/1000, f['y']/1000, (f['x']+f['w'])/1000, (f['y']+f['d'])/1000)
          for f in plan['furniture'] if not f['overhead']]
solids += [box(*[v/1000 for v in r]) for r in plan['columns']]
for door in plan['doors']:
    x,y,w = door['x']/1000,door['y']/1000,door['w']/1000
    a0,a1 = math.radians(door['angle']),math.radians(door['open'])
    arc = [(x+w*math.cos(a0+(a1-a0)*i/40), y+w*math.sin(a0+(a1-a0)*i/40)) for i in range(41)]
    solids.append(Polygon([(x,y),*arc]).buffer(.02))
fixed = unary_union(solids)
floor = unary_union([box(*[v/1000 for v in r['bounds']]) for key,r in plan['rooms'].items() if key!='SHAFT'])
for name,sx,sz,sh in floor_plants:
    x,y,h = float(sx),-float(sz),float(sh)
    radius = min(.17,max(.055,h*.135))*1.15
    footprint = box(x-radius,y-radius,x+radius,y+radius)
    assert floor.covers(footprint), f'{name} extends outside a room.'
    assert not footprint.intersects(fixed), f'{name} intersects furniture, column or door sweep.'
    assert 'balcony' in name.lower(), f'{name} should be off the indoor walking floor.'
    if name.startswith('Bedroom balcony'):
        assert x-radius-11.52 >= .90, 'Keep a 900 mm route beside right-balcony planters.'
assert not box(1.12,11.325,2.76,11.535).intersects(fixed), 'Balcony trough overlaps existing geometry.'
print('Four balcony pots and the trough clear furniture, columns and door swings; indoor floors stay clear, right-balcony pot clearance exceeds 900 mm.')
print('Recorded appliance/furniture dimensions and 2750 mm ceiling preserved; R06 is a 1000 x 610 mm coffee table.')
