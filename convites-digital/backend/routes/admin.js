const express = require("express");
const pool = require("../db");
const { authenticateToken } = require("../auth");

const router = express.Router();

// Middleware — só admins
const requireAdmin = (req, res, next) => {
  if (req.user?.role !== "admin") return res.status(403).json({ error: "Acesso negado" });
  next();
};

router.use(authenticateToken, requireAdmin);

// GET /api/admin/stats
router.get("/stats", async (_req, res, next) => {
  try {
    const [usuarios, eventos, confirmacoes] = await Promise.all([
      pool.query("SELECT COUNT(*) FROM usuarios"),
      pool.query("SELECT COUNT(*) FROM eventos"),
      pool.query("SELECT COUNT(*) FROM confirmacoes"),
    ]);
    res.json({
      totalUsuarios: parseInt(usuarios.rows[0].count),
      totalEventos: parseInt(eventos.rows[0].count),
      totalConfirmacoes: parseInt(confirmacoes.rows[0].count),
    });
  } catch (err) { next(err); }
});

// GET /api/admin/usuarios
router.get("/usuarios", async (req, res, next) => {
  try {
    const { search = "", page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const params = [`%${search}%`, parseInt(limit), offset];
    const result = await pool.query(
      `SELECT u.id, u.nome, u.email, u.role, u.bloqueado, u.criado_em,
        COUNT(e.id) AS total_eventos
       FROM usuarios u
       LEFT JOIN eventos e ON e.usuario_id = u.id
       WHERE u.nome ILIKE $1 OR u.email ILIKE $1
       GROUP BY u.id
       ORDER BY u.criado_em DESC
       LIMIT $2 OFFSET $3`,
      params
    );
    const count = await pool.query(
      "SELECT COUNT(*) FROM usuarios WHERE nome ILIKE $1 OR email ILIKE $1",
      [`%${search}%`]
    );
    res.json({ data: result.rows, total: parseInt(count.rows[0].count) });
  } catch (err) { next(err); }
});

// GET /api/admin/usuarios/:id
router.get("/usuarios/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const [user, eventos] = await Promise.all([
      pool.query("SELECT id, nome, email, role, bloqueado, criado_em FROM usuarios WHERE id=$1", [id]),
      pool.query("SELECT e.id, e.nome_evento, e.data_evento, e.local_evento, e.criado_em, COUNT(c.id) AS confirmacoes FROM eventos e LEFT JOIN confirmacoes c ON c.evento_id = e.id WHERE e.usuario_id=$1 GROUP BY e.id ORDER BY e.criado_em DESC", [id]),
    ]);
    if (!user.rows[0]) return res.status(404).json({ error: "Utilizador não encontrado" });
    res.json({ ...user.rows[0], eventos: eventos.rows });
  } catch (err) { next(err); }
});

// PATCH /api/admin/usuarios/:id/bloquear
router.patch("/usuarios/:id/bloquear", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { bloqueado } = req.body;
    await pool.query("UPDATE usuarios SET bloqueado=$1 WHERE id=$2", [bloqueado, id]);
    res.json({ message: bloqueado ? "Utilizador bloqueado" : "Utilizador desbloqueado" });
  } catch (err) { next(err); }
});

// PATCH /api/admin/usuarios/:id/role
router.patch("/usuarios/:id/role", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    if (!["user", "admin"].includes(role)) return res.status(400).json({ error: "Role inválido" });
    await pool.query("UPDATE usuarios SET role=$1 WHERE id=$2", [role, id]);
    res.json({ message: "Role atualizado" });
  } catch (err) { next(err); }
});

// DELETE /api/admin/usuarios/:id
router.delete("/usuarios/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    if (parseInt(id) === req.user.id) return res.status(400).json({ error: "Não podes apagar a tua própria conta" });
    await pool.query("DELETE FROM usuarios WHERE id=$1", [id]);
    res.json({ message: "Utilizador apagado" });
  } catch (err) { next(err); }
});

// GET /api/admin/eventos
router.get("/eventos", async (req, res, next) => {
  try {
    const { search = "", page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const result = await pool.query(
      `SELECT e.id, e.nome_evento, e.data_evento, e.local_evento, e.criado_em,
        u.nome AS usuario_nome, u.email AS usuario_email,
        COUNT(c.id) AS total_confirmacoes
       FROM eventos e
       JOIN usuarios u ON u.id = e.usuario_id
       LEFT JOIN confirmacoes c ON c.evento_id = e.id
       WHERE e.nome_evento ILIKE $1 OR u.nome ILIKE $1 OR u.email ILIKE $1
       GROUP BY e.id, u.id
       ORDER BY e.criado_em DESC
       LIMIT $2 OFFSET $3`,
      [`%${search}%`, parseInt(limit), offset]
    );
    const count = await pool.query(
      `SELECT COUNT(*) FROM eventos e JOIN usuarios u ON u.id = e.usuario_id WHERE e.nome_evento ILIKE $1 OR u.nome ILIKE $1`,
      [`%${search}%`]
    );
    res.json({ data: result.rows, total: parseInt(count.rows[0].count) });
  } catch (err) { next(err); }
});

// DELETE /api/admin/eventos/:id
router.delete("/eventos/:id", async (req, res, next) => {
  try {
    await pool.query("DELETE FROM eventos WHERE id=$1", [req.params.id]);
    res.json({ message: "Evento apagado" });
  } catch (err) { next(err); }
});

module.exports = router;
