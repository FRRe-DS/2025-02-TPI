import React, { useEffect, useState } from 'react';
import { obtenerProductos } from '../servicios/api';

export interface Producto {
  id_producto: number;
  nombre: string;
  descripcion?: string;
  precio: number;
  cantidad?: number | null;
}

interface Props {
  actualizar?: boolean;
}

export default function ListaProductos({ actualizar }: Props) {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtro, setFiltro] = useState('');

  useEffect(() => {
    setLoading(true);
    setError(null);
    obtenerProductos()
      .then((res: Producto[]) => setProductos(res))
      .catch((err: Error) => {
        console.error('Error:', err);
        setError(`Error al obtener productos: ${err.message}`);
        setProductos([]);
      })
      .finally(() => setLoading(false));
  }, [actualizar]);

  const productosFiltrados = productos.filter(p =>
    p.nombre.toLowerCase().includes(filtro.toLowerCase())
  );

  if (error) {
    return (
      <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-8 text-center backdrop-blur">
        <svg className="w-16 h-16 mx-auto text-red-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4v2m0 5v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-red-300 font-bold text-lg">{error}</p>
        <p className="text-red-400/80 text-sm mt-2">Verifica que el backend esté corriendo en http://localhost:3000</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full animate-spin"></div>
          <div className="absolute inset-1 bg-violet-900 rounded-full"></div>
        </div>
        <p className="text-slate-300 font-medium">Cargando productos...</p>
      </div>
    );
  }

  if (productos.length === 0) {
    return (
      <div className="text-center py-16 space-y-4">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-white/5 rounded-full">
          <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
        <div>
          <p className="text-white text-lg font-bold">No hay productos</p>
          <p className="text-slate-400 text-sm mt-1">Crea tu primer producto usando el formulario</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtro */}
      <div className="relative">
        <svg className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Buscar productos..."
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all"
        />
      </div>

      {/* Productos Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-max">
        {productosFiltrados.map(producto => {
          const stockStatus = !producto.cantidad ? 'agotado' : 
                             producto.cantidad < 10 ? 'bajo' : 'normal';
          
          return (
            <div 
              key={producto.id_producto}
              className="group bg-white/10 backdrop-blur border border-white/20 rounded-xl p-5 hover:border-white/40 hover:bg-white/15 transition-all duration-300 hover:shadow-xl flex flex-col"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-white text-base truncate group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-indigo-400 group-hover:bg-clip-text transition">
                    {producto.nombre}
                  </h3>
                  {producto.descripcion && (
                    <p className="text-sm text-slate-400 mt-1 line-clamp-2">
                      {producto.descripcion}
                    </p>
                  )}
                </div>
              </div>

              {/* Precio Badge */}
              <div className="inline-flex items-center gap-2 mb-4 w-fit">
                <div className="px-3 py-1.5 bg-gradient-to-r from-blue-500/30 to-indigo-500/30 border border-blue-400/30 rounded-lg">
                  <span className="text-xl font-bold bg-gradient-to-r from-blue-300 to-indigo-300 bg-clip-text text-transparent">
                    ${producto.precio.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Stock Info */}
              <div className="grid grid-cols-2 gap-3 mb-4 pb-4 border-b border-white/10">
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Stock</p>
                  <p className="text-2xl font-bold text-white">
                    {producto.cantidad !== null && producto.cantidad !== undefined ? producto.cantidad : '—'}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-slate-300 uppercase tracking-wider">ID</p>
                  <p className="text-sm font-mono text-slate-300">#{producto.id_producto}</p>
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex-1">
                  {stockStatus === 'agotado' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-500/20 text-red-300 text-xs font-bold rounded-full border border-red-500/30">
                      <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                      Agotado
                    </span>
                  )}
                  {stockStatus === 'bajo' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-yellow-500/20 text-yellow-300 text-xs font-bold rounded-full border border-yellow-500/30">
                      <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span>
                      Stock Bajo
                    </span>
                  )}
                  {stockStatus === 'normal' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-500/20 text-green-300 text-xs font-bold rounded-full border border-green-500/30">
                      <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                      En Stock
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {productosFiltrados.length === 0 && productos.length > 0 && (
        <div className="text-center py-12">
          <p className="text-slate-400 text-lg">No se encontraron productos con "{filtro}"</p>
        </div>
      )}

      {/* Summary Stats */}
      <div className="mt-8 pt-8 border-t border-white/10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center group hover:border-blue-400/30 transition-all">
            <p className="text-slate-400 text-sm font-semibold mb-2">TOTAL PRODUCTOS</p>
            <p className="text-4xl font-bold text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-indigo-400 group-hover:bg-clip-text transition">
              {productos.length}
            </p>
          </div>
          
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center group hover:border-indigo-400/30 transition-all">
            <p className="text-slate-400 text-sm font-semibold mb-2">VALOR TOTAL</p>
            <p className="text-4xl font-bold text-transparent bg-gradient-to-r from-indigo-300 to-purple-300 bg-clip-text">
              ${productos.reduce((sum, p) => sum + (p.precio * (p.cantidad || 0)), 0).toFixed(2)}
            </p>
          </div>
          
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center group hover:border-purple-400/30 transition-all">
            <p className="text-slate-400 text-sm font-semibold mb-2">STOCK TOTAL</p>
            <p className="text-4xl font-bold text-transparent bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text">
              {productos.reduce((sum, p) => sum + (p.cantidad || 0), 0)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
