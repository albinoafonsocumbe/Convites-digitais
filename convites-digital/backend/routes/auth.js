const express = require("express");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const pool = require("../db");
const { authenticateToken, generateToken } = require("../auth");
const { enviarEmail } = require("../email");

const router = express.Router();
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Gera código SMS de 6 dígitos e envia (via Africa's Talking ou log em dev)
async function enviarCodigoSMS(telefone, codigo) {
  const apiKey = process.env.AT_API_KEY;
  const username = process.env.AT_USERNAME;

  if (!apiKey || !username || process.env.NODE_ENV !== "production") {
    // Em dev: só mostra no log
    console.log(`📱 [DEV] Código SMS para ${telefone}: ${codigo}`);
    return;
  }

  const AfricasTalking = require("africastalking");
  const at = AfricasTalking({ apiKey, username });
  await at.SMS.send({
    to: [telefone],
    message: `O teu código de recuperação Convites Digitais: ${codigo}. Válido por 10 minutos.`,
    from: process.env.AT_SENDER_ID || undefined,
  });
}

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
      "INSERT INTO usuarios (nome, email, senha, telefone, criado_em) VALUES ($1,$2,$3,$4,NOW()) RETURNING id, nome, email, telefone, criado_em",
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

// POST /api/auth/esqueci-senha — envia código SMS
router.post("/esqueci-senha", async (req, res, next) => {
  const { telefone } = req.body;
  if (!telefone)
    return res.status(400).json({ error: "Número de telefone obrigatório" });

  const telLimpo = telefone.replace(/\s/g, "");

  try {
    const result = await pool.query(
      "SELECT id, nome FROM usuarios WHERE telefone = $1",
      [telLimpo]
    );

    // Sempre responder com sucesso para não revelar se o número existe
    if (result.rows.length === 0)
      return res.json({ message: "Se o número estiver registado, receberás um código SMS." });

    const user = result.rows[0];
    const codigo = Math.floor(100000 + Math.random() * 900000).toString();
    const expira = new Date(Date.now() + 10 * 60 * 1000); // 10 minutos

    await pool.query(
      "UPDATE usuarios SET sms_codigo=$1, sms_codigo_expira=$2 WHERE id=$3",
      [codigo, expira, user.id]
    );

    await enviarCodigoSMS(telLimpo, codigo);

    res.json({ message: "Se o número estiver registado, receberás um código SMS." });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/verificar-codigo — valida código e devolve token de reset
router.post("/verificar-codigo", async (req, res, next) => {
  const { telefone, codigo } = req.body;
  if (!telefone || !codigo)
    return res.status(400).json({ error: "Telefone e código são obrigatórios" });

  const telLimpo = telefone.replace(/\s/g, "");

  try {
    const result = await pool.query(
      "SELECT id FROM usuarios WHERE telefone=$1 AND sms_codigo=$2 AND sms_codigo_expira > NOW()",
      [telLimpo, codigo.trim()]
    );

    if (result.rows.length === 0)
      return res.status(400).json({ error: "Código inválido ou expirado." });

    // Gerar token de reset único
    const resetToken = crypto.randomBytes(32).toString("hex");
    const expira = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos

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

module.exports = router;
