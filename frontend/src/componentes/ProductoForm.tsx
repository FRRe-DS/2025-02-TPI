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

  // --- ESTILOS ---
  const styles: { [key: string]: React.CSSProperties } = {
    form: {
      padding: '15px',
      border: '1px solid #ccc',
      borderRadius: '8px',
      marginBottom: '2rem',
      backgroundColor: '#f9f9f9'
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '15px'
    },
    section: {
      border: '1px solid #ddd',
      padding: '10px',
      borderRadius: '5px'
    },
    inputGroup: {
      marginBottom: '10px'
    },
    label: {
      display: 'block',
      fontWeight: 'bold',
      marginBottom: '5px'
    },
    input: {
      width: '100%',
      padding: '8px',
      boxSizing: 'border-box'
    },
    button: {
      marginTop: '15px',
      padding: '10px 15px',
      backgroundColor: '#007bff',
      color: 'white',
      border: 'none',
      borderRadius: '5px',
      cursor: 'pointer'
    }
  };

  // --- RENDERIZADO ---
  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <h3>Agregar Nuevo Producto</h3>
      <div style={styles.grid}>
        
        {/* Sección Principal */}
        <div style={styles.section}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Nombre:</label>
            <input style={styles.input} type="text" name="nombre" value={formData.nombre} onChange={handleChange} required />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Descripción:</label>
            <input style={styles.input} type="text" name="descripcion" value={formData.descripcion} onChange={handleChange} />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Categorías:</label>
            <div style={{ maxHeight: '100px', overflowY: 'auto', border: '1px solid #ddd', padding: '5px', backgroundColor: 'white' }}>
              {categorias.length > 0 ? categorias.map(cat => (
                <div key={cat.id}>
                  <input
                    type="checkbox"
                    id={`cat-add-${cat.id}`}
                    value={cat.id}
                    onChange={handleCategoryChange}
                    // El checkbox está marcado si el ID está en el array
                    checked={formData.categoriaIds.includes(cat.id)}
                  />
                  <label htmlFor={`cat-add-${cat.id}`} style={{ marginLeft: '5px' }}>{cat.nombre}</label>
                </div>
              )) : <small>Cargando categorías...</small>}
            </div>
          </div>
        </div>
        

        {/* Sección Inventario */}
        <div style={styles.section}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Precio:</label>
            <input style={styles.input} type="number" name="precio" value={formData.precio} onChange={handleChange} required min="0" step="0.01" />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Stock Inicial:</label>
            <input style={styles.input} type="number" name="stockInicial" value={formData.stockInicial} onChange={handleChange} required min="0" step="1" />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Peso (Kg):</label>
            <input style={styles.input} type="number" name="pesoKg" value={formData.pesoKg} onChange={handleChange} min="0" step="0.1" />
          </div>
        </div>

        {/* Sección Dimensiones (CORREGIDA) */}
        <div style={styles.section}>
          <strong>Dimensiones (cm):</strong>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Largo:</label>
            <input style={styles.input} type="number" name="largoCm" value={formData.dimensiones.largoCm} onChange={e => handleNestedChange(e, 'dimensiones')} min="0" step="0.1" />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Ancho:</label>
            <input style={styles.input} type="number" name="anchoCm" value={formData.dimensiones.anchoCm} onChange={e => handleNestedChange(e, 'dimensiones')} min="0" step="0.1" />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Alto:</label>
            <input style={styles.input} type="number" name="altoCm" value={formData.dimensiones.altoCm} onChange={e => handleNestedChange(e, 'dimensiones')} min="0" step="0.1" />
          </div>
        </div>
        
        {/* Sección Ubicación */}
        <div style={styles.section}>
          <strong>Ubicación:</strong>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Calle:</label>
            <input style={styles.input} type="text" name="street" value={formData.ubicacion.street} onChange={e => handleNestedChange(e, 'ubicacion')} />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Ciudad:</label>
            <input style={styles.input} type="text" name="city" value={formData.ubicacion.city} onChange={e => handleNestedChange(e, 'ubicacion')} />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>País (Cód. 2):</label>
            <input style={styles.input} type="text" name="country" value={formData.ubicacion.country} onChange={e => handleNestedChange(e, 'ubicacion')} />
          </div>
          {/* (Puedes añadir inputs para state y postal_code aquí) */}
        </div>

      </div>
      <button type="submit" style={styles.button}>Agregar Producto</button>
    </form>
  );
}