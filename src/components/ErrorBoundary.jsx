import React from 'react'

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props)
        this.state = { hasError: false, error: null }
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error }
    }

    componentDidCatch(error, errorInfo) {
        console.error('Uncaught error:', error, errorInfo)
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    height: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#f8fafc',
                    color: '#1e293b',
                    fontFamily: 'sans-serif'
                }}>
                    <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Terjadi Kesalahan Aplikasi 😔</h1>
                    <p style={{ color: '#ef4444', marginBottom: '2rem', maxWidth: '80%', textAlign: 'center' }}>
                        {this.state.error?.message || 'Error tidak diketahui'}
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        style={{
                            padding: '12px 24px',
                            background: '#4f46e5',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: '600'
                        }}
                    >
                        Muat Ulang Aplikasi
                    </button>
                </div>
            )
        }

        return this.props.children
    }
}

export default ErrorBoundary
