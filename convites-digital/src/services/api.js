// Em producao usa o URL do Render, em dev usa localhost ou o IP da maquina
const API_HOST = process.env.REACT_APP_API_URL
  || (window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : `http://${window.location.hostname}:5000`);

const API_URL = `${API_HOST}/api`;

// Função auxiliar para tratar erros
const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Erro desconhecido" }));
    throw new Error(error.error || `Erro ${response.status}`);
  }
  return response.json();
};

// Função para testar conexão com backend
export const testarConexao = async () => {
  try {
    const response = await fetch(`${API_HOST}/`, {
      method: "GET",
      headers: { "Content-Type": "application/json" }
    });
    const data = await response.json();
    console.log("✅ Backend conectado:", data.message);
    return true;
  } catch (error) {
    console.error("❌ Erro ao conectar com backend:", error.message);
    return false;
  }
};

// Função para obter o token
const getAuthHeaders = () => {
  const token = sessionStorage.getItem("token") || localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token && { "Authorization": `Bearer ${token}` })
  };
};

// API de Autenticação
export const authAPI = {
  // Registro
  registro: async (dados) => {
    try {
      console.log("📝 Tentando registro em:", `${API_URL}/auth/registro`);
      console.log("📤 Dados:", { nome: dados.nome, email: dados.email, senha: "***" });
      
      const response = await fetch(`${API_URL}/auth/registro`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados),
      });
      
      console.log("📥 Resposta recebida:", response.status);
      return handleResponse(response);
    } catch (error) {
      console.error("❌ Erro na requisição:", error);
      throw error;
    }
  },

  // Login
  login: async (dados) => {
    try {
      console.log("🔐 Tentando login em:", `${API_URL}/auth/login`);
      console.log("📤 Dados:", { email: dados.email, senha: "***" });
      
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados),
      });
      
      console.log("📥 Resposta recebida:", response.status);
      return handleResponse(response);
    } catch (error) {
      console.error("❌ Erro na requisição:", error);
      throw error;
    }
  },

  // Verificar usuário atual
  me: async () => {
    const response = await fetch(`${API_URL}/auth/me`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Logout
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },
};

export const convitesAPI = {
  // Listar todos os convites com filtros opcionais
  listar: async (filtros = {}) => {
    const params = new URLSearchParams();
    if (filtros.status) params.append("status", filtros.status);
    if (filtros.limit) params.append("limit", filtros.limit);
    if (filtros.page) params.append("page", filtros.page);

    const url = `${API_URL}/convites${params.toString() ? "?" + params.toString() : ""}`;
    const response = await fetch(url, { headers: getAuthHeaders() });
    const result = await handleResponse(response);
    // API retorna { data, total, page, limit } — extrair só o array
    return Array.isArray(result) ? result : (result.data || []);
  },

  // Buscar convite por ID
  buscarPorId: async (id) => {
    const response = await fetch(`${API_URL}/convites/${id}`);
    return handleResponse(response);
  },

  // Criar novo convite
  criar: async (convite) => {
    const response = await fetch(`${API_URL}/convites`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(convite),
    });
    return handleResponse(response);
  },

  // Atualizar convite
  atualizar: async (id, convite) => {
    const response = await fetch(`${API_URL}/convites/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(convite),
    });
    return handleResponse(response);
  },

  // Deletar convite
  deletar: async (id) => {
    const response = await fetch(`${API_URL}/convites/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

// API de Confirmações
export const confirmacoesAPI = {
  // Listar confirmações de um evento
  listar: async (eventoId) => {
    const response = await fetch(`${API_URL}/convites/${eventoId}/confirmacoes`);
    return handleResponse(response);
  },

  // Criar confirmação
  criar: async (eventoId, confirmacao) => {
    const response = await fetch(`${API_URL}/convites/${eventoId}/confirmacoes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(confirmacao),
    });
    return handleResponse(response);
  },

  // Atualizar confirmação
  atualizar: async (id, dados) => {
    const response = await fetch(`${API_URL}/confirmacoes/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados),
    });
    return handleResponse(response);
  },

  // Deletar confirmação
  deletar: async (id) => {
    const response = await fetch(`${API_URL}/confirmacoes/${id}`, {
      method: "DELETE",
    });
    return handleResponse(response);
  },

  // Estatísticas do evento
  estatisticas: async (eventoId) => {
    const response = await fetch(`${API_URL}/convites/${eventoId}/estatisticas`);
    return handleResponse(response);
  },
};

// API de Email
export const emailAPI = {
  enviarConvite: async (eventoId, emails) => {
    const response = await fetch(`${API_URL}/convites/${eventoId}/enviar-email`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ emails }),
    });
    return handleResponse(response);
  },
};

// Upload de ficheiros (fotos, videos, audio) via backend -> Cloudinary
export const uploadAPI = {
  upload: async (file, tipo) => {
    const token = sessionStorage.getItem("token") || localStorage.getItem("token");
    const fd = new FormData();
    fd.append("file", file);
    fd.append("tipo", tipo); // image | video | audio
    const response = await fetch(`${API_URL}/upload`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: fd,
    });
    return handleResponse(response);
  },
};
