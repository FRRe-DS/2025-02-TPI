"use client";
import Link from "next/link";
import { FaHome, FaChevronRight } from "react-icons/fa";

// Definimos cómo es cada "miga" o paso
interface BreadcrumbItem {
    label: string;
    href?: string; // Opcional: si no tiene href, es la página actual (texto estático)
}

interface Props {
    items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: Props) {
    return (
    <nav className="flex items-center text-sm text-gray-600 mb-6">
      {/* 1. Siempre empezamos con la casita (Home/Dashboard) */}
        <Link 
            href="/dashboard" 
            className="flex items-center hover:text-[#232B65] transition-colors opacity-70 hover:opacity-100"
            title="Ir al Inicio"
        >
        <FaHome className="text-lg" />
        </Link>
    
      {/* 2. Recorremos los items que nos pasaron */}
        {items.map((item, index) => (
            <div key={index} className="flex items-center">
            {/* Separador (la flechita >) */}
            <FaChevronRight className="mx-3 text-gray-400 text-[10px]" />
            
            {item.href ? (
                // Si tiene link, es un paso anterior navegable
                <Link href={item.href} className="hover:text-[#232B65] transition-colors font-medium text-gray-500 hover:underline">
                {item.label}
                </Link>
            ) : (
                // Si no tiene link, es la página actual (negrita y sin click)
                <span className="text-[#232B65] font-bold cursor-default">
                {item.label}
                </span>
            )}
            </div>
        ))}
        </nav>
    );
}