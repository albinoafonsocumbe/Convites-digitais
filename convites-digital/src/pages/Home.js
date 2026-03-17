import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { convitesAPI } from "../services/api";
import "../styles/global.css";
import "../styles/Pages.css";
import "../styles/Convites.css";

function Home() {
  const [proximosEventos, setProximosEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, proximos: 0 });

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      const convites = await convitesAPI.listar();
      const hoje = new Date();
      const proximos = convites
        .filter(c => new Date(c.data_evento) >= hoje)
        .sort((a, b) => new Date(a.data_evento) - new Date(b.data_evento))
        .slice(0, 3);

      setProximosEventos(proximos);
      setStats({
        total: convites.length,
        proximos: convites.filter(c => new Date(c.data_evento) >= hoje).length
      });
      setLoading(false);
    } catch (error) {
      console.error("Erro ao carregar eventos:", error);
      setLoading(false);
    }
  };

  return (
    <div className="page-container fade-in">
      {/* Hero */}
      <div style={{
        textAlign: "center",
        padding: "80px 20px",
        borderRadius: "24px",
        marginBottom: "40px",
        background: `linear-gradient(rgba(30, 20, 60, 0.62), rgba(102, 60, 160, 0.70)), url('https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=1400&q=80&fit=crop') center/cover no-repeat`,
        boxShadow: "0 20px 60px rgba(0,0,0,0.3)"
      }}>
        <p style={{
          fontSize: "12px", fontWeight: 700, letterSpacing: "4px",
          textTransform: "uppercase", color: "rgba(255,255,255,0.7)", marginBottom: "16px"
        }}>
          Sistema de Convites
        </p>
        <h1 style={{
          fontSize: "52px",
          fontWeight: "900",
          color: "white",
          marginBottom: "16px",
          letterSpacing: "-1.5px",
          lineHeight: "1.1"
        }}>
          Convites Digitais
        </h1>
        <p style={{
          fontSize: "18px",
          color: "rgba(255,255,255,0.85)",
          maxWidth: "500px",
          margin: "0 auto",
          lineHeight: "1.7",
          fontWeight: 400
        }}>
          Cria eventos e gere convidados de forma profissional
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "25px", marginBottom: "50px" }}>
        <div className="card" style={{ textAlign: "center", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "white", border: "none" }}>
          <h3 style={{ fontSize: "42px", margin: "10px 0", fontWeight: "800" }}>{stats.total}</h3>
          <p style={{ fontSize: "18px", opacity: 0.95, fontWeight: "600" }}>Total de Eventos</p>
        </div>
        <div className="card" style={{ textAlign: "center", background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)", color: "white", border: "none" }}>
          <h3 style={{ fontSize: "42px", margin: "10px 0", fontWeight: "800" }}>{stats.proximos}</h3>
          <p style={{ fontSize: "18px", opacity: 0.95, fontWeight: "600" }}>Eventos Próximos</p>
        </div>
      </div>

      {/* Funcionalidades */}
      <div className="card" style={{ marginBottom: "50px" }}>
        <h2 style={{ textAlign: "center", color: "#667eea", marginBottom: "40px", fontSize: "32px", fontWeight: "800" }}>
          Funcionalidades
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "30px" }}>
          <div style={{ textAlign: "center", padding: "20px" }}>
            <h3 style={{ color: "#667eea", marginBottom: "10px", fontSize: "20px" }}>Criar Eventos</h3>
            <p style={{ color: "#666", lineHeight: "1.6" }}>
              Cria convites personalizados com todos os detalhes do teu evento
            </p>
          </div>
          <div style={{ textAlign: "center", padding: "20px" }}>
            <h3 style={{ color: "#667eea", marginBottom: "10px", fontSize: "20px" }}>Confirmar Presença</h3>
            <p style={{ color: "#666", lineHeight: "1.6" }}>
              Sistema completo de RSVP para gerir confirmações
            </p>
          </div>
          <div style={{ textAlign: "center", padding: "20px" }}>
            <h3 style={{ color: "#667eea", marginBottom: "10px", fontSize: "20px" }}>Estatísticas</h3>
            <p style={{ color: "#666", lineHeight: "1.6" }}>
              Acompanha confirmações e número de convidados em tempo real
            </p>
          </div>
        </div>
      </div>

      {/* Proximos Eventos */}
      {!loading && proximosEventos.length > 0 && (
        <div>
          <h2 style={{ color: "white", textAlign: "center", marginBottom: "35px", fontSize: "34px", fontWeight: "800", textShadow: "2px 2px 4px rgba(0,0,0,0.3)" }}>
            Próximos Eventos
          </h2>
          <div className="convites-grid">
            {proximosEventos.map((evento) => (
              <div key={evento.id} className="convite-card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "15px" }}>
                  <h3>{evento.nome_evento}</h3>
                  <span className="badge badge-success">Em Breve</span>
                </div>
                <p>{evento.mensagem}</p>
                <div className="convite-info">
                  <strong>Data:</strong> {new Date(evento.data_evento).toLocaleDateString('pt-PT', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
                <div className="convite-info">
                  <strong>Local:</strong> {evento.local_evento}
                </div>
                <Link to={`/evento/${evento.id}`}>
                  <button className="btn btn-info" style={{ width: "100%", marginTop: "15px" }}>
                    Ver Detalhes
                  </button>
                </Link>
              </div>
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: "40px" }}>
          </div>
        </div>
      )}

      {!loading && proximosEventos.length === 0 && (
        <div className="card" style={{ textAlign: "center", padding: "60px 20px" }}>
          <h3 style={{ color: "#667eea", marginBottom: "15px", fontSize: "26px" }}>
            Nenhum evento criado ainda
          </h3>
          <p style={{ color: "#666", marginBottom: "30px", fontSize: "18px" }}>
            Começa agora a criar o teu primeiro evento.
          </p>
          <Link to="/criar-convite">
            <button className="btn btn-primary" style={{ fontSize: "18px", padding: "16px 40px" }}>
              Criar Primeiro Evento
            </button>
          </Link>
        </div>
      )}
    </div>
  );
}

export default Home;
