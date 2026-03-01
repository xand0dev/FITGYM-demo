import { useEffect } from 'react';
import { createPortal } from 'react-dom';

export default function AdminModal({ isOpen, onClose, title, children }) {
    // Закриття по клавіші Esc
    useEffect(() => {
        const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    if (!isOpen) return null;

    return createPortal(
        <div 
            className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn" 
            onClick={onClose}
        >
            <div 
                className="bg-[#141414] border border-[#333] border-t-4 border-t-primary rounded-2xl w-full max-w-[550px] max-h-[95vh] flex flex-col shadow-[0_25px_60px_rgba(0,0,0,0.8)] relative animate-popIn" 
                onClick={e => e.stopPropagation()}
            >
                {/* HEADER */}
                <div className="flex justify-between items-center p-[20px_30px] border-b border-[#222] shrink-0">
                    <h3 className="m-0 text-white text-[1.2rem] font-extrabold uppercase tracking-wide">
                        {title}
                    </h3>
                    <button 
                        className="bg-transparent border-none text-[#555] w-[32px] h-[32px] text-[1.2rem] flex items-center justify-center rounded-full cursor-pointer transition-colors duration-300 hover:text-white hover:bg-white/10" 
                        onClick={onClose}
                    >
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                {/* BODY */}
                <div className="p-[30px] overflow-y-auto custom-scrollbar">
                    {children}
                </div>
            </div>

            {/* Стилі анімацій та скролбару */}
            <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                .animate-fadeIn { animation: fadeIn 0.3s ease forwards; }
                
                @keyframes popIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
                .animate-popIn { animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }

                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #333; border-radius: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
            `}</style>
        </div>,
        document.body
    );
}