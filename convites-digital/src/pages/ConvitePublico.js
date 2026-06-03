import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useLocation } from "react-router-dom";
import { convitesAPI, confirmacoesAPI } from "../services/api";
import { getConviteShareUrl } from "../services/shareUrl";
import { QRCodeSVG } from "qrcode.react";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400;1,600;1,700&family=Inter:wght@300;400;500;600;700&display=swap');
*{box-sizing:border-box;}
body{overflow:hidden;margin:0;}
@keyframes fadeUp{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:translateY(0)}}
@keyframes rodar{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
@keyframes aparecer{from{opacity:0;transform:translateY(36px)}to{opacity:1;transform:translateY(0)}}
@keyframes floatUp{0%,100%{transform:translateY(0)}50%{transform:translateY(-9px)}}
@keyframes brilho{0%,100%{opacity:0.15}50%{opacity:0.8}}
@keyframes pulse-gold{0%,100%{box-shadow:0 0 0 0 rgba(201,160,70,0.0)}50%{box-shadow:0 0 28px 4px rgba(201,160,70,0.18)}}
@keyframes grain{0%,100%{transform:translate(0,0)}10%{transform:translate(-1%,-2%)}30%{transform:translate(2%,1%)}50%{transform:translate(-1%,2%)}70%{transform:translate(1%,-1%)}90%{transform:translate(-2%,1%)}}
input::placeholder,textarea::placeholder{color:rgba(0,0,0,0.22);}
input,textarea{font-family:'Inter',sans-serif;}
.slide-scroll::-webkit-scrollbar{width:2px;}
.slide-scroll::-webkit-scrollbar-track{background:transparent;}
.slide-scroll::-webkit-scrollbar-thumb{background:rgba(201,160,70,0.25);border-radius:2px;}
.gold-btn{transition:all 0.35s cubic-bezier(0.4,0,0.2,1);}
.gold-btn:hover{background:rgba(201,160,70,0.22)!important;border-color:rgba(201,160,70,0.6)!important;}
`;

const GOLD = "#c9a046";
const GOLD_LIGHT = "rgba(201,160,70,0.15)";
const DARK = "#0d0d0d";
const CREAM = "#faf7f2";

// ─── Musica Player ─────────────────────────────────────────────────────────────
function MusicaPlayer({ url, autoPlay }) {
  const ref = useRef();
  const [on, setOn] = useState(false);
  const [p, setP] = useState(0);
  const tried = useRef(false);
  useEffect(() => {
    const a = ref.current; if (!a || !url) return;
    const u = () => setP((a.currentTime / a.duration) * 100 || 0);
    a.addEventListener("timeupdate", u);
    a.addEventListener("ended", () => setOn(false));
    a.addEventListener("error", () => {});
    return () => { a.removeEventListener("timeupdate", u); };
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
    <div style={{position:"fixed",bottom:"16px",right:"16px",zIndex:9999,display:"flex",alignItems:"center",gap:"10px",background:"rgba(10,10,10,0.92)",backdropFilter:"blur(20px)",borderRadius:"50px",padding:"8px 16px 8px 8px",border:"1px solid rgba(201,160,70,0.2)",boxShadow:"0 8px 32px rgba(0,0,0,0.5)"}}>
      <audio ref={ref} src={url} loop preload="none" onError={()=>{}} onAbort={()=>{}} onStalled={()=>{}}/>
      <button onClick={tog} style={{width:"34px",height:"34px",borderRadius:"50%",background:on?`linear-gradient(135deg,${GOLD},#e8c06a)`:"rgba(201,160,70,0.15)",border:`1px solid rgba(201,160,70,0.4)`,cursor:"pointer",color:GOLD,fontSize:"13px",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all 0.3s"}}>
        {on ? <svg width="11" height="11" viewBox="0 0 12 12" fill={DARK}><rect x="1" y="1" width="3.5" height="10" rx="1"/><rect x="7.5" y="1" width="3.5" height="10" rx="1"/></svg>
            : <svg width="11" height="11" viewBox="0 0 12 12" fill={GOLD}><polygon points="2,1 11,6 2,11"/></svg>}
      </button>
      <div>
        <div style={{color:"rgba(201,160,70,0.8)",fontSize:"9px",fontWeight:600,marginBottom:"3px",letterSpacing:"1px"}}>{on ? "A TOCAR" : "MÚSICA"}</div>
        <div style={{width:"52px",height:"1px",background:"rgba(201,160,70,0.15)",borderRadius:"1px"}}>
          <div style={{width:p+"%",height:"100%",background:`linear-gradient(90deg,${GOLD},#e8c06a)`,transition:"width 0.5s"}}/>
        </div>
      </div>
    </div>
  );
}

// ─── Envelope ──────────────────────────────────────────────────────────────────
function Envelope({ nome, relacao, nomeEvento, dataEvento, horaEvento, localEvento, onAbrir }) {
  const [abrindo, setAbrindo] = useState(false);
  const abrir = () => { if (abrindo) return; setAbrindo(true); setTimeout(onAbrir, 1100); };
  const partes = nomeEvento ? nomeEvento.split(/[&]/).map(s => s.trim()).filter(Boolean) : [nomeEvento];
  const dataNum = dataEvento ? new Date(dataEvento).toLocaleDateString("pt-PT", { day: "2-digit", month: "long", year: "numeric" }) : "";
  return (
    <div style={{minHeight:"100vh",background:"#080808",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Inter',sans-serif",overflow:"hidden",position:"relative"}}>
      <style>{CSS+`
        .env-btn:hover .env-inner{transform:scale(1.07)!important;box-shadow:0 0 40px rgba(201,160,70,0.25)!important;}
        @keyframes spin-slow{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes line-in{from{width:0;opacity:0}to{width:100%;opacity:1}}
      `}</style>
      {/* Fundo gradiente rico */}
      <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse 80% 60% at 50% 0%, rgba(201,160,70,0.07) 0%, transparent 70%), radial-gradient(ellipse 60% 80% at 50% 100%, rgba(201,160,70,0.04) 0%, transparent 70%)"}}/>
      {/* Linhas decorativas de fundo */}
      <div style={{position:"absolute",inset:0,overflow:"hidden",pointerEvents:"none"}}>
        <div style={{position:"absolute",top:"12%",left:0,right:0,height:"1px",background:"linear-gradient(to right,transparent,rgba(201,160,70,0.06),transparent)"}}/>
        <div style={{position:"absolute",bottom:"12%",left:0,right:0,height:"1px",background:"linear-gradient(to right,transparent,rgba(201,160,70,0.06),transparent)"}}/>
        <div style={{position:"absolute",top:0,bottom:0,left:"8%",width:"1px",background:"linear-gradient(to bottom,transparent,rgba(201,160,70,0.04),transparent)"}}/>
        <div style={{position:"absolute",top:0,bottom:0,right:"8%",width:"1px",background:"linear-gradient(to bottom,transparent,rgba(201,160,70,0.04),transparent)"}}/>
      </div>
      {/* Partículas */}
      {[...Array(16)].map((_,i)=>(
        <div key={i} style={{position:"absolute",width:i%5===0?"2px":"1px",height:i%5===0?"2px":"1px",borderRadius:"50%",background:`rgba(201,160,70,${0.15+i*0.035})`,top:(6+i*5.8)+"%",left:(3+i*6.1)+"%",animation:`brilho ${2+i*0.22}s ease-in-out infinite`,animationDelay:i*0.15+"s"}}/>
      ))}

      <div style={{textAlign:"center",maxWidth:"400px",width:"100%",padding:"44px 32px",animation:"aparecer 1.1s cubic-bezier(0.4,0,0.2,1)",position:"relative",zIndex:2,background:"rgba(255,255,255,0.025)",backdropFilter:"blur(12px)",WebkitBackdropFilter:"blur(12px)",borderRadius:"2px",border:"1px solid rgba(201,160,70,0.1)",boxShadow:"0 40px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)"}}>
        {/* Cantos decorativos */}
        <div style={{position:"absolute",top:"14px",left:"14px",width:"18px",height:"18px",borderTop:"1px solid rgba(201,160,70,0.4)",borderLeft:"1px solid rgba(201,160,70,0.4)"}}/>
        <div style={{position:"absolute",top:"14px",right:"14px",width:"18px",height:"18px",borderTop:"1px solid rgba(201,160,70,0.4)",borderRight:"1px solid rgba(201,160,70,0.4)"}}/>
        <div style={{position:"absolute",bottom:"14px",left:"14px",width:"18px",height:"18px",borderBottom:"1px solid rgba(201,160,70,0.4)",borderLeft:"1px solid rgba(201,160,70,0.4)"}}/>
        <div style={{position:"absolute",bottom:"14px",right:"14px",width:"18px",height:"18px",borderBottom:"1px solid rgba(201,160,70,0.4)",borderRight:"1px solid rgba(201,160,70,0.4)"}}/>
        {/* Linha decorativa topo */}
        <div style={{display:"flex",alignItems:"center",gap:"12px",marginBottom:"28px",justifyContent:"center"}}>
          <div style={{flex:1,height:"1px",background:`linear-gradient(to right,transparent,rgba(201,160,70,0.4))`}}/>
          <svg width="16" height="16" viewBox="0 0 16 16" fill={GOLD}><polygon points="8,0 10,6 16,6 11,10 13,16 8,12 3,16 5,10 0,6 6,6"/></svg>
          <div style={{flex:1,height:"1px",background:`linear-gradient(to left,transparent,rgba(201,160,70,0.4))`}}/>
        </div>

        {/* Label */}
        <p style={{color:`rgba(201,160,70,0.6)`,fontSize:"9px",fontWeight:600,letterSpacing:"5px",textTransform:"uppercase",marginBottom:"14px"}}>
          {nome ? (relacao ? relacao.toUpperCase() + " DE HONRA" : "CONVIDADO ESPECIAL") : "CONVITE PARA"}
        </p>

        {/* Nome principal */}
        {nome ? (
          <h1 style={{fontFamily:"'Cormorant Garamond',serif",color:"white",fontSize:"clamp(34px,9vw,58px)",fontWeight:600,fontStyle:"italic",lineHeight:1.05,margin:"0 0 20px",letterSpacing:"-0.5px"}}>{nome}</h1>
        ) : (
          partes.length >= 2 ? (
            <div style={{marginBottom:"20px"}}>
              <h1 style={{fontFamily:"'Cormorant Garamond',serif",color:"white",fontSize:"clamp(32px,8vw,54px)",fontWeight:600,fontStyle:"italic",lineHeight:1,margin:0}}>{partes[0]}</h1>
              <p style={{fontFamily:"'Cormorant Garamond',serif",color:GOLD,fontSize:"clamp(22px,5vw,36px)",fontStyle:"normal",margin:"2px 0",letterSpacing:"6px"}}>&</p>
              <h1 style={{fontFamily:"'Cormorant Garamond',serif",color:"white",fontSize:"clamp(32px,8vw,54px)",fontWeight:600,fontStyle:"italic",lineHeight:1,margin:0}}>{partes[1]}</h1>
            </div>
          ) : (
            <h1 style={{fontFamily:"'Cormorant Garamond',serif",color:"white",fontSize:"clamp(28px,7vw,48px)",fontWeight:600,fontStyle:"italic",lineHeight:1.1,marginBottom:"20px"}}>{nomeEvento}</h1>
          )
        )}

        {/* Separador */}
        <div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"18px",justifyContent:"center"}}>
          <div style={{flex:1,height:"1px",background:`linear-gradient(to right,transparent,rgba(201,160,70,0.35))`}}/>
          <div style={{width:"4px",height:"4px",borderRadius:"50%",background:GOLD}}/>
          <div style={{flex:1,height:"1px",background:`linear-gradient(to left,transparent,rgba(201,160,70,0.35))`}}/>
        </div>

        {/* Info subtítulo (evento, se houver nome de convidado) */}
        {nome && (
          <div style={{marginBottom:"18px"}}>
            <p style={{color:"rgba(255,255,255,0.3)",fontSize:"8px",letterSpacing:"3px",textTransform:"uppercase",marginBottom:"6px"}}>Para o evento</p>
            <p style={{fontFamily:"'Cormorant Garamond',serif",color:"rgba(255,255,255,0.65)",fontSize:"clamp(16px,4vw,22px)",fontStyle:"italic",margin:0}}>
              {partes.length >= 2 ? `${partes[0]} & ${partes[1]}` : nomeEvento}
            </p>
          </div>
        )}

        {/* Data / hora / local */}
        <div style={{display:"flex",gap:"8px",justifyContent:"center",marginBottom:"32px",flexWrap:"wrap"}}>
          {dataNum && <span style={{color:"rgba(255,255,255,0.5)",fontSize:"11px",letterSpacing:"0.5px"}}>{dataNum}</span>}
          {dataNum && horaEvento && <span style={{color:"rgba(201,160,70,0.4)",fontSize:"11px"}}>·</span>}
          {horaEvento && <span style={{color:"rgba(255,255,255,0.5)",fontSize:"11px"}}>{horaEvento}</span>}
          {localEvento && <><span style={{color:"rgba(201,160,70,0.4)",fontSize:"11px",display:dataNum||horaEvento?"inline":"none"}}>·</span><span style={{color:"rgba(255,255,255,0.4)",fontSize:"11px"}}>{localEvento}</span></>}
        </div>

        {/* Botão abrir */}
        <div style={{animation:"floatUp 3s ease-in-out infinite"}}>
          <div onClick={abrir} className="env-btn" style={{position:"relative",width:"100px",height:"100px",margin:"0 auto",cursor:abrindo?"wait":"pointer"}}>
            <svg viewBox="0 0 100 100" style={{position:"absolute",inset:0,width:"100%",height:"100%",animation:"spin-slow 18s linear infinite"}}>
              <defs><path id="c3" d="M 50,50 m -38,0 a 38,38 0 1,1 76,0 a 38,38 0 1,1 -76,0"/></defs>
              <text style={{fontSize:"7.5px",fill:`rgba(201,160,70,0.6)`,fontWeight:600,letterSpacing:"2.5px"}}>
                <textPath href="#c3">ABRIR CONVITE ◆ ABRIR CONVITE ◆ ABRIR</textPath>
              </text>
            </svg>
            <div className="env-inner" style={{position:"absolute",inset:"13px",borderRadius:"50%",background:`linear-gradient(135deg,rgba(201,160,70,0.1),rgba(201,160,70,0.04))`,border:`1px solid rgba(201,160,70,0.35)`,display:"flex",alignItems:"center",justifyContent:"center",transition:"transform 0.35s cubic-bezier(0.4,0,0.2,1), box-shadow 0.35s",boxShadow:`0 0 24px rgba(201,160,70,0.08)`,animation:abrindo?"none":"pulse-gold 3s ease-in-out infinite"}}>
              {abrindo
                ? <div style={{width:"18px",height:"18px",border:`1.5px solid rgba(201,160,70,0.3)`,borderTopColor:GOLD,borderRadius:"50%",animation:"rodar 0.8s linear infinite"}}/>
                : <svg width="28" height="22" viewBox="0 0 32 26" fill="none">
                    <rect x="1" y="1" width="30" height="24" rx="3" stroke={GOLD} strokeWidth="1.2"/>
                    <path d="M1 5l15 10L31 5" stroke={GOLD} strokeWidth="1.2" strokeLinecap="round"/>
                    <path d="M1 21l9-7M31 21l-9-7" stroke={`rgba(201,160,70,0.35)`} strokeWidth="1" strokeLinecap="round"/>
                  </svg>
              }
            </div>
          </div>
        </div>
        {abrindo && <p style={{color:`rgba(201,160,70,0.6)`,fontSize:"9px",marginTop:"16px",letterSpacing:"3px",textTransform:"uppercase"}}>A abrir...</p>}
        {!abrindo && <p style={{color:"rgba(255,255,255,0.2)",fontSize:"9px",marginTop:"14px",letterSpacing:"1.5px",textTransform:"uppercase"}}>Toque para abrir o convite</p>}

        {/* Linha decorativa fundo */}
        <div style={{display:"flex",alignItems:"center",gap:"12px",marginTop:"30px",justifyContent:"center"}}>
          <div style={{flex:1,height:"1px",background:`linear-gradient(to right,transparent,rgba(201,160,70,0.25))`}}/>
          <svg width="10" height="10" viewBox="0 0 16 16" fill={`rgba(201,160,70,0.4)`}><polygon points="8,0 10,6 16,6 11,10 13,16 8,12 3,16 5,10 0,6 6,6"/></svg>
          <div style={{flex:1,height:"1px",background:`linear-gradient(to left,transparent,rgba(201,160,70,0.25))`}}/>
        </div>
      </div>
    </div>
  );
}

// ─── Slide: Countdown + Fotos ──────────────────────────────────────────────────
function SlideCountdown({ evento }) {
  const [t, setT] = useState({ dias:0, horas:0, mins:0, segs:0 });
  const fotos = [
    ...(evento.foto_capa ? [evento.foto_capa] : []),
    ...(Array.isArray(evento.fotos) ? evento.fotos.filter(Boolean) : []),
  ].filter((f,i,a) => a.indexOf(f) === i);
  const [fotoIdx, setFotoIdx] = useState(0);

  useEffect(() => {
    const calc = () => {
      try {
        const ds = (evento.data_evento||"").substring(0,10);
        const hs = evento.hora_evento || "00:00";
        const [ano,mes,dia] = ds.split("-").map(Number);
        const [hh,mm] = hs.split(":").map(Number);
        const alvo = new Date(ano, mes-1, dia, hh||0, mm||0, 0);
        const d = alvo - new Date();
        if (isNaN(d) || d <= 0) { setT({ dias:0, horas:0, mins:0, segs:0 }); return; }
        setT({ dias:Math.floor(d/86400000), horas:Math.floor((d%86400000)/3600000), mins:Math.floor((d%3600000)/60000), segs:Math.floor((d%60000)/1000) });
      } catch(e) { setT({ dias:0, horas:0, mins:0, segs:0 }); }
    };
    calc(); const iv = setInterval(calc, 1000); return () => clearInterval(iv);
  }, [evento.data_evento, evento.hora_evento]);

  const Circ = ({ v, l }) => (
    <div style={{textAlign:"center"}}>
      <div style={{width:"52px",height:"52px",borderRadius:"50%",border:`1px solid rgba(201,160,70,0.3)`,background:"rgba(201,160,70,0.05)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 6px"}}>
        <span style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"22px",fontWeight:600,color:DARK}}>{String(v).padStart(2,"0")}</span>
      </div>
      <span style={{fontSize:"8px",color:"#bbb",letterSpacing:"2px",textTransform:"uppercase",fontWeight:600}}>{l}</span>
    </div>
  );

  const fotoAtual = fotos[fotoIdx];
  return (
    <div style={{width:"100%",height:"100%",display:"flex",flexDirection:"column",overflow:"hidden",background:DARK}}>
      {/* Foto */}
      <div style={{flex:"0 0 55%",position:"relative",overflow:"hidden"}}>
        {fotoAtual
          ? <img src={fotoAtual} alt="" style={{width:"100%",height:"100%",objectFit:"cover",filter:"brightness(0.9)"}} key={fotoAtual}/>
          : <div style={{width:"100%",height:"100%",background:`linear-gradient(135deg,#1a1a1a,#0d0d0d)`,display:"flex",alignItems:"center",justifyContent:"center"}}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={`rgba(201,160,70,0.2)`} strokeWidth="1"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21,15 16,10 5,21"/></svg>
            </div>
        }
        {/* Overlay gradient */}
        <div style={{position:"absolute",bottom:0,left:0,right:0,height:"60px",background:`linear-gradient(to top,${DARK},transparent)`}}/>
        {/* Nav fotos */}
        {fotos.length > 1 && (
          <>
            <button onClick={() => setFotoIdx(i => Math.max(0,i-1))} disabled={fotoIdx===0}
              style={{position:"absolute",left:"8px",top:"50%",transform:"translateY(-50%)",width:"28px",height:"28px",borderRadius:"50%",background:"rgba(0,0,0,0.5)",border:`1px solid rgba(201,160,70,0.2)`,cursor:fotoIdx===0?"not-allowed":"pointer",opacity:fotoIdx===0?0.25:1,color:GOLD,fontSize:"16px",display:"flex",alignItems:"center",justifyContent:"center",zIndex:5}}>‹</button>
            <button onClick={() => setFotoIdx(i => Math.min(fotos.length-1,i+1))} disabled={fotoIdx===fotos.length-1}
              style={{position:"absolute",right:"8px",top:"50%",transform:"translateY(-50%)",width:"28px",height:"28px",borderRadius:"50%",background:"rgba(0,0,0,0.5)",border:`1px solid rgba(201,160,70,0.2)`,cursor:fotoIdx===fotos.length-1?"not-allowed":"pointer",opacity:fotoIdx===fotos.length-1?0.25:1,color:GOLD,fontSize:"16px",display:"flex",alignItems:"center",justifyContent:"center",zIndex:5}}>›</button>
            <div style={{position:"absolute",bottom:"8px",left:"50%",transform:"translateX(-50%)",display:"flex",gap:"4px",zIndex:5}}>
              {fotos.map((_,fi) => <div key={fi} onClick={() => setFotoIdx(fi)} style={{width:fi===fotoIdx?"14px":"5px",height:"5px",borderRadius:"3px",background:fi===fotoIdx?"white":"rgba(255,255,255,0.4)",cursor:"pointer",transition:"all 0.3s"}}/>)}
            </div>
          </>
        )}
      </div>
      {/* Countdown */}
      <div style={{flex:1,background:"#fefcf8",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"16px 12px",position:"relative"}}>
        {/* Linha decorativa topo */}
        <div style={{position:"absolute",top:0,left:"20%",right:"20%",height:"1px",background:"linear-gradient(to right,transparent,rgba(201,160,70,0.2),transparent)"}}/>
        <div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"16px"}}>
          <div style={{width:"24px",height:"1px",background:`rgba(201,160,70,0.35)`}}/>
          <p style={{fontFamily:"'Cormorant Garamond',serif",color:"#666",fontSize:"clamp(13px,2.5vw,17px)",fontStyle:"italic",margin:0,letterSpacing:"1.5px"}}>Contagem decrescente</p>
          <div style={{width:"24px",height:"1px",background:`rgba(201,160,70,0.35)`}}/>
        </div>
        <div style={{display:"flex",gap:"12px",justifyContent:"center"}}>
          <Circ v={t.dias}  l="DIAS"/>
          <Circ v={t.horas} l="HORAS"/>
          <Circ v={t.mins}  l="MIN"/>
          <Circ v={t.segs}  l="SEG"/>
        </div>
      </div>
    </div>
  );
}

// ─── Slide: Videos ─────────────────────────────────────────────────────────────
function SlideVideos({ videos, renderVideo }) {
  const [vi, setVi] = useState(0);
  if (!videos.length) return null;
  return (
    <div style={{width:"100%",height:"100%",background:DARK,display:"flex",flexDirection:"column"}}>
      <div style={{padding:"10px 16px 8px",background:"rgba(0,0,0,0.5)",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <p style={{color:`rgba(201,160,70,0.5)`,fontSize:"8px",letterSpacing:"3px",textTransform:"uppercase",margin:0}}>
          {videos.length > 1 ? "Vídeos" : "Vídeo"}
        </p>
        {videos.length > 1 && <p style={{color:"rgba(255,255,255,0.5)",fontSize:"11px",fontWeight:600,margin:0}}>{vi+1} / {videos.length}</p>}
      </div>
      <div style={{flex:1,overflow:"hidden",position:"relative"}}>
        {renderVideo(videos[vi], vi)}
      </div>
      {videos.length > 1 && (
        <div style={{background:"rgba(0,0,0,0.85)",padding:"10px 12px",flexShrink:0}}>
          <div style={{display:"flex",gap:"6px",overflowX:"auto",paddingBottom:"2px"}}>
            {videos.map((url,idx) => {
              const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
              const thumb = yt ? "https://img.youtube.com/vi/"+yt[1]+"/mqdefault.jpg" : null;
              return (
                <button key={idx} onClick={() => setVi(idx)}
                  style={{flexShrink:0,width:"60px",height:"40px",borderRadius:"4px",border:idx===vi?`2px solid ${GOLD}`:"2px solid transparent",overflow:"hidden",padding:0,cursor:"pointer",background:"#222",position:"relative",transition:"border-color 0.2s"}}>
                  {thumb ? <img src={thumb} alt={"v"+(idx+1)} style={{width:"100%",height:"100%",objectFit:"cover"}}/> : <div style={{width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",color:"rgba(255,255,255,0.4)",fontSize:"16px"}}>▶</div>}
                  {idx===vi && <div style={{position:"absolute",inset:0,background:`rgba(201,160,70,0.15)`}}/>}
                </button>
              );
            })}
          </div>
          <div style={{display:"flex",gap:"4px",justifyContent:"center",marginTop:"7px"}}>
            {videos.map((_,idx) => <div key={idx} onClick={() => setVi(idx)} style={{width:idx===vi?"14px":"5px",height:"5px",borderRadius:"3px",background:idx===vi?GOLD:"rgba(255,255,255,0.2)",cursor:"pointer",transition:"all 0.3s"}}/>)}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Helpers de estilo para slides com scroll vertical ─────────────────────────
const scrollSlide = { width:"100%",minHeight:"100vh",background:"#fefcf8",fontFamily:"'Inter',sans-serif",overflowY:"auto",overflowX:"hidden",WebkitOverflowScrolling:"touch",padding:"40px 24px 60px",boxSizing:"border-box" };
const tituloSlide = { fontFamily:"'Cormorant Garamond',serif",color:"#0d0d0d",fontSize:"clamp(20px,4.5vw,28px)",fontWeight:600,textAlign:"center",letterSpacing:"4px",textTransform:"uppercase",margin:"0 0 6px",lineHeight:1.1 };
const subtituloOuro = { color:GOLD,fontSize:"8px",fontWeight:700,textAlign:"center",letterSpacing:"5px",textTransform:"uppercase",display:"block",marginBottom:"10px",opacity:0.85 };
const divisorSlide = (
  <div style={{display:"flex",alignItems:"center",gap:"12px",margin:"0 auto 22px",maxWidth:"140px"}}>
    <div style={{flex:1,height:"1px",background:`linear-gradient(to right,transparent,rgba(201,160,70,0.4))`}}/>
    <svg width="6" height="6" viewBox="0 0 6 6" fill={GOLD}><polygon points="3,0 6,3 3,6 0,3"/></svg>
    <div style={{flex:1,height:"1px",background:`linear-gradient(to left,transparent,rgba(201,160,70,0.4))`}}/>
  </div>
);
const inpS = { width:"100%",padding:"10px 13px",borderRadius:"4px",border:"1px solid rgba(0,0,0,0.1)",background:"white",color:"#1a1a1a",fontSize:"13px",outline:"none",boxSizing:"border-box",letterSpacing:"0.2px",transition:"border-color 0.2s" };
const lblS = { color:"#bbb",fontSize:"8px",fontWeight:700,display:"block",marginBottom:"5px",letterSpacing:"2px",textTransform:"uppercase" };

// ─── ConviteSlides (scroll vertical full-page, estilo Limintso) ────────────────
function ConviteSlides({ evento, nomeConv, relConv }) {
  const [slide, setSlide] = useState(0);
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ nome_convidado:nomeConv||"", email:"", telefone:"", confirmado:true, mensagem:"" });
  const containerRef = useRef();
  const scrollLock = useRef(false);

  const programa = (()=>{ try{ return Array.isArray(evento.programa)?evento.programa:JSON.parse(evento.programa||"[]"); }catch{ return []; } })().filter(p=>p.nome);
  const refData = (()=>{ try{ return typeof evento.refeicao==="object"?evento.refeicao:JSON.parse(evento.refeicao||"{}"); }catch{ return {}; } })();
  const pratos = (refData?.pratos||[]).filter(p=>p.nome);
  const bebidas = (refData?.bebidas||[]).filter(b=>b.nome);
  const videos = [
    ...(Array.isArray(evento.videos_urls)?evento.videos_urls:[]),
    ...(evento.video_url&&!Array.isArray(evento.videos_urls)?[evento.video_url]:[])
  ].filter(Boolean);

  const slides = [
    "hero","countdown",
    ...(videos.length?["videos"]:[]),
    ...(evento.endereco_maps||evento.local_evento?["localizacao"]:[]),
    ...(programa.length?["programa"]:[]),
    ...((pratos.length||bebidas.length)?["refeicao"]:[]),
    "rsvp"
  ];
  const total = slides.length;

  const goTo = useCallback((n) => {
    const next = Math.max(0, Math.min(total-1, n));
    setSlide(next);
    if (containerRef.current) {
      const el = containerRef.current.children[next];
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [total]);

  // Teclado
  useEffect(() => {
    const h = (e) => {
      if (e.key==="ArrowDown"||e.key==="ArrowRight") goTo(slide+1);
      if (e.key==="ArrowUp"||e.key==="ArrowLeft") goTo(slide-1);
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [slide, goTo]);

  // Scroll do rato — navega entre secções com lock para evitar saltos
  useEffect(() => {
    const onWheel = (e) => {
      if (scrollLock.current) return;
      scrollLock.current = true;
      setTimeout(() => { scrollLock.current = false; }, 700);
      if (e.deltaY > 0) goTo(slide+1);
      else goTo(slide-1);
    };
    window.addEventListener("wheel", onWheel, { passive: true });
    return () => window.removeEventListener("wheel", onWheel);
  }, [slide, goTo]);

  // Touch — swipe vertical navega entre secções
  const startY = useRef(null);
  const onTS = (e) => { startY.current = e.touches[0].clientY; };
  const onTE = (e) => {
    if (startY.current === null) return;
    const dy = startY.current - e.changedTouches[0].clientY;
    if (Math.abs(dy) > 50) goTo(slide + (dy > 0 ? 1 : -1));
    startY.current = null;
  };

  // Detetar secção visível via IntersectionObserver
  useEffect(() => {
    if (!containerRef.current) return;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const i = Array.from(containerRef.current.children).indexOf(entry.target);
          if (i >= 0) setSlide(i);
        }
      });
    }, { threshold: 0.6 });
    Array.from(containerRef.current.children).forEach(child => obs.observe(child));
    return () => obs.disconnect();
  }, [total]);

  const renderVideo = (url, key) => {
    if (!url||!url.trim()) return null;
    const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
    const vimeo = url.match(/vimeo\.com\/(\d+)/);
    if (yt) return <iframe key={key} src={"https://www.youtube.com/embed/"+yt[1]+"?rel=0&controls=1&modestbranding=1"} style={{width:"100%",height:"100%",border:"none"}} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen title="Video"/>;
    if (vimeo) return <iframe key={key} src={"https://player.vimeo.com/video/"+vimeo[1]+"?title=0&byline=0&portrait=0"} style={{width:"100%",height:"100%",border:"none"}} allow="autoplay; fullscreen; picture-in-picture" allowFullScreen title="Video"/>;
    return <video key={key} src={url} controls playsInline style={{width:"100%",height:"100%",objectFit:"cover"}}/>;
  };

  const submit = async (e) => {
    e.preventDefault(); setErro(""); setSubmitting(true);
    if (!form.nome_convidado.trim()) { setErro("O nome é obrigatório."); setSubmitting(false); return; }
    try { await confirmacoesAPI.criar(evento.id, form); setEnviado(true); }
    catch(err) { setErro(err.message||"Erro ao enviar."); }
    setSubmitting(false);
  };

  const renderSlide = (tipo, i) => {
    // ── HERO ──
    if (tipo === "hero") {
      const partes = evento.nome_evento ? evento.nome_evento.split(/[&]/).map(s=>s.trim()).filter(Boolean) : [evento.nome_evento];
      const dataHero = evento.data_evento ? new Date(evento.data_evento).toLocaleDateString("pt-PT",{day:"2-digit",month:"long",year:"numeric"}) : "";
      const nomeExibir = nomeConv ? (relConv ? relConv+" "+nomeConv : nomeConv) : null;
      return (
        <div key={i} style={{width:"100%",height:"100%",position:"relative",overflow:"hidden",background:DARK}}>
          {evento.foto_capa
            ? <img src={evento.foto_capa} alt="" style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",filter:"brightness(0.75)"}}/>
            : <div style={{position:"absolute",inset:0,background:`linear-gradient(160deg,#181818,#0d0d0d)`}}/>
          }
          {/* Overlay sofisticado */}
          <div style={{position:"absolute",inset:0,background:`linear-gradient(to bottom,rgba(0,0,0,0.5) 0%,rgba(0,0,0,0.1) 40%,rgba(0,0,0,0.1) 55%,rgba(0,0,0,0.65) 100%)`}}/>
          {/* Conteúdo topo */}
          <div style={{position:"absolute",top:0,left:0,right:0,padding:"22px 18px 0",textAlign:"center",animation:"fadeUp 0.9s ease"}}>
            {/* Linha decorativa */}
            <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"14px",justifyContent:"center"}}>
              <div style={{flex:1,height:"1px",background:`linear-gradient(to right,transparent,rgba(201,160,70,0.4))`}}/>
              <svg width="10" height="10" viewBox="0 0 16 16" fill={GOLD}><polygon points="8,0 10,6 16,6 11,10 13,16 8,12 3,16 5,10 0,6 6,6"/></svg>
              <div style={{flex:1,height:"1px",background:`linear-gradient(to left,transparent,rgba(201,160,70,0.4))`}}/>
            </div>
            {nomeExibir ? (
              <>
                <p style={{color:`rgba(201,160,70,0.7)`,fontSize:"8px",fontWeight:600,letterSpacing:"4px",textTransform:"uppercase",margin:"0 0 8px"}}>Convite para</p>
                <h1 style={{fontFamily:"'Cormorant Garamond',serif",color:"white",fontSize:"clamp(26px,6vw,42px)",fontWeight:600,fontStyle:"italic",lineHeight:1.05,margin:"0 0 6px"}}>{nomeExibir}</h1>
                <p style={{fontFamily:"'Cormorant Garamond',serif",color:"rgba(255,255,255,0.6)",fontSize:"clamp(13px,3vw,20px)",fontStyle:"italic",margin:0}}>
                  {partes.length>=2 ? `${partes[0]} & ${partes[1]}` : evento.nome_evento}
                </p>
              </>
            ) : (
              partes.length>=2
                ? <h1 style={{fontFamily:"'Cormorant Garamond',serif",color:"white",fontSize:"clamp(28px,6vw,44px)",fontWeight:600,fontStyle:"italic",lineHeight:1.05,margin:0}}>{partes[0]} <span style={{color:GOLD,fontStyle:"normal",fontWeight:300}}>&amp;</span> {partes[1]}</h1>
                : <h1 style={{fontFamily:"'Cormorant Garamond',serif",color:"white",fontSize:"clamp(22px,5vw,38px)",fontWeight:600,fontStyle:"italic",lineHeight:1.1,margin:0}}>{evento.nome_evento}</h1>
            )}
            {dataHero && <p style={{color:"rgba(255,255,255,0.45)",fontSize:"clamp(10px,2vw,13px)",fontWeight:400,letterSpacing:"clamp(3px,0.8vw,6px)",marginTop:"10px"}}>{dataHero.toUpperCase()}</p>}
          </div>
          {/* Mensagem em baixo */}
          {evento.mensagem && (
            <div style={{position:"absolute",bottom:0,left:0,right:0,padding:"0 20px 20px",textAlign:"center"}}>
              <div style={{width:"30px",height:"1px",background:`rgba(201,160,70,0.4)`,margin:"0 auto 10px"}}/>
              <p style={{fontFamily:"'Cormorant Garamond',serif",color:"rgba(255,255,255,0.75)",fontSize:"clamp(12px,2.5vw,16px)",fontStyle:"italic",margin:0,lineHeight:1.5}}>"{evento.mensagem}"</p>
            </div>
          )}
        </div>
      );
    }

    // ── COUNTDOWN ──
    if (tipo === "countdown") return <SlideCountdown key={i} evento={evento}/>;

    // ── VIDEOS ──
    if (tipo === "videos") return <SlideVideos key={i} videos={videos} renderVideo={renderVideo}/>;

    // ── LOCALIZAÇÃO ──
    if (tipo === "localizacao") {
      const diaMaiusc = evento.data_evento ? new Date(evento.data_evento).toLocaleDateString("pt-PT",{weekday:"long"}).charAt(0).toUpperCase() + new Date(evento.data_evento).toLocaleDateString("pt-PT",{weekday:"long"}).slice(1) : "";
      const apiKey = process.env.REACT_APP_GOOGLE_MAPS_KEY||"";
      const mapaUrl = apiKey
        ? "https://www.google.com/maps/embed/v1/place?key="+apiKey+"&q="+encodeURIComponent(evento.endereco_maps||evento.local_evento)+"&zoom=15&language=pt"
        : "https://maps.google.com/maps?q="+encodeURIComponent(evento.endereco_maps||evento.local_evento)+"&output=embed";
      return (
        <div key={i} style={{width:"100%",height:"100vh",display:"flex",flexDirection:"column",overflow:"hidden",background:DARK}}>
          {/* Header */}
          <div style={{background:"#fefcf8",padding:"14px 18px 12px",flexShrink:0,borderBottom:"1px solid rgba(201,160,70,0.1)"}}>
            <span style={subtituloOuro}>Local do evento</span>
            <h2 style={{...tituloSlide,fontSize:"clamp(13px,2.8vw,18px)",marginBottom:"10px"}}>Onde nos encontramos</h2>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(18px,4vw,26px)",fontWeight:600,color:DARK}}>{evento.hora_evento||"00:00"}</div>
                <div style={{width:"6px",height:"6px",borderRadius:"50%",border:`1px solid rgba(201,160,70,0.4)`,margin:"3px 0 0 2px"}}/>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(12px,2.5vw,17px)",fontWeight:600,color:DARK,letterSpacing:"2px",textTransform:"uppercase"}}>{diaMaiusc}</div>
                <div style={{fontSize:"9px",color:"#bbb",letterSpacing:"1px",textTransform:"uppercase",marginTop:"2px"}}>Início da cerimónia</div>
              </div>
            </div>
          </div>
          {/* Mapa */}
          <div style={{flex:1,position:"relative",overflow:"hidden"}}>
            <iframe title="mapa" src={mapaUrl} width="100%" height="100%" style={{border:"none",display:"block"}} loading="lazy" allowFullScreen referrerPolicy="no-referrer-when-downgrade"/>
          </div>
          {/* Local info */}
          <div style={{background:"white",padding:"8px 16px",flexShrink:0}}>
            <p style={{margin:"0 0 2px",fontSize:"12px",fontWeight:600,color:DARK,textAlign:"center"}}>{evento.local_evento}</p>
            {evento.endereco_maps && <p style={{margin:0,fontSize:"10px",color:"#aaa",textAlign:"center"}}>{evento.endereco_maps}</p>}
          </div>
          <a href={"https://maps.google.com/?q="+encodeURIComponent(evento.endereco_maps||evento.local_evento)} target="_blank" rel="noreferrer"
            style={{display:"flex",alignItems:"center",justifyContent:"center",gap:"6px",background:GOLD,color:DARK,padding:"11px",fontSize:"11px",fontWeight:700,textDecoration:"none",flexShrink:0,letterSpacing:"1px",textTransform:"uppercase"}}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={DARK} strokeWidth="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            Abrir no Maps
          </a>
        </div>
      );
    }

    // ── PROGRAMA ──
    if (tipo === "programa") return (
      <div key={i} className="slide-scroll" style={scrollSlide}>
        <span style={subtituloOuro}>Cerimónia</span>
        <h2 style={tituloSlide}>Programa</h2>
        {divisorSlide}
        <div style={{position:"relative",paddingLeft:"52px",marginTop:"4px"}}>
          <div style={{position:"absolute",left:"22px",top:0,bottom:0,width:"1px",background:"rgba(201,160,70,0.2)"}}/>
          {programa.map((p,pi) => (
            <div key={pi} style={{position:"relative",marginBottom:"22px"}}>
              <div style={{position:"absolute",left:"-38px",top:"3px",width:"8px",height:"8px",borderRadius:"50%",border:`1px solid rgba(201,160,70,0.4)`,background:CREAM}}/>
              {p.hora && <div style={{position:"absolute",left:"-52px",top:"0",color:GOLD,fontSize:"10px",fontWeight:600,letterSpacing:"0.5px",whiteSpace:"nowrap"}}>{p.hora}</div>}
              <h4 style={{color:DARK,fontSize:"13px",fontWeight:600,margin:"0 0 4px",letterSpacing:"0.5px"}}>{p.nome}</h4>
              <div style={{display:"flex",gap:"10px",flexWrap:"wrap",marginBottom:"3px"}}>
                {p.local_prog && <span style={{color:"#bbb",fontSize:"9px",display:"flex",alignItems:"center",gap:"3px",textTransform:"uppercase",letterSpacing:"0.5px"}}>📍 {p.local_prog}</span>}
                {p.responsavel && <span style={{color:"#bbb",fontSize:"9px",display:"flex",alignItems:"center",gap:"3px",textTransform:"uppercase",letterSpacing:"0.5px"}}>👤 {p.responsavel}</span>}
              </div>
              {p.descricao && <p style={{color:"#888",fontSize:"11px",lineHeight:1.5,margin:0}}>{p.descricao}</p>}
            </div>
          ))}
        </div>
      </div>
    );

    // ── REFEIÇÃO ──
    if (tipo === "refeicao") return (
      <div key={i} className="slide-scroll" style={scrollSlide}>
        <span style={subtituloOuro}>Gastronomia</span>
        {pratos.length > 0 && (
          <>
            <h2 style={tituloSlide}>Refeição</h2>
            {divisorSlide}
            <div style={{marginBottom:"16px"}}>
              {pratos.map((p,pi) => (
                <div key={pi} style={{display:"flex",alignItems:"flex-start",gap:"12px",marginBottom:"14px",paddingBottom:"14px",borderBottom:"1px solid rgba(201,160,70,0.1)"}}>
                  <div style={{width:"6px",height:"6px",borderRadius:"50%",background:`rgba(201,160,70,0.5)`,flexShrink:0,marginTop:"5px"}}/>
                  <div>
                    <p style={{color:DARK,fontSize:"12px",fontWeight:600,margin:"0 0 2px",letterSpacing:"0.5px"}}>{p.nome}</p>
                    {p.descricao && <p style={{color:"#aaa",fontSize:"11px",margin:0,lineHeight:1.4}}>{p.descricao}</p>}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
        {bebidas.length > 0 && (
          <>
            <h2 style={{...tituloSlide,marginTop:"8px"}}>Bebidas</h2>
            {divisorSlide}
            {bebidas.map((b,bi) => (
              <div key={bi} style={{display:"flex",alignItems:"flex-start",gap:"12px",marginBottom:"12px"}}>
                <div style={{width:"6px",height:"6px",borderRadius:"50%",background:`rgba(201,160,70,0.5)`,flexShrink:0,marginTop:"5px"}}/>
                <div>
                  <p style={{color:DARK,fontSize:"12px",fontWeight:600,margin:"0 0 2px",letterSpacing:"0.5px"}}>{b.nome}</p>
                  {b.descricao && <p style={{color:"#aaa",fontSize:"11px",margin:0,lineHeight:1.4}}>{b.descricao}</p>}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    );

    // ── RSVP ──
    if (tipo === "rsvp") return (
      <div key={i} className="slide-scroll" style={scrollSlide}>
        <span style={subtituloOuro}>Confirmação</span>
        <h2 style={tituloSlide}>Presença</h2>
        {divisorSlide}
        {enviado ? (
          <div style={{textAlign:"center",padding:"16px 0"}}>
            <div style={{width:"56px",height:"56px",borderRadius:"50%",border:`1px solid ${GOLD}`,background:GOLD_LIGHT,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 14px",fontSize:"22px",color:GOLD}}>
              {form.confirmado ? "✓" : "×"}
            </div>
            <h3 style={{fontFamily:"'Cormorant Garamond',serif",color:DARK,fontSize:"20px",fontWeight:600,margin:"0 0 8px"}}>{form.confirmado ? "Presença Confirmada" : "Resposta Enviada"}</h3>
            <p style={{color:"#888",fontSize:"12px",lineHeight:1.5}}>{form.confirmado ? `Obrigado, ${form.nome_convidado}! Até breve.` : `Obrigado por responder, ${form.nome_convidado}.`}</p>
          </div>
        ) : (
          <form onSubmit={submit}>
            <div style={{marginBottom:"10px"}}>
              <label style={lblS}>Nome completo *</label>
              <input type="text" value={form.nome_convidado} onChange={e=>setForm({...form,nome_convidado:e.target.value})} required placeholder="O seu nome" style={inpS}/>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px",marginBottom:"10px"}}>
              <div><label style={lblS}>Email</label><input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="seu@email.com" style={inpS}/></div>
              <div><label style={lblS}>Telefone</label><input type="tel" value={form.telefone} onChange={e=>setForm({...form,telefone:e.target.value})} placeholder="+258 84 000 000" style={inpS}/></div>
            </div>
            <div style={{marginBottom:"10px"}}>
              <label style={lblS}>Confirmação *</label>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"7px"}}>
                <button type="button" onClick={()=>setForm({...form,confirmado:true})}
                  style={{padding:"10px",borderRadius:"2px",border:`1.5px solid ${form.confirmado?GOLD:"rgba(0,0,0,0.08)"}`,background:form.confirmado?GOLD_LIGHT:"white",color:form.confirmado?"#6a4800":"#ccc",fontWeight:700,fontSize:"10px",cursor:"pointer",letterSpacing:"2px",transition:"all 0.25s",fontFamily:"'Inter',sans-serif",textTransform:"uppercase"}}>
                  Sim, vou estar
                </button>
                <button type="button" onClick={()=>setForm({...form,confirmado:false})}
                  style={{padding:"10px",borderRadius:"2px",border:`1.5px solid ${!form.confirmado?GOLD:"rgba(0,0,0,0.08)"}`,background:!form.confirmado?GOLD_LIGHT:"white",color:!form.confirmado?"#6a4800":"#ccc",fontWeight:700,fontSize:"10px",cursor:"pointer",letterSpacing:"2px",transition:"all 0.25s",fontFamily:"'Inter',sans-serif",textTransform:"uppercase"}}>
                  Não posso ir
                </button>
              </div>
            </div>
            <div style={{marginBottom:"12px"}}>
              <label style={lblS}>Mensagem (opcional)</label>
              <textarea value={form.mensagem} onChange={e=>setForm({...form,mensagem:e.target.value})} rows="2" placeholder="Deixe uma mensagem..." style={{...inpS,resize:"vertical"}}/>
            </div>
            {erro && <div style={{background:"rgba(201,160,70,0.08)",border:`1px solid rgba(201,160,70,0.3)`,borderRadius:"6px",padding:"8px 10px",color:"#8a6a00",marginBottom:"10px",fontSize:"11px"}}>{erro}</div>}
            <button type="submit" disabled={submitting}
              style={{width:"100%",padding:"13px",borderRadius:"2px",border:`1px solid ${DARK}`,background:DARK,color:"white",fontSize:"10px",fontWeight:700,cursor:submitting?"wait":"pointer",opacity:submitting?0.5:1,letterSpacing:"3px",textTransform:"uppercase",transition:"all 0.3s",fontFamily:"'Inter',sans-serif"}}>
              {submitting ? "A enviar..." : form.confirmado ? "Confirmar Presença" : "Enviar Resposta"}
            </button>
          </form>
        )}
        {/* QR Code */}
        <div style={{marginTop:"24px",paddingTop:"20px",borderTop:"1px solid rgba(201,160,70,0.15)",textAlign:"center"}}>
          <span style={{...subtituloOuro,marginBottom:"12px",display:"block"}}>Partilhar Convite</span>
          <div style={{background:"white",borderRadius:"10px",padding:"14px",display:"inline-flex",flexDirection:"column",alignItems:"center",gap:"10px",boxShadow:"0 2px 12px rgba(0,0,0,0.06)"}}>
            <QRCodeSVG value={getConviteShareUrl(evento.id)} size={120} bgColor="white" fgColor={DARK} level="M" includeMargin={false}/>
            <p style={{margin:0,fontSize:"9px",color:"#bbb",letterSpacing:"1.5px",textTransform:"uppercase"}}>Convite Digital</p>
          </div>
          <button onClick={() => { navigator.clipboard.writeText(getConviteShareUrl(evento.id)).then(()=>alert("Link copiado!")).catch(()=>{}); }}
            style={{display:"flex",alignItems:"center",gap:"6px",background:"white",color:DARK,border:`1px solid rgba(201,160,70,0.3)`,borderRadius:"6px",padding:"9px 18px",fontSize:"10px",fontWeight:700,cursor:"pointer",margin:"10px auto 0",letterSpacing:"1.5px",textTransform:"uppercase"}}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={DARK} strokeWidth="2.5"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            Copiar Link
          </button>
        </div>
      </div>
    );
    return null;
  };

  // Cada secção ocupa 100vh, scroll vertical com snap
  return (
    <div style={{position:"relative",fontFamily:"'Inter',sans-serif"}} onTouchStart={onTS} onTouchEnd={onTE}>
      <style>{CSS+`
        body{overflow:hidden;}
        .cv-sections{height:100vh;overflow-y:scroll;scroll-snap-type:y mandatory;scrollbar-width:none;-ms-overflow-style:none;}
        .cv-sections::-webkit-scrollbar{display:none;}
        .cv-section{height:100vh;scroll-snap-align:start;flex-shrink:0;overflow:hidden;position:relative;}
        .cv-section-scroll{height:100vh;scroll-snap-align:start;flex-shrink:0;overflow-y:auto;position:relative;}
        .cv-section-scroll::-webkit-scrollbar{width:2px;}
        .cv-section-scroll::-webkit-scrollbar-thumb{background:rgba(201,160,70,0.25);}
        .cv-dots-v{position:fixed;right:16px;top:50%;transform:translateY(-50%);z-index:200;display:flex;flex-direction:column;gap:8px;}
        .cv-dot{width:6px;height:6px;border-radius:3px;border:none;cursor:pointer;transition:all 0.3s;padding:0;}
        @media(max-width:600px){.cv-dots-v{right:10px;}.cv-dot{width:5px;height:5px;}}
      `}</style>

      {evento.musica_url && <MusicaPlayer url={evento.musica_url} autoPlay={true}/>}

      {/* Dots de navegação vertical — lado direito */}
      <div className="cv-dots-v">
        {slides.map((_,i) => (
          <button key={i} className="cv-dot" onClick={()=>goTo(i)}
            style={{background:i===slide?GOLD:"rgba(201,160,70,0.25)",height:i===slide?"18px":"6px"}}
            aria-label={`Secção ${i+1}`}/>
        ))}
      </div>

      {/* Secções verticais */}
      <div ref={containerRef} className="cv-sections">
        {slides.map((tipo, i) => {
          const isScroll = ["programa","refeicao","rsvp"].includes(tipo);
          return (
            <div key={i} className={isScroll ? "cv-section-scroll" : "cv-section"}>
              {renderSlide(tipo, i)}
            </div>
          );
        })}
      </div>
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
    <div style={{minHeight:"100vh",background:DARK,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Inter',sans-serif"}}>
      <style>{CSS}</style>
      <div style={{textAlign:"center"}}>
        <div style={{width:"40px",height:"40px",border:`1px solid rgba(201,160,70,0.3)`,borderTopColor:GOLD,borderRadius:"50%",animation:"rodar 1s linear infinite",margin:"0 auto 16px"}}/>
        <p style={{color:`rgba(201,160,70,0.5)`,fontSize:"9px",letterSpacing:"3px",textTransform:"uppercase"}}>A carregar</p>
      </div>
    </div>
  );

  if (erro || !evento) return (
    <div style={{minHeight:"100vh",background:DARK,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Inter',sans-serif"}}>
      <style>{CSS}</style>
      <div style={{textAlign:"center",padding:"40px 28px"}}>
        <div style={{width:"48px",height:"48px",borderRadius:"50%",border:`1px solid rgba(201,160,70,0.2)`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px"}}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={`rgba(201,160,70,0.5)`} strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
        </div>
        <h2 style={{fontFamily:"'Cormorant Garamond',serif",color:"rgba(255,255,255,0.7)",fontSize:"22px",fontWeight:400}}>Convite não encontrado</h2>
        <p style={{color:"rgba(255,255,255,0.25)",fontSize:"12px",marginTop:"8px"}}>O link pode estar incorreto.</p>
      </div>
    </div>
  );

  if (!aberto) return <Envelope nome={nomeConv} relacao={relConv} nomeEvento={evento.nome_evento} dataEvento={evento.data_evento} horaEvento={evento.hora_evento} localEvento={evento.local_evento} onAbrir={()=>setAberto(true)}/>;
  return <ConviteSlides evento={evento} nomeConv={nomeConv} relConv={relConv}/>;
}

export default ConvitePublico;
