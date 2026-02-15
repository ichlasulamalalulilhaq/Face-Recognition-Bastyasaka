import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://cpgswxnntwegtniszojy.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNwZ3N3eG5udHdlZ3RuaXN6b2p5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTU5NTY2OCwiZXhwIjoyMDg1MTcxNjY4fQ.I49uTpKAvr2vW-EWByRxk-CfiseB6Db2-13zJu-xnlM'

export const supabase = createClient(supabaseUrl, supabaseKey)

// ==================== AUTH ====================
export const auth = {
  async signUp(email, password) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    })
    if (error) throw error
    return data
  },

  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    if (error) throw error
    return data
  },

  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  async getSession() {
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) throw error
    return session
  },

  async getUser() {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    return user
  },

  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback)
  }
}

// ==================== STUDENTS ====================
export const studentsDB = {
  async getAll() {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching students:', error)
      return []
    }
    return data || []
  },

  async getByAuthUserId(authUserId) {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('auth_user_id', authUserId)
      .single()
    
    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching student by auth id:', error)
      return null
    }
    return data
  },

  async add(student) {
    const insertData = {
      name: student.name,
      student_id: student.studentId,
      class_name: student.className
    }
    
    if (student.authUserId) {
      insertData.auth_user_id = student.authUserId
    }
    
    if (student.faceDescriptor) {
      insertData.face_descriptor = JSON.stringify(student.faceDescriptor)
    }

    const { data, error } = await supabase
      .from('students')
      .insert([insertData])
      .select()
      .single()
    
    if (error) {
      console.error('Error adding student:', error)
      throw error
    }
    return data
  },

  async updateFaceDescriptor(id, faceDescriptor) {
    const { data, error } = await supabase
      .from('students')
      .update({ face_descriptor: JSON.stringify(faceDescriptor) })
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating face descriptor:', error)
      throw error
    }
    return data
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('students')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating student:', error)
      throw error
    }
    return data
  },

  async delete(id) {
    const { error } = await supabase
      .from('students')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('Error deleting student:', error)
      throw error
    }
  }
}

// ==================== EMPLOYEES (GURU) ====================
export const employeesDB = {
  async getAll() {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching employees:', error)
      return []
    }
    return data || []
  },

  async getByAuthUserId(authUserId) {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('auth_user_id', authUserId)
      .single()
    
    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching employee by auth id:', error)
      return null
    }
    return data
  },

  async add(employee) {
    const insertData = {
      name: employee.name,
      employee_id: employee.employeeId,
      position: employee.position
    }
    
    if (employee.authUserId) {
      insertData.auth_user_id = employee.authUserId
    }
    
    if (employee.faceDescriptor) {
      insertData.face_descriptor = JSON.stringify(employee.faceDescriptor)
    }

    const { data, error } = await supabase
      .from('employees')
      .insert([insertData])
      .select()
      .single()
    
    if (error) {
      console.error('Error adding employee:', error)
      throw error
    }
    return data
  },

  async updateFaceDescriptor(id, faceDescriptor) {
    const { data, error } = await supabase
      .from('employees')
      .update({ face_descriptor: JSON.stringify(faceDescriptor) })
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating face descriptor:', error)
      throw error
    }
    return data
  },

  async delete(id) {
    const { error } = await supabase
      .from('employees')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('Error deleting employee:', error)
      throw error
    }
  }
}

// ==================== ATTENDANCE STUDENTS ====================
export const attendanceStudentsDB = {
  async getAll() {
    const { data, error } = await supabase
      .from('attendance_students')
      .select('*')
      .order('check_in_time', { ascending: false })
    
    if (error) {
      console.error('Error fetching student attendance:', error)
      return []
    }
    return data || []
  },

  async add(record) {
    const { data, error } = await supabase
      .from('attendance_students')
      .insert([{
        student_db_id: record.studentDbId,
        student_name: record.studentName,
        student_id: record.studentId,
        class_name: record.className,
        check_in_time: record.checkInTime,
        check_out_time: record.checkOutTime,
        status: record.status,
        date: record.date
      }])
      .select()
      .single()
    
    if (error) {
      console.error('Error adding student attendance:', error)
      throw error
    }
    return data
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('attendance_students')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating student attendance:', error)
      throw error
    }
    return data
  }
}

// ==================== ATTENDANCE EMPLOYEES ====================
export const attendanceEmployeesDB = {
  async getAll() {
    const { data, error } = await supabase
      .from('attendance_employees')
      .select('*')
      .order('check_in_time', { ascending: false })
    
    if (error) {
      console.error('Error fetching employee attendance:', error)
      return []
    }
    return data || []
  },

  async add(record) {
    const { data, error } = await supabase
      .from('attendance_employees')
      .insert([{
        employee_db_id: record.employeeDbId,
        employee_name: record.employeeName,
        employee_id: record.employeeId,
        position: record.position,
        check_in_time: record.checkInTime,
        check_out_time: record.checkOutTime,
        status: record.status,
        date: record.date
      }])
      .select()
      .single()
    
    if (error) {
      console.error('Error adding employee attendance:', error)
      throw error
    }
    return data
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('attendance_employees')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating employee attendance:', error)
      throw error
    }
    return data
  }
}
