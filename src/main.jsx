import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import './index.css';
import App from './App.jsx';

registerSW({
  immediate: true,
  onRegisteredSW(swUrl) {
    console.info('[OmniWatch PWA] Service Worker registered:', swUrl);
  },
  onOfflineReady() {
    console.info('[OmniWatch PWA] App ready to work offline');
  },
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
