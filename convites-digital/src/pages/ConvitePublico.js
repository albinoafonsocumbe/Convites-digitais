import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useLocation } from "react-router-dom";
import { convitesAPI, confirmacoesAPI } from "../services/api";
import { getConviteShareUrl } from "../services/shareUrl";
import { QRCodeSVG } from "qrcode.react";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400;1,600;1,700&family=Inter:wght@300;400;500;600;700&display=swap');
*{box-sizing:border-box;}
body{overflow:hidden;margin:0;background:#d0d0d0;}
@keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
@keyframes rodar{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
@keyframes aparecer{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}
@keyframes floatUp{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
@keyframes brilho{0%,100%{opacity:0.15}50%{opacity:0.7}}
@keyframes pulse-gold{0%,100%{box-shadow:0 0 0 0 rgba(201,160,70,0)}50%{box-shadow:0 0 24px 3px rgba(201,160,70,0.2)}}
input::placeholder,textarea::placeholder{color:rgba(0,0,0,0.25);}
input,textarea{font-family:'Inter',sans-serif;}
.phone-scroll{height:100%;overflow-y:auto;overflow-x:hidden;scroll-snap-type:y mandatory;scrollbar-width:none;-ms-overflow-style:none;}
.phone-scroll::-webkit-scrollbar{display:none;}
.phone-section{min-height:100%;scroll-snap-align:start;}
.phone-section-free{scroll-snap-align:start;}
`;

const GOLD = "#c9a046";
const GOLD_LIGHT = "rgba(201,160,70,0.12)";
const DARK = "#111";

// ─── Música Player (fixo, canto inferior esquerdo) ────────────────────────────
function MusicaPlayer({ url, autoPlay }) {
  const ref = useRef();
  const [on, setOn] = useState(false);
  const tried = useRef(false);
  useEffect(() => {
    const a = ref.current; if (!a || !url) return;
    a.addEventListener("ended", () => setOn(false));
    a.addEventListener("error", () => {});
    return () => {};
  }, [url]);
  useEffect(() => {
    if (autoPlay && !tried.current && ref.current && url) {
      tried.current = true;
      ref.current.play().then(() => setOn(true)).catch(() => {});
    }
  }, [autoPlay, url]);
  const tog = () => {
    const a = ref.current; if (!a) return;
    if (on) { a.pause(); setOn(false); } else { a.play().then(() => setOn(true)).catch(() => {}); }
  };
  if (!url || !url.trim()) return null;
  return (
    <div style={{position:"absolute",bottom:"70px",left:"14px",zIndex:200}}>
      <audio ref={ref} src={url} loop preload="none" onError={()=>{}} onAbort={()=>{}} onStalled={()=>{}}/>
      <button onClick={tog} style={{width:"44px",height:"44px",borderRadius:"50%",background:GOLD,border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 4px 16px rgba(201,160,70,0.5)",transition:"transform 0.2s"}}>
        {on
          ? <svg width="14" height="14" viewBox="0 0 12 12" fill="white"><rect x="1" y="1" width="3.5" height="10" rx="1"/><rect x="7.5" y="1" width="3.5" height="10" rx="1"/></svg>
          : <svg width="14" height="14" viewBox="0 0 12 12" fill="white"><polygon points="3,1 11,6 3,11"/></svg>
        }
      </button>
    </div>
  );
}

// ─── Envelope ─────────────────────────────────────────────────────────────────
function Envelope({ nome, relacao, nomeEvento, dataEvento, horaEvento, localEvento, onAbrir }) {
  const [abrindo, setAbrindo] = useState(false);
  const abrir = () => { if (abrindo) return; setAbrindo(true); setTimeout(onAbrir, 1000); };
  const partes = nomeEvento ? nomeEvento.split(/[&]/).map(s => s.trim()).filter(Boolean) : [nomeEvento];
  const dataFmt = dataEvento ? new Date(dataEvento).toLocaleDateString("pt-PT", { day: "2-digit", month: "long", year: "numeric" }) : "";
  return (
    <div style={{minHeight:"100vh",background:"#1a1a1a",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Inter',sans-serif",overflow:"hidden",position:"relative"}}>
      <style>{CSS+`
        @keyframes spin-slow{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        .env-btn:hover .env-inner{transform:scale(1.06)!important;}
      `}</style>
      <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse 70% 50% at 50% 0%,rgba(201,160,70,0.08) 0%,transparent 70%)"}}/>
      {[...Array(14)].map((_,i)=>(
        <div key={i} style={{position:"absolute",width:"1px",height:"1px",borderRadius:"50%",background:`rgba(201,160,70,${0.15+i*0.04})`,top:(7+i*6)+"%",left:(4+i*6.5)+"%",animation:`brilho ${2+i*0.2}s ease-in-out infinite`,animationDelay:i*0.15+"s"}}/>
      ))}
      <div style={{textAlign:"center",maxWidth:"360px",width:"100%",padding:"40px 28px",animation:"aparecer 1s ease",position:"relative",zIndex:2,background:"rgba(255,255,255,0.03)",backdropFilter:"blur(10px)",borderRadius:"2px",border:"1px solid rgba(201,160,70,0.1)",boxShadow:"0 40px 80px rgba(0,0,0,0.5),inset 0 1px 0 rgba(255,255,255,0.04)"}}>
        {/* Cantos */}
        {[["top","left"],["top","right"],["bottom","left"],["bottom","right"]].map(([v,h],ci)=>(
          <div key={ci} style={{position:"absolute",[v]:"12px",[h]:"12px",width:"16px",height:"16px",[`border${v.charAt(0).toUpperCase()+v.slice(1)}`]:`1px solid rgba(201,160,70,0.4)`,[`border${h.charAt(0).toUpperCase()+h.slice(1)}`]:`1px solid rgba(201,160,70,0.4)`}}/>
        ))}
        <div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"24px",justifyContent:"center"}}>
          <div style={{flex:1,height:"1px",background:"linear-gradient(to right,transparent,rgba(201,160,70,0.4))"}}/>
          <svg width="14" height="14" viewBox="0 0 16 16" fill={GOLD}><polygon points="8,0 10,6 16,6 11,10 13,16 8,12 3,16 5,10 0,6 6,6"/></svg>
          <div style={{flex:1,height:"1px",background:"linear-gradient(to left,transparent,rgba(201,160,70,0.4))"}}/>
        </div>
        <p style={{color:"rgba(201,160,70,0.6)",fontSize:"8px",fontWeight:700,letterSpacing:"5px",textTransform:"uppercase",marginBottom:"12px"}}>
          {nome ? (relacao ? relacao.toUpperCase()+" DE HONRA" : "CONVIDADO ESPECIAL") : "CONVITE PARA"}
        </p>
        {nome ? (
          <h1 style={{fontFamily:"'Cormorant Garamond',serif",color:"white",fontSize:"clamp(32px,8vw,52px)",fontWeight:600,fontStyle:"italic",lineHeight:1.05,margin:"0 0 18px"}}>{nome}</h1>
        ) : partes.length >= 2 ? (
          <div style={{marginBottom:"18px"}}>
            <h1 style={{fontFamily:"'Cormorant Garamond',serif",color:"white",fontSize:"clamp(30px,7vw,48px)",fontWeight:600,fontStyle:"italic",lineHeight:1,margin:0}}>{partes[0]}</h1>
            <p style={{fontFamily:"'Cormorant Garamond',serif",color:GOLD,fontSize:"clamp(20px,5vw,32px)",margin:"2px 0",letterSpacing:"6px"}}>&</p>
            <h1 style={{fontFamily:"'Cormorant Garamond',serif",color:"white",fontSize:"clamp(30px,7vw,48px)",fontWeight:600,fontStyle:"italic",lineHeight:1,margin:0}}>{partes[1]}</h1>
          </div>
        ) : (
          <h1 style={{fontFamily:"'Cormorant Garamond',serif",color:"white",fontSize:"clamp(26px,6vw,44px)",fontWeight:600,fontStyle:"italic",lineHeight:1.1,marginBottom:"18px"}}>{nomeEvento}</h1>
        )}
        <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"16px",justifyContent:"center"}}>
          <div style={{flex:1,height:"1px",background:"linear-gradient(to right,transparent,rgba(201,160,70,0.3))"}}/>
          <div style={{width:"4px",height:"4px",borderRadius:"50%",background:GOLD}}/>
          <div style={{flex:1,height:"1px",background:"linear-gradient(to left,transparent,rgba(201,160,70,0.3))"}}/>
        </div>
        {nome && (
          <p style={{fontFamily:"'Cormorant Garamond',serif",color:"rgba(255,255,255,0.5)",fontSize:"clamp(14px,3vw,18px)",fontStyle:"italic",margin:"0 0 16px"}}>
            {partes.length >= 2 ? `${partes[0]} & ${partes[1]}` : nomeEvento}
          </p>
        )}
        <div style={{display:"flex",gap:"6px",justifyContent:"center",marginBottom:"28px",flexWrap:"wrap"}}>
          {dataFmt && <span style={{color:"rgba(255,255,255,0.45)",fontSize:"11px"}}>{dataFmt}</span>}
          {dataFmt && horaEvento && <span style={{color:"rgba(201,160,70,0.4)",fontSize:"11px"}}>·</span>}
          {horaEvento && <span style={{color:"rgba(255,255,255,0.45)",fontSize:"11px"}}>{horaEvento}</span>}
          {localEvento && <span style={{color:"rgba(255,255,255,0.35)",fontSize:"11px"}}>· {localEvento}</span>}
        </div>
        <div style={{animation:"floatUp 3s ease-in-out infinite"}}>
          <div onClick={abrir} className="env-btn" style={{position:"relative",width:"96px",height:"96px",margin:"0 auto",cursor:abrindo?"wait":"pointer"}}>
            <svg viewBox="0 0 96 96" style={{position:"absolute",inset:0,width:"100%",height:"100%",animation:"spin-slow 16s linear infinite"}}>
              <defs><path id="c4" d="M 48,48 m -36,0 a 36,36 0 1,1 72,0 a 36,36 0 1,1 -72,0"/></defs>
              <text style={{fontSize:"7px",fill:"rgba(201,160,70,0.55)",fontWeight:600,letterSpacing:"2.5px"}}>
                <textPath href="#c4">ABRIR CONVITE ◆ ABRIR CONVITE ◆ ABRIR</textPath>
              </text>
            </svg>
            <div className="env-inner" style={{position:"absolute",inset:"12px",borderRadius:"50%",background:"rgba(201,160,70,0.08)",border:"1px solid rgba(201,160,70,0.3)",display:"flex",alignItems:"center",justifyContent:"center",transition:"transform 0.3s, box-shadow 0.3s",boxShadow:"0 0 20px rgba(201,160,70,0.06)",animation:abrindo?"none":"pulse-gold 3s ease-in-out infinite"}}>
              {abrindo
                ? <div style={{width:"16px",height:"16px",border:"1.5px solid rgba(201,160,70,0.3)",borderTopColor:GOLD,borderRadius:"50%",animation:"rodar 0.8s linear infinite"}}/>
                : <svg width="26" height="20" viewBox="0 0 32 26" fill="none"><rect x="1" y="1" width="30" height="24" rx="3" stroke={GOLD} strokeWidth="1.2"/><path d="M1 5l15 10L31 5" stroke={GOLD} strokeWidth="1.2" strokeLinecap="round"/><path d="M1 21l9-7M31 21l-9-7" stroke="rgba(201,160,70,0.3)" strokeWidth="1" strokeLinecap="round"/></svg>
              }
            </div>
          </div>
        </div>
        {abrindo && <p style={{color:"rgba(201,160,70,0.5)",fontSize:"8px",marginTop:"14px",letterSpacing:"3px",textTransform:"uppercase"}}>A abrir...</p>}
        {!abrindo && <p style={{color:"rgba(255,255,255,0.18)",fontSize:"8px",marginTop:"12px",letterSpacing:"2px",textTransform:"uppercase"}}>Toque para abrir</p>}
      </div>
    </div>
  );
}

// ─── ConviteSlides — frame de telemóvel com scroll vertical interno ────────────
function ConviteSlides({ evento, nomeConv, relConv }) {
  const [tab, setTab] = useState(0);
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ nome_convidado:nomeConv||"", email:"", telefone:"", confirmado:true, mensagem:"" });
  const [fotoIdx, setFotoIdx] = useState(0);
  const [viIdx, setViIdx] = useState(0);

  const programa = (()=>{ try{ return Array.isArray(evento.programa)?evento.programa:JSON.parse(evento.programa||"[]"); }catch{ return []; } })().filter(p=>p.nome);
  const refData = (()=>{ try{ return typeof evento.refeicao==="object"?evento.refeicao:JSON.parse(evento.refeicao||"{}"); }catch{ return {}; } })();
  const pratos = (refData?.pratos||[]).filter(p=>p.nome);
  const bebidas = (refData?.bebidas||[]).filter(b=>b.nome);
  const fotos = [...(evento.foto_capa?[evento.foto_capa]:[]),...(Array.isArray(evento.fotos)?evento.fotos.filter(Boolean):[])].filter((f,i,a)=>a.indexOf(f)===i);
  const videos = [...(Array.isArray(evento.videos_urls)?evento.videos_urls:[]),...(evento.video_url&&!Array.isArray(evento.videos_urls)?[evento.video_url]:[])].filter(Boolean);

  // Tabs da barra inferior
  const tabs = [
    { id:"inicio", icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg>, label:"Início" },
    { id:"noivos", icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>, label:"Noivos" },
    { id:"agenda", icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>, label:"Agenda" },
    { id:"rsvp", icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>, label:"RSVP" },
    { id:"galeria", icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21,15 16,10 5,21"/></svg>, label:"Galeria" },
  ];

  const partes = evento.nome_evento ? evento.nome_evento.split(/[&]/).map(s=>s.trim()).filter(Boolean) : [evento.nome_evento];
  const dataFmt = evento.data_evento ? new Date(evento.data_evento).toLocaleDateString("pt-PT",{day:"2-digit",month:"2-digit",year:"numeric"}).replace(/\//g," · ") : "";
  const dataLonga = evento.data_evento ? new Date(evento.data_evento).toLocaleDateString("pt-PT",{weekday:"long",day:"2-digit",month:"long",year:"numeric"}) : "";

  const submit = async (e) => {
    e.preventDefault(); setErro(""); setSubmitting(true);
    if (!form.nome_convidado.trim()) { setErro("O nome é obrigatório."); setSubmitting(false); return; }
    try { await confirmacoesAPI.criar(evento.id, form); setEnviado(true); }
    catch(err) { setErro(err.message||"Erro ao enviar."); }
    setSubmitting(false);
  };

  const renderVideo = (url, key) => {
    if (!url||!url.trim()) return null;
    const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
    const vimeo = url.match(/vimeo\.com\/(\d+)/);
    if (yt) return <iframe key={key} src={"https://www.youtube.com/embed/"+yt[1]+"?rel=0&controls=1"} style={{width:"100%",height:"100%",border:"none"}} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen title="Video"/>;
    if (vimeo) return <iframe key={key} src={"https://player.vimeo.com/video/"+vimeo[1]+"?title=0&byline=0&portrait=0"} style={{width:"100%",height:"100%",border:"none"}} allow="autoplay; fullscreen; picture-in-picture" allowFullScreen title="Video"/>;
    return <video key={key} src={url} controls playsInline style={{width:"100%",height:"100%",objectFit:"cover"}}/>;
  };

  // Estilos reutilizáveis
  const sectionTitle = (t) => (
    <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(28px,7vw,40px)",fontWeight:400,color:DARK,textAlign:"center",margin:"0 0 8px",letterSpacing:"-0.5px"}}>{t}</h2>
  );
  const divider = (
    <div style={{display:"flex",alignItems:"center",gap:"10px",justifyContent:"center",margin:"12px auto 20px",width:"100px"}}>
      <div style={{flex:1,height:"1px",background:`linear-gradient(to right,transparent,rgba(201,160,70,0.5))`}}/>
      <div style={{width:"4px",height:"4px",borderRadius:"50%",background:GOLD}}/>
      <div style={{flex:1,height:"1px",background:`linear-gradient(to left,transparent,rgba(201,160,70,0.5))`}}/>
    </div>
  );

  // ── Tab: Início ──
  const TabInicio = () => (
    <div className="phone-scroll" style={{height:"100%"}}>
      {/* Hero: foto de capa + nome */}
      <div className="phone-section" style={{position:"relative",background:"#f0eeec",minHeight:"100%",display:"flex",flexDirection:"column"}}>
        {/* Foto capa */}
        <div style={{flex:"0 0 52%",position:"relative",overflow:"hidden"}}>
          {fotos[0]
            ? <img src={fotos[0]} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
            : <div style={{width:"100%",height:"100%",background:"linear-gradient(160deg,#2a2a2a,#111)"}}/>
          }
          <div style={{position:"absolute",bottom:0,left:0,right:0,height:"80px",background:"linear-gradient(to top,#f0eeec,transparent)"}}/>
        </div>
        {/* Conteúdo */}
        <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"16px 24px 20px",textAlign:"center"}}>
          <p style={{color:"rgba(0,0,0,0.4)",fontSize:"9px",fontWeight:700,letterSpacing:"4px",textTransform:"uppercase",marginBottom:"8px"}}>O CASAMENTO DE</p>
          {partes.length >= 2 ? (
            <h1 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(28px,7vw,42px)",fontWeight:400,color:DARK,margin:"0 0 4px",letterSpacing:"-0.5px"}}>
              {partes[0]} <span style={{fontStyle:"italic"}}>&amp;</span> {partes[1]}
            </h1>
          ) : (
            <h1 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(24px,6vw,36px)",fontWeight:400,color:DARK,margin:"0 0 4px"}}>{evento.nome_evento}</h1>
          )}
          <p style={{color:"rgba(0,0,0,0.45)",fontSize:"13px",letterSpacing:"3px",margin:"8px 0 16px"}}>{dataFmt}</p>
          {evento.mensagem && (
            <p style={{fontFamily:"'Cormorant Garamond',serif",color:"rgba(0,0,0,0.55)",fontSize:"clamp(13px,3vw,16px)",fontStyle:"italic",lineHeight:1.6,margin:"0 0 16px",maxWidth:"280px"}}>"{evento.mensagem}"</p>
          )}
          {/* Seta para baixo */}
          <div style={{marginTop:"4px"}}>
            <svg width="20" height="12" viewBox="0 0 20 12" fill="none"><path d="M2 2L10 10L18 2" stroke={GOLD} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
        </div>
      </div>

      {/* Countdown */}
      <div className="phone-section" style={{background:"#fefcf8",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"32px 24px",textAlign:"center"}}>
        {sectionTitle("Contagem")}
        {divider}
        <CountdownBlocks evento={evento}/>
        {/* Data longa */}
        <p style={{color:"rgba(0,0,0,0.4)",fontSize:"11px",marginTop:"20px",letterSpacing:"0.5px",lineHeight:1.5}}>{dataLonga}</p>
        {evento.hora_evento && <p style={{color:GOLD,fontSize:"18px",fontWeight:600,fontFamily:"'Cormorant Garamond',serif",margin:"4px 0 0"}}>{evento.hora_evento}H</p>}
      </div>

      {/* Localização */}
      {(evento.endereco_maps||evento.local_evento) && (
        <div className="phone-section" style={{display:"flex",flexDirection:"column",background:"#fff"}}>
          <div style={{padding:"20px 20px 12px",textAlign:"center"}}>
            {sectionTitle("Local")}
            {divider}
            <p style={{color:"rgba(0,0,0,0.5)",fontSize:"12px",margin:"0 0 6px"}}>{evento.local_evento}</p>
            {evento.endereco_maps && <p style={{color:"rgba(0,0,0,0.35)",fontSize:"11px",margin:"0 0 10px"}}>{evento.endereco_maps}</p>}
          </div>
          <div style={{flex:1,minHeight:"200px",position:"relative"}}>
            <iframe title="mapa"
              src={(process.env.REACT_APP_GOOGLE_MAPS_KEY
                ? "https://www.google.com/maps/embed/v1/place?key="+process.env.REACT_APP_GOOGLE_MAPS_KEY+"&q="+encodeURIComponent(evento.endereco_maps||evento.local_evento)+"&zoom=15&language=pt"
                : "https://maps.google.com/maps?q="+encodeURIComponent(evento.endereco_maps||evento.local_evento)+"&output=embed")}
              width="100%" height="100%" style={{border:"none",display:"block",minHeight:"200px"}} loading="lazy" allowFullScreen referrerPolicy="no-referrer-when-downgrade"/>
          </div>
          <a href={"https://maps.google.com/?q="+encodeURIComponent(evento.endereco_maps||evento.local_evento)} target="_blank" rel="noreferrer"
            style={{display:"flex",alignItems:"center",justifyContent:"center",gap:"6px",background:DARK,color:"white",padding:"13px",fontSize:"10px",fontWeight:700,textDecoration:"none",letterSpacing:"2px",textTransform:"uppercase"}}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            Abrir no Maps
          </a>
        </div>
      )}
    </div>
  );

  // ── Tab: Noivos ──
  const TabNoivos = () => (
    <div className="phone-scroll" style={{height:"100%"}}>
      <div className="phone-section-free" style={{background:"#f0eeec",padding:"32px 24px 40px",minHeight:"100%",textAlign:"center"}}>
        {sectionTitle("Os Noivos")}
        {divider}
        {fotos[0] && (
          <div style={{width:"120px",height:"120px",borderRadius:"50%",overflow:"hidden",margin:"0 auto 20px",border:"3px solid white",boxShadow:"0 4px 20px rgba(0,0,0,0.1)"}}>
            <img src={fotos[0]} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
          </div>
        )}
        {partes.length >= 2 ? (
          <>
            <div style={{marginBottom:"20px"}}>
              <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(36px,9vw,52px)",fontWeight:400,fontStyle:"italic",color:DARK,margin:0}}>{partes[0]}</h2>
            </div>
            <div style={{margin:"8px 0 20px"}}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(0,0,0,0.2)" strokeWidth="1"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            </div>
            <div style={{marginBottom:"20px"}}>
              <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(36px,9vw,52px)",fontWeight:400,fontStyle:"italic",color:DARK,margin:0}}>{partes[1]}</h2>
            </div>
          </>
        ) : (
          <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(28px,7vw,44px)",fontWeight:400,fontStyle:"italic",color:DARK,margin:"0 0 20px"}}>{evento.nome_evento}</h2>
        )}
        <div style={{width:"48px",height:"1px",background:`rgba(201,160,70,0.4)`,margin:"0 auto 16px"}}/>
        <p style={{color:"rgba(0,0,0,0.4)",fontSize:"12px",letterSpacing:"2px",textTransform:"uppercase"}}>{dataFmt}</p>
        {evento.local_evento && <p style={{color:"rgba(0,0,0,0.35)",fontSize:"11px",marginTop:"6px"}}>{evento.local_evento}</p>}
      </div>
    </div>
  );

  // ── Tab: Agenda (programa + refeição) ──
  const TabAgenda = () => (
    <div className="phone-scroll" style={{height:"100%"}}>
      <div className="phone-section-free" style={{background:"#fefcf8",padding:"28px 22px 40px",minHeight:"100%"}}>
        {sectionTitle("Agenda")}
        {divider}
        {programa.length > 0 && (
          <div style={{marginBottom:"24px"}}>
            <p style={{color:"rgba(0,0,0,0.35)",fontSize:"8px",fontWeight:700,letterSpacing:"3px",textTransform:"uppercase",marginBottom:"16px",textAlign:"center"}}>PROGRAMA</p>
            <div style={{position:"relative",paddingLeft:"48px"}}>
              <div style={{position:"absolute",left:"18px",top:0,bottom:0,width:"1px",background:`rgba(201,160,70,0.2)`}}/>
              {programa.map((p,pi) => (
                <div key={pi} style={{position:"relative",marginBottom:"20px"}}>
                  <div style={{position:"absolute",left:"-34px",top:"3px",width:"8px",height:"8px",borderRadius:"50%",border:"1px solid rgba(201,160,70,0.5)",background:"#fefcf8"}}/>
                  {p.hora && <span style={{position:"absolute",left:"-48px",top:0,color:GOLD,fontSize:"9px",fontWeight:700,whiteSpace:"nowrap"}}>{p.hora}</span>}
                  <h4 style={{color:DARK,fontSize:"13px",fontWeight:600,margin:"0 0 3px"}}>{p.nome}</h4>
                  {p.local_prog && <p style={{color:"rgba(0,0,0,0.4)",fontSize:"10px",margin:"0 0 2px",textTransform:"uppercase",letterSpacing:"0.5px"}}>📍 {p.local_prog}</p>}
                  {p.descricao && <p style={{color:"rgba(0,0,0,0.5)",fontSize:"11px",lineHeight:1.5,margin:0}}>{p.descricao}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
        {(pratos.length > 0 || bebidas.length > 0) && (
          <div>
            <div style={{width:"100%",height:"1px",background:`rgba(201,160,70,0.15)`,margin:"0 0 20px"}}/>
            <p style={{color:"rgba(0,0,0,0.35)",fontSize:"8px",fontWeight:700,letterSpacing:"3px",textTransform:"uppercase",marginBottom:"16px",textAlign:"center"}}>REFEIÇÃO</p>
            {pratos.map((p,pi) => (
              <div key={pi} style={{display:"flex",gap:"10px",marginBottom:"12px",alignItems:"flex-start"}}>
                <div style={{width:"5px",height:"5px",borderRadius:"50%",background:`rgba(201,160,70,0.5)`,flexShrink:0,marginTop:"5px"}}/>
                <div>
                  <p style={{color:DARK,fontSize:"12px",fontWeight:600,margin:"0 0 1px"}}>{p.nome}</p>
                  {p.descricao && <p style={{color:"rgba(0,0,0,0.4)",fontSize:"10px",margin:0}}>{p.descricao}</p>}
                </div>
              </div>
            ))}
            {bebidas.length > 0 && (
              <>
                <p style={{color:"rgba(0,0,0,0.3)",fontSize:"8px",fontWeight:700,letterSpacing:"3px",textTransform:"uppercase",margin:"14px 0 10px",textAlign:"center"}}>BEBIDAS</p>
                {bebidas.map((b,bi) => (
                  <div key={bi} style={{display:"flex",gap:"10px",marginBottom:"10px",alignItems:"flex-start"}}>
                    <div style={{width:"5px",height:"5px",borderRadius:"50%",background:`rgba(201,160,70,0.5)`,flexShrink:0,marginTop:"5px"}}/>
                    <div>
                      <p style={{color:DARK,fontSize:"12px",fontWeight:600,margin:"0 0 1px"}}>{b.nome}</p>
                      {b.descricao && <p style={{color:"rgba(0,0,0,0.4)",fontSize:"10px",margin:0}}>{b.descricao}</p>}
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
        {programa.length === 0 && pratos.length === 0 && (
          <p style={{color:"rgba(0,0,0,0.3)",fontSize:"13px",textAlign:"center",fontStyle:"italic",fontFamily:"'Cormorant Garamond',serif"}}>Agenda em breve</p>
        )}
      </div>
    </div>
  );

  // ── Tab: RSVP ──
  const TabRSVP = () => (
    <div className="phone-scroll" style={{height:"100%"}}>
      <div className="phone-section-free" style={{background:"#fefcf8",padding:"28px 22px 40px",minHeight:"100%"}}>
        {sectionTitle("Confirmação")}
        {divider}
        {enviado ? (
          <div style={{textAlign:"center",paddingTop:"12px"}}>
            <div style={{width:"56px",height:"56px",borderRadius:"50%",border:`1px solid ${GOLD}`,background:GOLD_LIGHT,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 14px",color:GOLD,fontSize:"24px"}}>
              {form.confirmado ? "✓" : "×"}
            </div>
            <h3 style={{fontFamily:"'Cormorant Garamond',serif",color:DARK,fontSize:"22px",fontWeight:400,margin:"0 0 8px"}}>{form.confirmado ? "Presença Confirmada" : "Resposta Enviada"}</h3>
            <p style={{color:"rgba(0,0,0,0.4)",fontSize:"12px",lineHeight:1.6}}>{form.confirmado ? `Obrigado, ${form.nome_convidado}! Até breve.` : `Obrigado por responder, ${form.nome_convidado}.`}</p>
          </div>
        ) : (
          <form onSubmit={submit}>
            {[{l:"Nome completo *",t:"text",k:"nome_convidado",p:"O seu nome"},{l:"Email",t:"email",k:"email",p:"seu@email.com"},{l:"Telefone",t:"tel",k:"telefone",p:"+258 84 000 000"}].map(f=>(
              <div key={f.k} style={{marginBottom:"10px"}}>
                <label style={{color:"rgba(0,0,0,0.4)",fontSize:"8px",fontWeight:700,display:"block",marginBottom:"4px",letterSpacing:"2px",textTransform:"uppercase"}}>{f.l}</label>
                <input type={f.t} value={form[f.k]} onChange={e=>setForm({...form,[f.k]:e.target.value})} required={f.k==="nome_convidado"} placeholder={f.p}
                  style={{width:"100%",padding:"10px 12px",borderRadius:"4px",border:"1px solid rgba(0,0,0,0.1)",background:"white",color:DARK,fontSize:"13px",outline:"none",boxSizing:"border-box"}}/>
              </div>
            ))}
            <div style={{marginBottom:"10px"}}>
              <label style={{color:"rgba(0,0,0,0.4)",fontSize:"8px",fontWeight:700,display:"block",marginBottom:"6px",letterSpacing:"2px",textTransform:"uppercase"}}>Confirmação *</label>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"6px"}}>
                {[{v:true,l:"Sim, vou"},{v:false,l:"Não posso"}].map(opt=>(
                  <button key={String(opt.v)} type="button" onClick={()=>setForm({...form,confirmado:opt.v})}
                    style={{padding:"10px",borderRadius:"4px",border:`1.5px solid ${form.confirmado===opt.v?GOLD:"rgba(0,0,0,0.1)"}`,background:form.confirmado===opt.v?GOLD_LIGHT:"white",color:form.confirmado===opt.v?"#6a4800":"rgba(0,0,0,0.4)",fontWeight:700,fontSize:"10px",cursor:"pointer",letterSpacing:"1.5px",textTransform:"uppercase",fontFamily:"'Inter',sans-serif",transition:"all 0.2s"}}>
                    {opt.l}
                  </button>
                ))}
              </div>
            </div>
            <div style={{marginBottom:"12px"}}>
              <label style={{color:"rgba(0,0,0,0.4)",fontSize:"8px",fontWeight:700,display:"block",marginBottom:"4px",letterSpacing:"2px",textTransform:"uppercase"}}>Mensagem</label>
              <textarea value={form.mensagem} onChange={e=>setForm({...form,mensagem:e.target.value})} rows="2" placeholder="Deixe uma mensagem..." style={{width:"100%",padding:"10px 12px",borderRadius:"4px",border:"1px solid rgba(0,0,0,0.1)",background:"white",color:DARK,fontSize:"13px",outline:"none",resize:"vertical",boxSizing:"border-box"}}/>
            </div>
            {erro && <div style={{background:"rgba(201,160,70,0.08)",border:"1px solid rgba(201,160,70,0.3)",borderRadius:"4px",padding:"8px 10px",color:"#8a6a00",marginBottom:"10px",fontSize:"11px"}}>{erro}</div>}
            <button type="submit" disabled={submitting}
              style={{width:"100%",padding:"13px",borderRadius:"50px",border:"none",background:DARK,color:"white",fontSize:"10px",fontWeight:700,cursor:submitting?"wait":"pointer",opacity:submitting?0.5:1,letterSpacing:"3px",textTransform:"uppercase",fontFamily:"'Inter',sans-serif"}}>
              {submitting?"A enviar...":form.confirmado?"Confirmar Presença":"Enviar Resposta"}
            </button>
          </form>
        )}
        {/* QR + partilha */}
        <div style={{marginTop:"24px",paddingTop:"20px",borderTop:"1px solid rgba(201,160,70,0.15)",textAlign:"center"}}>
          <p style={{color:"rgba(0,0,0,0.3)",fontSize:"8px",fontWeight:700,letterSpacing:"3px",textTransform:"uppercase",marginBottom:"12px"}}>PARTILHAR CONVITE</p>
          <div style={{background:"white",borderRadius:"10px",padding:"14px",display:"inline-flex",flexDirection:"column",alignItems:"center",gap:"8px",boxShadow:"0 2px 12px rgba(0,0,0,0.06)"}}>
            <QRCodeSVG value={getConviteShareUrl(evento.id)} size={110} bgColor="white" fgColor={DARK} level="M" includeMargin={false}/>
          </div>
          <button onClick={()=>{navigator.clipboard.writeText(getConviteShareUrl(evento.id)).then(()=>alert("Link copiado!")).catch(()=>{});}}
            style={{display:"flex",alignItems:"center",gap:"6px",background:"white",color:DARK,border:"1px solid rgba(201,160,70,0.3)",borderRadius:"50px",padding:"9px 18px",fontSize:"9px",fontWeight:700,cursor:"pointer",margin:"10px auto 0",letterSpacing:"2px",textTransform:"uppercase",fontFamily:"'Inter',sans-serif"}}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={DARK} strokeWidth="2.5"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            Copiar Link
          </button>
        </div>
      </div>
    </div>
  );

  // ── Tab: Galeria / Vídeos ──
  const TabGaleria = () => (
    <div className="phone-scroll" style={{height:"100%"}}>
      <div className="phone-section-free" style={{background:"#fefcf8",padding:"28px 16px 40px",minHeight:"100%"}}>
        {sectionTitle("Galeria")}
        {divider}
        {fotos.length > 0 && (
          <>
            <div style={{position:"relative",marginBottom:"16px"}}>
              <img src={fotos[fotoIdx]} alt="" style={{width:"100%",height:"200px",objectFit:"cover",borderRadius:"8px"}}/>
              {fotos.length > 1 && (
                <>
                  <button onClick={()=>setFotoIdx(i=>Math.max(0,i-1))} disabled={fotoIdx===0}
                    style={{position:"absolute",left:"8px",top:"50%",transform:"translateY(-50%)",width:"28px",height:"28px",borderRadius:"50%",background:"rgba(0,0,0,0.5)",border:"none",color:"white",fontSize:"16px",cursor:"pointer",opacity:fotoIdx===0?0.3:1,display:"flex",alignItems:"center",justifyContent:"center"}}>‹</button>
                  <button onClick={()=>setFotoIdx(i=>Math.min(fotos.length-1,i+1))} disabled={fotoIdx===fotos.length-1}
                    style={{position:"absolute",right:"8px",top:"50%",transform:"translateY(-50%)",width:"28px",height:"28px",borderRadius:"50%",background:"rgba(0,0,0,0.5)",border:"none",color:"white",fontSize:"16px",cursor:"pointer",opacity:fotoIdx===fotos.length-1?0.3:1,display:"flex",alignItems:"center",justifyContent:"center"}}>›</button>
                </>
              )}
            </div>
            {fotos.length > 1 && (
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"4px",marginBottom:"16px"}}>
                {fotos.map((f,fi)=>(
                  <img key={fi} src={f} alt="" onClick={()=>setFotoIdx(fi)} style={{width:"100%",height:"70px",objectFit:"cover",borderRadius:"4px",cursor:"pointer",opacity:fi===fotoIdx?1:0.65,outline:fi===fotoIdx?`2px solid ${GOLD}`:"none",transition:"opacity 0.2s"}}/>
                ))}
              </div>
            )}
          </>
        )}
        {videos.length > 0 && (
          <>
            <p style={{color:"rgba(0,0,0,0.35)",fontSize:"8px",fontWeight:700,letterSpacing:"3px",textTransform:"uppercase",margin:"8px 0 12px",textAlign:"center"}}>VÍDEOS</p>
            <div style={{height:"200px",borderRadius:"8px",overflow:"hidden",marginBottom:"10px"}}>
              {renderVideo(videos[viIdx], viIdx)}
            </div>
            {videos.length > 1 && (
              <div style={{display:"flex",gap:"6px",justifyContent:"center"}}>
                {videos.map((_,vi)=>(
                  <button key={vi} onClick={()=>setViIdx(vi)} style={{width:vi===viIdx?"16px":"6px",height:"6px",borderRadius:"3px",background:vi===viIdx?GOLD:"rgba(0,0,0,0.15)",border:"none",cursor:"pointer",transition:"all 0.3s",padding:0}}/>
                ))}
              </div>
            )}
          </>
        )}
        {fotos.length === 0 && videos.length === 0 && (
          <p style={{color:"rgba(0,0,0,0.3)",fontSize:"13px",textAlign:"center",fontStyle:"italic",fontFamily:"'Cormorant Garamond',serif"}}>Sem fotos ou vídeos</p>
        )}
      </div>
    </div>
  );

  const tabContent = [<TabInicio key="i"/>, <TabNoivos key="n"/>, <TabAgenda key="a"/>, <TabRSVP key="r"/>, <TabGaleria key="g"/>];

  return (
    <div style={{width:"100vw",height:"100vh",background:"#c0bfbd",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Inter',sans-serif"}}>
      <style>{CSS}</style>
      {evento.musica_url && <MusicaPlayer url={evento.musica_url} autoPlay={true}/>}

      {/* Frame do telemóvel */}
      <div style={{width:"min(390px,96vw)",height:"min(780px,96vh)",borderRadius:"44px",background:"#2a2a2a",boxShadow:"0 0 0 2px #3a3a3a, 0 0 0 4px #222, 0 40px 80px rgba(0,0,0,0.6), inset 0 0 0 1px rgba(255,255,255,0.05)",position:"relative",overflow:"hidden",display:"flex",flexDirection:"column"}}>
        {/* Notch */}
        <div style={{flexShrink:0,height:"28px",background:"#2a2a2a",display:"flex",alignItems:"center",justifyContent:"center",zIndex:10}}>
          <div style={{width:"80px",height:"6px",borderRadius:"3px",background:"#1a1a1a"}}/>
        </div>

        {/* Conteúdo scrollável */}
        <div style={{flex:1,position:"relative",overflow:"hidden",background:"#fafafa"}}>
          {tabContent[tab]}
        </div>

        {/* Barra de navegação inferior */}
        <div style={{flexShrink:0,background:"white",borderTop:"1px solid rgba(0,0,0,0.08)",display:"flex",alignItems:"center",justifyContent:"space-around",padding:"8px 4px 12px",zIndex:10}}>
          {tabs.map((t,i) => (
            <button key={t.id} onClick={()=>setTab(i)}
              style={{display:"flex",flexDirection:"column",alignItems:"center",gap:"3px",background:"none",border:"none",cursor:"pointer",padding:"4px 8px",color:tab===i?GOLD:"rgba(0,0,0,0.35)",transition:"color 0.2s",minWidth:"44px"}}>
              <span style={{display:"flex",alignItems:"center",justifyContent:"center"}}>{t.icon}</span>
              <span style={{fontSize:"8px",fontWeight:tab===i?700:500,letterSpacing:"0.5px",textTransform:"uppercase"}}>{t.label}</span>
            </button>
          ))}
        </div>

        {/* Barra inferior do telemóvel */}
        <div style={{flexShrink:0,height:"8px",background:"#2a2a2a",display:"flex",alignItems:"center",justifyContent:"center"}}>
          <div style={{width:"40px",height:"3px",borderRadius:"2px",background:"#3a3a3a"}}/>
        </div>
      </div>
    </div>
  );
}

// ─── Countdown blocks ──────────────────────────────────────────────────────────
function CountdownBlocks({ evento }) {
  const [t, setT] = useState({ dias:0, horas:0, mins:0, segs:0 });
  useEffect(() => {
    const calc = () => {
      try {
        const ds = (evento.data_evento||"").substring(0,10);
        const hs = evento.hora_evento || "00:00";
        const [ano,mes,dia] = ds.split("-").map(Number);
        const [hh,mm] = hs.split(":").map(Number);
        const alvo = new Date(ano,mes-1,dia,hh||0,mm||0,0);
        const d = alvo - new Date();
        if (isNaN(d)||d<=0){setT({dias:0,horas:0,mins:0,segs:0});return;}
        setT({dias:Math.floor(d/86400000),horas:Math.floor((d%86400000)/3600000),mins:Math.floor((d%3600000)/60000),segs:Math.floor((d%60000)/1000)});
      } catch(e){setT({dias:0,horas:0,mins:0,segs:0});}
    };
    calc(); const iv=setInterval(calc,1000); return()=>clearInterval(iv);
  },[evento.data_evento,evento.hora_evento]);
  return (
    <div style={{display:"flex",gap:"12px",justifyContent:"center"}}>
      {[{v:t.dias,l:"Dias"},{v:t.horas,l:"Horas"},{v:t.mins,l:"Min"},{v:t.segs,l:"Seg"}].map(({v,l})=>(
        <div key={l} style={{textAlign:"center"}}>
          <div style={{width:"56px",height:"56px",borderRadius:"50%",border:"1px solid rgba(201,160,70,0.3)",background:"rgba(201,160,70,0.05)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 6px"}}>
            <span style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"22px",fontWeight:600,color:DARK}}>{String(v).padStart(2,"0")}</span>
          </div>
          <span style={{fontSize:"8px",color:"rgba(0,0,0,0.4)",letterSpacing:"2px",textTransform:"uppercase",fontWeight:600}}>{l}</span>
        </div>
      ))}
    </div>
  );
}

// ─── ConvitePublico (entry point) ──────────────────────────────────────────────
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
    convitesAPI.buscarPorId(id).then(d=>setEvento(d)).catch(()=>setErro("Convite não encontrado.")).finally(()=>setLoading(false));
  }, [id]);
  if (loading) return (
    <div style={{minHeight:"100vh",background:"#1a1a1a",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <style>{CSS}</style>
      <div style={{textAlign:"center"}}>
        <div style={{width:"36px",height:"36px",border:"1px solid rgba(201,160,70,0.3)",borderTopColor:GOLD,borderRadius:"50%",animation:"rodar 1s linear infinite",margin:"0 auto 14px"}}/>
        <p style={{color:"rgba(201,160,70,0.5)",fontSize:"9px",letterSpacing:"3px",textTransform:"uppercase"}}>A carregar</p>
      </div>
    </div>
  );
  if (erro||!evento) return (
    <div style={{minHeight:"100vh",background:"#1a1a1a",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <style>{CSS}</style>
      <div style={{textAlign:"center",padding:"40px 28px"}}>
        <h2 style={{fontFamily:"'Cormorant Garamond',serif",color:"rgba(255,255,255,0.6)",fontSize:"22px",fontWeight:400}}>Convite não encontrado</h2>
        <p style={{color:"rgba(255,255,255,0.2)",fontSize:"12px",marginTop:"8px"}}>O link pode estar incorreto.</p>
      </div>
    </div>
  );
  if (!aberto) return <Envelope nome={nomeConv} relacao={relConv} nomeEvento={evento.nome_evento} dataEvento={evento.data_evento} horaEvento={evento.hora_evento} localEvento={evento.local_evento} onAbrir={()=>setAberto(true)}/>;
  return <ConviteSlides evento={evento} nomeConv={nomeConv} relConv={relConv}/>;
}

export default ConvitePublico;
