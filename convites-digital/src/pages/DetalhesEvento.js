import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { convitesAPI, confirmacoesAPI, emailAPI } from "../services/api";
import "../styles/global.css";
import "../styles/Pages.css";
import "../styles/Convites.css";

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
  const [formData, setFormData] = useState({
    nome_convidado: "",
    email: "",
    telefone: "",
    confirmado: true,
    numero_acompanhantes: 0,
    mensagem: "",
  });

  useEffect(() => {
    carregarDados();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const carregarDados = async () => {
    try {
      const [eventoData, confirmacoesData, statsData] = await Promise.all([
        convitesAPI.buscarPorId(id),
        confirmacoesAPI.listar(id),
        confirmacoesAPI.estatisticas(id),
      ]);
      setEvento(eventoData);
      setConfirmacoes(confirmacoesData);
      setEstatisticas(statsData);
      setLoading(false);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await confirmacoesAPI.criar(id, formData);
      setMostrarForm(false);
      setFormData({
        nome_convidado: "",
        email: "",
        telefone: "",
        confirmado: true,
        numero_acompanhantes: 0,
        mensagem: "",
      });
      carregarDados();
    } catch (error) {
      alert("Erro ao confirmar presença: " + error.message);
    }
  };

  const handleEnviarEmail = async (e) => {
    e.preventDefault();
    setEnviandoEmail(true);
    setEmailResultado(null);

    const emails = emailInput.split(/[\n,;]+/).map(e => e.trim()).filter(Boolean);
    if (emails.length === 0) {
      setEmailResultado({ erro: "Insira pelo menos um email" });
      setEnviandoEmail(false);
      return;
    }

    try {
      const resultado = await emailAPI.enviarConvite(id, emails);
      setEmailResultado({ 
        sucesso: resultado.message, 
        detalhes: resultado.resultados,
        isTest: resultado.isTest
      });
      setEmailInput("");
    } catch (error) {
      setEmailResultado({ erro: error.message });
    }
    setEnviandoEmail(false);
  };

  const deletarConfirmacao = async (confirmacaoId) => {
    if (window.confirm("Remover esta confirmação?")) {
      try {
        await confirmacoesAPI.deletar(confirmacaoId);
        carregarDados();
      } catch (error) {
        alert("Erro ao deletar confirmação: " + error.message);
      }
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="card" style={{ textAlign: "center" }}>Carregando...</div>
      </div>
    );
  }

  if (!evento) {
    return (
      <div className="page-container">
        <div className="alert alert-error">Evento não encontrado</div>
      </div>
    );
  }

  const totalPessoas = parseInt(estatisticas.confirmados) + parseInt(estatisticas.total_acompanhantes);

  return (
    <div className="page-container">
      <button onClick={() => navigate("/meus-convites")} className="btn" style={{ marginBottom: "20px", background: "#999" }}>
        Voltar
      </button>

      <div className="card">
        <h1 style={{ color: "#667eea", marginBottom: "20px" }}>{evento.nome_evento}</h1>
        <p style={{ fontSize: "18px", color: "#666", marginBottom: "15px" }}>{evento.mensagem}</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "15px", marginTop: "20px" }}>
          <div>
            <strong style={{ color: "#667eea" }}>Data:</strong>
            <p>{new Date(evento.data_evento).toLocaleDateString()}</p>
          </div>
          <div>
            <strong style={{ color: "#667eea" }}>Local:</strong>
            <p>{evento.local_evento}</p>
          </div>
        </div>
        <div style={{ marginTop: "20px", padding: "15px", background: "#f0f4ff", borderRadius: "8px" }}>
          <strong style={{ color: "#667eea", display: "block", marginBottom: "10px" }}>Link Público do Convite:</strong>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <input
              type="text"
              value={`${window.location.origin}/convite/${id}`}
              readOnly
              style={{ flex: 1, padding: "10px", border: "2px solid #667eea", borderRadius: "5px", fontSize: "14px" }}
            />
            <button
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/convite/${id}`);
                alert("Link copiado!");
              }}
              className="btn btn-primary"
            >
              Copiar Link
            </button>
          </div>
          <small style={{ color: "#666", marginTop: "8px", display: "block" }}>
            Compartilha este link para que os convidados possam confirmar presença
          </small>
          {/* QR Code */}
          <div style={{ marginTop: "20px", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
            <p style={{ color: "#667eea", fontWeight: 600, fontSize: "14px", margin: 0 }}>QR Code do Convite</p>
            <div style={{ padding: "12px", background: "white", borderRadius: "10px", border: "2px solid #e8ecff", display: "inline-block" }}>
              <QRCodeSVG
                value={`${window.location.origin}/convite/${id}`}
                size={160}
                fgColor="#667eea"
                level="M"
              />
            </div>
            <small style={{ color: "#999" }}>Digitaliza para abrir o convite no telemóvel</small>
          </div>
        </div>
      </div>

      {/* Painel de Envio de Email */}
      <div className="card" style={{ marginTop: "25px" }}>
        <h2 style={{ color: "#667eea", marginBottom: "20px" }}>Enviar Convite por Email</h2>
        <form onSubmit={handleEnviarEmail}>
          <div className="form-group">
            <label style={{ fontWeight: 600, color: "#333" }}>
              Emails dos Convidados
            </label>
            <textarea
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder={"convidado1@email.com\nconvidado2@email.com\nconvidado3@email.com"}
              rows="4"
              style={{ fontSize: "14px", fontFamily: "monospace" }}
            />
            <small style={{ color: "#999" }}>
              Um email por linha, ou separados por vírgula ou ponto e vírgula
            </small>
          </div>

          {emailResultado && (
            <div
              className={emailResultado.erro ? "alert alert-error" : "alert alert-success"}
              style={{ marginBottom: "15px" }}
            >
              {emailResultado.erro || emailResultado.sucesso}
              {emailResultado.isTest && (
                <p style={{ margin: "8px 0 0", fontSize: "13px", fontWeight: 600 }}>
                  Modo de teste ativo. Para enviar emails reais, configure EMAIL_USER e EMAIL_PASS no ficheiro backend/.env
                </p>
              )}
              {emailResultado.detalhes && (
                <ul style={{ margin: "8px 0 0", paddingLeft: "20px", fontSize: "13px" }}>
                  {emailResultado.detalhes.map((r, i) => (
                    <li key={i} style={{ color: r.sucesso ? "#155724" : "#721c24", marginBottom: "4px" }}>
                      {r.email} — {r.sucesso ? "Enviado" : `Falhou: ${r.erro}`}
                      {r.previewUrl && (
                        <> — <a href={r.previewUrl} target="_blank" rel="noreferrer" style={{ color: "#667eea" }}>Ver email de teste</a></>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={enviandoEmail || !emailInput.trim()}
          >
            {enviandoEmail ? "Enviando..." : "Enviar Convites"}
          </button>
        </form>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", margin: "30px 0" }}>
        <div className="card" style={{ textAlign: "center", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "white" }}>
          <h3 style={{ fontSize: "36px", margin: "10px 0" }}>{estatisticas.total_respostas}</h3>
          <p>Total Respostas</p>
        </div>
        <div className="card" style={{ textAlign: "center", background: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)", color: "white" }}>
          <h3 style={{ fontSize: "36px", margin: "10px 0" }}>{estatisticas.confirmados}</h3>
          <p>Confirmados</p>
        </div>
        <div className="card" style={{ textAlign: "center", background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)", color: "white" }}>
          <h3 style={{ fontSize: "36px", margin: "10px 0" }}>{totalPessoas}</h3>
          <p>Total Pessoas</p>
        </div>
      </div>

      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h2 style={{ color: "#667eea" }}>Confirmações de Presença</h2>
          <button
            onClick={() => setMostrarForm(!mostrarForm)}
            className="btn btn-primary"
          >
            {mostrarForm ? "Cancelar" : "+ Nova Confirmação"}
          </button>
        </div>

        {mostrarForm && (
          <form onSubmit={handleSubmit} className="form-container" style={{ marginBottom: "30px" }}>
            <div className="form-group">
              <label>Nome:</label>
              <input
                type="text"
                value={formData.nome_convidado}
                onChange={(e) => setFormData({...formData, nome_convidado: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Email:</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Telefone:</label>
              <input
                type="tel"
                value={formData.telefone}
                onChange={(e) => setFormData({...formData, telefone: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Status:</label>
              <select
                value={formData.confirmado}
                onChange={(e) => setFormData({...formData, confirmado: e.target.value === "true"})}
                style={{ width: "100%", padding: "12px", border: "2px solid #e0e0e0", borderRadius: "8px" }}
              >
                <option value="true">Confirmado</option>
                <option value="false">Não Confirmado</option>
              </select>
            </div>
            <div className="form-group">
              <label>Número de Acompanhantes:</label>
              <input
                type="number"
                min="0"
                value={formData.numero_acompanhantes}
                onChange={(e) => setFormData({...formData, numero_acompanhantes: parseInt(e.target.value)})}
              />
            </div>
            <div className="form-group">
              <label>Mensagem (opcional):</label>
              <textarea
                value={formData.mensagem}
                onChange={(e) => setFormData({...formData, mensagem: e.target.value})}
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>
              Confirmar Presença
            </button>
          </form>
        )}

        {confirmacoes.length === 0 ? (
          <p style={{ textAlign: "center", color: "#666" }}>Nenhuma confirmação ainda.</p>
        ) : (
          <div style={{ display: "grid", gap: "15px" }}>
            {confirmacoes.map((conf) => (
              <div
                key={conf.id}
                style={{
                  border: `2px solid ${conf.confirmado ? "#38ef7d" : "#f5576c"}`,
                  padding: "15px",
                  borderRadius: "8px",
                  background: conf.confirmado ? "#f0fdf4" : "#fef2f2",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                  <div>
                    <h4 style={{ marginBottom: "5px" }}>{conf.nome_convidado}</h4>
                    {conf.email && <p style={{ fontSize: "14px", color: "#666" }}>{conf.email}</p>}
                    {conf.telefone && <p style={{ fontSize: "14px", color: "#666" }}>{conf.telefone}</p>}
                    <p style={{ fontSize: "14px", marginTop: "5px" }}>
                      <strong>Status:</strong> {conf.confirmado ? "Confirmado" : "Não Confirmado"}
                    </p>
                    {conf.numero_acompanhantes > 0 && (
                      <p style={{ fontSize: "14px" }}>
                        <strong>Acompanhantes:</strong> {conf.numero_acompanhantes}
                      </p>
                    )}
                    {conf.mensagem && (
                      <p style={{ fontSize: "14px", marginTop: "10px", fontStyle: "italic" }}>
                        "{conf.mensagem}"
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => deletarConfirmacao(conf.id)}
                    className="btn btn-danger"
                    style={{ padding: "8px 12px", fontSize: "14px" }}
                  >
                    Remover
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default DetalhesEvento;
