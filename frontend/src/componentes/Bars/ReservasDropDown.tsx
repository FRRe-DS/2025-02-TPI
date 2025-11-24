"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { FaChevronDown, FaBox, FaPlus, FaClipboardList } from "react-icons/fa";

export default function ProductsReservationsDropdown() {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Cerrar si se clickea afuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 hover:opacity-90 transition"
      >
        <span className="font-medium">Reservas</span>
        <FaChevronDown className={`text-xs transition ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
        className="
            absolute
            left-0           /* igual que el menu de Mi Cuenta */
            mt-4              /* MÁS grande para que baje y no se corte */
            w-56
            rounded-md
            shadow-lg
            border
            border-[#222244]
            z-9999
            text-white
            p-3
        "
        style={{ backgroundColor: "#333366" }}>
        {/* Reservas */}
          <div className="px-2 py-1 text-xs opacity-70">Reservas</div>

          <Link
            href="/reservas"
            className="flex items-center gap-2 p-2 rounded hover:bg-white/10 transition"
          >
            <FaClipboardList />
            Ver reservas
          </Link>

          <Link
            href="/reservas/agregar"
            className="flex items-center gap-2 p-2 rounded hover:bg-white/10 transition"
          >
            <FaPlus />
            Agregar reserva
          </Link>

        </div>
      )}
    </div>
    
    
  );
}
 
 