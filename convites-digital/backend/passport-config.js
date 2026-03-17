const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { Pool } = require('pg');

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "convitesdb",
  password: "0000",
  port: 5432,
});

// Configuração do Google OAuth
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID || 'SEU_GOOGLE_CLIENT_ID',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'SEU_GOOGLE_CLIENT_SECRET',
    callbackURL: "http://localhost:5000/api/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Verificar se usuário já existe
      const result = await pool.query(
        "SELECT * FROM usuarios WHERE email = $1",
        [profile.emails[0].value]
      );

      if (result.rows.length > 0) {
        // Usuário já existe
        return done(null, result.rows[0]);
      } else {
        // Criar novo usuário
        const newUser = await pool.query(
          "INSERT INTO usuarios (nome, email, senha, google_id, criado_em) VALUES ($1, $2, $3, $4, NOW()) RETURNING *",
          [profile.displayName, profile.emails[0].value, 'google_oauth', profile.id]
        );
        return done(null, newUser.rows[0]);
      }
    } catch (err) {
      return done(err, null);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const result = await pool.query("SELECT * FROM usuarios WHERE id = $1", [id]);
    done(null, result.rows[0]);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;
