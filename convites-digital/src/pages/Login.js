import { useState } from "react";
import { useNavigate, Link } from "react-router-dom"; // eslint-disable-line no-unused-vars
import { authAPI } from "../services/api";
import "../styles/global.css";
import "../styles/Pages.css";

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", senha: "" });
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErro("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErro("");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setErro("Por favor, insira um email válido");
      setLoading(false);
      return;
    }

    if (formData.senha.length < 6) {
      setErro("A senha deve ter no mínimo 6 caracteres");
      setLoading(false);
      return;
    }

    try {
      const response = await authAPI.login(formData);
      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));
      sessionStorage.setItem("token", response.token);
      sessionStorage.setItem("user", JSON.stringify(response.user));
      navigate("/");
    } catch (error) {
      if (error.message.includes("NetworkError") || error.message.includes("Failed to fetch")) {
        setErro("Não foi possível conectar ao servidor.");
      } else {
        setErro(error.message || "Erro ao fazer login. Tente novamente.");
      }
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div style={{ maxWidth: "500px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <h1 className="page-title" style={{ marginBottom: "10px" }}>Bem-vindo de Volta</h1>
          <p style={{ color: "white", fontSize: "18px", opacity: 0.9 }}>
            Faça login para gerenciar seus convites
          </p>
        </div>

        <div className="form-container">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="seu@email.com"
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label>Senha</label>
              <input
                type="password"
                name="senha"
                value={formData.senha}
                onChange={handleChange}
                required
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>

            {erro && (
              <div className="alert alert-error" style={{ marginBottom: "20px" }}>
                {erro}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: "100%", fontSize: "18px", padding: "15px" }}
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>

          <div style={{ textAlign: "center", marginTop: "25px", paddingTop: "25px", borderTop: "1px solid #e0e0e0" }}>
            <p style={{ color: "#666", marginBottom: "10px" }}>Ainda não tem uma conta?</p>
            <Link to="/registro">
              <button className="btn" style={{ background: "transparent", border: "2px solid #667eea", color: "#667eea" }}>
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
