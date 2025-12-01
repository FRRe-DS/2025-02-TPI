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
  width = '800px'
}: SlidePanelProps) {
  
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
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 9998,
        }}
        onClick={onClose}
      />
      
      <div 
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          height: '100%',
          width: width,
          maxWidth: '100%',
          backgroundColor: 'white',
          boxShadow: '-4px 0 10px rgba(0,0,0,0.3)',
          zIndex: 9999,
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s ease-in-out',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div style={{
          backgroundColor: '#232B65FF',
          color: 'white',
          padding: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #374151',
        }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>{title}</h2>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#374151'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <FaTimes size={24} />
          </button>
        </div>

        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px',
          backgroundColor: '#f9fafb',
        }}>
          {children}
        </div>
      </div>
    </>
  );
}
