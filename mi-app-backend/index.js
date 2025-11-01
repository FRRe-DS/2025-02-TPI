// --- archivo: index.js (o app.js) ---
import 'dotenv/config';
import express from 'express';
const app = express();
const PORT = process.env.PORT || 3000;

// --- Middlewares ---
// ¡IMPORTANTE! Para que req.body funcione (para POST y PATCH)
app.use(express.json()); 

// --- Importar Rutas ---
import authRouter from './Rutas/authRoutes.js';

// Rutas separadas por consumidor
import stockRouter from './Rutas/stock.routes.js';
import comprasRouter from './Rutas/compras.routes.js';
import logisticaRouter from './Rutas/logistica.routes.js';



// --- Montar Rutas ---

// ========================================
// RUTAS DE AUTENTICACIÓN (Sin protección)
// ========================================
app.use('/auth', authRouter);

// ========================================
// RUTAS SEPARADAS POR CONSUMIDOR
// ========================================

// Rutas para VENDEDORES (Gestión de inventario)
// TODO: Agregar keycloak.protect('vendedor')
app.use('/api/stock', stockRouter);

// Rutas para PORTAL DE COMPRAS (Clientes)
// Algunas públicas, otras protegidas
app.use('/api/compras', comprasRouter);

// Rutas para LOGÍSTICA (Transporte y entregas)
// TODO: Agregar keycloak.protect('logistica')
app.use('/api/logistica', logisticaRouter);
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