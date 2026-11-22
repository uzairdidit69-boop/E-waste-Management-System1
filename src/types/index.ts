// src/types/index.ts
export type Role = 'requester' | 'collector' | 'recycler' | 'admin'
export type RequestStatus = 'pending' | 'accepted' | 'completed' | 'cancelled'

export interface User {
  id: number
  email: string
  role: Role
  is_active: boolean
  created_at: string
}

export interface Area {
  id: number
  name: string
  description: string | null
  created_at: string
}

export interface PickupRequest {
  id: number
  requester_id: number
  collector_id: number | null
  area_id: number
  status: RequestStatus
  description: string | null
  requested_at: string
  scheduled_at: string | null
  completed_at: string | null
}

export interface AuthResponse {
  access_token: string
  token_type: string
}

export interface ApiErrorDetail {
  detail: string | { msg: string; loc?: (string | number)[] }[]
}

