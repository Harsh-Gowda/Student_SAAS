// Database Types
export interface Student {
  id: string;
  student_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  date_of_birth: string | null;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  emergency_contact_relation: string;
  room_id: string | null;
  move_in_date: string | null;
  status: 'active' | 'inactive' | 'pending';
  user_id?: string;
  created_at: string;
  updated_at: string;
  room?: Room;
  building?: Building;
}

export interface Room {
  id: string;
  building_id: string;
  room_number: string;
  room_type: 'single' | 'double';
  has_ac: boolean;
  capacity: number;
  monthly_rent: number;
  floor: number;
  room_category: 'luxury' | 'semi-luxury' | 'standard';
  status: 'available' | 'occupied' | 'maintenance';
  created_at: string;
  building?: Building;
  students?: Student[];
  current_occupancy?: number;
}

export interface Building {
  id: string;
  name: string;
  address: string;
  total_rooms: number;
  created_at: string;
  rooms?: Room[];
}

export interface Payment {
  id: string;
  student_id: string;
  room_id: string;
  amount: number;
  due_date: string;
  paid_date: string | null;
  status: 'pending' | 'paid' | 'overdue';
  payment_method: string | null;
  transaction_id: string | null;
  notes: string | null;
  created_at: string;
  student?: Student;
  room?: Room;
}

export interface EmailLog {
  id: string;
  recipient_email: string;
  recipient_name: string;
  subject: string;
  template_type: 'reminder_before' | 'due_date' | 'overdue_after' | 'custom';
  status: 'sent' | 'failed' | 'pending';
  sent_at: string;
  error_message: string | null;
  student_id: string | null;
  student?: Student;
}

export interface Settings {
  id: string;
  company_name: string;
  email_sender_name: string;
  email_sender_address: string;
  rent_due_day: number;
  reminder_before_days: number;
  reminder_after_days: number;
  smtp_host: string;
  smtp_port: number;
  smtp_username: string;
  smtp_password: string;
  created_at: string;
  updated_at: string;
}

// Dashboard Analytics Types
export interface DashboardStats {
  totalStudents: number;
  totalRooms: number;
  occupiedRooms: number;
  occupancyRate: number;
  monthlyRevenue: number;
  overduePayments: number;
  pendingPayments: number;
}

export interface MonthlyRevenue {
  month: string;
  revenue: number;
  target: number;
}

export interface BuildingOccupancy {
  buildingName: string;
  totalRooms: number;
  occupiedRooms: number;
  occupancyRate: number;
}

// Form Types
export interface StudentFormData {
  student_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  emergency_contact_relation: string;
  room_id: string;
  move_in_date: string;
  status: 'active' | 'inactive' | 'pending';
}

export interface RoomFormData {
  building_id: string;
  room_number: string;
  room_type: 'single' | 'double';
  has_ac: boolean;
  capacity: number;
  monthly_rent: number;
  status: 'available' | 'occupied' | 'maintenance';
}

export interface PaymentFormData {
  student_id: string;
  room_id: string;
  amount: number;
  due_date: string;
  paid_date: string | null;
  status: 'pending' | 'paid' | 'overdue';
  payment_method: string;
  transaction_id: string;
  notes: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  type: 'reminder_before' | 'due_date' | 'overdue_after' | 'custom';
}

// Filter Types
export interface StudentFilter {
  search: string;
  status: string;
  building_id: string;
}

export interface PaymentFilter {
  search: string;
  status: string;
  month: string;
}

export interface RoomFilter {
  building_id: string;
  room_type: string;
  status: string;
  has_ac: boolean | null;
}

// Student Portal Specific Types
export interface MaintenanceTicket {
  id: string;
  student_id: string;
  title: string;
  description: string;
  category: 'plumbing' | 'electrical' | 'furniture' | 'cleaning' | 'other';
  status: 'pending' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  photo_url?: string;
  created_at: string;
  updated_at: string;
  student?: Student;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  category: 'general' | 'maintenance' | 'event' | 'urgent';
  created_at: string;
  expires_at?: string;
}

export interface StudentDocument {
  id: string;
  student_id: string;
  name: string;
  type: 'lease' | 'id_proof' | 'rules' | 'other';
  url: string;
  uploaded_at: string;
}
