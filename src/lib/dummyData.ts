// Comprehensive Dummy Data for Student Accommodation Management System

import type {
  Student,
  Room,
  Building,
  Payment,
  EmailLog,
  Settings,
  MaintenanceTicket,
  Notice,
  StudentDocument
} from '@/types';

// Buildings
export const dummyBuildings: Building[] = [
  {
    id: 'b1',
    name: 'Block A - Main Campus',
    address: '123 University Road, Campus City, 560001',
    total_rooms: 50,
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'b2',
    name: 'Block B - North Wing',
    address: '124 University Road, Campus City, 560001',
    total_rooms: 40,
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'b3',
    name: 'Block C - Premium',
    address: '125 University Road, Campus City, 560001',
    total_rooms: 30,
    created_at: '2024-01-01T00:00:00Z'
  }
];

// Rooms
export const dummyRooms: Room[] = [
  // Block A Rooms
  {
    id: 'r1',
    building_id: 'b1',
    room_number: '101',
    room_type: 'single',
    has_ac: true,
    capacity: 1,
    monthly_rent: 8000,
    floor: 1,
    room_category: 'standard',
    status: 'occupied',
    created_at: '2024-01-01T00:00:00Z',
    building: dummyBuildings[0]
  },
  {
    id: 'r2',
    building_id: 'b1',
    room_number: '102',
    room_type: 'double',
    has_ac: true,
    capacity: 2,
    monthly_rent: 12000,
    floor: 1,
    room_category: 'standard',
    status: 'occupied',
    created_at: '2024-01-01T00:00:00Z',
    building: dummyBuildings[0]
  },
  {
    id: 'r3',
    building_id: 'b1',
    room_number: '103',
    room_type: 'single',
    has_ac: false,
    capacity: 1,
    monthly_rent: 6000,
    floor: 1,
    room_category: 'standard',
    status: 'available',
    created_at: '2024-01-01T00:00:00Z',
    building: dummyBuildings[0]
  },
  {
    id: 'r4',
    building_id: 'b1',
    room_number: '104',
    room_type: 'double',
    has_ac: false,
    capacity: 2,
    monthly_rent: 9000,
    floor: 1,
    room_category: 'standard',
    status: 'occupied',
    created_at: '2024-01-01T00:00:00Z',
    building: dummyBuildings[0]
  },
  {
    id: 'r5',
    building_id: 'b1',
    room_number: '105',
    room_type: 'single',
    has_ac: true,
    capacity: 1,
    monthly_rent: 8000,
    floor: 1,
    room_category: 'standard',
    status: 'maintenance',
    created_at: '2024-01-01T00:00:00Z',
    building: dummyBuildings[0]
  },
  // Block B Rooms
  {
    id: 'r6',
    building_id: 'b2',
    room_number: '201',
    room_type: 'single',
    has_ac: true,
    capacity: 1,
    monthly_rent: 7500,
    floor: 2,
    room_category: 'standard',
    status: 'occupied',
    created_at: '2024-01-01T00:00:00Z',
    building: dummyBuildings[1]
  },
  {
    id: 'r7',
    building_id: 'b2',
    room_number: '202',
    room_type: 'double',
    has_ac: true,
    capacity: 2,
    monthly_rent: 11000,
    floor: 2,
    room_category: 'standard',
    status: 'occupied',
    created_at: '2024-01-01T00:00:00Z',
    building: dummyBuildings[1]
  },
  {
    id: 'r8',
    building_id: 'b2',
    room_number: '203',
    room_type: 'single',
    has_ac: false,
    capacity: 1,
    monthly_rent: 5500,
    floor: 2,
    room_category: 'standard',
    status: 'available',
    created_at: '2024-01-01T00:00:00Z',
    building: dummyBuildings[1]
  },
  // Block C Rooms (Premium)
  {
    id: 'r9',
    building_id: 'b3',
    room_number: '301',
    room_type: 'single',
    has_ac: true,
    capacity: 1,
    monthly_rent: 10000,
    floor: 3,
    room_category: 'luxury',
    status: 'occupied',
    created_at: '2024-01-01T00:00:00Z',
    building: dummyBuildings[2]
  },
  {
    id: 'r10',
    building_id: 'b3',
    room_number: '302',
    room_type: 'double',
    has_ac: true,
    capacity: 2,
    monthly_rent: 15000,
    floor: 3,
    room_category: 'luxury',
    status: 'occupied',
    created_at: '2024-01-01T00:00:00Z',
    building: dummyBuildings[2]
  }
];

// Students
export const dummyStudents: Student[] = [
  {
    id: 's1',
    student_id: 'STU2024001',
    first_name: 'Rahul',
    last_name: 'Sharma',
    email: 'rahul.sharma@university.edu',
    phone: '+91 9876543210',
    date_of_birth: '2002-05-15',
    emergency_contact_name: 'Rajesh Sharma',
    emergency_contact_phone: '+91 9876543211',
    emergency_contact_relation: 'Father',
    room_id: 'r1',
    move_in_date: '2024-01-15',
    status: 'active',
    user_id: 'u1',
    created_at: '2024-01-10T00:00:00Z',
    updated_at: '2024-01-10T00:00:00Z',
    room: dummyRooms[0],
    building: dummyBuildings[0]
  },
  {
    id: 's2',
    student_id: 'STU2024002',
    first_name: 'Priya',
    last_name: 'Patel',
    email: 'priya.patel@university.edu',
    phone: '+91 9876543220',
    date_of_birth: '2003-03-20',
    emergency_contact_name: 'Meena Patel',
    emergency_contact_phone: '+91 9876543221',
    emergency_contact_relation: 'Mother',
    room_id: 'r2',
    move_in_date: '2024-01-20',
    status: 'active',
    created_at: '2024-01-12T00:00:00Z',
    updated_at: '2024-01-12T00:00:00Z',
    room: dummyRooms[1],
    building: dummyBuildings[0]
  },
  {
    id: 's3',
    student_id: 'STU2024003',
    first_name: 'Amit',
    last_name: 'Kumar',
    email: 'amit.kumar@university.edu',
    phone: '+91 9876543230',
    date_of_birth: '2002-08-10',
    emergency_contact_name: 'Sunita Kumar',
    emergency_contact_phone: '+91 9876543231',
    emergency_contact_relation: 'Mother',
    room_id: 'r2',
    move_in_date: '2024-02-01',
    status: 'active',
    created_at: '2024-01-25T00:00:00Z',
    updated_at: '2024-01-25T00:00:00Z',
    room: dummyRooms[1],
    building: dummyBuildings[0]
  },
  {
    id: 's4',
    student_id: 'STU2024004',
    first_name: 'Sneha',
    last_name: 'Gupta',
    email: 'sneha.gupta@university.edu',
    phone: '+91 9876543240',
    date_of_birth: '2003-01-25',
    emergency_contact_name: 'Vikram Gupta',
    emergency_contact_phone: '+91 9876543241',
    emergency_contact_relation: 'Father',
    room_id: 'r4',
    move_in_date: '2024-01-18',
    status: 'active',
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z',
    room: dummyRooms[3],
    building: dummyBuildings[0]
  },
  {
    id: 's5',
    student_id: 'STU2024005',
    first_name: 'Vikram',
    last_name: 'Singh',
    email: 'vikram.singh@university.edu',
    phone: '+91 9876543250',
    date_of_birth: '2002-11-05',
    emergency_contact_name: 'Harpreet Singh',
    emergency_contact_phone: '+91 9876543251',
    emergency_contact_relation: 'Father',
    room_id: 'r4',
    move_in_date: '2024-02-05',
    status: 'active',
    created_at: '2024-01-28T00:00:00Z',
    updated_at: '2024-01-28T00:00:00Z',
    room: dummyRooms[3],
    building: dummyBuildings[0]
  },
  {
    id: 's6',
    student_id: 'STU2024006',
    first_name: 'Neha',
    last_name: 'Reddy',
    email: 'neha.reddy@university.edu',
    phone: '+91 9876543260',
    date_of_birth: '2003-06-12',
    emergency_contact_name: 'Lakshmi Reddy',
    emergency_contact_phone: '+91 9876543261',
    emergency_contact_relation: 'Mother',
    room_id: 'r6',
    move_in_date: '2024-01-22',
    status: 'active',
    created_at: '2024-01-18T00:00:00Z',
    updated_at: '2024-01-18T00:00:00Z',
    room: dummyRooms[5],
    building: dummyBuildings[1]
  },
  {
    id: 's7',
    student_id: 'STU2024007',
    first_name: 'Arjun',
    last_name: 'Nair',
    email: 'arjun.nair@university.edu',
    phone: '+91 9876543270',
    date_of_birth: '2002-09-18',
    emergency_contact_name: 'Suresh Nair',
    emergency_contact_phone: '+91 9876543271',
    emergency_contact_relation: 'Father',
    room_id: 'r7',
    move_in_date: '2024-02-10',
    status: 'active',
    created_at: '2024-02-01T00:00:00Z',
    updated_at: '2024-02-01T00:00:00Z',
    room: dummyRooms[6],
    building: dummyBuildings[1]
  },
  {
    id: 's8',
    student_id: 'STU2024008',
    first_name: 'Divya',
    last_name: 'Iyer',
    email: 'divya.iyer@university.edu',
    phone: '+91 9876543280',
    date_of_birth: '2003-04-30',
    emergency_contact_name: 'Krishnan Iyer',
    emergency_contact_phone: '+91 9876543281',
    emergency_contact_relation: 'Father',
    room_id: 'r7',
    move_in_date: '2024-02-12',
    status: 'active',
    created_at: '2024-02-05T00:00:00Z',
    updated_at: '2024-02-05T00:00:00Z',
    room: dummyRooms[6],
    building: dummyBuildings[1]
  },
  {
    id: 's9',
    student_id: 'STU2024009',
    first_name: 'Karan',
    last_name: 'Mehta',
    email: 'karan.mehta@university.edu',
    phone: '+91 9876543290',
    date_of_birth: '2002-07-22',
    emergency_contact_name: 'Priya Mehta',
    emergency_contact_phone: '+91 9876543291',
    emergency_contact_relation: 'Mother',
    room_id: 'r9',
    move_in_date: '2024-01-25',
    status: 'active',
    created_at: '2024-01-20T00:00:00Z',
    updated_at: '2024-01-20T00:00:00Z',
    room: dummyRooms[8],
    building: dummyBuildings[2]
  },
  {
    id: 's10',
    student_id: 'STU2024010',
    first_name: 'Ananya',
    last_name: 'Desai',
    email: 'ananya.desai@university.edu',
    phone: '+91 9876543300',
    date_of_birth: '2003-02-14',
    emergency_contact_name: 'Ramesh Desai',
    emergency_contact_phone: '+91 9876543301',
    emergency_contact_relation: 'Father',
    room_id: 'r10',
    move_in_date: '2024-02-15',
    status: 'active',
    created_at: '2024-02-08T00:00:00Z',
    updated_at: '2024-02-08T00:00:00Z',
    room: dummyRooms[9],
    building: dummyBuildings[2]
  },
  {
    id: 's11',
    student_id: 'STU2024011',
    first_name: 'Rohit',
    last_name: 'Verma',
    email: 'rohit.verma@university.edu',
    phone: '+91 9876543310',
    date_of_birth: '2002-12-03',
    emergency_contact_name: 'Suman Verma',
    emergency_contact_phone: '+91 9876543311',
    emergency_contact_relation: 'Mother',
    room_id: 'r10',
    move_in_date: '2024-02-18',
    status: 'pending',
    created_at: '2024-02-10T00:00:00Z',
    updated_at: '2024-02-10T00:00:00Z',
    room: dummyRooms[9],
    building: dummyBuildings[2]
  },
  {
    id: 's12',
    student_id: 'STU2024012',
    first_name: 'Pooja',
    last_name: 'Rao',
    email: 'pooja.rao@university.edu',
    phone: '+91 9876543320',
    date_of_birth: '2003-08-28',
    emergency_contact_name: 'Venkat Rao',
    emergency_contact_phone: '+91 9876543321',
    emergency_contact_relation: 'Father',
    room_id: null,
    move_in_date: null,
    status: 'inactive',
    created_at: '2024-02-12T00:00:00Z',
    updated_at: '2024-02-12T00:00:00Z',
    room: undefined,
    building: undefined
  }
];

// Add students to rooms
dummyRooms[0].students = [dummyStudents[0]];
dummyRooms[1].students = [dummyStudents[1], dummyStudents[2]];
dummyRooms[3].students = [dummyStudents[3], dummyStudents[4]];
dummyRooms[5].students = [dummyStudents[5]];
dummyRooms[6].students = [dummyStudents[6], dummyStudents[7]];
dummyRooms[8].students = [dummyStudents[8]];
dummyRooms[9].students = [dummyStudents[9], dummyStudents[10]];

// Payments
export const dummyPayments: Payment[] = [
  // Paid payments
  {
    id: 'p1',
    student_id: 's1',
    room_id: 'r1',
    amount: 8000,
    due_date: '2024-02-01',
    paid_date: '2024-01-28',
    status: 'paid',
    payment_method: 'UPI',
    transaction_id: 'UPI123456789',
    notes: 'Paid on time',
    created_at: '2024-01-25T00:00:00Z',
    student: dummyStudents[0],
    room: dummyRooms[0]
  },
  {
    id: 'p2',
    student_id: 's2',
    room_id: 'r2',
    amount: 6000,
    due_date: '2024-02-01',
    paid_date: '2024-01-30',
    status: 'paid',
    payment_method: 'Bank Transfer',
    transaction_id: 'BT987654321',
    notes: '',
    created_at: '2024-01-28T00:00:00Z',
    student: dummyStudents[1],
    room: dummyRooms[1]
  },
  {
    id: 'p3',
    student_id: 's3',
    room_id: 'r2',
    amount: 6000,
    due_date: '2024-02-01',
    paid_date: '2024-02-01',
    status: 'paid',
    payment_method: 'Cash',
    transaction_id: '',
    notes: 'Paid at office',
    created_at: '2024-02-01T00:00:00Z',
    student: dummyStudents[2],
    room: dummyRooms[1]
  },
  {
    id: 'p4',
    student_id: 's4',
    room_id: 'r4',
    amount: 4500,
    due_date: '2024-02-01',
    paid_date: '2024-01-29',
    status: 'paid',
    payment_method: 'UPI',
    transaction_id: 'UPI456789123',
    notes: '',
    created_at: '2024-01-27T00:00:00Z',
    student: dummyStudents[3],
    room: dummyRooms[3]
  },
  {
    id: 'p5',
    student_id: 's5',
    room_id: 'r4',
    amount: 4500,
    due_date: '2024-02-01',
    paid_date: '2024-02-02',
    status: 'paid',
    payment_method: 'Credit Card',
    transaction_id: 'CC789123456',
    notes: 'Late by 1 day',
    created_at: '2024-02-02T00:00:00Z',
    student: dummyStudents[4],
    room: dummyRooms[3]
  },
  // Pending payments
  {
    id: 'p6',
    student_id: 's6',
    room_id: 'r6',
    amount: 7500,
    due_date: '2024-02-01',
    paid_date: null,
    status: 'pending',
    payment_method: null,
    transaction_id: null,
    notes: '',
    created_at: '2024-01-20T00:00:00Z',
    student: dummyStudents[5],
    room: dummyRooms[5]
  },
  {
    id: 'p7',
    student_id: 's7',
    room_id: 'r7',
    amount: 5500,
    due_date: '2024-02-01',
    paid_date: null,
    status: 'pending',
    payment_method: null,
    transaction_id: null,
    notes: '',
    created_at: '2024-01-22T00:00:00Z',
    student: dummyStudents[6],
    room: dummyRooms[6]
  },
  // Overdue payments
  {
    id: 'p8',
    student_id: 's8',
    room_id: 'r7',
    amount: 5500,
    due_date: '2024-01-01',
    paid_date: null,
    status: 'overdue',
    payment_method: null,
    transaction_id: null,
    notes: 'Reminder sent',
    created_at: '2023-12-25T00:00:00Z',
    student: dummyStudents[7],
    room: dummyRooms[6]
  },
  {
    id: 'p9',
    student_id: 's9',
    room_id: 'r9',
    amount: 10000,
    due_date: '2024-01-01',
    paid_date: null,
    status: 'overdue',
    payment_method: null,
    transaction_id: null,
    notes: 'Multiple reminders sent',
    created_at: '2023-12-28T00:00:00Z',
    student: dummyStudents[8],
    room: dummyRooms[8]
  },
  // March payments
  {
    id: 'p10',
    student_id: 's1',
    room_id: 'r1',
    amount: 8000,
    due_date: '2024-03-01',
    paid_date: null,
    status: 'pending',
    payment_method: null,
    transaction_id: null,
    notes: '',
    created_at: '2024-02-20T00:00:00Z',
    student: dummyStudents[0],
    room: dummyRooms[0]
  },
  {
    id: 'p11',
    student_id: 's2',
    room_id: 'r2',
    amount: 6000,
    due_date: '2024-03-01',
    paid_date: null,
    status: 'pending',
    payment_method: null,
    transaction_id: null,
    notes: '',
    created_at: '2024-02-22T00:00:00Z',
    student: dummyStudents[1],
    room: dummyRooms[1]
  }
];

// Email Logs
export const dummyEmailLogs: EmailLog[] = [
  {
    id: 'e1',
    recipient_email: 'rahul.sharma@university.edu',
    recipient_name: 'Rahul Sharma',
    subject: 'Rent Due Reminder - Rahul Sharma',
    template_type: 'reminder_before',
    status: 'sent',
    sent_at: '2024-01-30T10:00:00Z',
    error_message: null,
    student_id: 's1',
    student: dummyStudents[0]
  },
  {
    id: 'e2',
    recipient_email: 'priya.patel@university.edu',
    recipient_name: 'Priya Patel',
    subject: 'Rent Due Reminder - Priya Patel',
    template_type: 'reminder_before',
    status: 'sent',
    sent_at: '2024-01-30T10:05:00Z',
    error_message: null,
    student_id: 's2',
    student: dummyStudents[1]
  },
  {
    id: 'e3',
    recipient_email: 'amit.kumar@university.edu',
    recipient_name: 'Amit Kumar',
    subject: 'Rent Due Today - Amit Kumar',
    template_type: 'due_date',
    status: 'sent',
    sent_at: '2024-02-01T09:00:00Z',
    error_message: null,
    student_id: 's3',
    student: dummyStudents[2]
  },
  {
    id: 'e4',
    recipient_email: 'divya.iyer@university.edu',
    recipient_name: 'Divya Iyer',
    subject: 'URGENT: Overdue Rent Payment - Divya Iyer',
    template_type: 'overdue_after',
    status: 'sent',
    sent_at: '2024-01-03T11:00:00Z',
    error_message: null,
    student_id: 's8',
    student: dummyStudents[7]
  },
  {
    id: 'e5',
    recipient_email: 'karan.mehta@university.edu',
    recipient_name: 'Karan Mehta',
    subject: 'URGENT: Overdue Rent Payment - Karan Mehta',
    template_type: 'overdue_after',
    status: 'sent',
    sent_at: '2024-01-03T11:05:00Z',
    error_message: null,
    student_id: 's9',
    student: dummyStudents[8]
  },
  {
    id: 'e6',
    recipient_email: 'neha.reddy@university.edu',
    recipient_name: 'Neha Reddy',
    subject: 'Welcome to Student Accommodation',
    template_type: 'custom',
    status: 'sent',
    sent_at: '2024-01-20T14:00:00Z',
    error_message: null,
    student_id: 's6',
    student: dummyStudents[5]
  }
];

// Settings
export const dummySettings: Settings = {
  id: 'set1',
  company_name: 'Campus Living Accommodations',
  email_sender_name: 'Campus Living Management',
  email_sender_address: 'management@campusliving.edu',
  rent_due_day: 1,
  reminder_before_days: 2,
  reminder_after_days: 2,
  smtp_host: 'smtp.gmail.com',
  smtp_port: 587,
  smtp_username: 'management@campusliving.edu',
  smtp_password: '********',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z'
};

// Maintenance Tickets
export const dummyMaintenanceTickets: MaintenanceTicket[] = [
  {
    id: 'mt1',
    student_id: 's1',
    title: 'Leaking Faucet',
    description: 'The faucet in my bathroom is leaking constantly.',
    category: 'plumbing',
    status: 'resolved',
    priority: 'medium',
    created_at: '2024-02-10T10:00:00Z',
    updated_at: '2024-02-11T15:00:00Z',
    student: dummyStudents[0]
  },
  {
    id: 'mt2',
    student_id: 's1',
    title: 'Ceiling Fan Not Working',
    description: 'The ceiling fan in my room stopped working this morning.',
    category: 'electrical',
    status: 'pending',
    priority: 'high',
    created_at: '2024-02-22T08:30:00Z',
    updated_at: '2024-02-22T08:30:00Z',
    student: dummyStudents[0]
  }
];

// Notices
export const dummyNotices: Notice[] = [
  {
    id: 'n1',
    title: 'Water Maintenance Schedule',
    content: 'Scheduled maintenance for water tanks on Sunday, Feb 25th from 10 AM to 2 PM. Water supply will be affected.',
    category: 'maintenance',
    created_at: '2024-02-20T09:00:00Z'
  },
  {
    id: 'n2',
    title: 'Weekend Movie Night',
    content: 'Join us for a movie night in the common area this Saturday at 7 PM!',
    category: 'event',
    created_at: '2024-02-21T14:30:00Z'
  },
  {
    id: 'n3',
    title: 'Fire Safety Drill',
    content: 'A mandatory fire safety drill will be conducted next Monday at 11 AM.',
    category: 'urgent',
    created_at: '2024-02-22T11:00:00Z'
  }
];

// Documents
export const dummyDocuments: StudentDocument[] = [
  {
    id: 'doc1',
    student_id: 's1',
    name: 'Lease Agreement 2024',
    type: 'lease',
    url: '#',
    uploaded_at: '2024-01-15T12:00:00Z'
  },
  {
    id: 'doc2',
    student_id: 's1',
    name: 'Identity Proof (Aadhar)',
    type: 'id_proof',
    url: '#',
    uploaded_at: '2024-01-15T12:05:00Z'
  },
  {
    id: 'doc3',
    student_id: 's1',
    name: 'Hostel Rules & Regulations',
    type: 'rules',
    url: '#',
    uploaded_at: '2024-01-15T12:10:00Z'
  }
];

// Staff
export const dummyStaff: any[] = [
  {
    id: 'staff1',
    first_name: 'John',
    last_name: 'Manager',
    email: 'john@example.com',
    role: 'manager',
    created_at: '2024-01-01T00:00:00Z'
  }
];

// Currently "Logged In" Student for Portal Simulation
export const dummyStudentUser = dummyStudents[0];

// Dashboard Stats
export const getDashboardStats = () => {
  const totalStudents = dummyStudents.filter(s => s.status === 'active').length;
  const totalRooms = dummyRooms.length;
  const occupiedRooms = dummyRooms.filter(r => r.status === 'occupied').length;
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const monthlyRevenue = dummyPayments
    .filter(p => p.status === 'paid' && p.paid_date?.startsWith(currentMonth))
    .reduce((sum, p) => sum + p.amount, 0);
  const overduePayments = dummyPayments.filter(p => p.status === 'overdue').length;
  const pendingPayments = dummyPayments.filter(p => p.status === 'pending').length;

  return {
    totalStudents,
    totalRooms,
    occupiedRooms,
    occupancyRate: Math.round((occupiedRooms / totalRooms) * 100),
    monthlyRevenue,
    overduePayments,
    pendingPayments
  };
};

// Monthly Revenue Data for Charts
export const getMonthlyRevenueData = (_months?: number) => {
  return [
    { month: 'Sep 23', revenue: 45000, target: 50000 },
    { month: 'Oct 23', revenue: 52000, target: 50000 },
    { month: 'Nov 23', revenue: 48000, target: 50000 },
    { month: 'Dec 23', revenue: 55000, target: 50000 },
    { month: 'Jan 24', revenue: 58000, target: 50000 },
    { month: 'Feb 24', revenue: 42000, target: 50000 }
  ];
};

// Building Occupancy Data
export const getBuildingOccupancyData = () => {
  return dummyBuildings.map(building => {
    const rooms = dummyRooms.filter(r => r.building_id === building.id);
    const totalRooms = rooms.length;
    const occupiedRooms = rooms.filter(r => r.status === 'occupied').length;

    return {
      buildingName: building.name,
      totalRooms,
      occupiedRooms,
      occupancyRate: totalRooms ? Math.round((occupiedRooms / totalRooms) * 100) : 0
    };
  });
};
