"use client";

import React from 'react';
import GestionCategorias from '@/componentes/GestionCategorias';
import Breadcrumb from '@/componentes/Bars/Breadcrumb';

export default function CategoriasPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        
        <GestionCategorias />

      </div>
    </div>
  );
}