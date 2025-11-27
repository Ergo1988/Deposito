import React, { useState } from 'react';
import { Plus, Search, Trash2, Edit2, AlertTriangle, XCircle, CheckCircle, Clock, Calendar, Box, ArrowUpDown } from 'lucide-react';
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
    if (window.confirm('Tem certeza que deseja remover este item permanentemente?')) {
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
    
    if (isNaN(expDate.getTime())) return 0;

    const diffTime = expDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getStatus = (daysRemaining: number) => {
    if (daysRemaining < 0) return ExpiryStatus.EXPIRED;
    if (daysRemaining <= 60) return ExpiryStatus.WARNING;
    return ExpiryStatus.GOOD;
  };

  // Safe sorting and filtering
  const filteredProducts = products.filter(p => 
    (p.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (p.category?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (p.brand?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  ).sort((a, b) => {
    const dateA = new Date(a.expirationDate || 0).getTime();
    const dateB = new Date(b.expirationDate || 0).getTime();
    return dateA - dateB;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Estoque</h1>
          <p className="text-slate-500">Gerenciamento completo de produtos e lotes.</p>
        </div>
        <button 
          onClick={() => { setEditingProduct(null); setIsModalOpen(true); }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-indigo-600/20 font-bold active:scale-95 hover:-translate-y-0.5"
        >
          <Plus size={20} />
          Adicionar Produto
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Toolbar */}
        <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar produto, marca ou lote..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all placeholder:text-slate-400 text-slate-700 shadow-sm"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <ArrowUpDown size={14} />
            Ordenado por Validade
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 text-slate-500 text-xs uppercase tracking-wider font-bold">
                <th className="px-6 py-4 border-b border-slate-100 w-32">Status</th>
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
                  <td colSpan={6} className="px-6 py-24 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                        <Box size={32} className="text-slate-300" strokeWidth={1.5} />
                      </div>
                      <p className="text-lg font-bold text-slate-600">Nenhum produto encontrado</p>
                      <p className="text-sm mt-1 max-w-xs mx-auto">Tente ajustar sua busca ou adicione novos itens ao estoque.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const daysRemaining = getDaysRemaining(product.expirationDate);
                  const status = getStatus(daysRemaining);
                  
                  let statusConfig = {
                    bg: 'bg-emerald-100/50',
                    text: 'text-emerald-700',
                    border: 'border-emerald-200',
                    icon: CheckCircle,
                    label: 'Regular',
                    pillClass: 'bg-emerald-500'
                  };

                  if (status === ExpiryStatus.EXPIRED) {
                    statusConfig = {
                      bg: 'bg-red-100/50',
                      text: 'text-red-700',
                      border: 'border-red-200',
                      icon: XCircle,
                      label: 'Vencido',
                      pillClass: 'bg-red-500'
                    };
                  } else if (status === ExpiryStatus.WARNING) {
                    statusConfig = {
                      bg: 'bg-amber-100/50',
                      text: 'text-amber-700',
                      border: 'border-amber-200',
                      icon: AlertTriangle,
                      label: 'Atenção',
                      pillClass: 'bg-amber-500'
                    };
                  }

                  const StatusIcon = statusConfig.icon;

                  return (
                    <tr key={product.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4 align-middle">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-sm ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${statusConfig.pillClass}`}></div>
                          {statusConfig.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 align-middle">
                        <div className="font-bold text-slate-800 text-sm">{product.name}</div>
                        <div className="text-xs text-slate-500 font-medium flex items-center gap-2 mt-1">
                          <span className="bg-slate-100 px-1.5 rounded text-slate-600">{product.brand}</span>
                          <span className="text-slate-300">•</span>
                          <span className="font-mono text-slate-400">Lote: {product.batchNumber || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 align-middle">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                          {product.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 align-middle text-center">
                        <span className="text-sm font-bold bg-slate-100 text-slate-700 px-2 py-1 rounded-md min-w-[2rem] inline-block">{product.quantity}</span>
                      </td>
                      <td className="px-6 py-4 align-middle">
                        <div className="flex items-center gap-2 text-slate-700 mb-1">
                          <Calendar size={14} className="text-slate-400" />
                          <span className="text-sm font-semibold tabular-nums">
                            {new Date(product.expirationDate).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                        <div className={`text-xs font-bold flex items-center gap-1.5 ${status === ExpiryStatus.EXPIRED ? 'text-red-600' : status === ExpiryStatus.WARNING ? 'text-amber-600' : 'text-slate-400'}`}>
                          <Clock size={12} />
                          {daysRemaining < 0 
                            ? `Venceu há ${Math.abs(daysRemaining)} dias` 
                            : daysRemaining === 0 
                              ? 'Vence hoje!' 
                              : `${daysRemaining} dias restantes`
                          }
                        </div>
                      </td>
                      <td className="px-6 py-4 align-middle text-right">
                        <div className="flex items-center justify-end gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleEdit(product)}
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                            title="Editar"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button 
                            onClick={() => handleDelete(product.id)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            title="Excluir"
                          >
                            <Trash2 size={18} />
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