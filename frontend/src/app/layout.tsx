"use client";

import "./globals.css";
import { KeycloakProvider, useAuth } from "../componentes/KeycloakProvider";
import Navbar from "../componentes/Bars/NavBar";
import { usePathname, redirect } from "next/navigation";

function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { authenticated, loading } = useAuth();

  const isLoginPage = pathname === "/";

  // Mostrar loader mientras carga
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#686DFF] mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  // ⭐ PROTECCIÓN DE RUTAS: si NO estoy logueado, no entro a nada excepto "/"
  if (!authenticated && !isLoginPage) {
    redirect("/");
  }

  return (
    <>
      {!isLoginPage && <Navbar />}
      <main className="min-h-screen bg-white">{children}</main>
    </>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <KeycloakProvider>
          <LayoutContent>{children}</LayoutContent>
        </KeycloakProvider>
      </body>
    </html>
  );
}