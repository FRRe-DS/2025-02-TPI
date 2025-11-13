'use client'
import { useState, useEffect } from 'react'
import keycloak from '../lib/keycloak'
import Link from 'next/link'

// Grupo display name (ajustable)
const GROUP_NAME = 'Grupo 02'

export default function Navbar() {
  const [username, setUsername] = useState<string | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [userInitials, setUserInitials] = useState<string>('U')

  useEffect(() => {
    if (keycloak.tokenParsed) {
      const user = keycloak.tokenParsed.preferred_username || 'Usuario'
      setUsername(user)
      setUserInitials(user.substring(0, 2).toUpperCase())
    }
  }, [])

  const handleLogout = () => {
    keycloak.logout({ redirectUri: window.location.origin })
  }

  return (
    <nav className="bg-gradient-to-r from-violet-900 via-purple-800 to-indigo-900 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo Section */}
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="relative inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-xl shadow-lg group-hover:shadow-2xl transition-all duration-300 overflow-hidden">
              <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <svg className="w-6 h-6 text-white relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="hidden sm:flex flex-col">
              <div className="flex items-center gap-3">
                <h1 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent group-hover:from-blue-300 group-hover:to-indigo-300 transition">Stock Manager</h1>
                <span className="text-xs text-white/80 bg-violet-700 px-2 py-0.5 rounded-md font-medium">{GROUP_NAME}</span>
              </div>
              <p className="text-xs text-slate-400 -mt-1">Control de Inventario</p>
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            {/* Navigation Links */}
            <Link 
              href="/dashboard" 
              className="group flex items-center gap-2 text-slate-300 hover:text-white transition-colors relative"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-3m0 0l7-4 7 4M5 9v10a1 1 0 001 1h12a1 1 0 001-1V9M9 21h6" />
              </svg>
              <span className="font-medium">Dashboard</span>
              <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 group-hover:w-full transition-all duration-300"></div>
            </Link>

            {/* User Menu */}
            <div className="flex items-center gap-4 pl-4 border-l border-white/10">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-semibold text-white">{username || 'Cargando...'}</p>
                <p className="text-xs text-slate-400">Usuario</p>
              </div>
              
              <div className="relative group">
                <button className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full text-white font-bold text-sm shadow-lg hover:shadow-xl group-hover:scale-110 transition-transform duration-300 overflow-hidden relative">
                  <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <span className="relative z-10">{userInitials}</span>
                </button>

                {/* Dropdown Menu */}
                <div className="absolute right-0 mt-2 w-56 bg-violet-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 overflow-hidden">
                  {/* User Info Header */}
                  <div className="px-6 py-4 border-b border-white/10 bg-gradient-to-r from-blue-500/10 to-indigo-500/10">
                    <p className="text-white font-bold text-sm">{username || 'Usuario'}</p>
                    <p className="text-xs text-slate-400 mt-1">Sesión activa</p>
                  </div>

                  {/* Menu Items */}
                  <div className="py-3">
                    <button 
                      onClick={handleLogout}
                      className="w-full px-6 py-3 text-left flex items-center gap-3 text-slate-300 hover:text-white hover:bg-white/10 transition-colors group/item"
                    >
                      <svg className="w-5 h-5 text-red-400 group-hover/item:text-red-300 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span className="font-medium">Cerrar Sesión</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden pb-6 border-t border-white/10 pt-6 space-y-3">
            <Link 
              href="/dashboard" 
              className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-3m0 0l7-4 7 4M5 9v10a1 1 0 001 1h12a1 1 0 001-1V9M9 21h6" />
              </svg>
              Dashboard
            </Link>

            <div className="px-4 py-3 rounded-lg bg-white/5 border border-white/10">
              <p className="text-sm text-white font-semibold">{username || 'Usuario'}</p>
              <p className="text-xs text-slate-400 mt-1">Sesión activa</p>
            </div>

            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors font-medium"
            >
              <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Cerrar Sesión
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}
