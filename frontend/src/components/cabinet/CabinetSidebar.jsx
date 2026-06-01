import { useAuth } from '../../context/AuthContext';
import {
    LayoutDashboard,
    CalendarDays,
    Activity,
    Settings,
    LogOut,
    Crown,
} from "lucide-react";

const navItems = [
    { icon: LayoutDashboard, label: "Огляд", tab: "overview" },
    { icon: CalendarDays, label: "Мої Бронювання", tab: "bookings" },
    { icon: Activity, label: "Біометрія", tab: "biometrics" },
    { icon: Settings, label: "Налаштування", tab: "settings" },
];

export default function CabinetSidebar({ activeTab, onTabChange }) {
    const { user, logout } = useAuth();

    const firstName = user?.first_name || user?.username || 'Невідомий';
    const lastName = user?.last_name || 'Атлет';
    const email = user?.email || 'Немає email';
    const initials = (user?.first_name?.[0] || user?.username?.[0] || 'Ф').toUpperCase() + (user?.last_name?.[0] || 'Г').toUpperCase();

    // Визначаємо, що писати на бейджі статусу
    let roleBadge = 'БЕЗ АБОНЕМЕНТА';
    let isBadgeActive = false;
    let badgeEndDate = '';

    if (user?.is_superuser) {
        roleBadge = 'АДМІНІСТРАТОР';
        isBadgeActive = true;
    } else if (user?.is_staff) {
        roleBadge = 'ТРЕНЕР';
        isBadgeActive = true;
    } else if (user?.active_membership) {
        roleBadge = user.active_membership.name.toUpperCase();
        isBadgeActive = true;
        badgeEndDate = user.active_membership.end_date;
    }

    return (
        <aside className="w-full h-full flex flex-col bg-[var(--c-card)] border border-[var(--c-border)] rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.1)] overflow-hidden transition-colors duration-300">
            {/* Brand */}
            <div className="px-6 py-5 border-b border-[var(--c-border)]">
                <h1 className="text-2xl font-black uppercase tracking-[0.2em] text-[var(--c-text)]">
                    FIT<span className="text-primary">GYM</span>
                </h1>
            </div>

            {/* User Profile */}
            <div className="px-5 py-5 border-b border-[var(--c-border)]">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 shrink-0 rounded-full border-2 border-primary bg-[var(--c-input)] flex items-center justify-center text-primary font-black text-sm">
                        {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-black text-[var(--c-text)] truncate uppercase">
                            {firstName} {lastName}
                        </p>
                        <p className="text-xs text-[#888] font-bold truncate">
                            {email}
                        </p>
                    </div>
                </div>

                <div className="mt-4 p-3 rounded-lg border border-[var(--c-border)] bg-[var(--c-input)] shadow-inner">
                    <div className="flex items-center gap-2 mb-1">
                        <Crown className={`w-4 h-4 ${isBadgeActive ? 'text-primary' : 'text-[#888]'}`} />
                        <span className={`text-xs font-black uppercase tracking-wider ${isBadgeActive ? 'text-primary' : 'text-[#888]'}`}>
                            {roleBadge}
                        </span>
                    </div>
                    {badgeEndDate ? (
                        <p className="text-[10px] text-[#888] font-bold uppercase tracking-wider mt-1">
                            Активний — до {badgeEndDate}
                        </p>
                    ) : (
                        <p className="text-[10px] text-[#888] font-bold uppercase tracking-wider mt-1">
                            Статус запису
                        </p>
                    )}
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-1">
                {navItems.map((item) => {
                    const isActive = activeTab === item.tab;
                    return (
                        <button
                            key={item.tab}
                            onClick={() => onTabChange(item.tab)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 uppercase tracking-wider font-extrabold text-xs group ${isActive
                                    ? "bg-primary/10 text-primary border border-primary/20 shadow-[0_0_15px_rgba(255,0,0,0.1)]"
                                    : "text-[#888] hover:bg-[var(--c-input)] hover:text-[var(--c-text)] border border-transparent"
                                }`}
                        >
                            <item.icon className={`w-5 h-5 ${isActive ? 'text-primary' : 'text-[#888] group-hover:text-[var(--c-text)]'} transition-colors duration-200`} />
                            <span>{item.label}</span>
                        </button>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-[var(--c-border)] mt-auto">
                <button
                    onClick={logout}
                    className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors uppercase tracking-wider font-black text-xs"
                >
                    <LogOut className="w-5 h-5" />
                    <span>Вийти з системи</span>
                </button>
            </div>
        </aside>
    );
}