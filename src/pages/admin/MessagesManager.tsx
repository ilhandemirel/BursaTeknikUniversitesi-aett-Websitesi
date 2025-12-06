import React, { useEffect, useState } from 'react';
import { Mail, Calendar, Trash2, CheckCircle, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

interface ContactMessage {
    id: string;
    name: string;
    email: string;
    message: string;
    is_read: boolean;
    created_at: string;
}

const MessagesManager = () => {
    const [messages, setMessages] = useState<ContactMessage[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMessages();
    }, []);

    const fetchMessages = async () => {
        const { data, error } = await supabase
            .from('contact_messages')
            .select('*')
            .order('created_at', { ascending: false });

        if (!error && data) {
            setMessages(data);
        }
        setLoading(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Bu mesajı silmek istediğinize emin misiniz?')) return;

        const { error } = await supabase
            .from('contact_messages')
            .delete()
            .eq('id', id);

        if (!error) {
            setMessages(messages.filter(m => m.id !== id));
        }
    };

    const handleMarkAsRead = async (id: string, currentStatus: boolean) => {
        const { error } = await supabase
            .from('contact_messages')
            .update({ is_read: !currentStatus })
            .eq('id', id);

        if (!error) {
            setMessages(messages.map(m =>
                m.id === id ? { ...m, is_read: !currentStatus } : m
            ));
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin text-lime-400" size={32} /></div>;
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-white">Gelen Mesajlar</h1>
                <div className="text-gray-400">
                    Topam: {messages.length} Mesaj
                </div>
            </div>

            <div className="grid gap-4">
                {messages.length === 0 ? (
                    <div className="text-center text-gray-500 py-12 bg-gray-900 rounded-xl border border-gray-800">
                        <Mail size={48} className="mx-auto mb-4 opacity-50" />
                        <p>Henüz hiç mesaj yok.</p>
                    </div>
                ) : (
                    messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`p-6 rounded-xl border transition-all ${msg.is_read
                                    ? 'bg-gray-900 border-gray-800'
                                    : 'bg-gray-800/80 border-lime-500/50 shadow-[0_0_15px_rgba(132,204,22,0.1)]'
                                }`}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-1">{msg.name}</h3>
                                    <a href={`mailto:${msg.email}`} className="text-lime-400 hover:text-lime-300 text-sm flex items-center gap-2">
                                        <Mail size={14} />
                                        {msg.email}
                                    </a>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-gray-500 text-xs flex items-center gap-1 bg-black/30 px-3 py-1 rounded-full">
                                        <Calendar size={12} />
                                        {format(new Date(msg.created_at), 'd MMMM yyyy HH:mm', { locale: tr })}
                                    </span>
                                    <button
                                        onClick={() => handleMarkAsRead(msg.id, msg.is_read)}
                                        className={`p-2 rounded-lg transition-colors ${msg.is_read
                                                ? 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                                : 'bg-lime-500 text-black hover:bg-lime-400'
                                            }`}
                                        title={msg.is_read ? "Okunmadı Olarak İşaretle" : "Okundu Olarak İşaretle"}
                                    >
                                        <CheckCircle size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(msg.id)}
                                        className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-colors"
                                        title="Sil"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                            <p className="text-gray-300 whitespace-pre-wrap">{msg.message}</p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default MessagesManager;
