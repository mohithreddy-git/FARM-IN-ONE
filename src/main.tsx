import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './i18n/config';
import './index.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => undefined);
  });
}

if ('serviceWorker' in navigator && import.meta.env.DEV) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((registration) => void registration.unregister());
    });
    caches.keys().then((keys) => {
      keys.forEach((key) => void caches.delete(key));
    });
  });
}
