import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useLocation } from "react-router-dom";
import { convitesAPI, confirmacoesAPI } from "../services/api";

/* ─────────────────────────────────────────────────────
   FONTES & ANIMAÇÕES GLOBAIS
───────────────────────────────────────────────────── */
const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600;1,700&family=Inter:wght@300;400;500;600;700&display=swap');
*{box-sizing:border-box;-webkit-tap-highlight-color:transparent;}
html,body{margin:0;padding:0;overflow:hidden;background:#1a1a1a;}
input,textarea,button{font-family:'Inter',sans-serif;}
input::placeholder,textarea::placeholder{color:rgba(0,0,0,0.22);}
@keyframes fadeUp{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:translateY(0)}}
@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
@keyframes spin-slow{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
@keyframes appear{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:translateY(0)}}
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
@keyframes twinkle{0%,100%{opacity:0.08}50%{opacity:0.65}}
@keyframes pulse-gold{0%,100%{box-shadow:0 0 0 0 rgba(196,163,90,0)}50%{box-shadow:0 0 0 8px rgba(196,163,90,0.12)}}
@keyframes slideIn{from{opacity:0;transform:translateX(10px)}to{opacity:1;transform:translateX(0)}}
@keyframes arrowBounce{0%,100%{transform:translateX(-50%) translateY(0)}50%{transform:translateX(-50%) translateY(5px)}}
/* Frame scroll — snap vertical */
.fscroll{height:100%;overflow-y:scroll;scroll-snap-type:y mandatory;-ms-overflow-style:none;scrollbar-width:none;}
.fscroll::-webkit-scrollbar{display:none;}
.fslide{height:100%;scroll-snap-align:start;position:relative;overflow:hidden;flex-shrink:0;}
.fslide-free{scroll-snap-align:start;min-height:100%;overflow-y:auto;-webkit-overflow-scrolling:touch;flex-shrink:0;}
.fslide-free::-webkit-scrollbar{width:2px;}
.fslide-free::-webkit-scrollbar-thumb{background:rgba(196,163,90,0.18);border-radius:2px;}
.eb-btn:hover .ei-inner{transform:scale(1.07)!important;box-shadow:0 0 40px rgba(196,163,90,0.18)!important;}
`;

/* ─────────────────────────────────────────────────────
   PALETA
───────────────────────────────────────────────────── */
const GOLD       = "#c4a35a";
const GOLD_A     = "rgba(196,163,90,";
const WHITE      = "#ffffff";
const DARK       = "#0e0e0e";
const CREAM      = "#fdfaf5";
const FRAME_BG   = "#1c1c1c";

/* ─────────────────────────────────────────────────────
   COMPONENTE: PLAYER DE MÚSICA
───────────────────────────────────────────────────── */
function MusicaPlayer({ url, autoPlay }) {
  const audioRef = useRef();
  const [playing, setPlaying] = useState(false);
  const triedRef = useRef(false);

  useEffect(() => {
    const a = audioRef.current;
    if (!a || !url) return;
    a.addEventListener("ended", () => setPlaying(false));
    a.addEventListener("error", () => {});
  }, [url]);

  useEffect(() => {
    if (autoPlay && !triedRef.current && audioRef.current && url) {
      triedRef.current = true;
      audioRef.current.play().then(() => setPlaying(true)).catch(() => {});
    }
  }, [autoPlay, url]);

  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) { a.pause(); setPlaying(false); }
    else { a.play().then(() => setPlaying(true)).catch(() => {}); }
  };

  if (!url?.trim()) return null;

  return (
    <div style={{
      position: "fixed", bottom: "20px", left: "20px", zIndex: 9999,
      display: "flex", alignItems: "center", gap: "9px",
      background: "rgba(10,10,10,0.92)", backdropFilter: "blur(20px)",
      borderRadius: "50px", padding: "6px 16px 6px 6px",
      border: `1px solid ${GOLD_A}0.2)`,
      boxShadow: "0 8px 32px rgba(0,0,0,0.55)"
    }}>
      <audio ref={audioRef} src={url} loop preload="none" onError={() => {}} onAbort={() => {}} onStalled={() => {}} />
      <button onClick={toggle} style={{
        width: "36px", height: "36px", borderRadius: "50%",
        background: playing ? GOLD : `${GOLD_A}0.12)`,
        border: `1px solid ${GOLD_A}0.4)`,
        cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all 0.3s", flexShrink: 0, padding: 0
      }}>
        {playing
          ? <svg width="10" height="10" viewBox="0 0 10 10" fill={DARK}><rect x="0.5" y="0.5" width="3" height="9" rx="1" /><rect x="6.5" y="0.5" width="3" height="9" rx="1" /></svg>
          : <svg width="10" height="10" viewBox="0 0 10 10" fill={GOLD}><polygon points="2,0.5 9.5,5 2,9.5" /></svg>
        }
      </button>
      <span style={{
        color: playing ? WHITE : `${GOLD_A}0.45)`,
        fontSize: "8px", fontWeight: 600, letterSpacing: "1.8px",
        textTransform: "uppercase", whiteSpace: "nowrap"
      }}>
        {playing ? "A tocar" : "Música"}
      </span>
    </div>
  );
}

/* ─────────────────────────────────────────────────────
   COMPONENTE: ENVELOPE (ecrã inicial)
───────────────────────────────────────────────────── */
function Envelope({ nome, relacao, nomeEvento, dataEvento, horaEvento, localEvento, onAbrir }) {
  const [opening, setOpening] = useState(false);

  const open = () => {
    if (opening) return;
    setOpening(true);
    setTimeout(onAbrir, 1100);
  };

  const parts = nomeEvento
    ? nomeEvento.split(/[&]/).map(s => s.trim()).filter(Boolean)
    : [nomeEvento];

  const dateFmt = dataEvento
    ? new Date(dataEvento).toLocaleDateString("pt-PT", { day: "2-digit", month: "long", year: "numeric" })
    : "";

  return (
    <div style={{
      minHeight: "100vh",
      background: DARK,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'Inter',sans-serif",
      overflow: "hidden", position: "relative"
    }}>
      <style>{GLOBAL_CSS}</style>

      {/* Gradiente radial dourado */}
      <div style={{
        position: "absolute", inset: 0,
        background: `radial-gradient(ellipse 90% 55% at 50% -5%, ${GOLD_A}0.07) 0%, transparent 65%)`
      }} />

      {/* Linhas decorativas horizontais */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        {[12, 88].map(y => (
          <div key={y} style={{
            position: "absolute", top: `${y}%`, left: 0, right: 0,
            height: "1px",
            background: `linear-gradient(to right, transparent, ${GOLD_A}0.07), transparent)`
          }} />
        ))}
      </div>

      {/* Partículas douradas */}
      {Array.from({ length: 18 }).map((_, idx) => (
        <div key={idx} style={{
          position: "absolute",
          width: idx % 3 === 0 ? "2px" : "1.5px",
          height: idx % 3 === 0 ? "2px" : "1.5px",
          borderRadius: "50%",
          background: `${GOLD_A}${0.1 + (idx % 5) * 0.08})`,
          top: `${5 + idx * 5.1}%`,
          left: `${4 + idx * 5.3}%`,
          animation: `twinkle ${1.6 + idx * 0.21}s ease-in-out infinite`,
          animationDelay: `${idx * 0.12}s`
        }} />
      ))}

      {/* Card glassmorphism */}
      <div style={{
        textAlign: "center", maxWidth: "370px", width: "90%",
        padding: "48px 34px",
        animation: "appear 1.1s cubic-bezier(0.4,0,0.2,1)",
        position: "relative", zIndex: 2,
        background: "rgba(255,255,255,0.022)",
        backdropFilter: "blur(14px)",
        border: `1px solid ${GOLD_A}0.13)`,
        boxShadow: `0 40px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.035)`
      }}>

        {/* Cantos decorativos */}
        {[["top", "left"], ["top", "right"], ["bottom", "left"], ["bottom", "right"]].map(([v, h], ci) => (
          <div key={ci} style={{
            position: "absolute",
            [v]: "16px", [h]: "16px",
            width: "18px", height: "18px",
            [`border${v.charAt(0).toUpperCase() + v.slice(1)}`]: `1px solid ${GOLD_A}0.42)`,
            [`border${h.charAt(0).toUpperCase() + h.slice(1)}`]: `1px solid ${GOLD_A}0.42)`
          }} />
        ))}

        {/* Linha topo com losango */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px", justifyContent: "center" }}>
          <div style={{ flex: 1, height: "1px", background: `linear-gradient(to right,transparent,${GOLD_A}0.38))` }} />
          <svg width="12" height="12" viewBox="0 0 16 16" fill={GOLD}>
            <polygon points="8,0 10,6 16,6 11,10 13,16 8,12 3,16 5,10 0,6 6,6" />
          </svg>
          <div style={{ flex: 1, height: "1px", background: `linear-gradient(to left,transparent,${GOLD_A}0.38))` }} />
        </div>

        {/* Label convite */}
        <p style={{
          color: `${GOLD_A}0.5)`, fontSize: "7.5px", fontWeight: 700,
          letterSpacing: "5px", textTransform: "uppercase", marginBottom: "16px"
        }}>
          {nome ? (relacao ? `${relacao.toUpperCase()} DE HONRA` : "CONVIDADO ESPECIAL") : "CONVITE PARA"}
        </p>

        {/* Título principal */}
        {nome ? (
          <h1 style={{
            fontFamily: "'Cormorant Garamond',serif",
            color: WHITE, fontSize: "clamp(30px,8vw,52px)",
            fontWeight: 500, fontStyle: "italic",
            lineHeight: 1.05, margin: "0 0 20px"
          }}>{nome}</h1>
        ) : parts.length >= 2 ? (
          <div style={{ marginBottom: "20px" }}>
            <h1 style={{
              fontFamily: "'Cormorant Garamond',serif", color: WHITE,
              fontSize: "clamp(28px,7vw,48px)", fontWeight: 500,
              fontStyle: "italic", lineHeight: 1, margin: 0
            }}>{parts[0]}</h1>
            <p style={{
              fontFamily: "'Cormorant Garamond',serif", color: GOLD,
              fontSize: "clamp(20px,5vw,34px)", margin: "4px 0", letterSpacing: "6px"
            }}>&amp;</p>
            <h1 style={{
              fontFamily: "'Cormorant Garamond',serif", color: WHITE,
              fontSize: "clamp(28px,7vw,48px)", fontWeight: 500,
              fontStyle: "italic", lineHeight: 1, margin: 0
            }}>{parts[1]}</h1>
          </div>
        ) : (
          <h1 style={{
            fontFamily: "'Cormorant Garamond',serif", color: WHITE,
            fontSize: "clamp(22px,6vw,42px)", fontWeight: 500,
            fontStyle: "italic", lineHeight: 1.1, marginBottom: "20px"
          }}>{nomeEvento}</h1>
        )}

        {/* Separador */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px", justifyContent: "center" }}>
          <div style={{ flex: 1, height: "1px", background: `linear-gradient(to right,transparent,${GOLD_A}0.25))` }} />
          <div style={{ width: "4px", height: "4px", borderRadius: "50%", background: GOLD }} />
          <div style={{ flex: 1, height: "1px", background: `linear-gradient(to left,transparent,${GOLD_A}0.25))` }} />
        </div>

        {/* Evento quando há nome de convidado */}
        {nome && (
          <p style={{
            fontFamily: "'Cormorant Garamond',serif",
            color: "rgba(255,255,255,0.4)", fontSize: "clamp(13px,3vw,18px)",
            fontStyle: "italic", margin: "0 0 16px"
          }}>
            {parts.length >= 2 ? `${parts[0]} & ${parts[1]}` : nomeEvento}
          </p>
        )}

        {/* Data / hora / local */}
        <div style={{ display: "flex", gap: "6px", justifyContent: "center", marginBottom: "32px", flexWrap: "wrap" }}>
          {dateFmt && <span style={{ color: "rgba(255,255,255,0.35)", fontSize: "11px" }}>{dateFmt}</span>}
          {dateFmt && horaEvento && <span style={{ color: `${GOLD_A}0.35)`, fontSize: "11px" }}>·</span>}
          {horaEvento && <span style={{ color: "rgba(255,255,255,0.35)", fontSize: "11px" }}>{horaEvento}</span>}
          {localEvento && <span style={{ color: "rgba(255,255,255,0.22)", fontSize: "11px" }}>· {localEvento}</span>}
        </div>

        {/* Botão circular com texto rotativo */}
        <div style={{ animation: "float 3.2s ease-in-out infinite" }}>
          <div
            onClick={open}
            className="eb-btn"
            style={{ position: "relative", width: "100px", height: "100px", margin: "0 auto", cursor: opening ? "wait" : "pointer" }}
          >
            {/* Texto rotativo */}
            <svg viewBox="0 0 100 100" style={{
              position: "absolute", inset: 0, width: "100%", height: "100%",
              animation: "spin-slow 18s linear infinite"
            }}>
              <defs>
                <path id="circleText" d="M 50,50 m -37,0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0" />
              </defs>
              <text style={{ fontSize: "6.5px", fill: `${GOLD_A}0.42)`, fontWeight: 600, letterSpacing: "2.4px" }}>
                <textPath href="#circleText">ABRIR CONVITE ◆ ABRIR CONVITE ◆ AB</textPath>
              </text>
            </svg>

            {/* Círculo central */}
            <div className="ei-inner" style={{
              position: "absolute", inset: "13px", borderRadius: "50%",
              background: `${GOLD_A}0.07)`,
              border: `1px solid ${GOLD_A}0.32)`,
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "transform 0.35s, box-shadow 0.35s",
              animation: opening ? "none" : "pulse-gold 3s ease-in-out infinite"
            }}>
              {opening
                ? <div style={{
                    width: "18px", height: "18px",
                    border: `1.5px solid ${GOLD_A}0.2)`,
                    borderTopColor: GOLD, borderRadius: "50%",
                    animation: "spin 0.8s linear infinite"
                  }} />
                : <svg width="28" height="22" viewBox="0 0 32 26" fill="none">
                    <rect x="1" y="1" width="30" height="24" rx="3" stroke={GOLD} strokeWidth="1.2" />
                    <path d="M1 5l15 10L31 5" stroke={GOLD} strokeWidth="1.2" strokeLinecap="round" />
                    <path d="M1 21l9-7M31 21l-9-7" stroke={`${GOLD_A}0.25)`} strokeWidth="1" strokeLinecap="round" />
                  </svg>
              }
            </div>
          </div>
        </div>

        <p style={{
          color: opening ? `${GOLD_A}0.45)` : "rgba(255,255,255,0.15)",
          fontSize: "7.5px", marginTop: "14px",
          letterSpacing: "2.5px", textTransform: "uppercase"
        }}>
          {opening ? "A abrir..." : "Toque para abrir"}
        </p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────
   COMPONENTE: COUNTDOWN CIRCLES
───────────────────────────────────────────────────── */
function CountdownDisplay({ dataEvento, horaEvento }) {
  const [time, setTime] = useState({ d: 0, h: 0, m: 0, s: 0 });

  useEffect(() => {
    const calc = () => {
      try {
        const [y, mo, da] = (dataEvento || "").substring(0, 10).split("-").map(Number);
        const [hh, mm] = (horaEvento || "00:00").split(":").map(Number);
        const diff = new Date(y, mo - 1, da, hh || 0, mm || 0, 0) - new Date();
        if (isNaN(diff) || diff <= 0) { setTime({ d: 0, h: 0, m: 0, s: 0 }); return; }
        setTime({
          d: Math.floor(diff / 86400000),
          h: Math.floor((diff % 86400000) / 3600000),
          m: Math.floor((diff % 3600000) / 60000),
          s: Math.floor((diff % 60000) / 1000)
        });
      } catch {
        setTime({ d: 0, h: 0, m: 0, s: 0 });
      }
    };
    calc();
    const iv = setInterval(calc, 1000);
    return () => clearInterval(iv);
  }, [dataEvento, horaEvento]);

  return (
    <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
      {[{ v: time.d, l: "Dias" }, { v: time.h, l: "Horas" }, { v: time.m, l: "Min" }, { v: time.s, l: "Seg" }].map(({ v, l }) => (
        <div key={l} style={{ textAlign: "center" }}>
          <div style={{
            width: "58px", height: "58px", borderRadius: "50%",
            border: `1.5px solid ${GOLD_A}0.32)`,
            background: `${GOLD_A}0.06)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 7px",
            boxShadow: `0 0 0 4px ${GOLD_A}0.04)`
          }}>
            <span style={{
              fontFamily: "'Cormorant Garamond',serif",
              fontSize: "24px", fontWeight: 500, color: DARK
            }}>{String(v).padStart(2, "0")}</span>
          </div>
          <span style={{
            fontSize: "7px", color: "rgba(0,0,0,0.38)",
            letterSpacing: "2.5px", textTransform: "uppercase", fontWeight: 600
          }}>{l}</span>
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────
   HELPERS VISUAIS
───────────────────────────────────────────────────── */
const SectionLabel = ({ children }) => (
  <p style={{
    color: `${GOLD_A}0.65)`, fontSize: "7.5px", fontWeight: 700,
    letterSpacing: "4.5px", textTransform: "uppercase",
    textAlign: "center", margin: "0 0 8px"
  }}>{children}</p>
);

const SectionTitle = ({ children, size }) => (
  <h2 style={{
    fontFamily: "'Cormorant Garamond',serif",
    fontSize: size || "clamp(22px,5vw,30px)",
    fontWeight: 400, color: DARK,
    textAlign: "center", margin: "0 0 4px", letterSpacing: "0.3px"
  }}>{children}</h2>
);

const GoldDivider = () => (
  <div style={{
    display: "flex", alignItems: "center", gap: "10px",
    justifyContent: "center", margin: "10px auto 20px", width: "90px"
  }}>
    <div style={{ flex: 1, height: "1px", background: `linear-gradient(to right,transparent,${GOLD_A}0.5))` }} />
    <div style={{ width: "5px", height: "5px", transform: "rotate(45deg)", background: GOLD, opacity: 0.75 }} />
    <div style={{ flex: 1, height: "1px", background: `linear-gradient(to left,transparent,${GOLD_A}0.5))` }} />
  </div>
);

const SlideArrow = () => (
  <div style={{
    position: "absolute", bottom: "18px", left: "50%",
    animation: "arrowBounce 2s ease-in-out infinite",
    opacity: 0.4
  }}>
    <svg width="18" height="10" viewBox="0 0 18 10" fill="none">
      <path d="M1.5 1.5L9 8.5L16.5 1.5" stroke={GOLD} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </div>
);

/* ─────────────────────────────────────────────────────
   COMPONENTE PRINCIPAL: ConviteSlides
───────────────────────────────────────────────────── */
function ConviteSlides({ evento, nomeConv, relConv }) {
  const [slide, setSlide]       = useState(0);
  const [enviado, setEnviado]   = useState(false);
  const [erro, setErro]         = useState("");
  const [submitting, setSub]    = useState(false);
  const [form, setForm]         = useState({
    nome_convidado: nomeConv || "",
    email: "", telefone: "",
    confirmado: true, mensagem: ""
  });
  const [viIdx, setViIdx]       = useState(0);
  const [fotoIdx, setFotoIdx]   = useState(0);

  const scrollRef = useRef();
  const touchYRef = useRef(null);

  /* ── Dados do evento ── */
  const programa = (() => {
    try {
      const raw = Array.isArray(evento.programa) ? evento.programa : JSON.parse(evento.programa || "[]");
      return raw.filter(p => p.nome);
    } catch { return []; }
  })();

  const refData = (() => {
    try {
      return typeof evento.refeicao === "object" ? evento.refeicao : JSON.parse(evento.refeicao || "{}");
    } catch { return {}; }
  })();

  const pratos  = (refData?.pratos  || []).filter(p => p.nome);
  const bebidas = (refData?.bebidas || []).filter(b => b.nome);

  const fotos = [
    ...(evento.foto_capa ? [evento.foto_capa] : []),
    ...(Array.isArray(evento.fotos) ? evento.fotos.filter(Boolean) : [])
  ].filter((f, i, a) => a.indexOf(f) === i);

  const videos = [
    ...(Array.isArray(evento.videos_urls) ? evento.videos_urls : []),
    ...(!Array.isArray(evento.videos_urls) && evento.video_url ? [evento.video_url] : [])
  ].filter(Boolean);

  /* ── Lista de slides ── */
  const slides = [
    "hero",
    "countdown",
    ...(videos.length ? ["videos"] : []),
    ...((evento.endereco_maps || evento.local_evento) ? ["mapa"] : []),
    ...(programa.length ? ["programa"] : []),
    ...((pratos.length || bebidas.length) ? ["refeicao"] : []),
    "rsvp",
  ];
  const total = slides.length;

  /* ── Navegação ── */
  const goTo = useCallback((n) => {
    const next = Math.max(0, Math.min(total - 1, n));
    if (next === slide) return;
    setSlide(next);
    scrollRef.current?.children[next]?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [slide, total]);

  /* Teclas ↑ ↓ */
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "ArrowDown" || e.key === "PageDown") goTo(slide + 1);
      if (e.key === "ArrowUp"   || e.key === "PageUp")   goTo(slide - 1);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [slide, goTo]);

  /* Scroll roda (debounce 900ms, 1 scroll = 1 slide) */
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    let lastWheel = 0;
    const onWheel = (e) => {
      const now = Date.now();
      if (now - lastWheel < 900) return;
      lastWheel = now;
      goTo(slide + (e.deltaY > 0 ? 1 : -1));
    };
    el.addEventListener("wheel", onWheel, { passive: true });
    return () => el.removeEventListener("wheel", onWheel);
  }, [slide, goTo]);

  /* Touch swipe */
  const onTouchStart = (e) => { touchYRef.current = e.touches[0].clientY; };
  const onTouchEnd   = (e) => {
    if (touchYRef.current === null) return;
    const dy = touchYRef.current - e.changedTouches[0].clientY;
    if (Math.abs(dy) > 50) goTo(slide + (dy > 0 ? 1 : -1));
    touchYRef.current = null;
  };

  /* Sync dot via IntersectionObserver */
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.55) {
          const idx = Array.from(el.children).indexOf(entry.target);
          if (idx >= 0) setSlide(idx);
        }
      });
    }, { root: el, threshold: 0.55 });
    Array.from(el.children).forEach(c => obs.observe(c));
    return () => obs.disconnect();
  }, [total]);

  /* ── Utilitários ── */
  const nameParts = (evento.nome_evento || "").split(/[&]/).map(s => s.trim()).filter(Boolean);
  const dateDots  = evento.data_evento
    ? new Date(evento.data_evento).toLocaleDateString("pt-PT", { day: "2-digit", month: "2-digit", year: "numeric" }).replace(/\//g, " · ")
    : "";
  const dateLong  = evento.data_evento
    ? new Date(evento.data_evento).toLocaleDateString("pt-PT", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })
    : "";

  const renderVideo = (url, key) => {
    if (!url?.trim()) return null;
    const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
    const vm = url.match(/vimeo\.com\/(\d+)/);
    if (yt) return (
      <iframe key={key}
        src={`https://www.youtube.com/embed/${yt[1]}?rel=0&controls=1&modestbranding=1`}
        style={{ width: "100%", height: "100%", border: "none" }}
        allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture"
        allowFullScreen title="Video" />
    );
    if (vm) return (
      <iframe key={key}
        src={`https://player.vimeo.com/video/${vm[1]}?title=0&byline=0&portrait=0`}
        style={{ width: "100%", height: "100%", border: "none" }}
        allow="autoplay;fullscreen;picture-in-picture"
        allowFullScreen title="Video" />
    );
    return <video key={key} src={url} controls playsInline style={{ width: "100%", height: "100%", objectFit: "cover" }} />;
  };

  const inputStyle = {
    width: "100%", padding: "11px 13px",
    borderRadius: "6px",
    border: "1px solid rgba(0,0,0,0.1)",
    background: WHITE, color: DARK, fontSize: "13px",
    outline: "none", boxSizing: "border-box",
    transition: "border-color 0.2s"
  };
  const labelStyle = {
    color: "rgba(0,0,0,0.38)", fontSize: "7.5px", fontWeight: 700,
    display: "block", marginBottom: "5px",
    letterSpacing: "2px", textTransform: "uppercase"
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro("");
    setSub(true);
    if (!form.nome_convidado.trim()) { setErro("O nome é obrigatório."); setSub(false); return; }
    try {
      await confirmacoesAPI.criar(evento.id, form);
      setEnviado(true);
    } catch (err) {
      setErro(err.message || "Erro ao enviar. Tente novamente.");
    }
    setSub(false);
  };

  /* ── Render de cada slide ── */
  const renderSlide = (tipo, idx) => {

    /* ────── HERO ────── */
    if (tipo === "hero") return (
      <div key={idx} className="fslide" style={{ background: CREAM, display: "flex", flexDirection: "column" }}>

        {/* Foto de capa — 55% superior com overlay escuro */}
        <div style={{ flex: "0 0 55%", position: "relative", overflow: "hidden", background: DARK }}>
          {fotos[0]
            ? <img src={fotos[0]} alt="Capa" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            : <div style={{
                width: "100%", height: "100%",
                background: `linear-gradient(160deg, ${FRAME_BG}, ${DARK})`,
                display: "flex", alignItems: "center", justifyContent: "center"
              }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none"
                  stroke={`${GOLD_A}0.12)`} strokeWidth="0.8">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21,15 16,10 5,21" />
                </svg>
              </div>
          }

          {/* Overlay gradiente escuro sobre a foto */}
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(to bottom, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0.52) 60%, rgba(0,0,0,0.72) 100%)"
          }} />

          {/* Nome do evento SOBRE a foto */}
          <div style={{
            position: "absolute", bottom: "20px", left: 0, right: 0,
            padding: "0 24px", textAlign: "center"
          }}>
            {nameParts.length >= 2 ? (
              <h1 style={{
                fontFamily: "'Cormorant Garamond',serif",
                fontSize: "clamp(22px,5.5vw,36px)",
                fontWeight: 600, color: WHITE, margin: 0,
                lineHeight: 1.1, letterSpacing: "0.5px",
                textShadow: "0 2px 12px rgba(0,0,0,0.5)"
              }}>
                {nameParts[0]}
                <span style={{ color: GOLD, fontStyle: "italic", margin: "0 8px" }}>&amp;</span>
                {nameParts[1]}
              </h1>
            ) : (
              <h1 style={{
                fontFamily: "'Cormorant Garamond',serif",
                fontSize: "clamp(20px,5vw,34px)",
                fontWeight: 600, color: WHITE, margin: 0,
                lineHeight: 1.2,
                textShadow: "0 2px 12px rgba(0,0,0,0.5)"
              }}>{evento.nome_evento}</h1>
            )}
          </div>

          {/* Fade para creme */}
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0,
            height: "30px",
            background: `linear-gradient(to top, ${CREAM}, transparent)`
          }} />
        </div>

        {/* Conteúdo inferior creme */}
        <div style={{
          flex: 1, display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          padding: "16px 24px 30px", textAlign: "center"
        }}>

          {/* Nome do convidado */}
          {nomeConv && (
            <p style={{
              fontFamily: "'Cormorant Garamond',serif",
              color: "rgba(0,0,0,0.45)", fontSize: "clamp(13px,3vw,16px)",
              fontStyle: "italic", margin: "0 0 12px", lineHeight: 1.4
            }}>
              Para <strong style={{ fontStyle: "normal", fontWeight: 600 }}>
                {relConv ? `${relConv} ${nomeConv}` : nomeConv}
              </strong>
            </p>
          )}

          {/* Data com pontos dourados · hora · local */}
          <div style={{
            display: "flex", gap: "7px", justifyContent: "center",
            flexWrap: "wrap", alignItems: "center", marginBottom: "14px"
          }}>
            {dateDots && (
              <span style={{ color: DARK, fontSize: "12px", fontWeight: 500, letterSpacing: "0.5px" }}>
                {dateDots}
              </span>
            )}
            {dateDots && evento.hora_evento && (
              <span style={{ color: GOLD, fontSize: "14px", lineHeight: 1 }}>◆</span>
            )}
            {evento.hora_evento && (
              <span style={{ color: DARK, fontSize: "12px", fontWeight: 500 }}>{evento.hora_evento}h</span>
            )}
            {evento.local_evento && (
              <>
                <span style={{ color: GOLD, fontSize: "14px", lineHeight: 1 }}>◆</span>
                <span style={{ color: "rgba(0,0,0,0.45)", fontSize: "11px" }}>{evento.local_evento}</span>
              </>
            )}
          </div>

          {/* Citação / mensagem com barra dourada lateral */}
          {evento.mensagem && (
            <div style={{
              marginTop: "8px", padding: "13px 16px",
              background: `${GOLD_A}0.05)`,
              borderLeft: `2.5px solid ${GOLD_A}0.5)`,
              borderRadius: "0 6px 6px 0",
              textAlign: "left", maxWidth: "290px", width: "100%"
            }}>
              <p style={{
                fontFamily: "'Cormorant Garamond',serif",
                color: "rgba(0,0,0,0.52)", fontSize: "clamp(13px,2.8vw,15px)",
                fontStyle: "italic", lineHeight: 1.75, margin: 0
              }}>"{evento.mensagem}"</p>
            </div>
          )}
        </div>

        <SlideArrow />
      </div>
    );

    /* ────── COUNTDOWN ────── */
    if (tipo === "countdown") return (
      <div key={idx} className="fslide" style={{ background: "#fefcf8", display: "flex", flexDirection: "column" }}>

        {/* Carrossel de fotos */}
        {fotos.length > 0 && (
          <div style={{ flex: "0 0 50%", position: "relative", overflow: "hidden", background: DARK }}>
            <img
              src={fotos[fotoIdx]}
              alt=""
              key={fotos[fotoIdx]}
              style={{ width: "100%", height: "100%", objectFit: "cover", transition: "opacity 0.4s" }}
            />
            <div style={{
              position: "absolute", bottom: 0, left: 0, right: 0,
              height: "70px",
              background: "linear-gradient(to top,#fefcf8,transparent)"
            }} />

            {/* Botões ‹ › */}
            {fotos.length > 1 && (
              <>
                <button
                  onClick={() => setFotoIdx(fi => Math.max(0, fi - 1))}
                  disabled={fotoIdx === 0}
                  style={{
                    position: "absolute", left: "8px", top: "50%",
                    transform: "translateY(-50%)",
                    width: "28px", height: "28px", borderRadius: "50%",
                    background: "rgba(0,0,0,0.48)", border: "none",
                    color: WHITE, fontSize: "16px", cursor: "pointer",
                    opacity: fotoIdx === 0 ? 0.22 : 0.88,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    zIndex: 5, fontWeight: 300, padding: 0
                  }}>‹</button>
                <button
                  onClick={() => setFotoIdx(fi => Math.min(fotos.length - 1, fi + 1))}
                  disabled={fotoIdx === fotos.length - 1}
                  style={{
                    position: "absolute", right: "8px", top: "50%",
                    transform: "translateY(-50%)",
                    width: "28px", height: "28px", borderRadius: "50%",
                    background: "rgba(0,0,0,0.48)", border: "none",
                    color: WHITE, fontSize: "16px", cursor: "pointer",
                    opacity: fotoIdx === fotos.length - 1 ? 0.22 : 0.88,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    zIndex: 5, fontWeight: 300, padding: 0
                  }}>›</button>

                {/* Dots das fotos */}
                <div style={{
                  position: "absolute", bottom: "10px", left: "50%",
                  transform: "translateX(-50%)",
                  display: "flex", gap: "5px", zIndex: 5
                }}>
                  {fotos.map((_, fi) => (
                    <div key={fi} onClick={() => setFotoIdx(fi)} style={{
                      width: fi === fotoIdx ? "14px" : "5px",
                      height: "5px", borderRadius: "3px",
                      background: fi === fotoIdx ? WHITE : "rgba(255,255,255,0.4)",
                      cursor: "pointer", transition: "all 0.3s"
                    }} />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Countdown creme */}
        <div style={{
          flex: 1, display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          padding: "22px 22px", textAlign: "center"
        }}>
          <SectionLabel>Contagem Decrescente</SectionLabel>
          <SectionTitle size="clamp(18px,4vw,26px)">O Grande Dia</SectionTitle>
          <GoldDivider />
          <CountdownDisplay dataEvento={evento.data_evento} horaEvento={evento.hora_evento} />
          <div style={{ marginTop: "18px" }}>
            <p style={{
              color: "rgba(0,0,0,0.38)", fontSize: "10px",
              lineHeight: 1.8, textTransform: "capitalize", margin: 0
            }}>{dateLong}</p>
            {evento.hora_evento && (
              <p style={{
                fontFamily: "'Cormorant Garamond',serif", color: GOLD,
                fontSize: "clamp(22px,5vw,30px)", fontWeight: 500,
                margin: "5px 0 0", letterSpacing: "2px"
              }}>{evento.hora_evento}H</p>
            )}
          </div>
        </div>

        <SlideArrow />
      </div>
    );

    /* ────── VÍDEOS ────── */
    if (tipo === "videos") return (
      <div key={idx} className="fslide" style={{ background: DARK, display: "flex", flexDirection: "column" }}>

        {/* Header vídeos */}
        <div style={{
          padding: "14px 18px 12px",
          background: "rgba(0,0,0,0.5)",
          flexShrink: 0, display: "flex",
          alignItems: "center", justifyContent: "space-between"
        }}>
          <span style={{ color: `${GOLD_A}0.55)`, fontSize: "7.5px", letterSpacing: "3.5px", textTransform: "uppercase" }}>
            Vídeo{videos.length > 1 ? "s" : ""}
          </span>
          {videos.length > 1 && (
            <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "10px" }}>
              {viIdx + 1} / {videos.length}
            </span>
          )}
        </div>

        {/* Player */}
        <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
          {renderVideo(videos[viIdx], viIdx)}
        </div>

        {/* Seletor vídeos */}
        {videos.length > 1 && (
          <div style={{
            background: "rgba(0,0,0,0.68)", padding: "9px",
            display: "flex", gap: "6px", justifyContent: "center"
          }}>
            {videos.map((_, vi) => (
              <button key={vi} onClick={() => setViIdx(vi)} style={{
                width: vi === viIdx ? "16px" : "6px",
                height: "6px", borderRadius: "3px",
                background: vi === viIdx ? GOLD : "rgba(255,255,255,0.2)",
                border: "none", cursor: "pointer",
                transition: "all 0.3s", padding: 0
              }} />
            ))}
          </div>
        )}
      </div>
    );

    /* ────── MAPA ────── */
    if (tipo === "mapa") {
      const mapSrc = process.env.REACT_APP_GOOGLE_MAPS_KEY
        ? `https://www.google.com/maps/embed/v1/place?key=${process.env.REACT_APP_GOOGLE_MAPS_KEY}&q=${encodeURIComponent(evento.endereco_maps || evento.local_evento)}&zoom=15&language=pt`
        : `https://maps.google.com/maps?q=${encodeURIComponent(evento.endereco_maps || evento.local_evento)}&output=embed`;

      return (
        <div key={idx} className="fslide" style={{ display: "flex", flexDirection: "column", background: CREAM }}>

          {/* Header creme */}
          <div style={{
            padding: "20px 20px 14px",
            textAlign: "center",
            background: "#fefcf8", flexShrink: 0,
            borderBottom: `1px solid ${GOLD_A}0.1)`
          }}>
            <SectionLabel>Local do Evento</SectionLabel>
            <SectionTitle size="clamp(18px,4vw,24px)">Onde nos encontramos</SectionTitle>
            <GoldDivider />
            {evento.local_evento && (
              <p style={{ color: "rgba(0,0,0,0.55)", fontSize: "12px", fontWeight: 600, margin: "0 0 3px" }}>
                {evento.local_evento}
              </p>
            )}
            {evento.endereco_maps && (
              <p style={{ color: "rgba(0,0,0,0.3)", fontSize: "10px", margin: 0 }}>{evento.endereco_maps}</p>
            )}
          </div>

          {/* Iframe mapa */}
          <div style={{ flex: 1, minHeight: 0, position: "relative" }}>
            <iframe
              title="mapa"
              src={mapSrc}
              width="100%" height="100%"
              style={{ border: "none", display: "block" }}
              loading="lazy" allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

          {/* Botão Abrir no Maps — preto */}
          <a href={`https://maps.google.com/?q=${encodeURIComponent(evento.endereco_maps || evento.local_evento)}`}
            target="_blank" rel="noreferrer"
            style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              gap: "8px", background: DARK, color: WHITE,
              padding: "14px", fontSize: "8.5px", fontWeight: 700,
              textDecoration: "none", letterSpacing: "3px",
              textTransform: "uppercase", flexShrink: 0
            }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={WHITE} strokeWidth="2.5">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            Abrir no Maps
          </a>
        </div>
      );
    }

    /* ────── PROGRAMA ────── */
    if (tipo === "programa") return (
      <div key={idx} className="fslide-free" style={{ background: "#fefcf8", padding: "28px 22px 44px" }}>
        <SectionLabel>Programa do Evento</SectionLabel>
        <SectionTitle>Agenda</SectionTitle>
        <GoldDivider />

        {/* Timeline com linha dourada */}
        <div style={{ position: "relative", paddingLeft: "52px" }}>
          <div style={{
            position: "absolute", left: "19px", top: 0, bottom: 0,
            width: "1px",
            background: `linear-gradient(to bottom, ${GOLD_A}0.35), ${GOLD_A}0.08))`
          }} />
          {programa.map((p, pi) => (
            <div key={pi} style={{ position: "relative", marginBottom: "24px", animation: "slideIn 0.4s ease" }}>
              {/* Dot da timeline */}
              <div style={{
                position: "absolute", left: "-35px", top: "4px",
                width: "9px", height: "9px", borderRadius: "50%",
                border: `1.5px solid ${GOLD_A}0.6)`,
                background: "#fefcf8"
              }} />
              {/* Hora em ouro */}
              {p.hora && (
                <span style={{
                  display: "block",
                  color: GOLD, fontSize: "9px", fontWeight: 700,
                  letterSpacing: "1px", marginBottom: "3px"
                }}>{p.hora}</span>
              )}
              <h4 style={{ color: DARK, fontSize: "13px", fontWeight: 600, margin: "0 0 4px", letterSpacing: "0.2px" }}>
                {p.nome}
              </h4>
              {p.local_prog && (
                <p style={{ color: "rgba(0,0,0,0.38)", fontSize: "9px", margin: "0 0 3px", textTransform: "uppercase", letterSpacing: "1px" }}>
                  📍 {p.local_prog}
                </p>
              )}
              {p.responsavel && (
                <p style={{ color: "rgba(0,0,0,0.35)", fontSize: "9px", margin: "0 0 3px" }}>
                  👤 {p.responsavel}
                </p>
              )}
              {p.descricao && (
                <p style={{ color: "rgba(0,0,0,0.45)", fontSize: "11px", lineHeight: 1.6, margin: 0 }}>
                  {p.descricao}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    );

    /* ────── REFEIÇÃO ────── */
    if (tipo === "refeicao") return (
      <div key={idx} className="fslide-free" style={{ background: "#fefcf8", padding: "28px 22px 44px" }}>
        <SectionLabel>Gastronomia</SectionLabel>
        <SectionTitle>Refeição</SectionTitle>
        <GoldDivider />

        {pratos.map((p, pi) => (
          <div key={pi} style={{
            display: "flex", gap: "12px",
            marginBottom: "14px", paddingBottom: "14px",
            borderBottom: `1px solid ${GOLD_A}0.1)`
          }}>
            {/* Bullet dourado */}
            <div style={{
              width: "6px", height: "6px", borderRadius: "50%",
              background: GOLD, flexShrink: 0, marginTop: "5px", opacity: 0.7
            }} />
            <div>
              <p style={{ color: DARK, fontSize: "13px", fontWeight: 600, margin: "0 0 3px" }}>{p.nome}</p>
              {p.descricao && (
                <p style={{ color: "rgba(0,0,0,0.38)", fontSize: "10px", margin: 0, lineHeight: 1.5 }}>
                  {p.descricao}
                </p>
              )}
            </div>
          </div>
        ))}

        {bebidas.length > 0 && (
          <>
            {/* Separador elegante */}
            <div style={{
              display: "flex", alignItems: "center", gap: "10px",
              margin: "18px 0"
            }}>
              <div style={{ flex: 1, height: "1px", background: `${GOLD_A}0.12)` }} />
              <svg width="10" height="10" viewBox="0 0 16 16" fill={`${GOLD_A}0.45)`}>
                <polygon points="8,0 10,6 16,6 11,10 13,16 8,12 3,16 5,10 0,6 6,6" />
              </svg>
              <div style={{ flex: 1, height: "1px", background: `${GOLD_A}0.12)` }} />
            </div>
            <SectionLabel>Bebidas</SectionLabel>
            {bebidas.map((b, bi) => (
              <div key={bi} style={{ display: "flex", gap: "12px", marginBottom: "12px" }}>
                <div style={{
                  width: "6px", height: "6px", borderRadius: "50%",
                  background: GOLD, flexShrink: 0, marginTop: "5px", opacity: 0.7
                }} />
                <div>
                  <p style={{ color: DARK, fontSize: "13px", fontWeight: 600, margin: "0 0 3px" }}>{b.nome}</p>
                  {b.descricao && (
                    <p style={{ color: "rgba(0,0,0,0.38)", fontSize: "10px", margin: 0 }}>{b.descricao}</p>
                  )}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    );

    /* ────── RSVP ────── */
    if (tipo === "rsvp") return (
      <div key={idx} className="fslide-free" style={{ background: "#fefcf8", padding: "28px 22px 48px" }}>
        <SectionLabel>Confirmação de Presença</SectionLabel>
        <SectionTitle>RSVP</SectionTitle>
        <GoldDivider />

        {enviado ? (
          /* Após envio: check dourado + mensagem elegante */
          <div style={{ textAlign: "center", paddingTop: "10px" }}>
            <div style={{
              width: "60px", height: "60px", borderRadius: "50%",
              border: `1.5px solid ${GOLD}`,
              background: `${GOLD_A}0.08)`,
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 18px",
              boxShadow: `0 0 0 6px ${GOLD_A}0.06)`
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                stroke={GOLD} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {form.confirmado
                  ? <polyline points="20,6 9,17 4,12" />
                  : <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>
                }
              </svg>
            </div>
            <h3 style={{
              fontFamily: "'Cormorant Garamond',serif",
              color: DARK, fontSize: "24px", fontWeight: 400, margin: "0 0 10px"
            }}>
              {form.confirmado ? "Presença Confirmada" : "Resposta Enviada"}
            </h3>
            <p style={{ color: "rgba(0,0,0,0.38)", fontSize: "13px", lineHeight: 1.7 }}>
              {form.confirmado
                ? `Obrigado, ${form.nome_convidado}! Estamos ansiosos para recebê-lo.`
                : `Obrigado por responder, ${form.nome_convidado}. Sentiremos a sua falta.`
              }
            </p>
          </div>
        ) : (
          /* Formulário minimalista */
          <form onSubmit={handleSubmit}>

            {/* Campos de texto */}
            {[
              { label: "Nome completo *", type: "text",  key: "nome_convidado", placeholder: "O seu nome",        required: true  },
              { label: "Email",           type: "email", key: "email",           placeholder: "seu@email.com",     required: false },
              { label: "Telefone",        type: "tel",   key: "telefone",        placeholder: "+258 84 000 000",   required: false },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: "11px" }}>
                <label style={labelStyle}>{f.label}</label>
                <input
                  type={f.type}
                  value={form[f.key]}
                  onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                  required={f.required}
                  placeholder={f.placeholder}
                  style={inputStyle}
                />
              </div>
            ))}

            {/* Presença: Sim / Não com border dourada quando selecionado */}
            <div style={{ marginBottom: "11px" }}>
              <label style={labelStyle}>Presença *</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "7px" }}>
                {[
                  { v: true,  label: "Sim, vou comparecer" },
                  { v: false, label: "Não posso ir" }
                ].map(opt => (
                  <button key={String(opt.v)} type="button"
                    onClick={() => setForm({ ...form, confirmado: opt.v })}
                    style={{
                      padding: "11px 8px",
                      borderRadius: "6px",
                      border: `1.5px solid ${form.confirmado === opt.v ? GOLD : "rgba(0,0,0,0.1)"}`,
                      background: form.confirmado === opt.v ? `${GOLD_A}0.08)` : WHITE,
                      color: form.confirmado === opt.v ? "#6b4400" : "rgba(0,0,0,0.38)",
                      fontWeight: 600, fontSize: "10px", cursor: "pointer",
                      letterSpacing: "0.5px", textTransform: "uppercase",
                      transition: "all 0.22s"
                    }}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Mensagem */}
            <div style={{ marginBottom: "14px" }}>
              <label style={labelStyle}>Mensagem (opcional)</label>
              <textarea
                value={form.mensagem}
                onChange={e => setForm({ ...form, mensagem: e.target.value })}
                rows="2"
                placeholder="Deixe uma mensagem ao anfitrião..."
                style={{ ...inputStyle, resize: "vertical" }}
              />
            </div>

            {/* Erro */}
            {erro && (
              <div style={{
                background: `${GOLD_A}0.07)`,
                border: `1px solid ${GOLD_A}0.28)`,
                borderRadius: "6px", padding: "9px",
                color: "#7a5000", marginBottom: "11px", fontSize: "11px"
              }}>{erro}</div>
            )}

            {/* Botão submit — preto arredondado, letras espaçadas */}
            <button type="submit" disabled={submitting} style={{
              width: "100%", padding: "14px",
              borderRadius: "50px", border: "none",
              background: DARK, color: WHITE,
              fontSize: "9px", fontWeight: 700,
              cursor: submitting ? "wait" : "pointer",
              opacity: submitting ? 0.5 : 1,
              letterSpacing: "3.5px", textTransform: "uppercase",
              transition: "opacity 0.2s"
            }}>
              {submitting ? "A enviar..." : form.confirmado ? "Confirmar Presença" : "Enviar Resposta"}
            </button>

            {/* SEM botão de partilhar */}
          </form>
        )}
      </div>
    );

    return null;
  };

  /* ── RENDER FRAME ── */
  return (
    <div
      style={{
        width: "100vw", height: "100vh",
        background: "#1a1a1a",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "'Inter',sans-serif"
      }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <style>{GLOBAL_CSS}</style>

      {/* Player de música fixo */}
      {evento.musica_url && <MusicaPlayer url={evento.musica_url} autoPlay={true} />}

      {/* Dots de navegação lateral — direita, fora do frame */}
      <div style={{
        position: "fixed",
        right: "clamp(10px, calc(50vw - min(195px,43vw) - 22px), 999px)",
        top: "50%", transform: "translateY(-50%)",
        display: "flex", flexDirection: "column", gap: "9px",
        zIndex: 200
      }}>
        {slides.map((_, di) => (
          <button key={di} onClick={() => goTo(di)} style={{
            width: di === slide ? "6px" : "5px",
            height: di === slide ? "20px" : "5px",
            borderRadius: "3px",
            background: di === slide ? GOLD : "rgba(200,200,200,0.28)",
            border: "none", cursor: "pointer",
            transition: "all 0.35s cubic-bezier(0.4,0,0.2,1)", padding: 0
          }} />
        ))}
      </div>

      {/* ── FRAME DO TELEMÓVEL ── */}
      <div style={{
        width: "min(390px,90vw)",
        height: "min(780px,94vh)",
        borderRadius: "46px",
        background: FRAME_BG,
        border: `1px solid rgba(255,255,255,0.06)`,
        boxShadow: [
          "0 0 0 1px rgba(255,255,255,0.05)",
          "0 0 0 3px #111",
          "0 60px 120px rgba(0,0,0,0.8)"
        ].join(", "),
        position: "relative", overflow: "hidden",
        display: "flex", flexDirection: "column"
      }}>

        {/* Notch */}
        <div style={{
          flexShrink: 0, height: "28px",
          background: FRAME_BG,
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 10
        }}>
          <div style={{
            width: "78px", height: "6px",
            borderRadius: "3px", background: "#141414"
          }} />
        </div>

        {/* Conteúdo / slides */}
        <div ref={scrollRef} className="fscroll" style={{ flex: 1 }}>
          {slides.map((tipo, i) => renderSlide(tipo, i))}
        </div>

        {/* Barra home */}
        <div style={{
          flexShrink: 0, height: "12px",
          background: FRAME_BG,
          display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <div style={{ width: "46px", height: "3px", borderRadius: "2px", background: "#2c2c2c" }} />
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────
   ENTRY POINT
───────────────────────────────────────────────────── */
function ConvitePublico() {
  const { id }   = useParams();
  const location = useLocation();
  const params   = new URLSearchParams(location.search);
  const nomeConv = params.get("nome");
  const relConv  = params.get("rel");

  const [aberto,  setAberto]  = useState(false);
  const [evento,  setEvento]  = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro,    setErro]    = useState("");

  useEffect(() => {
    convitesAPI.buscarPorId(id)
      .then(d  => setEvento(d))
      .catch(() => setErro("Convite não encontrado."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div style={{ minHeight: "100vh", background: DARK, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <style>{GLOBAL_CSS}</style>
      <div style={{ textAlign: "center" }}>
        <div style={{
          width: "36px", height: "36px",
          border: `1px solid ${GOLD_A}0.22)`,
          borderTopColor: GOLD, borderRadius: "50%",
          animation: "spin 1s linear infinite",
          margin: "0 auto 16px"
        }} />
        <p style={{ color: `${GOLD_A}0.4)`, fontSize: "8px", letterSpacing: "3px", textTransform: "uppercase" }}>
          A carregar
        </p>
      </div>
    </div>
  );

  if (erro || !evento) return (
    <div style={{ minHeight: "100vh", background: DARK, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <style>{GLOBAL_CSS}</style>
      <div style={{ textAlign: "center", padding: "40px 28px" }}>
        <h2 style={{
          fontFamily: "'Cormorant Garamond',serif",
          color: "rgba(255,255,255,0.5)", fontSize: "24px", fontWeight: 400
        }}>Convite não encontrado</h2>
        <p style={{ color: "rgba(255,255,255,0.2)", fontSize: "12px", marginTop: "10px" }}>
          O link pode estar incorreto ou o convite foi removido.
        </p>
      </div>
    </div>
  );

  if (!aberto) return (
    <Envelope
      nome={nomeConv}
      relacao={relConv}
      nomeEvento={evento.nome_evento}
      dataEvento={evento.data_evento}
      horaEvento={evento.hora_evento}
      localEvento={evento.local_evento}
      onAbrir={() => setAberto(true)}
    />
  );

  return <ConviteSlides evento={evento} nomeConv={nomeConv} relConv={relConv} />;
}

export default ConvitePublico;
