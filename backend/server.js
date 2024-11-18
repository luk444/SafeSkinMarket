const express = require('express');
const passport = require('passport');
const SteamStrategy = require('passport-steam').Strategy;
const axios = require('axios');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const bodyParser = require("body-parser");
const admin = require("firebase-admin");

// Inicializar Firebase Admin con tu clave privada
const serviceAccount = require("./safetrade-firebase-backend-admin.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(bodyParser.json());

// Seguridad adicional con Helmet para proteger cabeceras
app.use(helmet());

// Middleware CORS para permitir solicitudes desde el frontend
app.use(cors({
  origin: process.env.NODE_ENV !== 'production', // Permitir todos los orígenes estando fuera de production
  credentials: true // Permitir el envío de cookies
}));

// Inicializar Passport
app.use(passport.initialize());

// Configuración de la estrategia de autenticación de Steam
passport.use(new SteamStrategy({
  returnURL: `${process.env.BACKEND_URL || 'http://192.168.1.41:5001'}/auth/steam/return`,
  realm: process.env.BACKEND_URL || 'http://192.168.1.41:5001',
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

// Middleware para verificar el token de Firebase
const authenticateFirebaseToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) return res.status(401).json({ error: "Token no proporcionado" });

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken; // Decodificar y añadir datos del usuario al request
    next();
  } catch (error) {
    res.status(401).json({ error: "Token inválido" });
  }
};

// Endpoint protegido
app.get("/profile", authenticateFirebaseToken, (req, res) => {
  res.json({ message: "¡Bienvenido!", user: req.user });
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
      res.redirect(`${process.env.FRONTEND_URL || 'http://192.168.1.41:3000'}/dashboard?userData=${userDataString}`);
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
app.get('/api/inventory', authenticateFirebaseToken, async (req, res) => {
  console.log('get /api/inventory')
  // TODO check token
  const steamId = req.user?.id;
  console.log('req.user', req.user);
  console.log('steamId', steamId);
  if (!steamId) {
    console.log("Steam ID no encontrado");
    return res.status(400).json({ message: "Steam ID no encontrado" });
  }
  
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
  console.log(`Servidor backend escuchando: ${process.env.BACKEND_URL || `http://192.168.1.41:${PORT}`}`);
});
