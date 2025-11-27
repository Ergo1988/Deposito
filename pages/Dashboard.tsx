import React, { useMemo } from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend 
} from 'recharts';
import { AlertCircle, CheckCircle, Clock, Package, TrendingUp } from 'lucide-react';
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
      // Robust Date Handling
      const expDate = new Date(p.expirationDate);
      if (isNaN(expDate.getTime())) return; // Skip invalid dates

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
    { name: 'Vencidos', value: stats.expired, color: '#ef4444' }, // Red-500
    { name: 'Alerta (60 dias)', value: stats.warning, color: '#f59e0b' }, // Amber-500
    { name: 'Em dia', value: stats.good, color: '#10b981' }, // Emerald-500
  ].filter(d => d.value > 0);

  const barData = Object.entries(stats.categoryCount)
    .map(([name, count]) => ({ name, count: Number(count) }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  const hasData = products.length > 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Visão Geral</h1>
        <p className="text-slate-500">Acompanhe as métricas principais do seu estoque.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total em Estoque" 
          value={stats.total} 
          icon={Package} 
          colorClass="bg-blue-500" 
          gradient="from-blue-500 to-blue-600"
          shadow="shadow-blue-500/20"
        />
        <StatCard 
          title="Vencidos" 
          value={stats.expired} 
          icon={AlertCircle} 
          colorClass="bg-red-500"
          gradient="from-red-500 to-red-600"
          shadow="shadow-red-500/20"
        />
        <StatCard 
          title="Vencem em Breve" 
          value={stats.warning} 
          icon={Clock} 
          colorClass="bg-amber-500"
          gradient="from-amber-500 to-amber-600"
          shadow="shadow-amber-500/20"
        />
        <StatCard 
          title="Regulares" 
          value={stats.good} 
          icon={CheckCircle} 
          colorClass="bg-emerald-500"
          gradient="from-emerald-500 to-emerald-600"
          shadow="shadow-emerald-500/20"
        />
      </div>

      {hasData ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Chart 1: Status Distribution */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <div className="w-1 h-6 bg-indigo-500 rounded-full"></div>
                Saúde do Estoque
              </h3>
            </div>
            <div className="h-72 w-full flex-1 min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={95}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle"/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Categories */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <div className="w-1 h-6 bg-emerald-500 rounded-full"></div>
                Por Categoria
              </h3>
            </div>
            <div className="h-72 w-full flex-1 min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} layout="vertical" margin={{ left: 10, right: 30, top: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    width={110} 
                    tick={{ fontSize: 12, fill: '#64748b', fontWeight: 500 }} 
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="count" fill="#3b82f6" radius={[0, 6, 6, 0]} barSize={24}>
                    {barData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#3b82f6' : '#60a5fa'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 border-dashed">
          <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="text-slate-400" size={32} />
          </div>
          <h3 className="text-lg font-medium text-slate-800">Sem dados para exibir</h3>
          <p className="text-slate-500 mt-1">Cadastre produtos no estoque para ver as estatísticas.</p>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, gradient, shadow, subtext }: any) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
    <div className="relative z-10 flex justify-between items-start">
      <div>
        <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">{title}</p>
        <h4 className="text-3xl font-bold text-slate-800 mt-2">{value}</h4>
      </div>
      <div className={`bg-gradient-to-br ${gradient} p-3 rounded-xl text-white ${shadow} shadow-lg`}>
        <Icon size={22} />
      </div>
    </div>
    {/* Decorative circle */}
    <div className={`absolute -bottom-4 -right-4 w-24 h-24 rounded-full bg-gradient-to-br ${gradient} opacity-5 group-hover:opacity-10 transition-opacity`}></div>
  </div>
);