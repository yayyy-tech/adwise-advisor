import { useState } from 'react';
import { Check, Upload } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AdvisorLayout } from '../components/layout/AdvisorLayout';
import { Button } from '../components/ui/Button';
import { Tabs } from '../components/ui/Tabs';
import { useAdvisorStore } from '../store/useAdvisorStore';
import { supabase } from '../lib/supabase';
import { cn } from '../lib/utils';

const NOTIFICATION_SETTINGS = [
  'New lead matched to your profile',
  'Client booked a discovery call',
  'Client accepted engagement proposal',
  'Document signed by client',
  'Session reminder (24h before)',
  'Session reminder (1h before)',
  'New message received',
  'Client completed KYC',
  'Renewal due (14 days before)',
];

export default function SettingsPage() {
  const { profile, advisorProfile, advisor, changePassword } = useAdvisorStore();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState('Profile');
  const [notifications, setNotifications] = useState<Record<string, boolean>>(
    Object.fromEntries(NOTIFICATION_SETTINGS.map((n) => [n, true]))
  );
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passMsg, setPassMsg] = useState('');
  const [passErr, setPassErr] = useState('');

  const { data: plans } = useQuery({
    queryKey: ['advisor-plans', advisor?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from('advisor_plans').select('*').eq('advisor_id', advisor!.id).order('price_inr');
      if (error) throw error;
      return data;
    },
    enabled: !!advisor?.id,
  });

  const name = profile?.full_name || '';
  const initials = name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();

  const handlePasswordChange = async () => {
    if (newPass.length < 8) { setPassErr('Password must be at least 8 characters.'); return; }
    if (newPass !== confirmPass) { setPassErr('Passwords do not match.'); return; }
    setPassErr('');
    try {
      await changePassword(newPass);
      setPassMsg('Password updated successfully.');
      setNewPass('');
      setConfirmPass('');
    } catch (e: any) {
      setPassErr(e.message);
    }
  };

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

  return (
    <AdvisorLayout>
      <div className="max-w-[720px]">
        <h1 className="font-display text-[28px] text-dark-text mb-6">Settings</h1>
        <Tabs tabs={['Profile', 'Plans', 'Calendar', 'Security', 'Notifications']} active={tab} onChange={setTab} />

        <div className="mt-6">
          {tab === 'Profile' && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-teal font-body text-2xl font-semibold text-dark-base">{initials}</div>
                <Button variant="dark-outline" size="sm"><Upload className="h-3.5 w-3.5 mr-1" /> Change Photo</Button>
              </div>
              {[
                ['Name', name],
                ['SEBI Number', advisorProfile?.sebi_registration_number || ''],
                ['City', profile?.city || ''],
              ].map(([label, val]) => (
                <div key={label}>
                  <label className="font-body text-xs text-dark-muted block mb-1">{label}</label>
                  <input defaultValue={val} className="h-11 w-full rounded-[12px] border border-dark-border bg-dark-base px-4 font-body text-sm text-dark-text focus:border-teal focus:outline-none" />
                </div>
              ))}
              <div>
                <label className="font-body text-xs text-dark-muted block mb-1">Bio</label>
                <textarea defaultValue={advisorProfile?.bio || ''} rows={3} className="w-full rounded-[12px] border border-dark-border bg-dark-base px-4 py-3 font-body text-sm text-dark-text focus:border-teal focus:outline-none resize-none" />
              </div>
              <Button variant="teal" size="sm">Save Changes</Button>
            </div>
          )}

          {tab === 'Plans' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(plans ?? []).length === 0 ? (
                <p className="col-span-3 font-body text-sm text-dark-muted text-center py-10">No plans configured yet.</p>
              ) : (
                (plans ?? []).map((plan: any, i: number) => (
                  <div key={plan.id} className={cn('rounded-[20px] bg-dark-surface p-6 border', plan.is_popular ? 'border-teal' : 'border-dark-border')}>
                    <p className="font-body text-sm font-medium text-white mb-2">{plan.name}</p>
                    <p className="font-mono text-lg text-dark-text">{'\u20b9'}{new Intl.NumberFormat('en-IN').format(plan.price_inr)}<span className="text-xs text-dark-muted">/yr</span></p>
                    <p className="font-body text-xs text-dark-muted mt-1">{plan.sessions_included} sessions</p>
                  </div>
                ))
              )}
            </div>
          )}

          {tab === 'Calendar' && (
            <div className="rounded-[16px] bg-dark-surface p-6 space-y-4">
              {advisorProfile?.google_calendar_connected ? (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-body text-sm font-medium text-white">Google Calendar</p>
                      <p className="font-body text-xs text-dark-muted mt-1">Status: <span className="text-teal">{'\u25cf'} Connected</span></p>
                    </div>
                  </div>
                  <div className="space-y-2 font-body text-sm text-dark-muted">
                    <p>{'\u2713'} New bookings &rarr; Google Calendar event created</p>
                    <p>{'\u2713'} Cancellations &rarr; Event deleted</p>
                  </div>
                </>
              ) : (
                <div>
                  <p className="font-body text-sm font-medium text-white mb-2">Google Calendar</p>
                  <p className="font-body text-xs text-dark-muted mb-4">Connect your Google Calendar to automatically sync bookings.</p>
                  {googleClientId ? (
                    <Button
                      variant="teal"
                      size="sm"
                      onClick={() => {
                        const redirectUri = `${supabaseUrl}/functions/v1/google-oauth-callback`;
                        const scope = 'https://www.googleapis.com/auth/calendar.events';
                        const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${googleClientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}&access_type=offline&prompt=consent&state=${advisor?.id}`;
                        window.location.href = url;
                      }}
                    >
                      Connect Google Calendar
                    </Button>
                  ) : (
                    <p className="font-body text-xs text-amber-500">Google Calendar integration not configured.</p>
                  )}
                </div>
              )}
            </div>
          )}

          {tab === 'Security' && (
            <div className="space-y-4">
              <div>
                <label className="font-body text-xs text-dark-muted block mb-1">New password</label>
                <input type="password" value={newPass} onChange={(e) => setNewPass(e.target.value)} className="h-11 w-full rounded-[12px] border border-dark-border bg-dark-base px-4 font-body text-sm text-dark-text focus:border-teal focus:outline-none" />
              </div>
              <div>
                <label className="font-body text-xs text-dark-muted block mb-1">Confirm new password</label>
                <input type="password" value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)} className="h-11 w-full rounded-[12px] border border-dark-border bg-dark-base px-4 font-body text-sm text-dark-text focus:border-teal focus:outline-none" />
              </div>
              {passErr && <p className="font-body text-xs text-red-400">{passErr}</p>}
              {passMsg && <p className="font-body text-xs text-teal">{passMsg}</p>}
              <Button variant="teal" size="sm" onClick={handlePasswordChange}>Update Password</Button>
            </div>
          )}

          {tab === 'Notifications' && (
            <div className="space-y-3">
              {NOTIFICATION_SETTINGS.map((n) => (
                <div key={n} className="flex items-center justify-between rounded-[12px] bg-dark-surface px-5 py-3">
                  <span className="font-body text-sm text-dark-text">{n}</span>
                  <button onClick={() => setNotifications((p) => ({ ...p, [n]: !p[n] }))} className={cn('h-6 w-10 rounded-full transition-colors relative', notifications[n] ? 'bg-teal' : 'bg-dark-border')}>
                    <span className={cn('absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform', notifications[n] ? 'left-4' : 'left-0.5')} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdvisorLayout>
  );
}
