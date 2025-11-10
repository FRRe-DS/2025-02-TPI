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
    return <div>Cargando categorías...</div>;
  }

  // --- ESTILOS (para hacerlo más limpio) ---
  const styles: { [key: string]: React.CSSProperties } = {
    container: { marginTop: '2rem', borderTop: '2px solid #000', paddingTop: '1rem' },
    form: { marginBottom: '1rem', display: 'flex', gap: '5px' },
    list: { listStyle: 'none', padding: 0 },
    listItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px', borderBottom: '1px solid #eee' },
    editInput: { marginRight: '5px' },
    editButton: { backgroundColor: '#28a745', color: 'white', border: 'none', padding: '5px', marginRight: '5px' },
    cancelButton: { backgroundColor: '#6c757d', color: 'white', border: 'none', padding: '5px' },
    deleteButton: { backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', marginLeft: '5px' },
    editButtonOuter: { backgroundColor: '#ffc107', color: 'black', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }
  };

  // --- RENDERIZADO ---
  return (
    <div style={styles.container}>
      <h2>Gestión de Categorías</h2>
      
      {/* Formulario para Agregar */}
      <form onSubmit={handleAgregar} style={styles.form}>
        <input 
          type="text" 
          placeholder="Nombre nueva categoría" 
          value={nuevoNombre} 
          onChange={e => setNuevoNombre(e.target.value)} 
          required 
        />
        <input 
          type="text" 
          placeholder="Descripción (opcional)" 
          value={nuevaDesc} 
          onChange={e => setNuevaDesc(e.target.value)} 
        />
        <button type="submit">Agregar Categoría</button>
      </form>

      {/* Lista de Categorías */}
      <ul style={styles.list}>
        {categorias.map(cat => (
          <li key={cat.id} style={styles.listItem}>
            {editingId === cat.id ? (
              // --- Vista de Edición ---
              <div>
                <input 
                  type="text" 
                  value={editNombre} 
                  onChange={e => setEditNombre(e.target.value)}
                  style={styles.editInput}
                />
                <input 
                  type="text" 
                  value={editDesc} 
                  onChange={e => setEditDesc(e.target.value)}
                  style={styles.editInput}
                />
                <button onClick={() => handleGuardarEdicion(cat.id)} style={styles.editButton}>Guardar</button>
                <button onClick={handleCancelarEdicion} style={styles.cancelButton}>Cancelar</button>
              </div>
            ) : (
              // --- Vista Normal ---
              <div>
                <strong>{cat.nombre}</strong> (ID: {cat.id})<br />
                <small>{cat.descripcion || '(Sin descripción)'}</small>
              </div>
            )}
            
            {editingId !== cat.id && (
              <div>
                <button onClick={() => handleEditarClick(cat)} style={styles.editButtonOuter}>Editar</button>
                <button onClick={() => handleEliminar(cat.id)} style={styles.deleteButton}>Eliminar</button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}