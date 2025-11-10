// --- archivo: src/app/page.tsx ---
"use client"; 
import React, { useState } from 'react';

import ListaProductos from '../../componentes/ListaProductos'; 
import FormularioProducto from '../../componentes/ProductoForm';
import GestionReservas from '../../componentes/GestionReservas';
import GestionCategorias from '../../componentes/GestionCategorias'; // <-- 1. IMPORTA

// El botón de logout que creamos
import { LogoutButton } from '../../componentes/LogoutButton'; 

export default function DashboardPage() {
  const [actualizar, setActualizar] = useState(false);

  const handleProductoAgregado = () => {
    setActualizar(prev => !prev); 
  };

  return (
    <main style={{ padding: '2rem' }}>
      
      {/* Añadimos un header con el botón de logout */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Gestión de Stock</h1>
        <LogoutButton />
      </header>
      
      <FormularioProducto onProductoAgregado={handleProductoAgregado} />

      <hr style={{ margin: '2rem 0' }} />
      
      {/* Contenedor para las 3 listas */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '2rem' }}>
        
        <div>
          <h2>Productos</h2>
          {/* Asumiendo que ListaProductos usa los props correctos */}
          <ListaProductos actualizar={actualizar} />
        </div>
        
        <div>
          <h2>Categorías</h2>
          <GestionCategorias />
        </div>
        
        <div>
          <h2>Reservas</h2>
          <GestionReservas />
        </div>
      
      </div>
    </main>
  );
}