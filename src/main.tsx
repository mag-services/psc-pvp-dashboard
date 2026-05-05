import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { applyHighchartsTheme } from './lib/chartTheme';
import './index.css';

applyHighchartsTheme();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
