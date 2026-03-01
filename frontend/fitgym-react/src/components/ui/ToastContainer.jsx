import { useUI } from '../../context/UIContext';

export default function ToastContainer() {
    const { toasts, removeToast } = useUI();

    if (toasts.length === 0) return null;

    return (
        <div className="fixed bottom-5 right-5 lg:bottom-[30px] lg:right-[30px] z-[99999] flex flex-col gap-[15px] pointer-events-none w-full max-w-[90vw] sm:max-w-[400px]">
            {toasts.map(toast => {
                const isSuccess = toast.type === 'success';
                
                // Динамічні класи залежно від типу тоста
                const borderColor = isSuccess ? 'border-l-primary' : 'border-l-[#ff9900]';
                const iconColor = isSuccess ? 'text-primary' : 'text-[#ff9900]';
                const progressBg = isSuccess ? 'bg-primary' : 'bg-[#ff9900]';
                const glowBg = isSuccess 
                    ? 'bg-[radial-gradient(circle,rgba(255,0,0,0.15)_0%,transparent_70%)]' 
                    : 'bg-[radial-gradient(circle,rgba(255,153,0,0.1)_0%,transparent_70%)]';

                return (
                    <div 
                        key={toast.id} 
                        className={`relative pointer-events-auto bg-[#0d0d0d] border border-[#222] border-l-4 ${borderColor} p-[16px_24px_16px_16px] rounded-lg flex items-center gap-[15px] shadow-[0_15px_35px_rgba(0,0,0,0.8)] cursor-pointer overflow-hidden animate-slideInRight`}
                        onClick={() => removeToast(toast.id)}
                    >
                        {/* Внутрішнє світіння (Glow) */}
                        <div className={`absolute -top-1/2 -right-1/2 w-[100px] h-[100px] rounded-full blur-[15px] z-0 ${glowBg}`}></div>
                        
                        {/* Іконка */}
                        <div className={`relative z-10 w-[36px] h-[36px] rounded-lg flex items-center justify-center text-[1.1rem] shrink-0 bg-white/5 ${iconColor}`}>
                            {isSuccess ? (
                                <i className="fas fa-check"></i>
                            ) : (
                                <i className="fas fa-exclamation-triangle"></i>
                            )}
                        </div>
                        
                        {/* Контент */}
                        <div className="relative z-10 grow">
                            <h4 className="m-0 mb-1 text-[0.75rem] text-[#888] uppercase tracking-[1px] font-extrabold">
                                {isSuccess ? 'СИСТЕМА' : 'ПОМИЛКА'}
                            </h4>
                            <p className="m-0 text-[0.95rem] text-white font-medium leading-[1.3]">
                                {toast.message}
                            </p>
                        </div>
                        
                        {/* Анімована лінія часу */}
                        <div className={`absolute bottom-0 left-0 h-[3px] w-full animate-progressShrink ${progressBg}`}></div>
                    </div>
                );
            })}

            {/* Локальні анімації */}
            <style>{`
                @keyframes slideInRight {
                    from { transform: translateX(120%); }
                    to { transform: translateX(0); }
                }
                .animate-slideInRight { animation: slideInRight 0.4s cubic-bezier(0.25, 1, 0.5, 1) forwards; }
                
                @keyframes progressShrink {
                    to { width: 0%; }
                }
                /* 3s дорівнює часу життя тоста в UIContext */
                .animate-progressShrink { animation: progressShrink 3s linear forwards; }
            `}</style>
        </div>
    );
}