// Middleware de validação de inputs

const validarEvento = (req, res, next) => {
  const { titulo, data, local } = req.body;

  if (!titulo || titulo.trim().length === 0)
    return res.status(400).json({ error: "Título é obrigatório" });

  if (!data)
    return res.status(400).json({ error: "Data é obrigatória" });

  if (isNaN(new Date(data).getTime()))
    return res.status(400).json({ error: "Data inválida" });

  if (!local || local.trim().length === 0)
    return res.status(400).json({ error: "Local é obrigatório" });

  next();
};

const validarConfirmacao = (req, res, next) => {
  const { nome_convidado, confirmado } = req.body;

  if (!nome_convidado || nome_convidado.trim().length === 0)
    return res.status(400).json({ error: "Nome do convidado é obrigatório" });

  if (typeof confirmado !== "boolean")
    return res.status(400).json({ error: "Status de confirmação inválido" });

  next();
};

const validarId = (req, res, next) => {
  if (isNaN(req.params.id))
    return res.status(400).json({ error: "ID inválido" });
  next();
};

module.exports = { validarEvento, validarConfirmacao, validarId };
