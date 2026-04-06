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
app.use(passport.session());

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
    "ALTER TABLE eventos ADD COLUMN IF NOT EXISTS video_url VARCHAR(500)",
    "ALTER TABLE eventos ADD COLUMN IF NOT EXISTS videos_urls TEXT[]",
    "ALTER TABLE eventos ADD COLUMN IF NOT EXISTS fotos TEXT[]",
    "ALTER TABLE eventos ADD COLUMN IF NOT EXISTS foto_capa VARCHAR(500)",
    "ALTER TABLE eventos ADD COLUMN IF NOT EXISTS hora_evento VARCHAR(10)",
    "ALTER TABLE eventos ADD COLUMN IF NOT EXISTS endereco_maps VARCHAR(500)",
    "ALTER TABLE eventos ADD COLUMN IF NOT EXISTS programa JSONB DEFAULT '[]'",
    "ALTER TABLE eventos ADD COLUMN IF NOT EXISTS refeicao JSONB DEFAULT '{}'",
  ];
  for (const sql of migrations) {
    try { await pool.query(sql); }
    catch (e) { console.error("Migração falhou:", e.message); }
  }
  console.log("Migracoes concluidas");
}

app.get("/", (_req, res) => res.json({ message: "API Convites Digitais", version: "2.0.0" }));

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/convites", convitesRoutes);
app.use("/api/confirmacoes", confirmacoesRoutes);
app.use("/api/upload", uploadRoutes);

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
