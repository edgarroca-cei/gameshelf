/**
 * Componente ProtectedRoute
 * Protege rutas que requieren autenticación
 * Redirige a login si el usuario no está autenticado
 */

import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.jsx';
import { Loader } from '@mantine/core';

export const ProtectedRoute = ({ children }) => {
  const { estaAutenticado, cargando } = useAuth();

  if (cargando) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Loader />
      </div>
    );
  }

  if (!estaAutenticado) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

