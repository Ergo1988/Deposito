export enum ProductCategory {
  WHEY_PROTEIN = 'Whey Protein',
  CREATINE = 'Creatina',
  PRE_WORKOUT = 'Pré-Treino',
  VITAMINS = 'Vitaminas',
  AMINOACIDS = 'Aminoácidos',
  ACCESSORIES = 'Acessórios',
  BARS = 'Barras de Proteína',
  OTHER = 'Outros'
}

export enum ExpiryStatus {
  GOOD = 'GOOD',
  WARNING = 'WARNING',
  EXPIRED = 'EXPIRED'
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: ProductCategory;
  batchNumber: string;
  quantity: number;
  expirationDate: string; // ISO String YYYY-MM-DD
}

export interface AIAnalysisResult {
  summary: string;
  suggestions: {
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
  }[];
}