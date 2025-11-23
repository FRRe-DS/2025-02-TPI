"use client";

import "./globals.css";
import { KeycloakProvider, useAuth } from "../componentes/KeycloakProvider";
import Navbar from "../componentes/Bars/NavBar";
import { usePathname, redirect } from "next/navigation";

function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { authenticated, loading } = useAuth();

  const isLoginPage = pathname === "/";

  if (loading) return null;

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