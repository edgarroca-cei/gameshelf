// Importa los estilos globales de Mantine PRIMERO
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import './index.css';

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { theme } from './theme'; // Importamos nuestro tema personalizado
import { AuthProvider } from './hooks/useAuth.jsx';
import App from './App';


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      {/* MantineProvider ahora usa nuestro tema personalizado */}
      <MantineProvider theme={theme}>
        <Notifications />
        <AuthProvider>
          <App />
        </AuthProvider>
      </MantineProvider>
    </BrowserRouter>
  </React.StrictMode>,
);