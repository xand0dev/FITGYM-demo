import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function SlideOverModal({ isOpen, onClose, title, children }) {
    // Escape key listener to close modal
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            window.addEventListener('keydown', handleEsc);
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
        }
        return () => {
            window.removeEventListener('keydown', handleEsc);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex justify-end">
            {/* Dark Blurred Overlay */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
                onClick={onClose}
            />

            {/* Sliding Panel */}
            <div className="relative w-full max-w-md h-full bg-[#080808] border-l border-[#222] shadow-[0_0_40px_rgba(0,0,0,0.5)] flex flex-col transform transition-transform duration-300 animate-slide-in-right">

                {/* Panel Header */}
                <div className="flex items-center justify-between p-6 border-b border-[#222] bg-[#0a0a0a]">
                    <h3 className="text-xl font-black uppercase tracking-wider text-[#ffffff]">
                        {title}
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg text-[#aaaaaa] hover:text-[#ffffff] hover:bg-white/5 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Panel Body */}
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    {children}
                </div>
            </div>

            {/* Custom CSS for smooth slide-in animation */}
            <style>{`
                @keyframes slideInRight {
                    from { transform: translateX(100%); }
                    to { transform: translateX(0); }
                }
                .animate-slide-in-right {
                    animation: slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
            `}</style>
        </div>,
        document.body
    );
}
