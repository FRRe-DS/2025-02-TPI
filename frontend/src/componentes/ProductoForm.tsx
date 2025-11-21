// --- archivo: src/componentes/FormularioProducto.tsx ---
"use client";
import React, { useState, useEffect } from 'react';
import { agregarProducto, obtenerCategorias } from '../servicios/api';

// --- INTERFACES ---

export interface Categoria {
  id: number;
  nombre: string;
}

export interface ProductoInput {
  nombre: string;
  descripcion: string;
  precio: number;
  stockInicial: number;
  pesoKg: number;
  categoriaIds: number[];
  dimensiones: {
    largoCm: number;
    anchoCm: number;
    altoCm: number;
  };
  ubicacion: {
    street: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
}

interface Props {
  onProductoAgregado: () => void; 
}

// --- ESTADO INICIAL (para limpiar el formulario) ---
const estadoInicialFormulario: ProductoInput = {
  nombre: '',
  descripcion: '',
  precio: 0,
  stockInicial: 0,
  pesoKg: 0,
  categoriaIds: [],
  dimensiones: { largoCm: 0, anchoCm: 0, altoCm: 0 },
  ubicacion: { street: '', city: '', state: '', postal_code: '', country: '' }
};

export default function FormularioProducto({ onProductoAgregado }: Props) {
  // --- ESTADOS ---
  const [formData, setFormData] = useState<ProductoInput>(estadoInicialFormulario);
  const [categorias, setCategorias] = useState<Categoria[]>([]);

  // --- Carga de categorías ---
  useEffect(() => {
    obtenerCategorias()
      .then(setCategorias)
      .catch(err => console.error("Error cargando categorías", err));
  }, []);

  // --- MANEJADORES DE FORMULARIO ---

  // Manejador para inputs simples
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Usamos parseFloat para campos numéricos para aceptar decimales
    // (excepto stockInicial que es entero)
    let valorProcesado: string | number = value;
    if (type === 'number') {
      valorProcesado = name === 'stockInicial' ? parseInt(value) : parseFloat(value);
    }
    
    if (name === "categoriaIds") { 
      setFormData(prev => ({
        ...prev,
        categoriaIds: [Number(value)] 
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: valorProcesado
      }));
    }
  };

  // Manejador para inputs ANIDADOS
  const handleNestedChange = (e: React.ChangeEvent<HTMLInputElement>, parent: 'dimensiones' | 'ubicacion') => {
    const { name, value, type } = e.target;
    
    // Usamos parseFloat para los numéricos anidados (dimensiones)
    const valorProcesado = type === 'number' ? parseFloat(value) : value;

    setFormData(prevData => ({
      ...prevData,
      [parent]: {
        ...prevData[parent],
        [name]: valorProcesado
      }
    }));
  };
  const handleCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const catId = Number(e.target.value);
    const isChecked = e.target.checked;

    setFormData(prev => {
      const currentCatIds = prev.categoriaIds || [];
      let newCatIds: number[];

      if (isChecked) {
        // Añadir el ID al array
        newCatIds = [...currentCatIds, catId];
      } else {
        // Quitar el ID del array
        newCatIds = currentCatIds.filter(id => id !== catId);
      }
      return { ...prev, categoriaIds: newCatIds };
    });
  };

  // Manejador del envío
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // El 'formData' ya tiene la estructura correcta
      await agregarProducto(formData);
      alert('¡Producto agregado!');
      onProductoAgregado(); 
      setFormData(estadoInicialFormulario); 
    } catch (error) {
      alert((error as Error).message);
    }
  };

  // --- RENDERIZADO ---
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">Agregar Nuevo Producto</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Sección Principal */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm space-y-4">
          <h4 className="font-semibold text-gray-900 text-lg mb-4">Información General</h4>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nombre del Producto</label>
            <input 
              className="input-modern" 
              type="text" 
              name="nombre" 
              value={formData.nombre} 
              onChange={handleChange} 
              placeholder="Ej: RTX 4090 ASUS ROG"
              required 
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
            <input 
              className="input-modern" 
              type="text" 
              name="descripcion" 
              value={formData.descripcion} 
              onChange={handleChange}
              placeholder="Descripción del producto"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Categorías</label>
            <div className="max-h-32 overflow-y-auto border border-gray-200 rounded-lg p-3 bg-gray-50 space-y-2">
              {categorias.length > 0 ? categorias.map(cat => (
                <label key={cat.id} className="flex items-center gap-2 cursor-pointer hover:bg-white p-2 rounded transition-colors">
                  <input
                    type="checkbox"
                    id={`cat-add-${cat.id}`}
                    value={cat.id}
                    onChange={handleCategoryChange}
                    checked={formData.categoriaIds.includes(cat.id)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{cat.nombre}</span>
                </label>
              )) : <small className="text-gray-500">Cargando categorías...</small>}
            </div>
          </div>
        </div>
        

        {/* Sección Inventario */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm space-y-4">
          <h4 className="font-semibold text-gray-900 text-lg mb-4">Inventario y Precio</h4>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Precio (USD)</label>
            <input 
              className="input-modern" 
              type="number" 
              name="precio" 
              value={formData.precio} 
              onChange={handleChange} 
              placeholder="0.00"
              required 
              min="0" 
              step="0.01" 
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Stock Inicial</label>
            <input 
              className="input-modern" 
              type="number" 
              name="stockInicial" 
              value={formData.stockInicial} 
              onChange={handleChange} 
              placeholder="0"
              required 
              min="0" 
              step="1" 
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Peso (Kg)</label>
            <input 
              className="input-modern" 
              type="number" 
              name="pesoKg" 
              value={formData.pesoKg} 
              onChange={handleChange} 
              placeholder="0.0"
              min="0" 
              step="0.1" 
            />
          </div>
        </div>

        {/* Sección Dimensiones */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm space-y-4">
          <h4 className="font-semibold text-gray-900 text-lg mb-4">Dimensiones (cm)</h4>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Largo</label>
            <input 
              className="input-modern" 
              type="number" 
              name="largoCm" 
              value={formData.dimensiones.largoCm} 
              onChange={e => handleNestedChange(e, 'dimensiones')} 
              placeholder="0.0"
              min="0" 
              step="0.1" 
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Ancho</label>
            <input 
              className="input-modern" 
              type="number" 
              name="anchoCm" 
              value={formData.dimensiones.anchoCm} 
              onChange={e => handleNestedChange(e, 'dimensiones')} 
              placeholder="0.0"
              min="0" 
              step="0.1" 
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Alto</label>
            <input 
              className="input-modern" 
              type="number" 
              name="altoCm" 
              value={formData.dimensiones.altoCm} 
              onChange={e => handleNestedChange(e, 'dimensiones')} 
              placeholder="0.0"
              min="0" 
              step="0.1" 
            />
          </div>
        </div>
        
        {/* Sección Ubicación */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm space-y-4 md:col-span-2">
          <h4 className="font-semibold text-gray-900 text-lg mb-4">Ubicación del Producto</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Calle</label>
              <input 
                className="input-modern" 
                type="text" 
                name="street" 
                value={formData.ubicacion.street} 
                onChange={e => handleNestedChange(e, 'ubicacion')}
                placeholder="Dirección"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ciudad</label>
              <input 
                className="input-modern" 
                type="text" 
                name="city" 
                value={formData.ubicacion.city} 
                onChange={e => handleNestedChange(e, 'ubicacion')}
                placeholder="Ciudad"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">País (Cód.)</label>
              <input 
                className="input-modern" 
                type="text" 
                name="country" 
                value={formData.ubicacion.country} 
                onChange={e => handleNestedChange(e, 'ubicacion')}
                placeholder="AR"
                maxLength={2}
              />
            </div>
          </div>
        </div>

      </div>
      
      <div className="flex justify-end pt-4">
        <button 
          type="submit" 
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
        >
          Agregar Producto
        </button>
      </div>
    </form>
  );
}