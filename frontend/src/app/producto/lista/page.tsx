"use client"; 

import React from 'react';
import ListaProductos from '../../../componentes/ListaProductos'; 
import { FaBoxes } from 'react-icons/fa';
import Breadcrumb from '../../../componentes/Bars/Breadcrumb';

export default function PaginaListaProductos() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
              <Breadcrumb 
                items={[
                    { label: 'Ver Productos', href: '/producto/lista' }, 
                ]}
              />
        {/* Encabezado de la sección */}
        <div className="mb-8 flex items-center gap-3">
          <div className="p-3 bg-[#232B65] rounded-lg shadow-md">
            <FaBoxes className="text-white text-2xl" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Inventario de Productos</h1>
            <p className="text-gray-600 text-sm">Gestiona, busca y filtra todos los items del sistema.</p>
          </div>
        </div>
        {/* Lista de productos */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden p-6 border border-gray-100">
          <ListaProductos />
        </div>

      </div>
    </div>
  );
}