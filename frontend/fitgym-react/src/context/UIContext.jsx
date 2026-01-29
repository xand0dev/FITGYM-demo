// src/context/UIContext.jsx
import { createContext, useContext, useState, useCallback } from 'react';

const UIContext = createContext();

export function UIProvider({ children }) {
    // --- AUTH MODALS ---
    const [isLoginOpen, setLoginOpen] = useState(false);
    const [isRegisterOpen, setRegisterOpen] = useState(false);

    // --- TOASTS (Повідомлення) ---
    const [toasts, setToasts] = useState([]);

    // --- CONFIRM MODAL (Підтвердження) ---
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        message: '',
        onConfirm: null
    });

    // === ACTIONS ===
    
    // Auth
    const openLogin = () => setLoginOpen(true);
    const closeLogin = () => setLoginOpen(false);
    const openRegister = () => setRegisterOpen(true);
    const closeRegister = () => setRegisterOpen(false);

    // Toast Logic
    const addToast = useCallback((message, type = 'success') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        // Автоматичне видалення через 3 сек
        setTimeout(() => removeToast(id), 3000);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    // Confirm Logic
    const confirmAction = (message, onConfirm) => {
        setConfirmModal({ isOpen: true, message, onConfirm });
    };

    const closeConfirm = () => {
        setConfirmModal({ isOpen: false, message: '', onConfirm: null });
    };

    const executeConfirm = () => {
        if (confirmModal.onConfirm) confirmModal.onConfirm();
        closeConfirm();
    };

    return (
        <UIContext.Provider value={{ 
            isLoginOpen, openLogin, closeLogin, 
            isRegisterOpen, openRegister, closeRegister,
            // Toasts
            toasts, addToast, removeToast,
            // Confirm
            confirmModal, confirmAction, closeConfirm, executeConfirm
        }}>
            {children}
        </UIContext.Provider>
    );
}

export const useUI = () => useContext(UIContext);