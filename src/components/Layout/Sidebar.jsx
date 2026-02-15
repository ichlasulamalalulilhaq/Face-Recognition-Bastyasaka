import { NavLink } from 'react-router-dom'
import { useClock } from '../../hooks/useClock'
import { useAuth } from '../../context/AuthContext'
import logo from '../../assets/logo.png'

const navItems = [
    {
        label: 'Menu Utama',
        items: [
            { path: '/dashboard', name: 'Dashboard', icon: 'home' },
            { path: '/attendance', name: 'Absensi', icon: 'calendar' }
        ]
    },
    {
        label: 'Riwayat',
        items: [
            { path: '/history', name: 'Riwayat Absensi', icon: 'file-text' }
        ]
    }
]

const icons = {
    home: <><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></>,
    calendar: <><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /><path d="M9 16l2 2 4-4" /></>,
    'file-text': <><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" /></>,
    logout: <><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></>
}

export default function Sidebar({ isOpen, onClose }) {
    const { formatTime, formatDateShort } = useClock()
    const { profile, role, logout } = useAuth()

    const handleLogout = (e) => {
        if (e) e.preventDefault()
        console.log('Logout clicked - forcing navigation')

        // Close sidebar if on mobile
        if (onClose) onClose()

        // 1. Clear local storage/session (optional but good for cleanup)
        localStorage.clear()

        // 2. Fire logout request in background (don't wait for it)
        logout().catch(err => console.error('Background logout error:', err))

        // 3. Force immediate hard navigation to login
        window.location.href = '/login'
    }

    // Filter items based on role
    const filteredNavItems = [
        ...navItems,
        {
            label: 'Akun',
            items: [
                { path: '/settings', name: 'Pengaturan', icon: 'settings', roles: ['student'] }
            ]
        }
    ].map(section => ({
        ...section,
        items: section.items.filter(item => !item.roles || item.roles.includes(role))
    })).filter(section => section.items.length > 0)

    return (
        <nav className={`sidebar ${isOpen ? 'open' : ''}`}>
            <div className="sidebar-header">
                <div className="school-brand">
                    <img src={logo} alt="Logo" className="school-logo-img" />
                    <div className="school-info">
                        <h1>Bastyasaka</h1>
                        <p>Smart Attendance</p>
                    </div>
                </div>
            </div>

            {/* User Info */}
            <div className="sidebar-user">
                <div className="user-avatar">
                    {role === 'student' ? '👨‍🎓' : '👨‍🏫'}
                </div>
                <div className="user-info">
                    <span className="user-name">{profile?.name || 'User'}</span>
                    <span className="user-role">
                        {role === 'student'
                            ? profile?.class_name || 'Siswa'
                            : profile?.position || 'Guru'
                        }
                    </span>
                </div>
            </div>

            {filteredNavItems.map((section, idx) => (
                <div className="nav-section" key={idx}>
                    <span className="nav-label">{section.label}</span>
                    <ul className="nav-menu">
                        {section.items.map(item => (
                            <li className="nav-item" key={item.path}>
                                <NavLink
                                    to={item.path}
                                    onClick={onClose}
                                    className={({ isActive }) => isActive ? 'active' : ''}
                                >
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        {icons[item.icon]}
                                    </svg>
                                    <span>{item.name}</span>
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </div>
            ))}

            {/* Logout Button Section - Moved to bottom */}
            <div className="sidebar-logout-section">
                <button
                    type="button"
                    className="logout-btn"
                    onClick={handleLogout}
                    style={{ cursor: 'pointer', zIndex: 1000, position: 'relative' }}
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        {icons.logout}
                    </svg>
                    <span>Keluar</span>
                </button>
            </div>

            <div className="sidebar-footer">
                <div className="current-time">{formatTime()}</div>
                <div className="current-date">{formatDateShort()}</div>
            </div>
        </nav>
    )
}
