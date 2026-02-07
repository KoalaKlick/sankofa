import { type User as SupabaseUser, type Session as SupabaseSession, type AuthError } from '@supabase/supabase-js'

export type User = SupabaseUser
export type Session = SupabaseSession
export type AuthError = AuthError

export interface AuthState {
    user: User | null
    session: Session | null
    loading: boolean
}
