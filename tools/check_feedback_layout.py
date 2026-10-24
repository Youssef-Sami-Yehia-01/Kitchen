"""Check the spatial changes requested in the apartment feedback review."""
import json
import math
from pathlib import Path
from shapely.geometry import box, Polygon, LineString
from shapely.ops import unary_union

root = Path(__file__).resolve().parents[1]
plan = json.loads((root / 'assets/apartment-scene.json').read_text(encoding='utf-8'))
items = {f['id']: f for f in plan['furniture']}
def footprint(f):
    return box(f['x'], f['y'], f['x'] + f['w'], f['y'] + f['d'])
def assert_clear(a, b, message):
    assert a.intersection(b).area < .01, message

shoe = items['R14']
assert shoe['w'] == 180 and shoe['x'] + shoe['w'] == 3860
chairs = [f for f in plan['furniture'] if f['id'].startswith('R02')]
right_chairs = [f for f in chairs if f['x'] > 2000]
assert min(shoe['x'] - (f['x'] + f['w']) for f in right_chairs) == 930
assert (items['R01']['w'], items['R01']['d']) == (1100, 2300)
assert items['K08']['kind'] == 'tall_cabinet'
assert footprint(items['K08']).covers(footprint(items['K11']))
assert items['F01']['construction']=='continuous_sectional' and items['F01']['finish']=='blue'
assert (items['F01']['w'],items['F01']['d'])==(3000,2000)
assert items['F05']['overhead'] and items['F05']['base'] == 600
assert items['M01']['headSide'] == 'right'
for key in ['C05', 'M04a', 'M04b', 'M04c']:
    assert items[key]['x'] == 8720 and items[key]['frontSide'] == 'east'
assert items['M01']['x'] - (items['M04a']['x'] + items['M04a']['w']) >= 1100
assert (items['B08']['d'],items['B08']['w'])==(1500,550)
assert (items['B08']['basinWidth'],items['B08']['basinDepth'])==(639,340)
assert items['B08']['mirrorWidth']==774
assert items['B08']['y']-(items['B09']['y']+items['B09']['d'])==80
assert items['R15']['kind']=='wall_mirror' and items['R15']['overhead']
assert items['R15']['y'] >= shoe['y']+shoe['d']
assert items['B08']['y'] + items['B08']['d'] == plan['rooms']['UTIL']['bounds'][3] - 10

# All new/moved floor furniture clears columns and the other furniture in its room.
changed = {'R14','K08','M01','M02a','M02b','M04a','M04b','M04c','C05','B08',
           'C01','C07','C02','C10','C11','C14','C15'}
for key in changed:
    f = items[key]
    shape = footprint(f)
    assert box(*plan['rooms'][f['room']]['bounds']).covers(shape), key + ' outside room'
    for column in plan['columns']:
        assert_clear(shape, box(*column), key + ' clashes with a column')
    for other in plan['furniture']:
        if other['id'] == key or other['room'] != f['room'] or other['overhead']:
            continue
        assert_clear(shape, footprint(other), key + ' overlaps ' + other['id'])
    for door in plan['doors']:
        if door['room'] != f['room']:
            continue
        a0, a1 = map(math.radians, [door['angle'], door['open']])
        arc = [(door['x'] + door['w'] * math.cos(a0 + (a1-a0)*i/60),
                door['y'] + door['w'] * math.sin(a0 + (a1-a0)*i/60)) for i in range(61)]
        assert_clear(shape, Polygon([(door['x'],door['y']),*arc]), key + ' blocks door swing')

assert 'C08' not in items and 'C09' not in items, 'Remove the left study desk and chair.'
assert items['C10']['kind']=='desk' and items['C11']['kind']=='chair', 'Retain the right study area.'
assert items['C01']['orientation'] == items['C07']['orientation'] == 'vertical'
assert items['C07']['x'] - (items['C01']['x'] + items['C01']['w']) == 1040
assert plan['height'] == 2750
# A walking strip along the side balcony must remain continuous past the old split.
route = LineString([(12000, 7500), (12000, 11350)]).buffer(140)
architecture = unary_union([box(*r) for r in plan['obstacles']])
assert_clear(route, architecture, 'Side balcony still divided')
print('PASS: shoe aisle 930 mm; master aisle >=1100 mm; child bed aisle 1040 mm;')
print('new furniture clears room boundaries, structural columns, furniture and door swings; balcony continuous.')
