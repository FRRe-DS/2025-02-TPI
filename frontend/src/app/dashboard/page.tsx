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
    setPanelAbierto(null);
  };

  const abrirPanel = (panel: 'productos' | 'categorias' | 'reservas' | 'agregar') => {
    setPanelAbierto(panel);
  };

  const cerrarPanel = () => {
    setPanelAbierto(null);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header Navbar 
      <header className="bg-[#1A3F7A] text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between">*/}
            {/* Logo y Navegación 
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                  <span className="text-2xl">🐱</span>
                </div>
              </div>
              
              <nav className="hidden md:flex items-center gap-6">
                <a href="#" className="text-white hover:text-gray-200 font-medium transition-colors">
                  Inicio
                </a>
                
                <button 
                  onClick={() => abrirPanel('productos')}
                  className="text-white hover:text-gray-200 font-medium transition-colors"
                >
                  Productos
                </button>
                
                <button 
                  onClick={() => abrirPanel('categorias')} 
                  className="text-white hover:text-gray-200 font-medium transition-colors"
                >
                  Categorías
                </button>
                
                <button 
                  onClick={() => abrirPanel('reservas')}
                  className="text-white hover:text-gray-200 font-medium transition-colors"
                >
                  Reservas
                </button>
                
                <button 
                  onClick={() => abrirPanel('agregar')}
                  className="text-white hover:text-gray-200 font-medium transition-colors"
                >
                  Agregar Producto
                </button>
              </nav>
            </div>*/}

            {/* Perfil 
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2 cursor-pointer hover:bg-white/20 transition-colors">
                <div className="w-8 h-8 bg-white rounded-full overflow-hidden">
                  <img src="/testicat.png" alt="Admin" className="w-full h-full object-cover" />
                </div>
                <span className="font-medium">Mi Cuenta</span>
              </div>
            </div>
          </div>
        </div>
      </header>*/}

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <a href="#" className="text-[#686DFF] hover:text-[#351A7A] font-medium text-sm">
            Inicio
          </a>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-12 w-full">
        {/* Título de Bienvenida */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Bienvenido, Admin</h1>
          <p className="text-xl text-gray-600">¿Qué deseas consultar hoy?</p>
        </div>

        {/* Grid de Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          
          {/* Card Productos - Verde Menta */}
          <button
            onClick={() => abrirPanel('productos')}
            className="group bg-[#B8E6D5] hover:bg-[#A0D9C5] rounded-3xl p-8 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
          >
            <div className="text-right mb-4">
              <span className="text-2xl font-bold text-gray-700">124 items</span>
            </div>
            
            <div className="flex items-center gap-4 mt-8">
              <div className="w-12 h-12 flex items-center justify-center">
                <FaBox className="text-gray-700 text-3xl" />
              </div>
              <div className="text-left">
                <h3 className="text-xl font-bold text-gray-900">Productos</h3>
                <p className="text-sm text-gray-600">Ver inventario completo</p>
              </div>
            </div>
          </button>

          {/* Card Categorías - Naranja Durazno */}
          <button
            onClick={() => abrirPanel('categorias')}
            className="group bg-[#FFD4B3] hover:bg-[#FFC299] rounded-3xl p-8 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
          >
            <div className="text-right mb-4">
              <span className="text-2xl font-bold text-gray-700">12 types</span>
            </div>
            
            <div className="flex items-center gap-4 mt-8">
              <div className="w-12 h-12 flex items-center justify-center">
                <FaTags className="text-gray-700 text-3xl" />
              </div>
              <div className="text-left">
                <h3 className="text-xl font-bold text-gray-900">Categorías</h3>
                <p className="text-sm text-gray-600">Agrupados por tipo</p>
              </div>
            </div>
          </button>

          {/* Card Reservas - Morado Lavanda */}
          <button
            onClick={() => abrirPanel('reservas')}
            className="group bg-[#C9C5E8] hover:bg-[#B8B3D9] rounded-3xl p-8 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
          >
            <div className="text-right mb-4">
              <span className="text-2xl font-bold text-gray-700">5 pending</span>
            </div>
            
            <div className="flex items-center gap-4 mt-8">
              <div className="w-12 h-12 flex items-center justify-center">
                <FaClipboardList className="text-gray-700 text-3xl" />
              </div>
              <div className="text-left">
                <h3 className="text-xl font-bold text-gray-900">Reservas</h3>
                <p className="text-sm text-gray-600">Pedidos pendientes</p>
              </div>
            </div>
          </button>

          {/* Card Agregar Producto - Verde Agua */}
          <button
            onClick={() => abrirPanel('agregar')}
            className="group bg-[#B8E6D5] hover:bg-[#A0D9C5] rounded-3xl p-8 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
          >
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-md">
                <FaPlus className="text-[#1A3F7A] text-3xl" />
              </div>
              <div className="text-center">
                <h3 className="text-xl font-bold text-gray-900 mb-1">Agregar Nuevo Producto</h3>
                <p className="text-sm text-gray-600">Añadir un nuevo artículo al inventario</p>
              </div>
            </div>
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#1A3F7A] text-white py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Redes Sociales */}
            <div className="flex items-center gap-4">
              <span className="text-sm">Síguenos</span>
              <div className="flex gap-3">
                <a href="#" className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
                  <span>f</span>
                </a>
                <a href="#" className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
                  <span>t</span>
                </a>
                <a href="#" className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
                  <span>in</span>
                </a>
                <a href="#" className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
                  <span>ig</span>
                </a>
              </div>
            </div>
            
            {/* Copyright */}
            <div className="text-sm text-center md:text-right">
              <p>© 2025 Taller Los Derechos Reservados</p>
            </div>
          </div>
        </div>
      </footer>

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