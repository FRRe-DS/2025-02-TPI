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
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const initKeycloak = async () => {
      if (!keycloak) {
        console.error("Keycloak no está inicializado (probablemente en SSR)");
        setLoading(false);
        return;
      }
      
      console.log('Iniciando Keycloak...');
      
      try {
        // Esta es la ÚNICA inicialización
        const auth = await keycloak.init({ 
          onLoad: 'check-sso',
          checkLoginIframe: false 
        });
        
        console.log('Keycloak inicializado. Autenticado:', auth);
        setAuthenticated(auth);
        
        if (auth) {
          console.log('Usuario autenticado:', keycloak.tokenParsed);
          // Configurar el refresco automático del token
          setInterval(() => {
            keycloak?.updateToken(70) 
              .catch(() => {
                console.error('Error al refrescar el token');
                keycloak?.logout();
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
  }, [isMounted]);

  // Pasamos 'loading' y 'authenticated' al contexto
  return (
    <KeycloakContext.Provider value={{ authenticated, loading }}>
      {children}
    </KeycloakContext.Provider>
  );
};