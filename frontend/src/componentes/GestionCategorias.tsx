"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaPlus, FaEdit, FaTrash, FaCheck, FaTimes, FaTags } from 'react-icons/fa';
import { 
  obtenerCategorias, 
  actualizarCategoria, 
  eliminarCategoria 
} from '../servicios/api';

export interface Categoria {
  id: number;
  nombre: string;
  descripcion?: string;
}

export default function GestionCategorias() {
  const router = useRouter();
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [cargando, setCargando] = useState(true);

  // --- Estados para la EDICIÓN INLINE ---
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editNombre, setEditNombre] = useState('');
  const [editDesc, setEditDesc] = useState('');

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

  useEffect(() => {
    cargarCategorias();
  }, []);

  // Manejador para ELIMINAR
  const handleEliminar = async (id: number) => {
    if (!window.confirm(`¿Seguro que quieres eliminar esta categoría?`)) {
      return;
    }
    try {
      await eliminarCategoria(id);
      setCategorias(categorias.filter(c => c.id !== id));
    } catch (error) {
      alert("No se puede eliminar: Probablemente tenga productos asociados.");
    }
  };

  // Manejadores para EDICIÓN
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
      setCategorias(categorias.map(c => c.id === id ? catActualizada : c));
      setEditingId(null);
    } catch (error) {
      alert((error as Error).message);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      
      {/* CABECERA */}
      <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white">
        <div>
            <h2 className="text-2xl font-bold text-[#232B65]">Categorías</h2>
            <p className="text-sm text-gray-500">Organiza tus productos en grupos</p>
        </div>
        
        <button
          onClick={() => router.push('/categorias/agregar')}
          className="flex items-center gap-2 bg-[#232B65] hover:bg-[#1A2150] text-white px-6 py-2.5 rounded-lg font-medium transition-all shadow-md hover:shadow-lg active:scale-95"
        >
          <FaPlus className="text-sm" />
          Nueva Categoría
        </button>
      </div>

      {/* LISTA */}
      <div className="p-6 bg-gray-50">
        {cargando ? (
          <p className="text-center text-gray-500 py-8">Cargando...</p>
        ) : categorias.length === 0 ? (
          <div className="text-center py-10 border-2 border-dashed border-gray-300 rounded-xl">
            <p className="text-gray-500">No hay categorías creadas.</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {categorias.map(cat => (
              <div key={cat.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-all">
                {editingId === cat.id ? (
                  // --- MODO EDICIÓN ---
                  <div className="flex flex-col md:flex-row gap-3 items-start md:items-center w-full">
                    <div className="flex-1 w-full space-y-2 md:space-y-0 md:flex md:gap-3">
                        <input
                        type="text"
                        value={editNombre}
                        onChange={e => setEditNombre(e.target.value)}
                        className="w-full md:w-1/3 px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#232B65]"
                        placeholder="Nombre"
                        />
                        <input
                        type="text"
                        value={editDesc}
                        onChange={e => setEditDesc(e.target.value)}
                        className="w-full md:w-2/3 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#232B65]"
                        placeholder="Descripción"
                        />
                    </div>
                    <div className="flex gap-2 self-end md:self-center">
                      <button onClick={() => handleGuardarEdicion(cat.id)} className="p-2 bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors" title="Guardar">
                        <FaCheck />
                      </button>
                      <button onClick={handleCancelarEdicion} className="p-2 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors" title="Cancelar">
                        <FaTimes />
                      </button>
                    </div>
                  </div>
                ) : (
                  // --- MODO VISTA ---
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-[#232B65]">
                            <FaTags />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-800">{cat.nombre}</h3>
                            <p className="text-sm text-gray-500">{cat.descripcion || 'Sin descripción'}</p>
                        </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditarClick(cat)}
                        className="text-gray-400 hover:text-[#232B65] p-2 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleEliminar(cat.id)}
                        className="text-gray-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition-colors"
                        title="Eliminar"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}