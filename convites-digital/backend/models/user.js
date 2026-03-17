const db = require("../database"); // Ajuste o caminho conforme sua estrutura
const bcrypt = require("bcryptjs");

class User {
  static async create(nome, email, senha) {
    const hashedPassword = await bcrypt.hash(senha, 10);

    return new Promise((resolve, reject) => {
      db.run(
        "INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)",
        [nome, email, hashedPassword],
        function (err) {
          if (err) reject(err);
          else resolve({ id: this.lastID, nome, email });
        },
      );
    });
  }

  static async findByEmail(email) {
    return new Promise((resolve, reject) => {
      db.get("SELECT * FROM usuarios WHERE email = ?", [email], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  static async findById(id) {
    return new Promise((resolve, reject) => {
      db.get(
        "SELECT id, nome, email FROM usuarios WHERE id = ?",
        [id],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        },
      );
    });
  }
}

module.exports = User;
