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

// CORS — em dev aceita tudo, em prod filtra por origem
const isDev = process.env.NODE_ENV !== "production";

app.use(cors({
  origin: isDev
    ? true  // aceita qualquer origem em desenvolvimento
    : function (origin, callback) {
        if (!origin) return callback(null, true);
        const allowed = [process.env.FRONTEND_URL].filter(Boolean);
        if (allowed.includes(origin) || /\.vercel\.app$/.test(origin)) {
          return callback(null, true);
        }
        callback(new Error("Bloqueado pelo CORS"));
      },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  preflightContinue: false,
  optionsSuccessStatus: 204,
}));

app.use(helmet({ crossOriginResourcePolicy: false }));

// Rate limiters criados FORA de handlers (obrigatorio no express-rate-limit v7+)
const globalLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 });
const authLimiter   = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });

// Rate limit global — excepto uploads
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
// Nao usar passport.session() — usamos JWT, nao sessoes

pool.connect((err, _client, release) => {
  if (err) { console.error("Erro PostgreSQL:", err.message); process.exit(1); }
  console.log("Conectado ao PostgreSQL");
  release();
  // Correr migracoes automaticamente ao arrancar
  runMigrations();
});

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
    catch (e) { console.error("Migração falhou:", e.message); }
  }
  console.log("Migracoes concluidas");
}

app.get("/", (_req, res) => res.json({ message: "API Convites Digitais", version: "2.0.0" }));

// Preview com meta tags dinâmicas para crawlers (Google, WhatsApp, Facebook)
// Utilizadores reais são redirecionados para o React via meta refresh
app.get("/convite/:id", async (req, res) => {
  const frontendUrl = process.env.FRONTEND_URL_PROD || "https://convitesdigitais.vercel.app";
  const { id } = req.params;

  // Validar id numérico
  if (!/^\d+$/.test(id)) return res.redirect(`${frontendUrl}/convite/${id}`);

  try {
    const { rows } = await pool.query(
      "SELECT nome_evento, mensagem, foto_capa, data_evento, local_evento FROM eventos WHERE id = $1",
      [id]
    );

    if (rows.length === 0) return res.redirect(`${frontendUrl}/convite/${id}`);

    const e = rows[0];
    const titulo = e.nome_evento ? `${e.nome_evento} | Convite Digital` : "Convite Digital";
    const descricao = e.mensagem || `Estás convidado para ${e.nome_evento || "um evento especial"}. Confirma a tua presença!`;
    const imagem = e.foto_capa || "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=1200&q=80&fit=crop";
    const url = `${frontendUrl}/convite/${id}`;
    const dataFormatada = e.data_evento ? new Date(e.data_evento).toLocaleDateString("pt-PT", { day: "numeric", month: "long", year: "numeric" }) : "";
    const descCompleta = [descricao, dataFormatada && `📅 ${dataFormatada}`, e.local_evento && `📍 ${e.local_evento}`].filter(Boolean).join(" · ");

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.send(`<!DOCTYPE html>
<html lang="pt">
<head>
  <meta charset="utf-8"/>
  <title>${titulo}</title>
  <meta name="description" content="${descCompleta.replace(/"/g, "&quot;")}"/>
  <meta name="robots" content="index, follow"/>
  <link rel="canonical" href="${url}"/>
  <!-- Open Graph -->
  <meta property="og:type" content="website"/>
  <meta property="og:url" content="${url}"/>
  <meta property="og:title" content="${titulo}"/>
  <meta property="og:description" content="${descCompleta.replace(/"/g, "&quot;")}"/>
  <meta property="og:image" content="${imagem}"/>
  <meta property="og:image:width" content="1200"/>
  <meta property="og:image:height" content="630"/>
  <meta property="og:locale" content="pt_PT"/>
  <meta property="og:site_name" content="Convites Digitais"/>
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image"/>
  <meta name="twitter:title" content="${titulo}"/>
  <meta name="twitter:description" content="${descCompleta.replace(/"/g, "&quot;")}"/>
  <meta name="twitter:image" content="${imagem}"/>
  <!-- JSON-LD -->
  <script type="application/ld+json">
  {"@context":"https://schema.org","@type":"Event","name":${JSON.stringify(e.nome_evento||"")},"description":${JSON.stringify(descricao)},"startDate":${JSON.stringify(e.data_evento||"")},"location":{"@type":"Place","name":${JSON.stringify(e.local_evento||"")}},"image":${JSON.stringify(imagem)},"url":${JSON.stringify(url)}}
  </script>
  <!-- Redirecionar utilizadores reais para o React -->
  <meta http-equiv="refresh" content="0;url=${url}"/>
</head>
<body>
  <p>A abrir convite... <a href="${url}">Clica aqui</a></p>
</body>
</html>`);
  } catch {
    res.redirect(`${frontendUrl}/convite/${id}`);
  }
});

// Sitemap dinâmico — lista todos os convites públicos
app.get("/sitemap.xml", async (_req, res) => {
  try {
    const frontendUrl = process.env.FRONTEND_URL_PROD || "https://convitesdigitais.vercel.app";
    const { rows } = await pool.query(
      "SELECT id, nome_evento, data_evento, updated_at FROM eventos ORDER BY data_evento DESC"
    );

    const urls = [
      `<url><loc>${frontendUrl}/</loc><changefreq>weekly</changefreq><priority>1.0</priority></url>`,
      `<url><loc>${frontendUrl}/login</loc><changefreq>monthly</changefreq><priority>0.6</priority></url>`,
      `<url><loc>${frontendUrl}/registro</loc><changefreq>monthly</changefreq><priority>0.7</priority></url>`,
      ...rows.map(e => {
        const lastmod = e.updated_at ? new Date(e.updated_at).toISOString().split("T")[0] : "";
        return `<url><loc>${frontendUrl}/convite/${e.id}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ""}<changefreq>monthly</changefreq><priority>0.9</priority></url>`;
      }),
    ];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>`;
    res.header("Content-Type", "application/xml");
    res.header("Cache-Control", "public, max-age=3600");
    res.send(xml);
  } catch (err) {
    res.status(500).send("Erro ao gerar sitemap");
  }
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
  console.log("http://localhost:" + PORT);
  console.log("Ambiente: " + (process.env.NODE_ENV || "development"));
});

server.timeout = 300000;
server.keepAliveTimeout = 305000;

// Keep-alive: ping a cada 14 minutos para evitar que o Render adormeça
if (process.env.NODE_ENV === "production" && process.env.BACKEND_URL) {
  setInterval(async () => {
    try {
      const fetch = require("node-fetch");
      await fetch(`${process.env.BACKEND_URL}/`);
      console.log("Keep-alive ping OK");
    } catch (e) { /* silencioso */ }
  }, 14 * 60 * 1000);
}
