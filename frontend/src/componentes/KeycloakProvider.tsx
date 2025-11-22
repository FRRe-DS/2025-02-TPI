'use client';

import React, {
  useState,
  useEffect,
  createContext,
  useContext,
  ReactNode,
} from 'react';

import keycloak from "../lib/keycloak";

let keycloakHasBeenInitialized = false;  // ⭐ evita doble init

interface IKeycloakContext {
  authenticated: boolean;
  loading: boolean;
  login: () => void;
  logout: () => void;
}

const KeycloakContext = createContext<IKeycloakContext>({
  authenticated: false,
  loading: true,
  login: () => {},
  logout: () => {},
});

export const useAuth = () => useContext(KeycloakContext);

export const KeycloakProvider = ({ children }: { children: ReactNode }) => {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!keycloak) return;

    // ⭐ Evitar doble inicialización
    if (!keycloakHasBeenInitialized) {
      keycloakHasBeenInitialized = true;

      keycloak
        .init({
          onLoad: "check-sso",
          checkLoginIframe: false,
        })
        .then((auth) => {
          setAuthenticated(auth);

          if (auth) {
            localStorage.setItem("kc_token", keycloak!.token || "");
            localStorage.setItem("kc_refresh", keycloak!.refreshToken || "");
            localStorage.setItem("kc_id", keycloak!.idToken || "");
          }
        })
        .finally(() => setLoading(false));
    } else {
      // Ya está inicializado → solo usar estado existente
      setAuthenticated(keycloak.authenticated ?? false);
      setLoading(false);
    }
  }, []);

  const login = () => keycloak!.login();

  const logout = () => {
    localStorage.removeItem("kc_token");
    localStorage.removeItem("kc_refresh");
    localStorage.removeItem("kc_id");
    keycloak!.logout({ redirectUri: window.location.origin });
  };

  return (
    <KeycloakContext.Provider
      value={{ authenticated, loading, login, logout }}
    >
      {children}
    </KeycloakContext.Provider>
  );
};
