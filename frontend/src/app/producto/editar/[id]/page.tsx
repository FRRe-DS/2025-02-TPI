"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { obtenerProductoPorId } from "@/servicios/api"; 
import FormularioProducto from "@/componentes/ProductoForm"; // Importamos el form reutilizable

export default function EditarProductoPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    
    const [producto, setProducto] = useState<any>(null);
    const [loading, setLoading] = useState(true);

  // 1. Cargar el producto original al entrar
    useEffect(() => {
        if (id) {
            obtenerProductoPorId(Number(id))
            .then((data) => setProducto(data))
            .catch((err) => console.error(err))
            .finally(() => setLoading(false));
        }
    }, [id]);

  // 2. Qué hacer cuando el formulario termine de guardar
    const handleGuardadoExitoso = () => {
        // Volvemos a la lista (o podrías volver al detalle)
        router.push("/producto/lista");
    };

    if (loading) return <div className="p-10 text-center">Cargando datos para editar...</div>;
    if (!producto) return <div className="p-10 text-center text-red-500">Error: Producto no encontrado</div>;

    return (
        <div className="min-h-screen bg-gray-100 py-10 px-4">
        <div className="max-w-5xl mx-auto">
            
            <div className="mb-6 flex items-center justify-between">
                <button onClick={() => router.back()} className="text-gray-600 hover:text-blue-900">
                    ← Cancelar y Volver
                </button>
            </div>

            {/* Pasamos el producto al formulario con la prop 'productoAEditar' */}
            <FormularioProducto 
                onProductoAgregado={handleGuardadoExitoso} 
                productoAEditar={producto} 
            />
            
        </div>
        </div>
    );
}
