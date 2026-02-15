import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { studentsDB, supabase } from '../lib/supabase'

export default function StudentSettingsPage() {
    const { profile, user, refreshProfile } = useAuth()
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState({ type: '', text: '' })

    // Form states
    const [formData, setFormData] = useState({
        className: '',
        password: '',
        confirmPassword: ''
    })

    // Initialize form with profile data
    useEffect(() => {
        if (profile) {
            setFormData(prev => ({
                ...prev,
                className: profile.class_name || ''
            }))
        }
    }, [profile])

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setMessage({ type: '', text: '' })
        setLoading(true)

        try {
            // Validate password if provided
            if (formData.password) {
                if (formData.password.length < 6) {
                    throw new Error('Password minimal 6 karakter')
                }
                if (formData.password !== formData.confirmPassword) {
                    throw new Error('Konfirmasi password tidak cocok')
                }
            }

            const updates = {}
            let passwordUpdated = false

            // 1. Update Password if provided
            if (formData.password) {
                const { error: authError } = await supabase.auth.updateUser({
                    password: formData.password
                })
                if (authError) throw authError
                passwordUpdated = true
            }

            // 2. Update Class if changed
            if (formData.className !== profile.class_name) {
                updates.class_name = formData.className.toUpperCase() // Force uppercase class names like "XII RPL 1"
                await studentsDB.update(profile.id, updates)
            }

            // 3. Refresh profile in context
            await refreshProfile()

            // Reset password fields
            setFormData(prev => ({
                ...prev,
                password: '',
                confirmPassword: ''
            }))

            let successMsg = 'Data berhasil disimpan'
            if (passwordUpdated) successMsg += ' dan password diperbarui'

            setMessage({ type: 'success', text: successMsg })

        } catch (error) {
            console.error('Error updating settings:', error)
            setMessage({ type: 'error', text: error.message || 'Gagal menyimpan perubahan' })
        } finally {
            setLoading(false)
        }
    }

    if (!profile) return null

    return (
        <div className="page">
            <div className="page-header">
                <div className="header-left">
                    <div className="greeting">
                        <h1>Pengaturan Akun ⚙️</h1>
                        <p className="current-date-big">Kelola data diri dan keamanan akun</p>
                    </div>
                </div>
            </div>

            <div className="content-grid" style={{ gridTemplateColumns: '1fr', maxWidth: '800px' }}>
                <div className="card">
                    <div className="card-header">
                        <h3>Biodata Siswa</h3>
                    </div>

                    <form onSubmit={handleSubmit} className="settings-form">
                        {message.text && (
                            <div className={`alert ${message.type === 'error' ? 'alert-error' : 'alert-success'}`}
                                style={{
                                    padding: '1rem', marginBottom: '1.5rem', borderRadius: '8px',
                                    backgroundColor: message.type === 'error' ? '#fee2e2' : '#dcfce7',
                                    color: message.type === 'error' ? '#ef4444' : '#16a34a',
                                    border: `1px solid ${message.type === 'error' ? '#fca5a5' : '#86efac'}`
                                }}>
                                {message.text}
                            </div>
                        )}

                        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Nama Lengkap</label>
                            <input
                                type="text"
                                value={profile.name}
                                disabled
                                className="form-input disabled"
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', color: '#64748b' }}
                            />
                            <small style={{ color: '#94a3b8', marginTop: '0.25rem', display: 'block' }}>Nama tidak dapat diubah</small>
                        </div>

                        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>NIS/NISN</label>
                            <input
                                type="text"
                                value={profile.student_id}
                                disabled
                                className="form-input disabled"
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', color: '#64748b' }}
                            />
                            <small style={{ color: '#94a3b8', marginTop: '0.25rem', display: 'block' }}>NIS tidak dapat diubah</small>
                        </div>

                        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Email</label>
                            <input
                                type="email"
                                value={user?.email || ''}
                                disabled
                                className="form-input disabled"
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', color: '#64748b' }}
                            />
                        </div>

                        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                            <label htmlFor="className" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Kelas</label>
                            <input
                                id="className"
                                name="className"
                                type="text"
                                value={formData.className}
                                onChange={handleChange}
                                placeholder="Contoh: XII RPL 1"
                                className="form-input"
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                            />
                        </div>

                        <div style={{ height: '1px', backgroundColor: '#e2e8f0', margin: '2rem 0' }}></div>

                        <h4 style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>Ganti Password</h4>

                        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                            <label htmlFor="password" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Password Baru</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Kosongkan jika tidak ingin mengganti"
                                className="form-input"
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                            />
                        </div>

                        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                            <label htmlFor="confirmPassword" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Konfirmasi Password Baru</label>
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="Ulangi password baru"
                                className="form-input"
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                            />
                        </div>

                        <div className="form-actions" style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary"
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    backgroundColor: '#2563eb',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontWeight: 600,
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    opacity: loading ? 0.7 : 1
                                }}
                            >
                                {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
