(() => {
  const ready = () => typeof window.THREE !== 'undefined';
  const ease = (current, target, amt) => current + (target - current) * amt;

  function containerTexture(text, bg) {
    const c = document.createElement('canvas');
    c.width = 512; c.height = 256;
    const ctx = c.getContext('2d');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, 512, 256);
    const grad = ctx.createLinearGradient(0, 0, 512, 256);
    grad.addColorStop(0, 'rgba(255,255,255,.2)'); grad.addColorStop(.5, 'rgba(0,0,0,.08)'); grad.addColorStop(1, 'rgba(0,0,0,.28)');
    ctx.fillStyle = grad; ctx.fillRect(0, 0, 512, 256);
    ctx.fillStyle = 'rgba(255,255,255,.12)';
    for (let x = 0; x < 512; x += 36) ctx.fillRect(x, 0, 3, 256);
    ctx.strokeStyle = 'rgba(255,255,255,.22)'; ctx.lineWidth = 7; ctx.strokeRect(14, 14, 484, 228);
    ctx.fillStyle = 'rgba(0,0,0,.24)'; ctx.fillRect(34, 182, 444, 18);
    ctx.fillStyle = 'rgba(255,255,255,.84)'; ctx.font = 'bold 38px Inter, Arial'; ctx.textAlign = 'center'; ctx.fillText(text, 256, 138);
    return new THREE.CanvasTexture(c);
  }
  function containerMesh(w, h, d, color, label = 'EXPORT') {
    const tex = containerTexture(label, color); tex.anisotropy = 8;
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d, 2, 2, 2), new THREE.MeshStandardMaterial({ map: tex, roughness: .68, metalness: .16 }));
    mesh.castShadow = true; mesh.receiveShadow = true; return mesh;
  }
  function beam(w, h, d, color = 0x153149) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshStandardMaterial({ color, roughness: .48, metalness: .5 }));
    m.castShadow = true; m.receiveShadow = true; return m;
  }

  function initDockyard() {
    if (!ready()) return;
    const canvas = document.getElementById('dockyard3d');
    const hero = document.querySelector('.hero');
    if (!canvas || !hero) return;
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6)); renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap; renderer.outputEncoding = THREE.sRGBEncoding;
    const scene = new THREE.Scene(); scene.fog = new THREE.FogExp2(0x050c14, .018);
    const camera = new THREE.PerspectiveCamera(38, 1, .1, 260); camera.position.set(22, 14, 36);
    scene.add(new THREE.HemisphereLight(0xc8e5ff, 0x061018, .68));
    const key = new THREE.DirectionalLight(0xffdf93, 1.8); key.position.set(-18, 28, 18); key.castShadow = true; key.shadow.mapSize.set(1536, 1536); scene.add(key);
    const sodium = new THREE.PointLight(0xd4af37, 1.25, 78); sodium.position.set(-10, 7, 8); scene.add(sodium);
    const blue = new THREE.PointLight(0x3b9dff, .9, 90); blue.position.set(24, 8, -18); scene.add(blue);

    const ground = new THREE.Mesh(new THREE.PlaneGeometry(170, 104, 24, 24), new THREE.MeshStandardMaterial({ color: 0x07111b, roughness: .9, metalness: .2 }));
    ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);
    const waterGeo = new THREE.PlaneGeometry(170, 52, 80, 16);
    const water = new THREE.Mesh(waterGeo, new THREE.MeshStandardMaterial({ color: 0x092032, roughness: .32, metalness: .45, transparent: true, opacity: .82 }));
    water.rotation.x = -Math.PI / 2; water.position.set(0, .02, -29); scene.add(water);
    const waterBase = Array.from(waterGeo.attributes.position.array);

    const palette = ['#17384f', '#8a661f', '#1f5a48', '#6c352e', '#25485f'];
    for (let row = 0; row < 6; row++) for (let col = 0; col < 8; col++) {
      const height = 1 + ((row * 2 + col) % 4);
      for (let level = 0; level < height; level++) {
        const m = containerMesh(3.35, 1.25, 1.35, palette[(row + col + level) % palette.length], level ? 'MFL' : 'EXPORT');
        m.position.set(-22 + col * 3.85, .63 + level * 1.31, -9 + row * 2.05);
        m.rotation.y = (Math.random() - .5) * .025; scene.add(m);
      }
    }

    const ship = new THREE.Group();
    const hull = beam(42, 2.4, 8.2, 0x081523); hull.scale.x = 1; ship.add(hull);
    const deck = beam(31, 1.25, 6.6, 0x102b3d); deck.position.y = 1.55; ship.add(deck);
    for (let i = 0; i < 10; i++) { const m = containerMesh(2.55, 1.02, 1.25, palette[i % palette.length], 'LOAD'); m.position.set(-13.5 + i * 3, 2.7, 0); ship.add(m); }
    ship.position.set(8, 1.2, -30); scene.add(ship);

    function crane(x, z, scale = 1) {
      const g = new THREE.Group();
      [[-4.2,0],[4.2,0],[-2.8,-3.4],[2.8,-3.4]].forEach(([lx,lz]) => { const leg = beam(.42*scale, 12.2*scale, .42*scale); leg.position.set(lx*scale, 6.1*scale, lz*scale); leg.rotation.z = lx < 0 ? .12 : -.12; g.add(leg); });
      const top = beam(18.5*scale, .55*scale, .7*scale); top.position.set(0, 12.6*scale, -1.7*scale); g.add(top);
      const boom = beam(25*scale, .34*scale, .45*scale); boom.position.set(8.2*scale, 13.15*scale, -1.7*scale); boom.rotation.z = -.07; g.add(boom);
      const trolley = beam(1.15*scale, .82*scale, 1.05*scale, 0xd4af37); trolley.position.set(0, 12.15*scale, -1.7*scale); g.add(trolley);
      const cable = new THREE.Mesh(new THREE.CylinderGeometry(.032*scale, .032*scale, 6*scale, 10), new THREE.MeshStandardMaterial({ color: 0xd4af37, roughness: .35, metalness: .5 })); cable.position.set(0, 8.9*scale, -1.7*scale); g.add(cable);
      const load = containerMesh(4.1*scale, 1.15*scale, 1.55*scale, '#8a661f', 'LIFT'); load.position.set(0, 5.65*scale, -1.7*scale); g.add(load);
      g.position.set(x, 0, z); scene.add(g); return { trolley, cable, load, scale, velocity: 0, swing: 0 };
    }
    const cranes = [crane(-9, -7, 1.1), crane(22, -12, .85)];

    const truck = new THREE.Group();
    const cab = beam(2.2, 1.7, 1.8, 0xd4af37); cab.position.set(-2.7, 1, 0); truck.add(cab);
    const trailer = beam(5.9, .58, 1.9, 0x192f42); trailer.position.set(1.8, .74, 0); truck.add(trailer);
    const truckLoad = containerMesh(4.6, 1.15, 1.8, '#1f5a48', 'MFL'); truckLoad.position.set(1.8, 1.55, 0); truck.add(truckLoad);
    [-3.1,-1.8,2.6,3.8].forEach(wx => { const w = new THREE.Mesh(new THREE.CylinderGeometry(.45,.45,.35,24), new THREE.MeshStandardMaterial({ color:0x02060a, roughness:.5 })); w.rotation.z = Math.PI/2; w.position.set(wx,.35,1.08); truck.add(w); }); truck.position.set(-34,0,8); scene.add(truck);

    const clock = new THREE.Clock();
    function resize(){ const r = hero.getBoundingClientRect(); renderer.setSize(Math.max(1,r.width),Math.max(1,r.height),false); camera.aspect = r.width/Math.max(1,r.height); camera.updateProjectionMatrix(); }
    resize(); window.addEventListener('resize', resize);
    function tick(){
      const t = clock.getElapsedTime(), dt = Math.min(clock.getDelta(), .033);
      const pos = waterGeo.attributes.position;
      for(let i=0;i<pos.count;i++){ const ix=i*3,x=waterBase[ix],z=waterBase[ix+1]; pos.array[ix+2]=Math.sin(x*.25+t*1.6)*.16+Math.sin(z*.32+t*1.05)*.13; }
      pos.needsUpdate = true;
      ship.position.y = 1.15 + Math.sin(t*.95)*.24; ship.rotation.z = Math.sin(t*.78)*.015;
      truck.position.x = ((t*4.1)%72)-38; truck.rotation.y = Math.sin(t*1.9)*.008;
      cranes.forEach((c,idx)=>{ const phase=t*.62+idx*1.65, target=Math.sin(phase)*5.9*c.scale; c.velocity += (target-c.trolley.position.x)*dt*3.2; c.velocity *= .92; const travel=c.trolley.position.x+c.velocity; const lift=1.2+(Math.sin(phase+Math.PI/3)+1)*1.45; c.swing=ease(c.swing,c.velocity*.08,.08); c.trolley.position.x=travel; c.cable.position.x=travel+Math.sin(phase*1.6)*.16; c.cable.position.y=(8.9+lift*.22)*c.scale; c.cable.scale.y=1+lift*.07; c.load.position.x=travel+Math.sin(phase*1.6)*.38; c.load.position.y=(5.65+lift)*c.scale; c.load.rotation.z=c.swing; });
      camera.position.x=22+Math.sin(t*.16)*2.2; camera.position.y=14+Math.sin(t*.21)*.7; camera.lookAt(0,3.1,-7); renderer.render(scene,camera); requestAnimationFrame(tick);
    }
    tick();
  }

  function globeTexture(){ const c=document.createElement('canvas'); c.width=1536; c.height=768; const ctx=c.getContext('2d'); const g=ctx.createLinearGradient(0,0,1536,768); g.addColorStop(0,'#061529'); g.addColorStop(.48,'#123654'); g.addColorStop(1,'#030b14'); ctx.fillStyle=g; ctx.fillRect(0,0,1536,768); ctx.strokeStyle='rgba(212,175,55,.16)'; for(let x=0;x<=1536;x+=96){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,768);ctx.stroke()} for(let y=0;y<=768;y+=96){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(1536,y);ctx.stroke()} ctx.fillStyle='rgba(200,164,61,.42)'; [[960,314,115,45],[800,350,145,55],[720,260,132,42],[450,330,165,64],[1110,370,190,65],[300,230,135,52],[1250,270,105,42]].forEach(([x,y,w,h])=>{ctx.beginPath();ctx.ellipse(x,y,w,h,-.25,0,Math.PI*2);ctx.fill()}); return new THREE.CanvasTexture(c); }
  function ll(lat,lng,r){ const phi=(90-lat)*Math.PI/180, theta=(lng+180)*Math.PI/180; return new THREE.Vector3(-r*Math.sin(phi)*Math.cos(theta), r*Math.cos(phi), r*Math.sin(phi)*Math.sin(theta)); }
  function initGlobe(){
    if(!ready())return; const canvas=document.getElementById('outreachGlobe'), panel=document.querySelector('.globe-card'); if(!canvas||!panel)return;
    const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true}); renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.7));
    const scene=new THREE.Scene(), camera=new THREE.PerspectiveCamera(38,1,.1,100); camera.position.set(0,0,12.5); scene.add(new THREE.AmbientLight(0x9ecfff,.58)); const light=new THREE.PointLight(0xf1d58b,2.25,30); light.position.set(-5,5,8); scene.add(light);
    const globeGroup=new THREE.Group(); scene.add(globeGroup); const globe=new THREE.Mesh(new THREE.SphereGeometry(3.2,96,96),new THREE.MeshStandardMaterial({map:globeTexture(),roughness:.7,metalness:.05})); globeGroup.add(globe); const atmosphere=new THREE.Mesh(new THREE.SphereGeometry(3.37,96,96),new THREE.MeshBasicMaterial({color:0x87cefa,transparent:true,opacity:.12,side:THREE.BackSide})); scene.add(atmosphere); const wire=new THREE.Mesh(new THREE.SphereGeometry(3.23,40,40),new THREE.MeshBasicMaterial({color:0xd4af37,wireframe:true,transparent:true,opacity:.075})); globeGroup.add(wire);
    const stops=[{name:'Karachi Hub',lat:24.86,lng:67,hub:true},{name:'Kenya',lat:-1.29,lng:36.82},{name:'Mozambique',lat:-18.66,lng:35.53},{name:'UAE',lat:23.42,lng:53.84},{name:'Thailand',lat:15.87,lng:100.99},{name:'USA',lat:37.09,lng:-95.71},{name:'Canada',lat:56.13,lng:-106.35}], hub=stops[0];
    stops.forEach(s=>{ const marker=new THREE.Mesh(new THREE.SphereGeometry(s.hub?.1:.065,16,16),new THREE.MeshBasicMaterial({color:s.hub?0xffffff:0xd4af37})); marker.position.copy(ll(s.lat,s.lng,3.29)); marker.userData=s; globeGroup.add(marker); });
    stops.slice(1).forEach((s,i)=>{ const a=ll(hub.lat,hub.lng,3.34), b=ll(s.lat,s.lng,3.34), mid=a.clone().add(b).normalize().multiplyScalar(4.45+(i%2)*.35), curve=new THREE.QuadraticBezierCurve3(a,mid,b); globeGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve.getPoints(68)),new THREE.LineBasicMaterial({color:0xd4af37,transparent:true,opacity:.45}))); });
    const labelLayer=panel.querySelector('.globe-label-layer'); const labelEls=[]; if(labelLayer){ stops.forEach(s=>{ const el=document.createElement('span'); el.className='country-label'+(s.hub?' hub':''); el.textContent=s.name; labelLayer.appendChild(el); labelEls.push({el, pos:ll(s.lat,s.lng,3.52)}); }); }
    let targetY=.35, targetX=-.12, drag=false, lx=0, ly=0, auto=true;
    function point(e){ const p=e.touches?e.touches[0]:e; return {x:p.clientX,y:p.clientY}; }
    panel.addEventListener('pointerdown',e=>{drag=true;auto=false;lx=e.clientX;ly=e.clientY;panel.setPointerCapture?.(e.pointerId)}); panel.addEventListener('pointermove',e=>{ if(!drag)return; const dx=e.clientX-lx, dy=e.clientY-ly; targetY+=dx*.008; targetX+=dy*.006; targetX=Math.max(-.85,Math.min(.85,targetX)); lx=e.clientX; ly=e.clientY; }); panel.addEventListener('pointerup',()=>{drag=false;setTimeout(()=>auto=true,1800)}); panel.addEventListener('pointerleave',()=>drag=false);
    panel.addEventListener('touchstart',e=>{drag=true;auto=false;const p=point(e);lx=p.x;ly=p.y},{passive:true}); panel.addEventListener('touchmove',e=>{if(!drag)return;const p=point(e);targetY+=(p.x-lx)*.008;targetX+=(p.y-ly)*.006;targetX=Math.max(-.85,Math.min(.85,targetX));lx=p.x;ly=p.y},{passive:true}); panel.addEventListener('touchend',()=>{drag=false;setTimeout(()=>auto=true,1800)});
    function resize(){ const r=panel.getBoundingClientRect(); renderer.setSize(Math.max(1,r.width),Math.max(1,r.height),false); camera.aspect=r.width/Math.max(1,r.height); camera.updateProjectionMatrix(); }
    resize(); window.addEventListener('resize',resize); const clock=new THREE.Clock(); const v=new THREE.Vector3();
    function tick(){ const t=clock.getElapsedTime(); if(auto)targetY+=.0022; globeGroup.rotation.y=ease(globeGroup.rotation.y,targetY,.08); globeGroup.rotation.x=ease(globeGroup.rotation.x,targetX,.08); wire.rotation.y-=.0018; atmosphere.scale.setScalar(1+Math.sin(t*1.55)*.014); renderer.render(scene,camera); if(labelLayer){ const rect=panel.getBoundingClientRect(); labelEls.forEach(({el,pos})=>{ v.copy(pos).applyEuler(globeGroup.rotation).project(camera); const visible=v.z<1 && pos.clone().applyEuler(globeGroup.rotation).z>-.25; el.style.transform=`translate(${(v.x*.5+.5)*rect.width}px,${(-v.y*.5+.5)*rect.height}px) translate(-50%,-50%)`; el.style.opacity=visible?1:0; }); } requestAnimationFrame(tick); }
    tick();
  }
  window.addEventListener('DOMContentLoaded',()=>{ initDockyard(); initGlobe(); });
})();
