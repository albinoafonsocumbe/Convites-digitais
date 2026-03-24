import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { convitesAPI, confirmacoesAPI } from "../services/api";

function MusicaPlayer({ url }) {
  const audioRef = useRef(null);
  const [tocando, setTocando] = useState(false);
  const [progresso, setProgresso] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const atualizar = () => setProgresso((audio.currentTime / audio.duration) * 100 || 0);
    audio.addEventListener("timeupdate", atualizar);
    audio.addEventListener("ended", () => setTocando(false));
    return () => { audio.removeEventListener("timeupdate", atualizar); };
  }, []);

  const toggle = () => {
    const audio = audioRef.current;
    if (tocando) { audio.pause(); setTocando(false); }
    else { audio.play(); setTocando(true); }
  };

  return (
    <div style={{
      position: "fixed", bottom: "24px", right: "24px", zIndex: 1000,
      display: "flex", alignItems: "center", gap: "12px",
      background: "rgba(20,20,40,0.92)", backdropFilter: "blur(12px)",
      borderRadius: "50px", padding: "10px 18px 10px 10px",
      boxShadow: "0 8px 32px rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.1)"
    }}>
      <audio ref={audioRef} src={url} loop />
      <button onClick={toggle} style={{
        width: "44px", height: "44px", borderRadius: "50%",
        background: tocando ? "linear-gradient(135deg,#f093fb,#f5576c)" : "linear-gradient(135deg,#667eea,#764ba2)",
        border: "none", cursor: "pointer", color: "white", fontSize: "18px",
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: tocando ? "0 0 20px rgba(245,87,108,0.5)" : "0 0 20px rgba(102,126,234,0.5)",
        transition: "all 0.3s"
      }}>
        {tocando ? "⏸" : "▶"}
      </button>
      <div>
        <div style={{ color: "white", fontSize: "12px", fontWeight: 600, marginBottom: "4px" }}>
          {tocando ? "A tocar..." : "Música do evento"}
        </div>
        <div style={{ width: "100px", height: "3px", background: "rgba(255,255,255,0.2)", borderRadius: "2px" }}>
          <div style={{ width: progresso + "%", height: "100%", background: "linear-gradient(90deg,#667eea,#f5576c)", borderRadius: "2px", transition: "width 0.5s" }} />
        </div>
      </div>
    </div>
  );
}

function Galeria({ fotos }) {
  const [aberta, setAberta] = useState(null);
  const lista = Array.isArray(fotos) ? fotos.filter(Boolean) : [];
  if (lista.length === 0) return null;

  return (
    <>
      <div style={{ marginBottom: "32px" }}>
        <h3 style={{ color: "white", fontSize: "18px", fontWeight: 700, marginBottom: "16px", textAlign: "center", letterSpacing: "1px", textTransform: "uppercase", opacity: 0.8 }}>
          Galeria de Fotos
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: "8px" }}>
          {lista.map((foto, i) => (
            <div key={i} onClick={() => setAberta(i)} style={{
              aspectRatio: "1", borderRadius: "10px", overflow: "hidden",
              cursor: "pointer", transition: "transform 0.2s",
              boxShadow: "0 4px 16px rgba(0,0,0,0.3)"
            }}
              onMouseEnter={e => e.currentTarget.style.transform = "scale(1.04)"}
              onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
            >
              <img src={foto} alt={"Foto " + (i+1)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
          ))}
        </div>
      </div>
      {aberta !== null && (
        <div onClick={() => setAberta(null)} style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.92)", zIndex: 2000,
          display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <button onClick={e => { e.stopPropagation(); setAberta(i => Math.max(0, i - 1)); }}
            style={{ position: "absolute", left: "20px", background: "rgba(255,255,255,0.15)", border: "none", color: "white", fontSize: "28px", width: "50px", height: "50px", borderRadius: "50%", cursor: "pointer" }}>
            
          </button>
          <img src={lista[aberta]} alt="" style={{ maxWidth: "90vw", maxHeight: "85vh", borderRadius: "12px", boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }} onClick={e => e.stopPropagation()} />
          <button onClick={e => { e.stopPropagation(); setAberta(i => Math.min(lista.length - 1, i + 1)); }}
            style={{ position: "absolute", right: "20px", background: "rgba(255,255,255,0.15)", border: "none", color: "white", fontSize: "28px", width: "50px", height: "50px", borderRadius: "50%", cursor: "pointer" }}>
            
          </button>
          <button onClick={() => setAberta(null)} style={{ position: "absolute", top: "20px", right: "20px", background: "rgba(255,255,255,0.15)", border: "none", color: "white", fontSize: "20px", width: "40px", height: "40px", borderRadius: "50%", cursor: "pointer" }}>
            x
          </button>
          <div style={{ position: "absolute", bottom: "20px", color: "rgba(255,255,255,0.6)", fontSize: "14px" }}>
            {aberta + 1} / {lista.length}
          </div>
        </div>
      )}
    </>
  );
}

function VideoPlayer({ url }) {
  if (!url) return null;
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
  if (ytMatch) {
    return (
      <div style={{ marginBottom: "32px" }}>
        <h3 style={{ color: "white", fontSize: "18px", fontWeight: 700, marginBottom: "16px", textAlign: "center", letterSpacing: "1px", textTransform: "uppercase", opacity: 0.8 }}>
          Video
        </h3>
        <div style={{ borderRadius: "16px", overflow: "hidden", boxShadow: "0 8px 32px rgba(0,0,0,0.4)", aspectRatio: "16/9" }}>
          <iframe
            src={"https://www.youtube.com/embed/" + ytMatch[1] + "?rel=0"}
            style={{ width: "100%", height: "100%", border: "none" }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen title="Video do evento"
          />
        </div>
      </div>
    );
  }
  return (
    <div style={{ marginBottom: "32px" }}>
      <h3 style={{ color: "white", fontSize: "18px", fontWeight: 700, marginBottom: "16px", textAlign: "center", letterSpacing: "1px", textTransform: "uppercase", opacity: 0.8 }}>
        Video
      </h3>
      <div style={{ borderRadius: "16px", overflow: "hidden", boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }}>
        <video controls src={url} style={{ width: "100%", maxHeight: "360px", display: "block", background: "#000" }} />
      </div>
    </div>
  );
}

function ConvitePublico() {
  const { id } = useParams();
  const [evento, setEvento] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    nome_convidado: "", email: "", telefone: "",
    confirmado: true, numero_acompanhantes: 0, mensagem: ""
  });

  useEffect(() => { carregarEvento(); }, []); // eslint-disable-line

  const carregarEvento = async () => {
    try {
      const data = await convitesAPI.buscarPorId(id);
      setEvento(data);
    } catch {
      setErro("Convite nao encontrado ou link invalido.");
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro("");
    setSubmitting(true);
    if (!formData.nome_convidado.trim()) { setErro("O nome e obrigatorio."); setSubmitting(false); return; }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setErro("Email invalido."); setSubmitting(false); return;
    }
    try {
      await confirmacoesAPI.criar(id, formData);
      setEnviado(true);
    } catch (error) {
      setErro(error.message || "Erro ao enviar confirmacao.");
    }
    setSubmitting(false);
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#0f0c29,#302b63,#24243e)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: "white", fontSize: "18px", textAlign: "center" }}>
        <div style={{ fontSize: "40px", marginBottom: "16px" }}></div>
        A carregar convite...
      </div>
    </div>
  );

  if (erro && !evento) return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#0f0c29,#302b63,#24243e)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: "20px", padding: "48px", textAlign: "center", maxWidth: "400px" }}>
        <div style={{ fontSize: "48px", marginBottom: "16px" }}></div>
        <h2 style={{ color: "white", marginBottom: "12px" }}>Convite nao encontrado</h2>
        <p style={{ color: "rgba(255,255,255,0.6)" }}>O link pode estar incorreto ou o evento foi removido.</p>
      </div>
    </div>
  );

  if (enviado) return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#0f0c29,#302b63,#24243e)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: "20px", padding: "48px", textAlign: "center", maxWidth: "480px", border: "1px solid rgba(255,255,255,0.1)" }}>
        <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: formData.confirmado ? "linear-gradient(135deg,#43e97b,#38f9d7)" : "linear-gradient(135deg,#f5576c,#f093fb)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", fontSize: "36px", color: formData.confirmado ? "#1a1a2e" : "white" }}>
          {formData.confirmado ? "" : ""}
        </div>
        <h2 style={{ color: "white", fontSize: "26px", marginBottom: "12px" }}>
          {formData.confirmado ? "Presenca Confirmada!" : "Resposta Enviada"}
        </h2>
        <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "16px", lineHeight: "1.6" }}>
          {formData.confirmado
            ? "Obrigado, " + formData.nome_convidado + "! Ate breve em " + evento.nome_evento + "."
            : "Obrigado por responder, " + formData.nome_convidado + "."}
        </p>
      </div>
    </div>
  );

  const dataFormatada = new Date(evento.data_evento).toLocaleDateString("pt-PT", {
    weekday: "long", day: "numeric", month: "long", year: "numeric"
  });
  const fotos = Array.isArray(evento.fotos) ? evento.fotos.filter(Boolean) : [];

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#0f0c29 0%,#302b63 50%,#24243e 100%)" }}>

      {evento.musica_url && <MusicaPlayer url={evento.musica_url} />}

      <div style={{ textAlign: "center", padding: "80px 24px 60px", background: "linear-gradient(180deg,rgba(102,126,234,0.15) 0%,transparent 100%)" }}>
        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "12px", fontWeight: 700, letterSpacing: "3px", textTransform: "uppercase", marginBottom: "20px" }}>
          Convite Especial
        </p>
        <h1 style={{ color: "white", fontSize: "clamp(28px,6vw,52px)", fontWeight: 900, lineHeight: 1.15, marginBottom: "20px", textShadow: "0 4px 20px rgba(0,0,0,0.3)" }}>
          {evento.nome_evento}
        </h1>
        {evento.mensagem && (
          <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "18px", fontStyle: "italic", maxWidth: "560px", margin: "0 auto 32px", lineHeight: 1.7 }}>
            "{evento.mensagem}"
          </p>
        )}
        <div style={{ display: "inline-flex", gap: "32px", background: "rgba(255,255,255,0.07)", borderRadius: "16px", padding: "20px 32px", border: "1px solid rgba(255,255,255,0.1)" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "11px", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", marginBottom: "6px" }}>Data</div>
            <div style={{ color: "white", fontWeight: 700, fontSize: "15px" }}>{dataFormatada}</div>
          </div>
          <div style={{ width: "1px", background: "rgba(255,255,255,0.15)" }} />
          <div style={{ textAlign: "center" }}>
            <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "11px", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", marginBottom: "6px" }}>Local</div>
            <div style={{ color: "white", fontWeight: 700, fontSize: "15px" }}>{evento.local_evento}</div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: "680px", margin: "0 auto", padding: "0 20px 80px" }}>

        <VideoPlayer url={evento.video_url} />

        {fotos.length > 0 && <Galeria fotos={fotos} />}

        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{ display: "inline-block", background: "rgba(255,255,255,0.05)", borderRadius: "16px", padding: "24px", border: "1px solid rgba(255,255,255,0.1)" }}>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "11px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", marginBottom: "12px" }}>
              Partilhar Convite
            </p>
            <div style={{ background: "white", borderRadius: "10px", padding: "10px", display: "inline-block" }}>
              <QRCodeSVG value={window.location.origin + "/convite/" + id} size={110} fgColor="#302b63" level="M" />
            </div>
          </div>
        </div>

        <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: "20px", padding: "36px", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(10px)" }}>
          <h2 style={{ color: "white", fontSize: "22px", fontWeight: 800, marginBottom: "28px", textAlign: "center" }}>
            Confirmar Presenca
          </h2>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "16px" }}>
              <label style={{ color: "rgba(255,255,255,0.7)", fontSize: "13px", fontWeight: 600, display: "block", marginBottom: "8px" }}>Nome completo *</label>
              <input type="text" value={formData.nome_convidado}
                onChange={e => setFormData({ ...formData, nome_convidado: e.target.value })}
                required placeholder="O seu nome"
                style={{ width: "100%", padding: "13px 16px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.08)", color: "white", fontSize: "15px", outline: "none", boxSizing: "border-box" }} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
              <div>
                <label style={{ color: "rgba(255,255,255,0.7)", fontSize: "13px", fontWeight: 600, display: "block", marginBottom: "8px" }}>Email</label>
                <input type="email" value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  placeholder="seu@email.com"
                  style={{ width: "100%", padding: "13px 16px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.08)", color: "white", fontSize: "15px", outline: "none", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ color: "rgba(255,255,255,0.7)", fontSize: "13px", fontWeight: 600, display: "block", marginBottom: "8px" }}>Telefone</label>
                <input type="tel" value={formData.telefone}
                  onChange={e => setFormData({ ...formData, telefone: e.target.value })}
                  placeholder="+258 84 000 0000"
                  style={{ width: "100%", padding: "13px 16px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.08)", color: "white", fontSize: "15px", outline: "none", boxSizing: "border-box" }} />
              </div>
            </div>
            <div style={{ marginBottom: "16px" }}>
              <label style={{ color: "rgba(255,255,255,0.7)", fontSize: "13px", fontWeight: 600, display: "block", marginBottom: "10px" }}>Vai comparecer? *</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <button type="button" onClick={() => setFormData({ ...formData, confirmado: true })}
                  style={{ padding: "14px", borderRadius: "10px", border: "2px solid " + (formData.confirmado ? "#43e97b" : "rgba(255,255,255,0.15)"), background: formData.confirmado ? "rgba(67,233,123,0.15)" : "transparent", color: formData.confirmado ? "#43e97b" : "rgba(255,255,255,0.6)", fontWeight: 700, fontSize: "15px", cursor: "pointer", transition: "all 0.2s" }}>
                  Sim, vou!
                </button>
                <button type="button" onClick={() => setFormData({ ...formData, confirmado: false, numero_acompanhantes: 0 })}
                  style={{ padding: "14px", borderRadius: "10px", border: "2px solid " + (!formData.confirmado ? "#f5576c" : "rgba(255,255,255,0.15)"), background: !formData.confirmado ? "rgba(245,87,108,0.15)" : "transparent", color: !formData.confirmado ? "#f5576c" : "rgba(255,255,255,0.6)", fontWeight: 700, fontSize: "15px", cursor: "pointer", transition: "all 0.2s" }}>
                  Nao posso
                </button>
              </div>
            </div>
            {formData.confirmado && (
              <div style={{ marginBottom: "16px" }}>
                <label style={{ color: "rgba(255,255,255,0.7)", fontSize: "13px", fontWeight: 600, display: "block", marginBottom: "8px" }}>Acompanhantes</label>
                <input type="number" min="0" max="20" value={formData.numero_acompanhantes}
                  onChange={e => setFormData({ ...formData, numero_acompanhantes: parseInt(e.target.value) || 0 })}
                  style={{ width: "100%", padding: "13px 16px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.08)", color: "white", fontSize: "15px", outline: "none", boxSizing: "border-box" }} />
                <small style={{ color: "rgba(255,255,255,0.4)", fontSize: "12px" }}>Alem de si, quantas pessoas virao?</small>
              </div>
            )}
            <div style={{ marginBottom: "20px" }}>
              <label style={{ color: "rgba(255,255,255,0.7)", fontSize: "13px", fontWeight: 600, display: "block", marginBottom: "8px" }}>Mensagem (opcional)</label>
              <textarea value={formData.mensagem}
                onChange={e => setFormData({ ...formData, mensagem: e.target.value })}
                placeholder="Deixe uma mensagem para o anfitriao..."
                rows="3"
                style={{ width: "100%", padding: "13px 16px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.08)", color: "white", fontSize: "15px", outline: "none", resize: "vertical", boxSizing: "border-box" }} />
            </div>
            {erro && (
              <div style={{ background: "rgba(245,87,108,0.15)", border: "1px solid rgba(245,87,108,0.4)", borderRadius: "10px", padding: "12px 16px", color: "#f5576c", marginBottom: "16px", fontSize: "14px" }}>
                {erro}
              </div>
            )}
            <button type="submit" disabled={submitting} style={{
              width: "100%", padding: "16px", borderRadius: "12px", border: "none",
              background: formData.confirmado ? "linear-gradient(135deg,#43e97b,#38f9d7)" : "linear-gradient(135deg,#667eea,#764ba2)",
              color: formData.confirmado ? "#1a1a2e" : "white",
              fontSize: "16px", fontWeight: 800, cursor: submitting ? "wait" : "pointer",
              transition: "all 0.3s", opacity: submitting ? 0.7 : 1
            }}>
              {submitting ? "A enviar..." : formData.confirmado ? "Confirmar Presenca" : "Enviar Resposta"}
            </button>
          </form>
        </div>

        <p style={{ textAlign: "center", color: "rgba(255,255,255,0.25)", fontSize: "12px", marginTop: "32px" }}>
          Convites Digitais
        </p>
      </div>
    </div>
  );
}

export default ConvitePublico;