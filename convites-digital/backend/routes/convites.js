const express = require("express");
const jwt = require("jsonwebtoken");
const pool = require("../db");
const { authenticateToken, JWT_SECRET } = require("../auth");
const { validarEvento, validarConfirmacao, validarId } = require("../middleware/validate");
const { enviarConvite, enviarConfirmacao } = require("../email");

const router = express.Router();

// Extrai userId do token sem bloquear (opcional)
const getUserIdFromToken = (req) => {
  try {
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) return null;
    return jwt.verify(token, JWT_SECRET).id;
  } catch {
    return null;
  }
};

// GET /api/convites?status=proximos&page=1&limit=10
router.get("/", async (req, res, next) => {
  try {
    const userId = getUserIdFromToken(req);
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const conditions = [];
    const params = [];

    if (userId) {
      params.push(userId);
      conditions.push(`usuario_id = $${params.length}`);
    }

    if (status === "proximos") conditions.push("data_evento >= CURRENT_DATE");
    else if (status === "passados") conditions.push("data_evento < CURRENT_DATE");

    const where = conditions.length ? "WHERE " + conditions.join(" AND ") : "";

    const query = `
      SELECT e.*,
        (SELECT COUNT(*) FROM confirmacoes WHERE evento_id = e.id AND confirmado = true) AS total_confirmados
      FROM eventos e
      ${where}
      ORDER BY data_evento DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;
    params.push(parseInt(limit), offset);

    const countQuery = `SELECT COUNT(*) FROM eventos e ${where}`;
    const [result, countResult] = await Promise.all([
      pool.query(query, params),
      pool.query(countQuery, params.slice(0, params.length - 2)),
    ]);

    res.json({
      data: result.rows,
      total: parseInt(countResult.rows[0].count),
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/convites/:id
router.get("/:id", validarId, async (req, res, next) => {
  try {
    const { id } = req.params;
    const [evento, stats] = await Promise.all([
      pool.query("SELECT * FROM eventos WHERE id = $1", [id]),
      pool.query(
        `SELECT
          COUNT(*) AS total_respostas,
          COUNT(*) FILTER (WHERE confirmado = true) AS confirmados,
          COALESCE(SUM(numero_acompanhantes) FILTER (WHERE confirmado = true), 0) AS total_acompanhantes
        FROM confirmacoes WHERE evento_id = $1`,
        [id]
      ),
    ]);

    if (evento.rows.length === 0)
      return res.status(404).json({ error: "Convite não encontrado" });

    res.json({ ...evento.rows[0], estatisticas: stats.rows[0] });
  } catch (err) {
    next(err);
  }
});

// POST /api/convites
router.post("/", authenticateToken, validarEvento, async (req, res, next) => {
  const { titulo, descricao, data, local, musica_url, video_url, fotos } = req.body;
  try {
    const fotosArray = Array.isArray(fotos) ? fotos.filter(f => f?.trim()) : [];
    const result = await pool.query(
      "INSERT INTO eventos (usuario_id, nome_evento, data_evento, local_evento, mensagem, musica_url, video_url, fotos, criado_em) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NOW()) RETURNING *",
      [req.user.id, titulo.trim(), data, local.trim(), descricao?.trim() || "", musica_url?.trim() || null, video_url?.trim() || null, fotosArray]
    );
    console.log("✅ Evento criado:", result.rows[0].id);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// PUT /api/convites/:id
router.put("/:id", authenticateToken, validarId, validarEvento, async (req, res, next) => {
  const { titulo, descricao, data, local, musica_url, video_url, fotos } = req.body;
  const { id } = req.params;
  try {
    const check = await pool.query("SELECT usuario_id FROM eventos WHERE id = $1", [id]);
    if (check.rows.length === 0) return res.status(404).json({ error: "Convite não encontrado" });
    if (check.rows[0].usuario_id !== req.user.id) return res.status(403).json({ error: "Sem permissão" });

    const fotosArray = Array.isArray(fotos) ? fotos.filter(f => f?.trim()) : [];
    const result = await pool.query(
      "UPDATE eventos SET nome_evento=$1, mensagem=$2, data_evento=$3, local_evento=$4, musica_url=$5, video_url=$6, fotos=$7 WHERE id=$8 RETURNING *",
      [titulo.trim(), descricao?.trim() || "", data, local.trim(), musica_url?.trim() || null, video_url?.trim() || null, fotosArray, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/convites/:id
router.delete("/:id", authenticateToken, validarId, async (req, res, next) => {
  const { id } = req.params;
  try {
    const check = await pool.query("SELECT usuario_id FROM eventos WHERE id = $1", [id]);
    if (check.rows.length === 0) return res.status(404).json({ error: "Convite não encontrado" });
    if (check.rows[0].usuario_id !== req.user.id) return res.status(403).json({ error: "Sem permissão" });

    await pool.query("DELETE FROM eventos WHERE id = $1", [id]);
    res.json({ message: "Convite deletado com sucesso" });
  } catch (err) {
    next(err);
  }
});

// GET /api/convites/:id/confirmacoes
router.get("/:id/confirmacoes", validarId, async (req, res, next) => {
  const { id } = req.params;
  try {
    const existe = await pool.query("SELECT id FROM eventos WHERE id = $1", [id]);
    if (existe.rows.length === 0) return res.status(404).json({ error: "Evento não encontrado" });

    const result = await pool.query(
      "SELECT * FROM confirmacoes WHERE evento_id = $1 ORDER BY criado_em DESC",
      [id]
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// POST /api/convites/:id/confirmacoes
router.post("/:id/confirmacoes", validarId, validarConfirmacao, async (req, res, next) => {
  const { id } = req.params;
  const { nome_convidado, email, telefone, confirmado, numero_acompanhantes, mensagem } = req.body;
  try {
    const existe = await pool.query("SELECT * FROM eventos WHERE id = $1", [id]);
    if (existe.rows.length === 0) return res.status(404).json({ error: "Evento não encontrado" });

    if (email) {
      const dup = await pool.query(
        "SELECT id FROM confirmacoes WHERE evento_id = $1 AND email = $2",
        [id, email.trim()]
      );
      if (dup.rows.length > 0)
        return res.status(409).json({ error: "Este email já confirmou presença neste evento" });
    }

    const result = await pool.query(
      "INSERT INTO confirmacoes (evento_id, nome_convidado, email, telefone, confirmado, numero_acompanhantes, mensagem, criado_em) VALUES ($1,$2,$3,$4,$5,$6,$7,NOW()) RETURNING *",
      [id, nome_convidado.trim(), email?.trim() || null, telefone?.trim() || null, confirmado, numero_acompanhantes || 0, mensagem?.trim() || null]
    );

    // Enviar email de confirmação em background (não bloqueia resposta)
    if (email) {
      const linkConvite = `${process.env.FRONTEND_URL || "http://localhost:3000"}/convite/${id}`;
      enviarConfirmacao({ email: email.trim(), nomeConvidado: nome_convidado.trim(), evento: existe.rows[0], confirmado, linkConvite })
        .catch(err => console.error("⚠️ Falha no email de confirmação:", err.message));
    }

    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// GET /api/convites/:id/estatisticas
router.get("/:id/estatisticas", validarId, async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT
        COUNT(*) AS total_respostas,
        COUNT(*) FILTER (WHERE confirmado = true) AS confirmados,
        COUNT(*) FILTER (WHERE confirmado = false) AS nao_confirmados,
        COALESCE(SUM(numero_acompanhantes) FILTER (WHERE confirmado = true), 0) AS total_acompanhantes
      FROM confirmacoes WHERE evento_id = $1`,
      [req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// POST /api/convites/:id/enviar-email
router.post("/:id/enviar-email", authenticateToken, validarId, async (req, res, next) => {
  const { id } = req.params;
  const { emails } = req.body;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emails || !Array.isArray(emails) || emails.length === 0)
    return res.status(400).json({ error: "Forneça pelo menos um email" });

  const invalidos = emails.filter(e => !emailRegex.test(e.trim()));
  if (invalidos.length > 0)
    return res.status(400).json({ error: `Emails inválidos: ${invalidos.join(", ")}` });

  try {
    const [eventoResult, userResult] = await Promise.all([
      pool.query("SELECT * FROM eventos WHERE id = $1", [id]),
      pool.query("SELECT nome FROM usuarios WHERE id = $1", [req.user.id]),
    ]);

    if (eventoResult.rows.length === 0) return res.status(404).json({ error: "Evento não encontrado" });
    if (eventoResult.rows[0].usuario_id !== req.user.id) return res.status(403).json({ error: "Sem permissão" });

    const linkConvite = `${process.env.FRONTEND_URL || "http://localhost:3000"}/convite/${id}`;
    const resultados = await enviarConvite({
      emails,
      evento: eventoResult.rows[0],
      linkConvite,
      nomeAnfitriao: userResult.rows[0]?.nome || "Anfitrião",
    });

    const enviados = resultados.resultados.filter(r => r.sucesso).length;
    res.json({ message: `${enviados} email(s) enviado(s) com sucesso`, ...resultados });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
