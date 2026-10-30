# Ibrahim & Merna Apartment Studio

A complete static apartment viewer extending the existing kitchen with the **R10** children entrance and storage revision of the architectural plan and the owner’s latest furniture feedback. All runtime libraries and assets are local. No build step, API key, CDN or account is needed.

## Preview

Run `python -m http.server 8088` from this directory and open `http://localhost:8088/`. For a phone on the same Wi-Fi, serve with `python -m http.server 8088 --bind 0.0.0.0` and open the computer's local IPv4 address on port 8088. The computer must allow the connection. Desktop mouse capture requires localhost or HTTPS; touch controls work without it.

`index.html` opens the full apartment. `kitchen.html` preserves the original standalone kitchen.

## Explore

- **Room selector / floor map:** focus a room in isometric view, or enter it in walkthrough mode. Sizes reflect the current clear wall faces.
- **Walk inside:** click Explore; WASD/arrows move, mouse looks, Shift moves faster, E opens the part under the crosshair, Escape pauses. Walls, columns, furniture and moving doors have collision footprints.
- **Phone:** tap Explore, hold movement arrows, swipe to look, tap Open to interact, Pause to return to navigation. Pinch/drag in isometric view. Narrow screens also expose these controls.
- **Isometric:** drag to orbit, scroll/pinch to zoom, right-drag to pan. Automatic cutaway hides walls between the camera and target, and removes ceilings. Disable it in Scene to retain walls.
- **Doors & drawers:** interactive controls cover kitchen appliances/cabinets, room doors, balcony sliders, wardrobes, storage, vanities and washing machine. Sliding wardrobe panels and kitchen corner doors close conflicting neighbours.
- **Scene:** sunlight strength, cutaway, close all compartments, dimension-data download and source assumptions.

## R05 layout

Reception/dining/TV lounge, kitchen, guest WC, two bathrooms, main bedroom, dressing room, family/study, two-child bedroom, hallway, both balconies and the open shaft are included. The 63 furniture records include the latest owner-requested changes; R09 combines the earlier two master wardrobe records into one corrected unit and R10 removes C12. Structural columns remain fixed at their original coordinates.

The kitchen entrance is a centred 1000 mm open passage. The dishwasher is on the user's right when facing the sink; the column stays on the right when entering. The main bed is on the right side at the column face; dresser and three wardrobe bays are on the left. Bathroom 2 has the shower against the shaft wall; toilet, washer, overhead cabinet and vanity are on the left wall. The children’s reference layout now has two 1200 × 2000 mm mattresses in 1240 × 2080 mm frames along the side walls, an entrance-wall wardrobe, a right-side study desk, wall shelves and bedside tables. The left desk and chair are removed per the latest correction; the right desk remains 1350 × 550 mm. The bed-frame aisle is 1040 mm. The right balcony is entered only from the main bedroom. The reception entrance and dressing room have no windows. R04 is removed; R01/R02 are 150 mm higher; R05/R06 are 150 mm lower.

Ceiling height **2.75 m** is confirmed. Unrecorded heights are proposals: window sill 1.10 m, head 2.30 m, door head 2.15 m and typical furniture heights. The master bedroom opens into an internal recess; the glazed balcony entrance is at the former divider farther inside, as confirmed by the owner. The recess has an indoor ceiling and the outdoor parapet begins beyond the glazed entrance. Finishes, decorative lighting and accessories outside the kitchen are proposals. The R05 kitchen window is retained; the existing upper-cabinet junction needs review against the actual opening before fabrication. This is a design review model, not a construction survey.

## Files and maintenance

- `assets/apartment-r05.json`: source R05 rooms/furniture/columns in millimetres.
- `assets/apartment-scene.json`: dimension specification including joined walls and openings.
- `apartment-data.js`: bundled scene specification; no runtime JSON fetch.
- `apartment-model.js`: apartment geometry, materials and furniture.
- `apartment-details.js`: curved vegetation, detailed planters, curtains, textiles and accessories.
- `DIMENSIONS.md`: owner measurements, review corrections and Egyptian-market size references.
- `apartment.js`: connected viewer, kitchen import, interactions and controls.
- `viewer.js`: unchanged original standalone kitchen runtime.
- `tools/prepare_apartment.py`: regenerate dimension data; authoring requires Python and Shapely.
- `tools/build_apartment_viewer.py` and `tools/apartment-controller-extra.js`: regenerate apartment runtime/page from the original kitchen controls.

After source dimension/control edits, run both Python tools in that order. Edit `apartment-model.js` directly for geometry/material changes, then rerun `python tools/build_apartment_viewer.py` to refresh the script content hashes in the page. Python is for authoring only, not deployment.

## Vercel

Choose Framework Preset **Other**, root directory **.**, no Build Command and Output Directory **.**. Keep all scripts, `assets/` and `vendor/` together. `vercel.json` supplies no-cache headers for apartment scripts/dimensions. HTTPS enables mouse capture and full-screen controls.

## Verification

Checked in local Chromium: all 12 room entry points clear; the previous 93 interaction buttons exercised without console errors or non-finite transforms; close-all; desktop movement/look/pause; compact 390 x 844 layout without horizontal overflow. Phone controls were checked in browser emulation; physical iOS/Android hardware was not used. Rounded furniture, tiled/plank floors, warm lighting and contact shadows render without bloom or depth-of-field blur.

## Latest review

R06 is a coffee table, and R03 has a reflective wall mirror. Guest and bathroom fixtures face their backing walls; showers have wall-mounted fittings and hinged front glass doors. Six reflective mirrors are checked against the actual walls after coordinate transforms. Assumed furniture/fixture heights use the market references in [DIMENSIONS.md](DIMENSIONS.md); owner-recorded appliance widths and depths remain unchanged.

The apartment has 19 planters, including four floor pots confined to balcony corners. Indoor planting sits on existing furniture. Corner pots and the trough clear door swings, columns and furniture; right-balcony pots leave over 900 mm of clear floor width. Run `python tools/check_apartment_details.py` to verify these clearances. Plan geometry and supplied furniture measurements were compared with the original R05 source.

The walk camera retains its facing direction when exploration starts. Shower trays are walkable through the open glass doors, with the 70 mm tray elevation reflected in eye height. Complete appliance envelopes were checked after resizing, including handles and levelling feet.

Rounded furniture uses independent vertex/index buffers when batching by material. Run `node tools/check_apartment_geometry.cjs` to verify that one material batch cannot corrupt another cached shape or create stretched triangles between separate objects. Apartment scripts have content hashes in their URLs so revised geometry replaces cached copies.

## Latest owner feedback

- A wall-mounted shoe cabinet sits on the east wall beside dining: 1040 mm wide, 180 mm overall depth including pulls, approximately 1290 mm high. It has six tilt bins and leaves 930 mm beside the existing pulled-out chair envelope. The dining table remains 2300 × 1100 mm; chairs are not tucked beneath it.
- Reception flooring now has a separate light warm-ivory marble finish. The kitchen retains its grey/beige tile reference; the reception colour is an interpretation of the supplied interior references, not a measured product colour.
- K08 replaces the deep freezer with a 620 mm-wide, 600 mm carcass-depth tall pantry. The microwave is integrated at a 1220 mm base height; upper/lower pantry doors and the microwave door operate. The appliance model and ventilation requirements must be selected together before fabrication.
- Master furniture has been exchanged again, while the three wardrobe bays and owner-recorded bed dimensions remain. Balcony access stays from the master bedroom only, through the open recess and the glazed entrance at the former CAD divider.
- The large bathroom vanity and marble top are 1500 × 550 mm, at the lower-left corner with a 10 mm side reveal. The previous basin and 774 mm-wide mirror remain the same size and are centred on the wider unit. F05 is wall mounted 600 mm above the family-room floor.
- The new children’s room follows the supplied two-bed reference around the actual PDF column/window positions. The confirmed ceiling remains 2750 mm rather than the reference image’s 2600 mm.

Run `python tools/check_feedback_layout.py` for new furniture, door-swing, column and balcony-route checks. The new C12 wardrobe also exposes two sliding-panel controls.

The family/TV lounge F01 is one continuous blue L-shaped sectional, with joined upholstered base, seat and back geometry and only two end arms. Its recorded 3000 × 2000 mm footprint is retained. The geometry check also verifies closed, connected shells and the L-shaped recess.

A 700 × 1650 mm full-length wall mirror sits beside the shoe cabinet, with its bottom at 320 mm. Compact greenery sits on the existing cabinet top; no additional floor object or walking-path obstruction is introduced.

The master wardrobe dimensions and their handwritten source values are documented in `DIMENSIONS.md`. The owner corrected the earlier interpretation: M04 is one 2220 mm-wide, 650 mm-deep, 2150 mm-high wardrobe. The earlier two 1075 mm model bays are superseded.

## R06 door revision

The master and children entrances move 900 mm east, retaining their 900 / 850 mm widths. A 100 mm return forms the master entry recess; the old children opening is infilled. C02 is shortened to 1950 x 600 mm with a 100 mm door reveal, as approved. The master wardrobe section gaps close while their supplied widths/depths/heights remain unchanged. The R06 PDF, DWG and DXF are in `assets/plans/`, with PDF and DWG downloads in Scene settings. The PDF documents the CAD revision; the website retains its later furniture/material and balcony changes.

## R07 wall and bedroom revision (superseded below)

Every wall/partition band is at least 140 mm thick. Exterior walls grow outward; interior faces are explicitly placed in `tools/prepare_apartment.py`. All eight structural columns retain their earlier coordinates and sizes. Clear room dimensions reflect the revised faces.

The bathroom/master partition moves 60 mm north, giving the unchanged 1350 mm dresser and 3050 mm wardrobe run enough length before the 140 mm entry return. M04a/M04b remain 1075 x 650 x 2220 mm each; Khadija's M04c remains 900 x 650 x 2150 mm. The bed and bedside tables retain their recorded envelopes. D05 stays 900 mm wide.

D07 keeps its 850 mm width and now opens inward to the entering person's left/east. C12 replaces the short left-wall hanging bookcase with an 800 x 600 x 2220 mm wardrobe with two sliding fronts. The right study desk and shelves remain. C02 stays 1950 x 600 mm with a 100 mm door reveal. Reception wall-mounted furniture moves 20 mm to the new face; the shoe aisle is now 910 mm.

The CAD furniture and website use the same 65 records. R07 PDF/DWG downloads appear in Scene settings. `tools/build_apartment_cad.py` authors the editable DXF; `tools/build_apartment_pdf.py` plots a native AutoCAD round-trip as three A3 sheets. Native AutoCAD reports zero audit errors. Run the feedback/planting checks and `node tools/check_apartment_rooms.cjs` to check fixed-column clearances, the production door animation, new wardrobe assembly and finite geometry. Browser UI control was disabled during this revision; the production meshes and locally served files were checked directly.

## R08 correction (superseded by R09)

The bathroom/master wall is straight again at sheet Y=1550..1690. The dresser and three master wardrobe bays return to Y=1690..6090, retaining every supplied size. D05 narrows from 900 to 800 mm with owner approval; the entrance return is 180 mm thick and all other wall bands remain at least 140 mm. All eight columns are fixed.

C12 alone is resized as requested: its run extends north to the children entrance wall, from Y=7210 to 8910, for 1700 x 600 x 2220 high mm. The other furniture envelopes are unchanged. Its three sliding panels retain the matching warm-white finish.

The master entry now has a dedicated flush oak floor. Its footprint is removed from the hall/bedroom floor grids, and the duplicate stone threshold plates are omitted. Production-mesh ray checks confirm continuous oak at the same finished level across the entrance. R08 CAD and the three-sheet PDF were issued for this revision.

## R09 wardrobe and entrance revision

M04 replaces M04a/M04b with one continuous 2220 x 650 x 2150 high mm wardrobe, using the owner's explicit correction of the notebook width and height. Khadija's M04c stays 900 x 650 x 2150 high. The 1350 x 490 mm dressing table and bed/bedside furniture retain their dimensions and positions; M04c shifts 70 mm along the same wall to follow M04.

The short master entry return is removed. D05 returns to the west wall at X=8720, sheet Y=6270..7070, retaining its 800 mm width and inward swing. The internal wall before the door is 4580 mm: 1350 + 2220 + 900 = 4470 mm of furniture, leaving 110 mm. The bathroom wall stays straight and all eight structural columns remain unchanged. The doorway has a single flush oak finish; the former entry recess returns to the regular bedroom floor grid.

D07 returns to X=7600..8450, retaining its 850 mm width and left-inward swing. C02 extends to 2850 x 600 mm with a 100 mm door reveal. Proposed C12 shortens to 800 x 600 x 2220 high, at Y=8110..8910, clear of the leaf swing and structural column. Beds, the right study area and all other room furniture remain unchanged.

The website and CAD share the same 64 records. R09 PDF/DWG downloads are in Scene settings; earlier issues remain available in `assets/plans/`. Native AutoCAD round-trip verifies insert positions, sizes and door rotations and reports zero audit errors. Spatial checks cover furniture and door sweeps; production-mesh checks cover both revised door animations, one continuous 2220 mm wardrobe back, storage panels and flush entrance flooring.

## Current R10 children entrance and storage revision

C12, the short left-wall wardrobe directly ahead of the children doorway, is removed from CAD, the website and its interaction controls. C02, the longer 2850 x 600 mm entrance-wall wardrobe beside the doorway, remains. The two beds, right study area and other furniture remain unchanged.

D07 keeps its 850 mm opening at X=7600..8450, sheet Y=7070..7210. Its hinge moves to the west jamb, X=7600; the leaf opens inward toward the entering person's right/west. Production door animation verifies the closed leaf tip at (8450, 7210) and the open tip at (7600, 8060) in sheet millimetres. Furniture and wall sweep checks pass. The R09 master room correction and all columns are unchanged.

The CAD and website share 63 furniture records. R10 PDF and DWG downloads are in Scene settings; R09 files are preserved in `assets/plans/`.
