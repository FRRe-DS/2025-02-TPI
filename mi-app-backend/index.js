// --- archivo: index.js (o app.js) ---
import 'dotenv/config';
import express from 'express';
const app = express();
const PORT = process.env.PORT || 3000;

// --- Middlewares ---
// ¡IMPORTANTE! Para que req.body funcione (para POST y PATCH)
app.use(express.json()); 

// --- Importar Rutas ---
import reservasRouter from './Rutas/reservasRoutes.js';
import productosRouter from './Rutas/productosRoutes.js';
import categoriasRouter from './Rutas/categoriasRoutes.js';
import authRouter from './Rutas/authRoutes.js';



// --- Montar Rutas ---
// Le decimos a Express: "Cualquier petición que empiece con '/api/v1/reservas',

// Rutas de autenticación (sin prefijo /api)
app.use('/auth', authRouter);

// Rutas de API
app.use('/api/v1/reservas', reservasRouter);
app.use('/api/v1/productos', productosRouter);
app.use('/api/v1/categorias',categoriasRouter);
// app.use('/api/v1/productos', productosRouter);
// ===============================================


//(HEALTH CHECK)
// ===============================================
app.get('/', (req, res) => {
  res.status(200).json({ mensaje: '¡El servidor esta vivo! TESTI ES UN KPO' });
});
// ===============================================

// --- Iniciar Servidor ---
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});