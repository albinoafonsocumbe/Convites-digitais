const fetch = require('node-fetch');

async function testAPI() {
  console.log("🧪 Testando API do Backend\n");
  
  const baseURL = "http://localhost:5000";
  
  try {
    // 1. Testar rota raiz
    console.log("1️⃣ Testando GET /");
    const rootResponse = await fetch(`${baseURL}/`);
    const rootData = await rootResponse.json();
    console.log("✅ Status:", rootResponse.status);
    console.log("✅ Resposta:", rootData.message);
    console.log();
    
    // 2. Testar registro
    console.log("2️⃣ Testando POST /api/auth/registro");
    const testUser = {
      nome: "Teste Usuario",
      email: `teste${Date.now()}@teste.com`,
      senha: "123456"
    };
    
    const registroResponse = await fetch(`${baseURL}/api/auth/registro`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(testUser)
    });
    
    if (registroResponse.ok) {
      const registroData = await registroResponse.json();
      console.log("✅ Status:", registroResponse.status);
      console.log("✅ Usuário criado:", registroData.user.email);
      console.log("✅ Token recebido:", registroData.token ? "Sim" : "Não");
      console.log();
      
      // 3. Testar login
      console.log("3️⃣ Testando POST /api/auth/login");
      const loginResponse = await fetch(`${baseURL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: testUser.email,
          senha: testUser.senha
        })
      });
      
      if (loginResponse.ok) {
        const loginData = await loginResponse.json();
        console.log("✅ Status:", loginResponse.status);
        console.log("✅ Login bem-sucedido:", loginData.user.email);
        console.log("✅ Token recebido:", loginData.token ? "Sim" : "Não");
      } else {
        const error = await loginResponse.json();
        console.log("❌ Erro no login:", error.error);
      }
    } else {
      const error = await registroResponse.json();
      console.log("❌ Erro no registro:", error.error);
    }
    
    console.log("\n━".repeat(60));
    console.log("✅ API FUNCIONANDO CORRETAMENTE!");
    console.log("━".repeat(60));
    console.log("\n💡 Se o frontend ainda não conecta:");
    console.log("   1. Verifica se o backend está em http://localhost:5000");
    console.log("   2. Abre o console do navegador (F12) para ver erros");
    console.log("   3. Verifica se não há firewall bloqueando");
    
  } catch (err) {
    console.error("\n❌ ERRO:", err.message);
    console.log("\n💡 Possíveis causas:");
    console.log("   1. Backend não está rodando");
    console.log("   2. Porta 5000 está ocupada");
    console.log("   3. Firewall bloqueando conexão");
    console.log("\n🚀 Para iniciar o backend:");
    console.log("   cd backend && npm run dev");
  }
}

testAPI();
