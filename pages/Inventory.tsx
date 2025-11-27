import React, { useState } from 'react';
import { Plus, Search, Trash2, Edit2, AlertTriangle, XCircle, CheckCircle, Clock, Calendar, Box } from 'lucide-react';
import { Product, ExpiryStatus } from '../types';
import { ProductModal } from '../components/ProductModal';

interface InventoryProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
}

export const Inventory: React.FC<InventoryProps> = ({ products, setProducts }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este produto?')) {
      setProducts(prev => prev.filter(p => p.id !== id));
    }
  };

  const handleSave = (product: Product) => {
    if (editingProduct) {
      setProducts(prev => prev.map(p => p.id === product.id ? product : p));
    } else {
      setProducts(prev => [...prev, product]);
    }
    setEditingProduct(null);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const getDaysRemaining = (dateStr: string) => {
    if (!dateStr) return 0;
    const today = new Date();
    today.setHours(0,0,0,0);
    const expDate = new Date(dateStr);
    
    // Validate date
    if (isNaN(expDate.getTime())) return 0;

    const diffTime = expDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getStatus = (daysRemaining: number) => {
    if (daysRemaining < 0) return ExpiryStatus.EXPIRED;
    if (daysRemaining <= 60) return ExpiryStatus.WARNING;
    return ExpiryStatus.GOOD;
  };

  const filteredProducts = products.filter(p => 
    (p.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (p.category?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (p.brand?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  ).sort((a, b) => new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime());

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Gerenciar Estoque</h1>
          <p className="text-slate-500">Adicione, edite e monitore a validade dos produtos.</p>
        </div>
        <button 
          onClick={() => { setEditingProduct(null); setIsModalOpen(true); }}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-emerald-600/20 font-medium active:scale-95"
        >
          <Plus size={18} />
          Novo Produto
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Toolbar */}
        <div className="p-5 border-b border-slate-100 bg-slate-50/50">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por nome, marca ou categoria..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all placeholder:text-slate-400 text-slate-700"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 text-slate-500 text-xs uppercase tracking-wider font-bold">
                <th className="px-6 py-4 border-b border-slate-100">Status</th>
                <th className="px-6 py-4 border-b border-slate-100">Produto</th>
                <th className="px-6 py-4 border-b border-slate-100">Categoria</th>
                <th className="px-6 py-4 border-b border-slate-100 text-center">Qtd.</th>
                <th className="px-6 py-4 border-b border-slate-100">Validade</th>
                <th className="px-6 py-4 border-b border-slate-100 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <Box size={48} className="mb-4 text-slate-300" strokeWidth={1} />
                      <p className="text-lg font-medium text-slate-600">Nenhum produto encontrado</p>
                      <p className="text-sm">Tente ajustar sua busca ou adicione um novo produto.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const daysRemaining = getDaysRemaining(product.expirationDate);
                  const status = getStatus(daysRemaining);
                  
                  let statusConfig = {
                    bg: 'bg-emerald-50',
                    text: 'text-emerald-700',
                    border: 'border-emerald-200',
                    icon: CheckCircle,
                    label: 'OK',
                    daysColor: 'text-emerald-600'
                  };

                  if (status === ExpiryStatus.EXPIRED) {
                    statusConfig = {
                      bg: 'bg-red-50',
                      text: 'text-red-700',
                      border: 'border-red-200',
                      icon: XCircle,
                      label: 'Vencido',
                      daysColor: 'text-red-600'
                    };
                  } else if (status === ExpiryStatus.WARNING) {
                    statusConfig = {
                      bg: 'bg-amber-50',
                      text: 'text-amber-700',
                      border: 'border-amber-200',
                      icon: AlertTriangle,
                      label: 'Atenção',
                      daysColor: 'text-amber-600'
                    };
                  }

                  const StatusIcon = statusConfig.icon;

                  return (
                    <tr key={product.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-6 py-4 align-middle">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-sm ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}>
                          <StatusIcon size={12} />
                          {statusConfig.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 align-middle">
                        <div className="font-semibold text-slate-800 text-sm">{product.name}</div>
                        <div className="text-xs text-slate-500 font-medium flex items-center gap-2 mt-0.5">
                          <span>{product.brand}</span>
                          <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                          <span className="font-mono text-slate-400">#{product.batchNumber}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 align-middle">
                        <span className="text-sm text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-md font-medium">
                          {product.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 align-middle text-center">
                        <span className="text-sm font-semibold text-slate-700">{product.quantity}</span>
                      </td>
                      <td className="px-6 py-4 align-middle">
                        <div className="flex items-center gap-2 text-slate-700">
                          <Calendar size={14} className="text-slate-400" />
                          <span className="text-sm font-medium tabular-nums">
                            {new Date(product.expirationDate).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                        <div className={`text-xs font-bold flex items-center gap-1.5 mt-1 ${statusConfig.daysColor}`}>
                          <Clock size={12} />
                          {daysRemaining < 0 
                            ? `Vencido há ${Math.abs(daysRemaining)} dias` 
                            : daysRemaining === 0 
                              ? 'Vence hoje' 
                              : `${daysRemaining} dias restantes`
                          }
                        </div>
                      </td>
                      <td className="px-6 py-4 align-middle text-right">
                        <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleEdit(product)}
                            className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                            title="Editar"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={() => handleDelete(product.id)}
                            className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            title="Excluir"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ProductModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setEditingProduct(null); }} 
        onSave={handleSave}
        productToEdit={editingProduct}
      />
    </div>
  );
};