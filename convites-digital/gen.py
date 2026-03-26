
f = open("src/pages/ConvitePublico.js", "w", encoding="utf-8")
f.write("""import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useLocation } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { convitesAPI, confirmacoesAPI } from "../services/api";

const CSS = `@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=Inter:wght@300;400;500;600;700&display=swap');*{box-sizing:border-box;}body{overflow:hidden;}@keyframes fadeUp{from{opacity:0;transform:translateY(40px)}to{opacity:1;transform:translateY(0)}}@keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.06)}}@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}input::placeholder,textarea::placeholder{color:rgba(255,255,255,0.3);}input,textarea{font-family:'Inter',sans-serif;}`;

function Countdown({ dataEvento, horaEvento }) {
  const [t, setT] = useState({});
  useEffect(() => {
    const calc = () => {
      const alvo = new Date(dataEvento + "T" + (horaEvento || "00:00"));
      const d = alvo - new Date();
      if (d <= 0) { setT({ done: true }); return; }
      setT({ dias: Math.floor(d/86400000), horas: Math.floor((d%86400000)/3600000), min: Math.floor((d%3600000)/60000), seg: Math.floor((d%60000)/1000) });
    };
    calc(); const i = setInterval(calc, 1000); return () => clearInterval(i);
  }, [dataEvento, horaEvento]);
  if (t.done) return null;
  const U = ({ v, l }) => (
    <div style={{ textAlign:"center" }}>
      <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(36px,8vw,52px)", fontWeight:900, color:"white", lineHeight:1 }}>{String(v).padStart(2,"0")}</div>
      <div style={{ fontSize:"10px", color:"rgba(255,255,255,0.4)", letterSpacing:"2px", textTransform:"uppercase", marginTop:"6px" }}>{l}</div>
    </div>
  );
  const sep = <div style={{ fontSize:"28px", color:"rgba(255,255,255,0.2)", paddingBottom:"16px" }}>:</div>;
  return (
    <div style={{ textAlign:"center", padding:"32px 0" }}>
      <p style={{ color:"rgba(255,255,255,0.35)", fontSize:"10px", letterSpacing:"4px", textTransform:"uppercase", marginBottom:"20px" }}>Faltam</p>
      <div style={{ display:"inline-flex", alignItems:"flex-end", gap:"12px" }}>
        <U v={t.dias} l="Dias"/>{sep}<U v={t.horas} l="Horas"/>{sep}<U v={t.min} l="Min"/>{sep}<U v={t.seg} l="Seg"/>
      </div>
    </div>
  );
}

function MusicaPlayer({ url }) {
  const ref = useRef(); const [on, setOn] = useState(false); const [p, setP] = useState(0);
  useEffect(() => {
    const a = ref.current; if (!a) return;
    const u = () => setP((a.currentTime/a.duration)*100||0);
    a.addEventListener("timeupdate", u); a.addEventListener("ended", () => setOn(false));
    return () => a.removeEventListener("timeupdate", u);
  }, []);
  const tog = () => { const a = ref.current; if (on) { a.pause(); setOn(false); } else { a.play(); setOn(true); } };
  return (
    <div style={{ position:"fixed", bottom:"24px", right:"24px", zIndex:9999, display:"flex", alignItems:"center", gap:"12px", background:"rgba(5,5,15,0.92)", backdropFilter:"blur(20px)", borderRadius:"50px", padding:"10px 20px 10px 10px", border:"1px solid rgba(255,255,255,0.08)", boxShadow:"0 8px 32px rgba(0,0,0,0.5)" }}>
      <audio ref={ref} src={url} loop/>
      <button onClick={tog} style={{ width:"42px", height:"42px", borderRadius:"50%", background: on ? "linear-gradient(135deg,#f093fb,#f5576c)" : "linear-gradient(135deg,#667eea,#764ba2)", border:"none", cursor:"pointer", color:"white", fontSize:"15px", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
        {on ? "\\u23F8" : "\\u25B6"}
      </button>
      <div>
        <div style={{ color:"rgba(255,255,255,0.7)", fontSize:"11px", fontWeight:600, marginBottom:"4px" }}>{on ? "A tocar..." : "Musica"}</div>
        <div style={{ width:"80px", height:"2px", background:"rgba(255,255,255,0.1)", borderRadius:"1px" }}>
          <div style={{ width:p+"%", height:"100%", background:"linear-gradient(90deg,#667eea,#f5576c)", borderRadius:"1px", transition:"width 0.5s" }}/>
        </div>
      </div>
    </div>
  );
}

function Envelope({ nome, relacao, onAbrir }) {
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
}
""")
f.close()
print("Part1 OK")
