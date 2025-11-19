// --- archivo: src/app/dashboard/page.tsx ---
"use client"; 
import React, { useState } from 'react';
import { FaBox, FaTags, FaClipboardList, FaPlus, FaChevronRight } from 'react-icons/fa';

import ListaProductos from '../../componentes/ListaProductos'; 
import FormularioProducto from '../../componentes/ProductoForm';
import GestionReservas from '../../componentes/GestionReservas';
import GestionCategorias from '../../componentes/GestionCategorias';
import { LogoutButton } from '../../componentes/LogoutButton';
import SlidePanel from '../../componentes/SlidePanel'; 

export default function DashboardPage() {
  const [actualizar, setActualizar] = useState(false);
  const [panelAbierto, setPanelAbierto] = useState<'productos' | 'categorias' | 'reservas' | 'agregar' | null>(null);

  const handleProductoAgregado = () => {
    setActualizar(prev => !prev);
    setPanelAbierto(null); // Cerrar panel después de agregar
  };

  const abrirPanel = (panel: 'productos' | 'categorias' | 'reservas' | 'agregar') => {
    setPanelAbierto(panel);
  };

  const cerrarPanel = () => {
    setPanelAbierto(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-lg">
                <FaBox className="text-white text-2xl" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Gestión de Stock</h1>
                <p className="text-sm text-gray-500">Panel de administración</p>
              </div>
            </div>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Botón agregar producto */}
        <div className="mb-8 flex items-center justify-between">
          <button
            onClick={() => abrirPanel('agregar')}
            className="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105"
          >
            <FaPlus />
            Agregar Nuevo Producto
          </button>
        </div>

        {/* Grid de tarjetas clickeables */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card Productos */}
          <button
            onClick={() => abrirPanel('productos')}
            className="bg-white rounded-xl shadow-lg p-8 border border-gray-200 hover:shadow-2xl hover:scale-105 transition-all duration-200 text-left group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-xl group-hover:scale-110 transition-transform duration-200">
                <FaBox className="text-white text-3xl" />
              </div>
              <FaChevronRight className="text-gray-400 text-2xl group-hover:text-blue-600 group-hover:translate-x-1 transition-all duration-200" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Productos</h3>
            <p className="text-gray-600">Gestionar inventario y stock</p>
          </button>

          {/* Card Categorías */}
          <button
            onClick={() => abrirPanel('categorias')}
            className="bg-white rounded-xl shadow-lg p-8 border border-gray-200 hover:shadow-2xl hover:scale-105 transition-all duration-200 text-left group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-4 rounded-xl group-hover:scale-110 transition-transform duration-200">
                <FaTags className="text-white text-3xl" />
              </div>
              <FaChevronRight className="text-gray-400 text-2xl group-hover:text-purple-600 group-hover:translate-x-1 transition-all duration-200" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Categorías</h3>
            <p className="text-gray-600">Organizar productos por tipo</p>
          </button>

          {/* Card Reservas */}
          <button
            onClick={() => abrirPanel('reservas')}
            className="bg-white rounded-xl shadow-lg p-8 border border-gray-200 hover:shadow-2xl hover:scale-105 transition-all duration-200 text-left group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="bg-gradient-to-br from-green-500 to-green-600 p-4 rounded-xl group-hover:scale-110 transition-transform duration-200">
                <FaClipboardList className="text-white text-3xl" />
              </div>
              <FaChevronRight className="text-gray-400 text-2xl group-hover:text-green-600 group-hover:translate-x-1 transition-all duration-200" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Reservas</h3>
            <p className="text-gray-600">Ver y gestionar reservas</p>
          </button>
        </div>
      </main>

      {/* Paneles deslizantes */}
      <SlidePanel
        isOpen={panelAbierto === 'agregar'}
        onClose={cerrarPanel}
        title="Agregar Nuevo Producto"
      >
        <FormularioProducto onProductoAgregado={handleProductoAgregado} />
      </SlidePanel>

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
    </div>
  );
}