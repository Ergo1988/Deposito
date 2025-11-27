import React, { useMemo } from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend 
} from 'recharts';
import { AlertCircle, CheckCircle, Clock, Package, TrendingUp, BarChart3 } from 'lucide-react';
import { Product } from '../types';

interface DashboardProps {
  products: Product[];
}

export const Dashboard: React.FC<DashboardProps> = ({ products }) => {
  
  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0,0,0,0);
    
    let expired = 0;
    let warning = 0;
    let good = 0;
    const categoryCount: Record<string, number> = {};

    products.forEach(p => {
      if (!p.expirationDate) return;
      
      const expDate = new Date(p.expirationDate);
      if (isNaN(expDate.getTime())) return;

      const diffTime = expDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays < 0) expired++;
      else if (diffDays <= 60) warning++;
      else good++;

      const cat = p.category || 'Outros';
      categoryCount[cat] = (categoryCount[cat] || 0) + 1;
    });

    return { expired, warning, good, total: products.length, categoryCount };
  }, [products]);

  const pieData = [
    { name: 'Vencidos', value: stats.expired, color: '#ef4444' },
    { name: 'Alerta (60d)', value: stats.warning, color: '#f59e0b' },
    { name: 'Regular', value: stats.good, color: '#10b981' },
  ].filter(d => d.value > 0);

  const barData = Object.entries(stats.categoryCount)
    .map(([name, count]) => ({ name, count: Number(count) }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  const hasData = products.length > 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Dashboard</h1>
          <p className="text-slate-500 mt-1">Visão geral da saúde do seu estoque.</p>
        </div>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total em Estoque" 
          value={stats.total} 
          icon={Package} 
          color="blue"
        />
        <StatCard 
          title="Produtos Vencidos" 
          value={stats.expired} 
          icon={AlertCircle} 
          color="red"
          alert={stats.expired > 0}
        />
        <StatCard 
          title="Próx. Vencimento" 
          value={stats.warning} 
          icon={Clock} 
          color="amber"
          alert={stats.warning > 0}
        />
        <StatCard 
          title="Estoque Regular" 
          value={stats.good} 
          icon={CheckCircle} 
          color="emerald"
        />
      </div>

      {hasData ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Chart 1 */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-6">
              <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                <PieChart size={20} />
              </div>
              <h3 className="font-bold text-slate-800 text-lg">Distribuição de Validade</h3>
            </div>
            
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
                    itemStyle={{ color: '#1e293b', fontWeight: 600 }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2 */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col hover:shadow-md transition-shadow">
             <div className="flex items-center gap-2 mb-6">
              <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                <BarChart3 size={20} />
              </div>
              <h3 className="font-bold text-slate-800 text-lg">Top Categorias</h3>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} layout="vertical" margin={{ left: 10, right: 30, top: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    width={100} 
                    tick={{ fontSize: 12, fill: '#64748b', fontWeight: 500 }} 
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip 
                     cursor={{ fill: '#f8fafc' }}
                     contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="count" fill="#3b82f6" radius={[0, 6, 6, 0]} barSize={20}>
                    {barData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#4f46e5' : '#6366f1'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 border-dashed">
          <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package className="text-slate-300" size={40} />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Seu estoque está vazio</h3>
          <p className="text-slate-500 max-w-sm mx-auto">
            Cadastre seus primeiros produtos na aba "Estoque" para visualizar as métricas e análises.
          </p>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, color, alert }: any) => {
  const colorMap: any = {
    blue: "bg-blue-500 from-blue-500 to-blue-600 shadow-blue-200 text-blue-600 bg-blue-50",
    red: "bg-red-500 from-red-500 to-red-600 shadow-red-200 text-red-600 bg-red-50",
    amber: "bg-amber-500 from-amber-500 to-amber-600 shadow-amber-200 text-amber-600 bg-amber-50",
    emerald: "bg-emerald-500 from-emerald-500 to-emerald-600 shadow-emerald-200 text-emerald-600 bg-emerald-50",
  };

  const styles = colorMap[color] || colorMap.blue;

  return (
    <div className={`bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${alert ? 'ring-2 ring-red-100' : ''}`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{title}</p>
          <h4 className="text-3xl font-extrabold text-slate-800">{value}</h4>
        </div>
        <div className={`p-3 rounded-xl ${styles.split(' ').slice(3).join(' ')}`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
};