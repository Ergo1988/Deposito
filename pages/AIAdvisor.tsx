import React, { useState } from 'react';
import { Sparkles, ArrowRight, TrendingDown, Tag, AlertOctagon } from 'lucide-react';
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center p-3 bg-indigo-100 rounded-full text-indigo-600 mb-2">
          <Sparkles size={32} />
        </div>
        <h1 className="text-3xl font-bold text-slate-900">Consultor Inteligente</h1>
        <p className="text-slate-500 max-w-xl mx-auto">
          Utilize a inteligência artificial do Gemini para analisar seu estoque prestes a vencer e receba sugestões de promoções para evitar prejuízos.
        </p>
        
        <button
          onClick={handleAnalyze}
          disabled={loading}
          className={`
            mt-6 px-8 py-3 rounded-full font-semibold text-white shadow-lg shadow-indigo-500/30 transition-all
            flex items-center gap-2 mx-auto
            ${loading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 hover:scale-105'}
          `}
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Analisando...
            </>
          ) : (
            <>
              <Sparkles size={20} />
              Gerar Relatório Estratégico
            </>
          )}
        </button>
      </div>

      {analysis && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
          {/* Summary Card */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 border-l-4 border-l-indigo-500">
            <h3 className="text-lg font-bold text-slate-800 mb-2">Resumo da Análise</h3>
            <p className="text-slate-600 leading-relaxed">{analysis.summary}</p>
          </div>

          <div className="grid gap-4">
            {analysis.suggestions.map((suggestion, idx) => {
              let Icon = Tag;
              let colorClass = "bg-blue-50 text-blue-700 border-blue-200";

              if (suggestion.priority === 'high') {
                Icon = AlertOctagon;
                colorClass = "bg-red-50 text-red-700 border-red-200";
              } else if (suggestion.priority === 'medium') {
                Icon = TrendingDown;
                colorClass = "bg-amber-50 text-amber-700 border-amber-200";
              }

              return (
                <div key={idx} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex gap-4">
                  <div className={`p-3 rounded-lg h-fit ${colorClass}`}>
                    <Icon size={24} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-bold text-slate-800 text-lg">{suggestion.title}</h4>
                      <span className={`text-xs font-bold px-2 py-1 rounded uppercase tracking-wide ${
                        suggestion.priority === 'high' ? 'bg-red-100 text-red-800' :
                        suggestion.priority === 'medium' ? 'bg-amber-100 text-amber-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        Prioridade {suggestion.priority === 'high' ? 'Alta' : suggestion.priority === 'medium' ? 'Média' : 'Baixa'}
                      </span>
                    </div>
                    <p className="text-slate-600">{suggestion.description}</p>
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