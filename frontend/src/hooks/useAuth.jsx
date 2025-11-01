// ========================================================================
// HOOK PERSONALIZADO PARA AUTENTICACIÓN DE USUARIOS
// ========================================================================

// Importamos las funciones necesarias de React y los servicios
import { useState, useEffect, useCallback, useContext, createContext } from 'react';
import { registerUser, loginUser, getProfile } from '../services/api.service';

// ========================================================================
// CONTEXTO DE AUTENTICACIÓN
// ========================================================================

// Creamos un contexto para compartir el estado de autenticación en toda la app
const AuthContext = createContext();

// Hook personalizado que permite acceder al contexto de autenticación
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};

// ========================================================================
// PROVIDER DE AUTENTICACIÓN
// ========================================================================

// Componente que provee el contexto de autenticación a toda la aplicación
export const AuthProvider = ({ children }) => {
  // ========================================================================
  // ESTADO LOCAL DEL PROVIDER
  // ========================================================================

  // Estado del usuario actualmente logueado
  const [usuario, setUsuario] = useState(null);
  // Token JWT para autenticación en las APIs
  const [token, setToken] = useState(null);
  // Bandera para indicar si se está cargando la autenticación inicial
  const [cargando, setCargando] = useState(true);
  // Estado para manejar errores de autenticación
  const [error, setError] = useState(null);

  // ========================================================================
  // EFECTO PARA CARGAR SESIÓN AL INICIAR LA APP
  // ========================================================================

  // Al cargar la aplicación, intentamos restaurar la sesión desde localStorage
  useEffect(() => {
    const tokenGuardado = localStorage.getItem('token');

    async function cargarUsuario() {
      if (tokenGuardado) {
        try {
          // Tenemos un token, así que lo usamos para obtener el perfil fresco
          const response = await getProfile();
          const usuarioActual = response.data.usuario;

          // Sincronizamos el estado y el localStorage con los datos frescos
          localStorage.setItem('usuario', JSON.stringify(usuarioActual));
          setUsuario(usuarioActual);
          setToken(tokenGuardado); // También establecemos el token en el estado

        } catch (error) {
          console.error('Token guardado inválido. Limpiando sesión.', error);
          // Si el token es inválido, limpiamos todo
          localStorage.removeItem('token');
          localStorage.removeItem('usuario');
          setToken(null);
          setUsuario(null);
        }
      }
      // Terminamos la carga inicial solo después de intentar obtener el usuario
      setCargando(false);
    }

    cargarUsuario();
  }, []);

  // ========================================================================
  // FUNCIONES DE AUTENTICACIÓN
  // ========================================================================

  // Función para registrar un nuevo usuario en el sistema
  const registro = useCallback(async (username, email, password, passwordConfirm) => {
    try {
      // Limpiar errores previos
      setError(null);

      // Llamar al API de registro
      const response = await registerUser({ username, email, password, passwordConfirm });
      const { token: nuevoToken, usuario: nuevoUsuario } = response.data;

      // Persistir la sesión en localStorage
      localStorage.setItem('token', nuevoToken);
      localStorage.setItem('usuario', JSON.stringify(nuevoUsuario));

      // Actualizar el estado global
      setToken(nuevoToken);
      setUsuario(nuevoUsuario);

      return { success: true, usuario: nuevoUsuario };
    } catch (err) {
      const mensaje = err.response?.data?.message || 'Error en el registro';
      setError(mensaje);
      return { success: false, error: mensaje };
    }
  }, []);

  // Función para iniciar sesión en la aplicación
  const login = useCallback(async (email, password) => {
    try {
      // Limpiar errores previos y mostrar logs de debug
      setError(null);
      console.log('useAuth: Intentando login con:', { email, password });

      // Usamos fetch directo para evitar problemas con el servicio de API
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
      console.log('useAuth: API URL configurada:', API_URL);

      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      console.log('useAuth: Respuesta del servidor:', response.status);
      const data = await response.json();
      console.log('useAuth: Datos recibidos:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Error en el login');
      }

      const { token: nuevoToken, usuario: nuevoUsuario } = data;

      // Guardar la sesión en el navegador
      localStorage.setItem('token', nuevoToken);
      localStorage.setItem('usuario', JSON.stringify(nuevoUsuario));

      // Actualizar el estado global del contexto
      setToken(nuevoToken);
      setUsuario(nuevoUsuario);

      return { success: true, usuario: nuevoUsuario };
    } catch (err) {
      console.error('useAuth: Falló el login:', err);
      const mensaje = err.message || 'Error en el login';
      setError(mensaje);
      return { success: false, error: mensaje };
    }
  }, []);

  // Función para cerrar sesión y limpiar datos
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setToken(null);
    setUsuario(null);
    setError(null);
  }, []);

  // Función para refrescar los datos del perfil actual
  const obtenerPerfil = useCallback(async () => {
    try {
      setError(null);
      const response = await getProfile();
      const nuevoUsuario = response.data.usuario;

      // Sincronizar con localStorage
      localStorage.setItem('usuario', JSON.stringify(nuevoUsuario));

      // Actualizar el estado del usuario
      setUsuario(nuevoUsuario);

      return { success: true, usuario: nuevoUsuario };
    } catch (err) {
      const mensaje = err.response?.data?.message || 'Error al obtener perfil';
      setError(mensaje);
      return { success: false, error: mensaje };
    }
  }, []);

  // ========================================================================
  // VALORES COMPUTADOS Y EXPORTS
  // ========================================================================

  // Computed: verificar si el usuario está autenticado
  const estaAutenticado = !!token && !!usuario;

  // Objeto que contiene todos los valores que expone el contexto
  const value = {
    usuario,
    token,
    cargando,
    error,
    estaAutenticado,
    registro,
    login,
    logout,
    obtenerPerfil,
    setError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
