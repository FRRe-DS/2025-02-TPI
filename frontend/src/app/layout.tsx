// --- archivo: frontend/src/app/layout.tsx ---
import './globals.css';
import { KeycloakProvider } from '../componentes/KeycloakProvider';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>
        {/* Envolvemos la aplicación con el Provider */}
        <KeycloakProvider>
          {children}
        </KeycloakProvider>
      </body>
    </html>
  );
}