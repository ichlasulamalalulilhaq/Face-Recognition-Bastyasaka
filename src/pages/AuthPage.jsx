import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import logo from '../assets/logo.png'

export default function AuthPage() {
    const { login, register } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()

    const [isSignUp, setIsSignUp] = useState(false)
    const [step, setStep] = useState(1)
    const [role, setRole] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [successMsg, setSuccessMsg] = useState('')

    // Check for registration success param
    useEffect(() => {
        const params = new URLSearchParams(location.search)
        if (params.get('registered') === 'true') {
            setSuccessMsg('Pendaftaran Wajah Berhasil! Silakan cek email Anda untuk verifikasi akun sebelum Login.')
        }
    }, [location])

    const [loginData, setLoginData] = useState({ email: '', password: '' })
    const [registerData, setRegisterData] = useState({
        name: '', email: '', password: '', confirmPassword: '',
        studentId: '', className: '', employeeId: '', position: ''
    })

    const classOptions = [
        'X-1', 'X-2', 'X-3', 'X-4', 'X-5',
        'X-6', 'X-7', 'X-8', 'X-9', 'X-10', 
        'XI-1', 'XI-2', 'XI-3', 'XI-4', 'XI-5',
        'XI-6', 'XI-7', 'XI-8', 'XI-9', 'XI-10',
        'XII-1', 'XII-2', 'XII-3', 'XII-4', 'XII-5',
        'XII-6', 'XII-7', 'XII-8', 'XII-9', 'XII-10'
    ]

    const positionOptions = [
        'Kepala Sekolah', 'Wakil Kepala Sekolah', 'Guru', 'Guru BK',
        'Tata Usaha', 'Pustakawan', 'Satpam', 'Petugas Kebersihan', 'Lainnya'
    ]

    const handleToggle = () => {
        setIsSignUp(!isSignUp)
        setStep(1)
        setRole('')
        setError('')
        setSuccessMsg('')
    }

    const handleLogin = async (e) => {
        e.preventDefault()
        setError('')
        if (!loginData.email || !loginData.password) {
            setError('Email dan password harus diisi')
            return
        }
        setLoading(true)
        try {
            await login(loginData.email, loginData.password)
            navigate('/dashboard')
        } catch (err) {
            setError(err.message?.includes('Invalid') ? 'Email atau password salah' : 'Gagal login')
        } finally {
            setLoading(false)
        }
    }

    const handleRegister = async (e) => {
        e.preventDefault()
        setError('')
        if (!registerData.name || !registerData.email || !registerData.password) {
            setError('Semua field wajib diisi'); return
        }
        if (registerData.password !== registerData.confirmPassword) {
            setError('Password tidak cocok'); return
        }
        if (registerData.password.length < 6) {
            setError('Password minimal 6 karakter'); return
        }
        if (role === 'student' && (!registerData.studentId || !registerData.className)) {
            setError('NIS dan Kelas wajib diisi'); return
        }
        if (role === 'employee' && (!registerData.employeeId || !registerData.position)) {
            setError('NIP dan Jabatan wajib diisi'); return
        }
        setLoading(true)
        try {
            const userData = role === 'student'
                ? { name: registerData.name, studentId: registerData.studentId, className: registerData.className }
                : { name: registerData.name, employeeId: registerData.employeeId, position: registerData.position }
            await register(registerData.email, registerData.password, userData, role)
            navigate('/register-face')
        } catch (err) {
            console.error('Registration error:', err)
            // Show more detailed error for debugging
            if (err.message?.includes('already')) {
                setError('Email sudah terdaftar')
            } else if (err.message?.includes('valid email')) {
                setError('Format email tidak valid')
            } else if (err.message?.includes('confirmation')) {
                setError('Registrasi berhasil! Silakan cek email untuk verifikasi.')
            } else {
                setError(err.message || 'Gagal mendaftar')
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="slider-page">
            <div className={`slider-box ${isSignUp ? 'active' : ''}`}>

                {/* SIGN IN FORM */}
                <div className="slider-form-panel slider-signin">
                    <div className="slider-form-content">
                        <img src={logo} alt="Logo" className="slider-logo" />
                        <h1>Sign In</h1>
                        <p className="slider-desc">Masukkan email dan password Anda</p>

                        {successMsg && !isSignUp && (
                            <div className="slider-error" style={{ backgroundColor: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0' }}>
                                ✅ {successMsg}
                            </div>
                        )}

                        {error && !isSignUp && <div className="slider-error">{error}</div>}

                        <form onSubmit={handleLogin}>
                            <div className="slider-field">
                                <input
                                    type="email"
                                    placeholder="Email"
                                    value={loginData.email}
                                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                                    disabled={loading}
                                />
                            </div>
                            <div className="slider-field">
                                <input
                                    type="password"
                                    placeholder="Password"
                                    value={loginData.password}
                                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                                    disabled={loading}
                                />
                            </div>
                            <button type="submit" className="slider-btn" disabled={loading}>
                                {loading ? 'Loading...' : 'SIGN IN'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* SIGN UP FORM */}
                <div className="slider-form-panel slider-signup">
                    <div className="slider-form-content">
                        {step === 1 ? (
                            <>
                                <h1>Create Account</h1>
                                <p className="slider-desc">Pilih Role Anda</p>
                                <div className="slider-roles">
                                    <button onClick={() => { setRole('student'); setStep(2) }}>
                                        <span>👨‍🎓</span>
                                        <span>Student</span>
                                    </button>
                                    <button onClick={() => { setRole('employee'); setStep(2) }}>
                                        <span>👨‍🏫</span>
                                        <span>Teacher</span>
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <h1>{role === 'student' ? 'Daftar Siswa' : 'Daftar Guru'}</h1>
                                <p className="slider-desc">Lengkapi data di bawah ini</p>

                                {error && <div className="slider-error">{error}</div>}

                                <form onSubmit={handleRegister} className="slider-scroll">
                                    <div className="slider-field">
                                        <input type="text" placeholder="Nama Lengkap" value={registerData.name}
                                            onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })} disabled={loading} />
                                    </div>

                                    {role === 'student' ? (
                                        <div className="slider-row">
                                            <div className="slider-field">
                                                <input type="text" placeholder="NIS" value={registerData.studentId}
                                                    onChange={(e) => setRegisterData({ ...registerData, studentId: e.target.value })} disabled={loading} />
                                            </div>
                                            <div className="slider-field">
                                                <select value={registerData.className} onChange={(e) => setRegisterData({ ...registerData, className: e.target.value })} disabled={loading}>
                                                    <option value="">Pilih Kelas</option>
                                                    {classOptions.map(c => <option key={c} value={c}>{c}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="slider-row">
                                            <div className="slider-field">
                                                <input type="text" placeholder="NIP" value={registerData.employeeId}
                                                    onChange={(e) => setRegisterData({ ...registerData, employeeId: e.target.value })} disabled={loading} />
                                            </div>
                                            <div className="slider-field">
                                                <select value={registerData.position} onChange={(e) => setRegisterData({ ...registerData, position: e.target.value })} disabled={loading}>
                                                    <option value="">Pilih Jabatan</option>
                                                    {positionOptions.map(p => <option key={p} value={p}>{p}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                    )}

                                    <div className="slider-field">
                                        <input type="email" placeholder="Email" value={registerData.email}
                                            onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })} disabled={loading} />
                                    </div>
                                    <div className="slider-row">
                                        <div className="slider-field">
                                            <input type="password" placeholder="Password" value={registerData.password}
                                                onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })} disabled={loading} />
                                        </div>
                                        <div className="slider-field">
                                            <input type="password" placeholder="Konfirmasi" value={registerData.confirmPassword}
                                                onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })} disabled={loading} />
                                        </div>
                                    </div>

                                    <button type="submit" className="slider-btn" disabled={loading}>
                                        {loading ? 'Loading...' : 'SIGN UP'}
                                    </button>
                                </form>
                            </>
                        )}
                    </div>
                </div>

                {/* SLIDING OVERLAY */}
                <div className="slider-overlay-container">
                    <div className="slider-overlay">
                        {/* Left Panel - Welcome Back */}
                        <div className="slider-overlay-panel slider-overlay-left">
                            <h2>Welcome, Bastyasaka!</h2>
                            <p>Masukkan Akun Anda Untuk Mengakses Sistem Absensi Berbasis Face Recognition</p>
                            <button className="slider-ghost" onClick={handleToggle}>SIGN IN</button>
                        </div>
                        {/* Right Panel - Hello Friend */}
                        <div className="slider-overlay-panel slider-overlay-right">
                            <img src={logo} alt="Logo" className="slider-overlay-logo" />
                            <h2>Hello, Bastyasaka!</h2>
                            <p>Daftarkan Diri Anda, Mulai Menggunakan Sistem Absensi Digital Berbasis Face Recognition</p>
                            <button className="slider-ghost" onClick={handleToggle}>SIGN UP</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
