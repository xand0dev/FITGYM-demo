import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { BASE_URL } from '../utils/api';

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
            setError(err.message.toUpperCase());
        }
    };

    const inputStyle = {
        width: '100%',
        padding: '14px',
        background: '#f9f9f9',
        color: '#000', // Букви чорні при наборі
        border: '1px solid #ddd',
        borderRadius: '0px',
        boxSizing: 'border-box',
        marginBottom: '20px',
        fontFamily: "'Inter', sans-serif",
        fontWeight: '600',
        outline: 'none',
        transition: '0.3s'
    };

    return (
        <div className="modal-overlay" style={{
            display: 'flex',
            position: 'fixed',
            top: 0, left: 0, width: '100%', height: '100%',
            backgroundColor: 'rgba(0,0,0,0.85)',
            zIndex: 99999,
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(8px)',
            animation: 'fadeIn 0.3s ease-out'
        }}>
            {/* АНІМОВАНА ПІДСВІТКА НАВКОЛО ВІКНА */}
            <div style={{
                position: 'relative',
                padding: '3px',
                background: 'linear-gradient(45deg, #ff0000, #000, #ff0000, #fff)',
                backgroundSize: '400% 400%',
                animation: 'gradientBG 5s ease infinite',
                borderRadius: '2px'
            }}>
                <div className="modal-content" style={{
                    background: '#fff',
                    padding: '50px 40px',
                    width: '380px',
                    position: 'relative',
                    border: '1px solid #000',
                    boxShadow: '15px 15px 0px #ff0000' // Червона тінь
                }}>
                    <button 
                        onClick={onClose} 
                        style={{
                            position: 'absolute', top: '15px', right: '15px', 
                            background: 'none', border: 'none', color: '#000', 
                            fontSize: '28px', cursor: 'pointer', fontWeight: '900'
                        }}
                    >×</button>
                    
                    <h2 style={{
                        fontFamily: "'Montserrat', sans-serif",
                        fontWeight: '900',
                        fontStyle: 'italic',
                        fontSize: '2.2rem',
                        color: '#000',
                        textAlign: 'center',
                        textTransform: 'uppercase',
                        letterSpacing: '-1px',
                        marginBottom: '35px',
                        lineHeight: '0.9'
                    }}>
                        ВХІД <br/>
                        <span style={{ color: '#ff0000' }}>FITGYM</span>
                    </h2>
                    
                    {error && (
                        <p style={{
                            color: '#fff', 
                            background: '#ff0000', 
                            padding: '10px', 
                            textAlign: 'center', 
                            fontSize: '0.8rem', 
                            fontWeight: '800', 
                            marginBottom: '20px'
                        }}>
                            {error}
                        </p>
                    )}
                    
                    <form onSubmit={handleSubmit}>
                        <input 
                            placeholder="ЛОГІН" 
                            required 
                            value={formData.username}
                            onChange={e => setFormData({...formData, username: e.target.value})}
                            onFocus={(e) => e.target.style.borderColor = '#ff0000'}
                            onBlur={(e) => e.target.style.borderColor = '#ddd'}
                            style={inputStyle}
                        />
                        <input 
                            type="password" 
                            placeholder="ПАРОЛЬ" 
                            required 
                            value={formData.password}
                            onChange={e => setFormData({...formData, password: e.target.value})}
                            onFocus={(e) => e.target.style.borderColor = '#ff0000'}
                            onBlur={(e) => e.target.style.borderColor = '#ddd'}
                            style={inputStyle}
                        />
                        <button 
                            type="submit" 
                            className="login-btn-action"
                            style={{
                                width: '100%',
                                padding: '16px',
                                background: '#000',
                                color: '#fff',
                                border: 'none',
                                fontWeight: '900',
                                fontSize: '1rem',
                                cursor: 'pointer',
                                textTransform: 'uppercase',
                                letterSpacing: '1px',
                                transition: '0.3s'
                            }}
                        >
                            УВІЙТИ В КАБІНЕТ
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
                    from { opacity: 0; transform: translateY(-20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .login-btn-action:hover {
                    background: #ff0000 !important;
                    transform: translateY(-3px);
                }
                input::placeholder {
                    color: #bbb;
                    letter-spacing: 1px;
                }
            `}</style>
        </div>
    );
}