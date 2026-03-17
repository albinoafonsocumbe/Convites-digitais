# Backend - Convites Digitais

## Configuração do PostgreSQL

1. Instala o PostgreSQL no teu sistema
2. Abre o terminal do PostgreSQL (psql)
3. Executa o arquivo SQL:
```bash
psql -U postgres -f database.sql
```

Ou copia e cola o conteúdo do arquivo `database.sql` no terminal do PostgreSQL.

## Configuração do Backend

1. Instala as dependências:
```bash
npm install
```

2. Configura as credenciais do banco de dados no arquivo `server.js` (linhas 10-16):
```javascript
const pool = new Pool({
  user: "postgres",          // teu usuário do PostgreSQL
  host: "localhost",
  database: "convites_digitais",
  password: "postgres",      // tua senha do PostgreSQL
  port: 5432,
});
```

3. Inicia o servidor:
```bash
npm run dev
```

O servidor vai rodar em `http://localhost:5000`

## Endpoints da API

- `GET /api/convites` - Lista todos os convites
- `GET /api/convites/:id` - Busca um convite por ID
- `POST /api/convites` - Cria um novo convite
- `PUT /api/convites/:id` - Atualiza um convite
- `DELETE /api/convites/:id` - Deleta um convite
