const pool = require("../db");

const RSVP = {
  create: async ({ invitation_id, resposta }) => {
    const result = await pool.query(
      "INSERT INTO rsvps (invitation_id, resposta) VALUES ($1, $2) RETURNING *",
      [invitation_id, resposta],
    );
    return result.rows[0];
  },

  getByInvitation: async (invitation_id) => {
    const result = await pool.query(
      "SELECT * FROM rsvps WHERE invitation_id=$1",
      [invitation_id],
    );
    return result.rows;
  },
};

module.exports = RSVP;
