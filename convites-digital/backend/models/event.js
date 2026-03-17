const db = require("../database"); // Ajuste o caminho conforme sua estrutura

class Event {
  static async getAll(userId) {
    return new Promise((resolve, reject) => {
      db.all(
        "SELECT * FROM eventos WHERE usuario_id = ? ORDER BY data DESC",
        [userId],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        },
      );
    });
  }

  static async getById(id, userId) {
    return new Promise((resolve, reject) => {
      db.get(
        "SELECT * FROM eventos WHERE id = ? AND usuario_id = ?",
        [id, userId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        },
      );
    });
  }

  static async create(titulo, descricao, data, local, userId) {
    return new Promise((resolve, reject) => {
      db.run(
        "INSERT INTO eventos (titulo, descricao, data, local, usuario_id) VALUES (?, ?, ?, ?, ?)",
        [titulo, descricao, data, local, userId],
        function (err) {
          if (err) reject(err);
          else resolve({ id: this.lastID, titulo, descricao, data, local });
        },
      );
    });
  }

  static async update(id, titulo, descricao, data, local, userId) {
    return new Promise((resolve, reject) => {
      db.run(
        "UPDATE eventos SET titulo = ?, descricao = ?, data = ?, local = ? WHERE id = ? AND usuario_id = ?",
        [titulo, descricao, data, local, id, userId],
        function (err) {
          if (err) reject(err);
          else
            resolve(
              this.changes > 0 ? { id, titulo, descricao, data, local } : null,
            );
        },
      );
    });
  }

  static async delete(id, userId) {
    return new Promise((resolve, reject) => {
      db.run(
        "DELETE FROM eventos WHERE id = ? AND usuario_id = ?",
        [id, userId],
        function (err) {
          if (err) reject(err);
          else resolve(this.changes > 0);
        },
      );
    });
  }
}

module.exports = Event;
