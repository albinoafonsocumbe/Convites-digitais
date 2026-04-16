import { Link } from "react-router-dom";
import "../styles/global.css";
import "../styles/Pages.css";

function LandingPage() {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: "#0f0c29", minHeight: "100vh", color: "white" }}>

      {/* Navbar pública */}
      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 40px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <span style={{ fontWeight: 800, fontSize: "20px", background: "linear-gradient(135deg,#667eea,#f5576c)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          Convites Digitais
        </span>
        <div style={{ display: "flex", gap: "12px" }}>
          <Link to="/login">
            <button style={{ background: "transparent", border: "1.5px solid rgba(255,255,255,0.3)", color: "white", padding: "8px 20px", borderRadius: "8px", cursor: "pointer", fontSize: "14px", fontWeight: 600 }}>
              Entrar
            </button>
          </Link>
          <Link to="/registro">
            <button style={{ background: "linear-gradient(135deg,#667eea,#764ba2)", border: "none", color: "white", padding: "8px 20px", borderRadius: "8px", cursor: "pointer", fontSize: "14px", fontWeight: 600 }}>
              Criar Conta
            </button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ textAlign: "center", padding: "80px 20px 60px", maxWidth: "800px", margin: "0 auto" }}>
        <p style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "4px", textTransform: "uppercase", color: "rgba(255,255,255,0.5)", marginBottom: "20px" }}>
          Plataforma de Convites Online
        </p>
        <h1 style={{ fontSize: "clamp(36px,6vw,64px)", fontWeight: 900, lineHeight: 1.1, marginBottom: "24px", background: "linear-gradient(135deg,#fff 40%,#667eea)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          Cria Convites Digitais Personalizados
        </h1>
        <p style={{ fontSize: "18px", color: "rgba(255,255,255,0.7)", lineHeight: 1.7, marginBottom: "40px", maxWidth: "560px", margin: "0 auto 40px" }}>
          Cria convites digitais para casamentos, aniversários, festas e qualquer evento. Gere convidados, confirmações de presença (RSVP) e muito mais — completamente grátis.
        </p>
        <div style={{ display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap" }}>
          <Link to="/registro">
            <button style={{ background: "linear-gradient(135deg,#667eea,#764ba2)", border: "none", color: "white", padding: "14px 36px", borderRadius: "10px", cursor: "pointer", fontSize: "16px", fontWeight: 700, boxShadow: "0 8px 24px rgba(102,126,234,0.4)" }}>
              Começar Grátis
            </button>
          </Link>
          <Link to="/login">
            <button style={{ background: "rgba(255,255,255,0.08)", border: "1.5px solid rgba(255,255,255,0.2)", color: "white", padding: "14px 36px", borderRadius: "10px", cursor: "pointer", fontSize: "16px", fontWeight: 600 }}>
              Já tenho conta
            </button>
          </Link>
        </div>
      </section>

      {/* Funcionalidades */}
      <section style={{ padding: "60px 20px", maxWidth: "1000px", margin: "0 auto" }}>
        <h2 style={{ textAlign: "center", fontSize: "32px", fontWeight: 800, marginBottom: "48px", color: "white" }}>
          Tudo o que precisas para o teu evento
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "24px" }}>
          {[
            { icon: "✉️", titulo: "Convites Personalizados", desc: "Cria convites digitais elegantes para casamentos, aniversários, batizados, festas e qualquer evento especial." },
            { icon: "✅", titulo: "RSVP Online", desc: "Sistema completo de confirmação de presença. Os convidados confirmam diretamente pelo link do convite." },
            { icon: "📊", titulo: "Gestão de Convidados", desc: "Acompanha confirmações, número de acompanhantes e estatísticas em tempo real." },
            { icon: "🎵", titulo: "Música e Fotos", desc: "Adiciona música de fundo, fotos e vídeos ao teu convite para uma experiência única." },
            { icon: "📍", titulo: "Localização no Mapa", desc: "Inclui o local do evento com mapa integrado para que os convidados encontrem facilmente." },
            { icon: "📱", titulo: "Partilha Fácil", desc: "Partilha o convite por WhatsApp, email ou qualquer rede social com um simples link." },
          ].map((f, i) => (
            <div key={i} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", padding: "28px 24px" }}>
              <div style={{ fontSize: "32px", marginBottom: "14px" }}>{f.icon}</div>
              <h3 style={{ fontSize: "17px", fontWeight: 700, marginBottom: "10px", color: "white" }}>{f.titulo}</h3>
              <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.6)", lineHeight: 1.6, margin: 0 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tipos de eventos */}
      <section style={{ padding: "60px 20px", maxWidth: "800px", margin: "0 auto", textAlign: "center" }}>
        <h2 style={{ fontSize: "28px", fontWeight: 800, marginBottom: "16px" }}>
          Para todos os tipos de eventos
        </h2>
        <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "15px", marginBottom: "32px", lineHeight: 1.6 }}>
          Convite digital para casamento, convite de aniversário online, convite de batizado, convite de festa de formatura, convite de festa infantil e muito mais.
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", justifyContent: "center" }}>
          {["Casamento", "Aniversário", "Batizado", "Formatura", "Festa Infantil", "Noivado", "Chá de Bebé", "Evento Corporativo"].map((t, i) => (
            <span key={i} style={{ background: "rgba(102,126,234,0.15)", border: "1px solid rgba(102,126,234,0.3)", color: "#a5b4fc", padding: "8px 18px", borderRadius: "20px", fontSize: "13px", fontWeight: 600 }}>{t}</span>
          ))}
        </div>
      </section>

      {/* CTA final */}
      <section style={{ textAlign: "center", padding: "60px 20px 80px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <h2 style={{ fontSize: "32px", fontWeight: 800, marginBottom: "16px" }}>Pronto para criar o teu convite?</h2>
        <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "16px", marginBottom: "32px" }}>Grátis, sem cartão de crédito, sem complicações.</p>
        <Link to="/registro">
          <button style={{ background: "linear-gradient(135deg,#667eea,#764ba2)", border: "none", color: "white", padding: "16px 48px", borderRadius: "12px", cursor: "pointer", fontSize: "17px", fontWeight: 700, boxShadow: "0 8px 32px rgba(102,126,234,0.4)" }}>
            Criar Conta Grátis
          </button>
        </Link>
      </section>

    </div>
  );
}

export default LandingPage;
