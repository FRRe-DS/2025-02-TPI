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
  const [loading, setLoading] = useState(true); // Este estado ya lo teníamos

  useEffect(() => {
    const initKeycloak = async () => {
      if (!keycloak) {
        console.error("Keycloak no está inicializado (probablemente en SSR)");
        setLoading(false);
        return;
      }
      
      try {
        // Esta es la ÚNICA inicialización
        const auth = await keycloak.init({ 
          onLoad: 'check-sso',
          checkLoginIframe: false 
        });
        
        setAuthenticated(auth);
        
        if (auth) {
          // ... (tu 'setInterval' para refrescar el token está perfecto aquí)
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
  }, []);

  // 3. ¡YA NO MOSTRAMOS NADA DE "CARGANDO" AQUÍ!
  // El provider solo *provee* el estado. Las páginas
  // decidirán qué mostrar mientras cargan.
  /*
  if (loading) {
    return <div>Autenticando, por favor espere...</div>;
  }
  */

  // 4. Pasamos 'loading' y 'authenticated' al contexto
  return (
    <KeycloakContext.Provider value={{ authenticated, loading }}>
      {children}
    </KeycloakContext.Provider>
  );
};