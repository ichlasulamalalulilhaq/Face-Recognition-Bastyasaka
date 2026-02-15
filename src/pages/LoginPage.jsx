import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
    const { login } = useAuth()
    const navigate = useNavigate()

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        if (!formData.email || !formData.password) {
            setError('Email dan password harus diisi')
            return
        }

        setLoading(true)
        try {
            await login(formData.email, formData.password)
            navigate('/dashboard')
        } catch (err) {
            console.error('Login error:', err)
            if (err.message?.includes('Invalid login')) {
                setError('Email atau password salah')
            } else {
                setError(err.message || 'Gagal login. Silakan coba lagi.')
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-header">
                    <img src="/logo.png" alt="Logo" className="auth-logo" />
                    <h1>Bastyasaka Smart Attendance</h1>
                    <p>Sistem Absensi Digital</p>
                </div>

                <div className="auth-card">
                    <h2>Masuk ke Akun</h2>

                    {error && (
                        <div className="auth-error">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="8" x2="12" y2="12" />
                                <line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Email</label>
                            <input
                                type="email"
                                placeholder="Masukkan email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                disabled={loading}
                            />
                        </div>

                        <div className="form-group">
                            <label>Password</label>
                            <input
                                type="password"
                                placeholder="Masukkan password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                disabled={loading}
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary btn-xl auth-btn"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <div className="spinner" style={{ width: 20, height: 20 }}></div>
                                    Memproses...
                                </>
                            ) : (
                                <>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4" />
                                        <polyline points="10 17 15 12 10 7" />
                                        <line x1="15" y1="12" x2="3" y2="12" />
                                    </svg>
                                    Masuk
                                </>
                            )}
                        </button>
                    </form>

                    <div className="auth-footer">
                        <p>Belum punya akun? <Link to="/register">Daftar di sini</Link></p>
                    </div>
                </div>
            </div>
        </div>
    )
}
