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

// (HEALTH CHECK)
app.get('/', (req, res) => {
  res.status(200).json({ mensaje: '¡El servidor esta vivo! TESTI ES UN KPO' });
});

// --- Iniciar Servidor ---
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

// --- 4. ¡YA NO NECESITAMOS EXPORTAR NADA! ---
// (Elimina la línea 'export { keycloak }')