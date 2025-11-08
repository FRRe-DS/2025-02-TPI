// --- archivo: frontend/src/app/layout.tsx ---

import './globals.css';
// 1. Importamos el Provider que acabamos de crear
import { KeycloakProvider } from '../componentes/KeycloakProvider';

// (Aquí pueden ir tus importaciones de 'font', 'Metadata', etc.)

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>
        {/* 2. Envolvemos la aplicación con el Provider */}
        {/* Esto asegura que 'children' (tus páginas) solo se rendericen
          después de que Keycloak haya intentado autenticar al usuario.
        */}
        <KeycloakProvider>
          {children}
        </KeycloakProvider>
      </body>
    </html>
  );
}