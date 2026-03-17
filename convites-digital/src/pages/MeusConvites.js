import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { convitesAPI } from "../services/api";
import "../styles/global.css";
import "../styles/Convites.css";

function MeusConvites() {
  const navigate = useNavigate();
  const [convites, setConvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [editando, setEditando] = useState(null);
  const [formEdit, setFormEdit] = useState({});

  useEffect(() => {
    carregarConvites();
  }, []);

  const carregarConvites = async () => {
    try {
      const data = await convitesAPI.listar();
      setConvites(data);
      setLoading(false);
    } catch (error) {
      setErro("Erro ao carregar convites: " + error.message);
      setLoading(false);
    }
  };

  const deletarConvite = async (id) => {
    if (window.confirm("Tens certeza que desejas deletar este convite?")) {
      try {
        await convitesAPI.deletar(id);
        carregarConvites();
      } catch (error) {
        alert("Erro ao deletar convite: " + error.message);
      }
    }
  };

  const iniciarEdicao = (convite) => {
    setEditando(convite.id);
    setFormEdit({
      titulo: convite.nome_evento,
      descricao: convite.mensagem,
      data: convite.data_evento.split('T')[0],
      local: convite.local_evento,
    });
  };

  const cancelarEdicao = () => {
    setEditando(null);
    setFormEdit({});
  };

  const salvarEdicao = async (id) => {
    try {
      await convitesAPI.atualizar(id, formEdit);
      setEditando(null);
      carregarConvites();
    } catch (error) {
      alert("Erro ao atualizar convite: " + error.message);
    }
  };

  if (loading) return <div className="page-container"><div className="card" style={{ textAlign: "center" }}>Carregando...</div></div>;
  if (erro) return <div className="page-container"><div className="alert alert-error">{erro}</div></div>;

  return (
    <div className="page-container">
      <h1 className="page-title">Meus Convites</h1>
      {convites.length === 0 ? (
        <div className="card" style={{ textAlign: "center" }}>
          <p style={{ fontSize: "18px", color: "#666" }}>Nenhum convite criado ainda.</p>
        </div>
      ) : (
        <div className="convites-grid">
          {convites.map((convite) => (
            <div key={convite.id} className="convite-card">
              {editando === convite.id ? (
                <div>
                  <input
                    type="text"
                    value={formEdit.titulo}
                    onChange={(e) => setFormEdit({...formEdit, titulo: e.target.value})}
                    style={{ width: "100%", padding: "8px", marginBottom: "10px", border: "2px solid #667eea", borderRadius: "5px" }}
                  />
                  <textarea
                    value={formEdit.descricao}
                    onChange={(e) => setFormEdit({...formEdit, descricao: e.target.value})}
                    style={{ width: "100%", padding: "8px", marginBottom: "10px", border: "2px solid #667eea", borderRadius: "5px", minHeight: "60px" }}
                  />
                  <input
                    type="date"
                    value={formEdit.data}
                    onChange={(e) => setFormEdit({...formEdit, data: e.target.value})}
                    style={{ width: "100%", padding: "8px", marginBottom: "10px", border: "2px solid #667eea", borderRadius: "5px" }}
                  />
                  <input
                    type="text"
                    value={formEdit.local}
                    onChange={(e) => setFormEdit({...formEdit, local: e.target.value})}
                    style={{ width: "100%", padding: "8px", marginBottom: "10px", border: "2px solid #667eea", borderRadius: "5px" }}
                  />
                  <div style={{ display: "flex", gap: "10px" }}>
                    <button onClick={() => salvarEdicao(convite.id)} className="btn btn-primary" style={{ flex: 1 }}>
                      Salvar
                    </button>
                    <button onClick={cancelarEdicao} className="btn" style={{ flex: 1, background: "#999", color: "white" }}>
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <h3>{convite.nome_evento}</h3>
                  <p>{convite.mensagem}</p>
                  <div className="convite-info">
                    <strong>Data:</strong> {new Date(convite.data_evento).toLocaleDateString()}
                  </div>
                  <div className="convite-info">
                    <strong>Local:</strong> {convite.local_evento}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "15px" }}>
                    <button
                      onClick={() => navigate(`/evento/${convite.id}`)}
                      className="btn"
                      style={{ background: "#4facfe", color: "white" }}
                    >
                      Enviar Convite
                    </button>
                    <button
                      onClick={() => iniciarEdicao(convite)}
                      className="btn btn-primary"
                    >
                      Editar
                    </button>
                  </div>
                  <button
                    onClick={() => deletarConvite(convite.id)}
                    className="btn btn-danger"
                    style={{ width: "100%", marginTop: "10px" }}
                  >
                    Deletar
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MeusConvites;
