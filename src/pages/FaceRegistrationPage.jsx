import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useFaceDetection } from '../hooks/useFaceDetection'
import logo from '../assets/logo.png'

export default function FaceRegistrationPage() {
    const { profile, role, hasFaceRegistered, registerFace, logout } = useAuth()
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
    const navigate = useNavigate()

    const [capturedDescriptor, setCapturedDescriptor] = useState(null)
    const [isCapturing, setIsCapturing] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        let mounted = true
        if (hasFaceRegistered) {
            navigate('/dashboard')
            return
        }

        const initCamera = async () => {
            try {
                await startCamera()
            } catch (error) {
                console.error('Camera init error:', error)
                if (mounted) setError('Gagal mengakses kamera')
            }
        }

        initCamera()
        return () => {
            mounted = false
            stopCamera()
        }
    }, [hasFaceRegistered, navigate, startCamera, stopCamera])

    const handleCapture = async () => {
        setIsCapturing(true)
        setError('')
        try {
            const descriptor = await captureDescriptor()
            if (descriptor) {
                setCapturedDescriptor(descriptor)
            }
        } catch (err) {
            setError(err.message)
        } finally {
            setIsCapturing(false)
        }
    }

    const handleSubmit = async () => {
        if (!capturedDescriptor) {
            setError('Rekam wajah terlebih dahulu')
            return
        }
        setIsSubmitting(true)
        setError('')
        try {
            await registerFace(Array.from(capturedDescriptor))

            // Logout after successful registration to force re-login
            await logout()

            // Navigate to login with success message
            // We can't pass state as efficiently after logout, but standard behavior is fine
            // Or use a query param
            navigate('/login?registered=true')

        } catch (err) {
            console.error('Face registration error:', err)
            setError(err.message || 'Gagal menyimpan data wajah')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleRetake = () => {
        setCapturedDescriptor(null)
        setError('')
    }

    return (
        <div className="face-reg-page">
            <div className="face-reg-container">
                {/* Left Side - Branding */}
                <div className="face-reg-brand">
                    <img src={logo} alt="Logo" className="face-reg-logo" />
                    <h1>Registrasi Data Biometrik Wajah</h1>
                    <p>Langkah Untuk Mengaktifkan Sistem Absensi Berbasis Face Recognition</p>

                    <div className="face-reg-steps">
                        <div className="step completed">
                            <span className="step-num">✓</span>
                            <span>Buat Akun</span>
                        </div>
                        <div className="step active">
                            <span className="step-num">2</span>
                            <span>Rekam Wajah</span>
                        </div>
                        <div className="step">
                            <span className="step-num">3</span>
                            <span>Mulai Absensi</span>
                        </div>
                    </div>
                </div>

                {/* Right Side - Camera */}
                <div className="face-reg-main">
                    {/* User Info */}
                    <div className="face-reg-user">
                        <div className="user-avatar">
                            {role === 'student' ? '👨‍🎓' : '👨‍🏫'}
                        </div>
                        <div className="user-info">
                            <h3>{profile?.name || 'User'}</h3>
                            <p>
                                {role === 'student'
                                    ? `${profile?.class_name || '-'} • NIS: ${profile?.student_id || '-'}`
                                    : `${profile?.position || '-'} • NIP: ${profile?.employee_id || '-'}`
                                }
                            </p>
                        </div>
                    </div>

                    {error && (
                        <div className="face-reg-error">
                            ⚠️ {error}
                        </div>
                    )}

                    {/* Camera */}
                    <div className="face-reg-camera">
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            style={{ transform: 'scaleX(-1)' }}
                        />
                        <canvas
                            ref={canvasRef}
                            style={{ transform: 'scaleX(-1)' }}
                        />

                        <div className={`face-frame ${capturedDescriptor ? 'captured' : ''}`}></div>

                        <div className="camera-status">
                            {capturedDescriptor ? '✓ Wajah berhasil direkam!' : 'Posisikan wajah di dalam bingkai'}
                        </div>

                        {(isLoading || !isCameraActive) && (
                            <div className="camera-overlay">
                                <div className="spinner"></div>
                                <span>{isLoading ? `Memuat model... ${loadingProgress}%` : 'Mengaktifkan kamera...'}</span>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="face-reg-actions">
                        {!capturedDescriptor ? (
                            <button
                                className="btn-capture"
                                onClick={handleCapture}
                                disabled={!isCameraActive || isCapturing || isLoading}
                            >
                                {isCapturing ? (
                                    <><div className="spinner-sm"></div> Merekam...</>
                                ) : (
                                    <><span className="icon"></span> Rekam Wajah</>
                                )}
                            </button>
                        ) : (
                            <div className="action-buttons">
                                <button className="btn-retake" onClick={handleRetake} disabled={isSubmitting}>
                                    🔄 Ulangi
                                </button>
                                <button className="btn-save" onClick={handleSubmit} disabled={isSubmitting}>
                                    {isSubmitting ? (
                                        <><div className="spinner-sm"></div> Menyimpan...</>
                                    ) : (
                                        <>✓ Simpan & Lanjutkan</>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Tips */}
                    <div className="face-reg-tips">
                        <h4>💡 Tips untuk hasil terbaik:</h4>
                        <ul>
                            <li>Pastikan pencahayaan cukup terang</li>
                            <li>Hadapkan wajah langsung ke kamera</li>
                            <li>Lepaskan kacamata atau aksesoris</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}
