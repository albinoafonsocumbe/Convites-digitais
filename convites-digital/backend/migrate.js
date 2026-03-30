require("dotenv").config();
const pool = require("./db");

async function migrate() {
  const client = await pool.connect();
  try {
    console.log("A verificar e actualizar colunas da tabela eventos...\n");

    const migrations = [
      { col: "musica_url",     sql: "ALTER TABLE eventos ADD COLUMN IF NOT EXISTS musica_url VARCHAR(500)" },
      { col: "video_url",      sql: "ALTER TABLE eventos ADD COLUMN IF NOT EXISTS video_url VARCHAR(500)" },
      { col: "videos_urls",    sql: "ALTER TABLE eventos ADD COLUMN IF NOT EXISTS videos_urls TEXT[]" },
      { col: "fotos",          sql: "ALTER TABLE eventos ADD COLUMN IF NOT EXISTS fotos TEXT[]" },
      { col: "foto_capa",      sql: "ALTER TABLE eventos ADD COLUMN IF NOT EXISTS foto_capa VARCHAR(500)" },
      { col: "hora_evento",    sql: "ALTER TABLE eventos ADD COLUMN IF NOT EXISTS hora_evento VARCHAR(10)" },
      { col: "endereco_maps",  sql: "ALTER TABLE eventos ADD COLUMN IF NOT EXISTS endereco_maps VARCHAR(500)" },
      { col: "programa",       sql: "ALTER TABLE eventos ADD COLUMN IF NOT EXISTS programa JSONB DEFAULT '[]'" },
      { col: "refeicao",       sql: "ALTER TABLE eventos ADD COLUMN IF NOT EXISTS refeicao JSONB DEFAULT '{}'" },
    ];

    for (const m of migrations) {
      await client.query(m.sql);
      console.log(`✅ ${m.col}`);
    }

    // Verificar resultado final
    const { rows } = await client.query(
      "SELECT column_name FROM information_schema.columns WHERE table_name='eventos' ORDER BY ordinal_position"
    );
    console.log("\nColunas actuais na tabela eventos:");
    rows.forEach(r => console.log("  -", r.column_name));
    console.log("\nMigração concluída com sucesso!");
  } catch (err) {
    console.error("Erro na migração:", err.message);
  } finally {
    client.release();
    process.exit(0);
  }
}

migrate();
