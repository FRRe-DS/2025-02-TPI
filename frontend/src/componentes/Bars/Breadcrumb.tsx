"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaHome, FaChevronRight } from "react-icons/fa";

export default function Breadcrumb() {
  const pathname = usePathname(); // ejemplo: "/dashboard/productos/crear"

  // Dividimos el path en partes
  const segments = pathname
    .split("/")
    .filter(Boolean); // ["dashboard", "productos", "crear"]

  // Función para capitalizar
  const formatLabel = (text: string) =>
    text.charAt(0).toUpperCase() + text.slice(1).replace(/-/g, " ");

  return (
    <nav className="flex items-center text-sm text-gray-600 mb-6">
      {/* HOME */}
      <Link
        href="/dashboard"
        className="flex items-center hover:text-[#232B65] transition-colors opacity-70 hover:opacity-100"
      >
        <FaHome className="text-lg" />
      </Link>

      {/* CONSTRUCCIÓN DINÁMICA */}
      {segments.map((segment, index) => {
        const href = "/" + segments.slice(0, index + 1).join("/");
        const isLast = index === segments.length - 1;

        return (
          <div key={index} className="flex items-center">
            <FaChevronRight className="mx-3 text-gray-400 text-[10px]" />

            {isLast ? (
              <span className="text-[#232B65] font-bold cursor-default">
                {formatLabel(segment)}
              </span>
            ) : (
              <Link
                href={href}
                className="hover:text-[#232B65] transition-colors font-medium
                           text-gray-500 hover:underline"
              >
                {formatLabel(segment)}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}
