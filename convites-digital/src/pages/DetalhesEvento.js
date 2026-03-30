import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { convitesAPI, confirmacoesAPI, emailAPI } from "../services/api";
import "../styles/global.css";
import "../styles/Pages.css";

const inp = { width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "14px", outline: "none", boxSizing: "border-box", fontFamily: "inherit" };
const sec = { background: "#fff", borderRadius: "12px", padding: "20px", marginBottom: "16px", border: "1px solid #eee", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" };

function DetalhesEvento() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [evento, setEvento] = useState(null);
  const [confirmacoes, setConfirmacoes] = useState([]);
  const [estatisticas, setEstatisticas] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [enviandoEmail, setEnviandoEmail] = useState(false);
  const [emailResultado, setEmailResultado] = useState(null);
  const [linkCopiado, setLinkCopiado] = useState(false);
  const [formData, setFormData] = useState({
    nome_convidado: "", email: "", telefone: "",
    confirmado: true, numero_acompanhantes: 0, mensagem: "",
  });

  useEffect(() => { carregarDados(); }, [id]); // eslint-disable-line

  const carregarDados = async () => {
    try {
      const [ev, confs, stats] = await Promise.all([
        convitesAPI.buscarPorId(id),
        confirmacoesAPI.listar(id),
        confirmacoesAPI.estatisticas(id),
      ]);
      setEvento(ev); setConfirmacoes(confs); setEstatisticas(stats);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await confirmacoesAPI.criar(id, formData);
      setMostrarForm(false);
      setFormData({ nome_convidado: "", email: "", telefone: "", confirmado: true, numero_acompanhantes: 0, mensagem: "" });
      carregarDados();
    } catch (err) { alert("Erro: " + err.message); }
  };

  const handleEnviarEmail = async (e) => {
    e.preventDefault(); setEnviandoEmail(true); setEmailResultado(null);
    const emails = emailInput.split(/[\n,;]+/).map(e => e.trim()).filter(Boolean);
    if (!emails.length) { setEmailResultado({ erro: "Insira pelo menos um email" }); setEnviandoEmail(false); return; }
    try {
      const r = await emailAPI.enviarConvite(id, emails);
      setEmailResultado({ sucesso: r.message, detalhes: r.resultados, isTest: r.isTest });
      setEmailInput("");
    } catch (err) { setEmailResultado({ erro: err.message }); }
    setEnviandoEmail(false);
  };

  const copiarLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/convite/${id}`);
    setLinkCopiado(true);
    setTimeout(() => setLinkCopiado(false), 2000);
  };

  const deletarConfirmacao = async (cid) => {
    if (!window.confirm("Remover esta confirmação?")) return;
    try { await confirmacoesAPI.deletar(cid); carregarDados(); }
    catch (err) { alert("Erro: " + err.message); }
  };

  if (loading) return <div className="page-container"><div style={{ color: "white", textAlign: "center", paddingTop: "60px" }}>A carregar...</div></div>;
  if (!evento) return <div className="page-container"><div className="alert alert-error">Evento não encontrado</div></div>;

  const totalPessoas = parseInt(estatisticas?.confirmados || 0) + parseInt(estatisticas?.total_acompanhantes || 0);
  const linkConvite = `${window.location.origin}/convite/${id}`;

  return (
    <div className="page-container" style={{ maxWidth: "860px", margin: "0 auto" }}>

      {/* Topo */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px", flexWrap: "wrap" }}>
        <button onClick={() => navigate("/meus-convites")} style={{ ...inp, width: "auto", padding: "8px 16px", cursor: "pointer", background: "#f5f5f5", border: "1px solid #ddd", borderRadius: "8px", fontWeight: 600, fontSize: "13px" }}>
          Voltar
        </button>
        <h1 style={{ color: "white", fontSize: "clamp(18px,4vw,26px)", fontWeight: 700, margin: 0, flex: 1 }}>{evento.nome_evento}</h1>
        <button onClick={() => navigate(`/editar/${id}`)} style={{ ...inp, width: "auto", padding: "8px 16px", cursor: "pointer", background: "#667eea", color: "white", border: "none", borderRadius: "8px", fontWeight: 600, fontSize: "13px" }}>
          Editar
        </button>
      </div>

      {/* Info do evento */}
      <div style={sec}>
        {evento.mensagem && <p style={{ color: "#555", marginBottom: "14px", fontSize: "14px", lineHeight: 1.6 }}>{evento.mensagem}</p>}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "12px" }}>
          <div><span style={{ fontSize: "11px", color: "#999", textTransform: "uppercase", letterSpacing: "0.5px" }}>Data</span><p style={{ fontWeight: 600, color: "#333", margin: "2px 0 0" }}>{new Date(evento.data_evento).toLocaleDateString("pt-PT")}</p></div>
          {evento.hora_evento && <div><span style={{ fontSize: "11px", color: "#999", textTransform: "uppercase", letterSpacing: "0.5px" }}>Hora</span><p style={{ fontWeight: 600, color: "#333", margin: "2px 0 0" }}>{evento.hora_evento}</p></div>}
          <div><span style={{ fontSize: "11px", color: "#999", textTransform: "uppercase", letterSpacing: "0.5px" }}>Local</span><p style={{ fontWeight: 600, color: "#333", margin: "2px 0 0" }}>{evento.local_evento}</p></div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", marginBottom: "16px" }}>
        {[
          { label: "Respostas",   value: estatisticas?.total_respostas || 0, color: "#667eea" },
          { label: "Confirmados", value: estatisticas?.confirmados || 0,     color: "#11998e" },
          { label: "Pessoas",     value: totalPessoas,                        color: "#f5576c" },
        ].map(s => (
          <div key={s.label} className="stat-card" style={{ borderLeft: `3px solid ${s.color}` }}>
            <span className="stat-value" style={{ color: s.color }}>{s.value}</span>
            <span className="stat-label">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Link + QR */}
      <div style={sec}>
        <p style={{ fontSize: "13px", fontWeight: 600, color: "#333", marginBottom: "10px" }}>Link do Convite</p>
        <div style={{ display: "flex", gap: "8px", marginBottom: "14px" }}>
          <input readOnly value={linkConvite} style={{ ...inp, flex: 1, background: "#f9f9f9", fontSize: "13px" }} />
          <button onClick={copiarLink} style={{ padding: "9px 16px", background: linkCopiado ? "#11998e" : "#667eea", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: 600, fontSize: "13px", whiteSpace: "nowrap", transition: "background 0.2s" }}>
            {linkCopiado ? "Copiado" : "Copiar"}
          </button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
          <div style={{ padding: "12px", background: "white", borderRadius: "10px", border: "1px solid #eee", display: "inline-block" }}>
            <QRCodeSVG value={linkConvite} size={140} fgColor="#333" level="M" />
          </div>
          <span style={{ fontSize: "12px", color: "#aaa" }}>Digitaliza para abrir no telemóvel</span>
        </div>
      </div>

      {/* Enviar por email */}
      <div style={sec}>
        <p style={{ fontSize: "13px", fontWeight: 600, color: "#333", marginBottom: "12px" }}>Enviar por Email</p>
        <form onSubmit={handleEnviarEmail}>
          <textarea
            value={emailInput}
            onChange={e => setEmailInput(e.target.value)}
            placeholder={"convidado1@email.com\nconvidado2@email.com"}
            rows="3"
            style={{ ...inp, resize: "vertical", fontFamily: "monospace", marginBottom: "8px" }}
          />
          <small style={{ color: "#aaa", display: "block", marginBottom: "10px" }}>Um email por linha, ou separados por vírgula</small>
          {emailResultado && (
            <div className={emailResultado.erro ? "alert alert-error" : "alert alert-success"} style={{ marginBottom: "10px", fontSize: "13px" }}>
              {emailResultado.erro || emailResultado.sucesso}
              {emailResultado.detalhes && (
                <ul style={{ margin: "6px 0 0", paddingLeft: "18px" }}>
                  {emailResultado.detalhes.map((r, i) => (
                    <li key={i} style={{ color: r.sucesso ? "#155724" : "#721c24" }}>
                      {r.email} — {r.sucesso ? "Enviado" : r.erro}
                      {r.previewUrl && <> — <a href={r.previewUrl} target="_blank" rel="noreferrer" style={{ color: "#667eea" }}>Ver</a></>}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
          <button type="submit" disabled={enviandoEmail || !emailInput.trim()} style={{ padding: "9px 20px", background: "#667eea", color: "white", border: "none", borderRadius: "8px", cursor: enviandoEmail ? "wait" : "pointer", fontWeight: 600, fontSize: "13px", opacity: (!emailInput.trim() || enviandoEmail) ? 0.6 : 1 }}>
            {enviandoEmail ? "A enviar..." : "Enviar Convites"}
          </button>
        </form>
      </div>

      {/* Confirmações */}
      <div style={sec}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "8px" }}>
          <p style={{ fontSize: "13px", fontWeight: 600, color: "#333", margin: 0 }}>Confirmações de Presença</p>
          <button onClick={() => setMostrarForm(f => !f)} style={{ padding: "8px 14px", background: mostrarForm ? "#f5f5f5" : "#667eea", color: mostrarForm ? "#555" : "white", border: mostrarForm ? "1px solid #ddd" : "none", borderRadius: "8px", cursor: "pointer", fontWeight: 600, fontSize: "13px" }}>
            {mostrarForm ? "Cancelar" : "+ Nova"}
          </button>
        </div>

        {mostrarForm && (
          <form onSubmit={handleSubmit} style={{ background: "#f9f9f9", borderRadius: "10px", padding: "16px", marginBottom: "16px", border: "1px solid #eee" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "10px", marginBottom: "10px" }}>
              <div><label style={{ fontSize: "11px", color: "#888", fontWeight: 600, display: "block", marginBottom: "4px" }}>Nome *</label><input style={inp} type="text" value={formData.nome_convidado} onChange={e => setFormData(p => ({ ...p, nome_convidado: e.target.value }))} required placeholder="Nome completo" /></div>
              <div><label style={{ fontSize: "11px", color: "#888", fontWeight: 600, display: "block", marginBottom: "4px" }}>Email</label><input style={inp} type="email" value={formData.email} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))} placeholder="email@exemplo.com" /></div>
              <div><label style={{ fontSize: "11px", color: "#888", fontWeight: 600, display: "block", marginBottom: "4px" }}>Telefone</label><input style={inp} type="tel" value={formData.telefone} onChange={e => setFormData(p => ({ ...p, telefone: e.target.value }))} placeholder="+258 84 000 0000" /></div>
              <div><label style={{ fontSize: "11px", color: "#888", fontWeight: 600, display: "block", marginBottom: "4px" }}>Acompanhantes</label><input style={inp} type="number" min="0" value={formData.numero_acompanhantes} onChange={e => setFormData(p => ({ ...p, numero_acompanhantes: parseInt(e.target.value) || 0 }))} /></div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "10px" }}>
              {[true, false].map(v => (
                <button key={String(v)} type="button" onClick={() => setFormData(p => ({ ...p, confirmado: v }))} style={{ padding: "9px", borderRadius: "8px", border: `1.5px solid ${formData.confirmado === v ? "#667eea" : "#ddd"}`, background: formData.confirmado === v ? "#f0f2ff" : "white", color: formData.confirmado === v ? "#667eea" : "#aaa", fontWeight: 600, fontSize: "13px", cursor: "pointer" }}>
                  {v ? "Confirmado" : "Não confirmado"}
                </button>
              ))}
            </div>
            <textarea style={{ ...inp, resize: "vertical", marginBottom: "10px" }} rows="2" placeholder="Mensagem (opcional)" value={formData.mensagem} onChange={e => setFormData(p => ({ ...p, mensagem: e.target.value }))} />
            <button type="submit" style={{ width: "100%", padding: "10px", background: "#667eea", color: "white", border: "none", borderRadius: "8px", fontWeight: 600, fontSize: "14px", cursor: "pointer" }}>
              Guardar Confirmação
            </button>
          </form>
        )}

        {confirmacoes.length === 0 ? (
          <p style={{ textAlign: "center", color: "#aaa", fontSize: "14px", padding: "20px 0" }}>Nenhuma confirmação ainda.</p>
        ) : (
          <div style={{ display: "grid", gap: "10px" }}>
            {confirmacoes.map(conf => (
              <div key={conf.id} style={{ padding: "12px 14px", borderRadius: "8px", border: `1px solid ${conf.confirmado ? "#c8f0d8" : "#fdd"}`, background: conf.confirmado ? "#f6fef9" : "#fff8f8", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 600, color: "#333", margin: "0 0 2px", fontSize: "14px" }}>{conf.nome_convidado}</p>
                  {conf.email && <p style={{ fontSize: "12px", color: "#888", margin: "0 0 2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{conf.email}</p>}
                  {conf.telefone && <p style={{ fontSize: "12px", color: "#888", margin: "0 0 2px" }}>{conf.telefone}</p>}
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "4px" }}>
                    <span style={{ fontSize: "11px", fontWeight: 700, padding: "2px 8px", borderRadius: "20px", background: conf.confirmado ? "#d4edda" : "#f8d7da", color: conf.confirmado ? "#155724" : "#721c24" }}>
                      {conf.confirmado ? "Confirmado" : "Não confirmado"}
                    </span>
                    {conf.numero_acompanhantes > 0 && <span style={{ fontSize: "11px", color: "#888" }}>+{conf.numero_acompanhantes} acomp.</span>}
                  </div>
                  {conf.mensagem && <p style={{ fontSize: "12px", color: "#777", fontStyle: "italic", margin: "6px 0 0" }}>"{conf.mensagem}"</p>}
                </div>
                <button onClick={() => deletarConfirmacao(conf.id)} style={{ padding: "6px 10px", background: "white", color: "#e05a6a", border: "1px solid #e05a6a", borderRadius: "6px", cursor: "pointer", fontSize: "12px", fontWeight: 600, flexShrink: 0 }}>
                  Remover
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default DetalhesEvento;
