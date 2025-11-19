'use client';

import React, { useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';

interface SlidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  width?: string;
}

export default function SlidePanel({ 
  isOpen, 
  onClose, 
  title, 
  children,
  width = 'max-w-2xl'
}: SlidePanelProps) {
  
  // Bloquear scroll del body cuando el panel está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Cerrar con tecla ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
    }
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay oscuro */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-[9998] transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Panel deslizante */}
      <div 
        className={`fixed top-0 right-0 h-full ${width} w-full bg-white shadow-2xl z-[9999] transform transition-transform duration-300 ease-in-out overflow-hidden ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header del panel con botón de cerrar más visible */}
        <div className="bg-gray-900 text-white p-4 sm:p-6 flex justify-between items-center shadow-lg sticky top-0 z-10">
          <h2 className="text-xl sm:text-2xl font-bold">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors duration-200 flex-shrink-0"
            aria-label="Cerrar panel"
          >
            <FaTimes className="text-xl sm:text-2xl" />
          </button>
        </div>

        {/* Contenido scrolleable */}
        <div className="h-[calc(100%-72px)] sm:h-[calc(100%-88px)] overflow-y-auto p-4 sm:p-6 bg-gray-50">
          <div className="max-w-full">
            {children}
          </div>
        </div>
      </div>
    </>
  );
}
