"use client";

import React from 'react';
import keycloak from '../../lib/keycloak'; 
//los nuevos cambios implementados es para que al hacer logout no se restaure la sesion automaticamente, solo eso :)
export const LogoutButton = () => {

  const handleLogout = () => {
    // Marcar logout para que el Provider no restaure sesión
    sessionStorage.setItem("kc_logout", "true");

    // Borrar tokens locales
    if (typeof window !== "undefined") {
      localStorage.removeItem("kc_token");
      localStorage.removeItem("kc_refresh");
      localStorage.removeItem("kc_id");
    }

    // Logout REAL de Keycloak
    if (keycloak && typeof keycloak.logout === "function") {
      keycloak.logout({
        redirectUri: window.location.origin + "/"
      });
    } else {
      // Fallback
      window.location.href = "/";
    }
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

