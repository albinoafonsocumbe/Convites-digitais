# Configurar Google OAuth

## Passo 1: Criar Projeto no Google Cloud Console

1. Acessa: https://console.cloud.google.com/
2. Clica em "Criar Projeto" ou seleciona um projeto existente
3. Dá um nome ao projeto (ex: "Convites Digitais")

## Passo 2: Ativar Google+ API

1. No menu lateral, vai em "APIs e Serviços" > "Biblioteca"
2. Procura por "Google+ API"
3. Clica em "Ativar"

## Passo 3: Criar Credenciais OAuth

1. No menu lateral, vai em "APIs e Serviços" > "Credenciais"
2. Clica em "Criar Credenciais" > "ID do cliente OAuth"
3. Se pedido, configura a "Tela de consentimento OAuth":
   - Tipo: Externo
   - Nome do app: Convites Digitais
   - Email de suporte: teu email
   - Domínios autorizados: localhost
   - Salva

4. Volta para "Credenciais" > "Criar Credenciais" > "ID do cliente OAuth"
5. Tipo de aplicativo: "Aplicativo da Web"
6. Nome: "Convites Digitais Web"
7. URIs de redirecionamento autorizados:
   - http://localhost:5000/api/auth/google/callback
8. Clica em "Criar"

## Passo 4: Copiar Credenciais

Após criar, vais receber:
- **Client ID** (algo como: 123456789-abc.apps.googleusercontent.com)
- **Client Secret** (algo como: GOCSPX-abc123...)

## Passo 5: Configurar no Backend

Edita o arquivo `passport-config.js` (linhas 12-13):

```javascript
clientID: 'COLA_TEU_CLIENT_ID_AQUI',
clientSecret: 'COLA_TEU_CLIENT_SECRET_AQUI',
```

Ou cria um arquivo `.env` na pasta backend:

```
GOOGLE_CLIENT_ID=COLA_TEU_CLIENT_ID_AQUI
GOOGLE_CLIENT_SECRET=COLA_TEU_CLIENT_SECRET_AQUI
SESSION_SECRET=algum_secret_aleatorio_aqui
```

## Passo 6: Instalar Dependências

```bash
cd backend
npm install
```

## Passo 7: Atualizar Banco de Dados

Executa o SQL atualizado para adicionar o campo `google_id`:

```sql
ALTER TABLE usuarios ADD COLUMN google_id VARCHAR(255) UNIQUE;
```

Ou recria a tabela com o `database.sql` atualizado.

## Passo 8: Testar

1. Inicia o backend: `npm run dev`
2. Inicia o frontend: `npm start`
3. Acessa http://localhost:3000/login
4. Clica em "Continuar com Google"
5. Faz login com tua conta Google
6. Serás redirecionado de volta para o app autenticado!

## Notas Importantes

- Em desenvolvimento, usa `http://localhost`
- Em produção, muda para teu domínio real (ex: `https://meusite.com`)
- Atualiza as URIs de redirecionamento no Google Cloud Console
- Nunca commita as credenciais no Git (usa .env e .gitignore)
