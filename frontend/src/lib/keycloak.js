// --- archivo: frontend/src/lib/keycloak.js ---

import Keycloak from 'keycloak-js';

// NOTA: Este código solo se ejecutará en el navegador.
let keycloakInstance;

if (typeof window !== 'undefined') {
  keycloakInstance = new Keycloak({
    url: process.env.NEXT_PUBLIC_KEYCLOAK_URL || 'http://localhost:8080',
    realm: process.env.NEXT_PUBLIC_KEYCLOAK_REALM || 'ds-2025-realm',
    clientId: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || 'grupo-02'
  });
}

/**
 * Esta es la instancia de Keycloak que se importará en toda la aplicación,
 * incluido tu archivo 'api.js'.
 */
const keycloak = keycloakInstance;
export default keycloak;