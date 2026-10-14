# Ibrahim & Merna Kitchen Viewer

This is a complete static website with all runtime assets included. No account keys, CDN connection, or build step is needed.

## Deploy on Vercel

Import this GitHub repository in Vercel. Use the repository root as the Root Directory. Choose Framework Preset **Other**. Leave the Build Command empty and set Output Directory to **.** (the root). Deploy.

Keep assets/ and vendor/ alongside index.html and viewer.js. Do not upload only the HTML file. Serve over HTTPS for mouse capture and full-screen controls.

## Local preview

From this folder run `python -m http.server 8080`, then open http://localhost:8080 .

## Controls

Walk inside: click to explore; WASD/arrow keys move, mouse looks, Shift moves faster, E opens the item under the crosshair, Escape releases the mouse. Isometric: drag to orbit and scroll to zoom. On phones: tap to explore, hold the on-screen arrows to move, swipe the room to look around, tap Open to interact, and tap Pause to stop. Movement and looking work together. In isometric mode, drag to rotate, pinch to zoom, and tap a door or drawer to open. Doors & drawers lists all 35 opening parts. Scene controls sunlight and automatic wall hiding.

Room: 4.00 x 2.50 m; ceiling 2.75 m. Model geometry and appliance dimensions are retained. The room is mirrored with the column on the right when entering. Real-time lighting approximates the supplied reference; the AI image is an artistic visualization.

Vercel settings reference: https://vercel.com/docs/builds/configure-a-build

## Validation

Verified in Chromium desktop and emulated touch devices: simultaneous walking and swipe looking, tap interactions, pause/resume, drag orbit, pinch zoom, portrait/landscape layouts, collision checks, opening/closing all 35 parts, auto-hidden walls, and sunlight settings. Testing used phone emulation; physical iOS/Android hardware was not available.
