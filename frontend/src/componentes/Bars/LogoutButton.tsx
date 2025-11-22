// --- archivo: frontend/src/componentes/LogoutButton.tsx ---
'use client';

import keycloak from "../../lib/keycloak"; // ajustá la ruta a donde tengas el lib

export const LogoutButton = () => {
  const handleLogout = () => {
    // Por si en algún caso extremo keycloak no llegó a crearse
    if (!keycloak || typeof keycloak.logout !== "function") {
      console.warn("Keycloak no está disponible, redirigiendo igualmente a /");
      // limpieza local del front
      localStorage.removeItem("kc_token");
      localStorage.removeItem("kc_refresh");
      localStorage.removeItem("kc_id");
      window.location.href = "/";
      return;
    }

    // Logout real contra Keycloak
    keycloak.logout({
      redirectUri: window.location.origin,
    });
  };

  return (
    <button
      onClick={handleLogout}
      style={{
        backgroundColor: "#D32F2F",
        color: "white",
        padding: "8px 14px",
        borderRadius: "8px",
        fontSize: "14px",
        cursor: "pointer",
        border: "none",
      }}
    >
      Cerrar Sesión
    </button>
  );
};
