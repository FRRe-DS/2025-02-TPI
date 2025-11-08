// ============================================
// CUSTOM HOOK - useUserRole
// ============================================
// Extrae el rol del usuario desde el token de Keycloak

import { useState, useEffect } from 'react';
import keycloak from '../lib/keycloak';

type UserRole = 'compras-be' | 'logistica-be' | 'stock-be' | null;

/**
 * Hook para obtener el rol del usuario autenticado
 * 
 * @returns {Object} { role, isCompras, isLogistica, isAdmin, loading }
 */
export function useUserRole() {
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const getRoleFromToken = () => {
      // Verificar si el usuario está autenticado
      if (!keycloak || !keycloak.authenticated || !keycloak.tokenParsed) {
        setRole(null);
        setLoading(false);
        return;
      }

      // Extraer roles del token
      const realmRoles = keycloak.tokenParsed.realm_access?.roles || [];
      
      console.log('Roles del usuario:', realmRoles);

      // Determinar el rol principal (el primero que coincida)
      if (realmRoles.includes('compras-be')) {
        setRole('compras-be');
      } else if (realmRoles.includes('logistica-be')) {
        setRole('logistica-be');
      } else if (realmRoles.includes('stock-be')) {
        setRole('stock-be');
      } else {
        // Si no tiene ningún rol conocido, asignar null
        setRole(null);
      }

      setLoading(false);
    };

    // Obtener rol cuando Keycloak esté listo
    if (keycloak && keycloak.authenticated) {
      getRoleFromToken();
    } else {
      // Esperar a que Keycloak inicialice
      const checkAuth = setInterval(() => {
        if (keycloak && keycloak.authenticated) {
          getRoleFromToken();
          clearInterval(checkAuth);
        }
      }, 100);

      // Cleanup después de 5 segundos
      setTimeout(() => {
        clearInterval(checkAuth);
        setLoading(false);
      }, 5000);

      return () => clearInterval(checkAuth);
    }
  }, []);

  return {
    role,
    isCompras: role === 'compras-be',
    isLogistica: role === 'logistica-be',
    isAdmin: role === 'stock-be',
    loading
  };
}
