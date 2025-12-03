"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaUserCircle } from "react-icons/fa";
import { LogoutButton } from "../Bars/LogoutButton";

export default function AccountDropdown() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null); // <= REFERENCIA AL DROPDOWN
  // Cerrar si se hace click fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      {/* Botón */}
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center justify-center text-white bg-[#333366] hover:bg-[#2a2a59] border border-transparent shadow-xs font-medium leading-5 rounded-md text-sm px-4 py-2.5"
      >
        Mi Cuenta
        <svg
          className="w-4 h-4 ms-1.5 -me-0.5"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="m19 9-7 7-7-7"
          />
        </svg>
      </button>

      {/* MENÚ */}
      {open && (
        <div
          className="absolute right-0 mt-2 w-72 rounded-md shadow-lg border border-[#222244] z-50 text-white"
          style={{ backgroundColor: "#333366" }}
        >
          <div className="p-2">
            <div className="flex items-center px-2.5 p-2 space-x-1.5 text-sm bg-[#2a2a59] rounded">
              <FaUserCircle className="text-4xl text-white" />
              <div className="text-sm">
                <div className="font-medium text-white">Nombre Usuario</div>
                <div className="truncate text-gray-300">usuario@correo.com</div>
              </div>

              <span className="bg-[#444488] border border-[#555599] text-white text-xs font-medium px-1.5 py-0.5 rounded ms-auto">
                PRO
              </span>
            </div>
          </div>

          <ul className="px-2 pb-2 text-sm font-medium">
            {/* Opciones del menú 
            <li>
              <Link
                href="/Configuracion"
                className="inline-flex items-center w-full p-2 hover:bg-[#2a2a59] rounded"
              >
                Configuración
              </Link>
            </li>

            <li>
              <Link
                href="/Privacidad"
                className="inline-flex items-center w-full p-2 hover:bg-[#2a2a59] rounded"
              >
                Privacidad
              </Link>
            </li>

            <li>
              <Link
                href="/Centrodeayuda"
                className="inline-flex items-center w-full p-2 hover:bg-[#2a2a59] rounded"
              >
                Centro de ayuda
              </Link>
            </li>*/}

            <li className="flex items-center w-full p-2 hover:bg-[#2a2a59] rounded mb-1.5">
              <a className="inline-flex items-center cursor-pointer">
                Dark mode (proximamente)
              </a>

              <label className="inline-flex items-center cursor-pointer ms-auto">
                <input type="checkbox" className="sr-only peer" />
                <div className="relative w-9 h-5 bg-gray-500 rounded-full peer-checked:bg-blue-600 after:absolute after:top-[2px] after:start-[2px] after:bg-white after:h-4 after:w-4 after:rounded-full after:transition-all peer-checked:after:translate-x-full"></div>
              </label>
            </li>

            <li className="border-t border-[#222244] pt-1.5"></li>

            <li>
              <div className="inline-flex items-center w-full p-2 text-red-300 hover:bg-[#2a2a59] rounded">
                <LogoutButton />
              </div>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
