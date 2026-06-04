import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useLocation } from "react-router-dom";
import { convitesAPI, confirmacoesAPI } from "../services/api";

/* ─────────────────────────────────────────────────────
   FONTES & ANIMAÇÕES GLOBAIS
───────────────────────────────────────────────────── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600;1,700&family=Inter:wght@300;400;500;600;700&display=swap');
*{box-sizing:border-box;-webkit-tap-highlight-color:transparent;}
html,body{margin:0;padding:0;overflow:hidden;background:#9a9a9a;}
@keyframes fadeUp{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:translateY(0)}}
@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
@keyframes appear{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:translateY(0)}}
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}
@keyframes twinkle{0%,100%{opacity:0.12}50%{opacity:0.7}}
@keyframes pulse{0%,100%{box-shadow:0 0 0 0 rgba(185,148,66,0)}50%{box-shadow:0 0 0 6px rgba(185,148,66,0.12)}}
@keyframes slideIn{from{opacity:0;transform:translateX(8px)}to{opacity:1;transform:translateX(0)}}
input,textarea,button{font-family:'Inter',sans-serif;}
input::placeholder,textarea::placeholder{color:rgba(0,0,0,0.22);}
/* Frame scroll — snap vertical */
.fscroll{height:100%;overflow-y:scroll;scroll-snap-type:y mandatory;-ms-overflow-style:none;scrollbar-width:none;}
.fscroll::-webkit-scrollbar{display:none;}
/* Slide fixo — exactamente 100% da área */
.fslide{height:100%;scroll-snap-align:start;position:relative;overflow:hidden;flex-shrink:0;}
/* Slide livre — pode ter mais conteúdo, scroll interno */
.fslide-free{scroll-snap-align:start;min-height:100%;overflow-y:auto;-webkit-overflow-scrolling:touch;flex-shrink:0;}
.fslide-free::-webkit-scrollbar{width:2px;}
.fslide-free::-webkit-scrollbar-thumb{background:rgba(185,148,66,0.18);border-radius:2px;}
`;

/* ─────────────────────────────────────────────────────
   PALETA
───────────────────────────────────────────────────── */
const G = "#b99442";          /* ouro principal */
const GA = "rgba(185,148,66,"; /* ouro alpha */
const W = "#ffffff";
const D = "#0f0f0f";
const C = "#faf8f4";          /* creme claro */
const C2 = "#f3f0eb";         /* creme médio */

/* ─────────────────────────────────────────────────────
   COMPONENTE: PLAYER DE MÚSICA
───────────────────────────────────────────────────── */
function MusicaPlayer({ url, autoPlay }) {
  const ref = useRef();
  const [on, setOn] = useState(false);
  const tried = useRef(false);

  useEffect(() => {
    const a = ref.current; if (!a || !url) return;
    a.addEventListener("ended", () => setOn(false));
    a.addEventListener("error", () => {});
  }, [url]);

  useEffect(() => {
    if (autoPlay && !tried.current && ref.current && url) {
      tried.current = true;
      ref.current.play().then(() => setOn(true)).catch(() => {});
    }
  }, [autoPlay, url]);

  const tog = () => {
    const a = ref.current; if (!a) return;
    if (on) { a.pause(); setOn(false); }
    else { a.play().then(() => setOn(true)).catch(() => {}); }
  };

  if (!url?.trim()) return null;

  return (
    <div style={{
      position:"fixed", bottom:"18px", left:"18px", zIndex:9999,
      display:"flex", alignItems:"center", gap:"8px",
      background:"rgba(15,15,15,0.88)", backdropFilter:"blur(18px)",
      borderRadius:"50px", padding:"6px 14px 6px 6px",
      border:`1px solid ${GA}0.22)`,
      boxShadow:"0 6px 24px rgba(0,0,0,0.45)"
    }}>
      <audio ref={ref} src={url} loop preload="none" onError={()=>{}} onAbort={()=>{}} onStalled={()=>{}}/>
      <button onClick={tog} style={{
        width:"34px", height:"34px", borderRadius:"50%",
        background: on ? G : `${GA}0.14)`,
        border:`1px solid ${GA}0.35)`,
        cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
        transition:"all 0.3s", flexShrink:0
      }}>
        {on
          ? <svg width="10" height="10" viewBox="0 0 10 10" fill={D}><rect x="0.5" y="0.5" width="3" height="9" rx="1"/><rect x="6.5" y="0.5" width="3" height="9" rx="1"/></svg>
          : <svg width="10" height="10" viewBox="0 0 10 10" fill={G}><polygon points="2,0.5 9.5,5 2,9.5"/></svg>
        }
      </button>
      <span style={{color:on?W:`${GA}0.5)`, fontSize:"8px", fontWeight:600, letterSpacing:"1.5px", textTransform:"uppercase", whiteSpace:"nowrap"}}>
        {on ? "A tocar" : "Música"}
      </span>
    </div>
  );
}

/* ─────────────────────────────────────────────────────
   COMPONENTE: ENVELOPE (ecrã de abertura)
───────────────────────────────────────────────────── */
function Envelope({ nome, relacao, nomeEvento, dataEvento, horaEvento, localEvento, onAbrir }) {
  const [opening, setOpening] = useState(false);
  const open = () => { if (opening) return; setOpening(true); setTimeout(onAbrir, 1050); };
  const parts = nomeEvento ? nomeEvento.split(/[&]/).map(s => s.trim()).filter(Boolean) : [nomeEvento];
  const dateFmt = dataEvento
    ? new Date(dataEvento).toLocaleDateString("pt-PT", { day:"2-digit", month:"long", year:"numeric" })
    : "";

  return (
    <div style={{ minHeight:"100vh", background:D, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Inter',sans-serif", overflow:"hidden", position:"relative" }}>
      <style>{CSS + `
        @keyframes spin-slow{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        .eb:hover .ei{transform:scale(1.07)!important;box-shadow:0 0 36px ${GA}0.22)!important;}
      `}</style>

      {/* Fundo: gradiente tênue */}
      <div style={{ position:"absolute", inset:0, background:`radial-gradient(ellipse 80% 60% at 50% -10%, ${GA}0.09) 0%, transparent 65%)` }}/>
      {/* Linhas decorativas horizontais */}
      <div style={{ position:"absolute", inset:0, pointerEvents:"none" }}>
        {[14,86].map(y => (
          <div key={y} style={{ position:"absolute", top:`${y}%`, left:0, right:0, height:"1px", background:`linear-gradient(to right,transparent,${GA}0.08),transparent)` }}/>
        ))}
      </div>
      {/* Partículas */}
      {Array.from({length:16}).map((_,i) => (
        <div key={i} style={{
          position:"absolute", width:"1.5px", height:"1.5px", borderRadius:"50%",
          background:`${GA}${0.12 + i * 0.04})`,
          top:`${6 + i*5.6}%`, left:`${3 + i*6.2}%`,
          animation:`twinkle ${1.8 + i*0.22}s ease-in-out infinite`, animationDelay:`${i*0.14}s`
        }}/>
      ))}

      {/* Card central */}
      <div style={{
        textAlign:"center", maxWidth:"360px", width:"100%", padding:"44px 32px",
        animation:"appear 1.1s cubic-bezier(0.4,0,0.2,1)", position:"relative", zIndex:2,
        background:"rgba(255,255,255,0.025)", backdropFilter:"blur(12px)",
        border:`1px solid ${GA}0.12)`,
        boxShadow:"0 40px 80px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.04)"
      }}>
        {/* Cantos decorativos */}
        {[["top","left"],["top","right"],["bottom","left"],["bottom","right"]].map(([v,h],ci) => (
          <div key={ci} style={{
            position:"absolute", [v]:"14px", [h]:"14px", width:"16px", height:"16px",
            [`border${v[0].toUpperCase()+v.slice(1)}`]:`1px solid ${GA}0.4)`,
            [`border${h[0].toUpperCase()+h.slice(1)}`]:`1px solid ${GA}0.4)`
          }}/>
        ))}

        {/* Linha decorativa topo */}
        <div style={{ display:"flex", alignItems:"center", gap:"12px", marginBottom:"22px", justifyContent:"center" }}>
          <div style={{ flex:1, height:"1px", background:`linear-gradient(to right,transparent,${GA}0.4))` }}/>
          <svg width="12" height="12" viewBox="0 0 16 16" fill={G}><polygon points="8,0 10,6 16,6 11,10 13,16 8,12 3,16 5,10 0,6 6,6"/></svg>
          <div style={{ flex:1, height:"1px", background:`linear-gradient(to left,transparent,${GA}0.4))` }}/>
        </div>

        {/* Label */}
        <p style={{ color:`${GA}0.55)`, fontSize:"8px", fontWeight:700, letterSpacing:"5px", textTransform:"uppercase", marginBottom:"14px" }}>
          {nome ? (relacao ? relacao.toUpperCase()+" DE HONRA" : "CONVIDADO ESPECIAL") : "CONVITE PARA"}
        </p>

        {/* Título principal */}
        {nome ? (
          <h1 style={{ fontFamily:"'Cormorant Garamond',serif", color:W, fontSize:"clamp(30px,8vw,50px)", fontWeight:500, fontStyle:"italic", lineHeight:1.05, margin:"0 0 18px" }}>{nome}</h1>
        ) : parts.length >= 2 ? (
          <div style={{ marginBottom:"18px" }}>
            <h1 style={{ fontFamily:"'Cormorant Garamond',serif", color:W, fontSize:"clamp(28px,7vw,46px)", fontWeight:500, fontStyle:"italic", lineHeight:1, margin:0 }}>{parts[0]}</h1>
            <p style={{ fontFamily:"'Cormorant Garamond',serif", color:G, fontSize:"clamp(20px,5vw,32px)", margin:"4px 0", letterSpacing:"6px" }}>&</p>
            <h1 style={{ fontFamily:"'Cormorant Garamond',serif", color:W, fontSize:"clamp(28px,7vw,46px)", fontWeight:500, fontStyle:"italic", lineHeight:1, margin:0 }}>{parts[1]}</h1>
          </div>
        ) : (
          <h1 style={{ fontFamily:"'Cormorant Garamond',serif", color:W, fontSize:"clamp(22px,6vw,40px)", fontWeight:500, fontStyle:"italic", lineHeight:1.1, marginBottom:"18px" }}>{nomeEvento}</h1>
        )}

        {/* Separador */}
        <div style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"14px", justifyContent:"center" }}>
          <div style={{ flex:1, height:"1px", background:`linear-gradient(to right,transparent,${GA}0.28))` }}/>
          <div style={{ width:"4px", height:"4px", borderRadius:"50%", background:G }}/>
          <div style={{ flex:1, height:"1px", background:`linear-gradient(to left,transparent,${GA}0.28))` }}/>
        </div>

        {/* Subtítulo (evento quando há nome de convidado) */}
        {nome && (
          <p style={{ fontFamily:"'Cormorant Garamond',serif", color:`rgba(255,255,255,0.45)`, fontSize:"clamp(13px,3vw,17px)", fontStyle:"italic", margin:"0 0 14px" }}>
            {parts.length>=2 ? `${parts[0]} & ${parts[1]}` : nomeEvento}
          </p>
        )}

        {/* Data / hora / local */}
        <div style={{ display:"flex", gap:"6px", justifyContent:"center", marginBottom:"28px", flexWrap:"wrap" }}>
          {dateFmt && <span style={{ color:"rgba(255,255,255,0.38)", fontSize:"11px" }}>{dateFmt}</span>}
          {dateFmt && horaEvento && <span style={{ color:`${GA}0.35)`, fontSize:"11px" }}>·</span>}
          {horaEvento && <span style={{ color:"rgba(255,255,255,0.38)", fontSize:"11px" }}>{horaEvento}</span>}
          {localEvento && <span style={{ color:"rgba(255,255,255,0.25)", fontSize:"11px" }}>· {localEvento}</span>}
        </div>

        {/* Botão abrir */}
        <div style={{ animation:"float 3s ease-in-out infinite" }}>
          <div onClick={open} className="eb" style={{ position:"relative", width:"96px", height:"96px", margin:"0 auto", cursor:opening?"wait":"pointer" }}>
            <svg viewBox="0 0 96 96" style={{ position:"absolute", inset:0, width:"100%", height:"100%", animation:"spin-slow 18s linear infinite" }}>
              <defs><path id="cp" d="M 48,48 m -36,0 a 36,36 0 1,1 72,0 a 36,36 0 1,1 -72,0"/></defs>
              <text style={{ fontSize:"6.5px", fill:`${GA}0.45)`, fontWeight:600, letterSpacing:"2.5px" }}>
                <textPath href="#cp">ABRIR CONVITE ◆ ABRIR CONVITE ◆ ABRIR </textPath>
              </text>
            </svg>
            <div className="ei" style={{
              position:"absolute", inset:"12px", borderRadius:"50%",
              background:`${GA}0.08)`, border:`1px solid ${GA}0.3)`,
              display:"flex", alignItems:"center", justifyContent:"center",
              transition:"transform 0.35s, box-shadow 0.35s",
              animation: opening ? "none" : "pulse 2.8s ease-in-out infinite"
            }}>
              {opening
                ? <div style={{ width:"16px", height:"16px", border:`1.5px solid ${GA}0.25)`, borderTopColor:G, borderRadius:"50%", animation:"spin 0.8s linear infinite" }}/>
                : <svg width="26" height="20" viewBox="0 0 32 26" fill="none">
                    <rect x="1" y="1" width="30" height="24" rx="3" stroke={G} strokeWidth="1.2"/>
                    <path d="M1 5l15 10L31 5" stroke={G} strokeWidth="1.2" strokeLinecap="round"/>
                    <path d="M1 21l9-7M31 21l-9-7" stroke={`${GA}0.28)`} strokeWidth="1" strokeLinecap="round"/>
                  </svg>
              }
            </div>
          </div>
        </div>

        {opening
          ? <p style={{ color:`${GA}0.45)`, fontSize:"8px", marginTop:"14px", letterSpacing:"3px", textTransform:"uppercase" }}>A abrir...</p>
          : <p style={{ color:"rgba(255,255,255,0.15)", fontSize:"8px", marginTop:"12px", letterSpacing:"2px", textTransform:"uppercase" }}>Toque para abrir</p>
        }
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────
   COMPONENTE: COUNTDOWN
───────────────────────────────────────────────────── */
function Countdown({ evento }) {
  const [t, setT] = useState({ d:0, h:0, m:0, s:0 });
  useEffect(() => {
    const calc = () => {
      try {
        const [y,mo,da] = (evento.data_evento||"").substring(0,10).split("-").map(Number);
        const [hh,mm] = (evento.hora_evento||"00:00").split(":").map(Number);
        const diff = new Date(y,mo-1,da,hh||0,mm||0,0) - new Date();
        if (isNaN(diff)||diff<=0) { setT({d:0,h:0,m:0,s:0}); return; }
        setT({ d:Math.floor(diff/86400000), h:Math.floor((diff%86400000)/3600000), m:Math.floor((diff%3600000)/60000), s:Math.floor((diff%60000)/1000) });
      } catch { setT({d:0,h:0,m:0,s:0}); }
    };
    calc();
    const iv = setInterval(calc, 1000);
    return () => clearInterval(iv);
  }, [evento.data_evento, evento.hora_evento]);

  return (
    <div style={{ display:"flex", gap:"14px", justifyContent:"center", flexWrap:"wrap" }}>
      {[{v:t.d,l:"Dias"},{v:t.h,l:"Horas"},{v:t.m,l:"Min"},{v:t.s,l:"Seg"}].map(({v,l}) => (
        <div key={l} style={{ textAlign:"center" }}>
          <div style={{ width:"60px", height:"60px", borderRadius:"50%", border:`1px solid ${GA}0.28)`, background:`${GA}0.05)`, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 7px" }}>
            <span style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"24px", fontWeight:500, color:D }}>{String(v).padStart(2,"0")}</span>
          </div>
          <span style={{ fontSize:"7.5px", color:"rgba(0,0,0,0.38)", letterSpacing:"2.5px", textTransform:"uppercase", fontWeight:600 }}>{l}</span>
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────
   HELPERS VISUAIS (inline — sem estado)
───────────────────────────────────────────────────── */
const Lbl = ({children}) => (
  <p style={{ color:`${GA}0.7)`, fontSize:"7.5px", fontWeight:700, letterSpacing:"4px", textTransform:"uppercase", textAlign:"center", margin:"0 0 8px" }}>{children}</p>
);
const Title = ({children, size}) => (
  <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize: size||"clamp(22px,5vw,32px)", fontWeight:400, color:D, textAlign:"center", margin:"0 0 4px", letterSpacing:"0.3px" }}>{children}</h2>
);
const Hr = () => (
  <div style={{ display:"flex", alignItems:"center", gap:"10px", justifyContent:"center", margin:"10px auto 20px", width:"80px" }}>
    <div style={{ flex:1, height:"1px", background:`linear-gradient(to right,transparent,${GA}0.45))` }}/>
    <div style={{ width:"4px", height:"4px", transform:"rotate(45deg)", background:G, opacity:0.7 }}/>
    <div style={{ flex:1, height:"1px", background:`linear-gradient(to left,transparent,${GA}0.45))` }}/>
  </div>
);
const Arrow = () => (
  <div style={{ position:"absolute", bottom:"16px", left:"50%", transform:"translateX(-50%)", opacity:0.35 }}>
    <svg width="16" height="9" viewBox="0 0 16 9" fill="none"><path d="M1.5 1.5L8 7.5L14.5 1.5" stroke={G} strokeWidth="1.5" strokeLinecap:"round" strokeLinejoin:"round"/></svg>
  </div>
);

/* ─────────────────────────────────────────────────────
   COMPONENTE PRINCIPAL: ConviteSlides
   Frame de telemóvel + slides verticais com snap
───────────────────────────────────────────────────── */
function ConviteSlides({ evento, nomeConv, relConv }) {
  const [slide, setSlide]       = useState(0);
  const [enviado, setEnviado]   = useState(false);
  const [erro, setErro]         = useState("");
  const [submitting, setSub]    = useState(false);
  const [form, setForm]         = useState({ nome_convidado:nomeConv||"", email:"", telefone:"", confirmado:true, mensagem:"" });
  const [viIdx, setViIdx]       = useState(0);

  const scrollRef  = useRef();
  const lockRef    = useRef(false);
  const touchY     = useRef(null);

  /* ── Dados do evento ── */
  const programa = (() => { try { return (Array.isArray(evento.programa)?evento.programa:JSON.parse(evento.programa||"[]")).filter(p=>p.nome); } catch { return []; } })();
  const refData  = (() => { try { return typeof evento.refeicao==="object"?evento.refeicao:JSON.parse(evento.refeicao||"{}"); } catch { return {}; } })();
  const pratos   = (refData?.pratos||[]).filter(p=>p.nome);
  const bebidas  = (refData?.bebidas||[]).filter(b=>b.nome);
  const fotos    = [...(evento.foto_capa?[evento.foto_capa]:[]), ...(Array.isArray(evento.fotos)?evento.fotos.filter(Boolean):[])].filter((f,i,a)=>a.indexOf(f)===i);
  const videos   = [...(Array.isArray(evento.videos_urls)?evento.videos_urls:[]), ...(evento.video_url&&!Array.isArray(evento.videos_urls)?[evento.video_url]:[])].filter(Boolean);

  /* ── Lista de slides ── */
  const slides = [
    "hero",
    "countdown",
    ...(videos.length ? ["videos"] : []),
    ...((evento.endereco_maps||evento.local_evento) ? ["mapa"] : []),
    ...(programa.length ? ["programa"] : []),
    ...((pratos.length||bebidas.length) ? ["refeicao"] : []),
    "rsvp",
  ];
  const total = slides.length;

  /* ── Navegação ── */
  const goTo = useCallback((n) => {
    const next = Math.max(0, Math.min(total-1, n));
    if (next === slide) return;
    setSlide(next);
    scrollRef.current?.children[next]?.scrollIntoView({ behavior:"smooth", block:"start" });
  }, [slide, total]);

  useEffect(() => {
    const h = (e) => {
      if (e.key==="ArrowDown"||e.key==="PageDown") goTo(slide+1);
      if (e.key==="ArrowUp"||e.key==="PageUp")   goTo(slide-1);
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [slide, goTo]);

  useEffect(() => {
    const el = scrollRef.current; if (!el) return;
    const onW = (e) => {
      if (lockRef.current) return;
      lockRef.current = true;
      setTimeout(() => { lockRef.current = false; }, 750);
      goTo(slide + (e.deltaY > 0 ? 1 : -1));
    };
    el.addEventListener("wheel", onW, { passive:true });
    return () => el.removeEventListener("wheel", onW);
  }, [slide, goTo]);

  const onTS = (e) => { touchY.current = e.touches[0].clientY; };
  const onTE = (e) => {
    if (touchY.current === null) return;
    const dy = touchY.current - e.changedTouches[0].clientY;
    if (Math.abs(dy) > 48) goTo(slide + (dy > 0 ? 1 : -1));
    touchY.current = null;
  };

  /* Sync dot via IntersectionObserver */
  useEffect(() => {
    const el = scrollRef.current; if (!el) return;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting && e.intersectionRatio >= 0.55) {
          const i = Array.from(el.children).indexOf(e.target);
          if (i >= 0) setSlide(i);
        }
      });
    }, { root:el, threshold:0.55 });
    Array.from(el.children).forEach(c => obs.observe(c));
    return () => obs.disconnect();
  }, [total]);

  /* ── Utilitários ── */
  const parts   = (evento.nome_evento||"").split(/[&]/).map(s=>s.trim()).filter(Boolean);
  const dateDot = evento.data_evento ? new Date(evento.data_evento).toLocaleDateString("pt-PT",{day:"2-digit",month:"2-digit",year:"numeric"}).replace(/\//g," · ") : "";
  const dateLong= evento.data_evento ? new Date(evento.data_evento).toLocaleDateString("pt-PT",{weekday:"long",day:"2-digit",month:"long",year:"numeric"}) : "";

  const renderVid = (url, key) => {
    if (!url?.trim()) return null;
    const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
    const vm = url.match(/vimeo\.com\/(\d+)/);
    if (yt) return <iframe key={key} src={"https://www.youtube.com/embed/"+yt[1]+"?rel=0&controls=1&modestbranding=1"} style={{width:"100%",height:"100%",border:"none"}} allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture" allowFullScreen title="Video"/>;
    if (vm) return <iframe key={key} src={"https://player.vimeo.com/video/"+vm[1]+"?title=0&byline=0&portrait=0"} style={{width:"100%",height:"100%",border:"none"}} allow="autoplay;fullscreen;picture-in-picture" allowFullScreen title="Video"/>;
    return <video key={key} src={url} controls playsInline style={{width:"100%",height:"100%",objectFit:"cover"}}/>;
  };

  const inpStyle = { width:"100%", padding:"10px 12px", borderRadius:"4px", border:"1px solid rgba(0,0,0,0.1)", background:W, color:D, fontSize:"13px", outline:"none", boxSizing:"border-box", transition:"border-color 0.2s" };
  const lblStyle = { color:"rgba(0,0,0,0.38)", fontSize:"8px", fontWeight:700, display:"block", marginBottom:"4px", letterSpacing:"2px", textTransform:"uppercase" };

  const submit = async (e) => {
    e.preventDefault(); setErro(""); setSub(true);
    if (!form.nome_convidado.trim()) { setErro("O nome é obrigatório."); setSub(false); return; }
    try { await confirmacoesAPI.criar(evento.id, form); setEnviado(true); }
    catch(err) { setErro(err.message||"Erro ao enviar."); }
    setSub(false);
  };

  /* ── Render de cada slide ── */
  const renderSlide = (tipo, i) => {

    /* ── HERO ── */
    if (tipo === "hero") return (
      <div key={i} className="fslide" style={{ background:C, display:"flex", flexDirection:"column" }}>
        {/* Foto de capa — metade superior */}
        <div style={{ flex:"0 0 52%", position:"relative", overflow:"hidden", background:D }}>
          {fotos[0]
            ? <img src={fotos[0]} alt="" style={{ width:"100%", height:"100%", objectFit:"cover", filter:"brightness(0.85)" }}/>
            : <div style={{ width:"100%", height:"100%", background:`linear-gradient(160deg,#1c1c1c,${D})`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke={`${GA}0.15)`} strokeWidth="0.8"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21,15 16,10 5,21"/></svg>
              </div>
          }
          {/* Fade para baixo */}
          <div style={{ position:"absolute", bottom:0, left:0, right:0, height:"90px", background:`linear-gradient(to top,${C},transparent)` }}/>
        </div>

        {/* Conteúdo inferior */}
        <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"14px 24px 24px", textAlign:"center" }}>
          <p style={{ color:"rgba(0,0,0,0.32)", fontSize:"7.5px", fontWeight:700, letterSpacing:"4.5px", textTransform:"uppercase", marginBottom:"10px" }}>
            {nomeConv ? "CONVITE ESPECIAL PARA" : "CONVITE"}
          </p>

          {/* Nome do evento */}
          {parts.length >= 2 ? (
            <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"clamp(24px,6vw,36px)", fontWeight:400, color:D, margin:"0 0 6px", letterSpacing:"-0.3px", lineHeight:1.1 }}>
              {parts[0]} <span style={{ fontStyle:"italic", color:G }}>&amp;</span> {parts[1]}
            </h1>
          ) : (
            <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"clamp(20px,5vw,32px)", fontWeight:400, color:D, margin:"0 0 6px", lineHeight:1.2 }}>{evento.nome_evento}</h1>
          )}

          {/* Nome do convidado */}
          {nomeConv && (
            <p style={{ fontFamily:"'Cormorant Garamond',serif", color:"rgba(0,0,0,0.5)", fontSize:"clamp(13px,3vw,17px)", fontStyle:"italic", margin:"6px 0 0", lineHeight:1.4 }}>
              Para <strong style={{ fontStyle:"normal", fontWeight:500 }}>{relConv ? `${relConv} ${nomeConv}` : nomeConv}</strong>
            </p>
          )}

          {/* Data */}
          <p style={{ color:`${GA}0.75)`, fontSize:"11px", letterSpacing:"3.5px", margin:"10px 0 4px", fontWeight:500 }}>{dateDot}</p>
          {evento.local_evento && <p style={{ color:"rgba(0,0,0,0.32)", fontSize:"10px", margin:0 }}>📍 {evento.local_evento}</p>}

          {/* Mensagem */}
          {evento.mensagem && (
            <p style={{ fontFamily:"'Cormorant Garamond',serif", color:"rgba(0,0,0,0.45)", fontSize:"clamp(12px,2.5vw,14px)", fontStyle:"italic", lineHeight:1.65, margin:"12px 0 0", maxWidth:"260px" }}>
              "{evento.mensagem}"
            </p>
          )}
        </div>

        <Arrow/>
      </div>
    );

    /* ── COUNTDOWN ── */
    if (tipo === "countdown") return (
      <div key={i} className="fslide" style={{ background:"#fefcf8", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"28px 22px", textAlign:"center" }}>
        <Lbl>Contagem Decrescente</Lbl>
        <Title>O Grande Dia</Title>
        <Hr/>
        <Countdown evento={evento}/>
        <div style={{ marginTop:"22px" }}>
          <p style={{ color:"rgba(0,0,0,0.38)", fontSize:"11px", lineHeight:1.8, textTransform:"capitalize" }}>{dateLong}</p>
          {evento.hora_evento && (
            <p style={{ fontFamily:"'Cormorant Garamond',serif", color:G, fontSize:"clamp(22px,5vw,30px)", fontWeight:500, margin:"6px 0 0", letterSpacing:"1px" }}>{evento.hora_evento}H</p>
          )}
        </div>
        <Arrow/>
      </div>
    );

    /* ── VÍDEOS ── */
    if (tipo === "videos") return (
      <div key={i} className="fslide" style={{ background:D, display:"flex", flexDirection:"column" }}>
        <div style={{ padding:"12px 16px 10px", background:"rgba(0,0,0,0.45)", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <span style={{ color:`${GA}0.5)`, fontSize:"7.5px", letterSpacing:"3px", textTransform:"uppercase" }}>Vídeo{videos.length>1?"s":""}</span>
          {videos.length > 1 && <span style={{ color:"rgba(255,255,255,0.35)", fontSize:"10px" }}>{viIdx+1} / {videos.length}</span>}
        </div>
        <div style={{ flex:1, overflow:"hidden", position:"relative" }}>{renderVid(videos[viIdx], viIdx)}</div>
        {videos.length > 1 && (
          <div style={{ background:"rgba(0,0,0,0.65)", padding:"8px", display:"flex", gap:"5px", justifyContent:"center" }}>
            {videos.map((_,vi) => (
              <button key={vi} onClick={() => setViIdx(vi)} style={{ width:vi===viIdx?"14px":"5px", height:"5px", borderRadius:"3px", background:vi===viIdx?G:"rgba(255,255,255,0.18)", border:"none", cursor:"pointer", transition:"all 0.3s", padding:0 }}/>
            ))}
          </div>
        )}
      </div>
    );

    /* ── MAPA ── */
    if (tipo === "mapa") {
      const mapSrc = process.env.REACT_APP_GOOGLE_MAPS_KEY
        ? `https://www.google.com/maps/embed/v1/place?key=${process.env.REACT_APP_GOOGLE_MAPS_KEY}&q=${encodeURIComponent(evento.endereco_maps||evento.local_evento)}&zoom=15&language=pt`
        : `https://maps.google.com/maps?q=${encodeURIComponent(evento.endereco_maps||evento.local_evento)}&output=embed`;
      return (
        <div key={i} className="fslide" style={{ display:"flex", flexDirection:"column", background:C }}>
          <div style={{ padding:"18px 18px 12px", textAlign:"center", background:"#fefcf8", flexShrink:0, borderBottom:`1px solid ${GA}0.1)` }}>
            <Lbl>Local do Evento</Lbl>
            <Title size="clamp(18px,4vw,24px)">Onde nos encontramos</Title>
            <Hr/>
            <p style={{ color:"rgba(0,0,0,0.5)", fontSize:"12px", fontWeight:600, margin:"0 0 3px" }}>{evento.local_evento}</p>
            {evento.endereco_maps && <p style={{ color:"rgba(0,0,0,0.3)", fontSize:"10px", margin:0 }}>{evento.endereco_maps}</p>}
          </div>
          <div style={{ flex:1, minHeight:0, position:"relative" }}>
            <iframe title="mapa" src={mapSrc} width="100%" height="100%" style={{ border:"none", display:"block" }} loading="lazy" allowFullScreen referrerPolicy="no-referrer-when-downgrade"/>
          </div>
          <a href={`https://maps.google.com/?q=${encodeURIComponent(evento.endereco_maps||evento.local_evento)}`} target="_blank" rel="noreferrer"
            style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:"7px", background:D, color:W, padding:"13px", fontSize:"8.5px", fontWeight:700, textDecoration:"none", letterSpacing:"2.5px", textTransform:"uppercase", flexShrink:0 }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={W} strokeWidth="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            Abrir no Maps
          </a>
        </div>
      );
    }

    /* ── PROGRAMA ── */
    if (tipo === "programa") return (
      <div key={i} className="fslide-free" style={{ background:"#fefcf8", padding:"26px 20px 40px" }}>
        <Lbl>Programa do Evento</Lbl>
        <Title>Agenda</Title>
        <Hr/>
        <div style={{ position:"relative", paddingLeft:"48px" }}>
          <div style={{ position:"absolute", left:"17px", top:0, bottom:0, width:"1px", background:`${GA}0.18)` }}/>
          {programa.map((p,pi) => (
            <div key={pi} style={{ position:"relative", marginBottom:"22px", animation:"slideIn 0.4s ease" }}>
              <div style={{ position:"absolute", left:"-33px", top:"3px", width:"8px", height:"8px", borderRadius:"50%", border:`1px solid ${GA}0.5)`, background:"#fefcf8" }}/>
              {p.hora && <span style={{ position:"absolute", left:"-48px", top:"0", color:G, fontSize:"9px", fontWeight:700, whiteSpace:"nowrap", letterSpacing:"0.5px" }}>{p.hora}</span>}
              <h4 style={{ color:D, fontSize:"13px", fontWeight:600, margin:"0 0 3px", letterSpacing:"0.2px" }}>{p.nome}</h4>
              {p.local_prog && <p style={{ color:"rgba(0,0,0,0.38)", fontSize:"9px", margin:"0 0 2px", textTransform:"uppercase", letterSpacing:"1px" }}>📍 {p.local_prog}</p>}
              {p.responsavel && <p style={{ color:"rgba(0,0,0,0.35)", fontSize:"9px", margin:"0 0 2px" }}>👤 {p.responsavel}</p>}
              {p.descricao && <p style={{ color:"rgba(0,0,0,0.45)", fontSize:"11px", lineHeight:1.55, margin:0 }}>{p.descricao}</p>}
            </div>
          ))}
        </div>
      </div>
    );

    /* ── REFEIÇÃO ── */
    if (tipo === "refeicao") return (
      <div key={i} className="fslide-free" style={{ background:"#fefcf8", padding:"26px 20px 40px" }}>
        <Lbl>Gastronomia</Lbl>
        <Title>Refeição</Title>
        <Hr/>
        {pratos.map((p,pi) => (
          <div key={pi} style={{ display:"flex", gap:"10px", marginBottom:"13px", paddingBottom:"13px", borderBottom:`1px solid ${GA}0.1)` }}>
            <div style={{ width:"5px", height:"5px", borderRadius:"50%", background:`${GA}0.5)`, flexShrink:0, marginTop:"5px" }}/>
            <div>
              <p style={{ color:D, fontSize:"12px", fontWeight:600, margin:"0 0 2px" }}>{p.nome}</p>
              {p.descricao && <p style={{ color:"rgba(0,0,0,0.38)", fontSize:"10px", margin:0, lineHeight:1.5 }}>{p.descricao}</p>}
            </div>
          </div>
        ))}
        {bebidas.length > 0 && (
          <>
            <div style={{ height:"1px", background:`${GA}0.1)`, margin:"16px 0" }}/>
            <Lbl>Bebidas</Lbl>
            {bebidas.map((b,bi) => (
              <div key={bi} style={{ display:"flex", gap:"10px", marginBottom:"10px" }}>
                <div style={{ width:"5px", height:"5px", borderRadius:"50%", background:`${GA}0.5)`, flexShrink:0, marginTop:"5px" }}/>
                <div>
                  <p style={{ color:D, fontSize:"12px", fontWeight:600, margin:"0 0 2px" }}>{b.nome}</p>
                  {b.descricao && <p style={{ color:"rgba(0,0,0,0.38)", fontSize:"10px", margin:0 }}>{b.descricao}</p>}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    );

    /* ── RSVP ── */
    if (tipo === "rsvp") return (
      <div key={i} className="fslide-free" style={{ background:"#fefcf8", padding:"26px 20px 44px" }}>
        <Lbl>Confirmação de Presença</Lbl>
        <Title>RSVP</Title>
        <Hr/>
        {enviado ? (
          <div style={{ textAlign:"center", paddingTop:"8px" }}>
            <div style={{ width:"56px", height:"56px", borderRadius:"50%", border:`1px solid ${G}`, background:`${GA}0.1)`, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 14px", color:G, fontSize:"22px" }}>
              {form.confirmado ? "✓" : "✗"}
            </div>
            <h3 style={{ fontFamily:"'Cormorant Garamond',serif", color:D, fontSize:"22px", fontWeight:400, margin:"0 0 8px" }}>
              {form.confirmado ? "Presença Confirmada" : "Resposta Enviada"}
            </h3>
            <p style={{ color:"rgba(0,0,0,0.38)", fontSize:"12px", lineHeight:1.65 }}>
              {form.confirmado ? `Obrigado, ${form.nome_convidado}! Até breve.` : `Obrigado por responder, ${form.nome_convidado}.`}
            </p>
          </div>
        ) : (
          <form onSubmit={submit}>
            {[
              { l:"Nome completo *", t:"text",  k:"nome_convidado", p:"O seu nome", r:true },
              { l:"Email",          t:"email", k:"email",           p:"seu@email.com" },
              { l:"Telefone",       t:"tel",   k:"telefone",        p:"+258 84 000 000" },
            ].map(f => (
              <div key={f.k} style={{ marginBottom:"10px" }}>
                <label style={lblStyle}>{f.l}</label>
                <input type={f.t} value={form[f.k]} onChange={e=>setForm({...form,[f.k]:e.target.value})} required={!!f.r} placeholder={f.p} style={inpStyle}/>
              </div>
            ))}
            <div style={{ marginBottom:"10px" }}>
              <label style={lblStyle}>Presença *</label>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"6px" }}>
                {[{v:true,l:"✓ Sim, vou comparecer"},{v:false,l:"✗ Não posso ir"}].map(opt => (
                  <button key={String(opt.v)} type="button" onClick={() => setForm({...form, confirmado:opt.v})}
                    style={{ padding:"10px 8px", borderRadius:"4px", border:`1.5px solid ${form.confirmado===opt.v?G:"rgba(0,0,0,0.1)"}`, background:form.confirmado===opt.v?`${GA}0.1)`:W, color:form.confirmado===opt.v?"#6b4e00":"rgba(0,0,0,0.38)", fontWeight:700, fontSize:"10px", cursor:"pointer", letterSpacing:"1px", textTransform:"uppercase", transition:"all 0.2s" }}>
                    {opt.l}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom:"12px" }}>
              <label style={lblStyle}>Mensagem (opcional)</label>
              <textarea value={form.mensagem} onChange={e=>setForm({...form,mensagem:e.target.value})} rows="2" placeholder="Deixe uma mensagem ao anfitrião..." style={{...inpStyle, resize:"vertical"}}/>
            </div>
            {erro && <div style={{ background:`${GA}0.08)`, border:`1px solid ${GA}0.3)`, borderRadius:"4px", padding:"8px", color:"#7a5700", marginBottom:"10px", fontSize:"11px" }}>{erro}</div>}
            <button type="submit" disabled={submitting} style={{ width:"100%", padding:"13px", borderRadius:"50px", border:"none", background:D, color:W, fontSize:"9px", fontWeight:700, cursor:submitting?"wait":"pointer", opacity:submitting?0.5:1, letterSpacing:"3px", textTransform:"uppercase", transition:"opacity 0.2s" }}>
              {submitting ? "A enviar..." : form.confirmado ? "Confirmar Presença" : "Enviar Resposta"}
            </button>
          </form>
        )}
        {/* Partilhar */}
        <div style={{ marginTop:"22px", paddingTop:"18px", borderTop:`1px solid ${GA}0.15)`, textAlign:"center" }}>
          <button onClick={() => { navigator.clipboard.writeText(window.location.href).then(() => alert("Link copiado!")).catch(() => {}); }}
            style={{ display:"inline-flex", alignItems:"center", gap:"6px", background:W, color:D, border:`1px solid ${GA}0.3)`, borderRadius:"50px", padding:"9px 20px", fontSize:"8.5px", fontWeight:700, cursor:"pointer", letterSpacing:"2px", textTransform:"uppercase" }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={D} strokeWidth="2.5"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
            Partilhar este Convite
          </button>
        </div>
      </div>
    );
    return null;
  };

  /* ── RENDER DO FRAME ── */
  return (
    <div style={{ width:"100vw", height:"100vh", background:"#8e8e8e", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Inter',sans-serif" }}
      onTouchStart={onTS} onTouchEnd={onTE}>
      <style>{CSS}</style>
      {evento.musica_url && <MusicaPlayer url={evento.musica_url} autoPlay={true}/>}

      {/* Dots de navegação — lado direito, fora do frame */}
      <div style={{ position:"fixed", right:"clamp(8px,calc(50vw - min(195px,43vw) - 20px),999px)", top:"50%", transform:"translateY(-50%)", display:"flex", flexDirection:"column", gap:"8px", zIndex:200 }}>
        {slides.map((_,i) => (
          <button key={i} onClick={() => goTo(i)} style={{ width:"5px", height: i===slide?"18px":"5px", borderRadius:"3px", background: i===slide ? G : "rgba(60,60,60,0.45)", border:"none", cursor:"pointer", transition:"all 0.35s cubic-bezier(0.4,0,0.2,1)", padding:0 }}/>
        ))}
      </div>

      {/* ── FRAME DO TELEMÓVEL ── */}
      <div style={{
        width:"min(390px,90vw)", height:"min(780px,94vh)",
        borderRadius:"44px",
        background:"#242424",
        boxShadow:`0 0 0 2px #333, 0 0 0 4px #1a1a1a, 0 60px 120px rgba(0,0,0,0.7), inset 0 0 0 1px rgba(255,255,255,0.03)`,
        position:"relative", overflow:"hidden", display:"flex", flexDirection:"column"
      }}>
        {/* Notch */}
        <div style={{ flexShrink:0, height:"28px", background:"#242424", display:"flex", alignItems:"center", justifyContent:"center", zIndex:10 }}>
          <div style={{ width:"76px", height:"6px", borderRadius:"3px", background:"#181818" }}/>
        </div>

        {/* Área de conteúdo */}
        <div ref={scrollRef} className="fscroll" style={{ flex:1 }}>
          {slides.map((tipo, i) => renderSlide(tipo, i))}
        </div>

        {/* Barra home */}
        <div style={{ flexShrink:0, height:"10px", background:"#242424", display:"flex", alignItems:"center", justifyContent:"center" }}>
          <div style={{ width:"44px", height:"3px", borderRadius:"2px", background:"#333" }}/>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────
   ENTRY POINT
───────────────────────────────────────────────────── */
function ConvitePublico() {
  const { id }    = useParams();
  const location  = useLocation();
  const params    = new URLSearchParams(location.search);
  const nomeConv  = params.get("nome");
  const relConv   = params.get("rel");

  const [aberto,  setAberto]  = useState(false);
  const [evento,  setEvento]  = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro,    setErro]    = useState("");

  useEffect(() => {
    convitesAPI.buscarPorId(id)
      .then(d => setEvento(d))
      .catch(() => setErro("Convite não encontrado."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div style={{ minHeight:"100vh", background:D, display:"flex", alignItems:"center", justifyContent:"center" }}>
      <style>{CSS}</style>
      <div style={{ textAlign:"center" }}>
        <div style={{ width:"36px", height:"36px", border:`1px solid ${GA}0.25)`, borderTopColor:G, borderRadius:"50%", animation:"spin 1s linear infinite", margin:"0 auto 14px" }}/>
        <p style={{ color:`${GA}0.4)`, fontSize:"8px", letterSpacing:"3px", textTransform:"uppercase" }}>A carregar</p>
      </div>
    </div>
  );

  if (erro || !evento) return (
    <div style={{ minHeight:"100vh", background:D, display:"flex", alignItems:"center", justifyContent:"center" }}>
      <style>{CSS}</style>
      <div style={{ textAlign:"center", padding:"40px 28px" }}>
        <h2 style={{ fontFamily:"'Cormorant Garamond',serif", color:"rgba(255,255,255,0.55)", fontSize:"22px", fontWeight:400 }}>Convite não encontrado</h2>
        <p style={{ color:"rgba(255,255,255,0.2)", fontSize:"12px", marginTop:"8px" }}>O link pode estar incorreto.</p>
      </div>
    </div>
  );

  if (!aberto) return (
    <Envelope
      nome={nomeConv} relacao={relConv}
      nomeEvento={evento.nome_evento} dataEvento={evento.data_evento}
      horaEvento={evento.hora_evento} localEvento={evento.local_evento}
      onAbrir={() => setAberto(true)}
    />
  );

  return <ConviteSlides evento={evento} nomeConv={nomeConv} relConv={relConv}/>;
}

export default ConvitePublico;
