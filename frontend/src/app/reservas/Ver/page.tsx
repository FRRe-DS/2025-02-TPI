"use client";

import React from 'react';
import GestionReservas from '@/componentes/GestionReservas';
import Breadcrumb from '@/componentes/Bars/Breadcrumb';

export default function ReservasPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* 1. Navegación */}
        <Breadcrumb 
            items={[
                { label: 'Reservas' } // Página actual (Raíz de la sección)
            ]}
        />

        {/* 2. Título de la Sección (Opcional, ya que el componente tiene su propio título, 
            pero queda bien para estructura de página) */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Reservas</h1>
          <p className="text-gray-600 mt-1">Administra las solicitudes de stock y sus estados.</p>
        </div>

        {/* 3. Renderizamos el componente de lista mejorado */}
        <GestionReservas />

      </div>
    </div>
  );
}
