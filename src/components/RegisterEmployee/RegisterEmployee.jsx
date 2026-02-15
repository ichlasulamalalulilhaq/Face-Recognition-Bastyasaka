import { useState, useEffect } from 'react'
import { useApp } from '../../context/AppContext'
import { useFaceDetection } from '../../hooks/useFaceDetection'

export default function RegisterEmployee() {
    const { addEmployee, showToast } = useApp()
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
        employeeId: '',
        position: ''
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

        if (!formData.name || !formData.employeeId || !formData.position) {
            showToast('error', 'Error', 'Lengkapi semua data!')
            return
        }

        if (!capturedDescriptor) {
            showToast('error', 'Error', 'Rekam wajah terlebih dahulu!')
            return
        }

        setIsSubmitting(true)
        try {
            await addEmployee({
                name: formData.name,
                employeeId: formData.employeeId,
                position: formData.position,
                faceDescriptor: Array.from(capturedDescriptor)
            })

            showToast('success', 'Sukses!', `Guru ${formData.name} berhasil didaftarkan`)

            setFormData({ name: '', employeeId: '', position: '' })
            setCapturedDescriptor(null)
        } catch (error) {
            showToast('error', 'Gagal', error.message)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="page">
            <div className="page-header">
                <div className="header-left">
                    <h1>📋 Daftar Guru/Karyawan</h1>
                    <p>Tambahkan data guru atau karyawan baru</p>
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
                                <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                                <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" />
                            </svg>
                            Data Guru/Karyawan
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
                                <label>NIP / ID Karyawan</label>
                                <input
                                    type="text"
                                    placeholder="Masukkan NIP atau ID"
                                    value={formData.employeeId}
                                    onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                                />
                            </div>

                            <div className="form-group">
                                <label>Jabatan</label>
                                <select
                                    value={formData.position}
                                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                                >
                                    <option value="">Pilih Jabatan</option>
                                    <option value="Kepala Sekolah">Kepala Sekolah</option>
                                    <option value="Wakil Kepala Sekolah">Wakil Kepala Sekolah</option>
                                    <option value="Guru">Guru</option>
                                    <option value="Guru BK">Guru BK</option>
                                    <option value="Tata Usaha">Tata Usaha</option>
                                    <option value="Pustakawan">Pustakawan</option>
                                    <option value="Satpam">Satpam</option>
                                    <option value="Petugas Kebersihan">Petugas Kebersihan</option>
                                    <option value="Lainnya">Lainnya</option>
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
                                        Simpan Data Guru
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
