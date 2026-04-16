import { Link } from "react-router-dom";

function LandingPage() {
  return (
    <div style={{ fontFamily: "Inter,sans-serif", background: "#0a0a0f", minHeight: "100vh", color: "white", overflowX: "hidden" }}>
      <style>{`
        *{box-sizing:border-box;}
        .lp-nav{display:flex;justify-content:space-between;align-items:center;padding:18px 40px;border-bottom:1px solid rgba(255,255,255,0.06);position:sticky;top:0;background:rgba(10,10,15,0.92);backdrop-filter:blur(12px);z-index:100;}
        .lp-logo{font-weight:800;font-size:18px;background:linear-gradient(135deg,#818cf8,#f472b6);-webkit-background-clip:text;-webkit-text-fill-color:transparent;}
        .lp-nav-btns{display:flex;gap:10px;}
        .lp-btn-out{background:transparent;border:1.5px solid rgba(255,255,255,0.2);color:white;padding:9px 22px;border-radius:8px;cursor:pointer;font-size:14px;font-weight:600;font-family:inherit;}
        .lp-btn-pri{background:linear-gradient(135deg,#818cf8,#a78bfa);border:none;color:white;padding:9px 22px;border-radius:8px;cursor:pointer;font-size:14px;font-weight:700;font-family:inherit;}
        .lp-hero{text-align:center;padding:90px 24px 70px;max-width:760px;margin:0 auto;}
        .lp-badge{display:inline-block;background:rgba(129,140,248,0.12);border:1px solid rgba(129,140,248,0.25);color:#a5b4fc;padding:6px 16px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:28px;}
        .lp-h1{font-size:clamp(32px,6vw,60px);font-weight:900;line-height:1.1;margin-bottom:22px;letter-spacing:-1px;}
        .lp-h1 span{background:linear-gradient(135deg,#818cf8,#f472b6);-webkit-background-clip:text;-webkit-text-fill-color:transparent;}
        .lp-sub{font-size:clamp(15px,2.5vw,18px);color:rgba(255,255,255,0.6);line-height:1.7;margin-bottom:40px;max-width:520px;margin-left:auto;margin-right:auto;}
        .lp-btns{display:flex;gap:14px;justify-content:center;flex-wrap:wrap;margin-bottom:56px;}
        .lp-btn-main{background:linear-gradient(135deg,#818cf8,#a78bfa);border:none;color:white;padding:15px 40px;border-radius:12px;cursor:pointer;font-size:16px;font-weight:700;box-shadow:0 8px 32px rgba(129,140,248,0.35);font-family:inherit;}
        .lp-btn-sec{background:rgba(255,255,255,0.06);border:1.5px solid rgba(255,255,255,0.15);color:white;padding:15px 40px;border-radius:12px;cursor:pointer;font-size:16px;font-weight:600;font-family:inherit;}
        .lp-stats{display:flex;gap:40px;justify-content:center;flex-wrap:wrap;padding-top:40px;border-top:1px solid rgba(255,255,255,0.06);}
        .lp-stat-num{font-size:26px;font-weight:900;background:linear-gradient(135deg,#818cf8,#f472b6);-webkit-background-clip:text;-webkit-text-fill-color:transparent;}
        .lp-stat-lbl{font-size:12px;color:rgba(255,255,255,0.45);margin-top:4px;font-weight:500;}
        .lp-sec{padding:80px 24px;max-width:1040px;margin:0 auto;}
        .lp-sec-lbl{text-align:center;font-size:12px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:#818cf8;margin-bottom:14px;}
        .lp-sec-title{text-align:center;font-size:clamp(24px,4vw,36px);font-weight:800;margin-bottom:48px;}
        .lp-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:20px;}
        .lp-card{background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:16px;padding:28px 24px;}
        .lp-card-icon{font-size:28px;margin-bottom:14px;}
        .lp-card-title{font-size:16px;font-weight:700;margin-bottom:8px;}
        .lp-card-desc{font-size:14px;color:rgba(255,255,255,0.55);line-height:1.65;}
        .lp-tags{display:flex;flex-wrap:wrap;gap:10px;justify-content:center;}
        .lp-tag{background:rgba(129,140,248,0.1);border:1px solid rgba(129,140,248,0.2);color:#a5b4fc;padding:8px 18px;border-radius:20px;font-size:13px;font-weight:600;}
        .lp-cta{text-align:center;padding:80px 24px;border-top:1px solid rgba(255,255,255,0.05);}
        .lp-footer{text-align:center;padding:28px;border-top:1px solid rgba(255,255,255,0.05);color:rgba(255,255,255,0.3);font-size:13px;}
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
        <span className="lp-logo">Convites Digitais</span>
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
          <div style={{textAlign:"center"}}><div className="lp-stat-num">RSVP</div><div className="lp-stat-lbl">Confirmacoes</div></div>
          <div style={{textAlign:"center"}}><div className="lp-stat-num">Mobile</div><div className="lp-stat-lbl">Responsivo</div></div>
          <div style={{textAlign:"center"}}><div className="lp-stat-num">Rapido</div><div className="lp-stat-lbl">Partilha facil</div></div>
        </div>
      </div>
      <div className="lp-sec">
        <p className="lp-sec-lbl">O que inclui</p>
        <h2 className="lp-sec-title">Tudo para o teu evento</h2>
        <div className="lp-grid">
          {[
            {icon:"💌",title:"Convite personalizado",desc:"Design elegante com nome, data, hora e local. Adiciona fotos e musica."},
            {icon:"",title:"RSVP online",desc:"Os convidados confirmam presenca pelo link. Sem papel, sem telefonemas."},
            {icon:"",title:"Gestao em tempo real",desc:"Ve quem confirmou e estatisticas atualizadas ao segundo."},
            {icon:"",title:"Musica e videos",desc:"Adiciona musica especial ou video ao convite."},
            {icon:"",title:"Localizacao",desc:"Inclui o local com mapa integrado."},
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
      <div style={{padding:"60px 24px",borderTop:"1px solid rgba(255,255,255,0.05)"}}>
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
              <div style={{width:"44px",height:"44px",borderRadius:"50%",background:"linear-gradient(135deg,#818cf8,#a78bfa)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px",fontSize:"18px",fontWeight:900,color:"white"}}>{s.num}</div>
              <div className="lp-card-icon">{s.icon}</div>
              <div className="lp-card-title">{s.title}</div>
              <div className="lp-card-desc">{s.desc}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="lp-cta">
        <h2 style={{fontSize:"clamp(26px,4vw,40px)",fontWeight:900,marginBottom:"14px"}}>Pronto para criar o teu convite?</h2>
        <p style={{color:"rgba(255,255,255,0.55)",fontSize:"16px",marginBottom:"36px"}}>Gratis, sem cartao de credito.</p>
        <Link to="/registro"><button className="lp-btn-main" style={{fontSize:"17px",padding:"16px 48px"}}>Criar Conta Gratis</button></Link>
      </div>
      <div className="lp-footer">2025 Convites Digitais</div>
    </div>
  );
}

export default LandingPage;