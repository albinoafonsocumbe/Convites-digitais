f = open('src/pages/ConvitePublico.js', 'a', encoding='utf-8')
f.write('''
function ConviteSlides({ evento, nomeConv, relConv }) {
  const [slide, setSlide] = useState(0);
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ nome_convidado: nomeConv||'', email:'', telefone:'', confirmado:true, numero_acompanhantes:0, mensagem:'' });
  const trackRef = useRef();
  const startX = useRef(null);

  const fotos = (Array.isArray(evento.fotos) ? evento.fotos : []).filter(Boolean);
  const programa = (() => { try { return Array.isArray(evento.programa) ? evento.programa : JSON.parse(evento.programa||'[]'); } catch { return []; } })().filter(p => p.nome);
  const refData = (() => { try { return typeof evento.refeicao==='object' ? evento.refeicao : JSON.parse(evento.refeicao||'{}'); } catch { return {}; } })();
  const pratos = (refData?.pratos||[]).filter(p=>p.nome);
  const bebidas = (refData?.bebidas||[]).filter(b=>b.nome);

  const slides = ['hero','countdown',...(evento.video_url?['video']:[]),...(fotos.length?['galeria']:[]),...(programa.length?['programa']:[]),...((pratos.length||bebidas.length)?['refeicao']:[]),...(evento.endereco_maps?['mapa']:[]),'rsvp'];
  const total = slides.length;

  const goTo = useCallback((n) => {
    const next = Math.max(0, Math.min(total-1, n));
    setSlide(next);
    if (trackRef.current) trackRef.current.style.transform = 'translateX(-'+next+'00vw)';
  }, [total]);

  useEffect(() => {
    const h = (e) => { if (e.key==='ArrowRight') goTo(slide+1); if (e.key==='ArrowLeft') goTo(slide-1); };
    window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h);
  }, [slide, goTo]);

  const onTS = (e) => { startX.current = e.touches[0].clientX; };
  const onTE = (e) => { if (startX.current===null) return; const dx = startX.current - e.changedTouches[0].clientX; if (Math.abs(dx)>50) goTo(slide+(dx>0?1:-1)); startX.current=null; };

  const bg = evento.foto_capa ? 'linear-gradient(to bottom,rgba(0,0,0,0.55) 0%,rgba(13,13,26,0.85) 60%,#0d0d1a 100%),url('+evento.foto_capa+') center/cover no-repeat fixed' : 'linear-gradient(160deg,#0d0d1a 0%,#1a0a2e 50%,#0d1a2e 100%)';
  const dataFmt = new Date(evento.data_evento).toLocaleDateString('pt-PT',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
  const inpS = { width:'100%', padding:'13px 16px', borderRadius:'10px', border:'1px solid rgba(255,255,255,0.12)', background:'rgba(255,255,255,0.06)', color:'white', fontSize:'15px', outline:'none', fontFamily:"'Inter',sans-serif", boxSizing:'border-box' };
  const lblS = { color:'rgba(255,255,255,0.5)', fontSize:'11px', fontWeight:600, display:'block', marginBottom:'8px', letterSpacing:'1px', textTransform:'uppercase' };
  const h2S = { fontFamily:"'Playfair Display',serif", color:'white', fontSize:'clamp(22px,4vw,34px)', fontWeight:700, textAlign:'center', marginBottom:'28px' };
  const secTit = (t) => <p style={{ color:'rgba(255,255,255,0.35)', fontSize:'10px', letterSpacing:'4px', textTransform:'uppercase', marginBottom:'8px', textAlign:'center' }}>{t}</p>;
  const slideBase = { width:'100vw', height:'100vh', flexShrink:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'24px', overflowY:'auto', background:bg, fontFamily:"'Inter',sans-serif" };

  const submit = async (e) => {
    e.preventDefault(); setErro(''); setSubmitting(true);
    if (!form.nome_convidado.trim()) { setErro('O nome e obrigatorio.'); setSubmitting(false); return; }
    try { await confirmacoesAPI.criar(evento.id, form); setEnviado(true); }
    catch (err) { setErro(err.message||'Erro ao enviar.'); }
    setSubmitting(false);
  };

  const renderSlide = (tipo, i) => {
    if (tipo==='hero') return (
      <div key={i} style={slideBase}>
        <div style={{ textAlign:'center', maxWidth:'600px', animation:'fadeUp 0.8s ease' }}>
          {nomeConv && <div style={{ marginBottom:'28px', background:'rgba(255,255,255,0.07)', borderRadius:'50px', padding:'10px 28px', display:'inline-block', border:'1px solid rgba(255,255,255,0.1)' }}><span style={{ color:'white', fontSize:'17px', fontWeight:600 }}>Ola {relConv?relConv+' ':''}{nomeConv}!</span></div>}
          <p style={{ color:'rgba(255,255,255,0.35)', fontSize:'10px', letterSpacing:'5px', textTransform:'uppercase', marginBottom:'16px' }}>Convite Especial</p>
          <h1 style={{ fontFamily:"'Playfair Display',serif", color:'white', fontSize:'clamp(32px,7vw,64px)', fontWeight:900, lineHeight:1.1, marginBottom:'20px', textShadow:'0 4px 24px rgba(0,0,0,0.4)' }}>{evento.nome_evento}</h1>
          {evento.mensagem && <p style={{ color:'rgba(255,255,255,0.65)', fontSize:'18px', fontStyle:'italic', fontFamily:"'Playfair Display',serif", lineHeight:1.7, marginBottom:'32px' }}>"{evento.mensagem}"</p>}
          <div style={{ display:'inline-flex', background:'rgba(255,255,255,0.05)', borderRadius:'16px', border:'1px solid rgba(255,255,255,0.1)', overflow:'hidden', marginBottom:'40px' }}>
            <div style={{ padding:'16px 24px', textAlign:'center' }}><div style={{ color:'rgba(255,255,255,0.35)', fontSize:'9px', letterSpacing:'2px', textTransform:'uppercase', marginBottom:'6px' }}>Data</div><div style={{ color:'white', fontWeight:600, fontSize:'13px' }}>{dataFmt}</div></div>
            {evento.hora_evento && <><div style={{ width:'1px', background:'rgba(255,255,255,0.08)' }}/><div style={{ padding:'16px 24px', textAlign:'center' }}><div style={{ color:'rgba(255,255,255,0.35)', fontSize:'9px', letterSpacing:'2px', textTransform:'uppercase', marginBottom:'6px' }}>Hora</div><div style={{ color:'white', fontWeight:600, fontSize:'13px' }}>{evento.hora_evento}</div></div></>}
            <div style={{ width:'1px', background:'rgba(255,255,255,0.08)' }}/>
            <div style={{ padding:'16px 24px', textAlign:'center' }}><div style={{ color:'rgba(255,255,255,0.35)', fontSize:'9px', letterSpacing:'2px', textTransform:'uppercase', marginBottom:'6px' }}>Local</div><div style={{ color:'white', fontWeight:600, fontSize:'13px' }}>{evento.local_evento}</div></div>
          </div>
          <button onClick={()=>goTo(1)} style={{ background:'linear-gradient(135deg,#c9a96e,#e8c97a)', border:'none', borderRadius:'50px', padding:'14px 40px', color:'#1a0a2e', fontFamily:"'Playfair Display',serif", fontSize:'16px', fontWeight:700, cursor:'pointer', boxShadow:'0 8px 24px rgba(201,169,110,0.35)' }}>Ver Convite</button>
        </div>
      </div>
    );
    if (tipo==='countdown') return (
      <div key={i} style={slideBase}>
        <div style={{ textAlign:'center', maxWidth:'560px', width:'100%' }}>
          {secTit('Estamos a contar')}
          <h2 style={h2S}>{evento.nome_evento}</h2>
          <Countdown dataEvento={evento.data_evento} horaEvento={evento.hora_evento}/>
          <div style={{ background:'rgba(255,255,255,0.04)', borderRadius:'16px', padding:'20px 28px', border:'1px solid rgba(255,255,255,0.08)', display:'inline-block', marginTop:'16px' }}>
            <div style={{ background:'white', borderRadius:'10px', padding:'10px', display:'inline-block' }}>
              <QRCodeSVG value={window.location.origin+'/convite/'+evento.id} size={90} fgColor='#1a0a2e' level='M'/>
            </div>
            <p style={{ color:'rgba(255,255,255,0.3)', fontSize:'11px', marginTop:'10px', letterSpacing:'1px' }}>Partilha este convite</p>
          </div>
        </div>
      </div>
    );
    if (tipo==='video') { const yt = evento.video_url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/); return (
      <div key={i} style={slideBase}><div style={{ width:'100%', maxWidth:'700px' }}>{secTit('Video')}{yt ? <div style={{ borderRadius:'16px', overflow:'hidden', aspectRatio:'16/9' }}><iframe src={'https://www.youtube.com/embed/'+yt[1]+'?rel=0'} style={{ width:'100%', height:'100%', border:'none' }} allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture' allowFullScreen title='Video'/></div> : <video controls src={evento.video_url} style={{ width:'100%', borderRadius:'16px', maxHeight:'60vh' }}/>}</div></div>
    ); }
    if (tipo==='galeria') return (
      <div key={i} style={{ ...slideBase, justifyContent:'flex-start', paddingTop:'60px' }}>
        <div style={{ width:'100%', maxWidth:'700px' }}>{secTit('Galeria de Fotos')}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(130px,1fr))', gap:'8px', marginTop:'16px' }}>
            {fotos.map((f,fi) => (
              <div key={fi} style={{ aspectRatio:'1', borderRadius:'10px', overflow:'hidden', cursor:'pointer' }} onClick={()=>window.open(f,'_blank')}>
                <img src={f} alt='' style={{ width:'100%', height:'100%', objectFit:'cover', transition:'transform 0.3s' }} onMouseEnter={e=>e.target.style.transform='scale(1.05)'} onMouseLeave={e=>e.target.style.transform='scale(1)'}/>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
    if (tipo==='programa') return (
      <div key={i} style={{ ...slideBase, justifyContent:'flex-start', paddingTop:'60px' }}>
        <div style={{ width:'100%', maxWidth:'600px' }}>{secTit('Programa')}<h2 style={h2S}>Da Cerimonia</h2>
          <div style={{ position:'relative', paddingLeft:'28px' }}>
            <div style={{ position:'absolute', left:'8px', top:0, bottom:0, width:'1px', background:'rgba(201,169,110,0.3)' }}/>
            {programa.map((p,pi) => (
              <div key={pi} style={{ position:'relative', marginBottom:'28px' }}>
                <div style={{ position:'absolute', left:'-24px', top:'6px', width:'10px', height:'10px', borderRadius:'50%', background:'rgba(201,169,110,0.2)', border:'2px solid #c9a96e' }}/>
                {p.hora && <span style={{ color:'#c9a96e', fontSize:'13px', fontWeight:700, letterSpacing:'1px' }}>{p.hora}</span>}
                <h4 style={{ color:'white', fontSize:'17px', fontWeight:700, margin:'4px 0 6px', fontFamily:"'Playfair Display',serif" }}>{p.nome}</h4>
                <div style={{ display:'flex', gap:'16px', flexWrap:'wrap', marginBottom:'4px' }}>
                  {p.local_prog && <span style={{ color:'rgba(255,255,255,0.4)', fontSize:'11px' }}>Local: {p.local_prog.toUpperCase()}</span>}
                  {p.responsavel && <span style={{ color:'rgba(255,255,255,0.4)', fontSize:'11px' }}>Resp: {p.responsavel.toUpperCase()}</span>}
                </div>
                {p.descricao && <p style={{ color:'rgba(255,255,255,0.55)', fontSize:'14px', lineHeight:1.5 }}>{p.descricao}</p>}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
    if (tipo==='refeicao') return (
      <div key={i} style={{ ...slideBase, justifyContent:'flex-start', paddingTop:'60px' }}>
        <div style={{ width:'100%', maxWidth:'560px' }}>
          {pratos.length>0 && <>{secTit('Menu')}<h2 style={h2S}>Refeicao</h2>{pratos.map((p,pi) => (<div key={pi} style={{ display:'flex', alignItems:'flex-start', gap:'14px', marginBottom:'18px' }}><div style={{ width:'32px', height:'32px', borderRadius:'50%', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', flexShrink:0, marginTop:'2px' }}/><div><p style={{ color:'white', fontSize:'14px', fontWeight:700, letterSpacing:'0.5px', margin:'0 0 3px', textTransform:'uppercase' }}>{p.nome}</p>{p.descricao && <p style={{ color:'rgba(255,255,255,0.45)', fontSize:'13px', margin:0 }}>{p.descricao}</p>}</div></div>))}</>}
          {bebidas.length>0 && <div style={{ borderTop:'1px solid rgba(255,255,255,0.08)', paddingTop:'20px', marginTop:'8px' }}><h2 style={{ ...h2S, fontSize:'clamp(18px,3vw,26px)' }}>Bebidas</h2>{bebidas.map((b,bi) => (<div key={bi} style={{ display:'flex', alignItems:'flex-start', gap:'14px', marginBottom:'14px' }}><div style={{ width:'28px', height:'28px', borderRadius:'50%', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', flexShrink:0, marginTop:'2px' }}/><div><p style={{ color:'white', fontSize:'14px', fontWeight:700, letterSpacing:'0.5px', margin:'0 0 3px', textTransform:'uppercase' }}>{b.nome}</p>{b.descricao && <p style={{ color:'rgba(255,255,255,0.45)', fontSize:'13px', margin:0 }}>{b.descricao}</p>}</div></div>))}</div>}
        </div>
      </div>
    );
    if (tipo==='mapa') return (
      <div key={i} style={slideBase}><div style={{ width:'100%', maxWidth:'700px' }}>{secTit('Localizacao')}<h2 style={h2S}>{evento.local_evento}</h2>
        <div style={{ borderRadius:'16px', overflow:'hidden', boxShadow:'0 8px 32px rgba(0,0,0,0.4)' }}>
          <iframe title='mapa' src={'https://maps.google.com/maps?q='+encodeURIComponent(evento.endereco_maps)+'&output=embed'} width='100%' height='300' style={{ border:'none', display:'block' }} loading='lazy'/>
        </div>
        <a href={'https://maps.google.com/?q='+encodeURIComponent(evento.endereco_maps)} target='_blank' rel='noreferrer' style={{ display:'block', textAlign:'center', marginTop:'14px', color:'#c9a96e', fontSize:'14px', fontWeight:600, textDecoration:'none' }}>Abrir no Google Maps</a>
      </div></div>
    );
    if (tipo==='rsvp') return (
      <div key={i} style={{ ...slideBase, justifyContent:'flex-start', paddingTop:'60px' }}>
        <div style={{ width:'100%', maxWidth:'560px' }}>
          {enviado ? (
            <div style={{ textAlign:'center', padding:'40px 0' }}>
              <div style={{ width:'80px', height:'80px', borderRadius:'50%', background: form.confirmado?'linear-gradient(135deg,#43e97b,#38f9d7)':'linear-gradient(135deg,#f5576c,#f093fb)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 24px', fontSize:'36px', color:'#0d1a0d' }}>{form.confirmado?'v':'x'}</div>
              <h2 style={{ ...h2S, marginBottom:'12px' }}>{form.confirmado?'Presenca Confirmada!':'Resposta Enviada'}</h2>
              <p style={{ color:'rgba(255,255,255,0.55)', lineHeight:1.6 }}>{form.confirmado?'Obrigado, '+form.nome_convidado+'! Ate breve.':'Obrigado por responder, '+form.nome_convidado+'.'}</p>
            </div>
          ) : (
            <>{secTit('RSVP')}<h2 style={h2S}>Confirmar Presenca</h2>
              <form onSubmit={submit}>
                <div style={{ marginBottom:'16px' }}><label style={lblS}>Nome completo *</label><input type='text' value={form.nome_convidado} onChange={e=>setForm({...form,nome_convidado:e.target.value})} required placeholder='O seu nome' style={inpS}/></div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px', marginBottom:'16px' }}>
                  <div><label style={lblS}>Email</label><input type='email' value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder='seu@email.com' style={inpS}/></div>
                  <div><label style={lblS}>Telefone</label><input type='tel' value={form.telefone} onChange={e=>setForm({...form,telefone:e.target.value})} placeholder='+258 84 000 0000' style={inpS}/></div>
                </div>
                <div style={{ marginBottom:'16px' }}><label style={lblS}>Vai comparecer? *</label>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
                    <button type='button' onClick={()=>setForm({...form,confirmado:true})} style={{ padding:'14px', borderRadius:'10px', border:'2px solid '+(form.confirmado?'#43e97b':'rgba(255,255,255,0.12)'), background:form.confirmado?'rgba(67,233,123,0.12)':'transparent', color:form.confirmado?'#43e97b':'rgba(255,255,255,0.5)', fontWeight:700, fontSize:'15px', cursor:'pointer' }}>Sim, vou!</button>
                    <button type='button' onClick={()=>setForm({...form,confirmado:false,numero_acompanhantes:0})} style={{ padding:'14px', borderRadius:'10px', border:'2px solid '+(!form.confirmado?'#f5576c':'rgba(255,255,255,0.12)'), background:!form.confirmado?'rgba(245,87,108,0.12)':'transparent', color:!form.confirmado?'#f5576c':'rgba(255,255,255,0.5)', fontWeight:700, fontSize:'15px', cursor:'pointer' }}>Nao posso</button>
                  </div>
                </div>
                {form.confirmado && <div style={{ marginBottom:'16px' }}><label style={lblS}>Acompanhantes</label><input type='number' min='0' max='20' value={form.numero_acompanhantes} onChange={e=>setForm({...form,numero_acompanhantes:parseInt(e.target.value)||0})} style={inpS}/></div>}
                <div style={{ marginBottom:'20px' }}><label style={lblS}>Mensagem (opcional)</label><textarea value={form.mensagem} onChange={e=>setForm({...form,mensagem:e.target.value})} rows='3' placeholder='Deixe uma mensagem...' style={{ ...inpS, resize:'vertical' }}/></div>
                {erro && <div style={{ background:'rgba(245,87,108,0.12)', border:'1px solid rgba(245,87,108,0.3)', borderRadius:'10px', padding:'12px 16px', color:'#f5576c', marginBottom:'16px', fontSize:'14px' }}>{erro}</div>}
                <button type='submit' disabled={submitting} style={{ width:'100%', padding:'16px', borderRadius:'12px', border:'none', background:form.confirmado?'linear-gradient(135deg,#43e97b,#38f9d7)':'linear-gradient(135deg,#667eea,#764ba2)', color:form.confirmado?'#0d1a0d':'white', fontSize:'16px', fontWeight:800, cursor:submitting?'wait':'pointer', opacity:submitting?0.7:1 }}>
                  {submitting?'A enviar...':form.confirmado?'Confirmar Presenca':'Enviar Resposta'}
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
    <div style={{ width:'100vw', height:'100vh', overflow:'hidden', position:'relative', fontFamily:"'Inter',sans-serif" }} onTouchStart={onTS} onTouchEnd={onTE}>
      <style>{CSS}</style>
      {evento.musica_url && <MusicaPlayer url={evento.musica_url}/>}
      <div ref={trackRef} style={{ display:'flex', width:total+'00vw', height:'100vh', transition:'transform 0.6s cubic-bezier(0.4,0,0.2,1)' }}>
        {slides.map((tipo, i) => renderSlide(tipo, i))}
      </div>
      <div style={{ position:'fixed', bottom:'24px', left:'50%', transform:'translateX(-50%)', display:'flex', alignItems:'center', gap:'12px', zIndex:1000 }}>
        <button onClick={()=>goTo(slide-1)} disabled={slide===0} style={{ width:'40px', height:'40px', borderRadius:'50%', background:'rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.15)', color:'white', fontSize:'18px', cursor:slide===0?'not-allowed':'pointer', opacity:slide===0?0.3:1, backdropFilter:'blur(8px)', display:'flex', alignItems:'center', justifyContent:'center' }}>&#8249;</button>
        <div style={{ display:'flex', gap:'8px' }}>
          {slides.map((_,i) => (<button key={i} onClick={()=>goTo(i)} style={{ width:i===slide?'24px':'8px', height:'8px', borderRadius:'4px', background:i===slide?'#c9a96e':'rgba(255,255,255,0.25)', border:'none', cursor:'pointer', transition:'all 0.3s', padding:0 }}/>))}
        </div>
        <button onClick={()=>goTo(slide+1)} disabled={slide===total-1} style={{ width:'40px', height:'40px', borderRadius:'50%', background:'rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.15)', color:'white', fontSize:'18px', cursor:slide===total-1?'not-allowed':'pointer', opacity:slide===total-1?0.3:1, backdropFilter:'blur(8px)', display:'flex', alignItems:'center', justifyContent:'center' }}>&#8250;</button>
      </div>
      <div style={{ position:'fixed', top:'20px', right:'20px', color:'rgba(255,255,255,0.3)', fontSize:'12px', letterSpacing:'1px', zIndex:1000 }}>{slide+1} / {total}</div>
    </div>
  );
}

function ConvitePublico() {
  const { id } = useParams();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const nomeConv = params.get('nome');
  const relConv = params.get('rel');
  const [aberto, setAberto] = useState(false);
  const [evento, setEvento] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    convitesAPI.buscarPorId(id).then(d => setEvento(d)).catch(() => setErro('Convite nao encontrado.')).finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(160deg,#1a0a2e,#0d1a2e)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Inter',sans-serif" }}>
      <style>{CSS}</style>
      <div style={{ color:'white', textAlign:'center' }}><div style={{ fontSize:'48px', marginBottom:'16px', animation:'pulse 1.5s infinite' }}>&#x2709;&#xFE0F;</div>A carregar...</div>
    </div>
  );

  if (erro || !evento) return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(160deg,#1a0a2e,#0d1a2e)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Inter',sans-serif" }}>
      <style>{CSS}</style>
      <div style={{ background:'rgba(255,255,255,0.05)', borderRadius:'20px', padding:'48px', textAlign:'center', maxWidth:'400px', border:'1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ fontSize:'48px', marginBottom:'16px' }}>&#x1F615;</div>
        <h2 style={{ color:'white', fontFamily:"'Playfair Display',serif" }}>Convite nao encontrado</h2>
        <p style={{ color:'rgba(255,255,255,0.5)', marginTop:'12px' }}>O link pode estar incorreto.</p>
      </div>
    </div>
  );

  if (!aberto) return <Envelope nome={nomeConv} relacao={relConv} onAbrir={() => setAberto(true)}/>;
  return <ConviteSlides evento={evento} nomeConv={nomeConv} relConv={relConv}/>;
}

export default ConvitePublico;
''')
f.close()
print('Part2 OK')
