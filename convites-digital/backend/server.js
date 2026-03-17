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
const { errorHandler, notFound } = require("./middleware/errorHandler");

const app = express();

app.use(cors({ origin: ["http://localhost:3000", "http://localhost:3001"], credentials: true, methods: ["GET","POST","PUT","DELETE","OPTIONS"], allowedHeaders: ["Content-Type","Authorization"] }));
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(rateLimit({ windowMs: 15*60*1000, max: 100 }));
app.use(express.json({ limit: "10kb" }));
app.use(session({ secret: process.env.SESSION_SECRET || "secret", resave: false, saveUninitialized: false, cookie: { secure: false, httpOnly: true } }));
app.use(passport.initialize());
app.use(passport.session());

pool.connect((err, client, release) => {
  if (err) { console.error("Erro PostgreSQL:", err.message); process.exit(1); }
  console.log("Conectado ao PostgreSQL");
  release();
});

app.get("/", (req, res) => res.json({ message: "API Convites Digitais", version: "2.0.0" }));
app.use("/api/auth", rateLimit({ windowMs: 15*60*1000, max: 20 }), authRoutes);
app.use("/api/convites", convitesRoutes);
app.use("/api/confirmacoes", confirmacoesRoutes);
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("Servidor na porta " + PORT);
  console.log("http://localhost:" + PORT);
  console.log("Email: " + (process.env.EMAIL_USER || "NAO CONFIGURADO"));
  console.log("Ambiente: " + (process.env.NODE_ENV || "development"));
});
