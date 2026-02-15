import { useState, useEffect } from 'react'
import { useApp } from '../../context/AppContext'
import { useFaceDetection } from '../../hooks/useFaceDetection'

export default function Attendance() {
    const { addAttendanceRecord, showToast, students, employees, refreshData } = useApp()
    const {
        videoRef,
        canvasRef,
        isLoading,
        isCameraActive,
        startCamera,
        stopCamera,
        recognizeFace,
        modelsLoaded,
        loadingProgress,
        startContinuousDetection,
        stopContinuousDetection
    } = useFaceDetection()

    const [isProcessing, setIsProcessing] = useState(false)
    const [result, setResult] = useState(null)
    const [cameraTimeout, setCameraTimeout] = useState(false)

    useEffect(() => {
        let mounted = true
        let timeoutTimer = null

        const initCamera = async () => {
            // Refresh data to get latest registered users
            if (refreshData) refreshData()

            // Set timeout to show retry button if camera takes too long
            timeoutTimer = setTimeout(() => {
                if (mounted && !isCameraActive) {
                    setCameraTimeout(true)
                }
            }, 8000)

            try {
                const success = await startCamera()
                if (!success && mounted) {
                    showToast('error', 'Kamera Error', 'Gagal mengakses kamera. Pastikan izin diberikan.')
                    setCameraTimeout(true)
                }
            } catch (error) {
                console.error('Camera init error:', error)
                if (mounted) setCameraTimeout(true)
            } finally {
                if (timeoutTimer) clearTimeout(timeoutTimer)
            }
        }

        initCamera()

        return () => {
            mounted = false
            stopCamera()
            if (timeoutTimer) clearTimeout(timeoutTimer)
        }
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    const handleRetryCamera = async () => {
        setCameraTimeout(false)
        stopCamera()
        const success = await startCamera()
        if (!success) {
            showToast('error', 'Gagal', 'Kamera tetap tidak bisa dibuka.')
            setCameraTimeout(true)
        }
    }

    const markAttendance = async (type) => {
        if (isProcessing) return

        setIsProcessing(true)
        // Pause background detection to free up CPU for recognition
        stopContinuousDetection()

        try {
            const recognition = await recognizeFace()

            // Add attendance record based on person type
            await addAttendanceRecord({
                personId: recognition.id,
                type
            }, recognition.type)

            // Get person details
            let personDetails = null
            if (recognition.type === 'student') {
                personDetails = students.find(s => s.id === recognition.id)
            } else {
                personDetails = employees.find(e => e.id === recognition.id)
            }

            setResult({
                success: true,
                name: recognition.name,
                id: recognition.id,
                personType: recognition.type,
                detail: recognition.type === 'student' ? personDetails?.className : personDetails?.position,
                type,
                confidence: recognition.confidence,
                time: new Date().toLocaleTimeString('id-ID', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                })
            })

            const roleText = recognition.type === 'student' ? 'Siswa' : 'Guru'
            const typeText = type === 'in' ? 'masuk' : 'pulang'
            showToast('success', 'Berhasil! ✓', `${roleText} ${recognition.name} berhasil absen ${typeText}`)
        } catch (error) {
            showToast('error', 'Gagal', error.message)
            setResult(null)
        } finally {
            setIsProcessing(false)
            // Resume background detection
            if (isCameraActive) {
                startContinuousDetection()
            }
        }
    }

    const getInitials = (name) => name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)

    return (
        <div className="page">
            <div className="page-header">
                <div className="header-left">
                    <h1>📋 Absensi</h1>
                    <p>Scan wajah untuk mencatat kehadiran siswa atau guru</p>
                </div>
            </div>

            <div className="attendance-layout">
                <div className="camera-container">
                    <div className="camera-card">
                        <div className="camera-header">
                            <span className={`camera-status-dot ${isCameraActive ? 'active' : ''}`}></span>
                            <span>
                                {isCameraActive ? 'Kamera Aktif' : cameraTimeout ? 'Kamera Bermasalah' : 'Mengaktifkan kamera...'}
                            </span>
                            {cameraTimeout && (
                                <button
                                    onClick={handleRetryCamera}
                                    className="btn btn-sm btn-primary"
                                    style={{ marginLeft: 'auto', padding: '4px 12px', fontSize: '0.85rem' }}
                                >
                                    ↻ Coba Lagi
                                </button>
                            )}
                        </div>

                        <div className="camera-wrapper">
                            <video ref={videoRef} autoPlay playsInline muted style={{ transform: 'scaleX(-1)' }} />
                            <canvas ref={canvasRef} style={{ transform: 'scaleX(-1)' }} />

                            <div className="face-guide">
                                <div className="face-frame"></div>
                                <span className="guide-text">Posisikan wajah di sini</span>
                            </div>

                            {isLoading && (
                                <div className="camera-loading">
                                    <div className="spinner"></div>
                                    <span>Memuat model... {loadingProgress}%</span>
                                </div>
                            )}
                        </div>

                        <div className="camera-actions">
                            <button
                                className="btn btn-success btn-xl"
                                onClick={() => markAttendance('in')}
                                disabled={isProcessing || !modelsLoaded || !isCameraActive}
                            >
                                {isProcessing ? (
                                    <>
                                        <div className="spinner" style={{ width: 20, height: 20 }}></div>
                                        Memproses...
                                    </>
                                ) : (
                                    <>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                            <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4" />
                                            <polyline points="10 17 15 12 10 7" />
                                            <line x1="15" y1="12" x2="3" y2="12" />
                                        </svg>
                                        ABSEN MASUK
                                    </>
                                )}
                            </button>
                            <button
                                className="btn btn-warning btn-xl"
                                onClick={() => markAttendance('out')}
                                disabled={isProcessing || !modelsLoaded || !isCameraActive}
                            >
                                {isProcessing ? (
                                    <>
                                        <div className="spinner" style={{ width: 20, height: 20 }}></div>
                                        Memproses...
                                    </>
                                ) : (
                                    <>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                                            <polyline points="16 17 21 12 16 7" />
                                            <line x1="21" y1="12" x2="9" y2="12" />
                                        </svg>
                                        ABSEN PULANG
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="result-container">
                    <div className="result-card">
                        {result ? (
                            <div className="result-success">
                                <div className={`result-avatar ${result.personType}`}>
                                    {getInitials(result.name)}
                                </div>
                                <div className="result-badge">
                                    {result.personType === 'student' ? '👨‍🎓 Siswa' : '👨‍🏫 Guru'}
                                </div>
                                <div className="result-name">{result.name}</div>
                                <div className="result-id">
                                    {result.personType === 'student' ? 'NIS' : 'NIP'}: {result.id}
                                </div>
                                {result.detail && (
                                    <div className="result-class">
                                        {result.personType === 'student' ? '📚' : '💼'} {result.detail}
                                    </div>
                                )}
                                <div className="result-confidence">
                                    Akurasi: {result.confidence}%
                                </div>
                                <div className="result-time">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                    {result.type === 'in' ? 'Absen Masuk' : 'Absen Pulang'} - {result.time}
                                </div>
                            </div>
                        ) : (
                            <div className="result-waiting">
                                <div className="waiting-icon">👤</div>
                                <h3>Menunggu Scan</h3>
                                <p>Arahkan wajah ke kamera kemudian tekan tombol absen</p>
                                <div className="registered-count">
                                    <span>📚 {students.length} Siswa</span>
                                    <span>👨‍🏫 {employees.length} Guru</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
