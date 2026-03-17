const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "convitesdb",
  password: "0000",
  port: 5432,
});

async function testSystem() {
  console.log("🔍 Testando Sistema de Convites Digitais\n");
  
  try {
    // 1. Testar conexão
    console.log("1️⃣ Testando conexão com PostgreSQL...");
    await pool.query("SELECT NOW()");
    console.log("✅ Conexão OK\n");
    
    // 2. Verificar tabelas
    console.log("2️⃣ Verificando tabelas...");
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    const requiredTables = ['usuarios', 'eventos', 'confirmacoes'];
    const existingTables = tables.rows.map(r => r.table_name);
    
    requiredTables.forEach(table => {
      if (existingTables.includes(table)) {
        console.log(`✅ Tabela '${table}' existe`);
      } else {
        console.log(`❌ Tabela '${table}' NÃO existe`);
      }
    });
    console.log();
    
    // 3. Verificar estrutura da tabela usuarios
    console.log("3️⃣ Verificando estrutura da tabela 'usuarios'...");
    const userColumns = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'usuarios'
      ORDER BY ordinal_position
    `);
    
    if (userColumns.rows.length > 0) {
      console.log("Colunas encontradas:");
      userColumns.rows.forEach(col => {
        console.log(`  - ${col.column_name} (${col.data_type})`);
      });
      
      const hasGoogleId = userColumns.rows.some(col => col.column_name === 'google_id');
      if (hasGoogleId) {
        console.log("✅ Campo 'google_id' existe (OAuth configurado)");
      } else {
        console.log("⚠️  Campo 'google_id' NÃO existe (OAuth não configurado)");
        console.log("   Execute: ALTER TABLE usuarios ADD COLUMN google_id VARCHAR(255) UNIQUE;");
      }
    } else {
      console.log("❌ Tabela 'usuarios' não existe");
    }
    console.log();
    
    // 4. Verificar estrutura da tabela eventos
    console.log("4️⃣ Verificando estrutura da tabela 'eventos'...");
    const eventColumns = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'eventos'
      ORDER BY ordinal_position
    `);
    
    if (eventColumns.rows.length > 0) {
      console.log("Colunas encontradas:");
      eventColumns.rows.forEach(col => {
        console.log(`  - ${col.column_name} (${col.data_type})`);
      });
      
      const hasUserId = eventColumns.rows.some(col => col.column_name === 'usuario_id');
      if (hasUserId) {
        console.log("✅ Campo 'usuario_id' existe (eventos vinculados a usuários)");
      } else {
        console.log("⚠️  Campo 'usuario_id' NÃO existe");
        console.log("   Execute: ALTER TABLE eventos ADD COLUMN usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE;");
      }
    } else {
      console.log("❌ Tabela 'eventos' não existe");
    }
    console.log();
    
    // 5. Contar registros
    console.log("5️⃣ Contando registros...");
    
    const userCount = await pool.query("SELECT COUNT(*) FROM usuarios");
    console.log(`👥 Usuários: ${userCount.rows[0].count}`);
    
    const eventCount = await pool.query("SELECT COUNT(*) FROM eventos");
    console.log(`🎊 Eventos: ${eventCount.rows[0].count}`);
    
    const confirmCount = await pool.query("SELECT COUNT(*) FROM confirmacoes");
    console.log(`✅ Confirmações: ${confirmCount.rows[0].count}`);
    console.log();
    
    // 6. Verificar índices
    console.log("6️⃣ Verificando índices...");
    const indexes = await pool.query(`
      SELECT indexname, tablename 
      FROM pg_indexes 
      WHERE schemaname = 'public' 
      AND tablename IN ('usuarios', 'eventos', 'confirmacoes')
      ORDER BY tablename, indexname
    `);
    
    if (indexes.rows.length > 0) {
      console.log("Índices encontrados:");
      indexes.rows.forEach(idx => {
        console.log(`  - ${idx.tablename}.${idx.indexname}`);
      });
    } else {
      console.log("⚠️  Nenhum índice encontrado");
    }
    console.log();
    
    // 7. Resumo final
    console.log("📊 RESUMO:");
    console.log("━".repeat(50));
    
    const allTablesExist = requiredTables.every(t => existingTables.includes(t));
    const hasGoogleId = userColumns.rows.some(col => col.column_name === 'google_id');
    const hasUserId = eventColumns.rows.some(col => col.column_name === 'usuario_id');
    
    if (allTablesExist && hasGoogleId && hasUserId) {
      console.log("✅ Sistema COMPLETO e pronto para uso!");
      console.log("✅ Autenticação configurada");
      console.log("✅ OAuth Google pronto (configure as credenciais)");
      console.log("✅ Eventos vinculados a usuários");
    } else {
      console.log("⚠️  Sistema PARCIALMENTE configurado");
      if (!allTablesExist) console.log("❌ Faltam tabelas - execute database.sql");
      if (!hasGoogleId) console.log("⚠️  OAuth não configurado - adicione campo google_id");
      if (!hasUserId) console.log("⚠️  Eventos não vinculados - adicione campo usuario_id");
    }
    
    console.log("\n🚀 Para iniciar:");
    console.log("   Backend:  cd backend && npm run dev");
    console.log("   Frontend: cd .. && npm start");
    
  } catch (err) {
    console.error("\n❌ ERRO:", err.message);
    console.log("\n💡 Possíveis soluções:");
    console.log("   1. Verifica se o PostgreSQL está rodando");
    console.log("   2. Confirma as credenciais em server.js");
    console.log("   3. Cria o banco: CREATE DATABASE convitesdb;");
    console.log("   4. Executa: psql -U postgres -d convitesdb -f database.sql");
  } finally {
    await pool.end();
  }
}

testSystem();
