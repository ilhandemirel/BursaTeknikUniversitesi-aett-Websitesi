import React, { useState, useEffect } from 'react';
import { Users, Car, Newspaper, Trophy, Calendar, Handshake, MessageSquare } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface DashboardStats {
    members: number;
    vehicles: number;
    news: number;
    races: number;
    activities: number;
    sponsors: number;
    messages: number;
}

const Dashboard = () => {
    const [stats, setStats] = useState<DashboardStats>({
        members: 0,
        vehicles: 0,
        news: 0,
        races: 0,
        activities: 0,
        sponsors: 0,
        messages: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const [
                { count: membersCount },
                { count: vehiclesCount },
                { count: newsCount },
                { count: racesCount },
                { count: activitiesCount },
                { count: sponsorsCount },
                { count: messagesCount }
            ] = await Promise.all([
                supabase.from('team_members').select('*', { count: 'exact', head: true }),
                supabase.from('vehicles').select('*', { count: 'exact', head: true }),
                supabase.from('news').select('*', { count: 'exact', head: true }),
                supabase.from('races').select('*', { count: 'exact', head: true }),
                supabase.from('activities').select('*', { count: 'exact', head: true }),
                supabase.from('sponsors').select('*', { count: 'exact', head: true }),
                supabase.from('contact_messages').select('*', { count: 'exact', head: true })
            ]);

            setStats({
                members: membersCount || 0,
                vehicles: vehiclesCount || 0,
                news: newsCount || 0,
                races: racesCount || 0,
                activities: activitiesCount || 0,
                sponsors: sponsorsCount || 0,
                messages: messagesCount || 0
            });
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const statCards = [
        { label: 'Toplam Üye', value: stats.members, icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/10' },
        { label: 'Araç Sayısı', value: stats.vehicles, icon: Car, color: 'text-lime-400', bg: 'bg-lime-400/10' },
        { label: 'Haberler', value: stats.news, icon: Newspaper, color: 'text-purple-400', bg: 'bg-purple-400/10' },
        { label: 'Yarışlar', value: stats.races, icon: Trophy, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
        { label: 'Faaliyetler', value: stats.activities, icon: Calendar, color: 'text-pink-400', bg: 'bg-pink-400/10' },
        { label: 'Sponsorlar', value: stats.sponsors, icon: Handshake, color: 'text-teal-400', bg: 'bg-teal-400/10' },
        { label: 'Mesajlar', value: stats.messages, icon: MessageSquare, color: 'text-orange-400', bg: 'bg-orange-400/10' },
    ];

    if (loading) {
        return <div className="text-white">Yükleniyor...</div>;
    }

    return (
        <div>
            <h1 className="text-3xl font-bold text-white mb-8">Genel Bakış</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {statCards.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <div key={index} className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-400 text-sm">{stat.label}</p>
                                    <p className="text-3xl font-bold text-white mt-1">{stat.value}</p>
                                </div>
                                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${stat.bg} ${stat.color}`}>
                                    <Icon size={24} />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Dashboard;
