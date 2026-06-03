import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useLocation } from "react-router-dom";
import { convitesAPI, confirmacoesAPI } from "../services/api";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400;1,600;1,700&family=Inter:wght@300;400;500;600;700&display=swap');
*{box-sizing:border-box;}
body{overflow:hidden;margin:0;background:#b8b8b8;}
@keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
@keyframes rodar{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
@keyframes aparecer{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}
@keyframes floatUp{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
@keyframes brilho{0%,100%{opacity:0.15}50%{opacity:0.7}}
@keyframes pulse-gold{0%,100%{box-shadow:0 0 0 0 rgba(201,160,70,0)}50%{box-shadow:0 0 20px 3px rgba(201,160,70,0.2)}}
input::placeholder,textarea::placeholder{color:rgba(0,0,0,0.25);}
input,textarea{font-family:'Inter',sans-serif;}
.frame-scroll{height:100%;overflow-y:scroll;scroll-snap-type:y mandatory;scrollbar-width:none;-ms-overflow-style:none;}
.frame-scroll::-webkit-scrollbar{display:none;}
.frame-slide{height:100%;scroll-snap-align:start;flex-shrink:0;overflow:hidden;position:relative;}
.frame-slide-free{scroll-snap-align:start;overflow-y:auto;min-height:100%;-webkit-overflow-scrolling:touch;}
.frame-slide-free::-webkit-scrollbar{width:2px;}
.frame-slide-free::-webkit-scrollbar-thumb{background:rgba(201,160,70,0.2);}
`;

const GOLD = "#c9a046";
const GOLD_LIGHT = "rgba(201,160,70,0.12)";
const DARK = "#111111";

// ─── Música Player ────────────────────────────────────────────────────────────
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
    if (on) { a.pause(); setOn(false); } else { a.play().then(() => setOn(true)).catch(() => {}); }
  };
  if (!url || !url.trim()) return null;
  return (
    <div style={{position:"fixed",bottom:"20px",left:"50%",transform:"translateX(-50%)",zIndex:9999,display:"flex",alignItems:"center",gap:"10px",background:"rgba(10,10,10,0.9)",backdropFilter:"blur(16px)",borderRadius:"50px",padding:"7px 16px 7px 7px",border:"1px solid rgba(201,160,70,0.2)",boxShadow:"0 8px 24px rgba(0,0,0,0.4)"}}>
      <audio ref={ref} src={url} loop preload="none" onError={()=>{}} onAbort={()=>{}} onStalled={()=>{}}/>
      <button onClick={tog} style={{width:"32px",height:"32px",borderRadius:"50%",background:on?GOLD:"rgba(201,160,70,0.15)",border:`1px solid rgba(201,160,70,0.4)`,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.3s"}}>
        {on ? <svg width="10" height="10" viewBox="0 0 12 12" fill={on?"#111":"#c9a046"}><rect x="1" y="1" width="3.5" height="10" rx="1"/><rect x="7.5" y="1" width="3.5" height="10" rx="1"/></svg>
            : <svg width="10" height="10" viewBox="0 0 12 12" fill={GOLD}><polygon points="3,1 11,6 3,11"/></svg>}
      </button>
      <span style={{color:"rgba(255,255,255,0.6)",fontSize:"9px",fontWeight:600,letterSpacing:"1.5px",textTransform:"uppercase"}}>{on?"A tocar":"Música"}</span>
    </div>
  );
}

// ─── Envelope ─────────────────────────────────────────────────────────────────
function Envelope({ nome, relacao, nomeEvento, dataEvento, horaEvento, localEvento, onAbrir }) {
  const [abrindo, setAbrindo] = useState(false);
  const abrir = () => { if (abrindo) return; setAbrindo(true); setTimeout(onAbrir, 1000); };
  const partes = nomeEvento ? nomeEvento.split(/[&]/).map(s => s.trim()).filter(Boolean) : [nomeEvento];
  const dataFmt = dataEvento ? new Date(dataEvento).toLocaleDateString("pt-PT",{day:"2-digit",month:"long",year:"numeric"}) : "";
  return (
    <div style={{minHeight:"100vh",background:DARK,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Inter',sans-serif",overflow:"hidden",position:"relative"}}>
      <style>{CSS+`@keyframes spin-slow{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}.env-btn:hover .env-inner{transform:scale(1.06)!important;}`}</style>
      <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse 70% 50% at 50% 0%,rgba(201,160,70,0.07) 0%,transparent 70%)"}}/>
      {[...Array(14)].map((_,i)=>(
        <div key={i} style={{position:"absolute",width:"1px",height:"1px",borderRadius:"50%",background:`rgba(201,160,70,${0.15+i*0.04})`,top:(7+i*6)+"%",left:(4+i*6.5)+"%",animation:`brilho ${2+i*0.2}s ease-in-out infinite`,animationDelay:i*0.15+"s"}}/>
      ))}
      <div style={{textAlign:"center",maxWidth:"360px",width:"100%",padding:"40px 28px",animation:"aparecer 1s ease",position:"relative",zIndex:2,background:"rgba(255,255,255,0.03)",backdropFilter:"blur(10px)",borderRadius:"2px",border:"1px solid rgba(201,160,70,0.1)",boxShadow:"0 40px 80px rgba(0,0,0,0.5)"}}>
        {[["top","left"],["top","right"],["bottom","left"],["bottom","right"]].map(([v,h],ci)=>(
          <div key={ci} style={{position:"absolute",[v]:"12px",[h]:"12px",width:"16px",height:"16px",[`border${v[0].toUpperCase()+v.slice(1)}`]:`1px solid rgba(201,160,70,0.4)`,[`border${h[0].toUpperCase()+h.slice(1)}`]:`1px solid rgba(201,160,70,0.4)`}}/>
        ))}
        <div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"22px",justifyContent:"center"}}>
          <div style={{flex:1,height:"1px",background:"linear-gradient(to right,transparent,rgba(201,160,70,0.4))"}}/>
          <svg width="12" height="12" viewBox="0 0 16 16" fill={GOLD}><polygon points="8,0 10,6 16,6 11,10 13,16 8,12 3,16 5,10 0,6 6,6"/></svg>
          <div style={{flex:1,height:"1px",background:"linear-gradient(to left,transparent,rgba(201,160,70,0.4))"}}/>
        </div>
        <p style={{color:"rgba(201,160,70,0.6)",fontSize:"8px",fontWeight:700,letterSpacing:"5px",textTransform:"uppercase",marginBottom:"12px"}}>
          {nome ? (relacao ? relacao.toUpperCase()+" DE HONRA" : "CONVIDADO ESPECIAL") : "CONVITE PARA"}
        </p>
        {nome ? (
          <h1 style={{fontFamily:"'Cormorant Garamond',serif",color:"white",fontSize:"clamp(32px,8vw,52px)",fontWeight:600,fontStyle:"italic",lineHeight:1.05,margin:"0 0 18px"}}>{nome}</h1>
        ) : partes.length >= 2 ? (
          <div style={{marginBottom:"18px"}}>
            <h1 style={{fontFamily:"'Cormorant Garamond',serif",color:"white",fontSize:"clamp(28px,7vw,46px)",fontWeight:600,fontStyle:"italic",lineHeight:1,margin:0}}>{partes[0]}</h1>
            <p style={{fontFamily:"'Cormorant Garamond',serif",color:GOLD,fontSize:"clamp(18px,4vw,30px)",margin:"4px 0",letterSpacing:"6px"}}>&</p>
            <h1 style={{fontFamily:"'Cormorant Garamond',serif",color:"white",fontSize:"clamp(28px,7vw,46px)",fontWeight:600,fontStyle:"italic",lineHeight:1,margin:0}}>{partes[1]}</h1>
          </div>
        ) : (
          <h1 style={{fontFamily:"'Cormorant Garamond',serif",color:"white",fontSize:"clamp(24px,6vw,42px)",fontWeight:600,fontStyle:"italic",lineHeight:1.1,marginBottom:"18px"}}>{nomeEvento}</h1>
        )}
        <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"14px",justifyContent:"center"}}>
          <div style={{flex:1,height:"1px",background:"linear-gradient(to right,transparent,rgba(201,160,70,0.3))"}}/>
          <div style={{width:"4px",height:"4px",borderRadius:"50%",background:GOLD}}/>
          <div style={{flex:1,height:"1px",background:"linear-gradient(to left,transparent,rgba(201,160,70,0.3))"}}/>
        </div>
        {nome && <p style={{fontFamily:"'Cormorant Garamond',serif",color:"rgba(255,255,255,0.5)",fontSize:"clamp(14px,3vw,18px)",fontStyle:"italic",margin:"0 0 14px"}}>{partes.length>=2?`${partes[0]} & ${partes[1]}`:nomeEvento}</p>}
        <div style={{display:"flex",gap:"6px",justifyContent:"center",marginBottom:"28px",flexWrap:"wrap"}}>
          {dataFmt && <span style={{color:"rgba(255,255,255,0.4)",fontSize:"11px"}}>{dataFmt}</span>}
          {dataFmt && horaEvento && <span style={{color:"rgba(201,160,70,0.4)",fontSize:"11px"}}>·</span>}
          {horaEvento && <span style={{color:"rgba(255,255,255,0.4)",fontSize:"11px"}}>{horaEvento}</span>}
          {localEvento && <span style={{color:"rgba(255,255,255,0.3)",fontSize:"11px"}}>· {localEvento}</span>}
        </div>
        <div style={{animation:"floatUp 3s ease-in-out infinite"}}>
          <div onClick={abrir} className="env-btn" style={{position:"relative",width:"96px",height:"96px",margin:"0 auto",cursor:abrindo?"wait":"pointer"}}>
            <svg viewBox="0 0 96 96" style={{position:"absolute",inset:0,width:"100%",height:"100%",animation:"spin-slow 16s linear infinite"}}>
              <defs><path id="c5" d="M 48,48 m -36,0 a 36,36 0 1,1 72,0 a 36,36 0 1,1 -72,0"/></defs>
              <text style={{fontSize:"7px",fill:"rgba(201,160,70,0.5)",fontWeight:600,letterSpacing:"2.5px"}}>
                <textPath href="#c5">ABRIR CONVITE ◆ ABRIR CONVITE ◆ ABRIR</textPath>
              </text>
            </svg>
            <div className="env-inner" style={{position:"absolute",inset:"12px",borderRadius:"50%",background:GOLD_LIGHT,border:"1px solid rgba(201,160,70,0.35)",display:"flex",alignItems:"center",justifyContent:"center",transition:"transform 0.3s",animation:abrindo?"none":"pulse-gold 3s ease-in-out infinite"}}>
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

// ─── Countdown ────────────────────────────────────────────────────────────────
function Countdown({ evento }) {
  const [t, setT] = useState({ dias:0, horas:0, mins:0, segs:0 });
  useEffect(() => {
    const calc = () => {
      try {
        const [ano,mes,dia] = (evento.data_evento||"").substring(0,10).split("-").map(Number);
        const [hh,mm] = (evento.hora_evento||"00:00").split(":").map(Number);
        const d = new Date(ano,mes-1,dia,hh||0,mm||0,0) - new Date();
        if (isNaN(d)||d<=0){setT({dias:0,horas:0,mins:0,segs:0});return;}
        setT({dias:Math.floor(d/86400000),horas:Math.floor((d%86400000)/3600000),mins:Math.floor((d%3600000)/60000),segs:Math.floor((d%60000)/1000)});
      } catch(e){setT({dias:0,horas:0,mins:0,segs:0});}
    };
    calc(); const iv=setInterval(calc,1000); return()=>clearInterval(iv);
  },[evento.data_evento,evento.hora_evento]);
  return (
    <div style={{display:"flex",gap:"12px",justifyContent:"center",flexWrap:"wrap"}}>
      {[{v:t.dias,l:"Dias"},{v:t.horas,l:"Horas"},{v:t.mins,l:"Min"},{v:t.segs,l:"Seg"}].map(({v,l})=>(
        <div key={l} style={{textAlign:"center"}}>
          <div style={{width:"58px",height:"58px",borderRadius:"50%",border:"1px solid rgba(201,160,70,0.3)",background:"rgba(201,160,70,0.05)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 6px"}}>
            <span style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"22px",fontWeight:600,color:DARK}}>{String(v).padStart(2,"0")}</span>
          </div>
          <span style={{fontSize:"8px",color:"rgba(0,0,0,0.4)",letterSpacing:"2px",textTransform:"uppercase",fontWeight:600}}>{l}</span>
        </div>
      ))}
    </div>
  );
}

// ─── ConviteSlides — frame de telemóvel com slides verticais ──────────────────
function ConviteSlides({ evento, nomeConv, relConv }) {
  const [slide, setSlide] = useState(0);
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ nome_convidado:nomeConv||"", email:"", telefone:"", confirmado:true, mensagem:"" });
  const [viIdx, setViIdx] = useState(0);
  const scrollRef = useRef();
  const lockRef = useRef(false);
  const touchY = useRef(null);

  const programa = (()=>{ try{ return Array.isArray(evento.programa)?evento.programa:JSON.parse(evento.programa||"[]"); }catch{ return []; } })().filter(p=>p.nome);
  const refData = (()=>{ try{ return typeof evento.refeicao==="object"?evento.refeicao:JSON.parse(evento.refeicao||"{}"); }catch{ return {}; } })();
  const pratos = (refData?.pratos||[]).filter(p=>p.nome);
  const bebidas = (refData?.bebidas||[]).filter(b=>b.nome);
  const fotos = [...(evento.foto_capa?[evento.foto_capa]:[]),...(Array.isArray(evento.fotos)?evento.fotos.filter(Boolean):[])].filter((f,i,a)=>a.indexOf(f)===i);
  const videos = [...(Array.isArray(evento.videos_urls)?evento.videos_urls:[]),...(evento.video_url&&!Array.isArray(evento.videos_urls)?[evento.video_url]:[])].filter(Boolean);

  const slides = [
    "hero",
    "countdown",
    ...(videos.length?["videos"]:[]),
    ...((evento.endereco_maps||evento.local_evento)?["localizacao"]:[]),
    ...(programa.length?["programa"]:[]),
    ...((pratos.length||bebidas.length)?["refeicao"]:[]),
    "rsvp",
  ];
  const total = slides.length;

  const goTo = useCallback((n) => {
    const next = Math.max(0, Math.min(total-1, n));
    if (next === slide) return;
    setSlide(next);
    if (scrollRef.current) {
      scrollRef.current.children[next]?.scrollIntoView({ behavior:"smooth", block:"start" });
    }
  }, [slide, total]);

  // Keyboard
  useEffect(() => {
    const h = (e) => {
      if(e.key==="ArrowDown"||e.key==="ArrowRight") goTo(slide+1);
      if(e.key==="ArrowUp"||e.key==="ArrowLeft") goTo(slide-1);
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [slide, goTo]);

  // Wheel
  useEffect(() => {
    const el = scrollRef.current; if (!el) return;
    const onWheel = (e) => {
      if (lockRef.current) return;
      lockRef.current = true;
      setTimeout(() => { lockRef.current = false; }, 800);
      goTo(slide + (e.deltaY > 0 ? 1 : -1));
    };
    el.addEventListener("wheel", onWheel, { passive:true });
    return () => el.removeEventListener("wheel", onWheel);
  }, [slide, goTo]);

  // Touch
  const onTS = (e) => { touchY.current = e.touches[0].clientY; };
  const onTE = (e) => {
    if (touchY.current === null) return;
    const dy = touchY.current - e.changedTouches[0].clientY;
    if (Math.abs(dy) > 50) goTo(slide + (dy > 0 ? 1 : -1));
    touchY.current = null;
  };

  // IntersectionObserver para atualizar dot ativo
  useEffect(() => {
    const el = scrollRef.current; if (!el) return;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting && e.intersectionRatio >= 0.5) {
          const i = Array.from(el.children).indexOf(e.target);
          if (i >= 0) setSlide(i);
        }
      });
    }, { root: el, threshold: 0.5 });
    Array.from(el.children).forEach(c => obs.observe(c));
    return () => obs.disconnect();
  }, [total]);

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

  // Helpers visuais
  const SlideTitle = ({t}) => <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(22px,5vw,30px)",fontWeight:400,color:DARK,textAlign:"center",margin:"0 0 6px",letterSpacing:"0.5px"}}>{t}</h2>;
  const Divider = () => (
    <div style={{display:"flex",alignItems:"center",gap:"10px",justifyContent:"center",margin:"10px auto 18px",width:"90px"}}>
      <div style={{flex:1,height:"1px",background:"linear-gradient(to right,transparent,rgba(201,160,70,0.5))"}}/>
      <div style={{width:"4px",height:"4px",borderRadius:"50%",background:GOLD}}/>
      <div style={{flex:1,height:"1px",background:"linear-gradient(to left,transparent,rgba(201,160,70,0.5))"}}/>
    </div>
  );
  const SubLabel = ({t}) => <p style={{color:"rgba(0,0,0,0.35)",fontSize:"8px",fontWeight:700,letterSpacing:"4px",textTransform:"uppercase",textAlign:"center",margin:"0 0 6px"}}>{t}</p>;

  const renderSlide = (tipo, i) => {
    // ── HERO ──
    if (tipo === "hero") return (
      <div key={i} className="frame-slide" style={{background:"#f5f3f0",display:"flex",flexDirection:"column"}}>
        <div style={{flex:"0 0 50%",position:"relative",overflow:"hidden",background:DARK}}>
          {fotos[0]
            ? <img src={fotos[0]} alt="" style={{width:"100%",height:"100%",objectFit:"cover",filter:"brightness(0.88)"}}/>
            : <div style={{width:"100%",height:"100%",background:"linear-gradient(160deg,#1a1a1a,#0d0d0d)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(201,160,70,0.2)" strokeWidth="0.8"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21,15 16,10 5,21"/></svg>
              </div>
          }
          <div style={{position:"absolute",bottom:0,left:0,right:0,height:"80px",background:"linear-gradient(to top,#f5f3f0,transparent)"}}/>
        </div>
        <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"16px 24px 20px",textAlign:"center"}}>
          {partes.length >= 2 ? (
            <>
              <p style={{color:"rgba(0,0,0,0.35)",fontSize:"8px",fontWeight:700,letterSpacing:"4px",textTransform:"uppercase",marginBottom:"8px"}}>CONVITE PARA</p>
              <h1 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(26px,6vw,38px)",fontWeight:400,color:DARK,margin:"0 0 4px",letterSpacing:"-0.5px"}}>
                {partes[0]} <span style={{fontStyle:"italic",color:GOLD}}>&amp;</span> {partes[1]}
              </h1>
            </>
          ) : (
            <>
              <p style={{color:"rgba(0,0,0,0.35)",fontSize:"8px",fontWeight:700,letterSpacing:"4px",textTransform:"uppercase",marginBottom:"8px"}}>CONVITE</p>
              <h1 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(22px,5vw,34px)",fontWeight:400,color:DARK,margin:"0 0 4px"}}>{evento.nome_evento}</h1>
            </>
          )}
          {nomeConv && <p style={{fontFamily:"'Cormorant Garamond',serif",color:"rgba(0,0,0,0.55)",fontSize:"clamp(14px,3vw,18px)",fontStyle:"italic",margin:"8px 0 4px"}}>Para <strong style={{fontStyle:"normal"}}>{relConv?`${relConv} ${nomeConv}`:nomeConv}</strong></p>}
          <p style={{color:"rgba(0,0,0,0.4)",fontSize:"11px",letterSpacing:"3px",margin:"8px 0"}}>{dataFmt}</p>
          {evento.mensagem && <p style={{fontFamily:"'Cormorant Garamond',serif",color:"rgba(0,0,0,0.5)",fontSize:"clamp(12px,2.5vw,14px)",fontStyle:"italic",lineHeight:1.6,margin:"8px 0 0",maxWidth:"260px"}}>"{evento.mensagem}"</p>}
          <div style={{marginTop:"16px"}}>
            <svg width="18" height="10" viewBox="0 0 18 10" fill="none"><path d="M2 2L9 8L16 2" stroke={GOLD} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
        </div>
      </div>
    );

    // ── COUNTDOWN ──
    if (tipo === "countdown") return (
      <div key={i} className="frame-slide" style={{background:"#fefcf8",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"28px 22px",textAlign:"center"}}>
        <SubLabel t="Contagem Decrescente"/>
        <SlideTitle t="O grande dia"/>
        <Divider/>
        <Countdown evento={evento}/>
        <div style={{marginTop:"20px"}}>
          <p style={{color:"rgba(0,0,0,0.4)",fontSize:"11px",lineHeight:1.7}}>
            {dataLonga}
          </p>
          {evento.hora_evento && <p style={{fontFamily:"'Cormorant Garamond',serif",color:GOLD,fontSize:"clamp(22px,5vw,30px)",fontWeight:600,margin:"6px 0 0"}}>{evento.hora_evento}H</p>}
          {evento.local_evento && <p style={{color:"rgba(0,0,0,0.35)",fontSize:"11px",marginTop:"4px"}}>📍 {evento.local_evento}</p>}
        </div>
      </div>
    );

    // ── VIDEOS ──
    if (tipo === "videos") return (
      <div key={i} className="frame-slide" style={{background:DARK,display:"flex",flexDirection:"column"}}>
        <div style={{padding:"14px 16px 10px",background:"rgba(0,0,0,0.4)",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <p style={{color:"rgba(201,160,70,0.5)",fontSize:"8px",letterSpacing:"3px",textTransform:"uppercase",margin:0}}>Vídeo{videos.length>1?"s":""}</p>
          {videos.length>1 && <p style={{color:"rgba(255,255,255,0.4)",fontSize:"10px",margin:0}}>{viIdx+1}/{videos.length}</p>}
        </div>
        <div style={{flex:1,overflow:"hidden"}}>{renderVideo(videos[viIdx], viIdx)}</div>
        {videos.length > 1 && (
          <div style={{background:"rgba(0,0,0,0.7)",padding:"8px 12px",display:"flex",gap:"5px",justifyContent:"center"}}>
            {videos.map((_,vi) => <button key={vi} onClick={()=>setViIdx(vi)} style={{width:vi===viIdx?"14px":"5px",height:"5px",borderRadius:"3px",background:vi===viIdx?GOLD:"rgba(255,255,255,0.2)",border:"none",cursor:"pointer",transition:"all 0.3s",padding:0}}/>)}
          </div>
        )}
      </div>
    );

    // ── LOCALIZAÇÃO ──
    if (tipo === "localizacao") {
      const mapaUrl = process.env.REACT_APP_GOOGLE_MAPS_KEY
        ? "https://www.google.com/maps/embed/v1/place?key="+process.env.REACT_APP_GOOGLE_MAPS_KEY+"&q="+encodeURIComponent(evento.endereco_maps||evento.local_evento)+"&zoom=15&language=pt"
        : "https://maps.google.com/maps?q="+encodeURIComponent(evento.endereco_maps||evento.local_evento)+"&output=embed";
      return (
        <div key={i} className="frame-slide" style={{display:"flex",flexDirection:"column",background:"#fff"}}>
          <div style={{padding:"18px 18px 12px",textAlign:"center",background:"#fefcf8",flexShrink:0}}>
            <SubLabel t="Local"/>
            <SlideTitle t="Onde nos encontramos"/>
            <Divider/>
            <p style={{color:"rgba(0,0,0,0.5)",fontSize:"12px",margin:"0 0 4px",fontWeight:600}}>{evento.local_evento}</p>
            {evento.endereco_maps && <p style={{color:"rgba(0,0,0,0.35)",fontSize:"10px",margin:0}}>{evento.endereco_maps}</p>}
          </div>
          <div style={{flex:1,minHeight:0}}><iframe title="mapa" src={mapaUrl} width="100%" height="100%" style={{border:"none",display:"block"}} loading="lazy" allowFullScreen referrerPolicy="no-referrer-when-downgrade"/></div>
          <a href={"https://maps.google.com/?q="+encodeURIComponent(evento.endereco_maps||evento.local_evento)} target="_blank" rel="noreferrer"
            style={{display:"flex",alignItems:"center",justifyContent:"center",gap:"6px",background:DARK,color:"white",padding:"12px",fontSize:"9px",fontWeight:700,textDecoration:"none",letterSpacing:"2.5px",textTransform:"uppercase",flexShrink:0}}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            Abrir no Maps
          </a>
        </div>
      );
    }

    // ── PROGRAMA ──
    if (tipo === "programa") return (
      <div key={i} className="frame-slide-free" style={{background:"#fefcf8",padding:"24px 20px 32px"}}>
        <SubLabel t="Cerimónia"/>
        <SlideTitle t="Programa"/>
        <Divider/>
        <div style={{position:"relative",paddingLeft:"46px"}}>
          <div style={{position:"absolute",left:"16px",top:0,bottom:0,width:"1px",background:"rgba(201,160,70,0.2)"}}/>
          {programa.map((p,pi) => (
            <div key={pi} style={{position:"relative",marginBottom:"20px"}}>
              <div style={{position:"absolute",left:"-32px",top:"3px",width:"8px",height:"8px",borderRadius:"50%",border:"1px solid rgba(201,160,70,0.5)",background:"#fefcf8"}}/>
              {p.hora && <span style={{position:"absolute",left:"-46px",top:"0",color:GOLD,fontSize:"9px",fontWeight:700,whiteSpace:"nowrap"}}>{p.hora}</span>}
              <h4 style={{color:DARK,fontSize:"13px",fontWeight:600,margin:"0 0 3px"}}>{p.nome}</h4>
              {p.local_prog && <p style={{color:"rgba(0,0,0,0.4)",fontSize:"9px",margin:"0 0 2px",textTransform:"uppercase",letterSpacing:"0.5px"}}>📍 {p.local_prog}</p>}
              {p.descricao && <p style={{color:"rgba(0,0,0,0.5)",fontSize:"11px",lineHeight:1.5,margin:0}}>{p.descricao}</p>}
            </div>
          ))}
        </div>
      </div>
    );

    // ── REFEIÇÃO ──
    if (tipo === "refeicao") return (
      <div key={i} className="frame-slide-free" style={{background:"#fefcf8",padding:"24px 20px 32px"}}>
        <SubLabel t="Gastronomia"/>
        <SlideTitle t="Refeição"/>
        <Divider/>
        {pratos.map((p,pi) => (
          <div key={pi} style={{display:"flex",gap:"10px",marginBottom:"12px",paddingBottom:"12px",borderBottom:"1px solid rgba(201,160,70,0.1)"}}>
            <div style={{width:"5px",height:"5px",borderRadius:"50%",background:"rgba(201,160,70,0.5)",flexShrink:0,marginTop:"5px"}}/>
            <div><p style={{color:DARK,fontSize:"12px",fontWeight:600,margin:"0 0 1px"}}>{p.nome}</p>{p.descricao&&<p style={{color:"rgba(0,0,0,0.4)",fontSize:"10px",margin:0}}>{p.descricao}</p>}</div>
          </div>
        ))}
        {bebidas.length > 0 && (
          <>
            <div style={{width:"100%",height:"1px",background:"rgba(201,160,70,0.1)",margin:"14px 0 14px"}}/>
            <SubLabel t="Bebidas"/>
            {bebidas.map((b,bi) => (
              <div key={bi} style={{display:"flex",gap:"10px",marginBottom:"10px"}}>
                <div style={{width:"5px",height:"5px",borderRadius:"50%",background:"rgba(201,160,70,0.5)",flexShrink:0,marginTop:"5px"}}/>
                <div><p style={{color:DARK,fontSize:"12px",fontWeight:600,margin:"0 0 1px"}}>{b.nome}</p>{b.descricao&&<p style={{color:"rgba(0,0,0,0.4)",fontSize:"10px",margin:0}}>{b.descricao}</p>}</div>
              </div>
            ))}
          </>
        )}
      </div>
    );

    // ── RSVP ──
    if (tipo === "rsvp") return (
      <div key={i} className="frame-slide-free" style={{background:"#fefcf8",padding:"24px 20px 40px"}}>
        <SubLabel t="Confirmação de Presença"/>
        <SlideTitle t="RSVP"/>
        <Divider/>
        {enviado ? (
          <div style={{textAlign:"center",paddingTop:"12px"}}>
            <div style={{width:"54px",height:"54px",borderRadius:"50%",border:`1px solid ${GOLD}`,background:GOLD_LIGHT,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 14px",color:GOLD,fontSize:"22px"}}>{form.confirmado?"✓":"×"}</div>
            <h3 style={{fontFamily:"'Cormorant Garamond',serif",color:DARK,fontSize:"20px",fontWeight:400,margin:"0 0 8px"}}>{form.confirmado?"Presença Confirmada":"Resposta Enviada"}</h3>
            <p style={{color:"rgba(0,0,0,0.4)",fontSize:"12px",lineHeight:1.6}}>{form.confirmado?`Obrigado, ${form.nome_convidado}! Até breve.`:`Obrigado por responder, ${form.nome_convidado}.`}</p>
          </div>
        ) : (
          <form onSubmit={submit}>
            {[{l:"Nome completo *",t:"text",k:"nome_convidado",p:"O seu nome",r:true},{l:"Email",t:"email",k:"email",p:"seu@email.com",r:false},{l:"Telefone",t:"tel",k:"telefone",p:"+258 84 000 000",r:false}].map(f=>(
              <div key={f.k} style={{marginBottom:"10px"}}>
                <label style={{color:"rgba(0,0,0,0.4)",fontSize:"8px",fontWeight:700,display:"block",marginBottom:"4px",letterSpacing:"2px",textTransform:"uppercase"}}>{f.l}</label>
                <input type={f.t} value={form[f.k]} onChange={e=>setForm({...form,[f.k]:e.target.value})} required={f.r} placeholder={f.p}
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
            {erro && <div style={{background:"rgba(201,160,70,0.08)",border:"1px solid rgba(201,160,70,0.3)",borderRadius:"4px",padding:"8px",color:"#8a6a00",marginBottom:"10px",fontSize:"11px"}}>{erro}</div>}
            <button type="submit" disabled={submitting}
              style={{width:"100%",padding:"13px",borderRadius:"50px",border:"none",background:DARK,color:"white",fontSize:"10px",fontWeight:700,cursor:submitting?"wait":"pointer",opacity:submitting?0.5:1,letterSpacing:"3px",textTransform:"uppercase",fontFamily:"'Inter',sans-serif"}}>
              {submitting?"A enviar...":form.confirmado?"Confirmar Presença":"Enviar Resposta"}
            </button>
          </form>
        )}
        {/* Partilhar */}
        <div style={{marginTop:"24px",paddingTop:"18px",borderTop:"1px solid rgba(201,160,70,0.15)",textAlign:"center"}}>
          <button onClick={()=>{navigator.clipboard.writeText(window.location.href).then(()=>alert("Link copiado!")).catch(()=>{});}}
            style={{display:"inline-flex",alignItems:"center",gap:"6px",background:"white",color:DARK,border:"1px solid rgba(201,160,70,0.3)",borderRadius:"50px",padding:"9px 20px",fontSize:"9px",fontWeight:700,cursor:"pointer",letterSpacing:"2px",textTransform:"uppercase",fontFamily:"'Inter',sans-serif"}}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={DARK} strokeWidth="2.5"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
            Partilhar Convite
          </button>
        </div>
      </div>
    );
    return null;
  };

  return (
    <div style={{width:"100vw",height:"100vh",background:"#b8b8b8",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Inter',sans-serif"}} onTouchStart={onTS} onTouchEnd={onTE}>
      <style>{CSS}</style>
      {evento.musica_url && <MusicaPlayer url={evento.musica_url} autoPlay={true}/>}

      {/* Dots de navegação — lado direito fora do frame */}
      <div style={{position:"absolute",right:"calc(50% - min(195px,43vw) - 28px)",top:"50%",transform:"translateY(-50%)",display:"flex",flexDirection:"column",gap:"8px",zIndex:100}}>
        {slides.map((_,i) => (
          <button key={i} onClick={()=>goTo(i)} style={{width:"6px",height:i===slide?"18px":"6px",borderRadius:"3px",background:i===slide?GOLD:"rgba(100,100,100,0.5)",border:"none",cursor:"pointer",transition:"all 0.3s",padding:0}}/>
        ))}
      </div>

      {/* Frame do telemóvel */}
      <div style={{width:"min(390px,86vw)",height:"min(760px,92vh)",borderRadius:"44px",background:"#2a2a2a",boxShadow:"0 0 0 2px #3a3a3a,0 0 0 4px #1e1e1e,0 50px 100px rgba(0,0,0,0.65),inset 0 0 0 1px rgba(255,255,255,0.04)",position:"relative",overflow:"hidden",display:"flex",flexDirection:"column"}}>
        {/* Notch */}
        <div style={{flexShrink:0,height:"26px",background:"#2a2a2a",display:"flex",alignItems:"center",justifyContent:"center",zIndex:10}}>
          <div style={{width:"72px",height:"5px",borderRadius:"3px",background:"#1a1a1a"}}/>
        </div>
        {/* Conteúdo: scroll vertical com snap */}
        <div ref={scrollRef} className="frame-scroll" style={{flex:1}}>
          {slides.map((tipo, i) => renderSlide(tipo, i))}
        </div>
        {/* Barra inferior */}
        <div style={{flexShrink:0,height:"10px",background:"#2a2a2a",display:"flex",alignItems:"center",justifyContent:"center"}}>
          <div style={{width:"40px",height:"3px",borderRadius:"2px",background:"#3a3a3a"}}/>
        </div>
      </div>
    </div>
  );
}

// ─── ConvitePublico ────────────────────────────────────────────────────────────
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
    <div style={{minHeight:"100vh",background:DARK,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <style>{CSS}</style>
      <div style={{textAlign:"center"}}>
        <div style={{width:"36px",height:"36px",border:"1px solid rgba(201,160,70,0.3)",borderTopColor:GOLD,borderRadius:"50%",animation:"rodar 1s linear infinite",margin:"0 auto 14px"}}/>
        <p style={{color:"rgba(201,160,70,0.4)",fontSize:"9px",letterSpacing:"3px",textTransform:"uppercase"}}>A carregar</p>
      </div>
    </div>
  );
  if (erro||!evento) return (
    <div style={{minHeight:"100vh",background:DARK,display:"flex",alignItems:"center",justifyContent:"center"}}>
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
