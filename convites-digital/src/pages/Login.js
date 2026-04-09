import { useLocation } from "react-router-dom";
import "../styles/global.css";
import "../styles/Pages.css";

const API_HOST = process.env.REACT_APP_API_URL
  || (window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : `http://${window.location.hostname}:5000`);

function Login() {
  const location = useLocation();
  const mensagem = location.state?.mensagem || "";

  const handleGoogle = () => {
    window.location.href = `${API_HOST}/api/auth/google`;
  };

  return (
    <div className="page-container">
      <div style={{ maxWidth: "400px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <img src="/android-chrome-192x192.png" alt="Logo" style={{ width: "80px", height: "80px", borderRadius: "50%", marginBottom: "16px", objectFit: "cover" }} />
          <h1 className="page-title" style={{ marginBottom: "8px" }}>Convites Digitais</h1>
          <p style={{ color: "white", fontSize: "15px", opacity: 0.85 }}>Entra com a tua conta Google</p>
        </div>

        <div className="form-container" style={{ textAlign: "center" }}>
          {mensagem && (
            <div className="alert alert-success" style={{ marginBottom: "20px" }}>{mensagem}</div>
          )}

          <p style={{ color: "#555", fontSize: "14px", marginBottom: "24px", lineHeight: 1.6 }}>
            Usa a tua conta Google para aceder ao sistema de forma segura e rápida.
          </p>

          <button
            type="button"
            onClick={handleGoogle}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "12px",
              padding: "14px 20px",
              background: "white",
              border: "1.5px solid #ddd",
              borderRadius: "10px",
              cursor: "pointer",
              fontSize: "15px",
              fontWeight: 600,
              color: "#333",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              transition: "box-shadow 0.2s",
            }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.15)"}
            onMouseLeave={e => e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.08)"}
          >
            <svg width="20" height="20" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            Continuar com Google
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;
