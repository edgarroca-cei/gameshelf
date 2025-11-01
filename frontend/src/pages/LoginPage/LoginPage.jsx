// ========================================================================
// PÁGINA DE INICIO DE SESIÓN
// ========================================================================

// Página de autenticación con formulario y recuperación de contraseña

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Loader, Modal, TextInput, Button, Text } from '@mantine/core';
import { IconAlertCircle, IconMail, IconCheck } from '@tabler/icons-react';
import { useAuth } from '../../hooks/useAuth.jsx';
import styles from './LoginPage.module.css';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login, error, setError } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cargando, setCargando] = useState(false);
  const [erroresValidacion, setErroresValidacion] = useState({});

  // Estados para el modal de recuperación de contraseña
  const [modalAbierto, setModalAbierto] = useState(false);
  const [emailRecuperacion, setEmailRecuperacion] = useState('');
  const [enviado, setEnviado] = useState(false);
  const [cargandoRecuperacion, setCargandoRecuperacion] = useState(false);

  const validarFormulario = () => {
    const errores = {};

    if (!email) {
      errores.email = 'El email o nombre de usuario es requerido';
    }

    if (!password) {
      errores.password = 'La contraseña es requerida';
    }

    setErroresValidacion(errores);
    return Object.keys(errores).length === 0;
  };

  const validarEmailRecuperacion = () => {
    if (!emailRecuperacion) {
      return 'El email es requerido';
    } else if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(emailRecuperacion)) {
      return 'Por favor ingresa un email válido';
    }
    return null;
  };

  const manejarRecuperacionPassword = async () => {
    const errorEmail = validarEmailRecuperacion();
    if (errorEmail) {
      return;
    }

    setCargandoRecuperacion(true);

    // Simular envío (en producción real se haría una llamada a la API)
    setTimeout(() => {
      setEnviado(true);
      setCargandoRecuperacion(false);
    }, 1500);
  };

  const abrirModalRecuperacion = () => {
    setModalAbierto(true);
    setEnviado(false);
    setEmailRecuperacion('');
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setEnviado(false);
    setEmailRecuperacion('');
    setCargandoRecuperacion(false);
  };

  const manejarSubmit = async (e) => {
    e.preventDefault();

    if (!validarFormulario()) {
      return;
    }

    setCargando(true);
    setError(null);

    console.log('LoginPage: Iniciando login...');
    const resultado = await login(email, password);
    console.log('LoginPage: Resultado del login:', resultado);

    if (resultado.success) {
      console.log('LoginPage: Login exitoso, redirigiendo...');
      navigate('/');
    } else {
      console.log('LoginPage: Login fallido:', resultado.error);
    }

    setCargando(false);
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.loginWrapper}>
        {/* Sección de imagen */}
        <div className={styles.imageSection}>
          <div className={styles.imagePlaceholder}>🎮</div>
        </div>

        {/* Sección de formulario */}
        <div className={styles.formSection}>
          {/* Header */}
          <div className={styles.header}>
            <h1 className={styles.title}>Bienvenido a GameShelf</h1>
            <p className={styles.subtitle}>Inicia sesión con tu cuenta</p>
          </div>

          {/* Formulario */}
          <form onSubmit={manejarSubmit}>
            {/* Error Alert */}
            {error && (
              <div className={styles.errorAlert}>
                <div className={styles.errorIcon}>
                  <IconAlertCircle size={20} />
                </div>
                <div>{error}</div>
              </div>
            )}

            {/* Email Input */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Usuario o Email</label>
              <input
                type="text"
                className={styles.formInput}
                placeholder="Ingresa tu usuario o email"
                value={email}
                onChange={(e) => {
                  setEmail(e.currentTarget.value);
                  if (erroresValidacion.email) {
                    setErroresValidacion({ ...erroresValidacion, email: '' });
                  }
                }}
                disabled={cargando}
                required
              />
              {erroresValidacion.email && (
                <div style={{ color: '#fca5a5', fontSize: '0.85rem', marginTop: '4px' }}>
                  {erroresValidacion.email}
                </div>
              )}
            </div>

            {/* Password Input */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Contraseña</label>
              <input
                type="password"
                className={styles.formInput}
                placeholder="Ingresa tu contraseña"
                value={password}
                onChange={(e) => {
                  setPassword(e.currentTarget.value);
                  if (erroresValidacion.password) {
                    setErroresValidacion({ ...erroresValidacion, password: '' });
                  }
                }}
                disabled={cargando}
                required
              />
              {erroresValidacion.password && (
                <div style={{ color: '#fca5a5', fontSize: '0.85rem', marginTop: '4px' }}>
                  {erroresValidacion.password}
                </div>
              )}
            </div>

            {/* Forgot Password */}
            <div className={styles.forgotPassword}>
              <button
                type="button"
                className={styles.forgotPasswordLink}
                onClick={abrirModalRecuperacion}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#3b82f6',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  fontSize: '0.875rem'
                }}
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={cargando}
              className={styles.submitButton}
            >
              {cargando ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <Loader size={16} color="white" />
                  Iniciando sesión...
                </span>
              ) : (
                'Iniciar Sesión'
              )}
            </button>
          </form>

          {/* Sign Up Link */}
          <div className={styles.signupLink}>
            ¿No tienes cuenta?{' '}
            <Link to="/register" style={{ textDecoration: 'none' }}>
              Regístrate
            </Link>
          </div>
        </div>
      </div>

      {/* Modal de recuperación de contraseña */}
      <Modal
        opened={modalAbierto}
        onClose={cerrarModal}
        title="Recuperar contraseña"
        centered
        size="md"
        styles={{
          content: {
            background: 'linear-gradient(135deg, #0f0f1e 0%, #1a1a2e 100%)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '8px'
          },
          header: {
            background: 'transparent',
            color: '#ffffff',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '1.5rem',
            borderRadius: '8px 8px 0 0'
          },
          title: {
            color: '#ffffff',
            fontSize: '1.25rem',
            fontWeight: 600
          },
          close: {
            color: '#a0aec0',
            borderRadius: '4px'
          },
          body: {
            padding: '1.5rem',
            background: 'transparent'
          }
        }}
      >
        {!enviado ? (
          <div>
            <Text size="sm" mb="md" style={{ color: '#e2e8f0' }}>
              Introduce tu email y te enviaremos las instrucciones para recuperar tu contraseña.
            </Text>

            <TextInput
              label="Email"
              placeholder="tu@email.com"
              value={emailRecuperacion}
              onChange={(e) => setEmailRecuperacion(e.currentTarget.value)}
              error={validarEmailRecuperacion()}
              required
              styles={{
                input: {
                  background: 'rgba(30, 30, 50, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  color: '#ffffff',
                  '&::placeholder': {
                    color: '#64748b'
                  },
                  '&:focus': {
                    borderColor: '#3b82f6',
                    boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)'
                  }
                },
                label: {
                  color: '#e2e8f0',
                  marginBottom: '8px',
                  fontWeight: 600
                },
                error: {
                  color: '#fca5a5',
                  fontSize: '0.85rem',
                  marginTop: '4px'
                }
              }}
            />

            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <Button
                variant="light"
                onClick={cerrarModal}
                styles={{
                  root: {
                    background: 'rgba(30, 30, 50, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#e2e8f0',
                    '&:hover': {
                      background: 'rgba(30, 30, 50, 1)'
                    }
                  }
                }}
              >
                Cancelar
              </Button>
              <Button
                onClick={manejarRecuperacionPassword}
                loading={cargandoRecuperacion}
                disabled={cargandoRecuperacion}
                styles={{
                  root: {
                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                    border: 'none',
                    color: '#ffffff',
                    fontWeight: 600,
                    '&:hover': {
                      background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)'
                    }
                  }
                }}
              >
                {cargandoRecuperacion ? 'Enviando...' : 'Enviar'}
              </Button>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <IconCheck size={48} color="#10b981" style={{ margin: '0 auto 1rem' }} />
            <Text size="lg" fw={500} mb="sm" style={{ color: '#ffffff' }}>
              ¡Email enviado!
            </Text>
            <Text size="sm" style={{ color: '#a0aec0' }} mb="lg">
              Hemos enviado las instrucciones de recuperación a <strong style={{ color: '#3b82f6' }}>{emailRecuperacion}</strong>.
              Revisa tu bandeja de entrada y también la carpeta de spam.
            </Text>
            <Text size="xs" style={{ color: '#64748b' }} mb="lg">
              Si no encuentras el email, contacta con el administrador en:{' '}
              <strong style={{ color: '#3b82f6' }}>hola@gameshelf.com</strong>
            </Text>
            <Button
              onClick={cerrarModal}
              fullWidth
              styles={{
                root: {
                  background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                  border: 'none',
                  color: '#ffffff',
                  fontWeight: 600,
                  '&:hover': {
                    background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)'
                  }
                }
              }}
            >
              Entendido
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
};
