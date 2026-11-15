import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import './index.css';
import { App } from './App';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import { DiscoveryProvider } from '@/hooks/DiscoveryProvider';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Missing #root element: index.html must expose a mount node.');
}

/**
 * The discovery run sits above the router on purpose: leaving Discover for
 * another screen and coming back must find the artwork that was on show, not
 * a new draw and not a new call to the museum.
 */
createRoot(rootElement).render(
  <StrictMode>
    <ThemeProvider>
      <BrowserRouter>
        <DiscoveryProvider>
          <App />
        </DiscoveryProvider>
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>,
);
