import os
path = "src/pages/ConvitePublico.js"
lines = []

code = r"""
import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useLocation } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { convitesAPI, confirmacoesAPI } from "../services/api";

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=Inter:wght@300;400;500;600;700&display=swap');
  * { box-sizing: border-box; }
  body { overflow: hidden; }
  @keyframes fadeUp { from{opacity:0;transform:translateY(40px)} to{opacity:1;transform:translateY(0)} }
  @keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.06)} }
  @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
  input::placeholder, textarea::placeholder { color: rgba(255,255,255,0.3); }
  input, textarea { font-family: 'Inter', sans-serif; }
`;

function Countdown({ dataEvento, horaEvento }) {
  const [t, setT] = useState({});
  useEffect(() => {
    const calc = () => {
      const alvo = new Date(dataEvento + "T" + (horaEvento || "00:00"));
      const d = alvo - new Date();
      if (d <= 0) { setT({ done: true }); return; }
      setT({ dias: Math.floor(d / 86400000), horas: Math.floor((d % 86400000) / 3600000), min: Math.floor((d % 3600000) / 60000), seg: Math.floor((d % 60000) / 1000) });
    };
    calc(); const i = setInterval(calc, 1000); return () => clearInterval(i);
  }, [dataEvento, horaEvento]);
  if (t.done) return null;
  const U = ({ v, l }) => (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(36px,8vw,52px)", fontWeight: 900, color: "white", lineHeight: 1 }}>{String(v).padStart(2, "0")}</div>
      <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)", letterSpacing: "2px", textTransform: "uppercase", marginTop: "6px" }}>{l}</div>
    </div>
  );
  const sep = <div style={{ fontSize: "28px", color: "rgba(255,255,255,0.2)", paddingBottom: "16px" }}>:</div>;
  return (
    <div style={{ textAlign: "center", padding: "32px 0" }}>
      <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "10px", letterSpacing: "4px", textTransform: "uppercase", marginBottom: "20px" }}>Faltam</p>
      <div style={{ display: "inline-flex", alignItems: "flex-end", gap: "12px" }}>
        <U v={t.dias} l="Dias" />{sep}<U v={t.horas} l="Horas" />{sep}<U v={t.min} l="Min" />{sep}<U v={t.seg} l="Seg" />
      </div>
    </div>
  );
}

function MusicaPlayer({ url }) {
  const ref = useRef(); const [on, setOn] = useState(false); const [p, setP] = useState(0);
  useEffect(() => {
    const a = ref.current; if (!a) return;
    const u = () => setP((a.currentTime / a.duration) * 100 || 0);
    a.addEventListener("timeupdate", u); a.addEventListener("ended", () => setOn(false));
    return () => a.removeEventListener("timeupdate", u);
  }, []);
  const tog = () => { const a = ref.current; if (on) { a.pause(); setOn(false); } else { a.play(); setOn(true); } };
  return (
    <div style={{ position: "fixed", bottom: "24px", right: "24px", zIndex: 9999, display: "flex", alignItems: "center", gap: "12px", background: "rgba(5,5,15,0.92)", backdropFilter: "blur(20px)", borderRadius: "50px", padding: "10px 20px 10px 10px", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 8px 32px rgba(0,0,0,0.5)" }}>
      <audio ref={ref} src={url} loop />
      <button onClick={tog} style={{ width: "42px", height: "42px", borderRadius: "50%", background: on ? "linear-gradient(135deg,#f093fb,#f5576c)" : "linear-gradient(135deg,#667eea,#764ba2)", border: "none", cursor: "pointer", color: "white", fontSize: "15px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        {on ? "\u23F8" : "\u25B6"}
      </button>
      <div>
        <div style={{ color: "rgba(255,255,255,0.7)", fontSize: "11px", fontWeight: 600, marginBottom: "4px" }}>{on ? "A tocar..." : "Musica"}</div>
        <div style={{ width: "80px", height: "2px", background: "rgba(255,255,255,0.1)", borderRadius: "1px" }}>
          <div style={{ width: p + "%", height: "100%", background: "linear-gradient(90deg,#667eea,#f5576c)", borderRadius: "1px", transition: "width 0.5s" }} />
        </div>
      </div>
    </div>
  );
}

function Envelope({ nome, relacao, onAbrir }) {
  const [abrindo, setAbrindo] = useState(false);
  const abrir = () => { if (abrindo) return; setAbrindo(true); setTimeout(onAbrir, 1400); };
  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg,#1a0a2e 0%,#0d1a2e 100%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px", fontFamily: "'Inter',sans-serif", overflow: "hidden" }}>
      <style>{CSS}</style>
      <div style={{ position: "fixed", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
        {[...Array(35)].map((_, i) => (
          <div key={i} style={{ position: "absolute", width: (Math.sin(i * 7) * 1.5 + 2) + "px", height: (Math.sin(i * 7) * 1.5 + 2) + "px", background: "white", borderRadius: "50%", top: ((i * 37) % 100) + "%", left: ((i * 53) % 100) + "%", opacity: (Math.sin(i) * 0.3 + 0.2), animation: "pulse " + (2 + (i % 3)) + "s infinite" }} />
        ))}
      </div>
      <div style={{ position: "relative", zIndex: 1, textAlign: "center", maxWidth: "480px", width: "100%" }}>
        {nome && (
          <div style={{ marginBottom: "36px", animation: "fadeUp 0.8s ease" }}>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px", letterSpacing: "4px", textTransform: "uppercase", marginBottom: "10px" }}>Para</p>
            <h2 style={{ fontFamily: "'Playfair Display',serif", color: "white", fontSize: "clamp(26px,5vw,40px)", fontWeight: 700, fontStyle: "italic" }}>
              {relacao ? relacao + " " : ""}{nome}
            </h2>
          </div>
        )}
        <div style={{ animation: "float 3s ease-in-out infinite", marginBottom: "40px", cursor: "pointer" }} onClick={abrir}>
          <div style={{ position: "relative", width: "240px", height: "170px", margin: "0 auto" }}>
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg,#c9a96e,#e8c97a)", borderRadius: "14px", boxShadow: "0 24px 64px rgba(201,169,110,0.35)" }} />
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "85px", background: "linear-gradient(135deg,#b8935a,#d4b86a)", borderRadius: "0 0 14px 14px", clipPath: "polygon(0 100%,50% 0,100% 100%)" }} />
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "85px", background: "linear-gradient(135deg,#d4b86a,#f0d080)", borderRadius: "14px 14px 0 0", clipPath: "polygon(0 0,50% 100%,100% 0)", transformOrigin: "top center", transition: "transform 1s cubic-bezier(0.4,0,0.2,1)", transform: abrindo ? "rotateX(-180deg)" : "rotateX(0deg)" }} />
            <div style={{ position: "absolute", inset: "14px", border: "1px solid rgba(255,255,255,0.25)", borderRadius: "8px", pointerEvents: "none" }} />
            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "48px", height: "48px", borderRadius: "50%", background: "linear-gradient(135deg,#c0392b,#e74c3c)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 16px rgba(192,57,43,0.5)", fontSize: "20px", zIndex: 2 }}>
              \U0001F48C
            </div>
          </div>
        </div>
        <div style={{ animation: "fadeUp 0.8s ease 0.4s both" }}>
          <button onClick={abrir} disabled={abrindo} style={{ background: "linear-gradient(135deg,#c9a96e,#e8c97a)", border: "none", borderRadius: "50px", padding: "16px 52px", color: "#1a0a2e", fontFamily: "'Playfair Display',serif", fontSize: "17px", fontWeight: 700, cursor: abrindo ? "wait" : "pointer", boxShadow: "0 8px 32px rgba(201,169,110,0.4)", letterSpacing: "0.5px" }}>
            {abrindo ? "A abrir..." : "Abrir Convite \u2728"}
          </button>
          <p style={{ color: "rgba(255,255,255,0.25)", fontSize: "12px", marginTop: "14px", letterSpacing: "1px" }}>Toca para abrir</p>
        </div>
      </div>
    </div>
  );
}
"""

code2 = r"""
function ConviteSlides({ evento, nomeConv, relConv }) {
  const [slide, setSlide] = useState(0);
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ nome_convidado: nomeConv || "", email: "", telefone: "", confirmado: true, numero_acompanhantes: 0, mensagem: "" });
  const startX = useRef(null);

  const fotos = (Array.isArray(evento.fotos) ? evento.fotos : []).filter(Boolean);
  const programa = (() => { try { return Array.isArray(evento.programa) ? evento.programa : JSON.parse(evento.programa || "[]"); } catch { return []; } })().filter(p => p.nome);
  const ref_obj = (() => { try { return typeof evento.refeicao === "object" && evento.refeicao ? evento.refeicao : JSON.parse(evento.refeicao || "{}"); } catch { return {}; } })();
  const pratos = (ref_obj.pratos || []).filter(p => p.nome);
  const bebidas = (ref_obj.bebidas || []).filter(b => b.nome);

  const slides = ["hero","countdown",...(evento.video_url?["video"]:[]),...(fotos.length?["galeria"]:[]),...(programa.length?["programa"]:[]),...((pratos.length||bebidas.length)?["refeicao"]:[]),...(evento.endereco_maps?["mapa"]:[]),"rsvp"];
  const total = slides.length;

  const goTo = useCallback((n) => {
    const next = Math.max(0, Math.min(total - 1, n));
    setSlide(next);
    document.getElementById("slide-" + next)?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" });
  }, [total]);

  useEffect(() => {
    const h = (e) => { if (e.key === "ArrowRight") goTo(slide + 1); if (e.key === "ArrowLeft") goTo(slide - 1); };
    window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h);
  }, [slide, goTo]);

  const bg = evento.foto_capa
    ? { background: "linear-gradient(to bottom,rgba(0,0,0,0.6) 0%,rgba(13,13,26,0.9) 70%,#0d0d1a 100%)", backgroundImage: "url(" + evento.foto_capa + ")", backgroundSize: "cover", backgroundPosition: "center", backgroundAttachment: "fixed" }
    : { background: "linear-gradient(160deg,#0d0d1a 0%,#1a0a2e 50%,#0d1a2e 100%)" };

  const dataFmt = new Date(evento.data_evento).toLocaleDateString("pt-PT", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const inpS = { width: "100%", padding: "13px 16px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.06)", color: "white", fontSize: "15px", outline: "none", boxSizing: "border-box" };
  const lblS = { color: "rgba(255,255,255,0.5)", fontSize: "11px", fontWeight: 600, display: "block", marginBottom: "8px", letterSpacing: "1px", textTransform: "uppercase" };

  const submit = async (e) => {
    e.preventDefault(); setErro(""); setSubmitting(true);
    if (!form.nome_convidado.trim()) { setErro("O nome e obrigatorio."); setSubmitting(false); return; }
    try { await confirmacoesAPI.criar(evento.id, form); setEnviado(true); }
    catch (err) { setErro(err.message || "Erro ao enviar."); }
    setSubmitting(false);
  };

  const SlideWrap = ({ id, children, justify = "center" }) => (
    <div id={"slide-" + id} style={{ width: "100vw", height: "100vh", flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: justify, padding: "24px", overflowY: "auto", fontFamily: "'Inter',sans-serif", position: "relative", ...bg }}
      onTouchStart={e => { startX.current = e.touches[0].clientX; }}
      onTouchEnd={e => { if (startX.current === null) return; const dx = startX.current - e.changedTouches[0].clientX; if (Math.abs(dx) > 50) goTo(slide + (dx > 0 ? 1 : -1)); startX.current = null; }}>
      {evento.foto_capa && <div style={{ position: "absolute", inset: 0, backgroundImage: "url(" + evento.foto_capa + ")", backgroundSize: "cover", backgroundPosition: "center", zIndex: 0 }} />}
      {evento.foto_capa && <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom,rgba(0,0,0,0.55) 0%,rgba(13,13,26,0.88) 60%,#0d0d1a 100%)", zIndex: 1 }} />}
      <div style={{ position: "relative", zIndex: 2, width: "100%", maxWidth: "680px" }}>{children}</div>
    </div>
  );

  const renderSlide = (tipo, i) => {
    if (tipo === "hero") return (
      <SlideWrap key={i} id={i}>
        <div style={{ textAlign: "center", animation: "fadeUp 0.8s ease" }}>
          {nomeConv && <div style={{ marginBottom: "28px", background: "rgba(255,255,255,0.07)", borderRadius: "50px", padding: "10px 28px", display: "inline-block", border: "1px solid rgba(255,255,255,0.1)" }}><span style={{ color: "white", fontSize: "17px", fontWeight: 600 }}>Ola {relConv ? relConv + " " : ""}{nomeConv}! \U0001F44B</span></div>}
          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "10px", letterSpacing: "5px", textTransform: "uppercase", marginBottom: "14px" }}>Convite Especial</p>
          <h1 style={{ fontFamily: "'Playfair Display',serif", color: "white", fontSize: "clamp(32px,7vw,64px)", fontWeight: 900, lineHeight: 1.1, marginBottom: "20px", textShadow: "0 4px 24px rgba(0,0,0,0.4)" }}>{evento.nome_evento}</h1>
          {evento.mensagem && <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "18px", fontStyle: "italic", fontFamily: "'Playfair Display',serif", lineHeight: 1.7, marginBottom: "28px" }}>"{evento.mensagem}"</p>}
          <div style={{ display: "inline-flex", background: "rgba(255,255,255,0.05)", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.08)", overflow: "hidden", marginBottom: "36px" }}>
            <div style={{ padding: "14px 22px", textAlign: "center" }}><div style={{ color: "rgba(255,255,255,0.3)", fontSize: "9px", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "5px" }}>Data</div><div style={{ color: "white", fontWeight: 600, fontSize: "13px" }}>{dataFmt}</div></div>
            {evento.hora_evento && <><div style={{ width: "1px", background: "rgba(255,255,255,0.07)" }} /><div style={{ padding: "14px 22px", textAlign: "center" }}><div style={{ color: "rgba(255,255,255,0.3)", fontSize: "9px", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "5px" }}>Hora</div><div style={{ color: "white", fontWeight: 600, fontSize: "13px" }}>{evento.hora_evento}</div></div></>}
            <div style={{ width: "1px", background: "rgba(255,255,255,0.07)" }} />
            <div style={{ padding: "14px 22px", textAlign: "center" }}><div style={{ color: "rgba(255,255,255,0.3)", fontSize: "9px", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "5px" }}>Local</div><div style={{ color: "white", fontWeight: 600, fontSize: "13px" }}>{evento.local_evento}</div></div>
          </div>
          <br />
          <button onClick={() => goTo(1)} style={{ background: "linear-gradient(135deg,#c9a96e,#e8c97a)", border: "none", borderRadius: "50px", padding: "14px 44px", color: "#1a0a2e", fontFamily: "'Playfair Display',serif", fontSize: "16px", fontWeight: 700, cursor: "pointer", boxShadow: "0 8px 24px rgba(201,169,110,0.35)" }}>
            Ver Convite \u2192
          </button>
        </div>
      </SlideWrap>
    );
    if (tipo === "countdown") return (
      <SlideWrap key={i} id={i}>
        <div style={{ textAlign: "center" }}>
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "10px", letterSpacing: "4px", textTransform: "uppercase", marginBottom: "8px" }}>Estamos a contar</p>
          <h2 style={{ fontFamily: "'Playfair Display',serif", color: "white", fontSize: "clamp(22px,4vw,34px)", fontWeight: 700, marginBottom: "4px" }}>{evento.nome_evento}</h2>
          <Countdown dataEvento={evento.data_evento} horaEvento={evento.hora_evento} />
          <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: "16px", padding: "20px", border: "1px solid rgba(255,255,255,0.07)", display: "inline-block", marginTop: "16px" }}>
            <div style={{ background: "white", borderRadius: "10px", padding: "10px", display: "inline-block" }}>
              <QRCodeSVG value={window.location.origin + "/convite/" + evento.id} size={90} fgColor="#1a0a2e" level="M" />
            </div>
            <p style={{ color: "rgba(255,255,255,0.25)", fontSize: "11px", marginTop: "10px" }}>Partilha este convite</p>
          </div>
        </div>
      </SlideWrap>
    );
    if (tipo === "video") return (
      <SlideWrap key={i} id={i}>
        <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "10px", letterSpacing: "4px", textTransform: "uppercase", marginBottom: "16px", textAlign: "center" }}>\U0001F3AC Video</p>
        {(() => { const yt = evento.video_url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/); return yt ? <div style={{ borderRadius: "16px", overflow: "hidden", aspectRatio: "16/9" }}><iframe src={"https://www.youtube.com/embed/" + yt[1] + "?rel=0"} style={{ width: "100%", height: "100%", border: "none" }} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen title="Video" /></div> : <video controls src={evento.video_url} style={{ width: "100%", borderRadius: "16px", maxHeight: "60vh" }} />; })()}
      </SlideWrap>
    );
    if (tipo === "galeria") return (
      <SlideWrap key={i} id={i} justify="flex-start">
        <div style={{ paddingTop: "40px" }}>
          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "10px", letterSpacing: "4px", textTransform: "uppercase", marginBottom: "8px", textAlign: "center" }}>Galeria</p>
          <h2 style={{ fontFamily: "'Playfair Display',serif", color: "white", fontSize: "clamp(22px,4vw,32px)", fontWeight: 700, textAlign: "center", marginBottom: "24px" }}>Fotos</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: "8px" }}>
            {fotos.map((f, fi) => (
              <div key={fi} style={{ aspectRatio: "1", borderRadius: "10px", overflow: "hidden", cursor: "pointer" }}
                onClick={() => { const w = window.open(); w.document.write('<body style="margin:0;background:#000;display:flex;align-items:center;justify-content:center;min-height:100vh"><img src="' + f + '" style="max-width:100%;max-height:100vh;" /></body>'); }}>
                <img src={f} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.3s" }}
                  onMouseEnter={e => e.target.style.transform = "scale(1.05)"} onMouseLeave={e => e.target.style.transform = "scale(1)"} />
              </div>
            ))}
          </div>
        </div>
      </SlideWrap>
    );
    if (tipo === "programa") return (
      <SlideWrap key={i} id={i} justify="flex-start">
        <div style={{ paddingTop: "40px" }}>
          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "10px", letterSpacing: "4px", textTransform: "uppercase", marginBottom: "8px", textAlign: "center" }}>Programa</p>
          <h2 style={{ fontFamily: "'Playfair Display',serif", color: "white", fontSize: "clamp(22px,4vw,32px)", fontWeight: 700, textAlign: "center", marginBottom: "32px" }}>Da Cerimonia</h2>
          <div style={{ position: "relative", paddingLeft: "28px" }}>
            <div style={{ position: "absolute", left: "8px", top: 0, bottom: 0, width: "1px", background: "rgba(201,169,110,0.25)" }} />
            {programa.map((p, pi) => (
              <div key={pi} style={{ position: "relative", marginBottom: "28px" }}>
                <div style={{ position: "absolute", left: "-24px", top: "6px", width: "10px", height: "10px", borderRadius: "50%", background: "rgba(201,169,110,0.2)", border: "2px solid #c9a96e" }} />
                {p.hora && <span style={{ color: "#c9a96e", fontSize: "13px", fontWeight: 700, letterSpacing: "1px" }}>{p.hora}</span>}
                <h4 style={{ color: "white", fontSize: "17px", fontWeight: 700, margin: "4px 0 6px", fontFamily: "'Playfair Display',serif" }}>{p.nome}</h4>
                <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", marginBottom: "4px" }}>
                  {p.local_prog && <span style={{ color: "rgba(255,255,255,0.38)", fontSize: "11px", letterSpacing: "0.5px" }}>\U0001F4CD {p.local_prog.toUpperCase()}</span>}
                  {p.responsavel && <span style={{ color: "rgba(255,255,255,0.38)", fontSize: "11px", letterSpacing: "0.5px" }}>\U0001F464 {p.responsavel.toUpperCase()}</span>}
                </div>
                {p.descricao && <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "14px", lineHeight: 1.5 }}>{p.descricao}</p>}
              </div>
            ))}
          </div>
        </div>
      </SlideWrap>
    );
    if (tipo === "refeicao") return (
      <SlideWrap key={i} id={i} justify="flex-start">
        <div style={{ paddingTop: "40px" }}>
          {pratos.length > 0 && <>
            <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "10px", letterSpacing: "4px", textTransform: "uppercase", marginBottom: "8px", textAlign: "center" }}>Menu</p>
            <h2 style={{ fontFamily: "'Playfair Display',serif", color: "white", fontSize: "clamp(22px,4vw,32px)", fontWeight: 700, textAlign: "center", marginBottom: "28px" }}>Refeicao</h2>
            {pratos.map((p, pi) => (
              <div key={pi} style={{ display: "flex", alignItems: "flex-start", gap: "14px", marginBottom: "18px" }}>
                <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", flexShrink: 0, marginTop: "2px" }} />
                <div><p style={{ color: "white", fontSize: "14px", fontWeight: 700, letterSpacing: "0.5px", margin: "0 0 3px", textTransform: "uppercase" }}>{p.nome}</p>{p.descricao && <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "13px", margin: 0 }}>{p.descricao}</p>}</div>
              </div>
            ))}
          </>}
          {bebidas.length > 0 && <>
            <h2 style={{ fontFamily: "'Playfair Display',serif", color: "white", fontSize: "clamp(20px,3vw,28px)", fontWeight: 700, textAlign: "center", margin: "28px 0 20px" }}>Bebidas</h2>
            {bebidas.map((b, bi) => (
              <div key={bi} style={{ display: "flex", alignItems: "flex-start", gap: "14px", marginBottom: "16px" }}>
                <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", flexShrink: 0, marginTop: "2px" }} />
                <div><p style={{ color: "white", fontSize: "14px", fontWeight: 700, letterSpacing: "0.5px", margin: "0 0 3px", textTransform: "uppercase" }}>{b.nome}</p>{b.descricao && <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "13px", margin: 0 }}>{b.descricao}</p>}</div>
              </div>
            ))}
          </>}
        </div>
      </SlideWrap>
    );
    if (tipo === "mapa") return (
      <SlideWrap key={i} id={i}>
        <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "10px", letterSpacing: "4px", textTransform: "uppercase", marginBottom: "8px", textAlign: "center" }}>Localizacao</p>
        <h2 style={{ fontFamily: "'Playfair Display',serif", color: "white", fontSize: "clamp(20px,3vw,28px)", fontWeight: 700, textAlign: "center", marginBottom: "20px" }}>{evento.local_evento}</h2>
        <div style={{ borderRadius: "16px", overflow: "hidden", boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }}>
          <iframe title="mapa" src={"https://maps.google.com/maps?q=" + encodeURIComponent(evento.endereco_maps) + "&output=embed"} width="100%" height="280" style={{ border: "none", display: "block" }} loading="lazy" />
        </div>
        <a href={"https://maps.google.com/?q=" + encodeURIComponent(evento.endereco_maps)} target="_blank" rel="noreferrer" style={{ display: "block", textAlign: "center", marginTop: "14px", color: "#c9a96e", fontSize: "14px", fontWeight: 600, textDecoration: "none" }}>
          Abrir no Google Maps \u2192
        </a>
      </SlideWrap>
    );
    if (tipo === "rsvp") return (
      <SlideWrap key={i} id={i} justify="flex-start">
        <div style={{ paddingTop: "40px", paddingBottom: "40px" }}>
          {enviado ? (
            <div style={{ textAlign: "center", padding: "48px 0" }}>
              <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: form.confirmado ? "linear-gradient(135deg,#43e97b,#38f9d7)" : "linear-gradient(135deg,#f5576c,#f093fb)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", fontSize: "36px", color: "#1a1a2e" }}>{form.confirmado ? "\u2713" : "\u2717"}</div>
              <h2 style={{ fontFamily: "'Playfair Display',serif", color: "white", fontSize: "26px", marginBottom: "12px" }}>{form.confirmado ? "Presenca Confirmada!" : "Resposta Enviada"}</h2>
              <p style={{ color: "rgba(255,255,255,0.55)", lineHeight: 1.6 }}>{form.confirmado ? "Obrigado, " + form.nome_convidado + "! Ate breve." : "Obrigado por responder, " + form.nome_convidado + "."}</p>
            </div>
          ) : (
            <>
              <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "10px", letterSpacing: "4px", textTransform: "uppercase", marginBottom: "8px", textAlign: "center" }}>RSVP</p>
              <h2 style={{ fontFamily: "'Playfair Display',serif", color: "white", fontSize: "clamp(22px,4vw,32px)", fontWeight: 700, textAlign: "center", marginBottom: "28px" }}>Confirmar Presenca</h2>
              <form onSubmit={submit}>
                <div style={{ marginBottom: "16px" }}><label style={lblS}>Nome *</label><input type="text" value={form.nome_convidado} onChange={e => setForm({ ...form, nome_convidado: e.target.value })} required placeholder="O seu nome" style={inpS} /></div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "16px" }}>
                  <div><label style={lblS}>Email</label><input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="seu@email.com" style={inpS} /></div>
                  <div><label style={lblS}>Telefone</label><input type="tel" value={form.telefone} onChange={e => setForm({ ...form, telefone: e.target.value })} placeholder="+258 84 000 0000" style={inpS} /></div>
                </div>
                <div style={{ marginBottom: "16px" }}>
                  <label style={lblS}>Vai comparecer?</label>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <button type="button" onClick={() => setForm({ ...form, confirmado: true })} style={{ padding: "13px", borderRadius: "10px", border: "2px solid " + (form.confirmado ? "#43e97b" : "rgba(255,255,255,0.1)"), background: form.confirmado ? "rgba(67,233,123,0.1)" : "transparent", color: form.confirmado ? "#43e97b" : "rgba(255,255,255,0.45)", fontWeight: 700, fontSize: "14px", cursor: "pointer" }}>\u2713 Sim, vou!</button>
                    <button type="button" onClick={() => setForm({ ...form, confirmado: false, numero_acompanhantes: 0 })} style={{ padding: "13px", borderRadius: "10px", border: "2px solid " + (!form.confirmado ? "#f5576c" : "rgba(255,255,255,0.1)"), background: !form.confirmado ? "rgba(245,87,108,0.1)" : "transparent", color: !form.confirmado ? "#f5576c" : "rgba(255,255,255,0.45)", fontWeight: 700, fontSize: "14px", cursor: "pointer" }}>\u2717 Nao posso</button>
                  </div>
                </div>
                {form.confirmado && <div style={{ marginBottom: "16px" }}><label style={lblS}>Acompanhantes</label><input type="number" min="0" max="20" value={form.numero_acompanhantes} onChange={e => setForm({ ...form, numero_acompanhantes: parseInt(e.target.value) || 0 })} style={inpS} /></div>}
                <div style={{ marginBottom: "20px" }}><label style={lblS}>Mensagem</label><textarea value={form.mensagem} onChange={e => setForm({ ...form, mensagem: e.target.value })} rows="3" placeholder="Deixe uma mensagem..." style={{ ...inpS, resize: "vertical" }} /></div>
                {erro && <div style={{ background: "rgba(245,87,108,0.1)", border: "1px solid rgba(245,87,108,0.25)", borderRadius: "10px", padding: "12px 16px", color: "#f5576c", marginBottom: "16px", fontSize: "14px" }}>{erro}</div>}
                <button type="submit" disabled={submitting} style={{ width: "100%", padding: "15px", borderRadius: "12px", border: "none", background: form.confirmado ? "linear-gradient(135deg,#43e97b,#38f9d7)" : "linear-gradient(135deg,#667eea,#764ba2)", color: form.confirmado ? "#0d1a0d" : "white", fontSize: "16px", fontWeight: 800, cursor: submitting ? "wait" : "pointer", opacity: submitting ? 0.7 : 1, fontFamily: "'Playfair Display',serif" }}>
                  {submitting ? "A enviar..." : form.confirmado ? "Confirmar Presenca" : "Enviar Resposta"}
                </button>
              </form>
            </>
          )}
        </div>
      </SlideWrap>
    );
    return null;
  };

  return (
    <div style={{ width: "100vw", height: "100vh", overflow: "hidden", position: "relative" }}>
      <style>{CSS}</style>
      {evento.musica_url && <MusicaPlayer url={evento.musica_url} />}
      {/* Slides container */}
      <div style={{ display: "flex", width: total + "00vw", height: "100vh", transition: "transform 0.6s cubic-bezier(0.4,0,0.2,1)", transform: "translateX(-" + (slide * 100) + "vw)" }}>
        {slides.map((tipo, i) => renderSlide(tipo, i))}
      </div>
      {/* Navegacao */}
      <div style={{ position: "fixed", bottom: "20px", left: "50%", transform: "translateX(-50%)", display: "flex", alignItems: "center", gap: "12px", zIndex: 1000, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(12px)", borderRadius: "50px", padding: "10px 20px", border: "1px solid rgba(255,255,255,0.08)" }}>
        <button onClick={() => goTo(slide - 1)} disabled={slide === 0} style={{ background: "none", border: "none", color: slide === 0 ? "rgba(255,255,255,0.2)" : "white", cursor: slide === 0 ? "default" : "pointer", fontSize: "18px", padding: "0 4px" }}>\u2039</button>
        {slides.map((_, i) => (
          <button key={i} onClick={() => goTo(i)} style={{ width: i === slide ? "24px" : "8px", height: "8px", borderRadius: "4px", background: i === slide ? "#c9a96e" : "rgba(255,255,255,0.25)", border: "none", cursor: "pointer", transition: "all 0.3s", padding: 0 }} />
        ))}
        <button onClick={() => goTo(slide + 1)} disabled={slide === total - 1} style={{ background: "none", border: "none", color: slide === total - 1 ? "rgba(255,255,255,0.2)" : "white", cursor: slide === total - 1 ? "default" : "pointer", fontSize: "18px", padding: "0 4px" }}>\u203A</button>
      </div>
      {/* Indicador de slide */}
      <div style={{ position: "fixed", top: "20px", right: "20px", color: "rgba(255,255,255,0.3)", fontSize: "12px", fontFamily: "'Inter',sans-serif", zIndex: 1000 }}>{slide + 1} / {total}</div>
    </div>
  );
}
"""
