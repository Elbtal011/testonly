import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { earlyInitMetadata } from './utils/templateMetadata';

// Initialize metadata immediately to prevent flashing
earlyInitMetadata();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
