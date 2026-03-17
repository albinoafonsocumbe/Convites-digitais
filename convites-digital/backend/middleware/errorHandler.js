// Middleware global de tratamento de erros

const errorHandler = (err, req, res, next) => {
  console.error("❌ Erro:", err);

  // Erros de validação do PostgreSQL
  if (err.code === "23505") {
    return res.status(409).json({ error: "Registo duplicado" });
  }
  if (err.code === "23503") {
    return res.status(400).json({ error: "Referência inválida" });
  }

  res.status(err.status || 500).json({
    error: err.message || "Erro interno do servidor",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

const notFound = (req, res) => {
  res.status(404).json({ error: `Rota não encontrada: ${req.method} ${req.path}` });
};

module.exports = { errorHandler, notFound };
