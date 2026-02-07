import { type User as SupabaseUser, type Session as SupabaseSession, type AuthError as SupabaseAuthError } from '@supabase/supabase-js'

export type User = SupabaseUser
export type Session = SupabaseSession
export type AuthError = SupabaseAuthError

export interface AuthState {
    user: User | null
    session: Session | null
    loading: boolean
}
