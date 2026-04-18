import React from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import './index.css';
import { AuthProvider } from './auth/AuthProvider.jsx';
import NazmFullSystem from './NazmFullSystem.jsx';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <HashRouter>
        <NazmFullSystem />
      </HashRouter>
    </AuthProvider>
  </React.StrictMode>
);
