'use client';   

export default function Footer() {
  return (
      <footer className="bg-[#232B65] text-white py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Redes Sociales */}
            <div className="flex items-center gap-4">
              <span className="text-sm">Síguenos</span>
              <div className="flex gap-3">
                <a href="#" className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
                  <span>f</span>
                </a>
                <a href="#" className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
                  <span>t</span>
                </a>
                <a href="#" className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
                  <span>in</span>
                </a>
                <a href="#" className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
                  <span>ig</span>
                </a>
              </div>
            </div>
            
            {/* Copyright */}
            <div className="text-sm text-center md:text-right">
              <p>© 2025 Desarrollo de Software - Grupo 2</p>
            </div>
          </div>
        </div>
      </footer>
    );
}   