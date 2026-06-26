export type Role = 'member' | 'admin' | 'super_admin';
export type UserStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'DELETED' | 'DISABLED';

export interface User {
  id: string;
  full_name: string;
  email: string;
  phone_number?: string;
  profile_image_url?: string;
  gender?: string;
  address?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  tribe_number?: string;
  on_chain_tx_hash?: string;
  status: UserStatus;
  role: Role;
  created_at: string;
  updated_at?: string;
}

export interface DigitalID {
  id: string;
  user_id: string;
  member_code: string;
  qr_data: string;
  created_at: string;
}

export type SessionStatus = 'ACTIVE' | 'EXITED';

export interface AttendanceSession {
  id: string;
  user_id: string;
  check_in_time: string;
  check_out_time: string | null;
  date_key: string; // YYYY-MM-DD index for grouping
  status: SessionStatus;
}

export interface ActivityLog {
  id: string;
  user_id: string;
  action: string;
  timestamp: string;
  performed_by: string;
  metadata: Record<string, any>;
}
