'use client'; 

import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import keycloak from '../lib/keycloak';

// 1. ACTUALIZAMOS EL CONTEXTO
// Ahora compartirá 'authenticated' Y 'loading'
interface IKeycloakContext {
  authenticated: boolean;
  loading: boolean; 
}

const KeycloakContext = createContext<IKeycloakContext>({ 
  authenticated: false, 
  loading: true // Por defecto, siempre está cargando
});

// 2. Renombramos el hook a 'useAuth' (más claro)
export const useAuth = () => useContext(KeycloakContext);

export const KeycloakProvider = ({ children }: { children: ReactNode }) => {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initKeycloak = async () => {
      if (!keycloak) {
        console.error("Keycloak no está inicializado (probablemente en SSR)");
        setLoading(false);
        return;
      }
      
      try {
        // Verificar si ya hay un token guardado
        const auth = keycloak.authenticated || false;
        setAuthenticated(auth);
        
        if (auth && keycloak.token) {
          // Configurar el refresco automático del token
          setInterval(() => {
            keycloak?.updateToken(70) 
              .catch(() => {
                console.error('Error al refrescar el token');
                if (keycloak) {
                  keycloak.authenticated = false;
                }
                setAuthenticated(false);
              });
          }, 60000); 
        }
        
      } catch (error) {
        console.error("Fallo al inicializar Keycloak", error);
      } finally {
        setLoading(false); // Terminamos de cargar
      }
    };

    initKeycloak();
  }, []);

  // Pasamos 'loading' y 'authenticated' al contexto
  return (
    <KeycloakContext.Provider value={{ authenticated, loading }}>
      {children}
    </KeycloakContext.Provider>
  );
};