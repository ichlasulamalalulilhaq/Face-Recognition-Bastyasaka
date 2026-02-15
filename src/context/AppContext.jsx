/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { studentsDB, employeesDB, attendanceStudentsDB, attendanceEmployeesDB } from '../lib/supabase'

const AppContext = createContext(null)

export function AppProvider({ children }) {
    const [students, setStudents] = useState([])
    const [employees, setEmployees] = useState([])
    const [studentAttendance, setStudentAttendance] = useState([])
    const [employeeAttendance, setEmployeeAttendance] = useState([])
    const [settings, _setSettings] = useState({
        workStartTime: '07:00',
        workEndTime: '14:00',
        lateThreshold: 15
    })
    const [toasts, setToasts] = useState([])
    const [modelsLoaded, setModelsLoaded] = useState(false)
    const [loading, setLoading] = useState(true)

    // Load from Supabase on mount
    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            setLoading(true)
            console.log('Loading data from Supabase...')
            const [studentsData, employeesData, studentAttData, employeeAttData] = await Promise.all([
                studentsDB.getAll(),
                employeesDB.getAll(),
                attendanceStudentsDB.getAll(),
                attendanceEmployeesDB.getAll()
            ])
            console.log('Loaded from Supabase - Students:', studentsData?.length, 'Employees:', employeesData?.length)

            // Transform students
            const transformedStudents = studentsData.map(s => ({
                id: s.student_id,
                name: s.name,
                studentId: s.student_id,
                className: s.class_name,
                faceDescriptor: s.face_descriptor ? JSON.parse(s.face_descriptor) : null,
                dbId: s.id,
                createdAt: s.created_at,
                type: 'student'
            }))

            // Transform employees (guru)
            const transformedEmployees = employeesData.map(e => ({
                id: e.employee_id,
                name: e.name,
                employeeId: e.employee_id,
                position: e.position,
                faceDescriptor: e.face_descriptor ? JSON.parse(e.face_descriptor) : null,
                dbId: e.id,
                createdAt: e.created_at,
                type: 'employee'
            }))

            // Transform student attendance
            const transformedStudentAtt = studentAttData.map(a => ({
                id: a.id.toString(),
                personId: a.student_id,
                personName: a.student_name,
                className: a.class_name,
                type: a.check_out_time ? 'out' : 'in',
                timestamp: a.check_in_time,
                checkOutTime: a.check_out_time,
                status: a.status,
                dbId: a.id,
                personType: 'student'
            }))

            // Transform employee attendance
            const transformedEmployeeAtt = employeeAttData.map(a => ({
                id: a.id.toString(),
                personId: a.employee_id,
                personName: a.employee_name,
                position: a.position,
                type: a.check_out_time ? 'out' : 'in',
                timestamp: a.check_in_time,
                checkOutTime: a.check_out_time,
                status: a.status,
                dbId: a.id,
                personType: 'employee'
            }))

            setStudents(transformedStudents)
            setEmployees(transformedEmployees)
            setStudentAttendance(transformedStudentAtt)
            setEmployeeAttendance(transformedEmployeeAtt)
        } catch (error) {
            console.error('Error loading data:', error)
            // Don't call showToast here - it's called before defined during initial mount
            // Just log error and continue with empty data
        } finally {
            setLoading(false)
        }
    }

    // Get all people for face matching
    const getAllPeople = useCallback(() => {
        return [...students, ...employees]
    }, [students, employees])

    // ==================== STUDENT OPERATIONS ====================
    const addStudent = useCallback(async (student) => {
        if (students.some(s => s.id === student.studentId)) {
            throw new Error('NIS sudah terdaftar')
        }

        try {
            const result = await studentsDB.add(student)
            const newStudent = {
                id: student.studentId,
                name: student.name,
                studentId: student.studentId,
                className: student.className,
                faceDescriptor: student.faceDescriptor,
                dbId: result.id,
                createdAt: result.created_at,
                type: 'student'
            }
            setStudents(prev => [...prev, newStudent])
            return newStudent
        } catch (error) {
            console.error('Error adding student:', error)
            throw new Error('Gagal menyimpan data siswa')
        }
    }, [students])

    const deleteStudent = useCallback(async (id) => {
        const student = students.find(s => s.id === id)
        if (student && student.dbId) {
            try {
                await studentsDB.delete(student.dbId)
            } catch (error) {
                console.error('Error deleting student:', error)
                throw new Error('Gagal menghapus data siswa')
            }
        }
        setStudents(prev => prev.filter(s => s.id !== id))
    }, [students])

    // ==================== EMPLOYEE OPERATIONS ====================
    const addEmployee = useCallback(async (employee) => {
        if (employees.some(e => e.id === employee.employeeId)) {
            throw new Error('NIP sudah terdaftar')
        }

        try {
            const result = await employeesDB.add(employee)
            const newEmployee = {
                id: employee.employeeId,
                name: employee.name,
                employeeId: employee.employeeId,
                position: employee.position,
                faceDescriptor: employee.faceDescriptor,
                dbId: result.id,
                createdAt: result.created_at,
                type: 'employee'
            }
            setEmployees(prev => [...prev, newEmployee])
            return newEmployee
        } catch (error) {
            console.error('Error adding employee:', error)
            throw new Error('Gagal menyimpan data guru')
        }
    }, [employees])

    const deleteEmployee = useCallback(async (id) => {
        const employee = employees.find(e => e.id === id)
        if (employee && employee.dbId) {
            try {
                await employeesDB.delete(employee.dbId)
            } catch (error) {
                console.error('Error deleting employee:', error)
                throw new Error('Gagal menghapus data guru')
            }
        }
        setEmployees(prev => prev.filter(e => e.id !== id))
    }, [employees])

    // ==================== ATTENDANCE OPERATIONS ====================
    const addAttendanceRecord = useCallback(async (record, personType) => {
        const now = new Date()
        const [workHour, workMin] = settings.workStartTime.split(':').map(Number)
        const workStart = new Date(now)
        workStart.setHours(workHour, workMin, 0, 0)

        let status = 'ontime'
        if (record.type === 'in') {
            const diffMinutes = (now - workStart) / (1000 * 60)
            if (diffMinutes > settings.lateThreshold) {
                status = 'late'
            }
        }

        try {
            if (personType === 'student') {
                const student = students.find(s => s.id === record.personId)
                if (!student) throw new Error('Siswa tidak ditemukan')

                // Check if already checked in today
                const today = new Date().toDateString()
                const todayRecords = studentAttendance.filter(r =>
                    r.personId === record.personId &&
                    new Date(r.timestamp).toDateString() === today
                )

                if (record.type === 'in' && todayRecords.some(r => r.type === 'in')) {
                    throw new Error('Siswa sudah absen masuk hari ini')
                }
                if (record.type === 'out') {
                    if (!todayRecords.some(r => r.type === 'in')) {
                        throw new Error('Siswa belum absen masuk hari ini')
                    }
                    if (todayRecords.some(r => r.type === 'out')) {
                        throw new Error('Siswa sudah absen pulang hari ini')
                    }
                }

                const result = await attendanceStudentsDB.add({
                    studentDbId: student.dbId,
                    studentName: student.name,
                    studentId: student.studentId,
                    className: student.className,
                    checkInTime: now.toISOString(),
                    checkOutTime: record.type === 'out' ? now.toISOString() : null,
                    status,
                    date: now.toISOString().split('T')[0]
                })

                const newRecord = {
                    id: result.id.toString(),
                    personId: student.studentId,
                    personName: student.name,
                    className: student.className,
                    type: record.type,
                    timestamp: now.toISOString(),
                    status,
                    dbId: result.id,
                    personType: 'student'
                }
                setStudentAttendance(prev => [...prev, newRecord])
                return newRecord
            } else {
                // Employee
                const employee = employees.find(e => e.id === record.personId)
                if (!employee) throw new Error('Guru tidak ditemukan')

                const today = new Date().toDateString()
                const todayRecords = employeeAttendance.filter(r =>
                    r.personId === record.personId &&
                    new Date(r.timestamp).toDateString() === today
                )

                if (record.type === 'in' && todayRecords.some(r => r.type === 'in')) {
                    throw new Error('Guru sudah absen masuk hari ini')
                }
                if (record.type === 'out') {
                    if (!todayRecords.some(r => r.type === 'in')) {
                        throw new Error('Guru belum absen masuk hari ini')
                    }
                    if (todayRecords.some(r => r.type === 'out')) {
                        throw new Error('Guru sudah absen pulang hari ini')
                    }
                }

                const result = await attendanceEmployeesDB.add({
                    employeeDbId: employee.dbId,
                    employeeName: employee.name,
                    employeeId: employee.employeeId,
                    position: employee.position,
                    checkInTime: now.toISOString(),
                    checkOutTime: record.type === 'out' ? now.toISOString() : null,
                    status,
                    date: now.toISOString().split('T')[0]
                })

                const newRecord = {
                    id: result.id.toString(),
                    personId: employee.employeeId,
                    personName: employee.name,
                    position: employee.position,
                    type: record.type,
                    timestamp: now.toISOString(),
                    status,
                    dbId: result.id,
                    personType: 'employee'
                }
                setEmployeeAttendance(prev => [...prev, newRecord])
                return newRecord
            }
        } catch (error) {
            console.error('Error adding attendance:', error)
            throw error
        }
    }, [students, employees, studentAttendance, employeeAttendance, settings])

    // Get today's attendance
    const getTodayAttendance = useCallback((personType = 'all') => {
        const today = new Date().toDateString()

        if (personType === 'student') {
            return studentAttendance.filter(r => new Date(r.timestamp).toDateString() === today)
        } else if (personType === 'employee') {
            return employeeAttendance.filter(r => new Date(r.timestamp).toDateString() === today)
        }

        const studentAtt = studentAttendance.filter(r => new Date(r.timestamp).toDateString() === today)
        const employeeAtt = employeeAttendance.filter(r => new Date(r.timestamp).toDateString() === today)
        return [...studentAtt, ...employeeAtt]
    }, [studentAttendance, employeeAttendance])

    // Get attendance by date
    const getAttendanceByDate = useCallback((date, personType = 'all') => {
        const targetDate = new Date(date).toDateString()

        if (personType === 'student') {
            return studentAttendance.filter(r => new Date(r.timestamp).toDateString() === targetDate)
        } else if (personType === 'employee') {
            return employeeAttendance.filter(r => new Date(r.timestamp).toDateString() === targetDate)
        }

        const studentAtt = studentAttendance.filter(r => new Date(r.timestamp).toDateString() === targetDate)
        const employeeAtt = employeeAttendance.filter(r => new Date(r.timestamp).toDateString() === targetDate)
        return [...studentAtt, ...employeeAtt]
    }, [studentAttendance, employeeAttendance])

    // Statistics
    const getStatistics = useCallback(() => {
        const todayStudentAtt = getTodayAttendance('student')
        const todayEmployeeAtt = getTodayAttendance('employee')

        const studentsPresent = [...new Set(todayStudentAtt.filter(r => r.type === 'in').map(r => r.personId))]
        const employeesPresent = [...new Set(todayEmployeeAtt.filter(r => r.type === 'in').map(r => r.personId))]

        const studentsLate = todayStudentAtt.filter(r => r.type === 'in' && r.status === 'late').length
        const employeesLate = todayEmployeeAtt.filter(r => r.type === 'in' && r.status === 'late').length

        return {
            totalStudents: students.length,
            totalEmployees: employees.length,
            studentsPresent: studentsPresent.length,
            employeesPresent: employeesPresent.length,
            studentsLate,
            employeesLate,
            studentAttendanceRate: students.length > 0 ? Math.round((studentsPresent.length / students.length) * 100) : 0,
            employeeAttendanceRate: employees.length > 0 ? Math.round((employeesPresent.length / employees.length) * 100) : 0
        }
    }, [students, employees, getTodayAttendance])

    // Toast notifications
    const showToast = useCallback((type, title, message, duration = 5000) => {
        const id = Date.now()
        setToasts(prev => [...prev, { id, type, title, message }])
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id))
        }, duration)
    }, [])

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id))
    }, [])

    // Export CSV
    const exportToCSV = useCallback((personType = 'all') => {
        let records = []
        if (personType === 'student' || personType === 'all') {
            records = [...records, ...studentAttendance.map(r => ({ ...r, role: 'Siswa' }))]
        }
        if (personType === 'employee' || personType === 'all') {
            records = [...records, ...employeeAttendance.map(r => ({ ...r, role: 'Guru' }))]
        }

        const headers = ['Nama', 'ID', 'Role', 'Kelas/Jabatan', 'Tipe', 'Tanggal', 'Waktu', 'Status']
        const rows = records.map(r => {
            const date = new Date(r.timestamp)
            return [
                r.personName,
                r.personId,
                r.role || (r.personType === 'student' ? 'Siswa' : 'Guru'),
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
        link.download = `absensi_bastyasaka_${personType}_${new Date().toISOString().split('T')[0]}.csv`
        link.click()
    }, [studentAttendance, employeeAttendance])

    const refreshData = useCallback(async () => {
        await loadData()
    }, [])

    // Expose refreshData to window for cross-component access
    useEffect(() => {
        window.refreshAppData = refreshData
        return () => {
            delete window.refreshAppData
        }
    }, [refreshData])

    const value = {
        students,
        employees,
        studentAttendance,
        employeeAttendance,
        settings,
        toasts,
        modelsLoaded,
        loading,
        setModelsLoaded,
        addStudent,
        deleteStudent,
        addEmployee,
        deleteEmployee,
        addAttendanceRecord,
        getTodayAttendance,
        getAttendanceByDate,
        getStatistics,
        getAllPeople,
        showToast,
        removeToast,
        exportToCSV,
        refreshData
    }

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
    const context = useContext(AppContext)
    if (!context) {
        throw new Error('useApp must be used within AppProvider')
    }
    return context
}
