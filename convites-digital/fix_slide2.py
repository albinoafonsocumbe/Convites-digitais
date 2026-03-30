import os
path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "src", "pages", "ConvitePublico.js")
c = open(path, encoding="utf-8").read()
lines = c.split("\n")

# SlideCountdown esta nas linhas 149-201 (indices 148-200)
# encontrar inicio e fim
start = next(i for i,l in enumerate(lines) if "function SlideCountdown(" in l)
end = start
depth = 0
for i in range(start, len(lines)):
    depth += lines[i].count("{") - lines[i].count("}")
    if i > start and depth <= 0:
        end = i
        break

novo = """function SlideCountdown({ evento, ROSA, PINK }) {
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
}"""

new_lines = lines[:start] + novo.split("\n") + lines[end+1:]
open(path, "w", encoding="utf-8").write("\n".join(new_lines))
print("OK", len(new_lines), "linhas")
