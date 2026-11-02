import { createServerClient } from '../supabase/server';
import type { Profile, UserRole } from '../types/database.types';
import type { User } from '@supabase/supabase-js';

export interface CurrentUserSession {
  user: User;
  profile: Profile;
}

export async function getCurrentUser(): Promise<CurrentUserSession | null> {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return null;
    }

    const { data: profile, error: profileError } = await supabase
      .from('shared_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      // Return synthetic fallback profile if trigger is still settling
      const fallbackProfile: Profile = {
        id: user.id,
        email: user.email ?? '',
        full_name: (user.user_metadata?.full_name as string) ?? (user.user_metadata?.name as string) ?? null,
        avatar_url: (user.user_metadata?.avatar_url as string) ?? null,
        role: 'audience' as UserRole,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      return { user, profile: fallbackProfile };
    }

    return { user, profile };
  } catch {
    return null;
  }
}
