export default function AdminTopbar({ user, sidebarOpen, setSidebarOpen }) {
    return (
        <header className="flex justify-between items-center mb-[30px] lg:mb-[40px]">
            {/* Бургер для мобільного меню */}
            <button
                className="lg:hidden bg-transparent border-none text-white text-[1.8rem] cursor-pointer outline-none hover:text-primary transition-colors"
                onClick={() => setSidebarOpen(!sidebarOpen)}
            >
                <i className="fas fa-bars"></i>
            </button>

            <div className="hidden sm:flex flex-col">
                <h2 className="text-white font-black text-[1.2rem] lg:text-[1.5rem] uppercase tracking-wide m-0 leading-tight">
                    Панель керування
                </h2>
                {user?.gym_name && (
                    <span className="text-primary text-[0.75rem] font-black uppercase tracking-widest">
                        {user.gym_name}
                    </span>
                )}
            </div>

            <div className="flex items-center gap-[15px] text-white font-bold ml-auto sm:ml-0">
                <span className="text-[0.9rem] lg:text-[1rem]">{user?.username || 'Адмін'}</span>
                <div className="w-[40px] h-[40px] bg-primary rounded-[10px] flex items-center justify-center font-black text-[1.1rem] shadow-[0_0_15px_rgba(255,0,0,0.3)]">
                    {user?.username ? user.username.charAt(0).toUpperCase() : 'A'}
                </div>
            </div>
        </header>
    );
}