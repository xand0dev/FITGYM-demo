import { useEffect } from 'react';

export default function AdminModal({ isOpen, onClose, title, children }) {
    // Закриття по клавіші Esc
    useEffect(() => {
        const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    if (!isOpen) return null;

    return (
        <div className="admin-modal-overlay fade-in" onClick={onClose}>
            <div className="admin-modal-content" onClick={e => e.stopPropagation()}>
                <div className="admin-modal-header">
                    <h3>{title}</h3>
                    <button className="close-btn" onClick={onClose}><i className="fas fa-times"></i></button>
                </div>
                <div className="admin-modal-body">
                    {children}
                </div>
            </div>
        </div>
    );
}