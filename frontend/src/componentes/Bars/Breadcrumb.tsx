"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaHome, FaChevronRight } from "react-icons/fa";

// 1. DICCIONARIO DE NOMBRES (Para que se vea bonito)
const routeLabels: Record<string, string> = {
  dashboard: "Inicio",
  producto: "Productos",
  reservas: "Reservas",
  lista: "Listado",
  agregar: "Nuevo Registro",
  detalle: "Detalle",
  editar: "Edición",
  categorias: "Categorías",
};

// LISTA DE CARPETAS NO CLICKEABLES 
// aca van nombres de carpetas que SOLO sirven para organizar y no tienen un archivo page.tsx propio.
const carpetasSinPagina = [
  "producto", 
  "detalle",  
  "editar",
  "reservas",   
];

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface Props {
  items?: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: Props) {
  const pathname = usePathname();

  // A. MODO MANUAL
  if (items && items.length > 0) {
    return <BreadcrumbNav items={items} />;
  }

  // B. MODO AUTOMÁTICO
  const segments = pathname.split("/").filter(Boolean);

  const dynamicItems = segments.map((segment, index) => {
    // Ruta acumulada
    const href = "/" + segments.slice(0, index + 1).join("/");
    
    // Etiqueta (Label)
    let label = routeLabels[segment.toLowerCase()];
    if (!label) {
      if (!isNaN(Number(segment)) || segment.startsWith("RES-")) {
        label = `#${segment}`;
      } else {
        label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ");
      }
    }

    // Determinamos si debe ser un link o solo texto
    // Es "solo texto" si está en la lista negra O si es un ID numérico suelto
    const isClickable = !carpetasSinPagina.includes(segment.toLowerCase());

    return { label, href: isClickable ? href : undefined };
  });

  const filteredItems = dynamicItems.filter(item => item.href !== '/dashboard');

  return <BreadcrumbNav items={filteredItems} />;
}

// --- Componente Visual ---
function BreadcrumbNav({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav className="flex items-center text-sm text-gray-600 mb-6 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100 w-fit">
      <Link 
        href="/dashboard" 
        className="flex items-center hover:text-[#232B65] transition-colors opacity-70 hover:opacity-100"
        title="Ir al Inicio"
      >
        <FaHome className="text-lg" />
      </Link>
      
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <div key={index} className="flex items-center">
            <FaChevronRight className="mx-3 text-gray-400 text-[10px]" />
            
            {/* 3 CASOS DE RENDERIZADO: */}
            
            {isLast ? (
              // Caso 1: Página Actual (Negrita, azul)
              <span className="text-[#232B65] font-bold cursor-default">
                {item.label}
              </span>
            ) : item.href ? (
              // Caso 2: Link Normal (Gris, hover azul, subrayado)
              <Link 
                href={item.href} 
                className="hover:text-[#232B65] transition-colors font-medium text-gray-500 hover:underline"
              >
                {item.label}
              </Link>
            ) : (
              // Caso 3: Carpeta sin página (Gris, sin hover, sin link)
              <span className="text-gray-400 font-medium cursor-default">
                {item.label}
              </span>
            )}
          </div>
        );
      })}
    </nav>
  );
}