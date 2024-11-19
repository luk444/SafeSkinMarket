const express = require('express');
const passport = require('passport');
const SteamStrategy = require('passport-steam').Strategy;
const axios = require('axios');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const bodyParser = require("body-parser");
const admin = require("firebase-admin");
const session = require('express-session'); // Agregar express-session

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

// Agregar middleware de sesión para usar con passport
app.use(session({
  secret: process.env.SESSION_SECRET || 'tu_clave_secreta', // Cambia esto por una clave secreta
  resave: false,
  saveUninitialized: true
}));

// Inicializar Passport
app.use(passport.initialize());
app.use(passport.session()); // Necesario para que passport gestione la sesión

// Serializar el usuario para guardarlo en la sesión
passport.serializeUser((user, done) => {
  console.log('serializeUser: ', user)
  done(null, user.id); // Guarda solo el ID del usuario, que es más pequeño y seguro
});

// Deserializar el usuario para obtener la información completa del usuario de la base de datos
passport.deserializeUser(async (id, done) => {
  try {
    console.log('deserializeUser id ', id)
    const db = admin.firestore();
    const userDoc = await db.collection('steamUsers').doc(id).get(); // Obtén el usuario de Firestore usando el ID
    
    if (userDoc.exists) {
      const user = userDoc.data();
      done(null, user); // Pasa el usuario completo a la sesión
    } else {
      done(new Error('Usuario no encontrado'), null); // Maneja si el usuario no existe
    }
  } catch (error) {
    done(error, null);
  }
});


// Configuración de la estrategia de autenticación de Steam
passport.use(new SteamStrategy({
  returnURL: `${process.env.BACKEND_URL || 'http://192.168.1.41:5001'}/auth/steam/return`,
  realm: process.env.BACKEND_URL || 'http://192.168.1.41:5001',
  apiKey: process.env.STEAM_API_KEY,
}, async (identifier, profile, done) => {
  const steamId = identifier.split('/').pop();
  console.log('steamIdsteamId', steamId);
  try {
    console.log('profile', profile);

    const firebaseUid = profile.id; 

    // Acceder a Firestore para comprobar si el usuario ya existe
    const db = admin.firestore();
    const userDoc = await db.collection('steamUsers').doc(firebaseUid).get();
    const updatedUser = {
      steamId,
      displayName: profile.displayName,
      avatar: profile.photos[2]?.value || '',
      // Agregar cualquier otro dato adicional que desees
    }
    if (userDoc.exists) {
      // Si el documento existe, actualizarlo con el nuevo Steam ID y otros datos
      await db.collection('steamUsers').doc(firebaseUid).update(updatedUser);
      console.log(`Steam ID actualizado para el usuario ${firebaseUid}: ${steamId}`);
    } else {
      // Si el documento no existe, crear uno nuevo
      await db.collection('steamUsers').doc(firebaseUid).set(updatedUser);
      console.log(`Steam ID guardado para el usuario ${firebaseUid}: ${steamId}`);
    }
    return done(null, { ...profile, steamId });
  } catch (error) {
    console.error('Error al guardar el Steam ID en Firestore:', error.message);
    return done(error, null);
  }
}));

// Middleware para verificar el token de Firebase
const authenticateFirebaseToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) return res.status(401).json({ error: "Token no proporcionado" });

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;

    // Recuperar Steam ID desde la colección 'steamUsers' en Firestore
    const db = admin.firestore();
    const userDoc = await db.collection('steamUsers').doc(req.user.uid).get(); // Cambiar 'users' a 'steamUsers'
    console.log('Middleware : Recuperar Steam ID desde la colección steamUsers en Firestore')
    console.log('userDoc.data()',userDoc.data())

    if (!userDoc.exists || !userDoc.data().steamId) {
      console.log("Usuario o Steam ID no encontrado");
      return res.status(400).json({ error: "Steam ID no encontrado para el usuario" });
    }

    req.user.steamId = userDoc.data().steamId; // Añadir Steam ID al usuario
    next();
  } catch (error) {
    console.error('Error autenticando el token:', error);
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
  async (req, res) => {
    const steamId = req.user.id; // Steam ID de Steam
    console.log('Steam ID recibido:', steamId);
    res.json({ steamId });

      // esto lo tengo que hacer el en frontend porque ahi tengo guardado el uid para vincularlo con el steamId
      // const db = admin.firestore();
      // await db.collection('users').doc(uid).set({ steamId }, { merge: true });

      // res.redirect(`${process.env.FRONTEND_URL || 'http://192.168.1.41:3000'}/dashboard?steamId=${steamId}`);
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
  console.log('get /api/inventory');
  
  // TODO check token
  // Extraer Steam ID de los custom claims de Firebase
  const steamId = req.user?.steamId;
  console.log('req.user', req.user);
  console.log('steamId', steamId);
  if (!steamId) {
    console.log("Steam ID no encontrado");
    return res.status(400).json({ message: "Steam ID no encontrado" });
  }

  const inventoryUrl = `https://steamcommunity.com/inventory/${steamId}/730/2?l=english&count=5000`;

  try {
    const response = await axios.get(inventoryUrl);
    res.json(response.data);
  } catch (error) {
    console.error('Error al obtener el inventario:', error.message);
    res.status(500).json({ message: "Error al obtener el inventario" });
  }
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor backend escuchando: ${process.env.BACKEND_URL || `http://192.168.1.41:${PORT}`}`);
});
