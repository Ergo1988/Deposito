import { GoogleGenAI, Type } from "@google/genai";
import { Product, ExpiryStatus, AIAnalysisResult } from "../types";

const getExpiryStatus = (dateStr: string): ExpiryStatus => {
  if (!dateStr) return ExpiryStatus.GOOD;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expDate = new Date(dateStr);
  
  // Validation
  if (isNaN(expDate.getTime())) return ExpiryStatus.GOOD;

  const diffTime = expDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return ExpiryStatus.EXPIRED;
  if (diffDays <= 60) return ExpiryStatus.WARNING;
  return ExpiryStatus.GOOD;
};

// Fallback result in case of failure
const FALLBACK_RESULT: AIAnalysisResult = {
  summary: "O Consultor IA está temporariamente indisponível. Verifique sua conexão ou a Chave de API.",
  suggestions: [
    { 
      title: "Análise Manual Recomendada", 
      description: "Identificamos produtos vencidos na lista. Por favor, remova-os manualmente enquanto a IA reconecta.", 
      priority: "high" 
    }
  ]
};

export const analyzeInventory = async (products: Product[]): Promise<AIAnalysisResult> => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      console.warn("API Key is missing");
      return {
        summary: "Chave de API (Gemini) não encontrada.",
        suggestions: [{ title: "Configuração", description: "Adicione a API_KEY ao seu ambiente.", priority: "high" }]
      };
    }

    const ai = new GoogleGenAI({ apiKey });

    // Filter relevant products and sanitize data
    const expiringProducts = products
      .filter(p => p && p.expirationDate) // Safety check
      .map(p => ({
        ...p,
        status: getExpiryStatus(p.expirationDate)
      }))
      .filter(p => p.status !== ExpiryStatus.GOOD);

    if (expiringProducts.length === 0) {
      return {
        summary: "Excelente gestão! Não há produtos vencidos ou em alerta crítico (60 dias) no momento.",
        suggestions: [
          { title: "Manutenção de Estoque", description: "Continue registrando as entradas corretamente.", priority: "low" },
          { title: "Oportunidade de Venda", description: "Foque em campanhas para produtos com maior margem de lucro.", priority: "medium" }
        ]
      };
    }

    // Prepare payload (limited size)
    const inventorySummary = JSON.stringify(expiringProducts.slice(0, 25).map(p => ({
      item: p.name,
      qty: p.quantity,
      days: Math.ceil((new Date(p.expirationDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24)),
      status: p.status
    })));

    const prompt = `
      Analise este estoque de suplementos (JSON): ${inventorySummary}
      
      Gere um JSON com:
      1. 'summary': Resumo curto da situação (1 frase).
      2. 'suggestions': Lista de 3 ações práticas.
         - 'priority': 'high' (vencidos), 'medium' (vencem logo), 'low'.
         - 'title': Ação curta (ex: "Liquidar Whey").
         - 'description': Detalhe da ação.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            suggestions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  priority: { type: Type.STRING, enum: ["high", "medium", "low"] }
                }
              }
            }
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("Empty response");

    // Robust parsing: clean potential markdown code blocks if the model ignores MIME type
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanText) as AIAnalysisResult;

  } catch (error) {
    console.error("Gemini Error:", error);
    return FALLBACK_RESULT;
  }
};