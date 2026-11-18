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
  blocos.forEach((s) => s.classList.add("revelar"));
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
  protanopia: { nome: "Protanopia", nota: "no red cones", matriz: "0.152286 1.052583 -0.204868 0 0 0.114503 0.786281 0.099216 0 0 -0.003882 -0.048116 1.051998 0 0 0 0 0 1 0" },
  deuteranopia: { nome: "Deuteranopia", nota: "no green cones", matriz: "0.367322 0.860646 -0.227968 0 0 0.280085 0.672501 0.047413 0 0 -0.011820 0.042940 0.968881 0 0 0 0 0 1 0" },
  tritanopia: { nome: "Tritanopia", nota: "no blue cones", matriz: "1.255528 -0.076749 -0.178779 0 0 -0.078411 0.930809 0.147602 0 0 0.004733 0.691367 0.303900 0 0 0 0 0 1 0" },
  achromatopsia: { nome: "Achromatopsia", nota: "no color", matriz: "0.2126 0.7152 0.0722 0 0 0.2126 0.7152 0.0722 0 0 0.2126 0.7152 0.0722 0 0 0 0 0 1 0" },
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

const icone = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor"/></svg>';
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

const colagem = document.querySelector(".colagem");
const hero = document.querySelector(".hero");
if (colagem && hero && !semMovimento && ponteiroFino) {
  let alvoX = 0, alvoY = 0, x = 0, y = 0, rodando = false;
  const passo = () => {
    x += (alvoX - x) * 0.08;
    y += (alvoY - y) * 0.08;
    colagem.style.setProperty("--mx", x.toFixed(3));
    colagem.style.setProperty("--my", y.toFixed(3));
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
   Tema escuro / claro (botão vertical à esquerda)
   --------------------------------------------------------- */
(function () {
  const raiz = document.documentElement;
  const lua = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" fill="currentColor"/></svg>';
  const sol = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4.5" fill="currentColor"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9 7 7M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
  const grupo = document.createElement("div");
  grupo.className = "tema";
  grupo.setAttribute("role", "group");
  grupo.setAttribute("aria-label", "Theme");
  grupo.innerHTML =
    `<button type="button" data-tema="escuro">${lua}<span>Dark</span></button>` +
    `<button type="button" data-tema="claro">${sol}<span>Light</span></button>`;
  document.body.appendChild(grupo);
  const marcar = () =>
    grupo.querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", b.dataset.tema === (raiz.dataset.tema || "escuro")));
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
  const TINTA = "#2B0B1E", PAPEL = "#F9EEE5";
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

  document.querySelectorAll(".paleta-pilulas").forEach((bloco) => {
    const itens = bloco.querySelectorAll(".pp");
    itens.forEach((li, i) => {
      const a = (li.dataset.corA || "").trim(), b = (li.dataset.corB || "").trim();
      const extraA = li.dataset.extraA, extraB = li.dataset.extraB;
      const ok = valido(a) && valido(b);
      if (!ok) li.classList.add("pp-vazio");
      const escuro = ok && lum(a) < 0.03 && lum(b) < 0.03;
      const contorno = ok && (lum(a) < 0.03 || lum(b) < 0.03) ? " contorno" : "";
      const posicao = i % 2 ? "baixo" : "cima";
      li.innerHTML =
        rotulo(a, li.dataset.nomeA, extraA) +
        `<div class="pp-forma${contorno}" style="--a:${valido(a) ? a : "#333"};--b:${valido(b) ? b : "#2a2a2a"}" role="img" aria-label="${li.dataset.nomeA || "color"} ${valido(a) ? a : ""} and ${li.dataset.nomeB || "color"} ${valido(b) ? b : ""}">` +
        (ok ? `<span class="pp-olho ${posicao}"></span>` : "") + `</div>` +
        rotulo(b, li.dataset.nomeB, extraB);
      if (escuro) li.querySelector(".pp-forma").classList.add("contorno");
    });

    const sims = bloco.querySelector(".pp-sims");
    if (!sims) return;
    const tipos = [["typical", "Typical"], ["protanopia", "Protanopia"], ["deuteranopia", "Deuteranopia"], ["tritanopia", "Tritanopia"], ["achromatopsia", "Achromatopsia"]];
    sims.innerHTML = tipos.map(([id, nome]) => `<button type="button" data-sim="${id}" aria-pressed="${id === "typical"}">${nome}</button>`).join("");
    sims.addEventListener("click", (e) => {
      const btn = e.target.closest("button");
      if (!btn) return;
      sims.querySelectorAll("button").forEach((x) => x.setAttribute("aria-pressed", x === btn));
      const f = btn.dataset.sim === "typical" ? "" : `url(#sim-${btn.dataset.sim})`;
      bloco.querySelectorAll(".pp-forma, .fam-grade").forEach((el) => (el.style.filter = f));
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
