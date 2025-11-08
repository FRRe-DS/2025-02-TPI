'use client';
import React, { useState } from 'react';
import ListaProductos from '../../componentes/ListaProductos'; 
import FormularioProducto from '../../componentes/ProductoForm';
import GestionCategorias from '../../componentes/GestionCategorias';
import { LogoutButton } from '../../componentes/LogoutButton';

export default function AdminPage() {
  const [actualizar, setActualizar] = useState(false);

  const handleProductoAgregado = () => {
    setActualizar(prev => !prev); 
  };

  return (
    <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>🏪 Portal de Administración - Stock</h1>
        <LogoutButton />
      </div>

      <p style={{ color: '#666', marginBottom: '2rem' }}>
        Gestión completa de productos y categorías del sistema de stock.
      </p>
      
      <section style={{ marginBottom: '3rem' }}>
        <h2>➕ Agregar Nuevo Producto</h2>
        <FormularioProducto onProductoAgregado={handleProductoAgregado} />
      </section>

      <hr style={{ margin: '3rem 0', border: 'none', borderTop: '2px solid #e0e0e0' }} />
      
      <section style={{ marginBottom: '3rem' }}>
        <h2>📦 Lista de Productos</h2>
        <ListaProductos actualizar={actualizar} />
      </section>

      <hr style={{ margin: '3rem 0', border: 'none', borderTop: '2px solid #e0e0e0' }} />

      <section>
        <h2>🏷️ Gestión de Categorías</h2>
        <GestionCategorias />
      </section>
    </main>
  );
}
