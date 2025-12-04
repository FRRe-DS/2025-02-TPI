// --- archivo: mi-app-backend/index.js ---
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import session from 'express-session'; 

// --- Importar desde el nuevo archivo ---
import { keycloak, memoryStore } from './keycloak-config.js';

const app = express();
const PORT = process.env.PORT || 4000;

const corsOptions = {
  origin: ['http://localhost:3000', 'http://localhost:3001'], 
  methods: 'GET,POST,PATCH,DELETE,PUT', 
  allowedHeaders: 'Content-Type,Authorization' // <-- IMPORTANTE: Añadir 'Authorization'
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

// --- Logging middleware para debug ---
app.use((req, res, next) => {
  console.log('🔥 INCOMING REQUEST:', {
    method: req.method,
    path: req.path,
    url: req.url,
    headers: {
      authorization: req.headers.authorization,
      'content-type': req.headers['content-type'],
      origin: req.headers.origin
    },
    query: req.query,
    body: req.body && Object.keys(req.body).length > 0 ? req.body : 'empty'
  });
  next();
});

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
app.use('/api/productos', productosRouter);
app.use('/api/v1/categorias', categoriasRouter);

// (HEALTH CHECK)
app.get('/', (req, res) => {
  res.status(200).json({ mensaje: '¡El servidor esta vivo! TESTI ES UN KPO' });
});

// --- Iniciar Servidor ---
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});