import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase, callEdgeFunction } from '../lib/supabase';
import { useAdvisorStore } from '../store/useAdvisorStore';
import { Video, Download } from 'lucide-react';
import { AdvisorLayout } from '../components/layout/AdvisorLayout';

export default function RecordingsPage() {
  const { advisor, session } = useAdvisorStore();

  const { data: recordings, isLoading } = useQuery({
    queryKey: ['recordings', advisor?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          id, scheduled_at, booking_type, duration_minutes,
          daily_recording_id, daily_recording_url, recording_available,
          profiles!user_id(full_name, avatar_url),
          engagements(plan_snapshot)
        `)
        .eq('advisor_id', advisor!.id)
        .eq('recording_available', true)
        .order('scheduled_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!advisor?.id,
  });

  const getRecordingUrl = useMutation({
    mutationFn: async (booking: any) => {
      const result = await callEdgeFunction('get-recording', {
        recording_id: booking.daily_recording_id,
        booking_id: booking.id,
      }, session);
      return result.download_url;
    },
    onSuccess: (url) => {
      window.open(url, '_blank');
    },
  });

  return (
    <AdvisorLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-body text-2xl font-semibold text-white">Session Recordings</h1>
          <p className="mt-1 font-body text-sm text-dark-muted">
            All sessions are automatically recorded and stored. Recordings are available for 60 days.
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-teal border-t-transparent" />
          </div>
        ) : !recordings?.length ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Video className="h-12 w-12 text-dark-muted-2 mb-4" />
            <h3 className="font-body text-lg font-medium text-white">No recordings yet</h3>
            <p className="mt-2 font-body text-sm text-dark-muted max-w-sm">
              Session recordings will appear here after your first call. Recording starts automatically when you join as host.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recordings.map((recording: any) => (
              <div key={recording.id} className="rounded-[12px] border border-dark-border bg-dark-surface p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal/10 font-body text-sm font-semibold text-teal">
                    {(recording.profiles?.full_name || 'U').charAt(0)}
                  </div>
                  <div>
                    <p className="font-body text-sm font-medium text-white">{recording.profiles?.full_name}</p>
                    <p className="font-body text-xs text-dark-muted">
                      {recording.booking_type === 'discovery' ? 'Discovery Call' : 'Session'}
                    </p>
                  </div>
                </div>
                <div className="space-y-1 font-body text-xs text-dark-muted">
                  <p>
                    {new Date(recording.scheduled_at).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric',
                    })}
                  </p>
                  <p>
                    {new Date(recording.scheduled_at).toLocaleTimeString('en-IN', {
                      hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata',
                    })}{' '}
                    IST - {recording.duration_minutes} min
                  </p>
                </div>
                <button
                  onClick={() => getRecordingUrl.mutate(recording)}
                  disabled={getRecordingUrl.isPending}
                  className="flex w-full items-center justify-center gap-2 rounded-[8px] border border-dark-border bg-dark-surface-2 py-2.5 font-body text-sm text-white hover:border-teal/50 transition-colors disabled:opacity-50"
                >
                  <Download className="h-4 w-4" />
                  {getRecordingUrl.isPending ? 'Getting link...' : 'Download Recording'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdvisorLayout>
  );
}
