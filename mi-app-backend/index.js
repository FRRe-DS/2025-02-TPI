// --- archivo: mi-app-backend/index.js ---
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import session from 'express-session'; 

// --- Importar desde el nuevo archivo ---
import { keycloak, memoryStore } from './keycloak-config.js';
import supabase from './dbConfig.js';

const app = express();
const PORT = process.env.PORT || 4000;

const corsOptions = {
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost'], 
  methods: 'GET,POST,PATCH,DELETE,PUT', 
  allowedHeaders: 'Content-Type,Authorization',
  credentials: true
};

// --- Middlewares ---
app.use(express.json()); 
app.use(cors(corsOptions));

// --- Usar el memoryStore importado ---
app.use(session({
  secret: process.env.SESSION_SECRET || 'tu-secreto-de-sesion-muy-seguro',
  resave: false,
  saveUninitialized: true,
  store: memoryStore // <-- Usamos el store importado
}));

// --- Usar el keycloak importado ---
// Este middleware es el "guardia" que leerá 'keycloak.json'
app.use(keycloak.middleware({
  logout: '/logout',
  admin: '/'
}));

// --- Importar Rutas ---
import reservasRouter from './Rutas/reservasRoutes.js';
import productosRouter from './Rutas/productosRoutes.js';
import categoriasRouter from './Rutas/categoriasRoutes.js';
import authRouter from './Rutas/authRoutes.js'; 

// --- Montar Rutas ---
app.use('/auth', authRouter);
app.use('/api/v1/reservas', reservasRouter);
app.use('/api/v1/productos', productosRouter);
app.use('/api/v1/categorias', categoriasRouter);

// --- HEALTH CHECK MEJORADO ---
app.get('/', (req, res) => {
  res.status(200).json({ mensaje: '¡El servidor esta vivo! TESTI ES UN KPO' });
});

app.get('/health', async (req, res) => {
  const health = {
    uptime: process.uptime(),
    timestamp: Date.now(),
    status: 'OK',
    service: 'Stock Backend',
    database: 'unknown',
    keycloak: 'disabled'
  };

  try {
    // Test de conexión a Supabase
    const { data, error } = await supabase
      .from('categorias')
      .select('count', { count: 'exact', head: true });
    
    if (error) {
      health.database = 'error';
      health.databaseError = error.message;
      health.status = 'DEGRADED';
    } else {
      health.database = 'connected';
    }
  } catch (err) {
    health.database = 'error';
    health.databaseError = err.message;
    health.status = 'DEGRADED';
  }

  const statusCode = health.status === 'DEGRADED' ? 503 : 200;
  res.status(statusCode).json(health);
});

// --- MIDDLEWARE DE 404 (rutas no encontradas) ---
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Ruta no encontrada',
    path: req.path,
    method: req.method
  });
});

// --- MIDDLEWARE DE MANEJO DE ERRORES GLOBAL ---
app.use((err, req, res, next) => {
  console.error('❌ Error capturado:', err);
  
  const statusCode = err.status || err.statusCode || 500;
  const message = err.message || 'Error interno del servidor';
  
  res.status(statusCode).json({
    error: message,
    status: statusCode,
    timestamp: new Date().toISOString(),
    path: req.path,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// --- Iniciar Servidor ---
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`💚 Health check disponible en http://localhost:${PORT}/health`);
});