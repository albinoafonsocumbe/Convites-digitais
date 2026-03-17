# 🚀 Como Iniciar o Sistema

## ⚡ Início Rápido (3 comandos)

### 1. Backend (Terminal 1)
```bash
cd backend
npm run dev
```

**Aguarde ver:**
```
✅ Conectado ao PostgreSQL com sucesso!
🚀 Servidor rodando na porta 5000
```

### 2. Frontend (Terminal 2)
```bash
npm start
```

**Aguarde abrir:** http://localhost:3000

### 3. Testar
- Acesse http://localhost:3000
- Clique em "Criar Conta"
- Preencha os dados e crie sua conta
- Você será redirecionado para o Dashboard

---

## 📋 Pré-requisitos

- ✅ PostgreSQL instalado e rodando
- ✅ Node.js instalado
- ✅ Banco de dados `convitesdb` criado

---

## 🔧 Primeira Vez? Execute Isso Primeiro

### Instalar dependências do Backend:
```bash
cd backend
npm install
```

### Instalar dependências do Frontend:
```bash
npm install
```

### Criar banco de dados:
```bash
cd backend
node setup-database.js
```

---

## ✅ Verificar se está tudo funcionando

### Teste 1: Backend
Abra http://localhost:5000 no navegador

**Deve mostrar:**
```json
{
  "message": "API de Convites Digitais funcionando",
  "version": "1.0.0"
}
```

### Teste 2: Frontend
Abra http://localhost:3000 no navegador

**Deve mostrar:**
- Página de Login
- Indicador verde: "✅ Servidor conectado"

---

## ❌ Problemas?

### Backend não inicia
```bash
cd backend
npm install
npm run dev
```

### Frontend não inicia
```bash
npm install
npm start
```

### Erro de conexão com PostgreSQL
1. Verifique se PostgreSQL está rodando
2. Verifique as credenciais em `backend/server.js`:
   - user: "postgres"
   - password: "0000"
   - database: "convitesdb"

### NetworkError no login
1. Verifique se o backend está rodando (Terminal 1)
2. Acesse http://localhost:5000 no navegador
3. Deve mostrar a mensagem da API

---

## 📱 Portas Usadas

- **Frontend:** http://localhost:3000
- **Backend:** http://localhost:5000
- **PostgreSQL:** localhost:5432

---

## 🎯 Fluxo Completo

```
PostgreSQL (5432) ← Backend (5000) ← Frontend (3000) ← Navegador
```

---

## 💡 Dicas

1. **Sempre inicie o backend primeiro**, depois o frontend
2. **Mantenha os dois terminais abertos** enquanto usa o sistema
3. **Use Ctrl+C** para parar os servidores
4. **Logs aparecem nos terminais** - útil para debug

---

## 🎉 Pronto!

Agora você pode:
- ✅ Criar conta
- ✅ Fazer login
- ✅ Criar eventos
- ✅ Gerenciar convites
- ✅ Compartilhar links públicos
- ✅ Ver confirmações de presença

---

## 📚 Documentação Adicional

- `DIAGNOSTICO.md` - Guia de troubleshooting
- `COMO_TESTAR.md` - Testes detalhados
- `backend/GOOGLE_OAUTH_SETUP.md` - Configurar login com Google (opcional)
