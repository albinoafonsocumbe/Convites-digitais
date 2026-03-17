# 🧪 Como Testar o Sistema

## Passo 1: Iniciar PostgreSQL
Certifique-se de que o PostgreSQL está rodando na porta 5432.

## Passo 2: Iniciar Backend

Abra um terminal e execute:

```bash
cd backend
npm run dev
```

**Você deve ver:**
```
🚀 Servidor rodando na porta 5000
📡 API disponível em http://localhost:5000
✅ Conectado ao PostgreSQL com sucesso!
```

**Se der erro "Cannot find module 'bcryptjs'":**
```bash
npm install
```

## Passo 3: Testar Backend (Opcional mas Recomendado)

No mesmo terminal do backend:

```bash
node test-api.js
```

**Você deve ver:**
```
✅ API FUNCIONANDO CORRETAMENTE!
```

## Passo 4: Iniciar Frontend

Abra OUTRO terminal (deixe o backend rodando) e execute:

```bash
npm start
```

O navegador deve abrir automaticamente em http://localhost:3000

## Passo 5: Testar Login

1. **Você será redirecionado para /login** (porque não está autenticado)

2. **Verifique o status do servidor:**
   - Deve aparecer: **✅ Servidor conectado** (verde)
   - Se aparecer vermelho, volte ao Passo 2

3. **Criar uma conta:**
   - Clique em "Criar Conta"
   - Preencha:
     - Nome: Seu Nome
     - Email: teste@teste.com (use um email válido)
     - Senha: 123456 (mínimo 6 caracteres)
     - Confirmar Senha: 123456
   - Clique em "Criar Conta"

4. **Você deve ser redirecionado para /dashboard**

5. **Teste o logout:**
   - Clique no botão de logout no canto superior direito
   - Você deve voltar para /login

6. **Teste o login:**
   - Email: teste@teste.com
   - Senha: 123456
   - Clique em "Entrar"
   - Você deve ir para /dashboard

## 🔍 Verificar Logs no Console do Navegador

Pressione **F12** para abrir o DevTools e vá para a aba **Console**.

**Durante o login, você deve ver:**
```
🔐 Status de autenticação: Não autenticado
🔐 Tentando login em: http://localhost:5000/api/auth/login
📤 Dados: { email: "teste@teste.com", senha: "***" }
📥 Resposta recebida: 200
✅ Login bem-sucedido!
```

**Se houver erro, você verá:**
```
❌ Erro na requisição: [descrição do erro]
```

## ❌ Problemas Comuns

### Erro: "NetworkError when attempting to fetch resource"

**Causa:** Frontend não consegue conectar ao backend

**Solução:**
1. Verifique se o backend está rodando (Passo 2)
2. Acesse http://localhost:5000 no navegador
3. Deve mostrar: `{"message": "API de Convites Digitais funcionando"}`

### Erro: "Email ou senha incorretos"

**Causa:** Credenciais inválidas ou usuário não existe

**Solução:**
1. Crie uma nova conta primeiro
2. Use as mesmas credenciais para fazer login

### Erro: "Este email já está cadastrado"

**Causa:** Você já criou uma conta com este email

**Solução:**
1. Use o login ao invés de criar conta
2. Ou use outro email

### Erro: "Formato de email inválido"

**Causa:** Email não está no formato correto

**Solução:**
Use um email válido como: usuario@dominio.com

### Backend não inicia

**Erro:** `Cannot find module 'bcryptjs'`

**Solução:**
```bash
cd backend
npm install
```

## ✅ Teste Completo

Depois de fazer login com sucesso, teste todas as funcionalidades:

1. **Dashboard** - Ver resumo dos eventos
2. **Criar Convite** - Criar um novo evento
3. **Meus Convites** - Ver lista de eventos criados
4. **Detalhes do Evento** - Ver confirmações de presença
5. **Link Público** - Compartilhar convite (não precisa login)

## 📊 Estrutura de Testes

```
✅ PostgreSQL rodando (porta 5432)
  ↓
✅ Backend rodando (porta 5000)
  ↓
✅ Frontend rodando (porta 3000)
  ↓
✅ Criar conta
  ↓
✅ Fazer login
  ↓
✅ Acessar dashboard
  ↓
✅ Criar evento
  ↓
✅ Ver eventos
  ↓
✅ Logout
```

## 🎯 Resultado Esperado

Após seguir todos os passos, você deve conseguir:
- ✅ Criar conta
- ✅ Fazer login
- ✅ Ver dashboard
- ✅ Criar eventos
- ✅ Ver lista de eventos
- ✅ Fazer logout
- ✅ Fazer login novamente

Se tudo funcionar, o sistema está 100% operacional! 🎉
