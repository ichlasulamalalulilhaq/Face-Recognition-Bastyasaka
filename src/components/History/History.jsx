import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { useAuth } from '../../context/AuthContext'

export default function History() {
    const { studentAttendance, employeeAttendance, getAttendanceByDate } = useApp()
    const { profile, role } = useAuth()
    const [dateFilter, setDateFilter] = useState('')

    // Combine and filter attendance for current user
    const getAllRecords = () => {
        let records = []

        // 1. Get raw records
        if (dateFilter) {
            records = getAttendanceByDate(dateFilter, role)
        } else {
            if (role === 'student') {
                records = [...studentAttendance]
            } else {
                records = [...employeeAttendance]
            }
        }

        // 2. Filter by current user ID
        // Note: profile comes from useAuth which loads directly from DB, so it uses snake_case keys
        // AppContext uses transformed camelCase keys. We check for both to be safe.
        const userId = role === 'student'
            ? (profile?.student_id || profile?.studentId)
            : (profile?.employee_id || profile?.employeeId)

        return records
            .filter(r => r.personId === userId)
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, 100)
    }

    const records = getAllRecords()

    const formatDate = (timestamp) => {
        return new Date(timestamp).toLocaleDateString('id-ID', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
    }

    const formatTime = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const handleExportCSV = () => {
        if (records.length === 0) {
            alert('Tidak ada data untuk diekspor')
            return
        }

        const headers = ['Nama', 'ID', 'Role', 'Kelas/Jabatan', 'Tipe', 'Tanggal', 'Waktu', 'Status']
        const rows = records.map(r => {
            const date = new Date(r.timestamp)
            return [
                r.personName,
                r.personId,
                r.personType === 'student' ? 'Siswa' : 'Guru',
                r.className || r.position || '-',
                r.type === 'in' ? 'Masuk' : 'Pulang',
                date.toLocaleDateString('id-ID'),
                date.toLocaleTimeString('id-ID'),
                r.status === 'ontime' ? 'Tepat Waktu' : 'Terlambat'
            ]
        })

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n')

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.download = `riwayat_absensi_${role}_${new Date().toISOString().split('T')[0]}.csv`
        link.click()
    }

    const clearFilter = () => {
        setDateFilter('')
    }

    return (
        <div className="page">
            <div className="page-header">
                <div className="header-left">
                    <h1>📊 Riwayat Absensi</h1>
                    <p>Catatan kehadiran {role === 'student' ? 'Anda' : 'Bapak/Ibu Guru'}</p>
                </div>
                <div className="header-right">
                    <input
                        type="date"
                        className="date-input"
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                    />
                    <button className="btn btn-outline" onClick={clearFilter}>
                        Reset
                    </button>
                    <button className="btn btn-primary" onClick={handleExportCSV}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                            <polyline points="7 10 12 15 17 10" />
                            <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                        Export CSV
                    </button>
                </div>
            </div>

            <div className="history-summary">
                <div className="summary-item">
                    <span className="summary-label">Total Kehadiran:</span>
                    <span className="summary-value">{records.length}</span>
                </div>
                <div className="summary-item">
                    <span className="summary-label">Filter:</span>
                    <span className="summary-value">
                        {dateFilter ? formatDate(dateFilter) : 'Semua Waktu'}
                    </span>
                </div>
            </div>

            <div className="card table-card">
                <div className="table-wrapper">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Nama</th>
                                <th>ID</th>
                                <th>Role</th>
                                <th>Kelas/Jabatan</th>
                                <th>Tipe</th>
                                <th>Waktu</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {records.length === 0 ? (
                                <tr className="empty-row">
                                    <td colSpan="7">
                                        <div className="empty-state-table">
                                            <span>📅</span>
                                            <p>Belum ada riwayat absensi</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                records.map(record => (
                                    <tr key={`${record.personType}-${record.id}`}>
                                        <td><strong>{record.personName}</strong></td>
                                        <td>{record.personId}</td>
                                        <td>
                                            <span className={`role-badge role-${record.personType}`}>
                                                {record.personType === 'student' ? '👨‍🎓 Siswa' : '👨‍🏫 Guru'}
                                            </span>
                                        </td>
                                        <td>{record.className || record.position || '-'}</td>
                                        <td>
                                            <span className={`activity-badge badge-${record.type}`}>
                                                {record.type === 'in' ? 'MASUK' : 'PULANG'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="time-cell">
                                                <span className="time-date">{formatDate(record.timestamp)}</span>
                                                <span className="time-hour">{formatTime(record.timestamp)}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`status-badge status-${record.status}`}>
                                                {record.status === 'ontime' ? '✓ Tepat Waktu' : '⚠ Terlambat'}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
