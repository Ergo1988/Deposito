import React from 'react';
import { LayoutDashboard, Package, BrainCircuit, Menu, X, Pill, ShieldCheck } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/inventory', label: 'Estoque', icon: Package },
    { path: '/advisor', label: 'Consultor IA', icon: BrainCircuit },
  ];

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 font-sans overflow-hidden">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-72 bg-white border-r border-slate-200 shadow-2xl lg:shadow-none transform transition-transform duration-300 ease-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        flex flex-col
      `}>
        {/* Logo Area */}
        <div className="h-20 flex items-center px-8 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-indigo-600 to-violet-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-200">
              <Pill size={20} fill="currentColor" className="text-white/90" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 leading-none">Supple<span className="text-indigo-600">Control</span></h1>
              <p className="text-xs text-slate-400 font-medium mt-1">Gestão Inteligente</p>
            </div>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={`
                  flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all duration-200 group
                  ${isActive 
                    ? 'bg-indigo-50 text-indigo-700 shadow-sm font-semibold' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-medium'
                  }
                `}
              >
                <Icon 
                  size={20} 
                  className={`transition-colors ${isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'}`} 
                />
                <span>{item.label}</span>
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-600 shadow-[0_0_8px_rgba(79,70,229,0.5)]"></div>
                )}
              </Link>
            );
          })}
        </nav>
        
        {/* Sidebar Footer */}
        <div className="p-6 border-t border-slate-100">
          <div className="bg-slate-900 rounded-2xl p-4 text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 -mt-2 -mr-2 w-16 h-16 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all"></div>
            <div className="flex items-center gap-2 mb-2 relative z-10">
              <ShieldCheck size={16} className="text-emerald-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Sistema Seguro</span>
            </div>
            <p className="text-xs text-slate-400 relative z-10">Dados salvos localmente no navegador.</p>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Header */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-6 lg:px-10 z-30 sticky top-0">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 -ml-2 rounded-lg hover:bg-slate-100 text-slate-600 lg:hidden transition-colors"
          >
            <Menu size={24} />
          </button>
          
          {/* Breadcrumb / Title Placeholder */}
          <div className="hidden md:block">
            <h2 className="text-sm font-semibold text-slate-500">
              Bem-vindo de volta
            </h2>
          </div>

          {/* User Profile */}
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-bold text-slate-800">Administrador</div>
              <div className="text-xs text-slate-500">Loja Principal</div>
            </div>
            <div className="h-10 w-10 rounded-full bg-indigo-100 border-2 border-white shadow-md flex items-center justify-center text-indigo-700 font-bold text-sm">
              AD
            </div>
          </div>
        </header>

        {/* Page Content Scrollable Area */}
        <main className="flex-1 overflow-auto p-4 md:p-8 pb-20 scroll-smooth">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};