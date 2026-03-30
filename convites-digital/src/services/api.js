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

// Upload directo ao Cloudinary (nao depende do backend)
export const uploadAPI = {
  upload: async (file, tipo, onProgress) => {
    const cloudName = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME || "dzpbjhut2";
    const preset    = process.env.REACT_APP_CLOUDINARY_PRESET || "Convites";

    const resourceType = tipo === "image" ? "image" : "video";

    const maxSize = tipo === "image" ? 10 * 1024 * 1024 : 200 * 1024 * 1024;
    if (file.size > maxSize) {
      const maxMB = maxSize / 1024 / 1024;
      throw new Error(`Ficheiro demasiado grande. Máximo: ${maxMB}MB`);
    }

    const fd = new FormData();
    fd.append("file", file);
    fd.append("upload_preset", preset);
    fd.append("folder", "convites");

    // Usar XMLHttpRequest para suportar progresso em ficheiros grandes
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`);

      if (onProgress) {
        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
        });
      }

      xhr.addEventListener("load", () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const data = JSON.parse(xhr.responseText);
          resolve({ url: data.secure_url });
        } else {
          const body = JSON.parse(xhr.responseText || "{}");
          const msg = body.error?.message || `Erro ${xhr.status}`;
          if (msg.includes("Upload preset not found")) return reject(new Error("Preset de upload não encontrado. Verifica REACT_APP_CLOUDINARY_PRESET no .env"));
          if (msg.includes("storage limit")) return reject(new Error("Limite de armazenamento Cloudinary atingido."));
          if (msg.includes("File size too large")) return reject(new Error("Ficheiro demasiado grande para o Cloudinary."));
          reject(new Error(msg));
        }
      });

      xhr.addEventListener("error", () => reject(new Error("Sem ligação à internet ou Cloudinary inacessível.")));
      xhr.addEventListener("timeout", () => reject(new Error("Timeout no upload. Tenta com um ficheiro mais pequeno.")));
      xhr.timeout = 300000; // 5 minutos

      xhr.send(fd);
    });
  },
};
