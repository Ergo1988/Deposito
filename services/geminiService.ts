import { GoogleGenAI, Type } from "@google/genai";
import { Product, ExpiryStatus, AIAnalysisResult } from "../types";

const getExpiryStatus = (dateStr: string): ExpiryStatus => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expDate = new Date(dateStr);
  const diffTime = expDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return ExpiryStatus.EXPIRED;
  if (diffDays <= 60) return ExpiryStatus.WARNING; // 60 days threshold for supplements
  return ExpiryStatus.GOOD;
};

export const analyzeInventory = async (products: Product[]): Promise<AIAnalysisResult> => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new Error("API Key not found");
    }

    const ai = new GoogleGenAI({ apiKey });

    // Filter relevant products to save tokens and focus context
    const expiringProducts = products
      .map(p => ({
        ...p,
        status: getExpiryStatus(p.expirationDate)
      }))
      .filter(p => p.status !== ExpiryStatus.GOOD);

    const inventorySummary = JSON.stringify(expiringProducts.map(p => ({
      item: p.name,
      qty: p.quantity,
      expires: p.expirationDate,
      status: p.status
    })));

    const prompt = `
      Você é um gerente especialista em loja de suplementos.
      Analise o JSON abaixo contendo produtos vencidos ou próximos do vencimento.
      
      Dados: ${inventorySummary}
      
      Gere um plano de ação em PT-BR.
      - Para status 'WARNING', sugira promoções agressivas.
      - Para status 'EXPIRED', sugira descarte ou logística reversa.
      - Responda estritamente no formato JSON.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING, description: "Resumo executivo da situação." },
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
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as AIAnalysisResult;

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return {
      summary: "Não foi possível analisar o estoque no momento.",
      suggestions: [{ title: "Erro de Conexão", description: "Verifique sua chave de API e conexão.", priority: "high" }]
    };
  }
};