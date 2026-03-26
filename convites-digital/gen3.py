f = open("src/pages/ConvitePublico.js", "r", encoding="utf-8")
content = f.read()
f.close()

old = '''function Envelope({ nome, relacao, onAbrir }) {
  const [abrindo, setAbrindo] = useState(false);
  const abrir = () => { if (abrindo) return; setAbrindo(true); setTimeout(onAbrir, 1400); };
  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(160deg,#1a0a2e 0%,#0d1a2e 100%)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"24px", fontFamily:"'Inter',sans-serif", overflow:"hidden" }}>
      <style>{CSS}</style>
      <div style={{ position:"fixed", inset:0, overflow:"hidden", pointerEvents:"none" }}>
        {[...Array(30)].map((_,i) => (
          <div key={i} style={{ position:"absolute", width:((i*7)%3+1)+"px", height:((i*7)%3+1)+"px", background:"white", borderRadius:"50%", top:((i*37)%100)+"%", left:((i*53)%100)+"%", opacity:((i*13)%6)*0.1+0.1, animation:"pulse "+(2+(i%3))+"s infinite" }}/>
        ))}
      </div>
      <div style={{ position:"relative", zIndex:1, textAlign:"center", maxWidth:"480px", width:"100%" }}>
        {nome && (
          <div style={{ marginBottom:"36px", animation:"fadeUp 0.8s ease" }}>
            <p style={{ color:"rgba(255,255,255,0.4)", fontSize:"11px", letterSpacing:"4px", textTransform:"uppercase", marginBottom:"10px" }}>Para</p>
            <h2 style={{ fontFamily:"'Playfair Display',serif", color:"white", fontSize:"clamp(26px,5vw,40px)", fontWeight:700, fontStyle:"italic" }}>
              {relacao ? relacao+" " : ""}{nome}
            </h2>
          </div>
        )}
        <div style={{ animation:"float 3s ease-in-out infinite", marginBottom:"40px", cursor:"pointer" }} onClick={abrir}>
          <div style={{ position:"relative", width:"240px", height:"170px", margin:"0 auto" }}>
            <div style={{ position:"absolute", inset:0, background:"linear-gradient(135deg,#c9a96e,#e8c97a)", borderRadius:"14px", boxShadow:"0 24px 64px rgba(201,169,110,0.35)" }}/>
            <div style={{ position:"absolute", bottom:0, left:0, right:0, height:"85px", background:"linear-gradient(135deg,#b8935a,#d4b86a)", borderRadius:"0 0 14px 14px", clipPath:"polygon(0 100%,50% 0,100% 100%)" }}/>
            <div style={{ position:"absolute", top:0, left:0, right:0, height:"85px", background:"linear-gradient(135deg,#d4b86a,#f0d080)", borderRadius:"14px 14px 0 0", clipPath:"polygon(0 0,50% 100%,100% 0)", transformOrigin:"top center", transition:"transform 1s cubic-bezier(0.4,0,0.2,1)", transform: abrindo ? "rotateX(-180deg)" : "rotateX(0deg)" }}/>
            <div style={{ position:"absolute", inset:"14px", border:"1px solid rgba(255,255,255,0.25)", borderRadius:"8px", pointerEvents:"none" }}/>
            <div style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", width:"48px", height:"48px", borderRadius:"50%", background:"linear-gradient(135deg,#c0392b,#e74c3c)", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 4px 16px rgba(192,57,43,0.5)", fontSize:"20px", zIndex:2 }}>
              \U0001F48C
            </div>
          </div>
        </div>
        <div style={{ animation:"fadeUp 0.8s ease 0.4s both" }}>
          <button onClick={abrir} disabled={abrindo} style={{ background:"linear-gradient(135deg,#c9a96e,#e8c97a)", border:"none", borderRadius:"50px", padding:"16px 52px", color:"#1a0a2e", fontFamily:"'Playfair Display',serif", fontSize:"17px", fontWeight:700, cursor: abrindo ? "wait" : "pointer", boxShadow:"0 8px 32px rgba(201,169,110,0.4)" }}>
            {abrindo ? "A abrir..." : "Abrir Convite \u2728"}
          </button>
          <p style={{ color:"rgba(255,255,255,0.25)", fontSize:"12px", marginTop:"14px", letterSpacing:"1px" }}>Toca para abrir</p>
        </div>
      </div>
    </div>
  );
}'''

new = '''function Envelope({ nome, relacao, nomeEvento, onAbrir }) {
  const [abrindo, setAbrindo] = useState(false);
  const abrir = () => { if (abrindo) return; setAbrindo(true); setTimeout(onAbrir, 800); };

  // Divide o nome do evento para mostrar em estilo "Ana & Joao"
  const partes = nomeEvento ? nomeEvento.split(/[&e]/i).map(s => s.trim()).filter(Boolean) : [nomeEvento];

  return (
    <div style={{ minHeight:"100vh", background:"#f5f0eb", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Inter',sans-serif", overflow:"hidden", position:"relative" }}>
      <style>{CSS + `
        @keyframes rodar { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes aparecer { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        .env-btn:hover { transform: scale(1.05); }
        .env-btn { transition: transform 0.2s; }
      `}</style>

      {/* Cantos decorativos */}
      {[["0","0","border-top","border-left"],["0","auto","border-top","border-right"],["auto","0","border-bottom","border-left"],["auto","auto","border-bottom","border-right"]].map(([t,r,b1,b2],i) => (
        <div key={i} style={{ position:"absolute", top:t!=="auto"?"20px":undefined, bottom:t==="auto"?"20px":undefined, left:r!=="auto"?"20px":undefined, right:r==="auto"?"20px":undefined, width:"32px", height:"32px", borderTop: b1==="border-top"?"2px solid #c9b8a8":undefined, borderBottom: b1==="border-bottom"?"2px solid #c9b8a8":undefined, borderLeft: b2==="border-left"?"2px solid #c9b8a8":undefined, borderRight: b2==="border-right"?"2px solid #c9b8a8":undefined, opacity:0.6 }}/>
      ))}

      {/* Bolinhas decorativas laterais */}
      <div style={{ position:"absolute", left:"16px", top:"50%", transform:"translateY(-50%)", display:"flex", flexDirection:"column", gap:"10px" }}>
        {[...Array(6)].map((_,i) => <div key={i} style={{ width:"10px", height:"10px", borderRadius:"50%", background:"#e8b4b8", opacity: 0.4+(i%3)*0.2 }}/>)}
      </div>
      <div style={{ position:"absolute", right:"16px", top:"50%", transform:"translateY(-50%)", display:"flex", flexDirection:"column", gap:"10px" }}>
        {[...Array(6)].map((_,i) => <div key={i} style={{ width:"10px", height:"10px", borderRadius:"50%", background:"#e8b4b8", opacity: 0.4+(i%3)*0.2 }}/>)}
      </div>

      <div style={{ textAlign:"center", maxWidth:"400px", width:"100%", padding:"40px 24px", animation:"aparecer 0.8s ease" }}>

        {/* Icone estrela */}
        <div style={{ fontSize:"20px", marginBottom:"16px", opacity:0.5 }}>✦</div>

        {/* Nome do convidado */}
        {nome && (
          <div style={{ marginBottom:"24px" }}>
            <p style={{ color:"#8a9bb0", fontSize:"11px", fontWeight:600, letterSpacing:"3px", textTransform:"uppercase", marginBottom:"8px" }}>
              {relacao ? relacao.toUpperCase() + " DE HONRA" : "CONVIDADO DE HONRA"}
            </p>
            <h2 style={{ fontFamily:"'Playfair Display',serif", color:"#1a2332", fontSize:"clamp(24px,5vw,36px)", fontWeight:700, fontStyle:"italic", margin:0 }}>
              {relacao ? relacao+" "+nome : nome}
            </h2>
          </div>
        )}

        {/* Badges dia/mesa */}
        {nome && (
          <div style={{ display:"flex", gap:"10px", justifyContent:"center", marginBottom:"28px" }}>
            <div style={{ display:"flex", alignItems:"center", gap:"6px", background:"white", borderRadius:"20px", padding:"6px 14px", border:"1px solid #e8e0d8", fontSize:"12px", fontWeight:600, color:"#4a5568", letterSpacing:"1px" }}>
              <span>&#128197;</span> DOMINGO
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:"6px", background:"white", borderRadius:"20px", padding:"6px 14px", border:"1px solid #e8e0d8", fontSize:"12px", fontWeight:600, color:"#4a5568", letterSpacing:"1px" }}>
              <span>&#128205;</span> MESA 1
            </div>
          </div>
        )}

        {/* Linha divisoria */}
        <div style={{ width:"60px", height:"1px", background:"#d4c5b5", margin:"0 auto 32px" }}/>

        {/* Nome do evento grande */}
        <div style={{ marginBottom:"48px" }}>
          {partes.length >= 2 ? (
            <>
              <h1 style={{ fontFamily:"'Playfair Display',serif", color:"#1a2332", fontSize:"clamp(48px,12vw,80px)", fontWeight:900, lineHeight:1, margin:"0 0 4px" }}>{partes[0]}</h1>
              <p style={{ fontFamily:"'Playfair Display',serif", color:"#8a9bb0", fontSize:"clamp(28px,6vw,44px)", fontStyle:"italic", margin:"0 0 4px" }}>&amp;</p>
              <h1 style={{ fontFamily:"'Playfair Display',serif", color:"#1a2332", fontSize:"clamp(48px,12vw,80px)", fontWeight:900, lineHeight:1, margin:0 }}>{partes[1]}</h1>
            </>
          ) : (
            <h1 style={{ fontFamily:"'Playfair Display',serif", color:"#1a2332", fontSize:"clamp(36px,8vw,60px)", fontWeight:900, lineHeight:1.1 }}>{nomeEvento}</h1>
          )}
        </div>

        {/* Botao circular com texto rotativo */}
        <div className="env-btn" onClick={abrir} style={{ position:"relative", width:"100px", height:"100px", margin:"0 auto", cursor: abrindo ? "wait" : "pointer" }}>
          {/* Texto circular */}
          <svg viewBox="0 0 100 100" style={{ position:"absolute", inset:0, width:"100%", height:"100%", animation:"rodar 8s linear infinite" }}>
            <defs>
              <path id="circle" d="M 50,50 m -35,0 a 35,35 0 1,1 70,0 a 35,35 0 1,1 -70,0"/>
            </defs>
            <text style={{ fontSize:"10.5px", fill:"white", fontWeight:600, letterSpacing:"2.5px" }}>
              <textPath href="#circle">CLIQUE PARA ABRIR • CLIQUE PARA ABRIR •</textPath>
            </text>
          </svg>
          {/* Circulo fundo */}
          <div style={{ position:"absolute", inset:"8px", borderRadius:"50%", background:"linear-gradient(135deg,#8b2635,#c0392b)", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 8px 24px rgba(139,38,53,0.4)" }}>
            {/* Icone envelope */}
            <svg width="32" height="24" viewBox="0 0 32 24" fill="none">
              <rect x="1" y="1" width="30" height="22" rx="3" stroke="white" strokeWidth="1.5"/>
              <path d="M1 4l15 10L31 4" stroke="white" strokeWidth="1.5"/>
            </svg>
          </div>
        </div>

        {abrindo && <p style={{ color:"#8a9bb0", fontSize:"12px", marginTop:"16px", letterSpacing:"1px" }}>A abrir...</p>}
      </div>
    </div>
  );
}'''

content = content.replace(old, new)
f = open("src/pages/ConvitePublico.js", "w", encoding="utf-8")
f.write(content)
f.close()
print("OK" if new[:30] in content else "FAIL - not replaced")
