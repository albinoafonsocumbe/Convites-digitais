import { useState, useEffect } from "react";
import { convitesAPI, confirmacoesAPI } from "../services/api";
import "../styles/global.css";
import "../styles/Pages.css";

function Dashboard() {
  const [eventos, setEventos] = useState([]);
  const [stats, setStats] = useState({ total: 0, proximos: 0, passados: 0, totalConfirmados: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      const convites = await convitesAPI.listar();
      const hoje = new Date();

      const proximos = convites.filter(c => new Date(c.data_evento) >= hoje).length;
      const passados = convites.filter(c => new Date(c.data_evento) < hoje).length;
      const totalConfirmados = convites.reduce((acc, c) => acc + parseInt(c.total_confirmados || 0), 0);

      // Buscar estatísticas de cada evento
      const eventosComStats = await Promise.all(
        convites.map(async (evento) => {
          try {
            const stats = await confirmacoesAPI.estatisticas(evento.id);
            return { ...evento, stats };
          } catch {
            return { ...evento, stats: { confirmados: 0, total_respostas: 0 } };
          }
        })
      );

      setEventos(eventosComStats);
      setStats({ total: convites.length, proximos, passados, totalConfirmados });
      setLoading(false);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="card" style={{ textAlign: "center" }}>Carregando...</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <h1 className="page-title">Dashboard</h1>

      {/* Cards de resumo */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", marginBottom: "30px" }}>
        {[
          { label: "Total de Convites", value: stats.total, gradient: "linear-gradient(135deg,#667eea,#764ba2)" },
          { label: "Eventos Próximos", value: stats.proximos, gradient: "linear-gradient(135deg,#f093fb,#f5576c)" },
          { label: "Eventos Passados", value: stats.passados, gradient: "linear-gradient(135deg,#4facfe,#00f2fe)" },
          { label: "Total Confirmados", value: stats.totalConfirmados, gradient: "linear-gradient(135deg,#11998e,#38ef7d)" },
        ].map((item) => (
          <div key={item.label} className="card" style={{ textAlign: "center", background: item.gradient, color: "white", padding: "24px" }}>
            <h3 style={{ fontSize: "44px", margin: "0 0 8px", fontWeight: 800 }}>{item.value}</h3>
            <p style={{ fontSize: "14px", opacity: 0.9, margin: 0, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>{item.label}</p>
          </div>
        ))}
      </div>

      {/* Tabela de eventos com stats */}
      {eventos.length > 0 && (
        <div className="card">
          <h2 style={{ color: "#667eea", marginBottom: "24px", fontSize: "20px" }}>Confirmações por Evento</h2>
          <div style={{ display: "grid", gap: "16px" }}>
            {eventos.map((evento) => {
              const confirmados = parseInt(evento.stats?.confirmados || 0);
              const total = parseInt(evento.stats?.total_respostas || 0);
              const pct = total > 0 ? Math.round((confirmados / total) * 100) : 0;
              const isProximo = new Date(evento.data_evento) >= new Date();

              return (
                <div key={evento.id} style={{ padding: "16px", background: "#f8f9ff", borderRadius: "10px", border: "1px solid #e8ecff" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                    <div>
                      <span style={{ fontWeight: 700, color: "#333", fontSize: "15px" }}>{evento.nome_evento}</span>
                      <span style={{
                        marginLeft: "10px", fontSize: "11px", fontWeight: 700, padding: "3px 8px",
                        borderRadius: "20px", textTransform: "uppercase", letterSpacing: "0.5px",
                        background: isProximo ? "#e8f5e9" : "#f3f4f6",
                        color: isProximo ? "#2e7d32" : "#666"
                      }}>
                        {isProximo ? "Próximo" : "Passado"}
                      </span>
                    </div>
                    <span style={{ fontSize: "13px", color: "#666" }}>
                      {new Date(evento.data_evento).toLocaleDateString("pt-PT")}
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ flex: 1, background: "#e0e0e0", borderRadius: "20px", height: "8px", overflow: "hidden" }}>
                      <div style={{
                        width: `${pct}%`, height: "100%",
                        background: "linear-gradient(90deg,#667eea,#764ba2)",
                        borderRadius: "20px", transition: "width 0.5s ease"
                      }} />
                    </div>
                    <span style={{ fontSize: "13px", color: "#667eea", fontWeight: 700, minWidth: "80px", textAlign: "right" }}>
                      {confirmados}/{total} ({pct}%)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {eventos.length === 0 && (
        <div className="card" style={{ textAlign: "center", padding: "40px" }}>
          <p style={{ color: "#666", fontSize: "16px" }}>Ainda não tens convites criados.</p>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
