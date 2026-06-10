(() => {
  const ready = () => typeof window.THREE !== 'undefined';

  function containerTexture(text, bg) {
    const c = document.createElement('canvas');
    c.width = 256; c.height = 128;
    const ctx = c.getContext('2d');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, 256, 128);
    ctx.fillStyle = 'rgba(255,255,255,.13)';
    for (let x = 0; x < 256; x += 22) ctx.fillRect(x, 0, 2, 128);
    ctx.strokeStyle = 'rgba(255,255,255,.18)'; ctx.lineWidth = 5; ctx.strokeRect(8, 8, 240, 112);
    ctx.fillStyle = 'rgba(255,255,255,.86)'; ctx.font = 'bold 24px Inter, Arial'; ctx.textAlign = 'center'; ctx.fillText(text, 128, 72);
    return new THREE.CanvasTexture(c);
  }

  function containerMesh(w, h, d, color, label = 'EXPORT') {
    const tex = containerTexture(label, color);
    tex.anisotropy = 4;
    const mat = new THREE.MeshStandardMaterial({ color: 0xffffff, map: tex, roughness: .62, metalness: .08 });
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    mesh.castShadow = true; mesh.receiveShadow = true;
    return mesh;
  }

  function initDockyard() {
    if (!ready()) return;
    const canvas = document.getElementById('dockyard3d');
    const hero = document.querySelector('.hero');
    if (!canvas || !hero) return;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x050c14, 38, 120);
    const camera = new THREE.PerspectiveCamera(42, 1, .1, 240);
    camera.position.set(19, 13, 31);

    scene.add(new THREE.HemisphereLight(0xbad7ff, 0x061018, .72));
    const key = new THREE.DirectionalLight(0xf4d177, 1.6);
    key.position.set(-16, 24, 13); key.castShadow = true; key.shadow.mapSize.set(1024, 1024); scene.add(key);
    const fill = new THREE.PointLight(0x2c91ff, 1.1, 75); fill.position.set(18, 8, -14); scene.add(fill);

    const ground = new THREE.Mesh(new THREE.PlaneGeometry(150, 92, 20, 20), new THREE.MeshStandardMaterial({ color: 0x07111b, roughness: .86, metalness: .12 }));
    ground.rotation.x = -Math.PI / 2; ground.position.y = -.12; ground.receiveShadow = true; scene.add(ground);
    const waterGeo = new THREE.PlaneGeometry(150, 44, 56, 10);
    const water = new THREE.Mesh(waterGeo, new THREE.MeshStandardMaterial({ color: 0x092032, roughness: .44, metalness: .18, transparent: true, opacity: .78 }));
    water.rotation.x = -Math.PI / 2; water.position.set(0, .02, -24); scene.add(water);
    const waterBase = Array.from(waterGeo.attributes.position.array);

    const colors = ['#17384f', '#8a661f', '#1f5a48', '#6c352e', '#25485f'];
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 7; col++) {
        const height = 1 + ((row + col) % 3);
        for (let level = 0; level < height; level++) {
          const m = containerMesh(3.25, 1.28, 1.35, colors[(row + col + level) % colors.length], 'EXPORT');
          m.position.set(-18 + col * 3.7, .65 + level * 1.34, -8 + row * 2.05);
          scene.add(m);
        }
      }
    }

    const ship = new THREE.Group();
    const hull = new THREE.Mesh(new THREE.BoxGeometry(38, 2.4, 7.4), new THREE.MeshStandardMaterial({ color: 0x081523, roughness: .74, metalness: .18 }));
    hull.castShadow = true; ship.add(hull);
    const deck = new THREE.Mesh(new THREE.BoxGeometry(29, 1.25, 6.2), new THREE.MeshStandardMaterial({ color: 0x102b3d, roughness: .66 }));
    deck.position.y = 1.55; ship.add(deck);
    for (let i = 0; i < 9; i++) {
      const m = containerMesh(2.6, 1.05, 1.3, colors[i % colors.length], 'LOAD');
      m.position.set(-12 + i * 3.05, 2.7, 0);
      ship.add(m);
    }
    ship.position.set(5, 1.2, -25.2); scene.add(ship);

    function crane(x, z, scale = 1) {
      const g = new THREE.Group();
      const metal = new THREE.MeshStandardMaterial({ color: 0x143149, roughness: .55, metalness: .42 });
      const gold = new THREE.MeshStandardMaterial({ color: 0xd4af37, roughness: .35, metalness: .36 });
      [[-4, 0], [4, 0], [-2.7, -3.3], [2.7, -3.3]].forEach(([lx, lz]) => {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(.45 * scale, 12 * scale, .45 * scale), metal);
        leg.position.set(lx * scale, 6 * scale, lz * scale); leg.rotation.z = lx < 0 ? .13 : -.13; leg.castShadow = true; g.add(leg);
      });
      const beam = new THREE.Mesh(new THREE.BoxGeometry(18 * scale, .55 * scale, .62 * scale), metal);
      beam.position.set(0, 12.5 * scale, -1.7 * scale); g.add(beam);
      const boom = new THREE.Mesh(new THREE.BoxGeometry(24 * scale, .38 * scale, .44 * scale), metal);
      boom.position.set(8 * scale, 13.05 * scale, -1.7 * scale); boom.rotation.z = -.08; g.add(boom);
      const trolley = new THREE.Mesh(new THREE.BoxGeometry(1.2 * scale, .85 * scale, 1.1 * scale), gold);
      trolley.position.set(0, 12.1 * scale, -1.7 * scale); g.add(trolley);
      const cable = new THREE.Mesh(new THREE.CylinderGeometry(.035 * scale, .035 * scale, 6 * scale, 8), gold);
      cable.position.set(0, 8.9 * scale, -1.7 * scale); g.add(cable);
      const load = containerMesh(4.1 * scale, 1.15 * scale, 1.55 * scale, '#8a661f', 'LIFT');
      load.position.set(0, 5.65 * scale, -1.7 * scale); g.add(load);
      g.position.set(x, 0, z); scene.add(g);
      return { trolley, cable, load, scale };
    }
    const cranes = [crane(-8, -6, 1.08), crane(19, -10, .82)];

    const truck = new THREE.Group();
    const cab = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.7, 1.8), new THREE.MeshStandardMaterial({ color: 0xd4af37, roughness: .5 })); cab.position.set(-2.6, 1, 0); truck.add(cab);
    const trailer = new THREE.Mesh(new THREE.BoxGeometry(5.6, .6, 1.9), new THREE.MeshStandardMaterial({ color: 0x192f42, roughness: .62 })); trailer.position.set(1.7, .74, 0); truck.add(trailer);
    const truckLoad = containerMesh(4.4, 1.15, 1.8, '#1f5a48', 'MFL'); truckLoad.position.set(1.7, 1.55, 0); truck.add(truckLoad);
    [-3.1, -1.8, 2.5, 3.7].forEach(wx => { const w = new THREE.Mesh(new THREE.CylinderGeometry(.45, .45, .35, 24), new THREE.MeshStandardMaterial({ color: 0x02060a, roughness: .5 })); w.rotation.z = Math.PI / 2; w.position.set(wx, .35, 1.08); truck.add(w); });
    truck.position.set(-30, 0, 7.5); scene.add(truck);

    const clock = new THREE.Clock();
    function resize() {
      const r = hero.getBoundingClientRect();
      renderer.setSize(Math.max(1, r.width), Math.max(1, r.height), false);
      camera.aspect = r.width / Math.max(1, r.height); camera.updateProjectionMatrix();
    }
    resize(); window.addEventListener('resize', resize);

    function tick() {
      const t = clock.getElapsedTime();
      const pos = waterGeo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const ix = i * 3, x = waterBase[ix], z = waterBase[ix + 1];
        pos.array[ix + 2] = Math.sin(x * .25 + t * 1.8) * .18 + Math.sin(z * .35 + t * 1.1) * .12;
      }
      pos.needsUpdate = true;
      ship.position.y = 1.15 + Math.sin(t * 1.05) * .28;
      ship.rotation.z = Math.sin(t * .8) * .018;
      truck.position.x = ((t * 4.4) % 64) - 34;
      cranes.forEach((c, idx) => {
        const phase = t * .72 + idx * 1.7;
        const travel = Math.sin(phase) * 5.7 * c.scale;
        const lift = 1.2 + (Math.sin(phase + Math.PI / 3) + 1) * 1.55;
        const swing = Math.sin(phase * 2.15) * .14 * (1 + Math.cos(phase) * .18);
        c.trolley.position.x = travel;
        c.cable.position.x = travel + Math.sin(phase * 1.8) * .22;
        c.cable.position.y = (8.8 + lift * .24) * c.scale;
        c.cable.scale.y = 1 + lift * .08;
        c.load.position.x = travel + Math.sin(phase * 1.8) * .48;
        c.load.position.y = (5.6 + lift) * c.scale;
        c.load.rotation.z = swing;
      });
      camera.position.x = 19 + Math.sin(t * .18) * 2.3;
      camera.position.y = 13 + Math.sin(t * .23) * .8;
      camera.lookAt(0, 3.2, -5);
      renderer.render(scene, camera);
      requestAnimationFrame(tick);
    }
    tick();
  }

  function globeTexture() {
    const c = document.createElement('canvas'); c.width = 1024; c.height = 512;
    const ctx = c.getContext('2d');
    const g = ctx.createLinearGradient(0, 0, 1024, 512); g.addColorStop(0, '#0a2035'); g.addColorStop(.5, '#133a56'); g.addColorStop(1, '#06111d');
    ctx.fillStyle = g; ctx.fillRect(0, 0, 1024, 512);
    ctx.strokeStyle = 'rgba(212,175,55,.18)'; ctx.lineWidth = 1;
    for (let x = 0; x <= 1024; x += 64) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 512); ctx.stroke(); }
    for (let y = 0; y <= 512; y += 64) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(1024, y); ctx.stroke(); }
    ctx.fillStyle = 'rgba(212,175,55,.34)';
    [[650,210,75,30],[535,235,95,38],[480,172,88,28],[300,220,110,42],[740,250,130,42],[200,152,90,34],[835,180,68,28]].forEach(([x,y,w,h]) => { ctx.beginPath(); ctx.ellipse(x, y, w, h, -.25, 0, Math.PI * 2); ctx.fill(); });
    return new THREE.CanvasTexture(c);
  }
  function ll(lat, lng, r) {
    const phi = (90 - lat) * Math.PI / 180, theta = (lng + 180) * Math.PI / 180;
    return new THREE.Vector3(-r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta));
  }
  function initGlobe() {
    if (!ready()) return;
    const canvas = document.getElementById('outreachGlobe'), panel = document.querySelector('.globe-card');
    if (!canvas || !panel) return;
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, .1, 100); camera.position.set(0, 0, 12.5);
    scene.add(new THREE.AmbientLight(0x9ecfff, .6));
    const light = new THREE.PointLight(0xf1d58b, 2.2, 30); light.position.set(-5, 5, 8); scene.add(light);
    const globe = new THREE.Mesh(new THREE.SphereGeometry(3.2, 64, 64), new THREE.MeshStandardMaterial({ map: globeTexture(), roughness: .72, metalness: .05 })); scene.add(globe);
    const atmosphere = new THREE.Mesh(new THREE.SphereGeometry(3.34, 64, 64), new THREE.MeshBasicMaterial({ color: 0x87cefa, transparent: true, opacity: .12, side: THREE.BackSide })); scene.add(atmosphere);
    const wire = new THREE.Mesh(new THREE.SphereGeometry(3.23, 32, 32), new THREE.MeshBasicMaterial({ color: 0xd4af37, wireframe: true, transparent: true, opacity: .08 })); scene.add(wire);
    const stops = [{name:'Karachi',lat:24.86,lng:67,hub:true},{name:'Kenya',lat:-1.29,lng:36.82},{name:'Mozambique',lat:-18.66,lng:35.53},{name:'UAE',lat:23.42,lng:53.84},{name:'Thailand',lat:15.87,lng:100.99},{name:'USA',lat:37.09,lng:-95.71},{name:'Canada',lat:56.13,lng:-106.35}], hub = stops[0];
    stops.forEach(s => { const m = new THREE.Mesh(new THREE.SphereGeometry(s.hub ? .09 : .06, 16, 16), new THREE.MeshBasicMaterial({ color: s.hub ? 0xffffff : 0xd4af37 })); m.position.copy(ll(s.lat, s.lng, 3.28)); globe.add(m); });
    stops.slice(1).forEach((s, i) => { const a = ll(hub.lat, hub.lng, 3.34), b = ll(s.lat, s.lng, 3.34), mid = a.clone().add(b).normalize().multiplyScalar(4.45 + (i % 2) * .35), curve = new THREE.QuadraticBezierCurve3(a, mid, b), geo = new THREE.BufferGeometry().setFromPoints(curve.getPoints(60)); globe.add(new THREE.Line(geo, new THREE.LineBasicMaterial({ color: 0xd4af37, transparent: true, opacity: .44 }))); });
    const clock = new THREE.Clock();
    function resize() { const r = panel.getBoundingClientRect(); renderer.setSize(Math.max(1, r.width), Math.max(1, r.height), false); camera.aspect = r.width / Math.max(1, r.height); camera.updateProjectionMatrix(); }
    resize(); window.addEventListener('resize', resize);
    function tick() { const t = clock.getElapsedTime(); globe.rotation.y = t * .22; globe.rotation.x = Math.sin(t * .27) * .08; wire.rotation.y = -t * .1; atmosphere.scale.setScalar(1 + Math.sin(t * 1.6) * .015); renderer.render(scene, camera); requestAnimationFrame(tick); }
    tick();
  }
  window.addEventListener('DOMContentLoaded', () => { initDockyard(); initGlobe(); });
})();
