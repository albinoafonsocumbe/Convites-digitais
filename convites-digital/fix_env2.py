c = open("src/pages/ConvitePublico.js", encoding="utf-8").read()

# Encontrar e substituir a funcao Envelope completa
start = c.find("function Envelope(")
# Encontrar o fim da funcao (proxima funcao no nivel raiz)
end = c.find("\nfunction ConviteSlides(")

old_env = c[start:end]

new_env = """function Envelope({ nome, relacao, nomeEvento, dataEvento, horaEvento, localEvento, onAbrir }) {
  const [abrindo, setAbrindo] = useState(false);
  const abrir = () => { if (abrindo) return; setAbrindo(true); setTimeout(onAbrir, 800); };
  const partes = nomeEvento ? nomeEvento.split(/[&]/).map(s => s.trim()).filter(Boolean) : [nomeEvento];

  const dataFmt = dataEvento ? new Date(dataEvento).toLocaleDateString("pt-PT", { weekday:"long", day:"numeric", month:"long", year:"numeric" }) : "";
  const diaSemana = dataEvento ? new Date(dataEvento).toLocaleDateString("pt-PT", { weekday:"long" }).toUpperCase() : "";

  return (
    <div style={{ minHeight:"100vh", background:"#faf7f4", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Inter',sans-serif", overflow:"hidden", position:"relative" }}>
      <style>{CSS + "@keyframes rodar{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}@keyframes aparecer{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}"}</style>

      {/* Borda decorativa dupla */}
      <div style={{ position:"absolute", inset:"16px", border:"1px solid #d4c5b5", pointerEvents:"none", zIndex:0 }}/>
      <div style={{ position:"absolute", inset:"22px", border:"1px solid #e8ddd4", pointerEvents:"none", zIndex:0 }}/>

      {/* Cantos florais/decorativos */}
      {[[0,0,"0","0"],[0,0,"0","auto"],[0,0,"auto","0"],[0,0,"auto","auto"]].map((_,i) => {
        const tops = ["12px","12px","auto","auto"];
        const bots = ["auto","auto","12px","12px"];
        const lefts = ["12px","auto","12px","auto"];
        const rights = ["auto","12px","auto","12px"];
        const bt = ["border-top","border-top","border-bottom","border-bottom"];
        const bl = ["border-left","border-right","border-left","border-right"];
        return (
          <div key={i} style={{ position:"absolute", top:tops[i], bottom:bots[i], left:lefts[i], right:rights[i], width:"40px", height:"40px", borderTop: i<2 ? "2px solid #b8a898" : undefined, borderBottom: i>=2 ? "2px solid #b8a898" : undefined, borderLeft: i%2===0 ? "2px solid #b8a898" : undefined, borderRight: i%2===1 ? "2px solid #b8a898" : undefined, zIndex:1 }}/>
        );
      })}

      {/* Bolinhas laterais rosas */}
      <div style={{ position:"absolute", left:"8px", top:"50%", transform:"translateY(-50%)", display:"flex", flexDirection:"column", gap:"8px", zIndex:1 }}>
        {[0.25,0.45,0.65,0.45,0.25,0.15].map((o,i) => <div key={i} style={{ width:"9px", height:"9px", borderRadius:"50%", background:"#e8b4b8", opacity:o }}/>)}
      </div>
      <div style={{ position:"absolute", right:"8px", top:"50%", transform:"translateY(-50%)", display:"flex", flexDirection:"column", gap:"8px", zIndex:1 }}>
        {[0.25,0.45,0.65,0.45,0.25,0.15].map((o,i) => <div key={i} style={{ width:"9px", height:"9px", borderRadius:"50%", background:"#e8b4b8", opacity:o }}/>)}
      </div>

      <div style={{ textAlign:"center", maxWidth:"360px", width:"100%", padding:"48px 32px", animation:"aparecer 0.8s ease", position:"relative", zIndex:2 }}>

        {/* Estrela decorativa */}
        <div style={{ color:"#8a9bb0", fontSize:"16px", marginBottom:"12px", opacity:0.5 }}>✦</div>

        {/* Nome do convidado */}
        {nome && (
          <div style={{ marginBottom:"18px" }}>
            <p style={{ color:"#8a9bb0", fontSize:"10px", fontWeight:700, letterSpacing:"3px", textTransform:"uppercase", marginBottom:"8px" }}>
              {relacao ? relacao.toUpperCase() + " DE HONRA" : "CONVIDADO DE HONRA"}
            </p>
            <h2 style={{ fontFamily:"'Playfair Display',serif", color:"#1a2332", fontSize:"clamp(20px,5vw,30px)", fontWeight:700, fontStyle:"italic", margin:0 }}>
              {relacao ? relacao + " " + nome : nome}
            </h2>
          </div>
        )}

        {/* Badges data e local */}
        <div style={{ display:"flex", gap:"8px", justifyContent:"center", marginBottom:"22px", flexWrap:"wrap" }}>
          {diaSemana && (
            <div style={{ display:"flex", alignItems:"center", gap:"5px", background:"white", borderRadius:"20px", padding:"5px 12px", border:"1px solid #e8e0d8", fontSize:"11px", fontWeight:600, color:"#4a5568", letterSpacing:"1px" }}>
              <span>&#128197;</span> {diaSemana}
            </div>
          )}
          {localEvento && (
            <div style={{ display:"flex", alignItems:"center", gap:"5px", background:"white", borderRadius:"20px", padding:"5px 12px", border:"1px solid #e8e0d8", fontSize:"11px", fontWeight:600, color:"#4a5568", letterSpacing:"1px", maxWidth:"160px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
              <span>&#128205;</span> {localEvento.toUpperCase()}
            </div>
          )}
        </div>

        {/* Data completa */}
        {dataFmt && (
          <p style={{ color:"#8a9bb0", fontSize:"12px", letterSpacing:"1px", marginBottom:"20px" }}>{dataFmt}{horaEvento ? " · " + horaEvento : ""}</p>
        )}

        {/* Linha divisoria */}
        <div style={{ width:"48px", height:"1px", background:"#d4c5b5", margin:"0 auto 24px" }}/>

        {/* Nome do evento grande */}
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

        {/* Botao circular com texto rotativo */}
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
"""

c_novo = c[:start] + new_env + c[end:]
open("src/pages/ConvitePublico.js", "w", encoding="utf-8").write(c_novo)
print("OK tamanho:", len(c_novo))
