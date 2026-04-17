import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

const API = (process.env.REACT_APP_API_URL || (window.location.hostname === "localhost" ? "http://localhost:5000" : "https://convites-digitais-backend-6v3x.onrender.com")) + "/api";

const getHeaders = () => {
  const token = sessionStorage.getItem("token");
  return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
};

const card = { background: "white", borderRadius: "14px", padding: "24px", boxShadow: "0 2px 12px rgba(0,0,0,0.08)", marginBottom: "20px" };
const badge = (cor) => ({ display: "inline-block", padding: "3px 10px", borderRadius: "12px", fontSize: "11px", fontWeight: 700, background: cor === "admin" ? "#667eea22" : cor === "bloqueado" ? "#f5576c22" : "#11998e22", color: cor === "admin" ? "#667eea" : cor === "bloqueado" ? "#f5576c" : "#11998e" });

export default function Admin() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("usuarios");
  const [stats, setStats] = useState({});
  const [usuarios, setUsuarios] = useState([]);
  const [eventos, setEventos] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [detalhe, setDetalhe] = useState(null);

  // Verificar se é admin
  useEffect(() => {
    const user = JSON.parse(sessionStorage.getItem("user") || "{}");
    if (user.role !== "admin") { navigate("/home"); return; }
    carregarStats();
  }, []); // eslint-disable-line

  const carregarStats = async () => {
    try {
      const r = await fetch(`${API}/admin/stats`, { headers: getHeaders() });
      if (r.ok) setStats(await r.json());
    } catch {}
  };

  const carregarUsuarios = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(`${API}/admin/usuarios?search=${encodeURIComponent(search)}`, { headers: getHeaders() });
      if (r.ok) { const d = await r.json(); setUsuarios(d.data); }
    } catch {} finally { setLoading(false); }
  }, [search]);

  const carregarEventos = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(`${API}/admin/eventos?search=${encodeURIComponent(search)}`, { headers: getHeaders() });
      if (r.ok) { const d = await r.json(); setEventos(d.data); }
    } catch {} finally { setLoading(false); }
  }, [search]);

  useEffect(() => { if (tab === "usuarios") carregarUsuarios(); else carregarEventos(); }, [tab, carregarUsuarios, carregarEventos]);

  const bloquear = async (id, bloqueado) => {
    await fetch(`${API}/admin/usuarios/${id}/bloquear`, { method: "PATCH", headers: getHeaders(), body: JSON.stringify({ bloqueado }) });
    carregarUsuarios();
  };

  const promoverAdmin = async (id, role) => {
    if (!window.confirm(`Tornar este utilizador ${role === "admin" ? "admin" : "utilizador normal"}?`)) return;
    await fetch(`${API}/admin/usuarios/${id}/role`, { method: "PATCH", headers: getHeaders(), body: JSON.stringify({ role }) });
    carregarUsuarios();
  };

  const apagarUsuario = async (id) => {
    if (!window.confirm("Apagar este utilizador e todos os seus eventos?")) return;
    await fetch(`${API}/admin/usuarios/${id}`, { method: "DELETE", headers: getHeaders() });
    carregarUsuarios();
  };

  const apagarEvento = async (id) => {
    if (!window.confirm("Apagar este evento?")) return;
    await fetch(`${API}/admin/eventos/${id}`, { method: "DELETE", headers: getHeaders() });
    carregarEventos();
  };

  const verDetalhe = async (id) => {
    const r = await fetch(`${API}/admin/usuarios/${id}`, { headers: getHeaders() });
    if (r.ok) setDetalhe(await r.json());
  };

  const tabStyle = (t) => ({ padding: "10px 20px", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: 600, fontSize: "14px", fontFamily: "inherit", background: tab === t ? "#667eea" : "transparent", color: tab === t ? "white" : "#667eea" });

  return (
    <div className="page-container" style={{ maxWidth: "1100px", margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: "28px" }}>
        <h1 className="page-title">Painel de Administração</h1>
        <p style={{ color: "white", opacity: 0.8 }}>Controlo total do sistema</p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: "14px", marginBottom: "28px" }}>
        {[
          { label: "Utilizadores", value: stats.totalUsuarios || 0, color: "#667eea" },
          { label: "Eventos", value: stats.totalEventos || 0, color: "#f5576c" },
          { label: "Confirmações", value: stats.totalConfirmacoes || 0, color: "#11998e" },
        ].map(s => (
          <div key={s.label} className="stat-card" style={{ borderLeft: `3px solid ${s.color}` }}>
            <span className="stat-value" style={{ color: s.color }}>{s.value}</span>
            <span className="stat-label">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ ...card, padding: "8px", display: "flex", gap: "4px", marginBottom: "20px" }}>
        <button style={tabStyle("usuarios")} onClick={() => setTab("usuarios")}>👥 Utilizadores</button>
        <button style={tabStyle("eventos")} onClick={() => setTab("eventos")}>📅 Eventos</button>
      </div>

      {/* Search */}
      <div style={{ marginBottom: "16px" }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Pesquisar..."
          style={{ width: "100%", padding: "10px 16px", borderRadius: "10px", border: "1.5px solid #e0e0e0", fontSize: "14px", outline: "none", background: "white", color: "#333" }} />
      </div>

      {/* Tabela Utilizadores */}
      {tab === "usuarios" && (
        <div style={card}>
          <h2 style={{ color: "#667eea", marginBottom: "20px", fontSize: "18px" }}>Utilizadores ({usuarios.length})</h2>
          {loading ? <p style={{ color: "#999" }}>A carregar...</p> : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid #f0f0f0" }}>
                    {["ID", "Nome", "Email", "Role", "Estado", "Eventos", "Criado em", "Ações"].map(h => (
                      <th key={h} style={{ padding: "10px 12px", textAlign: "left", color: "#888", fontWeight: 600, fontSize: "12px", textTransform: "uppercase" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {usuarios.map(u => (
                    <tr key={u.id} style={{ borderBottom: "1px solid #f5f5f5" }}>
                      <td style={{ padding: "12px", color: "#999", fontSize: "12px" }}>#{u.id}</td>
                      <td style={{ padding: "12px", fontWeight: 600, color: "#333" }}>
                        <button onClick={() => verDetalhe(u.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#667eea", fontWeight: 600, fontSize: "14px", padding: 0 }}>{u.nome}</button>
                      </td>
                      <td style={{ padding: "12px", color: "#555" }}>{u.email}</td>
                      <td style={{ padding: "12px" }}><span style={badge(u.role)}>{u.role}</span></td>
                      <td style={{ padding: "12px" }}><span style={badge(u.bloqueado ? "bloqueado" : "ativo")}>{u.bloqueado ? "Bloqueado" : "Ativo"}</span></td>
                      <td style={{ padding: "12px", color: "#555" }}>{u.total_eventos}</td>
                      <td style={{ padding: "12px", color: "#999", fontSize: "12px" }}>{new Date(u.criado_em).toLocaleDateString("pt-PT")}</td>
                      <td style={{ padding: "12px" }}>
                        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                          <button onClick={() => bloquear(u.id, !u.bloqueado)}
                            style={{ padding: "5px 10px", borderRadius: "6px", border: "none", cursor: "pointer", fontSize: "12px", fontWeight: 600, background: u.bloqueado ? "#e8f5e9" : "#fff3e0", color: u.bloqueado ? "#2e7d32" : "#e65100", fontFamily: "inherit" }}>
                            {u.bloqueado ? "Desbloquear" : "Bloquear"}
                          </button>
                          <button onClick={() => promoverAdmin(u.id, u.role === "admin" ? "user" : "admin")}
                            style={{ padding: "5px 10px", borderRadius: "6px", border: "none", cursor: "pointer", fontSize: "12px", fontWeight: 600, background: "#f0f4ff", color: "#667eea", fontFamily: "inherit" }}>
                            {u.role === "admin" ? "Remover Admin" : "Tornar Admin"}
                          </button>
                          <button onClick={() => apagarUsuario(u.id)}
                            style={{ padding: "5px 10px", borderRadius: "6px", border: "none", cursor: "pointer", fontSize: "12px", fontWeight: 600, background: "#fff0f0", color: "#f5576c", fontFamily: "inherit" }}>
                            Apagar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {usuarios.length === 0 && <p style={{ color: "#999", textAlign: "center", padding: "20px" }}>Nenhum utilizador encontrado</p>}
            </div>
          )}
        </div>
      )}

      {/* Tabela Eventos */}
      {tab === "eventos" && (
        <div style={card}>
          <h2 style={{ color: "#667eea", marginBottom: "20px", fontSize: "18px" }}>Eventos ({eventos.length})</h2>
          {loading ? <p style={{ color: "#999" }}>A carregar...</p> : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid #f0f0f0" }}>
                    {["ID", "Evento", "Utilizador", "Data", "Confirmações", "Criado em", "Ações"].map(h => (
                      <th key={h} style={{ padding: "10px 12px", textAlign: "left", color: "#888", fontWeight: 600, fontSize: "12px", textTransform: "uppercase" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {eventos.map(e => (
                    <tr key={e.id} style={{ borderBottom: "1px solid #f5f5f5" }}>
                      <td style={{ padding: "12px", color: "#999", fontSize: "12px" }}>#{e.id}</td>
                      <td style={{ padding: "12px", fontWeight: 600, color: "#333" }}>{e.nome_evento}</td>
                      <td style={{ padding: "12px", color: "#555" }}>{e.usuario_nome}<br /><span style={{ fontSize: "11px", color: "#999" }}>{e.usuario_email}</span></td>
                      <td style={{ padding: "12px", color: "#555" }}>{new Date(e.data_evento).toLocaleDateString("pt-PT")}</td>
                      <td style={{ padding: "12px", color: "#555" }}>{e.total_confirmacoes}</td>
                      <td style={{ padding: "12px", color: "#999", fontSize: "12px" }}>{new Date(e.criado_em).toLocaleDateString("pt-PT")}</td>
                      <td style={{ padding: "12px" }}>
                        <button onClick={() => apagarEvento(e.id)}
                          style={{ padding: "5px 10px", borderRadius: "6px", border: "none", cursor: "pointer", fontSize: "12px", fontWeight: 600, background: "#fff0f0", color: "#f5576c", fontFamily: "inherit" }}>
                          Apagar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {eventos.length === 0 && <p style={{ color: "#999", textAlign: "center", padding: "20px" }}>Nenhum evento encontrado</p>}
            </div>
          )}
        </div>
      )}

      {/* Modal detalhe utilizador */}
      {detalhe && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}
          onClick={() => setDetalhe(null)}>
          <div style={{ background: "white", borderRadius: "16px", padding: "28px", maxWidth: "600px", width: "100%", maxHeight: "80vh", overflowY: "auto" }}
            onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ color: "#333", fontSize: "18px" }}>{detalhe.nome}</h3>
              <button onClick={() => setDetalhe(null)} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#999" }}>×</button>
            </div>
            <p style={{ color: "#666", marginBottom: "6px" }}>📧 {detalhe.email}</p>
            <p style={{ color: "#666", marginBottom: "16px" }}>📅 Membro desde {new Date(detalhe.criado_em).toLocaleDateString("pt-PT")}</p>
            <h4 style={{ color: "#667eea", marginBottom: "12px" }}>Eventos ({detalhe.eventos?.length || 0})</h4>
            {detalhe.eventos?.map(e => (
              <div key={e.id} style={{ padding: "12px", background: "#f8f9ff", borderRadius: "8px", marginBottom: "8px" }}>
                <p style={{ fontWeight: 600, color: "#333", marginBottom: "4px" }}>{e.nome_evento}</p>
                <p style={{ fontSize: "12px", color: "#999" }}>{new Date(e.data_evento).toLocaleDateString("pt-PT")} · {e.confirmacoes} confirmações</p>
              </div>
            ))}
            {(!detalhe.eventos || detalhe.eventos.length === 0) && <p style={{ color: "#999" }}>Sem eventos</p>}
          </div>
        </div>
      )}
    </div>
  );
}
