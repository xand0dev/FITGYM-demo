import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../lib/utils';
import {
    LayoutDashboard,
    Calendar,
    Users,
    ClipboardList,
    Dumbbell,
    LogOut,
    Crown,
    ShieldAlert,
    ScanLine,
    QrCode,
} from "lucide-react";

export default function AdminSidebar({ activeTab, setActiveTab, sidebarOpen, setSidebarOpen, logout }) {
    const { user } = useAuth();
    const isSuperAdmin = user?.is_superuser;

    // Map string IDs to Lucide components matching Phase 1 MVP tabs
    const iconMap = {
        'dashboard': LayoutDashboard,
        'schedule': Calendar,
        'clients': Users,
        'applications': ClipboardList,
        'trainers': Dumbbell,
        'attendance': ScanLine,
        'qr-scanner': QrCode,
    };

    const MenuButton = ({ id, label, adminOnly = false }) => {
        if (adminOnly && !isSuperAdmin) return null;

        const isActive = activeTab === id;
        const IconComponent = iconMap[id];

        return (
            <button
                className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 transition-colors duration-200 uppercase tracking-wider font-extrabold text-xs group border-l-[3px]",
                    isActive
                        ? "border-primary bg-gradient-to-r from-primary/10 to-transparent text-primary"
                        : "border-transparent text-[#aaaaaa] hover:bg-white/5 hover:text-[#ffffff]"
                )}
                onClick={() => {
                    setActiveTab(id);
                    if (window.innerWidth < 1024) setSidebarOpen(false); // Mobile auto-close
                }}
            >
                {IconComponent && (
                    <IconComponent
                        className={cn(
                            "w-5 h-5 transition-colors duration-200",
                            isActive ? "text-primary" : "text-[#aaaaaa] group-hover:text-[#ffffff]"
                        )}
                    />
                )}
                <span>{label}</span>
            </button>
        );
    };

    return (
        <aside className={cn(
            "fixed lg:sticky top-0 left-0 h-screen w-[260px] bg-[#0a0a0a] border-r border-[#222] z-[1000] flex flex-col shrink-0 transition-transform duration-400 ease-[cubic-bezier(0.4,0,0.2,1)] shadow-[0_10px_30px_rgba(0,0,0,0.5)] overflow-hidden",
            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}>
            {/* Brand */}
            <div className="px-6 py-6 border-b border-[#222]">
                <h1 className="text-2xl font-black uppercase tracking-[0.2em] text-[#ffffff] text-center">
                    FIT<span className="text-primary">GYM</span>
                </h1>
            </div>

            {/* User Profile / Badge */}
            <div className="px-5 py-5 border-b border-[#222]">
                <div className="p-3 rounded-lg border border-white/5 bg-[#141414]/60 backdrop-blur-md shadow-inner text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                        {isSuperAdmin ? <Crown className="w-4 h-4 text-primary" /> : <ShieldAlert className="w-4 h-4 text-[#aaaaaa]" />}
                        <span className={cn(
                            "text-xs font-black uppercase tracking-wider",
                            isSuperAdmin ? 'text-primary' : 'text-[#aaaaaa]'
                        )}>
                            {isSuperAdmin ? 'АДМІНІСТРАТОР' : 'ТРЕНЕР'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Navigation Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
                <MenuButton id="dashboard" label="Огляд" adminOnly={true} />
                <MenuButton id="qr-scanner" label="QR Сканер" adminOnly={true} />
                <MenuButton id="schedule" label="Розклад" />
                <MenuButton id="clients" label="Клієнти" />
                <MenuButton id="attendance" label="Відвідування" adminOnly={true} />
                <MenuButton id="applications" label="Заявки" adminOnly={true} />
                <MenuButton id="trainers" label="Тренери" adminOnly={true} />
            </nav>

            {/* Logout Action */}
            <div className="p-4 border-t border-[#222] mt-auto">
                <button
                    onClick={logout}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors uppercase tracking-wider font-black text-xs"
                >
                    <LogOut className="w-5 h-5" />
                    <span>Вихід</span>
                </button>
            </div>

            {/* Local Scrollbar Styling */}
            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #333; border-radius: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
            `}</style>
        </aside>
    );
}