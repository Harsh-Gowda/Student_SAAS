export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      students: {
        Row: {
          id: string
          student_id: string
          first_name: string
          last_name: string
          email: string
          phone: string
          date_of_birth: string | null
          emergency_contact_name: string
          emergency_contact_phone: string
          emergency_contact_relation: string
          room_id: string | null
          move_in_date: string | null
          status: 'active' | 'inactive' | 'pending'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          student_id: string
          first_name: string
          last_name: string
          email: string
          phone: string
          date_of_birth?: string | null
          emergency_contact_name?: string
          emergency_contact_phone?: string
          emergency_contact_relation?: string
          room_id?: string | null
          move_in_date?: string | null
          status?: 'active' | 'inactive' | 'pending'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          first_name?: string
          last_name?: string
          email?: string
          phone?: string
          date_of_birth?: string | null
          emergency_contact_name?: string
          emergency_contact_phone?: string
          emergency_contact_relation?: string
          room_id?: string | null
          move_in_date?: string | null
          status?: 'active' | 'inactive' | 'pending'
          created_at?: string
          updated_at?: string
        }
      }
      rooms: {
        Row: {
          id: string
          building_id: string
          room_number: string
          room_type: 'single' | 'double'
          has_ac: boolean
          capacity: number
          monthly_rent: number
          status: 'available' | 'occupied' | 'maintenance'
          created_at: string
        }
        Insert: {
          id?: string
          building_id: string
          room_number: string
          room_type: 'single' | 'double'
          has_ac?: boolean
          capacity: number
          monthly_rent: number
          status?: 'available' | 'occupied' | 'maintenance'
          created_at?: string
        }
        Update: {
          id?: string
          building_id?: string
          room_number?: string
          room_type?: 'single' | 'double'
          has_ac?: boolean
          capacity?: number
          monthly_rent?: number
          status?: 'available' | 'occupied' | 'maintenance'
          created_at?: string
        }
      }
      buildings: {
        Row: {
          id: string
          name: string
          address: string
          total_rooms: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          address: string
          total_rooms?: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          address?: string
          total_rooms?: number
          created_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          student_id: string
          room_id: string
          amount: number
          due_date: string
          paid_date: string | null
          status: 'pending' | 'paid' | 'overdue'
          payment_method: string | null
          transaction_id: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          student_id: string
          room_id: string
          amount: number
          due_date: string
          paid_date?: string | null
          status?: 'pending' | 'paid' | 'overdue'
          payment_method?: string | null
          transaction_id?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          room_id?: string
          amount?: number
          due_date?: string
          paid_date?: string | null
          status?: 'pending' | 'paid' | 'overdue'
          payment_method?: string | null
          transaction_id?: string | null
          notes?: string | null
          created_at?: string
        }
      }
      email_logs: {
        Row: {
          id: string
          recipient_email: string
          recipient_name: string
          subject: string
          template_type: 'reminder_before' | 'due_date' | 'overdue_after' | 'custom'
          status: 'sent' | 'failed' | 'pending'
          sent_at: string
          error_message: string | null
          student_id: string | null
        }
        Insert: {
          id?: string
          recipient_email: string
          recipient_name: string
          subject: string
          template_type: 'reminder_before' | 'due_date' | 'overdue_after' | 'custom'
          status?: 'sent' | 'failed' | 'pending'
          sent_at?: string
          error_message?: string | null
          student_id?: string | null
        }
        Update: {
          id?: string
          recipient_email?: string
          recipient_name?: string
          subject?: string
          template_type?: 'reminder_before' | 'due_date' | 'overdue_after' | 'custom'
          status?: 'sent' | 'failed' | 'pending'
          sent_at?: string
          error_message?: string | null
          student_id?: string | null
        }
      }
      settings: {
        Row: {
          id: string
          company_name: string
          email_sender_name: string
          email_sender_address: string
          rent_due_day: number
          reminder_before_days: number
          reminder_after_days: number
          smtp_host: string
          smtp_port: number
          smtp_username: string
          smtp_password: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_name?: string
          email_sender_name?: string
          email_sender_address?: string
          rent_due_day?: number
          reminder_before_days?: number
          reminder_after_days?: number
          smtp_host?: string
          smtp_port?: number
          smtp_username?: string
          smtp_password?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_name?: string
          email_sender_name?: string
          email_sender_address?: string
          rent_due_day?: number
          reminder_before_days?: number
          reminder_after_days?: number
          smtp_host?: string
          smtp_port?: number
          smtp_username?: string
          smtp_password?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
