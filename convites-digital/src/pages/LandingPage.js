import { Link } from "react-router-dom";

function LandingPage() {
  return (
    <div style={{ fontFamily: "Inter,sans-serif", minHeight: "100vh", color: "white", overflowX: "hidden",
      background: "linear-gradient(rgba(40,20,80,0.82), rgba(102,60,160,0.88)), url('https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=1600&q=80&fit=crop') center/cover no-repeat fixed" }}>
      <style>{`
        *{box-sizing:border-box;}
        .lp-nav{display:flex;justify-content:space-between;align-items:center;padding:18px 40px;border-bottom:1px solid rgba(255,255,255,0.1);position:sticky;top:0;background:rgba(40,20,80,0.85);backdrop-filter:blur(12px);z-index:100;}
        .lp-logo{font-weight:800;font-size:18px;color:white;letter-spacing:-0.3px;}
        .lp-logo span{color:#a78bfa;}
        .lp-nav-btns{display:flex;gap:10px;}
        .lp-btn-out{background:transparent;border:1.5px solid rgba(255,255,255,0.4);color:white;padding:9px 22px;border-radius:8px;cursor:pointer;font-size:14px;font-weight:600;font-family:inherit;transition:all .2s;}
        .lp-btn-out:hover{background:rgba(255,255,255,0.1);}
        .lp-btn-pri{background:linear-gradient(135deg,#667eea,#764ba2);border:none;color:white;padding:9px 22px;border-radius:8px;cursor:pointer;font-size:14px;font-weight:700;font-family:inherit;box-shadow:0 4px 15px rgba(102,126,234,0.4);transition:opacity .2s;}
        .lp-btn-pri:hover{opacity:.88;}
        .lp-hero{text-align:center;padding:100px 24px 80px;max-width:760px;margin:0 auto;}
        .lp-badge{display:inline-block;background:rgba(102,126,234,0.2);border:1px solid rgba(102,126,234,0.4);color:#c4b5fd;padding:6px 16px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:28px;}
        .lp-h1{font-size:clamp(32px,6vw,62px);font-weight:900;line-height:1.1;margin-bottom:22px;letter-spacing:-1px;text-shadow:0 2px 20px rgba(0,0,0,0.3);}
        .lp-h1 span{background:linear-gradient(135deg,#a78bfa,#f472b6);-webkit-background-clip:text;-webkit-text-fill-color:transparent;}
        .lp-sub{font-size:clamp(15px,2.5vw,18px);color:rgba(255,255,255,0.8);line-height:1.7;margin-bottom:40px;max-width:520px;margin-left:auto;margin-right:auto;}
        .lp-btns{display:flex;gap:14px;justify-content:center;flex-wrap:wrap;margin-bottom:60px;}
        .lp-btn-main{background:linear-gradient(135deg,#667eea,#764ba2);border:none;color:white;padding:15px 40px;border-radius:12px;cursor:pointer;font-size:16px;font-weight:700;box-shadow:0 8px 32px rgba(102,126,234,0.5);font-family:inherit;transition:transform .2s;}
        .lp-btn-main:hover{transform:translateY(-2px);}
        .lp-btn-sec{background:rgba(255,255,255,0.12);border:1.5px solid rgba(255,255,255,0.3);color:white;padding:15px 40px;border-radius:12px;cursor:pointer;font-size:16px;font-weight:600;font-family:inherit;transition:background .2s;}
        .lp-btn-sec:hover{background:rgba(255,255,255,0.2);}
        .lp-stats{display:flex;gap:40px;justify-content:center;flex-wrap:wrap;padding-top:40px;border-top:1px solid rgba(255,255,255,0.15);}
        .lp-stat-num{font-size:26px;font-weight:900;color:white;}
        .lp-stat-lbl{font-size:12px;color:rgba(255,255,255,0.6);margin-top:4px;font-weight:500;}
        .lp-sec{padding:80px 24px;max-width:1040px;margin:0 auto;}
        .lp-sec-lbl{text-align:center;font-size:12px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:#a78bfa;margin-bottom:14px;}
        .lp-sec-title{text-align:center;font-size:clamp(24px,4vw,36px);font-weight:800;margin-bottom:48px;color:white;}
        .lp-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:20px;}
        .lp-card{background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);border-radius:16px;padding:28px 24px;backdrop-filter:blur(8px);transition:border-color .2s,background .2s;}
        .lp-card:hover{border-color:rgba(102,126,234,0.5);background:rgba(102,126,234,0.12);}
        .lp-card-icon{font-size:28px;margin-bottom:14px;}
        .lp-card-title{font-size:16px;font-weight:700;margin-bottom:8px;color:white;}
        .lp-card-desc{font-size:14px;color:rgba(255,255,255,0.65);line-height:1.65;}
        .lp-divider{border-top:1px solid rgba(255,255,255,0.1);padding:60px 24px;}
        .lp-tags{display:flex;flex-wrap:wrap;gap:10px;justify-content:center;}
        .lp-tag{background:rgba(102,126,234,0.2);border:1px solid rgba(102,126,234,0.35);color:#c4b5fd;padding:8px 18px;border-radius:20px;font-size:13px;font-weight:600;}
        .lp-cta{text-align:center;padding:80px 24px;border-top:1px solid rgba(255,255,255,0.1);}
        .lp-footer{text-align:center;padding:28px;border-top:1px solid rgba(255,255,255,0.08);color:rgba(255,255,255,0.4);font-size:13px;}
        @media(max-width:600px){
          .lp-nav{padding:14px 20px;}
          .lp-btn-out,.lp-btn-pri{padding:8px 14px;font-size:13px;}
          .lp-hero{padding:60px 20px 50px;}
          .lp-stats{gap:20px;}
          .lp-sec{padding:60px 20px;}
          .lp-btn-main,.lp-btn-sec{padding:13px 28px;font-size:15px;width:100%;}
          .lp-btns{flex-direction:column;align-items:center;}
        }
      `}</style>

      <nav className="lp-nav">
        <span className="lp-logo">Convites <span>Digitais</span></span>
        <div className="lp-nav-btns">
          <Link to="/login"><button className="lp-btn-out">Entrar</button></Link>
          <Link to="/registro"><button className="lp-btn-pri">Criar Conta</button></Link>
        </div>
      </nav>

      <div className="lp-hero">
        <div className="lp-badge">Plataforma gratuita de convites</div>
        <h1 className="lp-h1">Convites digitais que<br /><span>impressionam</span></h1>
        <p className="lp-sub">Cria convites personalizados para casamentos, aniversarios e festas. Partilha por WhatsApp, gere confirmacoes e surpreende os teus convidados.</p>
        <div className="lp-btns">
          <Link to="/registro"><button className="lp-btn-main">Comecar Gratis</button></Link>
          <Link to="/login"><button className="lp-btn-sec">Ja tenho conta</button></Link>
        </div>
        <div className="lp-stats">
          <div style={{textAlign:"center"}}><div className="lp-stat-num">100%</div><div className="lp-stat-lbl">Gratis</div></div>
          <div style={{textAlign:"center"}}><div className="lp-stat-num">RSVP</div><div className="lp-stat-lbl">Confirmacoes online</div></div>
          <div style={{textAlign:"center"}}><div className="lp-stat-num">Mobile</div><div className="lp-stat-lbl">Responsivo</div></div>
          <div style={{textAlign:"center"}}><div className="lp-stat-num">Rapido</div><div className="lp-stat-lbl">Partilha facil</div></div>
        </div>
      </div>

      <div className="lp-sec">
        <p className="lp-sec-lbl">O que inclui</p>
        <h2 className="lp-sec-title">Tudo para o teu evento</h2>
        <div className="lp-grid">
          {[
            {icon:"",title:"Convite personalizado",desc:"Design elegante com nome, data, hora e local. Adiciona fotos e musica."},
            {icon:"",title:"RSVP online",desc:"Os convidados confirmam presenca pelo link. Sem papel, sem telefonemas."},
            {icon:"",title:"Gestao em tempo real",desc:"Ve quem confirmou e estatisticas atualizadas ao segundo."},
            {icon:"",title:"Musica e videos",desc:"Adiciona musica especial ou video ao convite."},
            {icon:"",title:"Localizacao",desc:"Inclui o local com mapa integrado para os convidados."},
            {icon:"",title:"Partilha facil",desc:"Partilha por WhatsApp, Instagram ou email."},
          ].map((f,i)=>(
            <div key={i} className="lp-card">
              <div className="lp-card-icon">{f.icon}</div>
              <div className="lp-card-title">{f.title}</div>
              <div className="lp-card-desc">{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="lp-divider">
        <div style={{maxWidth:"700px",margin:"0 auto",textAlign:"center"}}>
          <p className="lp-sec-lbl">Tipos de eventos</p>
          <h2 className="lp-sec-title" style={{marginBottom:"32px"}}>Para qualquer ocasiao</h2>
          <div className="lp-tags">
            {[" Casamento"," Aniversario"," Batizado"," Formatura"," Festa"," Noivado"," Cha de Bebe"," Corporativo"," Festa Infantil"," Celebracao"].map((t,i)=>(
              <span key={i} className="lp-tag">{t}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="lp-sec">
        <p className="lp-sec-lbl">Como funciona</p>
        <h2 className="lp-sec-title">3 passos simples</h2>
        <div className="lp-grid">
          {[
            {num:"1",icon:"",title:"Cria o convite",desc:"Preenche os detalhes  nome, data, local e fotos."},
            {num:"2",icon:"",title:"Partilha o link",desc:"Envia por WhatsApp, email ou redes sociais."},
            {num:"3",icon:"",title:"Gere as confirmacoes",desc:"Acompanha quem confirmou em tempo real."},
          ].map((s,i)=>(
            <div key={i} className="lp-card" style={{textAlign:"center"}}>
              <div style={{width:"44px",height:"44px",borderRadius:"50%",background:"linear-gradient(135deg,#667eea,#764ba2)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px",fontSize:"18px",fontWeight:900,color:"white",boxShadow:"0 4px 15px rgba(102,126,234,0.4)"}}>{s.num}</div>
              <div className="lp-card-icon">{s.icon}</div>
              <div className="lp-card-title">{s.title}</div>
              <div className="lp-card-desc">{s.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="lp-cta">
        <h2 style={{fontSize:"clamp(26px,4vw,40px)",fontWeight:900,marginBottom:"14px"}}>Pronto para criar o teu convite?</h2>
        <p style={{color:"rgba(255,255,255,0.7)",fontSize:"16px",marginBottom:"36px"}}>Gratis, sem cartao de credito.</p>
        <Link to="/registro"><button className="lp-btn-main" style={{fontSize:"17px",padding:"16px 48px"}}>Criar Conta Gratis</button></Link>
      </div>

      <div className="lp-footer">2025 Convites Digitais</div>
    </div>
  );
}

export default LandingPage;