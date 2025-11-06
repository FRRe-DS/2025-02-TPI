// --- archivo: src/app/page.tsx ---
"use client"; // Importante, porque ListaProductos es un componente de cliente

// 1. Importa tu componente de lista de productos
import React, { useState } from 'react';
import ListaProductos from '../componentes/ListaProductos';
import FormularioProducto from '../componentes/ProductoForm';
import GestionReservas from '../componentes/GestionReservas';

export default function Page() {
  // Estado 'trigger' para recargar la lista
  const [actualizar, setActualizar] = useState(false);

  // Esta función se la pasamos al formulario
  const handleProductoAgregado = () => {
    // Cambiamos el estado para forzar el 'useEffect' de ListaProductos
    setActualizar(prev => !prev); 
  };

  return (
    <main style={{ padding: '2rem' }}>
      <h1>Gestión de Stock</h1>
      
      {/* El formulario ahora avisa cuando agrega un producto */}
      <FormularioProducto onProductoAgregado={handleProductoAgregado} />

      <hr style={{ margin: '2rem 0' }} />
      
      {/* La lista ahora escucha al 'trigger' de actualización */}
      <ListaProductos actualizar={actualizar} />
      <GestionReservas />
    </main>
  );
}