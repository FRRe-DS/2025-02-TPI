"use client";

import { use, useEffect, useState } from "react";
import { obtenerProductoPorId, eliminarProducto } from "@/servicios/api";
import "./detalleproducto.css";
import Link from "next/link";

interface DetalleProductoPageProps {
  params: Promise<{ productoId: string }>;
}

export default function DetalleProductoPage({ params }: DetalleProductoPageProps) {
  const { productoId } = use(params);

  const [producto, setProducto] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    obtenerProductoPorId(Number(productoId))
      .then((data) => setProducto(data))
      .finally(() => setLoading(false));
  }, [productoId]);

  if (loading) return <p className="cargando">Cargando...</p>;
  if (!producto) return <p className="error">Producto no encontrado.</p>;

  const getStockBadge = (stock: number) => {
    if (stock <= 5) return "stock-rojo";
    if (stock <= 20) return "stock-amarillo";
    if (stock <= 100) return "stock-azul";
    return "stock-verde";
  };

  return (
    <div className="detalle-container">
      
      {/* ---------- TÍTULO ---------- */}
      <h1 className="titulo">{producto.nombre}</h1>

      {/* ---------- GRID PRINCIPAL ---------- */}
      <div className="detalle-grid">

        {/* ---- ESPACIO PARA IMAGEN ---- */}
        <div className="detalle-imagen">
          <img
            src={producto.imagenes?.[0]?.url || "/placeholder.png"}
            alt={producto.nombre}
          />
        </div>

        {/* ---- DESCRIPCIÓN ---- */}
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

      {/* ---------- INFO EXTRA ---------- */}
      <div className="detalle-info-extra">

        {/* PRECIO */}
        <div className="info-bloque">
          <h3>Precio</h3>
          <p className="precio">
            {producto.precio ? `$${producto.precio}` : "No informado"}
          </p>
        </div>

        {/* DISPONIBILIDAD */}
        <div className="info-bloque">
          <h3>Disponibilidad</h3>
          <span className={`badge-stock ${getStockBadge(producto.stockDisponible ?? 0)}`}>
            {producto.stockDisponible ?? 0}
          </span>
        </div>

        {/* UBICACIÓN (EXTENDIDA) */}
        <div className="info-bloque">
          <h3>Ubicación</h3>
          <p>{producto.ubicacion?.street || "Calle no informada"}</p>
          <p>{producto.ubicacion?.city || "Ciudad no informada"}</p>
          <p>{producto.ubicacion?.state || "Provincia/Estado no informado"}</p>
          <p>{producto.ubicacion?.postal_code || "Código postal no informado"}</p>
          <p>{producto.ubicacion?.country || "País no informado"}</p>
        </div>

      </div>

      {/* ---------- BOTONES ---------- */}
      <div className="detalle-botones">
        <button className="btn-editar">EDITAR PRODUCTO</button>

        <button className="btn-eliminar" onClick={() => eliminarProducto(producto.id)}>
          ELIMINAR PRODUCTO
        </button>
      </div>

      {/* ---------- BOTÓN VOLVER ---------- */}
      <div className="volver-container">
        <Link href="/dashboard">
          <button className="btn-volver">Volver</button>
        </Link>
      </div>

    </div>
  );
}
