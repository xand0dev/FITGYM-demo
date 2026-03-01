import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../../context/AuthContext';
import { BASE_URL } from '../../utils/api';

export default function LoginModal({ onClose }) {
    const { login } = useAuth();
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const res = await fetch(`${BASE_URL}/api/login/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            
            if (!res.ok) throw new Error(data.detail || 'Невірний логін або пароль');
            if (data.token) {
                login(data.token, formData.username);
                onClose();
            }
        } catch (err) {
            setError(err.message);
        }
    };

    return createPortal(
        <div className="fixed inset-0 w-screen h-screen z-[99999] flex items-center justify-center bg-black/70 backdrop-blur-[4px] p-4 animate-fadeIn">
            <div className="relative w-full max-w-[400px] bg-white p-[50px_40px] rounded-sm shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] border-t-[5px] border-primary animate-popIn">
                <button 
                    onClick={onClose} 
                    className="absolute top-[15px] right-[15px] bg-transparent border-none text-[#ccc] text-2xl cursor-pointer transition-colors duration-200 hover:text-black"
                >
                    &times;
                </button>
                
                <div className="text-center mb-[35px]">
                    <h2 className="font-['Montserrat',sans-serif] font-extrabold text-[1.8rem] uppercase tracking-[1px] text-black m-0">ВХІД</h2>
                    <div className="w-[40px] h-[2px] bg-primary mx-auto my-[10px]"></div>
                </div>
                
                {error && <p className="text-primary text-center text-[0.85rem] mb-[20px] font-semibold">{error}</p>}
                
                <form onSubmit={handleSubmit}>
                    <input 
                        placeholder="Логін" required 
                        value={formData.username}
                        onChange={e => setFormData({...formData, username: e.target.value})}
                        className="w-full p-[14px] mb-[15px] border border-[#eee] bg-[#fcfcfc] rounded-none outline-none box-border font-inherit transition-colors focus:border-primary"
                    />
                    <input 
                        type="password" placeholder="Пароль" required 
                        value={formData.password}
                        onChange={e => setFormData({...formData, password: e.target.value})}
                        className="w-full p-[14px] mb-[25px] border border-[#eee] bg-[#fcfcfc] rounded-none outline-none box-border font-inherit transition-colors focus:border-primary"
                    />
                    <button 
                        type="submit" 
                        className="w-full p-[15px] bg-black text-white border-none font-bold text-[0.9rem] cursor-pointer uppercase tracking-[1.5px] transition-all duration-300 hover:bg-primary hover:tracking-[2px]"
                    >
                        Авторизуватися
                    </button>
                </form>
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