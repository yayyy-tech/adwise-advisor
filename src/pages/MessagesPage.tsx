import { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Search } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdvisorLayout } from '../components/layout/AdvisorLayout';
import { useAdvisorStore } from '../store/useAdvisorStore';
import { supabase } from '../lib/supabase';
import { cn } from '../lib/utils';

export default function MessagesPage() {
  const { advisor } = useAdvisorStore();
  const queryClient = useQueryClient();
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [search, setSearch] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: conversations } = useQuery({
    queryKey: ['advisor-conversations', advisor?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('conversations')
        .select('*, user:profiles!user_id(full_name, avatar_url), messages(id, content, created_at, sender_id, is_read, message_type, file_name)')
        .eq('advisor_id', advisor!.id)
        .order('last_message_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!advisor?.id,
  });

  const { data: messages } = useQuery({
    queryKey: ['advisor-messages', activeConvId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', activeConvId!)
        .order('created_at', { ascending: true });
      if (error) throw error;
      // Mark unread messages as read
      await supabase.from('messages').update({ is_read: true })
        .eq('conversation_id', activeConvId!).eq('is_read', false).neq('sender_id', advisor!.id);
      return data;
    },
    enabled: !!activeConvId,
  });

  // Real-time subscription
  useEffect(() => {
    if (!activeConvId) return;
    const channel = supabase
      .channel(`adv-messages:${activeConvId}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'messages',
        filter: `conversation_id=eq.${activeConvId}`,
      }, () => {
        queryClient.invalidateQueries({ queryKey: ['advisor-messages', activeConvId] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [activeConvId, queryClient]);

  useEffect(() => {
    if (!activeConvId && conversations?.length) setActiveConvId(conversations[0].id);
  }, [conversations, activeConvId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages?.length]);

  const sendMessage = useMutation({
    mutationFn: async ({ content, file }: { content?: string; file?: File }) => {
      let fileUrl = null, fileName = null;
      if (file) {
        const { data } = await supabase.storage.from('documents').upload(`messages/${activeConvId}/${Date.now()}_${file.name}`, file);
        fileUrl = data?.path;
        fileName = file.name;
      }
      const { error } = await supabase.from('messages').insert({
        conversation_id: activeConvId,
        sender_id: advisor!.id,
        content: content || null,
        message_type: file ? 'document' : 'text',
        file_url: fileUrl,
        file_name: fileName,
      });
      if (error) throw error;
      await supabase.from('conversations').update({ last_message_at: new Date().toISOString() }).eq('id', activeConvId!);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['advisor-messages', activeConvId] });
      queryClient.invalidateQueries({ queryKey: ['advisor-conversations'] });
    },
  });

  const handleSend = () => {
    if (!input.trim() || !activeConvId) return;
    sendMessage.mutate({ content: input.trim() });
    setInput('');
  };

  const getClientName = (conv: any) => conv.user?.full_name || 'Client';
  const getClientInitials = (conv: any) => {
    const name = getClientName(conv);
    return name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();
  };
  const getLastMessage = (conv: any) => {
    const msgs = conv.messages || [];
    if (!msgs.length) return '';
    const sorted = [...msgs].sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return sorted[0]?.content || '';
  };
  const getUnread = (conv: any) => (conv.messages || []).filter((m: any) => !m.is_read && m.sender_id !== advisor?.id).length;

  const filtered = (conversations ?? []).filter((c: any) => getClientName(c).toLowerCase().includes(search.toLowerCase()));
  const activeConv = conversations?.find((c: any) => c.id === activeConvId);

  return (
    <AdvisorLayout>
      <div className="max-w-[960px]">
        <h1 className="font-display text-[28px] text-dark-text mb-6">Messages</h1>
        <div className="flex rounded-[20px] bg-dark-surface border border-dark-border overflow-hidden" style={{ height: 'calc(100vh - 200px)', minHeight: '500px' }}>
          <div className="w-[280px] border-r border-dark-border flex-shrink-0 flex flex-col">
            <div className="p-3 border-b border-dark-border">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-dark-muted" />
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..." className="w-full rounded-[8px] bg-dark-surface-2 pl-9 pr-3 py-2 font-body text-sm text-dark-text placeholder:text-dark-muted-2 focus:outline-none border border-dark-border" />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {filtered.map((c: any) => {
                const unread = getUnread(c);
                return (
                  <button key={c.id} onClick={() => setActiveConvId(c.id)} className={cn('flex w-full items-start gap-3 px-4 py-3 text-left border-l-[3px]', activeConvId === c.id ? 'bg-dark-surface-2 border-l-teal' : 'border-l-transparent hover:bg-dark-surface-2/50')}>
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal/20 font-body text-sm font-semibold text-teal flex-shrink-0">{getClientInitials(c)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <p className="font-body text-sm font-medium text-white truncate">{getClientName(c)}</p>
                        <span className="font-body text-[10px] text-dark-muted ml-auto flex-shrink-0">
                          {c.last_message_at ? new Date(c.last_message_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : ''}
                        </span>
                      </div>
                      <p className="font-body text-xs text-dark-muted truncate">{getLastMessage(c)}</p>
                    </div>
                    {unread > 0 && <span className="flex h-5 w-5 items-center justify-center rounded-full bg-teal font-body text-[10px] font-semibold text-dark-base">{unread}</span>}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex-1 flex flex-col">
            {activeConv ? (
              <>
                <div className="flex items-center gap-3 px-5 py-3 border-b border-dark-border">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal/20 font-body text-sm font-semibold text-teal">{getClientInitials(activeConv)}</div>
                  <p className="font-body text-sm font-medium text-white">{getClientName(activeConv)}</p>
                </div>
                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                  {(messages ?? []).map((msg: any) => {
                    const isAdvisor = msg.sender_id === advisor?.id;
                    if (msg.message_type === 'system') return <div key={msg.id} className="flex justify-center"><span className="rounded-full bg-dark-surface-2 px-3 py-1 font-body text-[11px] text-dark-muted">{msg.content}</span></div>;
                    if (msg.message_type === 'document') {
                      return (
                        <div key={msg.id} className={cn('flex', isAdvisor ? 'justify-end' : 'justify-start')}>
                          <div className="flex items-center gap-3 rounded-[12px] bg-dark-surface-2 border border-dark-border px-4 py-3 max-w-[320px]">
                            <Paperclip className="h-4 w-4 text-dark-muted" />
                            <p className="font-body text-sm text-dark-text truncate flex-1">{msg.file_name}</p>
                          </div>
                        </div>
                      );
                    }
                    return (
                      <div key={msg.id} className={cn('flex', isAdvisor ? 'justify-end' : 'justify-start')}>
                        <div className={cn('rounded-[12px] px-4 py-2.5 max-w-[320px]', isAdvisor ? 'bg-teal/10 border border-teal/20' : 'bg-dark-surface-2')}>
                          <p className="font-body text-sm text-dark-text leading-relaxed">{msg.content}</p>
                          <p className="mt-1 font-body text-[10px] text-dark-muted text-right">{new Date(msg.created_at).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })}</p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={bottomRef} />
                </div>
                <div className="flex items-center gap-2 px-4 py-3 border-t border-dark-border">
                  <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) { sendMessage.mutate({ file }); e.target.value = ''; }
                  }} />
                  <button onClick={() => fileInputRef.current?.click()} className="text-dark-muted hover:text-teal"><Paperclip className="h-5 w-5" /></button>
                  <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} placeholder="Type a message..." className="flex-1 bg-transparent font-body text-sm text-dark-text placeholder:text-dark-muted-2 focus:outline-none" />
                  <button onClick={handleSend} disabled={!input.trim()} className={cn('flex h-9 w-9 items-center justify-center rounded-full', input.trim() ? 'bg-teal text-dark-base' : 'bg-dark-surface-2 text-dark-muted')}><Send className="h-4 w-4" /></button>
                </div>
              </>
            ) : (
              <div className="flex flex-1 items-center justify-center">
                <p className="font-body text-sm text-dark-muted">Select a conversation</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdvisorLayout>
  );
}
