// src/components/ToastContainer.jsx
import { useUI } from '../../context/UIContext';
import { useEffect } from 'react';

export default function ToastContainer() {
    const { toasts, removeToast } = useUI();

    if (toasts.length === 0) return null;

    return (
        <div className="premium-toast-wrapper">
            {toasts.map(toast => (
                <div 
                    key={toast.id} 
                    className={`premium-toast toast-${toast.type}`}
                    onClick={() => removeToast(toast.id)}
                >
                    <div className="toast-glow"></div>
                    <div className="toast-icon-wrap">
                        {toast.type === 'success' ? (
                            <i className="fas fa-check"></i>
                        ) : (
                            <i className="fas fa-exclamation-triangle"></i>
                        )}
                    </div>
                    <div className="toast-content">
                        <h4>{toast.type === 'success' ? 'СИСТЕМА' : 'ПОМИЛКА'}</h4>
                        <p>{toast.message}</p>
                    </div>
                    {/* Анімована лінія часу */}
                    <div className="toast-progress"></div>
                </div>
            ))}
        </div>
    );
}