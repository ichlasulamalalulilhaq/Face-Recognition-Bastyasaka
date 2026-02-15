import logo from '../../assets/logo.png'

export default function LoadingOverlay({ progress = 0 }) {
    return (
        <div className="loading-overlay">
            <div className="loading-content">
                <div className="school-logo-loading">
                    <img src={logo} alt="Bastyasaka" className="logo-loading-img" />
                </div>
                <h2>Bastyasaka Smart Attendance</h2>
                <p>Sistem Absensi Digital</p>
                <div className="loading-spinner"></div>
                <div className="loading-progress">
                    <div className="loading-progress-bar" style={{ width: `${progress}%` }}></div>
                </div>
            </div>
        </div>
    )
}
