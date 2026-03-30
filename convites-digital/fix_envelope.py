import os
path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "src", "pages", "ConvitePublico.js")
c = open(path, encoding="utf-8").read()
lines = c.split("\n")

# Envelope esta nas linhas 39-85 (indices 38-84)
novo_envelope = r"""function Envelope({ nome, relacao, nomeEvento, dataEvento, horaEvento, localEvento, onAbrir }) {
  const [abrindo, setAbrindo] = useState(false);
  const abrir = () => { if(abrindo) return; setAbrindo(true); setTimeout(onAbrir, 1000); };
  const partes = nomeEvento ? nomeEvento.split(/[&]/).map(s=>s.trim()).filter(Boolean) : [nomeEvento];
  const dataFmt = dataEvento ? new Date(dataEvento).toLocaleDateString("pt-PT",{weekday:"long",day:"numeric",month:"long",year:"numeric"}) : "";
  const diaSemana = dataEvento ? new Date(dataEvento).toLocaleDateString("pt-PT",{weekday:"long"}) : "";
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

        {/* Nome do convidado */}
        {nome && (
          <div style={{marginBottom:"20px",animation:"aparecer 1s ease"}}>
            <p style={{color:"rgba(201,169,110,0.7)",fontSize:"9px",fontWeight:700,letterSpacing:"4px",textTransform:"uppercase",marginBottom:"6px"}}>{relacao ? relacao.toUpperCase()+" DE HONRA" : "CONVIDADO ESPECIAL"}</p>
            <h2 style={{fontFamily:"'Playfair Display',serif",color:"white",fontSize:"clamp(22px,5vw,32px)",fontWeight:700,fontStyle:"italic",margin:0,textShadow:"0 2px 12px rgba(0,0,0,0.5)"}}>{relacao ? relacao+" "+nome : nome}</h2>
          </div>
        )}

        {/* Linha dourada */}
        <div style={{display:"flex",alignItems:"center",gap:"12px",marginBottom:"24px",justifyContent:"center"}}>
          <div style={{flex:1,height:"1px",background:"linear-gradient(to right,transparent,rgba(201,169,110,0.5))"}}/>
          <div style={{width:"6px",height:"6px",borderRadius:"50%",background:"#c9a96e"}}/>
          <div style={{flex:1,height:"1px",background:"linear-gradient(to left,transparent,rgba(201,169,110,0.5))"}}/>
        </div>

        {/* Nome do evento - destaque */}
        <div style={{marginBottom:"20px"}}>
          <p style={{color:"rgba(255,255,255,0.4)",fontSize:"9px",letterSpacing:"4px",textTransform:"uppercase",marginBottom:"10px"}}>Convite para</p>
          {partes.length>=2 ? (
            <div>
              <h1 style={{fontFamily:"'Playfair Display',serif",color:"white",fontSize:"clamp(36px,9vw,60px)",fontWeight:900,fontStyle:"italic",lineHeight:1,margin:"0 0 0px",textShadow:"0 4px 20px rgba(0,0,0,0.4)"}}>{partes[0]}</h1>
              <p style={{fontFamily:"'Playfair Display',serif",color:"#c9a96e",fontSize:"clamp(20px,5vw,32px)",fontStyle:"italic",margin:"0",lineHeight:1.2}}>&amp;</p>
              <h1 style={{fontFamily:"'Playfair Display',serif",color:"white",fontSize:"clamp(36px,9vw,60px)",fontWeight:900,fontStyle:"italic",lineHeight:1,margin:0,textShadow:"0 4px 20px rgba(0,0,0,0.4)"}}>{partes[1]}</h1>
            </div>
          ) : (
            <h1 style={{fontFamily:"'Playfair Display',serif",color:"white",fontSize:"clamp(28px,7vw,48px)",fontWeight:900,fontStyle:"italic",lineHeight:1.1,textShadow:"0 4px 20px rgba(0,0,0,0.4)"}}>{nomeEvento}</h1>
          )}
        </div>

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
}"""

# substituir linhas 38-84 (indices)
new_lines = lines[:38] + novo_envelope.split("\n") + lines[85:]
open(path, "w", encoding="utf-8").write("\n".join(new_lines))
print("OK", len("\n".join(new_lines)), "bytes")
