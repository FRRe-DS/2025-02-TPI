// --- archivo: index.js (o app.js) ---
import 'dotenv/config';
import express from 'express';
import { auth } from 'express-oauth2-jwt-bearer';
const app = express();
const PORT = process.env.PORT || 3000;



// --- Importar Rutas ---
import reservasRouter from './Rutas/reservasRoutes.js';
import productosRouter from './Rutas/productosRoutes.js';
import categoriasRouter from './Rutas/categoriasRoutes.js';
import authRouter from './Rutas/authRoutes.js';

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
// --- Montar Rutas ---
// Le decimos a Express: "Cualquier petición que empiece con '/api/v1/reservas',
// Le decimos a Express que USE este guardia en TODAS las rutas /api/v1
// Esto bloqueará cualquier petición que no tenga un token válido.
app.use('/api/v1', checkJwt);

HEAD
// --- Montar Rutas ---
// Estas rutas ahora están protegidas por 'checkJwt'

// Rutas de autenticación (sin prefijo /api)
app.use('/auth', authRouter);

// Rutas de API
origin/main
app.use('/api/v1/reservas', reservasRouter);
app.use('/api/v1/productos', productosRouter);
app.use('/api/v1/categorias', categoriasRouter);


//(HEALTH CHECK)
// ===============================================
app.get('/', (req, res) => {
  res.status(200).json({ mensaje: '¡El servidor esta vivo!' });
});
// ===============================================

// --- Iniciar Servidor ---
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});