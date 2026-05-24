// main.jsx - Versión moderna y correcta
// ❌ ELIMINADO: import React from "react";
// ✅ CORREGIDO: imports unificados y limpios
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import './index.css';

// ✅ Usando createRoot directamente (forma moderna)
createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <AuthProvider>
      <App />
    </AuthProvider>
  </BrowserRouter>
);