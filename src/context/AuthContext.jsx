/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { auth, studentsDB, employeesDB } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [profile, setProfile] = useState(null) // student or employee data
    const [role, setRole] = useState(null) // 'student' or 'employee'
    const [loading, setLoading] = useState(true)
    const [hasFaceRegistered, setHasFaceRegistered] = useState(false)

    // Check session on mount
    useEffect(() => {
        (async () => {
            try {
                setLoading(true)
                const session = await auth.getSession()
                if (session?.user) {
                    setUser(session.user)
                    await loadUserProfile(session.user.id)
                }
            } catch (error) {
                console.error('Error checking session:', error)
            } finally {
                setLoading(false)
            }
        })()

        // Listen for auth changes
        const { data: { subscription } } = auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' && session?.user) {
                await loadUserProfile(session.user.id)
            } else if (event === 'SIGNED_OUT') {
                setUser(null)
                setProfile(null)
                setRole(null)
                setHasFaceRegistered(false)
            }
        })

        return () => subscription?.unsubscribe()
    }, [])

    const loadUserProfile = async (authUserId) => {
        try {
            // Check if user is a student
            const student = await studentsDB.getByAuthUserId(authUserId)
            if (student) {
                setProfile(student)
                setRole('student')
                setHasFaceRegistered(!!student.face_descriptor)
                return
            }

            // Check if user is an employee
            const employee = await employeesDB.getByAuthUserId(authUserId)
            if (employee) {
                setProfile(employee)
                setRole('employee')
                setHasFaceRegistered(!!employee.face_descriptor)
                return
            }

            // No profile found - should not happen if register flow is correct
            console.warn('No profile found for user:', authUserId)
        } catch (error) {
            console.error('Error loading user profile:', error)
        }
    }

    const register = useCallback(async (email, password, userData, userRole) => {
        try {
            // 1. Create auth user
            const { user: authUser } = await auth.signUp(email, password)

            if (!authUser) {
                throw new Error('Gagal membuat akun')
            }

            // 2. Create profile based on role
            if (userRole === 'student') {
                const student = await studentsDB.add({
                    name: userData.name,
                    studentId: userData.studentId,
                    className: userData.className,
                    authUserId: authUser.id
                })
                setProfile(student)
                setRole('student')
            } else {
                const employee = await employeesDB.add({
                    name: userData.name,
                    employeeId: userData.employeeId,
                    position: userData.position,
                    authUserId: authUser.id
                })
                setProfile(employee)
                setRole('employee')
            }

            setUser(authUser)
            setHasFaceRegistered(false)

            return authUser
        } catch (error) {
            console.error('Register error:', error)
            throw error
        }
    }, [])

    const login = useCallback(async (email, password) => {
        try {
            const { user: authUser } = await auth.signIn(email, password)
            setUser(authUser)
            await loadUserProfile(authUser.id)
            return authUser
        } catch (error) {
            console.error('Login error:', error)
            throw error
        }
    }, [])

    const logout = useCallback(async () => {
        try {
            await auth.signOut()
            setUser(null)
            setProfile(null)
            setRole(null)
            setHasFaceRegistered(false)
        } catch (error) {
            console.error('Logout error:', error)
            throw error
        }
    }, [])

    const registerFace = useCallback(async (faceDescriptor) => {
        if (!profile || !role) {
            throw new Error('User profile not found')
        }

        try {
            if (role === 'student') {
                await studentsDB.updateFaceDescriptor(profile.id, faceDescriptor)
            } else {
                await employeesDB.updateFaceDescriptor(profile.id, faceDescriptor)
            }

            setHasFaceRegistered(true)

            // Reload profile to get updated data
            if (user) {
                await loadUserProfile(user.id)
            }
        } catch (error) {
            console.error('Error registering face:', error)
            throw error
        }
    }, [profile, role, user])

    const value = {
        user,
        profile,
        role,
        loading,
        hasFaceRegistered,
        isAuthenticated: !!user,
        register,
        login,
        logout,
        registerFace,
        refreshProfile: () => user && loadUserProfile(user.id)
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider')
    }
    return context
}
