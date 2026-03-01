import { useAuth } from '../../context/AuthContext';

export default function CabinetSidebar() {
    const { user, logout } = useAuth();
    
    const firstName = user?.first_name || user?.username || 'Невідомий';
    const lastName = user?.last_name || 'Атлет';
    const email = user?.email || 'Немає email';

    // 👇 Визначаємо, що писати на бейджі статусу
    let roleBadge = 'БЕЗ АБОНЕМЕНТА';
    let isBadgeActive = false;

    if (user?.is_superuser) {
        roleBadge = 'АДМІНІСТРАТОР';
        isBadgeActive = true;
    } else if (user?.is_staff) {
        roleBadge = 'ТРЕНЕР';
        isBadgeActive = true;
    } else if (user?.active_membership) {
        // Якщо клієнт, виводимо назву тарифу і дату його закінчення
        roleBadge = `${user.active_membership.name.toUpperCase()} (ДО ${user.active_membership.end_date})`;
        isBadgeActive = true;
    }

    return (
        <aside className="p-[30px] rounded-[24px] border border-[var(--c-border)] shadow-[0_10px_30px_rgba(0,0,0,0.1)] transition-colors duration-300 bg-[var(--c-card)] h-fit" data-aos="fade-right">
            <div className="text-center mb-[20px]">
                <div 
                    className="w-[120px] h-[120px] rounded-full border-[3px] border-primary mx-auto mb-[15px] bg-center bg-cover shadow-[0_0_20px_rgba(255,0,0,0.3)]"
                    style={{ backgroundImage: "url('https://img.freepik.com/free-photo/muscular-man-doing-exercises-with-dumbbells_155003-1849.jpg')" }}
                ></div>
                <h2 className="text-primary font-black uppercase text-[1.4rem] leading-[1.2]">
                    {firstName} <br/> {lastName}
                </h2>
                
                {/* 👇 Динамічний бейдж з правильними стилями */}
                <div className={`inline-block mt-2.5 px-3 py-1 border rounded-full text-[0.7rem] font-extrabold transition-colors duration-300 ${
                    isBadgeActive 
                        ? 'bg-primary/10 text-primary border-primary' 
                        : 'bg-[#88888820] text-[#888] border-[#888]'
                }`}>
                    {roleBadge}
                </div>
            </div>

            <div>
                <div className="mb-[15px]">
                    <label className="block text-[0.65rem] text-primary font-black mb-1.5 uppercase">USERNAME</label>
                    <input type="text" value={user?.username || ''} readOnly className="w-full p-2.5 rounded-[10px] border border-[var(--c-border)] bg-[var(--c-input)] text-[var(--c-text)] outline-none opacity-70 transition-colors duration-300" />
                </div>
                <div className="mb-[15px]">
                    <label className="block text-[0.65rem] text-primary font-black mb-1.5 uppercase">EMAIL</label>
                    <input type="email" value={email} readOnly className="w-full p-2.5 rounded-[10px] border border-[var(--c-border)] bg-[var(--c-input)] text-[var(--c-text)] outline-none opacity-70 transition-colors duration-300" />
                </div>
            </div>
            
            <button 
                onClick={logout} 
                className="w-full mt-[25px] p-3 rounded-xl border border-primary text-primary bg-transparent font-black transition-colors duration-300 hover:bg-primary hover:text-white"
            >
                ВИЙТИ З СИСТЕМИ
            </button>
        </aside>
    );
}