// --- archivo: src/app/dashboard/page.tsx ---
"use client";

import React, { useState } from "react";
import { FaBox, FaTags, FaClipboardList } from "react-icons/fa";

import ListaProductos from "../../componentes/ListaProductos";
import FormularioProducto from "../../componentes/ProductoForm";
import GestionReservas from "../../componentes/GestionReservas";
import GestionCategorias from "../../componentes/GestionCategorias";
import Breadcrumb from "../../componentes/Bars/Breadcrumb";
import SlidePanel from "../../componentes/SlidePanel";

export default function DashboardPage() {
  const [actualizar, setActualizar] = useState(false);
  const [panelAbierto, setPanelAbierto] = useState<'productos' | 'categorias' | 'reservas' | null>(null);

  const handleProductoAgregado = () => {
    setActualizar(prev => !prev);
    setPanelAbierto(null);
  };

  const abrirPanel = (panel: 'productos' | 'categorias' | 'reservas' ) => {
    setPanelAbierto(panel);
  };

  const cerrarPanel = () => {
    setPanelAbierto(null);
  };
  return (
    <div className="">
      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 max-w-7xl mx-auto px-6 w-full">
        {/* TÍTULO PRINCIPAL */}
        <div className="text-center my-6">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Bienvenido, administrador
          </h1>
          <p className="text-lg text-gray-600">
              Panel general del sistema de inventario
          </p>
        </div>

        {/* GRID DE TARJETAS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">

          {/* CARD – PRODUCTOS */}
          <button
            onClick={() => abrirPanel("productos")}
            className="group bg-[#686DDF] hover:bg-[#1A1F7B] rounded-3xl p-6 
                       flex flex-col gap-4 transition-all duration-300
                       shadow-lg hover:shadow-2xl hover:scale-[1.03]"
          >
            <span className="text-5xl font-extrabold text-white">124</span>

            <span className="text-lg font-semibold text-white">Productos</span>

            <div className="h-px bg-white/25 my-2"></div>

            <div className="flex items-center gap-3 text-white/90 group-hover:text-white">
              <FaBox className="text-2xl" />
              <span className="text-sm font-medium">Ver inventario completo</span>
            </div>
          </button>

          {/* CARD – CATEGORÍAS */}
          <button
            onClick={() => abrirPanel("categorias")}
            className="group bg-[#351A7A] hover:bg-[#333366] rounded-3xl p-6 
                       flex flex-col gap-4 transition-all duration-300
                       shadow-lg hover:shadow-2xl hover:scale-[1.03]"
          >
            <span className="text-5xl font-extrabold text-white">12</span>

            <span className="text-lg font-semibold text-white">Categorías</span>

            <div className="h-px bg-white/20 my-2"></div>

            <div className="flex items-center gap-3 text-white/90 group-hover:text-white">
              <FaTags className="text-2xl" />
              <span className="text-sm font-medium">Agrupadas por tipo</span>
            </div>
          </button>

          {/* CARD – RESERVAS */}
          <button
            onClick={() => abrirPanel("reservas")}
            className="group bg-[#333366] hover:bg-[#1A3F7A] rounded-3xl p-6 
                       flex flex-col gap-4 transition-all duration-300
                       shadow-lg hover:shadow-2xl hover:scale-[1.03]"
          >
            <span className="text-5xl font-extrabold text-white">5</span>

            <span className="text-lg font-semibold text-white">Reservas</span>

            <div className="h-px bg-white/20 my-2"></div>

            <div className="flex items-center gap-3 text-white/90 group-hover:text-white">
              <FaClipboardList className="text-2xl" />
              <span className="text-sm font-medium">Pedidos pendientes</span>
            </div>
          </button>

        </div>

        {/* SLIDE PANEL (MODALES LATERALES) */}
      <SlidePanel
          isOpen={panelAbierto === 'productos'}
          onClose={cerrarPanel}
          title="Gestión de Productos"
          width="max-w-3xl"
        >
          <ListaProductos actualizar={actualizar} />
        </SlidePanel>

        <SlidePanel
          isOpen={panelAbierto === 'categorias'}
          onClose={cerrarPanel}
          title="Gestión de Categorías"
          width="max-w-3xl"
        >
          <GestionCategorias />
        </SlidePanel>

        <SlidePanel
          isOpen={panelAbierto === 'reservas'}
          onClose={cerrarPanel}
          title="Gestión de Reservas"
          width="max-w-3xl"
        >
          <GestionReservas />
      </SlidePanel>
      </main>
    </div>
  );
}
