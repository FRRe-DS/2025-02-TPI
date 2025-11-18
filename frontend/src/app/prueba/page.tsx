// src/app/prueba/page.tsx

"use client"; 

import React from 'react';
// 1. AHORA IMPORTAMOS LISTAPRODUCTOS
import ListaProductos from '../../componentes/ListaProductos';
// 2. Esta es tu página de prueba
export default function PruebaPage() {

  return (
    <div style={{ padding: '2rem', backgroundColor: '#f0f0f0', minHeight: '100vh' }}>
      <h1>Página de Prueba (Lista de Productos)</h1>
      <p>Aquí puedes ver tu lista en aislamiento:</p>
      
      <hr style={{ margin: '1rem 0' }} />

      {/* 3. Renderiza tu lista aquí */}
      <ListaProductos />

    </div>
  );
}
