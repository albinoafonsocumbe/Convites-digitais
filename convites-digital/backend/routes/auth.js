const express = require("express");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const passport = require("../passport-config");
const pool = require("../db");
const { authenticateToken, generateToken } = require("../auth");
const { enviarEmail } = require("../email");

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

// POST /api/auth/esqueci-senha
router.post("/esqueci-senha", async (req, res, next) => {
  const { email } = req.body;
  if (!email || !emailRegex.test(email))
    return res.status(400).json({ error: "Email inválido" });

  try {
    const result = await pool.query("SELECT id, nome FROM usuarios WHERE email = $1", [email.toLowerCase().trim()]);
    // Sempre responder com sucesso para não revelar se o email existe
    if (result.rows.length === 0)
      return res.json({ message: "Se o email existir, receberás um link de recuperação." });

    const user = result.rows[0];
    const token = crypto.randomBytes(32).toString("hex");
    const expira = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

    // Guardar token na base de dados
    await pool.query(
      "UPDATE usuarios SET reset_token=$1, reset_token_expira=$2 WHERE id=$3",
      [token, expira, user.id]
    );

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const linkReset = `${frontendUrl}/reset-senha?token=${token}`;

    await enviarEmail({
      to: email.trim(),
      subject: "Recuperação de senha — Convites Digitais",
      html: `
        <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:32px;background:#f9f9f9;border-radius:12px;">
          <h2 style="color:#667eea;margin:0 0 16px;">Recuperar senha</h2>
          <p style="color:#555;">Olá, <strong>${user.nome}</strong>.</p>
          <p style="color:#555;">Recebemos um pedido para redefinir a tua senha. Clica no botão abaixo:</p>
          <div style="text-align:center;margin:28px 0;">
            <a href="${linkReset}" style="display:inline-block;background:#667eea;color:white;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:700;font-size:15px;">Redefinir Senha</a>
          </div>
          <p style="color:#aaa;font-size:12px;">Este link expira em 1 hora. Se não pediste a recuperação, ignora este email.</p>
          <p style="color:#aaa;font-size:11px;">Ou copia: ${linkReset}</p>
        </div>
      `,
    });

    res.json({ message: "Se o email existir, receberás um link de recuperação." });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/reset-senha
router.post("/reset-senha", async (req, res, next) => {
  const { token, novaSenha } = req.body;
  if (!token || !novaSenha || novaSenha.length < 6)
    return res.status(400).json({ error: "Token e nova senha (mínimo 6 caracteres) são obrigatórios" });

  try {
    const result = await pool.query(
      "SELECT id FROM usuarios WHERE reset_token=$1 AND reset_token_expira > NOW()",
      [token]
    );
    if (result.rows.length === 0)
      return res.status(400).json({ error: "Link inválido ou expirado. Pede um novo." });

    const hash = await bcrypt.hash(novaSenha, 10);
    await pool.query(
      "UPDATE usuarios SET senha=$1, reset_token=NULL, reset_token_expira=NULL WHERE id=$2",
      [hash, result.rows[0].id]
    );

    res.json({ message: "Senha redefinida com sucesso. Podes fazer login." });
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
