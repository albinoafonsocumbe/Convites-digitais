# 🔧 Diagnóstico do Sistema de Login

## ✅ O que já está funcionando:

1. **Backend API** - Testado e funcionando corretamente
2. **Banco de dados PostgreSQL** - Conectado e tabelas criadas
3. **Autenticação JWT** - Implementada corretamente
4. **CORS** - Configurado para aceitar requisições do frontend

## ❌ Problema Atual:

**NetworkError when attempting to fetch resource**

Este erro significa que o frontend não consegue se comunicar com o backend.

## 🔍 Possíveis Causas:

### 1. Backend não está rodando
**Solução:**
```bash
cd backend
npm run dev
```

Você deve ver:
```
🚀 Servidor rodando na porta 5000
📡 API disponível em http://localhost:5000
✅ Conectado ao PostgreSQL com sucesso!
```

### 2. Frontend não está rodando
**Solução:**
```bash
# Na raiz do projeto (convites-digital)
npm start
```

Você deve ver:
```
Compiled successfully!
You can now view convites-digital in the browser.
Local: http://localhost:3000
```

### 3. Firewall bloqueando a conexão
**Solução Windows:**
- Abra o Firewall do Windows
- Permita Node.js nas conexões de entrada e saída

### 4. Porta 5000 ocupada por outro processo
**Verificar:**
```bash
netstat -ano | findstr :5000
```

**Solução:** Matar o processo ou mudar a porta no backend

## 🧪 Como Testar:

### Teste 1: Backend está respondendo?
Abra o navegador e acesse: http://localhost:5000

Deve mostrar:
```json
{
  "message": "API de Convites Digitais funcionando",
  "version": "1.0.0"
}
```

### Teste 2: API de autenticação funciona?
```bash
cd backend
node test-api.js
```

Deve mostrar:
```
✅ API FUNCIONANDO CORRETAMENTE!
```

### Teste 3: Frontend consegue conectar?
1. Abra o frontend em http://localhost:3000
2. Vá para a página de Login
3. Você deve ver: **✅ Servidor conectado**
4. Se ver **⚠️ Servidor offline**, o backend não está acessível

### Teste 4: Console do navegador
1. Pressione F12 no navegador
2. Vá para a aba "Console"
3. Tente fazer login
4. Veja as mensagens de log:
   - `🔐 Tentando login em: http://localhost:5000/api/auth/login`
   - `📤 Dados: { email: "...", senha: "***" }`
   - `📥 Resposta recebida: 200` (sucesso) ou erro

## 📋 Checklist de Verificação:

- [ ] PostgreSQL está rodando (porta 5432)
- [ ] Backend está rodando (porta 5000)
- [ ] Frontend está rodando (porta 3000)
- [ ] http://localhost:5000 abre no navegador
- [ ] http://localhost:3000 abre no navegador
- [ ] Console do navegador não mostra erros de CORS
- [ ] Firewall não está bloqueando

## 🚀 Ordem Correta de Inicialização:

1. **PostgreSQL** (deve estar sempre rodando)
2. **Backend** (terminal 1):
   ```bash
   cd backend
   npm run dev
   ```
3. **Frontend** (terminal 2):
   ```bash
   npm start
   ```

## 💡 Melhorias Implementadas:

1. **Logs detalhados** - Agora você vê exatamente o que está acontecendo
2. **Teste de conexão** - Frontend verifica se backend está online
3. **Mensagens de erro claras** - Sabe exatamente qual é o problema
4. **Validação de email** - Aceita apenas emails válidos
5. **Status visual** - Indicador verde/vermelho de conexão

## 📞 Próximos Passos:

1. Verifique se ambos os servidores estão rodando
2. Abra o console do navegador (F12)
3. Tente fazer login e veja os logs
4. Se ainda houver erro, copie a mensagem completa do console
