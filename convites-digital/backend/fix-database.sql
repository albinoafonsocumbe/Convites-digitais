-- Criar tabela de usuários
CREATE TABLE IF NOT EXISTS usuarios (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  senha VARCHAR(255) NOT NULL,
  google_id VARCHAR(255) UNIQUE,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Adicionar campo usuario_id na tabela eventos (se não existir)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'eventos' AND column_name = 'usuario_id'
  ) THEN
    ALTER TABLE eventos ADD COLUMN usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Adicionar campo criado_em na tabela eventos (se não existir)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'eventos' AND column_name = 'criado_em'
  ) THEN
    ALTER TABLE eventos ADD COLUMN criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
  END IF;
END $$;

-- Criar tabela de confirmações
CREATE TABLE IF NOT EXISTS confirmacoes (
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
CREATE INDEX IF NOT EXISTS idx_eventos_usuario ON eventos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_eventos_data ON eventos(data_evento);
CREATE INDEX IF NOT EXISTS idx_confirmacoes_evento ON confirmacoes(evento_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);

-- Mensagem de sucesso
DO $$ 
BEGIN
  RAISE NOTICE 'Database atualizado com sucesso!';
END $$;
