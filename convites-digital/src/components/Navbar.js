import { Link, useNavigate } from "react-router-dom";
import "../styles/Navbar.css";

function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(sessionStorage.getItem("user") || "null");
  const isAuthenticated = !!sessionStorage.getItem("token");

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <Link to="/" style={{ textDecoration: "none" }}>
        <h2 className="navbar-brand">Convites Digitais</h2>
      </Link>
      <div className="navbar-links">
        <Link to="/">Home</Link>
        {isAuthenticated ? (
          <>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/criar-convite">Criar Convite</Link>
            <Link to="/meus-convites">Meus Convites</Link>
            <div style={{ display: "flex", alignItems: "center", gap: "15px", marginLeft: "15px", paddingLeft: "15px", borderLeft: "2px solid #e0e0e0" }}>
              <span style={{ color: "#667eea", fontWeight: 600 }}>{user?.nome}</span>
              <button
                onClick={handleLogout}
                style={{
                  padding: "8px 16px",
                  background: "linear-gradient(135deg, #f5576c 0%, #f093fb 100%)",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: "14px"
                }}
              >
                Sair
              </button>
            </div>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/registro">Criar Conta</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
