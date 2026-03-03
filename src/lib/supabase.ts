import { createClient } from '@supabase/supabase-js';
import {
  dummyStudents,
  dummyRooms,
  dummyBuildings,
  dummyPayments,
  dummyEmailLogs,
  dummySettings,
  getDashboardStats as getDashboardStatsDummy,
  getMonthlyRevenueData as getMonthlyRevenueDataDummy,
  getBuildingOccupancyData as getBuildingOccupancyDataDummy,
  dummyMaintenanceTickets,
  dummyNotices,
  dummyDocuments,
  dummyStaff
} from './dummyData';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Create Supabase client (will work when credentials are provided)
export const supabase = createClient(supabaseUrl, supabaseKey);

// Flag to use dummy data when Supabase is not connected
const useDummyData = !supabaseUrl || supabaseUrl.includes('your-project');

// Helper functions for common operations

// Students
export async function getStudents(filters?: { status?: string; building_id?: string; search?: string }) {
  if (useDummyData) {
    let filtered = [...dummyStudents];

    if (filters?.status && filters.status !== 'all') {
      filtered = filtered.filter(s => s.status === filters.status);
    }

    if (filters?.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(s =>
        s.first_name.toLowerCase().includes(search) ||
        s.last_name.toLowerCase().includes(search) ||
        s.email.toLowerCase().includes(search) ||
        s.student_id.toLowerCase().includes(search)
      );
    }

    return filtered;
  }

  let query = supabase
    .from('students')
    .select(`
      *,
      room:rooms(*, building:buildings(*))
    `)
    .order('created_at', { ascending: false });

  if (filters?.status && filters.status !== 'all') {
    query = query.eq('status', filters.status);
  }

  if (filters?.search) {
    query = query.or(`first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,student_id.ilike.%${filters.search}%`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function getStudentById(id: string) {
  if (useDummyData) {
    return dummyStudents.find(s => s.id === id) || null;
  }

  const { data, error } = await supabase
    .from('students')
    .select(`
      *,
      room:rooms(*, building:buildings(*))
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function createStudent(student: object) {
  if (useDummyData) {
    const newStudent = {
      id: `s${Date.now()}`,
      ...student,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    dummyStudents.push(newStudent as any);
    return newStudent;
  }

  const { data, error } = await supabase
    .from('students')
    .insert(student)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateStudent(id: string, student: object) {
  if (useDummyData) {
    const index = dummyStudents.findIndex(s => s.id === id);
    if (index !== -1) {
      dummyStudents[index] = { ...dummyStudents[index], ...student, updated_at: new Date().toISOString() };
      return dummyStudents[index];
    }
    return null;
  }

  const { data, error } = await supabase
    .from('students')
    .update(student)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteStudent(id: string) {
  if (useDummyData) {
    const index = dummyStudents.findIndex(s => s.id === id);
    if (index !== -1) {
      dummyStudents.splice(index, 1);
    }
    return;
  }

  const { error } = await supabase
    .from('students')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function exitStudent(studentId: string, roomId: string | null, exitDate: string) {
  if (useDummyData) {
    const sIndex = dummyStudents.findIndex(s => s.id === studentId);
    if (sIndex !== -1) {
      dummyStudents[sIndex] = {
        ...dummyStudents[sIndex],
        status: 'inactive',
        room_id: null,
        exit_date: exitDate,
        updated_at: new Date().toISOString()
      };
    }
    if (roomId) {
      const rIndex = dummyRooms.findIndex(r => r.id === roomId);
      if (rIndex !== -1) {
        dummyRooms[rIndex].status = 'available';
      }
    }
    return true;
  }

  // 1. Update student
  const { error: studentError } = await supabase
    .from('students')
    .update({
      status: 'inactive',
      room_id: null,
      exit_date: exitDate,
      updated_at: new Date().toISOString()
    })
    .eq('id', studentId);

  if (studentError) throw studentError;

  // 2. Free the room if assigned
  if (roomId) {
    const { error: roomError } = await supabase
      .from('rooms')
      .update({ status: 'available' })
      .eq('id', roomId);
    if (roomError) throw roomError;
  }

  return true;
}

// Rooms
export async function getRooms(filters?: { building_id?: string; status?: string }) {
  if (useDummyData) {
    let filtered = [...dummyRooms];

    if (filters?.building_id && filters.building_id !== 'all') {
      filtered = filtered.filter(r => r.building_id === filters.building_id);
    }

    if (filters?.status && filters.status !== 'all') {
      filtered = filtered.filter(r => r.status === filters.status);
    }

    return filtered;
  }

  let query = supabase
    .from('rooms')
    .select(`
      *,
      building:buildings(*),
      students(*)
    `)
    .order('room_number');

  if (filters?.building_id && filters.building_id !== 'all') {
    query = query.eq('building_id', filters.building_id);
  }

  if (filters?.status && filters.status !== 'all') {
    query = query.eq('status', filters.status);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function getRoomById(id: string) {
  if (useDummyData) {
    return dummyRooms.find(r => r.id === id) || null;
  }

  const { data, error } = await supabase
    .from('rooms')
    .select(`
      *,
      building:buildings(*),
      students(*)
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function createRoom(room: object) {
  if (useDummyData) {
    const newRoom = {
      id: `r${Date.now()}`,
      ...room,
      created_at: new Date().toISOString()
    };
    dummyRooms.push(newRoom as any);
    return newRoom;
  }

  const { data, error } = await supabase
    .from('rooms')
    .insert(room)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateRoom(id: string, room: object) {
  if (useDummyData) {
    const index = dummyRooms.findIndex(r => r.id === id);
    if (index !== -1) {
      dummyRooms[index] = { ...dummyRooms[index], ...room };
      return dummyRooms[index];
    }
    return null;
  }

  const { data, error } = await supabase
    .from('rooms')
    .update(room)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteRoom(id: string) {
  if (useDummyData) {
    const index = dummyRooms.findIndex(r => r.id === id);
    if (index !== -1) {
      dummyRooms.splice(index, 1);
    }
    return;
  }

  const { error } = await supabase
    .from('rooms')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// Buildings
export async function getBuildings() {
  if (useDummyData) {
    return dummyBuildings;
  }

  const { data, error } = await supabase
    .from('buildings')
    .select('*')
    .order('name');

  if (error) throw error;
  return data || [];
}

export async function createBuilding(building: object) {
  if (useDummyData) {
    const newBuilding = {
      id: `b${Date.now()}`,
      ...building,
      created_at: new Date().toISOString()
    };
    dummyBuildings.push(newBuilding as any);
    return newBuilding;
  }

  const { data, error } = await supabase
    .from('buildings')
    .insert(building)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function createBulkRooms(rooms: object[]) {
  if (useDummyData) {
    const newRooms = rooms.map((room, i) => ({
      id: `r${Date.now()}_${i}`,
      ...room,
      created_at: new Date().toISOString()
    }));
    dummyRooms.push(...(newRooms as any[]));
    return newRooms;
  }

  const { data, error } = await supabase
    .from('rooms')
    .insert(rooms)
    .select();

  if (error) throw error;
  return data;
}

// Payments
export async function getPayments(filters?: { status?: string; month?: string; student_id?: string; order?: 'due_date' | 'paid_date' }) {
  const orderBy = filters?.order || 'due_date';
  if (useDummyData) {
    let filtered = [...dummyPayments];

    if (filters?.status && filters.status !== 'all') {
      filtered = filtered.filter(p => p.status === filters.status);
    }

    if (filters?.student_id) {
      filtered = filtered.filter(p => p.student_id === filters.student_id);
    }

    if (filters?.month) {
      filtered = filtered.filter(p => p.due_date.startsWith(filters.month!));
    }

    const sortKey = orderBy === 'paid_date' ? 'paid_date' : 'due_date';
    return filtered.sort((a, b) => {
      const dateA = a[sortKey] || '0';
      const dateB = b[sortKey] || '0';
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    });
  }

  let query = supabase
    .from('payments')
    .select(`
      *,
      student:students(*),
      room:rooms(*)
    `)
    .order(orderBy, { ascending: false });

  if (filters?.status && filters.status !== 'all') {
    query = query.eq('status', filters.status);
  }

  if (filters?.student_id) {
    query = query.eq('student_id', filters.student_id);
  }

  if (filters?.month) {
    const startDate = `${filters.month}-01`;
    const endDate = `${filters.month}-31`;
    query = query.gte('due_date', startDate).lte('due_date', endDate);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function createPayment(payment: object) {
  if (useDummyData) {
    const newPayment = {
      id: `p${Date.now()}`,
      ...payment,
      created_at: new Date().toISOString()
    };
    dummyPayments.push(newPayment as any);
    return newPayment;
  }

  const { data, error } = await supabase
    .from('payments')
    .insert(payment)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updatePayment(id: string, payment: object) {
  if (useDummyData) {
    const index = dummyPayments.findIndex(p => p.id === id);
    if (index !== -1) {
      dummyPayments[index] = { ...dummyPayments[index], ...payment };
      return dummyPayments[index];
    }
    return null;
  }

  const { data, error } = await supabase
    .from('payments')
    .update(payment)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function markPaymentAsPaid(id: string, paymentData: { paid_date: string; payment_method: string; transaction_id?: string }) {
  if (useDummyData) {
    const index = dummyPayments.findIndex(p => p.id === id);
    if (index !== -1) {
      dummyPayments[index] = {
        ...dummyPayments[index],
        ...paymentData,
        status: 'paid'
      };
      return dummyPayments[index];
    }
    return null;
  }

  const { data, error } = await supabase
    .from('payments')
    .update({
      ...paymentData,
      status: 'paid'
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Email Logs
export async function getEmailLogs() {
  if (useDummyData) {
    return dummyEmailLogs.sort((a, b) => new Date(b.sent_at).getTime() - new Date(a.sent_at).getTime());
  }

  const { data, error } = await supabase
    .from('email_logs')
    .select(`
      *,
      student:students(*)
    `)
    .order('sent_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createEmailLog(emailLog: object) {
  if (useDummyData) {
    const newLog = {
      id: `e${Date.now()}`,
      ...emailLog,
      sent_at: new Date().toISOString()
    };
    dummyEmailLogs.push(newLog as any);
    return newLog;
  }

  const { data, error } = await supabase
    .from('email_logs')
    .insert(emailLog)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Maintenance Tickets
export async function getMaintenanceTickets(studentId?: string) {
  if (useDummyData) {
    let filtered = [...dummyMaintenanceTickets];
    if (studentId) {
      filtered = filtered.filter(t => t.student_id === studentId);
    }
    return filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  let query = supabase
    .from('maintenance_tickets')
    .select('*, student:students(*)')
    .order('created_at', { ascending: false });

  if (studentId) {
    query = query.eq('student_id', studentId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function createMaintenanceTicket(ticket: any) {
  if (useDummyData) {
    const newTicket = {
      id: `mt${Date.now()}`,
      ...ticket,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    dummyMaintenanceTickets.push(newTicket as any);
    return newTicket;
  }

  const { data, error } = await supabase
    .from('maintenance_tickets')
    .insert(ticket)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Notices
export async function getNotices() {
  if (useDummyData) {
    return [...dummyNotices].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  const { data, error } = await supabase
    .from('notices')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

// Documents
export async function getDocuments(studentId: string) {
  if (useDummyData) {
    return dummyDocuments.filter(d => d.student_id === studentId);
  }

  const { data, error } = await supabase
    .from('student_documents')
    .select('*')
    .eq('student_id', studentId)
    .order('uploaded_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

// Settings
export async function getSettings() {
  if (useDummyData) {
    return dummySettings;
  }

  const { data, error } = await supabase
    .from('settings')
    .select('*')
    .single();

  if (error) throw error;
  return data;
}

export async function updateSettings(id: string, settings: object) {
  if (useDummyData) {
    Object.assign(dummySettings, settings, { updated_at: new Date().toISOString() });
    return dummySettings;
  }

  const { data, error } = await supabase
    .from('settings')
    .update(settings)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Dashboard Analytics
export async function getDashboardStats() {
  if (useDummyData) {
    return getDashboardStatsDummy();
  }

  try {
    // Get total active students
    const { count: totalStudents } = await supabase
      .from('students')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    // Get room stats
    const { data: roomsData } = await supabase
      .from('rooms')
      .select('status');

    const totalRooms = roomsData?.length || 0;
    const occupiedRooms = roomsData?.filter(r => r.status === 'occupied').length || 0;

    // Get current month payments
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

    const { data: paidPayments } = await supabase
      .from('payments')
      .select('amount')
      .eq('status', 'paid')
      .gte('paid_date', firstDay)
      .lte('paid_date', lastDay);

    const monthlyRevenue = paidPayments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;

    // Get overdue & pending counts dynamically
    const todayStr = now.toISOString().split('T')[0];

    const { data: allPending } = await supabase
      .from('payments')
      .select('due_date, status')
      .eq('status', 'pending');

    const dynamicOverdue = allPending?.filter(p => p.due_date < todayStr).length || 0;
    const { count: dbOverdue } = await supabase
      .from('payments')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'overdue');

    const { count: dbPending } = await supabase
      .from('payments')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    return {
      totalStudents: totalStudents || 0,
      totalRooms,
      occupiedRooms,
      occupancyRate: totalRooms ? Math.round((occupiedRooms / totalRooms) * 100) : 0,
      monthlyRevenue,
      overduePayments: (dbOverdue || 0) + dynamicOverdue,
      pendingPayments: (dbPending || 0) - dynamicOverdue
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return {
      totalStudents: 0, totalRooms: 0, occupiedRooms: 0,
      occupancyRate: 0, monthlyRevenue: 0, overduePayments: 0, pendingPayments: 0
    };
  }
}

export async function getMonthlyRevenueData(months: number = 6) {
  if (useDummyData) {
    return getMonthlyRevenueDataDummy(months);
  }

  try {
    const { data: payments } = await supabase
      .from('payments')
      .select('amount, paid_date, status')
      .eq('status', 'paid')
      .not('paid_date', 'is', null)
      .order('paid_date', { ascending: true });

    // Group payments by month
    const monthlyMap = new Map<string, number>();
    const now = new Date();

    // Initialize last N months
    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.toLocaleString('default', { month: 'short' })} ${String(d.getFullYear()).slice(2)}`;
      monthlyMap.set(key, 0);
    }

    // Sum payments into months
    payments?.forEach(p => {
      if (p.paid_date) {
        const d = new Date(p.paid_date);
        const key = `${d.toLocaleString('default', { month: 'short' })} ${String(d.getFullYear()).slice(2)}`;
        if (monthlyMap.has(key)) {
          monthlyMap.set(key, (monthlyMap.get(key) || 0) + Number(p.amount));
        }
      }
    });

    return Array.from(monthlyMap.entries()).map(([month, revenue]) => ({
      month,
      revenue,
      target: 50000
    }));
  } catch (error) {
    console.error('Error fetching revenue data:', error);
    return [];
  }
}

export async function getBuildingOccupancyData() {
  if (useDummyData) {
    return getBuildingOccupancyDataDummy();
  }

  try {
    const { data: buildings } = await supabase
      .from('buildings')
      .select('id, name');

    const { data: rooms } = await supabase
      .from('rooms')
      .select('building_id, status');

    return (buildings || []).map(building => {
      const buildingRooms = rooms?.filter(r => r.building_id === building.id) || [];
      const totalRooms = buildingRooms.length;
      const occupiedRooms = buildingRooms.filter(r => r.status === 'occupied').length;

      return {
        buildingName: building.name,
        totalRooms,
        occupiedRooms,
        occupancyRate: totalRooms ? Math.round((occupiedRooms / totalRooms) * 100) : 0
      };
    });
  } catch (error) {
    console.error('Error fetching occupancy data:', error);
    return [];
  }
}


// Auth Helpers
export async function signUp(email: string, password: string, role: 'admin' | 'student', metadata: any = {}) {
  console.log('--- SIGN UP INITIATED ---');
  console.log('Email:', email);
  console.log('Role:', role);
  console.log('Metadata:', metadata);

  if (role === 'student') {
    throw new Error('Student registration is disabled. Please contact your administrator.');
  }

  if (useDummyData) {
    console.log('Using dummy data for sign up');
    // Check if student exists by email to link them
    const userId = `u${Date.now()}`;

    // Check if they are invited staff
    const isInvited = dummyStaff.find(s => s.email === email);

    const user = {
      id: userId,
      email,
      user_metadata: {
        ...metadata,
        role: isInvited ? 'staff' : role,
        is_ceo: isInvited ? false : (role === 'admin' ? true : false)
      }
    };

    localStorage.setItem('sb-auth-token', JSON.stringify({ user }));
    return { data: { user }, error: null };
  }

  // Check if email is in staff table for invited users
  let staffMember = null;
  try {
    const { data } = await supabase
      .from('staff')
      .select('*')
      .eq('email', email)
      .maybeSingle();
    staffMember = data;
    if (staffMember) console.log('Found invited staff member:', staffMember);
  } catch (e) {
    console.error('Staff table check failed (it might not exist yet):', e);
  }

  const signUpOptions = {
    email,
    password,
    options: {
      data: {
        ...metadata,
        role: staffMember ? 'staff' : role,
        is_ceo: staffMember ? false : (role === 'admin' ? true : false)
      }
    }
  };

  console.log('Calling supabase.auth.signUp with:', JSON.stringify(signUpOptions, null, 2));

  const { data, error } = await supabase.auth.signUp(signUpOptions);

  if (error) {
    console.error('Supabase SignUp Error:', error);
    return { data, error };
  }

  console.log('Supabase SignUp Success:', data);
  return { data, error };
}

export async function signIn(email: string, password: string, role: 'admin' | 'student' = 'admin') {
  if (useDummyData) {
    if (role === 'student') {
      // Find student by email and student_id (acting as password)
      const student = dummyStudents.find(s =>
        s.email.toLowerCase() === email.toLowerCase() &&
        s.student_id === password
      );

      if (!student) {
        throw new Error('Invalid email or Student ID');
      }

      const user = {
        id: student.user_id || `u${Date.now()}`,
        email,
        user_metadata: { role: 'student', student_id: student.student_id }
      };

      localStorage.setItem('sb-auth-token', JSON.stringify({ user }));
      return { data: { user }, error: null };
    } else {
      // Admin login logic
      const user = {
        id: `admin_${Date.now()}`,
        email,
        user_metadata: { role: 'admin', is_ceo: true }
      };
      localStorage.setItem('sb-auth-token', JSON.stringify({ user }));
      return { data: { user }, error: null };
    }
  }

  // Real Supabase implementation
  if (role === 'student') {
    // For students, we first check if they exist in the students table with matching ID
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('*')
      .eq('email', email)
      .eq('student_id', password)
      .single();

    if (studentError || !student) {
      throw new Error('Invalid email or Student ID');
    }

    const mockUser = {
      id: student.user_id || `temp_${student.id}`,
      email: student.email,
      user_metadata: { role: 'student', student_id: student.student_id }
    };
    localStorage.setItem('sb-auth-token', JSON.stringify({ user: mockUser }));
    return { data: { user: mockUser }, error: null };
  }

  // For Admin login, we should verify they have an admin role
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    console.error('Sign in error:', error);
    return { data, error };
  }

  if (data.user) {
    const userMetadata = data.user.user_metadata || {};
    const userRole = userMetadata.role;
    const isCeo = userMetadata.is_ceo;

    console.log('Login successful. Metadata:', userMetadata);
    if (isCeo) console.log('User has CEO privileges');

    return { data, error };
  }
  return { data, error };
}

export async function signOut() {
  if (useDummyData) {
    localStorage.removeItem('sb-auth-token');
    return { error: null };
  }
  return await supabase.auth.signOut();
}

export async function resendVerification(email: string) {
  if (useDummyData) return { error: null };
  return await supabase.auth.resend({
    type: 'signup',
    email,
    options: {
      emailRedirectTo: window.location.origin + '/admin/login'
    }
  });
}

export async function getCurrentUser() {
  if (useDummyData) {
    const session = localStorage.getItem('sb-auth-token');
    return session ? JSON.parse(session).user : null;
  }

  // First check real Supabase auth
  const { data: { user } } = await supabase.auth.getUser();
  if (user) return user;

  // Fallback to localStorage for mock student sessions
  const session = localStorage.getItem('sb-auth-token');
  return session ? JSON.parse(session).user : null;
}

export async function getStudentByUserId(userId: string) {
  if (useDummyData) {
    return dummyStudents.find(s => s.user_id === userId) || null;
  }

  const { data, error } = await supabase
    .from('students')
    .select(`
      *,
      room:rooms(*, building:buildings(*))
    `)
    .eq('user_id', userId)
    .single();

  if (error) return null;
  return data;
}

// Staff Management
export async function getStaff() {
  if (useDummyData) {
    return dummyStaff;
  }
  const { data, error } = await supabase
    .from('staff')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function addStaff(staffData: { email: string; first_name: string; last_name: string; role: string }) {
  if (useDummyData) {
    const newStaff = {
      id: `staff_${Date.now()}`,
      ...staffData,
      created_at: new Date().toISOString()
    };
    dummyStaff.push(newStaff as any);
    return newStaff;
  }

  const { data, error } = await supabase
    .from('staff')
    .insert([staffData])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteStaff(id: string) {
  if (useDummyData) {
    const index = dummyStaff.findIndex((s: any) => s.id === id);
    if (index !== -1) {
      dummyStaff.splice(index, 1);
    }
    return;
  }

  const { error } = await supabase
    .from('staff')
    .delete()
    .eq('id', id);

  if (error) throw error;
}
