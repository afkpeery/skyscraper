# 200Block — immersive 3D city block

An interactive creative-production portfolio set on a New York neighborhood street. The HTML portfolio remains the source of truth for film, clip, archive, project, consultation and contact content; Three.js supplies the navigable architecture.

## Storefront experience
Eight distinct storefronts are modeled on both sides of the street:
- **200BLOCK** — reception lobby, brand wall, monitor, waiting chairs and plants.
- **THEATER** — intimate screening room, projection screen and tiered seats.
- **CINEMA** — ticket counter, film posters, screen and reel details.
- **VIDEO ARCADE** — arcade cabinets, illuminated screens and a lounge bench.
- **PROJECTS** — production planning room, storyboard wall, edit displays and worktable.
- **RECORD SHOP** — record shelving, vinyl bins, listening counter and album displays.
- **STUDIO** — editing desk, monitors, camera, tripod, acoustic panels and softbox.
- **CONTACT** — reception desk, meeting table, seating and plants.

Click a storefront's glazed frontage to enter. The camera eases from the street through the doorway and into the room. The in-scene card identifies the space and provides **Explore portfolio section** and **Return to street** actions. Escape also returns to the street. Wheel, touch and keyboard street navigation pause while inside and resume after exiting.

## 3D construction and realism
- Modular room shells with floor, ceiling, side and back walls, baseboards, ceiling beams and practical light fixtures.
- Distinct purpose-built fixtures and furniture for each storefront, with shared materials and cached box geometry to reduce repeated allocations.
- Transparent shopfront glazing with open ground-floor facade geometry so interiors are visible from the sidewalk.
- Existing masonry, concrete, asphalt, glass, metal and brass materials retained; photographic brick texture falls back to procedural masonry if the external texture cannot load.
- Street environment retains varied buildings, fire escapes, streetlights, utility cables, parked vehicles, road markings, fog, directional light and shadows.
- Renderer pixel ratio is capped for performance. If WebGL cannot initialize, the original photographic city canvas and HTML portfolio remain available.

## Files
- `city3d.js` — Three.js city, storefront geometry, eight interiors, raycasting and camera entry/exit transitions.
- `app.js` — existing portfolio behavior and camera physics; wheel, touch and keyboard navigation pause while an interior is open.
- `style.css` — storefront information card, responsive layout and WebGL fallback styling.
- `index.html` — loads the existing portfolio and Three.js module.

## Run and verification
Serve the repository root over HTTP (for example, with GitHub Pages or a local static server); ES modules are not expected to load from `file://`. The JavaScript files were syntax-checked after the interior implementation. A live browser/WebGL visual test has not yet been run.


## Living-street polish
The street now includes a restrained animated pedestrian layer on both sidewalks. Figures have subtle walking cycles and slow positional drift to keep the scene alive without competing with storefront content. Emissive storefront/display materials receive a gentle intensity pulse. Actor geometry and materials are shared to limit draw and allocation overhead. This is a procedural animation layer; it does not depend on external video or image assets.


## Rainy-night atmosphere pass
- Road asphalt now uses a wetter, more reflective material response, with shallow irregular puddles distributed along the street.
- A lightweight reusable 3D rain-line buffer adds depth to the existing 2D rain overlay.
- Parked vehicles now include paired warm headlamps, red rear lamps and subtle forward light pools.
- Rain geometry is updated in place each frame to avoid per-frame object creation.


## YouTube catalogue connected to 3D storefronts
- `app.js` exposes the existing curated YouTube catalogue (top films, archive and clips) as a shared browser data object; the catalogue remains authored in one place.
- The THEATER projection screen displays the featured film, The Last Collection.
- The CINEMA screen displays the first entry in the curated Top Films list.
- VIDEO ARCADE cabinet screens display different entries from the Top Films list.
- Storefront screens are clickable and open the matching film directly on YouTube. Interior content links continue to provide the full section/archive navigation.
- Thumbnail textures load asynchronously and retain a generated screen fallback if YouTube thumbnail delivery is unavailable.
