c = open("src/pages/ConvitePublico.js", encoding="utf-8").read()

old = """    if (tipo==="mapa") return (
      <div key={i} style={sBase}><div style={{ width:"100%", maxWidth:"700px" }}>{secTit("Localizacao")}<h2 style={h2S}>{evento.local_evento}</h2>
        <div style={{ borderRadius:"16px", overflow:"hidden", boxShadow:"0 8px 32px rgba(0,0,0,0.4)" }}>
          <iframe title="mapa" src={"https://maps.google.com/maps?q="+encodeURIComponent(evento.endereco_maps)+"&output=embed"} width="100%" height="300" style={{ border:"none", display:"block" }} loading="lazy"/>
        </div>
        <a href={"https://maps.google.com/?q="+encodeURIComponent(evento.endereco_maps)} target="_blank" rel="noreferrer" style={{ display:"block", textAlign:"center", marginTop:"14px", color:"#c9a96e", fontSize:"14px", fontWeight:600, textDecoration:"none" }}>Abrir no Google Maps</a>
      </div></div>
    );"""

new = """    if (tipo==="mapa") {
      const apiKey = process.env.REACT_APP_GOOGLE_MAPS_KEY || "";
      const mapaUrl = apiKey
        ? "https://www.google.com/maps/embed/v1/place?key="+apiKey+"&q="+encodeURIComponent(evento.endereco_maps)+"&zoom=15&language=pt"
        : "https://maps.google.com/maps?q="+encodeURIComponent(evento.endereco_maps)+"&output=embed";
      return (
        <div key={i} style={sBase}>
          <div style={{ width:"100%", maxWidth:"700px" }}>
            {secTit("Localizacao")}
            <h2 style={h2S}>{evento.local_evento}</h2>
            {evento.endereco_maps && (
              <p style={{ color:"rgba(255,255,255,0.45)", fontSize:"13px", textAlign:"center", marginBottom:"20px", marginTop:"-16px" }}>{evento.endereco_maps}</p>
            )}
            <div style={{ borderRadius:"16px", overflow:"hidden", boxShadow:"0 8px 32px rgba(0,0,0,0.5)", border:"1px solid rgba(255,255,255,0.08)" }}>
              <iframe
                title="mapa"
                src={mapaUrl}
                width="100%"
                height="340"
                style={{ border:"none", display:"block" }}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <a href={"https://maps.google.com/?q="+encodeURIComponent(evento.endereco_maps)} target="_blank" rel="noreferrer"
              style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:"8px", marginTop:"16px", color:"#c9a96e", fontSize:"14px", fontWeight:600, textDecoration:"none" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c9a96e" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              Abrir no Google Maps
            </a>
          </div>
        </div>
      );
    }"""

c2 = c.replace(old, new)
open("src/pages/ConvitePublico.js", "w", encoding="utf-8").write(c2)
print("OK" if new[:40] in c2 else "FAIL - nao substituido")
