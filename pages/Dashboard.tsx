import React, { useMemo } from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend 
} from 'recharts';
import { AlertCircle, CheckCircle, Clock, Package } from 'lucide-react';
import { Product, ExpiryStatus } from '../types';

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
      const expDate = new Date(p.expirationDate);
      const diffTime = expDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays < 0) expired++;
      else if (diffDays <= 60) warning++;
      else good++;

      categoryCount[p.category] = (categoryCount[p.category] || 0) + 1;
    });

    return { expired, warning, good, total: products.length, categoryCount };
  }, [products]);

  const pieData = [
    { name: 'Vencidos', value: stats.expired, color: '#ef4444' }, // Red
    { name: 'Alerta (60 dias)', value: stats.warning, color: '#f59e0b' }, // Amber
    { name: 'Em dia', value: stats.good, color: '#10b981' }, // Emerald
  ].filter(d => d.value > 0);

  const barData = Object.entries(stats.categoryCount)
    .map(([name, count]) => ({ name, count: Number(count) }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total em Estoque" 
          value={stats.total} 
          icon={Package} 
          color="bg-blue-500" 
          subtext="Produtos cadastrados"
        />
        <StatCard 
          title="Vencidos" 
          value={stats.expired} 
          icon={AlertCircle} 
          color="bg-red-500" 
          subtext="Necessitam descarte"
        />
        <StatCard 
          title="Vencem em Breve" 
          value={stats.warning} 
          icon={Clock} 
          color="bg-amber-500" 
          subtext="Próximos 60 dias"
        />
        <StatCard 
          title="Regulares" 
          value={stats.good} 
          icon={CheckCircle} 
          color="bg-emerald-500" 
          subtext="Validade segura"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Status Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Saúde do Estoque</h3>
          <div className="h-64 w-full">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400">
                Sem dados suficientes
              </div>
            )}
          </div>
        </div>

        {/* Chart 2: Categories */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Principais Categorias</h3>
          <div className="h-64 w-full">
            {barData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} layout="vertical" margin={{ left: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <Tooltip 
                    cursor={{ fill: '#f1f5f9' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400">
                Sem dados suficientes
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, color, subtext }: any) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-start justify-between">
    <div>
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <h4 className="text-2xl font-bold text-slate-800 mt-1">{value}</h4>
      <p className="text-xs text-slate-400 mt-1">{subtext}</p>
    </div>
    <div className={`${color} p-3 rounded-lg text-white shadow-lg shadow-opacity-20 opacity-90`}>
      <Icon size={20} />
    </div>
  </div>
);