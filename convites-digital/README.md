# 🎉 Sistema de Convites Digitais

Sistema completo e profissional para criação e gestão de convites digitais com confirmação de presença.

## 🚀 Funcionalidades

### Gestão de Eventos
- ✅ Criar eventos/convites
- ✅ Editar eventos
- ✅ Deletar eventos
- ✅ Visualizar lista de eventos
- ✅ Dashboard com estatísticas

### Sistema de Confirmações (RSVP)
- ✅ Página pública de convite (compartilhável)
- ✅ Confirmação de presença online
- ✅ Informar número de acompanhantes
- ✅ Deixar mensagens
- ✅ Painel de gestão de confirmações
- ✅ Estatísticas em tempo real

### Interface
- ✅ Design moderno e responsivo
- ✅ Gradientes e animações
- ✅ Cards interativos
- ✅ Formulários estilizados

## 🛠️ Tecnologias

### Backend
- Node.js
- Express
- PostgreSQL
- CORS

### Frontend
- React 18
- React Router DOM
- CSS3 (Gradientes, Animações)
- Fetch API

## 📦 Instalação

### 1. Configurar PostgreSQL

Execute o arquivo SQL para criar as tabelas:

```bash
psql -U postgres -d convitesdb -f backend/database.sql
```

Ou execute manualmente no pgAdmin/psql.

### 2. Configurar Backend

```bash
cd backend
npm install
```

Edite `server.js` com suas credenciais do PostgreSQL (linhas 9-15):

```javascript
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "convitesdb",
  password: "SUA_SENHA",
  port: 5432,
});
```

Inicie o servidor:

```bash
npm run dev
```

### 3. Configurar Frontend

```bash
cd ..
npm install
npm start
```

## 🌐 Rotas

### Rotas Privadas (com Navbar)
- `/` - Home com próximos eventos
- `/dashboard` - Dashboard com estatísticas
- `/criar-convite` - Formulário de criação
- `/meus-convites` - Lista de eventos
- `/evento/:id` - Detalhes e gestão de confirmações

### Rotas Públicas
- `/convite/:id` - Página pública para confirmação de presença

## 📡 API Endpoints

### Eventos
- `GET /api/convites` - Listar todos
- `GET /api/convites/:id` - Buscar por ID
- `POST /api/convites` - Criar evento
- `PUT /api/convites/:id` - Atualizar evento
- `DELETE /api/convites/:id` - Deletar evento

### Confirmações
- `GET /api/convites/:id/confirmacoes` - Listar confirmações
- `POST /api/convites/:id/confirmacoes` - Criar confirmação
- `PUT /api/confirmacoes/:id` - Atualizar confirmação
- `DELETE /api/confirmacoes/:id` - Deletar confirmação
- `GET /api/convites/:id/estatisticas` - Estatísticas do evento

## 🎨 Estrutura do Projeto

```
convites-digital/
├── backend/
│   ├── server.js          # Servidor Express
│   ├── database.sql       # Schema do banco
│   └── package.json
├── src/
│   ├── components/
│   │   └── Navbar.js
│   ├── pages/
│   │   ├── Home.js
│   │   ├── Dashboard.js
│   │   ├── CriarConvite.js
│   │   ├── MeusConvites.js
│   │   ├── DetalhesEvento.js
│   │   └── ConvitePublico.js
│   ├── services/
│   │   └── api.js         # Integração com API
│   ├── styles/
│   │   ├── global.css
│   │   ├── Navbar.css
│   │   ├── Pages.css
│   │   └── Convites.css
│   ├── App.js
│   └── index.js
└── package.json
```

## 💡 Como Usar

1. Cria um evento em "Criar Convite"
2. Acessa "Meus Convites" e clica em "Ver Detalhes"
3. Copia o link público do convite
4. Compartilha o link com os convidados
5. Os convidados confirmam presença pela página pública
6. Acompanha as confirmações no painel de detalhes

## 🔒 Segurança

- CORS configurado
- Validação de dados no backend
- Prepared statements (proteção contra SQL injection)
- Sanitização de inputs

## 📱 Responsividade

O sistema é totalmente responsivo e funciona em:
- Desktop
- Tablet
- Mobile

## 🎯 Próximas Melhorias

- [ ] Autenticação de usuários
- [ ] Upload de imagens para eventos
- [ ] Envio de emails automáticos
- [ ] Exportar lista de convidados (PDF/Excel)
- [ ] Temas personalizáveis
- [ ] QR Code para check-in

## 📄 Licença

Projeto desenvolvido para fins educacionais.
