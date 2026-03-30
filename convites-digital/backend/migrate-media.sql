-- Migração: adicionar suporte a media nos eventos
ALTER TABLE eventos ADD COLUMN IF NOT EXISTS musica_url VARCHAR(500);
ALTER TABLE eventos ADD COLUMN IF NOT EXISTS video_url VARCHAR(500);
ALTER TABLE eventos ADD COLUMN IF NOT EXISTS fotos TEXT[];

-- Adicionar suporte a multiplos videos
ALTER TABLE eventos ADD COLUMN IF NOT EXISTS videos_urls TEXT[];
