import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authAPI } from "../services/api";
import "../styles/global.css";
import "../styles/Pages.css";

function Registro() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ nome: "", email: "", senha: "", confirmarSenha: "" });
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  const ch = (e) => { setForm({ ...form, [e.target.name]: e.target.value }); setErro(""); };

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true); setErro("");

    if (form.senha !== form.confirmarSenha) {
      setErro("As senhas não coincidem"); setLoading(false); return;
    }
    if (form.senha.length < 6) {
      setErro("A senha deve ter no mínimo 6 caracteres"); setLoading(false); return;
    }

    try {
      await authAPI.registro({
        nome: form.nome,
        email: form.email,
        senha: form.senha,
      });
      navigate("/login", { state: { mensagem: "Conta criada com sucesso! Faz login para continuar.", email: form.email } });
    } catch (error) {
      setErro(error.message || "Erro ao criar conta. Tente novamente.");
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div style={{ maxWidth: "500px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <h1 className="page-title" style={{ marginBottom: "8px" }}>Criar Conta</h1>
          <p style={{ color: "white", fontSize: "15px", opacity: 0.9 }}>Começa a criar os teus convites digitais</p>
        </div>

        <div className="form-container">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Nome Completo</label>
              <input type="text" name="nome" value={form.nome} onChange={ch} required placeholder="O teu nome completo" autoComplete="name" />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input type="email" name="email" value={form.email} onChange={ch} required placeholder="seu@email.com" autoComplete="email" />
            </div>

            <div className="form-group">
              <label>Senha</label>
              <input type="password" name="senha" value={form.senha} onChange={ch} required placeholder="Mínimo 6 caracteres" autoComplete="new-password" minLength="6" />
            </div>

            <div className="form-group">
              <label>Confirmar Senha</label>
              <input type="password" name="confirmarSenha" value={form.confirmarSenha} onChange={ch} required placeholder="Repete a senha" autoComplete="new-password" minLength="6" />
            </div>

            {erro && <div className="alert alert-error" style={{ marginBottom: "16px" }}>{erro}</div>}

            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: "100%", fontSize: "16px", padding: "13px" }}>
              {loading ? "A criar conta..." : "Criar Conta"}
            </button>
          </form>

          <div style={{ textAlign: "center", marginTop: "20px", paddingTop: "20px", borderTop: "1px solid #eee" }}>
            <p style={{ color: "#888", fontSize: "13px", marginBottom: "10px" }}>Já tens conta?</p>
            <Link to="/login">
              <button className="btn" style={{ background: "transparent", border: "1.5px solid #667eea", color: "#667eea", padding: "9px 24px", fontSize: "14px" }}>
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
