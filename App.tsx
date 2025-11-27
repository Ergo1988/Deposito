import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Inventory } from './pages/Inventory';
import { AIAdvisor } from './pages/AIAdvisor';
import { Product, ProductCategory } from './types';

// Mock data to initialize if empty
const INITIAL_DATA: Product[] = [
  { id: '1', name: 'Whey Gold Standard', brand: 'Optimum', category: ProductCategory.WHEY_PROTEIN, quantity: 12, batchNumber: 'L882', expirationDate: new Date(Date.now() - 86400000 * 5).toISOString().split('T')[0] }, // Expired
  { id: '2', name: 'Creatina Monohidratada', brand: 'Growth', category: ProductCategory.CREATINE, quantity: 45, batchNumber: 'L991', expirationDate: new Date(Date.now() + 86400000 * 15).toISOString().split('T')[0] }, // Warning
  { id: '3', name: 'Multivitamínico Daily', brand: 'Max Titanium', category: ProductCategory.VITAMINS, quantity: 30, batchNumber: 'L102', expirationDate: new Date(Date.now() + 86400000 * 180).toISOString().split('T')[0] }, // Good
  { id: '4', name: 'BCAA 2400', brand: 'Probiótica', category: ProductCategory.AMINOACIDS, quantity: 8, batchNumber: 'L332', expirationDate: new Date(Date.now() + 86400000 * 45).toISOString().split('T')[0] }, // Warning
  { id: '5', name: 'C4 Beta Pump', brand: 'New Millen', category: ProductCategory.PRE_WORKOUT, quantity: 20, batchNumber: 'L551', expirationDate: new Date(Date.now() + 86400000 * 300).toISOString().split('T')[0] }, // Good
];

const App: React.FC = () => {
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('supplecontrol_inventory');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_DATA;
      }
    }
    return INITIAL_DATA;
  });

  useEffect(() => {
    localStorage.setItem('supplecontrol_inventory', JSON.stringify(products));
  }, [products]);

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard products={products} />} />
          <Route path="/inventory" element={<Inventory products={products} setProducts={setProducts} />} />
          <Route path="/advisor" element={<AIAdvisor products={products} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;