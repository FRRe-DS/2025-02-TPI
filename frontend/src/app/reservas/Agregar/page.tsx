"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import Breadcrumb from '@/componentes/Bars/Breadcrumb'; 
import ReservaForm from '@/componentes/ReservasForm'; 

export default function AgregarReservaPage() {
    const router = useRouter();

    const handleReservaCreada = () => {
        router.push('/reservas/Ver'); 
    };

    const handleCancelar = () => {
        router.push('/reservas/Ver');
    };

return (
        <div className="min-h-screen bg-gray-100 py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-[#232B65]">Registrar Nueva Reserva</h1>
                    <p className="text-gray-600 mt-2">
                    Utiliza el buscador para agregar productos al carrito. El sistema generará un ID de reserva único.
                    </p>
                </div>

                {/* Pasamos los dos manejadores de navegación */}
                <ReservaForm 
                    onReservaCreada={handleReservaCreada} 
                    onCancelar={handleCancelar}
                />
                
            </div>
        </div>
    );
}