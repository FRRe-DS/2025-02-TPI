// --- archivo: frontend/src/componentes/LogoutButton.tsx ---
'use client'; 

import React from 'react';
import keycloak from '../lib/keycloak'; // Importamos la misma instancia

export const LogoutButton = () => {
  
  const handleLogout = () => {
    // Usamos 'keycloak?.' para evitar el error 'undefined' en el servidor
    keycloak?.logout({
      // ¡Esta línea es clave!
      // Nos envía de vuelta a la página de inicio (la del botón de login).
      redirectUri: window.location.origin 
    });
  };

  return (
    <button
      onClick={handleLogout}
      style={{
        backgroundColor: '#D32F2F',
        color: 'white',
        padding: '8px 14px',
        borderRadius: '8px',
        fontSize: '14px',
        cursor: 'pointer',
        border: 'none',
      }}
    >
      Cerrar Sesión
    </button>
  );
};