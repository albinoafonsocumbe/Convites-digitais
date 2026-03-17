const express = require("express");
const bcrypt = require("bcryptjs");
const passport = require("../passport-config");
const pool = require("../db");
const { authenticateToken, generateToken } = require("../auth");

const router = express.Router();
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// POST /api/auth/registro
router.post("/registro", async (req, res, next) => {
  const { nome, email, senha } = req.body;

  if (!nome || !email || !senha)
    return res.status(400).json({ error: "Nome, email e senha são obrigatórios" });

  if (!emailRegex.test(email))
    return res.status(400).json({ error: "Email inválido" });

  if (senha.length < 6)
    return res.status(400).json({ error: "Senha deve ter no mínimo 6 caracteres" });

  try {
    const existe = await pool.query("SELECT id FROM usuarios WHERE email = $1", [email.toLowerCase().trim()]);
    if (existe.rows.length > 0)
      return res.status(409).json({ error: "Este email já está cadastrado" });

    const hash = await bcrypt.hash(senha, 10);
    const result = await pool.query(
      "INSERT INTO usuarios (nome, email, senha, criado_em) VALUES ($1, $2, $3, NOW()) RETURNING id, nome, email, criado_em",
      [nome.trim(), email.toLowerCase().trim(), hash]
    );

    const user = result.rows[0];
    const token = generateToken(user);

    console.log("✅ Usuário registrado:", user.email);
    res.status(201).json({ message: "Usuário criado com sucesso", token, user: { id: user.id, nome: user.nome, email: user.email } });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/login
router.post("/login", async (req, res, next) => {
  const { email, senha } = req.body;

  if (!email || !senha)
    return res.status(400).json({ error: "Email e senha são obrigatórios" });

  if (!emailRegex.test(email))
    return res.status(400).json({ error: "Formato de email inválido" });

  try {
    const result = await pool.query("SELECT * FROM usuarios WHERE email = $1", [email.toLowerCase().trim()]);

    if (result.rows.length === 0)
      return res.status(401).json({ error: "Email ou senha incorretos" });

    const user = result.rows[0];

    if (user.senha === "google_oauth")
      return res.status(401).json({ error: "Esta conta usa login com Google. Use o botão 'Continuar com Google'." });

    const valida = await bcrypt.compare(senha, user.senha);
    if (!valida)
      return res.status(401).json({ error: "Email ou senha incorretos" });

    const token = generateToken(user);
    console.log("✅ Login:", user.email);
    res.json({ message: "Login realizado com sucesso", token, user: { id: user.id, nome: user.nome, email: user.email } });
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/me
router.get("/me", authenticateToken, async (req, res, next) => {
  try {
    const result = await pool.query(
      "SELECT id, nome, email, criado_em FROM usuarios WHERE id = $1",
      [req.user.id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: "Usuário não encontrado" });

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/google
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// GET /api/auth/google/callback
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: `${process.env.FRONTEND_URL || "http://localhost:3000"}/login` }),
  (req, res) => {
    const token = generateToken(req.user);
    const user = encodeURIComponent(JSON.stringify({ id: req.user.id, nome: req.user.nome, email: req.user.email }));
    res.redirect(`${process.env.FRONTEND_URL || "http://localhost:3000"}/auth/callback?token=${token}&user=${user}`);
  }
);

module.exports = router;
