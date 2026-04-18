require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const session = require("express-session");
const passport = require("./passport-config");
const pool = require("./db");
const authRoutes = require("./routes/auth");
const convitesRoutes = require("./routes/convites");
const confirmacoesRoutes = require("./routes/confirmacoes");
const uploadRoutes = require("./routes/upload");
const adminRoutes = require("./routes/admin");
const { errorHandler, notFound } = require("./middleware/errorHandler");

const app = express();

const isDev = process.env.NODE_ENV !== "production";

app.use(cors({
  origin: isDev ? true : function (origin, callback) {
    if (!origin) return callback(null, true);
    const allowed = [process.env.FRONTEND_URL].filter(Boolean);
    if (allowed.includes(origin) || /\.vercel\.app$/.test(origin)) return callback(null, true);
    callback(new Error("Bloqueado pelo CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  preflightContinue: false,
  optionsSuccessStatus: 204,
}));

app.use(helmet({ crossOriginResourcePolicy: false }));

const globalLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 });
const authLimiter   = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });

app.use((req, res, next) => {
  if (req.path.startsWith("/api/upload")) return next();
  return globalLimiter(req, res, next);
});

app.use(express.json({ limit: "10mb" }));
app.use(session({
  secret: process.env.SESSION_SECRET || "secret",
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === "production", httpOnly: true },
}));
app.use(passport.initialize());

async function runMigrations() {
  const migrations = [
    "ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS reset_token VARCHAR(100)",
    "ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS reset_token_expira TIMESTAMP",
    "ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS telefone VARCHAR(30)",
    "ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS sms_codigo VARCHAR(6)",
    "ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS sms_codigo_expira TIMESTAMP",
    "ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user'",
    "ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS bloqueado BOOLEAN DEFAULT false",
    "ALTER TABLE eventos ADD COLUMN IF NOT EXISTS video_url VARCHAR(500)",
    "ALTER TABLE eventos ADD COLUMN IF NOT EXISTS videos_urls TEXT[]",
    "ALTER TABLE eventos ADD COLUMN IF NOT EXISTS fotos TEXT[]",
    "ALTER TABLE eventos ADD COLUMN IF NOT EXISTS foto_capa VARCHAR(500)",
    "ALTER TABLE eventos ADD COLUMN IF NOT EXISTS hora_evento VARCHAR(10)",
    "ALTER TABLE eventos ADD COLUMN IF NOT EXISTS endereco_maps VARCHAR(500)",
    "ALTER TABLE eventos ADD COLUMN IF NOT EXISTS programa JSONB DEFAULT '[]'",
    "ALTER TABLE eventos ADD COLUMN IF NOT EXISTS refeicao JSONB DEFAULT '{}'",
    "ALTER TABLE eventos ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW()",
  ];
  for (const sql of migrations) {
    try { await pool.query(sql); }
    catch (e) { console.error("Migracao falhou:", e.message); }
  }
  console.log("Migracoes concluidas");
}

pool.connect((err, _client, release) => {
  if (err) { console.error("Erro PostgreSQL:", err.message); process.exit(1); }
  console.log("Conectado ao PostgreSQL");
  release();
  runMigrations();
});

app.get("/", (_req, res) => res.json({ message: "API Convites Digitais", version: "2.0.0" }));

// Diagnóstico temporário — verificar colunas da tabela usuarios
app.get("/diag", async (_req, res) => {
  try {
    const cols = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name='usuarios' ORDER BY ordinal_position");
    const test = await pool.query("SELECT COUNT(*) FROM usuarios");
    res.json({ colunas: cols.rows.map(r => r.column_name), total: test.rows[0].count });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Teste de registo direto
app.post("/diag/registro", async (req, res) => {
  const { nome, email, senha } = req.body;
  try {
    const bcrypt = require("bcryptjs");
    const hash = await bcrypt.hash(senha || "123456", 10);
    const result = await pool.query(
      "INSERT INTO usuarios (nome, email, senha, role, criado_em) VALUES ($1,$2,$3,'user',NOW()) RETURNING id, nome, email, role",
      [nome || "Teste", email || "teste@teste.com", hash]
    );
    res.json({ ok: true, user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message, code: err.code });
  }
});

// Meta tags dinamicas para crawlers
app.get("/convite/:id", async (req, res) => {
  const frontendUrl = process.env.FRONTEND_URL_PROD || "https://convites-digitais-six.vercel.app";
  const { id } = req.params;
  if (!/^\d+$/.test(id)) return res.redirect(`${frontendUrl}/convite/${id}`);
  try {
    const { rows } = await pool.query(
      "SELECT nome_evento, mensagem, foto_capa, data_evento, local_evento FROM eventos WHERE id = $1", [id]
    );
    if (rows.length === 0) return res.redirect(`${frontendUrl}/convite/${id}`);
    const e = rows[0];
    const titulo = e.nome_evento ? `${e.nome_evento} | Convite Digital` : "Convite Digital";
    const descricao = e.mensagem || `Convite para ${e.nome_evento || "um evento especial"}.`;
    const imagem = e.foto_capa || "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=1200&q=80&fit=crop";
    const url = `${frontendUrl}/convite/${id}`;
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.send(`<!DOCTYPE html><html lang="pt"><head><meta charset="utf-8"/><title>${titulo}</title>
<meta name="description" content="${descricao.replace(/"/g,"&quot;")}"/>
<meta property="og:title" content="${titulo}"/><meta property="og:description" content="${descricao.replace(/"/g,"&quot;")}"/>
<meta property="og:image" content="${imagem}"/><meta property="og:url" content="${url}"/>
<meta http-equiv="refresh" content="0;url=${url}"/>
</head><body><a href="${url}">Abrir convite</a></body></html>`);
  } catch { res.redirect(`${frontendUrl}/convite/${id}`); }
});

// Sitemap dinamico
app.get("/sitemap.xml", async (_req, res) => {
  try {
    const frontendUrl = process.env.FRONTEND_URL_PROD || "https://convites-digitais-six.vercel.app";
    const { rows } = await pool.query("SELECT id, updated_at FROM eventos ORDER BY data_evento DESC");
    const urls = [
      `<url><loc>${frontendUrl}/</loc><changefreq>weekly</changefreq><priority>1.0</priority></url>`,
      `<url><loc>${frontendUrl}/login</loc><changefreq>monthly</changefreq><priority>0.6</priority></url>`,
      `<url><loc>${frontendUrl}/registro</loc><changefreq>monthly</changefreq><priority>0.7</priority></url>`,
      ...rows.map(e => {
        const lastmod = e.updated_at ? new Date(e.updated_at).toISOString().split("T")[0] : "";
        return `<url><loc>${frontendUrl}/convite/${e.id}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ""}<changefreq>monthly</changefreq><priority>0.9</priority></url>`;
      }),
    ];
    res.header("Content-Type", "application/xml");
    res.header("Cache-Control", "public, max-age=3600");
    res.send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>`);
  } catch (err) { res.status(500).send("Erro ao gerar sitemap"); }
});

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/convites", convitesRoutes);
app.use("/api/confirmacoes", confirmacoesRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/admin", adminRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, "0.0.0.0", () => {
  console.log("Servidor na porta " + PORT);
  console.log("Ambiente: " + (process.env.NODE_ENV || "development"));
});

server.timeout = 300000;
server.keepAliveTimeout = 305000;

if (process.env.NODE_ENV === "production" && process.env.BACKEND_URL) {
  setInterval(async () => {
    try { const fetch = require("node-fetch"); await fetch(`${process.env.BACKEND_URL}/`); }
    catch (e) {}
  }, 14 * 60 * 1000);
}
