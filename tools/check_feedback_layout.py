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
assert shoe['w'] == 180 and shoe['x'] + shoe['w'] == 3840
chairs = [f for f in plan['furniture'] if f['id'].startswith('R02')]
right_chairs = [f for f in chairs if f['x'] > 2000]
assert min(shoe['x'] - (f['x'] + f['w']) for f in right_chairs) == 910
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
architecture = unary_union([box(*r) for r in plan['obstacles']])

# All new/moved floor furniture clears columns and the other furniture in its room.
changed = {'R14','K08','M01','M02a','M02b','M04a','M04b','M04c','C05','B08',
           'C01','C07','C02','C10','C11','C12','C14','C15'}
for key in changed:
    f = items[key]
    shape = footprint(f)
    assert box(*plan['rooms'][f['room']]['bounds']).covers(shape), key + ' outside room'
    if key in {'M01','M02a','M02b','M04a','M04b','M04c','C05','B08','C01','C07','C02','C10','C11','C12','C14','C15'}:
        assert_clear(shape, architecture, key + ' intersects a wall')
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
# Master opening is doorless; the glazed entrance is at the owner-confirmed CAD divider.
route = LineString([(12000, 7500), (12000, 11350)]).buffer(140)
assert_clear(route, architecture, 'Master recess / balcony structural route blocked')
assert plan['masterBalcony']['bedroomPassage'] in plan['passages']
slider=next(w for w in plan['windows'] if w['id']=='S02')
assert slider['bounds']==[11640,9940,12540,10080] and slider['slider']
assert not any(w['bounds'][1]==7090 for w in plan['windows'])
assert plan['rooms']['RECESS']['bounds']==[11540,7210,12720,9940]
assert plan['rooms']['BAY']['bounds']==[11540,10080,12720,11560]
assert_clear(box(11540,7070,12720,7210), architecture, 'Bedroom passage not open')
assert architecture.covers(box(11540,9940,11640,10080)), 'Missing recessed door pier'
assert items['M04a']['d']+items['M04b']['d']==2150
assert all(items[k]['w']==650 for k in ['M04a','M04b','M04c'])
assert [items[k]['height'] for k in ['M04a','M04b','M04c']]==[2220,2220,2150]
print('PASS: shoe aisle 910 mm; master aisle >=1100 mm; child bed aisle 1040 mm;')
print('new furniture clears room boundaries, structural columns, furniture and door swings; master recess open, balcony entrance at CAD divider; notebook wardrobe envelopes retained.')

# R08 restores the straight bathroom wall and fits the unchanged master furniture.
doors={d['id']:d for d in plan['doors']}
assert (doors['D05']['x'],doors['D05']['y'],doors['D05']['w'])==(9620,7070,800)
assert (doors['D07']['x'],doors['D07']['y'],doors['D07']['w'],doors['D07']['angle'],doors['D07']['open'])==(9350,7210,850,180,90)
assert (items['C02']['x'],items['C02']['y'],items['C02']['w'],items['C02']['d'])==(9450,7210,1950,600)
assert items['C02']['x']-doors['D07']['x']==100
assert items['C12']['kind']=='wardrobe' and not items['C12']['overhead'], 'Replace the shelf beside D07 with a wardrobe.'
assert (items['C12']['x'],items['C12']['y'],items['C12']['w'],items['C12']['d'],items['C12']['height'])==(7608,7210,600,1700,2220)
assert architecture.covers(box(7601,7091,8449,7209)), 'Old child opening not filled'
assert architecture.covers(box(8731,6091,9619,6269)), 'Missing 180 mm entry return'
assert_clear(box(8740,6300,9460,7040),architecture,'Master entry recess blocked')
for k in ['C02','M04a','M04b','M04c']:
    assert_clear(footprint(items[k]),architecture,k+' intersects wall')
assert items['M04c']['y']+items['M04c']['d']==6090
assert all(items[k]['x']==8720 for k in ['C05','M04a','M04b','M04c'])
assert plan['revision']=='R08'
assert plan['wallMinimumMm']==140, 'Source wall-band minimum is not 140 mm.'
assert plan['rooms']['MASTER']['bounds'][1]==1690
assert architecture.covers(box(8800,1551,9400,1689)), 'Bathroom/master wall should be straight at 1550..1690'
assert_clear(box(8800,1490,9400,1550),architecture,'Remove the north-shifted bathroom wall')
entry=box(*plan['masterEntryFloor'])
for key in ['HALL','MASTER']:
    assert_clear(unary_union([box(*r) for r in plan['floorAreas'][key]]),entry,key+' duplicates the entry finish')
assert all(min(r[2]-r[0],r[3]-r[1])>=140 for r in plan['wallBands']+plan['partition'])
for f in plan['furniture']:
    if not f['overhead']:
        assert_clear(footprint(f),architecture,f['id']+' intersects construction')
for door in plan['doors']:
    arc=[(door['x']+door['w']*math.cos(math.radians(door['angle']+(door['open']-door['angle'])*i/90)),
          door['y']+door['w']*math.sin(math.radians(door['angle']+(door['open']-door['angle'])*i/90))) for i in range(91)]
    assert_clear(Polygon([(door['x'],door['y']),*arc]).buffer(-1),architecture,door['id']+' swing intersects construction')
print('PASS: R08 straight bathroom wall, 800 mm entrance, extended C12 and continuous entry floor; fixed-column clearances verified.')
