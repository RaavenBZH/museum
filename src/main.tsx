import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { App } from './App';
import { ThemeProvider } from '@/components/theme/ThemeProvider';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Missing #root element: index.html must expose a mount node.');
}

createRoot(rootElement).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
);
