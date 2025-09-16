import React from 'react';
import ReactDOM from 'react-dom/client';

import './index.css';
import App from './app/App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// keep your SW registration if you added it earlier
if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/sw.js')
    .then(() => {
      // listen for messages from sw
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'NEW_VERSION_AVAILABLE') {
          // custom event to notify the app
          window.location.reload();
        }
      });
    })
    .catch(() => {
      // optional: handle registration failure
      console.warn('Service worker registration failed');
    });
}
