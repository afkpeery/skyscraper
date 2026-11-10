import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

/* 200Block: procedural, real-time 3D New York street. */
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xaebdc4);
scene.fog = new THREE.Fog(0xaebdc4, 42, 245);

const camera = new THREE.PerspectiveCamera(74, innerWidth / innerHeight, .1, 420);
camera.position.set(0, 2.35, 8);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
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
const brickMat = new THREE.MeshStandardMaterial({map:brickMap,roughness:.94});
const concreteMat = new THREE.MeshStandardMaterial({map:concreteMap,roughness:.96});
const asphaltMat = new THREE.MeshStandardMaterial({map:asphaltMap,roughness:.92});
const darkMetal = new THREE.MeshStandardMaterial({color:0x242729,metalness:.72,roughness:.48});
const glassMat = new THREE.MeshPhysicalMaterial({color:0x8ca9b5,metalness:.34,roughness:.13,transparent:true,opacity:.48,reflectivity:.9});
const trimMat = new THREE.MeshStandardMaterial({color:0x282522,metalness:.3,roughness:.62});
const brassMat = new THREE.MeshStandardMaterial({color:0xb79a69,metalness:.72,roughness:.3});

function box(parent,w,h,d,mat,x,y,z,cast=true){
  const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);
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
function createStore(index, side){
 const group=new THREE.Group();
 const z=-13-index*29;
 const x=side*11.7;
 group.position.set(x,0,z);
 group.rotation.y=side===-1?Math.PI/2:-Math.PI/2;
 const face=side===-1?1:-1;
 // Older masonry upper stories and ground-floor commercial frontage
 const height=17+(index%3)*2.4;
 box(group,9.5,height,3.8,brickMat,0,height/2,-.15);
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
 box(group,3.35,2.8,.06,litWindow,winX,2.02,2.08);
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
 // Projecting shop sign, individual clickable object
 const hit=box(group,6.05,1.05,.95,new THREE.MeshBasicMaterial({transparent:true,opacity:0}),0,6.95,2.2,false);
 hit.userData.storeId=storeIds[index];hit.userData.storeName=storeNames[index];interactive.push(hit);
 hit.userData.label=storeNames[index];
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
 scene.add(g);
}
for(let i=0;i<8;i++){car(-7.7,-20-i*29,i%2?0x333c42:0x6b2922);if(i%2===0)car(7.7,-32-i*31,0x77736a);}

// Click / hover signs navigate into existing portfolio sections.
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
 if(hit){const id=hit.object.userData.storeId;document.querySelector('a[data-floor="'+id+'"]')?.click();}
});

// Camera progress is driven by the existing site's smoothed scroll physics.
const clock=new THREE.Clock();
let targetZ=8, currentZ=8, targetLookX=0, currentLookX=0;
function resize(){camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.65));}
addEventListener('resize',resize);
function animate(){
 requestAnimationFrame(animate);
 const progress=window.__200blockProgress||0;
 targetZ=8-progress*(storeNames.length*29+12);
 currentZ+=(targetZ-currentZ)*.055;
 currentLookX+=(targetLookX-currentLookX)*.05;
 camera.position.set(currentLookX,2.35,currentZ);
 camera.lookAt(currentLookX*.7,2.9,currentZ-19);
 renderer.render(scene,camera);
}
animate();
