import os

path = os.path.join(os.path.dirname(__file__), "src", "pages", "ConvitePublico.js")

part1 = r"""import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useLocation } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { convitesAPI, confirmacoesAPI } from "../services/api";

const CSS = `@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=Inter:wght@300;400;500;600;700&display=swap');*{box-sizing:border-box;}body{overflow:hidden;margin:0;}@keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}@keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.06)}}@keyframes rodar{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}@keyframes aparecer{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}input::placeholder,textarea::placeholder{color:rgba(255,255,255,0.3);}input,textarea{font-family:'Inter',sans-serif;}`;

function Countdown({ dataEvento, horaEvento }) {
  const [t, setT] = useState({});
  useEffect(() => {
    const calc = () => {
      const alvo = new Date(dataEvento + "T" + (horaEvento || "00:00"));
      const d = alvo - new Date();
      if (d <= 0) { setT({ done: true }); return; }
      setT({ dias: Math.floor(d/86400000), horas: Math.floor((d%86400000)/3600000), min: Math.floor((d%3600000)/60000), seg: Math.floor((d%60000)/1000) });
    };
    calc(); const i = setInterval(calc, 1000); return () => clearInterval(i);
  }, [dataEvento, horaEvento]);
  if (t.done) return null;
  const U = ({ v, l }) => (
    <div style={{ textAlign:"center" }}>
      <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(26px,5vw,40px)", fontWeight:900, color:"white", lineHeight:1 }}>{String(v).padStart(2,"0")}</div>
      <div style={{ fontSize:"9px", color:"rgba(255,255,255,0.4)", letterSpacing:"2px", textTransform:"uppercase", marginTop:"4px" }}>{l}</div>
    </div>
  );
  const sep = <div style={{ fontSize:"20px", color:"rgba(255,255,255,0.2)", paddingBottom:"10px" }}>:</div>;
  return (
    <div style={{ textAlign:"center", padding:"16px 0" }}>
      <p style={{ color:"rgba(255,255,255,0.35)", fontSize:"9px", letterSpacing:"4px", textTransform:"uppercase", marginBottom:"14px" }}>Faltam</p>
      <div style={{ display:"inline-flex", alignItems:"flex-end", gap:"8px" }}>
        <U v={t.dias} l="Dias"/>{sep}<U v={t.horas} l="Horas"/>{sep}<U v={t.min} l="Min"/>{sep}<U v={t.seg} l="Seg"/>
      </div>
    </div>
  );
}

function MusicaPlayer({ url }) {
  const ref = useRef(); const [on, setOn] = useState(false); const [p, setP] = useState(0);
  useEffect(() => {
    const a = ref.current; if (!a) return;
    const u = () => setP((a.currentTime/a.duration)*100||0);
    a.addEventListener("timeupdate", u); a.addEventListener("ended", () => setOn(false));
    return () => a.removeEventListener("timeupdate", u);
  }, []);
  const tog = () => { const a = ref.current; if (on) { a.pause(); setOn(false); } else { a.play(); setOn(true); } };
  return (
    <div style={{ position:"fixed", bottom:"14px", right:"14px", zIndex:9999, display:"flex", alignItems:"center", gap:"8px", background:"rgba(5,5,15,0.92)", backdropFilter:"blur(20px)", borderRadius:"50px", padding:"7px 14px 7px 7px", border:"1px solid rgba(255,255,255,0.08)", boxShadow:"0 8px 32px rgba(0,0,0,0.5)" }}>
      <audio ref={ref} src={url} loop/>
      <button onClick={tog} style={{ width:"32px", height:"32px", borderRadius:"50%", background: on ? "linear-gradient(135deg,#f093fb,#f5576c)" : "linear-gradient(135deg,#667eea,#764ba2)", border:"none", cursor:"pointer", color:"white", fontSize:"12px", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
        {on ? "\u23F8" : "\u25B6"}
      </button>
      <div>
        <div style={{ color:"rgba(255,255,255,0.7)", fontSize:"10px", fontWeight:600, marginBottom:"3px" }}>{on ? "A tocar..." : "Musica"}</div>
        <div style={{ width:"56px", height:"2px", background:"rgba(255,255,255,0.1)", borderRadius:"1px" }}>
          <div style={{ width:p+"%", height:"100%", background:"linear-gradient(90deg,#667eea,#f5576c)", borderRadius:"1px", transition:"width 0.5s" }}/>
        </div>
      </div>
    </div>
  );
}
"""

part2 = r"""
function Envelope({ nome, relacao, nomeEvento, dataEvento, horaEvento, localEvento, onAbrir }) {
  const [abrindo, setAbrindo] = useState(false);
  const abrir = () => { if (abrindo) return; setAbrindo(true); setTimeout(onAbrir, 800); };
  const partes = nomeEvento ? nomeEvento.split(/[&]/).map(s => s.trim()).filter(Boolean) : [nomeEvento];
  const dataFmt = dataEvento ? new Date(dataEvento).toLocaleDateString("pt-PT", { weekday:"long", day:"numeric", month:"long", year:"numeric" }) : "";
  const diaSemana = dataEvento ? new Date(dataEvento).toLocaleDateString("pt-PT", { weekday:"long" }).toUpperCase() : "";
  return (
    <div style={{ minHeight:"100vh", background:"#faf7f4", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Inter',sans-serif", overflow:"hidden", position:"relative" }}>
      <style>{CSS + "@keyframes rodar{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}@keyframes aparecer{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}"}</style>
      <div style={{ position:"absolute", inset:"16px", border:"1px solid #d4c5b5", pointerEvents:"none", zIndex:0 }}/>
      <div style={{ position:"absolute", inset:"22px", border:"1px solid #e8ddd4", pointerEvents:"none", zIndex:0 }}/>
      {[[0,0,"0","0"],[0,0,"0","auto"],[0,0,"auto","0"],[0,0,"auto","auto"]].map((_,i) => {
        const tops=["12px","12px","auto","auto"],bots=["auto","auto","12px","12px"],lefts=["12px","auto","12px","auto"],rights=["auto","12px","auto","12px"];
        return (<div key={i} style={{ position:"absolute", top:tops[i], bottom:bots[i], left:lefts[i], right:rights[i], width:"40px", height:"40px", borderTop:i<2?"2px solid #b8a898":undefined, borderBottom:i>=2?"2px solid #b8a898":undefined, borderLeft:i%2===0?"2px solid #b8a898":undefined, borderRight:i%2===1?"2px solid #b8a898":undefined, zIndex:1 }}/>);
      })}
      <div style={{ position:"absolute", left:"8px", top:"50%", transform:"translateY(-50%)", display:"flex", flexDirection:"column", gap:"8px", zIndex:1 }}>
        {[0.25,0.45,0.65,0.45,0.25,0.15].map((o,i) => <div key={i} style={{ width:"9px", height:"9px", borderRadius:"50%", background:"#e8b4b8", opacity:o }}/>)}
      </div>
      <div style={{ position:"absolute", right:"8px", top:"50%", transform:"translateY(-50%)", display:"flex", flexDirection:"column", gap:"8px", zIndex:1 }}>
        {[0.25,0.45,0.65,0.45,0.25,0.15].map((o,i) => <div key={i} style={{ width:"9px", height:"9px", borderRadius:"50%", background:"#e8b4b8", opacity:o }}/>)}
      </div>
      <div style={{ textAlign:"center", maxWidth:"360px", width:"100%", padding:"48px 32px", animation:"aparecer 0.8s ease", position:"relative", zIndex:2 }}>
        <div style={{ color:"#8a9bb0", fontSize:"16px", marginBottom:"12px", opacity:0.5 }}>✦</div>
        {nome && (
          <div style={{ marginBottom:"18px" }}>
            <p style={{ color:"#8a9bb0", fontSize:"10px", fontWeight:700, letterSpacing:"3px", textTransform:"uppercase", marginBottom:"8px" }}>{relacao ? relacao.toUpperCase() + " DE HONRA" : "CONVIDADO DE HONRA"}</p>
            <h2 style={{ fontFamily:"'Playfair Display',serif", color:"#1a2332", fontSize:"clamp(20px,5vw,30px)", fontWeight:700, fontStyle:"italic", margin:0 }}>{relacao ? relacao + " " + nome : nome}</h2>
          </div>
        )}
        <div style={{ display:"flex", gap:"8px", justifyContent:"center", marginBottom:"22px", flexWrap:"wrap" }}>
          {diaSemana && (<div style={{ display:"flex", alignItems:"center", gap:"5px", background:"white", borderRadius:"20px", padding:"5px 12px", border:"1px solid #e8e0d8", fontSize:"11px", fontWeight:600, color:"#4a5568", letterSpacing:"1px" }}><span>📅</span> {diaSemana}</div>)}
          {localEvento && (<div style={{ display:"flex", alignItems:"center", gap:"5px", background:"white", borderRadius:"20px", padding:"5px 12px", border:"1px solid #e8e0d8", fontSize:"11px", fontWeight:600, color:"#4a5568", letterSpacing:"1px", maxWidth:"160px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}><span>📍</span> {localEvento.toUpperCase()}</div>)}
        </div>
        {dataFmt && (<p style={{ color:"#8a9bb0", fontSize:"12px", letterSpacing:"1px", marginBottom:"20px" }}>{dataFmt}{horaEvento ? " · " + horaEvento : ""}</p>)}
        <div style={{ width:"48px", height:"1px", background:"#d4c5b5", margin:"0 auto 24px" }}/>
        <div style={{ marginBottom:"40px" }}>
          {partes.length >= 2 ? (
            <>
              <h1 style={{ fontFamily:"'Playfair Display',serif", color:"#1a2332", fontSize:"clamp(40px,11vw,68px)", fontWeight:900, lineHeight:1, margin:"0 0 2px" }}>{partes[0]}</h1>
              <p style={{ fontFamily:"'Playfair Display',serif", color:"#8a9bb0", fontSize:"clamp(22px,5vw,36px)", fontStyle:"italic", margin:"0 0 2px", lineHeight:1.2 }}>&amp;</p>
              <h1 style={{ fontFamily:"'Playfair Display',serif", color:"#1a2332", fontSize:"clamp(40px,11vw,68px)", fontWeight:900, lineHeight:1, margin:0 }}>{partes[1]}</h1>
            </>
          ) : (
            <h1 style={{ fontFamily:"'Playfair Display',serif", color:"#1a2332", fontSize:"clamp(30px,8vw,52px)", fontWeight:900, lineHeight:1.1 }}>{nomeEvento}</h1>
          )}
        </div>
        <div onClick={abrir} style={{ position:"relative", width:"96px", height:"96px", margin:"0 auto", cursor:abrindo?"wait":"pointer", transition:"transform 0.2s" }}
          onMouseEnter={e=>e.currentTarget.style.transform="scale(1.05)"}
          onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}>
          <svg viewBox="0 0 96 96" style={{ position:"absolute", inset:0, width:"100%", height:"100%", animation:"rodar 10s linear infinite" }}>
            <defs><path id="circ" d="M 48,48 m -34,0 a 34,34 0 1,1 68,0 a 34,34 0 1,1 -68,0"/></defs>
            <text style={{ fontSize:"9.5px", fill:"#8b2635", fontWeight:700, letterSpacing:"2.5px" }}>
              <textPath href="#circ">CLIQUE PARA ABRIR • CLIQUE PARA ABRIR •</textPath>
            </text>
          </svg>
          <div style={{ position:"absolute", inset:"10px", borderRadius:"50%", background:"linear-gradient(135deg,#8b2635,#c0392b)", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 8px 24px rgba(139,38,53,0.35)" }}>
            <svg width="28" height="22" viewBox="0 0 28 22" fill="none">
              <rect x="1" y="1" width="26" height="20" rx="3" stroke="white" strokeWidth="1.5"/>
              <path d="M1 4l13 9L27 4" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
        </div>
        {abrindo && <p style={{ color:"#8a9bb0", fontSize:"12px", marginTop:"14px", letterSpacing:"1px" }}>A abrir...</p>}
      </div>
    </div>
  );
}
"""

part3 = r"""
function ConviteSlides({ evento, nomeConv, relConv }) {
  const [slide, setSlide] = useState(0);
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ nome_convidado:nomeConv||"", email:"", telefone:"", confirmado:true, numero_acompanhantes:0, mensagem:"" });
  const trackRef = useRef();
  const startX = useRef(null);

  const fotos = (Array.isArray(evento.fotos)?evento.fotos:[]).filter(Boolean);
  const programa = (()=>{ try{ return Array.isArray(evento.programa)?evento.programa:JSON.parse(evento.programa||"[]"); }catch{ return []; } })().filter(p=>p.nome);
  const refData = (()=>{ try{ return typeof evento.refeicao==="object"?evento.refeicao:JSON.parse(evento.refeicao||"{}"); }catch{ return {}; } })();
  const pratos = (refData?.pratos||[]).filter(p=>p.nome);
  const bebidas = (refData?.bebidas||[]).filter(b=>b.nome);

  const slides = ["hero","countdown",...(evento.video_url?["video"]:[]),...(fotos.length?["galeria"]:[]),...(programa.length?["programa"]:[]),...((pratos.length||bebidas.length)?["refeicao"]:[]),...(evento.endereco_maps?["mapa"]:[]),"rsvp"];
  const total = slides.length;

  const goTo = useCallback((n) => {
    const next = Math.max(0, Math.min(total-1, n));
    setSlide(next);
    if (trackRef.current) trackRef.current.style.transform = "translateX(-"+(next*(100/total))+"%)";
  }, [total]);

  useEffect(() => {
    const h = (e) => { if (e.key==="ArrowRight") goTo(slide+1); if (e.key==="ArrowLeft") goTo(slide-1); };
    window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h);
  }, [slide, goTo]);

  const onTS = (e) => { startX.current = e.touches[0].clientX; };
  const onTE = (e) => { if (startX.current===null) return; const dx = startX.current - e.changedTouches[0].clientX; if (Math.abs(dx)>40) goTo(slide+(dx>0?1:-1)); startX.current=null; };

  const bg = evento.foto_capa
    ? "linear-gradient(to bottom,rgba(0,0,0,0.5) 0%,rgba(13,13,26,0.88) 65%,#0d0d1a 100%),url("+evento.foto_capa+") center/cover no-repeat"
    : "linear-gradient(160deg,#0d0d1a 0%,#1a0a2e 50%,#0d1a2e 100%)";

  const inpS = { width:"100%", padding:"10px 13px", borderRadius:"8px", border:"1px solid rgba(255,255,255,0.12)", background:"rgba(255,255,255,0.06)", color:"white", fontSize:"13px", outline:"none", fontFamily:"'Inter',sans-serif", boxSizing:"border-box" };
  const lblS = { color:"rgba(255,255,255,0.5)", fontSize:"10px", fontWeight:600, display:"block", marginBottom:"6px", letterSpacing:"1px", textTransform:"uppercase" };
  const h2S = { fontFamily:"'Playfair Display',serif", color:"white", fontSize:"clamp(16px,3vw,24px)", fontWeight:700, textAlign:"center", marginBottom:"16px" };
  const secTit = (t) => <p style={{ color:"rgba(255,255,255,0.35)", fontSize:"9px", letterSpacing:"3px", textTransform:"uppercase", marginBottom:"6px", textAlign:"center" }}>{t}</p>;
  const sBase = { width:"100%", height:"100%", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"14px", overflowY:"auto", background:bg, fontFamily:"'Inter',sans-serif" };

  const submit = async (e) => {
    e.preventDefault(); setErro(""); setSubmitting(true);
    if (!form.nome_convidado.trim()) { setErro("O nome e obrigatorio."); setSubmitting(false); return; }
    try { await confirmacoesAPI.criar(evento.id, form); setEnviado(true); }
    catch (err) { setErro(err.message||"Erro ao enviar."); }
    setSubmitting(false);
  };

  const renderSlide = (tipo, i) => {
    if (tipo==="hero") {
      const partes = evento.nome_evento ? evento.nome_evento.split(/[&]/).map(s=>s.trim()).filter(Boolean) : [evento.nome_evento];
      const dataHero = evento.data_evento ? new Date(evento.data_evento).toLocaleDateString("pt-PT",{day:"2-digit",month:"2-digit",year:"numeric"}).replace(/\//g,".") : "";
      return (
        <div key={i} style={{ width:"100%", height:"100%", position:"relative", overflow:"hidden" }}>
          {evento.foto_capa
            ? <img src={evento.foto_capa} alt="" style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", filter:"grayscale(15%)" }}/>
            : <div style={{ position:"absolute", inset:0, background:"linear-gradient(160deg,#1a1a2e,#2d2d44)" }}/>
          }
          <div style={{ position:"absolute", inset:0, background:"linear-gradient(to bottom,rgba(0,0,0,0.55) 0%,rgba(0,0,0,0.05) 38%,rgba(0,0,0,0.05) 62%,rgba(0,0,0,0.65) 100%)" }}/>
          <div style={{ position:"absolute", top:0, left:0, right:0, padding:"22px 16px 0", textAlign:"center", animation:"fadeUp 0.9s ease" }}>
            {partes.length >= 2 ? (
              <h1 style={{ fontFamily:"'Playfair Display',serif", color:"white", fontSize:"clamp(24px,5.5vw,40px)", fontWeight:900, fontStyle:"italic", lineHeight:1.05, margin:0, textShadow:"0 2px 16px rgba(0,0,0,0.7)" }}>
                {partes[0]} <span style={{ fontStyle:"normal", fontWeight:400 }}>&amp;</span> {partes[1]}
              </h1>
            ) : (
              <h1 style={{ fontFamily:"'Playfair Display',serif", color:"white", fontSize:"clamp(18px,4.5vw,32px)", fontWeight:900, fontStyle:"italic", lineHeight:1.1, margin:0, textShadow:"0 2px 16px rgba(0,0,0,0.7)" }}>{evento.nome_evento}</h1>
            )}
            {dataHero && (
              <p style={{ color:"white", fontSize:"clamp(11px,2vw,15px)", fontWeight:300, letterSpacing:"clamp(3px,0.8vw,6px)", marginTop:"8px", textShadow:"0 1px 8px rgba(0,0,0,0.6)" }}>{dataHero}</p>
            )}
          </div>
          {evento.mensagem && (
            <div style={{ position:"absolute", bottom:0, left:0, right:0, padding:"0 16px 22px", textAlign:"center" }}>
              <p style={{ fontFamily:"'Playfair Display',serif", color:"white", fontSize:"clamp(11px,2vw,15px)", fontStyle:"italic", margin:0, textShadow:"0 2px 10px rgba(0,0,0,0.8)", lineHeight:1.4 }}>"{evento.mensagem}"</p>
            </div>
          )}
        </div>
      );
    }
    if (tipo==="countdown") return (
      <div key={i} style={sBase}>
        <div style={{ textAlign:"center", width:"100%" }}>
          {secTit("Estamos a contar")}
          <h2 style={h2S}>{evento.nome_evento}</h2>
          <Countdown dataEvento={evento.data_evento} horaEvento={evento.hora_evento}/>
          <div style={{ background:"rgba(255,255,255,0.04)", borderRadius:"12px", padding:"14px 18px", border:"1px solid rgba(255,255,255,0.08)", display:"inline-block", marginTop:"10px" }}>
            <div style={{ background:"white", borderRadius:"8px", padding:"7px", display:"inline-block" }}>
              <QRCodeSVG value={window.location.origin+"/convite/"+evento.id} size={64} fgColor="#1a0a2e" level="M"/>
            </div>
            <p style={{ color:"rgba(255,255,255,0.3)", fontSize:"9px", marginTop:"7px", letterSpacing:"1px" }}>Partilha este convite</p>
          </div>
        </div>
      </div>
    );
    if (tipo==="video") {
      const yt = evento.video_url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
      return (<div key={i} style={sBase}><div style={{ width:"100%" }}>{secTit("Video")}{yt?<div style={{ borderRadius:"10px", overflow:"hidden", aspectRatio:"16/9" }}><iframe src={"https://www.youtube.com/embed/"+yt[1]+"?rel=0"} style={{ width:"100%", height:"100%", border:"none" }} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen title="Video"/></div>:<video controls src={evento.video_url} style={{ width:"100%", borderRadius:"10px", maxHeight:"45vh" }}/>}</div></div>);
    }
    if (tipo==="galeria") return (
      <div key={i} style={{ ...sBase, justifyContent:"flex-start", paddingTop:"14px" }}>
        <div style={{ width:"100%" }}>{secTit("Galeria de Fotos")}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(80px,1fr))", gap:"5px", marginTop:"8px" }}>
            {fotos.map((f,fi) => (<div key={fi} style={{ aspectRatio:"1", borderRadius:"7px", overflow:"hidden", cursor:"pointer" }} onClick={()=>window.open(f,"_blank")}><img src={f} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }}/></div>))}
          </div>
        </div>
      </div>
    );
    if (tipo==="programa") return (
      <div key={i} style={{ ...sBase, justifyContent:"flex-start", paddingTop:"14px" }}>
        <div style={{ width:"100%" }}>{secTit("Programa")}<h2 style={h2S}>Da Cerimonia</h2>
          <div style={{ position:"relative", paddingLeft:"20px" }}>
            <div style={{ position:"absolute", left:"5px", top:0, bottom:0, width:"1px", background:"rgba(201,169,110,0.3)" }}/>
            {programa.map((p,pi) => (
              <div key={pi} style={{ position:"relative", marginBottom:"16px" }}>
                <div style={{ position:"absolute", left:"-16px", top:"4px", width:"7px", height:"7px", borderRadius:"50%", background:"rgba(201,169,110,0.2)", border:"2px solid #c9a96e" }}/>
                {p.hora && <span style={{ color:"#c9a96e", fontSize:"10px", fontWeight:700, letterSpacing:"1px" }}>{p.hora}</span>}
                <h4 style={{ color:"white", fontSize:"13px", fontWeight:700, margin:"2px 0 3px", fontFamily:"'Playfair Display',serif" }}>{p.nome}</h4>
                {p.local_prog && <span style={{ color:"rgba(255,255,255,0.4)", fontSize:"10px" }}>Local: {p.local_prog.toUpperCase()}</span>}
                {p.descricao && <p style={{ color:"rgba(255,255,255,0.55)", fontSize:"11px", lineHeight:1.4, margin:"3px 0 0" }}>{p.descricao}</p>}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
    if (tipo==="refeicao") return (
      <div key={i} style={{ ...sBase, justifyContent:"flex-start", paddingTop:"14px" }}>
        <div style={{ width:"100%" }}>
          {pratos.length>0 && <>{secTit("Menu")}<h2 style={h2S}>Refeicao</h2>{pratos.map((p,pi)=>(<div key={pi} style={{ display:"flex", gap:"8px", marginBottom:"12px" }}><div style={{ width:"22px", height:"22px", borderRadius:"50%", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", flexShrink:0 }}/><div><p style={{ color:"white", fontSize:"11px", fontWeight:700, margin:"0 0 2px", textTransform:"uppercase" }}>{p.nome}</p>{p.descricao&&<p style={{ color:"rgba(255,255,255,0.45)", fontSize:"10px", margin:0 }}>{p.descricao}</p>}</div></div>))}</>}
          {bebidas.length>0 && <div style={{ borderTop:"1px solid rgba(255,255,255,0.08)", paddingTop:"12px", marginTop:"4px" }}><h2 style={{ ...h2S, fontSize:"clamp(13px,2vw,18px)" }}>Bebidas</h2>{bebidas.map((b,bi)=>(<div key={bi} style={{ display:"flex", gap:"8px", marginBottom:"8px" }}><div style={{ width:"20px", height:"20px", borderRadius:"50%", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", flexShrink:0 }}/><div><p style={{ color:"white", fontSize:"11px", fontWeight:700, margin:"0 0 2px", textTransform:"uppercase" }}>{b.nome}</p>{b.descricao&&<p style={{ color:"rgba(255,255,255,0.45)", fontSize:"10px", margin:0 }}>{b.descricao}</p>}</div></div>))}</div>}
        </div>
      </div>
    );
    if (tipo==="mapa") {
      const apiKey = process.env.REACT_APP_GOOGLE_MAPS_KEY || "";
      const mapaUrl = apiKey ? "https://www.google.com/maps/embed/v1/place?key="+apiKey+"&q="+encodeURIComponent(evento.endereco_maps)+"&zoom=15&language=pt" : "https://maps.google.com/maps?q="+encodeURIComponent(evento.endereco_maps)+"&output=embed";
      return (
        <div key={i} style={sBase}><div style={{ width:"100%" }}>
          {secTit("Localizacao")}<h2 style={h2S}>{evento.local_evento}</h2>
          {evento.endereco_maps && <p style={{ color:"rgba(255,255,255,0.45)", fontSize:"10px", textAlign:"center", marginBottom:"12px", marginTop:"-10px" }}>{evento.endereco_maps}</p>}
          <div style={{ borderRadius:"10px", overflow:"hidden", boxShadow:"0 8px 24px rgba(0,0,0,0.5)", border:"1px solid rgba(255,255,255,0.08)" }}>
            <iframe title="mapa" src={mapaUrl} width="100%" height="200" style={{ border:"none", display:"block" }} loading="lazy" allowFullScreen referrerPolicy="no-referrer-when-downgrade"/>
          </div>
          <a href={"https://maps.google.com/?q="+encodeURIComponent(evento.endereco_maps)} target="_blank" rel="noreferrer" style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:"5px", marginTop:"10px", color:"#c9a96e", fontSize:"11px", fontWeight:600, textDecoration:"none" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#c9a96e" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            Abrir no Google Maps
          </a>
        </div></div>
      );
    }
    if (tipo==="rsvp") return (
      <div key={i} style={{ ...sBase, justifyContent:"flex-start", paddingTop:"14px" }}>
        <div style={{ width:"100%" }}>
          {enviado ? (
            <div style={{ textAlign:"center", padding:"24px 0" }}>
              <div style={{ width:"56px", height:"56px", borderRadius:"50%", background:form.confirmado?"linear-gradient(135deg,#43e97b,#38f9d7)":"linear-gradient(135deg,#f5576c,#f093fb)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 14px", fontSize:"24px", color:"#0d1a0d" }}>{form.confirmado?"✓":"✗"}</div>
              <h2 style={{ ...h2S, marginBottom:"6px" }}>{form.confirmado?"Presenca Confirmada!":"Resposta Enviada"}</h2>
              <p style={{ color:"rgba(255,255,255,0.55)", lineHeight:1.5, fontSize:"12px" }}>{form.confirmado?"Obrigado, "+form.nome_convidado+"! Ate breve.":"Obrigado por responder, "+form.nome_convidado+"."}</p>
            </div>
          ) : (
            <>{secTit("RSVP")}<h2 style={h2S}>Confirmar Presenca</h2>
              <form onSubmit={submit}>
                <div style={{ marginBottom:"10px" }}><label style={lblS}>Nome completo *</label><input type="text" value={form.nome_convidado} onChange={e=>setForm({...form,nome_convidado:e.target.value})} required placeholder="O seu nome" style={inpS}/></div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px", marginBottom:"10px" }}>
                  <div><label style={lblS}>Email</label><input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="seu@email.com" style={inpS}/></div>
                  <div><label style={lblS}>Telefone</label><input type="tel" value={form.telefone} onChange={e=>setForm({...form,telefone:e.target.value})} placeholder="+258 84 000 0000" style={inpS}/></div>
                </div>
                <div style={{ marginBottom:"10px" }}><label style={lblS}>Vai comparecer? *</label>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"7px" }}>
                    <button type="button" onClick={()=>setForm({...form,confirmado:true})} style={{ padding:"9px", borderRadius:"7px", border:"2px solid "+(form.confirmado?"#43e97b":"rgba(255,255,255,0.12)"), background:form.confirmado?"rgba(67,233,123,0.12)":"transparent", color:form.confirmado?"#43e97b":"rgba(255,255,255,0.5)", fontWeight:700, fontSize:"12px", cursor:"pointer" }}>Sim, vou!</button>
                    <button type="button" onClick={()=>setForm({...form,confirmado:false,numero_acompanhantes:0})} style={{ padding:"9px", borderRadius:"7px", border:"2px solid "+(!form.confirmado?"#f5576c":"rgba(255,255,255,0.12)"), background:!form.confirmado?"rgba(245,87,108,0.12)":"transparent", color:!form.confirmado?"#f5576c":"rgba(255,255,255,0.5)", fontWeight:700, fontSize:"12px", cursor:"pointer" }}>Nao posso</button>
                  </div>
                </div>
                {form.confirmado && <div style={{ marginBottom:"10px" }}><label style={lblS}>Acompanhantes</label><input type="number" min="0" max="20" value={form.numero_acompanhantes} onChange={e=>setForm({...form,numero_acompanhantes:parseInt(e.target.value)||0})} style={inpS}/></div>}
                <div style={{ marginBottom:"12px" }}><label style={lblS}>Mensagem (opcional)</label><textarea value={form.mensagem} onChange={e=>setForm({...form,mensagem:e.target.value})} rows="2" placeholder="Deixe uma mensagem..." style={{ ...inpS, resize:"vertical" }}/></div>
                {erro && <div style={{ background:"rgba(245,87,108,0.12)", border:"1px solid rgba(245,87,108,0.3)", borderRadius:"7px", padding:"8px 10px", color:"#f5576c", marginBottom:"10px", fontSize:"11px" }}>{erro}</div>}
                <button type="submit" disabled={submitting} style={{ width:"100%", padding:"12px", borderRadius:"9px", border:"none", background:form.confirmado?"linear-gradient(135deg,#43e97b,#38f9d7)":"linear-gradient(135deg,#667eea,#764ba2)", color:form.confirmado?"#0d1a0d":"white", fontSize:"13px", fontWeight:800, cursor:submitting?"wait":"pointer", opacity:submitting?0.7:1 }}>
                  {submitting?"A enviar...":form.confirmado?"Confirmar Presenca":"Enviar Resposta"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    );
    return null;
  };

  return (
    <div style={{ width:"100vw", height:"100vh", overflow:"hidden", position:"relative", fontFamily:"'Inter',sans-serif", background:"linear-gradient(135deg,#c8d8ea 0%,#dce8f5 50%,#c8dcea 100%)", display:"flex", alignItems:"center", justifyContent:"center" }} onTouchStart={onTS} onTouchEnd={onTE}>
      <style>{CSS}</style>
      {evento.musica_url && <MusicaPlayer url={evento.musica_url}/>}
      <div style={{ display:"flex", alignItems:"center", gap:"clamp(6px,1.5vw,20px)" }}>
        <button onClick={()=>goTo(slide-1)} disabled={slide===0} aria-label="Anterior" style={{ width:"48px", height:"48px", borderRadius:"50%", background:"rgba(255,255,255,0.88)", border:"none", cursor:slide===0?"not-allowed":"pointer", opacity:slide===0?0.25:1, fontSize:"26px", color:"#3a4a5a", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 4px 18px rgba(0,0,0,0.18)", flexShrink:0 }}>&#8249;</button>
        <div style={{ width:"min(400px,88vw)", height:"min(640px,86vh)", borderRadius:"38px", background:"#181c28", boxShadow:"0 0 0 2px #252b3a, 0 0 0 7px #181c28, 0 40px 100px rgba(0,0,0,0.5), 0 10px 30px rgba(0,0,0,0.35)", position:"relative", overflow:"hidden", flexShrink:0 }}>
          <div style={{ position:"absolute", top:0, left:0, right:0, height:"26px", background:"#181c28", zIndex:10, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <div style={{ width:"7px", height:"7px", borderRadius:"50%", background:"#252b3a" }}/>
          </div>
          <div style={{ position:"absolute", top:"26px", left:0, right:0, bottom:"26px", overflow:"hidden" }}>
            <div ref={trackRef} style={{ display:"flex", width:total+"00%", height:"100%", transition:"transform 0.55s cubic-bezier(0.4,0,0.2,1)" }}>
              {slides.map((tipo, i) => (
                <div key={i} style={{ width:(100/total)+"%", height:"100%", flexShrink:0, overflow:"hidden" }}>
                  {renderSlide(tipo, i)}
                </div>
              ))}
            </div>
          </div>
          <div style={{ position:"absolute", bottom:0, left:0, right:0, height:"26px", background:"#181c28", zIndex:10, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <div style={{ width:"44px", height:"4px", borderRadius:"2px", background:"#252b3a" }}/>
          </div>
        </div>
        <button onClick={()=>goTo(slide+1)} disabled={slide===total-1} aria-label="Proximo" style={{ width:"48px", height:"48px", borderRadius:"50%", background:"rgba(255,255,255,0.88)", border:"none", cursor:slide===total-1?"not-allowed":"pointer", opacity:slide===total-1?0.25:1, fontSize:"26px", color:"#3a4a5a", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 4px 18px rgba(0,0,0,0.18)", flexShrink:0 }}>&#8250;</button>
      </div>
      <div style={{ position:"absolute", bottom:"clamp(10px,2.5vh,22px)", left:"50%", transform:"translateX(-50%)", display:"flex", gap:"7px", zIndex:100 }}>
        {slides.map((_,i) => (<button key={i} onClick={()=>goTo(i)} aria-label={"Slide "+(i+1)} style={{ width:i===slide?"22px":"7px", height:"7px", borderRadius:"4px", background:i===slide?"#4a6a8a":"rgba(74,106,138,0.35)", border:"none", cursor:"pointer", transition:"all 0.3s", padding:0 }}/>))}
      </div>
    </div>
  );
}

function ConvitePublico() {
  const { id } = useParams();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const nomeConv = params.get("nome");
  const relConv = params.get("rel");
  const [aberto, setAberto] = useState(false);
  const [evento, setEvento] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    convitesAPI.buscarPorId(id).then(d => setEvento(d)).catch(() => setErro("Convite nao encontrado.")).finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div style={{ minHeight:"100vh", background:"#f5f0eb", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Inter',sans-serif" }}>
      <style>{CSS}</style>
      <div style={{ color:"#1a2332", textAlign:"center" }}><div style={{ fontSize:"48px", marginBottom:"16px" }}>✉️</div>A carregar...</div>
    </div>
  );

  if (erro || !evento) return (
    <div style={{ minHeight:"100vh", background:"#f5f0eb", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Inter',sans-serif" }}>
      <style>{CSS}</style>
      <div style={{ background:"white", borderRadius:"20px", padding:"48px", textAlign:"center", maxWidth:"400px", boxShadow:"0 8px 32px rgba(0,0,0,0.1)" }}>
        <div style={{ fontSize:"48px", marginBottom:"16px" }}>😕</div>
        <h2 style={{ color:"#1a2332", fontFamily:"'Playfair Display',serif" }}>Convite nao encontrado</h2>
        <p style={{ color:"#8a9bb0", marginTop:"12px" }}>O link pode estar incorreto.</p>
      </div>
    </div>
  );

  if (!aberto) return <Envelope nome={nomeConv} relacao={relConv} nomeEvento={evento.nome_evento} dataEvento={evento.data_evento} horaEvento={evento.hora_evento} localEvento={evento.local_evento} onAbrir={() => setAberto(true)}/>;
  return <ConviteSlides evento={evento} nomeConv={nomeConv} relConv={relConv}/>;
}

export default ConvitePublico;
"""

with open(path, 'w', encoding='utf-8') as f:
    f.write(part1 + part2 + part3)

print("OK - arquivo escrito:", path)
import os
print("Tamanho:", os.path.getsize(path), "bytes")
