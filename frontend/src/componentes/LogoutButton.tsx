// --- archivo: frontend/src/componentes/LogoutButton.tsx ---
'use client'; 

import React from 'react';
import { FaSignOutAlt } from 'react-icons/fa';
import keycloak from '../lib/keycloak';

export const LogoutButton = () => {
  const handleLogout = () => {
    console.log('Cerrando sesión con Keycloak...');
    keycloak?.logout({
      redirectUri: window.location.origin 
    });
  };

  return (
    <button
      onClick={handleLogout}
      className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
    >
      <FaSignOutAlt />
      Cerrar Sesión
    </button>
  );
};