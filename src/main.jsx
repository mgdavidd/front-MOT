// main.jsx
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { getUserTheme } from './utils/initUserTheme.js';

const userColor = getUserTheme();

if (userColor) {
  document.documentElement.style.setProperty('--color-primary', userColor);
}

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);