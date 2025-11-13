'use client'
import Link from 'next/link'
import { useState } from 'react'
import keycloak from '../lib/keycloak'

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)

  const handleLogout = () => {
    keycloak.logout({ redirectUri: window.location.origin })
  }

  return (
    <aside className={`hidden lg:flex flex-col justify-between p-4 transition-all ${collapsed ? 'w-20' : 'w-64'}`}>
      <div className="space-y-6">
        {/* Header / Branding */}
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className={`relative inline-flex items-center justify-center ${collapsed ? 'w-10 h-10' : 'w-12 h-12'} bg-gradient-to-br from-violet-700 to-purple-700 rounded-xl shadow-md transition-all`}> 
            <svg className="w-6 h-6 text-white relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>

          {!collapsed && (
            <div className="flex flex-col">
              <div className="flex items-center gap-3">
                <h2 className="text-sm font-semibold text-slate-100">Stock Manager</h2>
                <span className="text-xs text-white/90 bg-violet-700 px-2 py-0.5 rounded-md font-medium">Grupo 02</span>
              </div>
              <p className="text-xs text-slate-400 -mt-1">Control de Inventario</p>
            </div>
          )}
        </Link>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-3 text-sm text-slate-200 hover:text-white"
        >
          <span className="inline-flex items-center justify-center w-8 h-8 bg-violet-700 rounded-md shadow-md">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </span>
          {!collapsed && <span className="font-semibold">Navegación</span>}
        </button>

        <nav className="flex flex-col gap-2">
          <Link href="/dashboard" className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors">
            <span className="w-8 h-8 flex items-center justify-center bg-violet-700 rounded-md">🏠</span>
            {!collapsed && <span>Dashboard</span>}
          </Link>

          <Link href="#productos" className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors">
            <span className="w-8 h-8 flex items-center justify-center bg-violet-700 rounded-md">📦</span>
            {!collapsed && <span>Productos</span>}
          </Link>

          <Link href="#reservas" className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors">
            <span className="w-8 h-8 flex items-center justify-center bg-violet-700 rounded-md">📋</span>
            {!collapsed && <span>Reservas</span>}
          </Link>

          <Link href="#reportes" className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors">
            <span className="w-8 h-8 flex items-center justify-center bg-violet-700 rounded-md">📊</span>
            {!collapsed && <span>Reportes</span>}
          </Link>
        </nav>
      </div>

      <div className="pt-4">
        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 bg-red-600 hover:bg-red-500 rounded-lg text-white font-medium transition">
          <span className="w-7 h-7 flex items-center justify-center bg-white/10 rounded-md">⎋</span>
          <span>Salir</span>
        </button>
      </div>
    </aside>
  )
}
