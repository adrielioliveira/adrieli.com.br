/* ---------------------------------------------------------
   Formas 3D de "vidro/gelatina" (three.js), inspiradas nos
   blobs translúcidos das referências.
   Uso no HTML:
     <div class="blob3d" data-blob3d="laranja,rosa,azul"
          data-satelite="limao,verde,azul" aria-hidden="true"></div>
   Se o WebGL ou a internet falharem, o CSS mostra uma forma
   plana no lugar (nada quebra).
   --------------------------------------------------------- */
(async () => {
  const alvos = document.querySelectorAll("[data-blob3d]");
  if (!alvos.length) return;

  let THREE;
  try {
    THREE = await import("https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.min.js");
  } catch (e) {
    return; // sem internet: fica a forma em CSS
  }

  const reduzir = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const paleta = {
    laranja: "#FC4D17", rosa: "#FFB7B7", azul: "#9DA7EA", lilas: "#DEDDFC",
    limao: "#EEBE55", amarelo: "#D0C360", roxo: "#383154", verde: "#96AA9F",
    celeste: "#B7D8FF", vermelho: "#FC4D17", menta: "#D7FFE9", vinho: "#6B2137", cobre: "#974320",
  };
  const cores = (txt, padrao) =>
    (txt || padrao).split(",").map((c) => new THREE.Color(paleta[c.trim()] || c.trim()));

  // Ruído simplex 3D (Ashima Arts / Stefan Gustavson, licença MIT)
  const RUIDO = `
  vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
  vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
  vec4 permute(vec4 x){return mod289(((x*34.0)+10.0)*x);}
  vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
  float snoise(vec3 v){
    const vec2 C=vec2(1.0/6.0,1.0/3.0); const vec4 D=vec4(0.0,0.5,1.0,2.0);
    vec3 i=floor(v+dot(v,C.yyy)); vec3 x0=v-i+dot(i,C.xxx);
    vec3 g=step(x0.yzx,x0.xyz); vec3 l=1.0-g; vec3 i1=min(g.xyz,l.zxy); vec3 i2=max(g.xyz,l.zxy);
    vec3 x1=x0-i1+C.xxx; vec3 x2=x0-i2+C.yyy; vec3 x3=x0-D.yyy;
    i=mod289(i);
    vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
    float n_=0.142857142857; vec3 ns=n_*D.wyz-D.xzx;
    vec4 j=p-49.0*floor(p*ns.z*ns.z); vec4 x_=floor(j*ns.z); vec4 y_=floor(j-7.0*x_);
    vec4 x=x_*ns.x+ns.yyyy; vec4 y=y_*ns.x+ns.yyyy; vec4 h=1.0-abs(x)-abs(y);
    vec4 b0=vec4(x.xy,y.xy); vec4 b1=vec4(x.zw,y.zw);
    vec4 s0=floor(b0)*2.0+1.0; vec4 s1=floor(b1)*2.0+1.0; vec4 sh=-step(h,vec4(0.0));
    vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy; vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
    vec3 p0=vec3(a0.xy,h.x); vec3 p1=vec3(a0.zw,h.y); vec3 p2=vec3(a1.xy,h.z); vec3 p3=vec3(a1.zw,h.w);
    vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
    p0*=norm.x; p1*=norm.y; p2*=norm.z; p3*=norm.w;
    vec4 m=max(0.5-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0); m=m*m;
    return 105.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
  }`;

  // Ambiente de reflexo simples (um "estúdio" claro com painéis de luz)
  function ambiente(renderer) {
    const cena = new THREE.Scene();
    const sala = new THREE.Mesh(
      new THREE.BoxGeometry(10, 10, 10),
      new THREE.MeshBasicMaterial({ color: 0xf3eee6, side: THREE.BackSide })
    );
    cena.add(sala);
    const painel = (x, y, z, w, h, cor, ry = 0, rx = 0) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: cor, side: THREE.DoubleSide }));
      m.position.set(x, y, z); m.rotation.set(rx, ry, 0); cena.add(m);
    };
    painel(-3, 3, 4.9, 4, 2, 0xffffff);
    painel(4.9, 1, 0, 3, 5, 0xfff3e0, -Math.PI / 2);
    painel(0, 4.9, 0, 6, 3, 0xffffff, 0, Math.PI / 2);
    painel(-4.9, -1, -1, 2, 3, 0xe9ddff, Math.PI / 2);
    const pmrem = new THREE.PMREMGenerator(renderer);
    const tex = pmrem.fromScene(cena, 0.04).texture;
    pmrem.dispose();
    return tex;
  }

  function criarBlob(c, semente) {
    const uniforms = {
      uTempo: { value: 0 }, uSemente: { value: semente },
      uC1: { value: c[0] }, uC2: { value: c[1] || c[0] }, uC3: { value: c[2] || c[1] || c[0] },
    };
    const mat = new THREE.MeshPhysicalMaterial({
      roughness: 0.36, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.2,
      sheen: 1, sheenRoughness: 0.55, sheenColor: new THREE.Color(0xffffff),
      iridescence: 0.35, iridescenceIOR: 1.3, envMapIntensity: 0.95,
    });
    mat.onBeforeCompile = (s) => {
      Object.assign(s.uniforms, uniforms);
      s.vertexShader = s.vertexShader
        .replace("#include <common>", `#include <common>
          uniform float uTempo; uniform float uSemente; varying vec3 vPosObj;
          ${RUIDO}
          vec3 deformar(vec3 p){
            vec3 n = normalize(p);
            float t = uTempo + uSemente * 10.0;
            float d = snoise(n * 0.62 + vec3(t * 0.12, t * 0.08, uSemente)) * 0.34
                    + snoise(n * 1.3 - vec3(uSemente, t * 0.14, t * 0.06)) * 0.05;
            return n * (1.0 + d);
          }`)
        .replace("#include <beginnormal_vertex>", `
          vec3 pBase = deformar(position);
          vec3 n0 = normalize(position);
          vec3 tang = normalize(abs(n0.y) < 0.99 ? cross(n0, vec3(0.0, 1.0, 0.0)) : cross(n0, vec3(1.0, 0.0, 0.0)));
          vec3 bit = normalize(cross(n0, tang));
          vec3 pT = deformar(position + tang * 0.012);
          vec3 pB = deformar(position + bit * 0.012);
          vec3 objectNormal = normalize(cross(pT - pBase, pB - pBase));
          #ifdef USE_TANGENT
            vec3 objectTangent = vec3(tangent.xyz);
          #endif`)
        .replace("#include <begin_vertex>", "vec3 transformed = pBase; vPosObj = pBase;");
      s.fragmentShader = s.fragmentShader
        .replace("#include <common>", `#include <common>
          uniform float uTempo; uniform vec3 uC1; uniform vec3 uC2; uniform vec3 uC3; varying vec3 vPosObj;`)
        .replace("#include <color_fragment>", `#include <color_fragment>
          float g1 = smoothstep(-1.1, 1.1, vPosObj.y + 0.35 * sin(vPosObj.x * 2.0 + uTempo * 0.3));
          float g2 = smoothstep(-0.9, 1.1, vPosObj.x * 0.8 - vPosObj.z * 0.5);
          vec3 corBlob = mix(uC1, uC2, g1);
          corBlob = mix(corBlob, uC3, g2 * 0.75);
          diffuseColor.rgb = corBlob;`)
        .replace("#include <emissivemap_fragment>", `#include <emissivemap_fragment>
          totalEmissiveRadiance += corBlob * 0.16;`);
    };
    const malha = new THREE.Mesh(new THREE.SphereGeometry(1, 128, 96), mat);
    return { malha, uniforms };
  }

  // posição do ponteiro na janela, de -1 a 1
  const ponteiro = { x: 0, y: 0 };
  if (!reduzir) {
    addEventListener("pointermove", (e) => {
      ponteiro.x = (e.clientX / innerWidth) * 2 - 1;
      ponteiro.y = (e.clientY / innerHeight) * 2 - 1;
    }, { passive: true });
  }

  alvos.forEach((el) => {
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "low-power" });
    } catch (e) {
      return; // sem WebGL: fica a forma em CSS
    }
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.toneMapping = THREE.NeutralToneMapping;
    renderer.setClearColor(0x000000, 0);
    el.appendChild(renderer.domElement);

    const cena = new THREE.Scene();
    cena.environment = ambiente(renderer);
    const luz = new THREE.DirectionalLight(0xffffff, 1.3);
    luz.position.set(-3, 4, 5);
    cena.add(luz, new THREE.HemisphereLight(0xfff4e6, 0xd8ccff, 0.7));

    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
    camera.position.set(0, 0, 7.2);

    const grupo = new THREE.Group();
    cena.add(grupo);
    const principal = criarBlob(cores(el.dataset.blob3d, "laranja,rosa,azul"), 0.0);
    principal.malha.scale.set(1.3, 0.92, 1.0);
    principal.malha.rotation.z = -0.35;
    principal.malha.position.set(-0.2, 0.2, 0);
    grupo.add(principal.malha);
    const blobs = [principal];
    if (el.dataset.satelite) {
      const sat = criarBlob(cores(el.dataset.satelite), 0.37);
      sat.malha.scale.setScalar(0.48);
      sat.malha.position.set(1.15, -1.1, 0.6);
      grupo.add(sat.malha);
      blobs.push(sat);
    }

    const ajustar = () => {
      const { width: w, height: h } = el.getBoundingClientRect();
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    ajustar();
    new ResizeObserver(ajustar).observe(el);

    const relogio = new THREE.Clock();
    const quadro = () => {
      const t = relogio.getElapsedTime();
      blobs.forEach((b) => (b.uniforms.uTempo.value = t));
      grupo.rotation.y += (ponteiro.x * 0.55 - grupo.rotation.y) * 0.04;
      grupo.rotation.x += (ponteiro.y * 0.35 - grupo.rotation.x) * 0.04;
      grupo.position.y = Math.sin(t * 0.7) * 0.08;
      renderer.render(cena, camera);
    };

    if (reduzir) {
      quadro();
      el.classList.add("pronto");
      return;
    }
    let rodando = false;
    const ligar = (sim) => {
      if (sim === rodando) return;
      rodando = sim;
      renderer.setAnimationLoop(sim ? quadro : null);
    };
    new IntersectionObserver(([e]) => ligar(e.isIntersecting && !document.hidden)).observe(el);
    document.addEventListener("visibilitychange", () => {
      const r = el.getBoundingClientRect();
      ligar(!document.hidden && r.bottom > 0 && r.top < innerHeight);
    });
    quadro();
    el.classList.add("pronto");
  });
})();
