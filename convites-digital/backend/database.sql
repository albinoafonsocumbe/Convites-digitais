-- Criar banco de dados
CREATE DATABASE convites_digitais;

-- Conectar ao banco de dados
\c convites_digitais;

-- Criar tabela de usuários
CREATE TABLE usuarios (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  senha VARCHAR(255) NOT NULL,
  google_id VARCHAR(255) UNIQUE,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar tabela de convites
CREATE TABLE convites (
  id SERIAL PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT,
  data DATE NOT NULL,
  local VARCHAR(255) NOT NULL,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar tabela de eventos (compatibilidade)
CREATE TABLE eventos (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
  nome_evento VARCHAR(255) NOT NULL,
  mensagem TEXT,
  data_evento DATE NOT NULL,
  local_evento VARCHAR(255) NOT NULL,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar tabela de convidados/confirmações
CREATE TABLE confirmacoes (
  id SERIAL PRIMARY KEY,
  evento_id INTEGER REFERENCES eventos(id) ON DELETE CASCADE,
  nome_convidado VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  telefone VARCHAR(50),
  confirmado BOOLEAN DEFAULT false,
  numero_acompanhantes INTEGER DEFAULT 0,
  mensagem TEXT,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar índices para melhor performance
CREATE INDEX idx_eventos_usuario ON eventos(usuario_id);
CREATE INDEX idx_eventos_data ON eventos(data_evento);
CREATE INDEX idx_confirmacoes_evento ON confirmacoes(evento_id);
CREATE INDEX idx_usuarios_email ON usuarios(email);

-- Inserir usuário de exemplo (senha: 123456)
INSERT INTO usuarios (nome, email, senha) VALUES
('Admin', 'admin@convites.com', '$2a$10$rKvVXqQJQqQqQqQqQqQqQeO7Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8');

-- Inserir dados de exemplo
INSERT INTO eventos (usuario_id, nome_evento, mensagem, data_evento, local_evento) VALUES
(1, 'Aniversário do João', 'Festa de aniversário de 30 anos', '2026-04-15', 'Salão de Festas Central'),
(1, 'Casamento Maria e Pedro', 'Cerimônia de casamento', '2026-06-20', 'Igreja São José');
