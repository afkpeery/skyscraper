import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

/* 200Block: procedural, real-time 3D New York street. */
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xaebdc4);
scene.fog = new THREE.Fog(0xaebdc4, 42, 245);

const camera = new THREE.PerspectiveCamera(74, innerWidth / innerHeight, .1, 420);
camera.position.set(0, 2.35, 8);
const renderer = (() => { try { return new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' }); } catch (error) { document.documentElement.classList.add('webgl-unavailable'); console.warn('200Block 3D scene unavailable; retaining the 2D portfolio fallback.', error); return null; } })();
if (!renderer) { /* The existing photographic city canvas and HTML portfolio remain usable. */ } else {
renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.65));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.12;
renderer.domElement.id = 'street3d';
document.getElementById('scene').prepend(renderer.domElement);

scene.add(new THREE.HemisphereLight(0xdce8ee, 0x33271f, 2.0));
const sun = new THREE.DirectionalLight(0xffe4c2, 2.1);
sun.position.set(-22, 38, 24);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.left = -42; sun.shadow.camera.right = 42;
sun.shadow.camera.top = 45; sun.shadow.camera.bottom = -45;
scene.add(sun);
const warm = new THREE.PointLight(0xffb66f, 38, 54, 2);
warm.position.set(0, 5, -34); scene.add(warm);

function canvasTexture(draw, repeatX = 1, repeatY = 1) {
  const canvas = document.createElement('canvas');
  canvas.width = 512; canvas.height = 512;
  const ctx = canvas.getContext('2d');
  draw(ctx, canvas.width, canvas.height);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeatX, repeatY);
  tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
  return tex;
}

const brickMap = canvasTexture((c,w,h) => {
  c.fillStyle = '#6d4030'; c.fillRect(0,0,w,h);
  for(let row=0; row<18; row++){
    const y=row*29;
    for(let col=-1; col<9; col++){
      const x=col*65+(row%2?32:0);
      const hue=18+Math.random()*10, light=30+Math.random()*17;
      c.fillStyle='hsl('+hue+',30%,'+light+'%)';
      c.fillRect(x+1,y+1,62,25);
      c.fillStyle='rgba(255,220,180,.14)'; c.fillRect(x+2,y+2,59,2);
      c.fillStyle='rgba(0,0,0,.25)'; c.fillRect(x+2,y+23,60,2);
      for(let n=0;n<16;n++){c.fillStyle='rgba(20,12,8,'+(Math.random()*.12)+')';c.fillRect(x+Math.random()*62,y+Math.random()*25,2,2);}
    }
  }
}, 2.5, 2.5);
const concreteMap = canvasTexture((c,w,h)=>{
  c.fillStyle='#77746d';c.fillRect(0,0,w,h);
  for(let i=0;i<6500;i++){const v=Math.random()*70;c.fillStyle='rgba('+v+','+v+','+v+',.22)';c.fillRect(Math.random()*w,Math.random()*h,1+Math.random()*3,1+Math.random()*3);}
  c.strokeStyle='rgba(30,30,28,.24)';c.lineWidth=2;
  for(let i=0;i<9;i++){c.beginPath();let x=Math.random()*w,y=Math.random()*h;c.moveTo(x,y);for(let j=0;j<5;j++){x+=Math.random()*45-22;y+=Math.random()*45-22;c.lineTo(x,y);}c.stroke();}
},3,3);
const asphaltMap = canvasTexture((c,w,h)=>{
  c.fillStyle='#292c2d';c.fillRect(0,0,w,h);
  for(let i=0;i<15000;i++){let v=70+Math.random()*80;c.fillStyle='rgba('+v+','+v+','+v+',.10)';c.fillRect(Math.random()*w,Math.random()*h,1,1);}
},2,8);
const brickMat = new THREE.MeshStandardMaterial({map:brickMap,bumpMap:brickMap,bumpScale:.16,roughness:.94});
/* Real photographed masonry overlays the procedural fallback for natural variation. */
const photoLoader = new THREE.TextureLoader();
photoLoader.setCrossOrigin('anonymous');
photoLoader.load('https://images.unsplash.com/photo-1523413651479-597eb2da0ad6?auto=format&fit=crop&w=1200&q=88', tex=>{
 tex.colorSpace=THREE.SRGBColorSpace;tex.wrapS=tex.wrapT=THREE.RepeatWrapping;tex.repeat.set(2.2,2.2);
 tex.anisotropy=renderer.capabilities.getMaxAnisotropy();brickMat.map=tex;brickMat.needsUpdate=true;
},undefined,()=>{ /* Keep the generated brick map if the photo source is unavailable. */ });

const concreteMat = new THREE.MeshStandardMaterial({map:concreteMap,roughness:.96});
const asphaltMat = new THREE.MeshStandardMaterial({map:asphaltMap,roughness:.34,metalness:.22,envMapIntensity:.8});
const darkMetal = new THREE.MeshStandardMaterial({color:0x242729,metalness:.72,roughness:.48});
const glassMat = new THREE.MeshPhysicalMaterial({color:0x8ca9b5,metalness:.34,roughness:.13,transparent:true,opacity:.48,reflectivity:.9});
const trimMat = new THREE.MeshStandardMaterial({color:0x282522,metalness:.3,roughness:.62});
const brassMat = new THREE.MeshStandardMaterial({color:0xb79a69,metalness:.72,roughness:.3});

const boxGeometryCache = new Map();
function box(parent,w,h,d,mat,x,y,z,cast=true){
  const key=[w,h,d].join(':');
  if(!boxGeometryCache.has(key)) boxGeometryCache.set(key,new THREE.BoxGeometry(w,h,d));
  const m=new THREE.Mesh(boxGeometryCache.get(key),mat);
  m.position.set(x,y,z);m.castShadow=cast;m.receiveShadow=true;parent.add(m);return m;
}
function signTexture(text){
  return canvasTexture((c,w,h)=>{
    c.fillStyle='#171a1a';c.fillRect(0,0,w,h);
    c.strokeStyle='#b89b69';c.lineWidth=13;c.strokeRect(9,9,w-18,h-18);
    c.strokeStyle='rgba(240,220,183,.35)';c.lineWidth=2;c.strokeRect(23,23,w-46,h-46);
    c.textAlign='center';c.textBaseline='middle';c.fillStyle='#f1dfbd';
    c.font='600 43px Georgia';c.shadowColor='#d8ad6d';c.shadowBlur=12;c.fillText(text,w/2,h/2, w-60);
  });
}
function windowLight(){
 const c=canvasTexture((ctx,w,h)=>{
  ctx.fillStyle='#17232a';ctx.fillRect(0,0,w,h);
  const grad=ctx.createLinearGradient(0,0,0,h);grad.addColorStop(0,'#879da3');grad.addColorStop(.55,'#35454a');grad.addColorStop(1,'#161b1c');ctx.fillStyle=grad;ctx.fillRect(0,0,w,h);
  for(let i=0;i<18;i++){const x=Math.random()*w,y=Math.random()*h*.8;ctx.fillStyle=Math.random()>.42?'rgba(255,207,135,.72)':'rgba(170,203,219,.24)';ctx.fillRect(x,y,12+Math.random()*30,18+Math.random()*36);}
 });
 return new THREE.MeshStandardMaterial({map:c,emissive:0x382819,emissiveIntensity:.38,roughness:.28});
}
const litWindow=windowLight();
const storeNames=['200BLOCK','THEATER','CINEMA','VIDEO ARCADE','PROJECTS','RECORD SHOP','STUDIO','CONTACT'];
const storeIds=['home','featured','top-films','highlights','upcoming','archive','consultations','contact'];
const interactive=[];
const streetLength=storeNames.length*29+42;

// Road and sidewalks
box(scene,13,.22,streetLength,asphaltMat,0,-.12,-streetLength/2+5,false);
// Rain-darkened road: shallow irregular puddles catch nearby neon and street lamps.
const puddleMat=new THREE.MeshPhysicalMaterial({color:0x65727a,metalness:.48,roughness:.13,transparent:true,opacity:.62,clearcoat:1,clearcoatRoughness:.08});
for(let i=0;i<42;i++){
 const rx=1.2+Math.random()*3.2,rz=.45+Math.random()*1.35;
 const mesh=new THREE.Mesh(new THREE.CircleGeometry(1,28),puddleMat);
 mesh.rotation.x=-Math.PI/2;mesh.scale.set(rx,rz,1);
 mesh.position.set((Math.random()-.5)*9,-.002,-8-i*10.5+Math.random()*5);
 mesh.receiveShadow=true;scene.add(mesh);
}
for(const side of [-1,1]){
 box(scene,5,.42,streetLength,concreteMat,side*9,.05,-streetLength/2+5,false);
 box(scene,.22,.42,streetLength,trimMat,side*6.5,.13,-streetLength/2+5,false);
 // curb cuts and slabs
 for(let z=-5;z>-streetLength;z-=5.2) box(scene,4.8,.035,.055,trimMat,side*9,.28,z,false);
}
// lane markings, crosswalks and manhole covers
for(let z=-10;z>-streetLength;z-=15) box(scene,.14,.012,5,new THREE.MeshStandardMaterial({color:0xd5c9a7,roughness:.9}),0,.005,z,false);
for(let z=-23;z>-streetLength;z-=58){
 for(let n=-4;n<=4;n++) box(scene,.62,.018,3.2,new THREE.MeshStandardMaterial({color:0xd9d2bd,roughness:.8}),n*.78,.012,z,false);
 const cover=new THREE.Mesh(new THREE.CylinderGeometry(.62,.62,.04,32),darkMetal);cover.rotation.x=Math.PI/2;cover.position.set(3,.03,z-7);scene.add(cover);
}

function addFireEscape(group, x, y, z){
 for(let level=0;level<3;level++){
  const yy=y+level*2.55;
  box(group,2.45,.12,.95,darkMetal,x,yy,z-.72);
  for(const side of [-1,1]){
   box(group,.08,.9,.08,darkMetal,x+side*1.18,yy+.48,z-1.12);
   box(group,.08,.9,.08,darkMetal,x+side*1.18,yy+.48,z-.32);
   box(group,.08,.08,.88,darkMetal,x+side*1.18,yy+.9,z-.72);
  }
  for(let k=0;k<9;k++)box(group,.035,.58,.035,darkMetal,x-1.12+k*.28,yy+.36,z-1.12);
  if(level<2){
   const ladder=box(group,.08,2.65,.08,darkMetal,x+1.48,yy+1.35,z-.7);
   box(group,.08,2.65,.08,darkMetal,x+1.78,yy+1.35,z-.7);
   for(let r=0;r<10;r++)box(group,.38,.045,.045,darkMetal,x+1.63,yy+.18+r*.25,z-.7);
  }
 }
}

const interiorMaterials = {
  oak:new THREE.MeshStandardMaterial({color:0x68452f,roughness:.78}),
  darkOak:new THREE.MeshStandardMaterial({color:0x30241d,roughness:.72}),
  plaster:new THREE.MeshStandardMaterial({color:0xb6a58d,roughness:.94}),
  charcoal:new THREE.MeshStandardMaterial({color:0x24282a,roughness:.9}),
  tile:new THREE.MeshStandardMaterial({color:0x68635b,roughness:.92}),
  brass:new THREE.MeshStandardMaterial({color:0xb69a6a,metalness:.7,roughness:.32}),
  upholstery:new THREE.MeshStandardMaterial({color:0x55362f,roughness:.95}),
  cream:new THREE.MeshStandardMaterial({color:0xd8c7aa,roughness:.86}),
  screen:new THREE.MeshStandardMaterial({color:0x101b24,emissive:0x16374b,emissiveIntensity:.9,roughness:.3}),
  warm:new THREE.MeshStandardMaterial({color:0xffd49b,emissive:0xffa94e,emissiveIntensity:1.35,roughness:.4}),
  green:new THREE.MeshStandardMaterial({color:0x315044,roughness:.9})
};
function cylinder(parent,rTop,rBottom,h,material,x,y,z,segments=12){
 const mesh=new THREE.Mesh(new THREE.CylinderGeometry(rTop,rBottom,h,segments),material);
 mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;
}
function plant(room,x,z){
 cylinder(room,.24,.3,.48,interiorMaterials.darkOak,x,.42,z,12);
 for(let i=0;i<6;i++){
  const leaf=box(room,.12,.95,.16,interiorMaterials.green,x+Math.sin(i)*.22,.95+i%2*.12,z+Math.cos(i)*.2);
  leaf.rotation.z=(i-2.5)*.22;
 }
}
function screenPanel(room,x,y,z,w,h){
 box(room,w+.16,h+.16,.12,interiorMaterials.darkOak,x,y,z);
 box(room,w,h,.035,interiorMaterials.screen,x,y,z+.085,false);
 box(room,w*.16,.035,.025,interiorMaterials.warm,x,y-h*.39,z+.11,false);
}
function counter(room,x,z,w=3){
 box(room,w,.95,.82,interiorMaterials.darkOak,x,.75,z);
 box(room,w+.08,.12,.9,interiorMaterials.brass,x,1.28,z);
 box(room,w-.2,.08,.04,interiorMaterials.oak,x,.38,z+.43);
 screenPanel(room,x,1.85,z-.22,.72,.42);
}
function chair(room,x,z,material=interiorMaterials.upholstery){
 box(room,.85,.18,.78,material,x,.72,z);
 box(room,.85,.9,.16,material,x,1.2,z-.34);
 for(const dx of [-.32,.32])for(const dz of [-.27,.27])box(room,.07,.65,.07,interiorMaterials.darkOak,x+dx,.36,z+dz);
}
function poster(room,x,y,z,label){
 box(room,1.12,1.58,.09,interiorMaterials.brass,x,y,z);
 box(room,.94,1.4,.035,interiorMaterials.charcoal,x,y,z+.065);
 const glow=new THREE.Mesh(new THREE.PlaneGeometry(.82,1.25),new THREE.MeshStandardMaterial({color:0x8a4d37,emissive:0x3d1d16,emissiveIntensity:.7,roughness:.7}));
 glow.position.set(x,y,z+.09);room.add(glow);
}
function recordRack(room,x,z){
 box(room,1.5,1.25,.62,interiorMaterials.oak,x,.9,z);
 box(room,1.42,.07,.68,interiorMaterials.brass,x,1.55,z);
 for(let n=0;n<7;n++){
  const disc=cylinder(room,.27,.27,.035,n%2?interiorMaterials.charcoal:interiorMaterials.upholstery,x-.58+n*.19,1.05,z-.05,16);
  disc.rotation.x=Math.PI/2;
 }
}
const mediaTextureLoader=new THREE.TextureLoader();
mediaTextureLoader.setCrossOrigin('anonymous');
const interactiveMedia=[];
function mediaScreen(room,x,y,z,w,h,film){
 const material=new THREE.MeshStandardMaterial({color:0x101b24,emissive:0x16374b,emissiveIntensity:.9,roughness:.28});
 const screen=new THREE.Mesh(new THREE.PlaneGeometry(w,h),material);
 screen.position.set(x,y,z+.13);screen.userData.youtubeUrl=film?.id?'https://www.youtube.com/watch?v='+film.id:'https://www.youtube.com/@200block';
 screen.userData.filmTitle=film?.title||'200Block film catalogue';
 room.add(screen);interactiveMedia.push(screen);
 if(film?.id)mediaTextureLoader.load('https://i.ytimg.com/vi/'+film.id+'/hqdefault.jpg',texture=>{
  texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=renderer.capabilities.getMaxAnisotropy();
  material.map=texture;material.color.set(0xffffff);material.emissive.set(0x000000);material.emissiveIntensity=0;material.needsUpdate=true;
 },undefined,()=>{});
 return screen;
}
function catalogue(){
 const data=window.__200blockCatalog||{};
 return {topFilms:data.topFilms||[],archive:data.archive||[],clips:data.clips||[]};
}
function buildInterior(storeGroup,index,side){
 const room=new THREE.Group();room.name='interior-'+storeIds[index]+'-'+side;storeGroup.add(room);
 const floorMat=[interiorMaterials.oak,interiorMaterials.upholstery,interiorMaterials.charcoal,interiorMaterials.tile,interiorMaterials.oak,interiorMaterials.darkOak,interiorMaterials.tile,interiorMaterials.cream][index];
 const wallMat=[interiorMaterials.plaster,interiorMaterials.charcoal,interiorMaterials.charcoal,interiorMaterials.charcoal,interiorMaterials.plaster,interiorMaterials.green,interiorMaterials.charcoal,interiorMaterials.plaster][index];
 // Deep, open-front room: glazing remains transparent so the street view reads into the space.
 box(room,8.55,.18,10.4,floorMat,0,.18,-3.25);
 box(room,8.55,.14,10.4,interiorMaterials.charcoal,0,5.52,-3.25,false);
 box(room,.16,5.25,10.4,wallMat,-4.28,2.82,-3.25);
 box(room,.16,5.25,10.4,wallMat,4.28,2.82,-3.25);
 box(room,8.55,5.25,.18,wallMat,0,2.82,-8.42);
 for(const x of [-4.12,4.12])box(room,.12,.22,10.1,interiorMaterials.brass,x,.42,-3.25);
 box(room,8.3,.22,.12,interiorMaterials.brass,0,.42,-8.28);
 // Ceiling beams and practical fixtures create visible depth through the shop windows.
 for(const z of [-1.2,-4.2,-7.3]){
  box(room,8.1,.12,.16,interiorMaterials.darkOak,0,5.34,z);
  for(const x of [-2.7,0,2.7])box(room,.22,.08,.5,interiorMaterials.warm,x,5.23,z);
 }
 // Back wall title plaque and a slim brass picture rail.
 const plaque=new THREE.Mesh(new THREE.PlaneGeometry(4.6,.62),new THREE.MeshStandardMaterial({map:signTexture(storeNames[index]),emissive:0x302012,emissiveIntensity:.42,roughness:.52}));
 plaque.position.set(0,4.75,-8.29);room.add(plaque);
 box(room,7.9,.045,.07,interiorMaterials.brass,0,4.12,-8.29);
 if(index===0){
  // 200BLOCK lobby: reception, brand wall, monitor and waiting lounge.
  counter(room,0,-5.65,3.6);screenPanel(room,0,3.0,-8.25,2.8,1.15);
  chair(room,-2.25,-2.9);chair(room,2.25,-2.9);plant(room,-3.55,-6.9);plant(room,3.55,-6.9);
  poster(room,-2.6,3.05,-8.28,'200BLOCK');poster(room,2.6,3.05,-8.28,'PRODUCTION');
 }else if(index===1){
  // THEATER: intimate screening room with a projection screen and tiered seats.
  screenPanel(room,0,3.55,-8.24,5.9,2.15);
  mediaScreen(room,0,3.55,-8.24,5.55,1.82,{id:'193TXI7meKE',title:'The Last Collection'});
  for(let row=0;row<3;row++)for(let col=0;col<5;col++){
   const x=(col-2)*1.48,z=-5.7+row*1.45;
   chair(room,x,z,new THREE.MeshStandardMaterial({color:row%2?0x713b32:0x38231f,roughness:.96}));
  }
  for(const x of [-3.3,3.3])box(room,.08,2.6,.08,interiorMaterials.brass,x,1.4,-3.7);
 }else if(index===2){
  // CINEMA: ticket booth, illuminated film posters and reel displays.
  counter(room,-2.2,-5.8,2.4);screenPanel(room,1.7,2.6,-8.25,2.4,1.25);
  const films=catalogue().topFilms;mediaScreen(room,1.7,2.6,-8.25,2.18,1.08,films[0]||{id:'193TXI7meKE',title:'The Last Collection'});
  for(const x of [-3,0,3])poster(room,x,3.0,-8.27,'FILM');
  for(const x of [-2.5,0,2.5]){cylinder(room,.55,.55,.08,interiorMaterials.brass,x,4.25,-8.15,24).rotation.x=Math.PI/2;cylinder(room,.13,.13,.1,interiorMaterials.charcoal,x,4.25,-8.07,16).rotation.x=Math.PI/2;}
  plant(room,3.6,-6.8);
 }else if(index===3){
  // VIDEO ARCADE: glowing cabinets, control decks and a social bench.
  for(let n=0;n<5;n++){
   const x=-3.2+n*1.6;
   box(room,.92,1.9,.78,interiorMaterials.darkOak,x,1.15,-5.9);
   box(room,.74,.78,.06,interiorMaterials.brass,x,1.55,-5.48);
   screenPanel(room,x,1.58,-5.42,.58,.48);
   const arcadeFilms=catalogue().topFilms;
   const arcadeFilm=arcadeFilms.length?arcadeFilms[n%arcadeFilms.length]:{id:'193TXI7meKE',title:'The Last Collection'};
   mediaScreen(room,x,1.58,-5.42,.52,.4,arcadeFilm);
   box(room,.66,.12,.42,interiorMaterials.upholstery,x,.88,-5.25);
   cylinder(room,.09,.09,.16,interiorMaterials.warm,x-.2,.94,-5.02,10);
   cylinder(room,.09,.09,.16,interiorMaterials.brass,x+.18,.94,-5.02,10);
  }
  box(room,5.8,.55,1.1,interiorMaterials.upholstery,0,.48,-2.8);
  for(const x of [-3.3,3.3])poster(room,x,3.15,-8.27,'ARCADE');
 }else if(index===4){
  // PROJECTS: production planning room with edit monitors and a storyboard wall.
  counter(room,0,-4.35,4.2);
  for(const x of [-2.7,-.9,.9,2.7])poster(room,x,3.2,-8.27,'FRAME');
  screenPanel(room,0,2.15,-8.25,2.4,1.05);
  for(const x of [-2.2,2.2])chair(room,x,-2.4);
  box(room,3.4,.12,1.7,interiorMaterials.oak,0,1.05,-3.8);
  plant(room,-3.6,-6.9);
 }else if(index===5){
  // RECORD SHOP: wall shelving, record bins, listening station and album displays.
  for(const x of [-2.9,0,2.9]){
   box(room,1.65,2.8,.42,interiorMaterials.darkOak,x,2.1,-7.85);
   for(let y=1.2;y<3.5;y+=.75)box(room,1.5,.07,.48,interiorMaterials.brass,x,y,-7.55);
   for(let n=0;n<5;n++)box(room,.22,.85,.12,n%2?interiorMaterials.upholstery:interiorMaterials.cream,x-.6+n*.3,1.7,-7.42);
  }
  recordRack(room,-2.3,-3.8);recordRack(room,0,-3.8);recordRack(room,2.3,-3.8);
  counter(room,0,-6.2,2.2);
 }else if(index===6){
  // STUDIO: editing desk, cinema camera, tripod, softbox and acoustic panels.
  counter(room,0,-5.7,3.8);screenPanel(room,-1,2.65,-8.25,1.5,.9);screenPanel(room,1,2.65,-8.25,1.5,.9);
  for(const x of [-3.4,3.4])for(let y=1.2;y<4.4;y+=1.1)box(room,.12,.75,.16,interiorMaterials.upholstery,x,y,-8.22);
  cylinder(room,.06,.06,2.3,interiorMaterials.charcoal,2.65,1.2,-3.2,10);
  for(let a=0;a<3;a++)box(room,.06,1.1,.06,interiorMaterials.charcoal,2.65+Math.cos(a*2.1)*.45,.55,-3.2+Math.sin(a*2.1)*.45);
  box(room,.65,.5,.48,interiorMaterials.darkOak,2.65,2.35,-3.2);
  box(room,.95,1.5,.18,interiorMaterials.cream,-3.2,3.1,-3.7);
  plant(room,3.6,-7);
 }else{
  // CONTACT: warm reception lounge with seating, plants and a meeting table.
  counter(room,0,-6.2,3.2);chair(room,-2.3,-3.4);chair(room,2.3,-3.4);
  box(room,2.4,.16,1.3,interiorMaterials.oak,0,.85,-3.4);
  plant(room,-3.5,-6.9);plant(room,3.5,-6.9);
  poster(room,-2.7,3.0,-8.27,'HELLO');poster(room,2.7,3.0,-8.27,'CONTACT');
 }
 return room;
}

function createStore(index, side){
 const group=new THREE.Group();
 const z=-13-index*29;
 const x=side*11.7;
 group.position.set(x,0,z);
 group.rotation.y=side===-1?Math.PI/2:-Math.PI/2;
 const face=side===-1?1:-1;
 // Older masonry upper stories and ground-floor commercial frontage
 const height=17+(index%3)*2.4;
 // Open the commercial ground floor so the real interior is visible through the glazing.
 box(group,9.5,height-6.4,3.8,brickMat,0,6.4+(height-6.4)/2,-.15);
 box(group,1.0,6.4,3.8,brickMat,-4.25,3.2,-.15);
 box(group,1.0,6.4,3.8,brickMat,4.25,3.2,-.15);
 box(group,9.8,.62,4.05,concreteMat,0,.38,-.1);
 // facade pilasters and cornice
 for(const px of [-4.45,4.45]){
  box(group,.34,5.4,.48,concreteMat,px,3.1,1.8);
  box(group,.55,.26,.65,brassMat,px,5.85,1.85);
 }
 box(group,9.7,.38,.62,trimMat,0,6.05,1.72);
 box(group,9.8,.25,.68,brassMat,0,6.27,1.72);
 // Door and large display windows, all in the street-facing plane
 const doorX=side===-1?2.65:-2.65;
 box(group,1.35,3.3,.18,trimMat,doorX,1.95,1.96);
 box(group,1.12,3.05,.08,glassMat,doorX,1.98,2.08);
 box(group,.09,3.08,.1,brassMat,doorX-.53,1.98,2.14);
 box(group,.09,3.08,.1,brassMat,doorX+.53,1.98,2.14);
 const winX=side===-1?-1.35:1.35;
 box(group,3.6,3.05,.18,trimMat,winX,2,1.95);
 box(group,3.35,2.8,.06,glassMat,winX,2.02,2.08);
 for(const dx of [-1.1,0,1.1])box(group,.045,2.78,.08,brassMat,winX+dx,2.02,2.14);
 box(group,3.42,.08,.09,brassMat,winX,2.02,2.16);
 // Deep sign box projects above the storefront
 box(group,5.9,.92,.72,trimMat,0,6.95,2.08);
 box(group,5.72,.72,.12,brassMat,0,6.95,2.49);
 const sign=new THREE.Mesh(new THREE.PlaneGeometry(5.48,.55),new THREE.MeshStandardMaterial({map:signTexture(storeNames[index]),emissive:0x49351d,emissiveIntensity:.5,roughness:.45}));
 sign.position.set(0,6.95,2.57);group.add(sign);
 // Canvas awning with striped fabric and visible support arms
 const awnMat=new THREE.MeshStandardMaterial({color:index%2?0x7c4030:0x34434a,roughness:.88});
 box(group,4.25,.12,1.12,awnMat,0,5.92,2.55);
 for(let a=-2;a<=2;a++)box(group,.025,.14,1.15,brassMat,a*.85,5.9,2.55);
 // Upper windows with varied warm/cool occupancy
 for(let floor=0;floor<3;floor++)for(let col=0;col<3;col++){
  const wx=-3+col*3, wy=9+floor*2.55;
  box(group,1.35,1.48,.13,trimMat,wx,wy,1.78);
  box(group,1.17,1.29,.055,litWindow,wx,wy,1.88);
  box(group,.06,1.3,.07,brassMat,wx,wy,1.93);
  box(group,1.18,.06,.07,brassMat,wx,wy,1.93);
 }
 // Roof parapet and side depth
 box(group,9.7,.38,4.05,concreteMat,0,height-.18,-.1);
 box(group,.22,height,4.05,trimMat,-4.82,height/2,-.1);
 // Full-depth, purpose-built interior visible through the real glass storefront.
 buildInterior(group,index,side);
 // Transparent interaction volume covers the actual door and display frontage.
 const hit=box(group,8.15,4.85,.16,new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false}),0,3.05,2.72,false);
 hit.userData.storeId=storeIds[index];hit.userData.storeName=storeNames[index];hit.userData.storeIndex=index;hit.userData.storeGroup=group;hit.userData.side=side;hit.userData.doorX=side===-1?2.65:-2.65;interactive.push(hit);
 if(index%2===0)addFireEscape(group,side===-1?4.65:-4.65,8,-.2);
 // rooftop water tank / vent gives skyline silhouette
 if(index%3===1){
  const tank=new THREE.Mesh(new THREE.CylinderGeometry(.72,.72,1.8,16),new THREE.MeshStandardMaterial({color:0x4b382b,roughness:.92}));
  tank.position.set(-2.7,height+1.05,-.4);tank.castShadow=true;group.add(tank);
  box(group,1.8,.12,1.8,darkMetal,-2.7,height+2,-.4);
 }
 scene.add(group);
}
for(let i=0;i<storeNames.length;i++){createStore(i,-1);createStore(i,1);}

// Opposing blocks: varied-height brick buildings with rooftop silhouettes
for(const side of [-1,1]){
 for(let i=0;i<11;i++){
  const z=-i*23-4, h=21+(i%4)*5.5, width=9.5+(i%3)*2;
  const b=new THREE.Group();b.position.set(side*(18+width/2),0,z);b.rotation.y=side===-1?Math.PI/2:-Math.PI/2;
  box(b,width,h,18,brickMat,0,h/2,0);
  for(let f=0;f<Math.floor(h/3.2);f++)for(let c=0;c<Math.floor(width/2.5);c++){
   const wx=-width/2+1.5+c*2.5, wy=2.4+f*3.1;
   box(b,1.1,1.55,.1,trimMat,wx,wy,9.1);
   box(b,.91,1.34,.045,litWindow,wx,wy,9.17);
   box(b,.045,1.35,.05,brassMat,wx,wy,9.2);
  }
  box(b,width+.25,.42,18.5,concreteMat,0,h-.2,0);
  if(i%2===0)addFireEscape(b,side===-1?width/2-.8:-width/2+.8,5,9.5);
  scene.add(b);
 }
}

// Period street lamps, warm pools of light and overhead utility cables
for(let z=-5;z>-streetLength;z-=19){
 for(const side of [-1,1]){
  const x=side*6.5;
  box(scene,.14,5.5,.14,darkMetal,x,2.75,z);
  box(scene,.95,.12,.12,darkMetal,x-side*.38,5.35,z);
  const bulb=new THREE.Mesh(new THREE.SphereGeometry(.19,12,8),new THREE.MeshStandardMaterial({color:0xffd9a1,emissive:0xffa94f,emissiveIntensity:2.1}));
  bulb.position.set(x-side*.78,5.2,z);scene.add(bulb);
  const glow=new THREE.PointLight(0xffb86c,14,13,2);glow.position.copy(bulb.position);scene.add(glow);
 }
}
const cableMat=new THREE.LineBasicMaterial({color:0x292b2b,transparent:true,opacity:.58});
for(let z=-3;z>-streetLength;z-=31){
 const points=[new THREE.Vector3(-18,13,z),new THREE.Vector3(0,11.5,z-2),new THREE.Vector3(18,13,z)];
 scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points),cableMat));
}

// Subtle parked vehicles, varied body colors and glass
function car(x,z,color){
 const g=new THREE.Group();g.position.set(x,.35,z);
 const body=new THREE.MeshStandardMaterial({color,metalness:.52,roughness:.38});
 box(g,2.05,.62,4.3,body,0,.45,0);
 box(g,1.65,.72,2.05,glassMat,0,1.08,-.12);
 for(const wx of [-.88,.88])for(const wz of [-1.35,1.35]){
  const wheel=new THREE.Mesh(new THREE.CylinderGeometry(.36,.36,.18,16),darkMetal);wheel.rotation.z=Math.PI/2;wheel.position.set(wx,.25,wz);g.add(wheel);
 }
 box(g,1.85,.12,1.1,new THREE.MeshStandardMaterial({color:0xffd6a0,emissive:0xffb35b,emissiveIntensity:.55}),0,.45,-2.18,false);
 // Paired headlamps and rear lamps add readable vehicle silhouettes at night.
 const headMat=new THREE.MeshStandardMaterial({color:0xffe2b1,emissive:0xffc878,emissiveIntensity:2.8,roughness:.25});
 const tailMat=new THREE.MeshStandardMaterial({color:0x8f171b,emissive:0xff1728,emissiveIntensity:1.65,roughness:.3});
 for(const lx of [-.72,.72]){
  box(g,.28,.18,.07,headMat,lx,.72,-2.17,false);
  box(g,.28,.18,.07,tailMat,lx,.72,2.17,false);
 }
 const beam=new THREE.PointLight(0xffd39a,5.5,10,2);
 beam.position.set(0,.72,-2.35);g.add(beam);
 scene.add(g);
}
for(let i=0;i<8;i++){car(-7.7,-20-i*29,i%2?0x333c42:0x6b2922);if(i%2===0)car(7.7,-32-i*31,0x77736a);}



/* Living street layer: restrained pedestrians, animated storefront displays and practical light breathing. */
const streetActors=[];
const displayMaterials=[];
const pedestrianMaterials={
 coat:new THREE.MeshStandardMaterial({color:0x34383a,roughness:.94}),
 coatAlt:new THREE.MeshStandardMaterial({color:0x59463b,roughness:.92}),
 skin:new THREE.MeshStandardMaterial({color:0x9a7158,roughness:.95}),
 trousers:new THREE.MeshStandardMaterial({color:0x202326,roughness:.96}),
 shoes:new THREE.MeshStandardMaterial({color:0x17191a,roughness:.8})
};
function pedestrian(x,z,index){
 const actor=new THREE.Group();actor.position.set(x,0,z);
 const coat=index%2?pedestrianMaterials.coatAlt:pedestrianMaterials.coat;
 const torso=new THREE.Mesh(new THREE.CapsuleGeometry(.23,.62,3,7),coat);torso.position.y=1.12;torso.castShadow=true;actor.add(torso);
 const head=new THREE.Mesh(new THREE.SphereGeometry(.17,10,8),pedestrianMaterials.skin);head.position.y=1.72;head.castShadow=true;actor.add(head);
 const legs=[];
 for(const dx of [-.13,.13]){
  const leg=new THREE.Mesh(new THREE.CapsuleGeometry(.085,.48,2,6),pedestrianMaterials.trousers);leg.position.set(dx,.48,0);leg.castShadow=true;actor.add(leg);legs.push(leg);
  const shoe=new THREE.Mesh(new THREE.BoxGeometry(.16,.09,.29),pedestrianMaterials.shoes);shoe.position.set(dx,.12,-.055);actor.add(shoe);
 }
 scene.add(actor);streetActors.push({actor,legs,baseZ:z,phase:index*1.7,speed:.65+index%3*.12,side:x<0?-1:1});
}
for(let i=0;i<8;i++){
 pedestrian(i%2?-5.55:5.55,-14-i*27,i);
}
scene.traverse(object=>{
 if(object.isMesh&&object.material&&object.material.emissive&&object.material.emissiveIntensity>.55)displayMaterials.push(object.material);
});

// Lightweight 3D rain streaks add depth beyond the existing 2D screen rain.
const rainCount=520;
const rainPositions=new Float32Array(rainCount*6);
for(let i=0;i<rainCount;i++){
 const x=(Math.random()-.5)*24,y=Math.random()*18,z=-Math.random()*streetLength;
 const k=i*6;rainPositions[k]=x;rainPositions[k+1]=y;rainPositions[k+2]=z;
 rainPositions[k+3]=x-.08;rainPositions[k+4]=y-.62;rainPositions[k+5]=z-.04;
}
const rainGeometry=new THREE.BufferGeometry();
rainGeometry.setAttribute('position',new THREE.BufferAttribute(rainPositions,3));
const rainLines=new THREE.LineSegments(rainGeometry,new THREE.LineBasicMaterial({color:0x9bb6c7,transparent:true,opacity:.28}));
scene.add(rainLines);
function updateRain(){
 const p=rainGeometry.attributes.position.array;
 for(let i=0;i<rainCount;i++){
  const k=i*6;p[k+1]-=.34;p[k+4]-=.34;p[k+2]+=.015;p[k+5]+=.015;
  if(p[k+1]<-.5){const x=(Math.random()-.5)*24,y=12+Math.random()*7,z=-Math.random()*streetLength;p[k]=x;p[k+1]=y;p[k+2]=z;p[k+3]=x-.08;p[k+4]=y-.62;p[k+5]=z-.04;}
 }
 rainGeometry.attributes.position.needsUpdate=true;
}
const interiorUI=document.createElement('div');
interiorUI.id='interior-ui';
interiorUI.innerHTML='<div class="interior-card" role="dialog" aria-modal="true" aria-labelledby="interior-title"><div class="interior-kicker">200BLOCK · PRIVATE VIEWING</div><h2 id="interior-title">Storefront</h2><p id="interior-description">Step inside and explore this part of the 200Block creative collective.</p><div id="interior-links" class="interior-actions" aria-label="Featured content"></div><div class="interior-actions"><button type="button" id="interior-explore">Explore full section</button><button type="button" class="secondary" id="interior-exit">Return to street</button></div></div>';
document.body.appendChild(interiorUI);
const interiorCopy=[
 'A welcoming production-house lobby with a reception desk, brand wall and project displays.',
 'A private screening room with tiered seating and a large projection wall.',
 'A cinema gallery for featured films, posters, reels and the stories behind each production.',
 'A glowing arcade of short-form clips, highlights and playable video moments.',
 'A production room for upcoming projects, storyboards, treatments and development.',
 'A neighborhood record shop celebrating the 200Block archive and its creative releases.',
 'A working production studio with editing monitors, camera equipment and lighting.',
 'A warm front desk for consultations, collaborations and new business inquiries.'
];
const interiorState={active:false,transition:null,storeId:null};
let activeInteriorLight=null;
const interiorLight=new THREE.PointLight(0xffc58b,0,16,2);scene.add(interiorLight);
function worldPoint(group,x,y,z){return group.localToWorld(new THREE.Vector3(x,y,z));}
function beginCameraTransition(points,duration,onComplete){
 interiorState.transition={start:performance.now(),duration,points:points.map(p=>({pos:p.pos.clone(),look:p.look.clone()})),onComplete};
}
function openInterior(data){
 if(interiorState.active||interiorState.transition)return;
 const group=data.storeGroup,index=data.storeIndex;
 if(!group)return;
 interiorState.active=true;interiorState.storeId=data.storeId;window.__200blockInteriorOpen=true;
 const outside=worldPoint(group,data.doorX,2.35,11.5);
 const threshold=worldPoint(group,data.doorX,2.35,1.45);
 const inside=worldPoint(group,0,2.45,-1.55);
 const lookOutside=worldPoint(group,0,2.5,-1.8);
 const lookInside=worldPoint(group,0,2.55,-7.2);
 const fromPos=camera.position.clone(),fromLook=new THREE.Vector3();
 camera.getWorldDirection(fromLook);fromLook.multiplyScalar(12).add(camera.position);
 beginCameraTransition([
  {pos:fromPos,look:fromLook},
  {pos:outside,look:lookOutside},
  {pos:threshold,look:lookInside},
  {pos:inside,look:lookInside}
 ],1900,()=>{
  interiorLight.position.copy(worldPoint(group,0,4.1,-4.6));interiorLight.intensity=28;activeInteriorLight=interiorLight;
 });
 document.getElementById('interior-title').textContent=storeNames[index];
 document.getElementById('interior-description').textContent=interiorCopy[index];
 const links=document.getElementById('interior-links');links.replaceChildren();
 const sectionId=['home','featured','top-films','highlights','upcoming','archive','consultations','contact'][index];
 const section=document.getElementById(sectionId);
 if(section){
  const candidates=[...section.querySelectorAll('a[href]')].filter(a=>a.href&&!a.href.endsWith('#')&&!a.closest('#nav'));
  const unique=[...new Map(candidates.map(a=>[a.href,a])).values()].slice(0,4);
  unique.forEach((a,n)=>{const button=document.createElement('button');button.type='button';button.textContent=(a.textContent||a.getAttribute('aria-label')||'Explore content').trim().replace(/\\s+/g,' ').slice(0,48)||'Explore content';button.addEventListener('click',()=>{const floor=a.dataset.floor;closeInterior(()=>{if(floor){document.querySelector('a[data-floor="'+floor+'"]')?.click();}else{window.open(a.href,'_blank','noopener');}});});links.appendChild(button);});
 }
 interiorUI.classList.add('visible');
}
function closeInterior(after){
 if(!interiorState.active||interiorState.transition)return;
 const data=interactive.find(o=>o.userData.storeId===interiorState.storeId);
 if(!data){interiorState.active=false;window.__200blockInteriorOpen=false;interiorUI.classList.remove('visible');return;}
 const group=data.userData.storeGroup;
 const outside=worldPoint(group,data.userData.doorX,2.35,11.5);
 const look=worldPoint(group,0,2.5,20);
 const fromPos=camera.position.clone(),fromLook=new THREE.Vector3();camera.getWorldDirection(fromLook);fromLook.multiplyScalar(12).add(camera.position);
 beginCameraTransition([{pos:fromPos,look:fromLook},{pos:worldPoint(group,data.userData.doorX,2.4,1.5),look},{pos:outside,look:worldPoint(group,0,2.4,20)}],1250,()=>{
  interiorState.active=false;interiorState.storeId=null;window.__200blockInteriorOpen=false;interiorUI.classList.remove('visible');
  interiorLight.intensity=0;activeInteriorLight=null;
  if(after)after();
 });
}
renderer.domElement.tabIndex=0;renderer.domElement.setAttribute('aria-label','Interactive 3D New York street with clickable storefronts');
document.getElementById('interior-exit').addEventListener('click',()=>closeInterior());
addEventListener('keydown',e=>{if(e.key==='Escape'&&interiorState.active)closeInterior();});
document.getElementById('interior-explore').addEventListener('click',()=>{
 const id=interiorState.storeId;
 closeInterior(()=>{const link=document.querySelector('a[data-floor="'+id+'"]');if(link)link.click();});
});

// Click / hover signs open the matching physical interior.
const raycaster=new THREE.Raycaster(), pointer=new THREE.Vector2();
renderer.domElement.addEventListener('pointermove',e=>{
 const r=renderer.domElement.getBoundingClientRect();
 pointer.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);
 raycaster.setFromCamera(pointer,camera);
 const hit=raycaster.intersectObjects(interactive,false)[0];
 renderer.domElement.style.cursor=hit?'pointer':'grab';
});
renderer.domElement.addEventListener('click',e=>{
 const r=renderer.domElement.getBoundingClientRect();
 pointer.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);
 raycaster.setFromCamera(pointer,camera);
 const hit=raycaster.intersectObjects(interactive,false)[0];
 if(hit){openInterior(hit.object.userData);return;}
 const mediaHit=raycaster.intersectObjects(interactiveMedia,false)[0];
 if(mediaHit?.object.userData.youtubeUrl)window.open(mediaHit.object.userData.youtubeUrl,'_blank','noopener');
});

// Camera progress is driven by the existing site's smoothed scroll physics.
const clock=new THREE.Clock();
let targetZ=8, currentZ=8, targetLookX=0, currentLookX=0;
function resize(){camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.65));}
addEventListener('resize',resize);
function animate(){
 requestAnimationFrame(animate);
 const elapsed=clock.getElapsedTime();
 updateRain();
 for(const actor of streetActors){
  actor.actor.position.z=actor.baseZ+Math.sin(elapsed*actor.speed+actor.phase)*.9;
  actor.actor.position.x=actor.side*5.55+Math.sin(elapsed*.55+actor.phase)*.28;
  actor.legs[0].rotation.x=Math.sin(elapsed*actor.speed*3+actor.phase)*.22;
  actor.legs[1].rotation.x=-Math.sin(elapsed*actor.speed*3+actor.phase)*.22;
  actor.actor.rotation.y=actor.side===1?Math.PI:0;
 }
 // Fine rain streaks descend through the scene; reuse one buffer for low overhead.
 const pulse=.82+Math.sin(elapsed*1.4)*.18;
 for(const material of displayMaterials)material.emissiveIntensity=Math.min(2.5,Math.max(.35,pulse));
 if(interiorState.transition){
  const tr=interiorState.transition,t=Math.min(1,(performance.now()-tr.start)/tr.duration);
  const scaled=t*(tr.points.length-1),segment=Math.min(tr.points.length-2,Math.floor(scaled)),local=scaled-segment;
  const eased=local*local*(3-2*local),a=tr.points[segment],b=tr.points[segment+1];
  camera.position.lerpVectors(a.pos,b.pos,eased);
  const look=new THREE.Vector3().lerpVectors(a.look,b.look,eased);camera.lookAt(look);
  if(t>=1){const done=tr.onComplete;interiorState.transition=null;if(done)done();}
 }else if(!interiorState.active){
  const progress=window.__200blockProgress||0;
  targetZ=8-progress*(storeNames.length*29+12);
  currentZ+=(targetZ-currentZ)*.055;
  currentLookX+=(targetLookX-currentLookX)*.05;
  camera.position.set(currentLookX,2.35,currentZ);
  camera.lookAt(currentLookX*.7,2.9,currentZ-19);
 }
 renderer.render(scene,camera);
}
animate();
}