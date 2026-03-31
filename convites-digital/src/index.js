import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/global.css';
import App from './App';

// Suprimir erros de media abortados pelo browser (comportamento normal ao navegar entre slides)
window.addEventListener("error", (e) => {
  if (e.target && (e.target.tagName === "AUDIO" || e.target.tagName === "VIDEO")) {
    e.stopPropagation();
    e.preventDefault();
  }
}, true);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
