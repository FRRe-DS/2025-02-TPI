// --- archivo: src/app/page.tsx ---
"use client"; 
import React, { useState } from 'react';

import ListaProductos from '../componentes/ListaProductos'; 
import FormularioProducto from '../componentes/ProductoForm';
import GestionReservas from '../componentes/GestionReservas';
import GestionCategorias from '../componentes/GestionCategorias'; // <-- 1. IMPORTA

export default function Page() {
  const [actualizar, setActualizar] = useState(false);

  const handleProductoAgregado = () => {
    setActualizar(prev => !prev); 
  };

  return (
    <main style={{ padding: '2rem' }}>
      <h1>Gestión de Stock</h1>
      
      <FormularioProducto onProductoAgregado={handleProductoAgregado} />

      <hr style={{ margin: '2rem 0' }} />
      
      <ListaProductos actualizar={actualizar} />
      
      <GestionReservas />

      <GestionCategorias /> {/* <-- 2. AÑADE EL COMPONENTE */}
    </main>
  );
}