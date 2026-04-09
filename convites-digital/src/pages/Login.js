import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { authAPI } from "../services/api";
import "../styles/global.css";
import "../styles/Pages.css";

const API_HOST = process.env.REACT_APP_API_URL
  || (window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : `http://${window.location.hostname}:5000`);

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const mensagemBemVindo = location.state?.mensagem || "";
  const emailPre = location.state?.email || "";
  const [form, setForm] = useState({ email: emailPre, senha: "" });
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  const ch = (e) => { setForm({ ...form, [e.target.name]: e.target.value }); setErro(""); };

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true); setErro("");
    try {
      const r = await authAPI.login(form);
      localStorage.setItem("token", r.token);
      localStorage.setItem("user", JSON.stringify(r.user));
      sessionStorage.setItem("token", r.token);
      sessionStorage.setItem("user", JSON.stringify(r.user));
      navigate("/");
    } catch (err) {
      setErro(err.message || "Erro ao fazer login.");
      setLoading(false);
    }
  };

  const handleGoogle = () => {
    window.location.href = `${API_HOST}/api/auth/google`;
  };

  return (
    <div className="page-container">
      <div style={{ maxWidth: "420px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <h1 className="page-title" style={{ marginBottom: "8px" }}>Entrar</h1>
          <p style={{ color: "white", fontSize: "15px", opacity: 0.85 }}>Gere os teus convites digitais</p>
        </div>

        <div className="form-container">
          {mensagemBemVindo && (
            <div className="alert alert-success" style={{ marginBottom: "16px" }}>{mensagemBemVindo}</div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email</label>
              <input type="email" name="email" value={form.email} onChange={ch} required placeholder="seu@email.com" autoComplete="email" />
            </div>
            <div className="form-group">
              <label>Senha</label>
              <input type="password" name="senha" value={form.senha} onChange={ch} required placeholder="••••••••" autoComplete="current-password" />
              <div style={{ textAlign: "right", marginTop: "4px" }}>
                <Link to="/esqueci-senha" style={{ fontSize: "12px", color: "#667eea" }}>Esqueci a senha</Link>
              </div>
            </div>

            {erro && <div className="alert alert-error" style={{ marginBottom:"16px" }}>{erro}</div>}

            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width:"100%", padding:"12px", fontSize:"15px" }}>
              {loading ? "A entrar..." : "Entrar"}
            </button>
          </form>

          <div style={{ textAlign:"center", marginTop:"20px", paddingTop:"20px", borderTop:"1px solid #eee" }}>
            <p style={{ color:"#888", fontSize:"13px", marginBottom:"10px" }}>Ainda não tens conta?</p>
            <Link to="/registro">
              <button className="btn" style={{ background:"transparent", border:"1.5px solid #667eea", color:"#667eea", padding:"9px 24px", fontSize:"14px" }}>
                Criar Conta
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
