const BASE_SCRIPT = (document.currentScript && document.currentScript.src) || location.href;
// Ano automático no rodapé
document.querySelectorAll(".ano").forEach((el) => (el.textContent = new Date().getFullYear()));

// Menu no celular
const botao = document.querySelector(".menu-btn");
const links = document.querySelector(".nav-links");
if (botao && links) {
  botao.addEventListener("click", () => {
    const aberto = links.classList.toggle("aberto");
    botao.setAttribute("aria-expanded", aberto);
  });
  links.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => {
      links.classList.remove("aberto");
      botao.setAttribute("aria-expanded", "false");
    })
  );
}

// Seções aparecem suavemente ao rolar
const blocos = document.querySelectorAll(".secao, .capitulo");
if ("IntersectionObserver" in window) {
  // sem fade ao rolar: as seções aparecem direto (skill: "fade-in em cada seção" é padrão genérico)
  const observador = new IntersectionObserver(
    (entradas) =>
      entradas.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("visivel");
          observador.unobserve(e.target);
        }
      }),
    { threshold: 0.08 }
  );
  blocos.forEach((s) => observador.observe(s));
}

/* ---------------------------------------------------------
   Simulador de deficiência de visão de cores (CVD)
   Matrizes de Machado, Oliveira e Fernandes (2009), severidade máxima.
   São aproximações: servem para checar o trabalho e não substituem
   a leitura de pessoas com deficiência de visão de cores.
   --------------------------------------------------------- */
const simulacoes = {
  typical: { nome: "Typical color vision", matriz: null },
  protanomaly: { nome: "Protanomaly", nota: "weak red", matriz: "0.576143 0.526292 -0.102434 0 0 0.057251 0.893141 0.049608 0 0 -0.001941 -0.024058 1.025999 0 0 0 0 0 1 0" },
  deuteranomaly: { nome: "Deuteranomaly", nota: "weak green", matriz: "0.683661 0.430323 -0.113984 0 0 0.140042 0.836251 0.023706 0 0 -0.005910 0.021470 0.984441 0 0 0 0 0 1 0" },
  tritanomaly: { nome: "Tritanomaly", nota: "weak blue", matriz: "1.127764 -0.038374 -0.089389 0 0 -0.039205 0.965404 0.073801 0 0 0.002367 0.345683 0.651950 0 0 0 0 0 1 0" },
  protanopia: { nome: "Protanopia", nota: "no red cones", matriz: "0.152286 1.052583 -0.204868 0 0 0.114503 0.786281 0.099216 0 0 -0.003882 -0.048116 1.051998 0 0 0 0 0 1 0" },
  deuteranopia: { nome: "Deuteranopia", nota: "no green cones", matriz: "0.367322 0.860646 -0.227968 0 0 0.280085 0.672501 0.047413 0 0 -0.011820 0.042940 0.968881 0 0 0 0 0 1 0" },
  tritanopia: { nome: "Tritanopia", nota: "no blue cones", matriz: "1.255528 -0.076749 -0.178779 0 0 -0.078411 0.930809 0.147602 0 0 0.004733 0.691367 0.303900 0 0 0 0 0 1 0" },
  achromatopsia: { nome: "Monochromacy", nota: "no color", matriz: "0.2126 0.7152 0.0722 0 0 0.2126 0.7152 0.0722 0 0 0.2126 0.7152 0.0722 0 0 0 0 0 1 0" },
  "blue-cone": { nome: "Blue cone monochromacy", nota: "approximation", matriz: "0.1 0.2 0.7 0 0 0.1 0.2 0.7 0 0 0.1 0.2 0.7 0 0 0 0 0 1 0" },
};

/* Cores de cada simulação da paleta, lidas da figura da tese (Figura 6).
   Ordem dentro de cada lista: branco, roxo, laranja, cinza escuro, verde, amarelo. */
const ORDEM_PALETA = ["#F7F6F0", "#5C239E", "#F47A27", "#282828", "#BCF36C", "#F8D634"];
const CORES_SIM = {
  typical: ["#F7F6F0", "#5C239E", "#F47A27", "#282828", "#BCF36C", "#F8D634"],
  protanomaly: ["#F5EEE3", "#203894", "#CB8B11", "#282828", "#E3E464", "#F3D734"],
  deuteranomaly: ["#F5EEE3", "#203A88", "#D98502", "#282828", "#EADF8C", "#FCD268"],
  tritanomaly: ["#F5EDF4", "#503867", "#FF6B49", "#29282B", "#CFE3BE", "#FDCE9C"],
  achromatopsia: ["#EFEFEF", "#424242", "#8D8D8D", "#282828", "#D2D2D2", "#CECECE"],
  protanopia: ["#F5EEE1", "#00448F", "#AE9A19", "#2A2829", "#F5DE61", "#F2D834"],
  deuteranopia: ["#FEEAE8", "#00477A", "#C39300", "#2C2729", "#FFD6A2", "#FFD088"],
  tritanopia: ["#F7EBFD", "#494448", "#FE696E", "#29282B", "#D5DEEF", "#FFC9D7"],
  "blue-cone": ["#EFEDE9", "#4C3763", "#B5825C", "#282828", "#CDDBAB", "#DED196"],
};
const simDaCor = (id, hex) => {
  const i2 = ORDEM_PALETA.findIndex((c) => c.toUpperCase() === (hex || "").toUpperCase());
  return i2 >= 0 && CORES_SIM[id] ? CORES_SIM[id][i2] : hex;
};

const ns = "http://www.w3.org/2000/svg";
const defs = document.createElementNS(ns, "svg");
defs.setAttribute("aria-hidden", "true");
defs.setAttribute("style", "position:absolute;width:0;height:0");
Object.entries(simulacoes).forEach(([id, s]) => {
  if (!s.matriz) return;
  const f = document.createElementNS(ns, "filter");
  f.id = "sim-" + id;
  const m = document.createElementNS(ns, "feColorMatrix");
  m.setAttribute("type", "matrix");
  m.setAttribute("values", s.matriz);
  f.appendChild(m);
  defs.appendChild(f);
});
document.body.appendChild(defs);

const icone = '<img src="' + new URL("elementos/olhar.svg", BASE_SCRIPT).href + '" alt="">';
const simBotao = document.createElement("button");
simBotao.className = "sim-botao";
simBotao.type = "button";
simBotao.setAttribute("aria-expanded", "false");
simBotao.setAttribute("aria-controls", "sim-painel");
simBotao.innerHTML = icone + "<span>Color vision check</span>";
simBotao.setAttribute("aria-label", "Color vision check");

const painel = document.createElement("div");
painel.className = "sim-painel";
painel.id = "sim-painel";
painel.hidden = true;
painel.innerHTML =
  '<fieldset><legend>See this page through a simulation</legend>' +
  '<p class="sim-ajuda">I use simulations to check my work. They are approximations and do not replace testing with individuals with color vision deficiency.</p>' +
  Object.entries(simulacoes)
    .map(([id, s]) => `<label><input type="radio" name="sim" value="${id}"${id === "typical" ? " checked" : ""}> ${s.nome}${s.nota ? ` <small>(${s.nota})</small>` : ""}</label>`)
    .join("") +
  "</fieldset>";

document.body.append(painel, simBotao);

function aplicar(id) {
  const s = simulacoes[id] || simulacoes.typical;
  document.documentElement.style.filter = s.matriz ? `url(#sim-${id})` : "";
  document.documentElement.classList.toggle("sim-ativo", !!s.matriz);
  const r = painel.querySelector(`input[value="${id}"]`);
  if (r) r.checked = true;
  try { sessionStorage.setItem("sim", id); } catch (e) {}
}

simBotao.addEventListener("click", () => {
  const abrir = painel.hidden;
  painel.hidden = !abrir;
  simBotao.setAttribute("aria-expanded", abrir);
});
painel.addEventListener("change", (e) => aplicar(e.target.value));
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !painel.hidden) {
    painel.hidden = true;
    simBotao.setAttribute("aria-expanded", "false");
    simBotao.focus();
  }
});
try {
  const salvo = sessionStorage.getItem("sim");
  if (salvo) aplicar(salvo);
} catch (e) {}

/* ---------------------------------------------------------
   Profundidade 3D: fotos do topo seguem o mouse e
   cartões de projeto inclinam sob o ponteiro
   --------------------------------------------------------- */
const semMovimento = matchMedia("(prefers-reduced-motion: reduce)").matches;
const ponteiroFino = matchMedia("(pointer: fine)").matches;

const hero = document.querySelector(".hero, .case-hero");
if (hero && !semMovimento && ponteiroFino) {
  let alvoX = 0, alvoY = 0, x = 0, y = 0, rodando = false;
  const passo = () => {
    x += (alvoX - x) * 0.08;
    y += (alvoY - y) * 0.08;
    hero.style.setProperty("--mx", x.toFixed(3));
    hero.style.setProperty("--my", y.toFixed(3));
    if (Math.abs(alvoX - x) > 0.001 || Math.abs(alvoY - y) > 0.001) requestAnimationFrame(passo);
    else rodando = false;
  };
  const mover = () => { if (!rodando) { rodando = true; requestAnimationFrame(passo); } };
  hero.addEventListener("pointermove", (e) => {
    const r = hero.getBoundingClientRect();
    alvoX = ((e.clientX - r.left) / r.width) * 2 - 1;
    alvoY = ((e.clientY - r.top) / r.height) * 2 - 1;
    mover();
  });
  hero.addEventListener("pointerleave", () => { alvoX = 0; alvoY = 0; mover(); });
}

if (!semMovimento && ponteiroFino) {
  document.querySelectorAll(".proj").forEach((card) => {
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      const px = ((e.clientX - r.left) / r.width) * 2 - 1;
      const py = ((e.clientY - r.top) / r.height) * 2 - 1;
      card.style.setProperty("--ry", (px * 5).toFixed(2) + "deg");
      card.style.setProperty("--rx", (py * -5).toFixed(2) + "deg");
      card.style.setProperty("--px", px.toFixed(3));
      card.style.setProperty("--py", py.toFixed(3));
    });
    card.addEventListener("pointerleave", () => {
      ["--rx", "--ry", "--px", "--py"].forEach((v) => card.style.removeProperty(v));
    });
  });
}

/* ---------------------------------------------------------
   Tema escuro / claro: seletor vertical à esquerda, no meio
   da tela, com as opções Dark e Light (aria-pressed).
   --------------------------------------------------------- */
(function () {
  const raiz = document.documentElement;
  const lua = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>';
  const sol = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9 7 7M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
  const grupo = document.createElement("div");
  grupo.className = "tema";
  grupo.setAttribute("role", "group");
  grupo.setAttribute("aria-label", "Theme");
  grupo.innerHTML =
    `<button type="button" data-tema="escuro">${lua}<span>Dark</span></button>` +
    `<button type="button" data-tema="claro">${sol}<span>Light</span></button>`;
  document.body.appendChild(grupo);
  const marcar = () =>
    grupo.querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", b.dataset.tema === (raiz.dataset.tema || "claro")));
  grupo.addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    raiz.dataset.tema = b.dataset.tema;
    try { localStorage.setItem("tema", b.dataset.tema); } catch (err) {}
    marcar();
  });
  marcar();
})();

/* inclinação 3D também nos quadros da grade */
if (!semMovimento && ponteiroFino) {
  document.querySelectorAll("a.tile").forEach((card) => {
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      const px = ((e.clientX - r.left) / r.width) * 2 - 1;
      const py = ((e.clientY - r.top) / r.height) * 2 - 1;
      card.style.setProperty("--ry", (px * 4).toFixed(2) + "deg");
      card.style.setProperty("--rx", (py * -4).toFixed(2) + "deg");
      card.style.setProperty("--px", px.toFixed(3));
      card.style.setProperty("--py", py.toFixed(3));
    });
    card.addEventListener("pointerleave", () => ["--rx", "--ry", "--px", "--py"].forEach((v) => card.style.removeProperty(v)));
  });
}

/* ---------------------------------------------------------
   Paleta em pílulas: desenha cada par de cores, calcula o
   contraste WCAG do melhor texto sobre cada cor e permite
   ver as pílulas nas simulações de visão de cores.
   --------------------------------------------------------- */
(function () {
  const TINTA = "#26030A", PAPEL = "#F4E7DC";
  const valido = (h) => /^#[0-9a-f]{6}$/i.test((h || "").trim());
  const lum = (h) => {
    const c = [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255)
      .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  };
  const razao = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
  const nota = (r) => (r >= 7 ? ["AAA", ""] : r >= 4.5 ? ["AA", ""] : r >= 3 ? ["AA large", ""] : ["fails", "falha"]);

  function rotulo(hex, nome, extra) {
    if (!valido(hex)) return `<div class="pp-rotulo"><b><span class="preencher">[preencher: HEX]</span></b><span>${nome || ""}</span>${extra ? `<span>${extra}</span>` : ""}</div>`;
    const comTinta = razao(hex, TINTA), comPapel = razao(hex, PAPEL);
    const melhor = comTinta >= comPapel ? ["dark text", comTinta] : ["light text", comPapel];
    const [n, cls] = nota(melhor[1]);
    return `<div class="pp-rotulo"><b>${hex.toUpperCase()}</b><span>${nome || ""}</span>` +
      (extra ? `<span>${extra}</span>` : "") +
      `<span class="pp-nota">${melhor[0]} ${melhor[1].toFixed(1)}:1 <i class="${cls}">${n}</i></span></div>`;
  }

  function pintar(li, a, b) {
    const extraA = li.dataset.extraA, extraB = li.dataset.extraB;
    const ok = valido(a) && valido(b);
    li.classList.toggle("pp-vazio", !ok);
    const escuro = ok && lum(a) < 0.03 && lum(b) < 0.03;
    const contorno = ok && (lum(a) < 0.03 || lum(b) < 0.03) ? " contorno" : "";
    const posicao = [...li.parentNode.children].indexOf(li) % 2 ? "baixo" : "cima";
    li.innerHTML =
      rotulo(a, li.dataset.nomeA, extraA) +
      `<div class="pp-forma${contorno}" style="--a:${valido(a) ? a : "#333"};--b:${valido(b) ? b : "#26030A"}" role="img" aria-label="${li.dataset.nomeA || "color"} ${valido(a) ? a : ""} and ${li.dataset.nomeB || "color"} ${valido(b) ? b : ""}">` +
      (ok ? `<span class="pp-olho ${posicao}"></span>` : "") + `</div>` +
      rotulo(b, li.dataset.nomeB, extraB);
    if (escuro) li.querySelector(".pp-forma").classList.add("contorno");
  }

  document.querySelectorAll(".paleta-pilulas").forEach((bloco) => {
    const itens = bloco.querySelectorAll(".pp");
    itens.forEach((li) => {
      li.dataset.origA = (li.dataset.corA || "").trim();
      li.dataset.origB = (li.dataset.corB || "").trim();
      pintar(li, li.dataset.origA, li.dataset.origB);
    });

    const sims = bloco.querySelector(".pp-sims");
    if (!sims) return;
    const tipos = [
      ["typical", "Typical"], ["protanomaly", "Protanomaly"], ["deuteranomaly", "Deuteranomaly"],
      ["tritanomaly", "Tritanomaly"], ["achromatopsia", "Monochromacy"], ["protanopia", "Protanopia"],
      ["deuteranopia", "Deuteranopia"], ["tritanopia", "Tritanopia"], ["blue-cone", "Blue cone monochromacy"],
    ];
    sims.innerHTML = tipos.map(([id, nome]) => `<button type="button" data-sim="${id}" aria-pressed="${id === "typical"}">${nome}</button>`).join("");
    sims.addEventListener("click", (e) => {
      const btn = e.target.closest("button");
      if (!btn) return;
      const id = btn.dataset.sim;
      sims.querySelectorAll("button").forEach((x) => x.setAttribute("aria-pressed", x === btn));
      bloco.querySelectorAll(".pp").forEach((li) => {
        const a = simDaCor(id, li.dataset.origA), b = simDaCor(id, li.dataset.origB);
        pintar(li, a, b);
      });
      const f = simulacoes[id] && simulacoes[id].matriz ? `url(#sim-${id})` : "";
      bloco.querySelectorAll(".fam-grade").forEach((el) => (el.style.filter = f));
    });
  });
})();

/* ---------------------------------------------------------
   Tela de carregamento: fica no mínimo 1,5 s, sai quando a
   página termina de carregar (no máximo 3,5 s) ou no
   primeiro clique/tecla. Marca a visita para não repetir.
   --------------------------------------------------------- */
(function () {
  const raiz = document.documentElement;
  const loader = document.getElementById("loader");
  if (!loader || !raiz.classList.contains("carregando")) return;
  try { sessionStorage.setItem("intro", "1"); } catch (e) {}
  const inicio = performance.now();
  let saiu = false;
  function sair() {
    if (saiu) return;
    saiu = true;
    loader.classList.add("saindo");
    const status = document.getElementById("loader-status");
    if (status) status.textContent = "";
    setTimeout(() => { raiz.classList.remove("carregando"); loader.remove(); }, 950);
  }
  const quandoPronto = () => setTimeout(sair, Math.max(0, 1700 - (performance.now() - inicio)));
  if (document.readyState === "complete") quandoPronto();
  else addEventListener("load", quandoPronto, { once: true });
  setTimeout(sair, 3500);
  loader.addEventListener("click", sair);
  addEventListener("keydown", sair, { once: true });
})();

/* ---------------------------------------------------------
   Pausar movimento (WCAG 2.2.2): botão no rodapé de cada
   página. Pausa faixa, flutuantes, selo e adesivos.
   --------------------------------------------------------- */
(function () {
  const raiz = document.documentElement;
  const rodape = document.querySelector(".rodape, .rodape-simples");
  if (!rodape) return;
  const b = document.createElement("button");
  b.type = "button";
  b.className = "pausar-movimento";
  const aplicar = (pausado) => {
    raiz.classList.toggle("pausado", pausado);
    b.setAttribute("aria-pressed", pausado);
    b.textContent = pausado ? "Resume motions" : "Pause motions";
    try { sessionStorage.setItem("pausado", pausado ? "1" : ""); } catch (e) {}
  };
  b.addEventListener("click", () => aplicar(!raiz.classList.contains("pausado")));
  rodape.appendChild(b);
  let inicial = false;
  try { inicial = sessionStorage.getItem("pausado") === "1"; } catch (e) {}
  aplicar(inicial);
})();

/* o olho segue o cursor: a pupila anda até 6px do centro, com o cursor a meia largura do olho */
(function () {
  const olho = document.querySelector(".fl-olho svg");
  if (!olho || matchMedia("(prefers-reduced-motion: reduce)").matches || !matchMedia("(pointer: fine)").matches) return;
  const pupila = olho.querySelector("#pupila-olho");
  addEventListener("pointermove", (e) => {
    const r = olho.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
    const d = Math.hypot(dx, dy) || 1, k = Math.min(1, d / (r.width * 0.5)) * 6 / d;
    pupila.style.setProperty("--px", (dx * k).toFixed(2) + "px");
    pupila.style.setProperty("--py", (dy * k).toFixed(2) + "px");
  }, { passive: true });
})();

/* Gráfico da pesquisa: cada barra começa em 0, o corte avança da esquerda para a direita
   e o número sobe até o valor final. Uma barra por vez. Movimento reduzido: mostra o valor final. */
(function () {
  const grades = document.querySelectorAll(".rng-grade");
  if (!grades.length) return;
  const reduzir = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const DURACAO = 1400, PAUSA = 250;
  const itensDe = (g) => [...g.querySelectorAll(".rng")].map((it) => {
    const barra = it.querySelector(".rng-barra");
    const num = it.querySelector(".rng-num");
    return { barra, num, final: parseFloat(barra.style.getPropertyValue("--v")) };
  });
  const pintar = (item, v) => {
    item.barra.style.setProperty("--v", v.toFixed(1) + "%");
    item.num.firstChild.textContent = v.toFixed(1);
  };
  const animar = (item) => new Promise((ok) => {
    const t0 = performance.now();
    const passo = (t) => {
      const k = Math.min(1, (t - t0) / DURACAO);
      const ease = 1 - Math.pow(1 - k, 3);
      pintar(item, item.final * ease);
      if (k < 1) requestAnimationFrame(passo); else ok();
    };
    requestAnimationFrame(passo);
  });
  grades.forEach((g) => {
    const itens = itensDe(g);
    if (reduzir) return;
    itens.forEach((it) => pintar(it, 0));
    let começou = false;
    const obs = new IntersectionObserver(async ([e]) => {
      if (!e.isIntersecting || começou) return;
      começou = true;
      obs.disconnect();
      for (const it of itens) {
        await animar(it);
        await new Promise((r) => setTimeout(r, PAUSA));
      }
    }, { threshold: 0.4 });
    obs.observe(g);
  });
})();

/* Grade de pontos: as 30 bolinhas preenchidas pulam uma a uma ao aparecer (uma vez só) */
(function () {
  const grade = document.querySelector(".grade-pontos");
  if (!grade || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const obs = new IntersectionObserver(([e]) => {
    if (!e.isIntersecting) return;
    grade.classList.add("contando");
    obs.disconnect();
  }, { threshold: 0.5 });
  obs.observe(grade);
})();

/* "Scroll to top" (desktop): aparece com opacidade depois que a página passa da primeira dobra */
(function () {
  const voltar = document.querySelector(".voltar-topo");
  if (!voltar) return;
  const atualizar = () => voltar.classList.toggle("visivel", window.scrollY > 500);
  window.addEventListener("scroll", atualizar, { passive: true });
  atualizar();
})();
