# 200Block — 3D City Block

An immersive creative-production portfolio set on a photorealistic-inspired New York neighborhood street.

## Experience
- Eight portfolio destinations are presented as individual storefront identities: 200BLOCK, THEATER, CINEMA, VIDEO ARCADE, PROJECTS, RECORD SHOP, STUDIO and CONTACT.
- The HTML portfolio content remains accessible and interactive above a Three.js street environment.
- Scroll, swipe or use the navigation / arrow keys to travel along the block. The 3D camera follows the same progress with eased movement.
- Storefront glass, signs and facades are raycast targets; clicking a visible shopfront routes to its matching portfolio section.
- Existing YouTube thumbnails, clips, archive links, consultation content and contact form are retained.

## 3D implementation
- `city3d.js` imports Three.js as an ES module from jsDelivr.
- Storefronts are built from modular box geometry: brick facade masses, stone pilasters, recessed shop windows, glazed doors, transoms, projecting signboards and awnings.
- Procedural brick canvas texture is used as both a color and bump map. Physical glass, iron, stone, asphalt and sidewalk materials are separate.
- The street includes sidewalks, curbs, road markings, crosswalks, streetlights, fire escapes and parked vehicles.
- Lighting uses hemisphere and directional light, warm point lights, soft shadows, ACES filmic tone mapping and atmospheric fog.
- The renderer caps device pixel ratio for performance.

## Run
Open `index.html` through a local static server (ES modules do not reliably load from `file://`), or deploy the repository root with GitHub Pages.

## Notes
The scene uses procedural geometry and materials so it does not depend on downloading a large prebuilt 3D city asset. The existing portfolio remains the content layer; the Three.js environment provides the surrounding street and interactive storefronts.
