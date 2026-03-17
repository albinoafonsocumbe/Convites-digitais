import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authAPI } from "../services/api";
import "../styles/global.css";
import "../styles/Pages.css";

function Registro() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ nome: "", email: "", senha: "", confirmarSenha: "" });
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

    if (formData.senha !== formData.confirmarSenha) {
      setErro("As senhas não coincidem");
      setLoading(false);
      return;
    }

    if (formData.senha.length < 6) {
      setErro("A senha deve ter no mínimo 6 caracteres");
      setLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setErro("Por favor, insira um email válido");
      setLoading(false);
      return;
    }

    try {
      const response = await authAPI.registro({
        nome: formData.nome,
        email: formData.email,
        senha: formData.senha,
      });
      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));
      sessionStorage.setItem("token", response.token);
      sessionStorage.setItem("user", JSON.stringify(response.user));
      navigate("/");
    } catch (error) {
      if (error.message.includes("NetworkError") || error.message.includes("Failed to fetch")) {
        setErro("Não foi possível conectar ao servidor.");
      } else {
        setErro(error.message || "Erro ao criar conta. Tente novamente.");
      }
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div style={{ maxWidth: "500px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <h1 className="page-title" style={{ marginBottom: "10px" }}>Criar Conta</h1>
          <p style={{ color: "white", fontSize: "18px", opacity: 0.9 }}>
            Comece a criar seus convites digitais agora
          </p>
        </div>

        <div className="form-container">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Nome Completo</label>
              <input
                type="text"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                required
                placeholder="Seu nome completo"
                autoComplete="name"
              />
            </div>

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
                placeholder="Mínimo 6 caracteres"
                autoComplete="new-password"
                minLength="6"
              />
            </div>

            <div className="form-group">
              <label>Confirmar Senha</label>
              <input
                type="password"
                name="confirmarSenha"
                value={formData.confirmarSenha}
                onChange={handleChange}
                required
                placeholder="Digite a senha novamente"
                autoComplete="new-password"
                minLength="6"
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
              {loading ? "Criando conta..." : "Criar Conta"}
            </button>
          </form>

          <div style={{ textAlign: "center", marginTop: "25px", paddingTop: "25px", borderTop: "1px solid #e0e0e0" }}>
            <p style={{ color: "#666", marginBottom: "10px" }}>Já tem uma conta?</p>
            <Link to="/login">
              <button className="btn" style={{ background: "transparent", border: "2px solid #667eea", color: "#667eea" }}>
                Fazer Login
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Registro;
