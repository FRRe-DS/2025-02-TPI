"use client";

import "./globals.css";
import { KeycloakProvider, useAuth } from "../componentes/KeycloakProvider";
import Navbar from "../componentes/Bars/NavBar";
import { usePathname, redirect } from "next/navigation";
import Footer from "../componentes/Bars/Footer";
import Breadcrumb from "@/componentes/Bars/Breadcrumb";

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
    <div className="flex flex-col flex-grow flex-1">
      {!isLoginPage && <Navbar />}
       {/* ⭐ Breadcrumb automático justo debajo del navbar */}
      {!isLoginPage && (
        <div className="px-6 max-w-7xl mx-auto w-full mt-4">
          <Breadcrumb />
        </div>
      )}

      {/* ⭐ El main ocupa el espacio sobrante */}
      <main className="flex-1 bg-white">
        {children}
      </main>

      {!isLoginPage && <Footer />}
    </div>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="flex flex-col min-h-screen">
        <KeycloakProvider>
          <LayoutContent>{children}</LayoutContent>
        </KeycloakProvider>
      </body>
    </html>
  );
}