import { useUI } from '../../context/UIContext';
import { createPortal } from 'react-dom';

export default function GlobalConfirmModal() {
    const { confirmModal, closeConfirm, executeConfirm } = useUI();

    if (!confirmModal.isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 w-screen h-screen z-[100000] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
            <div className="bg-[#141414] border border-[#333] border-t-4 border-t-primary rounded-2xl p-[35px] max-w-[400px] w-full text-center shadow-[0_25px_60px_rgba(0,0,0,0.8)] animate-popIn">
                
                <h3 className="mt-0 text-white text-[1.4rem] font-extrabold uppercase tracking-wide mb-[15px]">
                    Підтвердження
                </h3>
                
                <p className="text-[1.05rem] mb-[30px] text-[#ccc] leading-relaxed">
                    {confirmModal.message}
                </p>
                
                <div className="flex justify-center gap-[15px]">
                    <button 
                        onClick={closeConfirm} 
                        className="flex-1 py-[12px] rounded-lg border border-[#444] text-[#aaa] font-bold uppercase tracking-wide transition-colors duration-300 hover:border-white hover:text-white hover:bg-white/5"
                    >
                        Скасувати
                    </button>
                    
                    <button 
                        onClick={executeConfirm} 
                        className="flex-1 py-[12px] rounded-lg bg-primary text-white font-bold uppercase tracking-wide shadow-[0_4px_15px_rgba(230,0,0,0.3)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(230,0,0,0.5)] hover:bg-[#cc0000]"
                    >
                        Так, я впевнений
                    </button>
                </div>
                
            </div>
            
            <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                .animate-fadeIn { animation: fadeIn 0.3s ease forwards; }
                
                @keyframes popIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
                .animate-popIn { animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
            `}</style>
        </div>,
        document.body
    );
}