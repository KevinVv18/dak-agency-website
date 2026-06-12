import React from 'react'

// Evita que un error de render en cualquier componente deje
// toda la página en blanco. Muestra un fallback con la marca.
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.error('[DAK] Error capturado por ErrorBoundary:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1.5rem',
            background: 'var(--color-primary, #030106)',
            color: '#fff',
            textAlign: 'center',
            padding: '2rem',
          }}
        >
          <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', fontWeight: 800 }}>
            Algo salió mal
          </h1>
          <p style={{ opacity: 0.7, maxWidth: '28rem' }}>
            Ocurrió un error inesperado. Recarga la página o escríbenos a{' '}
            <a href="mailto:marketing@dakagency.net" style={{ color: '#B024FF' }}>
              marketing@dakagency.net
            </a>
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              background: '#B024FF',
              color: '#fff',
              border: 'none',
              borderRadius: '999px',
              padding: '0.9rem 2.2rem',
              fontSize: '1rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Recargar página
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

export default ErrorBoundary
