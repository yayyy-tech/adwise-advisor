import { create } from 'zustand';
import { supabase } from '../lib/supabase';

interface AdvisorStore {
  // Auth state
  advisor: any | null;
  profile: any | null;
  advisorProfile: any | null;
  session: any | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  mustChangePassword: boolean;
  profileCompleted: boolean;
  onboardingStep: number;

  // Computed from profile
  name: string;
  email: string;

  // Auth methods
  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  changePassword: (newPassword: string) => Promise<void>;
  completeOnboarding: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  _loadAdvisor: (session: any) => Promise<void>;

  // Legacy methods
  setAuthenticated: (v: boolean) => void;
  setMustChangePassword: (v: boolean) => void;
  setProfileCompleted: (v: boolean) => void;
  setOnboardingStep: (s: number) => void;
}

export const useAdvisorStore = create<AdvisorStore>((set, get) => ({
  advisor: null,
  profile: null,
  advisorProfile: null,
  session: null,
  isLoading: true,
  isAuthenticated: false,
  mustChangePassword: false,
  profileCompleted: false,
  onboardingStep: 1,
  name: '',
  email: '',

  initialize: async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Failed to get session:', error.message);
      } else if (session?.user) {
        await get()._loadAdvisor(session);
      }
    } catch (e) {
      console.error('Auth init error:', e);
    } finally {
      set({ isLoading: false });
    }

    try {
      supabase.auth.onAuthStateChange(async (_, session) => {
        if (session?.user) {
          await get()._loadAdvisor(session);
        } else {
          set({
            advisor: null, profile: null, advisorProfile: null,
            session: null, isAuthenticated: false, name: '', email: '',
          });
        }
      });
    } catch (e) {
      console.error('Auth state change listener error:', e);
    }
  },

  _loadAdvisor: async (session) => {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .maybeSingle();

    if (profileError) {
      console.error('Failed to load profile:', profileError.message);
      return;
    }

    if (!profile || profile.role !== 'advisor') {
      await supabase.auth.signOut();
      window.location.href = '/login';
      return;
    }

    const { data: ap, error: apError } = await supabase
      .from('advisor_profiles')
      .select('*')
      .eq('id', session.user.id)
      .maybeSingle();

    if (apError) {
      console.error('Failed to load advisor profile:', apError.message);
    }

    set({
      advisor: session.user,
      profile,
      advisorProfile: ap ?? null,
      session,
      isAuthenticated: true,
      mustChangePassword: ap?.must_change_password ?? true,
      profileCompleted: ap?.profile_completed ?? false,
      name: profile?.full_name || '',
      email: profile?.email || session.user.email || '',
    });
  },

  signIn: async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return { error: null };
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({
      advisor: null, profile: null, advisorProfile: null,
      session: null, isAuthenticated: false,
    });
    window.location.href = '/login';
  },

  changePassword: async (newPassword) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
    const advisor = get().advisor;
    if (advisor) {
      await supabase.from('advisor_profiles').update({ must_change_password: false }).eq('id', advisor.id);
    }
    set({ mustChangePassword: false });
  },

  completeOnboarding: async () => {
    const advisor = get().advisor;
    if (advisor) {
      await supabase.from('advisor_profiles').update({
        profile_completed: true,
        onboarding_completed: true,
        status: 'active',
      }).eq('id', advisor.id);
    }
    set({ profileCompleted: true });
  },

  refreshProfile: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) await get()._loadAdvisor(session);
  },

  // Legacy methods
  setAuthenticated: (v) => set({ isAuthenticated: v }),
  setMustChangePassword: (v) => set({ mustChangePassword: v }),
  setProfileCompleted: (v) => set({ profileCompleted: v }),
  setOnboardingStep: (s) => set({ onboardingStep: s }),
}));
