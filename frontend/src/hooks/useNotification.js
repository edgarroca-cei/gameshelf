// ========================================================================
// HOOK PARA NOTIFICACIONES CON ESTILO PERSONALIZADO
// ========================================================================

// Hook personalizado que facilita mostrar notificaciones bonitas en la app
// Usa Mantine notifications con estilo glassmorphism personalizado

import { useCallback } from 'react';
import { notifications } from '@mantine/notifications';

// ========================================================================
// FUNCIONES DE NOTIFICACIÓN
// ========================================================================

export const useNotification = () => {
  const success = useCallback((title, message) => {
    notifications.show({
      title,
      message,
      color: 'green',
      icon: '✓',
      autoClose: 3000,
      radius: 'xl',
      style: {
        borderRadius: '24px',
        border: '2px solid rgb(34, 139, 34)',
        backgroundColor: '#ffffff',
        color: '#212529',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 8px 32px rgba(34, 139, 34, 0.2)',
      }
    });
  }, []);

  const error = useCallback((title, message) => {
    notifications.show({
      title,
      message,
      color: 'red',
      icon: '✕',
      autoClose: 5000,
      radius: 'xl',
      style: {
        borderRadius: '24px',
        border: '2px solid rgb(220, 53, 69)',
        backgroundColor: '#ffffff',
        color: '#212529',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 8px 32px rgba(220, 53, 69, 0.2)',
      }
    });
  }, []);

  const warning = useCallback((title, message) => {
    notifications.show({
      title,
      message,
      color: 'yellow',
      icon: '!',
      autoClose: 4000,
      radius: 'xl',
      style: {
        borderRadius: '24px',
        border: '2px solid rgb(255, 193, 7)',
        backgroundColor: '#ffffff',
        color: '#212529',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 8px 32px rgba(255, 193, 7, 0.2)',
      }
    });
  }, []);

  const info = useCallback((title, message) => {
    notifications.show({
      title,
      message,
      color: 'blue',
      icon: 'ℹ',
      autoClose: 3000,
      radius: 'xl',
      style: {
        borderRadius: '24px',
        border: '2px solid rgb(65, 105, 225)',
        backgroundColor: '#ffffff',
        color: '#212529',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 8px 32px rgba(65, 105, 225, 0.2)',
      }
    });
  }, []);

  return {
    success,
    error,
    warning,
    info,
  };
};
