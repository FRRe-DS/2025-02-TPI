// --- archivo: src/componentes/FormularioProducto.tsx ---
"use client";
import React, { useState, useEffect } from 'react';
// IMPORTANTE: Agregamos actualizarProducto
import { agregarProducto, actualizarProducto, obtenerCategorias } from '../servicios/api';

// --- INTERFACES ---

export interface Categoria {
  id: number;
  nombre: string;
}

export interface ProductoInput {
  id?: number; // Opcional para edición
  nombre: string;
  descripcion: string;
  precio: number;
  stockInicial: number;
  pesoKg: number;
  categoriaIds: number[];
  imagenes: { url: string }[]; 
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
  productoAEditar?: any; // 👇 NUEVA PROP: Recibe el producto entero si vamos a editar
}

const estadoInicialFormulario: ProductoInput = {
  nombre: '',
  descripcion: '',
  precio: 0,
  stockInicial: 0,
  pesoKg: 0,
  categoriaIds: [],
  imagenes: [],
  dimensiones: { largoCm: 0, anchoCm: 0, altoCm: 0 },
  ubicacion: { street: '', city: '', state: '', postal_code: '', country: '' }
};

export default function FormularioProducto({ onProductoAgregado, productoAEditar }: Props) {
  const [formData, setFormData] = useState<ProductoInput>(estadoInicialFormulario);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [urlInput, setUrlInput] = useState('');
  
  // Detectar si es edición
  const esEdicion = !!productoAEditar;

  // --- CARGA INICIAL DE CATEGORÍAS ---
  useEffect(() => {
    obtenerCategorias()
      .then(setCategorias)
      .catch(err => console.error("Error cargando categorías", err));
  }, []);

  // --- CARGA DE DATOS SI ES EDICIÓN ---
  useEffect(() => {
    if (productoAEditar) {
      // Mapeamos los datos que vienen de la API al formato del Formulario
      setFormData({
        id: productoAEditar.id,
        nombre: productoAEditar.nombre || '',
        descripcion: productoAEditar.descripcion || '',
        precio: productoAEditar.precio || 0,
        // Ojo: La API suele devolver stockDisponible, lo mapeamos a stockInicial para editarlo
        stockInicial: productoAEditar.stockDisponible ?? productoAEditar.stockInicial ?? 0,
        pesoKg: productoAEditar.pesoKg || 0,
        // Convertimos el array de objetos categorias a array de IDs
        categoriaIds: productoAEditar.categorias ? productoAEditar.categorias.map((c: any) => c.id) : [],
        imagenes: productoAEditar.imagenes || [],
        dimensiones: {
          largoCm: productoAEditar.dimensiones?.largoCm || 0,
          anchoCm: productoAEditar.dimensiones?.anchoCm || 0,
          altoCm: productoAEditar.dimensiones?.altoCm || 0,
        },
        ubicacion: {
          street: productoAEditar.ubicacion?.street || '',
          city: productoAEditar.ubicacion?.city || '',
          state: productoAEditar.ubicacion?.state || '',
          postal_code: productoAEditar.ubicacion?.postal_code || '',
          country: productoAEditar.ubicacion?.country || '',
        }
      });
    }
  }, [productoAEditar]);

  // --- MANEJADORES ---

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let valorProcesado: string | number = value;
    
    // CORRECCIÓN NaN: Si es número y está vacío, usamos 0
    if (type === 'number') {
       if (value === "") {
         valorProcesado = 0;
       } else {
         valorProcesado = name === 'stockInicial' ? parseInt(value) : parseFloat(value);
       }
    }
    
    if (name === "categoriaIds") { 
      setFormData(prev => ({ ...prev, categoriaIds: [Number(value)] }));
    } else {
      setFormData(prev => ({ ...prev, [name]: valorProcesado }));
    }
  };

  const handleNestedChange = (e: React.ChangeEvent<HTMLInputElement>, parent: 'dimensiones' | 'ubicacion') => {
    const { name, value, type } = e.target;
    // CORRECCIÓN NaN en anidados
    let valorProcesado: string | number = value;
    if (type === 'number') {
       valorProcesado = value === "" ? 0 : parseFloat(value);
    }

    setFormData(prevData => ({
      ...prevData,
      [parent]: { ...prevData[parent], [name]: valorProcesado }
    }));
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const catId = Number(e.target.value);
    const isChecked = e.target.checked;
    setFormData(prev => {
      const currentCatIds = prev.categoriaIds || [];
      const newCatIds = isChecked 
        ? [...currentCatIds, catId] 
        : currentCatIds.filter(id => id !== catId);
      return { ...prev, categoriaIds: newCatIds };
    });
  };

  const handleAgregarImagen = () => {
    if (!urlInput.trim()) return;
    setFormData(prev => ({
      ...prev,
      imagenes: [...prev.imagenes, { url: urlInput }]
    }));
    setUrlInput('');
  };

  const handleQuitarImagen = (indexToRemove: number) => {
    setFormData(prev => ({
      ...prev,
      imagenes: prev.imagenes.filter((_, index) => index !== indexToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (esEdicion && formData.id) {
        // MODO EDICIÓN
        await actualizarProducto(formData.id, formData);
        alert('¡Producto actualizado correctamente!');
      } else {
        // MODO CREACIÓN
        await agregarProducto(formData);
        alert('¡Producto agregado correctamente!');
        setFormData(estadoInicialFormulario); // Limpiamos solo si agregamos
      }
      
      onProductoAgregado(); // Callback para volver o refrescar
      
    } catch (error) {
      alert((error as Error).message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-gray-900">
          {esEdicion ? `Editar Producto #${formData.id}` : 'Agregar Nuevo Producto'}
        </h3>
        {esEdicion && (
            <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-2.5 py-0.5 rounded">MODO EDICIÓN</span>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* SECCIÓN 1: GENERAL E IMÁGENES */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm space-y-4">
          <h4 className="font-semibold text-gray-900 text-lg mb-4">Información General</h4>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nombre del Producto</label>
            <input 
              className="input-modern w-full border p-2 rounded" 
              type="text" name="nombre" value={formData.nombre} onChange={handleChange} required 
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
            <input 
              className="input-modern w-full border p-2 rounded" 
              type="text" name="descripcion" value={formData.descripcion} onChange={handleChange}
            />
          </div>

          <div className="border-t pt-4 mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Galería de Imágenes</label>
            <div className="flex gap-2 mb-3">
              <input 
                className="input-modern flex-1 border p-2 rounded" 
                type="url" value={urlInput} onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://ejemplo.com/foto.jpg"
                onKeyDown={(e) => { if(e.key === 'Enter') { e.preventDefault(); handleAgregarImagen(); }}}
              />
              <button type="button" onClick={handleAgregarImagen} className="bg-gray-200 hover:bg-gray-300 px-4 rounded">
                +
              </button>
            </div>
            {formData.imagenes.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-2">
                {formData.imagenes.map((img, index) => (
                  <div key={index} className="relative group border rounded h-16 flex justify-center items-center bg-gray-50">
                    <img src={img.url} className="max-h-full object-contain" onError={(e) => (e.currentTarget.style.display = 'none')}/>
                    <button type="button" onClick={() => handleQuitarImagen(index)} className="absolute top-0 right-0 bg-red-500 text-white w-4 h-4 text-xs flex items-center justify-center rounded-bl">x</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 mt-4">Categorías</label>
            <div className="max-h-32 overflow-y-auto border border-gray-200 rounded-lg p-3 bg-gray-50 space-y-2">
              {categorias.length > 0 ? categorias.map(cat => (
                <label key={cat.id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    value={cat.id}
                    onChange={handleCategoryChange}
                    checked={formData.categoriaIds.includes(cat.id)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="text-sm text-gray-700">{cat.nombre}</span>
                </label>
              )) : <small>Cargando...</small>}
            </div>
          </div>
        </div>
        
        {/* SECCIÓN 2: INVENTARIO, DIMENSIONES, UBICACIÓN */}
        <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm space-y-4">
              <h4 className="font-semibold text-gray-900 text-lg mb-4">Inventario y Precio</h4>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Precio</label>
                <input className="input-modern w-full border p-2 rounded" type="number" name="precio" value={formData.precio} onChange={handleChange} required min="0" step="0.01" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Stock</label>
                    <input className="input-modern w-full border p-2 rounded" type="number" name="stockInicial" value={formData.stockInicial} onChange={handleChange} required min="0" step="1"/>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Peso (Kg)</label>
                    <input className="input-modern w-full border p-2 rounded" type="number" name="pesoKg" value={formData.pesoKg} onChange={handleChange} min="0" step="0.1" />
                  </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm space-y-4">
              <h4 className="font-semibold text-gray-900 text-lg mb-4">Dimensiones (cm)</h4>
              <div className="grid grid-cols-3 gap-3">
                  <input className="input-modern w-full border p-2 rounded" type="number" placeholder="Largo" name="largoCm" value={formData.dimensiones.largoCm} onChange={e => handleNestedChange(e, 'dimensiones')} min="0" />
                  <input className="input-modern w-full border p-2 rounded" type="number" placeholder="Ancho" name="anchoCm" value={formData.dimensiones.anchoCm} onChange={e => handleNestedChange(e, 'dimensiones')} min="0" />
                  <input className="input-modern w-full border p-2 rounded" type="number" placeholder="Alto" name="altoCm" value={formData.dimensiones.altoCm} onChange={e => handleNestedChange(e, 'dimensiones')} min="0" />
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm space-y-4">
                <h4 className="font-semibold text-gray-900 text-lg mb-4">Ubicación</h4>
                <input className="input-modern w-full border p-2 rounded mb-2" type="text" name="street" value={formData.ubicacion.street} onChange={e => handleNestedChange(e, 'ubicacion')} placeholder="Calle" />
                <div className="grid grid-cols-2 gap-3">
                    <input className="input-modern w-full border p-2 rounded" type="text" name="city" value={formData.ubicacion.city} onChange={e => handleNestedChange(e, 'ubicacion')} placeholder="Ciudad" />
                    <input className="input-modern w-full border p-2 rounded" type="text" name="country" value={formData.ubicacion.country} onChange={e => handleNestedChange(e, 'ubicacion')} placeholder="País" maxLength={2} />
                </div>
            </div>
        </div>
      </div>
      
      <div className="flex justify-end pt-4">
        <button 
          type="submit" 
          className={`font-semibold px-8 py-3 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md text-white ${esEdicion ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          {esEdicion ? 'Guardar Cambios' : 'Agregar Producto'}
        </button>
      </div>
    </form>
  );
}