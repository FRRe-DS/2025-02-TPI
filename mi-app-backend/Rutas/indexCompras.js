import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import session from 'express-session';
import Keycloak from 'keycloak-connect';
import axios from 'axios';

// --- Server Setup ---
const app = express();
// Asignamos el puerto 4000 para este servicio
const PORT = process.env.COMPRAS_PORT || 4000;

// --- Keycloak and Session Middleware ---
const memoryStore = new session.MemoryStore();
app.use(session({
  secret: 'secret-compras-service', // Debe ser un secreto único para este servicio
  resave: false,
  saveUninitialized: true,
  store: memoryStore
}));

const keycloak = new Keycloak({ store: memoryStore });
app.use(keycloak.middleware({
  logout: '/auth/logout'
}));

// --- Standard Middleware ---
app.use(cors());
app.use(express.json());

// --- Service URLs ---
// Por ahora, apuntamos al mismo servidor (puerto 4000). Esto cambiará cuando separes el servicio de Stock a su propio puerto.
const STOCK_SERVICE_URL = process.env.STOCK_SERVICE_URL || 'http://localhost:4000';

// ============= RUTAS DE AUTENTICACIÓN =============

app.post('/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email y contraseña son requeridos' });
        }

        const tokenUrl = 'http://localhost:8080/realms/ds-2025-realm/protocol/openid-connect/token';
        const params = new URLSearchParams();
        params.append('client_id', 'grupo-02');
        params.append('grant_type', 'password');
        params.append('username', email);
        params.append('password', password);
        params.append('scope', 'openid');

        const response = await axios.post(tokenUrl, params, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        res.status(200).json({ message: 'Login exitoso', ...response.data });

    } catch (error) {
        console.error('Error en login:', error.response ? error.response.data : error.message);
        if (error.response) {
            return res.status(error.response.status).json({
                error: 'Error desde Keycloak',
                detalles: error.response.data
            });
        }
        res.status(500).json({ error: 'Error interno del servidor', detalles: error.message });
    }
});

app.get('/auth/perfil', keycloak.protect(), async (req, res) => {
    try {
        const userInfo = req.kauth.grant.access_token.content;
        res.status(200).json({
            user: {
                id: userInfo.sub,
                email: userInfo.email,
                nombreUsuario: userInfo.preferred_username,
                nombre: userInfo.given_name,
                apellido: userInfo.family_name,
                roles: userInfo.realm_access?.roles || []
            }
        });
    } catch (error) {
        console.error('Error al obtener perfil:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// ============= RUTAS DE PRODUCTOS (proxy a servicio de Stock) =============

app.get('/productos', keycloak.protect(), async (req, res) => {
    try {
        const response = await axios.get(`${STOCK_SERVICE_URL}/productos`, {
            headers: { 'Authorization': req.headers.authorization }
        });
        res.status(200).json(response.data);
    } catch (error) {
        console.error('Error al obtener productos de Stock:', error.message);
        res.status(502).json({
            error: "Servicio Stock no disponible",
            code: "STOCK_SERVICE_UNAVAILABLE"
        });
    }
});

app.get('/productos/:id', keycloak.protect(), async (req, res) => {
    try {
        const { id } = req.params;
        const response = await axios.get(`${STOCK_SERVICE_URL}/productos/${id}`, {
            headers: { 'Authorization': req.headers.authorization }
        });
        res.status(200).json(response.data);
    } catch (error) {
        console.error(`Error al obtener producto ${req.params.id} de Stock:`, error.message);
        if (error.response && error.response.status === 404) {
            return res.status(404).json({
                error: "Producto no encontrado",
                code: "PRODUCT_NOT_FOUND"
            });
        }
        res.status(502).json({
            error: "Servicio Stock no disponible",
            code: "STOCK_SERVICE_UNAVAILABLE"
        });
    }
});

// ============= RUTAS DE CARRITO Y PEDIDOS (stubs) =============

app.get('/shopcart', keycloak.protect(), (req, res) => {
    res.status(501).json({ message: 'Endpoint /shopcart GET no implementado' });
});

app.post('/shopcart', keycloak.protect(), (req, res) => {
    res.status(501).json({ message: 'Endpoint /shopcart POST no implementado' });
});

app.post('/shopcart/checkout', keycloak.protect(), (req, res) => {
    res.status(501).json({ message: 'Endpoint /shopcart/checkout no implementado' });
});


// --- Start Server ---
app.listen(PORT, () => {
  console.log(`🚀 Servidor de COMPRAS corriendo en http://localhost:${PORT}`);
});
