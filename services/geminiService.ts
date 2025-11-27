import { GoogleGenAI, Type } from "@google/genai";
import { Product, ExpiryStatus, AIAnalysisResult } from "../types";

const getExpiryStatus = (dateStr: string): ExpiryStatus => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expDate = new Date(dateStr);
  const diffTime = expDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return ExpiryStatus.EXPIRED;
  if (diffDays <= 60) return ExpiryStatus.WARNING;
  return ExpiryStatus.GOOD;
};

// Fallback result in case of failure
const FALLBACK_RESULT: AIAnalysisResult = {
  summary: "Não foi possível conectar ao servidor de IA no momento. Por favor, verifique se existem produtos próximos do vencimento manualmente.",
  suggestions: [
    { 
      title: "Verificação Manual Necessária", 
      description: "O sistema de IA está temporariamente indisponível. Recomendamos focar nos produtos marcados em vermelho na lista de estoque.", 
      priority: "high" 
    }
  ]
};

export const analyzeInventory = async (products: Product[]): Promise<AIAnalysisResult> => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      console.warn("API Key is missing for Gemini Service");
      return {
        summary: "Chave de API não configurada. O Consultor IA precisa de uma chave válida para funcionar.",
        suggestions: [{ title: "Configuração Necessária", description: "Adicione sua API Key no arquivo .env ou nas configurações do sistema.", priority: "high" }]
      };
    }

    const ai = new GoogleGenAI({ apiKey });

    // Filter relevant products
    const expiringProducts = products
      .map(p => ({
        ...p,
        status: getExpiryStatus(p.expirationDate)
      }))
      .filter(p => p.status !== ExpiryStatus.GOOD);

    if (expiringProducts.length === 0) {
      return {
        summary: "Seu estoque está em excelente estado! Não detectamos produtos vencidos ou próximos do vencimento (60 dias).",
        suggestions: [
          { title: "Manter Monitoramento", description: "Continue cadastrando novos lotes para manter a saúde do estoque.", priority: "low" },
          { title: "Foco em Vendas", description: "Como não há perdas iminentes, foque em marketing para seus produtos best-sellers.", priority: "medium" }
        ]
      };
    }

    // Limit the payload to prevent token overflow
    const inventorySummary = JSON.stringify(expiringProducts.slice(0, 30).map(p => ({
      item: p.name,
      brand: p.brand,
      qty: p.quantity,
      expires: p.expirationDate,
      status: p.status
    })));

    const prompt = `
      Atue como um gerente de loja de suplementos experiente.
      Analise a lista JSON de produtos com problemas de validade:
      ${inventorySummary}
      
      Gere um plano de ação tático em JSON.
      Responda APENAS JSON válido.
      Idioma: Português Brasileiro (PT-BR).
      
      Diretrizes:
      1. Para 'WARNING' (vence < 60 dias): Sugira bundles, descontos progressivos ou brindes.
      2. Para 'EXPIRED': Sugira descarte ecológico ou contato com fornecedor para troca.
      3. Seja específico citando os nomes dos produtos.
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
    if (!text) throw new Error("Empty response from AI");
    
    return JSON.parse(text) as AIAnalysisResult;

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return FALLBACK_RESULT;
  }
};