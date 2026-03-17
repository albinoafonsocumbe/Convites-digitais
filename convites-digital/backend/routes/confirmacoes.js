const express = require("express");
const pool = require("../db");
const { validarId } = require("../middleware/validate");

const router = express.Router();

// PUT /api/confirmacoes/:id
router.put("/:id", validarId, async (req, res, next) => {
  const { confirmado, numero_acompanhantes } = req.body;

  if (typeof confirmado !== "boolean")
    return res.status(400).json({ error: "Status de confirmação inválido" });

  try {
    const result = await pool.query(
      "UPDATE confirmacoes SET confirmado=$1, numero_acompanhantes=$2 WHERE id=$3 RETURNING *",
      [confirmado, numero_acompanhantes || 0, req.params.id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: "Confirmação não encontrada" });

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/confirmacoes/:id
router.delete("/:id", validarId, async (req, res, next) => {
  try {
    const result = await pool.query("DELETE FROM confirmacoes WHERE id=$1 RETURNING id", [req.params.id]);
    if (result.rows.length === 0)
      return res.status(404).json({ error: "Confirmação não encontrada" });

    res.json({ message: "Confirmação deletada com sucesso" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
