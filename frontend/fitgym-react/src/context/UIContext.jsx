import { createContext, useContext, useState } from 'react';

const UIContext = createContext();

export function UIProvider({ children }) {
    const [isLoginOpen, setLoginOpen] = useState(false);
    const [isRegisterOpen, setRegisterOpen] = useState(false);

    const openLogin = () => {
        console.log("🟢 UIContext: Open Login Clicked!"); // Перевірка в консолі
        setLoginOpen(true);
    };
    const closeLogin = () => setLoginOpen(false);

    const openRegister = () => {
        console.log("🟢 UIContext: Open Register Clicked!");
        setRegisterOpen(true);
    };
    const closeRegister = () => setRegisterOpen(false);

    return (
        <UIContext.Provider value={{ 
            isLoginOpen, openLogin, closeLogin, 
            isRegisterOpen, openRegister, closeRegister 
        }}>
            {children}
        </UIContext.Provider>
    );
}

export const useUI = () => useContext(UIContext);