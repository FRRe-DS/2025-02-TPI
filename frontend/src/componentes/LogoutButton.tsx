'use client'; // <-- Importante, es un componente de cliente

import React from 'react';
import keycloak from '../lib/keycloak'; // Importamos la misma instancia

export const LogoutButton = () => {
  
  const handleLogout = () => {
    // Usamos 'keycloak?.' para evitar el error 'undefined' en el servidor
    keycloak?.logout({
      // ¡Esta línea es clave!
      // Le decimos a Keycloak que, después de cerrar sesión,
      // nos envíe de vuelta a la página de inicio (la del botón de login).
      redirectUri: window.location.origin 
    });
  };

  // Puedes darle el estilo que quieras a este botón
  return (
    <button
      onClick={handleLogout}
      style={{
        backgroundColor: '#D32F2F', // Un color rojo para "salir"
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