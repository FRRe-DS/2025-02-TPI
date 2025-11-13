// --- archivo: index.js (o app.js) ---
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { auth } from 'express-oauth2-jwt-bearer';
const app = express();
const PORT = process.env.PORT || 3000;



// --- Importar Rutas ---
import reservasRouter from './Rutas/reservasRoutes.js';
import productosRouter from './Rutas/productosRoutes.js';
import categoriasRouter from './Rutas/categoriasRoutes.js';
import authRouter from './Rutas/authRoutes.js';
import adminRouter from './Rutas/adminRoutes.js';
import { startReservationExpiryWorker } from './worker/reservationExpiryWorker.js';

// Esto le dice a la app que confíe en los tokens
// emitidos por tu servidor Keycloak.
const checkJwt = auth({
  // La URL de tu realm de Keycloak
  issuerBaseURL: 'http://localhost:8080/realms/ds-2025-realm',
  
  // La "audiencia" del token. Según tu JWT de ejemplo, es "account".
  audience: 'account'
});


// --- Middlewares ---
// ¡IMPORTANTE! Para que req.body funcione (para POST y PATCH)
app.use(express.json());
// Configurar CORS
app.use(cors({
  origin: ['http://localhost:3001', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
// --- Montar Rutas ---
// Le decimos a Express: "Cualquier petición que empiece con '/api/v1/reservas',
// Le decimos a Express que USE este guardia en TODAS las rutas /api/v1
// Esto bloqueará cualquier petición que no tenga un token válido.
app.use('/api/v1', checkJwt);

// --- Montar Rutas ---
// Estas rutas ahora están protegidas por 'checkJwt'

// Rutas de autenticación (sin prefijo /api)
app.use('/auth', authRouter);

// Rutas de API
app.use('/api/v1/reservas', reservasRouter);
app.use('/api/v1/productos', productosRouter);
app.use('/api/v1/categorias', categoriasRouter);
// Admin routes (under /api/v1/admin)
app.use('/api/v1/admin', adminRouter);


//(HEALTH CHECK)
// ===============================================
app.get('/', (req, res) => {
  res.status(200).json({ mensaje: '¡El servidor esta vivo!' });
});
// ===============================================

// --- Iniciar Servidor ---
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  try {
    // Iniciamos el worker que libera reservas expiradas
    startReservationExpiryWorker();
  } catch (err) {
    console.error('No se pudo iniciar el reservation expiry worker:', err);
  }
});