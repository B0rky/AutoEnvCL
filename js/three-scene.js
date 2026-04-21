/**
 * AutoEnvCL — Cartoon Robot 3D Scene
 * Robot cuadrado estilo animación 3D con paleta cian
 * Brazos y piernas se abren al scrollear → revela UI interna
 */

class BrainScene {          // nombre interno mantenido para compatibilidad
  constructor(canvasId) {
    this.canvas         = document.getElementById(canvasId);
    this.scrollProgress = 0;
    this.time           = 0;
    this.mouse          = { x: 0, y: 0 };
    this.isVisible      = true;
    this.splitAmount    = 0;   // 0 = cerrado, 1 = abierto
    this.blinkTimer     = 0;
    this.eyesOpen       = true;

    this.init();
    this.buildRobot();
    this.buildFloatingUI();
    this.buildStarField();
    this.bindEvents();
    this.animate();
  }

  /* ═══════════════════════════════════════════════════
     INIT — Renderer + Escena + Cámara + Luces
  ═══════════════════════════════════════════════════ */
  init() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas, antialias: true, alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setClearColor(0x000000, 0);

    this.scene  = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
    this.camera.position.set(0, 0.1, 5.5);

    // Luz principal (top-right) — revela volumen del robot
    const key = new THREE.DirectionalLight(0xDDEEFF, 1.4);
    key.position.set(3, 4, 3);
    this.scene.add(key);

    // Relleno suave (left)
    const fill = new THREE.DirectionalLight(0x001C2A, 0.5);
    fill.position.set(-3, 1, -2);
    this.scene.add(fill);

    // Rim cian (abajo-atrás — contorno neon)
    const rim = new THREE.DirectionalLight(0x00AACC, 0.6);
    rim.position.set(0, -3, -2.5);
    this.scene.add(rim);

    // Ambiente muy oscuro
    this.scene.add(new THREE.AmbientLight(0x000D1A, 1.2));

    // Punto de luz cian suave (anima con el robot)
    this.glowLight = new THREE.PointLight(0x00C8E0, 0.5, 7);
    this.glowLight.position.set(0, 0.5, 3);
    this.scene.add(this.glowLight);
  }

  /* ═══════════════════════════════════════════════════
     MATERIALES
  ═══════════════════════════════════════════════════ */
  mkBodyMat() {
    return new THREE.MeshPhongMaterial({
      color:    new THREE.Color(0x002E42),
      emissive: new THREE.Color(0x001520),
      emissiveIntensity: 0.4,
      specular: new THREE.Color(0x008899),
      shininess: 55
    });
  }

  mkAccentMat() {
    return new THREE.MeshPhongMaterial({
      color:    new THREE.Color(0x004A62),
      emissive: new THREE.Color(0x002233),
      emissiveIntensity: 0.5,
      specular: new THREE.Color(0x00AACC),
      shininess: 80
    });
  }

  mkEyeMat() {
    // Ojos emisivos — brillan cyan
    return new THREE.MeshPhongMaterial({
      color:             new THREE.Color(0x00E5FF),
      emissive:          new THREE.Color(0x00AACC),
      emissiveIntensity: 1.2,
      shininess:         120
    });
  }

  mkGlowMat() {
    // Para detalles que brillan (antena, pecho)
    return new THREE.MeshPhongMaterial({
      color:             new THREE.Color(0x00AACC),
      emissive:          new THREE.Color(0x006688),
      emissiveIntensity: 0.9,
      shininess:         100
    });
  }

  // Añade bordes visibles (estilo cartoon)
  addEdges(mesh, group, opacity = 0.35) {
    const eg  = new THREE.EdgesGeometry(mesh.geometry);
    const em  = new THREE.LineBasicMaterial({
      color: 0x00E5FF, transparent: true, opacity,
      blending: THREE.AdditiveBlending, depthWrite: false
    });
    const ln  = new THREE.LineSegments(eg, em);
    ln.position.copy(mesh.position);
    ln.rotation.copy(mesh.rotation);
    ln.scale.copy(mesh.scale);
    group.add(ln);
    return ln;
  }

  // Crea mesh + bordes y lo añade al grupo
  add(geo, mat, group, x=0, y=0, z=0, rx=0, ry=0, rz=0) {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.rotation.set(rx, ry, rz);
    group.add(m);
    this.addEdges(m, group, 0.30);
    return m;
  }

  /* ═══════════════════════════════════════════════════
     BUILD ROBOT
     centerGroup : cabeza, cuerpo, cuello, antena, cadera
     leftGroup   : hombro izq, brazo izq, pierna izq
     rightGroup  : hombro der, brazo der, pierna der
  ═══════════════════════════════════════════════════ */
  buildRobot() {
    this.robotGroup  = new THREE.Group();
    this.scene.add(this.robotGroup);

    this.centerGroup = new THREE.Group();
    this.leftGroup   = new THREE.Group();
    this.rightGroup  = new THREE.Group();

    this.robotGroup.add(this.centerGroup, this.leftGroup, this.rightGroup);
    this.robotGroup.position.set(1.6, -0.15, 0); // empieza a la derecha (hero)

    const B = this.mkBodyMat.bind(this);
    const A = this.mkAccentMat.bind(this);
    const G = this.mkGlowMat.bind(this);

    /* ── ANTENA ──────────────────────────────────── */
    this.antennaBase = new THREE.Group();
    this.antennaBase.position.set(0, 1.72, 0);
    this.centerGroup.add(this.antennaBase);

    // Palo
    this.add(new THREE.CylinderGeometry(0.020, 0.028, 0.32, 8), A(),
      this.antennaBase, 0, 0.16, 0);
    // Bola (brilla)
    const antBall = new THREE.Mesh(
      new THREE.SphereGeometry(0.060, 10, 10), this.mkEyeMat());
    antBall.position.set(0, 0.36, 0);
    this.antennaBase.add(antBall);
    this.antBall = antBall;

    /* ── CABEZA ──────────────────────────────────── */
    // Proporción cartoon: cabeza grande y cuadrada
    this.headGroup = new THREE.Group();
    this.headGroup.position.set(0, 1.42, 0);
    this.centerGroup.add(this.headGroup);

    // Caja principal
    this.add(new THREE.BoxGeometry(0.74, 0.62, 0.62), B(),
      this.headGroup, 0, 0, 0);

    // Visera frontal (frente del casco)
    this.add(new THREE.BoxGeometry(0.66, 0.30, 0.06), A(),
      this.headGroup, 0, 0.06, 0.32);

    // Orejas (paneles laterales decorativos)
    this.add(new THREE.BoxGeometry(0.06, 0.28, 0.28), A(),
      this.headGroup, -0.40, 0.04, 0);
    this.add(new THREE.BoxGeometry(0.06, 0.28, 0.28), A(),
      this.headGroup,  0.40, 0.04, 0);

    // Orejeras (detalle circular simulado con cilindros)
    const earDetails = [-0.43, 0.43];
    earDetails.forEach(ex => {
      const ed = new THREE.Mesh(
        new THREE.CylinderGeometry(0.06, 0.06, 0.04, 12),
        this.mkGlowMat()
      );
      ed.rotation.z = Math.PI / 2;
      ed.position.set(ex, 0.05, 0);
      this.headGroup.add(ed);
    });

    /* ── OJOS ────────────────────────────────────── */
    this.eyeMats = [];
    [[-0.16, 1.44, 0.31], [0.16, 1.44, 0.31]].forEach(([ex, ey, ez]) => {
      // Marco del ojo
      this.add(new THREE.BoxGeometry(0.165, 0.140, 0.040), A(),
        this.centerGroup, ex, ey, ez);
      // Ojo (emisivo)
      const eyeM = this.mkEyeMat();
      const eye  = new THREE.Mesh(
        new THREE.BoxGeometry(0.120, 0.095, 0.028), eyeM);
      eye.position.set(ex, ey, ez + 0.026);
      this.centerGroup.add(eye);
      this.eyeMats.push(eyeM);
    });

    // Boca (3 puntos led)
    [-0.10, 0, 0.10].forEach(bx => {
      const led = new THREE.Mesh(
        new THREE.BoxGeometry(0.040, 0.040, 0.020),
        this.mkGlowMat()
      );
      led.position.set(bx, 1.24, 0.32);
      this.centerGroup.add(led);
    });

    /* ── CUELLO ──────────────────────────────────── */
    this.add(new THREE.CylinderGeometry(0.10, 0.13, 0.18, 8), A(),
      this.centerGroup, 0, 1.12, 0);

    /* ── CUERPO / TORSO ──────────────────────────── */
    this.add(new THREE.BoxGeometry(0.88, 0.82, 0.56), B(),
      this.centerGroup, 0, 0.65, 0);

    // Panel de pecho (ligeramente saliente)
    this.chestPanel = this.add(
      new THREE.BoxGeometry(0.42, 0.36, 0.06), A(),
      this.centerGroup, 0, 0.72, 0.30);

    // Display del pecho (canvas texture — como un monitor)
    this.buildChestDisplay();

    // Rejillas laterales del torso (detalles)
    [-0.42, 0.42].forEach(sx => {
      this.add(new THREE.BoxGeometry(0.06, 0.60, 0.36), A(),
        this.centerGroup, sx, 0.65, 0);
    });

    /* ── CADERA ──────────────────────────────────── */
    this.add(new THREE.BoxGeometry(0.80, 0.18, 0.50), A(),
      this.centerGroup, 0, 0.22, 0);

    /* ══════════════════════════════════════════════
       GRUPO IZQUIERDO (se mueve a la izquierda al abrir)
    ══════════════════════════════════════════════ */

    /* ── HOMBRO IZQ ──────────────────────────────── */
    const shldrGeoI = new THREE.SphereGeometry(0.115, 10, 10);
    this.add(shldrGeoI, G(), this.leftGroup, -0.56, 0.95, 0);

    /* ── BRAZO IZQ ───────────────────────────────── */
    this.leftArmGroup = new THREE.Group();
    this.leftArmGroup.position.set(-0.63, 0.62, 0);
    this.leftGroup.add(this.leftArmGroup);

    this.add(new THREE.BoxGeometry(0.22, 0.44, 0.22), B(),
      this.leftArmGroup, 0,  0.00, 0);          // brazo superior
    this.add(new THREE.SphereGeometry(0.09, 8, 8), G(),
      this.leftArmGroup, 0, -0.24, 0);          // codo
    this.add(new THREE.BoxGeometry(0.18, 0.36, 0.18), B(),
      this.leftArmGroup, 0, -0.46, 0);          // antebrazo
    this.add(new THREE.BoxGeometry(0.22, 0.18, 0.16), B(),
      this.leftArmGroup, 0, -0.66, 0);          // mano

    /* ── PIERNA IZQ ──────────────────────────────── */
    this.add(new THREE.BoxGeometry(0.24, 0.36, 0.24), B(),
      this.leftGroup, -0.24, -0.12, 0);         // muslo
    this.add(new THREE.BoxGeometry(0.22, 0.10, 0.22), A(),
      this.leftGroup, -0.24, -0.34, 0);         // rodilla
    this.add(new THREE.BoxGeometry(0.20, 0.34, 0.20), B(),
      this.leftGroup, -0.24, -0.54, 0);         // pantorrilla
    this.add(new THREE.BoxGeometry(0.30, 0.12, 0.40), B(),
      this.leftGroup, -0.24, -0.74, 0.06);      // pie

    /* ══════════════════════════════════════════════
       GRUPO DERECHO (se mueve a la derecha al abrir)
    ══════════════════════════════════════════════ */

    /* ── HOMBRO DER ──────────────────────────────── */
    this.add(new THREE.SphereGeometry(0.115, 10, 10), G(),
      this.rightGroup, 0.56, 0.95, 0);

    /* ── BRAZO DER ───────────────────────────────── */
    this.rightArmGroup = new THREE.Group();
    this.rightArmGroup.position.set(0.63, 0.62, 0);
    this.rightGroup.add(this.rightArmGroup);

    this.add(new THREE.BoxGeometry(0.22, 0.44, 0.22), B(),
      this.rightArmGroup, 0,  0.00, 0);
    this.add(new THREE.SphereGeometry(0.09, 8, 8), G(),
      this.rightArmGroup, 0, -0.24, 0);
    this.add(new THREE.BoxGeometry(0.18, 0.36, 0.18), B(),
      this.rightArmGroup, 0, -0.46, 0);
    this.add(new THREE.BoxGeometry(0.22, 0.18, 0.16), B(),
      this.rightArmGroup, 0, -0.66, 0);

    /* ── PIERNA DER ──────────────────────────────── */
    this.add(new THREE.BoxGeometry(0.24, 0.36, 0.24), B(),
      this.rightGroup,  0.24, -0.12, 0);
    this.add(new THREE.BoxGeometry(0.22, 0.10, 0.22), A(),
      this.rightGroup,  0.24, -0.34, 0);
    this.add(new THREE.BoxGeometry(0.20, 0.34, 0.20), B(),
      this.rightGroup,  0.24, -0.54, 0);
    this.add(new THREE.BoxGeometry(0.30, 0.12, 0.40), B(),
      this.rightGroup,  0.24, -0.74, 0.06);
  }

  /* ── Display de pecho (canvas texture) ─────────── */
  buildChestDisplay() {
    const cv  = document.createElement('canvas');
    cv.width  = 256; cv.height = 192;
    const ctx = cv.getContext('2d');

    ctx.fillStyle = 'rgba(0,30,50,0.9)';
    ctx.fillRect(0, 0, 256, 192);

    // Líneas de "señal vital"
    ctx.strokeStyle = '#00AACC';
    ctx.lineWidth   = 1.5;
    ctx.beginPath();
    ctx.moveTo(10, 60);
    [30,40,28,80,28,38,50,38,50,62,56,62,56,40,72,40,72,80,78,80,78,55,88,55,88,65,100,65].forEach((v,i) => {
      if (i % 2 === 0) ctx.lineTo(v, 192/2);
      else ctx.lineTo(v-20, v);
    });
    ctx.stroke();

    // Texto
    ctx.fillStyle = '#00E5FF';
    ctx.font = 'bold 13px monospace';
    ctx.fillText('AUTO ENV CL', 12, 20);
    ctx.fillStyle = '#007799';
    ctx.font = '10px monospace';
    ctx.fillText('AGENT ACTIVE', 12, 36);
    ctx.fillText('CPU: 2%  MEM: 12%', 12, 158);
    ctx.fillText('UPTIME: 99.9%', 12, 174);

    // Barras de estado
    [[12, 115, 'TASK', 0.88], [12, 132, 'NET ', 0.65], [12, 149, 'AI  ', 0.96]].forEach(([x,y,label,pct]) => {
      ctx.fillStyle = '#003344';
      ctx.fillRect(x+34, y-9, 100, 10);
      ctx.fillStyle = '#00AACC';
      ctx.fillRect(x+34, y-9, 100*pct, 10);
      ctx.fillStyle = '#007799';
      ctx.font = '9px monospace';
      ctx.fillText(label, x, y);
    });

    const tex = new THREE.CanvasTexture(cv);
    const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0.9 });
    const disp = new THREE.Mesh(new THREE.PlaneGeometry(0.36, 0.28), mat);
    disp.position.set(0, 0.72, 0.34);
    this.centerGroup.add(disp);
    this.chestTex = tex;
  }

  /* ═══════════════════════════════════════════════════
     UI FLOTANTE — emerge del centro al abrir el robot
  ═══════════════════════════════════════════════════ */
  buildFloatingUI() {
    this.uiGroup  = new THREE.Group();
    this.scene.add(this.uiGroup);
    this.uiSprites = [];

    const makeSprite = (drawFn, w, h, x, y, z) => {
      const cv  = document.createElement('canvas');
      cv.width = w; cv.height = h;
      drawFn(cv.getContext('2d'), w, h);
      const mat = new THREE.SpriteMaterial({
        map: new THREE.CanvasTexture(cv),
        transparent: true, opacity: 0,
        depthWrite: false, blending: THREE.AdditiveBlending
      });
      const sp = new THREE.Sprite(mat);
      sp.position.set(x, y, z);
      sp.userData.homeX  = x;
      sp.userData.homeY  = y;
      sp.userData.startX = 0;
      sp.userData.startY = y * 0.22;
      sp.userData.phase  = Math.random() * Math.PI * 2;
      sp.scale.set(w/130, h/130, 1);
      this.uiGroup.add(sp);
      return sp;
    };

    const chatBubble = (ctx, w, h, msg, sub, isAgent) => {
      ctx.clearRect(0,0,w,h);
      ctx.beginPath(); ctx.roundRect(8,8,w-16,h-16,10);
      ctx.fillStyle   = isAgent ? 'rgba(0,150,190,0.12)' : 'rgba(0,12,25,0.90)';
      ctx.strokeStyle = isAgent ? 'rgba(0,170,210,0.7)'  : 'rgba(0,170,210,0.25)';
      ctx.lineWidth = 1.5; ctx.fill(); ctx.stroke();
      ctx.fillStyle = isAgent ? '#00AACC' : '#607D8B';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText(isAgent ? '🤖 Agente AutoEnvCL' : '👤 Cliente', 20, 28);
      ctx.fillStyle = '#E0F7FA'; ctx.font = '13px sans-serif';
      ctx.fillText(msg, 20, 48);
      if (sub) { ctx.fillStyle='rgba(96,125,139,0.75)'; ctx.font='10px sans-serif'; ctx.fillText(sub,20,66); }
    };

    this.uiSprites.push(makeSprite(
      (c,w,h) => chatBubble(c,w,h,'¿Cuándo llega mi pedido #4821?','hace 2s',false),
      420,82, -2.3,1.0,0.6));
    this.uiSprites.push(makeSprite(
      (c,w,h) => chatBubble(c,w,h,'Llega martes 15. Tracking activo ✓','respondido en 0.4s · sin intervención',true),
      440,82, -2.4,0.15,0.6));
    this.uiSprites.push(makeSprite(
      (c,w,h) => chatBubble(c,w,h,'¿Aplica HACCP en este proceso?','hace 1s',false),
      420,82, -2.2,-0.65,0.5));

    const metric = (ctx,w,h,value,label,delta,col) => {
      ctx.clearRect(0,0,w,h);
      ctx.beginPath(); ctx.roundRect(8,8,w-16,h-16,10);
      ctx.fillStyle='rgba(0,8,20,0.90)'; ctx.strokeStyle=col||'rgba(0,170,204,0.45)';
      ctx.lineWidth=1.5; ctx.fill(); ctx.stroke();
      ctx.fillStyle=col||'#00AACC'; ctx.font='bold 25px sans-serif'; ctx.fillText(value,18,46);
      ctx.fillStyle='#607D8B'; ctx.font='12px sans-serif'; ctx.fillText(label,18,65);
      if (delta){ ctx.fillStyle='#00DD88'; ctx.font='bold 10px sans-serif'; ctx.fillText(delta,18,82); }
    };

    this.uiSprites.push(makeSprite(
      (c,w,h) => metric(c,w,h,'94.8%','Precisión de respuesta','↑ +2.3% este mes'),
      278,98, 2.4,0.9,0.5));
    this.uiSprites.push(makeSprite(
      (c,w,h) => metric(c,w,h,'3,847','Consultas atendidas hoy','↑ sin intervención humana'),
      278,98, 2.3,0.0,0.4));
    this.uiSprites.push(makeSprite(
      (c,w,h) => metric(c,w,h,'CLP $0','Costo por consulta','↓ vs $4.200 con RRHH','rgba(0,210,120,0.88)'),
      278,98, 2.5,-0.95,0.3));

    const appIcon = (ctx,w,h,emoji,name,rgb) => {
      ctx.clearRect(0,0,w,h); const cx=w/2,cy=h/2;
      ctx.beginPath(); ctx.arc(cx,cy,w/2-4,0,Math.PI*2);
      ctx.fillStyle=`rgba(${rgb},0.13)`; ctx.strokeStyle=`rgba(${rgb},0.70)`;
      ctx.lineWidth=1.4; ctx.fill(); ctx.stroke();
      ctx.font=`${w*0.31}px sans-serif`; ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText(emoji,cx,cy-4);
      ctx.fillStyle=`rgba(${rgb},0.88)`; ctx.font=`bold ${w*0.11}px sans-serif`;
      ctx.fillText(name,cx,cy+w*0.27);
    };

    [{e:'💬',n:'WhatsApp',        c:'0,210,80',   x:0.0,  y:1.70},
     {e:'☁️',n:'AWS',            c:'220,140,0',  x:1.20, y:1.00},
     {e:'📧',n:'Gmail',          c:'220,60,60',  x:-1.20,y:1.00},
     {e:'📅',n:'Calendario',     c:'60,120,220', x:1.20, y:-0.90},
     {e:'⏱',n:'24/7',           c:'0,229,255',  x:0.0,  y:-1.70},
     {e:'📁',n:'Docs internos',  c:'150,100,220',x:-1.20,y:-0.90},
    ].forEach((d,i) => {
      const sp = makeSprite((ctx,w,h) => appIcon(ctx,w,h,d.e,d.n,d.c),110,110,d.x,d.y,0.2);
      sp.userData.isIcon=true; sp.userData.orbitAngle=Math.atan2(d.y,d.x);
      sp.userData.orbitR=Math.sqrt(d.x*d.x+d.y*d.y);
      this.uiSprites.push(sp);
    });

    const codeStream = (ctx,w,h) => {
      ctx.clearRect(0,0,w,h); ctx.fillStyle='rgba(0,170,204,0.05)'; ctx.fillRect(0,0,w,h);
      ['{"intent":"order_query","conf":0.98}','agent.invoke(context, tools=[search])',
       'RAG.retrieve(query, k=5, score=0.87)','> Procesando en AWS us-east-1 ...',
       'response.send(channel="whatsapp")','{"status":"ok","latency":"0.43s"}',
      ].forEach((line,i) => {
        ctx.fillStyle=`rgba(0,170,204,${(1-i/6*0.5)*0.88})`;
        ctx.font='11px "Courier New",monospace'; ctx.fillText(line,10,20+i*18);
      });
    };
    const code = makeSprite(codeStream,380,130,0,-1.65,0.4);
    code.material.blending = THREE.NormalBlending;
    this.uiSprites.push(code);

    this.uiSprites.forEach(sp => {
      sp.position.x=sp.userData.startX; sp.position.y=sp.userData.startY;
      sp.material.opacity=0;
    });
  }

  /* ═══════════════════════════════════════════════════
     STAR FIELD
  ═══════════════════════════════════════════════════ */
  buildStarField() {
    const N   = 1000;
    const pos = new Float32Array(N*3);
    const sz  = new Float32Array(N);
    for(let i=0;i<N;i++){
      pos[i*3]=(Math.random()-.5)*50; pos[i*3+1]=(Math.random()-.5)*50;
      pos[i*3+2]=(Math.random()-.5)*25-8; sz[i]=0.8+Math.random()*1.3;
    }
    const geo=new THREE.BufferGeometry();
    geo.setAttribute('position',new THREE.BufferAttribute(pos,3));
    geo.setAttribute('aSize',   new THREE.BufferAttribute(sz,1));
    const mat=new THREE.ShaderMaterial({
      uniforms:{time:{value:0}},
      vertexShader:`attribute float aSize; uniform float time;
        void main(){ vec3 p=position; p.x+=sin(time*.06+p.z)*.025; p.y+=cos(time*.05+p.x)*.025;
          vec4 mv=modelViewMatrix*vec4(p,1.); gl_PointSize=aSize*(200./-mv.z); gl_Position=projectionMatrix*mv; }`,
      fragmentShader:`void main(){float d=distance(gl_PointCoord,vec2(.5));
        gl_FragColor=vec4(0.,.75,.88,smoothstep(.5,.1,d)*.42);}`,
      transparent:true, depthWrite:false, blending:THREE.AdditiveBlending
    });
    this.stars=new THREE.Points(geo,mat);
    this.scene.add(this.stars);
  }

  /* ═══════════════════════════════════════════════════
     EVENTOS
  ═══════════════════════════════════════════════════ */
  bindEvents() {
    window.addEventListener('resize',()=>{
      this.camera.aspect=window.innerWidth/window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth,window.innerHeight);
    });
    window.addEventListener('mousemove',e=>{
      this.mouse.x=(e.clientX/window.innerWidth)*2-1;
      this.mouse.y=-(e.clientY/window.innerHeight)*2+1;
    });
    window.addEventListener('scroll',()=>{
      const max=document.documentElement.scrollHeight-window.innerHeight;
      this.scrollProgress=Math.min(window.scrollY/max,1);
    },{passive:true});
    document.addEventListener('visibilitychange',()=>{ this.isVisible=!document.hidden; });
  }

  ease(t)        { return t<.5?2*t*t:-1+(4-2*t)*t; }
  clamp(v,lo,hi) { return Math.max(0,Math.min(1,(v-lo)/(hi-lo))); }
  lerp(a,b,t)    { return a+(b-a)*t; }

  /* ═══════════════════════════════════════════════════
     LOOP DE ANIMACIÓN
  ═══════════════════════════════════════════════════ */
  animate() {
    requestAnimationFrame(()=>this.animate());
    if(!this.isVisible) return;

    this.time += 0.012;
    const t  = this.time;
    const sp = this.scrollProgress;

    // ── Fases de scroll ──────────────────────────
    // 0.00–0.18 : robot idle, rotación suave
    // 0.18–0.50 : brazos y piernas se abren
    // 0.44–0.72 : UI emerge del centro
    // 0.75–1.00 : UI al frente, robot al fondo
    const openProg = this.ease(this.clamp(sp, 0.18, 0.50));
    const uiProg   = this.ease(this.clamp(sp, 0.44, 0.72));
    const fadeBack = this.clamp(sp, 0.78, 0.95);

    this.splitAmount += (openProg - this.splitAmount) * 0.055;

    // ── Apertura: brazos y piernas se separan ────
    const openX = this.splitAmount * 1.65;
    const openY = this.splitAmount * 0.40;  // piernas bajan ligeramente
    this.leftGroup.position.x  = -openX;
    this.rightGroup.position.x =  openX;
    this.leftGroup.position.y  = -openY;
    this.rightGroup.position.y = -openY;

    // Brazos rotan hacia afuera (como abrir los brazos)
    const armRot = this.splitAmount * 0.55;
    if(this.leftArmGroup)  this.leftArmGroup.rotation.z  =  armRot;
    if(this.rightArmGroup) this.rightArmGroup.rotation.z = -armRot;

    // ── Posición del robot en pantalla ───────────
    const targetX = this.lerp(1.55, -0.25, uiProg);
    const targetY = -0.15 + Math.sin(t * 0.55) * 0.04;
    this.robotGroup.position.x += (targetX - this.robotGroup.position.x) * 0.04;
    this.robotGroup.position.y += (targetY - this.robotGroup.position.y) * 0.04;

    // ── Rotación idle ─────────────────────────────
    const rotSpeed = 0.0014 * (1 - this.splitAmount * 0.9);
    this.robotGroup.rotation.y += rotSpeed;
    // Sigue el mouse suavemente (cabeza)
    if(this.headGroup) {
      this.headGroup.rotation.y += (this.mouse.x * 0.18 - this.headGroup.rotation.y) * 0.06;
      this.headGroup.rotation.x += (this.mouse.y * 0.10 - this.headGroup.rotation.x) * 0.06;
    }
    // Antena balancea
    if(this.antennaBase) {
      this.antennaBase.rotation.z = Math.sin(t * 1.8) * 0.08;
      this.antennaBase.rotation.x = Math.sin(t * 1.3 + 1) * 0.05;
    }

    // ── Parpadeo de ojos ──────────────────────────
    this.blinkTimer += 0.012;
    if(this.blinkTimer > 4.5) {
      // Parpadeo rápido
      const blink = this.blinkTimer - 4.5;
      const open  = blink < 0.08 ? 0 : blink < 0.18 ? 1 : 1;
      this.eyeMats?.forEach(m => { m.emissiveIntensity = open > 0 ? 1.2 : 0; });
      if(blink > 0.25) this.blinkTimer = 0;
    }

    // Pulso suave de ojos (respiración)
    const eyePulse = Math.sin(t * 1.4) * 0.15 + 1.05;
    this.eyeMats?.forEach(m => { m.emissiveIntensity = eyePulse; });
    if(this.antBall) this.antBall.material.emissiveIntensity = 0.8 + Math.sin(t*2)*0.4;

    // ── Luz puntual pulsa con el robot ───────────
    this.glowLight.intensity = 0.42 + Math.sin(t*1.5)*0.10;
    this.glowLight.position.x = this.robotGroup.position.x;

    // ── UI sprites ────────────────────────────────
    this.uiSprites.forEach((sp2,i) => {
      const delay = i * 0.060;
      const local = Math.max(0, uiProg - delay);
      const alpha = Math.min(1, local * 2.8);
      sp2.material.opacity = alpha * (1 - fadeBack * 0.32);

      if(sp2.userData.isIcon) {
        sp2.userData.orbitAngle += 0.0022;
        const r=sp2.userData.orbitR;
        const tx=Math.cos(sp2.userData.orbitAngle)*r;
        const ty=Math.sin(sp2.userData.orbitAngle)*r*0.5;
        sp2.position.x=this.lerp(sp2.userData.startX,tx,Math.min(1,local*1.6));
        sp2.position.y=this.lerp(sp2.userData.startY,ty+Math.sin(t*.5+i)*.045,Math.min(1,local*1.6));
      } else {
        sp2.position.x=this.lerp(sp2.userData.startX,sp2.userData.homeX,Math.min(1,local*1.9));
        sp2.position.y=this.lerp(sp2.userData.startY,
          sp2.userData.homeY+Math.sin(t*.55+sp2.userData.phase)*.048,Math.min(1,local*1.9));
      }
    });

    // ── Estrellas ─────────────────────────────────
    if(this.stars?.material?.uniforms?.time) {
      this.stars.material.uniforms.time.value = t;
      this.stars.rotation.y = t * 0.0018;
    }

    // ── Cámara sigue mouse ────────────────────────
    this.camera.position.x += (this.mouse.x*0.14 - this.camera.position.x)*0.022;
    this.camera.position.y += (this.mouse.y*0.08  - this.camera.position.y)*0.022;
    this.camera.lookAt(0,0,0);

    this.renderer.render(this.scene, this.camera);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.__brainScene = new BrainScene('three-canvas');
});
