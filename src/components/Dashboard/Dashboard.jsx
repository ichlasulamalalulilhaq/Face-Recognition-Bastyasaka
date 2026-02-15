import { Link } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { useAuth } from '../../context/AuthContext'
import { useClock } from '../../hooks/useClock'

function StatCard({ value, label, icon, colorClass }) {
    return (
        <div className={`stat-card ${colorClass}`}>
            <div className="stat-content">
                <div className="stat-number">{value}</div>
                <div className="stat-label">{label}</div>
            </div>
            <div className="stat-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    {icon}
                </svg>
            </div>
        </div>
    )
}

function ActivityItem({ name, detail, time, type, personType }) {
    const getInitials = (name) => name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)

    return (
        <div className="activity-item">
            <div className={`activity-avatar ${personType}`}>{getInitials(name)}</div>
            <div className="activity-info">
                <div className="activity-name">
                    {name}
                    <span className="activity-role">
                        {personType === 'student' ? '👨‍🎓' : '👨‍🏫'}
                    </span>
                </div>
                <div className="activity-time">{detail} • {time}</div>
            </div>
            <span className={`activity-badge badge-${type}`}>
                {type === 'in' ? 'MASUK' : 'PULANG'}
            </span>
        </div>
    )
}

export default function Dashboard() {
    const { getStatistics, getTodayAttendance, loading } = useApp()
    const { profile, role } = useAuth()
    const { getGreeting, formatDate } = useClock()

    const stats = getStatistics()

    // Filter activity for current user only
    const allActivity = getTodayAttendance()
    const userId = role === 'student' ? profile?.studentId : profile?.employeeId
    const recentActivity = allActivity
        .filter(r => r.personId === userId)
        .slice(-8)
        .reverse()

    const formatTime = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    return (
        <div className="page">
            <div className="page-header">
                <div className="header-left">
                    <div className="greeting">
                        <h1>{getGreeting()} 👋</h1>
                        <p className="current-date-big">{formatDate()}</p>
                    </div>
                </div>
                {/* Removed Export Button from Dashboard - Use History Page */}
            </div>

            {loading && (
                <div className="loading-bar">
                    <div className="loading-bar-inner"></div>
                </div>
            )}

            {/* Stats Row - Siswa */}
            <div className="stats-section">
                <h3 className="stats-title">📚 Statistik Sekolah</h3>
                <div className="stats-row">
                    <StatCard
                        value={stats.totalStudents}
                        label="Total Siswa"
                        colorClass="stat-primary"
                        icon={<><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /></>}
                    />
                    <StatCard
                        value={stats.studentsPresent}
                        label="Siswa Hadir"
                        colorClass="stat-success"
                        icon={<><path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></>}
                    />
                    <StatCard
                        value={stats.totalEmployees}
                        label="Total Guru"
                        colorClass="stat-info"
                        icon={<><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" /></>}
                    />
                    <StatCard
                        value={stats.employeesPresent}
                        label="Guru Hadir"
                        colorClass="stat-warning"
                        icon={<><path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></>}
                    />
                </div>
            </div>

            <div className="content-grid">
                <div className="card activity-card">
                    <div className="card-header">
                        <h3>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                            </svg>
                            Aktivitas Anda Hari Ini
                        </h3>
                        <Link to="/history" className="link-more">Lihat Semua →</Link>
                    </div>
                    <div className="activity-list">
                        {recentActivity.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-icon">📋</div>
                                <p>Anda belum absen hari ini</p>
                            </div>
                        ) : (
                            recentActivity.map(record => (
                                <ActivityItem
                                    key={record.id}
                                    name={record.personName}
                                    detail={record.className || record.position || '-'}
                                    time={formatTime(record.timestamp)}
                                    type={record.type}
                                    personType={record.personType}
                                />
                            ))
                        )}
                    </div>
                </div>

                <div className="card action-card">
                    <div className="card-header">
                        <h3>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                            </svg>
                            Aksi Cepat
                        </h3>
                    </div>
                    <div className="action-buttons">
                        <Link to="/attendance" className="action-btn action-primary">
                            <div className="action-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="3" y="4" width="18" height="18" rx="2" />
                                    <path d="M9 16l2 2 4-4" />
                                </svg>
                            </div>
                            <div className="action-text">
                                <span className="action-title">Mulai Absensi</span>
                                <span className="action-desc">Scan wajah untuk absen</span>
                            </div>
                        </Link>

                        <Link to="/history" className="action-btn action-secondary">
                            <div className="action-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                                    <polyline points="14 2 14 8 20 8" />
                                    <line x1="16" y1="13" x2="8" y2="13" />
                                    <line x1="16" y1="17" x2="8" y2="17" />
                                </svg>
                            </div>
                            <div className="action-text">
                                <span className="action-title">Riwayat Saya</span>
                                <span className="action-desc">Cek catatan kehadiran</span>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
