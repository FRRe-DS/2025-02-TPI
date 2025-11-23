"use client";
import  { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaBell, FaChevronDown, FaUserCircle } from "react-icons/fa";
import  DropDown from "./DropDown";
import ProductosDropdown from "./ProductosDropDown";  



export default function Navbar() {
    const [openMenu, setOpenMenu] = useState(false);
  return (
    <nav className="w-full bg-[#232B65] text-white border-b border-[#4a4f80] px-6 py-2 flex items-center justify-between">
      
      {/* IZQUIERDA */}
      <div className="flex items-center gap-4">
        {/* Logo */}
        
        <Link href="/dashboard" className="hover:underline">
        <Image
          src="/logo.png" 
          alt="Logo"
          width={40}
          height={40}
          className="rounded-full"
          //style={{ backgroundColor: "white" }}
        /></Link>

        {/* Línea vertical */}
        <div className="h-8 w-px bg-white opacity-30"></div>

        {/* Menu */}
        <div className="flex items-center gap-6 text-sm">
          {/* Dropdown de Productos y Reservas*/} 
           <ProductosDropdown />
          <Link href="/categorias" className="hover:underline">
            Categorías
          </Link>
          <Link href="/reservas" className="hover:underline">
            Reservas
          </Link>
         
        </div>
        
      </div>

      {/* DERECHA */}
     <div className="flex items-center gap-4">
  
  {/* Campana */}
  <FaBell className="text-xl cursor-pointer hover:text-gray-300" />

  {/* Línea vertical separadora */}
  <div className="h-8 w-px bg-white opacity-30"></div>

  {/* Menú de cuenta */}
  <DropDown />
</div>
    </nav>
  );
}