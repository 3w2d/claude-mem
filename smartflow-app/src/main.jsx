import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import NazmFullSystem from './NazmFullSystem.jsx';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <NazmFullSystem />
  </React.StrictMode>
);
