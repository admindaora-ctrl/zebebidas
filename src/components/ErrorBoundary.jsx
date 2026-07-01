import { Component } from 'react'

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="page-center">
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <p style={{ fontSize: 48, marginBottom: 8 }}>Ops!</p>
            <h2 style={{ marginBottom: 4 }}>Algo deu errado</h2>
            <p style={{ color: 'var(--muted)', marginBottom: 24, fontSize: 14 }}>
              Ocorreu um erro inesperado. Tente recarregar a página.
            </p>
            <button
              className="btn btn--green"
              onClick={() => window.location.reload()}
              style={{ minWidth: 200 }}
            >
              Recarregar
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
