"use client";
//los nuevos cambios implementados es para que al recargar la pagina no te saque de sesion automaticamente, solo eso :)
import React, {
  useState,
  useEffect,
  createContext,
  useContext,
  ReactNode
} from "react";
import keycloak from "../lib/keycloak";

interface IKeycloakContext {
  authenticated: boolean;
  loading: boolean;
  keycloak?: any;
}

let keycloakHasBeenInitialized = false;

const KeycloakContext = createContext<IKeycloakContext>({
  authenticated: false,
  loading: true
});

export const useAuth = () => useContext(KeycloakContext);

export const KeycloakProvider = ({ children }: { children: ReactNode }) => {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!keycloak) {
      setLoading(false);
      return;
    }

    if (typeof window === "undefined") {
      setLoading(false);
      return;
    }

    // 🟣 Detectar si se viene de un logout real
    const isLogoutFlow = sessionStorage.getItem("kc_logout") === "true";

    // 🟣 Restaurar tokens SOLO si NO venimos de un logout
    const storedToken = !isLogoutFlow ? localStorage.getItem("kc_token") : null;
    const storedRefresh = !isLogoutFlow ? localStorage.getItem("kc_refresh") : null;
    const storedId = !isLogoutFlow ? localStorage.getItem("kc_id") : null;

    if (!keycloakHasBeenInitialized) {
      keycloakHasBeenInitialized = true;

      keycloak.init({
          onLoad: "check-sso",
          checkLoginIframe: false,
          enableLogging: false,
          flow: 'standard',

          // Tokens solo si NO venimos de un logout
          token: isLogoutFlow ? undefined : storedToken || undefined,
          refreshToken: isLogoutFlow ? undefined : storedRefresh || undefined,
          idToken: isLogoutFlow ? undefined : storedId || undefined,
        })
        .then((auth) => {
          const isAuth = auth || !!storedToken;

          // Evitar restauración incorrecta después de logout
          if (isLogoutFlow) {
            setAuthenticated(false);
            sessionStorage.removeItem("kc_logout");
            return;
          }

          setAuthenticated(isAuth);

          if (isAuth) {
            localStorage.setItem("kc_token", keycloak!.token || storedToken || "");
            localStorage.setItem(
              "kc_refresh",
              keycloak!.refreshToken || storedRefresh || ""
            );
            localStorage.setItem("kc_id", keycloak!.idToken || storedId || "");
          }
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      // Ya estaba inicializado → tomar el valor previo
      const isAuth = keycloak.authenticated || !!storedToken;
      setAuthenticated(isAuth);
      setLoading(false);
    }
  }, []);

  return (
    <KeycloakContext.Provider
      value={{ authenticated, loading, keycloak }}
    >
      {children}
    </KeycloakContext.Provider>
  );
};
