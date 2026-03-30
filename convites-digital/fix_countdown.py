import os
path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "src", "pages", "ConvitePublico.js")
c = open(path, encoding="utf-8").read()
lines = c.split("\n")

# 1. Substituir o bloco countdown (linhas 203-213, indices 202-212) por chamada ao componente
novo_countdown_call = [
    '    if(tipo==="countdown"){',
    '      return <SlideCountdown key={i} evento={evento} ROSA={ROSA} PINK={PINK}/>;',
    '    }',
]
new_lines = lines[:202] + novo_countdown_call + lines[214:]

# 2. Adicionar o componente SlideCountdown antes de "/* SLIDES */"
componente = """function SlideCountdown({ evento, ROSA, PINK }) {
  const [t, setT] = useState({ dias:0, horas:0, mins:0, segs:0 });
  useEffect(() => {
    const calc = () => {
      const alvo = new Date(evento.data_evento + "T" + (evento.hora_evento || "00:00"));
      const d = alvo - new Date();
      if (d <= 0) { setT({ dias:0, horas:0, mins:0, segs:0 }); return; }
      setT({
        dias:  Math.floor(d / 86400000),
        horas: Math.floor((d % 86400000) / 3600000),
        mins:  Math.floor((d % 3600000) / 60000),
        segs:  Math.floor((d % 60000) / 1000),
      });
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

  return (
    <div style={{ width:"100%", height:"100%", display:"flex", flexDirection:"column", overflow:"hidden" }}>
      <div style={{ flex:"0 0 55%", position:"relative", overflow:"hidden" }}>
        {evento.foto_capa
          ? <img src={evento.foto_capa} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
          : <div style={{ width:"100%", height:"100%", background:"linear-gradient(135deg,#e8c4c4,#f0d0d0)" }}/>
        }
      </div>
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

"""

# Inserir antes de "/* SLIDES */"
idx = next(i for i,l in enumerate(new_lines) if "/* SLIDES */" in l)
new_lines = new_lines[:idx] + componente.split("\n") + new_lines[idx:]

open(path, "w", encoding="utf-8").write("\n".join(new_lines))
print("OK", len("\n".join(new_lines)), "bytes")
