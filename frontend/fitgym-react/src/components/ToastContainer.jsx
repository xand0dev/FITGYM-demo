// src/components/ToastContainer.jsx
import { useUI } from '../context/UIContext';

export default function ToastContainer() {
    const { toasts, removeToast } = useUI();

    if (toasts.length === 0) return null;

    return (
        <div id="toast-container">
            {toasts.map(toast => (
                <div 
                    key={toast.id} 
                    className={`toast ${toast.type}`}
                    onClick={() => removeToast(toast.id)}
                    style={{ cursor: 'pointer' }}
                >
                    {toast.type === 'success' && <i className="fas fa-check-circle" style={{marginRight: 8}}></i>}
                    {toast.type === 'error' && <i className="fas fa-exclamation-circle" style={{marginRight: 8}}></i>}
                    {toast.message}
                </div>
            ))}
        </div>
    );
}