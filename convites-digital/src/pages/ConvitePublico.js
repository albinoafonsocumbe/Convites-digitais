import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useLocation } from "react-router-dom";
import { convitesAPI, confirmacoesAPI } from "../services/api";
import { QRCodeSVG } from "qrcode.react";

const CSS = `@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=Inter:wght@300;400;500;600;700&display=swap');*{box-sizing:border-box;}body{overflow:hidden;margin:0;}@keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}@keyframes rodar{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}@keyframes aparecer{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}input::placeholder,textarea::placeholder{color:rgba(0,0,0,0.3);}input,textarea{font-family:'Inter',sans-serif;}`;

function MusicaPlayer({ url, autoPlay }) {
  const ref = useRef();
  const [on, setOn] = useState(false);
  const [p, setP] = useState(0);
  const tried = useRef(false);

  useEffect(() => {
    const a = ref.current; if (!a || !url) return;
    const u = () => setP((a.currentTime/a.duration)*100||0);
    a.addEventListener("timeupdate", u);
    a.addEventListener("ended", () => setOn(false));
    // Suprimir erros de media não suportada
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
    <div style={{position:"fixed",bottom:"14px",right:"14px",zIndex:9999,display:"flex",alignItems:"center",gap:"8px",background:"rgba(5,5,15,0.88)",backdropFilter:"blur(16px)",borderRadius:"50px",padding:"7px 14px 7px 7px",border:"1px solid rgba(255,255,255,0.08)",boxShadow:"0 8px 24px rgba(0,0,0,0.4)"}}>
      <audio ref={ref} src={url} loop preload="none" onError={()=>{}} onAbort={()=>{}} onStalled={()=>{}}/>
      <button onClick={tog} style={{width:"32px",height:"32px",borderRadius:"50%",background:on?"linear-gradient(135deg,#f093fb,#f5576c)":"linear-gradient(135deg,#667eea,#764ba2)",border:"none",cursor:"pointer",color:"white",fontSize:"13px",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
        {on ? <svg width="12" height="12" viewBox="0 0 12 12" fill="white"><rect x="1" y="1" width="3.5" height="10" rx="1"/><rect x="7.5" y="1" width="3.5" height="10" rx="1"/></svg> : <svg width="12" height="12" viewBox="0 0 12 12" fill="white"><polygon points="2,1 11,6 2,11"/></svg>}
      </button>
      <div>
        <div style={{color:"rgba(255,255,255,0.7)",fontSize:"10px",fontWeight:600,marginBottom:"3px"}}>{on?"A tocar...":"Música"}</div>
        <div style={{width:"56px",height:"2px",background:"rgba(255,255,255,0.1)",borderRadius:"1px"}}>
          <div style={{width:p+"%",height:"100%",background:"linear-gradient(90deg,#667eea,#f5576c)",borderRadius:"1px",transition:"width 0.5s"}}/>
        </div>
      </div>
    </div>
  );
}

function Envelope({ nome, relacao, nomeEvento, dataEvento, horaEvento, localEvento, onAbrir }) {
  const [abrindo, setAbrindo] = useState(false);
  const abrir = () => { if(abrindo) return; setAbrindo(true); setTimeout(onAbrir, 1000); };
  const partes = nomeEvento ? nomeEvento.split(/[&]/).map(s=>s.trim()).filter(Boolean) : [nomeEvento];
  const dataNum = dataEvento ? new Date(dataEvento).toLocaleDateString("pt-PT",{day:"2-digit",month:"2-digit",year:"numeric"}) : "";
  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(135deg,#1a0a2e 0%,#2d1b4e 40%,#1a2040 100%)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Inter',sans-serif",overflow:"hidden",position:"relative"}}>
      <style>{CSS+`
        @keyframes rodar{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes aparecer{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}
        @keyframes floatUp{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
        @keyframes brilho{0%,100%{opacity:0.4}50%{opacity:1}}
        @keyframes abrir{from{transform:rotateX(0deg)}to{transform:rotateX(-160deg)}}
        .env-btn:hover{transform:scale(1.06)!important}
      `}</style>

      {/* Particulas decorativas */}
      {[...Array(12)].map((_,i)=>(
        <div key={i} style={{position:"absolute",width:i%3===0?"3px":"2px",height:i%3===0?"3px":"2px",borderRadius:"50%",background:i%2===0?"rgba(201,169,110,0.6)":"rgba(255,255,255,0.3)",top:(15+i*7)+"%",left:(5+i*8)+"%",animation:`brilho ${1.5+i*0.3}s ease-in-out infinite`,animationDelay:i*0.2+"s"}}/>
      ))}

      {/* Conteudo central */}
      <div style={{textAlign:"center",maxWidth:"400px",width:"100%",padding:"40px 28px",animation:"aparecer 0.9s ease",position:"relative",zIndex:2}}>

        {/* Selo / brasao topo */}
        <div style={{marginBottom:"20px"}}>
          <div style={{width:"56px",height:"56px",borderRadius:"50%",border:"2px solid rgba(201,169,110,0.5)",background:"rgba(201,169,110,0.08)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto",boxShadow:"0 0 20px rgba(201,169,110,0.15)"}}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="#c9a96e" strokeWidth="1.5" fill="rgba(201,169,110,0.15)"/>
            </svg>
          </div>
        </div>

        {/* Nome do convidado — destaque principal */}
        <div style={{marginBottom:"20px",animation:"aparecer 1s ease"}}>
          <p style={{color:"rgba(201,169,110,0.7)",fontSize:"9px",fontWeight:700,letterSpacing:"4px",textTransform:"uppercase",marginBottom:"10px"}}>
            {nome ? (relacao ? relacao.toUpperCase()+" DE HONRA" : "CONVIDADO ESPECIAL") : "CONVITE PARA"}
          </p>
          {nome ? (
            <h1 style={{fontFamily:"'Playfair Display',serif",color:"white",fontSize:"clamp(30px,8vw,52px)",fontWeight:900,fontStyle:"italic",lineHeight:1.05,margin:0,textShadow:"0 4px 20px rgba(0,0,0,0.5)"}}>{nome}</h1>
          ) : (
            partes.length>=2 ? (
              <div>
                <h1 style={{fontFamily:"'Playfair Display',serif",color:"white",fontSize:"clamp(36px,9vw,60px)",fontWeight:900,fontStyle:"italic",lineHeight:1,margin:0,textShadow:"0 4px 20px rgba(0,0,0,0.4)"}}>{partes[0]}</h1>
                <p style={{fontFamily:"'Playfair Display',serif",color:"#c9a96e",fontSize:"clamp(20px,5vw,32px)",fontStyle:"italic",margin:0,lineHeight:1.2}}>&amp;</p>
                <h1 style={{fontFamily:"'Playfair Display',serif",color:"white",fontSize:"clamp(36px,9vw,60px)",fontWeight:900,fontStyle:"italic",lineHeight:1,margin:0,textShadow:"0 4px 20px rgba(0,0,0,0.4)"}}>{partes[1]}</h1>
              </div>
            ) : (
              <h1 style={{fontFamily:"'Playfair Display',serif",color:"white",fontSize:"clamp(28px,7vw,48px)",fontWeight:900,fontStyle:"italic",lineHeight:1.1,textShadow:"0 4px 20px rgba(0,0,0,0.4)"}}>{nomeEvento}</h1>
            )
          )}
        </div>

        {/* Linha dourada */}
        <div style={{display:"flex",alignItems:"center",gap:"12px",marginBottom:"16px",justifyContent:"center"}}>
          <div style={{flex:1,height:"1px",background:"linear-gradient(to right,transparent,rgba(201,169,110,0.5))"}}/>
          <div style={{width:"6px",height:"6px",borderRadius:"50%",background:"#c9a96e"}}/>
          <div style={{flex:1,height:"1px",background:"linear-gradient(to left,transparent,rgba(201,169,110,0.5))"}}/>
        </div>

        {/* Titulo do evento — secundario (so aparece quando ha nome de convidado) */}
        {nome && (
          <div style={{marginBottom:"16px"}}>
            <p style={{color:"rgba(255,255,255,0.35)",fontSize:"9px",letterSpacing:"3px",textTransform:"uppercase",marginBottom:"6px"}}>para o evento</p>
            {partes.length>=2 ? (
              <p style={{fontFamily:"'Playfair Display',serif",color:"rgba(255,255,255,0.75)",fontSize:"clamp(16px,4vw,24px)",fontStyle:"italic",margin:0,lineHeight:1.2}}>
                {partes[0]} <span style={{color:"#c9a96e"}}>&amp;</span> {partes[1]}
              </p>
            ) : (
              <p style={{fontFamily:"'Playfair Display',serif",color:"rgba(255,255,255,0.75)",fontSize:"clamp(16px,4vw,22px)",fontStyle:"italic",margin:0}}>{nomeEvento}</p>
            )}
          </div>
        )}


        {/* Info: data, hora, local */}
        <div style={{display:"flex",gap:"8px",justifyContent:"center",marginBottom:"24px",flexWrap:"wrap"}}>
          {dataNum&&(<div style={{display:"flex",alignItems:"center",gap:"5px",background:"rgba(255,255,255,0.08)",borderRadius:"20px",padding:"6px 14px",border:"1px solid rgba(255,255,255,0.12)",fontSize:"12px",fontWeight:600,color:"rgba(255,255,255,0.85)",backdropFilter:"blur(8px)"}}>&#128197; {dataNum}</div>)}
          {horaEvento&&(<div style={{display:"flex",alignItems:"center",gap:"5px",background:"rgba(255,255,255,0.08)",borderRadius:"20px",padding:"6px 14px",border:"1px solid rgba(255,255,255,0.12)",fontSize:"12px",fontWeight:600,color:"rgba(255,255,255,0.85)",backdropFilter:"blur(8px)"}}>&#128336; {horaEvento}</div>)}
          {localEvento&&(<div style={{display:"flex",alignItems:"center",gap:"5px",background:"rgba(255,255,255,0.08)",borderRadius:"20px",padding:"6px 14px",border:"1px solid rgba(255,255,255,0.12)",fontSize:"12px",fontWeight:600,color:"rgba(255,255,255,0.85)",backdropFilter:"blur(8px)",maxWidth:"180px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>&#128205; {localEvento}</div>)}
        </div>

        {/* Linha dourada */}
        <div style={{display:"flex",alignItems:"center",gap:"12px",marginBottom:"28px",justifyContent:"center"}}>
          <div style={{flex:1,height:"1px",background:"linear-gradient(to right,transparent,rgba(201,169,110,0.5))"}}/>
          <div style={{width:"6px",height:"6px",borderRadius:"50%",background:"#c9a96e"}}/>
          <div style={{flex:1,height:"1px",background:"linear-gradient(to left,transparent,rgba(201,169,110,0.5))"}}/>
        </div>

        {/* Botao abrir - envelope animado */}
        <div style={{animation:"floatUp 3s ease-in-out infinite"}}>
          <div onClick={abrir} className="env-btn" style={{position:"relative",width:"110px",height:"110px",margin:"0 auto",cursor:abrindo?"wait":"pointer",transition:"transform 0.3s"}}>
            {/* Circulo rotativo */}
            <svg viewBox="0 0 110 110" style={{position:"absolute",inset:0,width:"100%",height:"100%",animation:"rodar 12s linear infinite"}}>
              <defs><path id="circ2" d="M 55,55 m -42,0 a 42,42 0 1,1 84,0 a 42,42 0 1,1 -84,0"/></defs>
              <text style={{fontSize:"8px",fill:"rgba(201,169,110,0.8)",fontWeight:700,letterSpacing:"3px"}}>
                <textPath href="#circ2">ABRIR CONVITE &#8226; ABRIR CONVITE &#8226; ABRIR CONVITE &#8226;</textPath>
              </text>
            </svg>
            {/* Circulo central */}
            <div style={{position:"absolute",inset:"14px",borderRadius:"50%",background:"linear-gradient(135deg,#8b2635,#c0392b)",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 8px 32px rgba(139,38,53,0.5),0 0 0 1px rgba(255,255,255,0.1)"}}>
              {abrindo ? (
                <div style={{width:"20px",height:"20px",border:"2px solid rgba(255,255,255,0.4)",borderTopColor:"white",borderRadius:"50%",animation:"rodar 0.8s linear infinite"}}/>
              ) : (
                <svg width="32" height="26" viewBox="0 0 32 26" fill="none">
                  <rect x="1" y="1" width="30" height="24" rx="3" stroke="white" strokeWidth="1.5"/>
                  <path d="M1 5l15 10L31 5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                  <path d="M1 21l9-7M31 21l-9-7" stroke="rgba(255,255,255,0.4)" strokeWidth="1" strokeLinecap="round"/>
                </svg>
              )}
            </div>
          </div>
        </div>

        {abrindo && <p style={{color:"rgba(201,169,110,0.8)",fontSize:"11px",marginTop:"16px",letterSpacing:"2px",textTransform:"uppercase"}}>A abrir...</p>}
        {!abrindo && <p style={{color:"rgba(255,255,255,0.3)",fontSize:"10px",marginTop:"14px",letterSpacing:"1px"}}>Toque para abrir o seu convite</p>}
      </div>
    </div>
  );
}

function SlideCountdown({ evento, ROSA, PINK }) {
  const [t, setT] = useState({ dias:0, horas:0, mins:0, segs:0 });
  const fotos = [
    ...(evento.foto_capa ? [evento.foto_capa] : []),
    ...(Array.isArray(evento.fotos) ? evento.fotos.filter(Boolean) : []),
  ].filter((f,i,a) => a.indexOf(f) === i); // unicas
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
        setT({
          dias:  Math.floor(d / 86400000),
          horas: Math.floor((d % 86400000) / 3600000),
          mins:  Math.floor((d % 3600000) / 60000),
          segs:  Math.floor((d % 60000) / 1000),
        });
      } catch(e) { setT({ dias:0, horas:0, mins:0, segs:0 }); }
    };
    calc();
    const iv = setInterval(calc, 1000);
    return () => clearInterval(iv);
  }, [evento.data_evento, evento.hora_evento]);

  const Circ = ({ v, l, cor }) => (
    <div style={{ textAlign:"center" }}>
      <div style={{ width:"56px", height:"56px", borderRadius:"50%", border:"1.5px solid #ddd", background:"white", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 5px", boxShadow:"0 2px 8px rgba(0,0,0,0.06)" }}>
        <span style={{ fontFamily:"'Playfair Display',serif", fontSize:"20px", fontWeight:700, color:cor||"#333" }}>{String(v).padStart(2,"0")}</span>
      </div>
      <span style={{ fontSize:"9px", color:"#aaa", letterSpacing:"1.5px", textTransform:"uppercase", fontWeight:600 }}>{l}</span>
    </div>
  );

  const fotoAtual = fotos[fotoIdx];

  return (
    <div style={{ width:"100%", height:"100%", display:"flex", flexDirection:"column", overflow:"hidden" }}>
      {/* Parte superior: carrossel de fotos */}
      <div style={{ flex:"0 0 55%", position:"relative", overflow:"hidden", background:"#111" }}>
        {fotoAtual
          ? <img src={fotoAtual} alt="" style={{ width:"100%", height:"100%", objectFit:"cover", transition:"opacity 0.4s" }} key={fotoAtual}/>
          : <div style={{ width:"100%", height:"100%", background:"linear-gradient(135deg,#e8c4c4,#f0d0d0)" }}/>
        }
        {/* Botoes de navegacao embutidos - so aparecem se houver mais de 1 foto */}
        {fotos.length > 1 && (
          <>
            <button
              onClick={() => setFotoIdx(i => Math.max(0, i-1))}
              disabled={fotoIdx === 0}
              style={{ position:"absolute", left:"10px", top:"50%", transform:"translateY(-50%)", width:"36px", height:"36px", borderRadius:"50%", background:"rgba(255,255,255,0.85)", border:"none", cursor:fotoIdx===0?"not-allowed":"pointer", opacity:fotoIdx===0?0.3:1, fontSize:"20px", color:"#333", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 2px 8px rgba(0,0,0,0.2)", zIndex:5 }}>
              &#8249;
            </button>
            <button
              onClick={() => setFotoIdx(i => Math.min(fotos.length-1, i+1))}
              disabled={fotoIdx === fotos.length-1}
              style={{ position:"absolute", right:"10px", top:"50%", transform:"translateY(-50%)", width:"36px", height:"36px", borderRadius:"50%", background:"rgba(255,255,255,0.85)", border:"none", cursor:fotoIdx===fotos.length-1?"not-allowed":"pointer", opacity:fotoIdx===fotos.length-1?0.3:1, fontSize:"20px", color:"#333", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 2px 8px rgba(0,0,0,0.2)", zIndex:5 }}>
              &#8250;
            </button>
            {/* Dots indicadores */}
            <div style={{ position:"absolute", bottom:"8px", left:"50%", transform:"translateX(-50%)", display:"flex", gap:"5px", zIndex:5 }}>
              {fotos.map((_,fi) => (
                <div key={fi} onClick={() => setFotoIdx(fi)} style={{ width:fi===fotoIdx?"16px":"6px", height:"6px", borderRadius:"3px", background:fi===fotoIdx?"white":"rgba(255,255,255,0.5)", cursor:"pointer", transition:"all 0.3s" }}/>
              ))}
            </div>
          </>
        )}
      </div>
      {/* Parte inferior: countdown */}
      <div style={{ flex:1, background:ROSA, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"16px 12px" }}>
        <p style={{ fontFamily:"'Playfair Display',serif", color:PINK, fontSize:"clamp(14px,3vw,20px)", fontStyle:"italic", margin:"0 0 16px", textAlign:"center" }}>O nosso dia est&#225; chegando</p>
        <div style={{ display:"flex", gap:"10px", justifyContent:"center" }}>
          <Circ v={t.dias}  l="DIAS"  cor="#333"/>
          <Circ v={t.horas} l="HORAS" cor={PINK}/>
          <Circ v={t.mins}  l="MIN"   cor={PINK}/>
          <Circ v={t.segs}  l="SEG"   cor={PINK}/>
        </div>
      </div>
    </div>
  );
}


function SlideVideos({ videos, renderVideo }) {
  const [vi, setVi] = useState(0);
  if (!videos.length) return null;
  return (
    <div style={{width:"100%",height:"100%",background:"#0a0a0a",display:"flex",flexDirection:"column"}}>
      {/* Header */}
      <div style={{padding:"10px 16px",background:"rgba(0,0,0,0.6)",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <p style={{color:"rgba(255,255,255,0.5)",fontSize:"9px",letterSpacing:"3px",textTransform:"uppercase",margin:0}}>
          {videos.length>1?"Vídeos":"Vídeo"}
        </p>
        {videos.length>1&&(
          <p style={{color:"rgba(255,255,255,0.6)",fontSize:"11px",fontWeight:700,margin:0}}>
            {vi+1} / {videos.length}
          </p>
        )}
      </div>
      {/* Player */}
      <div style={{flex:1,overflow:"hidden",position:"relative"}}>
        {renderVideo(videos[vi], vi)}
      </div>
      {/* Thumbnails / navegação */}
      {videos.length>1&&(
        <div style={{background:"rgba(0,0,0,0.85)",padding:"10px 12px",flexShrink:0}}>
          <div style={{display:"flex",gap:"8px",overflowX:"auto",paddingBottom:"2px"}}>
            {videos.map((url,idx)=>{
              const yt=url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
              const thumb=yt?"https://img.youtube.com/vi/"+yt[1]+"/mqdefault.jpg":null;
              return(
                <button key={idx} onClick={()=>setVi(idx)} style={{flexShrink:0,width:"64px",height:"44px",borderRadius:"6px",border:idx===vi?"2px solid #e05a6a":"2px solid transparent",overflow:"hidden",padding:0,cursor:"pointer",background:"#222",position:"relative",transition:"border-color 0.2s"}}>
                  {thumb
                    ?<img src={thumb} alt={"Vídeo "+(idx+1)} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                    :<div style={{width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",color:"rgba(255,255,255,0.5)",fontSize:"18px"}}>▶</div>
                  }
                  {idx===vi&&<div style={{position:"absolute",inset:0,background:"rgba(224,90,106,0.25)"}}/>}
                </button>
              );
            })}
          </div>
          {/* Dots */}
          <div style={{display:"flex",gap:"5px",justifyContent:"center",marginTop:"8px"}}>
            {videos.map((_,idx)=>(
              <div key={idx} onClick={()=>setVi(idx)} style={{width:idx===vi?"16px":"6px",height:"6px",borderRadius:"3px",background:idx===vi?"#e05a6a":"rgba(255,255,255,0.3)",cursor:"pointer",transition:"all 0.3s"}}/>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* SLIDES */
function ConviteSlides({ evento, nomeConv, relConv }) {
  const [slide, setSlide] = useState(0);
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ nome_convidado:nomeConv||"", email:"", telefone:"", confirmado:true, numero_acompanhantes:0, mensagem:"" });
  const trackRef = useRef();
  const startX = useRef(null);
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
    "qrcode",
    "rsvp"
  ];
  const total = slides.length;
  const goTo = useCallback((n)=>{ const next=Math.max(0,Math.min(total-1,n)); setSlide(next); if(trackRef.current) trackRef.current.style.transform="translateX(-"+(next*(100/total))+"%)"; },[total]);
  useEffect(()=>{ const h=(e)=>{ if(e.key==="ArrowRight")goTo(slide+1); if(e.key==="ArrowLeft")goTo(slide-1); }; window.addEventListener("keydown",h); return()=>window.removeEventListener("keydown",h); },[slide,goTo]);
  const onTS=(e)=>{ startX.current=e.touches[0].clientX; };
  const onTE=(e)=>{ if(startX.current===null)return; const dx=startX.current-e.changedTouches[0].clientX; if(Math.abs(dx)>40)goTo(slide+(dx>0?1:-1)); startX.current=null; };
  const ROSA="#fdf0ee"; const PINK="#e05a6a"; const GOLD="#c9a050";
  const sRosa={width:"100%",height:"100%",background:ROSA,fontFamily:"'Inter',sans-serif",overflowY:"auto",padding:"20px 18px"};
  const tituloRosa={fontFamily:"'Playfair Display',serif",color:PINK,fontSize:"clamp(18px,4vw,26px)",fontWeight:700,textAlign:"center",letterSpacing:"3px",textTransform:"uppercase",margin:"0 0 6px"};
  const divisor=<div style={{width:"40px",height:"2px",background:PINK,margin:"0 auto 18px",opacity:0.5}}/>;
  const inpS={width:"100%",padding:"9px 12px",borderRadius:"8px",border:"1px solid rgba(0,0,0,0.15)",background:"white",color:"#333",fontSize:"13px",outline:"none",fontFamily:"'Inter',sans-serif",boxSizing:"border-box"};
  const lblS={color:"#888",fontSize:"10px",fontWeight:600,display:"block",marginBottom:"5px",letterSpacing:"1px",textTransform:"uppercase"};
  const submit=async(e)=>{ e.preventDefault(); setErro(""); setSubmitting(true); if(!form.nome_convidado.trim()){setErro("O nome e obrigatorio.");setSubmitting(false);return;} try{await confirmacoesAPI.criar(evento.id,form);setEnviado(true);}catch(err){setErro(err.message||"Erro ao enviar.");} setSubmitting(false); };

  const renderVideo=(url,key)=>{ 
    if(!url||!url.trim()) return null;
    const yt=url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/); 
    const vimeo=url.match(/vimeo\.com\/(\d+)/); 
    if(yt)return <iframe key={key} src={"https://www.youtube.com/embed/"+yt[1]+"?rel=0&controls=1&modestbranding=1"} style={{width:"100%",height:"100%",border:"none"}} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen title="Video"/>; 
    if(vimeo)return <iframe key={key} src={"https://player.vimeo.com/video/"+vimeo[1]+"?title=0&byline=0&portrait=0"} style={{width:"100%",height:"100%",border:"none"}} allow="autoplay; fullscreen; picture-in-picture" allowFullScreen title="Video"/>; 
    return <video key={key} src={url} controls playsInline style={{width:"100%",height:"100%",objectFit:"cover"}}/>; 
  };

  const renderSlide=(tipo,i)=>{
    if(tipo==="hero"){
      const partes=evento.nome_evento?evento.nome_evento.split(/[&]/).map(s=>s.trim()).filter(Boolean):[evento.nome_evento];
      const dataHero=evento.data_evento?new Date(evento.data_evento).toLocaleDateString("pt-PT",{day:"2-digit",month:"2-digit",year:"numeric"}).replace(/\//g,".") :"";
      return(<div key={i} style={{width:"100%",height:"100%",position:"relative",overflow:"hidden"}}>
        {evento.foto_capa?<img src={evento.foto_capa} alt="" style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",filter:"grayscale(100%) brightness(0.85)"}}/>:<div style={{position:"absolute",inset:0,background:"linear-gradient(160deg,#2a2a3a,#1a1a28)"}}/>}
        <div style={{position:"absolute",inset:0,background:"linear-gradient(to bottom,rgba(0,0,0,0.45) 0%,rgba(0,0,0,0) 35%,rgba(0,0,0,0) 60%,rgba(0,0,0,0.5) 100%)"}}/>
        <div style={{position:"absolute",top:0,left:0,right:0,padding:"20px 16px 0",textAlign:"center",animation:"fadeUp 0.8s ease"}}>
          {partes.length>=2?<h1 style={{fontFamily:"'Playfair Display',serif",color:"white",fontSize:"clamp(28px,6vw,46px)",fontWeight:900,fontStyle:"italic",lineHeight:1.05,margin:0,textShadow:"0 2px 12px rgba(0,0,0,0.6)"}}>{partes[0]} <span style={{fontStyle:"normal",fontWeight:400}}>&amp;</span> {partes[1]}</h1>:<h1 style={{fontFamily:"'Playfair Display',serif",color:"white",fontSize:"clamp(22px,5vw,38px)",fontWeight:900,fontStyle:"italic",lineHeight:1.1,margin:0,textShadow:"0 2px 12px rgba(0,0,0,0.6)"}}>{evento.nome_evento}</h1>}
          {dataHero&&<p style={{color:"white",fontSize:"clamp(13px,2.5vw,18px)",fontWeight:300,letterSpacing:"clamp(4px,1vw,8px)",marginTop:"8px",textShadow:"0 1px 6px rgba(0,0,0,0.6)"}}>{dataHero}</p>}
        </div>
        {evento.mensagem&&(<div style={{position:"absolute",bottom:0,left:0,right:0,padding:"0 20px 20px",textAlign:"center"}}><p style={{fontFamily:"'Playfair Display',serif",color:"white",fontSize:"clamp(13px,2.5vw,17px)",fontStyle:"italic",margin:0,textShadow:"0 2px 8px rgba(0,0,0,0.8)",lineHeight:1.4}}>"{evento.mensagem}"</p></div>)}
      </div>);
    }
    if(tipo==="countdown"){
      return <SlideCountdown key={i} evento={evento} ROSA={ROSA} PINK={PINK}/>;
    }
    if(tipo==="videos"){
      return <SlideVideos key={i} videos={videos} renderVideo={renderVideo}/>;
    }
    if(tipo==="qrcode"){
      const conviteUrl=window.location.origin+window.location.pathname+window.location.search;
      return(<div key={i} style={{...sRosa,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:"16px",paddingTop:"24px"}}>
        <h2 style={tituloRosa}>Partilhar Convite</h2>{divisor}
        <p style={{color:"#888",fontSize:"12px",textAlign:"center",margin:"0 0 8px",lineHeight:1.5}}>Digitaliza o código para abrir ou partilhar este convite</p>
        <div style={{background:"white",borderRadius:"16px",padding:"20px",boxShadow:"0 4px 20px rgba(0,0,0,0.08)",display:"inline-flex",flexDirection:"column",alignItems:"center",gap:"12px"}}>
          <QRCodeSVG value={conviteUrl} size={160} bgColor="white" fgColor="#1a1a2e" level="M" includeMargin={false}/>
          <p style={{margin:0,fontSize:"10px",color:"#aaa",letterSpacing:"1px",textTransform:"uppercase"}}>Convite Digital</p>
        </div>
        <button onClick={()=>{navigator.clipboard.writeText(conviteUrl).then(()=>alert("Link copiado!")).catch(()=>{});}} style={{display:"flex",alignItems:"center",gap:"8px",background:PINK,color:"white",border:"none",borderRadius:"10px",padding:"11px 22px",fontSize:"13px",fontWeight:700,cursor:"pointer",marginTop:"4px"}}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
          Copiar Link
        </button>
      </div>);
    }
    if(tipo==="localizacao"){
      const diaSemana=evento.data_evento?new Date(evento.data_evento).toLocaleDateString("pt-PT",{weekday:"long"}):"";
      const diaMaiusc=diaSemana?diaSemana.charAt(0).toUpperCase()+diaSemana.slice(1).toUpperCase():"";
      const apiKey=process.env.REACT_APP_GOOGLE_MAPS_KEY||"";
      const mapaUrl=apiKey?"https://www.google.com/maps/embed/v1/place?key="+apiKey+"&q="+encodeURIComponent(evento.endereco_maps||evento.local_evento)+"&zoom=15&language=pt":"https://maps.google.com/maps?q="+encodeURIComponent(evento.endereco_maps||evento.local_evento)+"&output=embed";
      return(<div key={i} style={{width:"100%",height:"100%",display:"flex",flexDirection:"column",overflow:"hidden"}}>
        <div style={{background:ROSA,padding:"16px 18px 12px",flexShrink:0}}>
          <h2 style={{...tituloRosa,fontSize:"clamp(13px,2.8vw,18px)",marginBottom:"4px"}}>Onde será a grande festa?</h2>
          {divisor}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginTop:"4px"}}>
            <div><div style={{fontFamily:"'Playfair Display',serif",fontSize:"clamp(20px,4.5vw,30px)",fontWeight:700,color:"#222",lineHeight:1}}>{evento.hora_evento||"00:00"}</div><div style={{width:"8px",height:"8px",borderRadius:"50%",border:"1.5px solid #aaa",margin:"4px 0 0 2px"}}/></div>
            <div style={{textAlign:"right"}}><div style={{fontFamily:"'Playfair Display',serif",fontSize:"clamp(13px,2.8vw,18px)",fontWeight:700,color:"#222",letterSpacing:"2px",textTransform:"uppercase"}}>{diaMaiusc}</div><div style={{fontSize:"10px",color:"#999",letterSpacing:"1px",textTransform:"uppercase",marginTop:"3px"}}>Início da cerimónia</div></div>
          </div>
        </div>
        <div style={{flex:1,position:"relative",overflow:"hidden"}}><iframe title="mapa" src={mapaUrl} width="100%" height="100%" style={{border:"none",display:"block"}} loading="lazy" allowFullScreen referrerPolicy="no-referrer-when-downgrade"/></div>
        <div style={{background:"white",padding:"8px 16px",flexShrink:0}}><p style={{margin:"0 0 2px",fontSize:"13px",fontWeight:600,color:"#222",textAlign:"center"}}>{evento.local_evento}</p>{evento.endereco_maps&&<p style={{margin:0,fontSize:"11px",color:"#888",textAlign:"center"}}>{evento.endereco_maps}</p>}</div>
        <a href={"https://maps.google.com/?q="+encodeURIComponent(evento.endereco_maps||evento.local_evento)} target="_blank" rel="noreferrer" style={{display:"flex",alignItems:"center",justifyContent:"center",gap:"6px",background:"#c9a050",color:"white",padding:"11px",fontSize:"13px",fontWeight:700,textDecoration:"none",flexShrink:0}}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          Abrir Localização
        </a>
      </div>);
    }
    if(tipo==="programa")return(<div key={i} style={{...sRosa,paddingTop:"18px"}}>
      <h2 style={tituloRosa}>Programa da Cerimónia</h2>{divisor}
      <div style={{position:"relative",paddingLeft:"52px",marginTop:"8px"}}>
        <div style={{position:"absolute",left:"22px",top:0,bottom:0,width:"1px",background:"#ddd"}}/>
        {programa.map((p,pi)=>(<div key={pi} style={{position:"relative",marginBottom:"22px"}}>
          <div style={{position:"absolute",left:"-38px",top:"2px",width:"10px",height:"10px",borderRadius:"50%",border:"1.5px solid #bbb",background:"white"}}/>
          <div style={{position:"absolute",left:"-52px",top:"-1px",color:GOLD,fontSize:"12px",fontWeight:700,letterSpacing:"0.5px",whiteSpace:"nowrap"}}>{p.hora||""}</div>
          <h4 style={{color:"#222",fontSize:"14px",fontWeight:700,margin:"0 0 4px"}}>{p.nome}</h4>
          <div style={{display:"flex",gap:"12px",flexWrap:"wrap",marginBottom:"4px"}}>
            {p.local_prog&&<span style={{color:"#aaa",fontSize:"10px",display:"flex",alignItems:"center",gap:"3px"}}><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>{p.local_prog.toUpperCase()}</span>}
            {p.responsavel&&<span style={{color:"#aaa",fontSize:"10px",display:"flex",alignItems:"center",gap:"3px"}}><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>{p.responsavel.toUpperCase()}</span>}
          </div>
          {p.descricao&&<p style={{color:"#555",fontSize:"12px",lineHeight:1.5,margin:0}}>{p.descricao}</p>}
        </div>))}
      </div>
    </div>);
    if(tipo==="refeicao")return(<div key={i} style={{...sRosa,paddingTop:"18px"}}>
      {pratos.length>0&&(<><h2 style={tituloRosa}>Refeição</h2>{divisor}<div style={{marginBottom:"8px"}}>{pratos.map((p,pi)=>(<div key={pi} style={{display:"flex",alignItems:"flex-start",gap:"12px",marginBottom:"16px"}}><div style={{width:"28px",height:"28px",borderRadius:"50%",border:"1.5px solid #ddd",background:"white",flexShrink:0,marginTop:"2px"}}/><div><p style={{color:"#333",fontSize:"12px",fontWeight:700,margin:"0 0 2px",letterSpacing:"1px",textTransform:"uppercase"}}>{p.nome}</p>{p.descricao&&<p style={{color:"#999",fontSize:"11px",margin:0}}>{p.descricao}</p>}</div></div>))}</div></>)}
      {bebidas.length>0&&(<><h2 style={{...tituloRosa,marginTop:"8px"}}>Bebidas</h2>{divisor}{bebidas.map((b,bi)=>(<div key={bi} style={{display:"flex",alignItems:"flex-start",gap:"12px",marginBottom:"14px"}}><div style={{width:"26px",height:"26px",borderRadius:"50%",border:"1.5px solid #ddd",background:"white",flexShrink:0,marginTop:"2px"}}/><div><p style={{color:"#333",fontSize:"12px",fontWeight:700,margin:"0 0 2px",letterSpacing:"1px",textTransform:"uppercase"}}>{b.nome}</p>{b.descricao&&<p style={{color:"#999",fontSize:"11px",margin:0}}>{b.descricao}</p>}</div></div>))}</>)}
    </div>);
    if(tipo==="rsvp")return(<div key={i} style={{...sRosa,paddingTop:"18px"}}>
      <h2 style={tituloRosa}>Confirmar Presença</h2>{divisor}
      {enviado?(<div style={{textAlign:"center",padding:"20px 0"}}>
        <div style={{width:"60px",height:"60px",borderRadius:"50%",background:form.confirmado?"linear-gradient(135deg,#43e97b,#38f9d7)":"linear-gradient(135deg,#f5576c,#f093fb)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 14px",fontSize:"26px",color:"white"}}>{form.confirmado?"&#10003;":"&#10007;"}</div>
        <h3 style={{color:PINK,fontFamily:"'Playfair Display',serif",fontSize:"18px",margin:"0 0 8px"}}>{form.confirmado?"Presença Confirmada!":"Resposta Enviada"}</h3>
        <p style={{color:"#777",fontSize:"13px",lineHeight:1.5}}>{form.confirmado?"Obrigado, "+form.nome_convidado+"! Até breve.":"Obrigado por responder, "+form.nome_convidado+"."}</p>
      </div>):(<form onSubmit={submit}>
        <div style={{marginBottom:"10px"}}><label style={lblS}>Nome completo *</label><input type="text" value={form.nome_convidado} onChange={e=>setForm({...form,nome_convidado:e.target.value})} required placeholder="O seu nome" style={inpS}/></div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px",marginBottom:"10px"}}>
          <div><label style={lblS}>Email</label><input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="seu@email.com" style={inpS}/></div>
          <div><label style={lblS}>Telefone</label><input type="tel" value={form.telefone} onChange={e=>setForm({...form,telefone:e.target.value})} placeholder="+258 84 000 0000" style={inpS}/></div>
        </div>
        <div style={{marginBottom:"10px"}}><label style={lblS}>Vai comparecer? *</label>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"7px"}}>
            <button type="button" onClick={()=>setForm({...form,confirmado:true})} style={{padding:"9px",borderRadius:"8px",border:"2px solid "+(form.confirmado?PINK:"#ddd"),background:form.confirmado?"rgba(224,90,106,0.08)":"white",color:form.confirmado?PINK:"#aaa",fontWeight:700,fontSize:"12px",cursor:"pointer"}}>Sim, vou!</button>
            <button type="button" onClick={()=>setForm({...form,confirmado:false,numero_acompanhantes:0})} style={{padding:"9px",borderRadius:"8px",border:"2px solid "+(!form.confirmado?PINK:"#ddd"),background:!form.confirmado?"rgba(224,90,106,0.08)":"white",color:!form.confirmado?PINK:"#aaa",fontWeight:700,fontSize:"12px",cursor:"pointer"}}>Não posso</button>
          </div>
        </div>
        {form.confirmado&&<div style={{marginBottom:"10px"}}><label style={lblS}>Acompanhantes</label><input type="number" min="0" max="20" value={form.numero_acompanhantes} onChange={e=>setForm({...form,numero_acompanhantes:parseInt(e.target.value)||0})} style={inpS}/></div>}
        <div style={{marginBottom:"12px"}}><label style={lblS}>Mensagem (opcional)</label><textarea value={form.mensagem} onChange={e=>setForm({...form,mensagem:e.target.value})} rows="2" placeholder="Deixe uma mensagem..." style={{...inpS,resize:"vertical"}}/></div>
        {erro&&<div style={{background:"rgba(224,90,106,0.1)",border:"1px solid rgba(224,90,106,0.3)",borderRadius:"7px",padding:"8px 10px",color:PINK,marginBottom:"10px",fontSize:"11px"}}>{erro}</div>}
        <button type="submit" disabled={submitting} style={{width:"100%",padding:"12px",borderRadius:"9px",border:"none",background:form.confirmado?"linear-gradient(135deg,#e05a6a,#f07a8a)":"linear-gradient(135deg,#667eea,#764ba2)",color:"white",fontSize:"13px",fontWeight:800,cursor:submitting?"wait":"pointer",opacity:submitting?0.7:1}}>
          {submitting?"A enviar...":form.confirmado?"Confirmar Presença":"Enviar Resposta"}
        </button>
      </form>)}
    </div>);
    return null;
  };

  return(
    <div style={{width:"100vw",height:"100vh",overflow:"hidden",position:"relative",background:"linear-gradient(135deg,#c8d8ea 0%,#dce8f5 50%,#c8dcea 100%)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Inter',sans-serif"}} onTouchStart={onTS} onTouchEnd={onTE}>
      <style>{CSS+`
        @media(max-width:600px){
          .cv-nav-btn{display:none!important;}
          .cv-frame{width:100vw!important;height:100vh!important;border-radius:0!important;box-shadow:none!important;}
          .cv-nav-mobile{display:flex!important;}
          .cv-dots{bottom:48px!important;}
        }
        .cv-nav-mobile{display:none;position:absolute;top:50%;transform:translateY(-50%);z-index:50;width:100%;justify-content:space-between;padding:0 10px;pointer-events:none;box-sizing:border-box;}
        .cv-nav-mobile button{pointer-events:all;width:38px;height:38px;border-radius:50%;background:rgba(255,255,255,0.85);border:none;font-size:22px;color:#3a4a5a;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 10px rgba(0,0,0,0.2);cursor:pointer;}
        .cv-nav-mobile button:disabled{opacity:0.2;cursor:not-allowed;}
      `}</style>
      {evento.musica_url&&<MusicaPlayer url={evento.musica_url} autoPlay={true}/>}
      <button className="cv-nav-btn" onClick={()=>goTo(slide-1)} disabled={slide===0} aria-label="Anterior" style={{width:"44px",height:"44px",borderRadius:"50%",background:"rgba(255,255,255,0.9)",border:"none",cursor:slide===0?"not-allowed":"pointer",opacity:slide===0?0.2:1,fontSize:"24px",color:"#3a4a5a",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 4px 16px rgba(0,0,0,0.15)",flexShrink:0,marginRight:"clamp(6px,1.5vw,16px)"}}>&#8249;</button>
      <div className="cv-frame" style={{width:"min(390px,86vw)",height:"min(630px,85vh)",borderRadius:"36px",background:"#181c28",boxShadow:"0 0 0 2px #252b3a,0 0 0 6px #181c28,0 40px 90px rgba(0,0,0,0.45)",position:"relative",overflow:"hidden",flexShrink:0}}>
        <div style={{position:"absolute",top:0,left:0,right:0,height:"24px",background:"#181c28",zIndex:10,display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{width:"7px",height:"7px",borderRadius:"50%",background:"#252b3a"}}/></div>
        <div style={{position:"absolute",top:"24px",left:0,right:0,bottom:"24px",overflow:"hidden"}}>
          <div ref={trackRef} style={{display:"flex",width:total+"00%",height:"100%",transition:"transform 0.55s cubic-bezier(0.4,0,0.2,1)"}}>
            {slides.map((tipo,i)=>(<div key={i} style={{width:(100/total)+"%",height:"100%",flexShrink:0,overflow:"hidden"}}>{renderSlide(tipo,i)}</div>))}
          </div>
        </div>
        {/* Botoes mobile — dentro do frame, overlay lateral */}
        <div className="cv-nav-mobile">
          <button onClick={()=>goTo(slide-1)} disabled={slide===0} aria-label="Anterior">&#8249;</button>
          <button onClick={()=>goTo(slide+1)} disabled={slide===total-1} aria-label="Proximo">&#8250;</button>
        </div>
        <div style={{position:"absolute",bottom:0,left:0,right:0,height:"24px",background:"#181c28",zIndex:10,display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{width:"40px",height:"4px",borderRadius:"2px",background:"#252b3a"}}/></div>
      </div>
      <button className="cv-nav-btn" onClick={()=>goTo(slide+1)} disabled={slide===total-1} aria-label="Proximo" style={{width:"44px",height:"44px",borderRadius:"50%",background:"rgba(255,255,255,0.9)",border:"none",cursor:slide===total-1?"not-allowed":"pointer",opacity:slide===total-1?0.2:1,fontSize:"24px",color:"#3a4a5a",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 4px 16px rgba(0,0,0,0.15)",flexShrink:0,marginLeft:"clamp(6px,1.5vw,16px)"}}>&#8250;</button>
      <div className="cv-dots" style={{position:"absolute",bottom:"clamp(8px,2vh,18px)",left:"50%",transform:"translateX(-50%)",display:"flex",gap:"6px",zIndex:100}}>
        {slides.map((_,i)=>(<button key={i} onClick={()=>goTo(i)} style={{width:i===slide?"20px":"6px",height:"6px",borderRadius:"3px",background:i===slide?"#4a6a8a":"rgba(74,106,138,0.3)",border:"none",cursor:"pointer",transition:"all 0.3s",padding:0}}/>))}
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
  useEffect(()=>{ convitesAPI.buscarPorId(id).then(d=>setEvento(d)).catch(()=>setErro("Convite nao encontrado.")).finally(()=>setLoading(false)); },[id]);
  if(loading)return(<div style={{minHeight:"100vh",background:"#f5f0eb",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Inter',sans-serif"}}><style>{CSS}</style><div style={{color:"#1a2332",textAlign:"center"}}><div style={{fontSize:"48px",marginBottom:"16px"}}>&#9993;</div>A carregar...</div></div>);
  if(erro||!evento)return(<div style={{minHeight:"100vh",background:"#f5f0eb",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Inter',sans-serif"}}><style>{CSS}</style><div style={{background:"white",borderRadius:"20px",padding:"48px",textAlign:"center",maxWidth:"400px",boxShadow:"0 8px 32px rgba(0,0,0,0.1)"}}><div style={{fontSize:"48px",marginBottom:"16px"}}>&#128533;</div><h2 style={{color:"#1a2332",fontFamily:"'Playfair Display',serif"}}>Convite nao encontrado</h2><p style={{color:"#8a9bb0",marginTop:"12px"}}>O link pode estar incorreto.</p></div></div>);
  if(!aberto)return <Envelope nome={nomeConv} relacao={relConv} nomeEvento={evento.nome_evento} dataEvento={evento.data_evento} horaEvento={evento.hora_evento} localEvento={evento.local_evento} onAbrir={()=>setAberto(true)}/>;
  return <ConviteSlides evento={evento} nomeConv={nomeConv} relConv={relConv}/>;
}

export default ConvitePublico;
