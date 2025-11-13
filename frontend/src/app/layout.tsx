import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Stock Manager - Sistema de Gestión Inteligente',
  description: 'Plataforma completa de gestión de stock y reservas con autenticación SSO empresarial',
  keywords: ['stock', 'inventario', 'gestión', 'reservas', 'keycloak', 'sso'],
  authors: [{ name: 'FRRe - Facultad Regional Resistencia' }],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-gradient-to-br from-violet-900 via-purple-800 to-indigo-900 text-white antialiased">
        <div className="min-h-screen flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}

