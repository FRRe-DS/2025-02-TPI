"use client";
import React, { useState } from 'react';
import { crearCategoria } from '../servicios/api';

interface Props {
  onCategoriaCreada: () => void;
  onCancelar: () => void;
}

// ⭐ IMPORTANTE: Tiene que ser "export default"
export default function CategoriaForm({ onCategoriaCreada, onCancelar }: Props) {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await crearCategoria({ nombre, descripcion });
      alert('¡Categoría creada con éxito!');
      onCategoriaCreada();
    } catch (error) {
      alert((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm space-y-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la Categoría</label>
          <input
            type="text"
            placeholder="Ej: Periféricos"
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            required
            className="input-modern w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-[#232B65] focus:border-transparent outline-none transition-all"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Descripción (Opcional)</label>
          <textarea
            rows={3}
            placeholder="Breve descripción..."
            value={descripcion}
            onChange={e => setDescripcion(e.target.value)}
            className="input-modern w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-[#232B65] focus:border-transparent outline-none transition-all"
          />
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-4 border-t border-gray-100">
        <button
          type="button"
          onClick={onCancelar}
          className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="bg-[#232B65] hover:bg-[#1A2150] text-white font-medium px-6 py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all active:scale-95 disabled:opacity-50"
        >
          {loading ? 'Guardando...' : 'Guardar Categoría'}
        </button>
      </div>
    </form>
  );
}