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
            setError(err.message);
        }
    };

    return (
        <div className="modal-overlay" style={{
            display: 'flex',
            position: 'fixed',
            top: 0, left: 0, width: '100%', height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(4px)', // Легке розмиття фону
            zIndex: 99999,
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            <div className="modal-content-premium" style={{
                background: '#fff',
                padding: '50px 40px',
                width: '100%',
                maxWidth: '400px',
                borderRadius: '2px', // Ледь помітне заокруглення
                position: 'relative',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                borderTop: '5px solid #ff0000' // Тонка акцентна лінія зверху
            }}>
                <button 
                    onClick={onClose} 
                    style={{
                        position: 'absolute', top: '15px', right: '15px', 
                        background: 'none', border: 'none', color: '#ccc', 
                        fontSize: '24px', cursor: 'pointer', transition: '0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.color = '#000'}
                    onMouseLeave={(e) => e.target.style.color = '#ccc'}
                >×</button>
                
                <div style={{ textAlign: 'center', marginBottom: '35px' }}>
                    <h2 style={{
                        fontFamily: "'Montserrat', sans-serif",
                        fontWeight: '800',
                        fontSize: '1.8rem',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        color: '#000',
                        margin: 0
                    }}>ВХІД</h2>
                    <div style={{ width: '40px', height: '2px', background: '#ff0000', margin: '10px auto' }}></div>
                </div>
                
                {error && <p style={{color: '#ff0000', textAlign: 'center', fontSize: '0.85rem', marginBottom: '20px', fontWeight: '600'}}>{error}</p>}
                
                <form onSubmit={handleSubmit}>
                    <input 
                        placeholder="Логін" required 
                        value={formData.username}
                        onChange={e => setFormData({...formData, username: e.target.value})}
                        style={{
                            width: '100%', padding: '14px', marginBottom: '15px', 
                            border: '1px solid #eee', background: '#fcfcfc',
                            borderRadius: '0', outline: 'none', boxSizing: 'border-box'
                        }}
                    />
                    <input 
                        type="password" placeholder="Пароль" required 
                        value={formData.password}
                        onChange={e => setFormData({...formData, password: e.target.value})}
                        style={{
                            width: '100%', padding: '14px', marginBottom: '25px', 
                            border: '1px solid #eee', background: '#fcfcfc',
                            borderRadius: '0', outline: 'none', boxSizing: 'border-box'
                        }}
                    />
                    <button type="submit" style={{
                        width: '100%', padding: '15px', background: '#000', 
                        color: '#fff', border: 'none', fontWeight: '700', 
                        fontSize: '0.9rem', cursor: 'pointer', 
                        textTransform: 'uppercase', letterSpacing: '1.5px',
                        transition: '0.3s'
                    }}
                    className="submit-btn-hover"
                    >
                        Авторизуватися
                    </button>
                </form>
            </div>

            <style>{`
                .submit-btn-hover:hover {
                    background: #ff0000;
                    letter-spacing: 2px;
                }
                input:focus {
                    border-color: #ff0000 !important;
                }
            `}</style>
        </div>
    );
}