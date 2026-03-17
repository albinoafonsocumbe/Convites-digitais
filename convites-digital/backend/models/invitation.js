const pool = require("../db");

const Invitation = {
  create: async ({ evento_id, convidado_email, mensagem }) => {
    const result = await pool.query(
      "INSERT INTO invitations (evento_id, convidado_email, mensagem) VALUES ($1, $2, $3) RETURNING *",
      [evento_id, convidado_email, mensagem],
    );
    return result.rows[0];
  },

  getByEvent: async (evento_id) => {
    const result = await pool.query(
      "SELECT * FROM invitations WHERE evento_id=$1",
      [evento_id],
    );
    return result.rows;
  },
};

module.exports = Invitation;
