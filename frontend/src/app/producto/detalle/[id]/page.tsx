"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
// IMPORTANTE: Ajuste de ruta.
// Como estamos en src/app/producto/detalle/[id], necesitamos subir 4 niveles para llegar a src
import { obtenerProductoPorId, eliminarProducto } from "../../../../servicios/api";
import "./detalleproducto.css";

// Definimos la interfaz aquí para evitar errores de TypeScript
interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  stockInicial: number;
  stockDisponible?: number;
  pesoKg?: number;
  dimensiones?: { largoCm: number; anchoCm: number; altoCm: number };
  ubicacion?: { street: string; city: string; country: string };
  imagenes?: { url: string }[];
}

export default function DetalleProductoPage() {
  const params = useParams(); // Hook de Next.js para leer la URL
  const router = useRouter();

  const [producto, setProducto] = useState<Producto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // 1. Verificación de Seguridad: ¿Tenemos ID?
    // params puede ser null durante milisegundos al cargar, o id puede ser undefined.
    const idParam = params?.id; 

    if (!idParam) {
      console.log("Esperando ID de la URL...");
      return; // Esperamos a que Next.js nos de el dato
    }

    const idNumerico = Number(idParam);
    if (isNaN(idNumerico)) {
      setError("ID de producto inválido");
      setLoading(false);
      return;
    }

    // 2. Llamada a la API
    console.log("Solicitando producto ID:", idNumerico);
    setLoading(true);

    obtenerProductoPorId(idNumerico)
      .then((data) => {
        console.log("Datos recibidos:", data);
        if (data) {
          setProducto(data);
        } else {
          setError("El producto no existe o fue eliminado.");
        }
      })
      .catch((err) => {
        console.error("Error API:", err);
        setError("Error de conexión al cargar el producto.");
      })
      .finally(() => {
        setLoading(false);
      });

  }, [params]); // Se ejecuta cuando cambian los parámetros de la URL

  // --- MANEJADORES ---

  const handleEliminar = async () => {
    if (!producto) return;
    if (confirm(`¿Estás seguro de eliminar: ${producto.nombre}?`)) {
      try {
        await eliminarProducto(producto.id);
        alert("Producto eliminado.");
        router.push("/producto/lista");
      } catch (err) {
        alert("No se pudo eliminar el producto.");
      }
    }
  };

  // --- RENDERIZADO (Protegido contra fallos) ---

  if (loading) {
    return (
      <div className="detalle-container" style={{ textAlign: "center", padding: 50 }}>
        <h2>Cargando información...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="detalle-container" style={{ textAlign: "center", color: "red", padding: 50 }}>
        <h2>⚠️ Ocurrió un error</h2>
        <p>{error}</p>
        <div className="volver-container">
          <Link href="/producto/lista">
             <button className="btn-volver">Volver al listado</button>
          </Link>
        </div>
      </div>
    );
  }

  if (!producto) return null; // Por seguridad

  // Calcular stock seguro
  const stockReal = producto.stockDisponible ?? producto.stockInicial ?? 0;

  // Función auxiliar para clase CSS del stock
  const getStockBadge = (stock: number) => {
    if (stock <= 5) return "stock-rojo";
    if (stock <= 20) return "stock-amarillo";
    if (stock <= 100) return "stock-azul";
    return "stock-verde";
  };

  return (
    <div className="detalle-container">
      <h1 className="titulo">{producto.nombre}</h1>

      <div className="detalle-grid">
        {/* Imagen */}
        <div className="detalle-imagen">
           {/* Usamos un placeholder si no hay imagen */}
          <img
            src={producto.imagenes?.[0]?.url || "/logo.png"} 
            alt={producto.nombre}
            onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/400?text=Sin+Imagen")}
          />
        </div>

        {/* Descripción */}
        <div className="detalle-descripcion">
          <h2>Descripción</h2>
          <p>{producto.descripcion || "Sin descripción."}</p>
          
          {producto.dimensiones && (
            <div style={{ marginTop: 20 }}>
              <h3>Dimensiones</h3>
              <ul className="lista-descripcion">
                <li>Largo: {producto.dimensiones.largoCm} cm</li>
                <li>Alto: {producto.dimensiones.altoCm} cm</li>
                <li>Ancho: {producto.dimensiones.anchoCm} cm</li>
              </ul>
            </div>
          )}
        </div>
      </div>

      <div className="detalle-info-extra">
        <div>
          <h3>Precio</h3>
          <p className="precio">${producto.precio}</p>
        </div>
        <div>
          <h3>Disponibilidad</h3>
          <span className={`badge-stock ${getStockBadge(stockReal)}`}>
            {stockReal} u.
          </span>
        </div>
        <div>
          <h3>Ubicación</h3>
          {producto.ubicacion ? (
            <div>
              <p>{producto.ubicacion.street}</p>
              <p>{producto.ubicacion.city}, {producto.ubicacion.country}</p>
            </div>
          ) : (
            <p>No especificada</p>
          )}
        </div>
      </div>

      <div className="detalle-botones">
        <button className="btn-editar" onClick={() => alert("Función editar en desarrollo")}>
          EDITAR PRODUCTO
        </button>
        <button className="btn-eliminar" onClick={handleEliminar}>
          ELIMINAR PRODUCTO
        </button>
      </div>

      <div className="volver-container">
        <Link href="/producto/lista">
          <button className="btn-volver">Volver a la lista</button>
        </Link>
      </div>
    </div>
  );
}