// src/lib/keycloak.js
import Keycloak from 'keycloak-js';

const keycloak = new Keycloak({
  url: 'http://localhost:8080',
  realm: 'ds-2025-realm',
  clientId: 'grupo-02',
});

// Prevenir errores de iframe silenciosamente
if (typeof window !== 'undefined') {
  // Capturar errores del iframe
  const originalError = console.error;
  console.error = function(...args) {
    // Ignorar errores específicos de Keycloak iframe
    if (args[0]?.toString?.().includes('Original file') || 
        args[0]?.toString?.().includes('login iframe')) {
      return;
    }
    originalError.apply(console, args);
  };
}

export default keycloak;
