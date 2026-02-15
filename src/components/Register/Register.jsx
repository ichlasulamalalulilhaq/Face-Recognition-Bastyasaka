import { useState, useEffect } from 'react'
import { useApp } from '../../context/AppContext'
import { useFaceDetection } from '../../hooks/useFaceDetection'

export default function Register() {
    const { addStudent, showToast } = useApp()
    const {
        videoRef,
        canvasRef,
        isLoading,
        isCameraActive,
        startCamera,
        stopCamera,
        captureDescriptor,
        loadingProgress
    } = useFaceDetection()

    const [formData, setFormData] = useState({
        name: '',
        studentId: '',
        className: ''
    })
    const [capturedDescriptor, setCapturedDescriptor] = useState(null)
    const [isCapturing, setIsCapturing] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        startCamera()
        return () => stopCamera()
    }, [startCamera, stopCamera])

    const handleCapture = async () => {
        setIsCapturing(true)
        try {
            const descriptor = await captureDescriptor()
            if (descriptor) {
                setCapturedDescriptor(descriptor)
                showToast('success', 'Berhasil', 'Wajah berhasil direkam!')
            }
        } catch (error) {
            showToast('error', 'Gagal', error.message)
        } finally {
            setIsCapturing(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!formData.name || !formData.studentId || !formData.className) {
            showToast('error', 'Error', 'Lengkapi semua data!')
            return
        }

        if (!capturedDescriptor) {
            showToast('error', 'Error', 'Rekam wajah terlebih dahulu!')
            return
        }

        setIsSubmitting(true)
        try {
            await addStudent({
                name: formData.name,
                studentId: formData.studentId,
                className: formData.className,
                faceDescriptor: Array.from(capturedDescriptor)
            })

            showToast('success', 'Sukses!', `Siswa ${formData.name} berhasil didaftarkan`)

            setFormData({ name: '', studentId: '', className: '' })
            setCapturedDescriptor(null)
        } catch (error) {
            showToast('error', 'Gagal', error.message)
        } finally {
            setIsSubmitting(false)
        }
    }

    const classOptions = [
        'X IPA 1', 'X IPA 2', 'X IPA 3', 'X IPA 4', 'X IPA 5',
        'X IPS 1', 'X IPS 2', 'X IPS 3',
        'XI IPA 1', 'XI IPA 2', 'XI IPA 3', 'XI IPA 4', 'XI IPA 5',
        'XI IPS 1', 'XI IPS 2', 'XI IPS 3',
        'XII IPA 1', 'XII IPA 2', 'XII IPA 3', 'XII IPA 4', 'XII IPA 5',
        'XII IPS 1', 'XII IPS 2', 'XII IPS 3'
    ]

    return (
        <div className="page">
            <div className="page-header">
                <div className="header-left">
                    <h1>📝 Daftar Siswa Baru</h1>
                    <p>Tambahkan data siswa baru dengan scan wajah</p>
                </div>
            </div>

            <div className="register-layout">
                <div className="camera-container">
                    <div className="camera-card">
                        <div className="camera-header">
                            <span className={`camera-status-dot ${isCameraActive ? 'active' : ''}`}></span>
                            <span>{isCameraActive ? 'Kamera Aktif' : 'Kamera Tidak Aktif'}</span>
                        </div>

                        <div className="camera-wrapper">
                            <video ref={videoRef} autoPlay playsInline muted style={{ transform: 'scaleX(-1)' }} />
                            <canvas ref={canvasRef} style={{ transform: 'scaleX(-1)' }} />

                            {!isCameraActive && (
                                <div className="face-guide">
                                    <div className="face-frame"></div>
                                    <span className="guide-text">Posisikan wajah di sini</span>
                                </div>
                            )}

                            {isLoading && (
                                <div className="camera-loading">
                                    <div className="spinner"></div>
                                    <span>Memuat model... {loadingProgress}%</span>
                                </div>
                            )}
                        </div>

                        <div className="camera-actions">
                            <button
                                className={`btn btn-xl ${capturedDescriptor ? 'btn-success' : 'btn-primary'}`}
                                onClick={handleCapture}
                                disabled={!isCameraActive || isCapturing || isLoading}
                            >
                                {isCapturing ? (
                                    <>
                                        <div className="spinner" style={{ width: 20, height: 20 }}></div>
                                        Merekam...
                                    </>
                                ) : capturedDescriptor ? (
                                    <>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                                            <polyline points="22 4 12 14.01 9 11.01" />
                                        </svg>
                                        Wajah Terekam ✓
                                    </>
                                ) : (
                                    <>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
                                            <circle cx="12" cy="13" r="4" />
                                        </svg>
                                        Rekam Wajah
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="form-container">
                    <div className="form-card">
                        <h3>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 24, height: 24 }}>
                                <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
                                <circle cx="9" cy="7" r="4" />
                                <line x1="19" y1="8" x2="19" y2="14" />
                                <line x1="22" y1="11" x2="16" y2="11" />
                            </svg>
                            Data Siswa
                        </h3>

                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Nama Lengkap</label>
                                <input
                                    type="text"
                                    placeholder="Masukkan nama lengkap"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>

                            <div className="form-group">
                                <label>NIS (Nomor Induk Siswa)</label>
                                <input
                                    type="text"
                                    placeholder="Masukkan NIS"
                                    value={formData.studentId}
                                    onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                                />
                            </div>

                            <div className="form-group">
                                <label>Kelas</label>
                                <select
                                    value={formData.className}
                                    onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                                >
                                    <option value="">Pilih Kelas</option>
                                    {classOptions.map(cls => (
                                        <option key={cls} value={cls}>{cls}</option>
                                    ))}
                                </select>
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary btn-xl"
                                style={{ width: '100%', marginTop: 16 }}
                                disabled={isSubmitting || !capturedDescriptor}
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="spinner" style={{ width: 20, height: 20 }}></div>
                                        Menyimpan...
                                    </>
                                ) : (
                                    <>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
                                            <polyline points="17 21 17 13 7 13 7 21" />
                                            <polyline points="7 3 7 8 15 8" />
                                        </svg>
                                        Simpan Data Siswa
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}
