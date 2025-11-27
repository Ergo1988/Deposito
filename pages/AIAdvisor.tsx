import React, { useState } from 'react';
import { Sparkles, TrendingDown, Tag, AlertOctagon, Lightbulb } from 'lucide-react';
import { Product, AIAnalysisResult } from '../types';
import { analyzeInventory } from '../services/geminiService';

interface AIAdvisorProps {
  products: Product[];
}

export const AIAdvisor: React.FC<AIAdvisorProps> = ({ products }) => {
  const [analysis, setAnalysis] = useState<AIAnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const result = await analyzeInventory(products);
      setAnalysis(result);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      <div className="text-center space-y-6 py-10 bg-white rounded-3xl shadow-sm border border-slate-100">
        <div className="inline-flex items-center justify-center p-4 bg-indigo-50 rounded-2xl text-indigo-600 mb-2 shadow-inner">
          <Sparkles size={40} className="animate-pulse" />
        </div>
        <div className="max-w-2xl mx-auto px-4">
          <h1 className="text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">Consultor Inteligente</h1>
          <p className="text-slate-500 mt-4 text-lg leading-relaxed">
            Nossa IA analisa seu estoque em tempo real para identificar riscos de vencimento e sugerir estratégias de venda para maximizar seu lucro.
          </p>
        </div>
        
        <button
          onClick={handleAnalyze}
          disabled={loading}
          className={`
            mt-8 px-8 py-4 rounded-full font-bold text-white shadow-xl shadow-indigo-500/20 transition-all duration-300
            flex items-center gap-3 mx-auto text-lg
            ${loading ? 'bg-indigo-400 cursor-not-allowed scale-95' : 'bg-indigo-600 hover:bg-indigo-700 hover:scale-105 active:scale-95'}
          `}
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Processando dados...</span>
            </>
          ) : (
            <>
              <Lightbulb size={22} fill="currentColor" className="text-indigo-200" />
              <span>Gerar Plano de Ação</span>
            </>
          )}
        </button>
      </div>

      {analysis && (
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-8">
          {/* Summary Card */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-700 p-8 rounded-3xl shadow-xl text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
            <h3 className="text-xl font-bold mb-3 flex items-center gap-2 relative z-10">
              <Sparkles size={20} className="text-yellow-300" />
              Resumo Executivo
            </h3>
            <p className="text-indigo-50 text-lg leading-relaxed relative z-10 font-light">
              {analysis.summary}
            </p>
          </div>

          <div className="grid gap-6">
            <h3 className="text-xl font-bold text-slate-800 ml-2">Sugestões Táticas</h3>
            {analysis.suggestions.map((suggestion, idx) => {
              let Icon = Tag;
              let colors = "bg-blue-50 text-blue-700 border-blue-100 ring-blue-500/20";
              let badgeColor = "bg-blue-100 text-blue-800";

              if (suggestion.priority === 'high') {
                Icon = AlertOctagon;
                colors = "bg-red-50 text-red-700 border-red-100 ring-red-500/20";
                badgeColor = "bg-red-100 text-red-800";
              } else if (suggestion.priority === 'medium') {
                Icon = TrendingDown;
                colors = "bg-amber-50 text-amber-700 border-amber-100 ring-amber-500/20";
                badgeColor = "bg-amber-100 text-amber-800";
              }

              return (
                <div 
                  key={idx} 
                  className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col sm:flex-row gap-6 group"
                >
                  <div className={`p-4 rounded-xl h-fit w-fit ${colors} group-hover:scale-110 transition-transform duration-300`}>
                    <Icon size={28} />
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center justify-between mb-2 gap-2">
                      <h4 className="font-bold text-slate-800 text-lg group-hover:text-indigo-600 transition-colors">
                        {suggestion.title}
                      </h4>
                      <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${badgeColor}`}>
                        {suggestion.priority === 'high' ? 'Alta Prioridade' : suggestion.priority === 'medium' ? 'Média Prioridade' : 'Baixa Prioridade'}
                      </span>
                    </div>
                    <p className="text-slate-600 leading-relaxed text-base">
                      {suggestion.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};