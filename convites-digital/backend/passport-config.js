const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const pool = require("./db");

passport.use(new GoogleStrategy(
  {
    clientID:     process.env.GOOGLE_CLIENT_ID     || "",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    callbackURL:  `${process.env.BACKEND_URL || "http://localhost:5000"}/api/auth/google/callback`,
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails?.[0]?.value;
      if (!email) return done(new Error("Email não disponível no perfil Google"), null);

      // Verificar se já existe
      const existing = await pool.query("SELECT * FROM usuarios WHERE email = $1", [email]);
      if (existing.rows.length > 0) {
        // Actualizar google_id se ainda não tiver
        if (!existing.rows[0].google_id) {
          await pool.query("UPDATE usuarios SET google_id=$1 WHERE email=$2", [profile.id, email]);
        }
        return done(null, existing.rows[0]);
      }

      // Criar novo utilizador
      const result = await pool.query(
        "INSERT INTO usuarios (nome, email, senha, google_id, criado_em) VALUES ($1,$2,$3,$4,NOW()) RETURNING *",
        [profile.displayName || email.split("@")[0], email, "google_oauth", profile.id]
      );
      return done(null, result.rows[0]);
    } catch (err) {
      return done(err, null);
    }
  }
));

passport.serializeUser((user, done) => done(null, user.id));

passport.deserializeUser(async (id, done) => {
  try {
    const result = await pool.query("SELECT * FROM usuarios WHERE id = $1", [id]);
    done(null, result.rows[0] || null);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;
