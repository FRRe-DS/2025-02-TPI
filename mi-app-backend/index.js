// --- archivo: index.js (actualizado) ---
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import session from 'express-session'; 

// --- 1. Importar desde el nuevo archivo ---
import { keycloak, memoryStore } from './keycloak-config.js';

const app = express();
const PORT = process.env.PORT || 4000;

const corsOptions = {
  origin: 'http://localhost:3000', 
  methods: 'GET,POST,PATCH,DELETE,PUT', 
  allowedHeaders: 'Content-Type,Authorization'
};

// --- Middlewares ---
app.use(express.json()); 
app.use(cors(corsOptions));

// --- 2. Usar el memoryStore importado ---
app.use(session({
  secret: process.env.SESSION_SECRET || 'tu-secreto-de-sesion-muy-seguro',
  resave: false,
  saveUninitialized: true,
  store: memoryStore // <-- Usamos el store importado
}));

// --- 3. Usar el keycloak importado ---
app.use(keycloak.middleware({
  logout: '/logout',
  admin: '/'
}));

// === IMPORTAR ROUTERS POR PORTAL ===
import comprasRouter from './Rutas/compras.routes.js';
import logisticaRouter from './Rutas/logistica.routes.js';
import adminRouter from './Rutas/admin.routes.js';
import authRouter from './Rutas/authRoutes.js';

// === MONTAR RUTAS CON PROTECCIÓN POR ROL ===

// Autenticación (público)
app.use('/auth', authRouter);

// Portal de Compras - Requiere rol 'compras-be'
app.use('/api/v1/compras', 
  keycloak.protect('realm:compras-be'), 
  comprasRouter
);

// Logística - Requiere rol 'logistica-be'
app.use('/api/v1/logistica', 
  keycloak.protect('realm:logistica-be'), 
  logisticaRouter
);

// Administración/Vendedores - Requiere rol 'stock-be'
app.use('/api/v1/admin', 
  keycloak.protect('realm:stock-be'), 
  adminRouter
);

// === HEALTH CHECK ===
app.get('/', (req, res) => {
  res.status(200).json({ 
    mensaje: 'API de Stock - TPI 2025 - Grupo 2',
    version: '2.0.0',
    estado: 'operativo',
    portales: {
      compras: {
        url: '/api/v1/compras',
        rol: 'compras-be',
        descripcion: 'Portal de Compras - Catálogo y Reservas'
      },
      logistica: {
        url: '/api/v1/logistica',
        rol: 'logistica-be',
        descripcion: 'Logística - Gestión de Entregas'
      },
      admin: {
        url: '/api/v1/admin',
        rol: 'stock-be',
        descripcion: 'Administración - Gestión de Productos'
      }
    }
  });
});

// --- Iniciar Servidor ---
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

// --- 4. ¡YA NO NECESITAMOS EXPORTAR NADA! ---
// (Elimina la línea 'export { keycloak }')