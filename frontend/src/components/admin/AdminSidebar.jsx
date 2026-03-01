import { useAuth } from '../../context/AuthContext';

export default function AdminSidebar({ activeTab, setActiveTab, sidebarOpen, setSidebarOpen, logout }) {
    const { user } = useAuth();
    const isSuperAdmin = user?.is_superuser;

    // Хелпер для кнопок меню (робить код DRY - Don't Repeat Yourself)
    const MenuButton = ({ id, icon, label, adminOnly = false }) => {
        if (adminOnly && !isSuperAdmin) return null;
        
        const isActive = activeTab === id;
        
        return (
            <button 
                className={`w-full px-[30px] py-[20px] bg-transparent border-none text-left font-extrabold cursor-pointer uppercase border-l-[4px] transition-all duration-300 flex items-center gap-3 text-[0.85rem] tracking-wide outline-none
                    ${isActive 
                        ? 'text-white border-l-primary bg-gradient-to-r from-primary/10 to-transparent' 
                        : 'text-[#666] border-l-transparent hover:text-white hover:border-l-primary hover:bg-gradient-to-r hover:from-primary/10 hover:to-transparent'
                    }`
                }
                onClick={() => {
                    setActiveTab(id);
                    if (window.innerWidth < 1024) setSidebarOpen(false); // Автозакриття на мобільному
                }}
            >
                <i className={`fas ${icon} w-[20px] text-center ${isActive ? 'text-primary' : ''}`}></i> 
                {label}
            </button>
        );
    };

    return (
        <aside className={`
            fixed lg:sticky top-0 left-0 h-screen w-[260px] bg-[#0f0f0f] border-r border-[#222] z-[1000] flex flex-col shrink-0 transition-transform duration-400 ease-[cubic-bezier(0.4,0,0.2,1)]
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
            <div className="p-[30px] text-[2rem] font-black text-white text-center tracking-wide">
                FIT<span className="text-primary">GYM</span>
            </div>
            
            <div className="text-center text-[11px] font-black mb-[30px] mx-[20px] tracking-[2px] bg-white/5 p-1.5 rounded-md select-none">
                <span className={isSuperAdmin ? 'text-primary' : 'text-[#888]'}>
                    {isSuperAdmin ? 'АДМІНІСТРАТОР' : 'ТРЕНЕР'}
                </span>
            </div>

            <nav className="flex-1 overflow-y-auto custom-scrollbar">
                <MenuButton id="dashboard" icon="fa-chart-line" label="Огляд" adminOnly={true} />
                <MenuButton id="schedule" icon="fa-calendar-alt" label="Розклад" />
                <MenuButton id="clients" icon="fa-users" label="Клієнти" />
                {/* 👇 НОВА КНОПКА ДЛЯ ЗАЯВОК */}
                <MenuButton id="applications" icon="fa-envelope-open-text" label="Заявки" adminOnly={true} />
                <MenuButton id="trainers" icon="fa-dumbbell" label="Тренери" adminOnly={true} />
            </nav>

            <div className="p-[20px] border-t border-[#222] mt-auto">
                <button 
                    onClick={logout}
                    className="w-full bg-transparent border-none text-[#ff4d4d] font-bold cursor-pointer flex items-center justify-center gap-2.5 uppercase tracking-wide py-3 transition-all duration-300 hover:text-white hover:bg-[#ff4d4d] rounded-lg outline-none"
                >
                    <i className="fas fa-sign-out-alt"></i> Вихід
                </button>
            </div>
            
            {/* Стиль для красивого скролбару в меню */}
            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #333; border-radius: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
            `}</style>
        </aside>
    );
}