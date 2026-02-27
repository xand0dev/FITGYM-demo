// src/components/GlobalConfirmModal.jsx
import { useUI } from '../../context/UIContext';

export default function GlobalConfirmModal() {
    const { confirmModal, closeConfirm, executeConfirm } = useUI();

    if (!confirmModal.isOpen) return null;

    return (
        <div className="modal-overlay" style={{ display: 'flex', zIndex: 10001 }}>
            <div className="modal-content" style={{ maxWidth: '400px', textAlign: 'center' }}>
                <h3 style={{ marginTop: 0, color: 'var(--text)' }}>Підтвердження</h3>
                <p style={{ fontSize: '1.1rem', marginBottom: '25px', color: '#ccc' }}>
                    {confirmModal.message}
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '15px' }}>
                    <button onClick={closeConfirm} className="btn btn-ghost">
                        Скасувати
                    </button>
                    <button onClick={executeConfirm} className="btn btn-primary">
                        Так, я впевнений
                    </button>
                </div>
            </div>
        </div>
    );
}