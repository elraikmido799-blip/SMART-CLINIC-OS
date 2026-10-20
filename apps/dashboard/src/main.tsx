import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from '@tanstack/react-router';
import '@fontsource-variable/inter';
import '@fontsource/ibm-plex-sans-arabic/400.css';
import '@fontsource/ibm-plex-sans-arabic/500.css';
import '@fontsource/ibm-plex-sans-arabic/600.css';
import '@fontsource/ibm-plex-sans-arabic/700.css';
import 'antd/dist/reset.css';
import './app/global.css';
import './app/i18n';
import { Providers } from './app/providers';
import { router } from './app/router';
import { registerServiceWorker } from './lib/register-sw';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Providers>
      <RouterProvider router={router} />
    </Providers>
  </StrictMode>,
);

registerServiceWorker();
