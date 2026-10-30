"""Plot the verified native R07 CAD as an A3 review set and publish downloads."""
import json,shutil,zipfile
from pathlib import Path
from io import BytesIO
import ezdxf,fitz
from ezdxf.addons.drawing import RenderContext,Frontend,pymupdf,layout
from ezdxf.addons.drawing.config import Configuration,BackgroundPolicy,ColorPolicy
from ezdxf.math import BoundingBox2d
from reportlab.pdfgen import canvas
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

ROOT=Path(__file__).resolve().parents[1];OUT=ROOT.parent/'output/apartment_2d_r07'
doc=ezdxf.readfile(ROOT.parent/'tmp/apartment/R07_native_roundtrip.dxf');m=doc.modelspace()
p=json.loads((ROOT/'assets/apartment-scene.json').read_text(encoding='utf-8'))
assert doc.header['$INSUNITS']==4
marks={e.get_attrib_text('MARK'):e for e in m.query('INSERT')}
for f in p['furniture']:
 e=marks[f['id']];assert tuple(e.dxf.insert)[:2]==(f['x'],11560-f['y'])
 assert e.get_attrib_text('SIZE_MM')==f['size']
for d in p['doors']:
 e=marks[d['id']];assert tuple(e.dxf.insert)[:2]==(d['x'],11560-d['y'])
 assert abs((e.dxf.rotation+d['angle'])%360)<.001
log=(ROOT.parent/'tmp/apartment/check_native_r07.log').read_text(encoding='utf-16',errors='replace').replace('\x00','')
assert 'Total errors found 0 fixed 0' in log
audit=json.loads((OUT/'Revision_Audit_R07.json').read_text(encoding='utf-8'))
audit.update(native_autocad_audit_clean=True,native_roundtrip_verified=True,pdf_pages=3)
(OUT/'Revision_Audit_R07.json').write_text(json.dumps(audit,indent=2),encoding='utf-8')
for name,col in [('A-WALL','343d43'),('A-COLU','444c51'),('A-DOOR','8c7049'),
 ('A-GLAZ','64828b'),('A-CASE','a79473'),('A-SANR','7c989e'),('A-FURN-EXIST','7a8589'),
 ('A-FURN-PROP','8e9390'),('A-FURN-OVER','a3a5a5'),('A-ROOM','343d43'),('A-NOTES','555f65'),('A-DIMS','555f65')]:
 doc.layers.get(name).rgb=tuple(bytes.fromhex(col))
for e in m.query('HATCH'):
 if e.dxf.layer in ['A-WALL','A-COLU']:e.rgb=(55,65,71)
for block in doc.blocks:
 for e in block:
  if e.dxf.layer=='A-DIMS':e.rgb=(70,80,86)
pdfmetrics.registerFont(TTFont('Review','C:/Windows/Fonts/arial.ttf'))
pdfmetrics.registerFont(TTFont('ReviewBold','C:/Windows/Fonts/arialbd.ttf'))
def text(c,s,x,y,size=9,bold=False,color='#343d43'):
 c.setFillColor(color);c.setFont('ReviewBold' if bold else 'Review',size);c.drawString(x*mm,(297-y)*mm,s)
def wrap(c,s,x,y,width=126,size=9,leading=4.7):
 line=''
 for word in s.split():
  trial=(line+' '+word).strip()
  if line and pdfmetrics.stringWidth(trial,'Review',size)>width*mm:
   text(c,line,x,y,size);y+=leading;line=word
  else:line=trial
 if line:text(c,line,x,y,size);y+=leading
 return y
def plot(bounds,scale,page_index):
 backend=pymupdf.PyMuPdfBackend()
 conf=Configuration(background_policy=BackgroundPolicy.WHITE,color_policy=ColorPolicy.COLOR_SWAP_BW)
 room='MASTER' if page_index==2 else 'CHILD'
 ids={f['id'] for f in p['furniture'] if f['room']==room}
 allowed_text=ids|{p['rooms'][room]['name'],'D05 / 900' if room=='MASTER' else 'D07 / 850 - LEFT INWARD'}
 def include(e):
  if page_index==1:return True
  if e.dxftype()=='TEXT':return e.dxf.text in allowed_text
  if e.dxftype()=='INSERT':return e.get_attrib_text('MARK') in ids|({'D05'} if room=='MASTER' else {'D07','W07'})
  if e.dxftype()=='DIMENSION':return abs(e.dxf.defpoint2.x-8720)<1 if room=='MASTER' else round(e.dxf.defpoint2.x) in [7600,11400,8500]
  return True
 Frontend(RenderContext(doc),backend,config=conf).draw_layout(m,finalize=True,filter_func=include)
 x0,y0,x1,y1=bounds;w=(x1-x0)/scale;h=(y1-y0)/scale
 data=backend.get_pdf_bytes(layout.Page(w,h),render_box=BoundingBox2d([(x0,y0),(x1,y1)]))
 return fitz.open(stream=data,filetype='pdf'),w,h
specs=[('Furnished floor plan / R07','Scale 1:65 at A3. Shared layout for CAD and website.',
 (-1100,-1700,14000,12700),65,14,42,[
 ('140 mm WALLS','All wall and partition bands are at least 140 mm thick. The eight structural columns retain their original positions and sizes.'),
 ('BEDROOMS MATCH','Main and children bedrooms are drawn from the same furniture records as the website, including both beds, wardrobe runs, dressing table and retained study desk.'),
 ('CHILD DOOR','D07 retains its 850 mm nominal width. It opens inward to the left of a person entering from the hall.'),
 ('SHELF REPLACEMENT','C12 replaces the short left-wall hanging shelf beside the entrance with an 800 wide x 600 deep x 2220 high wardrobe in the matching finish.'),
 ('MASTER FIT','The bathroom/master partition shifts 60 mm north. This keeps the recorded 4400 mm dresser/wardrobe run, the new 140 mm return and the 900 mm entrance.'),
 ('CHECKED','Native AutoCAD audit reports zero errors. Floor furniture and door swing sectors clear walls and columns. This is the R07 review set.')]),
 ('Main bedroom / furniture and wall detail','Scale 1:25 at A3. Recorded furniture envelopes retained.',
 (8100,11560-7300,13200,11560-1450),25,24,40,[
 ('RECORDED WARDROBES','M04a and M04b remain 1075 wide x 650 deep x 2220 high each. Together they represent the recorded 2150 mm main wardrobe.'),
 ('KHADIJA / M04c','900 wide x 650 deep x 2150 high. Its notebook dimensions remain intact.'),
 ('DRESSING TABLE','C05 remains 1350 wide x 490 deep. It starts at sheet Y=1630, followed continuously by the three wardrobe bays. Total run: 4400 mm.'),
 ('BED AND TABLES','M01 remains 1600 x 2000 mm. M02a / M02b each remain 600 x 400 mm. Bed faces from the right; wardrobe and dresser face from the left.'),
 ('ENTRANCE','D05 is 900 mm wide at X=9620, sheet Y=7070. The 140 mm return occupies sheet Y=6030 to 6170. The old west opening remains an open link from the hall.'),
 ('BALCONY ROUTE','An open passage leads into the recess. The glazed entrance stays at the former divider farther inside the balcony. Access remains from the master bedroom.')]),
 ('Children bedroom / entrance and storage','Scale 1:25 at A3. One study desk retained on the right.',
 (7200,11560-12400,11900,11560-6500),25,24,40,[
 ('TWO BEDS','C01 / C07 use 1200 x 2000 mm mattresses in proposed 1240 x 2080 mm frames. Frame-to-frame aisle remains 1040 mm.'),
 ('LEFT INWARD SWING','D07 hinges at the right jamb when viewed entering from the hall and swings toward the entrant left. Its leaf opens into the room, away from the storage fronts.'),
 ('NEW C12 WARDROBE','800 wide x 600 deep x 2220 high, on the left wall beside the entrance. Two sliding fronts match the warm-white wardrobe finish.'),
 ('ENTRANCE STORAGE','C02 remains 1950 x 600 mm with the approved shortening. It leaves a 100 mm reveal beside the door jamb.'),
 ('STUDY','The right desk and chair remain. The short left hanging bookcase is removed; there is no left desk or chair.'),
 ('DRAWING CHECK','CAD insert locations and door rotations are verified against the website data after native AutoCAD round-trip. Dimensions use millimetres throughout.')])]
review=fitz.open()
for i,(title,subtitle,bounds,scale,x,y,notes) in enumerate(specs,1):
 page=review.new_page(width=420*mm,height=297*mm)
 vector,w,h=plot(bounds,scale,i)
 page.show_pdf_page(fitz.Rect(x*mm,y*mm,(x+w)*mm,(y+h)*mm),vector,0);vector.close()
 stream=BytesIO();c=canvas.Canvas(stream,pagesize=(420*mm,297*mm))
 text(c,'IBRAHIM & MERNA / APARTMENT',14,14,8,True,color='#747a7d')
 text(c,title,14,25,19,True);text(c,subtitle,14,32,8,color='#69756f')
 c.setStrokeColorRGB(.78,.80,.81);c.setLineWidth(.5);c.line(14*mm,260*mm,406*mm,260*mm)
 yy=49
 for heading,body in notes:
  text(c,heading,278,yy,10,True,color='#8c7049');yy+=7
  yy=wrap(c,body,278,yy)+7
 assert yy<280,(i,yy)
 text(c,f'R07 | 30 OCT 2026 | DESIGN REVIEW | {i} / 3',14,287,8,color='#69756f')
 text(c,'Print A3 at 100%. Dimensions in millimetres.',278,287,8,color='#69756f')
 c.showPage();c.save();overlay=fitz.open(stream=stream.getvalue(),filetype='pdf')
 page.show_pdf_page(page.rect,overlay,0);overlay.close()
review.set_metadata({'title':'Ibrahim & Merna - Apartment Review R07','author':'Apartment planning review'})
review.subset_fonts()
target=OUT/'Apartment_2D_Review_R07.pdf';review.save(target,garbage=4,deflate=True,use_objstms=1);review.close()
verified=fitz.open(target);assert len(verified)==3
for i,page in enumerate(verified,1):page.get_pixmap(matrix=fitz.Matrix(1.4,1.4),alpha=False).save(OUT/f'PDF_R07_Page_{i}.png')
verified.close()
downloads=ROOT/'assets/plans';downloads.mkdir(exist_ok=True)
for ext in ['pdf','dwg','dxf']:shutil.copy2(OUT/f'Apartment_2D_Review_R07.{ext}',downloads/f'Apartment_2D_Review_R07.{ext}')
with zipfile.ZipFile(OUT/'Apartment_2D_Package_R07.zip','w',zipfile.ZIP_DEFLATED) as z:
 for path in OUT.iterdir():
  if path.suffix in ['.pdf','.dwg','.dxf','.json']:z.write(path,path.name)
print('Created verified 3-page A3 review PDF and published R07 CAD/PDF downloads.')
