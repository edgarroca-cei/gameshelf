// ========================================================================
// COMPONENTE PRINCIPAL DE LA APLICACIÓN - VERSIÓN SIMPLIFICADA
// ========================================================================

// Importamos las librerías de React Router para el enrutamiento
import { Routes, Route, Navigate } from 'react-router-dom';

// Páginas de la aplicación
import { LoginPage } from './pages/LoginPage/LoginPage';
import GameListPage from './pages/GameListPage/GameListPage';

// ========================================================================
// COMPONENTE APP - PUNTO DE ENTRADA PRINCIPAL
// ========================================================================

// Componente principal que configura todo el enrutamiento de la aplicación
// Versión simplificada sin autenticación para diagnosticar problemas
function App() {
  console.log('App: Componente renderizado');

  return (
    <div style={{ padding: '20px' }}>
      <h1>GameShelf - Debug Mode</h1>
      <p>Si ves este mensaje, la aplicación está funcionando.</p>

      {/* Rutas básicas para testing */}
      <Routes>
        <Route path="/" element={<GameListPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}

export default App;
