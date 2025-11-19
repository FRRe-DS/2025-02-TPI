// --- archivo: src/componentes/GestionCategorias.tsx ---
"use client";
import React, { useState, useEffect } from 'react';
// Importamos todas las funciones de la API de categorías
import { 
  obtenerCategorias, 
  crearCategoria, 
  actualizarCategoria, 
  eliminarCategoria 
} from '../servicios/api';

// 1. Interfaz
export interface Categoria {
  id: number;
  nombre: string;
  descripcion?: string;
}

export default function GestionCategorias() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [cargando, setCargando] = useState(true);

  // --- Estados para el formulario de NUEVA categoría ---
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevaDesc, setNuevaDesc] = useState('');

  // --- Estados para la EDICIÓN ---
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editNombre, setEditNombre] = useState('');
  const [editDesc, setEditDesc] = useState('');

  // 2. Cargar categorías
  const cargarCategorias = () => {
    setCargando(true);
    obtenerCategorias()
      .then((res: Categoria[]) => {
        setCategorias(res || []);
      })
      .catch(error => {
        console.error("Error al cargar categorías:", error);
        setCategorias([]);
      })
      .finally(() => {
        setCargando(false);
      });
  };

  // Carga inicial
  useEffect(() => {
    cargarCategorias();
  }, []);

  // 3. Manejador para AGREGAR
  const handleAgregar = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const nuevaCat = await crearCategoria({ 
        nombre: nuevoNombre, 
        descripcion: nuevaDesc 
      });
      // Añadimos la nueva categoría al estado local
      setCategorias([...categorias, nuevaCat]);
      // Limpiamos el formulario
      setNuevoNombre('');
      setNuevaDesc('');
      alert('Categoría creada.');
    } catch (error) {
      alert((error as Error).message);
    }
  };

  // 4. Manejador para ELIMINAR
  const handleEliminar = async (id: number) => {
    if (!window.confirm(`¿Seguro que quieres eliminar la categoría ${id}?`)) {
      return;
    }
    try {
      await eliminarCategoria(id);
      // Actualizamos el estado local
      setCategorias(categorias.filter(c => c.id !== id));
      alert('Categoría eliminada.');
    } catch (error) {
      // (Esto atrapará el error 409 si la categoría está en uso)
      alert((error as Error).message);
    }
  };

  // 5. Manejadores para EDICIÓN
  const handleEditarClick = (cat: Categoria) => {
    setEditingId(cat.id);
    setEditNombre(cat.nombre);
    setEditDesc(cat.descripcion || '');
  };

  const handleCancelarEdicion = () => {
    setEditingId(null);
  };

  const handleGuardarEdicion = async (id: number) => {
    try {
      const catActualizada = await actualizarCategoria(id, {
        nombre: editNombre,
        descripcion: editDesc
      });
      // Actualizamos el estado local
      setCategorias(categorias.map(c => 
        c.id === id ? catActualizada : c
      ));
      setEditingId(null); // Salimos del modo edición
      alert('Categoría actualizada.');
    } catch (error) {
      alert((error as Error).message);
    }
  };

  if (cargando) {
    return <div className="text-gray-600">Cargando categorías...</div>;
  }

  // --- RENDERIZADO ---
  return (
    <div>
      {/* Formulario para Agregar */}
      <form onSubmit={handleAgregar} className="mb-6 flex flex-col sm:flex-row gap-2">
        <input 
          type="text" 
          placeholder="Nombre nueva categoría" 
          value={nuevoNombre} 
          onChange={e => setNuevoNombre(e.target.value)} 
          required 
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
        />
        <input 
          type="text" 
          placeholder="Descripción (opcional)" 
          value={nuevaDesc} 
          onChange={e => setNuevaDesc(e.target.value)} 
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
        />
        <button 
          type="submit"
          className="bg-purple-600 hover:bg-purple-700 text-white font-medium px-6 py-2 rounded-lg transition-colors duration-200 whitespace-nowrap"
        >
          Agregar Categoría
        </button>
      </form>

      {/* Lista de Categorías */}
      <div className="space-y-3">
        {categorias.map(cat => (
          <div key={cat.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
            {editingId === cat.id ? (
              // --- Vista de Edición ---
              <div className="space-y-3">
                <input 
                  type="text" 
                  value={editNombre} 
                  onChange={e => setEditNombre(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Nombre"
                />
                <input 
                  type="text" 
                  value={editDesc} 
                  onChange={e => setEditDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Descripción"
                />
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleGuardarEdicion(cat.id)} 
                    className="bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded-lg transition-colors duration-200"
                  >
                    Guardar
                  </button>
                  <button 
                    onClick={handleCancelarEdicion} 
                    className="bg-gray-600 hover:bg-gray-700 text-white font-medium px-4 py-2 rounded-lg transition-colors duration-200"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              // --- Vista Normal ---
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="font-bold text-gray-800 text-lg">{cat.nombre}</p>
                  <p className="text-sm text-gray-600 mt-1">ID: {cat.id}</p>
                  <p className="text-gray-700 mt-2">{cat.descripcion || '(Sin descripción)'}</p>
                </div>
                <div className="flex gap-2 ml-4">
                  <button 
                    onClick={() => handleEditarClick(cat)} 
                    className="bg-yellow-500 hover:bg-yellow-600 text-white font-medium px-4 py-2 rounded-lg transition-colors duration-200"
                  >
                    Editar
                  </button>
                  <button 
                    onClick={() => handleEliminar(cat.id)} 
                    className="bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-lg transition-colors duration-200"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}