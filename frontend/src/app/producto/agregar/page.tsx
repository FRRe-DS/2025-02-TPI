"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import { FaArrowLeft } from 'react-icons/fa';
import ProductoForm from  '../../../componentes/ProductoForm';

export default function NuevoProductoPage() {
    const router = useRouter();
    const handleProductoCreado = () => {
    router.push('/productos'); // lleva al usuario a la lista de productos después de agregar uno nuevo
    };

    return (
        <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <button onClick={() => router.back()} className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors">
                <FaArrowLeft className="mr-2" />
                Volver al inicio
                </button>
                <ProductoForm onProductoAgregado={handleProductoCreado} />
            </div>
        </div>
    );
}
