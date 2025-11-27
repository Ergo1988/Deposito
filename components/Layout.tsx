import React from 'react';
import { LayoutDashboard, Package, BrainCircuit, Menu, X, Pill, ExternalLink } from 'lucide-react';
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

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden font-sans">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-20 lg:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-30
        w-72 bg-slate-900 text-white transform transition-transform duration-300 ease-out shadow-2xl lg:shadow-none
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        flex flex-col
      `}>
        <div className="h-20 flex items-center px-8 border-b border-slate-800/50">
          <div className="p-2 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-lg mr-3 shadow-lg shadow-emerald-500/20">
            <Pill className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="text-lg font-bold block leading-none tracking-tight">SuppleControl</span>
            <span className="text-xs text-slate-400 font-medium">Gestão Inteligente</span>
          </div>
        </div>

        <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all duration-200 group relative overflow-hidden ${
                  isActive 
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/40 translate-x-1' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white hover:translate-x-1'
                }`}
              >
                <Icon size={20} className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                <span className="font-medium tracking-wide">{item.label}</span>
                {isActive && (
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-emerald-400 rounded-l-full shadow-[0_0_10px_rgba(52,211,153,0.5)]"></div>
                )}
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-slate-800/50">
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Status</span>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Sistema operando normalmente. Dados sincronizados localmente.
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50/50 relative">
        {/* Decorative Background */}
        <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-slate-100 to-transparent pointer-events-none z-0"></div>

        {/* Header */}
        <header className="h-20 flex items-center justify-between px-6 lg:px-10 z-10 relative">
          <button 
            onClick={toggleSidebar}
            className="p-2 -ml-2 rounded-lg hover:bg-white/80 text-slate-600 lg:hidden transition-colors"
          >
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          
          <div className="flex items-center gap-6 ml-auto">
            <div className="hidden sm:block text-right">
              <div className="text-sm font-semibold text-slate-700">Administrador</div>
              <div className="text-xs text-slate-500">
                {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
              </div>
            </div>
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 border-2 border-white shadow-md flex items-center justify-center text-white font-bold text-sm">
              AD
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6 lg:px-10 pb-10 z-10">
          <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};