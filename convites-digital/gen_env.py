f = open("src/pages/ConvitePublico.js", "a", encoding="utf-8")
f.write("""
function Envelope({ nome, relacao, nomeEvento, onAbrir }) {
  const [abrindo, setAbrindo] = useState(false);
  const abrir = () => { if (abrindo) return; setAbrindo(true); setTimeout(onAbrir, 800); };
  const partes = nomeEvento ? nomeEvento.split(/[&]/i).map(s => s.trim()).filter(Boolean) : [nomeEvento];

  return (
    <div style={{ minHeight:"100vh", background:"#f5f0eb", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Inter',sans-serif", overflow:"hidden", position:"relative" }}>
      <style>{CSS + "@keyframes rodar{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}"}</style>

      {/* Cantos decorativos */}
      <div style={{ position:"absolute", top:"20px", left:"20px", width:"28px", height:"28px", borderTop:"2px solid #c9b8a8", borderLeft:"2px solid #c9b8a8", opacity:0.6 }}/>
      <div style={{ position:"absolute", top:"20px", right:"20px", width:"28px", height:"28px", borderTop:"2px solid #c9b8a8", borderRight:"2px solid #c9b8a8", opacity:0.6 }}/>
      <div style={{ position:"absolute", bottom:"20px", left:"20px", width:"28px", height:"28px", borderBottom:"2px solid #c9b8a8", borderLeft:"2px solid #c9b8a8", opacity:0.6 }}/>
      <div style={{ position:"absolute", bottom:"20px", right:"20px", width:"28px", height:"28px", borderBottom:"2px solid #c9b8a8", borderRight:"2px solid #c9b8a8", opacity:0.6 }}/>

      {/* Bolinhas laterais */}
      <div style={{ position:"absolute", left:"14px", top:"50%", transform:"translateY(-50%)", display:"flex", flexDirection:"column", gap:"10px" }}>
        {[0.3,0.5,0.7,0.5,0.3,0.2].map((o,i) => <div key={i} style={{ width:"10px", height:"10px", borderRadius:"50%", background:"#e8b4b8", opacity:o }}/>)}
      </div>
      <div style={{ position:"absolute", right:"14px", top:"50%", transform:"translateY(-50%)", display:"flex", flexDirection:"column", gap:"10px" }}>
        {[0.3,0.5,0.7,0.5,0.3,0.2].map((o,i) => <div key={i} style={{ width:"10px", height:"10px", borderRadius:"50%", background:"#e8b4b8", opacity:o }}/>)}
      </div>

      <div style={{ textAlign:"center", maxWidth:"380px", width:"100%", padding:"40px 24px", animation:"aparecer 0.8s ease" }}>

        {/* Estrela */}
        <div style={{ fontSize:"18px", marginBottom:"14px", opacity:0.4, color:"#8a9bb0" }}>✦</div>

        {/* Nome do convidado */}
        {nome && (
          <div style={{ marginBottom:"20px" }}>
            <p style={{ color:"#8a9bb0", fontSize:"10px", fontWeight:700, letterSpacing:"3px", textTransform:"uppercase", marginBottom:"8px" }}>
              {relacao ? relacao.toUpperCase() + " DE HONRA" : "CONVIDADO DE HONRA"}
            </p>
            <h2 style={{ fontFamily:"'Playfair Display',serif", color:"#1a2332", fontSize:"clamp(22px,5vw,32px)", fontWeight:700, fontStyle:"italic", margin:0 }}>
              {relacao ? relacao + " " + nome : nome}
            </h2>
          </div>
        )}

        {/* Badges */}
        {nome && (
          <div style={{ display:"flex", gap:"8px", justifyContent:"center", marginBottom:"24px" }}>
            <div style={{ display:"flex", alignItems:"center", gap:"5px", background:"white", borderRadius:"20px", padding:"5px 12px", border:"1px solid #e8e0d8", fontSize:"11px", fontWeight:600, color:"#4a5568", letterSpacing:"1px" }}>
              <span style={{ fontSize:"12px" }}>&#128197;</span> DOMINGO
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:"5px", background:"white", borderRadius:"20px", padding:"5px 12px", border:"1px solid #e8e0d8", fontSize:"11px", fontWeight:600, color:"#4a5568", letterSpacing:"1px" }}>
              <span style={{ fontSize:"12px" }}>&#128205;</span> MESA 1
            </div>
          </div>
        )}

        {/* Linha */}
        <div style={{ width:"50px", height:"1px", background:"#d4c5b5", margin:"0 auto 28px" }}/>

        {/* Nome do evento */}
        <div style={{ marginBottom:"44px" }}>
          {partes.length >= 2 ? (
            <>
              <h1 style={{ fontFamily:"'Playfair Display',serif", color:"#1a2332", fontSize:"clamp(44px,12vw,72px)", fontWeight:900, lineHeight:1, margin:"0 0 2px" }}>{partes[0]}</h1>
              <p style={{ fontFamily:"'Playfair Display',serif", color:"#8a9bb0", fontSize:"clamp(24px,6vw,40px)", fontStyle:"italic", margin:"0 0 2px", lineHeight:1.2 }}>&amp;</p>
              <h1 style={{ fontFamily:"'Playfair Display',serif", color:"#1a2332", fontSize:"clamp(44px,12vw,72px)", fontWeight:900, lineHeight:1, margin:0 }}>{partes[1]}</h1>
            </>
          ) : (
            <h1 style={{ fontFamily:"'Playfair Display',serif", color:"#1a2332", fontSize:"clamp(32px,8vw,56px)", fontWeight:900, lineHeight:1.1 }}>{nomeEvento}</h1>
          )}
        </div>

        {/* Botao circular */}
        <div onClick={abrir} style={{ position:"relative", width:"96px", height:"96px", margin:"0 auto", cursor: abrindo ? "wait" : "pointer", transition:"transform 0.2s" }}
          onMouseEnter={e => e.currentTarget.style.transform = "scale(1.05)"}
          onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>
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
""")
f.close()
print("Envelope OK")
