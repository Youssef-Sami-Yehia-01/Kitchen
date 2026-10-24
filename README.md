# Ibrahim & Merna Apartment Studio

A complete static apartment viewer extending the existing kitchen with the **R05** architectural plan and the owner’s latest furniture feedback. All runtime libraries and assets are local. No build step, API key, CDN or account is needed.

## Preview

Run `python -m http.server 8088` from this directory and open `http://localhost:8088/`. For a phone on the same Wi-Fi, serve with `python -m http.server 8088 --bind 0.0.0.0` and open the computer's local IPv4 address on port 8088. The computer must allow the connection. Desktop mouse capture requires localhost or HTTPS; touch controls work without it.

`index.html` opens the full apartment. `kitchen.html` preserves the original standalone kitchen.

## Explore

- **Room selector / floor map:** focus a room in isometric view, or enter it in walkthrough mode. Sizes are internal R05 dimensions.
- **Walk inside:** click Explore; WASD/arrows move, mouse looks, Shift moves faster, E opens the part under the crosshair, Escape pauses. Walls, columns, furniture and moving doors have collision footprints.
- **Phone:** tap Explore, hold movement arrows, swipe to look, tap Open to interact, Pause to return to navigation. Pinch/drag in isometric view. Narrow screens also expose these controls.
- **Isometric:** drag to orbit, scroll/pinch to zoom, right-drag to pan. Automatic cutaway hides walls between the camera and target, and removes ceilings. Disable it in Scene to retain walls.
- **Doors & drawers:** 97 controls cover kitchen appliances/cabinets, room doors, balcony sliders, wardrobes, storage, vanities and washing machine. Sliding wardrobe panels and kitchen corner doors close conflicting neighbours.
- **Scene:** sunlight strength, cutaway, close all compartments, dimension-data download and source assumptions.

## R05 layout

Reception/dining/TV lounge, kitchen, guest WC, two bathrooms, main bedroom, dressing room, family/study, two-child bedroom, hallway, both balconies and the open shaft are included. The 64 furniture records include the latest owner-requested changes; architectural room dimensions and structural columns remain from R05.

The kitchen entrance is a centred 1000 mm open passage. The dishwasher is on the user's right when facing the sink; the column stays on the right when entering. The main bed is on the right side at the column face; dresser and three wardrobe bays are on the left. Bathroom 2 has the shower against the shaft wall; toilet, washer, overhead cabinet and vanity are on the left wall. The children’s reference layout now has two 1200 × 2000 mm mattresses in 1240 × 2080 mm frames along the side walls, an entrance-wall wardrobe, a right-side study desk, wall shelves and bedside tables. The left desk and chair are removed per the latest correction; the right desk remains 1350 × 550 mm. The bed-frame aisle is 1040 mm. The right balcony is entered only from the main bedroom. The reception entrance and dressing room have no windows. R04 is removed; R01/R02 are 150 mm higher; R05/R06 are 150 mm lower.

Ceiling height **2.75 m** is confirmed. Unrecorded heights are proposals: window sill 1.10 m, head 2.30 m, door head 2.15 m and typical furniture heights. The right balcony is continuous: the erroneous transverse strip has been removed. Finishes, decorative lighting and accessories outside the kitchen are proposals. The R05 kitchen window is retained; the existing upper-cabinet junction needs review against the actual opening before fabrication. This is a design review model, not a construction survey.

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

R06 is a coffee table, and R03 has a reflective wall mirror. Guest and bathroom fixtures face their backing walls; showers have wall-mounted fittings and hinged front glass doors. Five reflective mirrors are checked against the actual walls after coordinate transforms. Assumed furniture/fixture heights use the market references in [DIMENSIONS.md](DIMENSIONS.md); owner-recorded appliance widths and depths remain unchanged.

The apartment has 18 planters, including four floor pots confined to balcony corners. Indoor planting sits on existing furniture. Corner pots and the trough clear door swings, columns and furniture; right-balcony pots leave over 900 mm of clear floor width. Run `python tools/check_apartment_details.py` to verify these clearances. Plan geometry and supplied furniture measurements were compared with the original R05 source.

The walk camera retains its facing direction when exploration starts. Shower trays are walkable through the open glass doors, with the 70 mm tray elevation reflected in eye height. Complete appliance envelopes were checked after resizing, including handles and levelling feet.

Rounded furniture uses independent vertex/index buffers when batching by material. Run `node tools/check_apartment_geometry.cjs` to verify that one material batch cannot corrupt another cached shape or create stretched triangles between separate objects. Apartment scripts have content hashes in their URLs so revised geometry replaces cached copies.

## Latest owner feedback

- A wall-mounted shoe cabinet sits on the east wall beside dining: 1040 mm wide, 180 mm overall depth including pulls, approximately 1290 mm high. It has six tilt bins and leaves 930 mm beside the existing pulled-out chair envelope. The dining table remains 2300 × 1100 mm; chairs are not tucked beneath it.
- Reception flooring now has a separate light warm-ivory marble finish. The kitchen retains its grey/beige tile reference; the reception colour is an interpretation of the supplied interior references, not a measured product colour.
- K08 replaces the deep freezer with a 620 mm-wide, 600 mm carcass-depth tall pantry. The microwave is integrated at a 1220 mm base height; upper/lower pantry doors and the microwave door operate. The appliance model and ventilation requirements must be selected together before fabrication.
- Master furniture has been exchanged again, while the three wardrobe bays and owner-recorded bed dimensions remain. Balcony access stays from the master bedroom only.
- The large bathroom vanity sits at the lower-left corner, with a 10 mm side reveal. F05 is wall mounted 600 mm above the family-room floor.
- The new children’s room follows the supplied two-bed reference around the actual PDF column/window positions. The confirmed ceiling remains 2750 mm rather than the reference image’s 2600 mm.

Run `python tools/check_feedback_layout.py` for new furniture, door-swing, column and balcony-route checks. The current viewer exposes 97 interactions.
