import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { BASE_URL } from '../utils/api';

export default function RegisterModal({ onClose }) {
    const { login } = useAuth();
    const [formData, setFormData] = useState({ 
        name: '', username: '', email: '', password: '', confirm: '' 
    });
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (formData.password !== formData.confirm) {
            setError('ПАРОЛІ НЕ СПІВПАДАЮТЬ');
            return;
        }
        try {
            const res = await fetch(`${BASE_URL}/api/register/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    username: formData.username,
                    email: formData.email,
                    password: formData.password
                })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.detail || 'ПОМИЛКА');
            login(data.token, formData.name);
            onClose();
        } catch (err) {
            setError(err.message.toUpperCase());
        }
    };

    // --- Оновлений стиль інпутів (Чорний текст при наборі) ---
    const inputStyle = {
        width: '100%', 
        padding: '12px', 
        background: '#f5f5f5',
        border: '1px solid #ddd', 
        marginBottom: '15px',
        borderRadius: '5px', 
        fontWeight: '600', 
        outline: 'none',
        color: '#000', // Текст тепер завжди чорний
        fontFamily: "'Inter', sans-serif",
        boxSizing: 'border-box'
    };

    return (
        <div className="modal-overlay" style={{
            display: 'flex',
            position: 'fixed',
            top: 0, left: 0,
            width: '100%', height: '100%',
            backgroundColor: 'rgba(0,0,0,0.85)',
            zIndex: 99999,
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(8px)',
            animation: 'fadeIn 0.3s ease-out'
        }}>
            {/* КОНТЕЙНЕР З АНІМОВАНОЮ ПІДСВІТКОЮ */}
            <div className="animated-glow-border" style={{
                position: 'relative',
                padding: '3px',
                background: 'linear-gradient(45deg, #ff0000, #000, #ff0000, #fff)',
                backgroundSize: '400% 400%',
                animation: 'gradientBG 5s ease infinite',
                borderRadius: '12px'
            }}>
                <div className="modal-content" style={{
                    background: '#fff',
                    padding: '40px',
                    width: '400px',
                    borderRadius: '10px',
                    position: 'relative'
                }}>
                    <button onClick={onClose} style={{
                        position: 'absolute', top: '15px', right: '15px', 
                        background: 'none', border: 'none', color: '#000', 
                        fontSize: '24px', cursor: 'pointer', fontWeight: '900'
                    }}>×</button>

                    <h2 style={{
                        fontFamily: "'Montserrat', sans-serif",
                        fontWeight: '900',
                        fontStyle: 'italic',
                        fontSize: '1.8rem',
                        color: '#000',
                        textAlign: 'center',
                        textTransform: 'uppercase',
                        marginBottom: '30px'
                    }}>
                        РЕЄСТРАЦІЯ <br/>
                        <span style={{ color: '#ff0000' }}>FITGYM</span>
                    </h2>

                    <form onSubmit={handleSubmit}>
                        <input style={inputStyle} placeholder="ПОВНЕ ІМ'Я" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                        <input style={inputStyle} placeholder="ЛОГІН" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} required />
                        <input style={inputStyle} type="email" placeholder="EMAIL" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
                        <input style={inputStyle} type="password" placeholder="ПАРОЛЬ" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required />
                        <input style={inputStyle} type="password" placeholder="ПІДТВЕРДЖЕННЯ" value={formData.confirm} onChange={e => setFormData({...formData, confirm: e.target.value})} required />
                        
                        <button type="submit" style={{
                            width: '100%', padding: '15px', background: '#000',
                            color: '#fff', border: 'none', borderRadius: '5px',
                            fontWeight: '900', textTransform: 'uppercase', cursor: 'pointer',
                            marginTop: '10px'
                        }} className="submit-btn-glow">
                            ЗАРЕЄСТРУВАТИСЯ
                        </button>
                    </form>
                </div>
            </div>

            <style>{`
                @keyframes gradientBG {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
                .submit-btn-glow:hover {
                    background: #ff0000 !important;
                    box-shadow: 0 0 15px #ff0000;
                    transition: 0.3s;
                }
                input::placeholder {
                    color: #aaa;
                    font-weight: 500;
                }
            `}</style>
        </div>
    );
}