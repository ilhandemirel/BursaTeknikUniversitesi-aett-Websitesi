import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Car, Newspaper, LogOut, Settings, Trophy, Calendar, Handshake, Mail, Flag } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const AdminLayout = () => {
    const location = useLocation();
    const { signOut } = useAuth();
    const navigate = useNavigate();

    const handleSignOut = async () => {
        await signOut();
        navigate('/login');
    };

    const menuItems = [
        { path: '/admin', icon: LayoutDashboard, label: 'Panel' },
        { path: '/admin/team', icon: Users, label: 'Takım' },
        { path: '/admin/vehicles', icon: Car, label: 'Araçlar' },
        { path: '/admin/races', icon: Trophy, label: 'Yarışlar' },
        { path: '/admin/activities', icon: Calendar, label: 'Faaliyetler' },
        { path: '/admin/sponsors', icon: Handshake, label: 'Sponsorlar' },
        { path: '/admin/news', icon: Newspaper, label: 'Haberler' },
        { path: '/admin/messages', icon: Mail, label: 'Mesajlar' },
        { path: '/admin/holidays', icon: Flag, label: 'Bayramlar' },
        { path: '/admin/settings', icon: Settings, label: 'Ayarlar' },
    ];

    return (
        <div className="fixed inset-0 bg-black flex overflow-hidden">
            {/* Sidebar */}
            <aside className="w-64 bg-gray-900 border-r border-lime-500/20 overflow-y-auto">
                <div className="p-6">
                    <h1 className="text-2xl font-bold text-white">YILDIRIM</h1>
                    <p className="text-lime-400 text-sm">Yönetim Paneli</p>
                </div>

                <nav className="mt-6 px-4 space-y-2">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                    ? 'bg-lime-400/10 text-lime-400 border border-lime-400/20'
                                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                                    }`}
                            >
                                <Icon size={20} />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}

                    <button
                        onClick={handleSignOut}
                        className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors mt-8"
                    >
                        <LogOut size={20} />
                        <span>Çıkış Yap</span>
                    </button>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                <div className="p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
