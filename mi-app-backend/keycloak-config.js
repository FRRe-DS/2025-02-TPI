// --- archivo: mi-app-backend/keycloak-config.js ---
import session from 'express-session';
import Keycloak from 'keycloak-connect';

// 1. Creamos el store de sesión aquí
const memoryStore = new session.MemoryStore();

// 2. Creamos la instancia de Keycloak aquí
const keycloak = new Keycloak({ store: memoryStore });

// 3. Exportamos AMBAS cosas
export { keycloak, memoryStore };