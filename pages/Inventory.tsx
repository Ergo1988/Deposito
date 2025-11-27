import React, { useState } from 'react';
import { Plus, Search, Trash2, Edit2, AlertTriangle, XCircle, CheckCircle, Clock } from 'lucide-react';
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

  const getStatus = (dateStr: string) => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const expDate = new Date(dateStr);
    const diffTime = expDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return ExpiryStatus.EXPIRED;
    if (diffDays <= 60) return ExpiryStatus.WARNING;
    return ExpiryStatus.GOOD;
  };

  const getDaysRemaining = (dateStr: string) => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const expDate = new Date(dateStr);
    const diffTime = expDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.brand.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime());

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-slate-800">Gerenciar Estoque</h1>
        <button 
          onClick={() => { setEditingProduct(null); setIsModalOpen(true); }}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
        >
          <Plus size={18} />
          Novo Produto
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por nome, marca ou categoria..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold">
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Produto</th>
                <th className="px-6 py-4">Categoria</th>
                <th className="px-6 py-4">Qtd.</th>
                <th className="px-6 py-4">Validade / Dias</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    Nenhum produto encontrado.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const status = getStatus(product.expirationDate);
                  const daysRemaining = getDaysRemaining(product.expirationDate);
                  let statusColor = '';
                  let StatusIcon = CheckCircle;
                  let statusText = '';
                  let daysTextClass = '';

                  switch (status) {
                    case ExpiryStatus.EXPIRED:
                      statusColor = 'text-red-600 bg-red-50 border-red-100';
                      StatusIcon = XCircle;
                      statusText = 'Vencido';
                      daysTextClass = 'text-red-600 font-bold';
                      break;
                    case ExpiryStatus.WARNING:
                      statusColor = 'text-amber-600 bg-amber-50 border-amber-100';
                      StatusIcon = AlertTriangle;
                      statusText = 'Atenção';
                      daysTextClass = 'text-amber-600 font-bold';
                      break;
                    default:
                      statusColor = 'text-emerald-600 bg-emerald-50 border-emerald-100';
                      StatusIcon = CheckCircle;
                      statusText = 'OK';
                      daysTextClass = 'text-slate-500';
                  }

                  return (
                    <tr key={product.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${statusColor}`}>
                          <StatusIcon size={12} />
                          {statusText}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-800">{product.name}</div>
                        <div className="text-xs text-slate-400">{product.brand} • Lote: {product.batchNumber}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">{product.category}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{product.quantity} un</td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-slate-700">
                          {new Date(product.expirationDate).toLocaleDateString('pt-BR')}
                        </div>
                        <div className={`text-xs flex items-center gap-1 mt-0.5 ${daysTextClass}`}>
                          <Clock size={10} />
                          {daysRemaining < 0 
                            ? `Vencido há ${Math.abs(daysRemaining)} dias` 
                            : daysRemaining === 0 
                              ? 'Vence hoje' 
                              : `Vence em ${daysRemaining} dias`
                          }
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleEdit(product)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                            title="Editar"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={() => handleDelete(product.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"
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