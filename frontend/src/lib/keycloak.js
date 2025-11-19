// --- archivo: frontend/src/lib/keycloak.js ---

import Keycloak from 'keycloak-js';

// NOTA: Este código solo se ejecutará en el navegador.
let keycloakInstance;

if (typeof window !== 'undefined') {
  const keycloakConfig = {
    url: 'http://localhost:8081/',
    realm: 'ds-2025-realm',
    clientId: 'grupo-02'
  };
  
  console.log('Inicializando Keycloak con config:', keycloakConfig);
  keycloakInstance = new Keycloak(keycloakConfig);
}

/**
 * Esta es la instancia de Keycloak que se importará en toda la aplicación,
 * incluido tu archivo 'api.js'.
 */
const keycloak = keycloakInstance;
export default keycloak;