const express = require('express');
const session = require('express-session');
const passport = require('passport');
const SteamStrategy = require('passport-steam').Strategy;
const axios = require('axios');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Seguridad adicional con Helmet para proteger cabeceras
app.use(helmet());

// Middleware CORS para permitir solicitudes desde el frontend
app.use(cors({
  origin: 'http://localhost:3000', // Solo permitir el acceso desde tu dominio
  credentials: true
}));

// Configuración de la sesión con cookies seguras
app.use(session({
  secret: process.env.SESSION_SECRET || 'your_secret_key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // true si está en producción
    maxAge: 24 * 60 * 60 * 1000, // 1 día
  }
}));

// Inicializar Passport
app.use(passport.initialize());
app.use(passport.session());

// Configuración de la estrategia de autenticación de Steam
passport.use(new SteamStrategy({
  returnURL: `${process.env.BACKEND_URL || 'http://localhost:5001'}/auth/steam/return`,
  realm: process.env.BACKEND_URL || 'http://localhost:5001',
  apiKey: process.env.STEAM_API_KEY,
}, (identifier, profile, done) => {
  profile.identifier = identifier;
  return done(null, profile);
}));

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

// Ruta de autenticación con Steam
app.get('/auth/steam',
  passport.authenticate('steam', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('/');
  }
);

// Ruta de retorno después de la autenticación con Steam
app.get('/auth/steam/return',
  passport.authenticate('steam', { failureRedirect: '/' }),
  (req, res) => {
    if (req.user) {
      const userData = {
        id: req.user.id,
        displayName: req.user.displayName,
        avatar: req.user.photos[2]?.value || '',
        message: `Hola, ${req.user.displayName}!`
      };
      const userDataString = encodeURIComponent(JSON.stringify(userData));
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard?userData=${userDataString}`);
    } else {
      res.redirect('/');
    }
  }
);

// Ruta para cerrar sesión
app.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

// Ruta para obtener el inventario del usuario autenticado
app.get('/api/inventory', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "No autenticado" });
  }

  // Verifica que el usuario esté autenticado y que req.user tenga un ID de Steam
  const steamId = req.user.id;
  if (!steamId) {
    return res.status(400).json({ message: "Steam ID no encontrado" });
  }
  console.log('steamId', steamId);
  
  // URL para obtener el inventario de Steam
  const inventoryUrl = `https://steamcommunity.com/inventory/${steamId}/730/2?l=english&count=5000`;

  try {
    // Solicitar inventario a la API de Steam
    const response = await axios.get(inventoryUrl);
    res.json(response.data);  // Enviar la respuesta JSON al frontend
  } catch (error) {
    console.error('Error al obtener el inventario:', error.message);
    res.status(500).json({ message: "Error al obtener el inventario" });
  }
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en ${process.env.BACKEND_URL || `http://localhost:${PORT}`}`);
});
