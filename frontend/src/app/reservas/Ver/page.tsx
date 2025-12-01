"use client";

import React from 'react';
import GestionReservas from '@/componentes/GestionReservas';
import Breadcrumb from '@/componentes/Bars/Breadcrumb';

export default function ReservasPage() {
    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
            {/* Título de la Sección */}
            <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Reservas</h1>
            <p className="text-gray-600 mt-1">Administra las solicitudes de stock y sus estados.</p>
            </div>

            <GestionReservas />

        </div>
        </div>
    );
}
