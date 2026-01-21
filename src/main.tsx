import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ErrorBoundary, I18nProvider } from '@/modules/ui';
import App from './App';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <I18nProvider>
        <App />
      </I18nProvider>
    </ErrorBoundary>
  </StrictMode>,
);
