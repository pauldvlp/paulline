import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './index.css';

const ROOT_ELEMENT_ID = 'root';

const container = document.getElementById(ROOT_ELEMENT_ID);

if (!container) {
  throw new Error(`Root element #${ROOT_ELEMENT_ID} not found`);
}

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
