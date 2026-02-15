import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function RegisterPage() {
    const { register } = useAuth()
    const navigate = useNavigate()

    const [step, setStep] = useState(1) // 1: pilih role, 2: isi data
    const [role, setRole] = useState('') // 'student' or 'employee'
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        // Student fields
        studentId: '',
        className: '',
        // Employee fields
        employeeId: '',
        position: ''
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const classOptions = [
        'X IPA 1', 'X IPA 2', 'X IPA 3', 'X IPA 4', 'X IPA 5',
        'X IPS 1', 'X IPS 2', 'X IPS 3',
        'XI IPA 1', 'XI IPA 2', 'XI IPA 3', 'XI IPA 4', 'XI IPA 5',
        'XI IPS 1', 'XI IPS 2', 'XI IPS 3',
        'XII IPA 1', 'XII IPA 2', 'XII IPA 3', 'XII IPA 4', 'XII IPA 5',
        'XII IPS 1', 'XII IPS 2', 'XII IPS 3'
    ]

    const positionOptions = [
        'Kepala Sekolah', 'Wakil Kepala Sekolah', 'Guru', 'Guru BK',
        'Tata Usaha', 'Pustakawan', 'Satpam', 'Petugas Kebersihan', 'Lainnya'
    ]

    const handleRoleSelect = (selectedRole) => {
        setRole(selectedRole)
        setStep(2)
    }

    const handleBack = () => {
        setStep(1)
        setRole('')
        setError('')
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        // Validation
        if (!formData.name || !formData.email || !formData.password) {
            setError('Semua field wajib diisi')
            return
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Password tidak cocok')
            return
        }

        if (formData.password.length < 6) {
            setError('Password minimal 6 karakter')
            return
        }

        if (role === 'student' && (!formData.studentId || !formData.className)) {
            setError('NIS dan Kelas wajib diisi')
            return
        }

        if (role === 'employee' && (!formData.employeeId || !formData.position)) {
            setError('NIP dan Jabatan wajib diisi')
            return
        }

        setLoading(true)
        try {
            const userData = role === 'student'
                ? { name: formData.name, studentId: formData.studentId, className: formData.className }
                : { name: formData.name, employeeId: formData.employeeId, position: formData.position }

            await register(formData.email, formData.password, userData, role)
            navigate('/register-face')
        } catch (err) {
            console.error('Register error:', err)
            if (err.message?.includes('already registered')) {
                setError('Email sudah terdaftar. Silakan login.')
            } else {
                setError(err.message || 'Gagal mendaftar. Silakan coba lagi.')
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
                    {step === 1 ? (
                        <>
                            <h2>Daftar Akun Baru</h2>
                            <p className="auth-subtitle">Pilih jenis akun Anda</p>

                            <div className="role-selection">
                                <button
                                    className="role-card"
                                    onClick={() => handleRoleSelect('student')}
                                >
                                    <div className="role-icon student">👨‍🎓</div>
                                    <h3>Siswa</h3>
                                    <p>Daftar sebagai siswa</p>
                                </button>

                                <button
                                    className="role-card"
                                    onClick={() => handleRoleSelect('employee')}
                                >
                                    <div className="role-icon employee">👨‍🏫</div>
                                    <h3>Guru / Karyawan</h3>
                                    <p>Daftar sebagai guru atau karyawan</p>
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="auth-card-header">
                                <button className="back-btn" onClick={handleBack}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <polyline points="15 18 9 12 15 6" />
                                    </svg>
                                </button>
                                <h2>
                                    {role === 'student' ? '👨‍🎓 Daftar Siswa' : '👨‍🏫 Daftar Guru/Karyawan'}
                                </h2>
                            </div>

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
                                    <label>Nama Lengkap</label>
                                    <input
                                        type="text"
                                        placeholder="Masukkan nama lengkap"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        disabled={loading}
                                    />
                                </div>

                                {role === 'student' ? (
                                    <>
                                        <div className="form-group">
                                            <label>NIS (Nomor Induk Siswa)</label>
                                            <input
                                                type="text"
                                                placeholder="Masukkan NIS"
                                                value={formData.studentId}
                                                onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                                                disabled={loading}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Kelas</label>
                                            <select
                                                value={formData.className}
                                                onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                                                disabled={loading}
                                            >
                                                <option value="">Pilih Kelas</option>
                                                {classOptions.map(cls => (
                                                    <option key={cls} value={cls}>{cls}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="form-group">
                                            <label>NIP / ID Karyawan</label>
                                            <input
                                                type="text"
                                                placeholder="Masukkan NIP"
                                                value={formData.employeeId}
                                                onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                                                disabled={loading}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Jabatan</label>
                                            <select
                                                value={formData.position}
                                                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                                                disabled={loading}
                                            >
                                                <option value="">Pilih Jabatan</option>
                                                {positionOptions.map(pos => (
                                                    <option key={pos} value={pos}>{pos}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </>
                                )}

                                <div className="form-divider">
                                    <span>Informasi Akun</span>
                                </div>

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

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Password</label>
                                        <input
                                            type="password"
                                            placeholder="Min. 6 karakter"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            disabled={loading}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Konfirmasi Password</label>
                                        <input
                                            type="password"
                                            placeholder="Ulangi password"
                                            value={formData.confirmPassword}
                                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                            disabled={loading}
                                        />
                                    </div>
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
                                                <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                                                <circle cx="8.5" cy="7" r="4" />
                                                <line x1="20" y1="8" x2="20" y2="14" />
                                                <line x1="23" y1="11" x2="17" y2="11" />
                                            </svg>
                                            Daftar
                                        </>
                                    )}
                                </button>
                            </form>
                        </>
                    )}

                    <div className="auth-footer">
                        <p>Sudah punya akun? <Link to="/login">Masuk di sini</Link></p>
                    </div>
                </div>
            </div>
        </div>
    )
}
