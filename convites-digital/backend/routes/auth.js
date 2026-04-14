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
  const { nome, email, senha, telefone } = req.body;

  if (!nome || !email || !senha || !telefone)
    return res.status(400).json({ error: "Nome, email, senha e telefone são obrigatórios" });

  if (!emailRegex.test(email))
    return res.status(400).json({ error: "Email inválido" });

  if (senha.length < 6)
    return res.status(400).json({ error: "Senha deve ter no mínimo 6 caracteres" });

  const telLimpo = telefone.replace(/\s/g, "");
  if (!/^\+?\d{7,15}$/.test(telLimpo))
    return res.status(400).json({ error: "Número de telefone inválido" });

  try {
    const existe = await pool.query("SELECT id FROM usuarios WHERE email = $1", [email.toLowerCase().trim()]);
    if (existe.rows.length > 0)
      return res.status(409).json({ error: "Este email já está cadastrado" });

    const hash = await bcrypt.hash(senha, 10);
    const result = await pool.query(
      "INSERT INTO usuarios (nome, email, senha, telefone, criado_em) VALUES ($1,$2,$3,$4,NOW()) RETURNING id, nome, email, telefone",
      [nome.trim(), email.toLowerCase().trim(), hash, telLimpo]
    );

    const user = result.rows[0];
    const token = generateToken(user);
    console.log("✅ Usuário registrado:", user.email);
    res.status(201).json({ message: "Conta criada com sucesso", token, user: { id: user.id, nome: user.nome, email: user.email } });
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
      return res.status(401).json({ error: "Esta conta usa login com Google. Usa o botão 'Continuar com Google'." });

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
      "SELECT id, nome, email, telefone, criado_em FROM usuarios WHERE id = $1",
      [req.user.id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: "Usuário não encontrado" });
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/esqueci-senha — envia código de 6 dígitos por email
router.post("/esqueci-senha", async (req, res, next) => {
  const { email } = req.body;
  if (!email || !emailRegex.test(email))
    return res.status(400).json({ error: "Email inválido" });

  try {
    const result = await pool.query(
      "SELECT id, nome FROM usuarios WHERE email = $1",
      [email.toLowerCase().trim()]
    );

    // Sempre responder com sucesso para não revelar se o email existe
    if (result.rows.length === 0)
      return res.json({ message: "Se o email existir, receberás um código de verificação." });

    const user = result.rows[0];
    const codigo = Math.floor(100000 + Math.random() * 900000).toString();
    const expira = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos

    await pool.query(
      "UPDATE usuarios SET sms_codigo=$1, sms_codigo_expira=$2 WHERE id=$3",
      [codigo, expira, user.id]
    );

    await enviarEmail({
      to: email.trim(),
      subject: "Código de verificação — Convites Digitais",
      html: `
        <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#f9f9f9;border-radius:12px;">
          <h2 style="color:#667eea;margin:0 0 16px;text-align:center;">Recuperar Senha</h2>
          <p style="color:#555;margin:0 0 8px;">Olá, <strong>${user.nome}</strong>.</p>
          <p style="color:#555;margin:0 0 24px;">O teu código de verificação é:</p>
          <div style="text-align:center;margin:24px 0;">
            <span style="display:inline-block;background:#667eea;color:white;font-size:36px;font-weight:900;letter-spacing:12px;padding:16px 32px;border-radius:12px;">${codigo}</span>
          </div>
          <p style="color:#aaa;font-size:13px;text-align:center;margin:0;">Válido por 15 minutos. Se não pediste a recuperação, ignora este email.</p>
        </div>
      `,
    });

    console.log(`📧 Código de recuperação enviado para: ${email}`);
    res.json({ message: "Se o email existir, receberás um código de verificação." });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/verificar-codigo — valida código e devolve token de reset
router.post("/verificar-codigo", async (req, res, next) => {
  const { email, codigo } = req.body;
  if (!email || !codigo)
    return res.status(400).json({ error: "Email e código são obrigatórios" });

  try {
    const result = await pool.query(
      "SELECT id FROM usuarios WHERE email=$1 AND sms_codigo=$2 AND sms_codigo_expira > NOW()",
      [email.toLowerCase().trim(), codigo.trim()]
    );

    if (result.rows.length === 0)
      return res.status(400).json({ error: "Código inválido ou expirado." });

    const resetToken = crypto.randomBytes(32).toString("hex");
    const expira = new Date(Date.now() + 15 * 60 * 1000);

    await pool.query(
      "UPDATE usuarios SET reset_token=$1, reset_token_expira=$2, sms_codigo=NULL, sms_codigo_expira=NULL WHERE id=$3",
      [resetToken, expira, result.rows[0].id]
    );

    res.json({ token: resetToken });
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
      return res.status(400).json({ error: "Código expirado. Pede um novo." });

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
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"], session: false }));

// GET /api/auth/google/callback
router.get("/google/callback", (req, res, next) => {
  passport.authenticate("google", { session: false }, (err, user) => {
    const frontendUrl = process.env.FRONTEND_URL_PROD || process.env.FRONTEND_URL || "http://localhost:3000";
    if (err || !user) {
      console.error("Google OAuth erro:", err?.message || "sem utilizador");
      return res.redirect(`${frontendUrl}/login?erro=auth`);
    }
    try {
      const token = generateToken(user);
      const userEncoded = encodeURIComponent(JSON.stringify({ id: user.id, nome: user.nome, email: user.email }));
      res.redirect(`${frontendUrl}/auth/callback?token=${token}&user=${userEncoded}`);
    } catch (e) {
      res.redirect(`${frontendUrl}/login?erro=token`);
    }
  })(req, res, next);
});

module.exports = router;
