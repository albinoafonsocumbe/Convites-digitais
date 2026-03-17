const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "convitesdb",
  password: "0000",
  port: 5432,
});

async function setupDatabase() {
  console.log("🚀 Configurando banco de dados...\n");
  
  try {
    // 1. Criar tabela de usuários
    console.log("1️⃣ Criando tabela 'usuarios'...");
    await pool.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        senha VARCHAR(255) NOT NULL,
        google_id VARCHAR(255) UNIQUE,
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("✅ Tabela 'usuarios' criada\n");
    
    // 2. Verificar e adicionar campos na tabela eventos
    console.log("2️⃣ Atualizando tabela 'eventos'...");
    
    // Adicionar usuario_id
    try {
      await pool.query(`
        ALTER TABLE eventos 
        ADD COLUMN IF NOT EXISTS usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE
      `);
      console.log("✅ Campo 'usuario_id' adicionado");
    } catch (err) {
      if (err.message.includes("already exists") || err.message.includes("já existe")) {
        console.log("✅ Campo 'usuario_id' já existe");
      } else {
        throw err;
      }
    }
    
    // Adicionar criado_em
    try {
      await pool.query(`
        ALTER TABLE eventos 
        ADD COLUMN IF NOT EXISTS criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      `);
      console.log("✅ Campo 'criado_em' adicionado\n");
    } catch (err) {
      if (err.message.includes("already exists") || err.message.includes("já existe")) {
        console.log("✅ Campo 'criado_em' já existe\n");
      } else {
        throw err;
      }
    }
    
    // 3. Criar tabela de confirmações
    console.log("3️⃣ Criando tabela 'confirmacoes'...");
    await pool.query(`
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
      )
    `);
    console.log("✅ Tabela 'confirmacoes' criada\n");
    
    // 4. Criar índices
    console.log("4️⃣ Criando índices...");
    
    const indexes = [
      { name: "idx_eventos_usuario", sql: "CREATE INDEX IF NOT EXISTS idx_eventos_usuario ON eventos(usuario_id)" },
      { name: "idx_eventos_data", sql: "CREATE INDEX IF NOT EXISTS idx_eventos_data ON eventos(data_evento)" },
      { name: "idx_confirmacoes_evento", sql: "CREATE INDEX IF NOT EXISTS idx_confirmacoes_evento ON confirmacoes(evento_id)" },
      { name: "idx_usuarios_email", sql: "CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email)" }
    ];
    
    for (const index of indexes) {
      await pool.query(index.sql);
      console.log(`✅ Índice '${index.name}' criado`);
    }
    console.log();
    
    // 5. Verificar estrutura final
    console.log("5️⃣ Verificando estrutura final...\n");
    
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('usuarios', 'eventos', 'confirmacoes')
      ORDER BY table_name
    `);
    
    console.log("📊 Tabelas criadas:");
    tables.rows.forEach(t => console.log(`   ✅ ${t.table_name}`));
    console.log();
    
    // 6. Contar registros
    const userCount = await pool.query("SELECT COUNT(*) FROM usuarios");
    const eventCount = await pool.query("SELECT COUNT(*) FROM eventos");
    const confirmCount = await pool.query("SELECT COUNT(*) FROM confirmacoes");
    
    console.log("📈 Registros existentes:");
    console.log(`   👥 Usuários: ${userCount.rows[0].count}`);
    console.log(`   🎊 Eventos: ${eventCount.rows[0].count}`);
    console.log(`   ✅ Confirmações: ${confirmCount.rows[0].count}`);
    console.log();
    
    // 7. Sucesso
    console.log("━".repeat(60));
    console.log("🎉 BANCO DE DADOS CONFIGURADO COM SUCESSO!");
    console.log("━".repeat(60));
    console.log("\n✅ Sistema pronto para uso!");
    console.log("\n🚀 Próximos passos:");
    console.log("   1. Inicia o backend:  npm run dev");
    console.log("   2. Inicia o frontend: cd .. && npm start");
    console.log("   3. Acessa: http://localhost:3000");
    console.log("\n💡 Para login com Google:");
    console.log("   - Lê o arquivo GOOGLE_OAUTH_SETUP.md");
    console.log("   - Configura as credenciais no passport-config.js\n");
    
  } catch (err) {
    console.error("\n❌ ERRO:", err.message);
    console.log("\n💡 Possíveis soluções:");
    console.log("   1. Verifica se o PostgreSQL está rodando");
    console.log("   2. Confirma as credenciais (user, password, database)");
    console.log("   3. Cria o banco: CREATE DATABASE convitesdb;");
    console.log("   4. Verifica se tens permissões no PostgreSQL\n");
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Executar
setupDatabase();
