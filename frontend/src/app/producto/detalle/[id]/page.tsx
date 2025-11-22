"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // Importamos router para redirigir
import { obtenerProductoPorId, eliminarProducto } from "@/servicios/api";
import "./detalleproducto.css";
import Link from "next/link";

// 1. Cambiamos la interfaz para esperar un 'id'
export default function DetalleProductoPage({ params }: { params: Promise<{ id: string }> }) {

  // 2. Desempaquetamos 'id' en lugar de 'productoId'
  const { id } = use(params); 
  const router = useRouter();

  const [producto, setProducto] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    // Usamos el 'id' correcto
    obtenerProductoPorId(Number(id))
      .then((data) => setProducto(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  // Función para manejar el eliminado y redirigir
  const handleEliminar = async () => {
    if (!producto) return;
    if (confirm("¿Estás seguro de eliminar este producto?")) {
      try {
        await eliminarProducto(producto.id);
        alert("Producto eliminado");
        router.push("/producto/lista"); // Redirige a la lista
      } catch (error) {
        alert("Error al eliminar");
      }
    }
  };

  if (loading) return <p className="cargando">Cargando...</p>;
  if (!producto) return <div className="detalle-container error"><p>Producto no encontrado.</p><Link href="/producto/lista"><button className="btn-volver">Volver</button></Link></div>;

  const getStockBadge = (stock: number) => {
    if (stock <= 5) return "stock-rojo";
    if (stock <= 20) return "stock-amarillo";
    if (stock <= 100) return "stock-azul";
    return "stock-verde";
  };

  return (
    <div className="detalle-container">
      <h1 className="titulo">{producto.nombre}</h1>

      {/* GRID PRINCIPAL */}
      <div className="detalle-grid">
        <div className="detalle-imagen">
          <img
            src={producto.imagenes?.[0]?.url || "/placeholder.png"}
            alt={producto.nombre}
            onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/400?text=Sin+Imagen")}
          />
        </div>

        <div className="detalle-descripcion">
          <h2>Descripción</h2>
          <ul className="lista-descripcion">
            {producto.descripcion ? (
              <li>{producto.descripcion}</li>
            ) : (
              <li className="texto-vacio">Sin descripción disponible.</li>
            )}
          </ul>
        </div>
      </div>

      {/* INFO EXTRA */}
      <div className="detalle-info-extra">
        <div className="info-bloque">
          <h3>Precio</h3>
          <p className="precio">
            {producto.precio ? `$${producto.precio}` : "No informado"}
          </p>
        </div>

        <div className="info-bloque">
          <h3>Disponibilidad</h3>
          <span className={`badge-stock ${getStockBadge(producto.stockDisponible ?? 0)}`}>
            {producto.stockDisponible ?? 0}
          </span>
        </div>

        <div className="info-bloque">
          <h3>Ubicación</h3>
          {producto.ubicacion ? (
            <>
              <p>{producto.ubicacion.street || "Calle no informada"}</p>
              <p>{producto.ubicacion.city || "Ciudad no informada"}</p>
              <p>{producto.ubicacion.country || "País no informado"}</p>
            </>
          ) : <p>Ubicación no informada</p>}
        </div>
      </div>

      {/* BOTONES */}
      <div className="detalle-botones">
        <button className="btn-editar">EDITAR PRODUCTO</button>
        <button className="btn-eliminar" onClick={handleEliminar}>
          ELIMINAR PRODUCTO
        </button>
      </div>
      
      {/* BOTÓN VOLVER (Agregado para completar tu CSS) */}
      <div className="volver-container">
        <Link href="/producto/lista">
           <button className="btn-volver">Volver al listado</button>
        </Link>
      </div>

    </div>
  );
}