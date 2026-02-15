import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import Modal from '../UI/Modal'

function StudentCard({ student, onDelete }) {
    const getInitials = (name) => name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)

    return (
        <div className="student-card">
            <div className="student-avatar">{getInitials(student.name)}</div>
            <div className="student-name">{student.name}</div>
            <div className="student-id">NIS: {student.id}</div>
            {student.department && <div className="student-class">{student.department}</div>}
            <div className="student-actions">
                <button className="btn btn-danger" onClick={() => onDelete(student)}>
                    Hapus
                </button>
            </div>
        </div>
    )
}

export default function Students() {
    const { employees, deleteEmployee, showToast } = useApp()
    const [searchTerm, setSearchTerm] = useState('')
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, student: null })

    const filteredEmployees = employees.filter(emp =>
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.id.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleDelete = (student) => {
        setDeleteModal({ isOpen: true, student })
    }

    const confirmDelete = () => {
        if (deleteModal.student) {
            deleteEmployee(deleteModal.student.id)
            showToast('success', 'Berhasil', 'Siswa berhasil dihapus')
        }
        setDeleteModal({ isOpen: false, student: null })
    }

    return (
        <section className="page active">
            <header className="page-header">
                <div className="header-left">
                    <h1>👥 Data Siswa</h1>
                    <p>Daftar siswa yang terdaftar dalam sistem</p>
                </div>
                <div className="header-right">
                    <div className="search-box">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="8" />
                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Cari nama atau NIS..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </header>

            <div className="students-grid">
                {filteredEmployees.length === 0 ? (
                    <div className="empty-state-large">
                        <div className="empty-icon">🎓</div>
                        <h3>{searchTerm ? 'Tidak Ditemukan' : 'Belum Ada Siswa'}</h3>
                        <p>{searchTerm ? 'Coba kata kunci lain' : 'Mulai dengan mendaftarkan siswa baru'}</p>
                        <Link to="/register" className="btn btn-primary">+ Daftar Siswa Baru</Link>
                    </div>
                ) : (
                    filteredEmployees.map(student => (
                        <StudentCard
                            key={student.id}
                            student={student}
                            onDelete={handleDelete}
                        />
                    ))
                )}
            </div>

            <Modal
                isOpen={deleteModal.isOpen}
                title="Hapus Siswa"
                onClose={() => setDeleteModal({ isOpen: false, student: null })}
                footer={
                    <>
                        <button
                            className="btn btn-outline"
                            onClick={() => setDeleteModal({ isOpen: false, student: null })}
                        >
                            Batal
                        </button>
                        <button className="btn btn-danger" onClick={confirmDelete}>
                            Hapus
                        </button>
                    </>
                }
            >
                <p>Yakin ingin menghapus <strong>{deleteModal.student?.name}</strong> dari sistem?</p>
            </Modal>
        </section>
    )
}
