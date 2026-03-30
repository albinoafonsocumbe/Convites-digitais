import codecs, os
path = os.path.join("convites-digital", "src", "pages", "ConvitePublico.js")
js = u"""
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
  const videos = [evento.video_url, evento.video_url2, evento.video_url3].filter(Boolean);

  const slides = [
    "hero", "countdown",
    ...videos.map((_,vi)=>"video_"+vi),
    ...(evento.endereco_maps||evento.local_evento?["localizacao"]:[]),
    ...(programa.length?["programa"]:[]),
    ...((pratos.length||bebidas.length)?["refeicao"]:[]),
    "rsvp"
  ];
  const total = slides.length;

  const goTo = useCallback((n) => {
    const next = Math.max(0, Math.min(total-1, n));
    setSlide(next);
    if (trackRef.current) trackRef.current.style.transform = "translateX(-"+(next*(100/total))+"%)";
  }, [total]);

  useEffect(() => {
    const h = (e) => { if(e.key==="ArrowRight") goTo(slide+1); if(e.key==="ArrowLeft") goTo(slide-1); };
    window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h);
  }, [slide, goTo]);

  const onTS = (e) => { startX.current = e.touches[0].clientX; };
  const onTE = (e) => { if(startX.current===null) return; const dx=startX.current-e.changedTouches[0].clientX; if(Math.abs(dx)>40) goTo(slide+(dx>0?1:-1)); startX.current=null; };

  const ROSA="#fdf0ee", PINK="#e05a6a", GOLD="#c9a050";
  const sRosa = { width:"100%", height:"100%", background:ROSA, fontFamily:"'Inter',sans-serif", overflowY:"auto", padding:"20px 18px" };
  const tituloRosa = { fontFamily:"'Playfair Display',serif", color:PINK, fontSize:"clamp(18px,4vw,26px)", fontWeight:700, textAlign:"center", letterSpacing:"3px", textTransform:"uppercase", margin:"0 0 6px" };
  const divisor = <div style={{width:"40px",height:"2px",background:PINK,margin:"0 auto 18px",opacity:0.5}}/>;
  const inpS = { width:"100%", padding:"9px 12px", borderRadius:"8px", border:"1px solid rgba(0,0,0,0.15)", background:"white", color:"#333", fontSize:"13px", outline:"none", fontFamily:"'Inter',sans-serif", boxSizing:"border-box" };
  const lblS = { color:"#888", fontSize:"10px", fontWeight:600, display:"block", marginBottom:"5px", letterSpacing:"1px", textTransform:"uppercase" };

  const submit = async (e) => {
    e.preventDefault(); setErro(""); setSubmitting(true);
    if (!form.nome_convidado.trim()) { setErro("O nome \u00e9 obrigat\u00f3rio."); setSubmitting(false); return; }
    try { await confirmacoesAPI.criar(evento.id, form); setEnviado(true); }
    catch (err) { setErro(err.message||"Erro ao enviar."); }
    setSubmitting(false);
  };

  const renderVideo = (url, key) => {
    const yt = url.match(/(?:youtube\\.com\\/watch\\?v=|youtu\\.be\\/)([^&\\s]+)/);
    const vimeo = url.match(/vimeo\\.com\\/(\\d+)/);
    return (
      <div key={key} style={{width:"100%",height:"100%",background:"#0a0a0a",position:"relative",display:"flex",flexDirection:"column"}}>
        <div style={{position:"absolute",top:0,left:0,right:0,padding:"10px",zIndex:5,background:"linear-gradient(to bottom,rgba(0,0,0,0.6),transparent)"}}>
          <p style={{color:"rgba(255,255,255,0.5)",fontSize:"9px",letterSpacing:"3px",textTransform:"uppercase",margin:0,textAlign:"center"}}>V\u00eddeo</p>
        </div>
        <div style={{flex:1,overflow:"hidden"}}>
          {yt ? (
            <iframe src={"https://www.youtube.com/embed/"+yt[1]+"?rel=0&controls=1&modestbranding=1"} style={{width:"100%",height:"100%",border:"none"}} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen title="Video"/>
          ) : vimeo ? (
            <iframe src={"https://player.vimeo.com/video/"+vimeo[1]+"?title=0&byline=0&portrait=0"} style={{width:"100%",height:"100%",border:"none"}} allow="autoplay; fullscreen; picture-in-picture" allowFullScreen title="Video"/>
          ) : (
            <video src={url} controls playsInline style={{width:"100%",height:"100%",objectFit:"cover"}}/>
          )}
        </div>
      </div>
    );
  };

  const renderSlide = (tipo, i) => {
    if (tipo==="hero") {
      const partes = evento.nome_evento ? evento.nome_evento.split(/[&]/).map(s=>s.trim()).filter(Boolean) : [evento.nome_evento];
      const dataHero = evento.data_evento ? new Date(evento.data_evento).toLocaleDateString("pt-PT",{day:"2-digit",month:"2-digit",year:"numeric"}).replace(/\\//g,".") : "";
      return (
        <div key={i} style={{width:"100%",height:"100%",position:"relative",overflow:"hidden"}}>
          {evento.foto_capa ? <img src={evento.foto_capa} alt="" style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",filter:"grayscale(100%) brightness(0.85)"}}/> : <div style={{position:"absolute",inset:0,background:"linear-gradient(160deg,#2a2a3a,#1a1a28)"}}/>}
          <div style={{position:"absolute",inset:0,background:"linear-gradient(to bottom,rgba(0,0,0,0.45) 0%,rgba(0,0,0,0) 35%,rgba(0,0,0,0) 60%,rgba(0,0,0,0.5) 100%)"}}/>
          <div style={{position:"absolute",top:0,left:0,right:0,padding:"20px 16px 0",textAlign:"center",animation:"fadeUp 0.8s ease"}}>
            {partes.length>=2
              ? <h1 style={{fontFamily:"'Playfair Display',serif",color:"white",fontSize:"clamp(28px,6vw,46px)",fontWeight:900,fontStyle:"italic",lineHeight:1.05,margin:0,textShadow:"0 2px 12px rgba(0,0,0,0.6)"}}>
                  {partes[0]} <span style={{fontStyle:"normal",fontWeight:400}}>&amp;</span> {partes[1]}
                </h1>
              : <h1 style={{fontFamily:"'Playfair Display',serif",color:"white",fontSize:"clamp(22px,5vw,38px)",fontWeight:900,fontStyle:"italic",lineHeight:1.1,margin:0,textShadow:"0 2px 12px rgba(0,0,0,0.6)"}}>{evento.nome_evento}</h1>
            }
            {dataHero&&<p style={{color:"white",fontSize:"clamp(13px,2.5vw,18px)",fontWeight:300,letterSpacing:"clamp(4px,1vw,8px)",marginTop:"8px",textShadow:"0 1px 6px rgba(0,0,0,0.6)"}}>{dataHero}</p>}
          </div>
          {evento.mensagem&&(<div style={{position:"absolute",bottom:0,left:0,right:0,padding:"0 20px 20px",textAlign:"center"}}><p style={{fontFamily:"'Playfair Display',serif",color:"white",fontSize:"clamp(13px,2.5vw,17px)",fontStyle:"italic",margin:0,textShadow:"0 2px 8px rgba(0,0,0,0.8)",lineHeight:1.4}}>"{evento.mensagem}"</p></div>)}
        </div>
      );
    }
    if (tipo.startsWith("video_")) {
      const vi = parseInt(tipo.split("_")[1]);
      return renderVideo(videos[vi], i);
    }
"""
with codecs.open(path,'a','utf-8') as f: f.write(js)
print("p3 ok")
